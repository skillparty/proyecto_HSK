#!/usr/bin/env node

// index.html se genera desde templates/index.template.html + partials
// (ver scripts/build/assemble-index.js). Este check falla si alguien
// editó un partial (o el template) sin correr `npm run assemble` antes
// de commitear — o si editó index.html directamente, lo que lo
// desincroniza silenciosamente de los partials.

const { readFileSync, existsSync } = require("fs");
const { join } = require("path");
const { assemble } = require("../build/assemble-index");

const ROOT = process.cwd();
const INDEX_FILE = join(ROOT, "index.html");

function main() {
  const { html, deferred } = assemble();

  if (readFileSync(INDEX_FILE, "utf8") !== html) {
    console.error(
      "index.html está desincronizado de templates/index.template.html + partials.",
    );
    console.error("Corré `npm run assemble` y commiteá el resultado.");
    process.exit(1);
  }

  // Los partials diferidos también son generados: si quedan viejos, la pestaña
  // muestra markup que ya no corresponde al template y nada más falla.
  const stale = [];
  for (const [runtimePath, expectedContent] of deferred) {
    const fullPath = join(ROOT, runtimePath);
    if (!existsSync(fullPath) || readFileSync(fullPath, "utf8") !== expectedContent) {
      stale.push(runtimePath);
    }
  }

  if (stale.length > 0) {
    console.error("Partials diferidos desincronizados del template:");
    for (const path of stale) console.error(`  - ${path}`);
    console.error("Corré `npm run assemble` y commiteá el resultado.");
    process.exit(1);
  }

  console.log(
    `index.html coincide con template + partials (${deferred.size} diferidos verificados).`,
  );
}

main();
