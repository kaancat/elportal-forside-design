// File: /api/private-industry-consumption.ts
// Vercel Serverless API for PrivIndustryConsumptionHour dataset from EnergiDataService

export const dynamic = 'force-dynamic';

// Danish municipality mapping for better user experience
const MUNICIPALITY_NAMES: Record<string, string> = {
  // Major cities and municipalities
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
};

interface ConsumptionRecord {
  HourUTC: string;
  HourDK: string;
  MunicipalityNo: string;
  MunicipalityName?: string;
  HousingCategory: string;
  HeatingCategory: string;
  ConsumptionkWh: number;
}

interface AggregatedConsumption {
  municipalityNo: string;
  municipalityName: string;
  totalConsumption: number;
  averageConsumption: number;
  housingBreakdown: Record<string, number>;
  heatingBreakdown: Record<string, number>;
  recordCount: number;
}

interface ConsumptionResponse {
  data: ConsumptionRecord[] | AggregatedConsumption[];
  totalRecords: number;
  aggregationType: 'none' | 'daily' | 'monthly' | 'municipality';
  period: {
    start: string;
    end: string;
  };
  filters: {
    municipality?: string;
    municipalityName?: string;
    housingCategory?: string;
    heatingCategory?: string;
  };
  availableCategories: {
    housing: string[];
    heating: string[];
  };
}

/**
 * Vercel Serverless Function for Private Industry Consumption data
 * 
 * Query Parameters:
 * @param {string} [municipality] - Municipality number (e.g., "101" for Copenhagen)
 * @param {string} [start] - Start date (YYYY-MM-DD format)
 * @param {string} [end] - End date (YYYY-MM-DD format)
 * @param {string} [housing] - Housing category filter
 * @param {string} [heating] - Heating category filter
 * @param {string} [aggregate] - Aggregation type: 'daily', 'monthly', 'municipality'
 * @param {number} [limit] - Maximum number of records (default: 1000, max: 10000)
 * @param {number} [offset] - Pagination offset
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const municipality = searchParams.get('municipality');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const housingCategory = searchParams.get('housing');
    const heatingCategory = searchParams.get('heating');
    const aggregationType = searchParams.get('aggregate') as 'daily' | 'monthly' | 'municipality' | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 10000);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build date range - default to last 24 hours if not specified
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const start = startDate ? `${startDate}T00:00:00Z` : defaultStart.toISOString();
    const end = endDate ? `${endDate}T23:59:59Z` : now.toISOString();

    // Build API URL with filters
    const baseUrl = 'https://api.energidataservice.dk/dataset/PrivIndustryConsumptionHour';
    const params = new URLSearchParams({
      start: start.split('T')[0], // API expects YYYY-MM-DD format
      end: end.split('T')[0],
      sort: 'HourUTC ASC',
      limit: limit.toString(),
      offset: offset.toString()
    });

    // Build filter object for API
    const filters: Record<string, string[]> = {};
    if (municipality) {
      filters.MunicipalityNo = [municipality];
    }
    if (housingCategory) {
      filters.HousingCategory = [housingCategory];
    }
    if (heatingCategory) {
      filters.HeatingCategory = [heatingCategory];
    }

    if (Object.keys(filters).length > 0) {
      params.append('filter', JSON.stringify(filters));
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log(`Fetching data from: ${apiUrl}`);

    // Fetch data from EnergiDataService
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return Response.json({
          data: [],
          totalRecords: 0,
          aggregationType: 'none',
          period: { start, end },
          filters: {},
          availableCategories: { housing: [], heating: [] }
        } as ConsumptionResponse, { status: 200 });
      }
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return Response.json({ 
        error: `Failed to fetch data from EnergiDataService: ${response.status}` 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Process and enrich data
    const processedRecords: ConsumptionRecord[] = result.records.map((record: any) => ({
      HourUTC: record.HourUTC,
      HourDK: record.HourDK,
      MunicipalityNo: record.MunicipalityNo,
      MunicipalityName: MUNICIPALITY_NAMES[record.MunicipalityNo] || `Municipality ${record.MunicipalityNo}`,
      HousingCategory: record.HousingCategory,
      HeatingCategory: record.HeatingCategory,
      ConsumptionkWh: record.ConsumptionkWh || 0
    }));

    // Get available categories for frontend filtering
    const availableCategories = {
      housing: [...new Set(processedRecords.map(r => r.HousingCategory))].sort(),
      heating: [...new Set(processedRecords.map(r => r.HeatingCategory))].sort()
    };

    let responseData: ConsumptionRecord[] | AggregatedConsumption[];
    let finalAggregationType: 'none' | 'daily' | 'monthly' | 'municipality' = 'none';

    // Handle aggregation
    if (aggregationType === 'municipality') {
      responseData = aggregateByMunicipality(processedRecords);
      finalAggregationType = 'municipality';
    } else if (aggregationType === 'daily') {
      responseData = aggregateByDay(processedRecords);
      finalAggregationType = 'daily';
    } else if (aggregationType === 'monthly') {
      responseData = aggregateByMonth(processedRecords);
      finalAggregationType = 'monthly';
    } else {
      responseData = processedRecords;
    }

    const responseObject: ConsumptionResponse = {
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
    };

    // Set cache headers based on data freshness
    const cacheHeaders = getCacheHeaders(aggregationType, processedRecords.length);

    return Response.json(responseObject, {
      status: 200,
      headers: cacheHeaders
    });

  } catch (error: any) {
    console.error('Unexpected error in private-industry-consumption API:', error);
    return Response.json({ 
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Aggregate consumption data by municipality
 */
