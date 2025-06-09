import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to format date into YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { date } = req.query;

  // Determine the start and end dates for the query
  const queryDate = date ? new Date(date as string) : new Date();
  const start = formatDate(queryDate);
  
  const tomorrow = new Date(queryDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const end = formatDate(tomorrow);

  // URL now fetches ALL regions by default
  const API_URL = `https://api.energidataservice.dk/dataset/Forecasts_Hour?start=${start}&end=${end}&sort=HourUTC asc`;

  try {
    const apiResponse = await fetch(API_URL);
    if (!apiResponse.ok) throw new Error(`EnergiDataService API failed: ${apiResponse.status}`);
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching from EnergiDataService:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data.', details: error.message });
  }
} 