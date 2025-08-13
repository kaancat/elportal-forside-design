/**
 * DinElportal Universal Tracking Script
 * 
 * One-line embed script for partner websites
 * Features:
 * - Auto-capture click_id from URL parameters
 * - Multi-storage persistence (localStorage, sessionStorage, cookies)
 * - Auto-detect conversion pages
 * - Device fingerprinting fallback
 * - Global API: window.DinElportal.trackConversion()
 * - GDPR compliant
 * - Handles all edge cases (blocked cookies, private browsing, etc.)
 * 
 * Usage:
 * <script src="https://dinelportal.dk/tracking.js" async></script>
 */

import { StorageManager, StorageData } from './StorageManager';
import { DeviceFingerprint } from './Fingerprint';
import { ConversionDetector, ConversionEvent } from './ConversionDetector';

// Types for the global API
export interface TrackingData {
  click_id?: string;
  fingerprint?: string;
  session_id: string;
  page_url: string;
  referrer: string;
  timestamp: number;
  user_agent: string;
}

export interface ConversionData {
  click_id?: string;
  fingerprint?: string;
  session_id: string;
  conversion_type: string;
  conversion_value?: number;
  conversion_currency?: string;
  page_url: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TrackingConfig {
  // API endpoint for sending data
  endpoint?: string;
  // Partner identification
  partner_id?: string;
  partner_domain?: string;
  // Click ID parameter name
  clickIdParam?: string;
  // Storage configuration
  cookieDays?: number;
  domain?: string;
  // Feature toggles
  enableAutoConversion?: boolean;
  enableFingerprinting?: boolean;
  enableFormTracking?: boolean;
  enableButtonTracking?: boolean;
  // Custom conversion patterns
  conversionPatterns?: string[];
  // Debug mode
  debug?: boolean;
  // GDPR compliance
  respectDoNotTrack?: boolean;
  requireConsent?: boolean;
}

export interface DinElportalAPI {
  trackConversion: (data?: Partial<ConversionData>) => Promise<boolean>;
  getTrackingData: () => TrackingData | null;
  clearData: () => void;
  setConfig: (config: Partial<TrackingConfig>) => void;
  getConfig: () => TrackingConfig;
  debug: (enabled: boolean) => void;
  version: string;
}

class UniversalTracker {
  private config: TrackingConfig;
  private storageManager: StorageManager;
  private fingerprinter: DeviceFingerprint;
  private conversionDetector: ConversionDetector;
  private initialized = false;
  private debug = false;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = {
      endpoint: 'https://dinelportal.dk/api/track',
      partner_id: this.extractPartnerIdFromScript() || 'unknown',
      partner_domain: typeof location !== 'undefined' ? location.hostname : 'unknown',
      clickIdParam: 'click_id',
      cookieDays: 90,
      domain: this.getDomain(),
      enableAutoConversion: true,
      enableFingerprinting: true,
      enableFormTracking: true,
      enableButtonTracking: true,
      conversionPatterns: [],
      debug: false,
      respectDoNotTrack: true,
      requireConsent: false,
      ...config
    };

    this.debug = this.config.debug || false;

    // Initialize components
    this.storageManager = new StorageManager({
      cookieDays: this.config.cookieDays,
      domain: this.config.domain,
      debug: this.debug
    });

    this.fingerprinter = new DeviceFingerprint({
      debug: this.debug
    });

    this.conversionDetector = new ConversionDetector({
      urlPatterns: this.config.conversionPatterns,
      enableFormDetection: this.config.enableFormTracking,
      enableButtonDetection: this.config.enableButtonTracking,
      debug: this.debug
    });
  }

  /**
   * Initialize tracking system
   */
  public async initialize(): Promise<void> {
    try {
      if (this.initialized) return;

      this.log('Initializing DinElportal Universal Tracker');

      // Check GDPR compliance
      if (!this.isTrackingAllowed()) {
        this.log('Tracking not allowed (DNT or consent required)');
        return;
      }

      // Capture click_id from URL
      const urlClickId = this.extractClickIdFromUrl();
      
      // Get or generate tracking data
      let trackingData = this.storageManager.getData();
      
      if (!trackingData || this.shouldRefreshData(trackingData, urlClickId)) {
        trackingData = await this.createTrackingData(urlClickId);
        this.storageManager.storeData(trackingData);
      }

      // Initialize conversion detection
      if (this.config.enableAutoConversion) {
        this.conversionDetector.initialize();
        
        // Check for immediate conversion
        const conversion = this.conversionDetector.checkCurrentPage();
        if (conversion) {
          await this.handleConversion(conversion);
        }
      }

      this.initialized = true;
      this.log('Tracking initialized successfully', trackingData);

      // Send initial tracking event
      await this.sendTrackingData(trackingData);

    } catch (error) {
      this.log('Error initializing tracker:', error);
    }
  }

