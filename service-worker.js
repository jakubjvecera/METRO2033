const cacheName = 'metro-svitilna-v1';
const assetsToCache = [
  '.',
  'index.html',
  'app.js',
  'manifest.json',
  'alarm.mp3',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
