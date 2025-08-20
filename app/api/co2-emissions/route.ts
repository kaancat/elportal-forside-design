/**
 * Next.js App Router API Route for CO2 emissions data
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV caching with 5-minute TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Rate limit handling (40 req/10s)
 * - Hourly aggregation of 5-minute data
 * - Region filtering (DK1, DK2, Danmark)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJsonWithFallback,
  cacheHeaders,
  retryWithBackoff,
  parseDate,
  getDateRange,
  getCacheStatus,
  createLRUCache
} from '@/server/api-helpers'
import { co2EmissionsSchema, safeValidateParams } from '@/server/api-validators'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Real-time CO2 data

// In-memory cache for CO2 emissions data
// WHAT: Cache emissions data to reduce API calls to EnergiDataService  
// WHY: 40 req/10s rate limit shared across all users and endpoints
// Using LRU cache to prevent memory leaks with automatic pruning
const emissionsCache = createLRUCache<any>(5 * 60 * 1000, 100) // 5 min TTL, max 100 entries

/**
 * GET /api/co2-emissions
 * 
 * Fetch CO2 emissions data from EnergiDataService
 * Returns CO2 intensity of electricity consumption in g/kWh
 * 
 * Query Parameters:
 * @param region - Price area ('DK1', 'DK2', or 'Danmark' for both). Defaults to 'Danmark'
 * @param date - Date for which to fetch CO2 emissions. Format: YYYY-MM-DD
 * @param aggregation - Data aggregation ('5min' or 'hourly'). Defaults to 'hourly'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Validate parameters with zod schema
    const paramsObj = Object.fromEntries(searchParams.entries())
    const validation = safeValidateParams(co2EmissionsSchema, paramsObj)
    
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
    const { region, date, aggregation } = validation.data
    const baseDate = parseDate(date ?? null)
    const { start: startDate, end: endDate } = getDateRange(baseDate)

    // Check KV cache first (distributed across instances)
    const cacheKey = `co2:${region}:${startDate}:${endDate}:${aggregation}`
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[CO2] Returning KV cached emissions for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: { 
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          'X-Cache': 'HIT-KV'
        } 
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${region}_${startDate}_${endDate}_${aggregation}`
    const cached = emissionsCache.get(memCacheKey)
    if (cached) {
      console.log(`[CO2] Returning in-memory cached emissions for ${memCacheKey}`)
      return NextResponse.json(cached, { 
        headers: { 
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          'X-Cache': 'HIT-MEMORY'
        } 
      })
    }

    // Build filter based on region
    let filter = ''
    if (region === 'DK1') {
      filter = '&filter={"PriceArea":["DK1"]}'
    } else if (region === 'DK2') {
      filter = '&filter={"PriceArea":["DK2"]}'
    }
    // If 'Danmark', no filter (gets both DK1 and DK2)

    const apiUrl = `https://api.energidataservice.dk/dataset/CO2Emis?start=${startDate}&end=${endDate}${filter}&sort=Minutes5UTC ASC`

    // Use queued fetch to prevent duplicate requests
    const fetchResult = await queuedFetch(memCacheKey, async () => {
      console.log(`[CO2] Fetching emissions from EnergiDataService for ${cacheKey}`)
      
      // Use retry helper with exponential backoff
      return await retryWithBackoff(async () => {
        const externalResponse = await fetch(apiUrl)

        if (!externalResponse.ok) {
          // Don't retry client errors (except 429)
          if (externalResponse.status === 404 || externalResponse.status === 400) {
            return { records: [] }
          }
          
          // Throw to trigger retry on rate limit or server errors
          if (externalResponse.status === 429 || externalResponse.status === 503) {
            console.warn(`[CO2] EnergiDataService returned ${externalResponse.status}`)
            throw new Error(`API returned ${externalResponse.status}`)
          }
          
          throw new Error(`Failed to fetch CO2 data: ${externalResponse.status}`)
        }

        return await externalResponse.json()
      }, 3, 1000) // 3 attempts, 1s initial delay
    })

    // Process the data
    let processedRecords = fetchResult.records || []

    // If hourly aggregation is requested, aggregate 5-minute data to hourly
    if (aggregation === 'hourly' && processedRecords.length > 0) {
      processedRecords = aggregateToHourly(processedRecords, region)
    } else {
      // For 5-minute data, just add emission level
      processedRecords = processedRecords.map((record: any) => ({
        ...record,
        EmissionLevel: getEmissionLevel(record.CO2Emission)
      }))
    }

    // Sort by time
    processedRecords.sort((a: any, b: any) => 
      new Date(a.HourUTC || a.Minutes5UTC).getTime() - new Date(b.HourUTC || b.Minutes5UTC).getTime()
    )

    const finalData = { 
      ...fetchResult, 
      records: processedRecords,
      metadata: {
        region,
        date: baseDate.toISOString().split('T')[0],
        aggregation
      }
    }

    // Cache the successful response in both memory and KV
    emissionsCache.set(memCacheKey, finalData)
    
    // Store in KV with both specific key and fallback "latest" key
    const fallbackKey = `co2:${region}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, finalData, 300, 3600)

    return NextResponse.json(finalData, {
      headers: { 
        ...cacheHeaders({ sMaxage: 300, swr: 600 }),
        'X-Cache': 'MISS'
      }
    })

  } catch (error: any) {
    console.error('[CO2] Unexpected error in emissions API route:', error)
    
    // Try to return cached data on error
    const region = request.nextUrl.searchParams.get('region') || 'Danmark'
    const fallbackKey = `co2:${region}` // This now exists thanks to setKvJsonWithFallback
    const fallback = await readKvJson(fallbackKey)
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          ...cacheHeaders({ sMaxage: 60 }),
          'X-Cache': 'HIT-STALE',
          'Warning': '110 - "Response is stale"'
        }
      })
    }
    
    // Return safe empty response instead of 500
    console.log('[CO2] No fallback available, returning safe empty response')
    const emptyResponse = {
      data: [],
      metadata: {
        region,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        aggregation: 'hourly',
        dataPoints: 0,
        averageEmission: 0,
        minEmission: 0,
        maxEmission: 0,
        lastUpdated: new Date().toISOString(),
        status: 'degraded',
        message: 'CO2 emissions data temporarily unavailable'
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

/**
 * Aggregate 5-minute data to hourly averages
 */
