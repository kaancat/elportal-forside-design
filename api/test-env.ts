import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow in development or with a secret query parameter
  if (process.env.NODE_ENV === 'production' && req.query.secret !== 'debug-env-2025') {
    return res.status(404).json({ error: 'Not found' })
  }
  
  return res.status(200).json({
    nodeEnv: process.env.NODE_ENV,
    hasSigningKey: !!process.env.ELPORTAL_SIGNING_KEY,
    signingKeyLength: process.env.ELPORTAL_SIGNING_KEY?.length || 0,
    hasEloverblikToken: !!process.env.ELOVERBLIK_API_TOKEN,
    hasThirdPartyToken: !!process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN,
    // Show first 4 chars of signing key to verify it's being read
    signingKeyPreview: process.env.ELPORTAL_SIGNING_KEY ? 
      process.env.ELPORTAL_SIGNING_KEY.substring(0, 4) + '...' : 
      'NOT SET'
  })
}