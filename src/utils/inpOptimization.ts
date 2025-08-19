/**
 * INP (Interaction to Next Paint) Optimization Utilities
 * Optimizes user interactions for better Core Web Vitals scores
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounces a function to prevent excessive calls
 * Crucial for INP optimization on input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;

  const leading = options?.leading ?? false;
  const trailing = options?.trailing ?? true;

  const later = () => {
    timeout = null;
    if (trailing && lastArgs) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
  };

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    if (leading && !timeout) {
      result = func.apply(this, args);
    }

    timeout = setTimeout(later, wait);
    return result;
  };
}

/**
 * Throttles a function to limit execution frequency
 * Useful for scroll and resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, Math.max(limit - (Date.now() - lastRan), 0));
    }
  };
}

/**
 * React hook for optimized event handlers
 * Automatically debounces to improve INP
 */
export function useOptimizedHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback(
    debounce((...args: Parameters<T>) => {
      handlerRef.current(...args);
    }, delay) as T,
    [delay, handlerRef, ...deps]
  );
}

/**
 * Schedules work to be done when the browser is idle
 * Prevents blocking the main thread during interactions
 */
export function scheduleIdleWork(callback: () => void, timeout?: number): number {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      return (window as any).requestIdleCallback(callback, { timeout });
    } else {
      // Fallback for browsers without requestIdleCallback
      return (window as typeof globalThis).setTimeout(callback, 1) as unknown as number;
    }
  }
  // Server-side fallback
  return 0;
}

/**
 * Cancels scheduled idle work
 */
export function cancelIdleWork(id: number): void {
  if (typeof window !== 'undefined') {
    if ('cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(id);
    } else {
      (window as typeof globalThis).clearTimeout(id);
    }
  }
}

/**
 * Batches multiple DOM updates into a single repaint
 * Crucial for reducing INP when updating multiple elements
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  } else {
    updates.forEach(update => update());
  }
}

/**
 * React hook for passive event listeners
 * Improves scrolling performance and INP
 */
export function usePassiveEventListener(
  eventName: string,
  handler: EventListener,
  element?: HTMLElement | Window | null,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element ?? window;
    if (!targetElement || !targetElement.addEventListener) return;

    const eventListener: EventListener = (event) => savedHandler.current(event);
    const listenerOptions = { passive: true, ...options };

    targetElement.addEventListener(eventName, eventListener, listenerOptions);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, listenerOptions);
    };
  }, [eventName, element, options]);
}

/**
 * Optimizes input handlers to prevent INP issues
 * Use this for search inputs, forms, etc.
 */
export function optimizeInputHandler(
  handler: (value: string) => void,
  options?: {
    debounceMs?: number;
    trimWhitespace?: boolean;
    minLength?: number;
  }
) {
  const { debounceMs = 300, trimWhitespace = true, minLength = 0 } = options || {};
  
  const debouncedHandler = debounce(handler, debounceMs);
  
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = event.target.value;
    
    if (trimWhitespace) {
      value = value.trim();
    }
    
    if (value.length >= minLength) {
      debouncedHandler(value);
    }
  };
}

/**
 * React hook for intersection observer with INP optimization
 * Defers non-critical work when elements come into view
 */
export function useOptimizedIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observe = useCallback((element: HTMLElement | null) => {
    if (observer.current) {
      observer.current.disconnect();
    }

    if (!element) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Schedule callback during idle time to not block interactions
            scheduleIdleWork(() => {
              callbackRef.current(entry);
            });
          }
        });
      },
      options
    );

    observer.current.observe(element);
  }, [options]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return observe;
}

/**
 * Monitors and logs slow interactions for debugging
 */
export function monitorINP() {
  if (!('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 200) { // INP threshold
          console.warn(`Slow interaction detected:`, {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            processingStart: (entry as any).processingStart,
            processingEnd: (entry as any).processingEnd,
          });
        }
      }
    });

    // Observe event timing (for INP)
    observer.observe({ type: 'event', buffered: true });
  } catch (e) {
    // Some browsers don't support event timing yet
    console.log('Event timing not supported');
  }
}