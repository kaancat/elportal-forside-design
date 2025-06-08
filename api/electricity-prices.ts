// File: /api/electricity-prices.ts
// Final version with a custom padding function to avoid TS config issues.

export const dynamic = 'force-dynamic'; // Ensures the function runs dynamically for every request

/**
 * Vercel Serverless Function to fetch electricity spot prices from EnergiDataService.
 * This function is timezone-aware and explicitly uses Danish time (Europe/Copenhagen)
 * to prevent errors around midnight UTC.
 *
 * Query Parameters:
 * @param {string} [region | area] - The price area ('DK1' or 'DK2'). Defaults to 'DK2'.
 * @param {string} [date] - The date for which to fetch electricity prices. Format: YYYY-MM-DD.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Date Logic ---
    const dateParam = searchParams.get('date'); // Expects YYYY-MM-DD
    
    // Vercel Edge functions can be tricky with timezones.
    // This creates a date object that correctly represents the "day" regardless of where the server is.
    const baseDate = dateParam ? new Date(dateParam + 'T00:00:00Z') : new Date();

    const startDate = baseDate.toISOString().split('T')[0];
    
    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);
    const endDate = tomorrow.toISOString().split('T')[0];

    // --- Fee & Region Logic ---
    const transportFeeKWh = 0.12;
    const systemFeeKWh = 0.06;
    const elafgiftKWh = 0.76;
    const vatRate = 1.25;
    const region = searchParams.get('region') || searchParams.get('area') || 'DK2';
    const area = region === 'DK1' ? 'DK1' : 'DK2';
    
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${startDate}&end=${endDate}&filter={"PriceArea":["${area}"]}&sort=HourUTC ASC`;

    const externalResponse = await fetch(apiUrl);

    if (!externalResponse.ok) {
        // If data for a future date isn't available, return an empty set instead of an error.
        if (externalResponse.status === 404) {
            return Response.json({ records: [] }, { status: 200 });
        }
        return Response.json({ error: 'Failed to fetch data from EnergiDataService.' }, { status: externalResponse.status });
    }

    const result = await externalResponse.json();
    
    const processedRecords = result.records.map((record: any) => {
      const spotPriceMWh = record.SpotPriceDKK ?? 0;
      const spotPriceKWh = spotPriceMWh / 1000;
      const basePriceKWh = spotPriceKWh + transportFeeKWh + systemFeeKWh + elafgiftKWh;
      const totalPriceKWh = basePriceKWh * vatRate;
      return { ...record, SpotPriceKWh: spotPriceKWh, TotalPriceKWh: totalPriceKWh };
    });

    const finalData = { ...result, records: processedRecords };
    
    return Response.json(finalData, { status: 200, headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' } });

  } catch (error: any) {
    // 8. Handle unexpected internal errors.
    console.error('An unexpected error occurred in the API route:', error);
    return Response.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}