// sw.js — AUTO-CACHE ALL .html IN dropzone/
const CACHE_NAME = 'vibraphonics-v1';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: cache static + all dropzone HTML
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES)),

      // Dynamically cache all .html in /dropzone/
      fetch('https://api.github.com/repos/wesleyhson/vibraphonicsPWA/contents/dropzone')
        .then(res => res.json())
        .then(files => {
          const htmlFiles = files
            .filter(f => f.name.endsWith('.html'))
            .map(f => `/vibraphonicsPWA/dropzone/${f.name}`);
          return caches.open(CACHE_NAME).then(cache => cache.addAll(htmlFiles));
        })
        .catch(() => console.log('Offline: using cached applets'))
    ])
  );
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});