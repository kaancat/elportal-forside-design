import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];
  
  const API_URL = `https://api.energidataservice.dk/dataset/ProductionAndConsumptionSettlement?start=${start}&end=${end}&sort=Month`;

  try {
    const apiResponse = await fetch(API_URL);
    // We get the raw text of the response first
    const rawText = await apiResponse.text();

    if (!apiResponse.ok) {
      console.error("EnergiDataService API Error:", rawText);
      return res.status(apiResponse.status).json({ error: 'API call failed', details: rawText });
    }
    
    // Try to parse it as JSON
    const data = JSON.parse(rawText);
    
    // Send the raw data directly to the browser
    return res.status(200).json(data);

  } catch (error: any) {
    console.error("API Route crashed:", error);
    return res.status(500).json({ error: error.message });
  }
} 