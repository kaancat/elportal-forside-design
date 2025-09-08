/**
 * Admin Authentication API Route - Next.js App Router
 * Handles admin login with CSRF protection and session management
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import { createSessionResponse } from '@/server/session-helpers'
import { corsPrivate } from '@/server/api-helpers'
import { getClientIP, checkRateLimit, RateLimits } from '@/server/rate-limit-helpers'
import { validateCSRF, setCSRFValue } from '@/server/csrf-helpers'

// Runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 5
export const dynamic = 'force-dynamic'

// Admin session configuration
const ADMIN_SESSION_TTL = 24 * 60 * 60 // 24 hours
const MAX_LOGIN_ATTEMPTS = 5 // Per hour

/**
 * GET /api/admin/auth - Get CSRF value for admin login
 */
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      ok: true,
      data: {
        message: 'Use POST with credentials and CSRF value to authenticate'
      }
    })
    
    // Set CSRF value for login form
    setCSRFValue(response)
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[AdminAuth] GET error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'CSRF_ERROR',
          message: 'Failed to generate CSRF value'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/auth - Admin login with credentials
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting to prevent brute force
    const rateLimitResult = await checkRateLimit(
      `admin-login:${clientIP}`,
      { interval: 3600, limit: MAX_LOGIN_ATTEMPTS } // 5 attempts per hour
    )
    
    if (!rateLimitResult.allowed) {
      console.warn(`[AdminAuth] Rate limit exceeded for IP: ${clientIP}`)
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again later.',
            retryAfter: rateLimitResult.retryAfter
          }
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter!.toString()
          }
        }
      )
    }
    
    // Validate CSRF value
    const csrfValid = await validateCSRF(request)
    if (!csrfValid) {
      console.warn(`[AdminAuth] CSRF validation failed for IP: ${clientIP}`)
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'Invalid or missing CSRF value'
          }
        },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { credentials } = body
    
    if (!credentials) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Credentials required'
          }
        },
        { status: 400 }
      )
    }
    
    // Get admin secret from environment
    const adminSecret = process.env.ADMIN_SECRET
    
    if (!adminSecret) {
      console.error('[AdminAuth] ADMIN_SECRET not configured')
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server configuration error - missing admin secret'
          }
        },
        { status: 500 }
      )
    }
    
    // Debug logging (without exposing secret)
    console.log('[AdminAuth] Login attempt:', {
      clientIP,
      hasCredentials: !!credentials,
      hasAdminSecret: !!adminSecret,
      adminSecretPreview: adminSecret.substring(0, 3) + '***'
    })
    
    // Validate credentials
    if (credentials === adminSecret) {
      // Generate session with admin scope
      const response = await createSessionResponse(
        {
          message: 'Admin authentication successful',
          role: 'admin'
        },
        undefined, // No customer ID for admin
        ['admin'] // Admin scope
      )
      
      // Log successful login
      await kv.set(
        `admin-login-log:${nanoid(16)}`,
        {
          clientIP,
          timestamp: Date.now(),
          success: true
        },
        { ex: 86400 } // 24 hours
      )
      
      // Add CORS headers
      Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
      
    } else {
      // Add delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log failed attempt
      await kv.set(
        `admin-login-log:${nanoid(16)}`,
        {
          clientIP,
          timestamp: Date.now(),
          success: false
        },
        { ex: 86400 } // 24 hours
      )
      
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials'
          }
        },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('[AdminAuth] POST error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed'
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
  const response = new Response(null, {
    status: 200,
    headers: corsPrivate(request.headers.get('origin'))
  })
  
  // Also provide CSRF value for OPTIONS
  setCSRFValue(response as NextResponse)
  
  return response
}