  /**
   * Track conversion manually
   */
  public async trackConversion(data: Partial<ConversionData> = {}): Promise<boolean> {
    try {
      const trackingData = this.storageManager.getData();
      if (!trackingData) {
        this.log('No tracking data available for conversion');
        return false;
      }

      const conversionData: ConversionData = {
        click_id: trackingData.click_id,
        fingerprint: trackingData.fingerprint,
        session_id: trackingData.session_id,
        conversion_type: 'manual',
        page_url: typeof location !== 'undefined' ? location.href : '',
        timestamp: Date.now(),
        ...data
      };

      const success = await this.sendConversionData(conversionData);
      this.log('Manual conversion tracked:', conversionData, 'Success:', success);
      
      return success;
    } catch (error) {
      this.log('Error tracking conversion:', error);
      return false;
    }
  }

  /**
   * Get current tracking data
   */
  public getTrackingData(): TrackingData | null {
    const data = this.storageManager.getData();
    if (!data) return null;

    return {
      click_id: data.click_id,
      fingerprint: data.fingerprint,
      session_id: data.session_id,
      page_url: data.page_url || '',
      referrer: data.referrer || '',
      timestamp: data.timestamp,
      user_agent: data.user_agent || ''
    };
  }

  /**
   * Clear all tracking data
   */
  public clearData(): void {
    this.storageManager.clear();
    this.conversionDetector.clearDetectedConversions();
    this.log('All tracking data cleared');
  }

  /**
   * Update configuration
   */
  public setConfig(newConfig: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debug = this.config.debug || false;
    this.log('Configuration updated:', newConfig);
  }

  /**
   * Get current configuration
   */
  public getConfig(): TrackingConfig {
    return { ...this.config };
  }

  /**
   * Toggle debug mode
   */
  public setDebug(enabled: boolean): void {
    this.debug = enabled;
    this.config.debug = enabled;
    this.log('Debug mode:', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.conversionDetector.cleanup();
    this.initialized = false;
    this.log('Tracker cleaned up');
  }

  // Private methods

  private async createTrackingData(clickId?: string): Promise<StorageData> {
    const data: StorageData = {
      session_id: this.storageManager.getOrCreateSessionId(),
      timestamp: Date.now(),
      source: clickId ? 'url' : 'generated',
      page_url: typeof location !== 'undefined' ? location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    if (clickId) {
      data.click_id = clickId;
    }

    if (this.config.enableFingerprinting) {
      try {
        data.fingerprint = await this.fingerprinter.generate();
      } catch (error) {
        this.log('Fingerprinting failed:', error);
      }
    }

    return data;
  }

  private shouldRefreshData(existing: StorageData, newClickId?: string): boolean {
    // Refresh if we have a new click_id
    if (newClickId && newClickId !== existing.click_id) {
      return true;
    }

    // Refresh if data is too old (90 days)
    const maxAge = 90 * 24 * 60 * 60 * 1000;
    if (this.storageManager.isExpired(existing, maxAge)) {
      return true;
    }

    return false;
  }

  private async handleConversion(conversion: ConversionEvent): Promise<void> {
    try {
      const trackingData = this.storageManager.getData();
      if (!trackingData) return;

      const conversionData: ConversionData = {
        click_id: trackingData.click_id,
        fingerprint: trackingData.fingerprint,
        session_id: trackingData.session_id,
        conversion_type: conversion.type,
        page_url: conversion.page_url,
        timestamp: conversion.timestamp,
        metadata: {
          ...conversion.metadata,
          confidence: conversion.confidence,
          method: conversion.method
        }
      };

      await this.sendConversionData(conversionData);
      this.log('Auto conversion tracked:', conversionData);
    } catch (error) {
      this.log('Error handling conversion:', error);
    }
  }

  private async sendTrackingData(data: StorageData): Promise<boolean> {
    try {
      const payload = {
        type: 'track',
        partner_id: this.config.partner_id,
        partner_domain: this.config.partner_domain,
        data: {
          click_id: data.click_id,
          fingerprint: data.fingerprint,
          session_id: data.session_id,
          page_url: data.page_url,
          referrer: data.referrer,
          user_agent: data.user_agent,
          timestamp: data.timestamp
        }
      };

      const response = await this.sendToEndpoint(payload);
      return response.ok;
    } catch (error) {
      this.log('Error sending tracking data:', error);
      return false;
    }
  }

  private async sendConversionData(data: ConversionData): Promise<boolean> {
    try {
      const payload = {
        type: 'conversion',
        partner_id: this.config.partner_id,
        partner_domain: this.config.partner_domain,
        data
      };

      const response = await this.sendToEndpoint(payload);
      return response.ok;
    } catch (error) {
      this.log('Error sending conversion data:', error);
      return false;
    }
  }

  private async sendToEndpoint(payload: any): Promise<Response> {
    const endpoint = this.config.endpoint!;
    
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    });
  }

