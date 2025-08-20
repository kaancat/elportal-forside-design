/**
 * Tracking Verification API Route - Next.js App Router
 * Allows partners to verify their tracking implementation is working
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { corsPublic } from '@/server/api-helpers'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

interface TrackingEvent {
  type: 'page_view' | 'click_captured' | 'conversion' | 'form_submit'
  timestamp: number
  click_id?: string
  page_url?: string
  conversion_value?: number
  metadata?: any
}

interface VerificationResponse {
  success: boolean
  partner_id: string
  is_active: boolean
  tracking_status: 'active' | 'inactive' | 'no_data'
  recent_events: TrackingEvent[]
  last_event_time?: string
  total_events_today: number
  total_events_week: number
  message: string
}

/**
 * Get partner configuration
 */
async function getPartnerConfig(partnerId: string): Promise<any> {
  try {
    const key = `partner_config:${partnerId}`
    return await kv.get(key)
  } catch (error) {
    console.error('[TrackingVerify] Error fetching partner config:', error)
    return null
  }
}

/**
 * Get recent tracking events for partner
 */
async function getRecentEvents(partnerId: string, limit: number = 10): Promise<TrackingEvent[]> {
  try {
    // Get tracking event keys for this partner
    const eventKeys = await kv.keys(`tracking_event:${partnerId}:*`)
    
    if (!eventKeys || eventKeys.length === 0) {
      return []
    }
    
    // Sort by timestamp (embedded in key) and get recent ones
    const sortedKeys = eventKeys
      .sort((a, b) => b.localeCompare(a))
      .slice(0, limit)
    
    const events: TrackingEvent[] = []
    
    for (const key of sortedKeys) {
      try {
        const eventData = await kv.get<any>(key)
        if (eventData) {
          events.push({
            type: eventData.type || 'page_view',
            timestamp: eventData.client_info?.timestamp || eventData.data?.timestamp || Date.now(),
            click_id: eventData.data?.click_id,
            page_url: eventData.data?.page_url,
            conversion_value: eventData.data?.conversion_value,
            metadata: eventData.data?.metadata
          })
        }
      } catch (error) {
        console.error(`[TrackingVerify] Error fetching event ${key}:`, error)
      }
    }
    
    return events
  } catch (error) {
    console.error('[TrackingVerify] Error fetching recent events:', error)
    return []
  }
}

/**
 * Get event statistics for partner
 */
async function getEventStats(partnerId: string): Promise<{
  today: number
  week: number
}> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Get daily metrics
    const todayMetrics = await kv.hgetall(`metrics:daily:${today}:${partnerId}`)
    const todayCount = Number(todayMetrics?.page_views || 0) + Number(todayMetrics?.conversions || 0)
    
    // Get week metrics (simplified - just check keys)
    let weekCount = todayCount
    for (let i = 1; i < 7; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dayMetrics = await kv.hgetall(`metrics:daily:${date}:${partnerId}`)
      if (dayMetrics) {
        weekCount += Number(dayMetrics.page_views || 0) + Number(dayMetrics.conversions || 0)
      }
    }
    
    return {
      today: todayCount,
      week: weekCount
    }
  } catch (error) {
    console.error('[TrackingVerify] Error fetching event stats:', error)
    return { today: 0, week: 0 }
  }
}

/**
 * GET /api/tracking/verify - Verify tracking implementation
 * POST /api/tracking/verify - Verify with partner_id in body
 */
async function handleVerification(request: NextRequest): Promise<NextResponse> {
  try {
    // Get partner ID from query or body
    let partnerId: string | null = null
    
    if (request.method === 'GET') {
      partnerId = request.nextUrl.searchParams.get('partner_id')
    } else if (request.method === 'POST') {
      const body = await request.json()
      partnerId = body.partner_id
    }
    
    if (!partnerId) {
      return NextResponse.json(
        {
          error: 'Missing partner_id',
          message: 'Please provide partner_id as query parameter or in request body'
        },
        { 
          status: 400,
          headers: corsPublic()
        }
      )
    }
    
    // Validate partner ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(partnerId) || partnerId.length < 3 || partnerId.length > 50) {
      return NextResponse.json(
        {
          error: 'Invalid partner_id format',
          message: 'Partner ID must be 3-50 characters, alphanumeric with hyphens and underscores'
        },
        { 
          status: 400,
          headers: corsPublic()
        }
      )
    }
    
    // Get partner configuration
    const config = await getPartnerConfig(partnerId)
    
    if (!config) {
      return NextResponse.json(
        {
          error: 'Partner not found',
          message: `No configuration found for partner_id: ${partnerId}`,
          help: 'Please ensure your partner account is properly configured'
        },
        { 
          status: 404,
          headers: corsPublic()
        }
      )
    }
    
    // Check if partner is active
    const isActive = config.metadata?.status === 'active'
    
    // Get recent events
    const recentEvents = await getRecentEvents(partnerId, 10)
    
    // Get event statistics
    const stats = await getEventStats(partnerId)
    
    // Determine tracking status
    let trackingStatus: 'active' | 'inactive' | 'no_data' = 'no_data'
    let lastEventTime: string | undefined
    
    if (recentEvents.length > 0) {
      const mostRecent = recentEvents[0]
      lastEventTime = new Date(mostRecent.timestamp).toISOString()
      
      // Consider active if events in last hour
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      if (mostRecent.timestamp > oneHourAgo) {
        trackingStatus = 'active'
      } else {
        trackingStatus = 'inactive'
      }
    }
    
    // Build response message
    let message = ''
    if (!isActive) {
      message = 'Partner account is not active. Please contact support to activate your account.'
    } else if (trackingStatus === 'no_data') {
      message = 'No tracking data found. Please ensure the tracking script is installed on your website.'
    } else if (trackingStatus === 'inactive') {
      message = `Tracking was last active ${lastEventTime}. No recent events detected.`
    } else {
      message = 'Tracking is active and working correctly!'
    }
    
    // Build verification response
    const response: VerificationResponse = {
      success: true,
      partner_id: partnerId,
      is_active: isActive,
      tracking_status: trackingStatus,
      recent_events: recentEvents,
      last_event_time: lastEventTime,
      total_events_today: stats.today,
      total_events_week: stats.week,
      message
    }
    
    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      (response as any).debug = {
        config_status: config.metadata?.status,
        config_tier: config.metadata?.tier,
        domain_whitelist: config.domain_whitelist,
        tracking_endpoint: config.tracking_config?.endpoint
      }
    }
    
    return NextResponse.json(response, {
      headers: corsPublic()
    })
    
  } catch (error) {
    console.error('[TrackingVerify] Error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to verify tracking status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsPublic()
      }
    )
  }
}

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  return handleVerification(request)
}

/**
 * POST handler
 */
export async function POST(request: NextRequest) {
  return handleVerification(request)
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPublic()
  })
}