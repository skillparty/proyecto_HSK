const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = new Map([
  ['票::piào', 'billete; entrada'],
  ['妻子::qīzi', 'esposa'],
  ['起床::qǐchuáng', 'levantarse'],
  ['千::qiān', 'mil'],
  ['铅笔::qiānbǐ', 'lápiz'],
  ['晴::qíng', 'despejado'],
  ['去年::qùnián', 'el año pasado'],
  ['让::ràng', 'dejar; permitir'],
  ['日::rì', 'día'],
  ['上班::shàngbān', 'ir a trabajar'],
  ['身体::shēntǐ', 'cuerpo; salud'],
  ['生病::shēngbìng', 'enfermarse'],
  ['生日::shēngrì', 'cumpleaños'],
  ['时间::shíjiān', 'tiempo'],
  ['事情::shìqing', 'asunto; cosa'],
  ['手表::shǒubiǎo', 'reloj de pulsera'],
  ['手机::shǒujī', 'teléfono móvil'],
  ['说话::shuōhuà', 'hablar'],
  ['送::sòng', 'regalar; llevar'],
  ['虽然......但是......::suīrán...dànshì...', 'aunque... pero...'],
  ['它::tā', 'ello'],
  ['踢足球::tī zúqiú', 'jugar al fútbol'],
  ['题::tí', 'pregunta; ejercicio'],
  ['跳舞::tiàowǔ', 'bailar'],
  ['外::wài', 'fuera; exterior'],
  ['完::wán', 'terminar'],
  ['玩::wán', 'jugar; divertirse'],
  ['晚上::wǎnshang', 'noche'],
  ['往::wǎng', 'hacia'],
  ['为什么::wèishénme', 'por qué'],
  ['问::wèn', 'preguntar'],
  ['问题::wèntí', 'pregunta; problema'],
  ['西瓜::xīguā', 'sandía'],
  ['希望::xīwàng', 'esperar; desear'],
  ['洗::xǐ', 'lavar'],
  ['小时::xiǎoshí', 'hora'],
  ['笑::xiào', 'reír'],
  ['新::xīn', 'nuevo'],
  ['姓::xìng', 'apellido'],
  ['休息::xiūxi', 'descansar'],
  ['雪::xuě', 'nieve'],
  ['颜色::yánsè', 'color'],
  ['眼睛::yǎnjing', 'ojos'],
  ['羊肉::yángròu', 'carne de cordero'],
  ['药::yào', 'medicina'],
  ['要::yào', 'querer; necesitar'],
  ['也::yě', 'también'],
  ['一起::yīqǐ', 'juntos'],
  ['一下::yīxià', 'un momento; un poco'],
  ['已经::yǐjīng', 'ya'],
  ['意思::yìsi', 'significado'],
  ['因为......所以......::yīnwèi...suǒyǐ...', 'porque... por eso...'],
  ['阴::yīn', 'nublado'],
  ['游泳::yóuyǒng', 'nadar'],
  ['右边::yòubiān', 'lado derecho'],
  ['鱼::yú', 'pescado'],
  ['远::yuǎn', 'lejos'],
  ['运动::yùndòng', 'hacer ejercicio'],
  ['再::zài', 'de nuevo'],
  ['早上::zǎoshang', 'por la mañana'],
  ['丈夫::zhàngfu', 'marido'],
  ['找::zhǎo', 'buscar'],
  ['着::zhe', 'partícula aspectual (durativa)'],
  ['真::zhēn', 'realmente'],
  ['正在::zhèngzài', 'estar + gerundio'],
  ['知道::zhīdào', 'saber'],
  ['准备::zhǔnbèi', 'preparar; estar listo'],
  ['左边::zuǒbiān', 'lado izquierdo']
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
console.log(`HSK2 batch 02 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
