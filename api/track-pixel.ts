import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// 1x1 transparent pixel (base64 encoded PNG)
const PIXEL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77OgAAAABJRU5ErkJggg==';

interface PixelTrackingData {
  click_id: string;
  event: string;
  value?: number;
  timestamp: number;
}

/**
 * Tracking pixel endpoint for partner conversion tracking
 * Usage: <img src="/api/track-pixel?click_id=dep_abc123&event=conversion&value=10000" width="1" height="1" />
 * 
 * This is a backup/redundant tracking method for partners who prefer pixels over webhooks
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set headers for a 1x1 transparent PNG image
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Length', Buffer.from(PIXEL_DATA, 'base64').length);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Extract parameters
    const { click_id, event = 'conversion', value } = req.query;
    
    // Validate click_id
    if (!click_id || typeof click_id !== 'string' || !click_id.startsWith('dep_')) {
      // Still return the pixel even if invalid (don't break partner page)
      return res.status(200).send(Buffer.from(PIXEL_DATA, 'base64'));
    }
    
    // Parse value if provided
    const numericValue = value ? parseFloat(String(value)) : undefined;
    
    // Create tracking data
    const trackingData: PixelTrackingData = {
      click_id: String(click_id),
      event: String(event),
      value: numericValue,
      timestamp: Date.now()
    };
    
    // Store pixel event (fire and forget - don't block pixel response)
    const pixelKey = `pixel:${click_id}:${event}:${Date.now()}`;
    kv.set(pixelKey, trackingData, { ex: 90 * 24 * 60 * 60 }) // 90 day TTL
      .catch(error => {
        console.error('Pixel tracking storage failed:', error);
        // Don't throw - pixel should always load
      });
    
    // For conversion events, also check if we should trigger webhook processing
    if (event === 'conversion') {
      // Check if we have the original click data
      const clickKey = `click:${click_id}`;
      kv.get(clickKey)
        .then(clickData => {
          if (clickData) {
            // Store as a conversion for dashboard
            const conversionKey = `conversion:pixel:${click_id}`;
            return kv.set(conversionKey, {
              ...trackingData,
              source: 'pixel',
              originalClick: clickData
            }, { ex: 90 * 24 * 60 * 60 });
          }
        })
        .catch(error => {
          console.error('Conversion processing failed:', error);
          // Don't throw - pixel should always load
        });
    }
    
    // Log in development with standardized format
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Pixel tracked:', {
        success: true,
        data: {
          click_id: String(click_id),
          event: String(event),
          value: numericValue
        },
        message: 'Pixel tracked successfully',
        timestamp: new Date().toISOString()
      });
    }
    
    // Always return the pixel
    return res.status(200).send(Buffer.from(PIXEL_DATA, 'base64'));
    
  } catch (error) {
    console.error('Pixel tracking error:', error);
    
    // Always return the pixel even if tracking fails
    // This ensures partner pages don't break
    return res.status(200).send(Buffer.from(PIXEL_DATA, 'base64'));
  }
}