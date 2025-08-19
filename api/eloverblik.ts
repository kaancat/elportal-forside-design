import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'
import { jwtVerify } from 'jose'
import { parse } from 'cookie'

// 🔐 SECURITY: This integration now uses session-based authentication
// to ensure complete user data isolation. Each user must have a valid
// session and can only access their own data.
//
// Consolidated Eloverblik API handler with secure session management
// All endpoints require authenticated sessions to prevent data leakage

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

// Verify and decode a session token - copied from session.ts
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

// Get session from request cookies - copied from session.ts
async function getSessionFromRequest(req: VercelRequest): Promise<{ sessionId: string } | null> {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[SESSION_COOKIE_NAME]
  
  if (!token) {
    return null
  }
  
  return verifySession(token)
}

// Simple helpers and caches for third-party flow
// WHAT: Detects if a string is a GUID/UUID (authorizationId format)
// WHY: We need to decide the correct scope when querying metering points
function isGuidLike(value: string | undefined | null): boolean {
  if (!value) return false
  // Loose check: 8-4-4-4-12 hex segments
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

// WHAT: Validates and clamps date range to avoid future dates rejected by Eloverblik (error 30003)
// WHY: API requires dateTo <= yesterday
function clampDateRange(dateFrom: string, dateTo: string): { from: string; to: string } {
  const to = new Date(dateTo)
  const from = new Date(dateFrom)
  const now = new Date()
  // Define yesterday in local time, then format as YYYY-MM-DD (UTC date part)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  // Normalize to noon local to avoid UTC date flip
  yesterday.setHours(12, 0, 0, 0)
  const clampTarget = yesterday
  let clampedTo = to > clampTarget ? clampTarget : to
  // If from > to after clamping, move from to 30 days before clampedTo
  let clampedFrom = from > clampedTo ? new Date(clampedTo.getTime() - 30 * 24 * 60 * 60 * 1000) : from
  // Format YYYY-MM-DD from ISO
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(clampedFrom), to: fmt(clampedTo) }
}

// WHAT: Caches short-lived third-party access token in memory
// WHY: Reduce token refresh calls and chance of 429s
const tokenCache: { token: string; expiresAt: number } = { token: '', expiresAt: 0 }

// Global request deduplication queue
// WHAT: Prevents duplicate in-flight requests for the same resource
// WHY: Multiple browser tabs or rapid refreshes can trigger duplicate API calls causing 429s
const requestQueue = new Map<string, Promise<any>>()

