#!/usr/bin/env node

// Sincroniza el cache-busting (?v=) usando hashes de contenido.
//
// Problema que resuelve: las versiones ?v=N se mantenían a mano en tres
// sitios (index.html, sw.js PRECACHE_FILES y los loaders dinámicos de
// ui-controller.js). Olvidar un bump dejaba assets stale o entradas de
// precache muertas (p. ej. sw.js precacheaba tones-invaders-game.js?v=5
// mientras ui-controller cargaba ?v=4).
//
// Qué hace:
//   1. Recolecta refs a assets/**/*.js|css desde index.html (src/href) y
//      cualquier ref ya versionada (?v=) en sw.js y ui-controller.js.
//   2. Calcula un hash sha1 corto del contenido de cada archivo.
//   3. Reescribe todas las refs como path?v=<hash> en los tres archivos.
//   4. Regenera SW_VERSION como <base-semver>+<hash-global> donde el hash
//      global cubre todos los archivos precacheados + index.html, de modo
//      que cualquier cambio (incluidos JSON de datos) rota los caches del SW.
//   5. Verifica que todo archivo referenciado en PRECACHE_FILES exista
//      (un 404 en cache.addAll() rompe la instalación completa del SW).
//
// Uso:
//   node scripts/build/apply-cache-versions.js            # dry-run sobre .
//   node scripts/build/apply-cache-versions.js --write    # aplica sobre .
//   node scripts/build/apply-cache-versions.js --dir dist --write
//
// En dry-run sale con código 1 solo si hay archivos referenciados que no
// existen; los desfases de versión se reportan pero no fallan (se aplican
// en el build de deploy).

const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");
const crypto = require("crypto");

const HASH_LENGTH = 8;
const INDEX_FILE = "index.html";
const SW_FILE = "sw.js";
const UI_CONTROLLER_FILE = "assets/js/modules/ui-controller.js";

function parseArgs(argv) {
  const args = { dir: ".", write: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--write") args.write = true;
    else if (argv[i] === "--dir" && argv[i + 1]) args.dir = argv[++i];
    else {
      console.error(`Argumento desconocido: ${argv[i]}`);
      process.exit(1);
    }
  }
  return args;
}

function shortHash(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex").slice(0, HASH_LENGTH);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Refs js/css declaradas en index.html vía src="..." / href="..."
function collectIndexRefs(indexContent) {
  const refs = new Set();
  const pattern = /(?:src|href)="(assets\/[A-Za-z0-9_\-./]+\.(?:js|css))(?:\?v=[^"]*)?"/g;
  for (const match of indexContent.matchAll(pattern)) {
    refs.add(match[1]);
  }
  return refs;
}

