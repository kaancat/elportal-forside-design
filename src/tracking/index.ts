/**
 * DinElportal Universal Tracking System
 * 
 * A comprehensive, GDPR-compliant tracking solution for partner websites.
 * 
 * Features:
 * - Auto-capture click_id from URL parameters on ANY page
 * - Multi-storage persistence (localStorage, sessionStorage, cookies, 90 days)
 * - Subdomain traversal and domain-wide tracking
 * - Auto-detect conversion pages by URL patterns
 * - Global API: window.DinElportal.trackConversion()
 * - Device fingerprinting fallback when click_id is lost
 * - Debug mode with comprehensive logging
 * - GDPR compliant - no personal data collection
 * - Handles edge cases: blocked cookies, private browsing, etc.
 * 
 * @version 1.0.0
 * @author DinElportal Team
 */

// ============================================================================
// Main Exports
// ============================================================================

export { UniversalTracker, createGlobalAPI } from './UniversalScript';
export { StorageManager } from './StorageManager';
export { DeviceFingerprint } from './Fingerprint';
export { ConversionDetector } from './ConversionDetector';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core data structures
  StorageData,
  TrackingData,
  ConversionData,
  ConversionEvent,
  
  // Configuration interfaces
  TrackingConfig,
  StorageOptions,
  FingerprintOptions,
  ConversionConfig,
  
  // API interface
  DinElportalAPI,
  
  // Detailed types
  FingerprintData,
  ConversionContext,
  TrackingPayload,
  TrackingError,
  TrackingMetrics,
  PartnerStats,
  PrivacySettings,
  ConsentData,
  BrowserCapabilities,
  BrowserInfo,
  DebugInfo,
  
  // Utility types
  DeepPartial,
  RequiredFields,
  OptionalFields
} from './types';

// ============================================================================
// Default Export - Ready-to-use Tracker Instance
// ============================================================================

import { UniversalTracker } from './UniversalScript';

/**
 * Default tracker instance with production-ready configuration
 * Perfect for most partner implementations
 */
export const tracker = new UniversalTracker({
  endpoint: 'https://dinelportal.dk/api/track',
  clickIdParam: 'click_id',
  cookieDays: 90,
  enableAutoConversion: true,
  enableFingerprinting: true,
  enableFormTracking: true,
  enableButtonTracking: true,
  respectDoNotTrack: true,
  debug: false
});

// ============================================================================
// Quick Setup Functions
// ============================================================================

/**
 * Initialize tracking with minimal configuration
 * Perfect for quick partner integration
 * 
 * @param partnerId - Unique identifier for the partner
 * @param config - Optional configuration overrides
 */
export async function quickSetup(
  partnerId: string, 
  config: Partial<import('./types').TrackingConfig> = {}
): Promise<void> {
  const quickTracker = new UniversalTracker({
    partner_id: partnerId,
    endpoint: 'https://dinelportal.dk/api/track',
    clickIdParam: 'click_id',
    cookieDays: 90,
    enableAutoConversion: true,
    enableFingerprinting: true,
    respectDoNotTrack: true,
    debug: false,
    ...config
  });

  await quickTracker.initialize();
}

/**
 * Initialize tracking with debug mode enabled
 * Perfect for development and testing
 * 
 * @param partnerId - Unique identifier for the partner
 * @param config - Optional configuration overrides
 */
