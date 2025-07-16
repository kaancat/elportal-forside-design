import simplify from 'simplify-js';

export interface Point {
  x: number;
  y: number;
}

export interface SimplifyOptions {
  tolerance?: number;
  highQuality?: boolean;
}

/**
 * Simplify GeoJSON geometry using Douglas-Peucker algorithm
 * @param geojson - GeoJSON object with features
 * @param options - Simplification options
 * @returns Simplified GeoJSON object
 */
export function simplifyGeoJSON(geojson: any, options: SimplifyOptions = {}): any {
  const { tolerance = 0.001, highQuality = false } = options;
  
  if (!geojson || !geojson.features) {
    return geojson;
  }

  const simplifiedFeatures = geojson.features.map((feature: any) => {
    if (!feature.geometry) return feature;

    const simplifiedGeometry = simplifyGeometry(feature.geometry, tolerance, highQuality);
    
    return {
      ...feature,
      geometry: simplifiedGeometry
    };
  });

  return {
    ...geojson,
    features: simplifiedFeatures
  };
}

/**
 * Simplify individual geometry based on type
 */
function simplifyGeometry(geometry: any, tolerance: number, highQuality: boolean): any {
  switch (geometry.type) {
    case 'Polygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((ring: number[][]) => 
          simplifyCoordinateArray(ring, tolerance, highQuality)
        )
      };
    
    case 'MultiPolygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon: number[][][]) =>
          polygon.map((ring: number[][]) => 
            simplifyCoordinateArray(ring, tolerance, highQuality)
          )
        )
      };
    
    case 'LineString':
      return {
        ...geometry,
        coordinates: simplifyCoordinateArray(geometry.coordinates, tolerance, highQuality)
      };
    
    case 'MultiLineString':
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((line: number[][]) =>
          simplifyCoordinateArray(line, tolerance, highQuality)
        )
      };
    
    default:
      // Point, MultiPoint, and other geometries don't need simplification
      return geometry;
  }
}

/**
 * Simplify coordinate array using simplify-js
 */
function simplifyCoordinateArray(coordinates: number[][], tolerance: number, highQuality: boolean): number[][] {
  if (coordinates.length < 3) return coordinates;
  
  // Convert coordinates to Point format for simplify-js
  const points: Point[] = coordinates.map(coord => ({
    x: coord[0], // longitude
    y: coord[1]  // latitude
  }));
  
  // Apply Douglas-Peucker simplification
  const simplified = simplify(points, tolerance, highQuality);
  
  // Convert back to coordinate format
  return simplified.map(point => [point.x, point.y]);
}

/**
 * Get recommended tolerance based on zoom level or map scale
 */
export function getRecommendedTolerance(zoomLevel?: number, mapScale?: number): number {
  // For Danish municipalities, these tolerances work well:
  // - High detail: 0.0001 (≈11 meters)
  // - Medium detail: 0.001 (≈111 meters, city block)
  // - Low detail: 0.01 (≈1.1 km)
  
  if (zoomLevel !== undefined) {
    if (zoomLevel > 10) return 0.0001; // High zoom - high detail
    if (zoomLevel > 7) return 0.001;   // Medium zoom - medium detail
    return 0.01;                       // Low zoom - low detail
  }
  
  if (mapScale !== undefined) {
    if (mapScale > 3000) return 0.0001;
    if (mapScale > 1000) return 0.001;
    return 0.01;
  }
  
  // Default tolerance for Danish municipalities
  return 0.001;
}

/**
 * Cache key generator for simplified geometries
 */
export function generateCacheKey(url: string, tolerance: number): string {
  return `geojson_${btoa(url)}_${tolerance}`;
}

/**
 * Load and cache simplified GeoJSON
 */
export async function loadAndSimplifyGeoJSON(url: string, options: SimplifyOptions = {}): Promise<any> {
  const { tolerance = 0.001, highQuality = false } = options;
  const cacheKey = generateCacheKey(url, tolerance);
  
  // Check localStorage cache first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        if (Date.now() - parsedCache.timestamp < 3600000) {
          return parsedCache.data;
        }
      } catch (e) {
        // Invalid cache, remove it
        localStorage.removeItem(cacheKey);
      }
    }
  }
  
  // Fetch fresh data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.status}`);
  }
  
  const geojson = await response.json();
  const simplified = simplifyGeoJSON(geojson, { tolerance, highQuality });
  
  // Cache the result
  if (typeof window !== 'undefined') {
    try {
      const cacheData = {
        data: simplified,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      // Storage quota exceeded, ignore
      console.warn('Failed to cache simplified GeoJSON:', e);
    }
  }
  
  return simplified;
}