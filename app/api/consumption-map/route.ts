/**
 * Next.js App Router API Route for consumption map data
 * Migrated from Vercel Functions format to Next.js route handlers
 * 
 * Features preserved:
 * - KV caching with 1-hour TTL
 * - In-memory cache fallback
 * - Request deduplication
 * - Retry logic with exponential backoff
 * - Rate limit handling (40 req/10s)
 * - Municipality aggregation and statistics
 * - Consumer type filtering (private/industry)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queuedFetch,
  readKvJson,
  setKvJson,
  setKvJsonWithFallback,
  cacheHeaders,
  retryWithBackoff,
  getCacheStatus,
  createLRUCache
} from '@/server/api-helpers'
import { consumptionMapSchema, safeValidateParams } from '@/server/api-validators'

// Configure runtime and max duration
export const runtime = 'nodejs' // Required for KV access
export const maxDuration = 10 // Match vercel.json configuration
export const dynamic = 'force-dynamic' // Real-time consumption data

// In-memory cache for consumption map data
// WHAT: Cache consumption data to reduce API calls to EnergiDataService
// WHY: 40 req/10s rate limit shared across all users and endpoints
// Using LRU cache to prevent memory leaks with automatic pruning
const consumptionMapCache = createLRUCache<any>(60 * 60 * 1000, 50) // 1 hour TTL, max 50 entries

/**
 * GET /api/consumption-map
 * 
 * Fetch consumption data from EnergiDataService
 * Returns consumption data aggregated by municipality for map visualization
 * 
 * Query Parameters:
 * @param consumerType - Consumer type ('private', 'industry', 'all'). Defaults to 'all'
 * @param aggregation - Aggregation type ('hourly', 'daily', 'monthly'). Defaults to 'daily'
 * @param view - Time view ('24h', '7d', '30d', 'month'). Defaults to '24h'
 * @param municipality - Specific municipality code to filter by
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Validate parameters with zod schema
    const paramsObj = Object.fromEntries(searchParams.entries())
    const validation = safeValidateParams(consumptionMapSchema, paramsObj)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    // Use validated parameters
    let { consumerType, aggregation, view, municipality } = validation.data
    
    // Handle 'latest' from Sanity as 'hourly'
    if (aggregation === 'latest') {
      aggregation = 'hourly'
    }

    // Calculate date range based on view
    // Note: PrivIndustryConsumptionHour data has about 21-30 days delay
    const DATA_DELAY_DAYS = 30 // Increased to ensure we get data due to significant API delay
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - DATA_DELAY_DAYS) // Account for data delay
    
    const startDate = new Date(endDate)
    
    switch(view) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '24h':
      default:
        startDate.setHours(startDate.getHours() - 24)
        break
    }

    // Format dates for API
    const apiStart = startDate.toISOString().substring(0, 16) // YYYY-MM-DDTHH:mm
    const apiEnd = endDate.toISOString().substring(0, 16)

    // Check KV cache first (distributed across instances)
    const cacheKey = `consumption-map:${consumerType}:${aggregation}:${view}:${municipality || 'all'}:${apiStart}:${apiEnd}`
    
    const kvCached = await readKvJson(cacheKey)
    if (kvCached) {
      console.log(`[ConsumptionMap] Returning KV cached data for ${cacheKey}`)
      return NextResponse.json(kvCached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 3600, swr: 7200 }),
          'X-Cache': 'HIT-KV'
        }
      })
    }
    
    // Check in-memory cache as fallback
    const memCacheKey = `${consumerType}_${aggregation}_${view}_${municipality || 'all'}_${apiStart}_${apiEnd}`
    const cached = consumptionMapCache.get(memCacheKey)
    if (cached) {
      console.log(`[ConsumptionMap] Returning in-memory cached data for ${memCacheKey}`)
      return NextResponse.json(cached, { 
        headers: {
          ...cacheHeaders({ sMaxage: 3600, swr: 7200 }),
          'X-Cache': 'HIT-MEMORY'
        }
      })
    }

    // Build filter for specific municipality if provided
    let filter = ''
    if (municipality) {
      filter = `&filter={"MunicipalityNo":["${municipality}"]}`
    }

    // Include limit to ensure we get data and specify columns
    const apiUrl = `https://api.energidataservice.dk/dataset/PrivIndustryConsumptionHour?start=${apiStart}&end=${apiEnd}${filter}&sort=HourUTC ASC&limit=10000`

    // Use queued fetch to prevent duplicate requests
    const fetchResult = await queuedFetch(memCacheKey, async () => {
      console.log(`[ConsumptionMap] Fetching data from EnergiDataService for ${cacheKey}`)
      
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
            console.warn(`[ConsumptionMap] EnergiDataService returned ${externalResponse.status}`)
            throw new Error(`API returned ${externalResponse.status}`)
          }
          
          throw new Error(`Failed to fetch consumption data: ${externalResponse.status}`)
        }

        return await externalResponse.json()
      }, 3, 1000) // 3 attempts, 1s initial delay
    })

    let records = fetchResult.records || []

    console.log(`[ConsumptionMap] Raw records: ${records.length}`)
    
    // If no records, return empty data with proper structure (but still cache it)
    if (records.length === 0) {
      console.log('[ConsumptionMap] No records found for date range:', { start: apiStart, end: apiEnd })
      const emptyResponse = createEmptyResponse(consumerType, aggregation, view, apiStart, apiEnd, municipality || null)
      
      // Cache empty response with shorter TTL
      consumptionMapCache.set(memCacheKey, emptyResponse)
      const fallbackKey = `consumption-map:${consumerType}`
      await setKvJsonWithFallback(cacheKey, fallbackKey, emptyResponse, 900, 1800) // 15 min specific, 30 min fallback
      
      return NextResponse.json(emptyResponse, { 
        headers: {
          ...cacheHeaders({ sMaxage: 900 }),
          'X-Cache': 'MISS'
        }
      })
    }

    // Process and aggregate data
    const municipalityData = aggregateMunicipalityData(records, aggregation)
    const sortedMunicipalities = sortMunicipalities(municipalityData, consumerType)
    const statistics = calculateStatistics(sortedMunicipalities)
    
    const responseData = {
      data: sortedMunicipalities,
      statistics,
      metadata: {
        consumerType,
        aggregation,
        view,
        startDate: apiStart,
        endDate: apiEnd,
        municipality,
        dataPoints: sortedMunicipalities.length,
        lastUpdated: new Date().toISOString()
      }
    }

    // Cache the successful response in both memory and KV
    consumptionMapCache.set(memCacheKey, responseData)
    const fallbackKey = `consumption-map:${consumerType}`
    await setKvJsonWithFallback(cacheKey, fallbackKey, responseData, 3600, 7200) // 1 hour specific, 2 hour fallback

    return NextResponse.json(responseData, {
      headers: { 
        ...cacheHeaders({ sMaxage: 3600, swr: 7200 }),
        'X-Cache': 'MISS'
      }
    })

  } catch (error: any) {
    console.error('[ConsumptionMap] Unexpected error:', error)
    
    // Try to return cached data on error
    const consumerType = request.nextUrl.searchParams.get('consumerType') || 'all'
    const fallbackKey = `consumption-map:${consumerType}` // This now exists thanks to setKvJsonWithFallback
    const fallback = await readKvJson(fallbackKey)
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          ...cacheHeaders({ sMaxage: 60 }),
          'X-Cache': 'HIT-STALE'
        }
      })
    }
    
    // Return safe empty response instead of 500 to prevent UI failures
    console.log('[ConsumptionMap] No fallback available, returning safe empty response')
    const aggregation = request.nextUrl.searchParams.get('aggregation') || 'hourly'
    const view = request.nextUrl.searchParams.get('view') || '24h'
    const municipality = request.nextUrl.searchParams.get('municipality')
    
    // Calculate approximate date range for metadata
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 14) // Account for typical data delay
    const startDate = new Date(endDate)
    startDate.setHours(startDate.getHours() - 24) // Default 24h view
    
    const emptyResponse = createEmptyResponse(
      consumerType,
      aggregation === 'latest' ? 'hourly' : aggregation,
      view,
      startDate.toISOString().substring(0, 16),
      endDate.toISOString().substring(0, 16),
      municipality
    )
    
    return NextResponse.json(emptyResponse, {
      headers: {
        ...cacheHeaders({ sMaxage: 60, swr: 300 }), // Short cache, allow retries
        'X-Cache': 'MISS-FALLBACK'
      }
    })
  }
}

/**
 * Create empty response structure
 */
