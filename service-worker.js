const CACHE_NAME = 'metro-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './placeholder-svitilna.svg',
  './placeholder-mapa.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
