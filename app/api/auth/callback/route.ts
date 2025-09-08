/**
 * OAuth Callback API Route - Next.js App Router
 * Handles the callback from Eloverblik after user authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import {
  verifyStateValue,
  updateSessionData,
  getSessionData,
  createSession,
  setSessionCookie
} from '@/server/session-helpers'
import { fetchWithTimeout, retryWithBackoff } from '@/server/api-helpers'

// Runtime configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// Configuration: compute redirect base dynamically to support Preview domains
function computeRedirectBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host') || ''
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const host = forwardedHost || request.nextUrl.host
  const isPreview = (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') || host.includes('vercel.app')
  if (isPreview) {
    return `${forwardedProto}://${host}`
  }
  return 'https://www.dinelportal.dk'
}
const SESSION_TTL = 24 * 60 * 60

/**
 * Fetch authorizations from Eloverblik API
 */
async function fetchAuthorizations(): Promise<any[]> {
  const refreshValue = process.env.ELOVERBLIK_API_TOKEN || 
                      process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
  
  if (!refreshValue) {
    throw new Error('Eloverblik refresh value not configured')
  }
  
  // Get access value
  const valueResponse = await retryWithBackoff(async () => {
    return fetchWithTimeout('https://api.eloverblik.dk/thirdpartyapi/api/token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshValue}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0',
      },
      timeout: 8000
    })
  }, 3, 1000)
  
  if (!valueResponse.ok) {
    throw new Error(`Value refresh failed: ${valueResponse.status}`)
  }
  
  const valueData = await valueResponse.json()
  const accessValue = valueData.result || valueData.access_token || valueData.token
  
  if (!accessValue) {
    throw new Error('No access value received')
  }
  
  // Get authorizations
  const authResponse = await retryWithBackoff(async () => {
    return fetchWithTimeout('https://api.eloverblik.dk/thirdpartyapi/api/authorization/authorizations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessValue}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0',
      },
      timeout: 8000
    })
  }, 3, 1000)
  
  if (!authResponse.ok) {
    throw new Error(`Failed to fetch authorizations: ${authResponse.status}`)
  }
  
  const authData = await authResponse.json()
  return authData.result || []
}

/**
 * GET /api/auth/callback - Handle OAuth callback from Eloverblik
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const state = searchParams.get('state')
  
  const REDIRECT_BASE_URL = computeRedirectBaseUrl(request)

  if (!state) {
    // No state value - redirect to error page
    return NextResponse.redirect(`${REDIRECT_BASE_URL}/forbrug-tracker?error=missing_state`, { status: 302 })
  }
  
  try {
    // Verify state value and get session ID
    const sessionId = await verifyStateValue(state)
    
    if (!sessionId) {
      return NextResponse.redirect(`${REDIRECT_BASE_URL}/forbrug-tracker?error=invalid_state`, { status: 302 })
    }
    
    // Fetch current authorizations from Eloverblik
    const authorizations = await fetchAuthorizations()
    
    if (!authorizations || authorizations.length === 0) {
      return NextResponse.redirect(`${REDIRECT_BASE_URL}/forbrug-tracker?error=no_authorizations`, { status: 302 })
    }
    
    // Get the most recent authorization (user just authorized)
    // Sort by timeStamp (when the authorization was created) to get the newest
    const sortedAuths = authorizations.sort((a: any, b: any) => {
      const dateA = new Date(a.timeStamp || a.validFrom).getTime()
      const dateB = new Date(b.timeStamp || b.validFrom).getTime()
      return dateB - dateA // Newest first
    })
    
    const recentAuth = sortedAuths[0]
    
    // Use the authorization ID as the primary identifier
    // This must match what eloverblik.ts expects
    const customerId = recentAuth.id // Use the authorization ID consistently
    
    console.log('[Callback] Authorization details:', {
      sessionId,
      authorizationId: recentAuth.id,
      customerCVR: recentAuth.customerCVR,
      customerName: recentAuth.customerName,
      timeStamp: recentAuth.timeStamp,
      validFrom: recentAuth.validFrom,
      validTo: recentAuth.validTo,
      storedCustomerId: customerId
    })
    
    // Link session to customer
    await kv.set(
      `session:${sessionId}:customer`,
      customerId,
      { ex: SESSION_TTL }
    )
    
    // Store customer to session mapping
    await kv.set(
      `customer:${customerId}:session`,
      sessionId,
      { ex: SESSION_TTL }
    )
    
    // Update session data with customer info
    await updateSessionData(sessionId, {
      status: 'authorized',
      customerId,
      metadata: {
        customerName: recentAuth.customerName,
        authorizedAt: Date.now()
      }
    })
    
    // Get existing session data to create new value with customer info
    const sessionData = await getSessionData(sessionId)
    if (!sessionData) {
      throw new Error('Session data not found')
    }
    
    // Create new session value with customer info
    const { value } = await createSession(customerId)
    
    // Create redirect response with updated session cookie
    // Using NextResponse.redirect to properly handle cookies
    const redirectUrl = new URL(`${REDIRECT_BASE_URL}/forbrug-tracker`)
    redirectUrl.searchParams.set('authorized', 'true')
    redirectUrl.searchParams.set('customer', customerId)
    
    const response = NextResponse.redirect(redirectUrl, { status: 302 })
    
    // Set updated session cookie
    setSessionCookie(response, value)
    
    console.log('[Callback] Setting session cookie for customer:', customerId)
    
    return response
    
  } catch (error) {
    console.error('[Callback] Processing failed:', error)
    return NextResponse.redirect(`${REDIRECT_BASE_URL}/forbrug-tracker?error=callback_failed`, { status: 302 })
  }
}