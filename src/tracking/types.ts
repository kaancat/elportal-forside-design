/**
 * TypeScript interfaces and types for DinElportal Universal Tracking System
 * Centralized type definitions for type safety and consistency
 */

// ============================================================================
// Core Data Structures
// ============================================================================

export interface StorageData {
  click_id?: string;
  fingerprint?: string;
  timestamp: number;
  source: 'url' | 'storage' | 'generated';
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  session_id: string;
}

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

// ============================================================================
// Storage Manager Types
// ============================================================================

export interface StorageOptions {
  cookieDays?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  debug?: boolean;
}

export interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  cookies: boolean;
}

// ============================================================================
// Fingerprinting Types
// ============================================================================

export interface FingerprintData {
  screen: string;
  timezone: number;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  canvas?: string;
  webgl?: string;
  audio?: string;
}

export interface FingerprintOptions {
  includeCanvas?: boolean;
  includeWebGL?: boolean;
  includeAudio?: boolean;
  debug?: boolean;
}

export interface WebGLInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string;
}

// ============================================================================
// Conversion Detection Types
// ============================================================================

export interface ConversionEvent {
  type: 'page_view' | 'form_submit' | 'button_click' | 'custom';
  page_url: string;
  timestamp: number;
  confidence: 'high' | 'medium' | 'low';
  method: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface ConversionConfig {
  urlPatterns: string[];
  titlePatterns: string[];
  contentSelectors: string[];
  formSelectors: string[];
  buttonSelectors: string[];
  customDetectors: Array<() => boolean>;
  enableUrlDetection: boolean;
  enableContentDetection: boolean;
  enableFormDetection: boolean;
  enableButtonDetection: boolean;
  debug: boolean;
}

export interface ConversionContext {
  form_action?: string;
  form_method?: string;
  form_id?: string;
  form_class?: string;
  button_text?: string;
  button_id?: string;
  button_class?: string;
  button_type?: string;
  selector?: string;
}

// ============================================================================
// Universal Tracker Configuration
// ============================================================================

export interface TrackingConfig {
  endpoint?: string;
  partner_id?: string;
  partner_domain?: string;
  clickIdParam?: string;
  cookieDays?: number;
  domain?: string;
  enableAutoConversion?: boolean;
  enableFingerprinting?: boolean;
  enableFormTracking?: boolean;
  enableButtonTracking?: boolean;
  conversionPatterns?: string[];
  debug?: boolean;
  respectDoNotTrack?: boolean;
  requireConsent?: boolean;
}

export interface TrackingPayload {
  type: 'track' | 'conversion';
  partner_id: string;
  partner_domain: string;
  data: TrackingData | ConversionData;
}

// ============================================================================
// Global API Types
// ============================================================================

export interface DinElportalAPI {
  trackConversion: (data?: Partial<ConversionData>) => Promise<boolean>;
  getTrackingData: () => TrackingData | null;
  clearData: () => void;
  setConfig: (config: Partial<TrackingConfig>) => void;
  getConfig: () => TrackingConfig;
  debug: (enabled: boolean) => void;
  version: string;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export interface TrackingError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
}

export type TrackingErrorCode = 
  | 'STORAGE_FAILED'
  | 'FINGERPRINT_FAILED'
  | 'CONVERSION_DETECTION_FAILED'
  | 'API_REQUEST_FAILED'
  | 'INITIALIZATION_FAILED'
  | 'CONSENT_REQUIRED'
  | 'DNT_ENABLED';

// ============================================================================
// Analytics & Reporting Types
// ============================================================================

export interface TrackingMetrics {
  sessions_tracked: number;
  conversions_detected: number;
  click_ids_captured: number;
  fingerprints_generated: number;
  storage_success_rate: number;
  api_success_rate: number;
  last_updated: number;
}

export interface PartnerStats {
  partner_id: string;
  partner_domain: string;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  last_activity: number;
  tracking_enabled: boolean;
}

// ============================================================================
// Event Listener Types
// ============================================================================

export interface EventListenerEntry {
  element: Element;
  event: string;
  handler: EventListener;
}

export interface MutationObserverEntry {
  observer: MutationObserver;
  target: Element;
  options: MutationObserverInit;
}

// ============================================================================
// URL Parameter Types
// ============================================================================

export interface UrlParameters {
  click_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  msclkid?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// Privacy & Compliance Types
// ============================================================================

export interface PrivacySettings {
  respectDoNotTrack: boolean;
  requireConsent: boolean;
  anonymizeIp: boolean;
  dataRetentionDays: number;
  enableFingerprinting: boolean;
  enableCrossDomainTracking: boolean;
}

export interface ConsentData {
  granted: boolean;
  timestamp: number;
  consent_string?: string;
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
}

// ============================================================================
// Browser Compatibility Types
// ============================================================================

export interface BrowserCapabilities {
  localStorage: boolean;
  sessionStorage: boolean;
  cookies: boolean;
  canvas: boolean;
  webgl: boolean;
  audioContext: boolean;
  mutationObserver: boolean;
  urlSearchParams: boolean;
  fetch: boolean;
}

export interface BrowserInfo {
  userAgent: string;
  vendor: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  capabilities: BrowserCapabilities;
}

// ============================================================================
// Debugging & Development Types
// ============================================================================

export interface DebugInfo {
  version: string;
  initialized: boolean;
  config: TrackingConfig;
  storage_data: StorageData | null;
  detected_conversions: ConversionEvent[];
  browser_info: BrowserInfo;
  metrics: TrackingMetrics;
  errors: TrackingError[];
}

export interface LogLevel {
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: number;
  message: string;
  data?: any;
}

// ============================================================================
// Window Extensions for Global API
// ============================================================================

declare global {
  interface Window {
    DinElportal: DinElportalAPI;
    DinElportalTracker: any;
    dinelportal_consent?: boolean;
    gtag_consent?: boolean;
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Re-export main interfaces for convenience
  StorageData,
  TrackingData,
  ConversionData,
  ConversionEvent,
  TrackingConfig,
  DinElportalAPI,
  FingerprintData,
  ConversionConfig
};

// Default export for main tracker class type
export default interface UniversalTrackerInterface {
  initialize(): Promise<void>;
  trackConversion(data?: Partial<ConversionData>): Promise<boolean>;
  getTrackingData(): TrackingData | null;
  clearData(): void;
  setConfig(config: Partial<TrackingConfig>): void;
  getConfig(): TrackingConfig;
  setDebug(enabled: boolean): void;
  cleanup(): void;
}