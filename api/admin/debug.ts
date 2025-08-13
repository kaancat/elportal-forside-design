import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Debug endpoint to check environment variables
 * Access: /api/admin/debug
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    const conversionSecret = process.env.CONVERSION_WEBHOOK_SECRET;
    
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      adminSecretExists: !!adminSecret,
      adminSecretLength: adminSecret ? adminSecret.length : 0,
      adminSecretPreview: adminSecret ? adminSecret.substring(0, 3) + '***' : 'not set',
      conversionSecretExists: !!conversionSecret,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('ADMIN') || 
        key.includes('CONVERSION') || 
        key.includes('VITE_')
      )
    };
    
    return res.status(200).json(debug);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug failed',
      message: String(error)
    });
  }
}