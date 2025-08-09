/**
 * DAWA (Danmarks Adresse Web API) Autocomplete Service
 * 
 * Official Danish government API for address autocomplete
 * Free, unlimited usage with complete Danish address data
 * 
 * Documentation: https://dawadocs.dataforsyningen.dk/dok/api/autocomplete
 */

export interface DawaAutocompleteResult {
  type: 'vejnavn' | 'adgangsadresse' | 'adresse';
  tekst: string;           // Text to fill in input field
  forslagstekst: string;   // Display text in dropdown
  caretpos: number;        // Cursor position after selection
  data: {
    id: string;
    status: number;
    vejkode: string;
    vejnavn: string;
    husnr: string;
    supplerendebynavn?: string | null;
    postnr: string;
    postnrnavn: string;
    kommunekode: string;
    x: number;              // Longitude
    y: number;              // Latitude
    href: string;           // API link for full details
  };
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
    const { data } = result;
    const parts = [];

    // Add street and number
    if (data.vejnavn && data.husnr) {
      parts.push(`${data.vejnavn} ${data.husnr}`);
    } else if (data.vejnavn) {
      parts.push(data.vejnavn);
    }

    // Add supplementary city name if exists
    if (data.supplerendebynavn) {
      parts.push(data.supplerendebynavn);
    }

    // Add postal code and city
    if (data.postnr && data.postnrnavn) {
      parts.push(`${data.postnr} ${data.postnrnavn}`);
    }

    return parts.join(', ');
  }

  /**
   * Extract postal code from autocomplete result
   * @param result - DAWA autocomplete result
   * @returns Postal code or null
   */
  static extractPostalCode(result: DawaAutocompleteResult): string | null {
    return result.data.postnr || null;
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
    if (result.data.x && result.data.y) {
      return {
        lat: result.data.y,
        lng: result.data.x,
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