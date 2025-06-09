import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  // These are the correct column names based on your custom report
  const columns = [
    'Month',
    'CentralPower_MWh',
    'LocalPower_MWh',
    'OffshoreWindGe100MW_MWh',
    'OffshoreWindLt100MW_MWh',
    'OnshoreWindGe50kW_MWh',
    'OnshoreWindLt50kW_MWh',
    'SolarPowerGe40kW_MWh',
    'SolarPower10To40kW_MWh',
    'SolarPower0To10kW_MWh',
  ].join(',');

  // The dataset is "ProductionAndConsumptionSettlement", which contains these columns.
  const API_URL = `https://api.energidataservice.dk/dataset/ProductionAndConsumptionSettlement?start=${start}&end=${end}&sort=Month&columns=${columns}&aggregate=sum`;

  try {
    const apiResponse = await fetch(API_URL);
    if (!apiResponse.ok) {
      console.error("EnergiDataService API Error:", await apiResponse.text());
      throw new Error(`API call failed: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch monthly production data.', details: error.message });
  }
} 