  private extractClickIdFromUrl(): string | null {
    try {
      if (typeof URLSearchParams === 'undefined' || typeof location === 'undefined') {
        return null;
      }

      const params = new URLSearchParams(location.search);
      return params.get(this.config.clickIdParam!) || null;
    } catch (error) {
      this.log('Error extracting click_id from URL:', error);
      return null;
    }
  }

  private extractPartnerIdFromScript(): string | null {
    try {
      if (typeof document === 'undefined') return null;

      // Try to find the script tag and extract partner_id from data attribute
      const scripts = document.querySelectorAll('script[src*="dinelportal"]');
      for (const script of scripts) {
        const partnerId = script.getAttribute('data-partner-id');
        if (partnerId) return partnerId;
      }

      return null;
    } catch (error) {
      this.log('Error extracting partner ID:', error);
      return null;
    }
  }

  private getDomain(): string {
    try {
      if (typeof location === 'undefined') return '';
      
      const hostname = location.hostname;
      const parts = hostname.split('.');
      
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (error) {
      this.log('Error getting domain:', error);
      return '';
    }
  }

  private isTrackingAllowed(): boolean {
    // Respect Do Not Track
    if (this.config.respectDoNotTrack && typeof navigator !== 'undefined') {
      if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
        return false;
      }
    }

    // Check for consent if required
    if (this.config.requireConsent) {
      // Look for common consent flags
      if (typeof window !== 'undefined') {
        const consent = (window as any).dinelportal_consent || 
                       (window as any).gtag_consent ||
                       localStorage.getItem('consent') === 'true';
        if (!consent) return false;
      }
    }

    return true;
  }

  private log(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Tracker]', ...args);
    }
  }
}

// Global API setup
function createGlobalAPI(): void {
  try {
    if (typeof window === 'undefined') return;

    const tracker = new UniversalTracker();
    
    const api: DinElportalAPI = {
      trackConversion: tracker.trackConversion.bind(tracker),
      getTrackingData: tracker.getTrackingData.bind(tracker),
      clearData: tracker.clearData.bind(tracker),
      setConfig: tracker.setConfig.bind(tracker),
      getConfig: tracker.getConfig.bind(tracker),
      debug: tracker.setDebug.bind(tracker),
      version: '1.0.0'
    };

    // Create global namespace
    (window as any).DinElportal = api;

    // Auto-initialize
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => tracker.initialize());
    } else {
      tracker.initialize();
    }

    // Handle page unload
    window.addEventListener('beforeunload', () => tracker.cleanup());

    console.log('DinElportal Universal Tracker v1.0.0 loaded');
  } catch (error) {
    console.error('Error creating DinElportal API:', error);
  }
}

// Auto-execute when script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGlobalAPI);
  } else {
    createGlobalAPI();
  }
}

// Export for TypeScript/module usage
export { UniversalTracker, createGlobalAPI };
export type { TrackingConfig, TrackingData, ConversionData, DinElportalAPI };

// Make available for direct browser usage
if (typeof window !== 'undefined') {
  (window as any).DinElportalTracker = UniversalTracker;
}