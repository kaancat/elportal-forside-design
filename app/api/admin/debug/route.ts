/**
 * Admin Debug API Route - Next.js App Router
 * Debug endpoint to check environment variables and system status
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/session-helpers'
import { corsPrivate } from '@/server/api-helpers'
import { validateCSRF } from '@/server/csrf-helpers'
import { kv } from '@vercel/kv'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 5
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/debug - Get debug information (requires admin auth)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAuth(request, ['admin'])
    
    // Get environment debug info
    const adminSecret = process.env.ADMIN_SECRET
    const conversionSecret = process.env.CONVERSION_WEBHOOK_SECRET
    const elportalSigningKey = process.env.ELPORTAL_SIGNING_KEY
    const eloverblikApiValue = process.env.ELOVERBLIK_API_TOKEN
    const kvUrl = process.env.KV_REST_API_URL
    
    // Test KV connection
    let kvStatus = 'unknown'
    let kvLatency = 0
    try {
      const startTime = Date.now()
      await kv.ping()
      kvLatency = Date.now() - startTime
      kvStatus = 'connected'
    } catch (kvError) {
      kvStatus = 'error'
      console.error('[Debug] KV connection error:', kvError)
    }
    
    // Get system metrics
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.floor(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.floor(memoryUsage.external / 1024 / 1024) + ' MB'
      },
      secrets: {
        adminSecretExists: !!adminSecret,
        adminSecretLength: adminSecret ? adminSecret.length : 0,
        adminSecretPreview: adminSecret ? adminSecret.substring(0, 3) + '***' : 'not set',
        conversionSecretExists: !!conversionSecret,
        conversionSecretLength: conversionSecret ? conversionSecret.length : 0,
        elportalSigningKeyExists: !!elportalSigningKey,
        elportalSigningKeyLength: elportalSigningKey ? elportalSigningKey.trim().length : 0,
        eloverblikApiValueExists: !!eloverblikApiValue,
        eloverblikApiValueLength: eloverblikApiValue ? eloverblikApiValue.length : 0
      },
      kvStorage: {
        status: kvStatus,
        latency: kvLatency + 'ms',
        urlExists: !!kvUrl,
        urlPreview: kvUrl ? new URL(kvUrl).hostname : 'not set'
      },
      envKeys: {
        admin: Object.keys(process.env).filter(key => key.includes('ADMIN')),
        conversion: Object.keys(process.env).filter(key => key.includes('CONVERSION')),
        eloverblik: Object.keys(process.env).filter(key => key.includes('ELOVERBLIK')),
        kv: Object.keys(process.env).filter(key => key.includes('KV')),
        vercel: Object.keys(process.env).filter(key => key.startsWith('VERCEL_')).slice(0, 5),
        next: Object.keys(process.env).filter(key => key.startsWith('NEXT_')).slice(0, 5)
      },
      session: {
        sessionId: session.sessionId,
        customerId: session.customerId || null,
        scopes: session.scopes || []
      }
    }
    
    const response = NextResponse.json({
      ok: true,
      data: debug
    })
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // No cache for debug info
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    
    return response
    
  } catch (error) {
    // Handle auth errors
    if (error instanceof NextResponse) {
      return error
    }
    
    console.error('[Debug] GET error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'DEBUG_ERROR',
          message: 'Debug failed',
          details: error instanceof Error ? error.message : String(error)
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/debug - Clear specific debug/cache data (with CSRF)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAuth(request, ['admin'])
    
    // Validate CSRF for mutation
    const csrfValid = await validateCSRF(request)
    if (!csrfValid) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'Invalid or missing CSRF value'
          }
        },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { action } = body
    
    let result = { message: 'No action performed' }
    
    switch (action) {
      case 'clear_admin_logs':
        // Clear admin action logs
        const logKeys = await kv.keys('admin-action:*')
        for (const key of logKeys) {
          await kv.del(key)
        }
        result = { message: `Cleared ${logKeys.length} admin logs` }
        break
        
      case 'clear_security_events':
        // Clear security event logs
        const eventKeys = await kv.keys('security-event:*')
        for (const key of eventKeys) {
          await kv.del(key)
        }
        result = { message: `Cleared ${eventKeys.length} security events` }
        break
        
      case 'clear_rate_limits':
        // Clear rate limit counters
        const rateLimitKeys = await kv.keys('rate-limit:*')
        for (const key of rateLimitKeys) {
          await kv.del(key)
        }
        result = { message: `Cleared ${rateLimitKeys.length} rate limit counters` }
        break
        
      case 'test_kv':
        // Test KV write/read
        const testKey = `test:${Date.now()}`
        const testValue = { test: true, timestamp: Date.now() }
        await kv.set(testKey, testValue, { ex: 60 })
        const retrieved = await kv.get(testKey)
        await kv.del(testKey)
        result = { 
          message: 'KV test successful', 
          written: testValue, 
          retrieved 
        }
        break
        
      default:
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Invalid debug action',
              validActions: [
                'clear_admin_logs',
                'clear_security_events',
                'clear_rate_limits',
                'test_kv'
              ]
            }
          },
          { status: 400 }
        )
    }
    
    // Log admin action
    await kv.set(
      `admin-action:${Date.now()}`,
      {
        action: `debug_${action}`,
        sessionId: session.sessionId,
        timestamp: Date.now(),
        result
      },
      { ex: 86400 } // 24 hours
    )
    
    const response = NextResponse.json({
      ok: true,
      data: result,
      timestamp: new Date().toISOString()
    })
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    // Handle auth errors
    if (error instanceof NextResponse) {
      return error
    }
    
    console.error('[Debug] POST error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'DEBUG_ACTION_ERROR',
          message: 'Debug action failed',
          details: error instanceof Error ? error.message : String(error)
        }
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPrivate(request.headers.get('origin'))
  })
}