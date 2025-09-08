import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface TrackingEvent {
  type: 'page_view' | 'click_captured' | 'conversion' | 'form_submit';
  timestamp: number;
  click_id?: string;
  page_url?: string;
  conversion_value?: number;
  metadata?: any;
}

interface VerificationResponse {
  success: boolean;
  partner_id: string;
  is_active: boolean;
  tracking_status: 'active' | 'inactive' | 'no_data';
  recent_events: TrackingEvent[];
  last_event_time?: string;
  total_events_today: number;
  total_events_week: number;
  message: string;
}

/**
 * Verification endpoint for partners to check if their tracking is working
 * This provides real-time visibility into tracking data
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for partner domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get partner ID from query or body
    const partnerId = req.query.partner_id as string || req.body?.partner_id;
    
    if (!partnerId) {
      return res.status(400).json({
        error: 'Missing partner_id parameter',
        usage: 'Add ?partner_id=YOUR_ID to the URL'
      });
    }

    // Check if partner configuration exists
    const configKey = `partner_config:${partnerId}`;
    const partnerConfig = await kv.get<any>(configKey);
    
    if (!partnerConfig) {
      return res.status(404).json({
        success: false,
        partner_id: partnerId,
        is_active: false,
        tracking_status: 'inactive',
        recent_events: [],
        total_events_today: 0,
        total_events_week: 0,
        message: `Partner ID '${partnerId}' not found. Please check your partner ID or contact support.`
      });
    }

    const isActive = partnerConfig.metadata?.status === 'active';

    // Get recent tracking events for this partner
    const recentEvents: TrackingEvent[] = [];
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Get all tracking event keys for this partner
    const eventPattern = `tracking_event:${partnerId}:*`;
    const eventKeys = await kv.keys(eventPattern);
    
    let totalEventsToday = 0;
    let totalEventsWeek = 0;
    let lastEventTime: number | null = null;

    // Process events (limit to last 100 for performance)
    const keysToProcess = eventKeys.slice(-100);
    
    for (const key of keysToProcess) {
      try {
        const eventData = await kv.get<any>(key);
        
        if (eventData) {
          const eventTimestamp = eventData.data?.timestamp || eventData.client_info?.timestamp || 0;
          
          // Count events
          if (eventTimestamp > oneWeekAgo) {
            totalEventsWeek++;
            
            if (eventTimestamp > oneDayAgo) {
              totalEventsToday++;
            }
          }

          // Track last event time
          if (!lastEventTime || eventTimestamp > lastEventTime) {
            lastEventTime = eventTimestamp;
          }

          // Add to recent events (last 10)
          if (recentEvents.length < 10) {
            recentEvents.push({
              type: eventData.type === 'track' ? 'page_view' : 
                    eventData.type === 'conversion' ? 'conversion' : 
                    'click_captured',
              timestamp: eventTimestamp,
              click_id: eventData.data?.click_id,
              page_url: eventData.data?.page_url,
              conversion_value: eventData.data?.conversion_value,
              metadata: eventData.data?.metadata
            });
          }
        }
      } catch (error) {
        console.error(`Error processing event ${key}:`, error);
      }
    }

    // Also check for clicks stored directly
    const clickPattern = `click:dep_*`;
    const clickKeys = await kv.keys(clickPattern);
    
    for (const key of clickKeys.slice(-20)) {
      try {
        const clickData = await kv.get<any>(key);
        
        if (clickData && clickData.partner_id === partnerId) {
          const clickTimestamp = clickData.timestamp || 0;
          
          if (clickTimestamp > oneWeekAgo) {
            totalEventsWeek++;
            
            if (clickTimestamp > oneDayAgo) {
              totalEventsToday++;
            }
          }

          if (!lastEventTime || clickTimestamp > lastEventTime) {
            lastEventTime = clickTimestamp;
          }

          // Add click capture to recent events
          if (recentEvents.length < 10) {
            recentEvents.push({
              type: 'click_captured',
              timestamp: clickTimestamp,
              click_id: clickData.click_id,
              metadata: { source: clickData.source || 'direct' }
            });
          }
        }
      } catch (error) {
        console.error(`Error processing click ${key}:`, error);
      }
    }

    // Sort recent events by timestamp (newest first)
    recentEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Determine tracking status
    let trackingStatus: 'active' | 'inactive' | 'no_data';
    let message: string;

    if (totalEventsToday > 0) {
      trackingStatus = 'active';
      message = `✅ Tracking is working! ${totalEventsToday} events tracked today.`;
    } else if (totalEventsWeek > 0) {
      trackingStatus = 'active';
      message = `⚠️ Tracking was active this week (${totalEventsWeek} events) but no events today.`;
    } else {
      trackingStatus = 'no_data';
      message = '❌ No tracking events found. Please ensure the tracking script is installed on your website.';
    }

    if (!isActive) {
      message = '⚠️ Partner account is not active. Contact support to activate.';
      trackingStatus = 'inactive';
    }

    const response: VerificationResponse = {
      success: true,
      partner_id: partnerId,
      is_active: isActive,
      tracking_status: trackingStatus,
      recent_events: recentEvents.slice(0, 10), // Return max 10 events
      last_event_time: lastEventTime ? new Date(lastEventTime).toISOString() : undefined,
      total_events_today: totalEventsToday,
      total_events_week: totalEventsWeek,
      message
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Verification error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to verify tracking status',
      message: 'An error occurred while checking tracking status. Please try again.'
    });
  }
}