import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv'

// In-memory cache for production data
const productionCache = new Map<string, { data: any; timestamp: number }>()
const PRODUCTION_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours - historical data rarely changes

// Request deduplication queue
const requestQueue = new Map<string, Promise<any>>()

async function queuedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
  if (requestQueue.has(key)) {
    console.log(`Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key)
  }
  
  const promise = fetcher().finally(() => {
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  // Check KV cache first (distributed across instances)
  const cacheKey = `production:${start}:${end}`
  
  try {
    const kvCached = await kv.get(cacheKey)
    if (kvCached) {
      console.log(`Returning KV cached production data for ${cacheKey}`)
      return res.status(200).json(kvCached).setHeader('X-Cache', 'HIT-KV')
    }
  } catch (e) {
    console.log('KV cache read failed:', e)
  }
  
  // Check in-memory cache as fallback
  const memCacheKey = `${start}_${end}`
  const cached = productionCache.get(memCacheKey)
  if (cached && Date.now() - cached.timestamp < PRODUCTION_CACHE_TTL) {
    console.log(`Returning in-memory cached production data for ${memCacheKey}`)
    return res.status(200).json(cached.data).setHeader('X-Cache', 'HIT-MEMORY')
  }

  // The verified Dataset ID. We will fetch all columns and process them on the frontend.
  const API_URL = `https://api.energidataservice.dk/dataset/ProductionConsumptionSettlement?start=${start}&end=${end}&sort=HourUTC asc`;

  try {
    // Use queued fetch to prevent duplicate requests
    const data = await queuedFetch(memCacheKey, async () => {
      console.log(`Fetching production data from EnergiDataService for ${cacheKey}`)
      
      // Retry logic for rate limiting (40 req/10s limit)
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
              console.warn(`EnergiDataService production returned ${apiResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            
            const errorText = await apiResponse.text();
            console.error("EnergiDataService API Error:", errorText);
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
    productionCache.set(memCacheKey, { data, timestamp: Date.now() })
    
    try {
      // Store in KV with 24 hour expiry for historical production data
      await kv.set(cacheKey, data, { ex: 86400 })
      console.log('Production data cached in KV')
    } catch (e) {
      console.log('Failed to cache production data in KV:', e)
    }
    
    res.status(200).json(data).setHeader('X-Cache', 'MISS');
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch monthly production data.', details: error.message });
  }
}