import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // The API endpoint for the Datahub Price List dataset
  const API_URL = 'https://api.energidataservice.dk/dataset/DatahubPricelist?limit=5000'; // Set a high limit to get all providers

  try {
    const apiResponse = await fetch(API_URL);
    if (!apiResponse.ok) {
      // Forward the error from the external API
      throw new Error(`EnergiDataService API failed with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    
    // Respond with a 200 status and the fetched data
    res.status(200).json(data);

  } catch (error: any) {
    // Handle any errors during the fetch operation
    console.error('Error fetching from EnergiDataService:', error);
    res.status(500).json({ error: 'Failed to fetch data from EnergiDataService.', details: error.message });
  }
} 