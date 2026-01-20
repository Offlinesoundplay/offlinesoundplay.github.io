// service-worker.js
const CACHE_NAME = 'offlinesoundplay-v1.0';
const OFFLINE_URL = 'index.html';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './player/index.html',
    './player/player.js',
    // English songs
    './eng/apt.mp3',
    './eng/cakebytheocean.mp3',
    './eng/dandelions.mp3',
    './eng/devilindisguise.mp3',
    './eng/dietmountaindew.mp3',
    './eng/fairytale.mp3',
    './eng/heatwaves.mp3',
    './eng/mmmyeah.mp3',
    './eng/perfect.mp3',
    './eng/seeyouagain.mp3',
    './eng/shapeofyou.mp3',
    './eng/smoothoperator.mp3',
    './eng/starboy.mp3',
    './eng/staywithme.mp3',
    './eng/untilifoundyou.mp3'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell and songs...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (event.request.url.startsWith('http')) {
        // For music files and app assets
        if (event.request.url.includes('/eng/') || 
            event.request.url.includes('/hin/') ||
            event.request.destination === 'audio' ||
            event.request.url.includes('.html') ||
            event.request.url.includes('.css') ||
            event.request.url.includes('.js')) {
            
            event.respondWith(
                caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }

                        return fetch(event.request)
                            .then((response) => {
                                if (!response || response.status !== 200) {
                                    return response;
                                }

                                const responseToCache = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                    });

                                return response;
                            });
                    })
                    .catch(() => {
                        // If offline and asset not cached
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        return new Response('Offline', { status: 503 });
                    })
            );
        }
    }
});