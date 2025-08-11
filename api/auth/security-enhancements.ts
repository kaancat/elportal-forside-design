import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'
import crypto from 'crypto'

// ============================================================================
// CRITICAL SECURITY ENHANCEMENTS FOR ELOVERBLIK INTEGRATION
// ============================================================================
// This file contains security enhancements that MUST be implemented to ensure
// complete data isolation and GDPR compliance for the Eloverblik integration.
//
// CONTEXT: After discovering a critical GDPR violation where user data was
// visible to all users, we need maximum security for this sensitive feature.
// ============================================================================

// 1. RATE LIMITING
// Prevent brute force attacks and API abuse
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10
const MAX_AUTH_ATTEMPTS = 3 // Max authorization attempts per hour

export async function checkRateLimit(
  identifier: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `rate_limit:${action}:${identifier}`
  const now = Date.now()
  
  // Get current window data
  const windowData = await kv.get<{ count: number; windowStart: number }>(key)
  
  if (!windowData || now - windowData.windowStart > RATE_LIMIT_WINDOW) {
    // New window
    await kv.set(
      key,
      { count: 1, windowStart: now },
      { px: RATE_LIMIT_WINDOW }
    )
    return { allowed: true }
  }
  
  if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((windowData.windowStart + RATE_LIMIT_WINDOW - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment counter
  await kv.set(
    key,
    { count: windowData.count + 1, windowStart: windowData.windowStart },
    { px: RATE_LIMIT_WINDOW - (now - windowData.windowStart) }
  )
  
  return { allowed: true }
}

// 2. SESSION FINGERPRINTING
// Detect session hijacking by tracking device fingerprint
export function generateSessionFingerprint(req: VercelRequest): string {
  const userAgent = req.headers['user-agent'] || ''
  const acceptLanguage = req.headers['accept-language'] || ''
  const acceptEncoding = req.headers['accept-encoding'] || ''
  
  // Create a hash of browser characteristics
  const fingerprint = crypto
    .createHash('sha256')
    .update(userAgent)
    .update(acceptLanguage)
    .update(acceptEncoding)
    .digest('hex')
    .substring(0, 16)
  
  return fingerprint
}

export async function validateSessionFingerprint(
  sessionId: string,
  currentFingerprint: string
): Promise<boolean> {
  const storedFingerprint = await kv.get(`session:${sessionId}:fingerprint`)
  
  if (!storedFingerprint) {
    // First time - store it
    await kv.set(
      `session:${sessionId}:fingerprint`,
      currentFingerprint,
      { ex: 24 * 60 * 60 }
    )
    return true
  }
  
  // Check if fingerprint matches
  if (storedFingerprint !== currentFingerprint) {
    console.error('🚨 Session fingerprint mismatch detected!', {
      sessionId,
      stored: storedFingerprint,
      current: currentFingerprint
    })
    
    // Log security event
    await logSecurityEvent('session_hijack_attempt', {
      sessionId,
      storedFingerprint,
      currentFingerprint
    })
    
    return false
  }
  
  return true
}

// 3. IP ADDRESS TRACKING
// Track IP changes for additional security
export async function validateIPAddress(
  sessionId: string,
  currentIP: string
): Promise<{ valid: boolean; suspicious: boolean }> {
  const ipHistory = await kv.get<string[]>(`session:${sessionId}:ips`) || []
  
  if (ipHistory.length === 0) {
    // First IP for this session
    await kv.set(
      `session:${sessionId}:ips`,
      [currentIP],
      { ex: 24 * 60 * 60 }
    )
    return { valid: true, suspicious: false }
  }
  
  if (!ipHistory.includes(currentIP)) {
    // New IP detected
    ipHistory.push(currentIP)
    await kv.set(
      `session:${sessionId}:ips`,
      ipHistory,
      { ex: 24 * 60 * 60 }
    )
    
    // Flag as suspicious if too many IP changes
    if (ipHistory.length > 3) {
      await logSecurityEvent('suspicious_ip_changes', {
        sessionId,
        ipCount: ipHistory.length,
        ips: ipHistory
      })
      return { valid: true, suspicious: true }
    }
  }
  
  return { valid: true, suspicious: false }
}

// 4. CONCURRENT SESSION DETECTION
// Prevent same customer from having multiple active sessions
export async function checkConcurrentSessions(
  customerId: string,
  currentSessionId: string
): Promise<{ allowed: boolean; existingSessionId?: string }> {
  const existingSessionId = await kv.get(`customer:${customerId}:active_session`)
  
  if (existingSessionId && existingSessionId !== currentSessionId) {
    // Check if the existing session is still valid
    const sessionData = await kv.get(`session:${existingSessionId}`)
    
    if (sessionData) {
      // Active session exists for this customer
      console.warn('⚠️ Concurrent session attempt detected', {
        customerId,
        currentSessionId,
        existingSessionId
      })
      
      await logSecurityEvent('concurrent_session_attempt', {
        customerId,
        currentSessionId,
        existingSessionId
      })
      
      return { allowed: false, existingSessionId: existingSessionId as string }
    }
  }
  
  // Set this as the active session
  await kv.set(
    `customer:${customerId}:active_session`,
    currentSessionId,
    { ex: 24 * 60 * 60 }
  )
  
  return { allowed: true }
}

// 5. AUTHORIZATION ATTEMPT TRACKING
// Prevent brute force authorization attempts
export async function trackAuthorizationAttempt(
  identifier: string
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const key = `auth_attempts:${identifier}`
  const attempts = await kv.get<number>(key) || 0
  
  if (attempts >= MAX_AUTH_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 }
  }
  
  await kv.set(key, attempts + 1, { ex: 60 * 60 }) // 1 hour expiry
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_AUTH_ATTEMPTS - attempts - 1 
  }
}

