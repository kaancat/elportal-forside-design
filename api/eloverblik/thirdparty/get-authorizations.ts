import { VercelRequest, VercelResponse } from '@vercel/node'

const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk/thirdpartyapi'

/**
 * Get all active customer authorizations (fuldmagter)
 * This shows which customers have granted ElPortal access to their data
 * 
 * As a registered third party, you first need to:
 * 1. Generate a refresh token at https://eloverblik.dk/thirdparty/login
 * 2. Store it securely (we use environment variables)
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get third-party refresh token from environment
    const refreshToken = process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
    
    if (!refreshToken) {
      return res.status(500).json({ 
        error: 'Third-party refresh token not configured',
        instructions: 'Add ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN to Vercel environment variables'
      })
    }

    // Step 1: Get access token using refresh token
    const tokenResponse = await fetch(`${ELOVERBLIK_API_BASE}/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Accept': 'application/json'
      }
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorText)
      
      if (tokenResponse.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid third-party refresh token',
          instructions: 'Generate a new token at https://eloverblik.dk/thirdparty/login'
        })
      }
      
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to get access token',
        details: errorText
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.result

    // Step 2: Get all active authorizations
    const authResponse = await fetch(
      `${ELOVERBLIK_API_BASE}/api/authorization/authorization`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-User-Correlation-ID': crypto.randomUUID() // For tracking
        }
      }
    )

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('Authorization fetch failed:', authResponse.status, errorText)
      
      if (authResponse.status === 404) {
        return res.status(200).json({ 
          success: true,
          authorizations: [],
          message: 'No active customer authorizations found'
        })
      }
      
      return res.status(authResponse.status).json({ 
        error: 'Failed to fetch authorizations',
        details: errorText
      })
    }

    const authData = await authResponse.json()
    
    // Return list of authorized customers
    return res.status(200).json({
      success: true,
      authorizations: authData.result || [],
      count: (authData.result || []).length,
      message: 'Active customer authorizations retrieved'
    })
  } catch (error) {
    console.error('Third-party authorization error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch authorizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}