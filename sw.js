const SW_VERSION = '3.3.0-20260420';
const STATIC_CACHE = `hsk-static-${SW_VERSION}`;
const RUNTIME_CACHE = `hsk-runtime-${SW_VERSION}`;
const CACHE_PREFIXES = ['hsk-static-', 'hsk-runtime-', 'hsk-learning-', 'hsk-dynamic-'];

const PRECACHE_FILES = [
    './',
    './index.html',
    './config/manifest.json',
    './assets/css/design-tokens.css',
    './assets/css/styles-professional.css',
    './assets/css/styles-professional.css?v=14',
    './assets/css/matrix-game-styles.css',
    './assets/css/leaderboard-styles.css',
    './assets/css/user-profile-styles.css',
    './assets/css/quantifier-snake-styles.css',
    './assets/css/quantifier-snake-styles.css?v=1',
    './assets/js/translations.js',
    './assets/js/translations.js?v=19',
    './assets/js/firebase-client.js',
    './assets/js/firebase-progress-sync.js',
    './assets/js/modules/flashcard-manager.js',
    './assets/js/modules/quiz-engine.js',
    './assets/js/modules/ui-controller.js',
    './assets/js/modules/ui-controller.js?v=3',
    './assets/js/modules/navigation-controller.js?v=3',
    './assets/js/modules/language-controller.js?v=3',
    './assets/js/modules/interaction-controller.js?v=3',
    './assets/js/modules/past-exams-controller.js?v=3',
    './assets/js/modules/quantifier-snake-utils.js',
    './assets/js/modules/quantifier-snake-utils.js?v=1',
    './assets/js/modules/quantifier-snake-canvas.js',
    './assets/js/modules/quantifier-snake-canvas.js?v=1',
    './assets/js/modules/quantifier-snake-controller.js',
    './assets/js/modules/quantifier-snake-controller.js?v=1',
    './assets/js/modules/strokes-radicals-controller.js?v=4',
    './assets/js/progress-integrator.js',
    './assets/js/auth-backend.js',
    './assets/js/user-progress-backend.js',
    './assets/js/bg-data.js',
    './assets/js/app.js',
    './assets/js/app.js?v=31',
    './assets/js/matrix-game.js',
    './assets/js/matrix-game-ui.js',
    './assets/js/leaderboard.js',
    './assets/data/hsk_vocabulary.json',
    './assets/data/hsk_vocabulary_spanish.json',
    './assets/data/hsk_past_exams.json',
    './assets/data/quantifier_snake_words.json',
    './assets/images/logo_appDM.png',
    './assets/images/logo_appLM.png',
    './assets/images/bg-fusion.png'
];

function isSameOrigin(url) {
    return new URL(url).origin === self.location.origin;
}

function isApiLikeRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || 
           url.hostname.includes('firebaseapp.com') || 
           url.hostname.includes('googleapis.com');
}

function shouldCacheRuntime(request) {
    if (!isSameOrigin(request.url)) return false;

    const url = new URL(request.url);
    const isAssetPath = url.pathname.includes('/assets/') || url.pathname.includes('/config/');
    const isCacheableType = ['style', 'script', 'font', 'image'].includes(request.destination);

    return isAssetPath || isCacheableType;
}

function getRuntimeCacheKey(request) {
    const url = new URL(request.url);
    const isStaticAsset = url.pathname.includes('/assets/') || url.pathname.includes('/config/');

    if (isStaticAsset && url.searchParams.has('v')) {
        return `${url.origin}${url.pathname}`;
    }

    return request;
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
        const cacheKey = getRuntimeCacheKey(event.request);
        const cacheKeyIsNormalized = typeof cacheKey === 'string';
        const cachedResponse = await caches.match(cacheKey) || await caches.match(event.request);
        if (cachedResponse) {
            fetch(event.request)
                .then(async (networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const cache = await caches.open(RUNTIME_CACHE);
                        cache.put(event.request, networkResponse.clone());
                        if (cacheKeyIsNormalized) {
                            cache.put(cacheKey, networkResponse.clone());
                        }
                    }
                })
                .catch(() => {});
            return cachedResponse;
        }

        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(event.request, networkResponse.clone());
            if (cacheKeyIsNormalized) {
                cache.put(cacheKey, networkResponse.clone());
            }
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
