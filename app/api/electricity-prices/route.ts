/**
 * Next.js App Router API Route for electricity spot prices
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV caching with 5-minute TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Rate limit handling (40 req/10s)
 * - Fee calculations with VAT
 * - Multiple date range support
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJsonWithFallback,
  cacheHeaders,
  retryWithBackoff,
  parseDate,
  getCacheStatus,
  createLRUCache
} from '@/server/api-helpers'
import { electricityPricesSchema, safeValidateParams } from '@/server/api-validators'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Real-time price data

// In-memory cache for electricity prices
// WHAT: Cache price data to reduce API calls to EnergiDataService
// WHY: 40 req/10s rate limit shared across all users and endpoints
// Using LRU cache to prevent memory leaks with automatic pruning
const priceCache = createLRUCache<any>(5 * 60 * 1000, 100) // 5 min TTL, max 100 entries

// Fee constants (Danish electricity fees in kr/kWh)
const SYSTEM_FEE_KWH = 0.19
const ELECTRICITY_TAX_KWH = 0.90
const VAT_RATE = 1.25

/**
 * GET /api/electricity-prices
 * 
 * Fetch electricity spot prices from EnergiDataService
 * Returns prices with fees and VAT calculated
 * 
 * Query Parameters:
 * @param region | area - Price area ('DK1' or 'DK2'). Defaults to 'DK2'
 * @param date - Start date for prices. Format: YYYY-MM-DD
 * @param endDate - Optional end date for date ranges. Format: YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Validate parameters with zod schema
    const paramsObj = Object.fromEntries(searchParams.entries())
    const validation = safeValidateParams(electricityPricesSchema, paramsObj)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    // Use validated parameters (area is alternative to region)
    const { region, area, date: dateParam, endDate: endDateParam } = validation.data
    const priceArea = area || region // Support both parameter names
    
    // Date logic - timezone-aware using Danish time
    const baseDate = parseDate(dateParam || new Date().toISOString().split('T')[0])
    const startDate = baseDate.toISOString().split('T')[0]
    
    // If endDate is provided, use it; otherwise default to tomorrow for backward compatibility
    let endDate: string
    if (endDateParam) {
      const endBaseDate = new Date(endDateParam + 'T00:00:00Z')
      endBaseDate.setUTCDate(endBaseDate.getUTCDate() + 1) // Add one day to include the end date
      endDate = endBaseDate.toISOString().split('T')[0]
    } else {
      const tomorrow = new Date(baseDate)
      tomorrow.setUTCDate(baseDate.getUTCDate() + 1)
      endDate = tomorrow.toISOString().split('T')[0]
    }
    
    // Check KV cache first (distributed across instances)
    const cacheKey = `prices:${priceArea}:${startDate}:${endDate}`
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[Prices] Returning KV cached prices for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: { 
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          'X-Cache': 'HIT-KV'
        } 
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${priceArea}_${startDate}_${endDate}`
    const cached = priceCache.get(memCacheKey)
    if (cached) {
      console.log(`[Prices] Returning in-memory cached prices for ${memCacheKey}`)
      return NextResponse.json(cached, { 
        headers: { 
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          'X-Cache': 'HIT-MEMORY'
        } 
      })
    }
    
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${startDate}&end=${endDate}&filter={"PriceArea":["${priceArea}"]}&sort=HourUTC ASC`

    // Use queued fetch to prevent duplicate requests
    const result = await queuedFetch(memCacheKey, async () => {
      console.log(`[Prices] Fetching prices from EnergiDataService for ${cacheKey}`)
      
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
            console.warn(`[Prices] EnergiDataService returned ${externalResponse.status}`)
            throw new Error(`API returned ${externalResponse.status}`)
          }
          
          throw new Error(`Failed to fetch price data: ${externalResponse.status}`)
        }

        const data = await externalResponse.json()
        
        // Process records to add calculated prices with fees and VAT
        const processedRecords = data.records.map((record: any) => {
          const spotPriceMWh = record.SpotPriceDKK ?? 0
          const spotPriceKWh = spotPriceMWh / 1000
          const basePriceKWh = spotPriceKWh + SYSTEM_FEE_KWH + ELECTRICITY_TAX_KWH
          const totalPriceKWh = basePriceKWh * VAT_RATE
          
          return { 
            ...record, 
            SpotPriceKWh: spotPriceKWh, 
            TotalPriceKWh: totalPriceKWh 
          }
        })

        return { ...data, records: processedRecords }
      }, 3, 1000) // 3 attempts, 1s initial delay
    })
    
    // Cache the successful response in both memory and KV
    priceCache.set(memCacheKey, result)
    
    // Store in KV with both specific key and fallback "latest" key
    const fallbackKey = `prices:${priceArea}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, result, 300, 3600) // 5 min specific, 1 hour fallback
    
    return NextResponse.json(result, { 
      headers: { 
        ...cacheHeaders({ sMaxage: 300, swr: 600 }),
        'X-Cache': 'MISS'
      } 
    })

  } catch (error: any) {
    console.error('[Prices] Unexpected error in prices API route:', error)
    
    // Try to return cached data on error
    const region = request.nextUrl.searchParams.get('region') || 
                   request.nextUrl.searchParams.get('area') || 'DK2'
    const fallbackKey = `prices:${region}` // This now exists thanks to setKvJsonWithFallback
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
    console.log('[Prices] No fallback available, returning safe empty response')
    const emptyResponse = {
      data: [],
      metadata: {
        region,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        currency: 'DKK',
        priceArea: region,
        includeFees: true,
        lastUpdated: new Date().toISOString(),
        status: 'degraded',
        message: 'Price data temporarily unavailable'
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