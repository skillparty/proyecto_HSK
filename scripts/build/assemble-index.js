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

const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { createHash } = require("crypto");
const { join } = require("path");

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, "templates", "index.template.html");
const OUTPUT = join(ROOT, "index.html");

const INCLUDE_PATTERN = /^(\s*)<!-- include:(\S+) -->\s*$/;

// Marcador alternativo para los tabs cuyo markup NO viaja en index.html.
// Deja el panel vacío en el documento y escribe el contenido a
// assets/partials/tabs/, que ui-controller baja la primera vez que se abre esa
// pestaña. Solo se usa en tabs sin referencias desde scripts eager: si algo
// consultara ese markup durante el boot, no lo encontraría.
const DEFER_PATTERN = /^(\s*)<!-- defer-include:(\S+) -->\s*$/;
const RUNTIME_PARTIAL_DIR = join(ROOT, "assets", "partials", "tabs");

// El wrapper del panel se queda en index.html (switchTab y los tests dependen
// de que #<tab>.tab-panel exista desde el arranque); lo que se difiere es su
// contenido.
const PANEL_OPEN_PATTERN = /<div\s+id="([a-z0-9-]+)"\s+class="tab-panel[^"]*"[^>]*>/i;

function splitPanel(content, includePath) {
  const openTag = content.match(PANEL_OPEN_PATTERN);
  if (!openTag) {
    console.error(
      `${includePath}: no se encontró el <div id="..." class="tab-panel"> que envuelve el partial.`,
    );
    process.exit(1);
  }
  const start = content.indexOf(openTag[0]) + openTag[0].length;
  const end = content.lastIndexOf("</div>");
  if (end < start) {
    console.error(`${includePath}: no se encontró el </div> de cierre del panel.`);
    process.exit(1);
  }
  return {
    id: openTag[1],
    openTag: openTag[0],
    inner: content.slice(start, end).replace(/^\n/, "").replace(/\s+$/, ""),
  };
}

// Scripts inline (sin src): el pre-paint del tema y el importmap de Firebase.
// Ninguno de los dos puede externalizarse — el pre-paint tiene que correr antes
// del primer CSS o hay flash de tema, y el importmap no soporta src.
const INLINE_SCRIPT_PATTERN = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g;
const CSP_HASH_PLACEHOLDER = "{{CSP_SCRIPT_HASHES}}";

// El hash de CSP se calcula sobre el contenido exacto entre <script> y
// </script>, byte a byte. Calcularlo en build (y no a mano en el template)
// evita que se pudra en cuanto alguien toque una línea de esos scripts.
function computeInlineScriptHashes(html) {
  const hashes = [];
  for (const match of html.matchAll(INLINE_SCRIPT_PATTERN)) {
    const digest = createHash("sha256").update(match[1], "utf8").digest("base64");
    const source = `'sha256-${digest}'`;
    if (!hashes.includes(source)) hashes.push(source);
  }
  return hashes;
}

function applyCspHashes(html) {
  if (!html.includes(CSP_HASH_PLACEHOLDER)) {
    console.error(
      `No se encontró ${CSP_HASH_PLACEHOLDER} en el template: la CSP quedaría sin los hashes de los scripts inline.`,
    );
    process.exit(1);
  }
  // replaceAll y no replace: replace con patrón string sustituye solo la
  // primera aparición, y basta que alguien nombre el placeholder en un
  // comentario para que el de la meta quede sin reemplazar.
  return html.replaceAll(
    CSP_HASH_PLACEHOLDER,
    computeInlineScriptHashes(html).join(" "),
  );
}

function assemble() {
  if (!existsSync(TEMPLATE)) {
    console.error(`Template no encontrado: ${TEMPLATE}`);
    process.exit(1);
  }

  const templateContent = readFileSync(TEMPLATE, "utf8");
  const lines = templateContent.split("\n");
  const missing = [];
  const deferred = new Map();

  const assembled = lines
    .map((line) => {
      const deferMatch = line.match(DEFER_PATTERN);
      if (deferMatch) {
        const [, indent, includePath] = deferMatch;
        const fullPath = join(ROOT, includePath);
        if (!existsSync(fullPath)) {
          missing.push(includePath);
          return line;
        }
        const panel = splitPanel(readFileSync(fullPath, "utf8"), includePath);
        const runtimePath = `assets/partials/tabs/${panel.id}.html`;
        deferred.set(runtimePath, panel.inner + "\n");
        return (
          `${indent}<!-- ${panel.id}: markup diferido, se baja de ${runtimePath} ` +
          `al abrir la pestaña -->\n${indent}${panel.openTag}</div>`
        );
      }

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

  // Después de expandir los includes: un partial podría traer su propio
  // script inline y también tendría que entrar en la CSP.
  return { html: applyCspHashes(assembled), deferred };
}

function main() {
  const { html, deferred } = assemble();
  writeFileSync(OUTPUT, html);

  mkdirSync(RUNTIME_PARTIAL_DIR, { recursive: true });
  for (const [runtimePath, content] of deferred) {
    writeFileSync(join(ROOT, runtimePath), content);
  }

  console.log(
    `index.html ensamblado (${html.split("\n").length} líneas) ` +
      `+ ${deferred.size} partials diferidos en assets/partials/tabs/`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { assemble };
