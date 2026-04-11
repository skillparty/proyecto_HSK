const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const translations = [
  { character: '还', pinyin: 'huán', english: 'return (verb)', spanish: 'devolver' },
  { character: '环境', pinyin: 'huánjìng', english: 'surroundings', spanish: 'entorno; ambiente' },
  { character: '换', pinyin: 'huàn', english: 'change', spanish: 'cambiar' },
  { character: '黄河', pinyin: 'Huánghé', english: 'Yellow River', spanish: 'Río Amarillo' },
  { character: '回答', pinyin: 'huídá', english: 'reply', spanish: 'responder; respuesta' },
  { character: '会议', pinyin: 'huìyì', english: 'meeting', spanish: 'reunión' },
  { character: '或者', pinyin: 'huòzhě', english: 'or', spanish: 'o' },
  { character: '几乎', pinyin: 'jīhū', english: 'almost', spanish: 'casi' },
  { character: '机会', pinyin: 'jīhuì', english: 'opportunity', spanish: 'oportunidad' },
  { character: '极', pinyin: 'jí', english: 'pole', spanish: 'polo; extremo' },
  { character: '记得', pinyin: 'jìde', english: 'remember', spanish: 'recordar' },
  { character: '季节', pinyin: 'jìjié', english: 'season', spanish: 'estación (del año)' },
  { character: '检查', pinyin: 'jiǎnchá', english: 'an examination', spanish: 'examinar; revisión' },
  { character: '简单', pinyin: 'jiǎndān', english: 'simple', spanish: 'simple; sencillo' },
  { character: '见面', pinyin: 'jiànmiàn', english: 'meet', spanish: 'verse; encontrarse' },
  { character: '健康', pinyin: 'jiànkāng', english: 'health', spanish: 'salud; sano' },
  { character: '讲', pinyin: 'jiǎng', english: 'speak', spanish: 'hablar; contar' },
  { character: '教', pinyin: 'jiāo', english: 'teach', spanish: 'enseñar' },
  { character: '角', pinyin: 'jiǎo', english: 'angle', spanish: 'ángulo' },
  { character: '脚', pinyin: 'jiǎo', english: 'foot', spanish: 'pie' },
  { character: '接', pinyin: 'jiē', english: 'pick up', spanish: 'recoger; recibir' },
  { character: '街道', pinyin: 'jiēdào', english: 'street', spanish: 'calle' },
  { character: '节目', pinyin: 'jiémù', english: 'program', spanish: 'programa' },
  { character: '节日', pinyin: 'jiérì', english: 'festival', spanish: 'festividad' },
  { character: '结婚', pinyin: 'jiéhūn', english: 'marry', spanish: 'casarse' },
  { character: '结束', pinyin: 'jiéshù', english: 'end', spanish: 'terminar; fin' },
  { character: '解决', pinyin: 'jiějué', english: 'solve', spanish: 'resolver' },
  { character: '借', pinyin: 'jiè', english: 'borrow', spanish: 'pedir prestado; prestar' },
  { character: '经常', pinyin: 'jīngcháng', english: 'often', spanish: 'a menudo' },
  { character: '经过', pinyin: 'jīngguò', english: 'after', spanish: 'pasar por; después de' },
  { character: '经理', pinyin: 'jīnglǐ', english: 'manager', spanish: 'gerente' },
  { character: '久', pinyin: 'jiǔ', english: 'long', spanish: 'mucho tiempo' },
  { character: '旧', pinyin: 'jiù', english: 'old', spanish: 'viejo; usado' },
  { character: '句子', pinyin: 'jùzi', english: 'sentence', spanish: 'frase; oración' },
  { character: '决定', pinyin: 'juédìng', english: 'decided', spanish: 'decidir; decisión' },
  { character: '可爱', pinyin: "kě'ài", english: 'lovely', spanish: 'adorable; lindo' },
  { character: '渴', pinyin: 'kě', english: 'thirsty', spanish: 'sediento' },
  { character: '刻', pinyin: 'kè', english: 'engraved', spanish: 'grabar; tallar' },
  { character: '客人', pinyin: 'kèrén', english: 'the guests', spanish: 'invitado; huésped' },
  { character: '空调', pinyin: 'kōngtiáo', english: 'air conditioning', spanish: 'aire acondicionado' },
  { character: '口', pinyin: 'kǒu', english: 'mouth', spanish: 'boca' },
  { character: '哭', pinyin: 'kū', english: 'cry', spanish: 'llorar' },
  { character: '裤子', pinyin: 'kùzi', english: 'pants', spanish: 'pantalones' },
  { character: '筷子', pinyin: 'kuàizi', english: 'chopsticks', spanish: 'palillos chinos' },
  { character: '蓝', pinyin: 'lán', english: 'blue', spanish: 'azul' },
  { character: '老', pinyin: 'lǎo', english: 'old', spanish: 'viejo; mayor' },
  { character: '离开', pinyin: 'líkāi', english: 'go away', spanish: 'irse; marcharse' },
  { character: '礼物', pinyin: 'lǐwù', english: 'gift', spanish: 'regalo' },
  { character: '历史', pinyin: 'lìshǐ', english: 'history', spanish: 'historia' },
  { character: '脸', pinyin: 'liǎn', english: 'face', spanish: 'cara' },
  { character: '练习', pinyin: 'liànxí', english: 'exercise', spanish: 'practicar; ejercicio' },
  { character: '辆', pinyin: 'liàng', english: 'piece', spanish: 'clasificador para vehículos' },
  { character: '聊天', pinyin: 'liáotiān', english: 'to chat with', spanish: 'charlar' },
  { character: '了解', pinyin: 'liǎojiě', english: 'understand', spanish: 'entender; conocer' },
  { character: '邻居', pinyin: 'línjū', english: 'neighbor', spanish: 'vecino' },
  { character: '留学', pinyin: 'liúxué', english: 'study abroad', spanish: 'estudiar en el extranjero' },
  { character: '楼', pinyin: 'lóu', english: 'floor', spanish: 'piso; edificio' },
  { character: '绿', pinyin: 'lǜ', english: 'green', spanish: 'verde' },
  { character: '马', pinyin: 'mǎ', english: 'horse', spanish: 'caballo' },
  { character: '马上', pinyin: 'mǎshàng', english: 'immediately', spanish: 'inmediatamente' },
  { character: '满意', pinyin: 'mǎnyì', english: 'satisfaction', spanish: 'satisfecho; satisfacción' },
  { character: '帽子', pinyin: 'màozi', english: 'hat', spanish: 'sombrero; gorra' },
  { character: '米', pinyin: 'mǐ', english: 'meter', spanish: 'metro' },
  { character: '面包', pinyin: 'miànbāo', english: 'bread', spanish: 'pan' },
  { character: '明白', pinyin: 'míngbai', english: 'understand', spanish: 'entender; claro' },
  { character: '拿', pinyin: 'ná', english: 'take', spanish: 'tomar; coger' },
  { character: '奶奶', pinyin: 'nǎinai', english: 'grandmother', spanish: 'abuela paterna' },
  { character: '南', pinyin: 'nán', english: 'south', spanish: 'sur' },
  { character: '难', pinyin: 'nán', english: 'difficult', spanish: 'difícil' },
  { character: '难过', pinyin: 'nánguò', english: 'sad', spanish: 'triste; sentirse mal' },
  { character: '年级', pinyin: 'niánjí', english: 'grade', spanish: 'curso; grado' },
  { character: '年轻', pinyin: 'niánqīng', english: 'young', spanish: 'joven' },
  { character: '鸟', pinyin: 'niǎo', english: 'bird', spanish: 'pájaro' },
  { character: '努力', pinyin: 'nǔlì', english: 'work hard', spanish: 'esforzarse' },
  { character: '爬山', pinyin: 'páshān', english: 'mountain climbing', spanish: 'escalar montañas; hacer senderismo' },
  { character: '盘子', pinyin: 'pánzi', english: 'plate', spanish: 'plato' },
  { character: '胖', pinyin: 'pàng', english: 'fat', spanish: 'gordo' },
  { character: '皮鞋', pinyin: 'píxié', english: 'leather shoes', spanish: 'zapatos de cuero' },
  { character: '啤酒', pinyin: 'píjiǔ', english: 'beer', spanish: 'cerveza' },
  { character: '瓶子', pinyin: 'píngzi', english: 'bottle', spanish: 'botella' },
  { character: '其实', pinyin: 'qíshí', english: 'in fact', spanish: 'en realidad' },
  { character: '其他', pinyin: 'qítā', english: 'other', spanish: 'otro; demás' },
  { character: '奇怪', pinyin: 'qíguài', english: 'strange', spanish: 'extraño' },
  { character: '骑', pinyin: 'qí', english: 'ride', spanish: 'montar (en bici/caballo)' },
  { character: '起飞', pinyin: 'qǐfēi', english: 'take off', spanish: 'despegar' },
  { character: '起来', pinyin: 'qǐlái', english: 'stand up', spanish: 'levantarse' },
  { character: '清楚', pinyin: 'qīngchu', english: 'clear', spanish: 'claro' },
  { character: '请假', pinyin: 'qǐngjià', english: 'ask for leave', spanish: 'pedir permiso; pedir baja' },
  { character: '秋', pinyin: 'qiū', english: 'autumn', spanish: 'otoño' },
  { character: '裙子', pinyin: 'qúnzi', english: 'skirt', spanish: 'falda' },
  { character: '然后', pinyin: 'ránhòu', english: 'then', spanish: 'luego; después' },
  { character: '热情', pinyin: 'rèqíng', english: 'enthusiasm', spanish: 'entusiasmo; cordial' },
  { character: '认为', pinyin: 'rènwéi', english: 'think', spanish: 'considerar; pensar' },
  { character: '认真', pinyin: 'rènzhēn', english: 'serious', spanish: 'serio; concienzudo' },
  { character: '容易', pinyin: 'róngyì', english: 'easy', spanish: 'fácil' },
  { character: '如果', pinyin: 'rúguǒ', english: 'in case', spanish: 'si' },
  { character: '伞', pinyin: 'sǎn', english: 'umbrella', spanish: 'paraguas' },
  { character: '上网', pinyin: 'shàngwǎng', english: 'surf the Internet', spanish: 'navegar por internet' },
  { character: '生气', pinyin: 'shēngqì', english: 'pissed off', spanish: 'enfadarse; estar enfadado' },
  { character: '声音', pinyin: 'shēngyīn', english: 'sound', spanish: 'sonido; voz' }
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
console.log(`HSK3 batch 03 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
