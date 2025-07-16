import { DANISH_MUNICIPALITIES, DANISH_REGIONS, MunicipalityInfo } from './municipalityData';
import type { MunicipalityConsumption } from './types';

export interface ConsumptionData {
  municipalityCode: string;
  municipalityName: string;
  totalConsumption: number;
  privateConsumption: number;
  industryConsumption: number;
  privateShare: number;
  industryShare: number;
  region: string;
  coordinates: [number, number];
}

export function getMunicipalityInfo(code: string): MunicipalityInfo | null {
  return DANISH_MUNICIPALITIES[code] || null;
}

export function getMunicipalityName(code: string): string {
  const info = getMunicipalityInfo(code);
  return info ? info.name : `Municipality ${code}`;
}

export function getMunicipalityRegion(code: string): string {
  const info = getMunicipalityInfo(code);
  return info ? info.region : 'Unknown';
}

export function getAllMunicipalities(): MunicipalityInfo[] {
  return Object.values(DANISH_MUNICIPALITIES);
}

export function getMunicipalitiesByRegion(region: string): MunicipalityInfo[] {
  return Object.values(DANISH_MUNICIPALITIES).filter(m => m.region === region);
}

export function getRegionColor(region: string): string {
  return DANISH_REGIONS[region as keyof typeof DANISH_REGIONS]?.color || '#6b7280';
}

export function getConsumptionColor(consumption: number, maxConsumption: number): string {
  const intensity = Math.min(consumption / maxConsumption, 1);
  
  // ElPortal brand colors - green to blue scale
  if (intensity < 0.2) return '#dcfce7'; // Very light green
  if (intensity < 0.4) return '#bbf7d0'; // Light green
  if (intensity < 0.6) return '#86efac'; // Medium green
  if (intensity < 0.8) return '#4ade80'; // Green
  return '#22c55e'; // Dark green
}

export function getConsumptionLevel(consumption: number, maxConsumption: number): string {
  const intensity = consumption / maxConsumption;
  
  if (intensity < 0.25) return 'Lav';
  if (intensity < 0.5) return 'Moderat';
  if (intensity < 0.75) return 'Høj';
  return 'Meget høj';
}

export function formatConsumption(consumption: number | undefined | null): string {
  if (consumption === undefined || consumption === null || isNaN(consumption)) {
    return '0.0 MWh';
  }
  if (consumption >= 1000) {
    return `${(consumption / 1000).toFixed(1)}k MWh`;
  }
  return `${consumption.toFixed(1)} MWh`;
}

export function formatPercentage(percentage: number | undefined | null): string {
  if (percentage === undefined || percentage === null || isNaN(percentage)) {
    return '0.0%';
  }
  return `${percentage.toFixed(1)}%`;
}

export function calculateConsumptionStats(municipalities: MunicipalityConsumption[]) {
  const totalConsumption = municipalities.reduce((sum, m) => sum + m.totalConsumption, 0);
  const totalPrivate = municipalities.reduce((sum, m) => sum + m.totalPrivateConsumption, 0);
  const totalIndustry = municipalities.reduce((sum, m) => sum + m.totalIndustryConsumption, 0);
  
  const averageConsumption = municipalities.length > 0 ? totalConsumption / municipalities.length : 0;
  const maxConsumption = Math.max(...municipalities.map(m => m.totalConsumption));
  const minConsumption = Math.min(...municipalities.map(m => m.totalConsumption));
  
  const topConsumers = municipalities
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
    .slice(0, 5);
  
  const bottomConsumers = municipalities
    .sort((a, b) => a.totalConsumption - b.totalConsumption)
    .slice(0, 5);
  
  return {
    totalConsumption,
    totalPrivate,
    totalIndustry,
    averageConsumption,
    maxConsumption,
    minConsumption,
    privateShare: totalConsumption > 0 ? (totalPrivate / totalConsumption) * 100 : 0,
    industryShare: totalConsumption > 0 ? (totalIndustry / totalConsumption) * 100 : 0,
    privateShareTotal: totalConsumption > 0 ? (totalPrivate / totalConsumption) * 100 : 0,
    industryShareTotal: totalConsumption > 0 ? (totalIndustry / totalConsumption) * 100 : 0,
    topConsumers,
    bottomConsumers,
    municipalityCount: municipalities.length
  };
}

export function groupByRegion(municipalities: MunicipalityConsumption[]) {
  const regions: Record<string, MunicipalityConsumption[]> = {};
  
  municipalities.forEach(municipality => {
    const municipalityInfo = getMunicipalityInfo(municipality.municipalityCode);
    const region = municipalityInfo?.region || 'Unknown';
    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(municipality);
  });
  
  return regions;
}

export function searchMunicipalities(query: string): MunicipalityInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(DANISH_MUNICIPALITIES).filter(municipality =>
    municipality.name.toLowerCase().includes(lowercaseQuery) ||
    municipality.code.includes(query)
  );
}

export function isValidMunicipalityCode(code: string): boolean {
  return code in DANISH_MUNICIPALITIES;
}

export function getDistanceBetweenMunicipalities(code1: string, code2: string): number | null {
  const mun1 = getMunicipalityInfo(code1);
  const mun2 = getMunicipalityInfo(code2);
  
  if (!mun1 || !mun2) return null;
  
  const [lon1, lat1] = mun1.coordinates;
  const [lon2, lat2] = mun2.coordinates;
  
  // Haversine formula for distance between two points
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}