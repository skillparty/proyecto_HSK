const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '毛巾', pinyin: 'máojīn', english: 'towel; washcloth', spanish: 'toalla; paño' },
  { character: '美丽', pinyin: 'měilì', english: 'beautiful', spanish: 'hermoso; bello' },
  { character: '梦', pinyin: 'mèng', english: 'to dream', spanish: 'soñar; sueño' },
  { character: '迷路', pinyin: 'mílù', english: 'to get lost', spanish: 'perderse' },
  { character: '密码', pinyin: 'mìmǎ', english: 'password; secret code', spanish: 'contraseña; código secreto' },
  { character: '免费', pinyin: 'miǎn fèi', english: 'free (of charge); no cost', spanish: 'gratis; sin costo' },
  { character: '秒', pinyin: 'miǎo', english: 'second (unit of time or angle)', spanish: 'segundo (unidad de tiempo)' },
  { character: '民族', pinyin: 'mínzú', english: 'nationality; ethnic group', spanish: 'etnia; nacionalidad' },
  { character: '母亲', pinyin: 'mǔqin', english: 'mother', spanish: 'madre' },
  { character: '目的', pinyin: 'mùdì', english: 'purpose; aim; goal', spanish: 'objetivo; propósito' },
  { character: '耐心', pinyin: 'nàixīn', english: 'to be patient', spanish: 'paciencia; ser paciente' },
  { character: '难道', pinyin: 'nándào', english: "could it be that ...?; don't tell me ...", spanish: '¿acaso...?; ¿no me digas que...?' },
  { character: '难受', pinyin: 'nánshòu', english: 'feel unwell; to suffer pain', spanish: 'sentirse mal; sufrir' },
  { character: '内', pinyin: 'nèi', english: 'inside; inner; internal; within', spanish: 'interior; dentro de' },
  { character: '内容', pinyin: 'nèiróng', english: 'content; substance; details', spanish: 'contenido; detalles' },
  { character: '能力', pinyin: 'nénglì', english: 'capability; capable; ability', spanish: 'capacidad; habilidad' },
  { character: '年龄', pinyin: 'niánlíng', english: "(a person's) age", spanish: 'edad' },
  { character: '弄', pinyin: 'nòng', english: 'do; manage; to handle; make', spanish: 'hacer; manejar; arreglar' },
  { character: '暖和', pinyin: 'nuǎnhuo', english: 'warm; nice and warm', spanish: 'templado; cálido' },
  { character: '偶尔', pinyin: "ǒu'ěr", english: 'occasionally; once in a while; sometimes', spanish: 'de vez en cuando; ocasionalmente' },
  { character: '排队', pinyin: 'pái duì', english: 'queue; stand in line', spanish: 'hacer cola' },
  { character: '排列', pinyin: 'páiliè', english: 'arrange; align; permutation', spanish: 'ordenar; alinear; permutación' },
  { character: '判断', pinyin: 'pànduàn', english: 'to judge; judgment; to decide', spanish: 'juzgar; juicio; decidir' },
  { character: '陪', pinyin: 'péi', english: 'accompany; keep company', spanish: 'acompañar' },
  { character: '批评', pinyin: 'pīpíng', english: 'criticize', spanish: 'criticar; crítica' },
  { character: '皮肤', pinyin: 'pífū', english: 'skin', spanish: 'piel' },
  { character: '脾气', pinyin: 'píqi', english: 'temperament; disposition; temper', spanish: 'carácter; temperamento' },
  { character: '篇', pinyin: 'piān', english: 'sheet; (mw for articles); piece of writing', spanish: 'pieza escrita; clasificador de artículos' },
  { character: '骗', pinyin: 'piàn', english: 'to cheat; to swindle; deceive', spanish: 'engañar; estafar' },
  { character: '乒乓球', pinyin: 'pīngpāngqiú', english: 'ping pong; table tennis', spanish: 'tenis de mesa; ping-pong' },
  { character: '平时', pinyin: 'píngshí', english: 'ordinarily; in normal times; in peacetime', spanish: 'normalmente; en tiempos normales' },
  { character: '破', pinyin: 'pò', english: 'broken; damaged; to split', spanish: 'roto; romper' },
  { character: '葡萄', pinyin: 'pútao', english: 'grape', spanish: 'uva' },
  { character: '普遍', pinyin: 'pǔbiàn', english: 'common; universal; general; widespread', spanish: 'común; generalizado' },
  { character: '普通话', pinyin: 'pǔtōnghuà', english: 'Mandarin (common language)', spanish: 'mandarín (putonghua)' },
  { character: '其次', pinyin: 'qícì', english: 'next; secondly', spanish: 'en segundo lugar' },
  { character: '其中', pinyin: 'qízhōng', english: 'among; in; included among these', spanish: 'entre ellos; dentro de' },
  { character: '气候', pinyin: 'qìhòu', english: 'climate; atmosphere; weather', spanish: 'clima' },
  { character: '千万', pinyin: 'qiānwàn', english: 'ten million; be sure to; must', spanish: 'diez millones; asegúrate de; debes' },
  { character: '签证', pinyin: 'qiānzhèng', english: 'visa', spanish: 'visado' },
  { character: '敲', pinyin: 'qiāo', english: 'knock; blackmail', spanish: 'golpear; llamar (a la puerta)' },
  { character: '桥', pinyin: 'qiáo', english: 'bridge', spanish: 'puente' },
  { character: '巧克力', pinyin: 'qiǎokèlì', english: 'chocolate', spanish: 'chocolate' },
  { character: '亲戚', pinyin: 'qīnqi', english: 'a relative (i.e. family relation)', spanish: 'pariente; familiar' },
  { character: '轻', pinyin: 'qīng', english: 'light; easy; gentle; soft', spanish: 'ligero; suave; fácil' },
  { character: '轻松', pinyin: 'qīngsōng', english: 'relaxed; gentle; easygoing', spanish: 'relajado; tranquilo' },
  { character: '情况', pinyin: 'qíngkuàng', english: 'circumstance; state of affairs; situation', spanish: 'situación; circunstancia' },
  { character: '穷', pinyin: 'qióng', english: 'poor; exhausted', spanish: 'pobre; agotado' },
  { character: '区别', pinyin: 'qūbié', english: 'difference; distinguish', spanish: 'diferencia; distinguir' },
  { character: '取', pinyin: 'qǔ', english: 'to take; get; choose', spanish: 'tomar; obtener; elegir' },
  { character: '全部', pinyin: 'quánbù', english: 'whole; entire; complete', spanish: 'todo; completo' },
  { character: '缺点', pinyin: 'quēdiǎn', english: 'weak point; defect; fault; shortcoming', spanish: 'defecto; punto débil' },
  { character: '缺少', pinyin: 'quēshǎo', english: 'to lack; be short of; be deficient in', spanish: 'carecer de; faltar' },
  { character: '却', pinyin: 'què', english: 'but; yet; however', spanish: 'sin embargo; pero' },
  { character: '确实', pinyin: 'quèshí', english: 'indeed; in truth; reliable', spanish: 'realmente; en efecto' },
  { character: '然而', pinyin: "rán'ér", english: 'however; yet; but', spanish: 'sin embargo; no obstante' },
  { character: '热闹', pinyin: 'rènao', english: 'bustling; lively; busy', spanish: 'animado; bullicioso' },
  { character: '任何', pinyin: 'rènhé', english: 'any; whatever; whichever', spanish: 'cualquier; cualquiera' },
  { character: '任务', pinyin: 'rènwu', english: 'a mission; an assignment; a task', spanish: 'tarea; misión' },
  { character: '扔', pinyin: 'rēng', english: 'to throw; throw away', spanish: 'tirar; arrojar' },
  { character: '仍然', pinyin: 'réngrán', english: 'still; yet', spanish: 'todavía; aún' },
  { character: '日记', pinyin: 'rìjì', english: 'diary', spanish: 'diario' },
  { character: '入口', pinyin: 'rùkǒu', english: 'entrance', spanish: 'entrada' },
  { character: '散步', pinyin: 'sàn bù', english: 'to go for a walk', spanish: 'dar un paseo' },
  { character: '森林', pinyin: 'sēnlín', english: 'forest', spanish: 'bosque' },
  { character: '沙发', pinyin: 'shāfā', english: 'sofa', spanish: 'sofá' },
  { character: '伤心', pinyin: 'shāngxīn', english: 'sad; grieve; brokenhearted', spanish: 'triste; afligido' },
  { character: '商量', pinyin: 'shāngliang', english: 'consult; talk over; discuss', spanish: 'consultar; discutir' },
  { character: '稍微', pinyin: 'shāowēi', english: 'a little bit; slightly', spanish: 'un poco; ligeramente' },
  { character: '勺子', pinyin: 'sháozi', english: 'spoon; scoop; ladle', spanish: 'cuchara; cucharón' },
  { character: '社会', pinyin: 'shèhuì', english: 'society', spanish: 'sociedad' },
  { character: '申请', pinyin: 'shēnqǐng', english: 'apply for; application', spanish: 'solicitar; solicitud' },
  { character: '深', pinyin: 'shēn', english: 'deep; profound; dark (of colors)', spanish: 'profundo; oscuro' },
  { character: '甚至', pinyin: 'shènzhì', english: 'even (to the point of); so much so that', spanish: 'incluso; hasta el punto de' },
  { character: '生活', pinyin: 'shēnghuó', english: 'life; livelihood; to live', spanish: 'vida; vivir' },
  { character: '生命', pinyin: 'shēngmìng', english: 'life', spanish: 'vida' },
  { character: '生意', pinyin: 'shēngyi', english: 'business; trade', spanish: 'negocio; comercio' },
  { character: '省', pinyin: 'shěng', english: 'to save; economize; omit; province', spanish: 'ahorrar; omitir; provincia' },
  { character: '剩', pinyin: 'shèng', english: 'have as remainder; be left over; surplus', spanish: 'sobrar; restante' },
  { character: '失败', pinyin: 'shībài', english: 'be defeated; fail; lose', spanish: 'fracasar; perder' },
  { character: '失望', pinyin: 'shīwàng', english: 'disappointed; lose hope', spanish: 'decepcionado; perder la esperanza' },
  { character: '师傅', pinyin: 'shīfu', english: 'master; qualified worker; teacher', spanish: 'maestro; trabajador cualificado' },
  { character: '十分', pinyin: 'shífēn', english: 'very; fully; 100%', spanish: 'muy; completamente' },
  { character: '实际', pinyin: 'shíjì', english: 'actual; reality; practice', spanish: 'real; realidad; práctico' },
  { character: '实在', pinyin: 'shízài', english: 'honest; in reality; honestly; indeed; certainly', spanish: 'realmente; sinceramente; de verdad' },
  { character: '使', pinyin: 'shǐ', english: 'to use; to make; to cause; enable; envoy; messenger', spanish: 'hacer; causar; usar; habilitar' },
  { character: '使用', pinyin: 'shǐyòng', english: 'to use; employ; apply; administer; manipulate', spanish: 'usar; aplicar; emplear' },
  { character: '世纪', pinyin: 'shìjì', english: 'century', spanish: 'siglo' },
  { character: '是否', pinyin: 'shìfǒu', english: 'whether (or not); if', spanish: 'si; si o no' },
  { character: '适合', pinyin: 'shìhé', english: 'to suit; to fit', spanish: 'adecuarse; encajar' },
  { character: '适应', pinyin: 'shìyìng', english: 'to suit; to fit; adapt', spanish: 'adaptarse' },
  { character: '收', pinyin: 'shōu', english: 'receive; accept; collect; to harvest', spanish: 'recibir; aceptar; recoger' },
  { character: '收入', pinyin: 'shōurù', english: 'take in; income; revenue', spanish: 'ingresos; recaudar' },
  { character: '收拾', pinyin: 'shōushi', english: 'to tidy; put in order; to repair; to settle with; punish', spanish: 'ordenar; arreglar; castigar' },
  { character: '首都', pinyin: 'shǒudū', english: 'capital (city)', spanish: 'capital' },
  { character: '首先', pinyin: 'shǒuxiān', english: 'first (of all); in the first place; firstly', spanish: 'primero; en primer lugar' },
  { character: '受不了', pinyin: 'shòu bu liǎo', english: 'cannot endure; unbearable; can\'t stand', spanish: 'no poder soportar; insoportable' },
  { character: '受到', pinyin: 'shòudào', english: 'receive (influence, restriction, etc.); be subjected to', spanish: 'recibir; verse afectado por' },
  { character: '售货员', pinyin: 'shòuhuòyuán', english: 'salesclerk; shop assistant', spanish: 'dependiente; vendedor' },
  { character: '输', pinyin: 'shū', english: 'to transport; to lose (a game, etc.)', spanish: 'transportar; perder' }
];

let updated = 0;
let inserted = 0;

for (const entry of translations) {
  const source = english.find((item) => (
    normalize(item.character) === normalize(entry.character)
    && normalize(item.pinyin) === normalize(entry.pinyin)
    && normalize(item.translation) === normalize(entry.english)
  ));

  if (!source) {
    continue;
  }

  const index = spanish.findIndex((item) => (
    normalize(item.character) === normalize(source.character)
    && normalize(item.pinyin) === normalize(source.pinyin)
    && normalize(item.english) === normalize(source.translation)
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

  if (normalize(left.character) !== normalize(right.character)) {
    return normalize(left.character).localeCompare(normalize(right.character), 'zh-Hans-u-co-pinyin');
  }

  if (normalize(left.pinyin) !== normalize(right.pinyin)) {
    return normalize(left.pinyin).localeCompare(normalize(right.pinyin));
  }

  return normalize(left.english).localeCompare(normalize(right.english));
});

fs.writeFileSync(spanishPath, `${JSON.stringify(spanish, null, 2)}\n`);
console.log(`HSK4 batch 04 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
