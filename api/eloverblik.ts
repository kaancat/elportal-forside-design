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

// Third-party API handlers
async function handleThirdPartyAuthorizations(req: VercelRequest, res: VercelResponse) {
  const refreshToken = process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  if (!refreshToken) {
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured',
      message: 'The server is not configured with Eloverblik third-party credentials'
    })
  }

  try {
    // Get access token using refresh token
    const tokenResponse = await fetch(`${ELOVERBLIK_API_BASE}/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token refresh failed:', error)
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to refresh access token',
        details: error 
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.result

    // Get list of authorized customers
    const authResponse = await fetch(`${ELOVERBLIK_API_BASE}/api/authorization/v1/authorizations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!authResponse.ok) {
      const error = await authResponse.text()
      console.error('Authorization fetch failed:', error)
      return res.status(authResponse.status).json({ 
        error: 'Failed to fetch authorizations',
        details: error 
      })
    }

    const authData = await authResponse.json()
    
    return res.status(200).json({
      authorizations: authData.result || [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        count: authData.result?.length || 0
      }
    })
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

  const { customerId, dateFrom, dateTo, aggregation = 'Day' } = req.body
  const refreshToken = process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN

  if (!refreshToken) {
    return res.status(500).json({ 
      error: 'Third-party refresh token not configured'
    })
  }

  if (!customerId || !dateFrom || !dateTo) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      required: ['customerId', 'dateFrom', 'dateTo']
    })
  }

  try {
    // Get access token
    const tokenResponse = await fetch(`${ELOVERBLIK_API_BASE}/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to refresh access token'
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.result

    // Get metering points for customer
    const meteringResponse = await fetch(
      `${ELOVERBLIK_API_BASE}/api/authorization/v1/authorizations/${customerId}/meteringpoints`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!meteringResponse.ok) {
      return res.status(meteringResponse.status).json({ 
        error: 'Failed to fetch metering points'
      })
    }

    const meteringData = await meteringResponse.json()
    const meteringPointIds = meteringData.result?.map((mp: any) => mp.meteringPointId) || []

    if (meteringPointIds.length === 0) {
      return res.status(404).json({ 
        error: 'No metering points found for customer'
      })
    }

    // Get consumption data
    const requestBody = {
      meteringPoints: {
        meteringPoint: meteringPointIds
      }
    }

    const consumptionResponse = await fetch(
      `${ELOVERBLIK_API_BASE}/api/meterdata/gettimeseries/${dateFrom}/${dateTo}/${aggregation}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!consumptionResponse.ok) {
      return res.status(consumptionResponse.status).json({ 
        error: 'Failed to fetch consumption data'
      })
    }

    const consumptionData = await consumptionResponse.json()

    return res.status(200).json({
      result: consumptionData.result,
      dateFrom,
      dateTo,
      aggregation,
      meteringPoints: meteringPointIds,
      customerId,
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

  switch (action) {
    case 'get-token':
      return handleGetToken(req, res)
    case 'get-metering-points':
      return handleGetMeteringPoints(req, res)
    case 'get-consumption':
      return handleGetConsumption(req, res)
    case 'thirdparty-authorizations':
      return handleThirdPartyAuthorizations(req, res)
    case 'thirdparty-consumption':
      return handleThirdPartyConsumption(req, res)
    default:
      return res.status(400).json({ 
        error: 'Invalid action',
        validActions: [
          'get-token',
          'get-metering-points', 
          'get-consumption',
          'thirdparty-authorizations',
          'thirdparty-consumption'
        ]
      })
  }
}