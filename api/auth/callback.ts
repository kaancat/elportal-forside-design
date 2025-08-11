import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'
import { serialize } from 'cookie'
import { SignJWT } from 'jose'

// Configuration
const SESSION_COOKIE_NAME = 'elportal_session'
const SESSION_TTL = 24 * 60 * 60
const REDIRECT_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.dinelportal.dk'
  : 'http://localhost:3000'

// Get signing key from environment
const getSigningKey = () => {
  const key = process.env.ELPORTAL_SIGNING_KEY
  if (!key || key.length < 32) {
    throw new Error('Signing key not configured')
  }
  return new TextEncoder().encode(key)
}

async function fetchAuthorizations() {
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
  
  if (!refreshToken) {
    throw new Error('Eloverblik refresh token not configured')
  }
  
  // Get access token
  const tokenResponse = await fetch('https://api.eloverblik.dk/thirdpartyapi/api/token', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-version': '1.0',
    },
  })
  
  if (!tokenResponse.ok) {
    throw new Error(`Token refresh failed: ${tokenResponse.status}`)
  }
  
  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.result || tokenData.access_token || tokenData.token
  
  if (!accessToken) {
    throw new Error('No access token received')
  }
  
  // Get authorizations
  const authResponse = await fetch('https://api.eloverblik.dk/thirdpartyapi/api/authorization/authorizations', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-version': '1.0',
    },
  })
  
  if (!authResponse.ok) {
    throw new Error(`Failed to fetch authorizations: ${authResponse.status}`)
  }
  
  const authData = await authResponse.json()
  return authData.result || []
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { state } = req.query
  
  if (!state || typeof state !== 'string') {
    // No state token - redirect to error page
    return res.redirect(302, `${REDIRECT_BASE_URL}/forbrug-tracker?error=missing_state`)
  }
  
  try {
    // Validate state token
    const stateData = await kv.get(`state:${state}`)
    
    if (!stateData || typeof stateData !== 'object') {
      return res.redirect(302, `${REDIRECT_BASE_URL}/forbrug-tracker?error=invalid_state`)
    }
    
    const { sessionId } = stateData as { sessionId: string }
    
    if (!sessionId) {
      return res.redirect(302, `${REDIRECT_BASE_URL}/forbrug-tracker?error=no_session`)
    }
    
    // Clear used state token
    await kv.del(`state:${state}`)
    
    // Fetch current authorizations from Eloverblik
    const authorizations = await fetchAuthorizations()
    
    if (!authorizations || authorizations.length === 0) {
      return res.redirect(302, `${REDIRECT_BASE_URL}/forbrug-tracker?error=no_authorizations`)
    }
    
    // Get the most recent authorization (user just authorized)
    // Sort by validFrom date to get the newest
    const sortedAuths = authorizations.sort((a: any, b: any) => {
      const dateA = new Date(a.validFrom).getTime()
      const dateB = new Date(b.validFrom).getTime()
      return dateB - dateA // Newest first
    })
    
    const recentAuth = sortedAuths[0]
    const customerId = recentAuth.customerCVR || recentAuth.id
    
    // Link session to customer
    await kv.set(
      `session:${sessionId}:customer`,
      customerId,
      { ex: SESSION_TTL }
    )
    
    // Store customer to session mapping
    await kv.set(
      `customer:${customerId}:session`,
      sessionId,
      { ex: SESSION_TTL }
    )
    
    // Update session status
    await kv.set(
      `session:${sessionId}`,
      {
        status: 'authorized',
        customerId,
        customerName: recentAuth.customerName,
        authorizedAt: Date.now(),
        expiresAt: Date.now() + (SESSION_TTL * 1000)
      },
      { ex: SESSION_TTL }
    )
    
    // Create new session token with customer info
    const signingKey = getSigningKey()
    const token = await new SignJWT({ 
      sessionId,
      customerId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (SESSION_TTL * 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(signingKey)
    
    // Set updated session cookie
    const cookieHeader = serialize(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_TTL
    })
    
    // Create HTML response that sets cookie and redirects
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Godkendelse modtaget</title>
        <script>
          // Store session info in sessionStorage for immediate use
          sessionStorage.setItem('elportal_auth_complete', JSON.stringify({
            customerId: '${customerId}',
            timestamp: ${Date.now()}
          }));
          // Redirect to forbrug-tracker
          window.location.href = '${REDIRECT_BASE_URL}/forbrug-tracker?authorized=true&customer=${customerId}';
        </script>
      </head>
      <body>
        <p>Godkendelse modtaget. Omdirigerer...</p>
      </body>
      </html>
    `
    
    res.setHeader('Set-Cookie', cookieHeader)
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
    
  } catch (error) {
    console.error('Callback processing failed:', error)
    return res.redirect(302, `${REDIRECT_BASE_URL}/forbrug-tracker?error=callback_failed`)
  }
}