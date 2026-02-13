// HSK Chinese Learning PWA - Service Worker
const CACHE_NAME = 'hsk-learning-v2.2.0';
const STATIC_CACHE = 'hsk-static-v2.2.0';
const DYNAMIC_CACHE = 'hsk-dynamic-v2.2.0';

// Files to cache
const STATIC_FILES = [
    './',
    './index.html',
    './assets/css/styles-v2.css',
    './assets/css/styles-final.css',
    './assets/css/styles-planetscale.css',
    './assets/css/matrix-game-styles.css',
    './assets/css/leaderboard-styles.css',
    './assets/css/user-profile-styles.css',
    './assets/js/app.js',
    './assets/js/translations.js',
    './config/manifest.json',
    './dev_logo.png',
    './assets/data/hsk_vocabulary_spanish.json',
    './assets/data/hsk_vocabulary.json',
    // Google Fonts
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap'
];

// Install event
self.addEventListener('install', event => {
    console.log('SW: Install event');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('SW: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('SW: Error caching static files:', error);
            })
    );
    self.skipWaiting(); // Force activation
});

// Activate event
self.addEventListener('activate', event => {
    console.log('SW: Activate event');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control immediately
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('SW: Serving from cache:', event.request.url);
                    return response;
                }

                // Fetch from network
                return fetch(event.request)
                    .then(fetchResponse => {
                        // Check if valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(error => {
                        console.log('SW: Fetch failed, serving offline page:', error);

                        // Return offline fallback for HTML pages
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }

                        // Return a generic offline response for other resources
                        return new Response('Offline content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for when connection is restored
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('SW: Background sync triggered');
        event.waitUntil(
            // Perform background tasks here
            updateCache()
        );
    }
});

// Push notification support
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Time to practice your Chinese!',
            icon: './dev_logo.png',
            badge: './dev_logo.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || './index.html'
            },
            actions: [
                {
                    action: 'practice',
                    title: 'Start Practice',
                    icon: './dev_logo.png'
                },
                {
                    action: 'quiz',
                    title: 'Take Quiz',
                    icon: './dev_logo.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'HSK Learning', options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    let url = './index.html';

    if (event.action === 'practice') {
        url = './index.html?tab=practice';
    } else if (event.action === 'quiz') {
        url = './index.html?tab=quiz';
    } else if (event.notification.data && event.notification.data.url) {
        url = event.notification.data.url;
    }

    event.waitUntil(
        clients.openWindow(url)
    );
});

// Message handler for communication with main app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

// Helper function to update cache
async function updateCache() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const response = await fetch('./assets/data/hsk_vocabulary.json');
        if (response.ok) {
            await cache.put('./assets/data/hsk_vocabulary.json', response);
            console.log('SW: Updated vocabulary cache');
        }
    } catch (error) {
        console.error('SW: Error updating cache:', error);
    }
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
    if (event.tag === 'vocab-update') {
        event.waitUntil(updateCache());
    }
});

console.log('SW: Service Worker loaded successfully');
