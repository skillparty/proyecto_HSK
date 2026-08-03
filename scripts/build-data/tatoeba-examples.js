#!/usr/bin/env node
/**
 * Build trilingual example sentences (zh / pinyin / es / en) for HSK words
 * from the Tatoeba corpus (CC-BY 2.0 FR).
 *
 * Pipeline:
 *   1. Download + decompress Tatoeba per-language sentences (cmn, spa, eng) + links.
 *   2. Map each Mandarin (cmn) sentence to its Spanish and English translations.
 *      El español directo escasea (10.7k frases zh con enlace a spa, contra 65k
 *      con enlace a eng), y era el cuello de botella real: exigir ES+EN directos
 *      dejaba HSK6 al 10%. Cuando no hay español directo se busca por pivote
 *      zh -> en -> es, que es lo mismo que Tatoeba muestra como traducción
 *      indirecta. Esas entradas quedan marcadas con source 'tatoeba-pivot'.
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
// El piso es 3 y no 4 porque a esa altura hay interjecciones completas y muy
// usadas —不客气。 祝贺你。 不敢当。— que con 4 quedaban afuera siendo
// justo el registro que un principiante necesita.
const MIN_LEN = 3;
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

// pinyin-pro trata cada letra latina de la frase como un token suelto, así que
// los nombres propios salen deletreados: 'Tom没有礼貌。' -> 'T o m méi yǒu...'.
// Se colapsan tomando las palabras latinas de la frase china original y no
// adivinando sobre el pinyin: 'a', 'e' y 'o' son sílabas válidas y unirlas a
// ciegas rompería frases legítimas.
function collapseLatinRuns(chinese, py) {
  let out = py;
  for (const word of chinese.match(/[A-Za-z]+/g) || []) {
    if (word.length < 2) continue;
    out = out.split(word.split('').join(' ')).join(word);
  }
  return out;
}

// Cuatro entradas del vocabulario no son palabras sino patrones gramaticales
// correlativos, escritos con puntos suspensivos entre las partes:
// '虽然......但是......', '因为......所以......', '不但......而且......' y
// '只有......才......'. Ninguna frase contiene esa cadena literal, así que con
// includes() nunca podían recibir un ejemplo.
const PATTERN_SEPARATOR = '......';

function splitPatternParts(word) {
  return word.split(PATTERN_SEPARATOR).filter(Boolean);
}

// Para un patrón hacen falta todas sus partes y en orden: 虽然 antes que 但是.
// Para una palabra normal esto se reduce a un includes().
function sentenceMatchesWord(text, word) {
  if (!word.includes(PATTERN_SEPARATOR)) return text.includes(word);

  let from = 0;
  for (const part of splitPatternParts(word)) {
    const at = text.indexOf(part, from);
    if (at < 0) return false;
    from = at + part.length;
  }
  return true;
}

// Caracteres tradicionales de alta frecuencia que no existen en simplificado.
// No busca ser exhaustivo: alcanza para detectar si una frase está escrita en
// tradicional, porque cualquier oración normal usa varios de estos.
const TRADITIONAL_MARKERS = new Set(
  '這說個們來時對國學會爲後點實現數與經開關無馬鳥華語體發當萬義樣專東車門問間題師書長聲遠親覺讀寫買賣錢銀鐵飛風雲電話見輛過還進邊麗盡靈幾樂習題辦處務員動總條約強兩業產進標準團',
);

function hasTraditional(text) {
  for (const ch of text) if (TRADITIONAL_MARKERS.has(ch)) return true;
  return false;
}

// Solo los ids de un tsv. Para el pivote hace falta saber si un id es inglés o
// español mientras se recorre links.csv, pero no su texto: cargarlo entero
// serían 2M de frases en inglés en memoria.
async function idsOf(tsv) {
  const set = new Set();
  const rl = readline.createInterface({ input: fs.createReadStream(tsv), crlfDelay: Infinity });
  for await (const line of rl) {
    const tab = line.indexOf('\t');
    if (tab > 0) set.add(line.slice(0, tab));
  }
  return set;
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

  // 3. Dos pasadas sobre links.csv.
  //    La primera arma, por cada frase china, el conjunto de ids enlazados.
  //    La segunda busca español a un salto de esos destinos: el puente puede
  //    ser cualquier idioma, no solo inglés. Hacen falta dos pasadas porque
  //    hasta terminar la primera no se sabe qué destinos importan.
  const spaIds = await idsOf(spaTsv);
  const cmnLinks = new Map();     // cmnId -> Set(targetId)
  const neededTargets = new Set();
  {
    const rl = readline.createInterface({ input: fs.createReadStream(linksCsv), crlfDelay: Infinity });
    for await (const line of rl) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      const a = line.slice(0, tab);
      if (!cmn.has(a)) continue;
      const b = line.slice(tab + 1).trim();
      let s = cmnLinks.get(a);
      if (!s) { s = new Set(); cmnLinks.set(a, s); }
      s.add(b);
      neededTargets.add(b);
    }
  }
  log('cmn sentences with links:', cmnLinks.size, '| target ids needed:', neededTargets.size);

  const bridgeToSpa = new Map();  // idPuente -> spaId (primer español enlazado)
  {
    const rl = readline.createInterface({ input: fs.createReadStream(linksCsv), crlfDelay: Infinity });
    for await (const line of rl) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      const a = line.slice(0, tab);
      if (!neededTargets.has(a) || bridgeToSpa.has(a)) continue;
      const b = line.slice(tab + 1).trim();
      if (spaIds.has(b)) bridgeToSpa.set(a, b);
    }
  }
  log('puentes con español a un salto:', bridgeToSpa.size);

  // 4. load only the spa/eng texts we need. Al español hay que sumarle los
  //    destinos alcanzables por pivote, que no están en neededTargets.
  const eng = await loadSentences(engTsv, neededTargets);
  const spaNeeded = new Set(neededTargets);
  for (const spaId of bridgeToSpa.values()) spaNeeded.add(spaId);
  const spa = await loadSentences(spaTsv, spaNeeded);
  log('spa targets resolved:', spa.size, '| eng targets resolved:', eng.size);

  // 5. build qualifying cmn sentences (have both es + en), within length window
  const hanCount = (s) => (s.match(/[一-鿿]/g) || []).length;
  const qualifying = [];
  for (const [id, set] of cmnLinks) {
    let es = null, en = null, engId = null;
    for (const t of set) {
      if (!es && spa.has(t)) es = spa.get(t);
      if (!en && eng.has(t)) { en = eng.get(t); engId = t; }
      if (es && en) break;
    }
    if (!en) continue;

    // Sin español directo, pivote por alguno de los destinos enlazados. Se
    // prueba primero el inglés: es el puente con más enlaces a español, y deja
    // el par en-es visible al lado del inglés que ya se está mostrando. Si no,
    // sirve cualquier otro idioma; el salto es igual de largo.
    let via = 'directo';
    if (!es) {
      const bridges = [...set].sort((a, b) => Number(eng.has(b)) - Number(eng.has(a)));
      for (const t of bridges) {
        const spaId = bridgeToSpa.get(t);
        if (spaId && spa.has(spaId)) {
          es = spa.get(spaId);
          via = eng.has(t) ? 'pivote' : 'pivote-otro';
          break;
        }
      }
    }
    if (!es) continue;

    const text = cmn.get(id);
    const len = hanCount(text);
    if (len < MIN_LEN || len > MAX_LEN) continue;
    qualifying.push({ text, es, en, len, via, engId });
  }
  // Orden de preferencia: la más corta, que es lo que sirve como ejemplo, pero
  // el tradicional pesa como si la frase fuera TRAD_PENALTY caracteres más
  // larga. El HSK evalúa simplificado y el corpus de Tatoeba mezcla los dos:
  // una frase en tradicional le muestra al alumno formas que no está
  // estudiando. Con la penalización, una tradicional solo gana si además es
  // bastante más corta, o si no hay ninguna simplificada para esa palabra.
  // A igualdad, manda la traducción más directa: español directo, luego pivote
  // por inglés, luego por cualquier otro idioma — cuantos menos saltos, menos
  // deriva de sentido.
  const TRAD_PENALTY = 4;
  const VIA_RANK = { directo: 0, pivote: 1, 'pivote-otro': 2 };
  for (const s of qualifying) {
    s.trad = hasTraditional(s.text) ? 1 : 0;
    s.cost = s.len + s.trad * TRAD_PENALTY;
  }
  qualifying.sort(
    (a, b) => a.cost - b.cost || a.trad - b.trad || VIA_RANK[a.via] - VIA_RANK[b.via],
  );
  const byVia = qualifying.reduce((acc, s) => ({ ...acc, [s.via]: (acc[s.via] || 0) + 1 }), {});
  log('qualifying zh sentences (es+en, length-bounded):', qualifying.length, byVia);

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
      if (sentenceMatchesWord(sent.text, word)) {
        const py = collapseLatinRuns(
          sent.text,
          pinyin(sent.text, { toneType: 'symbol', type: 'string' })
            .replace(/\s+([。，、！？；：،])/g, '$1') // no space before CJK punctuation
            .trim(),
        );
        generated[word] = {
          chinese: sent.text,
          pinyin: py,
          english: sent.en,
          spanish: sent.es,
          // Marcadas aparte para poder auditarlas o revertirlas sin tocar las
          // de traducción directa: en el pivote el español es traducción del
          // inglés, no del chino.
          source: sent.via === 'directo' ? 'tatoeba' : 'tatoeba-pivot',
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
  const pivoted = Object.values(generated).filter((e) => e.source === 'tatoeba-pivot').length;
  log(
    'total generated:', Object.keys(generated).length,
    `(español directo: ${Object.keys(generated).length - pivoted}, por pivote: ${pivoted})`,
  );

  // 8. write staging output (does NOT touch app data)
  fs.writeFileSync(path.join(CACHE, 'examples-new.json'), JSON.stringify(generated, null, 1));
  const merged = { ...generated, ...curated }; // curated wins on conflict
  fs.writeFileSync(path.join(CACHE, 'examples-merged.json'), JSON.stringify(merged, null, 1));
  log('wrote staging: examples-new.json + examples-merged.json (review before merge)');
}

// Importado como módulo desde merge-tatoeba-examples.js, que reusa la
// normalización de pinyin: solo corre el pipeline si se lo invoca directo.
if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { collapseLatinRuns };
