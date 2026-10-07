// Version 2.9 tells the phone to load the new Email Invitations, Natural Twine Bow, and Restored Habit Modal!
const CACHE_NAME = 'boo-v2.9';

// The exact list of files the phone will save for Offline Mode
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './Img/logo.png',
    './Img/forest.png',
    './Img/matcha.png',
    './Img/sunshine.png',
    './Img/melon.png',
    './Img/study.png',
    './Img/breeze.png'
];

// INSTALL: Save all the files into the phone's memory
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching all Boo assets for v2.8...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ACTIVATE: Clean up the old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// FETCH: Serve files from the cache when there is no Wi-Fi
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(
                (networkResponse) => {
                    if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    var responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                }
            ).catch(() => {
                console.log('Offline mode active. Using cached assets.');
            });
        })
    );
});
