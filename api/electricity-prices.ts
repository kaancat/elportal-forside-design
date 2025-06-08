// File: /api/electricity-prices.ts
// This is a Vercel Serverless Function using modern ES Module syntax.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// We use "export default", which is the correct syntax for ES Modules in a TypeScript project.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const region = request.query.region || 'DK1'; // Default to DK1 if not provided

    // Calculate YESTERDAY's date to ensure we always get a complete dataset
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStringForAPI = `${year}-${month}-${day}`;

    // Construct the external API URL
    const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
    const filter = encodeURIComponent(`{"PriceArea":["${region}"]}`);
    const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

    // Fetch data from the external API
    const edsResponse = await fetch(apiUrl);

    if (!edsResponse.ok) {
      // If the external API fails, we return a specific error
      return response.status(edsResponse.status).json({ 
        error: `Failed to fetch data from EnergiDataService. Status: ${edsResponse.status}` 
      });
    }

    const data = await edsResponse.json();

    // Set cache headers and return the successful data
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    // Handle any other unexpected errors in our function
    console.error("Error in /api/electricity-prices:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return response.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}