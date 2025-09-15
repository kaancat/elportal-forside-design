/**
 * Environment variable helper for Next.js
 * Uses NEXT_PUBLIC_* for public config exposed to the browser.
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
 * Get environment variable consistently in server and browser.
 * Handles ONLY NEXT_PUBLIC_* keys on the client.
 */
function getEnvVar(nextKey: string): string | undefined {
  const nextValue = process.env[nextKey];
  if (nextValue) return nextValue;
  if (typeof window !== 'undefined') {
    // @ts-ignore - accessing dynamic env vars in client context
    const windowNextValue = window.process?.env?.[nextKey];
    if (windowNextValue) return windowNextValue;
  }
  return undefined;
}

/**
 * Robust boolean parsing for env flags.
 * Accepts: true/false, 1/0, yes/no, on/off (case-insensitive, trims whitespace).
 * Any other value returns the provided default.
 */
export function parseBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return defaultValue
  const v = value.trim().toLowerCase()
  if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true
  if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false
  return defaultValue
}

/**
 * Read a boolean env flag consistently across server/client.
 * Uses `getEnvVar` so NEXT_PUBLIC_* works in browser too.
 */
export function envBool(key: string, defaultValue = false): boolean {
  const raw = getEnvVar(key)
  return parseBoolean(raw, defaultValue)
}

/**
 * Centralized environment configuration
 * Provides type-safe access to environment variables
 */
export const env: EnvConfig = {
  // Sanity Configuration
  SANITY_PROJECT_ID: getEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID') || 'yxesi03x',
  SANITY_DATASET: getEnvVar('NEXT_PUBLIC_SANITY_DATASET') || 'production',
  SANITY_API_VERSION: getEnvVar('NEXT_PUBLIC_SANITY_API_VERSION') || '2025-01-01',
  
  // URLs
  SITE_URL: getEnvVar('SITE_URL') || 
            (typeof window !== 'undefined' ? window.location.origin : 'https://elportal.dk'),
  
  // Optional Analytics
  COOKIEBOT_ID: getEnvVar('NEXT_PUBLIC_COOKIEBOT_ID'),
  GA4_MEASUREMENT_ID: getEnvVar('NEXT_PUBLIC_GA4_MEASUREMENT_ID'),
  FB_PIXEL_ID: getEnvVar('NEXT_PUBLIC_FB_PIXEL_ID'),
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

// Export for backward compatibility with existing code
export default env;
