/**
 * Core tracking utilities for DinElportal
 * GDPR-compliant tracking without personal data
 */

// Configuration
export const TRACKING_CONFIG = {
  ATTRIBUTION_WINDOW_DAYS: 90,
  CLICK_ID_PREFIX: 'dep',
  API_ENDPOINTS: {
    TRACK_CLICK: '/api/track-click',
    TRACK_CONVERSION: '/api/track-conversion',
    TRACK_PIXEL: '/api/track-pixel'
  }
} as const;

/**
 * Generate a unique click ID
 * Format: dep_[timestamp]_[random]
 * No personal data included
 */
export function generateClickId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${TRACKING_CONFIG.CLICK_ID_PREFIX}_${timestamp}_${random}`;
}

/**
 * Build tracking parameters for partner URLs
 */
export interface TrackingParams {
  click_id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  ref?: string;
  consumption?: number;
  region?: string;
}

export function buildTrackingParams(context: {
  partner: string;
  component?: string;
  page?: string;
  variant?: string;
  consumption?: number;
  region?: string;
}): TrackingParams {
  const clickId = generateClickId();
  
  return {
    click_id: clickId,
    utm_source: 'dinelportal',
    utm_medium: context.component || 'referral',
    utm_campaign: context.page || 'website',
    utm_content: context.variant,
    ref: 'dinelportal',
    consumption: context.consumption,
    region: context.region
  };
}

/**
 * Add tracking parameters to a URL
 */
export function addTrackingToUrl(
  baseUrl: string, 
  params: TrackingParams
): string {
  try {
    const url = new URL(baseUrl);
    
    // Add all non-undefined parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  } catch (error) {
    console.error('Invalid URL for tracking:', baseUrl, error);
    return baseUrl;
  }
}

/**
 * Track a click event (fire and forget, no await needed)
 */
export function trackClick(
  partner: string,
  clickId: string,
  context: {
    component?: string;
    page?: string;
    variant?: string;
    consumption?: number;
    region?: string;
  }
): void {
  // Don't block user navigation
  const payload = {
    click_id: clickId,
    partner_id: partner,
    timestamp: Date.now(),
    source: {
      page: context.page || window.location.pathname,
      component: context.component,
      variant: context.variant
    },
    metadata: {
      consumption: context.consumption,
      region: context.region
    }
  };

  // Use sendBeacon for reliability (survives page navigation)
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(TRACKING_CONFIG.API_ENDPOINTS.TRACK_CLICK, blob);
  } else {
    // Fallback to fetch
    fetch(TRACKING_CONFIG.API_ENDPOINTS.TRACK_CLICK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(err => {
      console.debug('Click tracking failed (non-critical):', err);
    });
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log('🎯 Click tracked:', {
      partner,
      clickId,
      context
    });
  }
}

/**
 * Get partner slug from provider name
 */
export function getPartnerSlug(providerName: string): string {
  // Normalize provider name to slug
  return providerName
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'aa')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Check if tracking should be enabled
 * Always returns true for click tracking (no consent needed)
 */
export function isTrackingEnabled(): boolean {
  // Click tracking with anonymous IDs doesn't require consent
  return true;
}

/**
 * Create tracking pixel URL
 */
export function createTrackingPixelUrl(clickId: string, event: string = 'conversion', value?: number): string {
  const params = new URLSearchParams({
    click_id: clickId,
    event,
    ...(value !== undefined && { value: String(value) })
  });
  
  return `${TRACKING_CONFIG.API_ENDPOINTS.TRACK_PIXEL}?${params}`;
}

/**
 * Extract click ID from current URL (for partners)
 */
export function getClickIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const clickId = params.get('click_id');
  
  // Validate format
  if (clickId && clickId.startsWith(TRACKING_CONFIG.CLICK_ID_PREFIX + '_')) {
    return clickId;
  }
  
  return null;
}

/**
 * Store click ID in session (for partners)
 */
export function storeClickId(clickId: string): void {
  try {
    sessionStorage.setItem('dinelportal_click_id', clickId);
  } catch (e) {
    // SessionStorage might be blocked
    console.debug('Could not store click ID:', e);
  }
}

/**
 * Retrieve stored click ID (for partners)
 */
export function getStoredClickId(): string | null {
  try {
    return sessionStorage.getItem('dinelportal_click_id');
  } catch (e) {
    return null;
  }
}

/**
 * Clear stored click ID after conversion (for partners)
 */
export function clearClickId(): void {
  try {
    sessionStorage.removeItem('dinelportal_click_id');
  } catch (e) {
    // Ignore
  }
}