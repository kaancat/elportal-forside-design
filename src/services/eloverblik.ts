/**
 * Eloverblik Client Service
 * 
 * This service handles user electricity consumption data from eloverblik.dk
 * Users provide their own refresh tokens - we never store them
 * All operations are session-based with automatic token management
 */

// Store access token in memory only (never localStorage!)
let cachedAccessToken: string | null = null
let tokenExpiresAt: Date | null = null

/**
 * Exchange a user's refresh token for an access token
 * Access tokens are valid for 24 hours
 * 
 * @param refreshToken - User's refresh token from eloverblik.dk
 */
export async function getAccessToken(refreshToken: string): Promise<string> {
  // Check if we have a valid cached token
  if (cachedAccessToken && tokenExpiresAt && tokenExpiresAt > new Date()) {
    console.log('Using cached access token')
    return cachedAccessToken
  }

  try {
    const response = await fetch('/api/eloverblik/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get access token')
    }

    const data = await response.json()
    
    // Cache the token in memory
    cachedAccessToken = data.result
    tokenExpiresAt = new Date(data.expiresAt)
    
    console.log('Access token obtained, expires at:', tokenExpiresAt)
    return data.result
  } catch (error) {
    console.error('Failed to get access token:', error)
    throw error
  }
}

/**
 * Get user's metering points (electricity meters)
 */
export async function getMeteringPoints(refreshToken: string) {
  try {
    const accessToken = await getAccessToken(refreshToken)
    
    const response = await fetch('/api/eloverblik/get-metering-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken })
    })

    if (!response.ok) {
      const error = await response.json()
      
      // If token expired, clear cache and retry once
      if (response.status === 401 && cachedAccessToken) {
        console.log('Access token expired, refreshing...')
        cachedAccessToken = null
        tokenExpiresAt = null
        return getMeteringPoints(refreshToken)
      }
      
      throw new Error(error.error || 'Failed to get metering points')
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get metering points:', error)
    throw error
  }
}

/**
 * Fetch consumption data for specified metering points
 * 
 * @param refreshToken - User's refresh token
 * @param meteringPoints - Array of metering point IDs (max 10)
 * @param dateFrom - Start date (YYYY-MM-DD)
 * @param dateTo - End date (YYYY-MM-DD)
 * @param aggregation - Data aggregation level
 */
export async function getConsumption(
  refreshToken: string,
  meteringPoints: string[],
  dateFrom: string,
  dateTo: string,
  aggregation: 'Hour' | 'Day' | 'Month' | 'Year' = 'Hour'
) {
  try {
    const accessToken = await getAccessToken(refreshToken)
    
    // Eloverblik recommends max 10 metering points per request
    if (meteringPoints.length > 10) {
      throw new Error('Maximum 10 metering points per request. Please batch your requests.')
    }
    
    const response = await fetch('/api/eloverblik/get-consumption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        meteringPoints,
        dateFrom,
        dateTo,
        aggregation
      })
    })

    if (!response.ok) {
      const error = await response.json()
      
      // If token expired, clear cache and retry once
      if (response.status === 401 && cachedAccessToken) {
        console.log('Access token expired, refreshing...')
        cachedAccessToken = null
        tokenExpiresAt = null
        return getConsumption(refreshToken, meteringPoints, dateFrom, dateTo, aggregation)
      }
      
      throw new Error(error.error || 'Failed to get consumption data')
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get consumption:', error)
    throw error
  }
}

/**
 * Calculate true cost based on actual consumption data
 * 
 * @param consumptionData - Hourly consumption data from Eloverblik
 * @param spotPrices - Hourly spot prices for the same period
 * @param providerFee - Provider's spot price fee (kr/kWh)
 */
export function calculateTrueCost(
  consumptionData: Array<{ start: string, end: string, quantity: number }>,
  spotPrices: Array<{ hour: string, price: number }>,
  providerFee: number
) {
  let totalCost = 0
  let totalConsumption = 0
  
  // Fixed fees per kWh (system fee + electricity tax)
  const fixedFees = 0.19 + 0.90 // kr/kWh
  const vatRate = 1.25 // 25% VAT
  
  // Match consumption with spot prices
  consumptionData.forEach(consumption => {
    const consumptionHour = new Date(consumption.start).toISOString()
    const spotPrice = spotPrices.find(sp => sp.hour === consumptionHour)
    
    if (spotPrice) {
      // Calculate cost for this hour
      const spotPriceKr = spotPrice.price / 100 // Convert øre to kr
      const priceBeforeVat = spotPriceKr + providerFee + fixedFees
      const priceWithVat = priceBeforeVat * vatRate
      const hourCost = consumption.quantity * priceWithVat
      
      totalCost += hourCost
      totalConsumption += consumption.quantity
    }
  })
  
  return {
    totalCost,
    totalConsumption,
    averagePrice: totalConsumption > 0 ? totalCost / totalConsumption : 0
  }
}

/**
 * Clear cached tokens (for logout)
 */
export function clearTokenCache() {
  cachedAccessToken = null
  tokenExpiresAt = null
  console.log('Token cache cleared')
}

/**
 * Check if we have a valid cached token
 */
export function hasValidToken(): boolean {
  return !!(cachedAccessToken && tokenExpiresAt && tokenExpiresAt > new Date())
}