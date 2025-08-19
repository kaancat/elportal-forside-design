/**
 * Next.js App Router API Route for energy forecast data
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV caching with 30-minute TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Rate limit handling (40 req/10s)
 * - Regional filtering (Danmark/DK1/DK2)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJsonWithFallback,
  cacheHeaders,
  retryWithBackoff,
  createLRUCache,
  parseDate,
  getDateRange
} from '@/server/api-helpers'
import { energyForecastSchema, safeValidateParams } from '@/server/api-validators'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Real-time forecast data

// In-memory cache for forecast data
// WHAT: Cache forecast data to reduce API calls to EnergiDataService
// WHY: 40 req/10s rate limit shared across all users and endpoints
// Using LRU cache to prevent memory leaks with automatic pruning
const forecastCache = createLRUCache<any>(30 * 60 * 1000, 100) // 30 minutes TTL, max 100 entries

/**
 * GET /api/energy-forecast
 * 
 * Fetch renewable energy forecast from EnergiDataService
 * Returns hourly forecast data for wind and solar production
 * 
 * Query Parameters:
 * @param region - Price area ('Danmark', 'DK1', 'DK2'). Defaults to 'Danmark'
 * @param type - Forecast type ('wind', 'solar', 'all'). Defaults to 'all'
 * @param hours - Number of hours to forecast (as string). Defaults to '24'
 * @param date - Date in YYYY-MM-DD format. Defaults to today
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Validate parameters with zod schema
    const paramsObj = Object.fromEntries(searchParams.entries())
    // Add date parameter if present
    if (searchParams.has('date')) {
      paramsObj.date = searchParams.get('date')!
    }
    
    const validation = safeValidateParams(energyForecastSchema, paramsObj)
    
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
    const { region, type, hours } = validation.data
    const hoursNum = parseInt(hours, 10)
    
    // Parse date from query or use today
    const dateParam = searchParams.get('date')
    const queryDate = parseDate(dateParam)
    
    // Get date range for the query
    const { start, end } = getDateRange(queryDate)
    
    // Check KV cache first (distributed across instances)
    const cacheKey = `forecast:${region}:${type}:${start}:${end}`
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[EnergyForecast] Returning KV cached data for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 1800, swr: 3600 }),
          'X-Cache': 'HIT-KV'
        }
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${region}_${type}_${start}_${end}`
    const cached = forecastCache.get(memCacheKey)
    if (cached) {
      console.log(`[EnergyForecast] Returning in-memory cached data for ${memCacheKey}`)
      return NextResponse.json(cached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 1800, swr: 3600 }),
          'X-Cache': 'HIT-MEMORY'
        }
      })
    }
    
    // Apply region filter - Danmark means no filter (all regions)
    const regionFilter = region === 'Danmark' 
      ? '' 
      : `&filter={"PriceArea":["${region}"]}`
    
    const apiUrl = `https://api.energidataservice.dk/dataset/Forecasts_Hour?start=${start}&end=${end}${regionFilter}&sort=HourUTC asc`
    
    // Use queued fetch to prevent duplicate requests
    const fetchResult = await queuedFetch(memCacheKey, async () => {
      console.log(`[EnergyForecast] Fetching data from EnergiDataService for ${cacheKey}`)
      
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
            console.warn(`[EnergyForecast] EnergiDataService returned ${response.status}`)
            throw new Error(`API returned ${response.status}`)
          }
          
          throw new Error(`Failed to fetch forecast data: ${response.status}`)
        }
        
        return await response.json()
      }, 3, 1000) // 3 attempts, 1s initial delay
    })
    
    let records = fetchResult.records || []
    
    // Filter by forecast type if specified
    if (type !== 'all' && records.length > 0) {
      records = filterByType(records, type)
    }
    
    // Limit to requested hours
    if (hoursNum && hoursNum < records.length) {
      records = records.slice(0, hoursNum)
    }
    
    // Process the data to a more useful format
    const processedData = processForecastData(records, region, type)
    
    // Cache the successful response in both memory and KV
    forecastCache.set(memCacheKey, processedData)
    const fallbackKey = `forecast:${region}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, processedData, 1800, 3600) // 30 min specific, 1 hour fallback
    
    return NextResponse.json(processedData, {
      headers: { 
        ...cacheHeaders({ sMaxage: 1800, swr: 3600 }),
        'X-Cache': 'MISS'
      }
    })
    
  } catch (error: any) {
    console.error('[EnergyForecast] Unexpected error:', error)
    
    // Try to return cached data on error
    const region = request.nextUrl.searchParams.get('region') || 'Danmark'
    const fallbackKey = `forecast:${region}` // This now exists thanks to setKvJsonWithFallback
    const fallback = await readKvJson(fallbackKey)
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          ...cacheHeaders({ sMaxage: 60 }),
          'X-Cache': 'HIT-STALE'
        }
      })
    }
    
    // Return safe empty response instead of 500
    const emptyResponse = createEmptyForecastResponse(region)
    return NextResponse.json(emptyResponse, {
      headers: {
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
        'X-Cache': 'MISS-FALLBACK'
      }
    })
  }
}

/**
 * Filter records by forecast type
 */