// 6. SECURITY EVENT LOGGING
// Log all security-relevant events for audit trail
export async function logSecurityEvent(
  eventType: string,
  details: Record<string, any>
): Promise<void> {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    details,
    id: crypto.randomBytes(16).toString('hex')
  }
  
  // Store in KV with TTL for audit trail
  await kv.set(
    `security_log:${event.id}`,
    event,
    { ex: 30 * 24 * 60 * 60 } // 30 days
  )
  
  // Also add to a list for easy retrieval
  const logKey = `security_logs:${new Date().toISOString().split('T')[0]}`
  const logs = await kv.get<string[]>(logKey) || []
  logs.push(event.id)
  await kv.set(logKey, logs, { ex: 30 * 24 * 60 * 60 })
  
  // Log to console for immediate visibility
  console.log(`🔒 SECURITY EVENT [${eventType}]:`, details)
}

// 7. SESSION ROTATION
// Rotate session token after authorization to prevent fixation attacks
export async function rotateSessionToken(
  oldSessionId: string,
  customerId: string
): Promise<{ newSessionId: string; newToken: string } | null> {
  try {
    // Import required functions (would normally import from session.ts)
    const { nanoid } = await import('nanoid')
    const { SignJWT } = await import('jose')
    
    // Generate new session ID
    const newSessionId = nanoid(32)
    
    // Get old session data
    const oldSessionData = await kv.get(`session:${oldSessionId}`)
    
    if (!oldSessionData) {
      return null
    }
    
    // Create new session with same data but new ID
    await kv.set(
      `session:${newSessionId}`,
      {
        ...oldSessionData,
        rotatedFrom: oldSessionId,
        rotatedAt: Date.now()
      },
      { ex: 24 * 60 * 60 }
    )
    
    // Move customer association
    await kv.set(
      `session:${newSessionId}:customer`,
      customerId,
      { ex: 24 * 60 * 60 }
    )
    
    // Update customer's active session
    await kv.set(
      `customer:${customerId}:active_session`,
      newSessionId,
      { ex: 24 * 60 * 60 }
    )
    
    // Clean up old session
    await kv.del(`session:${oldSessionId}`)
    await kv.del(`session:${oldSessionId}:customer`)
    
    // Generate new JWT token
    const signingKey = new TextEncoder().encode(
      process.env.ELPORTAL_SIGNING_KEY || ''
    )
    
    const newToken = await new SignJWT({
      sessionId: newSessionId,
      customerId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(signingKey)
    
    await logSecurityEvent('session_rotated', {
      oldSessionId,
      newSessionId,
      customerId
    })
    
    return { newSessionId, newToken }
  } catch (error) {
    console.error('Session rotation failed:', error)
    return null
  }
}

// 8. SECURE HEADERS MIDDLEWARE
// Add security headers to all responses
export function addSecurityHeaders(res: VercelResponse): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  )
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )
}

// 9. DATA SANITIZATION
// Clean sensitive data before logging or returning in errors
export function sanitizeErrorData(data: any): any {
  if (typeof data === 'string') {
    // Remove potential tokens or sensitive patterns
    return data
      .replace(/Bearer\s+[\w\-._~+\/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/\b\d{8}\b/g, '[CPR-REDACTED]') // Danish CPR numbers
      .replace(/\b\d{10}\b/g, '[CVR-REDACTED]') // Danish CVR numbers
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    const sensitiveKeys = [
      'token', 'password', 'secret', 'key', 'authorization',
      'cpr', 'cvr', 'customerId', 'meteringPointId'
    ]
    
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeErrorData(value)
      }
    }
    
    return sanitized
  }
  
  return data
}

