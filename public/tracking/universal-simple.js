/*!
 * DinElportal Simple Tracking Script v2.0.0
 * Simplified partner tracking - just click capture and conversion detection
 */
(function(window, document) {
  'use strict';

  // Configuration will be injected by server
  /* PARTNER_CONFIG_PLACEHOLDER */

  // ===== Simple Storage Manager =====
  var Storage = {
    CLICK_KEY: 'dep_click',
    SESSION_KEY: 'dep_session',
    
    setCookie: function(name, value, days) {
      try {
        var expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        // Get base domain for cookie
        var domain = window.location.hostname;
        if (domain !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
          // Set cookie on base domain (e.g., .example.com)
          var parts = domain.split('.');
          if (parts.length >= 2) {
            domain = '.' + parts.slice(-2).join('.');
          }
        } else {
          domain = ''; // Don't set domain for localhost/IP
        }
        
        var cookieString = name + '=' + encodeURIComponent(value) + 
                          '; expires=' + expires.toUTCString() + 
                          '; path=/';
        
        if (domain) {
          cookieString += '; domain=' + domain;
        }
        
        if (window.location.protocol === 'https:') {
          cookieString += '; secure';
        }
        
        cookieString += '; SameSite=Lax';
        
        document.cookie = cookieString;
        return true;
      } catch (e) {
        console.error('[DinElportal] Cookie error:', e);
        return false;
      }
    },
    
    getCookie: function(name) {
      try {
        var nameEQ = name + '=';
        var cookies = document.cookie.split(';');
        
        for (var i = 0; i < cookies.length; i++) {
          var c = cookies[i].trim();
          if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    },
    
    setLocal: function(key, value) {
      try {
        if (typeof(Storage) !== 'undefined') {
          localStorage.setItem(key, value);
          return true;
        }
      } catch (e) {}
      return false;
    },
    
    getLocal: function(key) {
      try {
        if (typeof(Storage) !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch (e) {}
      return null;
    },
    
    setSession: function(key, value) {
      try {
        if (typeof(Storage) !== 'undefined') {
          sessionStorage.setItem(key, value);
          return true;
        }
      } catch (e) {}
      return false;
    },
    
    getSession: function(key) {
      try {
        if (typeof(Storage) !== 'undefined') {
          return sessionStorage.getItem(key);
        }
      } catch (e) {}
      return null;
    },
    
    // Store click ID in all available storage
    storeClickId: function(clickId) {
      var stored = false;
      stored = this.setCookie(this.CLICK_KEY, clickId, 90) || stored;
      stored = this.setLocal(this.CLICK_KEY, clickId) || stored;
      stored = this.setSession(this.CLICK_KEY, clickId) || stored;
      
      if (window.DinElportalConfig && window.DinElportalConfig.debug) {
        console.log('[DinElportal] Stored click_id:', clickId, 'Success:', stored);
      }
      
      return stored;
    },
    
    // Get click ID from any storage
    getClickId: function() {
      return this.getCookie(this.CLICK_KEY) || 
             this.getLocal(this.CLICK_KEY) || 
             this.getSession(this.CLICK_KEY);
    },
    
    // Get or create session ID
    getSessionId: function() {
      var sessionId = this.getSession(this.SESSION_KEY);
      if (!sessionId) {
        sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
        this.setSession(this.SESSION_KEY, sessionId);
      }
      return sessionId;
    }
  };

  // ===== Simple Tracker =====
  var Tracker = {
    initialized: false,
    config: null,
    
    init: function() {
      if (this.initialized) return;
      
      // Get configuration
      this.config = window.DinElportalConfig || {};
      
      if (this.config.debug) {
        console.log('[DinElportal] Initializing with config:', this.config);
      }
      
      // Check for click_id in URL
      var clickId = this.getClickIdFromUrl();
      if (clickId) {
        Storage.storeClickId(clickId);
        this.trackEvent('landing', { click_id: clickId });
      }
      
      // Check if we're on a thank you page
      this.checkForConversion();
      
      this.initialized = true;
    },
    
    getClickIdFromUrl: function() {
      try {
        var params = new URLSearchParams(window.location.search);
        var clickId = params.get(this.config.clickIdParam || 'click_id');
        
        // Validate format
        if (clickId && clickId.startsWith('dep_')) {
          return clickId;
        }
      } catch (e) {
        // Fallback for older browsers
        var match = window.location.search.match(/[?&]click_id=([^&]+)/);
        if (match && match[1] && match[1].startsWith('dep_')) {
          return match[1];
        }
      }
      return null;
    },
    
    checkForConversion: function() {
      if (!this.config.enableAutoConversion) return;
      
      var currentPath = window.location.pathname.toLowerCase();
      var patterns = this.config.conversionPatterns || ['/tak', '/thank-you'];
      
      // Check if current page matches any conversion pattern
      var isConversionPage = false;
      for (var i = 0; i < patterns.length; i++) {
        if (currentPath === patterns[i].toLowerCase() || 
            currentPath.indexOf(patterns[i].toLowerCase()) !== -1) {
          isConversionPage = true;
          break;
        }
      }
      
      if (isConversionPage) {
        var clickId = Storage.getClickId();
        if (clickId) {
          this.trackConversion();
        } else if (this.config.debug) {
          console.log('[DinElportal] On conversion page but no click_id found');
        }
      }
    },
    
    trackEvent: function(eventType, data) {
      var clickId = data.click_id || Storage.getClickId();
      var sessionId = Storage.getSessionId();
      
      var payload = {
        type: 'track',
        partner_id: this.config.partner_id || 'unknown',
        partner_domain: window.location.hostname,
        data: {
          click_id: clickId,
          session_id: sessionId,
          event_type: eventType,
          page_url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now()
        }
      };
      
      // Merge additional data
      if (data) {
        for (var key in data) {
          if (data.hasOwnProperty(key) && key !== 'click_id') {
            payload.data[key] = data[key];
          }
        }
      }
      
      this.sendData(payload);
    },
    
    trackConversion: function(value) {
      var clickId = Storage.getClickId();
      if (!clickId) {
        if (this.config.debug) {
          console.log('[DinElportal] Cannot track conversion - no click_id');
        }
        return false;
      }
      
      var payload = {
        type: 'conversion',
        partner_id: this.config.partner_id || 'unknown',
        partner_domain: window.location.hostname,
        data: {
          click_id: clickId,
          session_id: Storage.getSessionId(),
          conversion_type: 'page_view',
          page_url: window.location.href,
          timestamp: Date.now()
        }
      };
      
      if (value) {
        payload.data.conversion_value = value;
      }
      
      this.sendData(payload);
      
      if (this.config.debug) {
        console.log('[DinElportal] Conversion tracked:', clickId);
      }
      
      return true;
    },
    
    sendData: function(payload) {
      // Use image pixel tracking - NO CORS ISSUES!
      var pixelEndpoint = 'https://www.dinelportal.dk/api/tracking/pixel';
      
      // Prepare tracking data
      var params = [];
      params.push('partner_id=' + encodeURIComponent(payload.partner_id || 'unknown'));
      params.push('event_type=' + encodeURIComponent(payload.type || 'track'));
      
      if (payload.data) {
        if (payload.data.click_id) {
          params.push('click_id=' + encodeURIComponent(payload.data.click_id));
        }
        if (payload.data.session_id) {
          params.push('session_id=' + encodeURIComponent(payload.data.session_id));
        }
        if (payload.data.page_url) {
          params.push('url=' + encodeURIComponent(payload.data.page_url));
        }
        if (payload.data.conversion_type) {
          params.push('conversion_type=' + encodeURIComponent(payload.data.conversion_type));
        }
      }
      
      // Add timestamp
      params.push('t=' + Date.now());
      
      // Create and load tracking pixel
      var img = new Image(1, 1);
      img.src = pixelEndpoint + '?' + params.join('&');
      
      // Optional: Handle load/error for debugging
      if (this.config.debug) {
        img.onload = function() {
          console.log('[DinElportal] Tracking pixel sent successfully:', payload);
        };
        img.onerror = function() {
          console.error('[DinElportal] Tracking pixel failed:', payload);
        };
      }
      
      // For conversions, also try sendBeacon as backup (but don't rely on it)
      if (payload.type === 'conversion' && navigator.sendBeacon) {
        try {
          var beaconUrl = pixelEndpoint + '?' + params.join('&');
          navigator.sendBeacon(beaconUrl);
        } catch (e) {
          // Ignore beacon errors - pixel will handle it
        }
      }
    }
  };

  // ===== Public API =====
  window.DinElportal = {
    // Manual conversion tracking
    trackConversion: function(value) {
      return Tracker.trackConversion(value);
    },
    
    // Get current tracking data
    getTrackingData: function() {
      return {
        click_id: Storage.getClickId(),
        session_id: Storage.getSessionId(),
        partner_id: Tracker.config ? Tracker.config.partner_id : null
      };
    },
    
    // Enable/disable debug mode
    debug: function(enabled) {
      if (Tracker.config) {
        Tracker.config.debug = enabled;
      }
      if (window.DinElportalConfig) {
        window.DinElportalConfig.debug = enabled;
      }
      console.log('[DinElportal] Debug mode:', enabled ? 'enabled' : 'disabled');
    },
    
    // Version
    version: '2.0.0'
  };

  // ===== Auto-initialize =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Tracker.init();
    });
  } else {
    Tracker.init();
  }
  
  // Log that script loaded
  if (window.DinElportalConfig && window.DinElportalConfig.debug) {
    console.log('[DinElportal] Simple Tracking Script v2.0.0 loaded');
  }

})(window, document);