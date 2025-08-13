import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Improved admin authentication with session tokens
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { credentials } = req.body;
    const adminSecret = process.env.ADMIN_SECRET;

    // Debug logging
    console.log('Auth attempt:', {
      hasCredentials: !!credentials,
      hasAdminSecret: !!adminSecret,
      adminSecretPreview: adminSecret ? adminSecret.substring(0, 3) + '***' : 'not set'
    });

    if (!adminSecret) {
      console.error('ADMIN_SECRET not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error - missing ADMIN_SECRET'
      });
    }

    if (!credentials) {
      return res.status(400).json({ 
        success: false,
        error: 'Credentials required'
      });
    }

    if (credentials === adminSecret) {
      // Generate session token
      const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Store session in KV with 24 hour expiry
      await kv.set(`admin_session:${sessionToken}`, {
        authenticated: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }, {
        ex: 24 * 60 * 60 // 24 hours
      });

      return res.status(200).json({ 
        success: true,
        sessionToken,
        message: 'Authentication successful'
      });
    } else {
      // Add delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed'
    });
  }
}