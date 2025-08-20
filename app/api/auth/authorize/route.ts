/**
 * Authorization API Route - Next.js App Router
 * Handles OAuth authorization initialization for Eloverblik
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getSession,
  updateSessionData,
  createStateValue
} from '@/server/session-helpers'
import { corsPrivate } from '@/server/api-helpers'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 5
export const dynamic = 'force-dynamic'

// Eloverblik configuration
const ELOVERBLIK_AUTH_URL = 'https://eloverblik.dk/power-of-attorney'
const THIRD_PARTY_ID = process.env.ELOVERBLIK_THIRD_PARTY_ID || '945ac027-559a-4923-a670-66bfda8d27c6'
// The callback must go through WordPress first (Eloverblik requirement)
const WORDPRESS_CALLBACK_URL = 'https://mondaybrew.dk/dinelportal-callback/'

/**
 * POST /api/auth/authorize - Initialize OAuth authorization flow
 */
export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getSession(request)
    
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NO_SESSION',
            message: 'Please initialize a session first'
          }
        },
        { status: 401 }
      )
    }
    
    // Generate state value for CSRF protection
    const stateValue = await createStateValue(session.sessionId, 'eloverblik_authorization')
    
    // Update session status to authorizing
    try {
      await updateSessionData(session.sessionId, {
        status: 'authorizing',
        metadata: {
          authStartedAt: Date.now(),
          stateValue
        }
      })
    } catch (updateError) {
      console.error('[Authorize] Failed to update session:', updateError)
      // Continue even if update fails - state value is still valid
    }
    
    // Build callback URL with state value - must go through WordPress first
    // WordPress will redirect to our actual callback handler preserving the state
    const callbackUrl = `${WORDPRESS_CALLBACK_URL}?state=${stateValue}`
    
    // Build Eloverblik authorization URL
    // Eloverblik will redirect to the WordPress URL after authorization
    const authParams = new URLSearchParams({
      thirdPartyId: THIRD_PARTY_ID,
      fromDate: '2021-08-08',
      toDate: '2028-08-08',
      returnUrl: callbackUrl
    })
    
    const authorizationUrl = `${ELOVERBLIK_AUTH_URL}?${authParams.toString()}`
    
    // Log the URL for debugging
    console.log('[Authorize] Generated authorization URL:', authorizationUrl)
    console.log('[Authorize] Callback URL:', callbackUrl)
    
    const response = NextResponse.json({
      ok: true,
      data: {
        authorizationUrl,
        stateValue,
        sessionId: session.sessionId,
        message: 'Redirect user to authorization URL'
      }
    })
    
    // Add CORS headers for private endpoint
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[Authorize] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide more detailed error information for debugging
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Failed to initialize authorization',
          details: process.env.NODE_ENV === 'development' ? {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            type: error?.constructor?.name
          } : undefined,
          hint: errorMessage.includes('ELPORTAL_SIGNING_KEY') 
            ? 'Server configuration issue - please contact support' 
            : 'Please try again or contact support if the issue persists'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/authorize - Get authorization status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'NO_SESSION',
            message: 'No active session found'
          }
        },
        { status: 401 }
      )
    }
    
    // Return authorization configuration info
    const response = NextResponse.json({
      ok: true,
      data: {
        sessionId: session.sessionId,
        hasAuthorization: !!session.customerId,
        customerId: session.customerId || null,
        thirdPartyId: THIRD_PARTY_ID,
        authorizationUrl: ELOVERBLIK_AUTH_URL
      }
    })
    
    // Add CORS headers
    Object.entries(corsPrivate(request.headers.get('origin'))).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
    
  } catch (error) {
    console.error('[Authorize] GET error:', error)
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'STATUS_ERROR',
          message: 'Failed to get authorization status'
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