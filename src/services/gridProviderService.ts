import { PostalCodeService } from './postalCodeService';
import { GreenPowerDenmarkService } from './greenPowerDenmarkService';
import { gridProviders } from '@/data/gridProviders';
import type { LocationData, GridProvider, ConnectionPoint } from '@/types/location';

// Cache for API responses (24 hour TTL)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const apiCache = new Map<string, { data: any; timestamp: number }>();

export class GridProviderService {
  private static readonly API_BASE_URL = 'https://api.energidataservice.dk/dataset';

  /**
   * Get complete location data by postal code or address
   * @param query - Postal code (e.g., "2200") or full address (e.g., "Nørrebrogade 1, 2200 København N")
   */
  static async getLocationByQuery(query: string): Promise<LocationData | null> {
    // Extract postal code from query if it's an address
    const postalCodeMatch = query.match(/\b(\d{4})\b/);
    const postalCode = postalCodeMatch ? postalCodeMatch[1] : query;

    // Validate postal code
    if (!PostalCodeService.isValidPostalCode(postalCode)) {
      console.warn(`Invalid postal code in query: ${query}`);
      return PostalCodeService.getDefaultLocation();
    }

    // Get municipality from postal code
    const municipality = PostalCodeService.getMunicipalityByPostalCode(postalCode);
    if (!municipality) {
      console.warn(`Municipality not found for postal code: ${postalCode}`);
      return PostalCodeService.getDefaultLocation();
    }

    // Try Green Power Denmark API first (most accurate)
    let gridProvider = await GreenPowerDenmarkService.lookupGridProvider(query);
    
    // Fallback to static data if API fails
    if (!gridProvider) {
      console.warn(`Green Power Denmark API failed for: ${query}, falling back to static data`);
      gridProvider = PostalCodeService.getGridProviderByPostalCode(postalCode);
    }

    if (!gridProvider) {
      console.warn(`Grid provider not found for query: ${query}`);
      return PostalCodeService.getDefaultLocation();
    }

    return {
      postalCode,
      municipality,
      gridProvider,
      region: gridProvider.region || municipality.region
    };
  }

  /**
   * Get complete location data by postal code (legacy method for backwards compatibility)
   */
  static async getLocationByPostalCode(postalCode: string): Promise<LocationData | null> {
    return this.getLocationByQuery(postalCode);
  }

  /**
   * DEPRECATED: This method used EnergiDataService API which returns incorrect data
   * Use GreenPowerDenmarkService instead
   * @deprecated
   */
  private static async getGridProviderFromAPI_DEPRECATED(municipality: string): Promise<GridProvider | null> {
    // This method is kept for reference but should not be used
    // The EnergiDataService ConnectionPointsInGrid API returns incorrect grid providers
    // For example, it returns "Elnet Midt" for Copenhagen postal codes
    console.warn('DEPRECATED: EnergiDataService API returns incorrect data. Use GreenPowerDenmarkService instead.');
    return null;
  }

  /**
   * Map NetCompany name from API to our grid provider data
   */
  private static mapNetCompanyToProvider(netCompanyName: string, municipality: string): GridProvider | null {
    // Clean up the name for matching
    const cleanName = netCompanyName.toLowerCase().trim();
    
    // Find matching provider in our data
    for (const provider of Object.values(gridProviders)) {
      const providerName = provider.name.toLowerCase();
      
      // Direct match
      if (providerName === cleanName) {
        return provider;
      }
      
      // Partial match (e.g., "N1" in "N1 A/S - 131")
      if (providerName.includes(cleanName.split(' ')[0]) || cleanName.includes(providerName.split(' ')[0])) {
        return provider;
      }
    }

    // If no match found, create a generic provider
    console.warn(`Unknown NetCompany: ${netCompanyName}`);
    const region = this.determineRegionByMunicipality(municipality);
    
    return {
      code: '999',
      name: netCompanyName,
      gln: '0000000000000', // Generic GLN
      networkTariff: 0.30, // Average tariff
      chargeCode: 'DT_C_01', // Generic charge code
      region,
      municipalities: [municipality]
    } as GridProvider;
  }

  /**
   * Determine region based on municipality name
   */
  private static determineRegionByMunicipality(municipality: string): 'DK1' | 'DK2' {
    const eastDenmarkMunicipalities = [
      'københavn', 'frederiksberg', 'gentofte', 'lyngby', 'gladsaxe',
      'helsingør', 'hillerød', 'roskilde', 'køge', 'næstved', 'faxe',
      'vordingborg', 'guldborgsund', 'lolland', 'slagelse', 'sorø',
      'ringsted', 'holbæk', 'kalundborg', 'odsherred', 'stevns',
      'odense', 'svendborg', 'nyborg', 'middelfart', 'assens',
      'faaborg', 'kerteminde', 'langeland', 'ærø', 'bornholm'
    ];

    const municipalityLower = municipality.toLowerCase();
    return eastDenmarkMunicipalities.some(m => municipalityLower.includes(m)) ? 'DK2' : 'DK1';
  }

  /**
   * Get network tariff for a specific grid provider
   */
  static async getNetworkTariff(gridProviderCode: string): Promise<number> {
    // Check if we have it in our static data
    const provider = gridProviders[gridProviderCode as keyof typeof gridProviders];
    if (provider) {
      return provider.networkTariff;
    }

    // TODO: In the future, fetch from DatahubPricelist API
    // For now, return average tariff
    return 0.30;
  }

  /**
   * Get all grid providers for a municipality (handles edge cases with multiple DSOs)
   */
  static async getGridProvidersForMunicipality(municipality: string): Promise<GridProvider[]> {
    const cacheKey = `grid-providers-all-${municipality}`;
    
    // Check cache
    const cached = this.getFromCache<GridProvider[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/ConnectionPointsInGrid?` +
        `filter={"Municipality":"${encodeURIComponent(municipality)}"}&limit=100`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const records = data.records || [];

      // Get unique NetCompanies
      const uniqueCompanies = new Set<string>();
      records.forEach((record: ConnectionPoint) => {
        if (record.NetCompanyName) {
          uniqueCompanies.add(record.NetCompanyName);
        }
      });

      // Map to providers
      const providers: GridProvider[] = [];
      uniqueCompanies.forEach(company => {
        const provider = this.mapNetCompanyToProvider(company, municipality);
        if (provider) {
          providers.push(provider);
        }
      });

      // Cache the result
      if (providers.length > 0) {
        this.setCache(cacheKey, providers);
      }

      return providers;
    } catch (error) {
      console.error('Error fetching grid providers from API:', error);
      
      // Fallback to static data
      const fallbackProviders: GridProvider[] = [];
      for (const provider of Object.values(gridProviders)) {
        if (provider.municipalities.some(m => m.toLowerCase() === municipality.toLowerCase())) {
          fallbackProviders.push(provider);
        }
      }
      
      return fallbackProviders;
    }
  }

  /**
   * Cache management utilities
   */
  private static getFromCache<T>(key: string): T | null {
    const cached = apiCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      apiCache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private static setCache(key: string, data: any): void {
    apiCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    apiCache.clear();
  }
}