export async function debugSetup(
  partnerId: string, 
  config: Partial<import('./types').TrackingConfig> = {}
): Promise<void> {
  const debugTracker = new UniversalTracker({
    partner_id: partnerId,
    endpoint: 'https://dinelportal.dk/api/track',
    debug: true,
    enableAutoConversion: true,
    enableFingerprinting: true,
    respectDoNotTrack: false, // Allow tracking in debug mode
    ...config
  });

  await debugTracker.initialize();
  console.log('🔍 DinElportal Debug Mode Enabled - Check console for detailed logs');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract click_id from current URL
 * Useful for manual tracking implementations
 */
export function extractClickId(paramName = 'click_id'): string | null {
  try {
    if (typeof URLSearchParams === 'undefined' || typeof location === 'undefined') {
      return null;
    }
    const params = new URLSearchParams(location.search);
    return params.get(paramName);
  } catch (error) {
    console.warn('Failed to extract click_id:', error);
    return null;
  }
}

/**
 * Check if current page matches conversion patterns
 * Useful for manual conversion validation
 */
export function isConversionPage(customPatterns: string[] = []): boolean {
  if (typeof location === 'undefined') return false;
  
  const defaultPatterns = [
    '/thank-you', '/success', '/confirmation', '/complete', '/done',
    '/tak', '/takker', '/bekraeftelse', '/bekraeftet', '/gennemfoert',
    '/succes', '/velgennemfoert', '/ordre-bekraeftelse'
  ];
  
  const allPatterns = [...defaultPatterns, ...customPatterns];
  const pathname = location.pathname.toLowerCase();
  
  return allPatterns.some(pattern => pathname.includes(pattern.toLowerCase()));
}

/**
 * Check if tracking is allowed based on privacy settings
 * Respects Do Not Track and consent requirements
 */
export function isTrackingAllowed(
  respectDoNotTrack = true, 
  requireConsent = false
): boolean {
  // Check Do Not Track
  if (respectDoNotTrack && typeof navigator !== 'undefined') {
    if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
      return false;
    }
  }
  
  // Check consent if required
  if (requireConsent && typeof window !== 'undefined') {
    const consent = (window as any).dinelportal_consent || 
                   (window as any).gtag_consent ||
                   localStorage.getItem('consent') === 'true';
    if (!consent) return false;
  }
  
  return true;
}

/**
 * Generate a simple session ID
 * Useful for custom tracking implementations
 */
export function generateSessionId(): string {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================================
// Version Information
// ============================================================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// ============================================================================
// Browser Compatibility Check
// ============================================================================

export function checkBrowserSupport(): import('./types').BrowserCapabilities {
  return {
    localStorage: typeof Storage !== 'undefined' && !!window.localStorage,
    sessionStorage: typeof Storage !== 'undefined' && !!window.sessionStorage,
    cookies: typeof document !== 'undefined' && navigator.cookieEnabled,
    canvas: typeof HTMLCanvasElement !== 'undefined',
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })(),
    audioContext: typeof window !== 'undefined' && 
                  !!(window.AudioContext || window.webkitAudioContext),
    mutationObserver: typeof MutationObserver !== 'undefined',
    urlSearchParams: typeof URLSearchParams !== 'undefined',
    fetch: typeof fetch !== 'undefined'
  };
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Get comprehensive debug information
 * Perfect for troubleshooting integration issues
 */
export function getDebugInfo(): Partial<import('./types').DebugInfo> {
  try {
    const api = typeof window !== 'undefined' ? (window as any).DinElportal : null;
    
    return {
      version: VERSION,
      initialized: !!api,
      config: api?.getConfig(),
      storage_data: api?.getTrackingData(),
      browser_info: {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor || 'unknown',
        platform: navigator.platform || 'unknown',
        language: navigator.language || 'unknown',
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
        capabilities: checkBrowserSupport()
      } as import('./types').BrowserInfo
    };
  } catch (error) {
    console.error('Failed to get debug info:', error);
    return {
      version: VERSION,
      initialized: false
    };
  }
}

/**
 * Log debug information to console
 * Formatted for easy reading
 */
export function logDebugInfo(): void {
  const info = getDebugInfo();
  console.group('🔍 DinElportal Debug Information');
  console.log('Version:', info.version);
  console.log('Initialized:', info.initialized);
  console.log('Configuration:', info.config);
  console.log('Current Data:', info.storage_data);
  console.log('Browser Info:', info.browser_info);
  console.groupEnd();
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  UniversalTracker,
  tracker,
  quickSetup,
  debugSetup,
  extractClickId,
  isConversionPage,
  isTrackingAllowed,
  generateSessionId,
  checkBrowserSupport,
  getDebugInfo,
  logDebugInfo,
  VERSION,
  BUILD_DATE
};