/**
 * Private Industry Consumption API Route
 * Returns electricity consumption data by municipality and housing/heating categories
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
import { dateSchema } from '@/server/api-validators'

// Configuration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// Cache configuration
const CACHE_TTL = 900 // 15 minutes for raw data
const FALLBACK_TTL = 1800 // 30 minutes for fallback
const memoryCache = createLRUCache<any>(CACHE_TTL * 1000)

// Danish municipality mapping
const MUNICIPALITY_NAMES: Record<string, string> = {
  "101": "København",
  "147": "Frederiksberg",
  "151": "Ballerup",
  "153": "Brøndby",
  "155": "Dragør",
  "157": "Gentofte",
  "159": "Gladsaxe",
  "161": "Glostrup",
  "163": "Herlev",
  "165": "Albertslund",
  "167": "Hvidovre",
  "169": "Høje-Taastrup",
  "173": "Lyngby-Taarbæk",
  "175": "Rødovre",
  "183": "Ishøj",
  "185": "Tårnby",
  "187": "Vallensbæk",
  "190": "Furesø",
  "201": "Allerød",
  "210": "Fredensborg",
  "217": "Helsingør",
  "219": "Hillerød",
  "223": "Hørsholm",
  "230": "Rudersdal",
  "240": "Egedal",
  "250": "Frederikssund",
  "253": "Greve",
  "259": "Køge",
  "260": "Roskilde",
  "265": "Solrød",
  "269": "Lejre",
  "270": "Holbæk",
  "306": "Odsherred",
  "316": "Halsnæs",
  "320": "Faxe",
  "326": "Kalundborg",
  "329": "Ringsted",
  "330": "Sorø",
  "336": "Stevns",
  "340": "Guldborgsund",
  "350": "Næstved",
  "360": "Lolland",
  "370": "Vordingborg",
  "376": "Bornholm",
  "390": "Slagelse",
  "400": "Middelfart",
  "410": "Assens",
  "420": "Faaborg-Midtfyn",
  "430": "Kerteminde",
  "440": "Nyborg",
  "450": "Odense",
  "461": "Svendborg",
  "479": "Nordfyns",
  "480": "Langeland",
  "482": "Ærø",
  "492": "Vejle",
  "510": "Haderslev",
  "530": "Billund",
  "540": "Sønderborg",
  "550": "Tønder",
  "561": "Esbjerg",
  "563": "Fanø",
  "573": "Varde",
  "575": "Vejen",
  "630": "Aabenraa",
  "657": "Herning",
  "661": "Holstebro",
  "665": "Lemvig",
  "671": "Struer",
  "706": "Syddjurs",
  "707": "Norddjurs",
  "710": "Favrskov",
  "727": "Odder",
  "730": "Randers",
  "740": "Silkeborg",
  "741": "Samsø",
  "746": "Skanderborg",
  "751": "Århus",
  "756": "Ikast-Brande",
  "760": "Ringkøbing-Skjern",
  "766": "Hedensted",
  "779": "Skive",
  "787": "Viborg",
  "791": "Rønne",
  "810": "Brønderslev",
  "813": "Frederikshavn",
  "820": "Vesthimmerlands",
  "825": "Læsø",
  "840": "Rebild",
  "846": "Mariagerfjord",
  "849": "Jammerbugt",
  "851": "Aalborg",
  "860": "Hjørring",
  "861": "Thisted"
}

/**
 * GET handler for private industry consumption endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Parse parameters
    const municipality = searchParams.get('municipality')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const housingCategory = searchParams.get('housing')
    const heatingCategory = searchParams.get('heating')
    const aggregationType = searchParams.get('aggregate') as 'daily' | 'monthly' | 'municipality' | null
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 10000)
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Validate dates if provided
    if (startDate) {
      const startValidation = dateSchema.safeParse(startDate)
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
    
    if (endDate) {
      const endValidation = dateSchema.safeParse(endDate)
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
    
    // Build date range - default to last 24 hours
    const now = new Date()
    const defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const start = startDate ? `${startDate}T00:00:00Z` : defaultStart.toISOString()
    const end = endDate ? `${endDate}T23:59:59Z` : now.toISOString()
    
    // Build cache key
    const cacheKey = `private-consumption:${municipality || 'all'}:${housingCategory || 'all'}:${heatingCategory || 'all'}:${aggregationType || 'none'}:${start}:${end}`
    const latestKey = `private-consumption:${municipality || 'all'}:latest`
    
    // Determine cache TTL based on aggregation
    const cacheTTL = aggregationType === 'municipality' ? 1800 : 
                    aggregationType === 'daily' || aggregationType === 'monthly' ? 3600 : 
                    900
    
    // 1. Check KV cache
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
    
    // 3. Fetch fresh data
    try {
      const data = await retryWithBackoff(async () => {
        // Build filter object
        const filters: Record<string, string[]> = {}
        if (municipality) {
          filters.MunicipalityNo = [municipality]
        }
        if (housingCategory) {
          filters.HousingCategory = [housingCategory]
        }
        if (heatingCategory) {
          filters.HeatingCategory = [heatingCategory]
        }
        
        const params: Record<string, string> = {
          start: start.split('T')[0],
          end: end.split('T')[0],
          sort: 'HourUTC ASC',
          limit: limit.toString(),
          offset: offset.toString()
        }
        
        if (Object.keys(filters).length > 0) {
          params.filter = JSON.stringify(filters)
        }
        
        const apiUrl = buildApiUrl('https://api.energidataservice.dk/dataset/PrivIndustryConsumptionHour', params)
        
        console.log(`[PrivateConsumption] Fetching from: ${apiUrl}`)
        
        const response = await fetchWithTimeout(apiUrl, {
          timeout: 8000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DinElPortal/1.0'
          }
        })
        
        if (!response.ok) {
          console.error(`[PrivateConsumption] API error: ${response.status}`)
          throw new Error(`API returned ${response.status}`)
        }
        
        const result = await response.json()
        
        // Process data
        const processedRecords = result.records.map((record: any) => ({
          HourUTC: record.HourUTC,
          HourDK: record.HourDK,
          MunicipalityNo: record.MunicipalityNo,
          MunicipalityName: MUNICIPALITY_NAMES[record.MunicipalityNo] || `Municipality ${record.MunicipalityNo}`,
          HousingCategory: record.HousingCategory,
          HeatingCategory: record.HeatingCategory,
          ConsumptionkWh: record.ConsumptionkWh || 0
        }))
        
        // Get available categories
        const availableCategories = {
          housing: [...new Set(processedRecords.map((r: any) => r.HousingCategory))].sort(),
          heating: [...new Set(processedRecords.map((r: any) => r.HeatingCategory))].sort()
        }
        
        // Handle aggregation
        let responseData
        let finalAggregationType: 'none' | 'daily' | 'monthly' | 'municipality' = 'none'
        
        if (aggregationType === 'municipality') {
          responseData = aggregateByMunicipality(processedRecords)
          finalAggregationType = 'municipality'
        } else if (aggregationType === 'daily') {
          responseData = aggregateByDay(processedRecords)
          finalAggregationType = 'daily'
        } else if (aggregationType === 'monthly') {
          responseData = aggregateByMonth(processedRecords)
          finalAggregationType = 'monthly'
        } else {
          responseData = processedRecords
        }
        
        return {
          data: responseData,
          totalRecords: result.total || processedRecords.length,
          aggregationType: finalAggregationType,
          period: {
            start: start.split('T')[0],
            end: end.split('T')[0]
          },
          filters: {
            municipality: municipality || undefined,
            municipalityName: municipality ? MUNICIPALITY_NAMES[municipality] : undefined,
            housingCategory: housingCategory || undefined,
            heatingCategory: heatingCategory || undefined
          },
          availableCategories
        }
      }, 3, 1000)
      
      // 4. Cache successful response
      memoryCache.set(cacheKey, data)
      await setKvJsonWithFallback(cacheKey, latestKey, data, cacheTTL, FALLBACK_TTL)
      
      return NextResponse.json(data, {
        headers: {
          ...cacheHeaders({ sMaxage: 300, swr: 600 }),
          ...corsPublic(),
          'X-Cache': 'MISS'
        }
      })
      
    } catch (fetchError) {
      console.error('[PrivateConsumption] Fetch failed:', fetchError)
      
      // 5. Try fallback cache
      const fallbackData = await readKvJson(latestKey)
      if (fallbackData) {
        return NextResponse.json(fallbackData, {
          headers: {
            ...cacheHeaders({ sMaxage: 60, swr: 300 }),
            ...corsPublic(),
            'X-Cache': 'HIT-STALE',
            'X-Degraded': 'true'
          }
        })
      }
      
      // 6. Return safe empty response
      return NextResponse.json(
        {
          data: [],
          totalRecords: 0,
          aggregationType: 'none',
          period: { start: start.split('T')[0], end: end.split('T')[0] },
          filters: {},
          availableCategories: { housing: [], heating: [] },
          status: 'degraded',
          message: 'Consumption data temporarily unavailable'
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
    console.error('[PrivateConsumption] Unexpected error:', error)
    
    return NextResponse.json(
      {
        data: [],
        totalRecords: 0,
        aggregationType: 'none',
        period: { start: '', end: '' },
        filters: {},
        availableCategories: { housing: [], heating: [] },
        status: 'error',
        message: 'An unexpected error occurred'
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
 * Aggregate consumption data by municipality
 */
