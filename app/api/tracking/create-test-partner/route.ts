/**
 * Test Partner Creation API Route - Next.js App Router
 * Creates a test partner configuration for development and testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { corsPrivate } from '@/server/api-helpers'
import { requireAuth } from '@/server/session-helpers'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 5
export const dynamic = 'force-dynamic'

// Test partner configuration
const TEST_PARTNER_CONFIG = {
  partner_id: 'test-partner',
  partner_name: 'Test Partner (Demo)',
  domain_whitelist: [
    'localhost',
    'dinelportal.dk',
    'www.dinelportal.dk',
    'mondaybrew.dk',
    'www.mondaybrew.dk',
    'reginaschleuning.com',
    'www.reginaschleuning.com'
  ],
  tracking_config: {
    endpoint: 'https://www.dinelportal.dk/api/tracking/log',
    clickIdParam: 'click_id',
    cookieDays: 90,
    enableAutoConversion: true,
    enableFingerprinting: true,
    enableFormTracking: true,
    enableButtonTracking: true,
    conversionPatterns: [
      '/thank-you',
      '/tak',
      '/confirmation',
      '/bekraeftelse',
      '/success',
      '/succes',
      '/complete',
      '/velkommen'
    ],
    respectDoNotTrack: true,
    requireConsent: false
  },
  conversion_config: {
    attribution_window_days: 90,
    conversion_urls: ['/thank-you', '/tak', '/success'],
    custom_events: ['signup', 'purchase', 'download'],
    value_tracking: true
  },
  security: {
    webhook_hash: 'test-webhook-hash-for-demo-purposes',
    allowed_origins: ['*'], // Allow all origins for testing
    rate_limit_per_hour: 10000 // High limit for testing
  },
  metadata: {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active' as const,
    tier: 'premium' as const
  }
}

/**
 * Check if authorized to create test partner
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  // In development, allow without auth
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // In production, require admin auth
  try {
    await requireAuth(request, ['admin'])
    return true
  } catch {
    // Check for admin auth header
    const adminAuth = request.headers.get('x-admin-auth')
    if (adminAuth && process.env.ADMIN_AUTH_TOKEN) {
      return adminAuth === process.env.ADMIN_AUTH_TOKEN
    }
  }
  
  return false
}

/**
 * GET /api/tracking/create-test-partner - Check if test partner exists
 */
export async function GET(request: NextRequest) {
  try {
    // Check if test partner exists
    const key = `partner_config:test-partner`
    const config = await kv.get(key)
    
    if (config) {
      return NextResponse.json(
        {
          exists: true,
          partner_id: 'test-partner',
          message: 'Test partner already exists',
          usage: 'Use partner_id="test-partner" in your integration'
        },
        {
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    } else {
      return NextResponse.json(
        {
          exists: false,
          message: 'Test partner not found. POST to this endpoint to create it.'
        },
        {
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
  } catch (error) {
    console.error('[CreateTestPartner] GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check test partner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
  }
}

/**
 * POST /api/tracking/create-test-partner - Create or reset test partner
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authorized = await isAuthorized(request)
    if (!authorized) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Admin access required in production'
        },
        { 
          status: 401,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Create or update test partner (overwrite existing)
    const key = `partner_config:test-partner`
    
    // Update timestamps
    const config = {
      ...TEST_PARTNER_CONFIG,
      metadata: {
        ...TEST_PARTNER_CONFIG.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    // Store configuration
    await kv.set(key, config)
    
    // Also store in partner index
    const indexKey = `partner_index:test-partner`
    await kv.set(indexKey, {
      partner_id: config.partner_id,
      partner_name: config.partner_name,
      status: config.metadata.status,
      tier: config.metadata.tier,
      created_at: config.metadata.created_at,
      updated_at: config.metadata.updated_at
    })
    
    console.log('[CreateTestPartner] Test partner created/updated')
    
    return NextResponse.json(
      {
        success: true,
        message: 'Test partner created successfully',
        partner_id: 'test-partner',
        usage: 'Use partner_id="test-partner" in your integration',
        config: {
          domains: config.domain_whitelist,
          conversion_patterns: config.tracking_config.conversionPatterns,
          tier: config.metadata.tier
        }
      },
      {
        status: 201,
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
  } catch (error) {
    console.error('[CreateTestPartner] POST error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create test partner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: corsPrivate(request.headers.get('origin'))
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
    headers: corsPrivate(request.headers.get('origin'))
  })
}