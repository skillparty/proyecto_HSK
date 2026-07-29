#!/usr/bin/env node

// Concatena los assets eager de dist/ para bajar el costo de arranque:
// 33 <script> + 12 <link> pasan a 4 requests.
//
// Concatenación, NO bundling ESM. La app son scripts clásicos cuyo scope
// top-level ES el global (class UIController {} queda en window). Pasarlos por
// un bundler de módulos los metería en scope de módulo y no existiría ningún
// global: rompe todo. Concatenar preserva la semántica exactamente.
//
// Solo toca dist/. En dev se siguen sirviendo los archivos sueltos, que es lo
// que hace debuggeable el stack trace.
//
// Corre después de copiar y ANTES de apply-cache-versions.js, para que el
// hash ?v= se calcule sobre los bundles ya escritos.

const { readFileSync, writeFileSync, existsSync, rmSync } = require("fs");
const { join } = require("path");

const HEAD_BUNDLE = "assets/js/head.bundle.js";
const APP_BUNDLE = "assets/js/app.bundle.js";
const CSS_BUNDLE = "assets/css/app.bundle.css";

// bootstrap-diagnostics.js hace getElementById('main-stylesheet') y mira .sheet
// para detectar CSS caído. El link del bundle tiene que heredar ese id.
const MAIN_STYLESHEET_ID = "main-stylesheet";

const SCRIPT_PATTERN = /[ \t]*<script([^>]*)\ssrc="([^"]+)"([^>]*)><\/script>\n?/g;
const CSS_LINK_PATTERN =
  /[ \t]*<link[^>]*\shref="(assets\/css\/[^"]+)"[^>]*>\n?/g;

function stripQuery(path) {
  return path.split("?")[0];
}

// Cada archivo tiene que terminar en ; o } para que concatenar no dispare ASI
// (p. ej. un archivo que cierra sin ; seguido de otro que abre con paréntesis).
// Se valida en vez de parchear: si algún día entra un archivo que rompe la
// invariante, el build falla en lugar de generar un bundle sutilmente roto.
function readVerified(dir, relPath, separator) {
  const fullPath = join(dir, relPath);
  if (!existsSync(fullPath)) {
    console.error(`Bundle: archivo no encontrado: ${relPath}`);
    process.exit(1);
  }
  const source = readFileSync(fullPath, "utf8").trimEnd();
  const lastChar = source.slice(-1);
  if (!";}".includes(lastChar)) {
    console.error(
      `Bundle: ${relPath} termina en ${JSON.stringify(lastChar)}; ` +
        "debe terminar en ';' o '}' para poder concatenarlo sin riesgo de ASI.",
    );
    process.exit(1);
  }
  // En CSS el archivo tiene que cerrar todos sus bloques: si quedara uno
  // abierto, se tragaría el archivo siguiente entero.
  if (separator === CSS_SEPARATOR) {
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
    const open = (withoutComments.match(/{/g) || []).length;
    const close = (withoutComments.match(/}/g) || []).length;
    if (open !== close) {
      console.error(
        `Bundle: ${relPath} tiene llaves desbalanceadas (abre ${open}, cierra ${close}).`,
      );
      process.exit(1);
    }
  }
  return source;
}

// El separador NO es el mismo para JS y CSS. En JS el ';' entre archivos
// protege de ASI. En CSS un ';' suelto en top level es un token inesperado y
// el parser, al recuperarse, se traga la regla siguiente — o sea, la primera
// regla de cada archivo concatenado. Así desapareció `.tab-panel{display:none}`
// (primera regla de app-home.css) y quedaron visibles todos los tabs inactivos.
const JS_SEPARATOR = "\n;\n";
const CSS_SEPARATOR = "\n";

function concatenate(dir, relPaths, banner, separator) {
  const parts = relPaths.map(
    (relPath) => `/* ${relPath} */\n${readVerified(dir, relPath, separator)}`,
  );
  return `/* ${banner} — generado por scripts/build/bundle-assets.js */\n${parts.join(separator)}\n`;
}

// Clasifica los <script src> del head/body en los tres grupos que no se pueden
// mezclar entre sí: bloqueantes, ESM y diferidos.
function classifyScripts(html) {
  const blocking = [];
  const deferred = [];
  const untouched = [];

  for (const match of html.matchAll(SCRIPT_PATTERN)) {
    const attrs = match[1] + match[3];
    const src = stripQuery(match[2]);
    if (!src.startsWith("assets/js/")) {
      untouched.push(src);
      continue;
    }
    // Un type="module" no se puede concatenar con scripts clásicos: tiene su
    // propio scope y sus imports los resuelve el importmap.
    if (/type\s*=\s*"module"/.test(attrs)) {
      untouched.push(src);
      continue;
    }
    (/\sdefer/.test(attrs) ? deferred : blocking).push(src);
  }

  return { blocking, deferred, untouched };
}

