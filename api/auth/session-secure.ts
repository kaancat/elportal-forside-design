import { VercelRequest, VercelResponse } from '@vercel/node'
import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { parse, serialize } from 'cookie'
import { kv } from '@vercel/kv'
import {
  checkRateLimit,
  generateSessionFingerprint,
  validateSessionSecurity,
  logSecurityEvent,
  addSecurityHeaders,
  trackAuthorizationAttempt,
  checkConcurrentSessions
} from './security-enhancements'

// ============================================================================
// SECURE SESSION MANAGEMENT WITH MULTI-USER HOUSEHOLD SUPPORT
// ============================================================================
// This is the production-ready session handler with all security enhancements
// for handling multiple users in the same household securely.
// ============================================================================

// Session configuration
const SESSION_COOKIE_NAME = 'elportal_session'
const SESSION_TTL = 4 * 60 * 60 // 4 hours (reduced from 24 for security)
const SESSION_IDLE_TIMEOUT = 30 * 60 // 30 minutes idle timeout
const MAX_SESSIONS_PER_IP = 5 // Max concurrent sessions from same IP

// Cookie configuration for maximum security
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,          // Not accessible via JavaScript
  secure: true,            // HTTPS only
  sameSite: 'lax' as const,// CSRF protection while allowing redirects
  path: '/',               // Available site-wide
  maxAge: SESSION_TTL,     // Expires after TTL
  domain: process.env.NODE_ENV === 'production' ? '.dinelportal.dk' : undefined
}

// Get signing key with validation
const getSigningKey = () => {
  const rawKey = process.env.ELPORTAL_SIGNING_KEY
  if (!rawKey) {
    throw new Error('ELPORTAL_SIGNING_KEY not configured')
  }
  
  const key = rawKey.trim()
  
  if (key.length < 32) {
    throw new Error('Signing key too short - security requirement not met')
  }
  
  // Try base64 decode
  if (/^[A-Za-z0-9+/]+=*$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64')
      if (decoded.length >= 32) {
        return new Uint8Array(decoded)
      }
    } catch (e) {
      // Fall through to UTF-8
    }
  }
  
  return new TextEncoder().encode(key)
}

// Generate secure session with device binding
async function createSecureSession(req: VercelRequest): Promise<{
  sessionId: string
  token: string
  fingerprint: string
}> {
  const sessionId = nanoid(32)
  const signingKey = getSigningKey()
  const fingerprint = generateSessionFingerprint(req)
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown'
  
  // Create JWT with additional security claims
  const token = await new SignJWT({
    sessionId,
    fingerprint, // Bind to device
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + SESSION_TTL * 1000) / 1000),
    iss: 'dinelportal.dk',
    aud: 'eloverblik-integration',
    jti: nanoid(16), // Unique token ID for revocation
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(signingKey)
  
  // Store comprehensive session data
  await kv.set(
    `session:${sessionId}`,
    {
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (SESSION_TTL * 1000),
      fingerprint,
      clientIP,
      status: 'pending_authorization',
      userAgent: req.headers['user-agent'],
      jti: sessionId
    },
    { ex: SESSION_TTL }
  )
  
  // Store fingerprint separately for quick validation
  await kv.set(
    `session:${sessionId}:fingerprint`,
    fingerprint,
    { ex: SESSION_TTL }
  )
  
  // Track session count per IP
  const ipSessions = await kv.get<string[]>(`ip:${clientIP}:sessions`) || []
  ipSessions.push(sessionId)
  await kv.set(
    `ip:${clientIP}:sessions`,
    ipSessions.slice(-MAX_SESSIONS_PER_IP), // Keep only recent sessions
    { ex: SESSION_TTL }
  )
  
  await logSecurityEvent('session_created', {
    sessionId,
    clientIP,
    fingerprint: fingerprint.substring(0, 8) + '...'
  })
  
  return { sessionId, token, fingerprint }
}

// Verify session with all security checks
async function verifySecureSession(
  token: string,
  req: VercelRequest
): Promise<{ sessionId: string; customerId?: string } | null> {
  try {
    const signingKey = getSigningKey()
    const { payload } = await jwtVerify(token, signingKey, {
      issuer: 'dinelportal.dk',
      audience: 'eloverblik-integration'
    })
    
    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      await logSecurityEvent('invalid_session_token', { reason: 'missing sessionId' })
      return null
    }
    
    const sessionId = payload.sessionId
    
    // Perform comprehensive security validation
    const validation = await validateSessionSecurity(req, sessionId)
    
    if (!validation.valid) {
      await logSecurityEvent('session_validation_failed', {
        sessionId,
        reason: validation.reason
      })
      
      if (validation.shouldInvalidate) {
        await invalidateSession(sessionId)
      }
      
      return null
    }
    
    // Update last activity for idle timeout
    const sessionData = await kv.get(`session:${sessionId}`) as any
    if (sessionData) {
      const idleTime = Date.now() - sessionData.lastActivity
      
      if (idleTime > SESSION_IDLE_TIMEOUT * 1000) {
        await logSecurityEvent('session_idle_timeout', { sessionId, idleTime })
        await invalidateSession(sessionId)
        return null
      }
      
      // Update activity timestamp
      sessionData.lastActivity = Date.now()
      await kv.set(`session:${sessionId}`, sessionData, { ex: SESSION_TTL })
    }
    
    // Get associated customer if authorized
    const customerId = await kv.get(`session:${sessionId}:customer`)
    
    return { 
      sessionId, 
      customerId: customerId ? String(customerId) : undefined 
    }
  } catch (error) {
    console.error('Session verification error:', error)
    await logSecurityEvent('session_verification_error', { 
      error: error instanceof Error ? error.message : 'unknown' 
    })
    return null
  }
}

