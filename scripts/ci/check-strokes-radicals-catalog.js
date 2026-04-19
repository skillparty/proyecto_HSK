#!/usr/bin/env node

const assert = require('assert');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const controllerPath = join(ROOT, 'assets/js/modules/strokes-radicals-controller.js');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(controllerPath)) {
  fail('Missing controller file: assets/js/modules/strokes-radicals-controller.js');
}

const source = readFileSync(controllerPath, 'utf-8');

const sandbox = {
  console,
  window: {
    hskLogger: console,
    backendAuth: {
      getCurrentUser: () => null
    }
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  document: {
    getElementById: () => null,
    querySelectorAll: () => []
  }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: controllerPath });

const StrokesRadicalsController = sandbox.window.StrokesRadicalsController;
assert.ok(StrokesRadicalsController, 'Controller class was not loaded');

const appStub = {
  currentLanguage: 'es',
  getTranslation: (key) => key,
  getMeaningForLanguage: () => '',
  playAudio: () => {}
};

const controller = new StrokesRadicalsController(appStub);
const allStrokes = Array.isArray(controller.strokeCatalog) ? controller.strokeCatalog : [];
const extendedStrokes = allStrokes.filter((entry) => entry.family === 'extended');

assert.strictEqual(
  extendedStrokes.length,
  0x31e3 - 0x31c0 + 1,
  'Unexpected amount of extended strokes in the catalog'
);

assert.ok(
  extendedStrokes.every((entry) => String(entry.nameEs || '').trim().length > 0),
  'Every extended stroke must have nameEs'
);

assert.ok(
  extendedStrokes.every((entry) => String(entry.nameEn || '').trim().length > 0),
  'Every extended stroke must have nameEn'
);

assert.ok(
  extendedStrokes.every((entry) => String(entry.strokeCode || '').trim().length > 0),
  'Every extended stroke must have strokeCode'
);

function getByCode(strokeCode) {
  return extendedStrokes.find((entry) => entry.strokeCode === strokeCode);
}

const sampleVariant = getByCode('T');
assert.ok(sampleVariant, 'Missing sample stroke code T');
assert.ok(sampleVariant.nameEs.includes('Variante T'), 'Expected pedagogical ES label for T');
assert.ok(sampleVariant.nameEs.includes('(ti)'), 'Expected ES pinyin component for T');
assert.ok(sampleVariant.nameEn.includes('(ti)'), 'Expected EN pinyin component for T');

const sampleCompositeEs = getByCode('HZ');
assert.ok(sampleCompositeEs, 'Missing sample stroke code HZ');
assert.ok(sampleCompositeEs.nameEs.includes('Compuesto HZ'), 'Expected composite ES label for HZ');
assert.ok(sampleCompositeEs.nameEs.includes('(heng)'), 'Expected ES heng component for HZ');
assert.ok(sampleCompositeEs.nameEs.includes('(zhe)'), 'Expected ES zhe component for HZ');

const sampleCompositeEn = getByCode('HZZZG');
assert.ok(sampleCompositeEn, 'Missing sample stroke code HZZZG');
assert.ok(sampleCompositeEn.nameEn.includes('Composite HZZZG'), 'Expected composite EN label for HZZZG');
assert.ok(sampleCompositeEn.nameEn.includes('(heng)'), 'Expected EN heng component for HZZZG');
assert.ok(sampleCompositeEn.nameEn.includes('(zhe)'), 'Expected EN zhe component for HZZZG');
assert.ok(sampleCompositeEn.nameEn.includes('(gou)'), 'Expected EN gou component for HZZZG');

console.log('Strokes/radicals catalog checks passed. Extended strokes:', extendedStrokes.length);
