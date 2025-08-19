/**
 * Next.js App Router API Route for monthly production data
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV caching with 24-hour TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Rate limit handling (40 req/10s)
 * - 12-month historical data window
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJsonWithFallback,
  cacheHeaders,
  retryWithBackoff,
  createLRUCache
} from '@/server/api-helpers'
import { monthlyProductionSchema, safeValidateParams } from '@/server/api-validators'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Historical data but real-time queries

// In-memory cache for production data
// WHAT: Cache historical production data to reduce API calls
// WHY: Historical data rarely changes, can cache for longer periods
// Using LRU cache to prevent memory leaks with automatic pruning
const productionCache = createLRUCache<any>(24 * 60 * 60 * 1000, 50) // 24 hours TTL, max 50 entries

/**
 * GET /api/monthly-production
 * 
 * Fetch historical production data from EnergiDataService
 * Returns production and consumption settlement data for the past 12 months
 * 
 * Query Parameters:
 * @param year - Year to fetch data for (YYYY format). Defaults to current year
 * @param month - Month to fetch data for (1-12). Defaults to all months
 * @param productionType - Type of production ('wind', 'solar', 'thermal', 'nuclear', 'hydro', 'all'). Defaults to 'all'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Validate parameters with zod schema
    const paramsObj = Object.fromEntries(searchParams.entries())
    const validation = safeValidateParams(monthlyProductionSchema, paramsObj)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }
    
    // Use validated parameters
    const { year, month, productionType } = validation.data
    
    // Calculate date range
    const today = new Date()
    let startDate: Date
    let endDate: Date
    
    if (year && month) {
      // Specific month requested
      const yearNum = parseInt(year, 10)
      const monthNum = parseInt(month, 10)
      startDate = new Date(yearNum, monthNum - 1, 1)
      endDate = new Date(yearNum, monthNum, 0) // Last day of the month
    } else if (year) {
      // Specific year requested
      const yearNum = parseInt(year, 10)
      startDate = new Date(yearNum, 0, 1)
      endDate = new Date(yearNum, 11, 31)
    } else {
      // Default: last 12 months
      endDate = today
      startDate = new Date(today)
      startDate.setFullYear(today.getFullYear() - 1)
    }
    
    // Format dates for API
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]
    
    // Check KV cache first (distributed across instances)
    const cacheKey = `production:${productionType}:${start}:${end}`
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[MonthlyProduction] Returning KV cached data for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 86400, swr: 172800 }), // 24h cache, 48h stale
          'X-Cache': 'HIT-KV'
        }
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${productionType}_${start}_${end}`
    const cached = productionCache.get(memCacheKey)
    if (cached) {
      console.log(`[MonthlyProduction] Returning in-memory cached data for ${memCacheKey}`)
      return NextResponse.json(cached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 86400, swr: 172800 }),
          'X-Cache': 'HIT-MEMORY'
        }
      })
    }
    
    // Build API URL - ProductionConsumptionSettlement dataset
    const apiUrl = `https://api.energidataservice.dk/dataset/ProductionConsumptionSettlement?start=${start}&end=${end}&sort=HourUTC asc`
    
    // Use queued fetch to prevent duplicate requests
    const fetchResult = await queuedFetch(memCacheKey, async () => {
      console.log(`[MonthlyProduction] Fetching data from EnergiDataService for ${cacheKey}`)
      
      // Use retry helper with exponential backoff
      return await retryWithBackoff(async () => {
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          // Don't retry client errors (except 429)
          if (response.status === 404 || response.status === 400) {
            return { records: [] }
          }
          
          // Throw to trigger retry on rate limit or server errors
          if (response.status === 429 || response.status === 503) {
            console.warn(`[MonthlyProduction] EnergiDataService returned ${response.status}`)
            throw new Error(`API returned ${response.status}`)
          }
          
          const errorText = await response.text()
          console.error('[MonthlyProduction] API Error:', errorText)
          throw new Error(`Failed to fetch production data: ${response.status}`)
        }
        
        return await response.json()
      }, 3, 1000) // 3 attempts, 1s initial delay
    })
    
    // Process the data to aggregate by month and production type
    const processedData = processProductionData(fetchResult.records || [], productionType)
    
    // Cache the successful response in both memory and KV
    productionCache.set(memCacheKey, processedData)
    const fallbackKey = `production:${productionType}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, processedData, 86400, 172800) // 24h specific, 48h fallback
    
    return NextResponse.json(processedData, {
      headers: { 
        ...cacheHeaders({ sMaxage: 86400, swr: 172800 }),
        'X-Cache': 'MISS'
      }
    })
    
  } catch (error: any) {
    console.error('[MonthlyProduction] Unexpected error:', error)
    
    // Try to return cached data on error
    const productionType = request.nextUrl.searchParams.get('productionType') || 'all'
    const fallbackKey = `production:${productionType}` // This now exists thanks to setKvJsonWithFallback
    const fallback = await readKvJson(fallbackKey)
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          ...cacheHeaders({ sMaxage: 3600 }),
          'X-Cache': 'HIT-STALE'
        }
      })
    }
    
    // Return safe empty response instead of 500
    const emptyResponse = createEmptyProductionResponse()
    return NextResponse.json(emptyResponse, {
      headers: {
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
        'X-Cache': 'MISS-FALLBACK'
      }
    })
  }
}

/**
 * Process production data to aggregate by month and type
 */
