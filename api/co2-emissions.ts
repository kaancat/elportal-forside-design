import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic';

// In-memory cache for CO2 emissions data
const emissionsCache = new Map<string, { data: any; timestamp: number }>()
const EMISSIONS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes - CO2 data updates every 5 minutes

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

/**
 * Vercel Serverless Function to fetch CO2 emissions data from EnergiDataService.
 * Returns CO2 intensity of electricity consumption in g/kWh.
 * Now with KV caching and request deduplication for improved performance.
 *
 * Query Parameters:
 * @param {string} [region] - The price area ('DK1', 'DK2', or 'Danmark' for both). Defaults to 'Danmark'.
 * @param {string} [date] - The date for which to fetch CO2 emissions. Format: YYYY-MM-DD.
 * @param {string} [aggregation] - Data aggregation ('5min' or 'hourly'). Defaults to 'hourly'.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Date logic
    const dateParam = searchParams.get('date');
    const baseDate = dateParam ? new Date(dateParam + 'T00:00:00Z') : new Date();
    const startDate = baseDate.toISOString().split('T')[0] + 'T00:00';
    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);
    const endDate = tomorrow.toISOString().split('T')[0] + 'T00:00';

    // Region logic
    const region = searchParams.get('region') || 'Danmark';
    const aggregation = searchParams.get('aggregation') || 'hourly';

    // Check KV cache first (distributed across instances)
    const cacheKey = `co2:${region}:${startDate}:${endDate}:${aggregation}`
    
    try {
      const kvCached = await kv.get(cacheKey)
      if (kvCached) {
        console.log(`Returning KV cached CO2 emissions for ${cacheKey}`)
        return Response.json(kvCached, { 
          status: 200, 
          headers: { 
            'Cache-Control': 's-maxage=300',
            'X-Cache': 'HIT-KV'
          } 
        })
      }
    } catch (e) {
      console.log('KV cache read failed:', e)
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${region}_${startDate}_${endDate}_${aggregation}`
    const cached = emissionsCache.get(memCacheKey)
    if (cached && Date.now() - cached.timestamp < EMISSIONS_CACHE_TTL) {
      console.log(`Returning in-memory cached CO2 emissions for ${memCacheKey}`)
      return Response.json(cached.data, { 
        status: 200, 
        headers: { 
          'Cache-Control': 's-maxage=300',
          'X-Cache': 'HIT-MEMORY'
        } 
      })
    }

    // Build filter based on region
    let filter = '';
    if (region === 'DK1') {
      filter = '&filter={"PriceArea":["DK1"]}';
    } else if (region === 'DK2') {
      filter = '&filter={"PriceArea":["DK2"]}';
    }
    // If 'Danmark', no filter (gets both DK1 and DK2)

    const apiUrl = `https://api.energidataservice.dk/dataset/CO2Emis?start=${startDate}&end=${endDate}${filter}&sort=Minutes5UTC ASC`;

    // Use queued fetch to prevent duplicate requests
    const fetchResult = await queuedFetch(memCacheKey, async () => {
      console.log(`Fetching CO2 emissions from EnergiDataService for ${cacheKey}`)
      
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
              console.warn(`EnergiDataService CO2 returned ${externalResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
              await new Promise(r => setTimeout(r, delay))
              continue
            }
            
            throw new Error(`Failed to fetch CO2 data: ${externalResponse.status}`);
          }

          const result = await externalResponse.json();
          return result;
        } catch (error) {
          lastError = error
          if (attempt === maxAttempts) throw error
        }
      }
      
      throw lastError || new Error('Failed to fetch CO2 emissions')
    });

    // Process the data
    let processedRecords = fetchResult.records || [];

    // If hourly aggregation is requested, aggregate 5-minute data to hourly
    if (aggregation === 'hourly' && processedRecords.length > 0) {
      const hourlyData: Record<string, { emissions: number[]; priceArea: string }> = {};

      processedRecords.forEach((record: any) => {
        const date = new Date(record.Minutes5UTC);
        const hourKey = date.toISOString().substring(0, 13) + ':00:00Z';
        
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { emissions: [], priceArea: record.PriceArea };
        }
        
        if (record.CO2Emission !== null) {
          hourlyData[hourKey].emissions.push(record.CO2Emission);
        }
      });

      // Convert to array and calculate averages
      processedRecords = Object.entries(hourlyData).map(([hour, data]) => {
        const avgEmission = data.emissions.length > 0
          ? data.emissions.reduce((sum, val) => sum + val, 0) / data.emissions.length
          : null;

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
        };
      });

      // If Danmark is selected, merge DK1 and DK2 data
      if (region === 'Danmark') {
        const mergedData: Record<string, { emissions: number[] }> = {};
        
        processedRecords.forEach((record: any) => {
          if (!mergedData[record.HourUTC]) {
            mergedData[record.HourUTC] = { emissions: [] };
          }
          if (record.CO2Emission !== null) {
            mergedData[record.HourUTC].emissions.push(record.CO2Emission);
          }
        });

        processedRecords = Object.entries(mergedData).map(([hour, data]) => {
          const avgEmission = data.emissions.length > 0
            ? data.emissions.reduce((sum, val) => sum + val, 0) / data.emissions.length
            : null;

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
          };
        });
      }
    } else {
      // For 5-minute data, just add emission level
      processedRecords = processedRecords.map((record: any) => ({
        ...record,
        EmissionLevel: getEmissionLevel(record.CO2Emission)
      }));
    }

    // Sort by time
    processedRecords.sort((a: any, b: any) => 
      new Date(a.HourUTC || a.Minutes5UTC).getTime() - new Date(b.HourUTC || b.Minutes5UTC).getTime()
    );

    const finalData = { 
      ...fetchResult, 
      records: processedRecords,
      metadata: {
        region,
        date: baseDate.toISOString().split('T')[0],
        aggregation
      }
    };

    // Cache the successful response in both memory and KV
    emissionsCache.set(memCacheKey, { data: finalData, timestamp: Date.now() })
    
    try {
      // Store in KV with 5 minute expiry for CO2 data
      await kv.set(cacheKey, finalData, { ex: 300 })
      console.log('CO2 emissions data cached in KV')
    } catch (e) {
      console.log('Failed to cache CO2 emissions in KV:', e)
    }

    return Response.json(finalData, {
      status: 200,
      headers: { 
        'Cache-Control': 's-maxage=300',
        'X-Cache': 'MISS'
      }
    });

  } catch (error: any) {
    console.error('An unexpected error occurred in the CO2 emissions API route:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getEmissionLevel(emission: number | null): string {
  if (emission === null) return 'unknown';
  if (emission < 100) return 'very-low';
  if (emission < 200) return 'low';
  if (emission < 300) return 'moderate';
  if (emission < 400) return 'high';
  return 'very-high';
}