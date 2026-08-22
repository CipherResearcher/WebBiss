'use strict';
const CACHE_NAME = 'webbiss-506565580698';
const APP_SHELL = [
    "./",
    "./index.html",
    "./index_template.html",
    "./tools.html",
    "./manifest.webmanifest",
    "./icons/webbiss-192.png",
    "./icons/webbiss-512.png"
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter((name) => name.startsWith('webbiss-') && name !== CACHE_NAME)
                .map((name) => caches.delete(name)),
        )),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => response.ok ? response : Promise.reject(new Error('Navigation failed')))
                .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))),
        );
        return;
    }

    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
