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

function makeKey(item) {
  return `${item.character}::${item.pinyin}`;
}

function main() {
  const args = parseArgs(process.argv);
  const root = path.resolve(__dirname, '../..');

  const english = readJson(path.join(root, 'assets/data/hsk_vocabulary.json'));
  const spanish = readJson(path.join(root, 'assets/data/hsk_vocabulary_spanish.json'));

  const spanishByKey = new Map(spanish.map((item) => [makeKey(item), item]));

  const worklist = [];

  for (const englishItem of english) {
    const key = makeKey(englishItem);
    const spanishItem = spanishByKey.get(key);
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