function processProductionData(records: any[], productionType: string): any {
  // Group records by month
  const monthlyData: Record<string, any> = {}
  
  records.forEach((record: any) => {
    const date = new Date(record.HourUTC)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        // Production types (MWh)
        windOnshore: 0,
        windOffshore: 0,
        solar: 0,
        thermal: 0,
        nuclear: 0,
        hydro: 0,
        other: 0,
        totalProduction: 0,
        // Consumption
        totalConsumption: 0,
        // Exchange
        netExport: 0,
        // Hours counted
        hours: 0
      }
    }
    
    const month = monthlyData[monthKey]
    
    // Aggregate production by type
    // Note: Field names from ProductionConsumptionSettlement dataset
    month.windOnshore += (record.OnshoreWindPowerMWh || 0)
    month.windOffshore += (record.OffshoreWindPowerMWh || 0)
    month.solar += (record.SolarPowerMWh || 0)
    month.thermal += (record.ThermalPowerMWh || 0)
    month.nuclear += (record.NuclearPowerMWh || 0)
    month.hydro += (record.HydroPowerMWh || 0)
    month.other += (record.OtherRenewablePowerMWh || 0)
    
    // Total production
    month.totalProduction += (
      (record.OnshoreWindPowerMWh || 0) +
      (record.OffshoreWindPowerMWh || 0) +
      (record.SolarPowerMWh || 0) +
      (record.ThermalPowerMWh || 0) +
      (record.NuclearPowerMWh || 0) +
      (record.HydroPowerMWh || 0) +
      (record.OtherRenewablePowerMWh || 0)
    )
    
    // Consumption
    month.totalConsumption += (record.GrossConsumptionMWh || 0)
    
    // Net export (positive = export, negative = import)
    month.netExport += (record.NetExchangeSumMWh || 0)
    
    month.hours++
  })
  
  // Convert to array and sort by month
  let monthlyArray = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )
  
  // Filter by production type if specified
  if (productionType !== 'all') {
    monthlyArray = monthlyArray.map((month: any) => {
      const filtered = { ...month }
      
      // Zero out other production types
      if (productionType !== 'wind') {
        filtered.windOnshore = 0
        filtered.windOffshore = 0
      }
      if (productionType !== 'solar') {
        filtered.solar = 0
      }
      if (productionType !== 'thermal') {
        filtered.thermal = 0
      }
      if (productionType !== 'nuclear') {
        filtered.nuclear = 0
      }
      if (productionType !== 'hydro') {
        filtered.hydro = 0
      }
      
      // Recalculate total
      filtered.totalProduction = 
        filtered.windOnshore + filtered.windOffshore + 
        filtered.solar + filtered.thermal + 
        filtered.nuclear + filtered.hydro + filtered.other
      
      return filtered
    })
  }
  
  // Calculate statistics
  const totalProduction = monthlyArray.reduce((sum: number, m: any) => sum + m.totalProduction, 0)
  const totalConsumption = monthlyArray.reduce((sum: number, m: any) => sum + m.totalConsumption, 0)
  const totalWindProduction = monthlyArray.reduce((sum: number, m: any) => 
    sum + m.windOnshore + m.windOffshore, 0)
  const totalSolarProduction = monthlyArray.reduce((sum: number, m: any) => sum + m.solar, 0)
  const totalRenewableProduction = totalWindProduction + totalSolarProduction + 
    monthlyArray.reduce((sum: number, m: any) => sum + m.hydro + m.other, 0)
  
  return {
    data: monthlyArray,
    statistics: {
      totalProduction,
      totalConsumption,
      totalWindProduction,
      totalSolarProduction,
      totalRenewableProduction,
      renewablePercentage: totalProduction > 0 ? 
        (totalRenewableProduction / totalProduction) * 100 : 0,
      selfSufficiency: totalConsumption > 0 ? 
        (totalProduction / totalConsumption) * 100 : 0,
      monthsAnalyzed: monthlyArray.length
    },
    metadata: {
      productionType,
      startDate: monthlyArray[0]?.month || null,
      endDate: monthlyArray[monthlyArray.length - 1]?.month || null,
      lastUpdated: new Date().toISOString(),
      source: 'EnergiDataService ProductionConsumptionSettlement'
    }
  }
}

/**
 * Create empty response structure for error cases
 */
function createEmptyProductionResponse(): any {
  return {
    data: [],
    statistics: {
      totalProduction: 0,
      totalConsumption: 0,
      totalWindProduction: 0,
      totalSolarProduction: 0,
      totalRenewableProduction: 0,
      renewablePercentage: 0,
      selfSufficiency: 0,
      monthsAnalyzed: 0
    },
    metadata: {
      productionType: 'all',
      startDate: null,
      endDate: null,
      lastUpdated: new Date().toISOString(),
      source: 'EnergiDataService ProductionConsumptionSettlement',
      message: 'No production data available'
    }
  }
}