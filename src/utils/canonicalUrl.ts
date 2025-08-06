/**
 * Canonical URL Management
 * Prevents duplicate content issues by specifying the preferred version of a page
 */

/**
 * Normalizes a URL to its canonical form
 * Removes trailing slashes, query parameters (unless specified), and fragments
 */
export function normalizeUrl(
  url: string,
  options?: {
    removeTrailingSlash?: boolean;
    removeQueryParams?: boolean;
    removeFragment?: boolean;
    forceHttps?: boolean;
  }
): string {
  const {
    removeTrailingSlash = true,
    removeQueryParams = true,
    removeFragment = true,
    forceHttps = true
  } = options || {};

  try {
    const urlObj = new URL(url);
    
    // Force HTTPS if specified
    if (forceHttps && urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }
    
    // Remove query parameters if specified
    if (removeQueryParams) {
      urlObj.search = '';
    }
    
    // Remove fragment if specified
    if (removeFragment) {
      urlObj.hash = '';
    }
    
    let canonical = urlObj.toString();
    
    // Remove trailing slash (except for root path)
    if (removeTrailingSlash && canonical.endsWith('/') && urlObj.pathname !== '/') {
      canonical = canonical.slice(0, -1);
    }
    
    return canonical;
  } catch (error) {
    // If URL parsing fails, return the original URL
    console.warn('Failed to normalize URL:', url, error);
    return url;
  }
}

/**
 * Generates a canonical URL for a given path
 */
export function generateCanonicalUrl(
  path: string,
  baseUrl: string = 'https://elportal.dk'
): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL with path
  const fullUrl = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
  
  // Normalize the URL
  return normalizeUrl(fullUrl);
}

/**
 * Determines if a URL should have a canonical tag
 * Some pages like error pages or temporary pages shouldn't have canonical tags
 */
export function shouldHaveCanonical(path: string): boolean {
  const excludedPaths = [
    '/404',
    '/500',
    '/error',
    '/preview',
    '/admin',
    '/login',
    '/logout'
  ];
  
  return !excludedPaths.some(excluded => path.startsWith(excluded));
}

/**
 * Gets alternate language URLs for international SEO
 * For future use when ElPortal expands to other markets
 */
export function getAlternateUrls(
  path: string,
  locales: Array<{ code: string; domain: string }>
): Array<{ hreflang: string; href: string }> {
  return locales.map(locale => ({
    hreflang: locale.code,
    href: generateCanonicalUrl(path, locale.domain)
  }));
}

/**
 * Injects a canonical link tag into the document head
 */
export function injectCanonicalTag(url: string): void {
  // Remove any existing canonical tags
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    existingCanonical.remove();
  }
  
  // Create and inject new canonical tag
  const canonicalTag = document.createElement('link');
  canonicalTag.rel = 'canonical';
  canonicalTag.href = url;
  document.head.appendChild(canonicalTag);
}

/**
 * Removes canonical tag from the document head
 */
export function removeCanonicalTag(): void {
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.remove();
  }
}

/**
 * Gets the current canonical URL from the document
 */
export function getCurrentCanonical(): string | null {
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  return canonicalTag ? canonicalTag.getAttribute('href') : null;
}

/**
 * Validates if a URL is valid for use as a canonical URL
 */
export function isValidCanonicalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's HTTPS (recommended for canonical URLs)
    if (urlObj.protocol !== 'https:') {
      console.warn('Canonical URL should use HTTPS:', url);
    }
    
    // Check if the hostname is valid
    if (!urlObj.hostname || urlObj.hostname === 'localhost') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Handles pagination canonical URLs
 * For paginated content, the canonical should point to the view-all page or the first page
 */
export function getPaginationCanonical(
  basePath: string,
  currentPage: number,
  hasViewAll: boolean = false
): string {
  if (hasViewAll) {
    // If there's a view-all page, all paginated pages should point to it
    return generateCanonicalUrl(`${basePath}/all`);
  } else if (currentPage === 1) {
    // First page is canonical for itself
    return generateCanonicalUrl(basePath);
  } else {
    // Other pages have their own canonical (could also point to page 1)
    return generateCanonicalUrl(`${basePath}?page=${currentPage}`);
  }
}

/**
 * Handles canonical URLs for filtered/sorted content
 * Important parameters should be included in canonical, others shouldn't
 */
export function getFilteredCanonical(
  basePath: string,
  params: URLSearchParams,
  importantParams: string[] = []
): string {
  const canonicalParams = new URLSearchParams();
  
  // Only include important parameters in canonical URL
  importantParams.forEach(param => {
    const value = params.get(param);
    if (value) {
      canonicalParams.set(param, value);
    }
  });
  
  const queryString = canonicalParams.toString();
  const path = queryString ? `${basePath}?${queryString}` : basePath;
  
  return generateCanonicalUrl(path);
}