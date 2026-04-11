const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = [
  { character: '世界', pinyin: 'shìjiè', english: 'world', spanish: 'mundo' },
  { character: '试', pinyin: 'shì', english: 'test', spanish: 'probar; intentar' },
  { character: '瘦', pinyin: 'shòu', english: 'thin', spanish: 'delgado' },
  { character: '叔叔', pinyin: 'shūshu', english: 'uncle', spanish: 'tío' },
  { character: '舒服', pinyin: 'shūfu', english: 'comfortable', spanish: 'cómodo; sentirse bien' },
  { character: '树', pinyin: 'shù', english: 'tree', spanish: 'árbol' },
  { character: '数学', pinyin: 'shùxué', english: 'mathematics', spanish: 'matemáticas' },
  { character: '刷牙', pinyin: 'shuā yá', english: 'brushing teeth', spanish: 'cepillarse los dientes' },
  { character: '双', pinyin: 'shuāng', english: 'double', spanish: 'par; doble' },
  { character: '水平', pinyin: 'shuǐpíng', english: 'level', spanish: 'nivel' },
  { character: '司机', pinyin: 'sījī', english: 'driver', spanish: 'conductor' },
  { character: '太阳', pinyin: 'tàiyáng', english: 'Sun', spanish: 'sol' },
  { character: '特别', pinyin: 'tèbié', english: 'especially', spanish: 'especialmente; especial' },
  { character: '疼', pinyin: 'téng', english: 'pain', spanish: 'doler' },
  { character: '提高', pinyin: 'tígāo', english: 'improve', spanish: 'mejorar; elevar' },
  { character: '体育', pinyin: 'tǐyù', english: 'physical education', spanish: 'educación física' },
  { character: '甜', pinyin: 'tián', english: 'sweet', spanish: 'dulce' },
  { character: '条', pinyin: 'tiáo', english: 'article', spanish: 'clasificador; artículo' },
  { character: '同事', pinyin: 'tóngshì', english: 'colleague', spanish: 'compañero de trabajo' },
  { character: '同意', pinyin: 'tóngyì', english: 'agree', spanish: 'estar de acuerdo' },
  { character: '头发', pinyin: 'tóufa', english: 'hair', spanish: 'cabello' },
  { character: '突然', pinyin: 'tūrán', english: 'suddenly', spanish: 'de repente' },
  { character: '图书馆', pinyin: 'túshūguǎn', english: 'library', spanish: 'biblioteca' },
  { character: '腿', pinyin: 'tuǐ', english: 'leg', spanish: 'pierna' },
  { character: '完成', pinyin: 'wánchéng', english: 'carry out', spanish: 'completar; llevar a cabo' },
  { character: '碗', pinyin: 'wǎn', english: 'bowl', spanish: 'cuenco' },
  { character: '万', pinyin: 'wàn', english: 'million', spanish: 'diez mil' },
  { character: '忘记', pinyin: 'wàngjì', english: 'forget', spanish: 'olvidar' },
  { character: '为', pinyin: 'wèi', english: 'for', spanish: 'para; por' },
  { character: '为了', pinyin: 'wèile', english: 'in order to', spanish: 'para' },
  { character: '位', pinyin: 'wèi', english: 'place', spanish: 'clasificador de personas (cortés)' },
  { character: '文化', pinyin: 'wénhuà', english: 'culture', spanish: 'cultura' },
  { character: '西', pinyin: 'xī', english: 'west', spanish: 'oeste' },
  { character: '习惯', pinyin: 'xíguàn', english: 'habit', spanish: 'hábito; acostumbrarse' },
  { character: '洗手间', pinyin: 'xǐshǒujiān', english: 'rest room', spanish: 'baño; aseo' },
  { character: '洗澡', pinyin: 'xǐzǎo', english: 'take a bath', spanish: 'bañarse' },
  { character: '夏', pinyin: 'xià', english: 'summer', spanish: 'verano' },
  { character: '先', pinyin: 'xiān', english: 'first', spanish: 'primero' },
  { character: '相信', pinyin: 'xiāngxìn', english: 'believe', spanish: 'creer; confiar' },
  { character: '香蕉', pinyin: 'xiāngjiāo', english: 'banana', spanish: 'plátano' },
  { character: '向', pinyin: 'xiàng', english: 'to', spanish: 'hacia; a' },
  { character: '像', pinyin: 'xiàng', english: 'like', spanish: 'parecerse a; como' },
  { character: '小心', pinyin: 'xiǎoxīn', english: 'be careful', spanish: 'tener cuidado' },
  { character: '校长', pinyin: 'xiàozhǎng', english: 'principal', spanish: 'director (escolar)' },
  { character: '新闻', pinyin: 'xīnwén', english: 'news', spanish: 'noticias' },
  { character: '新鲜', pinyin: 'xīnxiān', english: 'fresh', spanish: 'fresco' },
  { character: '信用卡', pinyin: 'xìnyòngkǎ', english: 'credit card', spanish: 'tarjeta de crédito' },
  { character: '行李箱', pinyin: 'xínglǐ xiāng', english: 'trunk', spanish: 'maleta' },
  { character: '熊猫', pinyin: 'xióngmāo', english: 'panda', spanish: 'panda' },
  { character: '需要', pinyin: 'xūyào', english: 'need', spanish: 'necesitar' },
  { character: '选择', pinyin: 'xuǎnzé', english: 'select', spanish: 'elegir; selección' },
  { character: '要求', pinyin: 'yāoqiú', english: 'claim', spanish: 'exigir; requisito' },
  { character: '爷爷', pinyin: 'yéye', english: 'grandfather', spanish: 'abuelo paterno' },
  { character: '一般', pinyin: 'yībān', english: 'general', spanish: 'general; normal' },
  { character: '一边', pinyin: 'yībiān', english: 'one side', spanish: 'por un lado; mientras' },
  { character: '一定', pinyin: 'yīdìng', english: 'for sure', spanish: 'seguro; sin falta' },
  { character: '一共', pinyin: 'yīgòng', english: 'altogether', spanish: 'en total' },
  { character: '一会儿', pinyin: 'yīhuìr', english: 'a while', spanish: 'un rato' },
  { character: '一样', pinyin: 'yīyàng', english: 'same', spanish: 'igual; lo mismo' },
  { character: '一直', pinyin: 'yīzhí', english: 'always', spanish: 'siempre; continuamente' },
  { character: '以前', pinyin: 'yǐqián', english: 'before', spanish: 'antes' },
  { character: '音乐', pinyin: 'yīnyuè', english: 'music', spanish: 'música' },
  { character: '银行', pinyin: 'yínháng', english: 'bank', spanish: 'banco' },
  { character: '饮料', pinyin: 'yǐnliào', english: 'drink', spanish: 'bebida' },
  { character: '应该', pinyin: 'yīnggāi', english: 'should', spanish: 'debería' },
  { character: '影响', pinyin: 'yǐngxiǎng', english: 'influences', spanish: 'influir; influencia' },
  { character: '用', pinyin: 'yòng', english: 'use', spanish: 'usar' },
  { character: '游戏', pinyin: 'yóuxì', english: 'game', spanish: 'juego' },
  { character: '有名', pinyin: 'yǒumíng', english: 'famous', spanish: 'famoso' },
  { character: '又', pinyin: 'yòu', english: 'also', spanish: 'además; de nuevo' },
  { character: '遇到', pinyin: 'yùdào', english: 'encounter', spanish: 'encontrarse con' },
  { character: '元', pinyin: 'yuán', english: 'yuan', spanish: 'yuan' },
  { character: '愿意', pinyin: 'yuànyì', english: 'willing', spanish: 'estar dispuesto' },
  { character: '月亮', pinyin: 'yuèliang', english: 'moon', spanish: 'luna' },
  { character: '越', pinyin: 'yuè', english: 'more', spanish: 'cuanto más...' },
  { character: '站', pinyin: 'zhàn', english: 'station', spanish: 'estación; ponerse de pie' },
  { character: '张', pinyin: 'zhāng', english: 'zhang, stretch', spanish: 'clasificador; extender' },
  { character: '长', pinyin: 'zhǎng', english: 'grow (verb)', spanish: 'crecer' },
  { character: '着急', pinyin: 'zháojí', english: 'anxious', spanish: 'estar ansioso; preocuparse' },
  { character: '照顾', pinyin: 'zhàogù', english: 'take care', spanish: 'cuidar' },
  { character: '照片', pinyin: 'zhàopiàn', english: 'photo', spanish: 'foto' },
  { character: '照相机', pinyin: 'zhàoxiàngjī', english: 'camera', spanish: 'cámara (de fotos)' },
  { character: '只', pinyin: 'zhī', english: 'piece', spanish: 'clasificador para animales y objetos pares' },
  { character: '只', pinyin: 'zhǐ', english: 'only (adverb)', spanish: 'solo; solamente' },
  { character: '只有......才......', pinyin: 'zhǐyǒu...cái...', english: 'only ...', spanish: 'solo si... entonces...' },
  { character: '中间', pinyin: 'zhōngjiān', english: 'intermediate', spanish: 'en medio; entre' },
  { character: '中文', pinyin: 'zhōngwén', english: 'Chinese', spanish: 'chino (idioma)' },
  { character: '终于', pinyin: 'zhōngyú', english: 'at last', spanish: 'por fin' },
  { character: '种', pinyin: 'zhǒng', english: 'species (quantifiers)', spanish: 'tipo; clase' },
  { character: '重要', pinyin: 'zhòngyào', english: 'important', spanish: 'importante' },
  { character: '周末', pinyin: 'zhōumò', english: 'weekend', spanish: 'fin de semana' },
  { character: '主要', pinyin: 'zhǔyào', english: 'main', spanish: 'principal' },
  { character: '注意', pinyin: 'zhùyì', english: 'note', spanish: 'prestar atención; notar' },
  { character: '自己', pinyin: 'zìjǐ', english: 'myself', spanish: 'uno mismo; sí mismo' },
  { character: '自行车', pinyin: 'zìxíngchē', english: 'bicycle', spanish: 'bicicleta' },
  { character: '总是', pinyin: 'zǒngshì', english: 'always', spanish: 'siempre' },
  { character: '嘴', pinyin: 'zuǐ', english: 'mouth', spanish: 'boca' },
  { character: '最后', pinyin: 'zuìhòu', english: 'at last', spanish: 'al final; por último' },
  { character: '最近', pinyin: 'zuìjìn', english: 'recent', spanish: 'reciente; últimamente' },
  { character: '作业', pinyin: 'zuòyè', english: 'operation', spanish: 'tarea (de casa)' }
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
console.log(`HSK3 batch 04 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
