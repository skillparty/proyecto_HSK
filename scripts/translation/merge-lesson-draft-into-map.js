#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    draft: 'docs/development/translation/hsk4_shang_lesson_01_draft.json',
    map: 'assets/data/hsk_lesson_order_map.json',
    write: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--draft') args.draft = argv[i + 1];
    if (token === '--map') args.map = argv[i + 1];
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

function makeTripleKey(item) {
  return [
    normalizeText(item.character),
    normalizePinyin(item.pinyin),
    normalizeGloss(item.english || item.translation)
  ].join('::');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureMapShape(data) {
  if (Array.isArray(data)) {
    return {
      version: 1,
      description: 'Map vocabulary to textbook sequence',
      entries: data
    };
  }

  if (!data || typeof data !== 'object') {
    return {
      version: 1,
      description: 'Map vocabulary to textbook sequence',
      entries: []
    };
  }

  if (!Array.isArray(data.entries)) {
    data.entries = [];
  }

  return data;
}

function isComplete(entry) {
  return Boolean(
    entry
    && entry.character
    && entry.pinyin
    && entry.english
    && entry.book
    && Number.isFinite(Number(entry.lesson))
    && Number.isFinite(Number(entry.lessonOrder))
  );
}

function sanitizeEntry(entry) {
  return {
    level: Number(entry.level || 4),
    book: String(entry.book).trim(),
    lesson: Number(entry.lesson),
    lessonOrder: Number(entry.lessonOrder),
    character: String(entry.character),
    pinyin: String(entry.pinyin),
    english: String(entry.english)
  };
}

function main() {
  const root = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  const draftPath = path.resolve(root, args.draft);
  const mapPath = path.resolve(root, args.map);

  const draftRaw = readJson(draftPath);
  const mapRaw = fs.existsSync(mapPath) ? readJson(mapPath) : { version: 1, entries: [] };

  const draftEntries = Array.isArray(draftRaw.entries) ? draftRaw.entries : [];
  const completeDraftEntries = draftEntries.filter(isComplete).map(sanitizeEntry);
  const skippedDraftEntries = draftEntries.length - completeDraftEntries.length;

  const mapData = ensureMapShape(mapRaw);
  const mapEntries = mapData.entries.filter((entry) => entry && entry.character && entry.pinyin && entry.english);

  const index = new Map(mapEntries.map((entry) => [makeTripleKey(entry), entry]));

  let inserted = 0;
  let updated = 0;

  for (const entry of completeDraftEntries) {
    const key = makeTripleKey(entry);
    if (index.has(key)) {
      const current = index.get(key);
      current.level = entry.level;
      current.book = entry.book;
      current.lesson = entry.lesson;
      current.lessonOrder = entry.lessonOrder;
      updated += 1;
    } else {
      mapEntries.push(entry);
      index.set(key, entry);
      inserted += 1;
    }
  }

  mapEntries.sort((a, b) => {
    const levelDiff = Number(a.level || 0) - Number(b.level || 0);
    if (levelDiff !== 0) return levelDiff;

    const bookRank = (book) => {
      const value = String(book || '').toLowerCase();
      if (['shang', '上', '上册', 'book1', '1'].includes(value)) return 1;
      if (['xia', '下', '下册', 'book2', '2'].includes(value)) return 2;
      return 9;
    };

    const bookDiff = bookRank(a.book) - bookRank(b.book);
    if (bookDiff !== 0) return bookDiff;

    const lessonDiff = Number(a.lesson || 0) - Number(b.lesson || 0);
    if (lessonDiff !== 0) return lessonDiff;

    const orderDiff = Number(a.lessonOrder || 0) - Number(b.lessonOrder || 0);
    if (orderDiff !== 0) return orderDiff;

    return String(a.character).localeCompare(String(b.character), 'zh-Hans-CN');
  });

  const outData = {
    ...mapData,
    version: mapData.version || 1,
    entries: mapEntries
  };

  if (args.write) {
    fs.writeFileSync(mapPath, `${JSON.stringify(outData, null, 2)}\n`, 'utf8');
  }

  console.log('[ORDER] Draft merge summary');
  console.log(`- Draft entries: ${draftEntries.length}`);
  console.log(`- Complete draft entries: ${completeDraftEntries.length}`);
  console.log(`- Skipped draft entries: ${skippedDraftEntries}`);
  console.log(`- Inserted into map: ${inserted}`);
  console.log(`- Updated in map: ${updated}`);
  console.log(`- Map total entries: ${outData.entries.length}`);
  console.log(`- Mode: ${args.write ? 'write' : 'dry-run'}`);
}

main();
