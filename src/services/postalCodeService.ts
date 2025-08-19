import postalCodeData from '@/data/postalCodeMunicipality.json';
import { getGridProviderByMunicipality } from '@/data/gridProviders';
import type { PostalCode, Municipality, GridProvider } from '@/types/location';

interface PostalCodeEntry {
  municipality: string;
  region: 'DK1' | 'DK2';
}

const postalCodes = postalCodeData as Record<string, PostalCodeEntry>;

export class PostalCodeService {
  /**
   * Validate if a postal code is valid Danish postal code
   */
  static isValidPostalCode(postalCode: string): boolean {
    // Danish postal codes are 4 digits
    if (!/^\d{4}$/.test(postalCode)) {
      return false;
    }
    
    return postalCode in postalCodes;
  }

  /**
   * Get municipality by postal code
   */
  static getMunicipalityByPostalCode(postalCode: string): Municipality | null {
    if (!this.isValidPostalCode(postalCode)) {
      return null;
    }

    const data = postalCodes[postalCode];
    return {
      name: data.municipality,
      code: postalCode,
      region: data.region
    };
  }

  /**
   * Get region (DK1/DK2) by postal code
   */
  static getRegionByPostalCode(postalCode: string): 'DK1' | 'DK2' | null {
    if (!this.isValidPostalCode(postalCode)) {
      return null;
    }

    return postalCodes[postalCode].region;
  }

  /**
   * Get grid provider by postal code
   */
  static getGridProviderByPostalCode(postalCode: string): GridProvider | null {
    const municipality = this.getMunicipalityByPostalCode(postalCode);
    if (!municipality) {
      return null;
    }

    const provider = getGridProviderByMunicipality(municipality.name);
    if (!provider) {
      // Default fallback
      return {
        code: '999',
        name: 'Unknown Grid Provider',
        gln: '0000000000000',
        networkTariff: 0.30, // Average tariff
        chargeCode: 'DT_C_01',
        region: municipality.region,
        municipalities: [municipality.name]
      } as GridProvider;
    }

    return provider;
  }

  /**
   * Search for postal codes by partial match
   */
  static searchPostalCodes(query: string, limit: number = 10): PostalCode[] {
    const results: PostalCode[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const [code, data] of Object.entries(postalCodes)) {
      if (code.startsWith(query) || data.municipality.toLowerCase().includes(searchTerm)) {
        results.push({
          code,
          municipality: data.municipality,
          region: data.region
        });
        
        if (results.length >= limit) {
          break;
        }
      }
    }
    
    return results;
  }

  /**
   * Get all postal codes for a municipality
   */
  static getPostalCodesByMunicipality(municipality: string): string[] {
    const codes: string[] = [];
    const municipalityLower = municipality.toLowerCase();
    
    for (const [code, data] of Object.entries(postalCodes)) {
      if (data.municipality.toLowerCase() === municipalityLower) {
        codes.push(code);
      }
    }
    
    return codes;
  }

  /**
   * Get default location (Copenhagen)
   */
  static getDefaultLocation() {
    return {
      postalCode: '2100',
      municipality: this.getMunicipalityByPostalCode('2100')!,
      gridProvider: this.getGridProviderByPostalCode('2100')!,
      region: 'DK2' as const
    };
  }
}