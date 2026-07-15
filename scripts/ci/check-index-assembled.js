#!/usr/bin/env node

// index.html se genera desde templates/index.template.html + partials
// (ver scripts/build/assemble-index.js). Este check falla si alguien
// editó un partial (o el template) sin correr `npm run assemble` antes
// de commitear — o si editó index.html directamente, lo que lo
// desincroniza silenciosamente de los partials.

const { readFileSync } = require("fs");
const { join } = require("path");
const { assemble } = require("../build/assemble-index");

const ROOT = process.cwd();
const INDEX_FILE = join(ROOT, "index.html");

function main() {
  const committed = readFileSync(INDEX_FILE, "utf8");
  const expected = assemble();

  if (committed !== expected) {
    console.error(
      "index.html está desincronizado de templates/index.template.html + partials.",
    );
    console.error("Corré `npm run assemble` y commiteá el resultado.");
    process.exit(1);
  }

  console.log("index.html coincide con template + partials.");
}

main();
