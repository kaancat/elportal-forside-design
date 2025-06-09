import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  // The verified Dataset ID. We will fetch all columns and process them on the frontend.
  const API_URL = `https://api.energidataservice.dk/dataset/ProductionConsumptionSettlement?start=${start}&end=${end}&sort=HourUTC asc`;

  try {
    const apiResponse = await fetch(API_URL);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("EnergiDataService API Error:", errorText);
      throw new Error(`API call failed: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch monthly production data.', details: error.message });
  }
} 