function collectCss(html) {
  return [...html.matchAll(CSS_LINK_PATTERN)].map((m) => stripQuery(m[1]));
}

// Reemplaza la primera etiqueta de cada grupo por la del bundle y elimina el
// resto, preservando la posición original (que es la que define el orden de
// ejecución y, en CSS, la cascada).
function replaceGroup(html, pattern, members, replacement) {
  const memberSet = new Set(members);
  let emitted = false;

  return html.replace(pattern, (fullMatch, ...groups) => {
    const src = stripQuery(
      groups.find((g) => typeof g === "string" && g.includes("assets/")) || "",
    );
    if (!memberSet.has(src)) return fullMatch;
    if (emitted) return "";
    emitted = true;
    const indent = fullMatch.match(/^[ \t]*/)[0];
    return `${indent}${replacement}\n`;
  });
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Uso: node bundle-assets.js <dir>");
    process.exit(1);
  }

  const indexPath = join(dir, "index.html");
  let html = readFileSync(indexPath, "utf8");

  const { blocking, deferred } = classifyScripts(html);
  const cssFiles = collectCss(html);

  if (blocking.length === 0 || deferred.length === 0 || cssFiles.length === 0) {
    console.error(
      "Bundle: no se encontró alguno de los grupos esperados " +
        `(bloqueantes: ${blocking.length}, diferidos: ${deferred.length}, css: ${cssFiles.length}).`,
    );
    process.exit(1);
  }

  writeFileSync(
    join(dir, HEAD_BUNDLE),
    concatenate(dir, blocking, "head bundle", JS_SEPARATOR),
  );
  writeFileSync(
    join(dir, APP_BUNDLE),
    concatenate(dir, deferred, "app bundle", JS_SEPARATOR),
  );
  writeFileSync(
    join(dir, CSS_BUNDLE),
    concatenate(dir, cssFiles, "css bundle (el orden ES la cascada)", CSS_SEPARATOR),
  );

  html = replaceGroup(
    html,
    SCRIPT_PATTERN,
    blocking,
    `<script src="${HEAD_BUNDLE}"></script>`,
  );
  html = replaceGroup(
    html,
    SCRIPT_PATTERN,
    deferred,
    `<script src="${APP_BUNDLE}" defer></script>`,
  );
  html = replaceGroup(
    html,
    CSS_LINK_PATTERN,
    cssFiles,
    `<link rel="stylesheet" href="${CSS_BUNDLE}" id="${MAIN_STYLESHEET_ID}">`,
  );

  writeFileSync(indexPath, html);

  // Los originales ya no los referencia nadie: el loader lazy de
  // ui-controller.js apunta solo a archivos que no entran en estos bundles
  // (verificado: cero solape).
  const bundled = [...blocking, ...deferred, ...cssFiles];
  for (const relPath of bundled) {
    rmSync(join(dir, relPath), { force: true });
  }

  // sw.js precachea rutas sueltas: sin esto pediría archivos ya borrados y
  // apply-cache-versions fallaría al validar que existen.
  const swPath = join(dir, "sw.js");
  let sw = readFileSync(swPath, "utf8");
  const bundledSet = new Set(bundled);
  let firstReplaced = false;
  sw = sw
    .split("\n")
    .filter((line) => {
      const match = line.match(/"\.\/([^"?]+)/);
      if (!match || !bundledSet.has(match[1])) return true;
      if (firstReplaced) return false;
      firstReplaced = true;
      return true;
    })
    .map((line) => {
      const match = line.match(/"\.\/([^"?]+)/);
      if (!match || !bundledSet.has(match[1])) return line;
      return `  "./${HEAD_BUNDLE}",\n  "./${APP_BUNDLE}",\n  "./${CSS_BUNDLE}",`;
    })
    .join("\n");
  writeFileSync(swPath, sw);

  const totalBefore = blocking.length + deferred.length + cssFiles.length;
  console.log(
    `Bundles: ${totalBefore} archivos → 3 (head ${blocking.length}, app ${deferred.length}, css ${cssFiles.length})`,
  );
}

main();
