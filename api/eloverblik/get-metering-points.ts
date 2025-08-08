import { VercelRequest, VercelResponse } from '@vercel/node'

const ELOVERBLIK_API_BASE = 'https://api.eloverblik.dk/thirdpartyapi'

/**
 * Get metering points associated with the user's access token
 * This helps users find their metering point IDs
 * 
 * SECURITY:
 * - Requires valid access token
 * - Returns only metering point IDs, no consumption data
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
    const { accessToken, includeAll = false } = req.body

    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token is required',
        hint: 'Call /api/eloverblik/get-token first to exchange refresh token'
      })
    }

    console.log('Fetching metering points...')

    // Fetch metering points from Eloverblik
    const response = await fetch(
      `${ELOVERBLIK_API_BASE}/api/meteringpoint/meteringpoints`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Metering points fetch failed:', response.status, errorText)
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Access token expired or invalid',
          hint: 'Get a new access token using /api/eloverblik/get-token'
        })
      }

      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Please wait before making more requests.'
        })
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to fetch metering points',
        details: errorText
      })
    }

    const data = await response.json()
    
    // Extract and format metering points
    const meteringPoints = data.result || []
    
    // Filter to active consumption points unless includeAll is true
    const filteredPoints = includeAll 
      ? meteringPoints
      : meteringPoints.filter((mp: any) => 
          mp.typeOfMP === 'E17' && // Consumption point
          mp.consumerStartDate && // Has active connection
          !mp.consumerEndDate // Not disconnected
        )

    // Return simplified metering point data
    return res.status(200).json({
      success: true,
      meteringPoints: filteredPoints.map((mp: any) => ({
        meteringPointId: mp.meteringPointId,
        typeOfMP: mp.typeOfMP,
        streetName: mp.streetName,
        buildingNumber: mp.buildingNumber,
        cityName: mp.cityName,
        postcode: mp.postcode,
        hasRelation: mp.hasRelation,
        consumerStartDate: mp.consumerStartDate,
        // Include settlement method to understand reading frequency
        settlementMethod: mp.settlementMethod,
        // Grid area (DK1 or DK2)
        gridArea: mp.locationDescription
      })),
      count: filteredPoints.length,
      totalCount: meteringPoints.length
    })
  } catch (error) {
    console.error('Eloverblik metering points error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch metering points',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}