/**
 * Next.js App Router API Route for tracking event logging
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - Rate limiting per partner/IP
 * - Click ID tracking and attribution
 * - Conversion processing
 * - Fingerprint mapping
 * - Domain validation
 * - Metrics aggregation
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { corsPublic } from '@/server/api-helpers'

// Configure runtime
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Standard timeout for logging
export const dynamic = 'force-dynamic' // Real-time tracking

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const DEFAULT_RATE_LIMIT = 1000 // per hour per partner

interface TrackingEvent {
  type: 'track' | 'conversion'
  partner_id: string
  partner_domain: string
  data: {
    click_id?: string
    fingerprint?: string
    session_id: string
    page_url?: string
    referrer?: string
    user_agent?: string
    timestamp: number
    // Conversion-specific fields
    conversion_type?: string
    conversion_value?: number
    conversion_currency?: string
    metadata?: Record<string, any>
  }
  client_info: {
    ip: string
    user_agent: string
    timestamp: number
  }
}

interface StoredClickData {
  click_id: string
  partner_id: string
  timestamp: number
  source?: any
  metadata?: any
}

/**
 * Send partner conversion to GA4 via Measurement Protocol (server-to-GA4)
 */
async function sendGa4Conversion({
  partner_id,
  click_id,
  value = 0,
}: { partner_id: string; click_id?: string; value?: number }) {
  try {
    const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.VITE_GA4_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET || process.env.NEXT_PUBLIC_GA4_API_SECRET
    if (!measurementId || !apiSecret) return

    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
    const nowMicros = Date.now() * 1000
    const eventId = click_id ? `pc_${click_id}` : `pc_${nowMicros}`

    const body = {
      client_id: `dep.${click_id || 'unknown'}.${Date.now()}`,
      non_personalized_ads: true,
      ...(click_id ? { user_id: click_id } : {}),
      events: [
        {
          name: 'partner_conversion',
          params: {
            partner_id,
            click_id,
            value: value || 0,
            currency: 'DKK',
            engagement_time_msec: 1,
            timestamp_micros: nowMicros,
            event_id: eventId,
          },
        },
      ],
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // Ignore MP errors
  }
}

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Validate partner domain against whitelist
 */
async function validatePartnerDomain(partnerId: string, domain: string): Promise<boolean> {
  try {
    const configKey = `partner_config:${partnerId}`
    const config = await kv.get<any>(configKey)
    
    if (!config) return false
    
    // Check if partner is active
    if (config.metadata?.status !== 'active') return false
    
    // Check domain whitelist (if configured)
    if (config.domain_whitelist && config.domain_whitelist.length > 0) {
      return config.domain_whitelist.some((allowedDomain: string) => {
        // Support wildcard subdomains
        if (allowedDomain.startsWith('*.')) {
          const baseDomain = allowedDomain.substring(2)
          return domain.endsWith(baseDomain)
        }
        return domain === allowedDomain
      })
    }
    
    // No whitelist configured - allow all
    return true
  } catch (error) {
    console.error('[TrackingLog] Error validating partner domain:', error)
    return false
  }
}

/**
 * Check rate limit for partner
 */
async function checkRateLimit(partnerId: string, clientIP: string): Promise<{
  allowed: boolean
  remaining: number
  resetTime: number
}> {
  try {
    const now = Date.now()
    const windowStart = Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS
    const resetTime = windowStart + RATE_LIMIT_WINDOW_MS
    
    // Get partner's rate limit
    const configKey = `partner_config:${partnerId}`
    const config = await kv.get<any>(configKey)
    const rateLimit = config?.security?.rate_limit_per_hour || DEFAULT_RATE_LIMIT
    
    // Check current usage
    const rateLimitKey = `rate_limit:${partnerId}:${clientIP}:${windowStart}`
    const currentUsage = await kv.get<number>(rateLimitKey) || 0
    
    if (currentUsage >= rateLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime
      }
    }
    
    // Increment usage
    await kv.set(rateLimitKey, currentUsage + 1, { 
      ex: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) 
    })
    
    return {
      allowed: true,
      remaining: rateLimit - currentUsage - 1,
      resetTime
    }
  } catch (error) {
    console.error('[TrackingLog] Rate limit check failed:', error)
    // Fail open to avoid blocking legitimate traffic
    return {
      allowed: true,
      remaining: DEFAULT_RATE_LIMIT - 1,
      resetTime: Date.now() + RATE_LIMIT_WINDOW_MS
    }
  }
}

