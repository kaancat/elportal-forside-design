/**
 * Session Helper Functions for Next.js App Router
 * Centralized session management for auth/admin endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { nanoid } from 'nanoid'
import { kv } from '@vercel/kv'
import { 
  getCookieFromRequest, 
  setCookieOnResponse, 
  deleteCookieOnResponse,
  SESSION_COOKIE_OPTIONS 
} from './cookie-helpers'

/**
 * Session configuration
 */
const SESSION_COOKIE_NAME = 'elportal_session'
const SESSION_TTL = 24 * 60 * 60 // 24 hours in seconds
const STATE_TTL = 10 * 60 // 10 minutes for OAuth state

/**
 * Detect whether Vercel KV is configured so we can degrade gracefully on Preview
 */
function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return false
  const trimmedUrl = url.trim().replace(/^"+|"+$/g, '')
  const trimmedToken = token.trim().replace(/^"+|"+$/g, '')
  if (!/^https:\/\//.test(trimmedUrl)) return false
  if (/\s/.test(trimmedUrl) || /\s/.test(trimmedToken)) return false
  return true
}

/**
 * Session payload interface
 */
export interface SessionPayload extends JWTPayload {
  sessionId: string
  createdAt: number
  expiresAt: number
  customerId?: string
  scopes?: string[]
}

/**
 * Session data stored in KV
 */
export interface SessionData {
  createdAt: number
  expiresAt: number
  status: 'pending_authorization' | 'authorizing' | 'authorized' | 'expired'
  customerId?: string
  scopes?: string[]
  metadata?: Record<string, any>
}

/**
 * Get signing key from environment with robust handling
 */
function getSigningKey(): Uint8Array {
  const rawKey = process.env.ELPORTAL_SIGNING_KEY
  if (!rawKey) {
    // Development/Preview fallback to avoid hard failures during staging
    // Apply on local dev or Vercel Preview environments
    const isPreview = (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production')
    if (process.env.NODE_ENV !== 'production' || isPreview) {
      console.warn('[Session] ELPORTAL_SIGNING_KEY not set. Using non-prod/preview fallback key.')
      const fallback = 'dev-preview-signing-key-please-set-ELPORTAL_SIGNING_KEY'
      return new TextEncoder().encode(fallback)
    }
    throw new Error('ELPORTAL_SIGNING_KEY environment variable is not set')
  }
  
  // Trim any whitespace/newlines that might have been added
  const key = rawKey.trim()
  
  if (key.length < 32) {
    throw new Error(`Signing key too short: ${key.length} characters (need at least 32)`)
  }
  
  // Try to decode as base64 if it looks like base64
  // Base64 for 32 bytes = 44 chars, for 48 bytes = 64 chars
  if (key.length === 44 || key.length === 64 || /^[A-Za-z0-9+/]+=*$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64')
      if (decoded.length >= 32) {
        return new Uint8Array(decoded)
      }
    } catch (e) {
      // Not valid base64, use as-is
    }
  }
  
  // Fallback: use as UTF-8 string
  return new TextEncoder().encode(key)
}

/**
 * Create a new session
 * @returns Session ID and JWT value
 */
export async function createSession(
  customerId?: string,
  scopes?: string[]
): Promise<{ sessionId: string; value: string }> {
  const sessionId = nanoid(32)
  const signingKey = getSigningKey()
  const now = Date.now()
  const expiresAt = now + (SESSION_TTL * 1000)
  
  const payload: SessionPayload = {
    sessionId,
    createdAt: now,
    expiresAt,
    customerId,
    scopes
  }
  
  const value = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(signingKey)
  
  // Store session data (KV when available)
  const sessionData: SessionData = {
    createdAt: now,
    expiresAt,
    status: customerId ? 'authorized' : 'pending_authorization',
    customerId,
    scopes
  }
  
  if (isKvConfigured()) {
    try {
      await kv.set(
        `session:${sessionId}`,
        sessionData,
        { ex: SESSION_TTL }
      )
    } catch (e) {
      console.warn('[Session] KV not available during createSession; continuing without KV store')
    }
  } else {
    console.warn('[Session] KV not configured — session will not be persisted in KV (Preview-safe)')
  }
  
  // If there's a customer ID, create reverse mapping
  if (customerId && isKvConfigured()) {
    try {
      await kv.set(
        `customer:${customerId}:session`,
        sessionId,
        { ex: SESSION_TTL }
      )
    } catch {}
  }
  
  return { sessionId, value }
}

