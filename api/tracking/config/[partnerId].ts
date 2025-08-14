import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface PartnerConfig {
  partner_id: string;
  partner_name: string;
  domain_whitelist: string[];
  tracking_config: {
    endpoint: string;
    clickIdParam: string;
    cookieDays: number;
    enableAutoConversion: boolean;
    enableFingerprinting: boolean;
    enableFormTracking: boolean;
    enableButtonTracking: boolean;
    conversionPatterns: string[];
    respectDoNotTrack: boolean;
    requireConsent: boolean;
  };
  conversion_config: {
    attribution_window_days: number;
    conversion_urls: string[];
    custom_events: string[];
    value_tracking: boolean;
  };
  security: {
    webhook_hash: string;
    allowed_origins: string[];
    rate_limit_per_hour: number;
  };
  metadata: {
    created_at: string;
    updated_at: string;
    status: 'active' | 'paused' | 'suspended';
    tier: 'basic' | 'premium' | 'enterprise';
  };
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
      webhook_hash: '', // Generated separately
      allowed_origins: [],
      rate_limit_per_hour: 1000
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      tier: 'basic'
    }
  };
}

/**
 * Validate partner ID format
 */
function validatePartnerId(partnerId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(partnerId) && 
         partnerId.length >= 3 && 
         partnerId.length <= 50 &&
         !partnerId.startsWith('_') &&
         !partnerId.endsWith('_');
}

/**
 * Check if request is authorized to access partner config
 */
function isAuthorized(req: VercelRequest, partnerId: string): boolean {
  // For GET requests, check if referrer domain is whitelisted
  // For POST/PUT/DELETE, require API key or admin auth
  
  if (req.method === 'GET') {
    const referer = req.headers.referer;
    if (!referer) return false;
    
    // In production, validate against partner's domain whitelist
    // For now, allow development access
    return process.env.NODE_ENV === 'development' || Boolean(referer);
  }
  
  // Write operations require authentication
  const apiKey = req.headers['x-api-key'] as string;
  const adminAuth = req.headers['x-admin-auth'] as string;
  
  // Allow any API key for development, or match admin token
  if (apiKey) return true;
  if (adminAuth && process.env.ADMIN_AUTH_TOKEN) {
    return adminAuth === process.env.ADMIN_AUTH_TOKEN;
  }
  
  return false;
}

/**
 * Get partner configuration from storage
 */
async function getPartnerConfig(partnerId: string): Promise<PartnerConfig | null> {
  try {
    const key = `partner_config:${partnerId}`;
    const config = await kv.get<PartnerConfig>(key);
    return config;
  } catch (error) {
    console.error('Error fetching partner config:', error);
    return null;
  }
}

/**
 * Store partner configuration
 */
async function setPartnerConfig(config: PartnerConfig): Promise<boolean> {
  try {
    const key = `partner_config:${config.partner_id}`;
    config.metadata.updated_at = new Date().toISOString();
    
    await kv.set(key, config);
    
    // Also store in partner index for admin dashboard
    const indexKey = `partner_index:${config.partner_id}`;
    await kv.set(indexKey, {
      partner_id: config.partner_id,
      partner_name: config.partner_name,
      status: config.metadata.status,
      tier: config.metadata.tier,
      created_at: config.metadata.created_at,
      updated_at: config.metadata.updated_at
    });
    
    return true;
  } catch (error) {
    console.error('Error storing partner config:', error);
    return false;
  }
}

/**
 * Generate secure webhook hash
 */
