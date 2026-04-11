const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    outputPath: 'docs/development/translation/hsk_es_worklist.json',
    includeDone: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--output' && argv[index + 1]) {
      args.outputPath = argv[index + 1];
      index += 1;
    } else if (value === '--include-done') {
      args.includeDone = true;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeGloss(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, ' ');
}

function normalizePinyin(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function makeCPKey(item) {
  const character = normalizeText(item.character);
  const pinyin = normalizePinyin(item.pinyin);
  return `${character}::${pinyin}`;
}

function groupByCP(items) {
  return items.reduce((accumulator, item) => {
    const key = makeCPKey(item);
    if (!accumulator.has(key)) {
      accumulator.set(key, []);
    }
    accumulator.get(key).push(item);
    return accumulator;
  }, new Map());
}

function resolveCandidateForEnglish(englishItem, spanishByCP) {
  const candidates = spanishByCP.get(makeCPKey(englishItem)) || [];
  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const targetGloss = normalizeGloss(englishItem.translation || englishItem.english);
  return candidates.find((candidate) => (
    normalizeGloss(candidate.translation || candidate.english) === targetGloss
  )) || null;
}

function main() {
  const args = parseArgs(process.argv);
  const root = path.resolve(__dirname, '../..');

  const english = readJson(path.join(root, 'assets/data/hsk_vocabulary.json'));
  const spanish = readJson(path.join(root, 'assets/data/hsk_vocabulary_spanish.json'));

  const spanishByCP = groupByCP(spanish);

  const worklist = [];

  for (const englishItem of english) {
    const spanishItem = resolveCandidateForEnglish(englishItem, spanishByCP);
    const hasSpanish = !!(spanishItem && spanishItem.spanish && String(spanishItem.spanish).trim());

    if (!args.includeDone && hasSpanish) {
      continue;
    }

    worklist.push({
      character: englishItem.character,
      pinyin: englishItem.pinyin,
      english: englishItem.translation,
      spanish: hasSpanish ? spanishItem.spanish : '',
      level: englishItem.level,
      status: hasSpanish ? 'reviewed' : 'pending',
      reviewer: hasSpanish ? 'legacy-import' : '',
      notes: ''
    });
  }

  const outPath = path.resolve(process.cwd(), args.outputPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(worklist, null, 2));

  console.log(`Worklist generated: ${outPath}`);
  console.log(`Rows: ${worklist.length}`);
}

main();
