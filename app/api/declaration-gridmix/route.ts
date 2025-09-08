/**
 * Declaration Gridmix API Route
 * Returns hourly grid composition breakdown by energy source with CO2 emissions data
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
const CACHE_TTL = 3600 // 1 hour (data has 5-7 day delay)
const FALLBACK_TTL = 7200 // 2 hours for fallback
const memoryCache = createLRUCache<any>(CACHE_TTL * 1000)

// Energy type categorization
const RENEWABLE_TYPES = ['Wind', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood', 'WasteIncineration']
const FOSSIL_TYPES = ['FossilGas', 'Coal', 'Oil']

/**
 * GET handler for declaration gridmix endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Parse and validate parameters
    const region = searchParams.get('region') || 'Danmark'
    const view = searchParams.get('view') || '7d'
    const dateParam = searchParams.get('date')
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
    if (dateParam) {
      const dateValidation = dateSchema.safeParse(dateParam)
      if (!dateValidation.success) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INVALID_DATE',
              message: 'Date must be in YYYY-MM-DD format'
            }
          },
          { status: 400 }
        )
      }
    }
    
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
    
    // Calculate date range (DeclarationGridmix has 5-7 day delay)
    const DATA_DELAY_DAYS = 7
    let baseDate = new Date()
    
    if (dateParam) {
      baseDate = new Date(dateParam + 'T12:00:00Z')
    }
    
    const adjustedEndDate = new Date(baseDate)
    adjustedEndDate.setDate(adjustedEndDate.getDate() - DATA_DELAY_DAYS)
    
    const endDate = new Date(adjustedEndDate)
    const startDate = new Date(adjustedEndDate)
    
    switch(view) {
      case '30d':
        startDate.setDate(startDate.getDate() - 29)
        break
      case '7d':
      default:
        startDate.setDate(startDate.getDate() - 6)
        break
    }
    
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
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
    const cacheKey = `declaration-gridmix:${region}:${view}:${apiStart}:${apiEnd}`
    const latestKey = `declaration-gridmix:${region}:latest`
    
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
        
        const apiUrl = buildApiUrl('https://api.energidataservice.dk/dataset/DeclarationGridmix', {
          start: apiStart,
          end: apiEnd,
          ...(Object.keys(filters).length > 0 && { filter: JSON.stringify(filters) }),
          sort: 'HourDK ASC'
        })
        
        console.log(`[DeclarationGridmix] Fetching from: ${apiUrl}`)
        
        const response = await fetchWithTimeout(apiUrl, {
          timeout: 8000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DinElPortal/1.0'
          }
        })
        
        if (!response.ok) {
          console.error(`[DeclarationGridmix] API error: ${response.status}`)
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
      console.error('[DeclarationGridmix] Fetch failed:', fetchError)
      
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
            message: 'Gridmix data temporarily unavailable'
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
    console.error('[DeclarationGridmix] Unexpected error:', error)
    
    return NextResponse.json(
      {
        records: [],
        metadata: {
          region: 'Danmark',
          view: '7d',
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
 * Process and aggregate gridmix data
 */
