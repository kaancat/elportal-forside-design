export const dynamic = 'force-dynamic';

/**
 * Vercel Serverless Function to fetch consumption data from EnergiDataService.
 * Returns consumption data aggregated by municipality for map visualization.
 *
 * Query Parameters:
 * @param {string} [consumerType] - Consumer type ('private', 'industry', 'all'). Defaults to 'all'.
 * @param {string} [aggregation] - Aggregation type ('hourly', 'daily', 'monthly'). Defaults to 'daily'.
 * @param {string} [view] - Time view ('24h', '7d', '30d', 'month'). Defaults to '24h'.
 * @param {string} [municipality] - Specific municipality code to filter by.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const consumerType = searchParams.get('consumerType') || 'all';
    let aggregation = searchParams.get('aggregation') || 'daily';
    
    // Handle 'latest' from Sanity as 'hourly'
    if (aggregation === 'latest') {
      aggregation = 'hourly';
    }
    
    const view = searchParams.get('view') || '24h';
    const municipality = searchParams.get('municipality');

    // Calculate date range based on view
    // Note: PrivIndustryConsumptionHour data has about 10-14 days delay
    const DATA_DELAY_DAYS = 14; // Increased to ensure we get data
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - DATA_DELAY_DAYS); // Account for data delay
    
    const startDate = new Date(endDate);
    
    switch(view) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '24h':
      default:
        startDate.setHours(startDate.getHours() - 24);
        break;
    }

    // Format dates for API
    const apiStart = startDate.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
    const apiEnd = endDate.toISOString().substring(0, 16);

    // Build filter for specific municipality if provided
    let filter = '';
    if (municipality) {
      filter = `&filter={"MunicipalityNo":["${municipality}"]}`;
    }

    // Include limit to ensure we get data and specify columns
    const apiUrl = `https://api.energidataservice.dk/dataset/PrivIndustryConsumptionHour?start=${apiStart}&end=${apiEnd}${filter}&sort=HourUTC ASC&limit=10000`;

    console.log('Fetching consumption data:', {
      url: apiUrl,
      startDate: apiStart,
      endDate: apiEnd,
      view,
      consumerType,
      aggregation,
      dataDelayDays: DATA_DELAY_DAYS
    });

    const externalResponse = await fetch(apiUrl);

    if (!externalResponse.ok) {
      if (externalResponse.status === 404 || externalResponse.status === 400) {
        return Response.json({ 
          data: [],
          metadata: { 
            consumerType, 
            aggregation, 
            view, 
            startDate: apiStart, 
            endDate: apiEnd,
            municipality 
          }
        }, { status: 200 });
      }
      return Response.json(
        { error: 'Failed to fetch consumption data from EnergiDataService.' },
        { status: externalResponse.status }
      );
    }

    const result = await externalResponse.json();
    let records = result.records || [];

    console.log(`Raw records: ${records.length}`);
    
    // If no records, return empty data with proper structure
    if (records.length === 0) {
      console.log('No records found for date range:', { start: apiStart, end: apiEnd });
      return Response.json({
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
          startDate: apiStart,
          endDate: apiEnd,
          municipality,
          dataPoints: 0,
          lastUpdated: new Date().toISOString(),
          message: 'No data available for the selected date range'
        }
      }, { status: 200 });
    }

    // Group by municipality and aggregate consumption
    const municipalityData: Record<string, any> = {};

    // Debug logging removed - data structure confirmed working

    records.forEach((record: any) => {
      const munCode = record.MunicipalityNo;
      const hour = record.HourUTC;
      
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
        };
      }

      // The actual field names from the API are ConsumptionMWh and ConsumerType_DE35
      // Check for both possible field names
      const consumptionMWh = parseFloat(record.ConsumptionMWh || record.ConsumptionkWh || 0) || 0;
      
      // The consumer type field is ConsumerType_DE35 with values like "KOD-516" for private, "KOD-431" for industry
      const consumerType = record.ConsumerType_DE35 || record.HousingCategory || '';
      const isIndustry = consumerType.includes('431') || consumerType === 'Erhverv';
      const privateConsumption = isIndustry ? 0 : consumptionMWh;
      const industryConsumption = isIndustry ? consumptionMWh : 0;
      const totalConsumption = consumptionMWh;

      municipalityData[munCode].totalPrivateConsumption += privateConsumption;
      municipalityData[munCode].totalIndustryConsumption += industryConsumption;
      municipalityData[munCode].totalConsumption += totalConsumption;
      municipalityData[munCode].dataPoints += 1;

      // Store hourly data for detailed analysis
      if (aggregation === 'hourly') {
        municipalityData[munCode].hourlyData.push({
          hour,
          privateConsumption,
          industryConsumption,
          totalConsumption
        });
      }
    });

    // Convert to array and calculate averages
    const municipalities = Object.values(municipalityData).map((mun: any) => {
      const dataPoints = mun.dataPoints;
      
      return {
        ...mun,
        avgPrivateConsumption: dataPoints > 0 ? mun.totalPrivateConsumption / dataPoints : 0,
        avgIndustryConsumption: dataPoints > 0 ? mun.totalIndustryConsumption / dataPoints : 0,
        avgTotalConsumption: dataPoints > 0 ? mun.totalConsumption / dataPoints : 0,
        privateShare: mun.totalConsumption > 0 ? (mun.totalPrivateConsumption / mun.totalConsumption) * 100 : 0,
        industryShare: mun.totalConsumption > 0 ? (mun.totalIndustryConsumption / mun.totalConsumption) * 100 : 0
      };
    });

    // Sort by consumption based on consumer type
    let sortedMunicipalities = municipalities;
    switch(consumerType) {
      case 'private':
        sortedMunicipalities = municipalities.sort((a, b) => b.totalPrivateConsumption - a.totalPrivateConsumption);
        break;
      case 'industry':
        sortedMunicipalities = municipalities.sort((a, b) => b.totalIndustryConsumption - a.totalIndustryConsumption);
        break;
      default:
        sortedMunicipalities = municipalities.sort((a, b) => b.totalConsumption - a.totalConsumption);
    }

    // Calculate summary statistics
    const totalConsumption = municipalities.reduce((sum, m) => sum + m.totalConsumption, 0);
    const totalPrivateConsumption = municipalities.reduce((sum, m) => sum + m.totalPrivateConsumption, 0);
    const totalIndustryConsumption = municipalities.reduce((sum, m) => sum + m.totalIndustryConsumption, 0);

    const statistics = {
      totalMunicipalities: municipalities.length,
      totalConsumption,
      totalPrivateConsumption,
      totalIndustryConsumption,
      averageConsumption: municipalities.length > 0 ? totalConsumption / municipalities.length : 0,
      privateShareTotal: totalConsumption > 0 ? (totalPrivateConsumption / totalConsumption) * 100 : 0,
      industryShareTotal: totalConsumption > 0 ? (totalIndustryConsumption / totalConsumption) * 100 : 0,
      topConsumers: sortedMunicipalities.slice(0, 5).map(m => ({
        municipalityName: m.municipalityName,
        consumption: m.totalConsumption
      }))
    };
    
    // Statistics calculated successfully

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
        dataPoints: municipalities.length,
        lastUpdated: new Date().toISOString()
      }
    };

    return Response.json(responseData, {
      status: 200,
      headers: { 
        'Cache-Control': 's-maxage=1800' // Cache for 30 minutes
      }
    });

  } catch (error: any) {
    console.error('An unexpected error occurred in the consumption map API route:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to get municipality name from code
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
    '480': 'Nordfyn',
    '482': 'Langeland',
    '492': 'Ærø',
    '510': 'Haderslev',
    '530': 'Billund',
    '540': 'Sønderborg',
    '550': 'Tønder',
    '580': 'Aabenraa',
    '561': 'Esbjerg',
    '563': 'Fanø',
    '573': 'Varde',
    '575': 'Vejen',
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
    '751': 'Aarhus',
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
  };

  return municipalityMap[code] || `Municipality ${code}`;
}