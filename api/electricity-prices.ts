// File: /api/electricity-prices.ts
// Final version with a custom padding function to avoid TS config issues.

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function to fetch electricity spot prices from EnergiDataService.
 * This function is timezone-aware and explicitly uses Danish time (Europe/Copenhagen)
 * to prevent errors around midnight UTC.
 *
 * Query Parameters:
 * @param {string} [region | area] - The price area ('DK1' or 'DK2'). Defaults to 'DK2'.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // 1. Determine the price area from query parameters.
    const priceAreaQuery = req.query.region || req.query.area;
    const area = priceAreaQuery === 'DK1' ? 'DK1' : 'DK2';

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
    const response = await fetch(apiUrl);

    // 6. Handle non-successful responses.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API-FAIL] Status: ${response.status}`);
      console.error(`[API-FAIL] URL Called: ${apiUrl}`);
      console.error(`[API-FAIL] Response Body: ${errorBody}`);
      
      res.status(response.status).json({
        error: 'Failed to fetch data from external energy service.',
        details: `API returned status ${response.status}`,
      });
      return;
    }

    // 7. Parse and return successful response.
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);

  } catch (error: any) {
    // 8. Handle unexpected internal errors.
    console.error('[FATAL-ERROR] An unexpected error occurred in the API route:', error);
    res.status(500).json({ 
      error: 'Internal Server Error.',
      details: error.message 
    });
  }
}