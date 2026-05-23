#!/usr/bin/env node

const { readdirSync, statSync, existsSync, readFileSync } = require("fs");
const { join, extname, relative } = require("path");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const JS_TARGET_DIRS = ["assets/js", "config", "scripts"];
const JSON_TARGET_DIRS = ["assets/data", "config"];
const HTML_TARGETS = ["index.html"];

function collectFilesByExtension(dirPath, extension) {
  if (!existsSync(dirPath)) return [];

  const entries = readdirSync(dirPath);
  const files = [];

  for (const entry of entries) {
    const absPath = join(dirPath, entry);
    const stats = statSync(absPath);

    if (stats.isDirectory()) {
      files.push(...collectFilesByExtension(absPath, extension));
      continue;
    }

    if (extname(absPath) === extension) {
      files.push(absPath);
    }
  }

  return files;
}

function checkJavaScriptSyntax(jsFiles) {
  let hasError = false;

  for (const file of jsFiles) {
    const result = spawnSync(process.execPath, ["--check", file], {
      stdio: "pipe",
      encoding: "utf-8",
    });

    if (result.status !== 0) {
      hasError = true;
      process.stderr.write("\nSyntax error in: " + relative(ROOT, file) + "\n");
      process.stderr.write(
        result.stderr || result.stdout || "Unknown parser error\n",
      );
    }
  }

  return !hasError;
}

function checkJsonValidity(jsonFiles) {
  let hasError = false;

  for (const file of jsonFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      JSON.parse(content);
    } catch (err) {
      hasError = true;
      process.stderr.write("\nInvalid JSON in: " + relative(ROOT, file) + "\n");
      process.stderr.write(err.message + "\n");
    }
  }

  return !hasError;
}

function checkInlineHandlers(htmlFiles) {
  let hasInlineHandlers = false;
  const inlineOnclickRegex = /\sonclick\s*=/i;

  for (const file of htmlFiles) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf-8");

    if (inlineOnclickRegex.test(content)) {
      hasInlineHandlers = true;
      process.stderr.write(
        "\nInline onclick handler detected in: " + relative(ROOT, file) + "\n",
      );
    }
  }

  return !hasInlineHandlers;
}

function checkInlineHandlersInJs(jsFiles) {
  let hasInlineHandlers = false;
  // Matches onclick="..." or onclick='...' patterns inside JS string literals / template literals
  const inlineOnclickInStringRegex = /onclick\s*=\s*["'`]/i;

  for (const file of jsFiles) {
    // Skip the CI scripts themselves
    if (file.includes("scripts/ci")) continue;

    const content = readFileSync(file, "utf-8");

    if (inlineOnclickInStringRegex.test(content)) {
      process.stderr.write(
        "\nWarning — inline onclick in dynamic HTML string: " +
          relative(ROOT, file) +
          "\n",
      );
      process.stderr.write(
        "  Consider using addEventListener() instead of inline onclick in innerHTML.\n",
      );
      hasInlineHandlers = true;
    }
  }

  // NOTE: This is a WARNING, not a hard failure, to avoid blocking CI on legacy code.
  // Change `return true` to `return !hasInlineHandlers` to make it a hard failure.
  if (hasInlineHandlers) {
    process.stderr.write(
      "\n⚠️  Inline onclick patterns found in JS files (warning only — not blocking CI).\n",
    );
  }
  return true;
}

// Collect files
const jsFiles = JS_TARGET_DIRS.map((dir) => join(ROOT, dir)).flatMap((dir) =>
  collectFilesByExtension(dir, ".js"),
);

const jsonFiles = JSON_TARGET_DIRS.map((dir) => join(ROOT, dir)).flatMap(
  (dir) => collectFilesByExtension(dir, ".json"),
);

const htmlFiles = HTML_TARGETS.map((file) => join(ROOT, file));

if (jsFiles.length === 0) {
  console.log("No JavaScript files found to validate.");
}

// Run all checks
const jsOk = jsFiles.length === 0 ? true : checkJavaScriptSyntax(jsFiles);
const jsonOk = jsonFiles.length === 0 ? true : checkJsonValidity(jsonFiles);
const htmlOk = checkInlineHandlers(htmlFiles);
const jsHtmlOk = checkInlineHandlersInJs(jsFiles);

if (!jsOk || !jsonOk || !htmlOk || !jsHtmlOk) {
  process.exit(1);
}

console.log(
  "Validation passed for " +
    jsFiles.length +
    " JavaScript files, " +
    jsonFiles.length +
    " JSON files, and HTML inline-handler checks.",
);
