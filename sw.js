const SW_VERSION = "4.70.0+9b20d80b";
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
  "./assets/css/design-tokens.css?v=ce688d54",
  "./assets/css/app-base.css?v=208eb12c",
  "./assets/css/app-header-nav.css?v=33ffdc36",
  "./assets/css/app-home.css?v=ce40ba46",
  "./assets/css/app-practice.css?v=54e3acd3",
  "./assets/css/app-browse.css?v=d5a7c864",
  "./assets/css/app-strokes.css?v=1249c158",
  "./assets/css/app-quiz.css?v=5d43a437",
  "./assets/css/app-stats.css?v=cd1fd78c",
  "./assets/css/app-enhancements.css?v=94e9d87b",
  "./assets/css/app-dashboard-extras.css?v=e9f43713",
  "./assets/css/matrix-game-styles.css?v=1864034e",
  "./assets/css/leaderboard-styles.css",
  "./assets/css/user-profile-styles.css?v=8292921d",
  "./assets/css/command-palette.css",
  "./assets/css/achievements-styles.css",
  "./assets/css/deck-manager-styles.css",
  "./assets/css/quantifier-snake-styles.css?v=73064cd6",
  "./assets/css/tones-invaders-styles.css?v=5821d4f3",
  "./assets/css/hanzi-builder-styles.css?v=6cfca79e",
  "./assets/css/word-linker-styles.css?v=ba5d13f3",
  "./assets/css/sentence-builder-styles.css",
  "./assets/css/tone-trainer-styles.css",
  "./assets/css/graded-reader-styles.css",
  "./assets/css/dialogue-tutor-styles.css",
  "./assets/css/radical-decomposer-styles.css",
  "./assets/css/skill-tree-styles.css",
  "./assets/css/lyrics-lab-styles.css",
  "./assets/css/shadow-theatre-styles.css",
  "./assets/css/hanzi-mahjong-styles.css",
  "./assets/css/china-cities-styles.css",
  "./assets/css/app-videos.css?v=f5735c3e",
  "./assets/css/app-memories.css",
  "./assets/js/utils/html.js?v=8f3dabb2",
  "./assets/js/utils/idb-storage.js",
  "./assets/js/bootstrap-diagnostics.js?v=4dd221b0",
  "./assets/js/firebase-bootstrap.js?v=39292ce5",
  "./assets/js/sw-register.js?v=4036af96",
  "./assets/js/translations.js?v=aaf0b06c",
  "./assets/js/firebase-client.js?v=64c15ce8",
  "./assets/js/firebase-progress-sync.js?v=0739a27c",
  "./assets/js/modules/srs-engine.js?v=513fe4f7",
  "./assets/js/modules/flashcard-manager.js?v=4907c12f",
  "./assets/js/modules/deck-manager.js",
  "./assets/js/modules/deck-controller.js",
  "./assets/js/modules/achievement-manager.js",
  "./assets/js/modules/practice-view-controller.js?v=d2275c84",
  "./assets/js/modules/audio-controller.js?v=bc9b1f37",
  "./assets/js/modules/quiz-engine.js?v=0f8dc82d",
  "./assets/js/modules/quiz-legacy-controller.js?v=0c8d314f",
  "./assets/js/modules/stats-controller.js?v=df78e753",
  "./assets/js/modules/ui-controller.js?v=3cd700c2",
  "./assets/js/modules/navigation-controller.js?v=aa469b9a",
  "./assets/js/modules/culture/culture-module-base.js",
  "./assets/js/modules/culture/character-evolution.js",
  "./assets/js/modules/culture/traditional-medicine.js",
  "./assets/js/modules/culture/peking-opera.js",
  "./assets/js/modules/culture/chinese-technology.js",
  "./assets/js/modules/culture/ethnic-clothing.js",
  "./assets/js/modules/culture/traditional-arts.js",
  "./assets/js/modules/memories-controller.js",
  "./assets/js/modules/language-controller.js?v=57c17946",
  "./assets/js/modules/browse-controller.js?v=6c8c3c15",
  "./assets/js/modules/interaction-controller.js?v=e5328943",
  "./assets/js/modules/game-engine.js",
  "./assets/js/modules/past-exams-question-bank.js",
  "./assets/js/modules/past-exams-controller.js?v=380d4198",
  "./assets/js/modules/quantifier-snake-utils.js?v=cf878469",
  "./assets/js/modules/quantifier-snake-canvas.js?v=11c68752",
  "./assets/js/modules/quantifier-snake-controller.js?v=a9fbbef3",
  "./assets/js/modules/quantifier-snake-versus-renderer.js",
  "./assets/js/modules/quantifier-snake-versus.js?v=ff794386",
  "./assets/js/modules/strokes-radicals-catalog-data.js",
  "./assets/js/modules/strokes-radicals-practice.js",
  "./assets/js/modules/hanzi-canvas-controller.js",
  "./assets/js/modules/strokes-radicals-controller.js?v=6369da31",
  "./assets/js/progress-integrator.js?v=0f7f559e",
  "./assets/js/auth-backend.js?v=3885d457",
  "./assets/js/user-progress-backend.js?v=2dc1518b",
  "./assets/js/app.js?v=9964893d",
  "./assets/js/matrix-game.js?v=9da2483d",
  "./assets/js/matrix-game-events.js",
  "./assets/js/matrix-game-ui.js",
  "./assets/js/matrix-game-view.js",
  "./assets/js/tones-invaders-game.js?v=3dde898f",
  "./assets/js/tones-invaders-renderer.js",
  "./assets/js/hanzi-builder-game.js?v=745260cd",
  "./assets/js/word-linker-game.js?v=d263c1b3",
  "./assets/js/sentence-builder-game.js",
  "./assets/js/tone-trainer-game.js",
  "./assets/js/graded-reader-game.js",
  "./assets/js/dialogue-tutor-game.js",
  "./assets/js/radical-decomposer-game.js",
  "./assets/js/skill-tree-game.js",
  "./assets/js/lyrics-lab-game.js",
  "./assets/js/shadow-theatre-game.js",
  "./assets/js/hanzi-mahjong-game.js",
  "./assets/js/china-cities-game.js",
  "./assets/js/leaderboard.js?v=104e8458",
  "./assets/partials/tabs/strokes-radicals.html",
  "./assets/partials/tabs/snake-quantifiers.html",
  "./assets/partials/tabs/tones-invaders.html",
  "./assets/partials/tabs/hanzi-builder.html",
  "./assets/partials/tabs/word-linker.html",
  "./assets/partials/tabs/sentence-builder.html",
  "./assets/partials/tabs/tone-trainer.html",
  "./assets/partials/tabs/stats.html",
  "./assets/partials/tabs/leaderboard.html",
  "./assets/partials/tabs/etymology.html",
  "./assets/partials/tabs/culture-characters.html",
  "./assets/partials/tabs/culture-medicine.html",
  "./assets/partials/tabs/culture-opera.html",
  "./assets/partials/tabs/culture-technology.html",
  "./assets/partials/tabs/culture-clothing.html",
  "./assets/partials/tabs/culture-arts.html",
  "./assets/partials/tabs/videos.html",
  "./assets/partials/tabs/memories.html",
  "./assets/partials/tabs/writing-sheets.html",
  "./assets/partials/tabs/graded-reader.html",
  "./assets/partials/tabs/dialogue-tutor.html",
  "./assets/partials/tabs/radical-decomposer.html",
  "./assets/partials/tabs/skill-tree.html",
  "./assets/partials/tabs/lyrics-lab.html",
  "./assets/partials/tabs/shadow-theatre.html",
  "./assets/partials/tabs/hanzi-mahjong.html",
  "./assets/partials/tabs/china-cities.html",
  "./assets/data/videos-data.json",
  "./assets/data/culture/character-evolution.json",
  "./assets/data/culture/chinese-technology.json",
  "./assets/data/culture/peking-opera.json",
  "./assets/data/culture/traditional-medicine.json",
  "./assets/images/culture/peking_opera.jpg",
  "./assets/images/culture/traditional_medicine.jpg",
  "./assets/images/culture/character_evolution.jpg",
  "./assets/images/culture/chinese_technology.jpg",
  "./assets/images/culture/ethnic_clothing.jpg",
  "./assets/images/culture/traditional_arts.jpg",
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