// Invalidate session and clean up all data
async function invalidateSession(sessionId: string): Promise<void> {
  // Get session data before deletion
  const sessionData = await kv.get(`session:${sessionId}`) as any
  const customerId = await kv.get(`session:${sessionId}:customer`)
  
  // Delete all session-related keys
  await kv.del(`session:${sessionId}`)
  await kv.del(`session:${sessionId}:customer`)
  await kv.del(`session:${sessionId}:fingerprint`)
  await kv.del(`session:${sessionId}:ips`)
  
  // Clean up customer mapping
  if (customerId) {
    const activeSession = await kv.get(`customer:${customerId}:active_session`)
    if (activeSession === sessionId) {
      await kv.del(`customer:${customerId}:active_session`)
    }
    await kv.del(`customer:${customerId}:session`)
  }
  
  // Remove from IP sessions
  if (sessionData?.clientIP) {
    const ipSessions = await kv.get<string[]>(`ip:${sessionData.clientIP}:sessions`) || []
    const filtered = ipSessions.filter(s => s !== sessionId)
    await kv.set(`ip:${sessionData.clientIP}:sessions`, filtered, { ex: SESSION_TTL })
  }
  
  await logSecurityEvent('session_invalidated', { sessionId, customerId })
}

// Handle session initialization with rate limiting
async function handleInit(req: VercelRequest, res: VercelResponse) {
  try {
    const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown'
    
    // Rate limiting
    const rateLimitCheck = await checkRateLimit(clientIP, 'session_init')
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: rateLimitCheck.retryAfter
      })
    }
    
    // Check maximum sessions per IP
    const ipSessions = await kv.get<string[]>(`ip:${clientIP}:sessions`) || []
    const activeSessions: string[] = []
    
    // Validate existing sessions
    for (const sid of ipSessions) {
      const sessionData = await kv.get(`session:${sid}`)
      if (sessionData) {
        activeSessions.push(sid)
      }
    }
    
    if (activeSessions.length >= MAX_SESSIONS_PER_IP) {
      await logSecurityEvent('max_sessions_per_ip', { 
        clientIP, 
        sessionCount: activeSessions.length 
      })
      
      return res.status(403).json({
        error: 'Maximum sessions reached',
        message: 'Too many active sessions from this location. Please logout from other sessions.'
      })
    }
    
    // Create new secure session
    const { sessionId, token, fingerprint } = await createSecureSession(req)
    
    // Set secure cookie
    res.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS)
    )
    
    return res.status(200).json({
      sessionId,
      expiresIn: SESSION_TTL,
      status: 'created',
      // Don't expose fingerprint to client
    })
  } catch (error) {
    console.error('Session creation failed:', error)
    await logSecurityEvent('session_creation_failed', {
      error: error instanceof Error ? error.message : 'unknown'
    })
    
    return res.status(500).json({
      error: 'Failed to create session',
      message: 'Please try again later'
    })
  }
}

// Handle session verification with security checks
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  try {
    const cookies = parse(req.headers.cookie || '')
    const token = cookies[SESSION_COOKIE_NAME]
    
    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: 'No session found'
      })
    }
    
    const session = await verifySecureSession(token, req)
    
    if (!session) {
      // Clear invalid cookie
      res.setHeader(
        'Set-Cookie',
        serialize(SESSION_COOKIE_NAME, '', {
          ...SESSION_COOKIE_OPTIONS,
          maxAge: 0
        })
      )
      
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid or expired session'
      })
    }
    
    return res.status(200).json({
      authenticated: true,
      sessionId: session.sessionId,
      hasAuthorization: !!session.customerId,
      // Don't expose actual customerId for security
    })
  } catch (error) {
    console.error('Session verification failed:', error)
    return res.status(500).json({
      error: 'Verification failed'
    })
  }
}

// Handle logout with complete cleanup
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  try {
    const cookies = parse(req.headers.cookie || '')
    const token = cookies[SESSION_COOKIE_NAME]
    
    if (token) {
      const session = await verifySecureSession(token, req)
      if (session) {
        await invalidateSession(session.sessionId)
      }
    }
    
    // Clear cookie
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
    // Still clear the cookie even if backend fails
    res.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, '', {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 0
      })
    )
    
    return res.status(200).json({
      status: 'logged_out',
      message: 'Session cleared'
    })
  }
}

// Main handler with security middleware
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add security headers
  addSecurityHeaders(res)
  
  // CORS with strict origin checking
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://www.dinelportal.dk', 'https://dinelportal.dk']
    : ['http://localhost:3000']
  
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Route to appropriate handler
  const { action } = req.query
  
  try {
    if (req.method === 'POST' && (action === 'init' || !action)) {
      return await handleInit(req, res)
    }
    
    if (req.method === 'GET' && action === 'verify') {
      return await handleVerify(req, res)
    }
    
    if ((req.method === 'DELETE' || req.method === 'POST') && action === 'logout') {
      return await handleLogout(req, res)
    }
    
    return res.status(405).json({
      error: 'Method not allowed'
    })
  } catch (error) {
    console.error('Handler error:', error)
    await logSecurityEvent('handler_error', {
      method: req.method,
      action,
      error: error instanceof Error ? error.message : 'unknown'
    })
    
    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}

// Export for use in other handlers
export { verifySecureSession, invalidateSession }