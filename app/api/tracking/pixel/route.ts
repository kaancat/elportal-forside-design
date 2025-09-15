/**
 * Pixel Tracking API Route - Next.js App Router
 * Returns a 1x1 transparent GIF for tracking regardless of success/failure
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getClientIP } from '@/server/rate-limit-helpers'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 3
export const dynamic = 'force-dynamic'

// 1x1 transparent GIF (43 bytes)
const PIXEL_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const PIXEL = Buffer.from(PIXEL_BASE64, 'base64')

/**
 * GET /api/tracking/pixel - Track events via pixel
 */
export async function GET(request: NextRequest) {
  // Create response immediately with pixel - don't await tracking
  const response = new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': PIXEL.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Allow from any origin (images don't need CORS)
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*'
    }
  })
  
  // Fire-and-forget tracking logic
  // This runs after response is sent
  trackEvent(request).catch(error => {
    console.error('[Pixel] Tracking error:', error)
  })
  
  return response
}

/**
 * Async tracking logic that doesn't block response
 */
async function trackEvent(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Parse data from query string
    const data = searchParams.get('data')
    const partner_id = searchParams.get('partner_id')
    const event_type = searchParams.get('event_type')
    const click_id = searchParams.get('click_id')
    const url = searchParams.get('url')
    const ref = searchParams.get('ref')
    
    let trackingData: any = {}
    
    // Handle both encoded JSON and individual parameters
    if (data) {
      try {
        trackingData = JSON.parse(decodeURIComponent(data))
      } catch (e) {
        // If JSON parsing fails, use individual params
        trackingData = {
          partner_id,
          event_type,
          click_id,
          timestamp: Date.now()
        }
      }
    } else {
      // Use individual query params
      trackingData = {
        partner_id,
        event_type: event_type || 'page_view',
        click_id,
        page_url: url,
        referrer: ref,
        timestamp: Date.now()
      }
    }
    
    // Store in KV if we have the required data
    if (trackingData.partner_id) {
      // Validate partner domain (prevent pixel abuse)
      const referer = request.headers.get('referer')
      let refererDomain = ''
      try { if (referer) refererDomain = new URL(referer).hostname } catch {}

      const domainValid = await validatePartnerDomain(trackingData.partner_id, refererDomain)
      if (!domainValid) {
        // Drop event silently to avoid abuse/noise
        return
      }
      const eventKey = `tracking_event:${trackingData.partner_id}:${Date.now()}:${Math.random().toString(36).substr(2)}`
      
      const event = {
        type: trackingData.event_type || 'track',
        partner_id: trackingData.partner_id,
        partner_domain: request.headers.get('referer') ? 
          new URL(request.headers.get('referer')!).hostname : 'unknown',
        data: {
          click_id: trackingData.click_id,
          session_id: trackingData.session_id,
          page_url: trackingData.page_url || request.headers.get('referer'),
          timestamp: trackingData.timestamp || Date.now(),
          event_type: trackingData.event_type
        },
        client_info: {
          ip: getClientIP(request),
          user_agent: request.headers.get('user-agent') || 'unknown',
          timestamp: Date.now()
        }
      }
      
      // Store event with 7 day TTL
      await kv.set(eventKey, event, { ex: 7 * 24 * 60 * 60 })
      
      // Update daily metrics
      const today = new Date().toISOString().split('T')[0]
      const metricsKey = `metrics:daily:${today}:${trackingData.partner_id}`
      
      if (trackingData.event_type === 'conversion') {
        // Store conversion with click attribution (check for duplicates)
        if (trackingData.click_id) {
          const conversionKey = `conversion:${trackingData.partner_id}:${trackingData.click_id}`
          
          // Check if conversion already exists
          const existingConversion = await kv.get(conversionKey)
          if (!existingConversion) {
            // Only create new conversion if it doesn't exist
            await kv.set(conversionKey, {
              ...trackingData,
              conversion_time: Date.now()
            }, { ex: 30 * 24 * 60 * 60 }) // 30 day retention
            
            // Only increment metrics for new conversions
            await kv.hincrby(metricsKey, 'conversions', 1)

            // Fire GA4 Measurement Protocol event (non-blocking)
            sendGa4Conversion({
              partner_id: trackingData.partner_id,
              click_id: trackingData.click_id,
              value: typeof trackingData.conversion_value === 'number' ? trackingData.conversion_value : 0,
            }).catch(() => {})
          }
        } else {
          // No click_id - count as unattributed conversion
          await kv.hincrby(metricsKey, 'conversions', 1)
        }
      } else {
        await kv.hincrby(metricsKey, 'page_views', 1)
      }
      
      // Store click data if it's a landing
      if (trackingData.click_id && trackingData.event_type === 'landing') {
        const clickKey = `click:${trackingData.click_id}`
        await kv.set(clickKey, {
          click_id: trackingData.click_id,
          partner_id: trackingData.partner_id,
          timestamp: Date.now(),
          source: 'pixel_tracking'
        }, { ex: 90 * 24 * 60 * 60 }) // 90 day attribution window
      }
    }
  } catch (error) {
    // Log but don't throw - pixel already sent
    console.error('[Pixel] Store error:', error)
  }
}

