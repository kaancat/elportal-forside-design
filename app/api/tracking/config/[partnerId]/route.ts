/**
 * Partner Configuration API Route - Next.js App Router
 * Dynamic route for managing partner tracking configurations
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { corsPublic, corsPrivate } from '@/server/api-helpers'
import { requireAuth } from '@/server/session-helpers'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

interface PartnerConfig {
  partner_id: string
  partner_name: string
  domain_whitelist: string[]
  tracking_config: {
    endpoint: string
    clickIdParam: string
    cookieDays: number
    enableAutoConversion: boolean
    enableFingerprinting: boolean
    enableFormTracking: boolean
    enableButtonTracking: boolean
    conversionPatterns: string[]
    respectDoNotTrack: boolean
    requireConsent: boolean
  }
  conversion_config: {
    attribution_window_days: number
    conversion_urls: string[]
    custom_events: string[]
    value_tracking: boolean
  }
  security: {
    webhook_hash: string
    allowed_origins: string[]
    rate_limit_per_hour: number
  }
  metadata: {
    created_at: string
    updated_at: string
    status: 'active' | 'paused' | 'suspended'
    tier: 'basic' | 'premium' | 'enterprise'
  }
}

/**
 * Default configuration template
 */
function getDefaultConfig(partnerId: string): Partial<PartnerConfig> {
  return {
    partner_id: partnerId,
    domain_whitelist: [],
    tracking_config: {
      endpoint: 'https://dinelportal.dk/api/tracking/log',
      clickIdParam: 'click_id',
      cookieDays: 90,
      enableAutoConversion: true,
      enableFingerprinting: true,
      enableFormTracking: true,
      enableButtonTracking: true,
      conversionPatterns: [
        '/thank-you',
        '/confirmation',
        '/success',
        '/complete'
      ],
      respectDoNotTrack: true,
      requireConsent: false
    },
    conversion_config: {
      attribution_window_days: 90,
      conversion_urls: [],
      custom_events: ['signup', 'purchase', 'download'],
      value_tracking: false
    },
    security: {
      webhook_hash: '',
      allowed_origins: [],
      rate_limit_per_hour: 1000
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      tier: 'basic'
    }
  }
}

/**
 * Validate partner ID format
 */
function validatePartnerId(partnerId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(partnerId) && 
         partnerId.length >= 3 && 
         partnerId.length <= 50 &&
         !partnerId.startsWith('_') &&
         !partnerId.endsWith('_')
}

/**
 * Check if request is authorized for read operations
 */
async function isAuthorizedForRead(request: NextRequest, partnerId: string): Promise<boolean> {
  // For GET requests, check if referrer domain is whitelisted
  const referer = request.headers.get('referer')
  
  if (!referer) {
    // Allow reads without referer in development
    return process.env.NODE_ENV === 'development'
  }
  
  // In production, validate against partner's domain whitelist
  try {
    const config = await getPartnerConfig(partnerId)
    if (!config) return false
    
    if (config.domain_whitelist && config.domain_whitelist.length > 0) {
      const refererDomain = new URL(referer).hostname
      return config.domain_whitelist.some(domain => {
        if (domain.startsWith('*.')) {
          return refererDomain.endsWith(domain.substring(2))
        }
        return refererDomain === domain
      })
    }
  } catch {
    // Allow in case of validation errors
  }
  
  return true
}

/**
 * Check if request is authorized for write operations
 */
async function isAuthorizedForWrite(request: NextRequest): Promise<boolean> {
  // Check for admin session
  try {
    await requireAuth(request, ['admin'])
    return true
  } catch {
    // Not admin authenticated
  }
  
  // Check for API key (for scripts/CI)
  const apiKey = request.headers.get('x-api-key')
  const adminAuth = request.headers.get('x-admin-auth')
  
  if (adminAuth && process.env.ADMIN_AUTH_TOKEN) {
    return adminAuth === process.env.ADMIN_AUTH_TOKEN
  }
  
  // In development, allow any API key
  if (apiKey && process.env.NODE_ENV === 'development') {
    return true
  }
  
  return false
}

/**
 * Get partner configuration from storage
 */
async function getPartnerConfig(partnerId: string): Promise<PartnerConfig | null> {
  try {
    const key = `partner_config:${partnerId}`
    const config = await kv.get<PartnerConfig>(key)
    return config
  } catch (error) {
    console.error('[PartnerConfig] Error fetching config:', error)
    return null
  }
}

/**
 * Store partner configuration
 */
async function setPartnerConfig(config: PartnerConfig): Promise<boolean> {
  try {
    const key = `partner_config:${config.partner_id}`
    config.metadata.updated_at = new Date().toISOString()
    
    await kv.set(key, config)
    
    // Also store in partner index for admin dashboard
    const indexKey = `partner_index:${config.partner_id}`
    await kv.set(indexKey, {
      partner_id: config.partner_id,
      partner_name: config.partner_name,
      status: config.metadata.status,
      tier: config.metadata.tier,
      created_at: config.metadata.created_at,
      updated_at: config.metadata.updated_at
    })
    
    return true
  } catch (error) {
    console.error('[PartnerConfig] Error storing config:', error)
    return false
  }
}

