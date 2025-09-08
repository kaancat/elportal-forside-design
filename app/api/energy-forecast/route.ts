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
    // NOTE: Production used keys without `type`; keeping compatibility by caching by region/date range
    const cacheKey = `forecast:${region}:${start}:${end}`
    
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
    const memCacheKey = `${region}_${start}_${end}`
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
    
    // IMPORTANT: Return RAW EnergiDataService records to match production behavior and client expectations
    const records = fetchResult.records || []
    const rawResponse = {
      ...fetchResult,
      // Provide lightweight metadata for debugging/headers (safe to include)
      metadata: {
        region,
        type,
        dataPoints: records.length,
        lastUpdated: new Date().toISOString(),
        source: 'EnergiDataService Forecasts_Hour'
      }
    }

    // Cache the successful response in both memory and KV
    forecastCache.set(memCacheKey, rawResponse)
    const fallbackKey = `forecast:${region}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, rawResponse, 1800, 3600) // 30 min specific, 1 hour fallback
    
    return NextResponse.json(rawResponse, {
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
    // Return an empty but structurally compatible response
    const emptyResponse = {
      records: [],
      metadata: {
        region,
        type: 'all',
        dataPoints: 0,
        lastUpdated: new Date().toISOString(),
        source: 'EnergiDataService Forecasts_Hour',
        message: 'No forecast data available'
      }
    }
    return NextResponse.json(emptyResponse, {
      headers: {
        ...cacheHeaders({ sMaxage: 60, swr: 300 }),
        'X-Cache': 'MISS-FALLBACK'
      }
    })
  }
}
// Note: Removed processing helpers to align return shape with production/raw dataset