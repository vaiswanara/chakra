const CACHE_NAME = 'prashna-chakra-v2';
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
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then(response => response || fetch(event.request))
    );
});