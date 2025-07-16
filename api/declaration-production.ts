export const dynamic = 'force-dynamic';

/**
 * Vercel Serverless Function to fetch declaration production data from EnergiDataService.
 * Returns hourly production breakdown by energy source with CO2 emissions data.
 *
 * Query Parameters:
 * @param {string} [region] - The price area ('DK1', 'DK2', or 'Danmark' for both). Defaults to 'Danmark'.
 * @param {string} [start] - Start date for data. Format: YYYY-MM-DD. Defaults to 24 hours ago.
 * @param {string} [end] - End date for data. Format: YYYY-MM-DD. Defaults to now.
 * @param {string} [view] - Data view period ('24h', '7d', '30d'). Defaults to '24h'.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const region = searchParams.get('region') || 'Danmark';
    const view = searchParams.get('view') || '24h';
    
    // Calculate date range based on view
    const endDate = new Date();
    const startDate = new Date();
    
    switch(view) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '24h':
      default:
        startDate.setHours(startDate.getHours() - 24);
        break;
    }

    // Allow override with explicit dates
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    
    if (startParam) {
      startDate.setTime(new Date(startParam + 'T00:00:00Z').getTime());
    }
    if (endParam) {
      endDate.setTime(new Date(endParam + 'T23:59:59Z').getTime());
    }

    // Format dates for API
    const apiStart = startDate.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
    const apiEnd = endDate.toISOString().substring(0, 16);

    // Build filter based on region
    let filter = '';
    if (region === 'DK1') {
      filter = '&filter={"PriceArea":["DK1"]}';
    } else if (region === 'DK2') {
      filter = '&filter={"PriceArea":["DK2"]}';
    }
    // If 'Danmark', no filter (gets both DK1 and DK2)

    const apiUrl = `https://api.energidataservice.dk/dataset/DeclarationProduction?start=${apiStart}&end=${apiEnd}${filter}&sort=HourDK ASC`;
    
    console.log('DeclarationProduction API URL:', apiUrl);
    console.log('Date range:', { start: apiStart, end: apiEnd, view });

    const externalResponse = await fetch(apiUrl);

    if (!externalResponse.ok) {
      if (externalResponse.status === 404 || externalResponse.status === 400) {
        return Response.json({ 
          records: [], 
          aggregated: [],
          metadata: { region, view, startDate: apiStart, endDate: apiEnd }
        }, { status: 200 });
      }
      return Response.json(
        { error: 'Failed to fetch declaration production data from EnergiDataService.' },
        { status: externalResponse.status }
      );
    }

    const result = await externalResponse.json();
    
    console.log('Raw API response:', { 
      totalRecords: result.records?.length || 0,
      firstRecord: result.records?.[0],
      lastRecord: result.records?.[result.records?.length - 1]
    });

    // Process the data
    let records = result.records || [];
    
    // Check available FuelAllocationMethods
    const allocationMethods = new Set(records.map((r: any) => r.FuelAllocationMethod));
    console.log('Available FuelAllocationMethods:', Array.from(allocationMethods));
    
    // Filter for FuelAllocationMethod - be more flexible
    const unfilteredCount = records.length;
    records = records.filter((r: any) => {
      // Accept common allocation methods
      return r.FuelAllocationMethod === '125%' || 
             r.FuelAllocationMethod === '125pct' ||
             r.FuelAllocationMethod === 'All' ||
             r.FuelAllocationMethod === 'Actual' ||
             !r.FuelAllocationMethod; // Some records might not have this field
    });
    console.log(`Filtered records: ${unfilteredCount} -> ${records.length}`);

    // Group by hour and aggregate data
    const hourlyData: Record<string, any> = {};

    records.forEach((record: any) => {
      const hourKey = record.HourDK;
      
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
        };
      }

      const hour = hourlyData[hourKey];
      const production = record.Production_MWh || 0;
      const co2 = record.CO2PerkWh || 0;

      // Aggregate production by type
      if (!hour.productionByType[record.ProductionType]) {
        hour.productionByType[record.ProductionType] = {
          production: 0,
          co2PerKWh: 0,
          share: 0
        };
      }

      hour.productionByType[record.ProductionType].production += production;
      hour.productionByType[record.ProductionType].co2PerKWh = co2;
      hour.totalProduction += production;
      hour.totalCO2 += production * co2;

      // Categorize as renewable or fossil
      const renewableTypes = ['WindOffshore', 'WindOnshore', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood'];
      const fossilTypes = ['FossilGas', 'Coal', 'Fossil Oil'];
      
      if (renewableTypes.includes(record.ProductionType)) {
        hour.renewableProduction += production;
      } else if (fossilTypes.includes(record.ProductionType)) {
        hour.fossilProduction += production;
      }
    });

    // Calculate shares and average CO2 intensity
    const aggregatedData = Object.values(hourlyData).map((hour: any) => {
      // Calculate shares for each production type
      Object.keys(hour.productionByType).forEach(type => {
        hour.productionByType[type].share = hour.totalProduction > 0 
          ? (hour.productionByType[type].production / hour.totalProduction) * 100 
          : 0;
      });

      // Calculate average CO2 intensity
      hour.averageCO2 = hour.totalProduction > 0 
        ? hour.totalCO2 / hour.totalProduction 
        : 0;

      // Calculate renewable share
      hour.renewableShare = hour.totalProduction > 0 
        ? (hour.renewableProduction / hour.totalProduction) * 100 
        : 0;

      return hour;
    });

    // Sort by time
    aggregatedData.sort((a: any, b: any) => 
      new Date(a.HourDK).getTime() - new Date(b.HourDK).getTime()
    );

    // For longer time periods, we might want to aggregate to daily averages
    let finalData = aggregatedData;
    if (view === '30d' && aggregatedData.length > 240) { // More than 10 days of hourly data
      // Aggregate to daily averages
      const dailyData: Record<string, any> = {};
      
      aggregatedData.forEach((hour: any) => {
        const date = hour.HourDK.split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            hours: [],
            totalProduction: 0,
            totalCO2: 0,
            productionByType: {}
          };
        }
        
        dailyData[date].hours.push(hour);
        dailyData[date].totalProduction += hour.totalProduction;
        dailyData[date].totalCO2 += hour.totalCO2;
        
        // Aggregate production by type
        Object.entries(hour.productionByType).forEach(([type, data]: [string, any]) => {
          if (!dailyData[date].productionByType[type]) {
            dailyData[date].productionByType[type] = {
              production: 0,
              co2PerKWh: data.co2PerKWh
            };
          }
          dailyData[date].productionByType[type].production += data.production;
        });
      });
      
      // Calculate daily averages
      finalData = Object.values(dailyData).map((day: any) => {
        const avgData: any = {
          HourDK: day.date + 'T12:00:00', // Noon as representative time
          PriceArea: region,
          totalProduction: day.totalProduction / day.hours.length,
          averageCO2: day.totalCO2 / day.totalProduction,
          productionByType: {},
          renewableProduction: 0,
          fossilProduction: 0
        };
        
        // Calculate average production and shares
        Object.entries(day.productionByType).forEach(([type, data]: [string, any]) => {
          const avgProduction = data.production / day.hours.length;
          avgData.productionByType[type] = {
            production: avgProduction,
            co2PerKWh: data.co2PerKWh,
            share: (avgProduction / avgData.totalProduction) * 100
          };
          
          const renewableTypes = ['WindOffshore', 'WindOnshore', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood'];
          if (renewableTypes.includes(type)) {
            avgData.renewableProduction += avgProduction;
          }
        });
        
        avgData.renewableShare = (avgData.renewableProduction / avgData.totalProduction) * 100;
        
        return avgData;
      });
    }

    const responseData = { 
      records: finalData,
      metadata: {
        region,
        view,
        startDate: apiStart,
        endDate: apiEnd,
        dataPoints: finalData.length,
        aggregation: view === '30d' && aggregatedData.length > 240 ? 'daily' : 'hourly'
      }
    };

    return Response.json(responseData, {
      status: 200,
      headers: { 'Cache-Control': 's-maxage=300' } // Cache for 5 minutes
    });

  } catch (error: any) {
    console.error('An unexpected error occurred in the declaration production API route:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}