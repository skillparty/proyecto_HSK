#!/usr/bin/env node
/**
 * Build trilingual example sentences (zh / pinyin / es / en) for HSK words
 * from the Tatoeba corpus (CC-BY 2.0 FR).
 *
 * Pipeline:
 *   1. Download + decompress Tatoeba per-language sentences (cmn, spa, eng) + links.
 *   2. Map each Mandarin (cmn) sentence to its Spanish and English translations.
 *   3. For every HSK word, pick the shortest qualifying Mandarin sentence that
 *      contains it and has BOTH a Spanish and English translation.
 *   4. Generate pinyin for the chosen sentence with pinyin-pro.
 *   5. Write results to a STAGING file for human review — the app data is NOT
 *      modified by this script.
 *
 * Output: scripts/build/.tatoeba-cache/examples-new.json (generated only)
 *         scripts/build/.tatoeba-cache/examples-merged.json (curated + generated preview)
 *
 * Usage: node scripts/build/tatoeba-examples.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { pinyin } = require('pinyin-pro');

const ROOT = path.resolve(__dirname, '../..');
const CACHE = path.join(__dirname, '.tatoeba-cache');
const VOCAB = path.join(ROOT, 'assets/data/hsk_vocabulary.json');
const CURATED = path.join(ROOT, 'assets/data/hsk_example_sentences.json');

const SOURCES = {
  cmn: 'https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2',
  spa: 'https://downloads.tatoeba.org/exports/per_language/spa/spa_sentences.tsv.bz2',
  eng: 'https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2',
  links: 'https://downloads.tatoeba.org/exports/links.tar.bz2',
};

// Sentence length window (in Han characters) for pedagogical examples.
const MIN_LEN = 4;
const MAX_LEN = 22;

function log(...a) { console.log('[tatoeba]', ...a); }

function ensureCache() {
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
}

function download(url, outBz2) {
  if (fs.existsSync(outBz2)) { log('cached', path.basename(outBz2)); return; }
  log('downloading', url);
  execSync(`curl -sSL "${url}" -o "${outBz2}"`, { stdio: 'inherit' });
}

function decompressTsv(name) {
  const bz2 = path.join(CACHE, `${name}.tsv.bz2`);
  const tsv = path.join(CACHE, `${name}.tsv`);
  if (!fs.existsSync(tsv)) {
    log('decompressing', `${name}.tsv.bz2`);
    execSync(`bzip2 -dc "${bz2}" > "${tsv}"`);
  }
  return tsv;
}

function prepareLinks() {
  const csv = path.join(CACHE, 'links.csv');
  if (fs.existsSync(csv)) return csv;
  const tar = path.join(CACHE, 'links.tar.bz2');
  log('extracting links.tar.bz2');
  execSync(`tar xjf "${tar}" -C "${CACHE}"`);
  return csv;
}

// Stream a sentences tsv (id \t lang \t text) into a Map id->text.
async function loadSentences(tsv, keepIds) {
  const map = new Map();
  const rl = readline.createInterface({ input: fs.createReadStream(tsv), crlfDelay: Infinity });
  for await (const line of rl) {
    const tab1 = line.indexOf('\t');
    if (tab1 < 0) continue;
    const id = line.slice(0, tab1);
    if (keepIds && !keepIds.has(id)) continue;
    const tab2 = line.indexOf('\t', tab1 + 1);
    if (tab2 < 0) continue;
    map.set(id, line.slice(tab2 + 1));
  }
  return map;
}

async function main() {
  ensureCache();

  // 1. download + decompress
  for (const [name, url] of Object.entries(SOURCES)) {
    download(url, path.join(CACHE, name === 'links' ? 'links.tar.bz2' : `${name}.tsv.bz2`));
  }
  const cmnTsv = decompressTsv('cmn');
  const spaTsv = decompressTsv('spa');
  const engTsv = decompressTsv('eng');
  const linksCsv = prepareLinks();

  // 2. load cmn sentences
  const cmn = await loadSentences(cmnTsv);
  log('cmn sentences:', cmn.size);

  // 3. stream links: collect, per cmn id, the set of linked target ids
  const cmnLinks = new Map();   // cmnId -> Set(targetId)
  const neededTargets = new Set();
  {
    const rl = readline.createInterface({ input: fs.createReadStream(linksCsv), crlfDelay: Infinity });
    for await (const line of rl) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      const a = line.slice(0, tab);
      const b = line.slice(tab + 1).trim();
      if (cmn.has(a)) {
        let s = cmnLinks.get(a);
        if (!s) { s = new Set(); cmnLinks.set(a, s); }
        s.add(b);
        neededTargets.add(b);
      }
    }
  }
  log('cmn sentences with links:', cmnLinks.size, '| target ids needed:', neededTargets.size);

  // 4. load only the spa/eng texts we need
  const spa = await loadSentences(spaTsv, neededTargets);
  const eng = await loadSentences(engTsv, neededTargets);
  log('spa targets resolved:', spa.size, '| eng targets resolved:', eng.size);

  // 5. build qualifying cmn sentences (have both es + en), within length window
  const hanCount = (s) => (s.match(/[一-鿿]/g) || []).length;
  const qualifying = [];
  for (const [id, set] of cmnLinks) {
    let es = null, en = null;
    for (const t of set) {
      if (!es && spa.has(t)) es = spa.get(t);
      if (!en && eng.has(t)) en = eng.get(t);
      if (es && en) break;
    }
    if (!es || !en) continue;
    const text = cmn.get(id);
    const len = hanCount(text);
    if (len < MIN_LEN || len > MAX_LEN) continue;
    qualifying.push({ text, es, en, len });
  }
  qualifying.sort((a, b) => a.len - b.len); // shortest first
  log('qualifying zh sentences (es+en, length-bounded):', qualifying.length);

  // 6. match HSK words -> shortest qualifying sentence containing the word
  const vocab = JSON.parse(fs.readFileSync(VOCAB, 'utf8'));
  const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
  const missing = new Map(); // character -> level (words without a curated example)
  for (const w of vocab) {
    if (!curated[w.character]) missing.set(w.character, w.level);
  }
  log('words needing examples:', missing.size, '(curated kept:', Object.keys(curated).length + ')');

  const generated = {};
  for (const sent of qualifying) {
    if (missing.size === 0) break;
    for (const [word] of missing) {
      if (sent.text.includes(word)) {
        const py = pinyin(sent.text, { toneType: 'symbol', type: 'string' })
          .replace(/\s+([。，、！？；：،])/g, '$1') // no space before CJK punctuation
          .trim();
        generated[word] = {
          chinese: sent.text,
          pinyin: py,
          english: sent.en,
          spanish: sent.es,
          source: 'tatoeba',
        };
        missing.delete(word);
      }
    }
  }

  // 7. coverage report
  const byLvl = {};
  for (const w of vocab) {
    const lvl = w.level;
    byLvl[lvl] = byLvl[lvl] || { total: 0, curated: 0, generated: 0 };
    byLvl[lvl].total++;
    if (curated[w.character]) byLvl[lvl].curated++;
    else if (generated[w.character]) byLvl[lvl].generated++;
  }
  log('coverage by level (total / curated / generated / none):');
  for (const lvl of Object.keys(byLvl).sort()) {
    const b = byLvl[lvl];
    const none = b.total - b.curated - b.generated;
    log(`  HSK${lvl}: ${b.total} / ${b.curated} / ${b.generated} / ${none}`);
  }
  log('total generated:', Object.keys(generated).length);

  // 8. write staging output (does NOT touch app data)
  fs.writeFileSync(path.join(CACHE, 'examples-new.json'), JSON.stringify(generated, null, 1));
  const merged = { ...generated, ...curated }; // curated wins on conflict
  fs.writeFileSync(path.join(CACHE, 'examples-merged.json'), JSON.stringify(merged, null, 1));
  log('wrote staging: examples-new.json + examples-merged.json (review before merge)');
}

main().catch((e) => { console.error(e); process.exit(1); });