function aggregateByMunicipality(records: any[]) {
  const municipalityMap = new Map<string, any>()
  
  records.forEach(record => {
    const key = record.MunicipalityNo
    
    if (!municipalityMap.has(key)) {
      municipalityMap.set(key, {
        municipalityNo: record.MunicipalityNo,
        municipalityName: record.MunicipalityName || `Municipality ${record.MunicipalityNo}`,
        totalConsumption: 0,
        averageConsumption: 0,
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      })
    }
    
    const municipality = municipalityMap.get(key)!
    municipality.totalConsumption += record.ConsumptionkWh
    municipality.recordCount++
    
    // Housing breakdown
    municipality.housingBreakdown[record.HousingCategory] = 
      (municipality.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh
    
    // Heating breakdown
    municipality.heatingBreakdown[record.HeatingCategory] = 
      (municipality.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh
  })
  
  // Calculate averages
  municipalityMap.forEach(municipality => {
    municipality.averageConsumption = municipality.totalConsumption / municipality.recordCount
  })
  
  return Array.from(municipalityMap.values())
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
}

/**
 * Aggregate consumption data by day
 */
function aggregateByDay(records: any[]) {
  const dayMap = new Map<string, any>()
  
  records.forEach(record => {
    const day = record.HourDK.split('T')[0]
    
    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        totalConsumption: 0,
        averageConsumption: 0,
        municipalities: new Set<string>(),
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      })
    }
    
    const dayData = dayMap.get(day)!
    dayData.totalConsumption += record.ConsumptionkWh
    dayData.recordCount++
    dayData.municipalities.add(record.MunicipalityNo)
    
    // Housing breakdown
    dayData.housingBreakdown[record.HousingCategory] = 
      (dayData.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh
    
    // Heating breakdown
    dayData.heatingBreakdown[record.HeatingCategory] = 
      (dayData.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh
  })
  
  // Calculate averages and convert Set to count
  dayMap.forEach(dayData => {
    dayData.averageConsumption = dayData.totalConsumption / dayData.recordCount
    dayData.municipalityCount = dayData.municipalities.size
    delete dayData.municipalities
  })
  
  return Array.from(dayMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Aggregate consumption data by month
 */
function aggregateByMonth(records: any[]) {
  const monthMap = new Map<string, any>()
  
  records.forEach(record => {
    const month = record.HourDK.substring(0, 7) // YYYY-MM format
    
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        totalConsumption: 0,
        averageConsumption: 0,
        municipalities: new Set<string>(),
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      })
    }
    
    const monthData = monthMap.get(month)!
    monthData.totalConsumption += record.ConsumptionkWh
    monthData.recordCount++
    monthData.municipalities.add(record.MunicipalityNo)
    
    // Housing breakdown
    monthData.housingBreakdown[record.HousingCategory] = 
      (monthData.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh
    
    // Heating breakdown
    monthData.heatingBreakdown[record.HeatingCategory] = 
      (monthData.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh
  })
  
  // Calculate averages and convert Set to count
  monthMap.forEach(monthData => {
    monthData.averageConsumption = monthData.totalConsumption / monthData.recordCount
    monthData.municipalityCount = monthData.municipalities.size
    delete monthData.municipalities
  })
  
  return Array.from(monthMap.values())
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
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