function generateWebhookHash(): string {
  // Use a simpler approach that works in Vercel
  return 'webhook_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Sanitize config for public API response
 */
function sanitizeConfig(config: PartnerConfig): Partial<PartnerConfig> {
  const { security, ...publicConfig } = config;
  
  return {
    ...publicConfig,
    security: {
      allowed_origins: security.allowed_origins,
      rate_limit_per_hour: security.rate_limit_per_hour,
      webhook_hash: security.webhook_hash ? 'configured' : 'not_configured'
    }
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Enable CORS for partner domains
    const origin = req.headers.origin || req.headers.referer;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Admin-Auth');
    res.setHeader('Vary', 'Origin');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Extract partner ID from route
    const { partnerId } = req.query;
    
    if (!partnerId || typeof partnerId !== 'string') {
      return res.status(400).json({ 
        error: 'Missing partner ID' 
      });
    }

    // Validate partner ID format
    if (!validatePartnerId(partnerId)) {
      return res.status(400).json({ 
        error: 'Invalid partner ID format' 
      });
    }

    // Check authorization
    if (!isAuthorized(req, partnerId)) {
      return res.status(401).json({ 
        error: 'Unauthorized' 
      });
    }

    switch (req.method) {
      case 'GET':
        // Get partner configuration
        const config = await getPartnerConfig(partnerId);
        
        if (!config) {
          return res.status(404).json({ 
            error: 'Partner configuration not found',
            partner_id: partnerId 
          });
        }

        // Check if partner is active
        if (config.metadata.status !== 'active') {
          return res.status(403).json({ 
            error: 'Partner account is not active',
            status: config.metadata.status 
          });
        }

        // Return sanitized config
        return res.status(200).json({
          success: true,
          data: sanitizeConfig(config),
          timestamp: new Date().toISOString()
        });

      case 'POST':
        // Create new partner configuration
        const existingConfig = await getPartnerConfig(partnerId);
        if (existingConfig) {
          return res.status(409).json({ 
            error: 'Partner configuration already exists' 
          });
        }

        const newConfig: PartnerConfig = {
          ...getDefaultConfig(partnerId),
          ...req.body,
          partner_id: partnerId, // Ensure ID matches route
          security: {
            ...getDefaultConfig(partnerId).security,
            webhook_hash: generateWebhookHash(),
            ...req.body.security
          }
        } as PartnerConfig;

        const created = await setPartnerConfig(newConfig);
        if (!created) {
          return res.status(500).json({ 
            error: 'Failed to create partner configuration' 
          });
        }

        return res.status(201).json({
          success: true,
          data: sanitizeConfig(newConfig),
          message: 'Partner configuration created successfully',
          timestamp: new Date().toISOString()
        });

      case 'PUT':
        // Update partner configuration
        const currentConfig = await getPartnerConfig(partnerId);
        if (!currentConfig) {
          return res.status(404).json({ 
            error: 'Partner configuration not found' 
          });
        }

        const updatedConfig: PartnerConfig = {
          ...currentConfig,
          ...req.body,
          partner_id: partnerId, // Ensure ID doesn't change
          metadata: {
            ...currentConfig.metadata,
            ...req.body.metadata,
            created_at: currentConfig.metadata.created_at, // Don't allow changing creation time
            updated_at: new Date().toISOString()
          }
        };

        const updated = await setPartnerConfig(updatedConfig);
        if (!updated) {
          return res.status(500).json({ 
            error: 'Failed to update partner configuration' 
          });
        }

        return res.status(200).json({
          success: true,
          data: sanitizeConfig(updatedConfig),
          message: 'Partner configuration updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'DELETE':
        // Deactivate partner (don't actually delete for audit trail)
        const configToDeactivate = await getPartnerConfig(partnerId);
        if (!configToDeactivate) {
          return res.status(404).json({ 
            error: 'Partner configuration not found' 
          });
        }

        configToDeactivate.metadata.status = 'suspended';
        configToDeactivate.metadata.updated_at = new Date().toISOString();

        const deactivated = await setPartnerConfig(configToDeactivate);
        if (!deactivated) {
          return res.status(500).json({ 
            error: 'Failed to deactivate partner configuration' 
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Partner configuration deactivated successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(405).json({ 
          error: 'Method not allowed' 
        });
    }

  } catch (error) {
    console.error('Partner config API error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}