// 10. COMPREHENSIVE SESSION VALIDATION
// Perform all security checks in one function
export async function validateSessionSecurity(
  req: VercelRequest,
  sessionId: string
): Promise<{ 
  valid: boolean; 
  reason?: string;
  shouldInvalidate?: boolean 
}> {
  try {
    // Get client IP
    const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     req.socket?.remoteAddress || 
                     'unknown'
    
    // 1. Check rate limiting
    const rateLimitCheck = await checkRateLimit(clientIP, 'session_validate')
    if (!rateLimitCheck.allowed) {
      return { 
        valid: false, 
        reason: `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter}s`,
        shouldInvalidate: false
      }
    }
    
    // 2. Validate session fingerprint
    const fingerprint = generateSessionFingerprint(req)
    const fingerprintValid = await validateSessionFingerprint(sessionId, fingerprint)
    if (!fingerprintValid) {
      return { 
        valid: false, 
        reason: 'Session fingerprint mismatch - possible hijack attempt',
        shouldInvalidate: true
      }
    }
    
    // 3. Validate IP address
    const ipCheck = await validateIPAddress(sessionId, clientIP)
    if (ipCheck.suspicious) {
      // Log but don't block - user might be on mobile/VPN
      console.warn('Suspicious IP activity detected for session:', sessionId)
    }
    
    // 4. Check session data in KV
    const sessionData = await kv.get(`session:${sessionId}`)
    if (!sessionData) {
      return { 
        valid: false, 
        reason: 'Session not found in store',
        shouldInvalidate: true
      }
    }
    
    // 5. Check if session is expired
    const session = sessionData as any
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return { 
        valid: false, 
        reason: 'Session expired',
        shouldInvalidate: true
      }
    }
    
    // All checks passed
    return { valid: true }
  } catch (error) {
    console.error('Session validation error:', error)
    return { 
      valid: false, 
      reason: 'Validation error',
      shouldInvalidate: false
    }
  }
}

// 11. CLEANUP EXPIRED SESSIONS
// Regular cleanup to prevent data accumulation
export async function cleanupExpiredSessions(): Promise<number> {
  let cleaned = 0
  const now = Date.now()
  
  // This would typically be called by a cron job
  // For now, we'll check a reasonable number of sessions
  for (let i = 0; i < 100; i++) {
    const keys = await kv.keys(`session:*`)
    
    for (const key of keys.slice(0, 10)) {
      const sessionData = await kv.get(key) as any
      
      if (sessionData && sessionData.expiresAt && sessionData.expiresAt < now) {
        await kv.del(key)
        
        // Clean up related keys
        const sessionId = key.split(':')[1]
        await kv.del(`session:${sessionId}:customer`)
        await kv.del(`session:${sessionId}:fingerprint`)
        await kv.del(`session:${sessionId}:ips`)
        
        cleaned++
      }
    }
  }
  
  console.log(`Cleaned up ${cleaned} expired sessions`)
  return cleaned
}

// 12. EMERGENCY KILLSWITCH
// Immediately invalidate all sessions in case of breach
export async function emergencyKillAllSessions(): Promise<void> {
  console.error('🚨 EMERGENCY KILL SWITCH ACTIVATED')
  
  await logSecurityEvent('emergency_killswitch', {
    timestamp: new Date().toISOString(),
    reason: 'Manual activation'
  })
  
  // Get all session keys
  const sessionKeys = await kv.keys('session:*')
  
  // Delete all sessions
  for (const key of sessionKeys) {
    await kv.del(key)
  }
  
  // Delete all customer mappings
  const customerKeys = await kv.keys('customer:*')
  for (const key of customerKeys) {
    await kv.del(key)
  }
  
  // Delete all state tokens
  const stateKeys = await kv.keys('state:*')
  for (const key of stateKeys) {
    await kv.del(key)
  }
  
  console.log(`Killed ${sessionKeys.length} sessions`)
}

// Export security middleware
export function securityMiddleware(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Add security headers
    addSecurityHeaders(res)
    
    // Log request for audit trail
    const requestId = crypto.randomBytes(16).toString('hex')
    console.log(`Request ${requestId}:`, {
      method: req.method,
      url: req.url,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent']
    })
    
    try {
      // Execute the handler
      return await handler(req, res)
    } catch (error) {
      // Sanitize error before logging
      const sanitizedError = sanitizeErrorData(error)
      console.error(`Request ${requestId} failed:`, sanitizedError)
      
      // Return generic error to client
      return res.status(500).json({
        error: 'Internal server error',
        requestId
      })
    }
  }
}