async function queuedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
  // If request already in flight, return the same promise
  if (requestQueue.has(key)) {
    console.log(`Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key)
  }
  
  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after 100ms to handle rapid retries
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}

// Distributed lock for preventing duplicate requests across instances
async function acquireLock(key: string, ttl: number = 30): Promise<boolean> {
  try {
    // NX flag ensures "set if not exists" - returns null if key already exists
    const result = await kv.set(`lock:${key}`, Date.now(), { nx: true, ex: ttl })
    return result !== null
  } catch (e) {
    console.log('Failed to acquire lock via KV:', e)
    return true // If KV fails, proceed anyway to maintain availability
  }
}

async function releaseLock(key: string): Promise<void> {
  try {
    await kv.del(`lock:${key}`)
  } catch (e) {
    // Ignore errors when releasing lock
    console.log('Failed to release lock:', e)
  }
}

// WHAT: Retrieve third-party access token using refresh token with KV + in-memory caching
// WHY: Every third-party call requires an access token; caching reduces rate-limit risk
async function getThirdPartyAccessToken(refreshToken: string): Promise<string> {
  const now = Date.now()
  
  // SECURITY: Token is shared across all users (third-party API)
  // Only use in-memory cache to reduce API calls, not KV
  // This is acceptable since the token is not user-specific
  
  // Check in-memory cache (per-instance fallback)
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
  if (!accessToken) throw new Error('Invalid token response: missing access token')
  
  // Store ONLY in in-memory cache
  tokenCache.token = accessToken
  tokenCache.expiresAt = now + 20 * 60 * 1000
  // SECURITY: Token caching in memory only - it's shared but not user-specific
  
  return accessToken
}

// Customer API handlers (for testing with personal tokens)
async function handleGetToken(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
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
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching token:', error)
    return res.status(500).json({ error: 'Failed to fetch token' })
  }
}

async function handleGetMeteringPoints(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
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
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching metering points:', error)
    return res.status(500).json({ error: 'Failed to fetch metering points' })
  }
}

async function handleGetConsumption(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, meteringPoints, dateFrom, dateTo, aggregation = 'Hour' } = req.body

  if (!token || !meteringPoints || !dateFrom || !dateTo) {
    return res.status(400).json({ error: 'Missing required parameters' })
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
      return res.status(response.status).json({ error })
    }

    const data = await response.json()
    return res.status(200).json({
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
    console.error('Error fetching consumption:', error)
    return res.status(500).json({ error: 'Failed to fetch consumption data' })
  }
}

// Simple in-memory cache to prevent rate limiting
const authCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes - increased from 5 to reduce API calls

// Third-party API handlers
async function handleThirdPartyAuthorizations(req: VercelRequest, res: VercelResponse) {
  // SECURITY: Validate session before returning any data
  const session = await getSessionFromRequest(req)
  
  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid session required to access this endpoint'
    })
  }
  
  // Get customer ID linked to this session
  const customerId = await kv.get(`session:${session.sessionId}:customer`)
  
  console.log('🔍 Session lookup:', {
    sessionId: session.sessionId,
    hasCustomerId: !!customerId,
    customerIdType: typeof customerId,
    customerIdValue: customerId
  })
  
  if (!customerId) {
    return res.status(403).json({
      error: 'No authorization',
      message: 'No customer authorization linked to this session'
    })
  }
  
  // Try both possible environment variable names
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  console.log('📡 Fetching authorizations for session:', {
    sessionId: session.sessionId,
    customerId: customerId,
    hasRefreshToken: !!refreshToken
  })
  
  if (!refreshToken) {
    console.error('Neither ELOVERBLIK_API_TOKEN nor ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN found in environment variables')
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured',
      message: 'The server is not configured with Eloverblik third-party credentials. Please set ELOVERBLIK_API_TOKEN in Vercel environment variables.'
    })
  }

  console.log('Refresh token found, attempting to get access token...')

  try {
    // Get access token using refresh token (cached)
    const accessToken = await getThirdPartyAccessToken(refreshToken)
    console.log('Access token received successfully')

    if (!accessToken) {
      console.error('No access token in response')
      return res.status(500).json({ 
        error: 'Invalid token response',
        details: 'No access token found in response'
      })
    }

    // Get list of authorized customers (power of attorney)
    // According to Swagger docs, the correct endpoint is:
    const authUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorizations`
    console.log('Fetching authorizations from:', authUrl)
    
    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0', // Required header
      },
    })

    if (authResponse.status === 429) {
      // Rate limited - return with retry-after header
      const retryAfter = authResponse.headers.get('Retry-After') || '60'
      res.setHeader('Retry-After', retryAfter)
      console.error('Authorization fetch failed: Rate limited (429)')
      return res.status(429).json({ 
        error: 'Too Many Requests',
        message: 'For mange forespørgsler. Vent venligst før du prøver igen.',
        retryAfter: parseInt(retryAfter)
      })
    }
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('Authorization fetch failed:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        error: errorText
      })
      return res.status(authResponse.status).json({ 
        error: 'Failed to fetch authorizations',
        status: authResponse.status,
        details: errorText 
      })
    }

    const authData = await authResponse.json()
    console.log('📋 Raw authorization data from Eloverblik:', {
      hasResult: !!authData.result,
      resultCount: authData.result?.length || 0,
      firstAuth: authData.result?.[0] ? {
        id: authData.result[0].id,
        customerCVR: authData.result[0].customerCVR,
        customerName: authData.result[0].customerName,
        allFields: Object.keys(authData.result[0])
      } : null
    })
    
    // For each authorization, fetch metering point IDs
    const authorizationsWithMeteringPoints: Array<{
      authorizationId: string;
      customerId: string;
      customerKey: string;
      customerName: string;
      customerCVR: string;
      validFrom: string;
      validTo: string;
      meteringPointIds: string[];
    }> = []
    
    if (authData.result && Array.isArray(authData.result)) {
      for (const auth of authData.result) {
        try {
          // Prefer fetching metering points using authorizationId scope
          let meteringPointIds: string[] = []
          const urlAuthId = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/authorizationId/${auth.id}`
          console.log(`Fetching metering points (authorizationId) for ${auth.id}`)
          const meteringResp1 = await fetch(urlAuthId, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'api-version': '1.0',
            },
          })
          if (meteringResp1.ok) {
            const meteringData = await meteringResp1.json()
            meteringPointIds = meteringData.result || []
          }
          // Fallback: some accounts may require CVR scope
          if ((!meteringResp1.ok || meteringPointIds.length === 0) && auth.customerCVR) {
            const urlCVR = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/customerCVR/${auth.customerCVR}`
            console.log(`Fallback fetching metering points (customerCVR) for CVR ${auth.customerCVR}`)
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
          console.log(`Found ${meteringPointIds.length} metering points for authorization ${auth.id}`)
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
          console.error(`Error fetching metering points for authorization ${auth.id}:`, error)
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
    // CRITICAL: Convert customerId to string for comparison since auth IDs are strings
    const customerIdStr = String(customerId)
    
    console.log('🔐 Matching authorization for customer:', {
      lookingFor: customerId,
      lookingForAsString: customerIdStr,
      customerIdType: typeof customerId,
      availableAuths: authorizationsWithMeteringPoints.map(auth => ({
        authorizationId: auth.authorizationId,
        customerCVR: auth.customerCVR,
        customerId: auth.customerId,
        wouldMatch: {
          byCVR: auth.customerCVR === customerIdStr,
          byCustomerId: auth.customerId === customerIdStr,
          byAuthId: auth.authorizationId === customerIdStr
        }
      }))
    })
    
    const userAuthorization = authorizationsWithMeteringPoints.find((auth: any) => 
      auth.customerCVR === customerIdStr || 
      auth.customerId === customerIdStr ||
      auth.authorizationId === customerIdStr
    )
    
    if (!userAuthorization) {
      console.error('❌ No matching authorization found:', {
        searchedFor: customerId,
        searchedForAsString: customerIdStr,
        availableIds: authorizationsWithMeteringPoints.map(a => ({
          authId: a.authorizationId,
          authIdType: typeof a.authorizationId,
          cvr: a.customerCVR,
          custId: a.customerId
        }))
      })
      return res.status(404).json({
        error: 'Authorization not found',
        message: 'No authorization found for your account',
        debug: process.env.NODE_ENV === 'development' ? {
          lookingFor: customerIdStr,
          available: authorizationsWithMeteringPoints.map(a => a.authorizationId)
        } : undefined
      })
    }
    
    console.log('✅ Found matching authorization:', {
      authorizationId: userAuthorization.authorizationId,
      customerCVR: userAuthorization.customerCVR,
      customerName: userAuthorization.customerName,
      meteringPoints: userAuthorization.meteringPointIds?.length || 0
    })
    
    const responseData = {
      authorizations: [userAuthorization], // Only return this user's data
      metadata: {
        fetchedAt: new Date().toISOString(),
        count: 1,
        sessionId: session.sessionId
      }
    }
    
    // Add security headers
    res.setHeader('X-Session-Protected', 'true')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    return res.status(200).json(responseData)
  } catch (error) {
    console.error('Error in third-party authorization:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch third-party authorizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// In-memory cache for metering points keyed by authorizationId
// WHAT: Avoid redundant metering point lookups per authorization
// WHY: Reduce Eloverblik calls and 429s
const meteringPointCache = new Map<string, { ids: string[]; timestamp: number }>()
const METERING_POINT_TTL = 30 * 60 * 1000 // 30 minutes - increased from 15 to reduce API calls

// In-memory cache for consumption responses keyed by identifier/date/aggregation
// WHAT: Avoid repeated identical timeseries calls that can trigger 429s
// WHY: Users may reload quickly; cache for a short period
// SECURITY: This is instance-specific (not distributed), so data won't leak across instances
// However, within the same instance, users with the same authorizationId could see cached data
// This is acceptable since authorizationId represents permission to see that customer's data
const consumptionCache = new Map<string, { payload: any; timestamp: number }>()
const CONSUMPTION_TTL = 10 * 60 * 1000 // 10 minutes - increased from 2 to significantly reduce API calls

async function handleThirdPartyConsumption(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // SECURITY: Validate session before returning any data
  const session = await getSessionFromRequest(req)
  
  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid session required to access this endpoint'
    })
  }
  
  // Get customer ID linked to this session
  const sessionCustomerId = await kv.get(`session:${session.sessionId}:customer`)
  
  if (!sessionCustomerId) {
    return res.status(403).json({
      error: 'No authorization',
      message: 'No customer authorization linked to this session'
    })
  }

  // Accept multiple identifiers for flexibility
  const { authorizationId, customerCVR, customerId, customerKey, meteringPointIds, dateFrom, dateTo, aggregation = 'Day' } = req.body
  
  // SECURITY: Verify the requested customer matches the session
  // CRITICAL: Convert both to strings for comparison to avoid type mismatch
  const sessionCustomerIdStr = String(sessionCustomerId)
  const requestedCustomer = authorizationId || customerCVR || customerKey || customerId
  const requestedCustomerStr = requestedCustomer ? String(requestedCustomer) : null
  
  console.log('🔒 Consumption security check:', {
    sessionCustomerId: sessionCustomerIdStr,
    sessionCustomerIdType: typeof sessionCustomerId,
    requestedCustomer: requestedCustomerStr,
    requestedCustomerType: typeof requestedCustomer,
    authorizationId,
    customerCVR,
    customerId,
    customerKey,
    willMatch: requestedCustomerStr === sessionCustomerIdStr || !requestedCustomerStr
  })
  
  if (requestedCustomerStr && requestedCustomerStr !== sessionCustomerIdStr) {
    console.error('❌ Consumption access denied - customer mismatch:', {
      requested: requestedCustomerStr,
      session: sessionCustomerIdStr
    })
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You can only access your own consumption data'
    })
  }
  
  // Use session customer ID for the request
  const identifier = sessionCustomerIdStr
  // Decide scope smartly: GUID => authorizationId, 8 digits => customerCVR
  const scope = isGuidLike(identifier) ? 'authorizationId' : 'customerCVR'
  
  console.log('Consumption request received:', {
    authorizationId,
    customerCVR,
    customerId,
    customerKey,
    meteringPointIds,
    identifier,
    scope,
    dateFrom,
    dateTo
  })
  
  // Try both possible environment variable names
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  if (!refreshToken) {
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured'
    })
  }

  if (!identifier || !dateFrom || !dateTo) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      required: ['authorizationId/customerCVR/customerKey/customerId', 'dateFrom', 'dateTo'],
      received: { authorizationId, customerCVR, customerKey, customerId, dateFrom, dateTo }
    })
  }

  // Clamp dates to valid window
  const { from: safeFrom, to: safeTo } = clampDateRange(dateFrom, dateTo)
  console.log(`Fetching consumption for identifier: ${identifier} (scope: ${scope}), dates: ${safeFrom} to ${safeTo}`)

  try {
    // Get access token with deduplication to prevent multiple simultaneous token refreshes
    const accessToken = await queuedFetch(
      'token_refresh',
      () => getThirdPartyAccessToken(refreshToken)
    )
    
    if (!accessToken) {
      console.error('No access token in response')
      return res.status(500).json({ 
        error: 'Invalid token response',
        details: 'No access token found in response'
      })
    }

    // Check if metering points were passed directly (from frontend cache)
    let finalMeteringPointIds: string[] | undefined = meteringPointIds
    
    if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
      // Use cache by authorizationId when possible
      const cacheKey = authorizationId && isGuidLike(authorizationId) ? authorizationId : undefined
      const cached = cacheKey ? meteringPointCache.get(cacheKey) : undefined
      if (cached && Date.now() - cached.timestamp < METERING_POINT_TTL) {
        finalMeteringPointIds = cached.ids
      } else {
        // Only fetch metering points if not provided
        const meteringPointUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/${scope}/${identifier}`
        console.log(`Fetching metering points from: ${meteringPointUrl}`)
        const meteringResponse = await fetch(meteringPointUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'api-version': '1.0',
          },
        })

        // Attempt fallback if first scope returns 404 or empty
        let meteringData: any = null
        if (meteringResponse.ok) {
          meteringData = await meteringResponse.json()
          finalMeteringPointIds = meteringData.result || []
        }
        if ((!meteringResponse.ok || !finalMeteringPointIds || finalMeteringPointIds.length === 0) && customerCVR) {
          const fallbackUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/customerCVR/${customerCVR}`
          console.log(`Fallback fetching metering points by CVR: ${customerCVR}`)
          const fallbackResp = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'api-version': '1.0',
            },
          })
          if (fallbackResp.ok) {
            const fallbackData = await fallbackResp.json()
            finalMeteringPointIds = fallbackData.result || []
          }
        }

        if (cacheKey && finalMeteringPointIds && finalMeteringPointIds.length > 0) {
          meteringPointCache.set(cacheKey, { ids: finalMeteringPointIds, timestamp: Date.now() })
        }

        if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
          const errorText = !meteringResponse.ok ? await meteringResponse.text() : 'Empty metering point list'
          return res.status(meteringResponse.status || 404).json({
            error: 'No metering points found for customer',
            identifier,
            scope,
            details: errorText,
          })
        }
      }
    }
    
    if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
      return res.status(404).json({ 
        error: 'No metering points found for customer',
        identifier,
        scope,
        meteringPointIds: finalMeteringPointIds
      })
    }

    console.log(`Using ${finalMeteringPointIds.length} metering points:`, finalMeteringPointIds)

    // Get consumption data using the third-party timeseries endpoint
    // According to Swagger docs, this is a POST request with path parameters
    const consumptionUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/meterdata/gettimeseries/${safeFrom}/${safeTo}/${aggregation}`
    console.log(`Fetching consumption from: ${consumptionUrl}`)
    
    // Prepare request body with metering points
    const requestBody = {
      meteringPoints: {
        meteringPoint: finalMeteringPointIds
      }
    }

    // SECURITY: NEVER cache user-specific consumption data in KV!
    // This would leak personal data across different users
    // Only use in-memory cache which is instance-specific
    
    // Check in-memory cache as fallback
    const memCacheKey = JSON.stringify({ identifier, safeFrom, safeTo, aggregation, mp: finalMeteringPointIds.slice(0, 10) })
    const cachedConsumption = consumptionCache.get(memCacheKey)
    if (cachedConsumption && Date.now() - cachedConsumption.timestamp < CONSUMPTION_TTL) {
      console.log('Returning in-memory cached consumption response')
      return res.status(200).json(cachedConsumption.payload)
    }

    // Retry/backoff for 429/503 as recommended by docs
    const maxAttempts = 3
    const baseDelayMs = 1000
    let lastStatus = 0
    let lastBody = ''
    let consumptionData: any = null
    
    // Use queued fetch to prevent duplicate consumption requests
    const consumptionResult = await queuedFetch(
      `consumption_${identifier}_${safeFrom}_${safeTo}`,
      async () => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const response = await fetch(consumptionUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'api-version': '1.0',
              // Optionally pass a correlation id; useful for support
              // 'X-User-Correlation-ID': crypto.randomUUID(),
            },
            body: JSON.stringify(requestBody),
          })

          if (response.ok) {
            const data = await response.json()
            return { data, status: 200, body: '' }
          }

          lastStatus = response.status
          lastBody = await response.text()
          console.warn(`Consumption request failed (status ${lastStatus}) attempt ${attempt}/${maxAttempts}`)
          if ((lastStatus === 429 || lastStatus === 503) && attempt < maxAttempts) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1) // 1s, 2s
            await new Promise(r => setTimeout(r, delay))
            continue
          } else {
            break
          }
        }
        return { data: null, status: lastStatus, body: lastBody }
      }
    )
    
    consumptionData = consumptionResult.data
    lastStatus = consumptionResult.status
    lastBody = consumptionResult.body

    if (lastStatus !== 200 || !consumptionData) {
      console.error('Failed to fetch consumption data:', { status: lastStatus, body: lastBody })
      const retrySeconds = lastStatus === 429 || lastStatus === 503 ? 60 : undefined
      return res.status(lastStatus || 500).json({ 
        error: 'Failed to fetch consumption data',
        details: lastBody,
        suggestedRetrySeconds: retrySeconds
      })
    }

    console.log('Consumption data received successfully')

    // Compute total consumption in kWh for convenience
    let totalConsumption = 0
    try {
      if (Array.isArray(consumptionData.result)) {
        for (const mp of consumptionData.result) {
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
      result: consumptionData.result,
      dateFrom: safeFrom,
      dateTo: safeTo,
      aggregation,
      meteringPoints: finalMeteringPointIds,
      authorizationId,
      customerCVR,
      customerKey: customerCVR, // Keep for backwards compatibility
      customerId: customerCVR, // Keep for backwards compatibility
      identifier,
      totalConsumption,
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        fetchedAt: new Date().toISOString()
      }
    }

    // Store ONLY in in-memory cache (instance-specific, no cross-user leakage)
    consumptionCache.set(memCacheKey, { payload, timestamp: Date.now() })
    // SECURITY: Never cache personal consumption data in KV!
    
    // Add security headers
    res.setHeader('X-Cache', 'MISS-SECURITY')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    return res.status(200).json(payload)
  } catch (error) {
    console.error('Error fetching third-party consumption:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch consumption data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Handler for fetching metering point details including address
async function handleThirdPartyMeteringPointDetails(req: VercelRequest, res: VercelResponse) {
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
  
  if (!refreshToken) {
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured'
    })
  }

  const { meteringPointIds } = req.body
  
  if (!meteringPointIds || !Array.isArray(meteringPointIds) || meteringPointIds.length === 0) {
    return res.status(400).json({ 
      error: 'Missing or invalid meteringPointIds array'
    })
  }

  try {
    // Get access token
    const accessToken = await getThirdPartyAccessToken(refreshToken)
    
    if (!accessToken) {
      return res.status(500).json({ 
        error: 'Invalid token response'
      })
    }

    // Fetch details for first metering point (usually residential customers have just one)
    const meteringPointId = meteringPointIds[0]
    const detailsUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/meteringpoint/getdetails`
    
    const detailsResponse = await fetch(detailsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0',
      },
      body: JSON.stringify({
        meteringPoints: {
          meteringPoint: [meteringPointId]
        }
      })
    })

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text()
      console.error('Failed to fetch metering point details:', errorText)
      return res.status(detailsResponse.status).json({ 
        error: 'Failed to fetch metering point details',
        details: errorText
      })
    }

    const detailsData = await detailsResponse.json()
    console.log('Full metering point details response:', JSON.stringify(detailsData, null, 2))
    
    // Extract address information from the first result
    if (detailsData.result && detailsData.result.length > 0) {
      const details = detailsData.result[0]
      
      // First try the direct address fields
      let streetName = details.streetName
      let buildingNumber = details.buildingNumber
      let postcode = details.postcode
      let cityName = details.cityName
      let floorId = details.floorId
      let roomId = details.roomId
      
      // If direct fields are empty, try contactAddresses
      if ((!streetName || !cityName) && details.contactAddresses && details.contactAddresses.length > 0) {
        const contactAddr = details.contactAddresses[0]
        console.log('Using contact address instead:', contactAddr)
        streetName = streetName || contactAddr.streetName
        buildingNumber = buildingNumber || contactAddr.buildingNumber
        postcode = postcode || contactAddr.postcode
        cityName = cityName || contactAddr.cityName
      }
      
      console.log('Final address details:', {
        streetName,
        buildingNumber,
        postcode,
        cityName,
        floorId,
        roomId
      })
      
      // Build address parts array to avoid empty commas
      const addressParts: string[] = []
      
      // Street and building
      const streetPart = [streetName, buildingNumber]
        .filter(part => part && part.trim())
        .join(' ')
      if (streetPart) addressParts.push(streetPart)
      
      // Floor and room (format as "2. sal" or "st. tv" etc.)
      const floorRoom: string[] = []
      if (floorId && floorId.trim()) {
        floorRoom.push(floorId.trim())
      }
      if (roomId && roomId.trim()) {
        floorRoom.push(roomId.trim())
      }
      const floorRoomStr = floorRoom.join(' ')
      if (floorRoomStr) addressParts.push(floorRoomStr)
      
      // Postcode and city
      const cityPart = [postcode, cityName]
        .filter(part => part && part.trim())
        .join(' ')
      if (cityPart) addressParts.push(cityPart)
      
      // If we have no address parts at all, try to use any available info
      let fullAddress = addressParts.join(', ')
      if (!fullAddress && details.locationDescription) {
        fullAddress = details.locationDescription
      }
      if (!fullAddress && cityName) {
        fullAddress = cityName // At least show the city
      }
      if (!fullAddress) {
        fullAddress = 'Adresse ikke tilgængelig'
      }
      
      const address = {
        streetName: streetName || '',
        buildingNumber: buildingNumber || '',
        floorId: floorId || '',
        roomId: roomId || '',
        postcode: postcode || '',
        cityName: cityName || '',
        citySubDivisionName: details.citySubDivisionName || '',
        municipalityCode: details.municipalityCode || '',
        locationDescription: details.locationDescription || '',
        fullAddress: fullAddress
      }
      
      return res.status(200).json({
        meteringPointId,
        address,
        metadata: {
          fetchedAt: new Date().toISOString()
        }
      })
    } else {
      // No result found, but still return something
      console.log('No metering point details found in response')
      return res.status(200).json({
        meteringPointId: meteringPointIds[0],
        address: {
          streetName: '',
          buildingNumber: '',
          floorId: '',
          roomId: '',
          postcode: '',
          cityName: '',
          citySubDivisionName: '',
          municipalityCode: '',
          locationDescription: '',
          fullAddress: 'Adresse ikke tilgængelig'
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          note: 'No details found from API'
        }
      })
    }
  } catch (error) {
    console.error('Error fetching metering point details:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch metering point details',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Main handler that routes to appropriate function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Route based on action parameter
  const { action } = req.query

  // Test endpoint to check if token is configured
  if (action === 'test-config') {
    const hasToken = !!(process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN)
    return res.status(200).json({
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
  
  // Debug endpoint to test authorization endpoint
  if (action === 'test-auth') {
    return res.status(200).json({
      message: 'Authorization endpoint is reachable',
      hasToken: !!(process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN),
      action: 'test-auth'
    })
  }

  try {
    switch (action) {
      case 'get-token':
        return await handleGetToken(req, res)
      case 'get-metering-points':
        return await handleGetMeteringPoints(req, res)
      case 'get-consumption':
        return await handleGetConsumption(req, res)
      case 'thirdparty-authorizations':
        return await handleThirdPartyAuthorizations(req, res)
      case 'thirdparty-consumption':
        return await handleThirdPartyConsumption(req, res)
      // Address endpoint removed - not needed
      // case 'thirdparty-meteringpoint-details':
      //   return await handleThirdPartyMeteringPointDetails(req, res)
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: [
            'test-config',
            'get-token',
            'get-metering-points', 
            'get-consumption',
            'thirdparty-authorizations',
            'thirdparty-consumption'
            // 'thirdparty-meteringpoint-details' - removed, not needed
          ]
        })
    }
  } catch (error) {
    console.error('Error in eloverblik handler:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      action: action
    })
  }
}