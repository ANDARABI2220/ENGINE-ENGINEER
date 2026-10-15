// AfghanaBuild Service Worker
// Version: 1.0.0
// Caching Strategy: Stale-While-Revalidate for app shell and assets; Network-first for dynamic APIs with offline fallback

const CACHE_NAME = 'afghanabuild-shell-v1';
const DYNAMIC_CACHE_NAME = 'afghanabuild-runtime-v1';

// Critical shell resources to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Pre-cache core shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[ServiceWorker] Some pre-cache assets could not be loaded immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!allowedCaches.includes(cacheName)) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Implement Stale-While-Revalidate for assets, HTML, fonts, and scripts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET requests (POST, PUT, DELETE should hit network directly or queue locally)
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests: network first with JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            message: 'سیستم در حالت آفلاین است. داده‌ها از حافظه محلی بازیابی می‌شوند.',
            timestamp: new Date().toISOString()
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          }
        );
      })
    );
    return;
  }

  // Stale-While-Revalidate strategy for static resources, navigation, scripts, styles, images & fonts
  event.respondWith(
    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Asynchronously fetch from network to revalidate and update cache
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            // Network failure: cached response will serve, or return root shell for navigation
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return cachedResponse || Promise.reject(err);
          });

        // Return cached response immediately if available (Fast/Instant response), else wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Background Sync Event Listener
self.addEventListener('sync', (event) => {
  if (event.tag === 'afghanabuild-sync-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TRIGGER_BACKGROUND_SYNC',
            timestamp: Date.now()
          });
        });
      })
    );
  }
});

// Listen for messages from client (e.g. skipWaiting trigger)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
