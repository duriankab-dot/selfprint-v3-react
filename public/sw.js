/**
 * Service Worker — § 37 Offline Journal Queue
 * - Cache static assets (network-first strategy)
 * - Background sync for journal queue
 * - Offline shell support
 * - Robust cache versioning & lifecycle management
 */

// CACHE_VERSION: bump this on every deploy to force SW cleanup and re-cache
// CACHE_NAME: constructed from version for auto-invalidation across deploys
// v1→v3: fix 503 stale chunks (Session 4)
// v4→v5: aggressive cache-busting, network-first HTML, proper activate cleanup (Session 7 fix)
const CACHE_VERSION = 5;
const CACHE_NAME = `selfprint-v${CACHE_VERSION}`;
const SYNC_TAG = 'journal-sync';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache critical assets with error recovery
self.addEventListener('install', (event) => {
  console.log('[SW] Installing (v' + CACHE_VERSION + ')...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching critical assets to ' + CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
        console.log('[SW] All critical assets cached successfully');
      } catch (err) {
        // Some assets may 404 or network may be unavailable — that's OK
        // fetch handler will use network-first strategy as fallback
        console.warn('[SW] Some assets not cached during install:', err);
      }
    })()
  );
  self.skipWaiting();
});

// Activate: aggressively delete old cache versions + claim all clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating (v' + CACHE_VERSION + ')...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const deleteOld = cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((oldName) => {
          console.log('[SW] Deleting stale cache: ' + oldName);
          return caches.delete(oldName);
        });

      await Promise.all(deleteOld);
      console.log('[SW] Old caches cleaned, claiming all clients');
    })()
  );
  self.clients.claim();
});

// Fetch: network-first strategy with proper HTML handling
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET, API calls (let them fail if offline)
  if (request.method !== 'GET') {
    return;
  }

  // API calls: network only (no caching)
  if (request.url.includes('/api/')) {
    return;
  }

  // Document requests (HTML): network-first with aggressive timeout
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request, { signal: AbortSignal.timeout(5000) })
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
        .catch((err) => {
          // Network failed or timeout — try cache, else offline shell
          console.warn('[SW] Network failed for', request.url, '— checking cache');
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[SW] Serving cached document:', request.url);
              return cached;
            }
            // Fallback to cached index.html
            console.log('[SW] No cache, serving offline shell');
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Other assets: network-first with cache fallback
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
          // Return offline shell for documents
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

// Push Notifications: Master Direction §26-27
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) {
    console.warn('[SW] Empty push payload');
    return;
  }

  let title = 'Selfprint';
  let options = {
    badge: '/logo.png',
    icon: '/logo.png',
    tag: 'selfprint-notification',
    requireInteraction: false,
  };

  try {
    const payload = event.data.json();
    title = payload.title || title;
    options = {
      ...options,
      body: payload.body || 'You have a new message',
      data: payload.data || {},
      badge: payload.badge || options.badge,
      icon: payload.icon || options.icon,
    };
  } catch (_error) {
    // Fallback: treat data as text
    options.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(title, options).catch((err) => {
      console.error('[SW] Failed to show notification:', err);
    })
  );
});

// Notification Click: navigate to appropriate page
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if app is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })()
  );
});

// Notification Close: track engagement (optional)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  // Optional: send engagement analytics to backend
  // fetch('/api/analytics/notification', { method: 'POST', body: JSON.stringify({ action: 'close' }) })
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'TRIGGER_SYNC') {
    syncJournalQueue();
  }
});
