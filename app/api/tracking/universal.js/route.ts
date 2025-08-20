/**
 * Universal Tracking Script API Route - Next.js App Router
 * Serves JavaScript tracking code with partner configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateETag, checkETag } from '@/server/etag-helpers'
import { corsPublic, cacheHeaders } from '@/server/api-helpers'
import fs from 'fs/promises'
import path from 'path'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 5
export const dynamic = 'force-dynamic'

// Cache compiled script in memory for performance
let cachedScript: string | null = null
let lastModified: string | null = null

interface TrackingConfig {
  partner_id?: string
  partner_domain?: string
  clickIdParam?: string
  cookieDays?: number
  enableAutoConversion?: boolean
  enableFingerprinting?: boolean
  enableFormTracking?: boolean
  enableButtonTracking?: boolean
  conversionPatterns?: string[]
  debug?: boolean
  respectDoNotTrack?: boolean
  requireConsent?: boolean
}

/**
 * Get compiled universal script from file system
 */
async function getCompiledScript(): Promise<string | null> {
  try {
    // Use the universal-simple.js script
    const scriptName = 'universal-simple.js'
    
    // Try multiple paths for Vercel compatibility
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'tracking', scriptName),
      path.join('/var/task', 'public', 'tracking', scriptName)
    ]
    
    let scriptPath: string | null = null
    for (const testPath of possiblePaths) {
      try {
        await fs.access(testPath)
        scriptPath = testPath
        break
      } catch {
        // Try next path
      }
    }
    
    if (!scriptPath) {
      console.error(`[UniversalJS] Script not found in any of these paths:`, possiblePaths)
      return null
    }
    
    const stats = await fs.stat(scriptPath)
    const currentModified = stats.mtime.toISOString()
    
    // Check cache
    if (cachedScript && lastModified === currentModified) {
      return cachedScript
    }
    
    // Read and cache
    const script = await fs.readFile(scriptPath, 'utf-8')
    cachedScript = script
    lastModified = currentModified
    
    console.log(`[UniversalJS] Serving script from: ${scriptPath}, size: ${script.length} bytes`)
    
    return script
  } catch (error) {
    console.error('[UniversalJS] Error reading compiled script:', error)
    return null
  }
}

/**
 * Inject partner configuration into the script
 */
function injectConfiguration(script: string, config: TrackingConfig): string {
  // Create a simplified config object
  const simplifiedConfig = {
    partner_id: config.partner_id,
    clickIdParam: config.clickIdParam,
    enableAutoConversion: config.enableAutoConversion !== false,
    conversionPatterns: config.conversionPatterns || ['/tak', '/thank-you'],
    debug: config.debug || false
  }
  
  const configJson = JSON.stringify(simplifiedConfig, null, 2)
  
  // Replace placeholder with actual configuration
  const configPlaceholder = '/* PARTNER_CONFIG_PLACEHOLDER */'
  
  if (script.includes(configPlaceholder)) {
    return script.replace(
      configPlaceholder,
      `window.DinElportalConfig = ${configJson};`
    )
  }
  
  // Fallback: prepend configuration
  return `window.DinElportalConfig = ${configJson};\n\n${script}`
}

/**
 * Validate partner ID format
 */
function validatePartnerId(partnerId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(partnerId) && 
         partnerId.length >= 3 && 
         partnerId.length <= 50
}

/**
 * Get partner configuration from query params
 */
