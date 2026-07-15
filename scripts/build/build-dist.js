#!/usr/bin/env node

// Ensambla dist/ con solo los archivos públicos del sitio y aplica el
// cache-busting por hash de contenido (apply-cache-versions.js).
//
// Antes el deploy subía el repo entero a GitHub Pages (node_modules,
// scripts, docs internos). Este build publica únicamente el runtime.
//
// Exclusiones deliberadas:
//   - assets/libros: PDF con copyright, solo referencia local (gitignored).
//   - node_modules, scripts, docs, .git: internos, nunca publicables.
//
// Uso: node scripts/build/build-dist.js

const { rmSync, cpSync, existsSync } = require("fs");
const { join, sep } = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "dist");

const INCLUDE = ["index.html", "sw.js", "assets", "config"];
const EXCLUDED_DIRS = [join("assets", "libros")];
const EXCLUDED_FILES = [".DS_Store"];

function shouldCopy(srcPath) {
  const relPath = srcPath.slice(ROOT.length + 1);
  if (EXCLUDED_FILES.some((name) => relPath.endsWith(sep + name) || relPath === name)) {
    return false;
  }
  return !EXCLUDED_DIRS.some(
    (dir) => relPath === dir || relPath.startsWith(dir + sep),
  );
}

function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });

  for (const entry of INCLUDE) {
    const srcPath = join(ROOT, entry);
    if (!existsSync(srcPath)) {
      console.error(`Entrada requerida no encontrada: ${entry}`);
      process.exit(1);
    }
    cpSync(srcPath, join(OUT_DIR, entry), {
      recursive: true,
      filter: shouldCopy,
    });
  }

  const versioning = spawnSync(
    process.execPath,
    [join(__dirname, "apply-cache-versions.js"), "--dir", OUT_DIR, "--write"],
    { stdio: "inherit" },
  );
  if (versioning.status !== 0) {
    console.error("Fallo al aplicar versiones de cache");
    process.exit(versioning.status ?? 1);
  }

  console.log(`\nBuild listo en dist/`);
}

main();