function processData(records: any[], region: string, view: string) {
  // Filter for latest version (prefer Final over Preliminary)
  const versionPriority = records.reduce((acc: any, record: any) => {
    const key = `${record.HourDK}_${record.ReportGrp}_${record.PriceArea}`
    if (!acc[key] || record.Version === 'Final') {
      acc[key] = record
    }
    return acc
  }, {})
  
  const filteredRecords = Object.values(versionPriority)
  
  // Group by hour
  const hourlyData: Record<string, any> = {}
  
  filteredRecords.forEach((record: any) => {
    const hourKey = record.HourDK
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = {
        HourDK: hourKey,
        HourUTC: record.HourUTC,
        PriceArea: region === 'Danmark' ? 'Danmark' : record.PriceArea,
        totalShare: 0,
        totalCO2: 0,
        mixByType: {},
        renewableShare: 0,
        fossilShare: 0,
        importShare: 0
      }
    }
    
    const hour = hourlyData[hourKey]
    const shareMWh = record.ShareMWh || 0
    const co2 = record.CO2Emission || 0
    
    // Check if imported
    const isImport = record.ConnectedArea !== record.PriceArea
    const typeKey = isImport ? `${record.ReportGrp}_${record.ConnectedArea}` : record.ReportGrp
    
    // Aggregate by type and origin
    if (!hour.mixByType[typeKey]) {
      hour.mixByType[typeKey] = {
        shareMWh: 0,
        co2Emission: 0,
        percentage: 0,
        origin: record.ConnectedArea,
        isImport: isImport,
        baseType: record.ReportGrp
      }
    }
    
    hour.mixByType[typeKey].shareMWh += shareMWh
    hour.mixByType[typeKey].co2Emission += co2
    hour.totalShare += shareMWh
    hour.totalCO2 += co2
    
    if (isImport) {
      hour.importShare += shareMWh
    }
    
    // Categorize
    if (RENEWABLE_TYPES.some(type => record.ReportGrp.includes(type))) {
      hour.renewableShare += shareMWh
    } else if (FOSSIL_TYPES.some(type => record.ReportGrp.includes(type))) {
      hour.fossilShare += shareMWh
    }
  })
  
  // Calculate percentages and CO2 intensity
  const aggregatedData = Object.values(hourlyData).map((hour: any) => {
    Object.keys(hour.mixByType).forEach(type => {
      hour.mixByType[type].percentage = hour.totalShare > 0 
        ? (hour.mixByType[type].shareMWh / hour.totalShare) * 100 
        : 0
    })
    
    hour.averageCO2 = hour.totalShare > 0 
      ? hour.totalCO2 / hour.totalShare 
      : 0
    
    hour.renewablePercentage = hour.totalShare > 0 
      ? (hour.renewableShare / hour.totalShare) * 100 
      : 0
    
    hour.fossilPercentage = hour.totalShare > 0 
      ? (hour.fossilShare / hour.totalShare) * 100 
      : 0
    
    hour.importPercentage = hour.totalShare > 0 
      ? (hour.importShare / hour.totalShare) * 100 
      : 0
    
    return hour
  })
  
  // Sort by time
  aggregatedData.sort((a: any, b: any) => 
    new Date(a.HourDK).getTime() - new Date(b.HourDK).getTime()
  )
  
  // Aggregate to daily if needed
  let finalData = aggregatedData
  if (view === '30d' && aggregatedData.length > 168) {
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
      aggregation: view === '30d' && aggregatedData.length > 168 ? 'daily' : 'hourly'
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
        totalShare: 0,
        totalCO2: 0,
        mixByType: {}
      }
    }
    
    dailyData[date].hours.push(hour)
    dailyData[date].totalShare += hour.totalShare
    dailyData[date].totalCO2 += hour.totalCO2
    
    Object.entries(hour.mixByType).forEach(([type, data]: [string, any]) => {
      if (!dailyData[date].mixByType[type]) {
        dailyData[date].mixByType[type] = {
          shareMWh: 0,
          co2Emission: data.co2Emission / hour.totalShare || 0
        }
      }
      dailyData[date].mixByType[type].shareMWh += data.shareMWh
    })
  })
  
  return Object.values(dailyData).map((day: any) => {
    const avgData: any = {
      HourDK: day.date + 'T12:00:00',
      PriceArea: region,
      totalShare: day.totalShare / day.hours.length,
      averageCO2: day.totalCO2 / day.totalShare,
      mixByType: {},
      renewableShare: 0,
      fossilShare: 0,
      importShare: 0
    }
    
    Object.entries(day.mixByType).forEach(([type, data]: [string, any]) => {
      const avgShareMWh = data.shareMWh / day.hours.length
      avgData.mixByType[type] = {
        shareMWh: avgShareMWh,
        co2Emission: data.co2Emission,
        percentage: (avgShareMWh / avgData.totalShare) * 100
      }
      
      if (RENEWABLE_TYPES.some(renewableType => type.includes(renewableType))) {
        avgData.renewableShare += avgShareMWh
      } else if (FOSSIL_TYPES.some(fossilType => type.includes(fossilType))) {
        avgData.fossilShare += avgShareMWh
      } else if (type.includes('Import')) {
        avgData.importShare += avgShareMWh
      }
    })
    
    avgData.renewablePercentage = (avgData.renewableShare / avgData.totalShare) * 100
    avgData.fossilPercentage = (avgData.fossilShare / avgData.totalShare) * 100
    avgData.importPercentage = (avgData.importShare / avgData.totalShare) * 100
    
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