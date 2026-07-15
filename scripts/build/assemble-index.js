#!/usr/bin/env node

// Ensambla index.html desde templates/index.template.html + los partials
// por tab en templates/partials/tabs/*.html.
//
// index.html pasó de 1576 líneas monolíticas a un shell de ~460 líneas
// (head, nav, footer, scripts) + 20 partials de 3-150 líneas, uno por
// tab-panel — mismo criterio de "un archivo por feature" que ya usan
// los controllers en assets/js/modules/.
//
// No hay runtime fetch ni round-trips extra: esto corre en build time,
// el index.html resultante es byte-idéntico a como sería si todo
// siguiera en un solo archivo. build-dist.js sigue copiando index.html
// tal cual a dist/.
//
// Marcador en el template: <!-- include:ruta/relativa/al/repo.html -->
//
// Uso: node scripts/build/assemble-index.js

const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, "templates", "index.template.html");
const OUTPUT = join(ROOT, "index.html");

const INCLUDE_PATTERN = /^(\s*)<!-- include:(\S+) -->\s*$/;

function assemble() {
  if (!existsSync(TEMPLATE)) {
    console.error(`Template no encontrado: ${TEMPLATE}`);
    process.exit(1);
  }

  const templateContent = readFileSync(TEMPLATE, "utf8");
  const lines = templateContent.split("\n");
  const missing = [];

  const assembled = lines
    .map((line) => {
      const match = line.match(INCLUDE_PATTERN);
      if (!match) return line;

      const [, , includePath] = match;
      const fullPath = join(ROOT, includePath);
      if (!existsSync(fullPath)) {
        missing.push(includePath);
        return line;
      }

      // Los partials terminan en '\n'; quitarlo evita una línea en blanco
      // extra al unir con '\n'.join() más abajo.
      return readFileSync(fullPath, "utf8").replace(/\n$/, "");
    })
    .join("\n");

  if (missing.length > 0) {
    console.error("Partials referenciados que no existen:");
    for (const path of missing) console.error(`  - ${path}`);
    process.exit(1);
  }

  return assembled;
}

function main() {
  const assembled = assemble();
  writeFileSync(OUTPUT, assembled);
  console.log(`index.html ensamblado (${assembled.split("\n").length} líneas)`);
}

if (require.main === module) {
  main();
}

module.exports = { assemble };