/**
 * Verify and decode a session value
 * @param value - JWT value to verify
 * @returns Session payload or null if invalid
 */
export async function verifySessionValue(value: string): Promise<SessionPayload | null> {
  try {
    const signingKey = getSigningKey()
    const { payload } = await jwtVerify(value, signingKey)
    
    // Type guard for session payload
    if (!payload.sessionId || typeof payload.sessionId !== 'string') {
      return null
    }
    
    // Check if session hasn't expired
    const sessionPayload = payload as SessionPayload
    if (sessionPayload.expiresAt && Date.now() > sessionPayload.expiresAt) {
      return null
    }
    
    return sessionPayload
  } catch (error) {
    console.error('[Session] Verification failed:', error)
    return null
  }
}

/**
 * Get session from NextRequest
 * @param request - NextRequest object
 * @returns Session payload or null if not found/invalid
 */
export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const value = getCookieFromRequest(request, SESSION_COOKIE_NAME)
  
  if (!value) {
    return null
  }
  
  return verifySessionValue(value)
}

/**
 * Get full session data from KV
 * @param sessionId - Session ID to look up
 * @returns Session data or null if not found
 */
export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  try {
    if (!isKvConfigured()) {
      // Preview fallback: return a minimal in-memory-style stub so verify can pass
      return {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL * 1000,
        status: 'pending_authorization'
      }
    }
    const data = await kv.get<SessionData>(`session:${sessionId}`)
    return data
  } catch (error) {
    console.error('[Session] Failed to get session data:', error)
    return null
  }
}

/**
 * Update session data in KV
 * @param sessionId - Session ID to update
 * @param updates - Partial session data to merge
 */
export async function updateSessionData(
  sessionId: string,
  updates: Partial<SessionData>
): Promise<void> {
  const existing = await getSessionData(sessionId)
  if (!existing) {
    throw new Error('Session not found')
  }
  
  const updated = { ...existing, ...updates }
  const ttl = Math.max(0, Math.floor((existing.expiresAt - Date.now()) / 1000))
  
  if (ttl > 0 && isKvConfigured()) {
    try {
      await kv.set(`session:${sessionId}`, updated, { ex: ttl })
    } catch {}
  }
}

/**
 * Set session cookie on response
 * @param response - NextResponse to set cookie on
 * @param value - Session value
 * @returns Same response for chaining
 */
export function setSessionCookie(response: NextResponse, value: string): NextResponse {
  return setCookieOnResponse(response, SESSION_COOKIE_NAME, value, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_TTL
  })
}

/**
 * Clear session cookie and data
 * @param response - NextResponse to clear cookie from
 * @param sessionId - Optional session ID to clear from KV
 * @returns Same response for chaining
 */
export async function clearSession(
  response: NextResponse,
  sessionId?: string
): Promise<NextResponse> {
  // Clear cookie
  deleteCookieOnResponse(response, SESSION_COOKIE_NAME)
  
  // Clear KV data if session ID provided
  if (sessionId) {
    try {
      const sessionData = await getSessionData(sessionId)
      if (isKvConfigured()) {
        // Clear session data
        await kv.del(`session:${sessionId}`)
        
        // Clear customer mapping if exists
        if (sessionData?.customerId) {
          await kv.del(`customer:${sessionData.customerId}:session`)
        }
        
        // Clear any state values
        await kv.del(`session:${sessionId}:state`)
      }
    } catch (error) {
      console.error('[Session] Failed to clear session data:', error)
    }
  }
  
  return response
}

