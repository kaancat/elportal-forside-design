/**
 * Production-safe debug utility
 * Logs are always shown to help debug production issues
 */

export const debug = {
  log: (...args: any[]) => {
    // Always log in production to help debug issues
    console.log('[ElPortal Debug]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[ElPortal Error]', ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn('[ElPortal Warning]', ...args);
  },
  
  trace: (label: string, data?: any) => {
    console.log(`[ElPortal Trace] ${label}`, data || '');
  },
  
  component: (name: string, action: string, data?: any) => {
    console.log(`[Component: ${name}] ${action}`, data || '');
  }
};

// Global flag to check if debug logs are working
if (typeof window !== 'undefined') {
  (window as any).__ELPORTAL_DEBUG__ = true;
  debug.log('Debug utility initialized');
}