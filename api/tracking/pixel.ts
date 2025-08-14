import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Pixel tracking endpoint - bypasses CORS completely
 * Returns a 1x1 transparent GIF regardless of success/failure
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1x1 transparent GIF (43 bytes)
  const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  
  // Set image headers - no CORS needed for images!
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', PIXEL.length.toString());
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Parse data from query string
    const { data, partner_id, event_type, click_id } = req.query;
    
    let trackingData: any = {};
    
    // Handle both encoded JSON and individual parameters
    if (data && typeof data === 'string') {
      try {
        trackingData = JSON.parse(decodeURIComponent(data));
      } catch (e) {
        // If JSON parsing fails, use individual params
        trackingData = {
          partner_id: partner_id as string,
          event_type: event_type as string,
          click_id: click_id as string,
          timestamp: Date.now()
        };
      }
    } else {
      // Use individual query params
      trackingData = {
        partner_id: partner_id as string,
        event_type: event_type as string || 'page_view',
        click_id: click_id as string,
        page_url: req.query.url as string,
        referrer: req.query.ref as string,
        timestamp: Date.now()
      };
    }
    
    // Store in KV if we have the required data
    if (trackingData.partner_id) {
      const eventKey = `event:${trackingData.partner_id}:${Date.now()}:${Math.random().toString(36).substr(2)}`;
      
      const event = {
        type: trackingData.event_type || 'track',
        partner_id: trackingData.partner_id,
        partner_domain: new URL(req.headers.referer || 'https://unknown').hostname,
        data: {
          click_id: trackingData.click_id,
          session_id: trackingData.session_id,
          page_url: trackingData.page_url || req.headers.referer,
          timestamp: trackingData.timestamp || Date.now(),
          event_type: trackingData.event_type
        },
        client_info: {
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown',
          timestamp: Date.now()
        }
      };
      
      // Store event
      await kv.set(eventKey, event, { ex: 7 * 24 * 60 * 60 }); // 7 days TTL
      
      // Update metrics
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `metrics:daily:${today}:${trackingData.partner_id}`;
      
      if (trackingData.event_type === 'conversion') {
        await kv.hincrby(metricsKey, 'conversions', 1);
        
        // Store conversion with click attribution
        if (trackingData.click_id) {
          const conversionKey = `conversion:${trackingData.partner_id}:${trackingData.click_id}`;
          await kv.set(conversionKey, {
            ...trackingData,
            conversion_time: Date.now()
          }, { ex: 30 * 24 * 60 * 60 });
        }
      } else {
        await kv.hincrby(metricsKey, 'page_views', 1);
      }
      
      // Store click data if it's a landing
      if (trackingData.click_id && trackingData.event_type === 'landing') {
        const clickKey = `click:${trackingData.click_id}`;
        await kv.set(clickKey, {
          click_id: trackingData.click_id,
          partner_id: trackingData.partner_id,
          timestamp: Date.now(),
          source: 'pixel_tracking'
        }, { ex: 90 * 24 * 60 * 60 }); // 90 day attribution window
      }
    }
    
  } catch (error) {
    // Silently fail - still return pixel
    console.error('Pixel tracking error:', error);
  }
  
  // Always return the pixel, regardless of success/failure
  res.status(200).send(PIXEL);
}