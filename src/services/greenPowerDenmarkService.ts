/**
 * Green Power Denmark API Service
 * 
 * Official API for finding Danish electricity grid providers (netselskaber)
 * This API provides accurate, up-to-date grid provider information based on address or postal code
 * 
 * API Documentation: https://elnet.dk/files/media/document/Find-Netselskab-AP-%20beskrivelse.pdf
 */

import type { GridProvider } from '@/types/location';
import { gridProviders } from '@/data/gridProviders';

interface GreenPowerAPIResponse {
  def: string;         // Grid provider code (e.g., "790" for Radius)
  name: string;        // Grid provider name
  phone: string;       // Contact phone number
  website: string;     // Grid provider website
}

// Map Green Power Denmark DEF codes to our internal codes
// Some providers have different codes in our system vs the API
const DEF_CODE_MAPPING: Record<string, string> = {
  '790': '791',  // Radius Elnet A/S
  '553': '543',  // Vores Elnet A/S
  // Most codes match directly, these are the exceptions
};

// Cache for API responses (24 hour TTL)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const apiCache = new Map<string, { data: GreenPowerAPIResponse; timestamp: number }>();

export class GreenPowerDenmarkService {
  private static readonly API_BASE_URL = 'https://api.elnet.greenpowerdenmark.dk/api/supplierlookup';

  /**
   * Look up grid provider by address or postal code
   * @param query - Full address (e.g., "Nørrebrogade 1, 2200 København N") or postal code (e.g., "2200")
   * @returns Grid provider information or null if not found
   */
  static async lookupGridProvider(query: string): Promise<GridProvider | null> {
    // Clean up the query
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      console.warn('Empty query provided to lookupGridProvider');
      return null;
    }

    // Check cache first
    const cached = this.getFromCache(cleanQuery);
    if (cached) {
      return this.mapResponseToGridProvider(cached, cleanQuery);
    }

    try {
      // Make API request
      const encodedQuery = encodeURIComponent(cleanQuery);
      const response = await fetch(`${this.API_BASE_URL}/${encodedQuery}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GreenPowerAPIResponse = await response.json();

      // Validate response
      if (!data || !data.def || !data.name) {
        console.warn('Invalid API response:', data);
        return null;
      }

      // Cache the result
      this.setCache(cleanQuery, data);

      // Map to our GridProvider format
      return this.mapResponseToGridProvider(data, cleanQuery);
    } catch (error) {
      console.error('Error fetching grid provider from Green Power Denmark API:', error);
      
      // For specific known errors, provide helpful feedback
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          console.warn(`Grid provider not found for: ${cleanQuery}`);
        } else if (error.message.includes('network')) {
          console.warn('Network error accessing Green Power Denmark API');
        }
      }
      
      return null;
    }
  }

  /**
   * Map API response to our GridProvider format
   * Now uses gridProviders.ts as the single source of truth for tariffs and GLN
   */
  private static mapResponseToGridProvider(
    apiData: GreenPowerAPIResponse, 
    query: string
  ): GridProvider {
    // Map DEF code to our internal code
    const internalCode = DEF_CODE_MAPPING[apiData.def] || apiData.def;
    
    // Get data from gridProviders.ts (single source of truth)
    const gridProviderData = gridProviders[internalCode];
    
    // If we have data in gridProviders.ts, use it (includes GLN and tariff)
    if (gridProviderData) {
      return {
        ...gridProviderData,
        // Override name with API response (might be more current)
        name: apiData.name,
        // Add extra metadata from API
        phone: apiData.phone,
        website: apiData.website,
        originalDef: apiData.def
      } as GridProvider & { phone?: string; website?: string; originalDef?: string };
    }
    
    // Fallback: create minimal provider without GLN (won't be able to fetch dynamic tariffs)
    // This should rarely happen as gridProviders.ts is comprehensive
    const region = this.determineRegion(apiData.name, query);
    
    return {
      code: internalCode,
      name: apiData.name,
      networkTariff: 0.30, // Regional average fallback
      region,
      // No GLN available - dynamic tariff lookup won't work
      phone: apiData.phone,
      website: apiData.website,
      originalDef: apiData.def
    } as GridProvider & { phone?: string; website?: string; originalDef?: string };
  }

  /**
   * Determine region (DK1/DK2) based on grid provider and location
   */
  private static determineRegion(providerName: string, query: string): 'DK1' | 'DK2' {
    const providerNameLower = providerName.toLowerCase();
    const queryLower = query.toLowerCase();

    // DK2 (East Denmark) providers
    const dk2Providers = [
      'radius', 'cerius', 'vores elnet', 'trefor el-net øst',
      'flow elnet', 'ravdex', 'veksel', 'midtfyns', 'elektrus',
      'nke-elnet', 'zeanet'
    ];

    // DK2 regions/cities
    const dk2Keywords = [
      'københavn', 'copenhagen', 'frederiksberg', 'sjælland', 'zealand',
      'roskilde', 'køge', 'næstved', 'faxe', 'vordingborg', 'guldborgsund',
      'lolland', 'slagelse', 'sorø', 'ringsted', 'holbæk', 'kalundborg',
      'odense', 'svendborg', 'nyborg', 'middelfart', 'assens', 'faaborg',
      'kerteminde', 'langeland', 'ærø', 'bornholm', 'fyn'
    ];

    // Check provider name
    if (dk2Providers.some(p => providerNameLower.includes(p))) {
      return 'DK2';
    }

    // Check location keywords
    if (dk2Keywords.some(k => queryLower.includes(k))) {
      return 'DK2';
    }

    // Check postal codes (rough ranges)
    const postalMatch = query.match(/\b(\d{4})\b/);
    if (postalMatch) {
      const postal = parseInt(postalMatch[1]);
      // DK2 postal code ranges (approximate)
      if ((postal >= 1000 && postal <= 2999) ||  // Copenhagen area
          (postal >= 4000 && postal <= 4999) ||  // Zealand
          (postal >= 5000 && postal <= 5999)) {  // Funen
        return 'DK2';
      }
    }

    // Default to DK1 (West Denmark/Jutland)
    return 'DK1';
  }

  /**
   * Cache management utilities
   */
  private static getFromCache(key: string): GreenPowerAPIResponse | null {
    const cached = apiCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      apiCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private static setCache(key: string, data: GreenPowerAPIResponse): void {
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

  /**
   * Batch lookup for multiple addresses (with rate limiting)
   */
  static async batchLookup(queries: string[]): Promise<(GridProvider | null)[]> {
    const results: (GridProvider | null)[] = [];
    
    for (const query of queries) {
      const result = await this.lookupGridProvider(query);
      results.push(result);
      
      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

export default GreenPowerDenmarkService;