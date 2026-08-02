const { defineConfig } = require("vitest/config");

// Tests de firestore.rules. Van aparte de vitest.config.js porque necesitan el
// emulador de Firestore corriendo (lo levanta `npm run test:rules`) y entorno
// node, no jsdom. Tampoco entran en el coverage: lo que se ejercita son las
// reglas, no código JS del repo.
module.exports = defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.js"],
    // El emulador arranca en frío y la primera conexión puede tardar.
    testTimeout: 20000,
    hookTimeout: 30000,
    // Un solo worker: todos los tests comparten la misma instancia del
    // emulador y hacen clearFirestore() entre casos.
    fileParallelism: false,
  },
});