function filterByType(records: any[], type: string): any[] {
  // The API returns different forecast types in the data
  // We need to filter based on the production type
  return records.filter((record: any) => {
    if (type === 'wind') {
      // Keep only wind-related forecasts
      return record.OnshoreWindPowerGE75MWMWh > 0 || 
             record.OnshoreWindPowerLT75MWMWh > 0 || 
             record.OffshoreWindPowerMWh > 0
    } else if (type === 'solar') {
      // Keep only solar-related forecasts
      return record.SolarPowerMWh > 0
    }
    return true // 'all' returns everything
  })
}

/**
 * Process forecast data into a more useful format
 */
function processForecastData(records: any[], region: string, type: string): any {
  // Aggregate and format the data
  const processedRecords = records.map((record: any) => ({
    hour: record.HourUTC,
    region: record.PriceArea || region,
    windOnshoreSmall: record.OnshoreWindPowerLT75MWMWh || 0,
    windOnshoreLarge: record.OnshoreWindPowerGE75MWMWh || 0,
    windOffshore: record.OffshoreWindPowerMWh || 0,
    windTotal: (record.OnshoreWindPowerLT75MWMWh || 0) + 
               (record.OnshoreWindPowerGE75MWMWh || 0) + 
               (record.OffshoreWindPowerMWh || 0),
    solar: record.SolarPowerMWh || 0,
    totalRenewable: (record.OnshoreWindPowerLT75MWMWh || 0) + 
                    (record.OnshoreWindPowerGE75MWMWh || 0) + 
                    (record.OffshoreWindPowerMWh || 0) + 
                    (record.SolarPowerMWh || 0)
  }))
  
  // Calculate statistics
  const stats = {
    totalWindForecast: processedRecords.reduce((sum, r) => sum + r.windTotal, 0),
    totalSolarForecast: processedRecords.reduce((sum, r) => sum + r.solar, 0),
    totalRenewableForecast: processedRecords.reduce((sum, r) => sum + r.totalRenewable, 0),
    peakWindHour: processedRecords.reduce((max, r) => r.windTotal > max.windTotal ? r : max, processedRecords[0]),
    peakSolarHour: processedRecords.reduce((max, r) => r.solar > max.solar ? r : max, processedRecords[0]),
    averageWind: processedRecords.length > 0 ? 
      processedRecords.reduce((sum, r) => sum + r.windTotal, 0) / processedRecords.length : 0,
    averageSolar: processedRecords.length > 0 ? 
      processedRecords.reduce((sum, r) => sum + r.solar, 0) / processedRecords.length : 0
  }
  
  return {
    records: processedRecords,
    statistics: stats,
    metadata: {
      region,
      type,
      dataPoints: processedRecords.length,
      lastUpdated: new Date().toISOString(),
      source: 'EnergiDataService Forecasts_Hour'
    }
  }
}

/**
 * Create empty response structure for error cases
 */
function createEmptyForecastResponse(region: string): any {
  return {
    records: [],
    statistics: {
      totalWindForecast: 0,
      totalSolarForecast: 0,
      totalRenewableForecast: 0,
      peakWindHour: null,
      peakSolarHour: null,
      averageWind: 0,
      averageSolar: 0
    },
    metadata: {
      region,
      type: 'all',
      dataPoints: 0,
      lastUpdated: new Date().toISOString(),
      source: 'EnergiDataService Forecasts_Hour',
      message: 'No forecast data available'
    }
  }
}