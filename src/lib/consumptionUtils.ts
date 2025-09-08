import { ConsumptionRecord, AggregatedConsumption } from '../types/sanity';

// Extended municipality mapping with geographical information
export const MUNICIPALITY_DATA = {
  "101": { name: "København", region: "Hovedstaden", coordinates: [12.5683, 55.6761] },
  "147": { name: "Frederiksberg", region: "Hovedstaden", coordinates: [12.5348, 55.6787] },
  "151": { name: "Ballerup", region: "Hovedstaden", coordinates: [12.3736, 55.7316] },
  "153": { name: "Brøndby", region: "Hovedstaden", coordinates: [12.4134, 55.6458] },
  "155": { name: "Dragør", region: "Hovedstaden", coordinates: [12.6742, 55.5932] },
  "157": { name: "Gentofte", region: "Hovedstaden", coordinates: [12.5521, 55.7475] },
  "159": { name: "Gladsaxe", region: "Hovedstaden", coordinates: [12.4847, 55.7329] },
  "161": { name: "Glostrup", region: "Hovedstaden", coordinates: [12.4037, 55.6674] },
  "163": { name: "Herlev", region: "Hovedstaden", coordinates: [12.4415, 55.7297] },
  "165": { name: "Albertslund", region: "Hovedstaden", coordinates: [12.3647, 55.6574] },
  "167": { name: "Hvidovre", region: "Hovedstaden", coordinates: [12.4736, 55.6574] },
  "169": { name: "Høje-Taastrup", region: "Hovedstaden", coordinates: [12.2836, 55.6574] },
  "173": { name: "Lyngby-Taarbæk", region: "Hovedstaden", coordinates: [12.5036, 55.7702] },
  "175": { name: "Rødovre", region: "Hovedstaden", coordinates: [12.4536, 55.6803] },
  "183": { name: "Ishøj", region: "Hovedstaden", coordinates: [12.3515, 55.6157] },
  "185": { name: "Tårnby", region: "Hovedstaden", coordinates: [12.6036, 55.6297] },
  "187": { name: "Vallensbæk", region: "Hovedstaden", coordinates: [12.3836, 55.6297] },
  "190": { name: "Furesø", region: "Hovedstaden", coordinates: [12.3736, 55.7702] },
  "201": { name: "Allerød", region: "Hovedstaden", coordinates: [12.3536, 55.8702] },
  "210": { name: "Fredensborg", region: "Hovedstaden", coordinates: [12.4036, 55.9702] },
  "217": { name: "Helsingør", region: "Hovedstaden", coordinates: [12.6136, 56.0361] },
  "219": { name: "Hillerød", region: "Hovedstaden", coordinates: [12.3036, 55.9297] },
  "223": { name: "Hørsholm", region: "Hovedstaden", coordinates: [12.4936, 55.8802] },
  "230": { name: "Rudersdal", region: "Hovedstaden", coordinates: [12.4536, 55.8297] },
  "240": { name: "Egedal", region: "Hovedstaden", coordinates: [12.1936, 55.7702] },
  "250": { name: "Frederikssund", region: "Hovedstaden", coordinates: [12.0636, 55.8408] },
  "253": { name: "Greve", region: "Sjælland", coordinates: [12.2936, 55.5833] },
  "259": { name: "Køge", region: "Sjælland", coordinates: [12.1836, 55.4580] },
  "260": { name: "Roskilde", region: "Sjælland", coordinates: [12.0836, 55.6419] },
  "265": { name: "Solrød", region: "Sjælland", coordinates: [12.2236, 55.5297] },
  "269": { name: "Lejre", region: "Sjælland", coordinates: [11.9736, 55.5997] },
  "270": { name: "Holbæk", region: "Sjælland", coordinates: [11.7136, 55.7167] },
  "306": { name: "Odsherred", region: "Sjælland", coordinates: [11.6436, 55.8167] },
  "316": { name: "Halsnæs", region: "Hovedstaden", coordinates: [12.1036, 55.9697] },
  "320": { name: "Faxe", region: "Sjælland", coordinates: [12.1136, 55.2567] },
  "326": { name: "Kalundborg", region: "Sjælland", coordinates: [11.0936, 55.6797] },
  "329": { name: "Ringsted", region: "Sjælland", coordinates: [11.7936, 55.4419] },
  "330": { name: "Sorø", region: "Sjælland", coordinates: [11.5536, 55.4319] },
  "336": { name: "Stevns", region: "Sjælland", coordinates: [12.2736, 55.3167] },
  "340": { name: "Guldborgsund", region: "Sjælland", coordinates: [11.8436, 54.7697] },
  "350": { name: "Næstved", region: "Sjælland", coordinates: [11.7636, 55.2297] },
  "360": { name: "Lolland", region: "Sjælland", coordinates: [11.3136, 54.7697] },
  "370": { name: "Vordingborg", region: "Sjælland", coordinates: [12.0436, 55.0097] },
  "376": { name: "Bornholm", region: "Hovedstaden", coordinates: [14.9136, 55.1297] },
  "390": { name: "Slagelse", region: "Sjælland", coordinates: [11.3536, 55.4019] },
  "400": { name: "Middelfart", region: "Syddanmark", coordinates: [9.7336, 55.5059] },
  "410": { name: "Assens", region: "Syddanmark", coordinates: [9.9036, 55.2719] },
  "420": { name: "Faaborg-Midtfyn", region: "Syddanmark", coordinates: [10.2436, 55.0959] },
  "430": { name: "Kerteminde", region: "Syddanmark", coordinates: [10.6536, 55.4519] },
  "440": { name: "Nyborg", region: "Syddanmark", coordinates: [10.7936, 55.3119] },
  "450": { name: "Odense", region: "Syddanmark", coordinates: [10.4036, 55.4036] },
  "461": { name: "Svendborg", region: "Syddanmark", coordinates: [10.6136, 55.0597] },
  "479": { name: "Nordfyns", region: "Syddanmark", coordinates: [10.2936, 55.4819] },
  "480": { name: "Langeland", region: "Syddanmark", coordinates: [10.7236, 54.9097] },
  "482": { name: "Ærø", region: "Syddanmark", coordinates: [10.4236, 54.8797] },
  "492": { name: "Vejle", region: "Syddanmark", coordinates: [9.5336, 55.7097] },
  "510": { name: "Haderslev", region: "Syddanmark", coordinates: [9.4936, 55.2536] },
  "530": { name: "Billund", region: "Syddanmark", coordinates: [9.1136, 55.7297] },
  "540": { name: "Sønderborg", region: "Syddanmark", coordinates: [9.7936, 54.9097] },
  "550": { name: "Tønder", region: "Syddanmark", coordinates: [8.8636, 54.9336] },
  "561": { name: "Esbjerg", region: "Syddanmark", coordinates: [8.4536, 55.4667] },
  "563": { name: "Fanø", region: "Syddanmark", coordinates: [8.3936, 55.4297] },
  "573": { name: "Varde", region: "Syddanmark", coordinates: [8.4836, 55.6197] },
  "575": { name: "Vejen", region: "Syddanmark", coordinates: [9.1436, 55.4819] },
  "630": { name: "Aabenraa", region: "Syddanmark", coordinates: [9.4136, 55.0456] },
  "657": { name: "Herning", region: "Midtjylland", coordinates: [8.9736, 56.1361] },
  "661": { name: "Holstebro", region: "Midtjylland", coordinates: [8.6136, 56.3603] },
  "665": { name: "Lemvig", region: "Midtjylland", coordinates: [8.3036, 56.5467] },
  "671": { name: "Struer", region: "Midtjylland", coordinates: [8.5936, 56.4897] },
  "706": { name: "Syddjurs", region: "Midtjylland", coordinates: [10.7736, 56.1897] },
  "707": { name: "Norddjurs", region: "Midtjylland", coordinates: [10.8136, 56.3697] },
  "710": { name: "Favrskov", region: "Midtjylland", coordinates: [10.1536, 56.2697] },
  "727": { name: "Odder", region: "Midtjylland", coordinates: [10.1536, 55.9736] },
  "730": { name: "Randers", region: "Midtjylland", coordinates: [10.0336, 56.4597] },
  "740": { name: "Silkeborg", region: "Midtjylland", coordinates: [9.5436, 56.1697] },
  "741": { name: "Samsø", region: "Midtjylland", coordinates: [10.6136, 55.8697] },
  "746": { name: "Skanderborg", region: "Midtjylland", coordinates: [9.9336, 56.0336] },
  "751": { name: "Århus", region: "Midtjylland", coordinates: [10.2136, 56.1572] },
  "756": { name: "Ikast-Brande", region: "Midtjylland", coordinates: [9.1336, 56.1397] },
  "760": { name: "Ringkøbing-Skjern", region: "Midtjylland", coordinates: [8.2436, 56.0897] },
  "766": { name: "Hedensted", region: "Midtjylland", coordinates: [9.7036, 55.7697] },
  "779": { name: "Skive", region: "Midtjylland", coordinates: [9.0236, 56.5667] },
  "787": { name: "Viborg", region: "Midtjylland", coordinates: [9.4036, 56.4536] },
  "791": { name: "Rønne", region: "Hovedstaden", coordinates: [14.6936, 55.1036] },
  "810": { name: "Brønderslev", region: "Nordjylland", coordinates: [9.9436, 57.2697] },
  "813": { name: "Frederikshavn", region: "Nordjylland", coordinates: [10.5336, 57.4403] },
  "820": { name: "Vesthimmerlands", region: "Nordjylland", coordinates: [9.3136, 56.7897] },
  "825": { name: "Læsø", region: "Nordjylland", coordinates: [11.0036, 57.2697] },
  "840": { name: "Rebild", region: "Nordjylland", coordinates: [9.6536, 56.8297] },
  "846": { name: "Mariagerfjord", region: "Nordjylland", coordinates: [10.0136, 56.6597] },
  "849": { name: "Jammerbugt", region: "Nordjylland", coordinates: [9.2136, 57.0897] },
  "851": { name: "Aalborg", region: "Nordjylland", coordinates: [9.9216, 57.0488] },
  "860": { name: "Hjørring", region: "Nordjylland", coordinates: [9.9836, 57.4639] },
  "861": { name: "Thisted", region: "Nordjylland", coordinates: [8.6936, 56.9553] }
} as const;

