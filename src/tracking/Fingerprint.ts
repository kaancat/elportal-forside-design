/**
 * Fingerprint - GDPR-compliant device fingerprinting for tracking fallback
 * Uses only technical browser characteristics, no personal data
 */

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

export class DeviceFingerprint {
  private options: Required<FingerprintOptions>;
  private debug: boolean;

  constructor(options: FingerprintOptions = {}) {
    this.options = {
      includeCanvas: options.includeCanvas ?? true,
      includeWebGL: options.includeWebGL ?? true,
      includeAudio: options.includeAudio ?? false, // Audio can be unreliable
      debug: options.debug ?? false
    };
    this.debug = this.options.debug;
  }

  /**
   * Generate device fingerprint hash
   */
  public async generate(): Promise<string> {
    try {
      const data = await this.collectFingerprint();
      const hash = this.hashFingerprint(data);
      
      this.log('Generated fingerprint:', hash, 'from data:', data);
      return hash;
    } catch (error) {
      this.log('Error generating fingerprint:', error);
      // Fallback to simple hash
      return this.getFallbackFingerprint();
    }
  }

  /**
   * Collect all fingerprint data points
   */
  private async collectFingerprint(): Promise<FingerprintData> {
    const data: FingerprintData = {
      // Screen characteristics
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      
      // Timezone (offset only, not location)
      timezone: new Date().getTimezoneOffset(),
      
      // Language preferences
      language: navigator.language || 'unknown',
      
      // Platform information
      platform: navigator.platform || 'unknown',
      
      // Privacy settings
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
    };

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
  private async getCanvasFingerprint(): Promise<string | undefined> {
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
      this.log('Canvas fingerprint failed:', error);
      return undefined;
    }
  }

  /**
   * Generate WebGL fingerprint
   */
  private getWebGLFingerprint(): string | undefined {
    try {
      if (typeof document === 'undefined') return undefined;

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return undefined;

      // Type assertion for WebGL context
      const webgl = gl as WebGLRenderingContext;

      const info = {
        vendor: webgl.getParameter(webgl.VENDOR),
        renderer: webgl.getParameter(webgl.RENDERER),
        version: webgl.getParameter(webgl.VERSION),
        shadingLanguageVersion: webgl.getParameter(webgl.SHADING_LANGUAGE_VERSION),
        extensions: webgl.getSupportedExtensions()?.join(',') || ''
      };

      return this.simpleHash(JSON.stringify(info)).substring(0, 16);
    } catch (error) {
      this.log('WebGL fingerprint failed:', error);
      return undefined;
    }
  }

  /**
   * Generate audio fingerprint (may be unreliable)
   */
  private async getAudioFingerprint(): Promise<string | undefined> {
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
      this.log('Audio fingerprint failed:', error);
      return undefined;
    }
  }

  /**
   * Create hash from fingerprint data
   */
  private hashFingerprint(data: FingerprintData): string {
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
  private getFallbackFingerprint(): string {
    try {
      const simple = [
        typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        typeof navigator !== 'undefined' ? navigator.language : 'unknown',
        typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
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
  private simpleHash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if fingerprint is stable (for testing)
   */
  public async isStable(): Promise<boolean> {
    try {
      const fp1 = await this.generate();
      // Wait a small amount and generate again
      await new Promise(resolve => setTimeout(resolve, 100));
      const fp2 = await this.generate();
      
      const stable = fp1 === fp2;
      this.log('Fingerprint stability check:', { fp1, fp2, stable });
      return stable;
    } catch (error) {
      this.log('Stability check failed:', error);
      return false;
    }
  }

  private log(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Fingerprint]', ...args);
    }
  }
}

// Extend Window interface for audio context
declare global {
  interface Window {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}