// PRECACHE_FILES es la fuente única (scripts/build/apply-cache-versions.js
// parsea ese bloque para validar existencia y calcular SW_VERSION). Los dos
// tiers se derivan por predicado para no duplicar rutas.
//
// Opcional = data, media y todo lo específico de una pestaña/juego. Son ~4 MB
// que no hacen falta para arrancar y que el fetch handler recachea en runtime.
const OPTIONAL_PRECACHE_PATTERNS = [
  "/assets/data/",
  "/assets/images/",
  "/assets/videos/",
  // El markup diferido de cada pestaña: por definición no hace falta para
  // arrancar, se pide al abrir la pestaña. Sin esto, stats.html y los
  // culture-*.html caerían en el shell crítico por no matchear ningún patrón.
  "/assets/partials/",
  "/culture/",
  "matrix-game",
  "tones-invaders",
  "hanzi-builder",
  "word-linker",
  "quantifier-snake",
  "strokes-radicals",
  "past-exams",
  "leaderboard",
];

function isOptionalPrecache(path) {
  return OPTIONAL_PRECACHE_PATTERNS.some((pattern) => path.includes(pattern));
}

// Shell mínimo para arrancar offline: documento, manifest, CSS y JS del core.
const CRITICAL_PRECACHE = PRECACHE_FILES.filter(
  (path) => !isOptionalPrecache(path),
);
const OPTIONAL_PRECACHE = PRECACHE_FILES.filter(isOptionalPrecache);

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

// Concurrencia baja a propósito: este precache corre en segundo plano mientras
// la página todavía está pidiendo sus controllers lazy. Dispararlo todo en
// paralelo (57 requests) le roba conexiones al foreground y las pestañas lazy
// tardan en aparecer.
const OPTIONAL_PRECACHE_CONCURRENCY = 3;

// Best-effort: cada entrada se cachea por separado, así un 404 aislado no
// tumba el resto. Nunca entra en waitUntil — si el SW muere antes de terminar,
// el fetch handler recachea esos assets en runtime cuando se piden.
async function precacheOptional() {
  const cache = await caches.open(STATIC_CACHE);
  const queue = [...OPTIONAL_PRECACHE];
  let failed = 0;

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      try {
        await cache.add(url);
      } catch {
        failed++;
      }
    }
  }

  await Promise.all(
    Array.from({ length: OPTIONAL_PRECACHE_CONCURRENCY }, worker),
  );

  if (failed > 0) {
    console.warn(
      `[SW] precache opcional: ${failed}/${OPTIONAL_PRECACHE.length} fallaron`,
    );
  }
}

self.addEventListener("install", (event) => {
  // Solo el shell bloquea el install: es all-or-nothing a propósito, porque un
  // shell incompleto significa prometer un offline que no se puede cumplir.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CRITICAL_PRECACHE)),
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
      // Después del claim y fuera del waitUntil: el activate no debe esperar a
      // ~3.7 MB de assets opcionales.
      precacheOptional();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!isSameOrigin(event.request.url)) return;
  if (isApiLikeRequest(event.request)) return;

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
        } catch {
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
