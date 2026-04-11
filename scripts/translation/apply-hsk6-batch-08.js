const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const translateEnToEs = async (text) => {
  const query = encodeURIComponent(text);
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=en|es`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = normalize(parsed?.responseData?.translatedText);
          if (translated && translated.toLowerCase() !== 'null') {
            resolve(translated);
            return;
          }
          resolve('');
        } catch {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
};

const hasSpanishEntry = (source) => spanish.some((item) => (
  normalize(item.character) === normalize(source.character)
  && normalize(item.pinyin) === normalize(source.pinyin)
  && normalize(item.english) === normalize(source.translation)
));

const pendingHsk6 = english.filter((item) => item.level === 6 && !hasSpanishEntry(item));
const batch = pendingHsk6.slice(700, 800);

(async () => {
  let inserted = 0;
  let fallbackToEnglish = 0;

  for (const entry of batch) {
    let translated = '';

    for (let attempt = 0; attempt < 3; attempt += 1) {
      translated = await translateEnToEs(entry.translation);
      if (translated) {
        break;
      }
      await sleep(250 + attempt * 300);
    }

    if (!translated) {
      translated = entry.translation;
      fallbackToEnglish += 1;
    }

    spanish.push({
      character: entry.character,
      pinyin: entry.pinyin,
      english: entry.translation,
      spanish: translated,
      level: entry.level
    });

    inserted += 1;
    await sleep(120);
  }

  spanish.sort((left, right) => {
    if (left.level !== right.level) {
      return left.level - right.level;
    }

    if (normalize(left.character) !== normalize(right.character)) {
      return normalize(left.character).localeCompare(normalize(right.character), 'zh-Hans-u-co-pinyin');
    }

    if (normalize(left.pinyin) !== normalize(right.pinyin)) {
      return normalize(left.pinyin).localeCompare(normalize(right.pinyin));
    }

    return normalize(left.english).localeCompare(normalize(right.english));
  });

  fs.writeFileSync(spanishPath, `${JSON.stringify(spanish, null, 2)}\n`);

  console.log(
    `HSK6 batch 08 applied. Inserted=${inserted}, FallbackToEnglish=${fallbackToEnglish}, Total=${spanish.length}`
  );
})();
