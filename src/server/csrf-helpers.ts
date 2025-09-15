/**
 * CSRF Protection Helpers for Next.js App Router
 * Provides CSRF validation for admin/mutation endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { envBool } from '@/lib/env'
import { randomBytes } from 'crypto'
import { getCookieFromRequest, setCookieOnResponse } from './cookie-helpers'

/**
 * Generate a cryptographically secure CSRF value
 * @returns Random value string
 */
export function generateCSRFValue(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Set CSRF value in response cookies and headers
 * @param response - NextResponse to add value to
 * @param value - Optional value (generates new if not provided)
 * @returns The same response for chaining
 */
export function setCSRFValue(
  response: NextResponse,
  value?: string
): NextResponse {
  const csrfValue = value || generateCSRFValue()
  
  // Set as httpOnly cookie
  setCookieOnResponse(response, 'csrf_value', csrfValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Strict for CSRF protection
    path: '/',
    maxAge: 3600 // 1 hour
  })
  
  // Also return in response for client to use in headers
  response.headers.set('X-CSRF-Value', csrfValue)
  
  return response
}

/**
 * Validate CSRF value from request
 * Implements double-submit cookie pattern
 * @param request - NextRequest to validate
 * @returns true if value is valid
 */
export async function validateCSRF(request: NextRequest): Promise<boolean> {
  // Skip validation in development if explicitly disabled
  if (process.env.NODE_ENV === 'development' && envBool('SKIP_CSRF', false)) {
    console.warn('[CSRF] Validation skipped in development')
    return true
  }
  
  // Get value from header (sent by client)
  const headerValue = request.headers.get('X-CSRF-Value')
  if (!headerValue) {
    console.warn('[CSRF] No value in header')
    return false
  }
  
  // Get value from cookie (set by server)
  const cookieValue = getCookieFromRequest(request, 'csrf_value')
  if (!cookieValue) {
    console.warn('[CSRF] No value in cookie')
    return false
  }
  
  // Compare values (constant-time comparison)
  const valid = timingSafeEqual(headerValue, cookieValue)
  
  if (!valid) {
    console.warn('[CSRF] Value mismatch')
  }
  
  return valid
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Middleware to check CSRF for mutation methods
 * @param handler - Route handler function
 * @returns Wrapped handler with CSRF validation
 */
export function withCSRFProtection<T extends any[], R>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse
): (request: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse {
  return async (request: NextRequest, ...args: T) => {
    // Only check CSRF for mutation methods
    const method = request.method
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return handler(request, ...args)
    }
    
    // Validate CSRF value
    const valid = await validateCSRF(request)
    if (!valid) {
      return NextResponse.json(
        { 
          ok: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'Invalid or missing CSRF value'
          }
        },
        { 
          status: 403,
          headers: {
            'X-CSRF-Required': 'true'
          }
        }
      )
    }
    
    // Value valid, proceed with handler
    return handler(request, ...args)
  }
}

/**
 * Generate and return CSRF value endpoint response
 * Used by clients to get a value before making mutations
 */
export function createCSRFResponse(): NextResponse {
  const value = generateCSRFValue()
  const response = NextResponse.json({
    ok: true,
    data: { csrfValue: value }
  })
  
  return setCSRFValue(response, value)
}

/**
 * Check if request requires CSRF protection
 * @param request - NextRequest to check
 * @returns true if CSRF protection is required
 */
export function requiresCSRFProtection(request: NextRequest): boolean {
  const method = request.method
  const path = request.nextUrl.pathname
  
  // Skip for safe methods
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return false
  }
  
  // Require for admin routes
  if (path.startsWith('/api/admin/')) {
    return true
  }
  
  // Require for auth mutations
  if (path.startsWith('/api/auth/') && method !== 'GET') {
    return true
  }
  
  // Require for Sanity management
  if (path.startsWith('/api/sanity/')) {
    return true
  }
  
  return false
}

/**
 * Create an error response for CSRF failures
 * @param reason - Specific reason for failure
 * @returns NextResponse with error details
 */
export function csrfErrorResponse(reason: string = 'CSRF validation failed'): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'CSRF_ERROR',
        message: reason
      }
    },
    {
      status: 403,
      headers: {
        'X-CSRF-Required': 'true',
        'X-Error-Type': 'CSRF'
      }
    }
  )
}