function aggregateByMunicipality(records: ConsumptionRecord[]): AggregatedConsumption[] {
  const municipalityMap = new Map<string, AggregatedConsumption>();

  records.forEach(record => {
    const key = record.MunicipalityNo;
    
    if (!municipalityMap.has(key)) {
      municipalityMap.set(key, {
        municipalityNo: record.MunicipalityNo,
        municipalityName: record.MunicipalityName || `Municipality ${record.MunicipalityNo}`,
        totalConsumption: 0,
        averageConsumption: 0,
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      });
    }

    const municipality = municipalityMap.get(key)!;
    municipality.totalConsumption += record.ConsumptionkWh;
    municipality.recordCount++;
    
    // Housing breakdown
    municipality.housingBreakdown[record.HousingCategory] = 
      (municipality.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh;
    
    // Heating breakdown
    municipality.heatingBreakdown[record.HeatingCategory] = 
      (municipality.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh;
  });

  // Calculate averages
  municipalityMap.forEach(municipality => {
    municipality.averageConsumption = municipality.totalConsumption / municipality.recordCount;
  });

  return Array.from(municipalityMap.values())
    .sort((a, b) => b.totalConsumption - a.totalConsumption);
}

/**
 * Aggregate consumption data by day
 */
function aggregateByDay(records: ConsumptionRecord[]): any[] {
  const dayMap = new Map<string, any>();

  records.forEach(record => {
    const day = record.HourDK.split('T')[0];
    
    if (!dayMap.has(day)) {
      dayMap.set(day, {
        date: day,
        totalConsumption: 0,
        averageConsumption: 0,
        municipalities: new Set<string>(),
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      });
    }

    const dayData = dayMap.get(day)!;
    dayData.totalConsumption += record.ConsumptionkWh;
    dayData.recordCount++;
    dayData.municipalities.add(record.MunicipalityNo);
    
    // Housing breakdown
    dayData.housingBreakdown[record.HousingCategory] = 
      (dayData.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh;
    
    // Heating breakdown
    dayData.heatingBreakdown[record.HeatingCategory] = 
      (dayData.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh;
  });

  // Calculate averages and convert Set to count
  dayMap.forEach(dayData => {
    dayData.averageConsumption = dayData.totalConsumption / dayData.recordCount;
    dayData.municipalityCount = dayData.municipalities.size;
    delete dayData.municipalities;
  });

  return Array.from(dayMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Aggregate consumption data by month
 */
function aggregateByMonth(records: ConsumptionRecord[]): any[] {
  const monthMap = new Map<string, any>();

  records.forEach(record => {
    const month = record.HourDK.substring(0, 7); // YYYY-MM format
    
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        totalConsumption: 0,
        averageConsumption: 0,
        municipalities: new Set<string>(),
        housingBreakdown: {},
        heatingBreakdown: {},
        recordCount: 0
      });
    }

    const monthData = monthMap.get(month)!;
    monthData.totalConsumption += record.ConsumptionkWh;
    monthData.recordCount++;
    monthData.municipalities.add(record.MunicipalityNo);
    
    // Housing breakdown
    monthData.housingBreakdown[record.HousingCategory] = 
      (monthData.housingBreakdown[record.HousingCategory] || 0) + record.ConsumptionkWh;
    
    // Heating breakdown
    monthData.heatingBreakdown[record.HeatingCategory] = 
      (monthData.heatingBreakdown[record.HeatingCategory] || 0) + record.ConsumptionkWh;
  });

  // Calculate averages and convert Set to count
  monthMap.forEach(monthData => {
    monthData.averageConsumption = monthData.totalConsumption / monthData.recordCount;
    monthData.municipalityCount = monthData.municipalities.size;
    delete monthData.municipalities;
  });

  return Array.from(monthMap.values())
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

/**
 * Determine optimal cache headers based on data type and freshness
 */
function getCacheHeaders(aggregationType: string | null, recordCount: number): Record<string, string> {
  // For real-time map updates, use shorter cache times
  if (aggregationType === 'municipality') {
    return { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' }; // 30 minutes
  }
  
  // For aggregated data, use longer cache times
  if (aggregationType === 'daily' || aggregationType === 'monthly') {
    return { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200' }; // 1 hour
  }
  
  // For raw data, use shorter cache times
  return { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800' }; // 15 minutes
}