import { VercelRequest, VercelResponse } from '@vercel/node'

// Eloverblik API base URL
const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk/thirdpartyapi'

/**
 * Exchange a user's refresh token for a 24-hour access token
 * 
 * SECURITY: 
 * - We never store refresh tokens
 * - Access tokens are session-based only
 * - User must provide their own token from eloverblik.dk
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Add CORS headers for security
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')

  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        instructions: 'Get your refresh token from eloverblik.dk → Min profil → Datadeling'
      })
    }

    console.log('Exchanging refresh token for access token...')

    // Exchange refresh token for access token
    const response = await fetch(`${ELOVERBLIK_API_BASE}/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', response.status, errorText)
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid or expired refresh token',
          instructions: 'Please generate a new token from eloverblik.dk → Min profil → Datadeling' 
        })
      }

      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Maximum 2 token requests per minute. Please wait before trying again.'
        })
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to get access token',
        details: errorText
      })
    }

    const data = await response.json()
    
    // Return access token (valid for 24 hours)
    // Client should cache this in memory only
    return res.status(200).json({
      success: true,
      result: data.result, // Contains the access token
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      warning: 'Store this token in memory only. Never persist to localStorage or cookies.'
    })
  } catch (error) {
    console.error('Eloverblik token error:', error)
    return res.status(500).json({ 
      error: 'Failed to get access token',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}