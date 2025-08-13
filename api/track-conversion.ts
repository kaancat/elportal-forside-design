import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// Constants
const ATTRIBUTION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

interface ConversionData {
  click_id: string;
  conversion_time?: string;
  customer_id?: string;
  product_selected?: string;
  contract_value?: number;
  contract_length_months?: number;
}

interface StoredClickData {
  click_id: string;
  partner_id: string;
  timestamp: number;
  source?: any;
  metadata?: any;
}

/**
 * Verify webhook authentication
 */
function verifyWebhookAuth(req: VercelRequest): boolean {
  const secret = req.headers['x-webhook-secret'] as string;
  
  // In production, each partner would have their own secret
  // For now, we'll use a shared secret from env
  const expectedSecret = process.env.CONVERSION_WEBHOOK_SECRET || 'dev-secret';
  
  return secret === expectedSecret;
}

/**
 * Validate click and check attribution window
 */
async function validateClick(clickId: string): Promise<{
  valid: boolean;
  reason?: string;
  clickData?: StoredClickData;
}> {
  try {
    // Retrieve original click data
    const key = `click:${clickId}`;
    const clickData = await kv.get<StoredClickData>(key);
    
    if (!clickData) {
      return { 
        valid: false, 
        reason: 'Click ID not found' 
      };
    }
    
    // Check attribution window
    const clickTime = clickData.timestamp;
    const now = Date.now();
    const timeDiff = now - clickTime;
    
    if (timeDiff > ATTRIBUTION_WINDOW_MS) {
      return { 
        valid: false, 
        reason: 'Outside attribution window',
        clickData 
      };
    }
    
    return { 
      valid: true,
      clickData 
    };
    
  } catch (error) {
    console.error('Click validation error:', error);
    return { 
      valid: false, 
      reason: 'Validation error' 
    };
  }
}

/**
 * Check for duplicate conversions
 */
async function checkDuplicate(clickId: string): Promise<boolean> {
  const conversionKey = `conversion:${clickId}`;
  const exists = await kv.exists(conversionKey);
  return exists === 1;
}

/**
 * Store conversion data
 */
async function storeConversion(
  data: ConversionData,
  clickData: StoredClickData
): Promise<void> {
  const conversionKey = `conversion:${data.click_id}`;
  
  const conversionRecord = {
    ...data,
    partner_id: clickData.partner_id,
    click_timestamp: clickData.timestamp,
    conversion_timestamp: Date.now(),
    source: clickData.source,
    metadata: clickData.metadata,
    status: 'pending' // Will be 'verified' after manual review
  };
  
  // Store conversion (permanent record)
  await kv.set(conversionKey, conversionRecord);
  
  // Update daily conversion stats
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `conversions:daily:${today}:${clickData.partner_id}`;
  await kv.incr(dailyKey);
  
  // Update revenue if provided
  if (data.contract_value) {
    const revenueKey = `revenue:daily:${today}:${clickData.partner_id}`;
    await kv.incrbyfloat(revenueKey, data.contract_value);
  }
  
  // Add to conversion queue for processing
  const queueKey = `conversion_queue:${today}`;
  await kv.lpush(queueKey, JSON.stringify(conversionRecord));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for specific partners (in production, restrict to partner domains)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify authentication
    if (!verifyWebhookAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Parse request body
    const data: ConversionData = typeof req.body === 'string' 
      ? JSON.parse(req.body)
      : req.body;
    
    // Validate required fields
    if (!data.click_id) {
      return res.status(400).json({ 
        error: 'Missing required field: click_id'
      });
    }
    
    // Validate click_id format
    if (!data.click_id.startsWith('dep_')) {
      return res.status(400).json({ 
        error: 'Invalid click_id format'
      });
    }
    
    // Validate click and attribution window
    const validation = await validateClick(data.click_id);
    if (!validation.valid) {
      // Return 404 for invalid clicks (don't reveal why)
      return res.status(404).json({ 
        error: 'Click not found or expired',
        reason: process.env.NODE_ENV === 'development' ? validation.reason : undefined
      });
    }
    
    // Check for duplicate conversion
    const isDuplicate = await checkDuplicate(data.click_id);
    if (isDuplicate) {
      return res.status(409).json({ 
        error: 'Conversion already tracked',
        click_id: data.click_id
      });
    }
    
    // Store conversion
    await storeConversion(data, validation.clickData!);
    
    // Log significant conversions
    if (data.contract_value && data.contract_value > 0) {
      console.log('💰 Conversion tracked:', {
        click_id: data.click_id,
        partner: validation.clickData!.partner_id,
        value: data.contract_value,
        product: data.product_selected
      });
    }
    
    // Return success
    return res.status(200).json({ 
      success: true,
      message: 'Conversion tracked successfully',
      click_id: data.click_id
    });
    
  } catch (error) {
    console.error('Conversion tracking error:', error);
    
    // Don't expose internal errors
    return res.status(500).json({ 
      error: 'Failed to track conversion'
    });
  }
}