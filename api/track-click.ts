import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// Constants
const CLICK_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 clicks per minute per IP

interface ClickData {
  click_id: string;
  partner_id: string;
  timestamp: number;
  source?: {
    page?: string;
    component?: string;
    variant?: string;
  };
  metadata?: {
    consumption?: number;
    region?: string;
  };
}

/**
 * Simple rate limiting using KV
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:clicks:${ip}`;
  
  try {
    const count = await kv.incr(key);
    
    if (count === 1) {
      // First request, set expiry
      await kv.expire(key, RATE_LIMIT_WINDOW);
    }
    
    return count <= RATE_LIMIT_MAX_REQUESTS;
  } catch (error) {
    // If rate limiting fails, allow the request
    console.error('Rate limit check failed:', error);
    return true;
  }
}

/**
 * Store click data in KV
 */
async function storeClick(data: ClickData): Promise<void> {
  const key = `click:${data.click_id}`;
  
  // Store click data with TTL
  await kv.set(key, data, {
    ex: CLICK_TTL_SECONDS
  });
  
  // Also add to daily aggregates for dashboard
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `clicks:daily:${today}:${data.partner_id}`;
  await kv.incr(dailyKey);
  await kv.expire(dailyKey, 30 * 24 * 60 * 60); // Keep daily stats for 30 days
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for client-side tracking
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get client IP for rate limiting
    const ip = req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] || 
                req.socket?.remoteAddress || 
                'unknown';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    
    // Check rate limit
    const withinLimit = await checkRateLimit(clientIp);
    if (!withinLimit) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    // Parse request body
    const data: ClickData = typeof req.body === 'string' 
      ? JSON.parse(req.body)
      : req.body;
    
    // Validate required fields
    if (!data.click_id || !data.partner_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['click_id', 'partner_id']
      });
    }
    
    // Validate click_id format
    if (!data.click_id.startsWith('dep_')) {
      return res.status(400).json({ 
        error: 'Invalid click_id format'
      });
    }
    
    // Add server timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    
    // Store in KV
    await storeClick(data);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Click tracked:', {
        click_id: data.click_id,
        partner: data.partner_id,
        source: data.source
      });
    }
    
    // Return success with standardized format
    return res.status(200).json({ 
      success: true,
      data: {
        click_id: data.click_id
      },
      message: 'Click tracked successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Click tracking error:', error);
    
    // Don't expose internal errors
    return res.status(500).json({ 
      error: 'Failed to track click'
    });
  }
}