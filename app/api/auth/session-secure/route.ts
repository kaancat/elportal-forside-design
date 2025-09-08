/**
 * Secure Session API Route - Next.js App Router
 * Production-ready session handler with enhanced security for multi-user households
 */

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { kv } from '@vercel/kv'
import {
  getCookieFromRequest,
  setCookieOnResponse,
  deleteCookieOnResponse
} from '@/server/cookie-helpers'
import { corsPrivate } from '@/server/api-helpers'
import { getClientIP, checkRateLimit, RateLimits } from '@/server/rate-limit-helpers'
import crypto from 'crypto'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 5
export const dynamic = 'force-dynamic'

// Session configuration
const SESSION_COOKIE_NAME = 'elportal_session'
const SESSION_TTL = 4 * 60 * 60 // 4 hours (reduced from 24 for security)
const SESSION_IDLE_TIMEOUT = 30 * 60 // 30 minutes idle timeout
const MAX_SESSIONS_PER_IP = 5 // Max concurrent sessions from same IP

// Generate device fingerprint for session binding
function generateSessionFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'unknown',
    request.headers.get('accept-encoding') || 'unknown',
    getClientIP(request)
  ]
  
  const hash = crypto.createHash('sha256')
  hash.update(components.join('|'))
  return hash.digest('hex').substring(0, 16)
}

