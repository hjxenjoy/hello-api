// Service Worker

const CACHE_NAME = 'hello-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/app.js',
  '/src/styles/tokens.css',
  '/src/styles/base.css',
  '/src/styles/layout.css',
  '/src/styles/themes/light.css',
  '/src/styles/themes/dark.css',
  '/src/components/app-shell.js',
  '/src/components/sidebar-nav.js',
  '/src/components/request-editor.js',
  '/src/components/response-viewer.js',
  '/src/components/env-manager.js',
  '/src/components/storage-indicator.js',
  '/src/db/index.js',
  '/src/db/projects.js',
  '/src/db/requests.js',
  '/src/db/environments.js',
  '/src/core/http-client.js',
  '/src/core/interpolation.js',
  '/src/core/storage-stats.js',
  '/src/core/dialog.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache same-origin requests; pass through cross-origin API calls
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
