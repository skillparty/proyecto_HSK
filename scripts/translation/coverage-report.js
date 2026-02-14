const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { strict: false, reportPath: null };
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--strict') {
      args.strict = true;
    } else if (value === '--report' && argv[index + 1]) {
      args.reportPath = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function byLevel(items) {
  return items.reduce((accumulator, item) => {
    const level = String(item.level ?? 'unknown');
    accumulator[level] = (accumulator[level] || 0) + 1;
    return accumulator;
  }, {});
}

function makeKey(item) {
  return `${item.character}::${item.pinyin}`;
}

function toLevelSummary(levels, enByLevel, translatedByLevel) {
  return levels.map((level) => {
    const total = enByLevel[level] || 0;
    const translated = translatedByLevel[level] || 0;
    const coverage = total > 0 ? Number(((translated / total) * 100).toFixed(2)) : 0;
    return { level: Number(level), total, translated, coverage };
  });
}

function main() {
  const args = parseArgs(process.argv);
  const root = path.resolve(__dirname, '../..');
  const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
  const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

  const english = readJson(englishPath);
  const spanish = readJson(spanishPath);

  const englishByKey = new Map(english.map((item) => [makeKey(item), item]));
  const spanishByKey = new Map(spanish.map((item) => [makeKey(item), item]));

  const missingEntries = [];
  const missingByLevel = {};
  const translatedByLevel = {};

  for (const englishItem of english) {
    const levelKey = String(englishItem.level ?? 'unknown');
    const key = makeKey(englishItem);
    const spanishItem = spanishByKey.get(key);

    if (!spanishItem || !spanishItem.spanish || !String(spanishItem.spanish).trim()) {
      missingEntries.push({
        character: englishItem.character,
        pinyin: englishItem.pinyin,
        english: englishItem.translation,
        level: englishItem.level
      });
      missingByLevel[levelKey] = (missingByLevel[levelKey] || 0) + 1;
      continue;
    }

    translatedByLevel[levelKey] = (translatedByLevel[levelKey] || 0) + 1;
  }

  const orphanSpanishEntries = [];
  for (const spanishItem of spanish) {
    const key = makeKey(spanishItem);
    if (!englishByKey.has(key)) {
      orphanSpanishEntries.push({
        character: spanishItem.character,
        pinyin: spanishItem.pinyin,
        spanish: spanishItem.spanish,
        level: spanishItem.level
      });
    }
  }

  const enByLevel = byLevel(english);
  const levels = Object.keys(enByLevel).sort((left, right) => Number(left) - Number(right));
  const levelSummary = toLevelSummary(levels, enByLevel, translatedByLevel);

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      english: english.length,
      spanish: spanish.length,
      missingTranslations: missingEntries.length,
      orphanSpanishEntries: orphanSpanishEntries.length,
      overallCoverage: Number((((english.length - missingEntries.length) / english.length) * 100).toFixed(2))
    },
    byLevel: levelSummary,
    missingByLevel,
    missingEntries,
    orphanSpanishEntries
  };

  console.log('HSK EN→ES Coverage Report');
  console.log('-------------------------');
  console.log(`English entries: ${report.totals.english}`);
  console.log(`Spanish entries: ${report.totals.spanish}`);
  console.log(`Missing translations: ${report.totals.missingTranslations}`);
  console.log(`Overall coverage: ${report.totals.overallCoverage}%`);
  console.log('');

  for (const row of levelSummary) {
    console.log(`HSK${row.level}: ${row.translated}/${row.total} (${row.coverage}%)`);
  }

  if (args.reportPath) {
    const absoluteReportPath = path.resolve(process.cwd(), args.reportPath);
    fs.mkdirSync(path.dirname(absoluteReportPath), { recursive: true });
    fs.writeFileSync(absoluteReportPath, JSON.stringify(report, null, 2));
    console.log('');
    console.log(`Detailed report written to ${absoluteReportPath}`);
  }

  if (args.strict && missingEntries.length > 0) {
    process.exitCode = 1;
  }
}

main();