// Housing category translations
export const HOUSING_CATEGORIES = {
  "Andet": "Other",
  "Erhverv": "Business",
  "Etageejendom": "Apartment Buildings",
  "Fritidshuse": "Holiday Homes",
  "Parcel- og rækkehuse": "Detached & Row Houses"
} as const;

// Heating category translations
export const HEATING_CATEGORIES = {
  "Andet": "Other",
  "Elvarme eller varmepumpe": "Electric/Heat Pump",
  "Erhverv": "Business"
} as const;

/**
 * Get municipality name from municipality number
 */
export function getMunicipalityName(municipalityNo: string): string {
  return MUNICIPALITY_DATA[municipalityNo as keyof typeof MUNICIPALITY_DATA]?.name || `Municipality ${municipalityNo}`;
}

/**
 * Get municipality region from municipality number
 */
export function getMunicipalityRegion(municipalityNo: string): string {
  return MUNICIPALITY_DATA[municipalityNo as keyof typeof MUNICIPALITY_DATA]?.region || "Unknown";
}

/**
 * Get municipality coordinates for map visualization
 */
export function getMunicipalityCoordinates(municipalityNo: string): [number, number] | null {
  const data = MUNICIPALITY_DATA[municipalityNo as keyof typeof MUNICIPALITY_DATA];
  return data?.coordinates ? [...data.coordinates] as [number, number] : null;
}

