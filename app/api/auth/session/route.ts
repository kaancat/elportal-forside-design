/**
 * Session API Route - Next.js App Router
 * Handles session initialization, verification, and logout
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createSession,
  getSession,
  getSessionData,
  clearSession,
  setSessionCookie
} from '@/server/session-helpers'
import { corsPrivate } from '@/server/api-helpers'
import { kv } from '@vercel/kv'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 5
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/session - Initialize new session
 * POST /api/auth/session?action=logout - Logout and clear session
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    
    // Handle logout action
    if (action === 'logout') {
      const session = await getSession(request)
      
      const response = NextResponse.json({
        ok: true,
        data: {
          status: 'logged_out',
          message: 'Session cleared successfully'
        }
      })
      
      // Clear session (pass sessionId if available)
      await clearSession(response, session?.sessionId)
      
      return response
    }
    
    // Default action: Initialize new session
    const { sessionId, value } = await createSession()
    
    const response = NextResponse.json({
      ok: true,
      data: {
        sessionId,
        expiresIn: 24 * 60 * 60, // 24 hours
        status: 'created'
      }
    })
    
    // Set session cookie
    setSessionCookie(response, value)
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[Session] POST error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
    // Lightweight diagnostics to help debug Preview issues (no secrets exposed)
    const diagnostics = {
      hasSigningKey: !!process.env.ELPORTAL_SIGNING_KEY,
      hasKvUrl: !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
      hasKvToken: !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
    }
    
    // Check if it's a signing key error
    if (errorMessage.includes('ELPORTAL_SIGNING_KEY')) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server signing key not configured. Please contact support.',
            details: diagnostics,
          }
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SESSION_ERROR',
          message: errorMessage,
          details: diagnostics,
        }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/session?action=verify - Verify current session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    
    // Only handle verify action for GET
    if (action !== 'verify') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Use GET /api/auth/session?action=verify to verify session'
          }
        },
        { status: 400 }
      )
    }
    
    const session = await getSession(request)
    
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'No valid session found'
        },
        { status: 401 }
      )
    }
    
    // Check session data in KV
    const sessionData = await getSessionData(session.sessionId)
    
    if (!sessionData) {
      return NextResponse.json(
        {
          ok: false,
          authenticated: false,
          message: 'Session expired or not found'
        },
        { status: 401 }
      )
    }
    
    // Check if session has associated customer
    const customerId = sessionData.customerId || 
                      await kv.get<string>(`session:${session.sessionId}:customer`)
    
    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      sessionId: session.sessionId,
      hasAuthorization: !!customerId,
      customerId: customerId || null,
      status: sessionData.status
    })
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[Session] GET error:', error)
    
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
 * DELETE /api/auth/session - Logout and clear session
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    const response = NextResponse.json({
      ok: true,
      data: {
        status: 'logged_out',
        message: 'Session cleared successfully'
      }
    })
    
    // Clear session (pass sessionId if available)
    await clearSession(response, session?.sessionId)
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[Session] DELETE error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout'
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
