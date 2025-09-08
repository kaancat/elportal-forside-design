/**
 * Next.js App Router API Route for monthly production data
 * RESTORED TO MATCH PRODUCTION EXACTLY
 * 
 * Features from production:
 * - KV caching with 24-hour TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Uses ProductionConsumptionSettlement dataset
 * - Returns raw EnergiDataService response
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJson,
  cacheHeaders,
  createLRUCache
} from '@/server/api-helpers'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Historical data but real-time queries

// In-memory cache for production data (24 hours like production)
const productionCache = createLRUCache<any>(24 * 60 * 60 * 1000, 50) // 24 hours TTL, max 50 entries

/**
 * GET /api/monthly-production
 * 
 * EXACT PRODUCTION LOGIC: Fetch last 12 months of production data
 * Returns raw EnergiDataService response for frontend processing
 */
export async function GET(request: NextRequest) {
  // EXACT production date logic
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  // Check KV cache first (distributed across instances)
  const cacheKey = `production:${start}:${end}`

  try {
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[MonthlyProduction] Returning KV cached data for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 86400, swr: 172800 }), // 24h cache like production
          'X-Cache': 'HIT-KV'
        }
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${start}_${end}`
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

    // EXACT production API URL
    const API_URL = `https://api.energidataservice.dk/dataset/ProductionConsumptionSettlement?start=${start}&end=${end}&sort=HourUTC asc`;

    // Use queued fetch with production retry logic
    const data = await queuedFetch(memCacheKey, async () => {
      console.log(`[MonthlyProduction] Fetching production data from EnergiDataService for ${cacheKey}`)
      
      // EXACT production retry logic
      const maxAttempts = 3
      const baseDelayMs = 1000
      let lastError: any = null
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const apiResponse = await fetch(API_URL);
          
          if (!apiResponse.ok) {
            // Retry on rate limit or server errors
            if ((apiResponse.status === 429 || apiResponse.status === 503) && attempt < maxAttempts) {
              const delay = baseDelayMs * Math.pow(2, attempt - 1) // 1s, 2s
              console.warn(`[MonthlyProduction] EnergiDataService returned ${apiResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            
            const errorText = await apiResponse.text();
            console.error("[MonthlyProduction] EnergiDataService API Error:", errorText);
            throw new Error(`API call failed: ${apiResponse.status}`);
          }
          
          const data = await apiResponse.json();
          return data;
        } catch (error) {
          lastError = error
          if (attempt === maxAttempts) throw error
        }
      }
      
      throw lastError || new Error('Failed to fetch production data')
    })
    
    // Cache the successful response in both memory and KV
    productionCache.set(memCacheKey, data)
    
    // Store in KV with 24 hour expiry for historical production data  
    await setKvJson(cacheKey, data, 86400)
    console.log('[MonthlyProduction] Production data cached in KV')
    
    // Return raw data like production (NO processing)
    return NextResponse.json(data, {
      headers: { 
        ...cacheHeaders({ sMaxage: 86400, swr: 172800 }),
        'X-Cache': 'MISS'
      }
    })
    
  } catch (error: any) {
    console.error('[MonthlyProduction] Unexpected error:', error)
    
    // Try to return cached data on error
    const fallback = await readKvJson(cacheKey)
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          ...cacheHeaders({ sMaxage: 3600 }),
          'X-Cache': 'HIT-STALE'
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch monthly production data.', details: error.message },
      { status: 500 }
    )
  }
}