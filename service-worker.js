const CACHE_NAME = 'lift-tracker-v4';

const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './js/app.js',
  './js/plan.js',
  './js/session.js',
  './js/progress.js',
  './js/data.js',
  './js/charts.js',
  './js/utils.js',
  './js/program.js',
  './js/welcome.js',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Cache-first for app assets, network-first for Google Fonts
  if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
