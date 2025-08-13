import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// Test partner configuration
const TEST_PARTNER_CONFIG = {
  partner_id: 'test-partner',
  partner_name: 'Test Partner (Demo)',
  domain_whitelist: ['*'], // Accept ALL domains for testing purposes
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
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  try {
    if (req.method === 'POST') {
      // Create test partner
      const key = `partner_config:test-partner`;
      await kv.set(key, TEST_PARTNER_CONFIG);
      
      // Also store in partner index
      const indexKey = `partner_index:test-partner`;
      await kv.set(indexKey, {
        partner_id: TEST_PARTNER_CONFIG.partner_id,
        partner_name: TEST_PARTNER_CONFIG.partner_name,
        status: TEST_PARTNER_CONFIG.metadata.status,
        tier: TEST_PARTNER_CONFIG.metadata.tier,
        created_at: TEST_PARTNER_CONFIG.metadata.created_at,
        updated_at: TEST_PARTNER_CONFIG.metadata.updated_at
      });
      
      return res.status(201).json({
        success: true,
        message: 'Test partner created successfully',
        partner_id: 'test-partner',
        usage: 'Use partner_id="test-partner" in your integration'
      });
    }
    
    if (req.method === 'GET') {
      // Check if test partner exists
      const key = `partner_config:test-partner`;
      const config = await kv.get(key);
      
      if (config) {
        return res.status(200).json({
          exists: true,
          partner_id: 'test-partner',
          message: 'Test partner already exists'
        });
      } else {
        return res.status(200).json({
          exists: false,
          message: 'Test partner not found. POST to this endpoint to create it.'
        });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error managing test partner:', error);
    return res.status(500).json({ 
      error: 'Failed to manage test partner',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}