/**
 * Generate secure webhook hash
 */
function generateWebhookHash(): string {
  return 'webhook_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15)
}

/**
 * Sanitize config for public API response
 */
function sanitizeConfig(config: PartnerConfig): Partial<PartnerConfig> {
  const { security, ...publicConfig } = config
  
  return {
    ...publicConfig,
    security: {
      allowed_origins: security.allowed_origins,
      rate_limit_per_hour: security.rate_limit_per_hour,
      webhook_hash: security.webhook_hash ? 'configured' : 'not_configured'
    }
  }
}

/**
 * GET /api/tracking/config/[partnerId] - Get partner configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const partnerId = params.partnerId
    
    // Validate partner ID format
    if (!validatePartnerId(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID format' },
        { status: 400 }
      )
    }
    
    // Check authorization for read
    const authorized = await isAuthorizedForRead(request, partnerId)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get partner configuration
    const config = await getPartnerConfig(partnerId)
    
    if (!config) {
      return NextResponse.json(
        {
          error: 'Partner configuration not found',
          partner_id: partnerId
        },
        { status: 404 }
      )
    }
    
    // Check if partner is active
    if (config.metadata.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Partner account is not active',
          status: config.metadata.status
        },
        { status: 403 }
      )
    }
    
    // Return sanitized config
    return NextResponse.json(
      {
        success: true,
        data: sanitizeConfig(config),
        timestamp: new Date().toISOString()
      },
      {
        headers: corsPublic()
      }
    )
    
  } catch (error) {
    console.error('[PartnerConfig] GET error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tracking/config/[partnerId] - Create new partner configuration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const partnerId = params.partnerId
    
    // Validate partner ID format
    if (!validatePartnerId(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID format' },
        { status: 400 }
      )
    }
    
    // Check authorization for write
    const authorized = await isAuthorizedForWrite(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { 
          status: 401,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Check if already exists
    const existingConfig = await getPartnerConfig(partnerId)
    if (existingConfig) {
      return NextResponse.json(
        { error: 'Partner configuration already exists' },
        { status: 409 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Create new configuration
    const newConfig: PartnerConfig = {
      ...getDefaultConfig(partnerId),
      ...body,
      partner_id: partnerId, // Ensure ID matches route
      security: {
        ...getDefaultConfig(partnerId).security,
        webhook_hash: generateWebhookHash(),
        ...body.security
      }
    } as PartnerConfig
    
    const created = await setPartnerConfig(newConfig)
    if (!created) {
      return NextResponse.json(
        { error: 'Failed to create partner configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        data: sanitizeConfig(newConfig),
        message: 'Partner configuration created successfully',
        timestamp: new Date().toISOString()
      },
      {
        status: 201,
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
    
  } catch (error) {
    console.error('[PartnerConfig] POST error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tracking/config/[partnerId] - Update partner configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const partnerId = params.partnerId
    
    // Validate partner ID format
    if (!validatePartnerId(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID format' },
        { status: 400 }
      )
    }
    
    // Check authorization for write
    const authorized = await isAuthorizedForWrite(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { 
          status: 401,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Get current configuration
    const currentConfig = await getPartnerConfig(partnerId)
    if (!currentConfig) {
      return NextResponse.json(
        { error: 'Partner configuration not found' },
        { status: 404 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Update configuration
    const updatedConfig: PartnerConfig = {
      ...currentConfig,
      ...body,
      partner_id: partnerId, // Ensure ID doesn't change
      metadata: {
        ...currentConfig.metadata,
        ...body.metadata,
        created_at: currentConfig.metadata.created_at, // Preserve creation time
        updated_at: new Date().toISOString()
      }
    }
    
    const updated = await setPartnerConfig(updatedConfig)
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update partner configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        data: sanitizeConfig(updatedConfig),
        message: 'Partner configuration updated successfully',
        timestamp: new Date().toISOString()
      },
      {
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
    
  } catch (error) {
    console.error('[PartnerConfig] PUT error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tracking/config/[partnerId] - Deactivate partner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const partnerId = params.partnerId
    
    // Validate partner ID format
    if (!validatePartnerId(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID format' },
        { status: 400 }
      )
    }
    
    // Check authorization for write
    const authorized = await isAuthorizedForWrite(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { 
          status: 401,
          headers: corsPrivate(request.headers.get('origin'))
        }
      )
    }
    
    // Get configuration to deactivate
    const configToDeactivate = await getPartnerConfig(partnerId)
    if (!configToDeactivate) {
      return NextResponse.json(
        { error: 'Partner configuration not found' },
        { status: 404 }
      )
    }
    
    // Mark as suspended (don't actually delete for audit trail)
    configToDeactivate.metadata.status = 'suspended'
    configToDeactivate.metadata.updated_at = new Date().toISOString()
    
    const deactivated = await setPartnerConfig(configToDeactivate)
    if (!deactivated) {
      return NextResponse.json(
        { error: 'Failed to deactivate partner configuration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Partner configuration deactivated successfully',
        timestamp: new Date().toISOString()
      },
      {
        headers: corsPrivate(request.headers.get('origin'))
      }
    )
    
  } catch (error) {
    console.error('[PartnerConfig] DELETE error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
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