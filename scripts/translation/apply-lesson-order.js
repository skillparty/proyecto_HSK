#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    map: 'assets/data/hsk_lesson_order_map.json',
    en: 'assets/data/hsk_vocabulary.json',
    es: 'assets/data/hsk_vocabulary_spanish.json',
    write: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--map') args.map = argv[i + 1];
    if (token === '--en') args.en = argv[i + 1];
    if (token === '--es') args.es = argv[i + 1];
    if (token === '--write') args.write = true;
  }

  return args;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizePinyin(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function normalizeGloss(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function cpKey(item) {
  return `${normalizeText(item.character)}::${normalizePinyin(item.pinyin)}`;
}

function buildGroupedIndex(items) {
  return items.reduce((acc, item, index) => {
    const key = cpKey(item);
    if (!acc.has(key)) {
      acc.set(key, []);
    }

    acc.get(key).push({ item, index });
    return acc;
  }, new Map());
}

function resolveMatch(entry, grouped) {
  const candidates = grouped.get(cpKey(entry)) || [];
  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const entryGloss = normalizeGloss(entry.english || entry.translation);
  const byGloss = candidates.find(({ item }) => (
    normalizeGloss(item.english || item.translation) === entryGloss
  ));

  return byGloss || null;
}

function applyMetadata(item, entry) {
  item.book = entry.book;
  item.lesson = Number(entry.lesson);
  item.lessonOrder = Number(entry.lessonOrder);
  if (entry.bookPart !== undefined) item.bookPart = entry.bookPart;
  if (entry.volume !== undefined) item.volume = entry.volume;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const root = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  const mapPath = path.resolve(root, args.map);
  const enPath = path.resolve(root, args.en);
  const esPath = path.resolve(root, args.es);

  const mapData = readJson(mapPath);
  const entries = Array.isArray(mapData) ? mapData : (mapData.entries || []);

  if (!Array.isArray(entries) || entries.length === 0) {
    console.log('[ORDER] No entries in map. Nothing to apply.');
    return;
  }

  const invalid = entries.filter((entry) => (
    !entry.character || !entry.pinyin || !entry.english || !entry.book || !entry.lesson || !entry.lessonOrder
  ));

  if (invalid.length > 0) {
    console.error('[ORDER] Invalid map entries found. Required fields: character, pinyin, english, book, lesson, lessonOrder');
    process.exitCode = 1;
    return;
  }

  const english = readJson(enPath);
  const spanish = readJson(esPath);
  const englishByCP = buildGroupedIndex(english);
  const spanishByCP = buildGroupedIndex(spanish);

  let updatedEn = 0;
  let updatedEs = 0;
  let missingEn = 0;
  let missingEs = 0;

  for (const entry of entries) {
    const enMatch = resolveMatch(entry, englishByCP);
    if (enMatch) {
      applyMetadata(enMatch.item, entry);
      updatedEn += 1;
    } else {
      missingEn += 1;
      console.warn(`[ORDER] EN missing: ${entry.character} | ${entry.pinyin} | ${entry.english}`);
    }

    const esMatch = resolveMatch(entry, spanishByCP);
    if (esMatch) {
      applyMetadata(esMatch.item, entry);
      updatedEs += 1;
    } else {
      missingEs += 1;
      console.warn(`[ORDER] ES missing: ${entry.character} | ${entry.pinyin} | ${entry.english}`);
    }
  }

  if (args.write) {
    fs.writeFileSync(enPath, `${JSON.stringify(english, null, 2)}\n`, 'utf8');
    fs.writeFileSync(esPath, `${JSON.stringify(spanish, null, 2)}\n`, 'utf8');
  }

  console.log('[ORDER] Lesson-order apply summary');
  console.log(`- Map entries: ${entries.length}`);
  console.log(`- EN updated: ${updatedEn}`);
  console.log(`- ES updated: ${updatedEs}`);
  console.log(`- EN missing: ${missingEn}`);
  console.log(`- ES missing: ${missingEs}`);
  console.log(`- Mode: ${args.write ? 'write' : 'dry-run'}`);
}

main();
