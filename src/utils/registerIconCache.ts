// Register icon cache service worker
export function registerIconCacheServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/icon-cache-sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[Icon Cache] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[Icon Cache] Service Worker registration failed:', error);
        });
    });
  }
}