// Refs ya versionadas (?v=) en cualquier contenido (sw.js, ui-controller.js)
function collectVersionedRefs(content) {
  const refs = new Set();
  const pattern = /(?:\.\/)?(assets\/[A-Za-z0-9_\-./]+\.(?:js|css))\?v=[^"'\s)]*/g;
  for (const match of content.matchAll(pattern)) {
    refs.add(match[1]);
  }
  return refs;
}

// Rutas locales listadas en PRECACHE_FILES de sw.js (sin "./" raíz)
function collectPrecachePaths(swContent) {
  const blockMatch = swContent.match(/const PRECACHE_FILES = \[([\s\S]*?)\];/);
  if (!blockMatch) {
    console.error("No se encontró PRECACHE_FILES en sw.js");
    process.exit(1);
  }
  const paths = new Set();
  const pattern = /"\.\/([^"?]+)(?:\?v=[^"]*)?"/g;
  for (const match of blockMatch[1].matchAll(pattern)) {
    paths.add(match[1]);
  }
  return paths;
}

// Reescribe cada ref del mapa como path?v=<hash>, preservando prefijo "./"
function applyVersions(content, versionMap) {
  const paths = [...versionMap.keys()].sort((a, b) => b.length - a.length);
  let changes = 0;
  let result = content;
  for (const assetPath of paths) {
    const hash = versionMap.get(assetPath);
    const pattern = new RegExp(
      `(\\.\\/)?${escapeRegExp(assetPath)}(?![A-Za-z0-9_.-])(\\?v=[^"'\\s)]*)?`,
      "g",
    );
    result = result.replace(pattern, (match, dotSlash) => {
      const replacement = `${dotSlash || ""}${assetPath}?v=${hash}`;
      if (replacement !== match) changes++;
      return replacement;
    });
  }
  return { content: result, changes };
}

function main() {
  const args = parseArgs(process.argv);
  const root = args.dir;

  const targets = [INDEX_FILE, SW_FILE, UI_CONTROLLER_FILE];
  for (const target of targets) {
    if (!existsSync(join(root, target))) {
      console.error(`Archivo objetivo no encontrado: ${join(root, target)}`);
      process.exit(1);
    }
  }

  const indexContent = readFileSync(join(root, INDEX_FILE), "utf8");
  const swContent = readFileSync(join(root, SW_FILE), "utf8");
  const uiContent = readFileSync(join(root, UI_CONTROLLER_FILE), "utf8");

  // 1. Mapa de rutas versionables
  const versionablePaths = new Set([
    ...collectIndexRefs(indexContent),
    ...collectVersionedRefs(swContent),
    ...collectVersionedRefs(uiContent),
  ]);

  // 2. Validar existencia (rutas versionables + precache completo)
  const precachePaths = collectPrecachePaths(swContent);
  const missing = [];
  for (const assetPath of new Set([...versionablePaths, ...precachePaths])) {
    if (!existsSync(join(root, assetPath))) missing.push(assetPath);
  }
  if (missing.length > 0) {
    console.error("Archivos referenciados que no existen:");
    for (const assetPath of missing) console.error(`  - ${assetPath}`);
    process.exit(1);
  }

  // 3. Reescribir ui-controller primero: su propio hash debe reflejar
  //    las refs ya actualizadas que contiene.
  const preliminaryMap = new Map();
  for (const assetPath of versionablePaths) {
    if (assetPath === UI_CONTROLLER_FILE) continue;
    preliminaryMap.set(assetPath, shortHash(readFileSync(join(root, assetPath))));
  }
  const uiResult = applyVersions(uiContent, preliminaryMap);

  const versionMap = new Map(preliminaryMap);
  if (versionablePaths.has(UI_CONTROLLER_FILE)) {
    versionMap.set(UI_CONTROLLER_FILE, shortHash(Buffer.from(uiResult.content)));
  }

  // 4. Reescribir index.html y sw.js con el mapa completo
  const indexResult = applyVersions(indexContent, versionMap);
  const swResult = applyVersions(swContent, versionMap);

  // 5. SW_VERSION global: cubre precache completo + index.html reescrito
  const globalInputs = [];
  for (const assetPath of [...precachePaths].sort()) {
    if (assetPath === INDEX_FILE) {
      globalInputs.push(`${assetPath}=${shortHash(Buffer.from(indexResult.content))}`);
    } else if (assetPath === UI_CONTROLLER_FILE) {
      globalInputs.push(`${assetPath}=${versionMap.get(assetPath)}`);
    } else {
      globalInputs.push(`${assetPath}=${shortHash(readFileSync(join(root, assetPath)))}`);
    }
  }
  const globalHash = shortHash(Buffer.from(globalInputs.join("\n")));

  const versionMatch = swResult.content.match(/const SW_VERSION = "([^"]*)";/);
  if (!versionMatch) {
    console.error("No se encontró SW_VERSION en sw.js");
    process.exit(1);
  }
  const baseVersion = (versionMatch[1].match(/^\d+\.\d+\.\d+/) || ["1.0.0"])[0];
  const newVersion = `${baseVersion}+${globalHash}`;
  const versionChanged = versionMatch[1] !== newVersion;
  const finalSwContent = swResult.content.replace(
    /const SW_VERSION = "[^"]*";/,
    `const SW_VERSION = "${newVersion}";`,
  );

  // 6. Reporte y escritura
  const results = [
    { file: INDEX_FILE, content: indexResult.content, changes: indexResult.changes },
    { file: SW_FILE, content: finalSwContent, changes: swResult.changes + (versionChanged ? 1 : 0) },
    { file: UI_CONTROLLER_FILE, content: uiResult.content, changes: uiResult.changes },
  ];

  console.log(`Rutas versionadas: ${versionMap.size}`);
  console.log(`SW_VERSION: ${versionMatch[1]} -> ${newVersion}`);
  for (const { file, changes } of results) {
    console.log(`  ${file}: ${changes} refs actualizadas`);
  }

  if (!args.write) {
    console.log("\nDry-run (sin --write). Archivos verificados, nada escrito.");
    return;
  }

  for (const { file, content } of results) {
    writeFileSync(join(root, file), content);
  }
  console.log(`\nVersiones aplicadas en ${root}/`);
}

main();
