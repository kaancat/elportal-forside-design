import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple admin authentication endpoint
 * Uses environment variable for access control
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { credentials } = req.body;

    // Check against environment variable (fallback for testing)
    const adminSecret = process.env.ADMIN_SECRET || 'test123';

    if (credentials === adminSecret) {
      return res.status(200).json({ 
        success: true,
        message: 'Authentication successful'
      });
    } else {
      // Add small delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed'
    });
  }
}