/**
 * POST /api/tracking/pixel - Track events via pixel (support POST too)
 */
export async function POST(request: NextRequest) {
  // For POST, we can parse body but still return pixel immediately
  const response = new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': PIXEL.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Access-Control-Allow-Origin': '*'
    }
  })
  
  // Fire-and-forget tracking with body data
  trackPostEvent(request).catch(error => {
    console.error('[Pixel] POST tracking error:', error)
  })
  
  return response
}

/**
 * Async POST tracking logic
 */
async function trackPostEvent(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.partner_id) {
      const eventKey = `tracking_event:${body.partner_id}:${Date.now()}:${Math.random().toString(36).substr(2)}`
      
      const event = {
        type: body.event_type || 'track',
        partner_id: body.partner_id,
        data: body,
        client_info: {
          ip: getClientIP(request),
          user_agent: request.headers.get('user-agent') || 'unknown',
          timestamp: Date.now()
        }
      }
      
      await kv.set(eventKey, event, { ex: 7 * 24 * 60 * 60 })
    }
  } catch (error) {
    console.error('[Pixel] POST store error:', error)
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

/**
 * Validate partner domain against whitelist and active status
 */
async function validatePartnerDomain(partnerId: string, domain: string): Promise<boolean> {
  try {
    const configKey = `partner_config:${partnerId}`
    const config = await kv.get<any>(configKey)
    if (!config) return false

    // Require active partner
    if (config.metadata?.status !== 'active') return false

    // If a whitelist exists, enforce it
    if (Array.isArray(config.domain_whitelist) && config.domain_whitelist.length > 0) {
      if (!domain) return false
      return config.domain_whitelist.some((allowed: string) => {
        if (typeof allowed !== 'string') return false
        if (allowed.startsWith('*.')) {
          const base = allowed.substring(2)
          return domain.endsWith(base)
        }
        return domain === allowed
      })
    }

    // No whitelist configured → allow
    return true
  } catch (err) {
    console.error('[Pixel] Domain validation error:', err)
    // Fail closed to prevent abuse
    return false
  }
}

/**
 * Send partner conversion to GA4 via Measurement Protocol
 * Uses user_id=click_id for anonymous linkage. Requires env vars:
 *   GA4_MEASUREMENT_ID and GA4_API_SECRET
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
      // Provide a synthetic client_id to satisfy MP; user_id ties sessions logically to click_id
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
            // Dedup key for GA4 (24h window)
            event_id: eventId,
          },
        },
      ],
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Do not rethrow to avoid impacting tracking
    })
  } catch {
    // Swallow errors; MP failure must not affect tracking
  }
}
