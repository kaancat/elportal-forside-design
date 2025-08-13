import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';

// Cache compiled script in memory for performance
let cachedScript: string | null = null;
let cachedMinifiedScript: string | null = null;
let lastModified: string | null = null;

interface TrackingConfig {
  partner_id?: string;
  partner_domain?: string;
  endpoint?: string;
  clickIdParam?: string;
  cookieDays?: number;
  enableAutoConversion?: boolean;
  enableFingerprinting?: boolean;
  enableFormTracking?: boolean;
  enableButtonTracking?: boolean;
  conversionPatterns?: string[];
  debug?: boolean;
  respectDoNotTrack?: boolean;
  requireConsent?: boolean;
}

/**
 * Get compiled universal script from file system
 */
function getCompiledScript(minified: boolean = false): string | null {
  try {
    const scriptPath = path.join(process.cwd(), 'public', 'tracking', minified ? 'universal.min.js' : 'universal.js');
    
    if (!fs.existsSync(scriptPath)) {
      console.error(`Compiled script not found: ${scriptPath}`);
      return null;
    }

    const stats = fs.statSync(scriptPath);
    const currentModified = stats.mtime.toISOString();
    
    // Check cache
    if (minified) {
      if (cachedMinifiedScript && lastModified === currentModified) {
        return cachedMinifiedScript;
      }
    } else {
      if (cachedScript && lastModified === currentModified) {
        return cachedScript;
      }
    }

    // Read and cache
    const script = fs.readFileSync(scriptPath, 'utf-8');
    
    if (minified) {
      cachedMinifiedScript = script;
    } else {
      cachedScript = script;
    }
    lastModified = currentModified;
    
    return script;
  } catch (error) {
    console.error('Error reading compiled script:', error);
    return null;
  }
}

/**
 * Inject partner configuration into the script
 */
function injectConfiguration(script: string, config: TrackingConfig): string {
  const configJson = JSON.stringify(config, null, 2);
  
  // Replace placeholder with actual configuration
  const configPlaceholder = '/* PARTNER_CONFIG_PLACEHOLDER */';
  
  if (script.includes(configPlaceholder)) {
    return script.replace(
      configPlaceholder,
      `window.DinElportalConfig = ${configJson};`
    );
  }
  
  // Fallback: prepend configuration
  return `window.DinElportalConfig = ${configJson};\n\n${script}`;
}

/**
 * Validate partner ID format
 */
function validatePartnerId(partnerId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(partnerId) && partnerId.length >= 3 && partnerId.length <= 50;
}

/**
 * Get partner configuration from query params
 */
function getPartnerConfig(req: VercelRequest): TrackingConfig {
  const {
    partner_id,
    endpoint,
    click_param = 'click_id',
    cookie_days = '90',
    auto_conversion = 'true',
    fingerprinting = 'true',
    form_tracking = 'true',
    button_tracking = 'true',
    debug = 'false',
    dnt = 'true',
    require_consent = 'false',
    conversion_patterns
  } = req.query;

  const config: TrackingConfig = {
    partner_id: typeof partner_id === 'string' ? partner_id : 'unknown',
    partner_domain: req.headers['referer'] ? new URL(req.headers['referer'] as string).hostname : 'unknown',
    endpoint: typeof endpoint === 'string' ? endpoint : 'https://dinelportal.dk/api/tracking/log',
    clickIdParam: typeof click_param === 'string' ? click_param : 'click_id',
    cookieDays: parseInt(typeof cookie_days === 'string' ? cookie_days : '90'),
    enableAutoConversion: (typeof auto_conversion === 'string' ? auto_conversion : 'true') === 'true',
    enableFingerprinting: (typeof fingerprinting === 'string' ? fingerprinting : 'true') === 'true',
    enableFormTracking: (typeof form_tracking === 'string' ? form_tracking : 'true') === 'true',
    enableButtonTracking: (typeof button_tracking === 'string' ? button_tracking : 'true') === 'true',
    debug: (typeof debug === 'string' ? debug : 'false') === 'true',
    respectDoNotTrack: (typeof dnt === 'string' ? dnt : 'true') === 'true',
    requireConsent: (typeof require_consent === 'string' ? require_consent : 'false') === 'true'
  };

  // Parse conversion patterns
  if (typeof conversion_patterns === 'string') {
    try {
      config.conversionPatterns = JSON.parse(conversion_patterns);
    } catch (e) {
      config.conversionPatterns = conversion_patterns.split(',').map(p => p.trim());
    }
  } else if (Array.isArray(conversion_patterns)) {
    config.conversionPatterns = conversion_patterns as string[];
  }

  return config;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Set CORS headers for cross-origin embedding
    const origin = req.headers.origin || req.headers.referer;
    
    // In production, validate against allowed partner domains
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? (origin || '*') : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
    res.setHeader('Vary', 'Origin');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only accept GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get partner configuration
    const config = getPartnerConfig(req);
    
    // Validate partner ID if provided
    if (config.partner_id && config.partner_id !== 'unknown' && !validatePartnerId(config.partner_id)) {
      return res.status(400).json({ error: 'Invalid partner_id format' });
    }

    // Determine if we should serve minified version
    const useMinified = process.env.NODE_ENV === 'production' && !config.debug;
    
    // Get compiled script
    const script = getCompiledScript(useMinified);
    if (!script) {
      return res.status(500).json({ 
        error: 'Tracking script not available',
        message: 'Please run the build script to generate the universal tracking script'
      });
    }

    // Inject partner configuration
    const configuredScript = injectConfiguration(script, config);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    
    // Caching headers
    if (process.env.NODE_ENV === 'production') {
      // Cache for 1 hour in production, but allow revalidation
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
      
      // Set ETag based on script content and config
      const crypto = await import('crypto');
      const etag = crypto
        .createHash('md5')
        .update(configuredScript)
        .digest('hex');
      res.setHeader('ETag', `"${etag}"`);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${etag}"`) {
        return res.status(304).end();
      }
    } else {
      // No caching in development
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    // Add debugging headers in development
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('X-Debug-Partner-ID', config.partner_id || 'none');
      res.setHeader('X-Debug-Minified', useMinified.toString());
      res.setHeader('X-Debug-Script-Size', configuredScript.length.toString());
    }

    // Log usage for analytics
    console.log('Universal script served:', {
      partner_id: config.partner_id,
      partner_domain: config.partner_domain,
      minified: useMinified,
      size: configuredScript.length,
      user_agent: req.headers['user-agent']?.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    return res.status(200).send(configuredScript);

  } catch (error) {
    console.error('Error serving universal script:', error);
    
    // Return a basic error response that won't break the page
    const errorScript = `
      console.error('[DinElportal] Failed to load tracking script:', ${JSON.stringify(error.message)});
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
    `;
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    
    return res.status(500).send(errorScript);
  }
}