/**
 * Translate housing category to English
 */
export function translateHousingCategory(category: string): string {
  return HOUSING_CATEGORIES[category as keyof typeof HOUSING_CATEGORIES] || category;
}

/**
 * Translate heating category to English
 */
export function translateHeatingCategory(category: string): string {
  return HEATING_CATEGORIES[category as keyof typeof HEATING_CATEGORIES] || category;
}

/**
 * Calculate consumption intensity (kWh per capita or per household)
 * This would require population data which could be integrated later
 */
export function calculateConsumptionIntensity(
  totalConsumption: number,
  populationOrHouseholds: number
): number {
  return populationOrHouseholds > 0 ? totalConsumption / populationOrHouseholds : 0;
}

/**
 * Format consumption value for display
 */
export function formatConsumption(value: number, unit: 'kWh' | 'MWh' | 'GWh' = 'kWh'): string {
  let formattedValue = value;
  let displayUnit = unit;

  // Auto-scale units for better readability
  if (unit === 'kWh' && value >= 1000000) {
    formattedValue = value / 1000000;
    displayUnit = 'GWh';
  } else if (unit === 'kWh' && value >= 1000) {
    formattedValue = value / 1000;
    displayUnit = 'MWh';
  }

  return `${formattedValue.toLocaleString('da-DK', {
    maximumFractionDigits: 1,
  })} ${displayUnit}`;
}

