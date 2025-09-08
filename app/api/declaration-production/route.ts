/**
 * Declaration Production API Route
 * Returns hourly production breakdown by energy source with CO2 emissions data
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  readKvJson,
  setKvJsonWithFallback,
  fetchWithTimeout,
  retryWithBackoff,
  cacheHeaders,
  corsPublic,
  createLRUCache,
  buildApiUrl
} from '@/server/api-helpers'
import { regionSchema, dateSchema } from '@/server/api-validators'

// Configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// Cache configuration
const CACHE_TTL = 3600 // 1 hour (data has 10+ day delay)
const FALLBACK_TTL = 7200 // 2 hours for fallback
const memoryCache = createLRUCache<any>(CACHE_TTL * 1000)

// Energy type categorization
const RENEWABLE_TYPES = ['WindOffshore', 'WindOnshore', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood']
const FOSSIL_TYPES = ['FossilGas', 'Coal', 'Fossil Oil']

/**
 * GET handler for declaration production endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Parse and validate parameters
    const region = searchParams.get('region') || 'Danmark'
    const view = searchParams.get('view') || '24h'
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    
    // Validate region
    const regionValidation = regionSchema.safeParse(region)
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
    
    // Validate dates if provided
    if (startParam) {
      const startValidation = dateSchema.safeParse(startParam)
      if (!startValidation.success) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_DATE',
              message: 'Start date must be in YYYY-MM-DD format'
            }
          },
          { status: 400 }
        )
      }
    }
    
    if (endParam) {
      const endValidation = dateSchema.safeParse(endParam)
      if (!endValidation.success) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_DATE',
              message: 'End date must be in YYYY-MM-DD format'
            }
          },
          { status: 400 }
        )
      }
    }
    
    // Calculate date range (DeclarationProduction has 10+ day delay)
    const DATA_DELAY_DAYS = 10
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - DATA_DELAY_DAYS)
    
    const startDate = new Date(endDate)
    
    switch(view) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '24h':
      default:
        startDate.setDate(startDate.getDate() - 1)
        break
    }
    
    // Override with explicit dates if provided
    if (startParam) {
      startDate.setTime(new Date(startParam + 'T00:00:00Z').getTime())
    }
    if (endParam) {
      endDate.setTime(new Date(endParam + 'T23:59:59Z').getTime())
    }
    
    // Format dates for API
    const apiStart = startDate.toISOString().substring(0, 16)
    const apiEnd = endDate.toISOString().substring(0, 16)
    
    // Build cache key
    const cacheKey = `declaration-production:${region}:${view}:${apiStart}:${apiEnd}`
    const latestKey = `declaration-production:${region}:latest`
    
    // 1. Check KV cache
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      return NextResponse.json(kvCached, {
        headers: {
          ...cacheHeaders({ sMaxage: 600, swr: 1200 }),
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
          ...cacheHeaders({ sMaxage: 600, swr: 1200 }),
          ...corsPublic(),
          'X-Cache': 'HIT-MEMORY'
        }
      })
    }
    
    // 3. Fetch fresh data
    try {
      const data = await retryWithBackoff(async () => {
        // Build filter for region
        const filters: any = {}
        if (region === 'DK1' || region === 'DK2') {
          filters.PriceArea = [region]
        }
        
        const apiUrl = buildApiUrl('https://api.energidataservice.dk/dataset/DeclarationProduction', {
          start: apiStart,
          end: apiEnd,
          ...(Object.keys(filters).length > 0 && { filter: JSON.stringify(filters) }),
          sort: 'HourDK ASC'
        })
        
        console.log(`[DeclarationProduction] Fetching from: ${apiUrl}`)
        
        const response = await fetchWithTimeout(apiUrl, {
          timeout: 8000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DinElPortal/1.0'
          }
        })
        
        if (!response.ok) {
          console.error(`[DeclarationProduction] API error: ${response.status}`)
          throw new Error(`API returned ${response.status}`)
        }
        
        const result = await response.json()
        
        // Process and aggregate data
        const processedData = processData(result.records || [], region, view)
        
        return processedData
      }, 3, 1000)
      
      // 4. Cache successful response
      memoryCache.set(cacheKey, data)
      await setKvJsonWithFallback(cacheKey, latestKey, data, CACHE_TTL, FALLBACK_TTL)
      
      return NextResponse.json(data, {
        headers: {
          ...cacheHeaders({ sMaxage: 600, swr: 1200 }),
          ...corsPublic(),
          'X-Cache': 'MISS'
        }
      })
      
    } catch (fetchError) {
      console.error('[DeclarationProduction] Fetch failed:', fetchError)
      
      // 5. Try fallback cache
      const fallbackData = await readKvJson(latestKey)
      if (fallbackData) {
        return NextResponse.json(fallbackData, {
          headers: {
            ...cacheHeaders({ sMaxage: 300, swr: 600 }),
            ...corsPublic(),
            'X-Cache': 'HIT-STALE',
            'X-Degraded': 'true'
          }
        })
      }
      
      // 6. Return safe empty response
      return NextResponse.json(
        {
          records: [],
          metadata: {
            region,
            view,
            startDate: apiStart,
            endDate: apiEnd,
            dataPoints: 0,
            status: 'degraded',
            message: 'Production data temporarily unavailable'
          }
        },
        {
          headers: {
            ...cacheHeaders({ sMaxage: 60, swr: 300 }),
            ...corsPublic(),
            'X-Cache': 'MISS-FALLBACK'
          }
        }
      )
    }
    
  } catch (error) {
    console.error('[DeclarationProduction] Unexpected error:', error)
    
    return NextResponse.json(
      {
        records: [],
        metadata: {
          region: 'Danmark',
          view: '24h',
          dataPoints: 0,
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
 * Process and aggregate production data
 */
