const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '爱情', pinyin: 'àiqíng', english: '(romantic) love', spanish: 'amor (romántico)' },
  { character: '安排', pinyin: 'ānpái', english: 'arrange; to plan', spanish: 'organizar; planificar' },
  { character: '安全', pinyin: 'ānquán', english: 'safe; safety; secure; security', spanish: 'seguro; seguridad' },
  { character: '按时', pinyin: 'ànshí', english: 'on time; on schedule', spanish: 'a tiempo; según lo previsto' },
  { character: '按照', pinyin: 'ànzhào', english: 'according to; in accordance with; in light of', spanish: 'según; de acuerdo con' },
  { character: '百分之', pinyin: 'bǎifēnzhī', english: 'percent', spanish: 'por ciento' },
  { character: '棒', pinyin: 'bàng', english: 'stick; club; good; excellent', spanish: 'palo; excelente' },
  { character: '包子', pinyin: 'bāozi', english: 'steamed stuffed bun', spanish: 'baozi; bollo relleno al vapor' },
  { character: '保护', pinyin: 'bǎohù', english: 'to protect; to defend', spanish: 'proteger; defender' },
  { character: '保证', pinyin: 'bǎozhèng', english: 'to guarantee; ensure', spanish: 'garantizar; asegurar' },
  { character: '报名', pinyin: 'bào míng', english: 'sign up; apply', spanish: 'inscribirse; solicitar' },
  { character: '抱', pinyin: 'bào', english: 'to hold; to hug; carry in one\'s arms; to cradle', spanish: 'abrazar; sostener en brazos' },
  { character: '抱歉', pinyin: 'bàoqiàn', english: 'be sorry; feel apologetic; to regret', spanish: 'lamentar; disculparse' },
  { character: '倍', pinyin: 'bèi', english: '(two, three, etc)-fold; times (multiplier)', spanish: 'vez; múltiplo' },
  { character: '本来', pinyin: 'běnlái', english: 'originally; at first', spanish: 'originalmente; al principio' },
  { character: '笨', pinyin: 'bèn', english: 'stupid; foolish; silly; dumb; clumsy', spanish: 'tonto; torpe' },
  { character: '比如', pinyin: 'bǐrú', english: 'for example; for instance; such as', spanish: 'por ejemplo' },
  { character: '毕业', pinyin: 'bì yè', english: 'to graduate; to finish school', spanish: 'graduarse; terminar los estudios' },
  { character: '遍', pinyin: 'biàn', english: 'a time; everywhere; turn; (mw for times or turns)', spanish: 'vez; por todas partes' },
  { character: '标准', pinyin: 'biāozhǔn', english: '(an official) standard; norm; criterion', spanish: 'estándar; norma; criterio' },
  { character: '表格', pinyin: 'biǎogé', english: 'form (document)', spanish: 'formulario' },
  { character: '表示', pinyin: 'biǎoshì', english: 'express; show; indicate', spanish: 'expresar; mostrar; indicar' },
  { character: '表演', pinyin: 'biǎoyǎn', english: 'perform; to play', spanish: 'actuar; representar' },
  { character: '表扬', pinyin: 'biǎoyáng', english: 'to praise; commend', spanish: 'elogiar; felicitar' },
  { character: '饼干', pinyin: 'bǐnggān', english: 'biscuit; cracker; cookie', spanish: 'galleta' },
  { character: '并且', pinyin: 'bìngqiě', english: 'and; besides; moreover', spanish: 'y además; asimismo' },
  { character: '博士', pinyin: 'bóshì', english: 'doctor; PhD', spanish: 'doctor; doctorado (PhD)' },
  { character: '不得不', pinyin: 'bù dé bù', english: 'have to; have no choice but to; cannot but', spanish: 'tener que; no tener más remedio que' },
  { character: '不管', pinyin: 'bùguǎn', english: 'no matter (what, how, etc.); regardless of', spanish: 'sin importar; no importa' },
  { character: '不过', pinyin: 'búguò', english: 'only; merely; but; however', spanish: 'pero; sin embargo; solo' },
  { character: '不仅', pinyin: 'bùjǐn', english: 'not only; not just', spanish: 'no solo' },
  { character: '部分', pinyin: 'bùfen', english: 'part; share; section', spanish: 'parte; sección' },
  { character: '擦', pinyin: 'cā', english: 'to wipe; to rub; to polish', spanish: 'limpiar; frotar' },
  { character: '猜', pinyin: 'cāi', english: 'to guess', spanish: 'adivinar' },
  { character: '材料', pinyin: 'cáiliào', english: 'material', spanish: 'material' },
  { character: '参观', pinyin: 'cānguān', english: 'to visit (a place, such as a tourist spot); inspect', spanish: 'visitar; recorrer' },
  { character: '餐厅', pinyin: 'cāntīng', english: 'dining hall; cafeteria; restaurant', spanish: 'restaurante; comedor' },
  { character: '厕所', pinyin: 'cèsuǒ', english: 'bathroom; toilet; lavatory', spanish: 'baño; aseo' },
  { character: '差不多', pinyin: 'chàbuduō', english: 'almost; about the same', spanish: 'casi; aproximadamente igual' },
  { character: '长城', pinyin: 'chángchéng', english: 'the Great Wall', spanish: 'la Gran Muralla' },
  { character: '长江', pinyin: 'Chángjiāng', english: 'the Yangtze River; the Changjiang River', spanish: 'río Yangtsé; río Changjiang' },
  { character: '尝', pinyin: 'cháng', english: 'to taste; flavor; (past tense marker)', spanish: 'probar; sabor' },
  { character: '场', pinyin: 'chǎng', english: 'courtyard; place; field; (mw for games, performances, etc.)', spanish: 'lugar; campo; clasificador de eventos' },
  { character: '超过', pinyin: 'chāoguò', english: 'surpass; exceed; outstrip', spanish: 'superar; exceder' },
  { character: '成功', pinyin: 'chénggōng', english: 'success; to succeed', spanish: 'éxito; tener éxito' },
  { character: '成为', pinyin: 'chéngwéi', english: 'become; turn into', spanish: 'convertirse en' },
  { character: '诚实', pinyin: 'chéngshí', english: 'honest; honorable', spanish: 'honesto' },
  { character: '乘坐', pinyin: 'chéngzuò', english: 'ride; get into (a vehicle)', spanish: 'tomar (un transporte); viajar en' },
  { character: '吃惊', pinyin: 'chī jīng', english: 'be startled; be shocked; be amazed', spanish: 'sorprenderse; quedarse asombrado' },
  { character: '重新', pinyin: 'chóngxīn', english: 'again; anew; once more', spanish: 'de nuevo; otra vez' },
  { character: '抽烟', pinyin: 'chōuyān', english: 'to smoke (a cigarette, pipe, etc.)', spanish: 'fumar' },
  { character: '出差', pinyin: 'chū chāi', english: 'go on a business trip', spanish: 'viajar por trabajo' },
  { character: '出发', pinyin: 'chūfā', english: 'start out; set off', spanish: 'partir; ponerse en marcha' },
  { character: '出生', pinyin: 'chūshēng', english: 'be born', spanish: 'nacer' },
  { character: '出现', pinyin: 'chūxiàn', english: 'appear; arise; emerge', spanish: 'aparecer; surgir' },
  { character: '厨房', pinyin: 'chúfáng', english: 'kitchen', spanish: 'cocina' },
  { character: '传真', pinyin: 'chuánzhēn', english: 'fax; facsimile', spanish: 'fax; facsímil' },
  { character: '窗户', pinyin: 'chuānghu', english: 'window', spanish: 'ventana' },
  { character: '词语', pinyin: 'cíyǔ', english: 'words and expressions; terms', spanish: 'palabras y expresiones; términos' },
  { character: '从来', pinyin: 'cónglái', english: 'always; at all times', spanish: 'siempre; desde siempre' },
  { character: '粗心', pinyin: 'cūxīn', english: 'careless; inadvertent; negligent', spanish: 'descuidado' },
  { character: '存', pinyin: 'cún', english: 'exist; to deposit; to store', spanish: 'existir; depositar; guardar' },
  { character: '错误', pinyin: 'cuòwù', english: 'error; mistake; mistaken', spanish: 'error; equivocación' },
  { character: '答案', pinyin: 'dá\'àn', english: 'answer; solution', spanish: 'respuesta; solución' },
  { character: '打扮', pinyin: 'dǎban', english: 'dress up; put on make up', spanish: 'arreglarse; maquillarse' },
  { character: '打扰', pinyin: 'dǎrǎo', english: 'disturb', spanish: 'molestar; interrumpir' },
  { character: '打印', pinyin: 'dǎyìn', english: 'to print', spanish: 'imprimir' },
  { character: '打招呼', pinyin: 'dǎzhāohu', english: 'notify; greet; inform', spanish: 'saludar; avisar' },
  { character: '打折', pinyin: 'dǎzhé', english: 'sell at a discount', spanish: 'hacer descuento; rebajar' },
  { character: '打针', pinyin: 'dǎzhēn', english: 'inject; get a shot', spanish: 'poner una inyección; vacunarse' },
  { character: '大概', pinyin: 'dàgài', english: 'probably; roughly; approximate', spanish: 'probablemente; aproximadamente' },
  { character: '大使馆', pinyin: 'dàshǐguǎn', english: 'embassy', spanish: 'embajada' },
  { character: '大约', pinyin: 'dàyuē', english: 'approximately; about', spanish: 'aproximadamente; alrededor de' },
  { character: '大夫', pinyin: 'dàifu', english: 'doctor; physician', spanish: 'doctor; médico' },
  { character: '戴', pinyin: 'dài', english: 'put on; to wear; to respect', spanish: 'llevar puesto; ponerse' },
  { character: '当', pinyin: 'dāng', english: 'should; act as; work as; manage; match; (sound of bells)', spanish: 'ser; actuar como; trabajar de' },
  { character: '当时', pinyin: 'dāngshí', english: 'then; at that time; while', spanish: 'en aquel momento; entonces' },
  { character: '刀', pinyin: 'dāo', english: 'knife; blade (Kangxi radical 18)', spanish: 'cuchillo; hoja' },
  { character: '导游', pinyin: 'dǎoyóu', english: 'tour guide', spanish: 'guía turístico' },
  { character: '到处', pinyin: 'dàochù', english: 'everywhere; in all places; all over', spanish: 'por todas partes' },
  { character: '到底', pinyin: 'dào dǐ', english: 'after all; in the end (used in a question)', spanish: 'al fin y al cabo; en definitiva' },
  { character: '倒', pinyin: 'dǎo, dào', english: 'to collapse; to fall; fail; to exchange | to pour; contrary to expectations', spanish: 'caer; volcar; verter; al contrario de lo esperado' },
  { character: '道歉', pinyin: 'dàoqiàn', english: 'apologize; make an apology', spanish: 'pedir disculpas; disculparse' },
  { character: '得意', pinyin: 'déyì', english: 'proud of oneself; complacent', spanish: 'orgulloso de sí mismo; complacido' },
  { character: '得', pinyin: 'de', english: '(complement particle)', spanish: 'partícula de complemento' },
  { character: '登机牌', pinyin: 'dēngjīpái', english: 'boarding pass', spanish: 'tarjeta de embarque' },
  { character: '等', pinyin: 'děng', english: 'to wait; rank; equal; etc.', spanish: 'esperar; rango; igual; etc.' },
  { character: '低', pinyin: 'dī', english: 'low; to lower (one\'s head); droop', spanish: 'bajo; bajar (la cabeza)' },
  { character: '底', pinyin: 'dǐ', english: 'bottom; background; base', spanish: 'fondo; base' },
  { character: '地点', pinyin: 'dìdiǎn', english: 'place; site; location', spanish: 'lugar; ubicación' },
  { character: '地球', pinyin: 'dìqiú', english: 'the Earth; planet', spanish: 'la Tierra; planeta' },
  { character: '地址', pinyin: 'dìzhǐ', english: 'address', spanish: 'dirección' },
  { character: '调查', pinyin: 'diàochá', english: 'investigate; survey; inquiry', spanish: 'investigar; encuesta' },
  { character: '掉', pinyin: 'diào', english: 'to drop; to fall', spanish: 'caer; dejar caer' },
  { character: '丢', pinyin: 'diū', english: 'lose (something); throw; put aside', spanish: 'perder; tirar; dejar de lado' },
  { character: '动作', pinyin: 'dòngzuò', english: 'movement; motion; action', spanish: 'movimiento; acción' },
  { character: '堵车', pinyin: 'dǔchē', english: 'traffic jam', spanish: 'atasco; embotellamiento' },
  { character: '肚子', pinyin: 'dùzi', english: 'belly; abdomen; stomach', spanish: 'vientre; abdomen; estómago' },
  { character: '短信', pinyin: 'duǎnxìn', english: 'text message; SMS', spanish: 'mensaje de texto; SMS' },
  { character: '对话', pinyin: 'duìhuà', english: 'dialogue; conversation', spanish: 'diálogo; conversación' }
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
console.log(`HSK4 batch 01 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