function createEmptyResponse(
  consumerType: string,
  aggregation: string,
  view: string,
  startDate: string,
  endDate: string,
  municipality: string | null
) {
  return {
    data: [],
    statistics: {
      totalMunicipalities: 0,
      totalConsumption: 0,
      totalPrivateConsumption: 0,
      totalIndustryConsumption: 0,
      averageConsumption: 0,
      privateShareTotal: 0,
      industryShareTotal: 0,
      topConsumers: []
    },
    metadata: {
      consumerType,
      aggregation,
      view,
      startDate,
      endDate,
      municipality,
      dataPoints: 0,
      lastUpdated: new Date().toISOString(),
      message: 'No data available for the selected date range'
    }
  }
}

/**
 * Aggregate consumption data by municipality
 */
function aggregateMunicipalityData(records: any[], aggregation: string) {
  const municipalityData: Record<string, any> = {}

  records.forEach((record: any) => {
    const munCode = record.MunicipalityNo
    const hour = record.HourUTC
    
    if (!municipalityData[munCode]) {
      municipalityData[munCode] = {
        municipalityCode: munCode,
        municipalityName: getMunicipalityName(munCode),
        priceArea: record.PriceArea,
        totalPrivateConsumption: 0,
        totalIndustryConsumption: 0,
        totalConsumption: 0,
        hourlyData: [],
        dataPoints: 0
      }
    }

    // The actual field names from the API are ConsumptionMWh and ConsumerType_DE35
    const consumptionMWh = parseFloat(record.ConsumptionMWh || record.ConsumptionkWh || 0) || 0
    
    // The consumer type field is ConsumerType_DE35 with values like "KOD-516" for private, "KOD-431" for industry
    const consumerType = record.ConsumerType_DE35 || record.HousingCategory || ''
    const isIndustry = consumerType.includes('431') || consumerType === 'Erhverv'
    const privateConsumption = isIndustry ? 0 : consumptionMWh
    const industryConsumption = isIndustry ? consumptionMWh : 0
    const totalConsumption = consumptionMWh

    municipalityData[munCode].totalPrivateConsumption += privateConsumption
    municipalityData[munCode].totalIndustryConsumption += industryConsumption
    municipalityData[munCode].totalConsumption += totalConsumption
    municipalityData[munCode].dataPoints += 1

    // Store hourly data for detailed analysis
    if (aggregation === 'hourly') {
      municipalityData[munCode].hourlyData.push({
        hour,
        privateConsumption,
        industryConsumption,
        totalConsumption
      })
    }
  })

  // Convert to array and calculate averages
  return Object.values(municipalityData).map((mun: any) => {
    const dataPoints = mun.dataPoints
    
    return {
      ...mun,
      avgPrivateConsumption: dataPoints > 0 ? mun.totalPrivateConsumption / dataPoints : 0,
      avgIndustryConsumption: dataPoints > 0 ? mun.totalIndustryConsumption / dataPoints : 0,
      avgTotalConsumption: dataPoints > 0 ? mun.totalConsumption / dataPoints : 0,
      privateShare: mun.totalConsumption > 0 ? (mun.totalPrivateConsumption / mun.totalConsumption) * 100 : 0,
      industryShare: mun.totalConsumption > 0 ? (mun.totalIndustryConsumption / mun.totalConsumption) * 100 : 0
    }
  })
}