function processData(records: any[], region: string, view: string) {
  // Filter for valid allocation methods
  const filteredRecords = records.filter((r: any) => {
    return r.FuelAllocationMethod === '125%' || 
           r.FuelAllocationMethod === '125pct' ||
           r.FuelAllocationMethod === 'All' ||
           r.FuelAllocationMethod === 'Actual' ||
           !r.FuelAllocationMethod
  })
  
  // Group by hour
  const hourlyData: Record<string, any> = {}
  
  filteredRecords.forEach((record: any) => {
    const hourKey = record.HourDK
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = {
        HourDK: hourKey,
        HourUTC: record.HourUTC,
        PriceArea: region === 'Danmark' ? 'Danmark' : record.PriceArea,
        totalProduction: 0,
        totalCO2: 0,
        productionByType: {},
        renewableProduction: 0,
        fossilProduction: 0
      }
    }
    
    const hour = hourlyData[hourKey]
    const production = record.Production_MWh || 0
    const co2 = record.CO2PerkWh || 0
    
    // Aggregate by type
    if (!hour.productionByType[record.ProductionType]) {
      hour.productionByType[record.ProductionType] = {
        production: 0,
        co2PerKWh: 0,
        share: 0
      }
    }
    
    hour.productionByType[record.ProductionType].production += production
    hour.productionByType[record.ProductionType].co2PerKWh = co2
    hour.totalProduction += production
    hour.totalCO2 += production * co2
    
    // Categorize
    if (RENEWABLE_TYPES.includes(record.ProductionType)) {
      hour.renewableProduction += production
    } else if (FOSSIL_TYPES.includes(record.ProductionType)) {
      hour.fossilProduction += production
    }
  })
  
  // Calculate shares and CO2 intensity
  const aggregatedData = Object.values(hourlyData).map((hour: any) => {
    Object.keys(hour.productionByType).forEach(type => {
      hour.productionByType[type].share = hour.totalProduction > 0 
        ? (hour.productionByType[type].production / hour.totalProduction) * 100 
        : 0
    })
    
    hour.averageCO2 = hour.totalProduction > 0 
      ? hour.totalCO2 / hour.totalProduction 
      : 0
    
    hour.renewableShare = hour.totalProduction > 0 
      ? (hour.renewableProduction / hour.totalProduction) * 100 
      : 0
    
    return hour
  })
  
  // Sort by time
  aggregatedData.sort((a: any, b: any) => 
    new Date(a.HourDK).getTime() - new Date(b.HourDK).getTime()
  )
  
  // Aggregate to daily if needed
  let finalData = aggregatedData
  if (view === '30d' && aggregatedData.length > 240) {
    finalData = aggregateToDaily(aggregatedData, region)
  }
  
  return {
    records: finalData,
    metadata: {
      region,
      view,
      startDate: aggregatedData[0]?.HourDK || '',
      endDate: aggregatedData[aggregatedData.length - 1]?.HourDK || '',
      dataPoints: finalData.length,
      aggregation: view === '30d' && aggregatedData.length > 240 ? 'daily' : 'hourly'
    }
  }
}

/**
 * Aggregate hourly data to daily averages
 */
function aggregateToDaily(hourlyData: any[], region: string) {
  const dailyData: Record<string, any> = {}
  
  hourlyData.forEach((hour: any) => {
    const date = hour.HourDK.split('T')[0]
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        hours: [],
        totalProduction: 0,
        totalCO2: 0,
        productionByType: {}
      }
    }
    
    dailyData[date].hours.push(hour)
    dailyData[date].totalProduction += hour.totalProduction
    dailyData[date].totalCO2 += hour.totalCO2
    
    Object.entries(hour.productionByType).forEach(([type, data]: [string, any]) => {
      if (!dailyData[date].productionByType[type]) {
        dailyData[date].productionByType[type] = {
          production: 0,
          co2PerKWh: data.co2PerKWh
        }
      }
      dailyData[date].productionByType[type].production += data.production
    })
  })
  
  return Object.values(dailyData).map((day: any) => {
    const avgData: any = {
      HourDK: day.date + 'T12:00:00',
      PriceArea: region,
      totalProduction: day.totalProduction / day.hours.length,
      averageCO2: day.totalCO2 / day.totalProduction,
      productionByType: {},
      renewableProduction: 0,
      fossilProduction: 0
    }
    
    Object.entries(day.productionByType).forEach(([type, data]: [string, any]) => {
      const avgProduction = data.production / day.hours.length
      avgData.productionByType[type] = {
        production: avgProduction,
        co2PerKWh: data.co2PerKWh,
        share: (avgProduction / avgData.totalProduction) * 100
      }
      
      if (RENEWABLE_TYPES.includes(type)) {
        avgData.renewableProduction += avgProduction
      }
    })
    
    avgData.renewableShare = (avgData.renewableProduction / avgData.totalProduction) * 100
    
    return avgData
  })
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