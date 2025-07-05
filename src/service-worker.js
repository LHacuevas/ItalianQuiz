/* eslint-disable no-restricted-globals */
/* global importScripts, workbox */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

//const ignored = self.__WB_MANIFEST;

// -----------------------------------------------------------------------------
// 🔒 Precaching build assets + offline fallback
// -----------------------------------------------------------------------------
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache offline fallback page explicitly
workbox.precaching.precacheAndRoute([{ url: '/offline.html', revision: null }]);

// -----------------------------------------------------------------------------
// 🌐 Default: Network‑First strategy for all runtime requests
// -----------------------------------------------------------------------------
workbox.routing.setDefaultHandler(
  new workbox.strategies.NetworkFirst({
    cacheName: 'dynamic-network-first',
    networkTimeoutSeconds: 8,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// -----------------------------------------------------------------------------
// 🧱 Offline fallback for navigations
// -----------------------------------------------------------------------------
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await workbox.strategies.NetworkFirst().handle({ event });
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

// -----------------------------------------------------------------------------
// 🛠 Utility listeners
// -----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  const expectedCaches = ['dynamic-network-first', workbox.core.cacheNames.precache];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !expectedCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
  );
});
