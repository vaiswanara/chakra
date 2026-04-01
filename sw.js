const CACHE_NAME = 'prashna-chakra-v10.1.3';
const urlsToCache = [
    './',
    './index.html',
    './chakra.png',
    './data.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then(response => response || fetch(event.request))
            .catch(() => caches.match(event.request))
    );
});