/**
 * Get top consuming municipalities from aggregated data
 */
export function getTopConsumingMunicipalities(
  data: AggregatedConsumption[],
  limit: number = 10
): AggregatedConsumption[] {
  return data
    .sort((a, b) => b.totalConsumption - a.totalConsumption)
    .slice(0, limit);
}

/**
 * Filter consumption data by region
 */
export function filterByRegion(
  data: AggregatedConsumption[],
  region: string
): AggregatedConsumption[] {
  return data.filter(municipality => 
    getMunicipalityRegion(municipality.municipalityNo) === region
  );
}

/**
 * Calculate regional consumption totals
 */
export function calculateRegionalTotals(data: AggregatedConsumption[]): Record<string, number> {
  const regionalTotals: Record<string, number> = {};

  data.forEach(municipality => {
    const region = getMunicipalityRegion(municipality.municipalityNo);
    regionalTotals[region] = (regionalTotals[region] || 0) + municipality.totalConsumption;
  });

  return regionalTotals;
}

/**
 * Get color scale for consumption visualization
 */
export function getConsumptionColor(
  value: number,
  min: number,
  max: number,
  colorScheme: 'blue' | 'green' | 'red' = 'blue'
): string {
  const normalized = (value - min) / (max - min);
  const intensity = Math.max(0, Math.min(1, normalized));

  const colorSchemes = {
    blue: [
      '#eff6ff', // lightest
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a'  // darkest
    ],
    green: [
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d'
    ],
    red: [
      '#fef2f2',
      '#fecaca',
      '#fca5a5',
      '#f87171',
      '#ef4444',
      '#dc2626',
      '#b91c1c',
      '#991b1b',
      '#7f1d1d',
      '#450a0a'
    ]
  };

  const colors = colorSchemes[colorScheme];
  const index = Math.floor(intensity * (colors.length - 1));
  return colors[index];
}

/**
 * Privacy-aware data processing for "Andet" category
 * Handles the <20 units aggregation mentioned in the dataset
 */
export function processPrivacyAwareData(data: ConsumptionRecord[]): ConsumptionRecord[] {
  // Group by municipality and category combinations
  const grouped = data.reduce((acc, record) => {
    const key = `${record.MunicipalityNo}-${record.HousingCategory}-${record.HeatingCategory}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {} as Record<string, ConsumptionRecord[]>);

  // Process each group according to privacy rules
  const processedData: ConsumptionRecord[] = [];

  Object.entries(grouped).forEach(([key, records]) => {
    // If fewer than 20 records, these might be aggregated into "Andet"
    if (records.length < 20) {
      // These records might already be processed into "Andet" by the API
      processedData.push(...records);
    } else {
      processedData.push(...records);
    }
  });

  return processedData;
}