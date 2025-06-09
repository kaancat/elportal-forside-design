import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

  const start = twelveMonthsAgo.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  // These are the exact columns you provided
  const columns = [
    'Month',
    'CentralPowerMWhDK1','CentralPowerMWhDK2',
    'LocalPowerMWhDK1','LocalPowerMWhDK2',
    'OffshoreWindGe100MW_MWhDK1','OffshoreWindGe100MW_MWhDK2',
    'OffshoreWindLt100MW_MWhDK1','OffshoreWindLt100MW_MWhDK2',
    'OnshoreWindGe50kW_MWhDK1','OnshoreWindGe50kW_MWhDK2',
    'OnshoreWindLt50kW_MWhDK1','OnshoreWindLt50kW_MWhDK2',
    'SolarPowerGe10Lt40kW_MWhDK1','SolarPowerGe10Lt40kW_MWhDK2',
    'SolarPowerGe40kW_MWhDK1','SolarPowerGe40kW_MWhDK2',
    'SolarPowerLt10kW_MWhDK1','SolarPowerLt10kW_MWhDK2',
    'SolarPowerSelfConMWhDK1','SolarPowerSelfConMWhDK2'
  ].join(',');

  const API_URL = `https://api.energidataservice.dk/dataset/ProductionAndConsumptionSettlement?start=${start}&end=${end}&sort=Month&columns=${columns}&aggregate=sum`;

  try {
    const apiResponse = await fetch(API_URL);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("EnergiDataService API Error:", errorText);
      throw new Error(`API call failed with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch monthly production data.', details: error.message });
  }
} 