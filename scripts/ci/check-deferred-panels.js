#!/usr/bin/env node

// El markup diferido por pestaña está declarado en tres lugares que tienen que
// coincidir, y ninguno falla ruidosamente si se desincronizan:
//
//   1. templates/index.template.html — los marcadores `defer-include`, que son
//      los que dejan el panel vacío y generan assets/partials/tabs/*.html.
//   2. UIController.DEFERRED_TAB_PANELS — de esto depende que ui-controller
//      hidrate antes de correr el init. Si falta una pestaña, el panel queda
//      vacío para siempre y el init consulta un DOM que no existe.
//   3. PRECACHE_FILES en sw.js — si falta una, esa pestaña queda vacía offline.
//
// Uso: node scripts/ci/check-deferred-panels.js

const { readFileSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();

function fail(message, items) {
  console.error(message);
  for (const item of items) console.error(`  - ${item}`);
  process.exit(1);
}

function fromTemplate() {
  const template = readFileSync(join(ROOT, "templates", "index.template.html"), "utf8");
  return new Set(
    [...template.matchAll(/<!-- defer-include:\S+\/([a-z0-9-]+)\.html -->/g)].map(
      (match) => match[1],
    ),
  );
}

function fromUiController() {
  const source = readFileSync(
    join(ROOT, "assets", "js", "modules", "ui-controller.js"),
    "utf8",
  );
  const block = source.match(/DEFERRED_TAB_PANELS = new Set\(\[([\s\S]*?)\]\)/);
  if (!block) {
    console.error("No se encontró UIController.DEFERRED_TAB_PANELS en ui-controller.js");
    process.exit(1);
  }
  return new Set([...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((match) => match[1]));
}

function fromServiceWorker() {
  const source = readFileSync(join(ROOT, "sw.js"), "utf8");
  return new Set(
    [...source.matchAll(/"\.\/assets\/partials\/tabs\/([a-z0-9-]+)\.html"/g)].map(
      (match) => match[1],
    ),
  );
}

function difference(a, b) {
  return [...a].filter((item) => !b.has(item)).sort();
}

function main() {
  const template = fromTemplate();
  const controller = fromUiController();
  const serviceWorker = fromServiceWorker();

  if (template.size === 0) {
    console.error("No hay ningún defer-include en el template.");
    process.exit(1);
  }

  const missingInController = difference(template, controller);
  if (missingInController.length > 0) {
    fail(
      "Pestañas diferidas en el template que faltan en UIController.DEFERRED_TAB_PANELS\n" +
        "(el panel quedaría vacío y su init correría sobre un DOM inexistente):",
      missingInController,
    );
  }

  const extraInController = difference(controller, template);
  if (extraInController.length > 0) {
    fail(
      "Pestañas en UIController.DEFERRED_TAB_PANELS que no están diferidas en el template\n" +
        "(ui-controller pediría un partial que no se genera):",
      extraInController,
    );
  }

  const missingInSw = difference(template, serviceWorker);
  if (missingInSw.length > 0) {
    fail(
      "Pestañas diferidas que faltan en PRECACHE_FILES de sw.js\n" +
        "(quedarían vacías sin conexión):",
      missingInSw,
    );
  }

  const extraInSw = difference(serviceWorker, template);
  if (extraInSw.length > 0) {
    fail("Partials en el precache de sw.js que ya no se generan:", extraInSw);
  }

  console.log(`Paneles diferidos consistentes (${template.size}): template, ui-controller y sw.js.`);
}

main();
