const SW_VERSION = '3.1.0-20260213';
const STATIC_CACHE = `hsk-static-${SW_VERSION}`;
const RUNTIME_CACHE = `hsk-runtime-${SW_VERSION}`;
const CACHE_PREFIXES = ['hsk-static-', 'hsk-runtime-', 'hsk-learning-', 'hsk-dynamic-'];

const PRECACHE_FILES = [
    './',
    './index.html',
    './config/manifest.json',
    './assets/css/styles-professional.css',
    './assets/css/matrix-game-styles.css',
    './assets/css/leaderboard-styles.css',
    './assets/css/user-profile-styles.css',
    './assets/js/translations.js',
    './assets/js/supabase-client.js',
    './assets/js/supabase-progress-sync.js',
    './assets/js/progress-integrator.js',
    './assets/js/auth-backend.js',
    './assets/js/user-progress-backend.js',
    './assets/js/bg-data.js',
    './assets/js/app.js',
    './assets/js/matrix-game.js',
    './assets/js/matrix-game-ui.js',
    './assets/js/leaderboard.js',
    './assets/data/hsk_vocabulary.json',
    './assets/data/hsk_vocabulary_spanish.json',
    './assets/images/logo_appDM.png',
    './assets/images/logo_appLM.png',
    './assets/images/bg-fusion.png'
];

function isSameOrigin(url) {
    return new URL(url).origin === self.location.origin;
}

function isApiLikeRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co');
}

function shouldCacheRuntime(request) {
    if (!isSameOrigin(request.url)) return false;

    const url = new URL(request.url);
    const isAssetPath = url.pathname.includes('/assets/') || url.pathname.includes('/config/');
    const isCacheableType = ['style', 'script', 'font', 'image'].includes(request.destination);

    return isAssetPath || isCacheableType;
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_FILES))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((name) => CACHE_PREFIXES.some((prefix) => name.startsWith(prefix)))
                .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
                .map((name) => caches.delete(name))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!isSameOrigin(event.request.url)) return;
    if (isApiLikeRequest(event.request)) return;

    const requestUrl = new URL(event.request.url);
    const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';

    if (isNavigation) {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(RUNTIME_CACHE);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;
                return caches.match('./index.html');
            }
        })());
        return;
    }

    if (!shouldCacheRuntime(event.request)) {
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            fetch(event.request)
                .then(async (networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(event.request, networkResponse.clone());
                    }
                })
                .catch(() => {});
            return cachedResponse;
        }

        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
    })());
});

self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'GET_VERSION' && event.ports?.[0]) {
        event.ports[0].postMessage({ version: SW_VERSION });
    }
});
