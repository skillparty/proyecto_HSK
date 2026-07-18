const { defineConfig } = require("vitest/config");

// Los módulos bajo test son scripts de browser que se registran en window
// (sin exports); los tests los cargan por side-effect, así que necesitan
// entorno jsdom con window/localStorage reales.
module.exports = defineConfig({
  test: {
    environment: "jsdom",
    // Sin url, jsdom corre en origin opaco y localStorage no funciona
    environmentOptions: { jsdom: { url: "http://localhost/" } },
    setupFiles: ["tests/unit/setup.js"],
    include: ["tests/unit/**/*.test.js"],
  },
});
