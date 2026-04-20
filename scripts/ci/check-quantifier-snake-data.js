#!/usr/bin/env node

const assert = require('assert');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const ROOT = process.cwd();
const dataPath = join(ROOT, 'assets/data/quantifier_snake_words.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(dataPath)) {
  fail('Missing data file: assets/data/quantifier_snake_words.json');
}

let payload;
try {
  payload = JSON.parse(readFileSync(dataPath, 'utf-8'));
} catch (error) {
  fail('Invalid JSON in assets/data/quantifier_snake_words.json');
}

assert.ok(payload && typeof payload === 'object', 'Snake quantifier payload must be an object');
assert.ok(Array.isArray(payload.quantifiers), 'quantifiers must be an array');
assert.ok(Array.isArray(payload.words), 'words must be an array');
assert.ok(payload.quantifiers.length >= 6, 'Expected at least 6 quantifiers');
assert.ok(payload.words.length >= 24, 'Expected at least 24 words for playable pool');

const quantifierIds = new Set();
payload.quantifiers.forEach((quantifier, index) => {
  assert.ok(quantifier && typeof quantifier === 'object', `Invalid quantifier at index ${index}`);
  const id = String(quantifier.id || '').trim();
  const hanzi = String(quantifier.hanzi || '').trim();
  const pinyin = String(quantifier.pinyin || '').trim();
  const es = String(quantifier.es || '').trim();
  const en = String(quantifier.en || '').trim();

  assert.ok(id, `Quantifier #${index} is missing id`);
  assert.ok(!quantifierIds.has(id), `Duplicate quantifier id: ${id}`);
  quantifierIds.add(id);

  assert.ok(hanzi, `Quantifier ${id} is missing hanzi`);
  assert.ok(pinyin, `Quantifier ${id} is missing pinyin`);
  assert.ok(es, `Quantifier ${id} is missing Spanish label`);
  assert.ok(en, `Quantifier ${id} is missing English label`);
});

const wordIds = new Set();
const quantifierUsageCount = new Map();

payload.words.forEach((word, index) => {
  assert.ok(word && typeof word === 'object', `Invalid word at index ${index}`);

  const id = String(word.id || '').trim();
  const hanzi = String(word.hanzi || '').trim();
  const pinyin = String(word.pinyin || '').trim();
  const es = String(word.es || '').trim();
  const en = String(word.en || '').trim();
  const quantifiers = Array.isArray(word.quantifiers) ? word.quantifiers : [];

  assert.ok(id, `Word #${index} is missing id`);
  assert.ok(!wordIds.has(id), `Duplicate word id: ${id}`);
  wordIds.add(id);

  assert.ok(hanzi, `Word ${id} is missing hanzi`);
  assert.ok(pinyin, `Word ${id} is missing pinyin`);
  assert.ok(es, `Word ${id} is missing Spanish meaning`);
  assert.ok(en, `Word ${id} is missing English meaning`);
  assert.ok(quantifiers.length > 0, `Word ${id} must include at least one quantifier`);

  quantifiers.forEach((quantifierId) => {
    const normalizedId = String(quantifierId || '').trim();
    assert.ok(quantifierIds.has(normalizedId), `Word ${id} references unknown quantifier: ${normalizedId}`);
    quantifierUsageCount.set(normalizedId, (quantifierUsageCount.get(normalizedId) || 0) + 1);
  });
});

quantifierIds.forEach((id) => {
  const count = quantifierUsageCount.get(id) || 0;
  assert.ok(count >= 3, `Quantifier ${id} must map to at least 3 words`);
});

console.log('Quantifier snake data checks passed.');
