// File: /api/electricity-prices.ts
// Final version with a custom padding function to avoid TS config issues.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// A simple helper function to replace padStart. It's "dumb" but works everywhere.
function pad(num: number): string {
  return num < 10 ? '0' + num : String(num);
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const region = request.query.region || 'DK1';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    // Use our custom padding function instead of .padStart()
    const month = pad(yesterday.getMonth() + 1);
    const day = pad(yesterday.getDate());
    
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
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in API function:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}