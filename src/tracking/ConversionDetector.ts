/**
 * ConversionDetector - Auto-detect conversion pages and events
 * Supports multiple detection methods: URL patterns, page content, form submissions
 */

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
  // URL patterns for conversion pages
  urlPatterns: string[];
  // Page title patterns
  titlePatterns: string[];
  // Content selectors that indicate conversion
  contentSelectors: string[];
  // Form selectors to monitor
  formSelectors: string[];
  // Button selectors for conversion actions
  buttonSelectors: string[];
  // Custom conversion functions
  customDetectors: Array<() => boolean>;
  // Enable different detection methods
  enableUrlDetection: boolean;
  enableContentDetection: boolean;
  enableFormDetection: boolean;
  enableButtonDetection: boolean;
  debug: boolean;
}

export class ConversionDetector {
  private config: ConversionConfig;
  private debug: boolean;
  private observers: MutationObserver[] = [];
  private eventListeners: Array<{ element: Element; event: string; handler: EventListener }> = [];
  private detectedConversions: ConversionEvent[] = [];

  constructor(config: Partial<ConversionConfig> = {}) {
    this.config = {
      // Default Danish and English conversion URL patterns
      urlPatterns: [
        '/thank-you',
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
      titlePatterns: [
        'thank you',
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
      contentSelectors: [
        '.success-message',
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
      formSelectors: [
        'form[action*="checkout"]',
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
      buttonSelectors: [
        'button[type="submit"]',
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

      customDetectors: config.customDetectors || [],
      enableUrlDetection: config.enableUrlDetection ?? true,
      enableContentDetection: config.enableContentDetection ?? true,
      enableFormDetection: config.enableFormDetection ?? true,
      enableButtonDetection: config.enableButtonDetection ?? true,
      debug: config.debug ?? false
    };

    this.debug = this.config.debug;
  }

  /**
   * Initialize conversion detection
   */
  public initialize(): void {
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
      this.log('Error initializing conversion detection:', error);
    }
  }

  /**
   * Check if current page is a conversion page
   */
  public checkCurrentPage(): ConversionEvent | null {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      
      let conversion: ConversionEvent | null = null;

      // URL-based detection
      if (this.config.enableUrlDetection && this.checkUrlPatterns(pathname)) {
        conversion = {
          type: 'page_view',
          page_url: url,
          timestamp: Date.now(),
          confidence: 'high',
          method: 'url_pattern'
        };
      }

      // Title-based detection
      if (!conversion && typeof document !== 'undefined') {
        const title = document.title.toLowerCase();
        if (this.checkTitlePatterns(title)) {
          conversion = {
            type: 'page_view',
            page_url: url,
            timestamp: Date.now(),
            confidence: 'medium',
            method: 'title_pattern'
          };
        }
      }

      // Content-based detection
      if (!conversion && this.config.enableContentDetection) {
        const contentMatch = this.checkContentSelectors();
        if (contentMatch) {
          conversion = {
            type: 'page_view',
            page_url: url,
            timestamp: Date.now(),
            confidence: 'medium',
            method: 'content_selector',
            metadata: { selector: contentMatch }
          };
        }
      }

      // Custom detectors
      if (!conversion) {
        for (const detector of this.config.customDetectors) {
          try {
            if (detector()) {
              conversion = {
                type: 'custom',
                page_url: url,
                timestamp: Date.now(),
                confidence: 'high',
                method: 'custom_detector'
              };
              break;
            }
          } catch (error) {
            this.log('Custom detector error:', error);
          }
        }
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
  }

  /**
   * Get all detected conversions
   */
  public getDetectedConversions(): ConversionEvent[] {
    return [...this.detectedConversions];
  }

  /**
   * Clear detected conversions
   */
  public clearDetectedConversions(): void {
    this.detectedConversions = [];
  }

  /**
   * Cleanup event listeners and observers
   */
  public cleanup(): void {
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
      this.log('Error during cleanup:', error);
    }
  }

  // Private detection methods

  private checkUrlPatterns(pathname: string): boolean {
    const lowerPath = pathname.toLowerCase();
    return this.config.urlPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        return regex.test(lowerPath);
      }
      return lowerPath.includes(pattern.toLowerCase());
    });
  }

  private checkTitlePatterns(title: string): boolean {
    return this.config.titlePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        return regex.test(title);
      }
      return title.includes(pattern.toLowerCase());
    });
  }

  private checkContentSelectors(): string | null {
    if (typeof document === 'undefined') return null;

    for (const selector of this.config.contentSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          return selector;
        }
      } catch (error) {
        this.log('Invalid selector:', selector, error);
      }
    }
    return null;
  }

  private setupMutationObserver(): void {
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
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  private setupFormMonitoring(): void {
    if (typeof document === 'undefined') return;

    const monitorForm = (form: HTMLFormElement) => {
      const handler = (event: Event) => {
        const conversion: ConversionEvent = {
          type: 'form_submit',
          page_url: window.location.href,
          timestamp: Date.now(),
          confidence: 'high',
          method: 'form_submit',
          metadata: {
            form_action: form.action,
            form_method: form.method,
            form_id: form.id,
            form_class: form.className
          }
        };

        this.detectedConversions.push(conversion);
        this.log('Form conversion detected:', conversion);
      };

      form.addEventListener('submit', handler);
      this.eventListeners.push({ element: form, event: 'submit', handler });
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
        this.log('Form selector error:', selector, error);
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
                this.log('Dynamic form selector error:', selector, error);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);
  }

  private setupButtonMonitoring(): void {
    if (typeof document === 'undefined') return;

    const monitorButton = (button: Element) => {
      const handler = (event: Event) => {
        const conversion: ConversionEvent = {
          type: 'button_click',
          page_url: window.location.href,
          timestamp: Date.now(),
          confidence: 'medium',
          method: 'button_click',
          metadata: {
            button_text: button.textContent?.trim(),
            button_id: (button as HTMLElement).id,
            button_class: button.className,
            button_type: button.getAttribute('type')
          }
        };

        this.detectedConversions.push(conversion);
        this.log('Button conversion detected:', conversion);
      };

      button.addEventListener('click', handler);
      this.eventListeners.push({ element: button, event: 'click', handler });
    };

    // Monitor existing buttons
    this.config.buttonSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(monitorButton);
      } catch (error) {
        this.log('Button selector error:', selector, error);
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
                this.log('Dynamic button selector error:', selector, error);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);
  }

  private log(...args: any[]): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log('[DinElportal Conversion]', ...args);
    }
  }
}