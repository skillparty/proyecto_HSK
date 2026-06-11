/**
 * split-vocab.js
 *
 * Generates per-level vocabulary split files with all post-processing
 * pre-computed so the browser makes one small fetch instead of
 * three large ones.
 *
 * Outputs:
 *   assets/data/vocab/hsk{N}_en.json   — English split (lesson metadata embedded)
 *   assets/data/vocab/hsk{N}_es.json   — Spanish split (lesson metadata + canonical order embedded)
 *   assets/data/vocab/manifest.json    — Level → file map with word counts
 *
 * Usage: node scripts/split-vocab.js
 */

const fs   = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'assets', 'data');
const OUT  = path.join(DATA, 'vocab');

// ── Load sources ──────────────────────────────────────────────────────────────
console.log('Loading source files…');
const enAll  = JSON.parse(fs.readFileSync(path.join(DATA, 'hsk_vocabulary.json'), 'utf8'));
const esAll  = JSON.parse(fs.readFileSync(path.join(DATA, 'hsk_vocabulary_spanish.json'), 'utf8'));
const mapRaw = JSON.parse(fs.readFileSync(path.join(DATA, 'hsk_lesson_order_map.json'), 'utf8'));

const mapEntries = Array.isArray(mapRaw) ? mapRaw : (mapRaw.entries || []);

// ── Helper: normalize for keying ──────────────────────────────────────────────
function norm(s) {
  return String(s || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g,'').toLowerCase();
}
function cpKey(char, pinyin) { return `${String(char||'').trim()}::${norm(pinyin)}`; }

// ── Build lesson-order lookup (char::pinyin → {book, lesson, lessonOrder}) ───
const orderMap = new Map();
for (const e of mapEntries) {
  if (!e.character || !e.pinyin || !e.lesson) continue;
  const key = cpKey(e.character, e.pinyin);
  if (!orderMap.has(key)) orderMap.set(key, []);
  orderMap.get(key).push({ book: e.book || null, lesson: Number(e.lesson), lessonOrder: Number(e.lessonOrder || 0), level: Number(e.level || 0) });
}

// ── Build EN canonical order map (char::pinyin → sourceOrder index) ──────────
const enByCP = new Map();
enAll.forEach((w, i) => {
  const key = cpKey(w.character, w.pinyin);
  if (!enByCP.has(key)) enByCP.set(key, []);
  enByCP.get(key).push(i);
});

// ── Merge lesson metadata onto a word ────────────────────────────────────────
function mergeLesson(word) {
  if (word.lesson !== undefined && word.lessonOrder !== undefined) return word;
  const key   = cpKey(word.character, word.pinyin);
  const cands = orderMap.get(key);
  if (!cands || cands.length === 0) return word;
  const wLevel = Number(word.level || 0);
  let match = cands.find(c => c.level === wLevel) || cands[0];
  return { ...word, book: match.book || word.book, lesson: match.lesson, lessonOrder: match.lessonOrder };
}

// ── Resolve canonical source order for ES word ───────────────────────────────
function resolveSourceOrder(esWord, fallbackIndex) {
  const key    = cpKey(esWord.character, esWord.pinyin);
  const cands  = enByCP.get(key);
  if (!cands || cands.length === 0) return 100000 + fallbackIndex;
  if (cands.length === 1) return cands[0];
  const esGloss = String(esWord.translation || esWord.english || '').toLowerCase().trim();
  const matched = cands.find(idx => {
    const w = enAll[idx];
    return String(w.translation || w.english || '').toLowerCase().trim() === esGloss;
  });
  return matched !== undefined ? matched : cands[0];
}

// ── Output directory ─────────────────────────────────────────────────────────
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const manifest = { levels: {}, generated: new Date().toISOString() };
const LEVELS = [1, 2, 3, 4, 5, 6];

for (const level of LEVELS) {
  // English split — lesson metadata pre-merged, sourceOrder embedded
  const enLevel = enAll
    .filter(w => Number(w.level) === level)
    .map((w, i) => {
      const merged = mergeLesson({ ...w, english: w.translation || w.english, spanish: w.spanish || null });
      return { ...merged, _sourceOrder: enAll.indexOf(w) };
    });

  // Spanish split — lesson metadata + canonical order pre-computed
  const esLevel = esAll
    .filter(w => Number(w.level) === level)
    .map((w, i) => {
      const merged = mergeLesson(w);
      const sourceOrder = resolveSourceOrder(w, i);
      return { ...merged, _sourceOrder: sourceOrder };
    });

  const enFile = `hsk${level}_en.json`;
  const esFile = `hsk${level}_es.json`;

  fs.writeFileSync(path.join(OUT, enFile), JSON.stringify(enLevel));
  fs.writeFileSync(path.join(OUT, esFile), JSON.stringify(esLevel));

  const enSize = fs.statSync(path.join(OUT, enFile)).size;
  const esSize = fs.statSync(path.join(OUT, esFile)).size;

  manifest.levels[level] = {
    en: { file: `vocab/${enFile}`, words: enLevel.length, bytes: enSize },
    es: { file: `vocab/${esFile}`, words: esLevel.length, bytes: esSize }
  };

  console.log(`HSK ${level}: EN ${enLevel.length}w ${(enSize/1024).toFixed(1)}KB | ES ${esLevel.length}w ${(esSize/1024).toFixed(1)}KB`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('\nManifest written to assets/data/vocab/manifest.json');

// Summary: total size of splits vs originals
const totalEnSplit = LEVELS.reduce((s,l) => s + manifest.levels[l].en.bytes, 0);
const totalEsSplit = LEVELS.reduce((s,l) => s + manifest.levels[l].es.bytes, 0);
const origEn = fs.statSync(path.join(DATA, 'hsk_vocabulary.json')).size;
const origEs = fs.statSync(path.join(DATA, 'hsk_vocabulary_spanish.json')).size;
const mapSize = fs.statSync(path.join(DATA, 'hsk_lesson_order_map.json')).size;
console.log(`\nOriginal: EN ${(origEn/1024).toFixed(0)}KB + ES ${(origEs/1024).toFixed(0)}KB + map ${(mapSize/1024).toFixed(0)}KB`);
console.log(`Split total: EN ${(totalEnSplit/1024).toFixed(0)}KB + ES ${(totalEsSplit/1024).toFixed(0)}KB`);
console.log('\nPer-level savings example:');
LEVELS.forEach(l => {
  const en = manifest.levels[l].en;
  const es = manifest.levels[l].es;
  const wouldFetch = origEn + (l > 1 ? origEs : 0) + mapSize;
  const nowFetch = en.bytes + es.bytes;
  console.log(`  HSK${l} ES user: was ~${(wouldFetch/1024).toFixed(0)}KB → now ~${(es.bytes/1024).toFixed(0)}KB (${Math.round((1 - es.bytes/wouldFetch)*100)}% less)`);
});
