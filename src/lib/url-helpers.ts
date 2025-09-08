/**
 * URL Helper Functions for DinElPortal
 * Centralized utilities for canonical URLs, metadata, and branding
 */

// Critical: Correct branding and domain
export const SITE_URL = process.env.SITE_URL || 'https://dinelportal.dk'
export const SITE_DOMAIN = 'dinelportal.dk'
export const SITE_NAME = 'DinElPortal' // Capital E and P

/**
 * Normalize pathname for consistent URL handling
 * - Ensures leading slash
 * - Removes trailing slash except for root
 * - Handles edge cases safely
 */
export function normalizePathname(path: string = '/'): string {
  // Handle empty or null paths
  if (!path) return '/'
  
  // Ensure leading slash
  const withLeading = path.startsWith('/') ? path : `/${path}`
  
  // Root path stays as is
  if (withLeading === '/') return '/'
  
  // Remove trailing slash for all other paths
  return withLeading.endsWith('/') ? withLeading.slice(0, -1) : withLeading
}

/**
 * Generate canonical URL for SEO
 * - Always returns absolute URL
 * - Guards against external URLs
 * - Uses normalized pathname
 */
export function canonicalUrl(pathname: string): string {
  // Guard against absolute URLs to prevent external canonicals
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    console.warn('[url-helpers] Canonical URL received absolute path:', pathname)
    try {
      pathname = new URL(pathname).pathname
    } catch (e) {
      console.error('[url-helpers] Invalid URL in canonicalUrl:', pathname)
      pathname = '/'
    }
  }
  
  const normalized = normalizePathname(pathname)
  return new URL(normalized, SITE_URL).toString()
}

/**
 * Generate metadata URL for OpenGraph/Twitter images
 * - Handles relative and absolute paths
 * - Always returns absolute URL
 */
export function metadataUrl(path: string): string {
  // If already absolute, return as is (but validate domain)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path)
      // Only allow our domain or CDN domains
      const allowedDomains = [SITE_DOMAIN, 'cdn.sanity.io', 'images.unsplash.com']
      if (allowedDomains.some(domain => url.hostname.includes(domain))) {
        return path
      }
      console.warn('[url-helpers] External domain in metadataUrl:', path)
    } catch (e) {
      console.error('[url-helpers] Invalid URL in metadataUrl:', path)
    }
  }
  
  // Build absolute URL from relative path
  return new URL(path, SITE_URL).href
}

/**
 * Check if running in production environment
 * Used for staging safety checks (noindex, robots)
 */
export function isProduction(): boolean {
  return SITE_URL === 'https://dinelportal.dk'
}

/**
 * Get environment-appropriate robots directive
 * - Production: Follow SEO rules
 * - Staging/Dev: Always noindex
 */
export function getRobotsDirective(pageNoIndex?: boolean) {
  if (!isProduction() || pageNoIndex) {
    return { index: false, follow: false }
  }
  return undefined
}

/**
 * Format date for structured data
 * - Returns ISO 8601 format
 * - Handles null/undefined safely
 */
export function formatSchemaDate(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString()
  } catch (e) {
    console.error('[url-helpers] Invalid date for schema:', date)
    return undefined
  }
}

/**
 * Sanitize string for JSON-LD
 * - Escapes dangerous characters
 * - Prevents XSS in structured data
 */
export function sanitizeJsonLd(str: string | null | undefined): string {
  if (!str) return ''
  
  // Replace dangerous characters with unicode equivalents
  return str
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022')
}