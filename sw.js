self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('ara-ludo').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/styles.css',
      '/script.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
