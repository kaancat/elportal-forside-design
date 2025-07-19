// Icon Cache Service Worker
// This service worker caches icon requests from Iconify API to prevent network failures

const ICON_CACHE_NAME = 'elportal-icons-v1';
const ICON_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// URLs to cache
const ICON_URL_PATTERNS = [
  /api\.iconify\.design/,
  /\/icons\//
];

// Check if URL should be cached
function shouldCacheRequest(url) {
  return ICON_URL_PATTERNS.some(pattern => pattern.test(url));
}

// Install event - cache critical icons
self.addEventListener('install', (event) => {
  console.log('[Icon SW] Installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Icon SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('elportal-icons-') && name !== ICON_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle icon requests
  if (!shouldCacheRequest(url)) {
    return;
  }

  event.respondWith(
    caches.open(ICON_CACHE_NAME).then(async (cache) => {
      // Try cache first
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        // Check if cache is still fresh
        const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0);
        const now = new Date();
        
        if (now - cachedDate < ICON_CACHE_DURATION) {
          console.log('[Icon SW] Serving from cache:', url);
          return cachedResponse;
        }
      }

      // Fetch from network
      try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
          // Clone the response before caching
          const responseToCache = networkResponse.clone();
          
          // Add cache timestamp
          const headers = new Headers(responseToCache.headers);
          headers.set('sw-cached-date', new Date().toISOString());
          
          const modifiedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          // Don't await - cache in background
          cache.put(request, modifiedResponse);
          console.log('[Icon SW] Cached from network:', url);
        }
        
        return networkResponse;
      } catch (error) {
        console.error('[Icon SW] Network failed, trying cache:', error);
        
        // If network fails, try stale cache
        if (cachedResponse) {
          console.log('[Icon SW] Serving stale cache:', url);
          return cachedResponse;
        }
        
        // Return a placeholder response if all else fails
        return new Response(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>`,
          {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml' }
          }
        );
      }
    })
  );
});