/**
 * Store tracking event
 */
async function storeTrackingEvent(event: TrackingEvent): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString()
    const eventKey = `tracking_event:${event.partner_id}:${timestamp}:${Math.random().toString(36).substr(2)}`
    
    // Store individual event
    await kv.set(eventKey, event, { ex: 7 * 24 * 60 * 60 }) // 7 days TTL
    
    // Update daily metrics
    const today = new Date().toISOString().split('T')[0]
    const metricsKey = `metrics:daily:${today}:${event.partner_id}`
    
    if (event.type === 'track') {
      await kv.hincrby(metricsKey, 'page_views', 1)
    } else if (event.type === 'conversion') {
      await kv.hincrby(metricsKey, 'conversions', 1)
      
      if (event.data.conversion_value) {
        await kv.hincrbyfloat(metricsKey, 'conversion_value', event.data.conversion_value)
      }
    }
    
    // Set metrics TTL (30 days)
    await kv.expire(metricsKey, 30 * 24 * 60 * 60)
    
    return true
  } catch (error) {
    console.error('[TrackingLog] Error storing tracking event:', error)
    return false
  }
}

/**
 * Handle click ID tracking and fingerprint mapping
 */
async function handleClickIdTracking(event: TrackingEvent): Promise<void> {
  try {
    const { click_id, fingerprint, session_id } = event.data
    
    if (click_id) {
      // Store click data for attribution
      const clickKey = `click:${click_id}`
      const clickData: StoredClickData = {
        click_id,
        partner_id: event.partner_id,
        timestamp: Date.now(),
        source: 'universal_script',
        metadata: {
          partner_domain: event.partner_domain,
          session_id,
          user_agent: event.client_info.user_agent,
          ip: event.client_info.ip
        }
      }
      
      // Store with 90-day TTL (attribution window)
      await kv.set(clickKey, clickData, { ex: 90 * 24 * 60 * 60 })
    }
    
    // Create fingerprint mapping if available
    if (fingerprint && (click_id || session_id)) {
      const fpKey = `fingerprint:${fingerprint}`
      const fpData = {
        partner_id: event.partner_id,
        click_id,
        session_id,
        first_seen: Date.now(),
        last_seen: Date.now(),
        page_views: 1
      }
      
      // Try to get existing fingerprint data
      const existing = await kv.get<any>(fpKey)
      if (existing) {
        fpData.first_seen = existing.first_seen
        fpData.page_views = (existing.page_views || 0) + 1
        // Update click_id if we have a new one
        if (click_id && !existing.click_id) {
          fpData.click_id = click_id
        }
      }
      
      await kv.set(fpKey, fpData, { ex: 90 * 24 * 60 * 60 })
    }
  } catch (error) {
    console.error('[TrackingLog] Error handling click ID tracking:', error)
  }
}

/**
 * Process conversion event
 */
