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

// Get signing key from environment - with robust handling (same as session.ts)
const getSigningKey = () => {
  const rawKey = process.env.ELPORTAL_SIGNING_KEY
  if (!rawKey) {
    throw new Error('ELPORTAL_SIGNING_KEY environment variable is not set')
  }
  
  // CRITICAL: Trim any whitespace/newlines that might have been added during copy/paste
  const key = rawKey.trim()
  
  // Log key details for debugging (without exposing the actual key)
  console.log('Callback signing key details:', {
    originalLength: rawKey.length,
    trimmedLength: key.length,
    firstChars: key.substring(0, 4) + '...',
    lastChars: '...' + key.substring(key.length - 4),
    looksLikeBase64: /^[A-Za-z0-9+/]+=*$/.test(key),
    nodeEnv: process.env.NODE_ENV
  })
  
  if (key.length < 32) {
    throw new Error(`Signing key too short: ${key.length} characters (need at least 32)`)
  }
  
  // Try to decode as base64 if it looks like base64
  // Base64 for 32 bytes = 44 chars, for 48 bytes = 64 chars
  if (key.length === 44 || key.length === 64 || /^[A-Za-z0-9+/]+=*$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64')
      if (decoded.length >= 32) {
        console.log('Callback using base64 decoded key, decoded length:', decoded.length)
        return new Uint8Array(decoded)
      }
    } catch (e) {
      console.log('Callback base64 decode failed, will use as UTF-8')
    }
  }
  
  // Fallback: use as UTF-8 string
  console.log('Callback using key as UTF-8 string')
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
    // Sort by timeStamp (when the authorization was created) to get the newest
    const sortedAuths = authorizations.sort((a: any, b: any) => {
      const dateA = new Date(a.timeStamp || a.validFrom).getTime()
      const dateB = new Date(b.timeStamp || b.validFrom).getTime()
      return dateB - dateA // Newest first
    })
    
    const recentAuth = sortedAuths[0]
    const customerId = recentAuth.customerCVR || recentAuth.id
    
    console.log('Callback processing:', {
      sessionId,
      mostRecentAuth: recentAuth.id,
      timeStamp: recentAuth.timeStamp,
      customerId
    })
    
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