import { VercelRequest, VercelResponse } from '@vercel/node'
import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { parse, serialize } from 'cookie'
import { kv } from '@vercel/kv'

// Session configuration
const SESSION_COOKIE_NAME = 'elportal_session'
const SESSION_TTL = 24 * 60 * 60 // 24 hours in seconds
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: SESSION_TTL
}

// Get signing key from environment
const getSigningKey = () => {
  // Use environment variable for signing key
  const key = process.env.ELPORTAL_SIGNING_KEY
  if (!key || key.length < 32) {
    console.error('Signing key issue:', {
      hasKey: !!key,
      length: key?.length || 0,
      nodeEnv: process.env.NODE_ENV
    })
    throw new Error('Signing key must be at least 32 characters. Please set ELPORTAL_SIGNING_KEY in environment variables.')
  }
  return new TextEncoder().encode(key)
}

// Generate a new session
async function createSession(): Promise<{ sessionId: string; token: string }> {
  const sessionId = nanoid(32)
  const signingKey = getSigningKey()
  
  const token = await new SignJWT({ 
    sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (SESSION_TTL * 1000)
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(signingKey)
  
  return { sessionId, token }
}

// Verify and decode a session token
async function verifySession(token: string): Promise<{ sessionId: string } | null> {
  try {
    const signingKey = getSigningKey()
    const { payload } = await jwtVerify(token, signingKey)
    
    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      return null
    }
    
    // Check if session hasn't expired
    if (payload.expiresAt && typeof payload.expiresAt === 'number') {
      if (Date.now() > payload.expiresAt) {
        return null
      }
    }
    
    return { sessionId: payload.sessionId }
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

// Get session from request cookies
export async function getSessionFromRequest(req: VercelRequest): Promise<{ sessionId: string } | null> {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[SESSION_COOKIE_NAME]
  
  if (!token) {
    return null
  }
  
  return verifySession(token)
}

// Handle session initialization
async function handleInit(req: VercelRequest, res: VercelResponse) {
  try {
    // Create new session
    const { sessionId, token } = await createSession()
    
    // Store session metadata in KV
    await kv.set(
      `session:${sessionId}`,
      {
        createdAt: Date.now(),
        expiresAt: Date.now() + (SESSION_TTL * 1000),
        status: 'pending_authorization'
      },
      { ex: SESSION_TTL }
    )
    
    // Set session cookie
    res.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)
    )
    
    // Return session ID for use in authorization URL
    return res.status(200).json({
      sessionId,
      expiresIn: SESSION_TTL,
      status: 'created'
    })
  } catch (error) {
    console.error('Failed to create session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
    // Check if it's a signing key error
    if (errorMessage.includes('ELPORTAL_SIGNING_KEY')) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Server signing key not configured. Please contact support.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      })
    }
    return res.status(500).json({ 
      error: 'Failed to create session',
      message: errorMessage 
    })
  }
}

// Handle session verification
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSessionFromRequest(req)
    
    if (!session) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'No valid session found'
      })
    }
    
    // Check session data in KV
    const sessionData = await kv.get(`session:${session.sessionId}`)
    
    if (!sessionData) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'Session expired or not found'
      })
    }
    
    // Check if session has associated customer
    const customerId = await kv.get(`session:${session.sessionId}:customer`)
    
    return res.status(200).json({
      authenticated: true,
      sessionId: session.sessionId,
      hasAuthorization: !!customerId,
      customerId: customerId || null
    })
  } catch (error) {
    console.error('Session verification failed:', error)
    return res.status(500).json({ error: 'Failed to verify session' })
  }
}

// Handle session logout
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSessionFromRequest(req)
    
    if (session) {
      // Clear session data from KV
      await kv.del(`session:${session.sessionId}`)
      await kv.del(`session:${session.sessionId}:customer`)
      
      // If there's a customer linked, clear the reverse mapping
      const customerId = await kv.get(`session:${session.sessionId}:customer`)
      if (customerId) {
        await kv.del(`customer:${customerId}:session`)
      }
    }
    
    // Clear session cookie
    res.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, '', {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 0
      })
    )
    
    return res.status(200).json({ 
      status: 'logged_out',
      message: 'Session cleared successfully'
    })
  } catch (error) {
    console.error('Logout failed:', error)
    return res.status(500).json({ error: 'Failed to logout' })
  }
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Route based on method and action
  const { action } = req.query
  
  if (req.method === 'POST' && (action === 'init' || !action)) {
    return handleInit(req, res)
  }
  
  if (req.method === 'GET' && action === 'verify') {
    return handleVerify(req, res)
  }
  
  if ((req.method === 'DELETE' || req.method === 'POST') && action === 'logout') {
    return handleLogout(req, res)
  }
  
  return res.status(405).json({ 
    error: 'Method not allowed',
    allowedMethods: ['POST /api/auth/session/init', 'GET /api/auth/session/verify', 'DELETE /api/auth/session/logout']
  })
}