// Get signing key with validation
function getSigningKey(): Uint8Array {
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

// Check concurrent sessions from same IP
async function checkConcurrentSessions(clientIP: string): Promise<boolean> {
  const sessionsKey = `ip-sessions:${clientIP}`
  const sessions = await kv.get<string[]>(sessionsKey) || []
  
  // Clean expired sessions
  const activeSessions: string[] = []
  for (const sessionId of sessions) {
    const sessionData = await kv.get(`session:${sessionId}`)
    if (sessionData) {
      activeSessions.push(sessionId)
    }
  }
  
  // Update active sessions list
  if (activeSessions.length !== sessions.length) {
    await kv.set(sessionsKey, activeSessions, { ex: SESSION_TTL })
  }
  
  return activeSessions.length < MAX_SESSIONS_PER_IP
}

// Log security events
async function logSecurityEvent(event: {
  type: string
  sessionId?: string
  clientIP: string
  details?: any
}) {
  const eventId = nanoid(16)
  const timestamp = Date.now()
  
  // Store in KV with short TTL for analysis
  await kv.set(
    `security-event:${eventId}`,
    {
      ...event,
      timestamp,
      id: eventId
    },
    { ex: 86400 } // 24 hours
  )
  
  console.log(`[Security] ${event.type}:`, {
    eventId,
    sessionId: event.sessionId,
    clientIP: event.clientIP,
    details: event.details
  })
}

/**
 * POST /api/auth/session-secure - Create secure session with device binding
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit(clientIP, RateLimits.AUTH_LOGIN)
    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        clientIP,
        details: { retryAfter: rateLimitResult.retryAfter }
      })
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many session creation attempts',
            retryAfter: rateLimitResult.retryAfter
          }
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter!.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }
    
    // Check concurrent sessions limit
    const canCreateSession = await checkConcurrentSessions(clientIP)
    if (!canCreateSession) {
      await logSecurityEvent({
        type: 'MAX_SESSIONS_EXCEEDED',
        clientIP,
        details: { maxSessions: MAX_SESSIONS_PER_IP }
      })
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'MAX_SESSIONS_EXCEEDED',
            message: 'Maximum concurrent sessions reached for this IP'
          }
        },
        { status: 403 }
      )
    }
    
    // Generate secure session with device binding
    const sessionId = nanoid(32)
    const fingerprint = generateSessionFingerprint(request)
    const signingKey = getSigningKey()
    
    // Create JWT with security claims
    const value = await new SignJWT({
      sessionId,
      fingerprint,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + SESSION_TTL * 1000) / 1000),
      iss: 'dinelportal.dk',
      aud: 'eloverblik-integration',
      jti: nanoid(16) // Unique ID for revocation
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
        userAgent: request.headers.get('user-agent'),
        securityLevel: 'enhanced'
      },
      { ex: SESSION_TTL }
    )
    
    // Track session for IP
    const sessionsKey = `ip-sessions:${clientIP}`
    const sessions = await kv.get<string[]>(sessionsKey) || []
    sessions.push(sessionId)
    await kv.set(sessionsKey, sessions, { ex: SESSION_TTL })
    
    await logSecurityEvent({
      type: 'SESSION_CREATED',
      sessionId,
      clientIP,
      details: { fingerprint }
    })
    
    const response = NextResponse.json({
      ok: true,
      data: {
        sessionId,
        expiresIn: SESSION_TTL,
        status: 'created',
        securityLevel: 'enhanced'
      }
    })
    
    // Set secure cookie
    setCookieOnResponse(response, SESSION_COOKIE_NAME, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL,
      domain: process.env.NODE_ENV === 'production' ? '.dinelportal.dk' : undefined
    })
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[SecureSession] POST error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SESSION_ERROR',
          message: 'Failed to create secure session'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/session-secure?action=verify - Verify secure session with fingerprint check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    
    if (action !== 'verify') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Use GET /api/auth/session-secure?action=verify'
          }
        },
        { status: 400 }
      )
    }
    
    const value = getCookieFromRequest(request, SESSION_COOKIE_NAME)
    if (!value) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'No session found'
        },
        { status: 401 }
      )
    }
    
    // Verify JWT
    const signingKey = getSigningKey()
    let payload: any
    
    try {
      const result = await jwtVerify(value, signingKey)
      payload = result.payload
    } catch (verifyError) {
      const clientIP = getClientIP(request)
      await logSecurityEvent({
        type: 'INVALID_SESSION_TOKEN',
        clientIP,
        details: { error: verifyError }
      })
      
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'Invalid session'
        },
        { status: 401 }
      )
    }
    
    // Validate fingerprint
    const currentFingerprint = generateSessionFingerprint(request)
    if (payload.fingerprint !== currentFingerprint) {
      await logSecurityEvent({
        type: 'FINGERPRINT_MISMATCH',
        sessionId: payload.sessionId,
        clientIP: getClientIP(request),
        details: {
          expected: payload.fingerprint,
          received: currentFingerprint
        }
      })
      
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'Session security check failed'
        },
        { status: 401 }
      )
    }
    
    // Get session data from KV
    const sessionData = await kv.get<any>(`session:${payload.sessionId}`)
    if (!sessionData) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'Session expired'
        },
        { status: 401 }
      )
    }
    
    // Check idle timeout
    const idleTime = Date.now() - sessionData.lastActivity
    if (idleTime > SESSION_IDLE_TIMEOUT * 1000) {
      await kv.del(`session:${payload.sessionId}`)
      
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'Session timed out due to inactivity'
        },
        { status: 401 }
      )
    }
    
    // Update last activity
    sessionData.lastActivity = Date.now()
    await kv.set(`session:${payload.sessionId}`, sessionData, {
      ex: Math.floor((sessionData.expiresAt - Date.now()) / 1000)
    })
    
    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      sessionId: payload.sessionId,
      status: sessionData.status,
      customerId: sessionData.customerId || null,
      securityLevel: 'enhanced',
      idleTimeRemaining: SESSION_IDLE_TIMEOUT - Math.floor(idleTime / 1000)
    })
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[SecureSession] GET error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: 'Failed to verify session'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/session-secure - Secure logout with session cleanup
 */
export async function DELETE(request: NextRequest) {
  try {
    const value = getCookieFromRequest(request, SESSION_COOKIE_NAME)
    const clientIP = getClientIP(request)
    
    if (value) {
      try {
        const signingKey = getSigningKey()
        const { payload } = await jwtVerify(value, signingKey)
        const sessionId = payload.sessionId as string
        
        // Clean up session data
        await kv.del(`session:${sessionId}`)
        
        // Remove from IP sessions list
        const sessionsKey = `ip-sessions:${clientIP}`
        const sessions = await kv.get<string[]>(sessionsKey) || []
        const updated = sessions.filter(id => id !== sessionId)
        if (updated.length > 0) {
          await kv.set(sessionsKey, updated, { ex: SESSION_TTL })
        } else {
          await kv.del(sessionsKey)
        }
        
        await logSecurityEvent({
          type: 'SESSION_LOGOUT',
          sessionId,
          clientIP
        })
      } catch (error) {
        console.error('[SecureSession] Cleanup error:', error)
      }
    }
    
    const response = NextResponse.json({
      ok: true,
      data: {
        status: 'logged_out',
        message: 'Session securely terminated'
      }
    })
    
    // Clear cookie
    deleteCookieOnResponse(response, SESSION_COOKIE_NAME)
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[SecureSession] DELETE error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout securely'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPrivate(request.headers.get('origin'))
  })
}