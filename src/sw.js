/**
 * Service Worker source — src/sw.js
 * Built by vite-plugin-pwa (strategies: 'injectManifest') → dist/sw.js
 *
 * PWA-PHASE2-001 (7 ก.ย. 2026): moved from public/sw.js (copied verbatim,
 * unprocessed) to this injectManifest source so hashed build assets
 * (JS/CSS chunks, icons, manifest.json, etc.) get real precaching —
 * `self.__WB_MANIFEST` below is replaced with the real asset list at
 * build time. Every existing handler (push §26-27, journal background
 * sync, notification click routing, cache versioning) is preserved
 * unchanged from the old public/sw.js — nothing was removed, only the
 * precache + Supabase data-cache pieces were added.
 *
 * Design note: workbox's precache/data-cache lookups are done via
 * `matchPrecache()` / `strategy.handle()` called manually *inside* the
 * single existing 'fetch' listener below, instead of using
 * `precacheAndRoute()` / `registerRoute()` (which each register their own
 * independent 'fetch' listener). Two independent listeners racing to call
 * `event.respondWith()` on the same event throws in the second one — this
 * keeps everything in one listener so there's exactly one respondWith()
 * per request, same as before.
 */

import { precache, matchPrecache, cleanupOutdatedCaches } from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Populate the hashed build-asset precache on install, and let workbox
// clean up its own stale precache versions on activate. This does NOT
// register a 'fetch' listener (that's what "AndRoute" would do) — matching
// requests are served via matchPrecache() inside the fetch handler below.
precache(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Supabase data API cache: twin_memories / decision_logs / daily_briefs
// (Master Direction Phase 2 — offline access to already-seen data).
// Stale-while-revalidate: serve the cached row set instantly, refresh in
// the background. Bounded + auto-expiring so it can't grow unbounded.
const dataCacheStrategy = new StaleWhileRevalidate({
  cacheName: 'selfprint-data-v1',
  plugins: [
    new CacheableResponsePlugin({ statuses: [0, 200] }),
    new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }),
  ],
});
const DATA_CACHE_TABLES_RE = /\/rest\/v1\/(twin_memories|decision_logs|daily_briefs)\b/;

// CACHE_VERSION: bump this on every deploy to force SW cleanup and re-cache
// CACHE_NAME: constructed from version for auto-invalidation across deploys
// v1→v3: fix 503 stale chunks (Session 4)
// v4→v5: aggressive cache-busting, network-first HTML, proper activate cleanup (Session 7 fix)
// v5→v6: SW-503-FIX — fallback to cache on non-2xx network response (503/502)
// v6→v7: PWA-PHASE2-001 — workbox precache + Supabase data cache added
const CACHE_VERSION = 7;
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
// PWA-PHASE2-001: keep workbox's own precache cache and the new
// selfprint-data-v1 cache — the old blanket "anything not CACHE_NAME"
// cleanup would otherwise wipe both of those out on every single activate.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating (v' + CACHE_VERSION + ')...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const KEEP_EXACT = new Set([CACHE_NAME, 'selfprint-data-v1']);
      const deleteOld = cacheNames
        .filter((name) => !KEEP_EXACT.has(name) && !name.startsWith('workbox-precache'))
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

  const url = new URL(request.url);

  // PWA-PHASE2-001: Supabase data API — stale-while-revalidate
  if (DATA_CACHE_TABLES_RE.test(url.pathname)) {
    event.respondWith(dataCacheStrategy.handle({ event, request }));
    return;
  }

  // Document requests (HTML): network-first with aggressive timeout
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request, { signal: AbortSignal.timeout(5000) })
        .then((response) => {
          if (response.ok) {
            // Cache successful responses
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
            return response;
          }
          // SW-503-FIX: non-2xx from server (503, 502, etc.) — do NOT pass
          // the error response to the page. Fall back to cache so the user
          // sees a working page instead of a blank/error screen.
          console.warn('[SW] Network returned', response.status, 'for', request.url, '— checking cache');
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[SW] Serving cached document:', request.url);
              return cached;
            }
            console.log('[SW] No cache — serving branded offline page');
            return caches.match('/offline.html').then((offline) => offline || caches.match('/index.html'));
          });
        })
        .catch((err) => {
          // Network failed or timeout — try cache, else branded offline page
          console.warn('[SW] Network failed for', request.url, '— checking cache');
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[SW] Serving cached document:', request.url);
              return cached;
            }
            console.log('[SW] No cache — serving branded offline page');
            return caches.match('/offline.html').then((offline) => offline || caches.match('/index.html'));
          });
        })
    );
    return;
  }

  // Other assets: workbox precache first (hashed build assets), then
  // fall back to the existing network-first-with-cache-fallback strategy.
  event.respondWith(
    matchPrecache(request).then((precached) => {
      if (precached) {
        return precached;
      }
      return fetch(request)
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
            return new Response('Offline', { status: 503 });
          });
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
    badge: '/icons/icon-192x192.png',
    icon: '/icons/icon-192x192.png',
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
