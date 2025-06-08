// File: /api/electricity-prices.ts
// This is a Vercel Serverless Function. It becomes available at the path /api/electricity-prices.

// We use this to define the types for the request and response objects.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // 1. Get the region (DK1/DK2) from the query parameters.
    // Example: /api/electricity-prices?region=DK1
    const region = request.query.region || 'DK1'; // Default to DK1 if not provided.

    // 2. Calculate YESTERDAY's date to ensure we get a complete and available dataset.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Set date to one day before today.
    
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStringForAPI = `${year}-${month}-${day}`;

    // 3. Construct the full, external API URL for EnergiDataService.
    const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
    const filter = encodeURIComponent(`{"PriceArea":["${region}"]}`);
    const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

    // 4. Fetch the data from the external API.
    const edsResponse = await fetch(apiUrl);

    // 5. Check if the external API call was successful.
    if (!edsResponse.ok) {
      // Forward the error status and text from the external API to our frontend for debugging.
      return response.status(edsResponse.status).json({ 
        error: `Failed to fetch data from EnergiDataService: ${edsResponse.statusText}` 
      });
    }

    const data = await edsResponse.json();

    // 6. Return the successful data to our frontend.
    // We also set cache headers to tell Vercel to cache this response for 1 hour (3600 seconds).
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    // Handle any unexpected errors that occur within our own function.
    console.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}