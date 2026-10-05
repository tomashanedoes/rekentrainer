const CACHE_NAME = 'rekentrainer-v13';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './levels.js',
    './skills.js',
    './practice-engine.js',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install event - cache all static assets
// Activeer niet meteen: de app toont eerst een updatebanner
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// App vraagt expliciet om de nieuwe versie te activeren
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses or non-GET requests
                    if (!response || response.status !== 200 || event.request.method !== 'GET') {
                        return response;
                    }
                    // Clone the response
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback could go here
            })
    );
});