function getPartnerConfig(request: NextRequest): TrackingConfig {
  const { searchParams } = request.nextUrl
  
  const partner_id = searchParams.get('partner_id')
  const thank_you = searchParams.get('thank_you')
  const click_param = searchParams.get('click_param')
  const cookie_days = searchParams.get('cookie_days')
  const auto_conversion = searchParams.get('auto_conversion')
  const fingerprinting = searchParams.get('fingerprinting')
  const form_tracking = searchParams.get('form_tracking')
  const button_tracking = searchParams.get('button_tracking')
  const debug = searchParams.get('debug')
  const dnt = searchParams.get('dnt')
  const require_consent = searchParams.get('require_consent')
  const conversion_patterns = searchParams.get('conversion_patterns')
  
  const config: TrackingConfig = {
    partner_id: partner_id || 'unknown',
    partner_domain: request.headers.get('referer') ? 
      new URL(request.headers.get('referer')!).hostname : 'unknown',
    clickIdParam: click_param || 'click_id',
    cookieDays: parseInt(cookie_days || '90'),
    enableAutoConversion: (auto_conversion || 'true') === 'true',
    enableFingerprinting: (fingerprinting || 'false') === 'true',
    enableFormTracking: (form_tracking || 'false') === 'true',
    enableButtonTracking: (button_tracking || 'false') === 'true',
    debug: (debug || 'false') === 'true',
    respectDoNotTrack: (dnt || 'true') === 'true',
    requireConsent: (require_consent || 'false') === 'true'
  }
  
  // Handle thank_you page parameter - this is the key configuration
  if (thank_you) {
    // Use the custom thank you page as the only conversion pattern
    config.conversionPatterns = [thank_you]
  } else if (conversion_patterns) {
    // Fallback to old conversion_patterns if provided
    try {
      config.conversionPatterns = JSON.parse(conversion_patterns)
    } catch (e) {
      config.conversionPatterns = conversion_patterns.split(',').map(p => p.trim())
    }
  } else {
    // Default thank you pages if nothing specified
    config.conversionPatterns = ['/tak', '/thank-you', '/success']
  }
  
  return config
}

/**
 * GET /api/tracking/universal.js - Serve tracking JavaScript
 */
export async function GET(request: NextRequest) {
  try {
    // Get partner configuration
    const config = getPartnerConfig(request)
    
    // Validate partner ID if provided
    if (config.partner_id && config.partner_id !== 'unknown') {
      if (!validatePartnerId(config.partner_id)) {
        return NextResponse.json(
          { error: 'Invalid partner_id format' },
          { status: 400 }
        )
      }
    }
    
    // Get the compiled script
    const script = await getCompiledScript()
    if (!script) {
      // Return error script that won't break the page
      const errorScript = `
        console.error('[DinElportal] Tracking script not available');
        if (typeof window !== 'undefined') {
          window.DinElportal = {
            trackConversion: function() { return Promise.resolve(false); },
            getTrackingData: function() { return null; },
            clearData: function() {},
            setConfig: function() {},
            getConfig: function() { return {}; },
            debug: function() {},
            version: 'error'
          };
        }
      `
      
      return new NextResponse(errorScript, {
        status: 500,
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      })
    }
    
    // Inject partner configuration
    const configuredScript = injectConfiguration(script, config)
    
    // Check for ETag match (304 Not Modified)
    const etagResponse = checkETag(request, configuredScript)
    if (etagResponse) {
      return etagResponse
    }
    
    // Generate ETag for response
    const etag = generateETag(configuredScript)
    
    // Log usage for analytics
    console.log('[UniversalJS] Script served:', {
      partner_id: config.partner_id,
      partner_domain: config.partner_domain,
      version: 'simplified-v2.0.0',
      size: configuredScript.length,
      timestamp: new Date().toISOString()
    })
    
    const response = new NextResponse(configuredScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
        ...cacheHeaders({ 
          sMaxage: 3600, // Cache for 1 hour
          swr: 86400 // Stale-while-revalidate for 24 hours
        }),
        ...corsPublic() // Allow from any origin
      }
    })
    
    // Add debug headers in development
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Debug-Partner-ID', config.partner_id || 'none')
      response.headers.set('X-Debug-Script-Version', 'simplified-v2.0.0')
      response.headers.set('X-Debug-Script-Size', configuredScript.length.toString())
    }
    
    return response
    
  } catch (error) {
    console.error('[UniversalJS] Error serving script:', error)
    
    // Return a basic error response that won't break the page
    const errorScript = `
      console.error('[DinElportal] Failed to load tracking script:', ${JSON.stringify(
        error instanceof Error ? error.message : 'Unknown error'
      )});
      if (typeof window !== 'undefined') {
        window.DinElportal = {
          trackConversion: function() { return Promise.resolve(false); },
          getTrackingData: function() { return null; },
          clearData: function() {},
          setConfig: function() {},
          getConfig: function() { return {}; },
          debug: function() {},
          version: 'error'
        };
      }
    `
    
    return new NextResponse(errorScript, {
      status: 500,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...corsPublic()
      }
    })
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