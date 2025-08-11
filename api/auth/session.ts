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

// Get signing key from environment - with robust handling
const getSigningKey = () => {
  const rawKey = process.env.ELPORTAL_SIGNING_KEY
  if (!rawKey) {
    throw new Error('ELPORTAL_SIGNING_KEY environment variable is not set')
  }
  
  // CRITICAL: Trim any whitespace/newlines that might have been added during copy/paste
  const key = rawKey.trim()
  
  // Log key details for debugging (without exposing the actual key)
  console.log('Signing key details:', {
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
        console.log('Using base64 decoded key, decoded length:', decoded.length)
        return new Uint8Array(decoded)
      }
    } catch (e) {
      console.log('Base64 decode failed, will use as UTF-8')
    }
  }
  
  // Fallback: use as UTF-8 string
  console.log('Using key as UTF-8 string')
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