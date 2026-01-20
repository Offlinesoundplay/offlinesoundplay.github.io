// service-worker.js - Fixed Caching
const CACHE_NAME = 'offlinesoundplay-v2.0';
const ASSETS_TO_CACHE = [
    '/offlinesoundplay/',
    '/offlinesoundplay/index.html',
    '/offlinesoundplay/style.css',
    '/offlinesoundplay/script.js',
    '/offlinesoundplay/manifest.json',
    '/offlinesoundplay/player/index.html',
    '/offlinesoundplay/player/player.js'
];

// Add all English songs to cache
const englishSongs = [
    'apt.mp3',
    'cakebytheocean.mp3',
    'dandelions.mp3',
    'devilindisguise.mp3',
    'dietmountaindew.mp3',
    'fairytale.mp3',
    'heatwaves.mp3',
    'mmmyeah.mp3',
    'perfect.mp3',
    'seeyouagain.mp3',
    'shapeofyou.mp3',
    'smoothoperator.mp3',
    'starboy.mp3',
    'staywithme.mp3',
    'untilifoundyou.mp3'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell...');
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

// Fetch event - Cache audio files dynamically
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Handle audio files separately
    if (event.request.url.includes('/eng/') || event.request.url.includes('/hin/')) {
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
                        })
                        .catch(() => {
                            return new Response('', { status: 404 });
                        });
                })
        );
        return;
    }
    
    // For other files
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offlinesoundplay/index.html');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});