/**
 * Sort municipalities based on consumer type
 */
function sortMunicipalities(municipalities: any[], consumerType: string) {
  switch(consumerType) {
    case 'private':
      return municipalities.sort((a, b) => b.totalPrivateConsumption - a.totalPrivateConsumption)
    case 'industry':
      return municipalities.sort((a, b) => b.totalIndustryConsumption - a.totalIndustryConsumption)
    default:
      return municipalities.sort((a, b) => b.totalConsumption - a.totalConsumption)
  }
}

/**
 * Calculate summary statistics
 */
function calculateStatistics(municipalities: any[]) {
  const totalConsumption = municipalities.reduce((sum, m) => sum + m.totalConsumption, 0)
  const totalPrivateConsumption = municipalities.reduce((sum, m) => sum + m.totalPrivateConsumption, 0)
  const totalIndustryConsumption = municipalities.reduce((sum, m) => sum + m.totalIndustryConsumption, 0)

  return {
    totalMunicipalities: municipalities.length,
    totalConsumption,
    totalPrivateConsumption,
    totalIndustryConsumption,
    averageConsumption: municipalities.length > 0 ? totalConsumption / municipalities.length : 0,
    privateShareTotal: totalConsumption > 0 ? (totalPrivateConsumption / totalConsumption) * 100 : 0,
    industryShareTotal: totalConsumption > 0 ? (totalIndustryConsumption / totalConsumption) * 100 : 0,
    topConsumers: municipalities.slice(0, 5).map(m => ({
      municipalityName: m.municipalityName,
      consumption: m.totalConsumption
    }))
  }
}

