#!/usr/bin/env node
/**
 * Agrega ejemplos con traducción al español escrita a mano.
 *
 * Por qué existe: cinco palabras de HSK2-3 (打篮球, 刮风, 黄河, 皮鞋, 请假)
 * tienen frase en Tatoeba pero sin traducción al español por ninguna vía, ni
 * directa ni por pivote. Son palabras que un principiante ve seguido, así que
 * dejarlas sin ejemplo se nota mucho más que las 1400 de HSK6 que faltan.
 *
 * El chino NUNCA se inventa: sale de Tatoeba, que es contenido revisado. Lo
 * que se escribe acá es la traducción, y el campo `source` dice exactamente
 * qué parte:
 *   - tatoeba-manual-es : chino e inglés de Tatoeba, español escrito acá.
 *   - tatoeba-zh-manual : solo el chino es de Tatoeba; esa frase no tiene
 *                         ninguna traducción en el corpus.
 *
 * Uso:
 *   node scripts/build-data/add-manual-examples.js           # dry-run
 *   node scripts/build-data/add-manual-examples.js --write
 */

const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const { collapseLatinRuns } = require('./tatoeba-examples');

const ROOT = path.resolve(__dirname, '../..');
const TARGET = path.join(ROOT, 'assets/data/hsk_example_sentences.json');

const ENTRIES = {
  // Tatoeba 2333763
  打篮球: {
    chinese: '打篮球很有趣。',
    english: 'Basketball is very fun to play.',
    spanish: 'Jugar al baloncesto es muy divertido.',
    source: 'tatoeba-manual-es',
  },
  // Tatoeba 3565109
  刮风: {
    chinese: '已经刮风两天了。',
    english: 'It has been windy for two days.',
    spanish: 'Lleva dos días haciendo viento.',
    source: 'tatoeba-manual-es',
  },
  // Tatoeba 2367593
  黄河: {
    chinese: '四月底，黄河的水发黑了。',
    english: 'At the end of April, the water of the Yellow River had darkened.',
    spanish: 'A finales de abril, el agua del río Amarillo se había oscurecido.',
    source: 'tatoeba-manual-es',
  },
  // Tatoeba 4757587
  皮鞋: {
    chinese: '汤姆买了一双黑色皮鞋。',
    english: 'Tom bought a pair of black leather shoes.',
    spanish: 'Tom compró un par de zapatos de cuero negros.',
    source: 'tatoeba-manual-es',
  },
  // Tatoeba 429369 — única frase con 请假 en todo el corpus, y no tiene
  // ninguna traducción enlazada, así que el inglés también se escribe acá.
  请假: {
    chinese: '不过你还是请假比较好。',
    english: "Still, you'd better ask for time off.",
    spanish: 'De todos modos, es mejor que pidas permiso.',
    source: 'tatoeba-zh-manual',
  },
};

const write = process.argv.includes('--write');
const log = (...a) => console.log('[manual]', ...a);

function toPinyin(chinese) {
  return collapseLatinRuns(
    chinese,
    pinyin(chinese, { toneType: 'symbol', type: 'string' })
      .replace(/\s+([。，、！？；：])/g, '$1')
      .trim(),
  );
}

function main() {
  const current = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
  const added = [];
  const skipped = [];

  for (const [word, entry] of Object.entries(ENTRIES)) {
    if (current[word]) {
      // El pipeline puede haber cubierto la palabra desde la última vez.
      skipped.push(word);
      continue;
    }
    if (!entry.chinese.includes(word)) {
      console.error(`La frase de ${word} no contiene la palabra: ${entry.chinese}`);
      process.exit(1);
    }
    current[word] = {
      chinese: entry.chinese,
      pinyin: toPinyin(entry.chinese),
      english: entry.english,
      spanish: entry.spanish,
      source: entry.source,
    };
    added.push(word);
  }

  for (const word of added) {
    log(`+ ${word}  ${current[word].chinese}  |  ${current[word].pinyin}`);
  }
  if (skipped.length) log('ya cubiertas por el pipeline, sin tocar:', skipped.join(', '));
  log(`agregadas ${added.length}, total ${Object.keys(current).length}`);

  if (!write) {
    log('dry-run: no se escribió nada. Volvé a correr con --write para aplicar.');
    return;
  }

  const sorted = {};
  for (const key of Object.keys(current).sort()) sorted[key] = current[key];
  fs.writeFileSync(TARGET, JSON.stringify(sorted, null, 1) + '\n');
  log(`escrito ${path.relative(ROOT, TARGET)}`);
}

main();