function aggregateToHourly(records: any[], region: string): any[] {
  const hourlyData: Record<string, { emissions: number[]; priceArea: string }> = {}

  records.forEach((record: any) => {
    const date = new Date(record.Minutes5UTC)
    const hourKey = date.toISOString().substring(0, 13) + ':00:00Z'
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = { emissions: [], priceArea: record.PriceArea }
    }
    
    if (record.CO2Emission !== null) {
      hourlyData[hourKey].emissions.push(record.CO2Emission)
    }
  })

  // Convert to array and calculate averages
  let processedRecords = Object.entries(hourlyData).map(([hour, data]) => {
    const avgEmission = data.emissions.length > 0
      ? data.emissions.reduce((sum, val) => sum + val, 0) / data.emissions.length
      : null

    return {
      HourUTC: hour,
      HourDK: new Date(hour).toLocaleString('da-DK', { 
        timeZone: 'Europe/Copenhagen',
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      PriceArea: data.priceArea,
      CO2Emission: avgEmission,
      EmissionLevel: getEmissionLevel(avgEmission)
    }
  })

  // If Danmark is selected, merge DK1 and DK2 data
  if (region === 'Danmark') {
    const mergedData: Record<string, { emissions: number[] }> = {}
    
    processedRecords.forEach((record: any) => {
      if (!mergedData[record.HourUTC]) {
        mergedData[record.HourUTC] = { emissions: [] }
      }
      if (record.CO2Emission !== null) {
        mergedData[record.HourUTC].emissions.push(record.CO2Emission)
      }
    })

    processedRecords = Object.entries(mergedData).map(([hour, data]) => {
      const avgEmission = data.emissions.length > 0
        ? data.emissions.reduce((sum, val) => sum + val, 0) / data.emissions.length
        : null

      return {
        HourUTC: hour,
        HourDK: new Date(hour).toLocaleString('da-DK', { 
          timeZone: 'Europe/Copenhagen',
          hour: '2-digit',
          minute: '2-digit',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        PriceArea: 'Danmark',
        CO2Emission: avgEmission,
        EmissionLevel: getEmissionLevel(avgEmission)
      }
    })
  }

  return processedRecords
}

/**
 * Get emission level category based on CO2 emissions value
 */
function getEmissionLevel(emission: number | null): string {
  if (emission === null) return 'unknown'
  if (emission < 100) return 'very-low'
  if (emission < 200) return 'low'
  if (emission < 300) return 'moderate'
  if (emission < 400) return 'high'
  return 'very-high'
}