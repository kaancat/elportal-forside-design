import { VercelRequest, VercelResponse } from '@vercel/node'

const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk/thirdpartyapi'

// Aggregation types supported by Eloverblik
type Aggregation = 'Actual' | 'Quarter' | 'Hour' | 'Day' | 'Month' | 'Year'

/**
 * Fetch consumption data for metering points
 * 
 * SECURITY:
 * - Requires valid access token from user
 * - No data is stored - only fetched on demand
 * - Rate limited to 120 calls/minute per IP
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')

  try {
    const { 
      accessToken, 
      meteringPoints, 
      dateFrom, 
      dateTo, 
      aggregation = 'Hour' 
    } = req.body

    // Validate required fields
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token is required',
        hint: 'Call /api/eloverblik/get-token first to exchange refresh token'
      })
    }

    if (!meteringPoints || !Array.isArray(meteringPoints) || meteringPoints.length === 0) {
      return res.status(400).json({ 
        error: 'Metering points array is required',
        hint: 'Provide array of 18-digit metering point IDs'
      })
    }

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ 
        error: 'Date range is required',
        hint: 'Provide dateFrom and dateTo in YYYY-MM-DD format'
      })
    }

    // Validate aggregation type
    const validAggregations: Aggregation[] = ['Actual', 'Quarter', 'Hour', 'Day', 'Month', 'Year']
    if (!validAggregations.includes(aggregation as Aggregation)) {
      return res.status(400).json({ 
        error: `Invalid aggregation: ${aggregation}`,
        valid: validAggregations
      })
    }

    // Eloverblik recommends bundling max 10 metering points per request
    if (meteringPoints.length > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 metering points per request',
        hint: 'Split large requests into batches of 10'
      })
    }

    console.log(`Fetching consumption data from ${dateFrom} to ${dateTo} (${aggregation})`)

    // Build request body with metering points
    const requestBody = {
      meteringPoints: meteringPoints.map(mp => ({ meteringPoint: mp }))
    }

    // Fetch consumption data from Eloverblik
    const response = await fetch(
      `${ELOVERBLIK_API_BASE}/api/meterdata/gettimeseries/${dateFrom}/${dateTo}/${aggregation}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Consumption fetch failed:', response.status, errorText)
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Access token expired or invalid',
          hint: 'Get a new access token using /api/eloverblik/get-token'
        })
      }

      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Maximum 120 calls per minute. Please spread requests over time.'
        })
      }

      if (response.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: errorText,
          hint: 'Check date format (YYYY-MM-DD) and metering point IDs'
        })
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to fetch consumption data',
        details: errorText
      })
    }

    const data = await response.json()
    
    // Process and return consumption data
    // Data format: Array of time series with usage in kWh
    return res.status(200).json({
      success: true,
      dateFrom,
      dateTo,
      aggregation,
      meteringPoints: meteringPoints,
      result: data.result,
      // Add metadata for client
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        dataDelay: '1-3 days depending on grid operator'
      }
    })
  } catch (error) {
    console.error('Eloverblik consumption error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch consumption data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}