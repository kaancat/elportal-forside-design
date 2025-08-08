import { VercelRequest, VercelResponse } from '@vercel/node'

// Consolidated Eloverblik API handler to reduce serverless function count
// Combines all Eloverblik endpoints into a single function

const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk'

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
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Third-party API handlers
async function handleThirdPartyAuthorizations(req: VercelRequest, res: VercelResponse) {
  // Check cache first
  const cacheKey = 'authorizations'
  const cached = authCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached authorizations')
    return res.status(200).json(cached.data)
  }

  // Try both possible environment variable names
  const refreshToken = process.env.ELOVERBLIK_API_TOKEN || process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  console.log('Checking for refresh token...')
  
  if (!refreshToken) {
    console.error('Neither ELOVERBLIK_API_TOKEN nor ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN found in environment variables')
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured',
      message: 'The server is not configured with Eloverblik third-party credentials. Please set ELOVERBLIK_API_TOKEN in Vercel environment variables.'
    })
  }

  console.log('Refresh token found, attempting to get access token...')

  try {
    // Get access token using refresh token
    // According to Swagger docs, third-party token endpoint is /thirdpartyapi/api/token
    const tokenUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/token`
    console.log('Requesting access token from:', tokenUrl)
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0', // Required header
      },
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token refresh failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to refresh access token',
        status: tokenResponse.status,
        details: errorText 
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('Access token received successfully')
    const accessToken = tokenData.result || tokenData.access_token || tokenData.token

    if (!accessToken) {
      console.error('No access token in response:', tokenData)
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
    console.log('Raw authorization data from Eloverblik:', authData) // Debug log
    
    // For each authorization, fetch metering point IDs
    const authorizationsWithMeteringPoints = []
    
    if (authData.result && Array.isArray(authData.result)) {
      for (const auth of authData.result) {
        try {
          // Fetch metering point IDs using authorization ID
          // According to Swagger, we can use authorizationId, customerCVR, or customerKey as scope
          const meteringPointUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/authorizationId/${auth.id}`
          console.log(`Fetching metering points for authorization ${auth.id}`)
          
          const meteringResponse = await fetch(meteringPointUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'api-version': '1.0', // Required header
            },
          })
          
          let meteringPointIds = []
          if (meteringResponse.ok) {
            const meteringData = await meteringResponse.json()
            meteringPointIds = meteringData.result || []
            console.log(`Found ${meteringPointIds.length} metering points for authorization ${auth.id}`)
          } else {
            console.error(`Failed to fetch metering points for authorization ${auth.id}`)
          }
          
          authorizationsWithMeteringPoints.push({
            // Map the actual fields from the authorization
            authorizationId: auth.id,
            customerId: auth.customerCVR, // Use CVR as customer ID for backwards compatibility
            customerKey: auth.customerCVR, // Keep for backwards compatibility
            customerName: auth.customerName,
            customerCVR: auth.customerCVR,
            validFrom: auth.validFrom,
            validTo: auth.validTo,
            meteringPointIds: meteringPointIds
          })
        } catch (error) {
          console.error(`Error fetching metering points for authorization ${auth.id}:`, error)
        }
      }
    }
    
    const responseData = {
      authorizations: authorizationsWithMeteringPoints,
      metadata: {
        fetchedAt: new Date().toISOString(),
        count: authorizationsWithMeteringPoints.length
      }
    }
    
    // Cache the response
    authCache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    
    return res.status(200).json(responseData)
  } catch (error) {
    console.error('Error in third-party authorization:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch third-party authorizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleThirdPartyConsumption(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Accept multiple identifiers for flexibility
  const { authorizationId, customerCVR, customerId, customerKey, meteringPointIds, dateFrom, dateTo, aggregation = 'Day' } = req.body
  // Priority: authorizationId > customerCVR > customerKey > customerId
  const identifier = authorizationId || customerCVR || customerKey || customerId
  const scope = authorizationId ? 'authorizationId' : 'customerCVR'
  
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

  console.log(`Fetching consumption for identifier: ${identifier} (scope: ${scope}), dates: ${dateFrom} to ${dateTo}`)

  try {
    // Get access token
    const tokenResponse = await fetch(`${ELOVERBLIK_API_BASE}/thirdpartyapi/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token refresh failed:', errorText)
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to refresh access token',
        details: errorText
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.result || tokenData.access_token || tokenData.token
    
    if (!accessToken) {
      console.error('No access token in response:', tokenData)
      return res.status(500).json({ 
        error: 'Invalid token response',
        details: 'No access token found in response'
      })
    }

    // Check if metering points were passed directly (from frontend cache)
    let finalMeteringPointIds = meteringPointIds
    
    if (!finalMeteringPointIds || finalMeteringPointIds.length === 0) {
      // Only fetch metering points if not provided
      const meteringPointUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/authorization/authorization/meteringpointids/${scope}/${identifier}`
      console.log(`Fetching metering points from: ${meteringPointUrl}`)
      
      const meteringResponse = await fetch(meteringPointUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'api-version': '1.0', // Required header
        },
      })

      if (!meteringResponse.ok) {
        const errorText = await meteringResponse.text()
        console.error(`Failed to fetch metering points for ${identifier}:`, errorText)
        console.error('Response status:', meteringResponse.status)
        console.error('Scope used:', scope)
        console.error('Identifier used:', identifier)
        return res.status(meteringResponse.status).json({ 
          error: 'Failed to fetch metering points',
          identifier,
          scope,
          details: errorText
        })
      }

      const meteringData = await meteringResponse.json()
      finalMeteringPointIds = meteringData.result || []
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
    const consumptionUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/meterdata/gettimeseries/${dateFrom}/${dateTo}/${aggregation}`
    console.log(`Fetching consumption from: ${consumptionUrl}`)
    
    // Prepare request body with metering points
    const requestBody = {
      meteringPoints: {
        meteringPoint: finalMeteringPointIds
      }
    }

    const consumptionResponse = await fetch(consumptionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-version': '1.0', // Required header
      },
      body: JSON.stringify(requestBody),
    })

    if (!consumptionResponse.ok) {
      const errorText = await consumptionResponse.text()
      console.error('Failed to fetch consumption data:', errorText)
      return res.status(consumptionResponse.status).json({ 
        error: 'Failed to fetch consumption data',
        details: errorText
      })
    }

    const consumptionData = await consumptionResponse.json()
    console.log('Consumption data received successfully')

    return res.status(200).json({
      result: consumptionData.result,
      dateFrom,
      dateTo,
      aggregation,
      meteringPoints: finalMeteringPointIds,
      authorizationId,
      customerCVR,
      customerKey: customerCVR, // Keep for backwards compatibility
      customerId: customerCVR, // Keep for backwards compatibility
      identifier,
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        fetchedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching third-party consumption:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch consumption data',
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