#!/usr/bin/env node

const { readdirSync, statSync, existsSync, readFileSync } = require('fs');
const { join, extname, relative } = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const JS_TARGET_DIRS = ['assets/js', 'config', 'scripts'];
const HTML_TARGETS = ['index.html'];

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
    const result = spawnSync(process.execPath, ['--check', file], {
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    if (result.status !== 0) {
      hasError = true;
      process.stderr.write('\nSyntax error in: ' + relative(ROOT, file) + '\n');
      process.stderr.write(result.stderr || result.stdout || 'Unknown parser error\n');
    }
  }

  return !hasError;
}

function checkInlineHandlers(htmlFiles) {
  let hasInlineHandlers = false;
  const inlineOnclickRegex = /\sonclick\s*=/i;

  for (const file of htmlFiles) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf-8');

    if (inlineOnclickRegex.test(content)) {
      hasInlineHandlers = true;
      process.stderr.write('\nInline onclick handler detected in: ' + relative(ROOT, file) + '\n');
    }
  }

  return !hasInlineHandlers;
}

const jsFiles = JS_TARGET_DIRS
  .map((dir) => join(ROOT, dir))
  .flatMap((dir) => collectFilesByExtension(dir, '.js'));

const htmlFiles = HTML_TARGETS.map((file) => join(ROOT, file));

if (jsFiles.length === 0) {
  console.log('No JavaScript files found to validate.');
}

const jsOk = jsFiles.length === 0 ? true : checkJavaScriptSyntax(jsFiles);
const htmlOk = checkInlineHandlers(htmlFiles);

if (!jsOk || !htmlOk) {
  process.exit(1);
}

console.log('Validation passed for ' + jsFiles.length + ' JavaScript files and HTML inline-handler checks.');
