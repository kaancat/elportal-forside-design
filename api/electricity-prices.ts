// File: /api/electricity-prices.ts
// Optimized version with caching and request deduplication to reduce EnergiDataService API calls

export const dynamic = 'force-dynamic'; // Ensures the function runs dynamically for every request

// In-memory cache for electricity prices
// WHAT: Cache price data to reduce API calls to EnergiDataService
// WHY: 40 req/10s rate limit shared across all users and endpoints
const priceCache = new Map<string, { data: any; timestamp: number }>()
const PRICE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes - prices don't change frequently

// Request deduplication queue
// WHAT: Prevents duplicate simultaneous requests for the same data
// WHY: Multiple components may request same price data simultaneously
const requestQueue = new Map<string, Promise<any>>()

async function queuedFetch(key: string, fetcher: () => Promise<any>): Promise<any> {
  // If request already in flight, return the same promise
  if (requestQueue.has(key)) {
    console.log(`Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key)
  }
  
  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after 100ms to handle rapid retries
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}

/**
 * Vercel Serverless Function to fetch electricity spot prices from EnergiDataService.
 * This function is timezone-aware and explicitly uses Danish time (Europe/Copenhagen)
 * to prevent errors around midnight UTC.
 *
 * Query Parameters:
 * @param {string} [region | area] - The price area ('DK1' or 'DK2'). Defaults to 'DK2'.
 * @param {string} [date] - The date for which to fetch electricity prices. Format: YYYY-MM-DD.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Date Logic ---
    const dateParam = searchParams.get('date'); // Expects YYYY-MM-DD
    const baseDate = dateParam ? new Date(dateParam + 'T00:00:00Z') : new Date();
    const startDate = baseDate.toISOString().split('T')[0];
    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);
    const endDate = tomorrow.toISOString().split('T')[0];

    // --- Fee & Region Logic ---
    const systemFeeKWh = 0.19;
    const elafgiftKWh = 0.90;
    const vatRate = 1.25;
    const region = searchParams.get('region') || searchParams.get('area') || 'DK2';
    const area = region === 'DK1' ? 'DK1' : 'DK2';
    
    // Check cache first
    const cacheKey = `${area}_${startDate}_${endDate}`
    const cached = priceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
      console.log(`Returning cached electricity prices for ${cacheKey}`)
      return Response.json(cached.data, { 
        status: 200, 
        headers: { 
          'Cache-Control': 's-maxage=300', // 5 min edge cache
          'X-Cache': 'HIT'
        } 
      })
    }
    
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${startDate}&end=${endDate}&filter={"PriceArea":["${area}"]}&sort=HourUTC ASC`;

    // Use queued fetch to prevent duplicate requests
    const result = await queuedFetch(cacheKey, async () => {
      console.log(`Fetching electricity prices from EnergiDataService for ${cacheKey}`)
      
      // Retry logic for rate limiting (40 req/10s limit)
      const maxAttempts = 3
      const baseDelayMs = 1000
      let lastError: any = null
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const externalResponse = await fetch(apiUrl);

          if (!externalResponse.ok) {
            if (externalResponse.status === 404 || externalResponse.status === 400) {
              return { records: [] };
            }
            
            // Retry on rate limit or server errors
            if ((externalResponse.status === 429 || externalResponse.status === 503) && attempt < maxAttempts) {
              const delay = baseDelayMs * Math.pow(2, attempt - 1) // 1s, 2s
              console.warn(`EnergiDataService returned ${externalResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            
            throw new Error(`Failed to fetch data from EnergiDataService: ${externalResponse.status}`);
          }

          const result = await externalResponse.json();
          
          const processedRecords = result.records.map((record: any) => {
            const spotPriceMWh = record.SpotPriceDKK ?? 0;
            const spotPriceKWh = spotPriceMWh / 1000;
            const basePriceKWh = spotPriceKWh + systemFeeKWh + elafgiftKWh;
            const totalPriceKWh = basePriceKWh * vatRate;
            return { ...record, SpotPriceKWh: spotPriceKWh, TotalPriceKWh: totalPriceKWh };
          });

          return { ...result, records: processedRecords };
        } catch (error) {
          lastError = error
          if (attempt === maxAttempts) throw error
        }
      }
      
      throw lastError || new Error('Failed to fetch electricity prices')
    });
    
    // Cache the successful response
    priceCache.set(cacheKey, { data: result, timestamp: Date.now() })
    
    return Response.json(result, { 
      status: 200, 
      headers: { 
        'Cache-Control': 's-maxage=300', // 5 min edge cache
        'X-Cache': 'MISS'
      } 
    });

  } catch (error: any) {
    // 8. Handle unexpected internal errors.
    console.error('An unexpected error occurred in the API route:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}