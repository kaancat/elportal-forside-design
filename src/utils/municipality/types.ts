export interface MunicipalityConsumption {
  municipalityCode: string;
  municipalityName: string;
  priceArea: string;
  totalPrivateConsumption: number;
  totalIndustryConsumption: number;
  totalConsumption: number;
  avgPrivateConsumption: number;
  avgIndustryConsumption: number;
  avgTotalConsumption: number;
  privateShare: number;
  industryShare: number;
  dataPoints: number;
  hourlyData?: HourlyConsumption[];
}

export interface HourlyConsumption {
  hour: string;
  privateConsumption: number;
  industryConsumption: number;
  totalConsumption: number;
}

export interface ConsumptionStatistics {
  totalMunicipalities: number;
  totalConsumption: number;
  totalPrivateConsumption: number;
  totalIndustryConsumption: number;
  averageConsumption: number;
  privateShareTotal: number;
  industryShareTotal: number;
  topConsumers: Array<{
    municipalityName: string;
    consumption: number;
  }>;
}

export interface ConsumptionMapResponse {
  data: MunicipalityConsumption[];
  statistics: ConsumptionStatistics;
  metadata: {
    consumerType: string;
    aggregation: string;
    view: string;
    startDate: string;
    endDate: string;
    municipality?: string;
    dataPoints: number;
    lastUpdated: string;
  };
}

export interface ConsumptionMapOptions {
  consumerType?: 'private' | 'industry' | 'all';
  aggregation?: 'hourly' | 'daily' | 'monthly';
  view?: '24h' | '7d' | '30d' | 'month';
  municipality?: string;
}

export interface MapTooltipData {
  municipalityName: string;
  consumption: number;
  consumptionLevel: string;
  privateShare: number;
  industryShare: number;
  region: string;
  coordinates: [number, number];
}

export interface MapLegendItem {
  color: string;
  label: string;
  range: string;
}

export interface RegionData {
  name: string;
  color: string;
  municipalities: MunicipalityConsumption[];
  totalConsumption: number;
  averageConsumption: number;
}