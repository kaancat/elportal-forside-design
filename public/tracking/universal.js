/*!
 * DinElportal Universal Tracking Script v1.0.0
 * Built: 2025-08-14T14:35:22.568Z
 * 
 * One-line embed for partner websites:
 * <script src="https://dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID" async></script>
 * 
 * Features:
 * - Auto-capture click_id from URL
 * - Multi-storage persistence
 * - Auto-conversion detection
 * - Device fingerprinting
 * - GDPR compliant
 */

(function(window, document, undefined) {
"use strict";

/* PARTNER_CONFIG_PLACEHOLDER */

// === StorageManager.ts ===
/**
 * StorageManager - Multi-storage persistence for tracking data
 * Handles localStorage, sessionStorage, and first-party cookies
 * GDPR compliant - no personal data collection
 */


  click_id;
  fingerprint;
  timestamp;
  source;
  page_url;
  referrer;
  user_agent;
  session_id;
}


  cookieDays;
  domain;
  secure;
  sameSite;
  debug;
}


  private readonly CLICK_ID_KEY = 'dinelportal_click_id';
  private readonly FINGERPRINT_KEY = 'dinelportal_fp';
  private readonly SESSION_KEY = 'dinelportal_session';
  private readonly DATA_KEY = 'dinelportal_data';
  
  private options;
  private debug;

  constructor(options) {
    this.options = {
      cookieDays,
      domain),
      secure),
      sameSite,
      debug};
    this.debug = this.options.debug;
  }

  /**
   * Store tracking data in all available storage methods
   */
  public storeData(data){
    try {
      const completeData),
        session_id),
        source,
        ...data
      };

      const success = {
        localStorage, completeData),
        sessionStorage, completeData),
        cookie, JSON.stringify(completeData))
      };

      // Store individual values for easier access
      if (completeData.click_id) {
        this.setLocalStorage(this.CLICK_ID_KEY, completeData.click_id);
        this.setSessionStorage(this.CLICK_ID_KEY, completeData.click_id);
        this.setCookie(this.CLICK_ID_KEY, completeData.click_id);
      }

      if (completeData.fingerprint) {
        this.setLocalStorage(this.FINGERPRINT_KEY, completeData.fingerprint);
        this.setCookie(this.FINGERPRINT_KEY, completeData.fingerprint);
      }

      this.log('Data stored, completeData, 'Success rates, success);
      return Object.values(success).some(s => s); // At least one succeeded

    } catch (error) {
      this.log('Error storing data, error);
      return false;
    }
  }

  /**
   * Retrieve tracking data with fallback priority
   */
  public getData(){
    try {
      // Priority);
      if (!data) {
        data = this.getLocalStorage(this.DATA_KEY);
      }
      if (!data) {
        const cookieData = this.getCookie(this.DATA_KEY);
        if (cookieData) {
          try {
            data = JSON.parse(cookieData);
          } catch (e) {
            this.log('Error parsing cookie data, e);
          }
        }
      }

      // Fallback to individual values if complete data not found
      if (!data) {
        const click_id = this.getClickId();
        const fingerprint = this.getFingerprint();
        const session_id = this.getOrCreateSessionId();

        if (click_id || fingerprint) {
          data = {
            click_id,
            fingerprint,
            session_id,
            timestamp),
            source};
        }
      }

      if (data) {
        this.log('Retrieved data, data);
        return data;
      }

      return null;
    } catch (error) {
      this.log('Error retrieving data, error);
      return null;
    }
  }

  /**
   * Get click_id from any available storage
   */
  public getClickId(){
    return this.getSessionStorage(this.CLICK_ID_KEY) ||
           this.getLocalStorage(this.CLICK_ID_KEY) ||
           this.getCookie(this.CLICK_ID_KEY);
  }

  /**
   * Get fingerprint from storage
   */
  public getFingerprint(){
    return this.getLocalStorage(this.FINGERPRINT_KEY) ||
           this.getCookie(this.FINGERPRINT_KEY);
  }

  /**
   * Get or create session ID
   */
  public getOrCreateSessionId(){
    let sessionId = this.getSessionStorage(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.setSessionStorage(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Clear all tracking data
   */
  public clear(){
    try {
      // Clear individual keys
      [this.CLICK_ID_KEY, this.FINGERPRINT_KEY, this.SESSION_KEY, this.DATA_KEY].forEach(key => {
        this.removeLocalStorage(key);
        this.removeSessionStorage(key);
        this.removeCookie(key);
      });

      this.log('All tracking data cleared');
    } catch (error) {
      this.log('Error clearing data, error);
    }
  }

  /**
   * Check if data is expired
   */
  public isExpired(data, maxAgeMs){
    return (Date.now() - data.timestamp) > maxAgeMs;
  }

  // Private storage methods with error handling

  private setLocalStorage(key, value){
    try {
      if (typeof Storage === 'undefined') return false;
      localStorage.setItem(key, typeof value === 'string' ? value ));
      return true;
    } catch (e) {
      this.log('localStorage.setItem failed, e);
      return false;
    }
  }

  private getLocalStorage(key){
    try {
      if (typeof Storage === 'undefined') return null;
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch {
        return item; // Return}
    } catch (e) {
      this.log('localStorage.getItem failed, e);
      return null;
    }
  }

  private removeLocalStorage(key){
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      this.log('localStorage.removeItem failed, e);
    }
  }

  private setSessionStorage(key, value){
    try {
      if (typeof Storage === 'undefined') return false;
      sessionStorage.setItem(key, typeof value === 'string' ? value ));
      return true;
    } catch (e) {
      this.log('sessionStorage.setItem failed, e);
      return false;
    }
  }

  private getSessionStorage(key){
    try {
      if (typeof Storage === 'undefined') return null;
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch {
        return item; // Return}
    } catch (e) {
      this.log('sessionStorage.getItem failed, e);
      return null;
    }
  }

  private removeSessionStorage(key){
    try {
      if (typeof Storage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      this.log('sessionStorage.removeItem failed, e);
    }
  }

  private setCookie(key, value){
    try {
      if (typeof document === 'undefined') return false;
      
      const expires = new Date();
      expires.setTime(expires.getTime() + (this.options.cookieDays * 24 * 60 * 60 * 1000));
      
      let cookieString = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
      
      if (this.options.domain) {
        cookieString += `; domain=${this.options.domain}`;
      }
      
      if (this.options.secure) {
        cookieString += '; secure';
      }
      
      cookieString += `; samesite=${this.options.sameSite}`;
      
      document.cookie = cookieString;
      return true;
    } catch (e) {
      this.log('setCookie failed, e);
      return false;
    }
  }

  private getCookie(key){
    try {
      if (typeof document === 'undefined') return null;
      
      const nameEQ = key + "=";
      const ca = document.cookie.split(';');
      
      for (let i = 0; i  2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (e) {
      this.log('getDomain failed, e);
      return '';
    }
  }

  private generateSessionId(){
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private log(...args){
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Storage]', ...args);
    }
  }
}

// === Fingerprint.ts ===
/**
 * Fingerprint - GDPR-compliant device fingerprinting for tracking fallback
 * Uses only technical browser characteristics, no personal data
 */


  screen;
  timezone;
  language;
  platform;
  cookieEnabled;
  doNotTrack;
  canvas;
  webgl;
  audio;
}


  includeCanvas;
  includeWebGL;
  includeAudio;
  debug;
}


  private options;
  private debug;

  constructor(options) {
    this.options = {
      includeCanvas,
      includeWebGL,
      includeAudio, // Audio can be unreliable
      debug};
    this.debug = this.options.debug;
  }

  /**
   * Generate device fingerprint hash
   */
  public async generate(){
    try {
      const data = await this.collectFingerprint();
      const hash = this.hashFingerprint(data);
      
      this.log('Generated fingerprint, hash, 'from data, data);
      return hash;
    } catch (error) {
      this.log('Error generating fingerprint, error);
      // Fallback to simple hash
      return this.getFallbackFingerprint();
    }
  }

  /**
   * Collect all fingerprint data points
   */
  private async collectFingerprint(){
    const data}x${screen.height}x${screen.colorDepth}`,
      
      // Timezone (offset only, not location)
      timezone).getTimezoneOffset(),
      
      // Language preferences
      language,
      
      // Platform information
      platform,
      
      // Privacy settings
      cookieEnabled,
      doNotTrack};

    // Optional canvas fingerprint
    if (this.options.includeCanvas) {
      data.canvas = await this.getCanvasFingerprint();
    }

    // Optional WebGL fingerprint
    if (this.options.includeWebGL) {
      data.webgl = this.getWebGLFingerprint();
    }

    // Optional audio fingerprint
    if (this.options.includeAudio) {
      data.audio = await this.getAudioFingerprint();
    }

    return data;
  }

  /**
   * Generate canvas fingerprint (geometric shapes rendering)
   */
  private async getCanvasFingerprint(){
    try {
      if (typeof document === 'undefined') return undefined;

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      // Draw geometric shapes with text
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      
      ctx.fillStyle = '#069';
      ctx.fillText('DinElportal 🔌', 2, 15);
      
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint', 4, 30);
      
      // Add some geometric shapes
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      const dataURL = canvas.toDataURL();
      return this.simpleHash(dataURL).substring(0, 16);
    } catch (error) {
      this.log('Canvas fingerprint failed, error);
      return undefined;
    }
  }

  /**
   * Generate WebGL fingerprint
   */
  private getWebGLFingerprint(){
    try {
      if (typeof document === 'undefined') return undefined;

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return undefined;

      // Type assertion for WebGL context
      const webgl = gl;

      const info = {
        vendor),
        renderer),
        version),
        shadingLanguageVersion),
        extensions)?.join(',') || ''
      };

      return this.simpleHash(JSON.stringify(info)).substring(0, 16);
    } catch (error) {
      this.log('WebGL fingerprint failed, error);
      return undefined;
    }
  }

  /**
   * Generate audio fingerprint (may be unreliable)
   */
  private async getAudioFingerprint(){
    try {
      if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) {
        return undefined;
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(undefined), 1000);

        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const context = new AudioContextClass();
          
          const oscillator = context.createOscillator();
          const analyser = context.createAnalyser();
          const gain = context.createGain();
          const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

          gain.gain.value = 0; // Silent
          oscillator.frequency.value = 10000;
          oscillator.connect(analyser);
          analyser.connect(scriptProcessor);
          scriptProcessor.connect(gain);
          gain.connect(context.destination);

          scriptProcessor.onaudioprocess = (event) => {
            clearTimeout(timeout);
            const buffer = event.inputBuffer.getChannelData(0);
            const hash = this.simpleHash(Array.from(buffer).join(','));
            
            oscillator.disconnect();
            scriptProcessor.disconnect();
            context.close();
            
            resolve(hash.substring(0, 16));
          };

          oscillator.start();
        } catch (error) {
          clearTimeout(timeout);
          resolve(undefined);
        }
      });
    } catch (error) {
      this.log('Audio fingerprint failed, error);
      return undefined;
    }
  }

  /**
   * Create hash from fingerprint data
   */
  private hashFingerprint(data){
    const components = [
      data.screen,
      data.timezone.toString(),
      data.language,
      data.platform,
      data.cookieEnabled.toString(),
      data.doNotTrack.toString(),
      data.canvas || '',
      data.webgl || '',
      data.audio || ''
    ];

    const combined = components.join('|');
    return 'fp_' + this.simpleHash(combined);
  }

  /**
   * Fallback fingerprint for error cases
   */
  private getFallbackFingerprint(){
    try {
      const simple = [
        typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        typeof navigator !== 'undefined' ? navigator.language,
        typeof navigator !== 'undefined' ? navigator.platform,
        new Date().getTimezoneOffset().toString()
      ].join('|');

      return 'fp_' + this.simpleHash(simple);
    } catch (error) {
      // Ultimate fallback
      return 'fp_' + Date.now().toString(36) + Math.random().toString(36);
    }
  }

  /**
   * Simple hash function (djb2 algorithm)
   */
  private simpleHash(str){
    let hash = 5381;
    for (let i = 0; i  setTimeout(resolve, 100));
      const fp2 = await this.generate();
      
      const stable = fp1 === fp2;
      this.log('Fingerprint stability check, { fp1, fp2, stable });
      return stable;
    } catch (error) {
      this.log('Stability check failed, error);
      return false;
    }
  }

  private log(...args){
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Fingerprint]', ...args);
    }
  }
}

// Extend Window interface for audio context
declare global {
  interface Window {
    AudioContext;
    webkitAudioContext;
  }
}

// === ConversionDetector.ts ===
/**
 * ConversionDetector - Auto-detect conversion pages and events
 * Supports multiple detection methods, page content, form submissions
 */


  type;
  page_url;
  timestamp;
  confidence;
  method;
  value;
  currency;
  metadata, any>;
}


  // URL patterns for conversion pages
  urlPatterns;
  // Page title patterns
  titlePatterns;
  // Content selectors that indicate conversion
  contentSelectors;
  // Form selectors to monitor
  formSelectors;
  // Button selectors for conversion actions
  buttonSelectors;
  // Custom conversion functions
  customDetectors) => boolean>;
  // Enable different detection methods
  enableUrlDetection;
  enableContentDetection;
  enableFormDetection;
  enableButtonDetection;
  debug;
}


  private config;
  private debug;
  private observers;
  private eventListeners; event; handler}> = [];
  private detectedConversions;

  constructor(config) {
    this.config = {
      // Default Danish and English conversion URL patterns
      urlPatterns,
        '/success',
        '/confirmation',
        '/complete',
        '/done',
        '/tak',
        '/takker',
        '/bekraeftelse',
        '/bekraeftet',
        '/gennemfoert',
        '/succes',
        '/velgennemfoert',
        '/ordre-bekraeftelse',
        '/bestilling-bekraeftelse',
        '/ordre-gennemfoert',
        '/koebt',
        '/tilmeldt',
        '/registreret',
        '/signup-success',
        '/registration-complete',
        '/checkout-complete',
        '/payment-success',
        '/order-complete',
        '/subscription-active',
        '/welcome',
        '/velkommen',
        ...config.urlPatterns || []
      ],

      // Page title patterns
      titlePatterns,
        'tak*',
        'bekræft*',
        'succes*',
        'velkommen*',
        'gennemført*',
        'ordre*',
        'bestilling*',
        'købt*',
        'tilmeldt*',
        'registreret*',
        'success*',
        'complete*',
        'confirmed*',
        'welcome*',
        'order*',
        'payment*',
        ...config.titlePatterns || []
      ],

      // Content selectors
      contentSelectors,
        '.thank-you',
        '.confirmation',
        '.order-complete',
        '.payment-success',
        '[class*="success"]',
        '[class*="thank"]',
        '[class*="confirm"]',
        '[class*="complete"]',
        '[data-conversion="true"]',
        '[data-success="true"]',
        ...config.contentSelectors || []
      ],

      // Form selectors
      formSelectors,
        'form[action*="order"]',
        'form[action*="signup"]',
        'form[action*="subscribe"]',
        'form[action*="tilmeld"]',
        'form[action*="bestil"]',
        'form[action*="køb"]',
        'form.checkout',
        'form.order',
        'form.signup',
        'form.subscription',
        '#checkout-form',
        '#order-form',
        '#signup-form',
        '#contact-form',
        '.checkout-form',
        '.order-form',
        '.signup-form',
        ...config.formSelectors || []
      ],

      // Button selectors
      buttonSelectors,
        'input[type="submit"]',
        '.btn-primary',
        '.buy-now',
        '.order-now',
        '.checkout-btn',
        '.signup-btn',
        '.subscribe-btn',
        '[data-track="conversion"]',
        '[onclick*="track"]',
        '[onclick*="convert"]',
        ...config.buttonSelectors || []
      ],

      customDetectors,
      enableUrlDetection,
      enableContentDetection,
      enableFormDetection,
      enableButtonDetection,
      debug};

    this.debug = this.config.debug;
  }

  /**
   * Initialize conversion detection
   */
  public initialize(){
    try {
      this.log('Initializing conversion detection');

      // Check current page immediately
      this.checkCurrentPage();

      // Set up DOM monitoring for dynamic content
      this.setupMutationObserver();

      // Set up form monitoring
      if (this.config.enableFormDetection) {
        this.setupFormMonitoring();
      }

      // Set up button monitoring
      if (this.config.enableButtonDetection) {
        this.setupButtonMonitoring();
      }

      this.log('Conversion detection initialized');
    } catch (error) {
      this.log('Error initializing conversion detection, error);
    }
  }

  /**
   * Check if current page is a conversion page
   */
  public checkCurrentPage(){
    try {
      const url = typeof window !== 'undefined' ? window.location.href;
      const pathname = typeof window !== 'undefined' ? window.location.pathname;
      
      let conversion;

      // URL-based detection
      if (this.config.enableUrlDetection && this.checkUrlPatterns(pathname)) {
        conversion = {
          type,
          page_url,
          timestamp),
          confidence,
          method};
      }

      // Title-based detection
      if (!conversion && typeof document !== 'undefined') {
        const title = document.title.toLowerCase();
        if (this.checkTitlePatterns(title)) {
          conversion = {
            type,
            page_url,
            timestamp),
            confidence,
            method};
        }
      }

      // Content-based detection
      if (!conversion && this.config.enableContentDetection) {
        const contentMatch = this.checkContentSelectors();
        if (contentMatch) {
          conversion = {
            type,
            page_url,
            timestamp),
            confidence,
            method,
            metadata}
          };
        }
      }

      // Custom detectors
      if (!conversion) {
        for (const detector of this.config.customDetectors) {
          try {
            if (detector()) {
              conversion = {
                type,
                page_url,
                timestamp),
                confidence,
                method};
              break;
            }
          } catch (error) {
            this.log('Custom detector error, error);
          }
        }
      }

      if (conversion) {
        this.detectedConversions.push(conversion);
        this.log('Conversion detected, conversion);
      }

      return conversion;
    } catch (error) {
      this.log('Error checking current page, error);
      return null;
    }
  }

  /**
   * Get all detected conversions
   */
  public getDetectedConversions(){
    return [...this.detectedConversions];
  }

  /**
   * Clear detected conversions
   */
  public clearDetectedConversions(){
    this.detectedConversions = [];
  }

  /**
   * Cleanup event listeners and observers
   */
  public cleanup(){
    try {
      // Stop mutation observers
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];

      // Remove event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];

      this.log('Conversion detection cleaned up');
    } catch (error) {
      this.log('Error during cleanup, error);
    }
  }

  // Private detection methods

  private checkUrlPatterns(pathname){
    const lowerPath = pathname.toLowerCase();
    return this.config.urlPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        return regex.test(lowerPath);
      }
      return lowerPath.includes(pattern.toLowerCase());
    });
  }

  private checkTitlePatterns(title){
    return this.config.titlePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        return regex.test(title);
      }
      return title.includes(pattern.toLowerCase());
    });
  }

  private checkContentSelectors(){
    if (typeof document === 'undefined') return null;

    for (const selector of this.config.contentSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          return selector;
        }
      } catch (error) {
        this.log('Invalid selector, selector, error);
      }
    }
    return null;
  }

  private setupMutationObserver(){
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      let hasNewContent = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          hasNewContent = true;
        }
      });

      if (hasNewContent) {
        // Debounce checks for performance
        setTimeout(() => this.checkCurrentPage(), 500);
      }
    });

    observer.observe(document.body, {
      childList,
      subtree});

    this.observers.push(observer);
  }

  private setupFormMonitoring(){
    if (typeof document === 'undefined') return;

    const monitorForm = (form) => {
      const handler = (event) => {
        const conversion,
          page_url,
          timestamp),
          confidence,
          method,
          metadata,
            form_method,
            form_id,
            form_class}
        };

        this.detectedConversions.push(conversion);
        this.log('Form conversion detected, conversion);
      };

      form.addEventListener('submit', handler);
      this.eventListeners.push({ element, event, handler });
    };

    // Monitor existing forms
    this.config.formSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach((form) => {
          if (form instanceof HTMLFormElement) {
            monitorForm(form);
          }
        });
      } catch (error) {
        this.log('Form selector error, selector, error);
      }
    });

    // Monitor for dynamically added forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLFormElement) {
            monitorForm(node);
          } else if (node instanceof Element) {
            this.config.formSelectors.forEach(selector => {
              try {
                node.querySelectorAll(selector).forEach((form) => {
                  if (form instanceof HTMLFormElement) {
                    monitorForm(form);
                  }
                });
              } catch (error) {
                this.log('Dynamic form selector error, selector, error);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList, subtree});
    this.observers.push(observer);
  }

  private setupButtonMonitoring(){
    if (typeof document === 'undefined') return;

    const monitorButton = (button) => {
      const handler = (event) => {
        const conversion,
          page_url,
          timestamp),
          confidence,
          method,
          metadata),
            button_id).id,
            button_class,
            button_type)
          }
        };

        this.detectedConversions.push(conversion);
        this.log('Button conversion detected, conversion);
      };

      button.addEventListener('click', handler);
      this.eventListeners.push({ element, event, handler });
    };

    // Monitor existing buttons
    this.config.buttonSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(monitorButton);
      } catch (error) {
        this.log('Button selector error, selector, error);
      }
    });

    // Monitor for dynamically added buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            this.config.buttonSelectors.forEach(selector => {
              try {
                if (node.matches(selector)) {
                  monitorButton(node);
                } else {
                  node.querySelectorAll(selector).forEach(monitorButton);
                }
              } catch (error) {
                this.log('Dynamic button selector error, selector, error);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList, subtree});
    this.observers.push(observer);
  }

  private log(...args){
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Conversion]', ...args);
    }
  }
}

// === UniversalScript.ts ===
/**
 * DinElportal Universal Tracking Script
 * 
 * One-line embed script for partner websites
 * Features, sessionStorage, cookies)
 * - Auto-detect conversion pages
 * - Device fingerprinting fallback
 * - Global API)
 * - GDPR compliant
 * - Handles all edge cases (blocked cookies, private browsing, etc.)
 * 
 * Usage;
  fingerprint;
  session_id;
  page_url;
  referrer;
  timestamp;
  user_agent;
}


  click_id;
  fingerprint;
  session_id;
  conversion_type;
  conversion_value;
  conversion_currency;
  page_url;
  timestamp;
  metadata, any>;
}


  // API endpoint for sending data
  endpoint;
  // Partner identification
  partner_id;
  partner_domain;
  // Click ID parameter name
  clickIdParam;
  // Storage configuration
  cookieDays;
  domain;
  // Feature toggles
  enableAutoConversion;
  enableFingerprinting;
  enableFormTracking;
  enableButtonTracking;
  // Custom conversion patterns
  conversionPatterns;
  // Debug mode
  debug;
  // GDPR compliance
  respectDoNotTrack;
  requireConsent;
}


  trackConversion) => Promise;
  getTrackingData) => TrackingData | null;
  clearData) => void;
  setConfig) => void;
  getConfig) => TrackingConfig;
  debug) => void;
  version;
}

class UniversalTracker {
  private config;
  private storageManager;
  private fingerprinter;
  private conversionDetector;
  private initialized = false;
  private debug = false;

  constructor(config) {
    this.config = {
      endpoint,
      partner_id) || 'unknown',
      partner_domain,
      clickIdParam,
      cookieDays,
      domain),
      enableAutoConversion,
      enableFingerprinting,
      enableFormTracking,
      enableButtonTracking,
      conversionPatterns,
      debug,
      respectDoNotTrack,
      requireConsent,
      ...config
    };

    this.debug = this.config.debug || false;

    // Initialize components
    this.storageManager = new StorageManager({
      cookieDays,
      domain,
      debug});

    this.fingerprinter = new DeviceFingerprint({
      debug);

    this.conversionDetector = new ConversionDetector({
      urlPatterns,
      enableFormDetection,
      enableButtonDetection,
      debug});
  }

  /**
   * Initialize tracking system
   */
  public async initialize(){
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
      this.log('Error initializing tracker, error);
    }
  }

  /**
   * Track conversion manually
   */
  public async trackConversion(data){
    try {
      const trackingData = this.storageManager.getData();
      if (!trackingData) {
        this.log('No tracking data available for conversion');
        return false;
      }

      const conversionData,
        fingerprint,
        session_id,
        conversion_type,
        page_url,
        timestamp),
        ...data
      };

      const success = await this.sendConversionData(conversionData);
      this.log('Manual conversion tracked, conversionData, 'Success, success);
      
      return success;
    } catch (error) {
      this.log('Error tracking conversion, error);
      return false;
    }
  }

  /**
   * Get current tracking data
   */
  public getTrackingData(){
    const data = this.storageManager.getData();
    if (!data) return null;

    return {
      click_id,
      fingerprint,
      session_id,
      page_url,
      referrer,
      timestamp,
      user_agent};
  }

  /**
   * Clear all tracking data
   */
  public clearData(){
    this.storageManager.clear();
    this.conversionDetector.clearDetectedConversions();
    this.log('All tracking data cleared');
  }

  /**
   * Update configuration
   */
  public setConfig(newConfig){
    this.config = { ...this.config, ...newConfig };
    this.debug = this.config.debug || false;
    this.log('Configuration updated, newConfig);
  }

  /**
   * Get current configuration
   */
  public getConfig(){
    return { ...this.config };
  }

  /**
   * Toggle debug mode
   */
  public setDebug(enabled){
    this.debug = enabled;
    this.config.debug = enabled;
    this.log('Debug mode, enabled ? 'enabled' : 'disabled');
  }

  /**
   * Cleanup resources
   */
  public cleanup(){
    this.conversionDetector.cleanup();
    this.initialized = false;
    this.log('Tracker cleaned up');
  }

  // Private methods

  private async createTrackingData(clickId?){
    const data),
      timestamp),
      source,
      page_url,
      referrer,
      user_agent};

    if (clickId) {
      data.click_id = clickId;
    }

    if (this.config.enableFingerprinting) {
      try {
        data.fingerprint = await this.fingerprinter.generate();
      } catch (error) {
        this.log('Fingerprinting failed, error);
      }
    }

    return data;
  }

  private shouldRefreshData(existing, newClickId){
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

  private async handleConversion(conversion){
    try {
      const trackingData = this.storageManager.getData();
      if (!trackingData) return;

      const conversionData,
        fingerprint,
        session_id,
        conversion_type,
        page_url,
        timestamp,
        metadata,
          confidence,
          method}
      };

      await this.sendConversionData(conversionData);
      this.log('Auto conversion tracked, conversionData);
    } catch (error) {
      this.log('Error handling conversion, error);
    }
  }

  private async sendTrackingData(data){
    try {
      const payload = {
        type,
        partner_id,
        partner_domain,
        data,
          fingerprint,
          session_id,
          page_url,
          referrer,
          user_agent,
          timestamp}
      };

      const response = await this.sendToEndpoint(payload);
      return response.ok;
    } catch (error) {
      this.log('Error sending tracking data, error);
      return false;
    }
  }

  private async sendConversionData(data){
    try {
      const payload = {
        type,
        partner_id,
        partner_domain,
        data
      };

      const response = await this.sendToEndpoint(payload);
      return response.ok;
    } catch (error) {
      this.log('Error sending conversion data, error);
      return false;
    }
  }

  private async sendToEndpoint(payload){
    const endpoint = this.config.endpoint!;
    
    return fetch(endpoint, {
      method,
      headers},
      body),
      mode});
  }

  private extractClickIdFromUrl(){
    try {
      if (typeof URLSearchParams === 'undefined' || typeof location === 'undefined') {
        return null;
      }

      const params = new URLSearchParams(location.search);
      return params.get(this.config.clickIdParam!) || null;
    } catch (error) {
      this.log('Error extracting click_id from URL, error);
      return null;
    }
  }

  private extractPartnerIdFromScript(){
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
      this.log('Error extracting partner ID, error);
      return null;
    }
  }

  private getDomain(){
    try {
      if (typeof location === 'undefined') return '';
      
      const hostname = location.hostname;
      const parts = hostname.split('.');
      
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (error) {
      this.log('Error getting domain, error);
      return '';
    }
  }

  private isTrackingAllowed(){
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
        const consent = (window).dinelportal_consent || 
                       (window).gtag_consent ||
                       localStorage.getItem('consent') === 'true';
        if (!consent) return false;
      }
    }

    return true;
  }

  private log(...args){
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Tracker]', ...args);
    }
  }
}

// Global API setup
function createGlobalAPI(){
  try {
    if (typeof window === 'undefined') return;

    const tracker = new UniversalTracker();
    
    const api),
      getTrackingData),
      clearData),
      setConfig),
      getConfig),
      debug),
      version};

    // Create global namespace
    (window).DinElportal = api;

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
    console.error('Error creating DinElportal API, error);
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



// Make available for direct browser usage
if (typeof window !== 'undefined') {
  (window).DinElportalTracker = UniversalTracker;
}

})(typeof window !== "undefined" ? window : this, typeof document !== "undefined" ? document : {});
