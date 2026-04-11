const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = [
  { character: '地图', pinyin: 'dìtú', english: 'map', spanish: 'mapa' },
  { character: '电梯', pinyin: 'diàntī', english: 'elevator', spanish: 'ascensor' },
  { character: '电子邮件', pinyin: 'diànzǐ yóujiàn', english: 'e-mail', spanish: 'correo electrónico' },
  { character: '东', pinyin: 'dōng', english: 'east', spanish: 'este' },
  { character: '冬', pinyin: 'dōng', english: 'winter', spanish: 'invierno' },
  { character: '动物', pinyin: 'dòngwù', english: 'animal', spanish: 'animal' },
  { character: '短', pinyin: 'duǎn', english: 'short', spanish: 'corto' },
  { character: '段', pinyin: 'duàn', english: 'segment', spanish: 'segmento; tramo' },
  { character: '锻炼', pinyin: 'duànliàn', english: 'work out', spanish: 'hacer ejercicio; entrenar' },
  { character: '多么', pinyin: 'duōme', english: 'how', spanish: 'cuán; qué' },
  { character: '饿', pinyin: 'è', english: 'hungry', spanish: 'hambriento' },
  { character: '耳朵', pinyin: 'ěrduo', english: 'ear', spanish: 'oreja' },
  { character: '发', pinyin: 'fā', english: 'hair', spanish: 'cabello' },
  { character: '发烧', pinyin: 'fāshāo', english: 'fever', spanish: 'tener fiebre' },
  { character: '发现', pinyin: 'fāxiàn', english: 'find', spanish: 'descubrir; encontrar' },
  { character: '方便', pinyin: 'fāngbiàn', english: 'convenience', spanish: 'conveniente; práctico' },
  { character: '放', pinyin: 'fàng', english: 'put', spanish: 'poner; colocar' },
  { character: '放心', pinyin: 'fàngxīn', english: 'rest assured', spanish: 'quedarse tranquilo' },
  { character: '分', pinyin: 'fēn', english: 'seperate', spanish: 'separar; dividir' },
  { character: '附近', pinyin: 'fùjìn', english: 'nearby', spanish: 'cerca; en los alrededores' },
  { character: '复习', pinyin: 'fùxí', english: 'review', spanish: 'repasar' },
  { character: '干净', pinyin: 'gānjìng', english: 'clean', spanish: 'limpio' },
  { character: '感冒', pinyin: 'gǎnmào', english: 'cold', spanish: 'resfriado; resfriarse' },
  { character: '感兴趣', pinyin: 'gǎn xìngqù', english: 'interested', spanish: 'estar interesado' },
  { character: '刚才', pinyin: 'gāngcái', english: 'just now', spanish: 'hace un momento' },
  { character: '个子', pinyin: 'gèzi', english: 'stature', spanish: 'estatura' },
  { character: '根据', pinyin: 'gēnjù', english: 'according to', spanish: 'según; de acuerdo con' },
  { character: '跟', pinyin: 'gēn', english: 'with', spanish: 'con' },
  { character: '更', pinyin: 'gèng', english: 'more', spanish: 'más; aún más' },
  { character: '公斤', pinyin: 'gōngjīn', english: 'kg', spanish: 'kilogramo' },
  { character: '公园', pinyin: 'gōngyuán', english: 'park', spanish: 'parque' },
  { character: '故事', pinyin: 'gùshi', english: 'story', spanish: 'historia; cuento' },
  { character: '刮风', pinyin: 'guā fēng', english: 'windy', spanish: 'hacer viento' },
  { character: '关', pinyin: 'guān', english: 'turn off', spanish: 'cerrar; apagar' },
  { character: '关系', pinyin: 'guānxi', english: 'relationship', spanish: 'relación' },
  { character: '关心', pinyin: 'guānxīn', english: 'concern', spanish: 'preocuparse por; interesarse por' },
  { character: '关于', pinyin: 'guānyú', english: 'on', spanish: 'sobre; acerca de' },
  { character: '国家', pinyin: 'guójiā', english: 'country', spanish: 'país' },
  { character: '过', pinyin: 'guò', english: 'pass', spanish: 'pasar' },
  { character: '过去', pinyin: 'guòqù', english: 'past', spanish: 'pasado; antes' },
  { character: '还是', pinyin: 'háishi', english: 'still is', spanish: 'o (en preguntas alternativas)' },
  { character: '害怕', pinyin: 'hàipà', english: 'fear', spanish: 'tener miedo' },
  { character: '黑板', pinyin: 'hēibǎn', english: 'blackboard', spanish: 'pizarra' },
  { character: '后来', pinyin: 'hòulái', english: 'later', spanish: 'después; más tarde' },
  { character: '护照', pinyin: 'hùzhào', english: 'passport', spanish: 'pasaporte' },
  { character: '花', pinyin: 'huā', english: 'flower', spanish: 'flor' },
  { character: '花', pinyin: 'huā', english: 'spend (verb)', spanish: 'gastar' },
  { character: '画', pinyin: 'huà', english: 'painting', spanish: 'dibujo; pintura' },
  { character: '坏', pinyin: 'huài', english: 'bad', spanish: 'malo; estropeado' },
  { character: '欢迎', pinyin: 'huānyíng', english: 'welcome', spanish: 'dar la bienvenida' }
];

let updated = 0;
let inserted = 0;

for (const entry of translations) {
  const source = english.find((item) => (
    item.character === entry.character
    && item.pinyin === entry.pinyin
    && item.translation === entry.english
  ));

  if (!source) {
    continue;
  }

  const index = spanish.findIndex((item) => (
    item.character === entry.character
    && item.pinyin === entry.pinyin
    && item.english === source.translation
  ));

  if (index !== -1) {
    spanish[index].spanish = entry.spanish;
    spanish[index].level = source.level;
    updated += 1;
  } else {
    spanish.push({
      character: source.character,
      pinyin: source.pinyin,
      english: source.translation,
      spanish: entry.spanish,
      level: source.level
    });
    inserted += 1;
  }
}

spanish.sort((left, right) => {
  if (left.level !== right.level) {
    return left.level - right.level;
  }

  if (left.character !== right.character) {
    return left.character.localeCompare(right.character, 'zh-Hans-u-co-pinyin');
  }

  if (left.pinyin !== right.pinyin) {
    return left.pinyin.localeCompare(right.pinyin);
  }

  return left.english.localeCompare(right.english);
});

fs.writeFileSync(spanishPath, `${JSON.stringify(spanish, null, 2)}\n`);
console.log(`HSK3 batch 02 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
