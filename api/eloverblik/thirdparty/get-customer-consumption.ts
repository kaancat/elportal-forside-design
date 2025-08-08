import { VercelRequest, VercelResponse } from '@vercel/node'

const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk/thirdpartyapi'

/**
 * Get consumption data for authorized customers
 * Only works for customers who have granted fuldmagt to ElPortal
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      customerId, // From authorization
      dateFrom, 
      dateTo, 
      aggregation = 'Hour' 
    } = req.body

    // Validate inputs
    if (!customerId) {
      return res.status(400).json({ 
        error: 'Customer ID is required',
        hint: 'Use the customer ID from the authorization list'
      })
    }

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ 
        error: 'Date range is required',
        hint: 'Provide dateFrom and dateTo in YYYY-MM-DD format'
      })
    }

    // Get third-party refresh token
    const refreshToken = process.env.ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN
    
    if (!refreshToken) {
      return res.status(500).json({ 
        error: 'Third-party refresh token not configured'
      })
    }

    // Step 1: Get access token
    const tokenResponse = await fetch(`${ELOVERBLIK_API_BASE}/api/token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Accept': 'application/json'
      }
    })

    if (!tokenResponse.ok) {
      return res.status(401).json({ 
        error: 'Failed to authenticate as third party'
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.result

    // Step 2: Get metering points for this customer
    const meteringPointsResponse = await fetch(
      `${ELOVERBLIK_API_BASE}/api/authorization/authorization/${customerId}/meteringpoints`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-User-Correlation-ID': crypto.randomUUID()
        }
      }
    )

    if (!meteringPointsResponse.ok) {
      return res.status(404).json({ 
        error: 'Customer not found or not authorized',
        hint: 'Ensure the customer has granted fuldmagt to ElPortal'
      })
    }

    const meteringPointsData = await meteringPointsResponse.json()
    const meteringPointIds = (meteringPointsData.result || []).map((mp: any) => mp.meteringPointId)

    if (meteringPointIds.length === 0) {
      return res.status(404).json({ 
        error: 'No metering points found for customer'
      })
    }

    // Step 3: Get consumption data for the metering points
    // Bundle max 10 metering points per request as recommended
    const chunks = []
    for (let i = 0; i < meteringPointIds.length; i += 10) {
      chunks.push(meteringPointIds.slice(i, i + 10))
    }

    const allResults = []
    
    for (const chunk of chunks) {
      const requestBody = {
        meteringPoints: chunk.map((id: string) => ({ meteringPoint: id }))
      }

      const consumptionResponse = await fetch(
        `${ELOVERBLIK_API_BASE}/api/meterdata/gettimeseries/${dateFrom}/${dateTo}/${aggregation}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-User-Correlation-ID': crypto.randomUUID()
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (consumptionResponse.ok) {
        const consumptionData = await consumptionResponse.json()
        allResults.push(...(consumptionData.result || []))
      } else {
        console.error('Failed to fetch consumption for chunk:', chunk)
      }
    }

    // Return aggregated consumption data
    return res.status(200).json({
      success: true,
      customerId,
      dateFrom,
      dateTo,
      aggregation,
      meteringPoints: meteringPointIds,
      result: allResults,
      metadata: {
        unit: 'kWh',
        timezone: 'Europe/Copenhagen',
        dataDelay: '1-3 days depending on grid operator'
      }
    })
  } catch (error) {
    console.error('Customer consumption error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch consumption data',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}