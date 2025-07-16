export const dynamic = 'force-dynamic';

/**
 * Vercel Serverless Function to fetch CO2 emissions data from EnergiDataService.
 * Returns CO2 intensity of electricity consumption in g/kWh.
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
    const startDate = baseDate.toISOString().split('T')[0] + 'T00:00:00';
    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);
    const endDate = tomorrow.toISOString().split('T')[0] + 'T00:00:00';

    // Region logic
    const region = searchParams.get('region') || 'Danmark';
    const aggregation = searchParams.get('aggregation') || 'hourly';

    // Build filter based on region
    let filter = '';
    if (region === 'DK1') {
      filter = '&filter={"PriceArea":["DK1"]}';
    } else if (region === 'DK2') {
      filter = '&filter={"PriceArea":["DK2"]}';
    }
    // If 'Danmark', no filter (gets both DK1 and DK2)

    const apiUrl = `https://api.energidataservice.dk/dataset/CO2Emis?start=${startDate}&end=${endDate}${filter}&sort=Minutes5UTC ASC`;

    const externalResponse = await fetch(apiUrl);

    if (!externalResponse.ok) {
      if (externalResponse.status === 404 || externalResponse.status === 400) {
        return Response.json({ records: [] }, { status: 200 });
      }
      return Response.json(
        { error: 'Failed to fetch CO2 emissions data from EnergiDataService.' },
        { status: externalResponse.status }
      );
    }

    const result = await externalResponse.json();

    // Process the data
    let processedRecords = result.records || [];

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
      ...result, 
      records: processedRecords,
      metadata: {
        region,
        date: baseDate.toISOString().split('T')[0],
        aggregation
      }
    };

    return Response.json(finalData, {
      status: 200,
      headers: { 'Cache-Control': 's-maxage=300' } // Cache for 5 minutes
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