/**
 * Helper function to get municipality name from code
 */
function getMunicipalityName(code: string): string {
  const municipalityMap: Record<string, string> = {
    '101': 'København',
    '147': 'Frederiksberg',
    '151': 'Ballerup',
    '153': 'Brøndby',
    '155': 'Dragør',
    '157': 'Gentofte',
    '159': 'Gladsaxe',
    '161': 'Glostrup',
    '163': 'Herlev',
    '165': 'Albertslund',
    '167': 'Hvidovre',
    '169': 'Høje-Taastrup',
    '173': 'Lyngby-Taarbæk',
    '175': 'Rødovre',
    '183': 'Ishøj',
    '185': 'Tårnby',
    '187': 'Vallensbæk',
    '190': 'Furesø',
    '201': 'Allerød',
    '210': 'Fredensborg',
    '217': 'Helsingør',
    '219': 'Hillerød',
    '223': 'Hørsholm',
    '230': 'Rudersdal',
    '240': 'Egedal',
    '250': 'Frederikssund',
    '253': 'Greve',
    '259': 'Køge',
    '260': 'Halsnæs',
    '265': 'Roskilde',
    '269': 'Solrød',
    '270': 'Gribskov',
    '306': 'Odsherred',
    '316': 'Holbæk',
    '320': 'Faxe',
    '326': 'Kalundborg',
    '329': 'Ringsted',
    '330': 'Sorø',
    '336': 'Stevns',
    '340': 'Slagelse',
    '350': 'Lejre',
    '360': 'Lolland',
    '370': 'Næstved',
    '376': 'Guldborgsund',
    '390': 'Vordingborg',
    '400': 'Bornholm',
    '410': 'Middelfart',
    '420': 'Assens',
    '430': 'Faaborg-Midtfyn',
    '440': 'Kerteminde',
    '450': 'Nyborg',
    '461': 'Odense',
    '479': 'Svendborg',
    '480': 'Nordfyns',
    '482': 'Langeland',
    '492': 'Ærø',
    '510': 'Haderslev',
    '530': 'Billund',
    '540': 'Sønderborg',
    '550': 'Tønder',
    '561': 'Esbjerg',
    '563': 'Fanø',
    '573': 'Varde',
    '575': 'Vejen',
    '580': 'Aabenraa',
    '607': 'Fredericia',
    '615': 'Horsens',
    '621': 'Kolding',
    '630': 'Vejle',
    '657': 'Herning',
    '661': 'Holstebro',
    '665': 'Lemvig',
    '671': 'Struer',
    '706': 'Syddjurs',
    '707': 'Norddjurs',
    '710': 'Favrskov',
    '727': 'Odder',
    '730': 'Randers',
    '740': 'Silkeborg',
    '741': 'Samsø',
    '746': 'Skanderborg',
    '751': 'Århus',
    '756': 'Ikast-Brande',
    '760': 'Ringkøbing-Skjern',
    '766': 'Hedensted',
    '773': 'Morsø',
    '779': 'Skive',
    '787': 'Thisted',
    '791': 'Viborg',
    '810': 'Brønderslev',
    '813': 'Frederikshavn',
    '820': 'Vesthimmerlands',
    '825': 'Læsø',
    '840': 'Rebild',
    '846': 'Mariagerfjord',
    '849': 'Jammerbugt',
    '851': 'Aalborg',
    '860': 'Hjørring'
  }

  return municipalityMap[code] || `Kommune ${code}`
}