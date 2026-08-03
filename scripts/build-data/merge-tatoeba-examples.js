#!/usr/bin/env node
/**
 * Mergea el staging de tatoeba-examples.js dentro de los datos de la app.
 *
 * tatoeba-examples.js escribe a staging a propósito y no toca
 * assets/data/hsk_example_sentences.json: el merge es una decisión aparte,
 * porque mete frases generadas en el corpus que se le muestra al usuario.
 *
 * Qué hace:
 *   - Las entradas ya existentes ganan siempre: nunca se pisa una curada.
 *   - Normaliza el pinyin de TODO el corpus con collapseLatinRuns, incluidas
 *     las que ya estaban (había 56 con nombres propios deletreados).
 *   - Reporta el desglose por nivel y por origen antes de escribir.
 *
 * Uso:
 *   node scripts/build-data/merge-tatoeba-examples.js           # dry-run
 *   node scripts/build-data/merge-tatoeba-examples.js --write
 */

const fs = require('fs');
const path = require('path');
const { collapseLatinRuns } = require('./tatoeba-examples');

const ROOT = path.resolve(__dirname, '../..');
const STAGING = path.join(__dirname, '.tatoeba-cache/examples-new.json');
const TARGET = path.join(ROOT, 'assets/data/hsk_example_sentences.json');
const VOCAB = path.join(ROOT, 'assets/data/hsk_vocabulary.json');

const write = process.argv.includes('--write');
const log = (...a) => console.log('[merge]', ...a);

function main() {
  if (!fs.existsSync(STAGING)) {
    console.error(`Falta el staging: ${STAGING}\nCorré antes: node scripts/build-data/tatoeba-examples.js`);
    process.exit(1);
  }

  const generated = JSON.parse(fs.readFileSync(STAGING, 'utf8'));
  const current = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
  const vocab = JSON.parse(fs.readFileSync(VOCAB, 'utf8'));
  const levelOf = new Map(vocab.map((w) => [w.character, w.level]));

  const merged = {};
  let repinyined = 0;

  for (const [word, entry] of Object.entries({ ...generated, ...current })) {
    const pinyin = collapseLatinRuns(entry.chinese || '', entry.pinyin || '');
    if (pinyin !== entry.pinyin) repinyined++;
    merged[word] = { ...entry, pinyin };
  }

  const added = Object.keys(merged).filter((w) => !current[w]);
  const byLevel = {};
  for (const word of added) {
    const level = levelOf.get(word) ?? '?';
    byLevel[level] = (byLevel[level] || 0) + 1;
  }
  const pivoted = added.filter((w) => merged[w].source === 'tatoeba-pivot').length;

  log(`entradas: ${Object.keys(current).length} -> ${Object.keys(merged).length} (+${added.length})`);
  log(`  español directo: ${added.length - pivoted} | por pivote: ${pivoted}`);
  log('  nuevas por nivel:', JSON.stringify(byLevel));
  log(`pinyin normalizado (nombres propios deletreados): ${repinyined}`);

  const coverage = {};
  for (const w of vocab) {
    coverage[w.level] = coverage[w.level] || { total: 0, covered: 0 };
    coverage[w.level].total++;
    if (merged[w.character]) coverage[w.level].covered++;
  }
  log('cobertura resultante:');
  let total = 0;
  let covered = 0;
  for (const level of Object.keys(coverage).sort()) {
    const c = coverage[level];
    total += c.total;
    covered += c.covered;
    log(`  HSK${level}: ${c.covered}/${c.total} (${Math.round((c.covered / c.total) * 100)}%)`);
  }
  log(`  TOTAL: ${covered}/${total} (${Math.round((covered / total) * 100)}%)`);

  if (!write) {
    log('dry-run: no se escribió nada. Volvé a correr con --write para aplicar.');
    return;
  }

  // Claves ordenadas: el diff de un rebuild queda legible en vez de reordenado.
  const sorted = {};
  for (const key of Object.keys(merged).sort()) sorted[key] = merged[key];
  fs.writeFileSync(TARGET, JSON.stringify(sorted, null, 1) + '\n');
  log(`escrito ${path.relative(ROOT, TARGET)}`);
}

main();
