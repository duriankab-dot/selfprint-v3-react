/**
 * Service Worker — § 37 Offline Journal Queue
 * - Cache static assets
 * - Background sync for journal queue
 * - Offline shell support
 */

const CACHE_NAME = 'selfprint-v1';
const SYNC_TAG = 'journal-sync';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching critical assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Some assets may not exist yet — that's OK
        console.warn('[SW] Some assets not cached');
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET, API calls (let them fail if offline)
  if (request.method !== 'GET') {
    return;
  }

  // API calls: network only
  if (request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return offline shell
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background Sync: sync journal queue when online
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncJournalQueue());
  }
});

/**
 * Sync journal queue
 * Called by: background sync + manual trigger from client
 */
async function syncJournalQueue() {
  try {
    // Post message to all clients to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_JOURNAL',
        data: { timestamp: new Date().toISOString() },
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'TRIGGER_SYNC') {
    syncJournalQueue();
  }
});
