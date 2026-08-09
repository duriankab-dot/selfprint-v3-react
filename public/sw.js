/**
 * Selfprint Service Worker
 * Master Direction §35-37: Full PWA — Installable, Offline Shell, Cache Critical Assets
 *
 * Strategy:
 *   Static assets (JS/CSS/images) → Cache-first (versioned cache)
 *   HTML navigation             → Network-first, fallback to /index.html offline shell
 *   Supabase API calls          → Network-only (realtime data must be fresh)
 *   /api/* calls                → Network-first, no cache (auth-gated)
 *
 * Update flow:
 *   1. New SW detected → skipWaiting() → clients.claim()
 *   2. App receives 'SW_UPDATED' message → prompts user to reload
 */

const CACHE_VERSION = 'selfprint-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

/** App shell — files to pre-cache on install for offline support */
const SHELL_URLS = [
  '/',
  '/index.html',
  '/dashboard',
  '/analysis',
  '/onboarding',
];

/** Domains that must always go to network (no caching) */
const NETWORK_ONLY_ORIGINS = [
  'supabase.co',
  'supabase.com',
];

// ============================================================================
// Install — pre-cache app shell
// ============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Shell URLs may fail in dev (no built assets) — fail silently per URL
      return Promise.allSettled(
        SHELL_URLS.map((url) => cache.add(url).catch(() => {}))
      );
    }).then(() => {
      // Activate immediately — don't wait for old SW to stop
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// Activate — clean up old caches
// ============================================================================

self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    }).then(() => {
      // Notify open clients that SW updated
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
});

// ============================================================================
// Fetch — routing strategy
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Network-only: Supabase, API routes, non-GET
  if (
    request.method !== 'GET' ||
    NETWORK_ONLY_ORIGINS.some((origin) => url.hostname.includes(origin)) ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. HTML navigation — Network-first, offline shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the fresh response
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: serve cached page or root shell
          caches.match(request)
            .then((cached) => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  // 3. Static assets (JS, CSS, images, fonts) — Cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico)$/)
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // 4. Everything else — Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ============================================================================
// Push Notifications — Master Direction §26-27
// ============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Selfprint', body: event.data.text() };
  }

  const title = payload.title || 'Selfprint';
  const options = {
    body: payload.body || 'Twin ของคุณมีบางอย่างจะบอก',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.tag || 'selfprint-notification',
    renotify: payload.renotify ?? false,
    data: {
      url: payload.url || '/dashboard',
      type: payload.type || 'general',
    },
    actions: payload.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if open
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ============================================================================
// Background Sync — Master Direction §37 (Offline Journal queue)
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal') {
    event.waitUntil(syncOfflineJournal());
  }
});

async function syncOfflineJournal() {
  // Reads pending journal entries from IndexedDB (written offline)
  // and POSTs to Supabase when connection is restored.
  // Full implementation requires idb-keyval or native indexedDB access.
  // Placeholder — dispatches message to app to handle sync.
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((c) => c.postMessage({ type: 'SYNC_JOURNAL' }));
}
