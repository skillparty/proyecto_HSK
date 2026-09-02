const { defineConfig } = require("vitest/config");

// Los módulos bajo test son scripts de browser que se registran en window
// (sin exports); los tests los cargan por side-effect, así que necesitan
// entorno jsdom con window/localStorage reales.
module.exports = defineConfig({
  test: {
    environment: "jsdom",
    // Sin url, jsdom corre en origin opaco y localStorage no funciona
    environmentOptions: { jsdom: { url: "http://localhost/" } },
    testTimeout: 15000,
    setupFiles: ["tests/unit/setup.js"],
    include: ["tests/unit/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary"],
      reportsDirectory: "coverage",
      // Solo lo que los unit tests pueden cubrir de verdad. Los controllers de
      // UI y los juegos se ejercitan desde Playwright, no desde vitest: meterlos
      // acá daría un porcentaje global sin señal.
      include: [
        "assets/js/utils/**/*.js",
        "assets/js/modules/srs-engine.js",
        "assets/js/modules/quantifier-snake-utils.js",
        "assets/js/firebase-progress-sync.js",
      ],
      // Umbral sobre el subconjunto ya cubierto: sirve de trinquete, no deja
      // que baje. Se sube a medida que entren más módulos al include.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
