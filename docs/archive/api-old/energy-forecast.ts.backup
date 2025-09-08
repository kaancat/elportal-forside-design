import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv'

// In-memory cache for forecast data
const forecastCache = new Map<string, { data: any; timestamp: number }>()
const FORECAST_CACHE_TTL = 30 * 60 * 1000 // 30 minutes - forecast updates every 6 hours

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

// Helper to format date into YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract both region and date from query parameters
  const { region = 'Danmark', date } = req.query;

  // Determine the start and end dates for the query
  const queryDate = date ? new Date(date as string) : new Date();
  const start = formatDate(queryDate);
  
  const tomorrow = new Date(queryDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = formatDate(tomorrow);

  // Check KV cache first (distributed across instances)
  const cacheKey = `forecast:${region}:${start}:${end}`
  
  try {
    const kvCached = await kv.get(cacheKey)
    if (kvCached) {
      console.log(`Returning KV cached forecast for ${cacheKey}`)
      return res.status(200).json(kvCached).setHeader('X-Cache', 'HIT-KV')
    }
  } catch (e) {
    console.log('KV cache read failed:', e)
  }
  
  // Check in-memory cache as fallback
  const memCacheKey = `${region}_${start}_${end}`
  const cached = forecastCache.get(memCacheKey)
  if (cached && Date.now() - cached.timestamp < FORECAST_CACHE_TTL) {
    console.log(`Returning in-memory cached forecast for ${memCacheKey}`)
    return res.status(200).json(cached.data).setHeader('X-Cache', 'HIT-MEMORY')
  }

  // Apply region filter - Danmark means no filter (all regions), otherwise filter by specific region
  const regionFilter = region === 'Danmark' 
    ? '' 
    : `&filter={"PriceArea":["${region}"]}`;

  const API_URL = `https://api.energidataservice.dk/dataset/Forecasts_Hour?start=${start}&end=${end}${regionFilter}&sort=HourUTC asc`;

  try {
    // Use queued fetch to prevent duplicate requests
    const data = await queuedFetch(memCacheKey, async () => {
      console.log(`Fetching forecast from EnergiDataService for ${cacheKey}`)
      
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
              console.warn(`EnergiDataService forecast returned ${apiResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            
            throw new Error(`EnergiDataService API failed: ${apiResponse.status}`);
          }
          
          const data = await apiResponse.json();
          return data;
        } catch (error) {
          lastError = error
          if (attempt === maxAttempts) throw error
        }
      }
      
      throw lastError || new Error('Failed to fetch forecast')
    })
    
    // Cache the successful response in both memory and KV
    forecastCache.set(memCacheKey, { data, timestamp: Date.now() })
    
    try {
      // Store in KV with 30 minute expiry for forecast data
      await kv.set(cacheKey, data, { ex: 1800 })
      console.log('Forecast data cached in KV')
    } catch (e) {
      console.log('Failed to cache forecast in KV:', e)
    }
    
    res.status(200).json(data).setHeader('X-Cache', 'MISS');
  } catch (error: any) {
    console.error('Error fetching from EnergiDataService:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data.', details: error.message });
  }
}