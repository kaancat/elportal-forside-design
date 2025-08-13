/**
 * StorageManager - Multi-storage persistence for tracking data
 * Handles localStorage, sessionStorage, and first-party cookies
 * GDPR compliant - no personal data collection
 */

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

export interface StorageOptions {
  cookieDays?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  debug?: boolean;
}

export class StorageManager {
  private readonly CLICK_ID_KEY = 'dinelportal_click_id';
  private readonly FINGERPRINT_KEY = 'dinelportal_fp';
  private readonly SESSION_KEY = 'dinelportal_session';
  private readonly DATA_KEY = 'dinelportal_data';
  
  private options: Required<StorageOptions>;
  private debug: boolean;

  constructor(options: StorageOptions = {}) {
    this.options = {
      cookieDays: options.cookieDays ?? 90,
      domain: options.domain ?? this.getDomain(),
      secure: options.secure ?? (location.protocol === 'https:'),
      sameSite: options.sameSite ?? 'Lax',
      debug: options.debug ?? false
    };
    this.debug = this.options.debug;
  }

  /**
   * Store tracking data in all available storage methods
   */
  public storeData(data: Partial<StorageData>): boolean {
    try {
      const completeData: StorageData = {
        timestamp: Date.now(),
        session_id: this.getOrCreateSessionId(),
        source: 'storage',
        ...data
      };

      const success = {
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
      return Object.values(success).some(s => s); // At least one succeeded

    } catch (error) {
      this.log('Error storing data:', error);
      return false;
    }
  }

  /**
   * Retrieve tracking data with fallback priority
   */
  public getData(): StorageData | null {
    try {
      // Priority: sessionStorage > localStorage > cookie
      let data = this.getSessionStorage(this.DATA_KEY) as StorageData;
      if (!data) {
        data = this.getLocalStorage(this.DATA_KEY) as StorageData;
      }
      if (!data) {
        const cookieData = this.getCookie(this.DATA_KEY);
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
        const click_id = this.getClickId();
        const fingerprint = this.getFingerprint();
        const session_id = this.getOrCreateSessionId();

        if (click_id || fingerprint) {
          data = {
            click_id,
            fingerprint,
            session_id,
            timestamp: Date.now(),
            source: 'storage'
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
  }

  /**
   * Get click_id from any available storage
   */
  public getClickId(): string | null {
    return this.getSessionStorage(this.CLICK_ID_KEY) ||
           this.getLocalStorage(this.CLICK_ID_KEY) ||
           this.getCookie(this.CLICK_ID_KEY);
  }

  /**
   * Get fingerprint from storage
   */
  public getFingerprint(): string | null {
    return this.getLocalStorage(this.FINGERPRINT_KEY) ||
           this.getCookie(this.FINGERPRINT_KEY);
  }

  /**
   * Get or create session ID
   */
  public getOrCreateSessionId(): string {
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
  public clear(): void {
    try {
      // Clear individual keys
      [this.CLICK_ID_KEY, this.FINGERPRINT_KEY, this.SESSION_KEY, this.DATA_KEY].forEach(key => {
        this.removeLocalStorage(key);
        this.removeSessionStorage(key);
        this.removeCookie(key);
      });

      this.log('All tracking data cleared');
    } catch (error) {
      this.log('Error clearing data:', error);
    }
  }

  /**
   * Check if data is expired
   */
  public isExpired(data: StorageData, maxAgeMs: number = 90 * 24 * 60 * 60 * 1000): boolean {
    return (Date.now() - data.timestamp) > maxAgeMs;
  }

  // Private storage methods with error handling

  private setLocalStorage(key: string, value: any): boolean {
    try {
      if (typeof Storage === 'undefined') return false;
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      this.log('localStorage.setItem failed:', e);
      return false;
    }
  }

  private getLocalStorage(key: string): any {
    try {
      if (typeof Storage === 'undefined') return null;
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch {
        return item; // Return as string if not JSON
      }
    } catch (e) {
      this.log('localStorage.getItem failed:', e);
      return null;
    }
  }

  private removeLocalStorage(key: string): void {
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      this.log('localStorage.removeItem failed:', e);
    }
  }

  private setSessionStorage(key: string, value: any): boolean {
    try {
      if (typeof Storage === 'undefined') return false;
      sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (e) {
      this.log('sessionStorage.setItem failed:', e);
      return false;
    }
  }

  private getSessionStorage(key: string): any {
    try {
      if (typeof Storage === 'undefined') return null;
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item);
      } catch {
        return item; // Return as string if not JSON
      }
    } catch (e) {
      this.log('sessionStorage.getItem failed:', e);
      return null;
    }
  }

  private removeSessionStorage(key: string): void {
    try {
      if (typeof Storage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      this.log('sessionStorage.removeItem failed:', e);
    }
  }

  private setCookie(key: string, value: string): boolean {
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
      this.log('setCookie failed:', e);
      return false;
    }
  }

  private getCookie(key: string): string | null {
    try {
      if (typeof document === 'undefined') return null;
      
      const nameEQ = key + "=";
      const ca = document.cookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    } catch (e) {
      this.log('getCookie failed:', e);
      return null;
    }
  }

  private removeCookie(key: string): void {
    try {
      if (typeof document === 'undefined') return;
      
      let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      
      if (this.options.domain) {
        cookieString += `; domain=${this.options.domain}`;
      }
      
      document.cookie = cookieString;
    } catch (e) {
      this.log('removeCookie failed:', e);
    }
  }

  private getDomain(): string {
    try {
      if (typeof location === 'undefined') return '';
      
      const hostname = location.hostname;
      const parts = hostname.split('.');
      
      // For subdomains, use parent domain for cookie sharing
      if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
      }
      
      return hostname;
    } catch (e) {
      this.log('getDomain failed:', e);
      return '';
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private log(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Storage]', ...args);
    }
  }
}