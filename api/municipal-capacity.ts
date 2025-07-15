import { NextApiRequest, NextApiResponse } from 'next'

// Types for the API response
interface MunicipalCapacityRecord {
  Month: string
  MunicipalityNo: number
  CapacityGe100MW: number
  CapacityLt100MW: number
  OffshoreWindCapacity: number
  OnshoreWindCapacity: number
  SolarPowerCapacity: number
  NumberGenerationUnitsGe100MW: number
  NumberGenerationUnitsLt100MW: number
  NumberOffshoreWindGenerators: number
  NumberOnshoreWindGenerators: number
  NumberSolarPanels: number
}

interface EnergiDataServiceResponse {
  total: number
  dataset: string
  records: MunicipalCapacityRecord[]
}

interface TransformedMunicipalityData {
  municipalityNo: number
  month: string
  totalCapacity: number
  renewableCapacity: number
  capacityBreakdown: {
    solar: number
    onshoreWind: number
    offshoreWind: number
    conventional: number
  }
  generationUnits: {
    total: number
    solar: number
    onshoreWind: number
    offshoreWind: number
    conventional: number
  }
  renewablePercentage: number
}

interface APIResponse {
  success: boolean
  data?: {
    municipalities: TransformedMunicipalityData[]
    topMunicipalities: TransformedMunicipalityData[]
    totalStats: {
      totalCapacity: number
      totalRenewable: number
      renewablePercentage: number
      totalMunicipalities: number
    }
    lastUpdated: string
  }
  error?: string
  warning?: string
}

// Simple in-memory cache (in production, use Redis or similar)
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 10000 // 10 seconds
const RATE_LIMIT_MAX = 40 // 40 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const rateLimitData = rateLimitMap.get(ip)
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (rateLimitData.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  rateLimitData.count++
  return true
}

function transformMunicipalityData(records: MunicipalCapacityRecord[]): TransformedMunicipalityData[] {
  return records.map(record => {
    const solarCapacity = record.SolarPowerCapacity || 0
    const onshoreWindCapacity = record.OnshoreWindCapacity || 0
    const offshoreWindCapacity = record.OffshoreWindCapacity || 0
    const conventionalCapacity = (record.CapacityGe100MW || 0) + (record.CapacityLt100MW || 0)
    
    const renewableCapacity = solarCapacity + onshoreWindCapacity + offshoreWindCapacity
    const totalCapacity = renewableCapacity + conventionalCapacity
    
    return {
      municipalityNo: record.MunicipalityNo,
      month: record.Month,
      totalCapacity,
      renewableCapacity,
      capacityBreakdown: {
        solar: solarCapacity,
        onshoreWind: onshoreWindCapacity,
        offshoreWind: offshoreWindCapacity,
        conventional: conventionalCapacity
      },
      generationUnits: {
        total: (record.NumberGenerationUnitsGe100MW || 0) + 
               (record.NumberGenerationUnitsLt100MW || 0) + 
               (record.NumberSolarPanels || 0) + 
               (record.NumberOnshoreWindGenerators || 0) + 
               (record.NumberOffshoreWindGenerators || 0),
        solar: record.NumberSolarPanels || 0,
        onshoreWind: record.NumberOnshoreWindGenerators || 0,
        offshoreWind: record.NumberOffshoreWindGenerators || 0,
        conventional: (record.NumberGenerationUnitsGe100MW || 0) + (record.NumberGenerationUnitsLt100MW || 0)
      },
      renewablePercentage: totalCapacity > 0 ? (renewableCapacity / totalCapacity) * 100 : 0
    }
  })
}

function calculateTotalStats(municipalities: TransformedMunicipalityData[]) {
  const totalCapacity = municipalities.reduce((sum, m) => sum + m.totalCapacity, 0)
  const totalRenewable = municipalities.reduce((sum, m) => sum + m.renewableCapacity, 0)
  
  return {
    totalCapacity,
    totalRenewable,
    renewablePercentage: totalCapacity > 0 ? (totalRenewable / totalCapacity) * 100 : 0,
    totalMunicipalities: municipalities.length
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<APIResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  // Get client IP for rate limiting (Node.js runtime compatible)
  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown'
  const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP

  // Check rate limiting
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Maximum 40 requests per 10 seconds.'
    })
  }

  const { month, municipalityNo } = req.query as { month?: string; municipalityNo?: string }

  // Build cache key
  const cacheKey = `municipal-capacity:${month || 'latest'}:${municipalityNo || 'all'}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json({
      success: true,
      data: cached.data
    })
  }

  try {
    // Build API URL
    let apiUrl = 'https://api.energidataservice.dk/dataset/CapacityPerMunicipality?'
    
    if (month) {
      const startOfMonth = `${month}-01`
      const endOfMonth = new Date(month + '-01')
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      const endOfMonthStr = endOfMonth.toISOString().split('T')[0]
      apiUrl += `start=${startOfMonth}&end=${endOfMonthStr}&`
    } else {
      // Get last 3 months of data
      const now = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      apiUrl += `start=${threeMonthsAgo.toISOString().split('T')[0]}&`
    }

    if (municipalityNo) {
      apiUrl += `filter={"MunicipalityNo":["${municipalityNo}"]}&`
    }

    apiUrl += 'sort=Month DESC&limit=0'

    console.log('Fetching from EnergiDataService:', apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ElPortal/1.0 (contact@dinelportal.dk)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`EnergiDataService API error: ${response.status} ${response.statusText}`)
      
      // Check if it's a rate limit error
      if (response.status === 429) {
        throw new Error('EnergiDataService rate limit exceeded. Please try again later.')
      }
      
      // Try to get error details from response
      let errorMessage = `EnergiDataService API error: ${response.status}`
      try {
        const errorText = await response.text()
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      } catch (e) {
        // If we can't read the error, just use the status
      }
      
      throw new Error(errorMessage)
    }

    const data: EnergiDataServiceResponse = await response.json()
    
    if (!data.records || data.records.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for the specified parameters'
      })
    }

    // Transform the data
    const transformedData = transformMunicipalityData(data.records)
    
    // Calculate total statistics
    const totalStats = calculateTotalStats(transformedData)
    
    // Get top 10 municipalities by renewable capacity
    const topMunicipalities = [...transformedData]
      .sort((a, b) => b.renewableCapacity - a.renewableCapacity)
      .slice(0, 10)

    const result = {
      municipalities: transformedData,
      topMunicipalities,
      totalStats,
      lastUpdated: new Date().toISOString()
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    res.status(200).json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Municipal capacity API error:', error)
    
    // Try to return stale cached data
    const staleData = cache.get(cacheKey)
    if (staleData) {
      console.log('Returning stale cached data due to API error')
      return res.status(200).json({
        success: true,
        data: staleData.data,
        warning: 'Using cached data due to API error'
      })
    }

    // Return a structured error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch municipal capacity data'
    console.error('No cached data available, returning error:', errorMessage)
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    })
  }
}

// Using Node.js runtime for better compatibility with complex server logic