/**
 * DatahubPricelist Service
 * Fetches official network tariffs from EnergiDataService API
 */

import {
  DatahubPricelistResponse,
  DatahubPricelistRecord,
  TariffData,
  CachedTariff,
  TariffPeriods,
  STANDARD_CHARGE_CODES,
  DEFAULT_CONSUMPTION_PATTERN,
  ConsumptionPattern,
} from '@/types/datahub';

class DatahubPricelistService {
  private static instance: DatahubPricelistService;
  private readonly API_BASE_URL = 'https://api.energidataservice.dk/dataset/DatahubPricelist';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
  private cache: Map<string, CachedTariff> = new Map();
  private pendingRequests: Map<string, Promise<TariffData | null>> = new Map();

  private constructor() {}

  static getInstance(): DatahubPricelistService {
    if (!DatahubPricelistService.instance) {
      DatahubPricelistService.instance = new DatahubPricelistService();
    }
    return DatahubPricelistService.instance;
  }

  /**
   * Get current network tariff for a grid provider
   * @param gln - Global Location Number of the grid provider
   * @param chargeCode - Optional specific charge code, defaults to residential
   * @returns Tariff data or null if not found
   */
  async getCurrentTariff(gln: string, chargeCode?: string): Promise<TariffData | null> {
    const cacheKey = `${gln}-${chargeCode || 'default'}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      // Refresh in background if expiring soon (within 2 hours)
      if (Date.now() > cached.expires - 2 * 60 * 60 * 1000) {
        this.refreshInBackground(gln, chargeCode);
      }
      return cached.data;
    }

    // Check if already fetching
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Fetch from API
    const fetchPromise = this.fetchTariff(gln, chargeCode);
    this.pendingRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION,
        });
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Fetch tariff data from API
   */
  private async fetchTariff(gln: string, chargeCode?: string): Promise<TariffData | null> {
    try {
      // Determine charge code
      const code = chargeCode || STANDARD_CHARGE_CODES[gln]?.residential || 'DT_C_01';

      // Build filter
      const filter = {
        ChargeType: 'D03',
        GLN_Number: gln,
        ChargeTypeCode: code,
      };

      // Query API
      const params = new URLSearchParams({
        filter: JSON.stringify(filter),
        sort: 'ValidFrom desc',
        limit: '10',
      });

      const response = await fetch(`${this.API_BASE_URL}?${params}`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        return null;
      }

      const data: DatahubPricelistResponse = await response.json();
      
      if (!data.records || data.records.length === 0) {
        console.warn(`No tariff data found for GLN ${gln} with code ${code}`);
        return null;
      }

      // Process the records to find current valid tariff
      const now = new Date();
      const currentTariff = this.findCurrentTariff(data.records, now);

      if (!currentTariff) {
        console.warn(`No valid tariff found for current date`);
        return null;
      }

      return this.processTariffRecord(currentTariff, gln);
    } catch (error) {
      console.error('Error fetching tariff data:', error);
      return null;
    }
  }

  /**
   * Find the tariff record valid for the current date
   */
  private findCurrentTariff(records: DatahubPricelistRecord[], date: Date): DatahubPricelistRecord | null {
    for (const record of records) {
      const validFrom = new Date(record.ValidFrom);
      const validTo = record.ValidTo ? new Date(record.ValidTo) : null;

      if (date >= validFrom && (!validTo || date < validTo)) {
        return record;
      }
    }
    return null;
  }

  /**
   * Process a tariff record into structured data
   */
  private processTariffRecord(record: DatahubPricelistRecord, gln: string): TariffData {
    // Extract hourly rates (prices are in kr/kWh)
    const hourlyRates: number[] = [];
    for (let i = 1; i <= 24; i++) {
      const price = record[`Price${i}` as keyof DatahubPricelistRecord] as number;
      hourlyRates.push(price);
    }

    // Determine tariff type
    const uniqueRates = new Set(hourlyRates);
    const tariffType = uniqueRates.size === 1 ? 'flat' : 'time-of-use';

    // Determine season based on month
    const validFrom = new Date(record.ValidFrom);
    const month = validFrom.getMonth();
    const season = month >= 3 && month < 9 ? 'summer' : 'winter';

    // Calculate average rate
    const averageRate = this.calculateWeightedAverage(hourlyRates);

    return {
      gln,
      provider: record.ChargeOwner,
      validFrom: new Date(record.ValidFrom),
      validTo: record.ValidTo ? new Date(record.ValidTo) : null,
      hourlyRates,
      averageRate,
      tariffType,
      season,
    };
  }

  /**
   * Calculate weighted average based on consumption pattern
   */
  private calculateWeightedAverage(
    hourlyRates: number[],
    pattern: ConsumptionPattern = DEFAULT_CONSUMPTION_PATTERN
  ): number {
    // Define hour ranges for each period
    const lowHours = [0, 1, 2, 3, 4, 5];           // 00:00-06:00
    const peakHours = [17, 18, 19, 20];            // 17:00-21:00
    const highHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23]; // Rest

    // Calculate average for each period
    const lowAvg = lowHours.reduce((sum, h) => sum + hourlyRates[h], 0) / lowHours.length;
    const highAvg = highHours.reduce((sum, h) => sum + hourlyRates[h], 0) / highHours.length;
    const peakAvg = peakHours.reduce((sum, h) => sum + hourlyRates[h], 0) / peakHours.length;

    // Apply consumption pattern weights
    return lowAvg * pattern.low + highAvg * pattern.high + peakAvg * pattern.peak;
  }

  /**
   * Get current hourly rate based on time of day
   */
  getCurrentHourlyRate(tariffData: TariffData): number {
    const currentHour = new Date().getHours();
    return tariffData.hourlyRates[currentHour];
  }

  /**
   * Get tariff periods (low/high/peak) from hourly rates
   */
  getTariffPeriods(tariffData: TariffData): TariffPeriods {
    const rates = tariffData.hourlyRates;

    return {
      low: {
        hours: [0, 1, 2, 3, 4, 5],
        rate: (rates[0] + rates[1] + rates[2] + rates[3] + rates[4] + rates[5]) / 6,
      },
      high: {
        hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21, 22, 23],
        rate: (rates[6] + rates[7] + rates[8] + rates[9] + rates[10] + 
               rates[11] + rates[12] + rates[13] + rates[14] + rates[15] + 
               rates[16] + rates[21] + rates[22] + rates[23]) / 14,
      },
      peak: {
        hours: [17, 18, 19, 20],
        rate: (rates[17] + rates[18] + rates[19] + rates[20]) / 4,
      },
    };
  }

  /**
   * Refresh tariff data in background
   */
  private async refreshInBackground(gln: string, chargeCode?: string): Promise<void> {
    // Fire and forget - don't await
    this.fetchTariff(gln, chargeCode).then(result => {
      if (result) {
        const cacheKey = `${gln}-${chargeCode || 'default'}`;
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expires: Date.now() + this.CACHE_DURATION,
        });
      }
    }).catch(error => {
      console.error('Background refresh failed:', error);
    });
  }

  /**
   * Pre-fetch tariffs for major providers
   */
  async prefetchMajorProviders(): Promise<void> {
    const majorProviders = [
      '5790000705689', // Radius Elnet
      '5790001089030', // N1
      '5790000610976', // Cerius
      '5790000610853', // Vores Elnet
      '5790000392261', // TREFOR
    ];

    // Fetch in parallel
    await Promise.allSettled(
      majorProviders.map(gln => this.getCurrentTariff(gln))
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; providers: string[] } {
    return {
      size: this.cache.size,
      providers: Array.from(this.cache.keys()),
    };
  }
}

export const datahubPricelistService = DatahubPricelistService.getInstance();

// Fallback static averages if API fails (based on research)
export const FALLBACK_TARIFFS: Record<string, number> = {
  '5790000705689': 0.217,  // Radius Elnet
  '5790001089030': 0.192,  // N1
  '5790000610976': 0.236,  // Cerius
  '5790000610853': 0.220,  // Vores Elnet
  '5790000392261': 0.316,  // TREFOR El-net
  '5790000392551': 0.641,  // TREFOR El-net Øst
  '5790000610280': 0.310,  // Konstant Net
  '5790001095024': 0.300,  // Nord Energi Net
  '5790000610846': 0.290,  // Dinel
  '5790000610839': 0.248,  // FLOW Elnet
  '5790001089375': 0.290,  // Ravdex
  '5790001089191': 0.300,  // Elinord
  '5790001089238': 0.300,  // Elnet Midt
  '5790001089542': 0.320,  // Hurup Elværk Net
  '5790001089351': 0.310,  // NOE Net
  '5790001089368': 0.310,  // RAH Net
  '5790001089313': 0.320,  // L-Net
  '5790001095093': 0.310,  // Forsyning Elnet
  '5790001089320': 0.284,  // Ikast El Net
  '5790001089382': 0.320,  // Veksel
  '5790001095048': 0.330,  // Midtfyns Elforsyning
  '5790001089290': 0.448,  // Læsø Elnet
};