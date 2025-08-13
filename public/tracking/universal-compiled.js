/*!
 * DinElportal Universal Tracking Script v1.0.0
 * One-line embed for partner websites
 * Features: Auto-capture click_id, Multi-storage persistence, Auto-conversion detection, GDPR compliant
 */
(function(window, document, undefined) {
  'use strict';

  // Configuration injected by server
  /* PARTNER_CONFIG_PLACEHOLDER */

  // ===== Storage Manager =====
  var StorageManager = function(options) {
    this.CLICK_ID_KEY = 'dinelportal_click_id';
    this.FINGERPRINT_KEY = 'dinelportal_fp';
    this.SESSION_KEY = 'dinelportal_session';
    this.DATA_KEY = 'dinelportal_data';
    
    this.options = {
      cookieDays: options.cookieDays || 90,
      domain: options.domain || this.getDomain(),
      secure: options.secure !== false,
      sameSite: options.sameSite || 'lax',
      debug: options.debug || false
    };
    this.debug = this.options.debug;
  };

  StorageManager.prototype.storeData = function(data) {
    try {
      var completeData = {
        session_id: data.session_id || this.getOrCreateSessionId(),
        source: data.source || 'direct',
        timestamp: Date.now()
      };
      
      // Merge with provided data
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          completeData[key] = data[key];
        }
      }

      var success = {
        localStorage: this.setLocalStorage(this.DATA_KEY, completeData),
        sessionStorage: this.setSessionStorage(this.DATA_KEY, completeData),
        cookie: this.setCookie(this.DATA_KEY, JSON.stringify(completeData))
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

      this.log('Data stored:', completeData, 'Success rates:', success);
      return success.localStorage || success.sessionStorage || success.cookie;

    } catch (error) {
      this.log('Error storing data:', error);
      return false;
    }
  };

  StorageManager.prototype.getData = function() {
    try {
      // Priority: sessionStorage > localStorage > cookies
      var data = this.getSessionStorage(this.DATA_KEY);
      if (!data) {
        data = this.getLocalStorage(this.DATA_KEY);
      }
      if (!data) {
        var cookieData = this.getCookie(this.DATA_KEY);
        if (cookieData) {
          try {
            data = JSON.parse(cookieData);
          } catch (e) {
            this.log('Error parsing cookie data:', e);
          }
        }
      }

      // Fallback to individual values if complete data not found
      if (!data) {
        var click_id = this.getClickId();
        var fingerprint = this.getFingerprint();
        var session_id = this.getOrCreateSessionId();

        if (click_id || fingerprint) {
          data = {
            click_id: click_id,
            fingerprint: fingerprint,
            session_id: session_id,
            timestamp: Date.now(),
            source: 'reconstructed'
          };
        }
      }

      if (data) {
        this.log('Retrieved data:', data);
        return data;
      }

      return null;
    } catch (error) {
      this.log('Error retrieving data:', error);
      return null;
    }
  };

  StorageManager.prototype.getClickId = function() {
    return this.getSessionStorage(this.CLICK_ID_KEY) ||
           this.getLocalStorage(this.CLICK_ID_KEY) ||
           this.getCookie(this.CLICK_ID_KEY);
  };

  StorageManager.prototype.getFingerprint = function() {
    return this.getLocalStorage(this.FINGERPRINT_KEY) ||
           this.getCookie(this.FINGERPRINT_KEY);
  };

  StorageManager.prototype.getOrCreateSessionId = function() {
    var sessionId = this.getSessionStorage(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.setSessionStorage(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  };

  StorageManager.prototype.clear = function() {
    try {
      var keys = [this.CLICK_ID_KEY, this.FINGERPRINT_KEY, this.SESSION_KEY, this.DATA_KEY];
      for (var i = 0; i < keys.length; i++) {
        this.removeLocalStorage(keys[i]);
        this.removeSessionStorage(keys[i]);
        this.removeCookie(keys[i]);
      }
      this.log('All tracking data cleared');
    } catch (error) {
      this.log('Error clearing data:', error);
    }
  };

  StorageManager.prototype.isExpired = function(data, maxAgeMs) {
    return (Date.now() - data.timestamp) > maxAgeMs;
  };

  // Private storage methods
  StorageManager.prototype.setLocalStorage = function(key, value) {
    try {
      if (typeof Storage === 'undefined') return false;
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      this.log('localStorage.setItem failed:', e);
      return false;
    }
  };

  StorageManager.prototype.getLocalStorage = function(key) {
    try {
      if (typeof Storage === 'undefined') return null;
      var item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch (e) {
        return item; // Return as string if not JSON
      }
    } catch (e) {
      this.log('localStorage.getItem failed:', e);
      return null;
    }
  };

  StorageManager.prototype.removeLocalStorage = function(key) {
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      this.log('localStorage.removeItem failed:', e);
    }
  };

  StorageManager.prototype.setSessionStorage = function(key, value) {
    try {
      if (typeof Storage === 'undefined') return false;
      sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      this.log('sessionStorage.setItem failed:', e);
      return false;
    }
  };

  StorageManager.prototype.getSessionStorage = function(key) {
    try {
      if (typeof Storage === 'undefined') return null;
      var item = sessionStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch (e) {
        return item; // Return as string if not JSON
      }
    } catch (e) {
      this.log('sessionStorage.getItem failed:', e);
      return null;
    }
  };

  StorageManager.prototype.removeSessionStorage = function(key) {
    try {
      if (typeof Storage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      this.log('sessionStorage.removeItem failed:', e);
    }
  };

  StorageManager.prototype.setCookie = function(key, value) {
    try {
      if (typeof document === 'undefined') return false;
      
      var expires = new Date();
      expires.setTime(expires.getTime() + (this.options.cookieDays * 24 * 60 * 60 * 1000));
      
      var cookieString = key + '=' + encodeURIComponent(value) + '; expires=' + expires.toUTCString() + '; path=/';
      
      if (this.options.domain) {
        cookieString += '; domain=' + this.options.domain;
      }
      
      if (this.options.secure) {
        cookieString += '; secure';
      }
      
      cookieString += '; samesite=' + this.options.sameSite;
      
      document.cookie = cookieString;
      return true;
    } catch (e) {
      this.log('setCookie failed:', e);
      return false;
    }
  };

  StorageManager.prototype.getCookie = function(key) {
    try {
      if (typeof document === 'undefined') return null;
      
      var nameEQ = key + "=";
      var ca = document.cookie.split(';');
      
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          var value = decodeURIComponent(c.substring(nameEQ.length, c.length));
          return value;
        }
      }
      return null;
    } catch (e) {
      this.log('getCookie failed:', e);
      return null;
    }
  };

  StorageManager.prototype.removeCookie = function(key) {
    try {
      if (typeof document === 'undefined') return;
      document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (e) {
      this.log('removeCookie failed:', e);
    }
  };

  StorageManager.prototype.getDomain = function() {
    try {
      if (typeof location === 'undefined') return '';
      
      var hostname = location.hostname;
      var parts = hostname.split('.');
      
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (e) {
      this.log('getDomain failed:', e);
      return '';
    }
  };

  StorageManager.prototype.generateSessionId = function() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
  };

  StorageManager.prototype.log = function() {
    if (this.debug && typeof console !== 'undefined') {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[DinElportal Storage]');
      console.log.apply(console, args);
    }
  };

  // ===== Device Fingerprint =====
  var DeviceFingerprint = function(options) {
    this.options = {
      includeCanvas: options.includeCanvas !== false,
      includeWebGL: options.includeWebGL !== false,
      includeAudio: false, // Disabled by default
      debug: options.debug || false
    };
    this.debug = this.options.debug;
  };

  DeviceFingerprint.prototype.generate = function() {
    try {
      var data = this.collectFingerprint();
      var hash = this.hashFingerprint(data);
      this.log('Generated fingerprint:', hash, 'from data:', data);
      return hash;
    } catch (error) {
      this.log('Error generating fingerprint:', error);
      return this.getFallbackFingerprint();
    }
  };

  DeviceFingerprint.prototype.collectFingerprint = function() {
    var data = {
      screen: screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      timezone: new Date().getTimezoneOffset(),
      language: navigator.language || 'unknown',
      platform: navigator.platform || 'unknown',
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes'
    };

    if (this.options.includeCanvas) {
      data.canvas = this.getCanvasFingerprint();
    }

    if (this.options.includeWebGL) {
      data.webgl = this.getWebGLFingerprint();
    }

    return data;
  };

  DeviceFingerprint.prototype.getCanvasFingerprint = function() {
    try {
      if (typeof document === 'undefined') return undefined;

      var canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      
      var ctx = canvas.getContext('2d');
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

      var dataURL = canvas.toDataURL();
      return this.simpleHash(dataURL).substring(0, 16);
    } catch (error) {
      this.log('Canvas fingerprint failed:', error);
      return undefined;
    }
  };

  DeviceFingerprint.prototype.getWebGLFingerprint = function() {
    try {
      if (typeof document === 'undefined') return undefined;

      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return undefined;

      var info = {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
      };

      return this.simpleHash(JSON.stringify(info)).substring(0, 16);
    } catch (error) {
      this.log('WebGL fingerprint failed:', error);
      return undefined;
    }
  };

  DeviceFingerprint.prototype.hashFingerprint = function(data) {
    var components = [
      data.screen,
      data.timezone.toString(),
      data.language,
      data.platform,
      data.cookieEnabled.toString(),
      data.doNotTrack.toString(),
      data.canvas || '',
      data.webgl || ''
    ];

    var combined = components.join('|');
    return 'fp_' + this.simpleHash(combined);
  };

  DeviceFingerprint.prototype.getFallbackFingerprint = function() {
    try {
      var simple = [
        typeof screen !== 'undefined' ? screen.width + 'x' + screen.height : 'unknown',
        typeof navigator !== 'undefined' ? navigator.language : 'unknown',
        typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        new Date().getTimezoneOffset().toString()
      ].join('|');

      return 'fp_' + this.simpleHash(simple);
    } catch (error) {
      return 'fp_' + Date.now().toString(36) + Math.random().toString(36);
    }
  };

  DeviceFingerprint.prototype.simpleHash = function(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  DeviceFingerprint.prototype.log = function() {
    if (this.debug && typeof console !== 'undefined') {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[DinElportal Fingerprint]');
      console.log.apply(console, args);
    }
  };

  // ===== Conversion Detector =====
  var ConversionDetector = function(config) {
    this.config = {
      urlPatterns: (config.urlPatterns || []).concat([
        '/thank-you', '/thanks', '/tak', '/success', '/confirmation',
        '/bekraeftelse', '/gennemfoert', '/complete', '/welcome', '/velkommen'
      ]),
      enableFormDetection: config.enableFormDetection !== false,
      enableButtonDetection: config.enableButtonDetection !== false,
      debug: config.debug || false
    };
    this.debug = this.config.debug;
    this.detectedConversions = [];
  };

  ConversionDetector.prototype.initialize = function() {
    try {
      this.log('Initializing conversion detection');
      this.checkCurrentPage();
      this.log('Conversion detection initialized');
    } catch (error) {
      this.log('Error initializing conversion detection:', error);
    }
  };

  ConversionDetector.prototype.checkCurrentPage = function() {
    try {
      var url = typeof window !== 'undefined' ? window.location.href : '';
      var pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      
      var conversion = null;

      // URL-based detection
      if (this.checkUrlPatterns(pathname)) {
        conversion = {
          type: 'page_view',
          page_url: url,
          timestamp: Date.now(),
          confidence: 0.8,
          method: 'url_pattern'
        };
      }

      if (conversion) {
        this.detectedConversions.push(conversion);
        this.log('Conversion detected:', conversion);
      }

      return conversion;
    } catch (error) {
      this.log('Error checking current page:', error);
      return null;
    }
  };

  ConversionDetector.prototype.checkUrlPatterns = function(pathname) {
    var lowerPath = pathname.toLowerCase();
    for (var i = 0; i < this.config.urlPatterns.length; i++) {
      if (lowerPath.indexOf(this.config.urlPatterns[i]) !== -1) {
        return true;
      }
    }
    return false;
  };

  ConversionDetector.prototype.getDetectedConversions = function() {
    return this.detectedConversions.slice(); // Return copy
  };

  ConversionDetector.prototype.clearDetectedConversions = function() {
    this.detectedConversions = [];
  };

  ConversionDetector.prototype.cleanup = function() {
    this.log('Conversion detection cleaned up');
  };

  ConversionDetector.prototype.log = function() {
    if (this.debug && typeof console !== 'undefined') {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[DinElportal Conversion]');
      console.log.apply(console, args);
    }
  };

  // ===== Universal Tracker =====
  var UniversalTracker = function(config) {
    config = config || {};
    
    this.config = {
      endpoint: config.endpoint || 'https://dinelportal.dk/api/tracking/log',
      partner_id: config.partner_id || this.extractPartnerIdFromScript() || 'unknown',
      partner_domain: typeof location !== 'undefined' ? location.hostname : 'unknown',
      clickIdParam: config.clickIdParam || 'click_id',
      cookieDays: config.cookieDays || 90,
      domain: config.domain || this.getDomain(),
      enableAutoConversion: config.enableAutoConversion !== false,
      enableFingerprinting: config.enableFingerprinting !== false,
      enableFormTracking: config.enableFormTracking !== false,
      enableButtonTracking: config.enableButtonTracking !== false,
      conversionPatterns: config.conversionPatterns || [],
      debug: config.debug || false,
      respectDoNotTrack: config.respectDoNotTrack !== false,
      requireConsent: config.requireConsent || false
    };

    this.debug = this.config.debug;
    this.initialized = false;

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
  };

  UniversalTracker.prototype.initialize = function() {
    var self = this;
    
    try {
      if (self.initialized) return;

      self.log('Initializing DinElportal Universal Tracker');

      // Check GDPR compliance
      if (!self.isTrackingAllowed()) {
        self.log('Tracking not allowed (DNT or consent required)');
        return;
      }

      // Capture click_id from URL
      var urlClickId = self.extractClickIdFromUrl();
      
      // Get or generate tracking data
      var trackingData = self.storageManager.getData();
      
      if (!trackingData || self.shouldRefreshData(trackingData, urlClickId)) {
        trackingData = self.createTrackingData(urlClickId);
        self.storageManager.storeData(trackingData);
      }

      // Initialize conversion detection
      if (self.config.enableAutoConversion) {
        self.conversionDetector.initialize();
        
        // Check for immediate conversion
        var conversion = self.conversionDetector.checkCurrentPage();
        if (conversion) {
          self.handleConversion(conversion);
        }
      }

      self.initialized = true;
      self.log('Tracking initialized successfully', trackingData);

      // Send initial tracking event
      self.sendTrackingData(trackingData);

    } catch (error) {
      self.log('Error initializing tracker:', error);
    }
  };

  UniversalTracker.prototype.trackConversion = function(data) {
    var self = this;
    data = data || {};
    
    return new Promise(function(resolve) {
      try {
        var trackingData = self.storageManager.getData();
        if (!trackingData) {
          self.log('No tracking data available for conversion');
          resolve(false);
          return;
        }

        var conversionData = {
          click_id: trackingData.click_id,
          fingerprint: trackingData.fingerprint,
          session_id: trackingData.session_id,
          conversion_type: data.conversion_type || 'manual',
          conversion_value: data.conversion_value,
          page_url: typeof location !== 'undefined' ? location.href : '',
          timestamp: Date.now()
        };

        // Merge additional data
        for (var key in data) {
          if (data.hasOwnProperty(key) && !conversionData.hasOwnProperty(key)) {
            conversionData[key] = data[key];
          }
        }

        self.sendConversionData(conversionData, function(success) {
          self.log('Manual conversion tracked:', conversionData, 'Success:', success);
          resolve(success);
        });
      } catch (error) {
        self.log('Error tracking conversion:', error);
        resolve(false);
      }
    });
  };

  UniversalTracker.prototype.getTrackingData = function() {
    var data = this.storageManager.getData();
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
  };

  UniversalTracker.prototype.clearData = function() {
    this.storageManager.clear();
    this.conversionDetector.clearDetectedConversions();
    this.log('All tracking data cleared');
  };

  UniversalTracker.prototype.setConfig = function(newConfig) {
    for (var key in newConfig) {
      if (newConfig.hasOwnProperty(key)) {
        this.config[key] = newConfig[key];
      }
    }
    this.debug = this.config.debug || false;
    this.log('Configuration updated:', newConfig);
  };

  UniversalTracker.prototype.getConfig = function() {
    var config = {};
    for (var key in this.config) {
      if (this.config.hasOwnProperty(key)) {
        config[key] = this.config[key];
      }
    }
    return config;
  };

  UniversalTracker.prototype.setDebug = function(enabled) {
    this.debug = enabled;
    this.config.debug = enabled;
    this.log('Debug mode:', enabled ? 'enabled' : 'disabled');
  };

  UniversalTracker.prototype.cleanup = function() {
    this.conversionDetector.cleanup();
    this.initialized = false;
    this.log('Tracker cleaned up');
  };

  // Private methods
  UniversalTracker.prototype.createTrackingData = function(clickId) {
    var data = {
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
        data.fingerprint = this.fingerprinter.generate();
      } catch (error) {
        this.log('Fingerprinting failed:', error);
      }
    }

    return data;
  };

  UniversalTracker.prototype.shouldRefreshData = function(existing, newClickId) {
    // Refresh if we have a new click_id
    if (newClickId && newClickId !== existing.click_id) {
      return true;
    }

    // Refresh if data is too old (90 days)
    var maxAge = 90 * 24 * 60 * 60 * 1000;
    if (this.storageManager.isExpired(existing, maxAge)) {
      return true;
    }

    return false;
  };

  UniversalTracker.prototype.handleConversion = function(conversion) {
    var self = this;
    try {
      var trackingData = self.storageManager.getData();
      if (!trackingData) return;

      var conversionData = {
        click_id: trackingData.click_id,
        fingerprint: trackingData.fingerprint,
        session_id: trackingData.session_id,
        conversion_type: conversion.type,
        page_url: conversion.page_url,
        timestamp: conversion.timestamp,
        metadata: {
          confidence: conversion.confidence,
          method: conversion.method
        }
      };

      self.sendConversionData(conversionData, function(success) {
        self.log('Auto conversion tracked:', conversionData);
      });
    } catch (error) {
      self.log('Error handling conversion:', error);
    }
  };

  UniversalTracker.prototype.sendTrackingData = function(data, callback) {
    var self = this;
    try {
      var payload = {
        type: 'track',
        partner_id: self.config.partner_id,
        partner_domain: self.config.partner_domain,
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

      self.sendToEndpoint(payload, function(success) {
        if (callback) callback(success);
      });
    } catch (error) {
      self.log('Error sending tracking data:', error);
      if (callback) callback(false);
    }
  };

  UniversalTracker.prototype.sendConversionData = function(data, callback) {
    var self = this;
    try {
      var payload = {
        type: 'conversion',
        partner_id: self.config.partner_id,
        partner_domain: self.config.partner_domain,
        data: data
      };

      self.sendToEndpoint(payload, function(success) {
        if (callback) callback(success);
      });
    } catch (error) {
      self.log('Error sending conversion data:', error);
      if (callback) callback(false);
    }
  };

  UniversalTracker.prototype.sendToEndpoint = function(payload, callback) {
    var self = this;
    var endpoint = self.config.endpoint;
    
    if (typeof fetch !== 'undefined') {
      // Modern browser with fetch
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      }).then(function(response) {
        if (callback) callback(response.ok);
      }).catch(function(error) {
        self.log('Fetch error:', error);
        if (callback) callback(false);
      });
    } else if (typeof XMLHttpRequest !== 'undefined') {
      // Fallback to XHR
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (callback) callback(xhr.status === 200);
        }
      };
      xhr.send(JSON.stringify(payload));
    } else {
      // No way to send data
      self.log('No fetch or XHR available');
      if (callback) callback(false);
    }
  };

  UniversalTracker.prototype.extractClickIdFromUrl = function() {
    try {
      if (typeof URLSearchParams === 'undefined' || typeof location === 'undefined') {
        return null;
      }

      var params = new URLSearchParams(location.search);
      return params.get(this.config.clickIdParam) || null;
    } catch (error) {
      this.log('Error extracting click_id from URL:', error);
      return null;
    }
  };

  UniversalTracker.prototype.extractPartnerIdFromScript = function() {
    try {
      if (typeof document === 'undefined') return null;

      // Try to find the script tag and extract partner_id from URL
      var scripts = document.querySelectorAll('script[src*="dinelportal"]');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src');
        if (src) {
          var match = src.match(/[?&]partner_id=([^&]+)/);
          if (match) return match[1];
        }
      }

      return null;
    } catch (error) {
      this.log('Error extracting partner ID:', error);
      return null;
    }
  };

  UniversalTracker.prototype.getDomain = function() {
    try {
      if (typeof location === 'undefined') return '';
      
      var hostname = location.hostname;
      var parts = hostname.split('.');
      
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (error) {
      this.log('Error getting domain:', error);
      return '';
    }
  };

  UniversalTracker.prototype.isTrackingAllowed = function() {
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
        var consent = window.dinelportal_consent || 
                     window.gtag_consent ||
                     (localStorage.getItem('consent') === 'true');
        if (!consent) return false;
      }
    }

    return true;
  };

  UniversalTracker.prototype.log = function() {
    if (this.debug && typeof console !== 'undefined') {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[DinElportal Tracker]');
      console.log.apply(console, args);
    }
  };

  // ===== Global API Setup =====
  function createGlobalAPI() {
    try {
      if (typeof window === 'undefined') return;

      var tracker = new UniversalTracker(window.__DINELPORTAL_CONFIG || {});
      
      var api = {
        trackConversion: function(data) { return tracker.trackConversion(data); },
        getTrackingData: function() { return tracker.getTrackingData(); },
        clearData: function() { return tracker.clearData(); },
        setConfig: function(config) { return tracker.setConfig(config); },
        getConfig: function() { return tracker.getConfig(); },
        debug: function(enabled) { return tracker.setDebug(enabled); },
        version: '1.0.0'
      };

      // Create global namespace
      window.DinElportal = api;

      // Auto-initialize
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          tracker.initialize();
        });
      } else {
        tracker.initialize();
      }

      // Handle page unload
      window.addEventListener('beforeunload', function() {
        tracker.cleanup();
      });

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

  // Make constructor available for testing
  if (typeof window !== 'undefined') {
    window.DinElportalTracker = UniversalTracker;
  }

})(typeof window !== "undefined" ? window : this, typeof document !== "undefined" ? document : {});