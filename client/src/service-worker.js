// Last updated: 2025-05-08 12:50:08
// Service worker for PWA functionality
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('receipt-scanner-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
