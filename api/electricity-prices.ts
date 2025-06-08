// File: /api/electricity-prices.ts
// Using modern ES Module syntax for Vercel Serverless Functions.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// We use "export default" which is the correct syntax for ES Modules.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const region = request.query.region || 'DK1';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStringForAPI = `${year}-${month}-${day}`;

    const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
    const filter = encodeURIComponent(`{"PriceArea":["${region}"]}`);
    const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

    const edsResponse = await fetch(apiUrl);

    if (!edsResponse.ok) {
      return response.status(edsResponse.status).json({ 
        error: `Failed to fetch from EnergiDataService: ${edsResponse.statusText}` 
      });
    }

    const data = await edsResponse.json();

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    // It's good practice to cast the error to check its properties.
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in API function:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}