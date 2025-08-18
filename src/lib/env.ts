/**
 * Environment variable helper for Next.js migration
 * Provides backward compatibility with Vite environment variables
 * while supporting Next.js public variables
 */

interface EnvConfig {
  // Sanity Configuration
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_API_VERSION: string;
  
  // URLs
  SITE_URL: string;
  
  // Optional Analytics
  COOKIEBOT_ID?: string;
  GA4_MEASUREMENT_ID?: string;
  FB_PIXEL_ID?: string;
}

/**
 * Get environment variable with fallback to Vite format
 * Handles both NEXT_PUBLIC_* and VITE_* prefixes
 */
function getEnvVar(nextKey: string, viteKey: string): string | undefined {
  // Try Next.js format first
  const nextValue = process.env[nextKey];
  if (nextValue) return nextValue;
  
  // Fallback to Vite format for backward compatibility
  const viteValue = process.env[viteKey];
  if (viteValue) return viteValue;
  
  // For client-side, check window object (runtime injection)
  if (typeof window !== 'undefined') {
    // @ts-ignore - accessing dynamic env vars
    const windowNextValue = window.process?.env?.[nextKey];
    if (windowNextValue) return windowNextValue;
    
    // @ts-ignore - accessing dynamic env vars
    const windowViteValue = window.process?.env?.[viteKey];
    if (windowViteValue) return windowViteValue;
  }
  
  return undefined;
}

/**
 * Centralized environment configuration
 * Provides type-safe access to environment variables
 */
export const env: EnvConfig = {
  // Sanity Configuration
  SANITY_PROJECT_ID: getEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID', 'VITE_SANITY_PROJECT_ID') || 'yxesi03x',
  SANITY_DATASET: getEnvVar('NEXT_PUBLIC_SANITY_DATASET', 'VITE_SANITY_DATASET') || 'production',
  SANITY_API_VERSION: getEnvVar('NEXT_PUBLIC_SANITY_API_VERSION', 'VITE_SANITY_API_VERSION') || '2025-01-01',
  
  // URLs
  SITE_URL: getEnvVar('SITE_URL', 'VITE_SITE_URL') || 
            (typeof window !== 'undefined' ? window.location.origin : 'https://elportal.dk'),
  
  // Optional Analytics
  COOKIEBOT_ID: getEnvVar('NEXT_PUBLIC_COOKIEBOT_ID', 'VITE_COOKIEBOT_ID'),
  GA4_MEASUREMENT_ID: getEnvVar('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'VITE_GA4_MEASUREMENT_ID'),
  FB_PIXEL_ID: getEnvVar('NEXT_PUBLIC_FB_PIXEL_ID', 'VITE_FB_PIXEL_ID'),
};

/**
 * Validate required environment variables
 * Call this during app initialization to ensure all required vars are set
 */
export function validateEnv(): void {
  const required: (keyof EnvConfig)[] = [
    'SANITY_PROJECT_ID',
    'SANITY_DATASET',
    'SANITY_API_VERSION',
  ];
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    console.warn('Application may not function correctly');
  }
}

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Helper to check if we're running in Next.js context
 */
export const isNextJs = typeof process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'undefined';

/**
 * Helper to check if we're running in Vite context
 */
export const isVite = typeof process.env.VITE_SANITY_PROJECT_ID !== 'undefined';

// Export for backward compatibility with existing code
export default env;