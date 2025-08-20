/**
 * Next.js App Router API Route for Eloverblik Integration
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * 🔐 SECURITY: This integration uses session-based authentication
 * to ensure complete user data isolation. Each user must have a valid
 * session and can only access their own data.
 * 
 * Features preserved:
 * - OAuth authentication flow
 * - Session-based security
 * - In-memory caching
 * - Request deduplication
 * - Distributed locking
 * - Rate limit handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { createLRUCache } from '@/server/api-helpers'

// Configure runtime
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 30 // OAuth operations can take time
export const dynamic = 'force-dynamic' // User-specific data

// Constants
const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk'
const SESSION_COOKIE_NAME = 'elportal_session'

// Get signing key from environment - copied from session.ts to avoid import issues
const getSigningKey = () => {
  const rawKey = process.env.ELPORTAL_SIGNING_KEY
  if (!rawKey) {
    throw new Error('ELPORTAL_SIGNING_KEY environment variable is not set')
  }
  
  // CRITICAL: Trim any whitespace/newlines
  const key = rawKey.trim()
  
  if (key.length < 32) {
    throw new Error(`Signing key too short: ${key.length} characters (need at least 32)`)
  }
  
  // Try to decode as base64 if it looks like base64
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
    console.error('Session verification failed in eloverblik:', error)
    return null
  }
}

// Get session from request cookies
async function getSessionFromRequest(request: NextRequest): Promise<{ sessionId: string } | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  return verifySession(token)
}

// Helper functions
function isGuidLike(value: string | undefined | null): boolean {
  if (!value) return false
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

function clampDateRange(dateFrom: string, dateTo: string): { from: string; to: string } {
  const to = new Date(dateTo)
  const from = new Date(dateFrom)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  yesterday.setHours(12, 0, 0, 0)
  const clampTarget = yesterday
  let clampedTo = to > clampTarget ? clampTarget : to
  let clampedFrom = from > clampedTo ? new Date(clampedTo.getTime() - 30 * 24 * 60 * 60 * 1000) : from
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(clampedFrom), to: fmt(clampedTo) }
}

// Caches for third-party flow
const tokenCache: { token: string; expiresAt: number } = { token: '', expiresAt: 0 }

// Request deduplication queue
const requestQueue = new Map<string, Promise<any>>()

async function queuedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
  if (requestQueue.has(key)) {
    console.log(`[Eloverblik] Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key)
  }
  
  const promise = fetcher().finally(() => {
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}

// Distributed lock functions
async function acquireLock(key: string, ttl: number = 30): Promise<boolean> {
  try {
    const result = await kv.set(`lock:${key}`, Date.now(), { nx: true, ex: ttl })
    return result !== null
  } catch (e) {
    console.log('[Eloverblik] Failed to acquire lock via KV:', e)
    return true
  }
}

async function releaseLock(key: string): Promise<void> {
  try {
    await kv.del(`lock:${key}`)
  } catch (e) {
    console.log('[Eloverblik] Failed to release lock:', e)
  }
}

// Get third-party access token
async function getThirdPartyAccessToken(refreshToken: string): Promise<string> {
  const now = Date.now()
  
  // Check in-memory cache
  if (tokenCache.token && tokenCache.expiresAt > now + 15_000) {
    return tokenCache.token
  }
  
  const tokenUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/token`
  const tokenResponse = await fetch(tokenUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-version': '1.0',
    },
  })
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Token refresh failed (${tokenResponse.status}): ${errorText}`)
  }
  
  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.result || tokenData.access_token || tokenData.token
  
  if (!accessToken) {
    throw new Error('Invalid token response: missing access token')
  }
  
  tokenCache.token = accessToken
  tokenCache.expiresAt = now + 20 * 60 * 1000
  
  return accessToken
}

// LRU caches with automatic pruning
const authCache = createLRUCache<any>(15 * 60 * 1000, 50) // 15 min TTL, max 50 entries
const meteringPointCache = createLRUCache<{ ids: string[] }>(30 * 60 * 1000, 100) // 30 min TTL
const consumptionCache = createLRUCache<any>(10 * 60 * 1000, 100) // 10 min TTL

// Handle different actions based on query parameter
async function handleAction(request: NextRequest, action: string | null): Promise<NextResponse> {
  const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {}
  
  switch (action) {
    case 'test-config':
      return handleTestConfig()
    case 'test-auth':
      return handleTestAuth()
    case 'get-token':
      return handleGetToken(body)
    case 'get-metering-points':
      return handleGetMeteringPoints(body)
    case 'get-consumption':
      return handleGetConsumption(body)
    case 'thirdparty-authorizations':
      return handleThirdPartyAuthorizations(request)
    case 'thirdparty-consumption':
      return handleThirdPartyConsumption(request, body)
    default:
      return NextResponse.json(
        {
          error: 'Invalid action',
          validActions: [
            'test-config',
            'test-auth',
            'get-token',
            'get-metering-points',
            'get-consumption',
            'thirdparty-authorizations',
            'thirdparty-consumption'
          ]
        },
        { status: 400 }
      )
  }
}

// Test configuration endpoint
function handleTestConfig(): NextResponse {
  const hasToken = !!(process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN)
  
  return NextResponse.json({
    tokenConfigured: hasToken,
    message: hasToken 
      ? 'Refresh token is configured' 
      : 'Refresh token is NOT configured. Please add ELOVERBLIK_API_TOKEN to Vercel environment variables.',
    envVars: {
      ELOVERBLIK_API_TOKEN: !!process.env.ELOVERBLIK_API_TOKEN,
      ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN: !!process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
    }
  })
}

function handleTestAuth(): NextResponse {
  return NextResponse.json({
    message: 'Authorization endpoint is reachable',
    hasToken: !!(process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN),
    action: 'test-auth'
  })
}

// Customer API handlers
async function handleGetToken(body: any): Promise<NextResponse> {
  const { token } = body

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${ELOVERBLIK_API_BASE}/customerapi/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Eloverblik] Error fetching token:', error)
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 })
  }
}

async function handleGetMeteringPoints(body: any): Promise<NextResponse> {
  const { token } = body

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${ELOVERBLIK_API_BASE}/customerapi/api/meteringpoints/meteringpoints`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Eloverblik] Error fetching metering points:', error)
    return NextResponse.json({ error: 'Failed to fetch metering points' }, { status: 500 })
  }
}

async function handleGetConsumption(body: any): Promise<NextResponse> {
  const { token, meteringPoints, dateFrom, dateTo, aggregation = 'Hour' } = body

  if (!token || !meteringPoints || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const requestBody = {
      meteringPoints: {
        meteringPoint: meteringPoints
      }
    }

    const response = await fetch(
      `${ELOVERBLIK_API_BASE}/customerapi/api/meterdata/gettimeseries/${dateFrom}/${dateTo}/${aggregation}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({
      result: data.result,
      dateFrom,
      dateTo,
      aggregation,
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        dataDelay: '1-2 days typical'
      }
    })
  } catch (error) {
    console.error('[Eloverblik] Error fetching consumption:', error)
    return NextResponse.json({ error: 'Failed to fetch consumption data' }, { status: 500 })
  }
}

// Third-party API handlers
async function handleThirdPartyAuthorizations(request: NextRequest): Promise<NextResponse> {
  // SECURITY: Validate session before returning any data
  const session = await getSessionFromRequest(request)
  
  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid session required to access this endpoint'
      },
      { status: 401 }
    )
  }
  
  // Get customer ID linked to this session
  const customerId = await kv.get(`session:${session.sessionId}:customer`)
  
  console.log('[Eloverblik] Session lookup:', {
    sessionId: session.sessionId,
    hasCustomerId: !!customerId,
    customerIdType: typeof customerId,
    customerIdValue: customerId
  })
  
  if (!customerId) {
    return NextResponse.json(
      {
        error: 'No authorization',
        message: 'No customer authorization linked to this session'
      },
      { status: 403 }
    )
  }
  
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
  
  if (!refreshToken) {
    console.error('[Eloverblik] No refresh token found in environment')
    return NextResponse.json(
      {
        error: 'Third-party refresh token not configured',
        message: 'The server is not configured with Eloverblik third-party credentials.'
      },
      { status: 500 }
    )
  }

  try {
    // Get access token using refresh token (cached)
    const accessToken = await getThirdPartyAccessToken(refreshToken)
    
    // Get list of authorized customers
    const authUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorizations`
    console.log('[Eloverblik] Fetching authorizations from:', authUrl)
    
    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0',
      },
    })

    if (authResponse.status === 429) {
      const retryAfter = authResponse.headers.get('Retry-After') || '60'
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'For mange forespørgsler. Vent venligst før du prøver igen.',
          retryAfter: parseInt(retryAfter)
        },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter }
        }
      )
    }
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('[Eloverblik] Authorization fetch failed:', {
        status: authResponse.status,
        error: errorText
      })
      return NextResponse.json(
        {
          error: 'Failed to fetch authorizations',
          status: authResponse.status,
          details: errorText
        },
        { status: authResponse.status }
      )
    }

    const authData = await authResponse.json()
    console.log('[Eloverblik] Raw authorization data:', {
      hasResult: !!authData.result,
      resultCount: authData.result?.length || 0
    })
    
    // For each authorization, fetch metering point IDs
    const authorizationsWithMeteringPoints: Array<{
      authorizationId: string
      customerId: string
      customerKey: string
      customerName: string
      customerCVR: string
      validFrom: string
      validTo: string
      meteringPointIds: string[]
    }> = []
    
    if (authData.result && Array.isArray(authData.result)) {
      for (const auth of authData.result) {
        try {
          let meteringPointIds: string[] = []
          
          // Try fetching by authorizationId first
          const urlAuthId = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/authorizationId/${auth.id}`
          console.log(`[Eloverblik] Fetching metering points for ${auth.id}`)
          
          const meteringResp = await fetch(urlAuthId, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'api-version': '1.0',
            },
          })
          
          if (meteringResp.ok) {
            const meteringData = await meteringResp.json()
            meteringPointIds = meteringData.result || []
          }
          
          // Fallback to CVR if needed
          if ((!meteringResp.ok || meteringPointIds.length === 0) && auth.customerCVR) {
            const urlCVR = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/customerCVR/${auth.customerCVR}`
            console.log(`[Eloverblik] Fallback to CVR for ${auth.customerCVR}`)
            
            const meteringResp2 = await fetch(urlCVR, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'api-version': '1.0',
              },
            })
            
            if (meteringResp2.ok) {
              const meteringData2 = await meteringResp2.json()
              meteringPointIds = meteringData2.result || []
            }
          }
          
          console.log(`[Eloverblik] Found ${meteringPointIds.length} metering points for ${auth.id}`)
          
          authorizationsWithMeteringPoints.push({
            authorizationId: auth.id,
            customerId: auth.customerCVR,
            customerKey: auth.customerCVR,
            customerName: auth.customerName,
            customerCVR: auth.customerCVR,
            validFrom: auth.validFrom,
            validTo: auth.validTo,
            meteringPointIds: meteringPointIds,
          })
        } catch (error) {
          console.error(`[Eloverblik] Error fetching metering points for ${auth.id}:`, error)
          authorizationsWithMeteringPoints.push({
            authorizationId: auth.id,
            customerId: auth.customerCVR,
            customerKey: auth.customerCVR,
            customerName: auth.customerName,
            customerCVR: auth.customerCVR,
            validFrom: auth.validFrom,
            validTo: auth.validTo,
            meteringPointIds: [],
          })
        }
      }
    }
    
    // SECURITY: Filter to only return data for the authenticated customer
    const customerIdStr = String(customerId)
    
    console.log('[Eloverblik] Matching authorization for customer:', {
      lookingFor: customerIdStr,
      availableAuths: authorizationsWithMeteringPoints.map(a => a.authorizationId)
    })
    
    const userAuthorization = authorizationsWithMeteringPoints.find((auth: any) => 
      auth.customerCVR === customerIdStr || 
      auth.customerId === customerIdStr ||
      auth.authorizationId === customerIdStr
    )
    
    if (!userAuthorization) {
      console.error('[Eloverblik] No matching authorization found')
      return NextResponse.json(
        {
          error: 'Authorization not found',
          message: 'No authorization found for your account'
        },
        { status: 404 }
      )
    }
    
    console.log('[Eloverblik] Found matching authorization:', {
      authorizationId: userAuthorization.authorizationId,
      meteringPoints: userAuthorization.meteringPointIds?.length || 0
    })
    
    const responseData = {
      authorizations: [userAuthorization],
      metadata: {
        fetchedAt: new Date().toISOString(),
        count: 1,
        sessionId: session.sessionId
      }
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'X-Session-Protected': 'true',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    })
  } catch (error) {
    console.error('[Eloverblik] Error in third-party authorization:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch third-party authorizations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleThirdPartyConsumption(request: NextRequest, body: any): Promise<NextResponse> {
  // SECURITY: Validate session before returning any data
  const session = await getSessionFromRequest(request)
  
  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid session required to access this endpoint'
      },
      { status: 401 }
    )
  }
  
  // Get customer ID linked to this session
  const sessionCustomerId = await kv.get(`session:${session.sessionId}:customer`)
  
  if (!sessionCustomerId) {
    return NextResponse.json(
      {
        error: 'No authorization',
        message: 'No customer authorization linked to this session'
      },
      { status: 403 }
    )
  }

  const { 
    authorizationId, 
    customerCVR, 
    customerId, 
    customerKey, 
    meteringPointIds, 
    dateFrom, 
    dateTo, 
    aggregation = 'Day' 
  } = body
  
  // SECURITY: Verify the requested customer matches the session
  const sessionCustomerIdStr = String(sessionCustomerId)
  const requestedCustomer = authorizationId || customerCVR || customerKey || customerId
  const requestedCustomerStr = requestedCustomer ? String(requestedCustomer) : null
  
  console.log('[Eloverblik] Consumption security check:', {
    sessionCustomerId: sessionCustomerIdStr,
    requestedCustomer: requestedCustomerStr
  })
  
  if (requestedCustomerStr && requestedCustomerStr !== sessionCustomerIdStr) {
    console.error('[Eloverblik] Consumption access denied - customer mismatch')
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'You can only access your own consumption data'
      },
      { status: 403 }
    )
  }
  
  const identifier = sessionCustomerIdStr
  const scope = isGuidLike(identifier) ? 'authorizationId' : 'customerCVR'
  
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Third-party refresh token not configured' },
      { status: 500 }
    )
  }

  if (!identifier || !dateFrom || !dateTo) {
    return NextResponse.json(
      {
        error: 'Missing required parameters',
        required: ['authorizationId/customerCVR/customerKey/customerId', 'dateFrom', 'dateTo'],
        received: { authorizationId, customerCVR, customerKey, customerId, dateFrom, dateTo }
      },
      { status: 400 }
    )
  }

  // Clamp dates to valid window
  const { from: safeFrom, to: safeTo } = clampDateRange(dateFrom, dateTo)
  console.log(`[Eloverblik] Fetching consumption for ${identifier}, dates: ${safeFrom} to ${safeTo}`)

  try {
    // Get access token with deduplication
    const accessToken = await queuedFetch(
      'token_refresh',
      () => getThirdPartyAccessToken(refreshToken)
    )
    
    // Check if metering points were passed directly
    let finalMeteringPointIds: string[] | undefined = meteringPointIds
    
    if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
      // Check cache
      const cacheKey = authorizationId && isGuidLike(authorizationId) ? authorizationId : undefined
      const cached = cacheKey ? meteringPointCache.get(cacheKey) : undefined
      
      if (cached) {
        finalMeteringPointIds = cached.ids
      } else {
        // Fetch metering points
        const meteringPointUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/${scope}/${identifier}`
        console.log(`[Eloverblik] Fetching metering points from: ${meteringPointUrl}`)
        
        const meteringResponse = await fetch(meteringPointUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'api-version': '1.0',
          },
        })

        if (meteringResponse.ok) {
          const meteringData = await meteringResponse.json()
          finalMeteringPointIds = meteringData.result || []
          
          if (cacheKey && finalMeteringPointIds.length > 0) {
            meteringPointCache.set(cacheKey, { ids: finalMeteringPointIds })
          }
        }
      }
    }
    
    if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
      return NextResponse.json(
        {
          error: 'No metering points found for customer',
          identifier,
          scope
        },
        { status: 404 }
      )
    }

    console.log(`[Eloverblik] Using ${finalMeteringPointIds.length} metering points`)

    // Check in-memory cache
    const memCacheKey = JSON.stringify({ 
      identifier, 
      safeFrom, 
      safeTo, 
      aggregation, 
      mp: finalMeteringPointIds.slice(0, 10) 
    })
    const cachedConsumption = consumptionCache.get(memCacheKey)
    
    if (cachedConsumption) {
      console.log('[Eloverblik] Returning cached consumption')
      return NextResponse.json(cachedConsumption)
    }

    // Get consumption data
    const consumptionUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/meterdata/gettimeseries/${safeFrom}/${safeTo}/${aggregation}`
    console.log(`[Eloverblik] Fetching consumption from: ${consumptionUrl}`)
    
    const requestBody = {
      meteringPoints: {
        meteringPoint: finalMeteringPointIds
      }
    }

    // Use queued fetch with retry logic
    const consumptionResult = await queuedFetch(
      `consumption_${identifier}_${safeFrom}_${safeTo}`,
      async () => {
        const maxAttempts = 3
        const baseDelayMs = 1000
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const response = await fetch(consumptionUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-version': '1.0',
            },
            body: JSON.stringify(requestBody),
          })

          if (response.ok) {
            const data = await response.json()
            return { data, status: 200 }
          }

          const status = response.status
          const body = await response.text()
          
          console.warn(`[Eloverblik] Consumption request failed (${status}) attempt ${attempt}/${maxAttempts}`)
          
          if ((status === 429 || status === 503) && attempt < maxAttempts) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1)
            await new Promise(r => setTimeout(r, delay))
            continue
          }
          
          return { data: null, status, body }
        }
        
        return { data: null, status: 500, body: 'Max attempts reached' }
      }
    )
    
    if (consumptionResult.status !== 200 || !consumptionResult.data) {
      console.error('[Eloverblik] Failed to fetch consumption data')
      return NextResponse.json(
        {
          error: 'Failed to fetch consumption data',
          details: consumptionResult.body
        },
        { status: consumptionResult.status || 500 }
      )
    }

    // Compute total consumption
    let totalConsumption = 0
    try {
      if (Array.isArray(consumptionResult.data.result)) {
        for (const mp of consumptionResult.data.result) {
          const tsList = mp?.MyEnergyData_MarketDocument?.TimeSeries
          if (Array.isArray(tsList)) {
            for (const ts of tsList) {
              const periods = ts?.Period
              if (Array.isArray(periods)) {
                for (const p of periods) {
                  const points = p?.Point
                  if (Array.isArray(points)) {
                    for (const point of points) {
                      const qty = parseFloat(point?.['out_Quantity.quantity'] || '0')
                      if (!Number.isNaN(qty)) totalConsumption += qty
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch {}

    const payload = {
      result: consumptionResult.data.result,
      dateFrom: safeFrom,
      dateTo: safeTo,
      aggregation,
      meteringPoints: finalMeteringPointIds,
      authorizationId,
      customerCVR,
      customerKey: customerCVR,
      customerId: customerCVR,
      identifier,
      totalConsumption,
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        fetchedAt: new Date().toISOString()
      }
    }

    // Cache in memory only (instance-specific)
    consumptionCache.set(memCacheKey, payload)
    
    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS-SECURITY',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    })
  } catch (error) {
    console.error('[Eloverblik] Error fetching consumption:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch consumption data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Main route handlers
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')
  
  try {
    return await handleAction(request, action)
  } catch (error) {
    console.error('[Eloverblik] Error in GET handler:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        action
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')
  
  try {
    return await handleAction(request, action)
  } catch (error) {
    console.error('[Eloverblik] Error in POST handler:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        action
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    }
  })
}