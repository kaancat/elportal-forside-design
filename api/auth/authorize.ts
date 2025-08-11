import { VercelRequest, VercelResponse } from '@vercel/node'
import { nanoid } from 'nanoid'
import { kv } from '@vercel/kv'
import { getSessionFromRequest } from './session'

// Eloverblik configuration
const ELOVERBLIK_AUTH_URL = 'https://eloverblik.dk/power-of-attorney'
const THIRD_PARTY_ID = '945ac027-559a-4923-a670-66bfda8d27c6'
const CALLBACK_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.dinelportal.dk'
  : 'http://localhost:3000'

// State token TTL (10 minutes - enough time for user to complete MitID)
const STATE_TTL = 10 * 60

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // Get current session
    let session
    try {
      session = await getSessionFromRequest(req)
    } catch (sessionError) {
      console.error('Session retrieval error in authorize:', sessionError)
      return res.status(500).json({ 
        error: 'Session verification failed',
        message: 'Could not verify session. Please try again.',
        details: sessionError instanceof Error ? sessionError.message : 'Unknown error'
      })
    }
    
    if (!session) {
      return res.status(401).json({ 
        error: 'No session found',
        message: 'Please initialize a session first'
      })
    }
    
    // Generate state token for CSRF protection
    const stateToken = nanoid(32)
    
    // Store state token with session mapping
    await kv.set(
      `state:${stateToken}`,
      {
        sessionId: session.sessionId,
        createdAt: Date.now(),
        type: 'eloverblik_authorization'
      },
      { ex: STATE_TTL }
    )
    
    // Update session status
    await kv.set(
      `session:${session.sessionId}`,
      {
        status: 'authorizing',
        stateToken,
        authStartedAt: Date.now()
      },
      { ex: 24 * 60 * 60 }
    )
    
    // Build callback URL with state token
    const callbackUrl = `${CALLBACK_BASE_URL}/api/auth/callback?state=${stateToken}`
    
    // Build Eloverblik authorization URL
    const authParams = new URLSearchParams({
      thirdPartyId: THIRD_PARTY_ID,
      fromDate: '2021-08-08',
      toDate: '2028-08-08',
      returnUrl: callbackUrl
    })
    
    const authorizationUrl = `${ELOVERBLIK_AUTH_URL}?${authParams.toString()}`
    
    return res.status(200).json({
      authorizationUrl,
      stateToken,
      sessionId: session.sessionId,
      message: 'Redirect user to authorization URL'
    })
  } catch (error) {
    console.error('Authorization initialization failed:', error)
    return res.status(500).json({ 
      error: 'Failed to initialize authorization',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}