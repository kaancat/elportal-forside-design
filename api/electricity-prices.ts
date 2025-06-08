// File: /api/electricity-prices.ts
// Final version with a custom padding function to avoid TS config issues.

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function to fetch electricity spot prices from EnergiDataService.
 * This function is written as an ES Module, compatible with Vite projects
 * configured with "type": "module" in package.json.
 *
 * It fetches data for the current day in the specified price area (DK1 or DK2).
 *
 * Query Parameters:
 * @param {string} [area] - The price area (e.g., 'DK1' or 'DK2').
 * @param {string} [region] - Alternative for 'area'.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // 1. Determine the price area from query parameters.
    //    Accepts 'region' or 'area' for flexibility. Defaults to 'DK2'.
    const priceAreaQuery = req.query.region || req.query.area;
    const area = priceAreaQuery === 'DK1' ? 'DK1' : 'DK2';

    // 2. Calculate the start and end dates for the API query (today)
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0];

    // 3. Construct the API URL for EnergiDataService
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${startDate}&end=${endDate}&filter={"PriceArea":["${area}"]}&sort=HourUTC ASC`;

    // 4. Fetch data using the modern, global fetch API
    const response = await fetch(apiUrl);

    // 5. Handle non-successful responses from the external API
    if (!response.ok) {
      console.error(`EnergiDataService API failed with status: ${response.status}`);
      const errorBody = await response.text();
      console.error(`Failed URL: ${apiUrl}`);
      console.error(`Error body: ${errorBody}`);
      
      res.status(response.status).json({
        error: 'Failed to fetch data from EnergiDataService.',
        details: `API returned status ${response.status}`,
      });
      return;
    }

    // 6. Parse the JSON data and send it to the client
    const data = await response.json();
    
    // Set cache headers to instruct Vercel's CDN to cache the response for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    res.status(200).json(data);

  } catch (error) {
    // 7. Handle unexpected errors in our function
    console.error('An unexpected error occurred in the API route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}