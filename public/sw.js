// Functional Service Worker for PWA Icon Support
// This worker satisfies Chrome's requirements for "Installability"
// while remaining passive to avoid cache-related hydration issues.

const CACHE_NAME = 'my-driver-v12';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Simple passthrough fetch handler - ESSENTIAL for PWA status on Chrome
self.addEventListener('fetch', (event) => {
  // We prefer network, no caching of dynamic content to avoid hydration hangs
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});
