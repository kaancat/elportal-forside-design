/**
 * Client-side rate limiter for API calls
 * Helps prevent 429 errors by tracking and limiting request frequency
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMs?: number;
}

interface RateLimitState {
  requests: number[];
  lastError?: number;
  backoffUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitConfig> = new Map();
  private states: Map<string, RateLimitState> = new Map();

  constructor() {
    // Configure rate limits for different API endpoints
    this.limits.set('eloverblik-auth', {
      maxRequests: 2,
      windowMs: 60 * 1000, // 2 requests per minute
      backoffMs: 60 * 1000, // 1 minute backoff on 429
    });

    this.limits.set('eloverblik-consumption', {
      maxRequests: 5,
      windowMs: 60 * 1000, // 5 requests per minute
      backoffMs: 30 * 1000, // 30 second backoff on 429
    });

    this.limits.set('eloverblik-default', {
      maxRequests: 10,
      windowMs: 60 * 1000, // 10 requests per minute
      backoffMs: 20 * 1000, // 20 second backoff
    });
  }

  /**
   * Check if a request is allowed based on rate limits
   */
  canMakeRequest(endpoint: string): { allowed: boolean; retryAfter?: number } {
    const config = this.limits.get(endpoint) || this.limits.get('eloverblik-default')!;
    const state = this.states.get(endpoint) || { requests: [] };
    const now = Date.now();

    // Check if we're in backoff period
    if (state.backoffUntil && now < state.backoffUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((state.backoffUntil - now) / 1000),
      };
    }

    // Clean up old requests outside the window
    state.requests = state.requests.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    // Check if we've hit the rate limit
    if (state.requests.length >= config.maxRequests) {
      const oldestRequest = state.requests[0];
      const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
      return {
        allowed: false,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    return { allowed: true };
  }

  /**
   * Record a request
   */
  recordRequest(endpoint: string): void {
    const state = this.states.get(endpoint) || { requests: [] };
    state.requests.push(Date.now());
    this.states.set(endpoint, state);
  }

  /**
   * Record a 429 error and set backoff
   */
  record429Error(endpoint: string, retryAfterSeconds?: number): void {
    const config = this.limits.get(endpoint) || this.limits.get('eloverblik-default')!;
    const state = this.states.get(endpoint) || { requests: [] };
    const now = Date.now();

    // Use server's retry-after if provided, otherwise use configured backoff
    const backoffMs = retryAfterSeconds 
      ? retryAfterSeconds * 1000 
      : config.backoffMs || 30000;

    state.lastError = now;
    state.backoffUntil = now + backoffMs;
    this.states.set(endpoint, state);
  }

  /**
   * Clear rate limit state for an endpoint
   */
  clearState(endpoint: string): void {
    this.states.delete(endpoint);
  }

  /**
   * Get remaining time until rate limit resets
   */
  getTimeUntilReset(endpoint: string): number {
    const state = this.states.get(endpoint);
    if (!state) return 0;

    const now = Date.now();
    
    // If in backoff, return time until backoff ends
    if (state.backoffUntil && now < state.backoffUntil) {
      return Math.ceil((state.backoffUntil - now) / 1000);
    }

    // If at rate limit, return time until oldest request expires
    const config = this.limits.get(endpoint) || this.limits.get('eloverblik-default')!;
    if (state.requests.length >= config.maxRequests) {
      const oldestRequest = state.requests[0];
      return Math.ceil((oldestRequest + config.windowMs - now) / 1000);
    }

    return 0;
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Debounce function with cancellation support
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, lastArgs!);
      timeout = null;
      lastArgs = null;
    }, wait);
  } as T;

  (debounced as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      lastArgs = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

/**
 * Throttle function that ensures minimum time between calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean = false;
  let lastResult: any;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  } as T;
}

/**
 * Exponential backoff helper
 */
export function getExponentialBackoffDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return Math.floor(delay + jitter);
}

/**
 * Sleep helper for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default rateLimiter;