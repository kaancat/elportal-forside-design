import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

interface VitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  navigationType?: string;
}

// Thresholds based on Google's 2025 Core Web Vitals standards
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 },    // Interaction to Next Paint (2025 standard)
  CLS: { good: 0.1, poor: 0.25 },   // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },  // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },  // Time to First Byte
};

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value > threshold.poor) return 'poor';
  return 'needs-improvement';
}

function sendToAnalytics(data: VitalsData) {
  // Log to console in development
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const emoji = data.rating === 'good' ? '✅' : data.rating === 'poor' ? '❌' : '⚠️';
    console.log(`${emoji} Core Web Vital [${data.name}]: ${data.value.toFixed(2)}ms (${data.rating})`);
  }

  // Send to analytics endpoint (if configured)
  const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (analyticsEndpoint) {
    const body = JSON.stringify({
      ...data,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(analyticsEndpoint, body);
    } else {
      // Fallback to fetch
      fetch(analyticsEndpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't interrupt user experience
      });
    }
  }

  // Store in localStorage for local monitoring
  try {
    const vitals = JSON.parse(localStorage.getItem('webVitals') || '[]');
    vitals.push({
      ...data,
      timestamp: Date.now(),
      url: window.location.pathname,
    });
    // Keep only last 50 entries
    if (vitals.length > 50) {
      vitals.shift();
    }
    localStorage.setItem('webVitals', JSON.stringify(vitals));
  } catch (e) {
    // Ignore storage errors
  }
}

function handleMetric(metric: Metric) {
  const data: VitalsData = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType,
  };

  sendToAnalytics(data);

  // Trigger custom event for other components to listen to
  window.dispatchEvent(new CustomEvent('web-vitals', { detail: data }));
}

export function initWebVitals() {
  // Core Web Vitals (2025 standards)
  onLCP(handleMetric);  // Largest Contentful Paint
  onINP(handleMetric);  // Interaction to Next Paint (replaced FID in 2024)
  onCLS(handleMetric);  // Cumulative Layout Shift
  
  // Additional metrics for comprehensive monitoring
  onFCP(handleMetric);  // First Contentful Paint
  onTTFB(handleMetric); // Time to First Byte
}

// Get stored vitals for debugging/monitoring
export function getStoredVitals(): VitalsData[] {
  try {
    return JSON.parse(localStorage.getItem('webVitals') || '[]');
  } catch {
    return [];
  }
}

// Clear stored vitals
export function clearStoredVitals() {
  localStorage.removeItem('webVitals');
}

// Performance observer for custom metrics
export function observePerformance() {
  if (!('PerformanceObserver' in window)) return;

  // Monitor long tasks for INP optimization
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`Long task detected: ${entry.duration}ms`, entry);
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Some browsers don't support longtask
  }

  // Monitor resource timing
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.duration > 1000) { // Resources taking >1s
          console.warn(`Slow resource: ${resourceEntry.name} (${resourceEntry.duration}ms)`);
        }
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // Fallback for browsers without resource timing
  }
}

// Export vitals data for debugging
export function exportVitalsData() {
  const data = getStoredVitals();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-vitals-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
