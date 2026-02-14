const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = new Map([
  ['吧::ba', 'partícula modal (sugerencia)'],
  ['白::bái', 'blanco'],
  ['百::bǎi', 'cien'],
  ['帮助::bāngzhù', 'ayudar'],
  ['报纸::bàozhǐ', 'periódico'],
  ['比::bǐ', 'que (comparación)'],
  ['别::bié', 'no (imperativo)'],
  ['宾馆::bīnguǎn', 'hotel'],
  ['长::cháng', 'largo'],
  ['唱歌::chànggē', 'cantar'],
  ['出::chū', 'salir'],
  ['穿::chuān', 'llevar puesto'],
  ['次::cì', 'vez'],
  ['从::cóng', 'desde'],
  ['错::cuò', 'incorrecto'],
  ['打篮球::dǎ lánqiú', 'jugar al baloncesto'],
  ['大家::dàjiā', 'todos'],
  ['到::dào', 'llegar'],
  ['得::de', 'partícula estructural'],
  ['等::děng', 'esperar'],
  ['弟弟::dìdi', 'hermano menor'],
  ['第一::dì yī', 'primero'],
  ['懂::dǒng', 'entender'],
  ['对::duì', 'correcto; a/hacia'],
  ['房间::fángjiān', 'habitación'],
  ['非常::fēicháng', 'muy'],
  ['服务员::fúwùyuán', 'camarero'],
  ['高::gāo', 'alto'],
  ['告诉::gàosu', 'decir'],
  ['哥哥::gēge', 'hermano mayor'],
  ['给::gěi', 'dar'],
  ['公共汽车::gōnggòng qìchē', 'autobús'],
  ['公司::gōngsī', 'empresa'],
  ['贵::guì', 'caro'],
  ['过::guo', 'partícula de experiencia (haber ...)'],
  ['还::hái', 'también'],
  ['孩子::háizi', 'niño'],
  ['好吃::hǎochī', 'delicioso'],
  ['黑::hēi', 'negro'],
  ['红::hóng', 'rojo'],
  ['火车站::huǒchē zhàn', 'estación de tren'],
  ['机场::jīchǎng', 'aeropuerto'],
  ['鸡蛋::jīdàn', 'huevo'],
  ['件::jiàn', 'unidad (contador)'],
  ['教室::jiàoshì', 'aula'],
  ['姐姐::jiějie', 'hermana mayor'],
  ['介绍::jièshào', 'presentar'],
  ['进::jìn', 'entrar'],
  ['近::jìn', 'cerca'],
  ['就::jiù', 'entonces'],
  ['觉得::juéde', 'creer; sentir'],
  ['咖啡::kāfēi', 'café'],
  ['开始::kāishǐ', 'empezar'],
  ['考试::kǎoshì', 'examen'],
  ['可能::kěnéng', 'posiblemente'],
  ['可以::kěyǐ', 'poder'],
  ['课::kè', 'clase'],
  ['快::kuài', 'rápido'],
  ['快乐::kuàilè', 'feliz'],
  ['累::lèi', 'cansado'],
  ['离::lí', 'a (distancia de)'],
  ['两::liǎng', 'dos'],
  ['零::líng', 'cero'],
  ['路::lù', 'camino'],
  ['旅游::lǚyóu', 'viajar'],
  ['卖::mài', 'vender'],
  ['慢::màn', 'lento'],
  ['忙::máng', 'ocupado'],
  ['每::měi', 'cada'],
  ['妹妹::mèimei', 'hermana menor'],
  ['门::mén', 'puerta'],
  ['面条::miàntiáo', 'fideos'],
  ['男::nán', 'masculino'],
  ['您::nín', 'usted'],
  ['牛奶::niúnǎi', 'leche'],
  ['女::nǚ', 'femenino'],
  ['旁边::pángbiān', 'al lado de'],
  ['跑步::pǎobù', 'correr'],
  ['便宜::piányi', 'barato']
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
console.log(`HSK2 batch 01 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
