export const dynamic = 'force-dynamic';

/**
 * Vercel Serverless Function to fetch declaration gridmix data from EnergiDataService.
 * Returns hourly grid composition breakdown by energy source with CO2 emissions data.
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
    // Note: DeclarationGridmix data has a 2-3 day delay based on observations
    const endDate = new Date();
    
    // For different views, we need different strategies due to data availability
    const startDate = new Date();
    
    switch(view) {
      case '7d':
        // For 7 days, go back 10 days to ensure we get some data
        startDate.setDate(startDate.getDate() - 10);
        endDate.setDate(endDate.getDate() - 2); // Data usually 2 days behind
        break;
      case '30d':
        // For 30 days, go back 35 days
        startDate.setDate(startDate.getDate() - 35);
        endDate.setDate(endDate.getDate() - 2);
        break;
      case '24h':
      default:
        // For 24 hours, get the most recent complete day
        startDate.setDate(startDate.getDate() - 3);
        endDate.setDate(endDate.getDate() - 2);
        break;
    }
    
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day

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

    const apiUrl = `https://api.energidataservice.dk/dataset/DeclarationGridmix?start=${apiStart}&end=${apiEnd}${filter}&sort=HourDK ASC`;

    console.log(`[DeclarationGridmix API] Fetching data from: ${apiUrl}`);
    console.log(`[DeclarationGridmix API] Date range: ${apiStart} to ${apiEnd}`);

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
        { error: 'Failed to fetch declaration gridmix data from EnergiDataService.' },
        { status: externalResponse.status }
      );
    }

    const result = await externalResponse.json();

    // Process the data
    let records = result.records || [];
    
    console.log(`[DeclarationGridmix API] Received ${records.length} records for view=${view}`);
    if (records.length === 0) {
      console.log(`[DeclarationGridmix API] No data available for date range: ${apiStart} to ${apiEnd}`);
    }
    
    // Filter for latest version (prefer Final over Preliminary)
    const versionPriority = records.reduce((acc: any, record: any) => {
      const key = `${record.HourDK}_${record.ReportGrp}_${record.PriceArea}`;
      if (!acc[key] || record.Version === 'Final') {
        acc[key] = record;
      }
      return acc;
    }, {});
    
    records = Object.values(versionPriority);

    // Group by hour and aggregate data
    const hourlyData: Record<string, any> = {};

    records.forEach((record: any) => {
      const hourKey = record.HourDK;
      
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
        };
      }

      const hour = hourlyData[hourKey];
      const shareMWh = record.ShareMWh || 0;
      const co2 = record.CO2Emission || 0;

      // Aggregate mix by type
      if (!hour.mixByType[record.ReportGrp]) {
        hour.mixByType[record.ReportGrp] = {
          shareMWh: 0,
          co2Emission: 0,
          percentage: 0
        };
      }

      hour.mixByType[record.ReportGrp].shareMWh += shareMWh;
      hour.mixByType[record.ReportGrp].co2Emission += co2;
      hour.totalShare += shareMWh;
      hour.totalCO2 += co2;

      // Categorize energy types
      const renewableTypes = ['Wind', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood', 'WasteIncineration'];
      const fossilTypes = ['FossilGas', 'Coal', 'Oil'];
      const importTypes = ['Import'];
      
      if (renewableTypes.some(type => record.ReportGrp.includes(type))) {
        hour.renewableShare += shareMWh;
      } else if (fossilTypes.some(type => record.ReportGrp.includes(type))) {
        hour.fossilShare += shareMWh;
      } else if (importTypes.some(type => record.ReportGrp.includes(type))) {
        hour.importShare += shareMWh;
      }
    });

    // Calculate percentages and average CO2 intensity
    const aggregatedData = Object.values(hourlyData).map((hour: any) => {
      // Calculate percentages for each mix type
      Object.keys(hour.mixByType).forEach(type => {
        hour.mixByType[type].percentage = hour.totalShare > 0 
          ? (hour.mixByType[type].shareMWh / hour.totalShare) * 100 
          : 0;
      });

      // Calculate average CO2 intensity
      hour.averageCO2 = hour.totalShare > 0 
        ? hour.totalCO2 / hour.totalShare 
        : 0;

      // Calculate category percentages
      hour.renewablePercentage = hour.totalShare > 0 
        ? (hour.renewableShare / hour.totalShare) * 100 
        : 0;
      
      hour.fossilPercentage = hour.totalShare > 0 
        ? (hour.fossilShare / hour.totalShare) * 100 
        : 0;
        
      hour.importPercentage = hour.totalShare > 0 
        ? (hour.importShare / hour.totalShare) * 100 
        : 0;

      return hour;
    });

    // Sort by time
    aggregatedData.sort((a: any, b: any) => 
      new Date(a.HourDK).getTime() - new Date(b.HourDK).getTime()
    );

    // Filter data to match the requested view period
    const now = new Date();
    const viewStartDate = new Date();
    
    switch(view) {
      case '7d':
        viewStartDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        viewStartDate.setDate(now.getDate() - 30);
        break;
      case '24h':
      default:
        viewStartDate.setDate(now.getDate() - 1);
        break;
    }
    
    // Filter aggregated data to only include the requested period
    const filteredData = aggregatedData.filter((hour: any) => {
      const hourDate = new Date(hour.HourDK);
      return hourDate >= viewStartDate;
    });

    // For longer time periods, we might want to aggregate to daily averages
    let finalData = filteredData;
    if (view === '30d' && filteredData.length > 168) { // More than 7 days of hourly data
      // Aggregate to daily averages
      const dailyData: Record<string, any> = {};
      
      filteredData.forEach((hour: any) => {
        const date = hour.HourDK.split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            hours: [],
            totalShare: 0,
            totalCO2: 0,
            mixByType: {}
          };
        }
        
        dailyData[date].hours.push(hour);
        dailyData[date].totalShare += hour.totalShare;
        dailyData[date].totalCO2 += hour.totalCO2;
        
        // Aggregate mix by type
        Object.entries(hour.mixByType).forEach(([type, data]: [string, any]) => {
          if (!dailyData[date].mixByType[type]) {
            dailyData[date].mixByType[type] = {
              shareMWh: 0,
              co2Emission: data.co2Emission / hour.totalShare || 0
            };
          }
          dailyData[date].mixByType[type].shareMWh += data.shareMWh;
        });
      });
      
      // Calculate daily averages
      finalData = Object.values(dailyData).map((day: any) => {
        const avgData: any = {
          HourDK: day.date + 'T12:00:00', // Noon as representative time
          PriceArea: region,
          totalShare: day.totalShare / day.hours.length,
          averageCO2: day.totalCO2 / day.totalShare,
          mixByType: {},
          renewableShare: 0,
          fossilShare: 0,
          importShare: 0
        };
        
        // Calculate average mix and percentages
        Object.entries(day.mixByType).forEach(([type, data]: [string, any]) => {
          const avgShareMWh = data.shareMWh / day.hours.length;
          avgData.mixByType[type] = {
            shareMWh: avgShareMWh,
            co2Emission: data.co2Emission,
            percentage: (avgShareMWh / avgData.totalShare) * 100
          };
          
          const renewableTypes = ['Wind', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood', 'WasteIncineration'];
          const fossilTypes = ['FossilGas', 'Coal', 'Oil'];
          const importTypes = ['Import'];
          
          if (renewableTypes.some(renewableType => type.includes(renewableType))) {
            avgData.renewableShare += avgShareMWh;
          } else if (fossilTypes.some(fossilType => type.includes(fossilType))) {
            avgData.fossilShare += avgShareMWh;
          } else if (importTypes.some(importType => type.includes(importType))) {
            avgData.importShare += avgShareMWh;
          }
        });
        
        avgData.renewablePercentage = (avgData.renewableShare / avgData.totalShare) * 100;
        avgData.fossilPercentage = (avgData.fossilShare / avgData.totalShare) * 100;
        avgData.importPercentage = (avgData.importShare / avgData.totalShare) * 100;
        
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
        aggregation: view === '30d' && filteredData.length > 168 ? 'daily' : 'hourly'
      }
    };

    return Response.json(responseData, {
      status: 200,
      headers: { 'Cache-Control': 's-maxage=3600' } // Cache for 1 hour
    });

  } catch (error: any) {
    console.error('An unexpected error occurred in the declaration gridmix API route:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}