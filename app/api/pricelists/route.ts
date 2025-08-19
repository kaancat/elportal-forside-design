/**
 * Pricelists API Route
 * Fetches provider price list data from EnergiDataService
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  readKvJson, 
  setKvJsonWithFallback, 
  fetchWithTimeout,
  retryWithBackoff,
  cacheHeaders,
  corsPublic,
  getCacheStatus,
  createLRUCache
} from '@/server/api-helpers'
import { regionSchema } from '@/server/api-validators'

// Configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// Cache configuration
const CACHE_TTL = 3600 // 1 hour for price lists (changes infrequently)
const FALLBACK_TTL = 7200 // 2 hours for fallback data
const memoryCache = createLRUCache<any>(CACHE_TTL * 1000)

/**
 * GET handler for pricelists endpoint
 * Fetches DatahubPricelist data from EnergiDataService
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Optional region filter
    const region = searchParams.get('region')
    const regionValidation = region ? regionSchema.safeParse(region) : { success: true }
    
    if (!regionValidation.success) {
      return NextResponse.json(
        { 
          ok: false,
          error: {
            code: 'INVALID_REGION',
            message: 'Region must be DK1, DK2, or Danmark'
          }
        },
        { status: 400 }
      )
    }

    // Build cache key
    const cacheKey = `pricelists:${region || 'all'}`
    const latestKey = 'pricelists:latest'
    
    // 1. Check KV cache first
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      return NextResponse.json(kvCached, {
        headers: {
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          ...corsPublic(),
          'X-Cache': 'HIT-KV'
        }
      })
    }
    
    // 2. Check memory cache
    const memoryCached = memoryCache.get(cacheKey)
    if (memoryCached) {
      return NextResponse.json(memoryCached, {
        headers: {
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          ...corsPublic(),
          'X-Cache': 'HIT-MEMORY'
        }
      })
    }
    
    // 3. Fetch fresh data with retry
    try {
      const data = await retryWithBackoff(async () => {
        // Build API URL with high limit to get all providers
        const apiUrl = new URL('https://api.energidataservice.dk/dataset/DatahubPricelist')
        apiUrl.searchParams.set('limit', '5000')
        apiUrl.searchParams.set('sort', 'ValidFrom DESC')
        
        // Add region filter if specified
        if (region && region !== 'Danmark') {
          const filter = { GridArea: [region] }
          apiUrl.searchParams.set('filter', JSON.stringify(filter))
        }
        
        console.log(`[Pricelists] Fetching from: ${apiUrl.toString()}`)
        
        const response = await fetchWithTimeout(apiUrl.toString(), {
          timeout: 8000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DinElPortal/1.0'
          }
        })
        
        if (!response.ok) {
          console.error(`[Pricelists] API error: ${response.status}`)
          throw new Error(`API returned ${response.status}`)
        }
        
        const result = await response.json()
        
        // Process and filter for current valid prices
        const now = new Date()
        const processedData = {
          providers: result.records
            .filter((record: any) => {
              const validFrom = new Date(record.ValidFrom)
              const validTo = record.ValidTo ? new Date(record.ValidTo) : new Date('2099-12-31')
              return validFrom <= now && validTo >= now
            })
            .map((record: any) => ({
              gln: record.GLN_Number,
              companyName: record.ChargeOwner,
              gridArea: record.GridArea,
              priceType: record.ChargeType,
              description: record.Description,
              price: record.Price1 || 0,
              validFrom: record.ValidFrom,
              validTo: record.ValidTo,
              resolution: record.ResolutionDuration
            })),
          metadata: {
            region: region || 'all',
            timestamp: now.toISOString(),
            providerCount: 0
          }
        }
        
        // Calculate unique provider count
        const uniqueProviders = new Set(processedData.providers.map((p: any) => p.gln))
        processedData.metadata.providerCount = uniqueProviders.size
        
        return processedData
      }, 3, 1000)
      
      // 4. Cache successful response
      memoryCache.set(cacheKey, data)
      await setKvJsonWithFallback(cacheKey, latestKey, data, CACHE_TTL, FALLBACK_TTL)
      
      return NextResponse.json(data, {
        headers: {
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          ...corsPublic(),
          'X-Cache': 'MISS'
        }
      })
      
    } catch (fetchError) {
      console.error('[Pricelists] Fetch failed:', fetchError)
      
      // 5. Try fallback cache on error
      const fallbackData = await readKvJson(latestKey)
      if (fallbackData) {
        console.log('[Pricelists] Using fallback data')
        return NextResponse.json(fallbackData, {
          headers: {
            ...cacheHeaders({ sMaxage: 60, swr: 300 }),
            ...corsPublic(),
            'X-Cache': 'HIT-STALE',
            'X-Degraded': 'true'
          }
        })
      }
      
      // 6. Return safe empty response instead of 500
      const emptyResponse = {
        providers: [],
        metadata: {
          region: region || 'all',
          timestamp: new Date().toISOString(),
          providerCount: 0,
          status: 'degraded',
          message: 'Price list data temporarily unavailable'
        }
      }
      
      return NextResponse.json(emptyResponse, {
        headers: {
          ...cacheHeaders({ sMaxage: 60, swr: 300 }),
          ...corsPublic(),
          'X-Cache': 'MISS-FALLBACK'
        }
      })
    }
    
  } catch (error) {
    console.error('[Pricelists] Unexpected error:', error)
    
    // Return safe empty response
    return NextResponse.json(
      {
        providers: [],
        metadata: {
          region: 'all',
          timestamp: new Date().toISOString(),
          providerCount: 0,
          status: 'error',
          message: 'An unexpected error occurred'
        }
      },
      {
        headers: {
          ...cacheHeaders({ sMaxage: 60, swr: 300 }),
          ...corsPublic(),
          'X-Cache': 'ERROR'
        }
      }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsPublic()
  })
}