async function processConversion(event: TrackingEvent): Promise<{
  success: boolean
  message: string
  attributed?: boolean
}> {
  try {
    const { click_id, fingerprint } = event.data
    let attributed = false
    let attributedClickId = click_id
    
    // Try to find click_id via fingerprint if not provided
    if (!click_id && fingerprint) {
      const fpKey = `fingerprint:${fingerprint}`
      const fpData = await kv.get<any>(fpKey)
      if (fpData && fpData.click_id) {
        attributedClickId = fpData.click_id
        event.data.click_id = attributedClickId
        attributed = true
      }
    }
    
    if (attributedClickId) {
      // Validate the click and check attribution window
      const clickKey = `click:${attributedClickId}`
      const clickData = await kv.get<StoredClickData>(clickKey)
      
      if (clickData) {
        const timeDiff = Date.now() - clickData.timestamp
        const attributionWindow = 90 * 24 * 60 * 60 * 1000 // 90 days
        
        if (timeDiff <= attributionWindow) {
          // Valid conversion within attribution window
          const conversionKey = `conversion:${attributedClickId}`
          
          // Check for duplicate
          const existing = await kv.exists(conversionKey)
          if (existing) {
            return {
              success: false,
              message: 'Conversion already tracked for this click_id'
            }
          }
          
          // Store conversion
          const conversionData = {
            ...event.data,
            click_id: attributedClickId,
            partner_id: event.partner_id,
            click_timestamp: clickData.timestamp,
            conversion_timestamp: Date.now(),
            attribution_method: attributed ? 'fingerprint' : 'direct',
            status: 'pending'
          }
          
          await kv.set(conversionKey, conversionData)
          
          return {
            success: true,
            message: 'Conversion tracked successfully',
            attributed: attributed
          }
        } else {
          return {
            success: false,
            message: 'Conversion outside attribution window'
          }
        }
      } else {
        return {
          success: false,
          message: 'Click ID not found or expired'
        }
      }
    } else {
      // Store as unattributed conversion for analytics
      const unattributedKey = `unattributed_conversion:${event.partner_id}:${Date.now()}:${Math.random().toString(36).substr(2)}`
      await kv.set(unattributedKey, event.data, { ex: 30 * 24 * 60 * 60 })
      
      return {
        success: true,
        message: 'Conversion tracked (unattributed)',
        attributed: false
      }
    }
  } catch (error) {
    console.error('[TrackingLog] Error processing conversion:', error)
    return {
      success: false,
      message: 'Failed to process conversion'
    }
  }
}

/**
 * POST /api/tracking/log - Log tracking events
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    if (!body.partner_id || !body.type || !body.data) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['partner_id', 'type', 'data']
        },
        { status: 400 }
      )
    }

    // Get client info
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    // Create tracking event
    const event: TrackingEvent = {
      type: body.type,
      partner_id: body.partner_id,
      partner_domain: body.partner_domain || 'unknown',
      data: {
        ...body.data,
        timestamp: body.data.timestamp || Date.now()
      },
      client_info: {
        ip: clientIP,
        user_agent: userAgent,
        timestamp: Date.now()
      }
    }

    // Validate partner domain
    const domainValid = await validatePartnerDomain(event.partner_id, event.partner_domain)
    if (!domainValid) {
      return NextResponse.json(
        { error: 'Partner domain not authorized' },
        { status: 403 }
      )
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(event.partner_id, clientIP)
    
    const headers = {
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      ...corsPublic()
    }
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reset_time: rateLimit.resetTime
        },
        { 
          status: 429,
          headers
        }
      )
    }

    // Store the tracking event
    const stored = await storeTrackingEvent(event)
    if (!stored) {
      console.error('[TrackingLog] Failed to store tracking event')
    }

    // Handle click ID tracking
    await handleClickIdTracking(event)

    let result = {
      success: true,
      message: 'Event logged successfully',
      timestamp: new Date().toISOString()
    }

    // Process conversions
    if (event.type === 'conversion') {
      const conversionResult = await processConversion(event)
      result = {
        ...result,
        ...conversionResult
      }
      // Fire GA4 MP event for attributed conversions
      if (conversionResult.success) {
        await sendGa4Conversion({
          partner_id: event.partner_id,
          click_id: event.data.click_id,
          value: event.data.conversion_value,
        })
      }
      
      // Log significant conversions
      if (conversionResult.success && event.data.conversion_value && event.data.conversion_value > 0) {
        console.log('[TrackingLog] 💰 Conversion logged:', {
          partner_id: event.partner_id,
          click_id: event.data.click_id,
          value: event.data.conversion_value,
          attributed: conversionResult.attributed
        })
      }
    }

    return NextResponse.json(result, { status: 200, headers })

  } catch (error) {
    console.error('[TrackingLog] Error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: corsPublic()
      }
    )
  }
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