/**
 * Require authentication middleware
 * @param request - NextRequest to check
 * @param requiredScopes - Optional scopes to require
 * @returns Session payload or throws error response
 */
export async function requireAuth(
  request: NextRequest,
  requiredScopes?: string[]
): Promise<SessionPayload> {
  const session = await getSession(request)
  
  if (!session) {
    throw NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="DinElPortal"'
        }
      }
    )
  }
  
  // Check scopes if required
  if (requiredScopes && requiredScopes.length > 0) {
    const hasScopes = requiredScopes.every(scope => 
      session.scopes?.includes(scope)
    )
    
    if (!hasScopes) {
      throw NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            requiredScopes
          }
        },
        {
          status: 403
        }
      )
    }
  }
  
  // Check if session data still exists in KV
  const sessionData = await getSessionData(session.sessionId)
  if (!sessionData) {
    throw NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Session has expired'
        }
      },
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="DinElPortal" error="invalid_value"'
        }
      }
    )
  }
  
  return session
}

/**
 * Create OAuth state value for CSRF protection
 * @param sessionId - Session ID to associate with state
 * @param type - Type of OAuth flow
 * @returns State value
 */
export async function createStateValue(
  sessionId: string,
  type: 'eloverblik_authorization' | 'google_oauth' | 'facebook_oauth' = 'eloverblik_authorization'
): Promise<string> {
  const stateValue = nanoid(32)
  
  await kv.set(
    `state:${stateValue}`,
    {
      sessionId,
      createdAt: Date.now(),
      type
    },
    { ex: STATE_TTL }
  )
  
  return stateValue
}

/**
 * Verify OAuth state value
 * @param stateValue - State value to verify
 * @returns Session ID or null if invalid
 */
export async function verifyStateValue(stateValue: string): Promise<string | null> {
  try {
    const stateData = await kv.get<{
      sessionId: string
      createdAt: number
      type: string
    }>(`state:${stateValue}`)
    
    if (!stateData) {
      return null
    }
    
    // Delete state value (one-time use)
    await kv.del(`state:${stateValue}`)
    
    return stateData.sessionId
  } catch (error) {
    console.error('[Session] Failed to verify state value:', error)
    return null
  }
}

/**
 * Rotate session value (for security)
 * @param oldSession - Current session payload
 * @returns New session value
 */
export async function rotateSession(oldSession: SessionPayload): Promise<string> {
  const signingKey = getSigningKey()
  const now = Date.now()
  
  // Keep same session ID but update timestamps
  const payload: SessionPayload = {
    ...oldSession,
    createdAt: now,
    expiresAt: now + (SESSION_TTL * 1000)
  }
  
  const value = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(signingKey)
  
  // Update session data in KV
  await updateSessionData(oldSession.sessionId, {
    expiresAt: payload.expiresAt
  })
  
  return value
}

/**
 * Check if request has valid admin session
 * @param request - NextRequest to check
 * @returns true if admin session exists
 */
export async function isAdminSession(request: NextRequest): Promise<boolean> {
  try {
    const session = await getSession(request)
    if (!session) return false
    
    // Check for admin scope
    return session.scopes?.includes('admin') || false
  } catch {
    return false
  }
}

/**
 * Create response with new session
 * @param data - Response data
 * @param customerId - Optional customer ID
 * @param scopes - Optional scopes
 * @returns NextResponse with session cookie
 */
export async function createSessionResponse(
  data: any,
  customerId?: string,
  scopes?: string[]
): Promise<NextResponse> {
  const { sessionId, value } = await createSession(customerId, scopes)
  
  const response = NextResponse.json({
    ok: true,
    data: {
      ...data,
      sessionId
    }
  })
  
  return setSessionCookie(response, value)
}

/**
 * Create logout response clearing session
 * @param sessionId - Optional session ID to clear
 * @returns NextResponse with cleared session
 */
export async function createLogoutResponse(sessionId?: string): Promise<NextResponse> {
  const response = NextResponse.json({
    ok: true,
    data: {
      message: 'Logged out successfully'
    }
  })
  
  return clearSession(response, sessionId)
}