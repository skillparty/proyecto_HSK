const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = new Map([
  ['阿姨::āyí', 'tía'],
  ['啊::a', 'partícula modal/exclamativa'],
  ['矮::ǎi', 'bajo (de estatura)'],
  ['爱好::àihào', 'afición; hobby'],
  ['安静::ānjìng', 'tranquilo; en silencio'],
  ['把::bǎ', 'partícula "ba"'],
  ['班::bān', 'clase; turno'],
  ['搬::bān', 'mover; mudarse'],
  ['办法::bànfǎ', 'método; manera'],
  ['办公室::bàngōngshì', 'oficina'],
  ['半::bàn', 'mitad'],
  ['帮忙::bāngmáng', 'ayudar; echar una mano'],
  ['包::bāo', 'bolso; paquete'],
  ['饱::bǎo', 'estar lleno (de comida)'],
  ['北方::běifāng', 'norte'],
  ['被::bèi', 'partícula de voz pasiva'],
  ['鼻子::bízi', 'nariz'],
  ['比较::bǐjiào', 'comparar; relativamente'],
  ['比赛::bǐsài', 'competición; partido'],
  ['笔记本::bǐjìběn', 'cuaderno'],
  ['必须::bìxū', 'deber; tener que'],
  ['变化::biànhuà', 'cambio'],
  ['别人::biérén', 'otros; otras personas'],
  ['冰箱::bīngxiāng', 'refrigerador'],
  ['不但......而且......::bùdàn...érqiě...', 'no solo... sino también...'],
  ['菜单::càidān', 'menú'],
  ['参加::cānjiā', 'participar'],
  ['草::cǎo', 'hierba'],
  ['层::céng', 'piso (planta)'],
  ['差::chà', 'diferencia'],
  ['超市::chāoshì', 'supermercado'],
  ['衬衫::chènshān', 'camisa'],
  ['成绩::chéngjì', 'nota; resultado'],
  ['城市::chéngshì', 'ciudad'],
  ['迟到::chídào', 'llegar tarde'],
  ['除了::chúle', 'aparte de; excepto'],
  ['船::chuán', 'barco'],
  ['春::chūn', 'primavera'],
  ['词典::cídiǎn', 'diccionario'],
  ['聪明::cōngming', 'inteligente'],
  ['打扫::dǎsǎo', 'limpiar'],
  ['打算::dǎsuàn', 'planear; tener pensado'],
  ['带::dài', 'llevar'],
  ['担心::dānxīn', 'preocuparse'],
  ['蛋糕::dàngāo', 'pastel'],
  ['当然::dāngrán', 'por supuesto'],
  ['地::de', 'partícula adverbial'],
  ['灯::dēng', 'lámpara; luz'],
  ['地方::dìfāng', 'lugar'],
  ['地铁::dìtiě', 'metro']
]);

const byKey = new Map(spanish.map((item, index) => [`${item.character}::${item.pinyin}`, index]));
let updated = 0;
let inserted = 0;

for (const [key, spanishText] of translations.entries()) {
  const [character, pinyin] = key.split('::');
  const index = byKey.get(key);
  const source = english.find((item) => item.character === character && item.pinyin === pinyin);

  if (!source) {
    continue;
  }

  if (index !== undefined) {
    spanish[index].spanish = spanishText;
    spanish[index].english = spanish[index].english || source.translation;
    spanish[index].level = source.level;
    updated += 1;
  } else {
    spanish.push({
      character: source.character,
      pinyin: source.pinyin,
      english: source.translation,
      spanish: spanishText,
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

  return left.pinyin.localeCompare(right.pinyin);
});

fs.writeFileSync(spanishPath, `${JSON.stringify(spanish, null, 2)}\n`);
console.log(`HSK3 batch 01 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
