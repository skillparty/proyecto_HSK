#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    level: 4,
    input: 'assets/data/hsk_vocabulary.json',
    output: 'docs/development/translation/hsk4_lesson_order_template.json'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--level') args.level = Number(argv[i + 1]);
    if (token === '--input') args.input = argv[i + 1];
    if (token === '--output') args.output = argv[i + 1];
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const root = process.cwd();
  const args = parseArgs(process.argv.slice(2));

  const inputPath = path.resolve(root, args.input);
  const outputPath = path.resolve(root, args.output);

  const vocabulary = readJson(inputPath);
  const levelWords = vocabulary
    .filter((word) => Number(word.level) === Number(args.level))
    .map((word, index) => ({
      level: Number(word.level),
      sourceOrder: index,
      book: '',
      lesson: null,
      lessonOrder: null,
      character: word.character,
      pinyin: word.pinyin,
      english: word.translation || word.english || ''
    }));

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    description: `Template for HSK${args.level} lesson ordering. Fill book/lesson/lessonOrder per textbook sequence.`,
    entries: levelWords
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log('[ORDER] Lesson-order template generated');
  console.log(`- Level: HSK${args.level}`);
  console.log(`- Entries: ${levelWords.length}`);
  console.log(`- Output: ${outputPath}`);
}

main();
