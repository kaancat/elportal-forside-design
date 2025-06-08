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
 */
export async function GET(request: Request) {
  try {
    // --- Constants for calculation (in DKK per kWh) ---
    const transportFeeKWh = 0.12; // Example transport fee
    const systemFeeKWh = 0.06;  // Example system operator fee
    const elafgiftKWh = 0.76;     // Example state electricity tax
    const vatRate = 1.25;         // 25% VAT (moms)

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || searchParams.get('area') || 'DK2';
    const area = region === 'DK1' ? 'DK1' : 'DK2';

    // 2. Create a formatter for the 'YYYY-MM-DD' format in Danish timezone.
    // 'en-CA' locale is a reliable way to get this format.
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Copenhagen',
    });

    // 3. Calculate start and end dates correctly in the Danish timezone.
    const today = new Date();
    const startDate = dateFormatter.format(today);

    // To get tomorrow, create a new date and add one day.
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const endDate = dateFormatter.format(tomorrow);
    
    // 4. Construct the final, robust API URL.
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${startDate}&end=${endDate}&filter={"PriceArea":["${area}"]}&sort=HourUTC ASC`;

    // 5. Fetch data.
    const externalResponse = await fetch(apiUrl);

    // 6. Handle non-successful responses.
    if (!externalResponse.ok) {
      const errorBody = await externalResponse.text();
      console.error(`External API failed with status ${externalResponse.status}: ${errorBody}`);
      return Response.json(
        { error: 'Failed to fetch data from EnergiDataService.' },
        { status: externalResponse.status }
      );
    }

    // 7. Parse and return successful response.
    const result = await externalResponse.json();
    
    // Process records to include the total price
    const processedRecords = result.records.map((record: any) => {
      const spotPriceMWh = record.SpotPriceDKK ?? 0;
      const spotPriceKWh = spotPriceMWh / 1000;

      const basePriceKWh = spotPriceKWh + transportFeeKWh + systemFeeKWh + elafgiftKWh;
      const totalPriceKWh = basePriceKWh * vatRate;

      return {
        ...record,
        SpotPriceKWh: spotPriceKWh,
        TotalPriceKWh: totalPriceKWh
      };
    });

    // Create a new object to return
    const finalData = {
      ...result,
      records: processedRecords
    };

    // Set cache headers
    const headers = { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' };

    return Response.json(finalData, { status: 200, headers });

  } catch (error: any) {
    // 8. Handle unexpected internal errors.
    console.error('An unexpected error occurred in the API route:', error);
    return Response.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}