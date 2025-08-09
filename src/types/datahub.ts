/**
 * DatahubPricelist API Types
 * Official tariff data from EnergiDataService
 */

export interface DatahubPricelistRecord {
  ChargeOwner: string;
  GLN_Number: string;
  ChargeType: string;
  ChargeTypeCode: string;
  Note: string;
  Description: string;
  ValidFrom: string;
  ValidTo: string | null;
  VATClass: string;
  Price1: number;  // Hour 00:00-01:00
  Price2: number;  // Hour 01:00-02:00
  Price3: number;  // Hour 02:00-03:00
  Price4: number;  // Hour 03:00-04:00
  Price5: number;  // Hour 04:00-05:00
  Price6: number;  // Hour 05:00-06:00
  Price7: number;  // Hour 06:00-07:00
  Price8: number;  // Hour 07:00-08:00
  Price9: number;  // Hour 08:00-09:00
  Price10: number; // Hour 09:00-10:00
  Price11: number; // Hour 10:00-11:00
  Price12: number; // Hour 11:00-12:00
  Price13: number; // Hour 12:00-13:00
  Price14: number; // Hour 13:00-14:00
  Price15: number; // Hour 14:00-15:00
  Price16: number; // Hour 15:00-16:00
  Price17: number; // Hour 16:00-17:00
  Price18: number; // Hour 17:00-18:00
  Price19: number; // Hour 18:00-19:00
  Price20: number; // Hour 19:00-20:00
  Price21: number; // Hour 20:00-21:00
  Price22: number; // Hour 21:00-22:00
  Price23: number; // Hour 22:00-23:00
  Price24: number; // Hour 23:00-24:00
  TransparentInvoicing: number;
  TaxIndicator: number;
  ResolutionDuration: string;
}

export interface DatahubPricelistResponse {
  total: number;
  limit: number;
  dataset: string;
  records: DatahubPricelistRecord[];
  filters?: string;
  sort?: string;
}

export interface TariffData {
  gln: string;
  provider: string;
  validFrom: Date;
  validTo: Date | null;
  hourlyRates: number[]; // 24 hourly rates in kr/kWh
  averageRate: number;    // Weighted average in kr/kWh
  tariffType: 'time-of-use' | 'flat';
  season: 'winter' | 'summer' | 'year-round';
}

export interface CachedTariff {
  data: TariffData;
  timestamp: number;
  expires: number;
}

// Tariff periods for time-of-use pricing
export interface TariffPeriods {
  low: {
    hours: number[];     // [0, 1, 2, 3, 4, 5]
    rate: number;        // kr/kWh
  };
  high: {
    hours: number[];     // [6-17, 21-24]
    rate: number;        // kr/kWh
  };
  peak: {
    hours: number[];     // [17, 18, 19, 20]
    rate: number;        // kr/kWh
  };
}

// Customer types for different grid levels
export type CustomerType = 'C' | 'B' | 'A'; // C = residential, B = business, A = large industry

// Charge codes used by different providers
export interface ChargeCodeMap {
  [gln: string]: {
    residential: string;  // e.g., "DT_C_01", "CD"
    business?: string;    // e.g., "DT_B_01", "B2D"
  };
}

// Standard charge codes used by Danish grid providers
export const STANDARD_CHARGE_CODES: ChargeCodeMap = {
  "5790000705689": { residential: "DT_C_01" },  // Radius Elnet
  "5790001089030": { residential: "CD" },        // N1
  "5790000610976": { residential: "DT_C_01" },   // Cerius
  "5790000610853": { residential: "DT_C_01" },   // Vores Elnet
  "5790000392261": { residential: "DT_C_01" },   // TREFOR El-net
  "5790000392551": { residential: "DT_C_01" },   // TREFOR El-net Øst
  "5790000610280": { residential: "DT_C_01" },   // Konstant Net
};

// Consumption pattern for weighted average calculation
export interface ConsumptionPattern {
  low: number;   // Percentage of consumption during low period (night)
  high: number;  // Percentage of consumption during high period (day)
  peak: number;  // Percentage of consumption during peak period (evening)
}

// Default Danish household consumption pattern
export const DEFAULT_CONSUMPTION_PATTERN: ConsumptionPattern = {
  low: 0.25,   // 25% at night (00:00-06:00)
  high: 0.60,  // 60% during day (06:00-17:00, 21:00-24:00)
  peak: 0.15   // 15% at peak (17:00-21:00)
};