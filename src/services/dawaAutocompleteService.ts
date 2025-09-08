/**
 * DAWA (Danmarks Adresse Web API) Autocomplete Service
 * 
 * Official Danish government API for address autocomplete
 * Free, unlimited usage with complete Danish address data
 * 
 * Documentation: https://dawadocs.dataforsyningen.dk/dok/api/autocomplete
 */

// Different data structures based on suggestion type
interface VejnavnData {
  navn: string;
  href: string;
}

interface AdresseData {
  id: string;
  status?: number;
  vejkode?: string;
  vejnavn?: string;
  husnr?: string;
  etage?: string;          // Floor (e.g., "1", "st")
  dør?: string;            // Door (e.g., "th", "tv", "mf")
  supplerendebynavn?: string | null;
  postnr?: string;
  postnrnavn?: string;
  kommunekode?: string;
  x?: number;              // Longitude
  y?: number;              // Latitude
  href: string;           // API link for full details
}

export interface DawaAutocompleteResult {
  type: 'vejnavn' | 'adgangsadresse' | 'adresse';
  tekst: string;           // Text to fill in input field
  forslagstekst: string;   // Display text in dropdown
  caretpos: number;        // Cursor position after selection
  data: VejnavnData | AdresseData;
  stormodtagerpostnr?: boolean;
}

export class DawaAutocompleteService {
  private static readonly API_BASE_URL = 'https://api.dataforsyningen.dk/autocomplete';
  private static abortController: AbortController | null = null;

  /**
   * Search for Danish addresses with autocomplete
   * @param query - The search text entered by user
   * @param options - Additional search options
   * @returns Array of autocomplete suggestions
   */
  static async search(
    query: string,
    options?: {
      caretpos?: number;      // Cursor position in input
      fuzzy?: boolean;        // Enable fuzzy matching for typos
      postnr?: string;        // Filter by postal code
      kommunekode?: string;   // Filter by municipality code
      limit?: number;         // Max number of results
    }
  ): Promise<DawaAutocompleteResult[]> {
    // Cancel any pending request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Don't search for very short queries
    if (query.length < 2) {
      return [];
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    try {
      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        caretpos: (options?.caretpos ?? query.length).toString(),
      });

      // Add optional parameters
      if (options?.fuzzy !== false) {
        params.append('fuzzy', ''); // Enable fuzzy by default
      }
      if (options?.postnr) {
        params.append('postnr', options.postnr);
      }
      if (options?.kommunekode) {
        params.append('kommunekode', options.kommunekode);
      }

      // Make API request
      const response = await fetch(`${this.API_BASE_URL}?${params}`, {
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: DawaAutocompleteResult[] = await response.json();

      // Limit results if specified
      if (options?.limit && data.length > options.limit) {
        return data.slice(0, options.limit);
      }

      return data;
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return [];
      }
      
      console.error('DAWA autocomplete error:', error);
      return [];
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Format autocomplete result for display
   * @param result - DAWA autocomplete result
   * @returns Formatted display string
   */
  static formatResult(result: DawaAutocompleteResult): string {
    const { data, type } = result;
    
    // Handle street name suggestions
    if (type === 'vejnavn') {
      return (data as VejnavnData).navn || result.forslagstekst;
    }
    
    // Handle address suggestions
    const addressData = data as AdresseData;
    const parts: string[] = [];

    // Add street, number, and door information
    if (addressData.vejnavn && addressData.husnr) {
      let addressPart = `${addressData.vejnavn} ${addressData.husnr}`;
      
      // Add floor and door if present (e.g., "1.th", "st.tv")
      if (addressData.etage || addressData.dør) {
        const doorPart = [addressData.etage, addressData.dør].filter(Boolean).join('.');
        addressPart += `, ${doorPart}`;
      }
      
      parts.push(addressPart);
    } else if (addressData.vejnavn) {
      parts.push(addressData.vejnavn);
    }

    // Add supplementary city name if exists
    if (addressData.supplerendebynavn) {
      parts.push(addressData.supplerendebynavn);
    }

    // Add postal code and city
    if (addressData.postnr && addressData.postnrnavn) {
      parts.push(`${addressData.postnr} ${addressData.postnrnavn}`);
    }

    return parts.join(', ') || result.forslagstekst;
  }

  /**
   * Extract postal code from autocomplete result
   * @param result - DAWA autocomplete result
   * @returns Postal code or null
   */
  static extractPostalCode(result: DawaAutocompleteResult): string | null {
    if (result.type === 'vejnavn') {
      return null;
    }
    return (result.data as AdresseData).postnr || null;
  }

  /**
   * Extract full address from autocomplete result
   * @param result - DAWA autocomplete result
   * @returns Full address string
   */
  static extractFullAddress(result: DawaAutocompleteResult): string {
    // Use the tekst field which is formatted for input fields
    return result.tekst.replace(/\s*,\s*,\s*/g, ', ').trim();
  }

  /**
   * Get coordinates from autocomplete result
   * @param result - DAWA autocomplete result
   * @returns Coordinates object or null
   */
  static extractCoordinates(result: DawaAutocompleteResult): { lat: number; lng: number } | null {
    if (result.type === 'vejnavn') {
      return null;
    }
    const addressData = result.data as AdresseData;
    if (addressData.x && addressData.y) {
      return {
        lat: addressData.y,
        lng: addressData.x,
      };
    }
    return null;
  }

  /**
   * Cancel any pending autocomplete request
   */
  static cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export default DawaAutocompleteService;