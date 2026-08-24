const js = require("@eslint/js");
const globals = require("globals");

// Clases y helpers que cada script publica como global (sourceType "script":
// las declaraciones top-level son globales). ESLint no cruza archivos, así que
// sin esta lista cada referencia entre controllers sale como no-undef.
const APP_GLOBALS = [
  "HSKApp",
  "UIController",
  "NavigationController",
  "ThemeController",
  "AudioController",
  "ModalController",
  "HealthController",
  "StorageController",
  "LanguageController",
  "ProgressController",
  "SearchController",
  "StartupController",
  "VocabularyController",
  "PracticeViewController",
  "FeedbackController",
  "InteractionController",
  "LegacyFlowController",
  "HomeController",
  "EtymologyController",
  "FlashcardManager",
  "DeckManager",
  "DeckController",
  "AchievementManager",
  "SRSEngine",
  "MatrixController",
  "MatrixGame",
  "MatrixGameView",
  "MatrixScoreController",
  "MatrixSessionController",
  "renderMatrixGameInterface",
  "setupMatrixGameEventListeners",
  "QuantifierSnakeUtils",
  "QuantifierSnakeCanvasRenderer",
  "QuantifierSnakeVersusController",
  "TonesInvadersGame",
  "HanziBuilderGame",
  "WordLinkerGame",
  "SentenceBuilderGame",
  "GradedReaderGame",
  "DialogueTutorGame",
  "RadicalDecomposerGame",
  "SkillTreeGame",
  "LyricsLabGame",
  "ShadowTheatreGame",
  "HanziMahjongGame",
  "ChinaCitiesGame",
  "ToneVisualizerGame",
  "CalligraphyScrollGame",
  "HanziCanvasController",
  "ToneTrainerGame",
  "CultureModuleBase",
  "CharacterEvolutionModule",
  "ChineseTechnologyModule",
  "EthnicClothingModule",
  "PekingOperaModule",
  "TraditionalArtsModule",
  "TraditionalMedicineModule",
  // Instancias y helpers en window
  "app",
  "hskLogger",
  "hskEscapeHtml",
  "hskSafeHttpsUrl",
  "idbStorage",
  "languageManager",
  "translations",
  "firebaseApp",
  "firebaseAuth",
  "firebaseDb",
  "firebaseClient",
  "firebaseSync",
  "FirebaseSDK",
  "progressIntegrator",
  "gameAudioManager",
  "leaderboardManager",
  "createParticles",
];

const appGlobals = Object.fromEntries(APP_GLOBALS.map((name) => [name, "writable"]));

// La app son scripts clásicos que se registran en window (sin módulos), así que
// sourceType "script". Build, service worker, scripts de dev y tests tienen
// cada uno su propio entorno.
module.exports = [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "assets/vendor/**",
      "test-results/**",
      "playwright-report/**",
      // Scripts sueltos de exploración en la raíz, ya ignorados por git
      "test-culture.js",
      "test-tech.js",
    ],
  },

  js.configs.recommended,

  // Código de la app (browser, scripts clásicos)
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...appGlobals,
        // three.js se carga on-demand desde CDN y queda como global
        THREE: "readonly",
        // Algunos módulos traen guard UMD (typeof module !== 'undefined')
        module: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Cada clase de APP_GLOBALS la declara su propio archivo; sin esto,
      // ESLint marca esa declaración como redeclaración del global.
      "no-redeclare": ["error", { builtinGlobals: false }],
      // Un catch vacío es un error tragado en silencio
      "no-empty": ["error", { allowEmptyCatch: false }],
      eqeqeq: ["warn", "smart"],
      "no-var": "warn",
      "prefer-const": "warn",
    },
  },

  // firebase-bootstrap.js es el único <script type="module"> propio: usa
  // import y resuelve los bare specifiers vía el importmap de index.html.
  {
    files: ["assets/js/firebase-bootstrap.js"],
    languageOptions: { sourceType: "module" },
  },

  // Service worker
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.serviceworker },
    },
  },

  // Scripts de build/CI/datos y configs (Node, CommonJS)
  {
    files: ["scripts/**/*.js", "*.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // scripts/dev/*: drivers de Playwright. Corren en Node pero llevan código de
  // browser dentro de los callbacks de page.evaluate, así que necesitan ambos.
  {
    files: ["scripts/dev/**/*.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Tests: vitest usa ESM, Playwright usa CommonJS
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
