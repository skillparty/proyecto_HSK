const SW_VERSION = "4.36.0";
const STATIC_CACHE = `hsk-static-${SW_VERSION}`;
const RUNTIME_CACHE = `hsk-runtime-${SW_VERSION}`;
const CACHE_PREFIXES = [
  "hsk-static-",
  "hsk-runtime-",
  "hsk-learning-",
  "hsk-dynamic-",
];

const PRECACHE_FILES = [
  "./",
  "./index.html",
  "./config/manifest.json",
  "./assets/css/design-tokens.css?v=6",
  "./assets/css/styles-professional.css?v=34",
  "./assets/css/matrix-game-styles.css?v=7",
  "./assets/css/leaderboard-styles.css",
  "./assets/css/user-profile-styles.css?v=3",
  "./assets/css/quantifier-snake-styles.css?v=8",
  "./assets/css/tones-invaders-styles.css?v=3",
  "./assets/css/hanzi-builder-styles.css?v=2",
  "./assets/css/word-linker-styles.css?v=2",
  "./assets/js/bootstrap-diagnostics.js?v=1",
  "./assets/js/firebase-bootstrap.js?v=1",
  "./assets/js/sw-register.js?v=1",
  "./assets/js/translations.js?v=27",
  "./assets/js/firebase-client.js?v=5",
  "./assets/js/firebase-progress-sync.js",
  "./assets/js/modules/srs-engine.js?v=3",
  "./assets/js/modules/flashcard-manager.js?v=7",
  "./assets/js/modules/practice-view-controller.js?v=7",
  "./assets/js/modules/audio-controller.js?v=3",
  "./assets/js/modules/quiz-engine.js?v=2",
  "./assets/js/modules/ui-controller.js?v=7",
  "./assets/js/modules/navigation-controller.js?v=4",
  "./assets/js/modules/culture/culture-module-base.js",
  "./assets/js/modules/culture/character-evolution.js",
  "./assets/js/modules/culture/traditional-medicine.js",
  "./assets/js/modules/culture/peking-opera.js",
  "./assets/js/modules/culture/chinese-technology.js",
  "./assets/js/modules/culture/ethnic-clothing.js",
  "./assets/js/modules/culture/traditional-arts.js",
  "./assets/js/modules/language-controller.js?v=3",
  "./assets/js/modules/browse-controller.js?v=5",
  "./assets/js/modules/interaction-controller.js?v=8",
  "./assets/js/modules/game-engine.js",
  "./assets/js/modules/past-exams-controller.js?v=3",
  "./assets/js/modules/quantifier-snake-utils.js?v=1",
  "./assets/js/modules/quantifier-snake-canvas.js?v=4",
  "./assets/js/modules/quantifier-snake-controller.js?v=6",
  "./assets/js/modules/strokes-radicals-controller.js?v=4",
  "./assets/js/progress-integrator.js",
  "./assets/js/auth-backend.js",
  "./assets/js/user-progress-backend.js",
  "./assets/js/bg-data.js",
  "./assets/js/app.js?v=37",
  "./assets/js/matrix-game.js?v=3",
  "./assets/js/matrix-game-ui.js",
  "./assets/js/tones-invaders-game.js?v=5",
  "./assets/js/hanzi-builder-game.js?v=2",
  "./assets/js/word-linker-game.js?v=3",
  "./assets/js/leaderboard.js?v=2",
  "./assets/data/culture/character-evolution.json",
  "./assets/data/culture/chinese-technology.json",
  "./assets/data/culture/peking-opera.json",
  "./assets/data/culture/traditional-medicine.json",
  "./assets/data/vocab/hsk1_en.json",
  "./assets/data/vocab/hsk2_en.json",
  "./assets/data/vocab/hsk3_en.json",
  "./assets/data/vocab/hsk4_en.json",
  "./assets/data/vocab/hsk5_en.json",
  "./assets/data/vocab/hsk6_en.json",
  "./assets/data/vocab/hsk1_es.json",
  "./assets/data/vocab/hsk2_es.json",
  "./assets/data/vocab/hsk3_es.json",
  "./assets/data/vocab/hsk4_es.json",
  "./assets/data/vocab/hsk5_es.json",
  "./assets/data/vocab/hsk6_es.json",
  "./assets/data/hsk_past_exams.json",
  "./assets/data/hsk_example_sentences.json",
  "./assets/data/quantifier_snake_words.json",
  "./assets/images/logoICUMSSAPP.png",
  "./assets/images/logo05.png",
  "./assets/images/logo06.png",
  "./assets/images/background01.webp",
  "./assets/videos/snakeGame.mp4",
  "./assets/videos/toneInvader.mp4",
];

function isSameOrigin(url) {
  return new URL(url).origin === self.location.origin;
}

function isApiLikeRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firebaseapp.com") ||
    url.hostname.includes("googleapis.com")
  );
}

function shouldCacheRuntime(request) {
  if (!isSameOrigin(request.url)) return false;

  const url = new URL(request.url);
  const isAssetPath =
    url.pathname.includes("/assets/") || url.pathname.includes("/config/");
  const isCacheableType = ["style", "script", "font", "image"].includes(
    request.destination,
  );

  return isAssetPath || isCacheableType;
}

function getRuntimeCacheKey(request) {
  const url = new URL(request.url);
  const isStaticAsset =
    url.pathname.includes("/assets/") || url.pathname.includes("/config/");

  if (isStaticAsset && url.searchParams.has("v")) {
    return `${url.origin}${url.pathname}`;
  }

  return request;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_FILES)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) =>
            CACHE_PREFIXES.some((prefix) => name.startsWith(prefix)),
          )
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!isSameOrigin(event.request.url)) return;
  if (isApiLikeRequest(event.request)) return;

  const requestUrl = new URL(event.request.url);
  const isNavigation =
    event.request.mode === "navigate" ||
    event.request.destination === "document";

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return caches.match("./index.html");
        }
      })(),
    );
    return;
  }

  if (!shouldCacheRuntime(event.request)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cacheKey = getRuntimeCacheKey(event.request);
      const cacheKeyIsNormalized = typeof cacheKey === "string";
      const cachedResponse =
        (await caches.match(cacheKey)) || (await caches.match(event.request));
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
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "GET_VERSION" && event.ports?.[0]) {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});
