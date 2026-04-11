const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '车库', pinyin: 'chēkù', english: 'garage', spanish: 'garaje' },
  { character: '车厢', pinyin: 'chēxiāng', english: 'carriage; railroad car', spanish: 'vagón; coche de tren' },
  { character: '彻底', pinyin: 'chèdǐ', english: 'thorough; complete; completely', spanish: 'completo; totalmente; a fondo' },
  { character: '沉默', pinyin: 'chénmò', english: 'silent; uncommunicative', spanish: 'silencioso; callado' },
  { character: '趁', pinyin: 'chèn', english: 'avail oneself of; take advantage of (an opportunity or situation)', spanish: 'aprovechar (una oportunidad)' },
  { character: '称', pinyin: 'chēng', english: 'weigh; to call; be called', spanish: 'pesar; llamar; denominar' },
  { character: '称呼', pinyin: 'chēnghu', english: 'to call; address as; name', spanish: 'llamar; dirigirse a; tratamiento' },
  { character: '称赞', pinyin: 'chēngzàn', english: 'to praise; to acclaim', spanish: 'elogiar; alabar' },
  { character: '成分', pinyin: 'chéngfèn', english: 'ingredient; composition', spanish: 'ingrediente; composición' },
  { character: '成果', pinyin: 'chéngguǒ', english: 'result; achievement; gain', spanish: 'resultado; logro' },
  { character: '成就', pinyin: 'chéngjiù', english: 'accomplishment; achievement; success', spanish: 'logro; éxito' },
  { character: '成立', pinyin: 'chénglì', english: 'establish; to set up', spanish: 'establecer; fundar' },
  { character: '成人', pinyin: 'chéngrén', english: 'adult; to grow up; become full-grown', spanish: 'adulto; hacerse mayor' },
  { character: '成熟', pinyin: 'chéngshú', english: 'mature; ripe', spanish: 'maduro' },
  { character: '成语', pinyin: 'chéngyǔ', english: 'idiom; proverb', spanish: 'modismo; frase hecha' },
  { character: '成长', pinyin: 'chéngzhǎng', english: 'to mature; grow up', spanish: 'crecer; madurar' },
  { character: '诚恳', pinyin: 'chéngkěn', english: 'honest; sincere', spanish: 'sincero; honesto' },
  { character: '承担', pinyin: 'chéngdān', english: 'undertake; assume (responsibility)', spanish: 'asumir; encargarse de' },
  { character: '承认', pinyin: 'chéngrèn', english: 'to admit; concede; acknowledge', spanish: 'admitir; reconocer' },
  { character: '承受', pinyin: 'chéngshòu', english: 'to bear; support; endure; sustain', spanish: 'soportar; aguantar' },
  { character: '程度', pinyin: 'chéngdù', english: 'degree; extent; level', spanish: 'grado; nivel' },
  { character: '程序', pinyin: 'chéngxù', english: 'procedure; sequence; program', spanish: 'procedimiento; programa' },
  { character: '吃亏', pinyin: 'chīkuī', english: 'suffer losses; get the worst of', spanish: 'salir perdiendo; sufrir pérdidas' },
  { character: '池塘', pinyin: 'chítáng', english: 'pool; pond', spanish: 'estanque' },
  { character: '迟早', pinyin: 'chízǎo', english: 'sooner or later', spanish: 'tarde o temprano' },
  { character: '持续', pinyin: 'chíxù', english: 'continue; persist', spanish: 'continuar; persistir' },
  { character: '尺子', pinyin: 'chǐzi', english: 'ruler (measuring instrument)', spanish: 'regla (de medir)' },
  { character: '翅膀', pinyin: 'chìbǎng', english: 'wing', spanish: 'ala' },
  { character: '冲', pinyin: 'chōng', english: 'to rush; to clash; to rinse; thoroughfare', spanish: 'apresurarse; chocar; enjuagar' },
  { character: '充电器', pinyin: 'chōngdiànqì', english: 'battery charger', spanish: 'cargador' },
  { character: '充分', pinyin: 'chōngfèn', english: 'full; abundant; ample', spanish: 'suficiente; abundante' },
  { character: '充满', pinyin: 'chōngmǎn', english: 'brimming with; very full', spanish: 'lleno de; rebosante de' },
  { character: '重复', pinyin: 'chóngfù', english: 'to repeat; to duplicate', spanish: 'repetir; duplicar' },
  { character: '宠物', pinyin: 'chǒngwù', english: 'a pet', spanish: 'mascota' },
  { character: '抽屉', pinyin: 'chōuti', english: 'drawer', spanish: 'cajón' },
  { character: '抽象', pinyin: 'chōuxiàng', english: 'abstract; abstraction', spanish: 'abstracto; abstracción' },
  { character: '丑', pinyin: 'chǒu', english: 'ugly; disgraceful (2nd Earthly Branch)', spanish: 'feo; vergonzoso' },
  { character: '臭', pinyin: 'chòu', english: 'stench; stink', spanish: 'mal olor; apestar' },
  { character: '出版', pinyin: 'chūbǎn', english: 'publish', spanish: 'publicar' },
  { character: '出口', pinyin: 'chūkǒu', english: 'exit; speak; export', spanish: 'salida; exportar' },
  { character: '出色', pinyin: 'chūsè', english: 'remarkable; outstanding; excellent', spanish: 'sobresaliente; excelente' },
  { character: '出示', pinyin: 'chūshì', english: 'to show', spanish: 'mostrar; presentar' },
  { character: '出席', pinyin: 'chūxí', english: 'attend; be present; participate', spanish: 'asistir; estar presente' },
  { character: '初级', pinyin: 'chūjí', english: 'junior; primary', spanish: 'inicial; básico' },
  { character: '除非', pinyin: 'chúfēi', english: 'only if; unless', spanish: 'a menos que; solo si' },
  { character: '除夕', pinyin: 'chúxī', english: 'Lunar New Year\'s Eve', spanish: 'Nochevieja lunar' },
  { character: '处理', pinyin: 'chǔlǐ', english: 'deal with; to process; sell at a discount; to treat (by a special process)', spanish: 'tratar; procesar; gestionar' },
  { character: '传播', pinyin: 'chuánbō', english: 'propagate; to spread', spanish: 'difundir; propagar' },
  { character: '传染', pinyin: 'chuánrǎn', english: 'infect; be contagious', spanish: 'contagiar; ser contagioso' },
  { character: '传说', pinyin: 'chuánshuō', english: 'it is said; legend; pass on (a story)', spanish: 'se dice que; leyenda' },
  { character: '传统', pinyin: 'chuántǒng', english: 'tradition; traditional', spanish: 'tradición; tradicional' },
  { character: '窗帘', pinyin: 'chuānglián', english: 'window curtain', spanish: 'cortina' },
  { character: '闯', pinyin: 'chuǎng', english: 'rush; break through; to temper oneself (by battling difficulties)', spanish: 'irrumpir; abrirse paso' },
  { character: '创造', pinyin: 'chuàngzào', english: 'create; bring about; creativity', spanish: 'crear; creatividad' },
  { character: '吹', pinyin: 'chuī', english: 'to blow; to blast; to puff', spanish: 'soplar' },
  { character: '词汇', pinyin: 'cíhuì', english: 'vocabulary', spanish: 'vocabulario' },
  { character: '辞职', pinyin: 'cízhí', english: 'resign from a position', spanish: 'renunciar (a un puesto)' },
  { character: '此外', pinyin: 'cǐwài', english: 'besides; in addition; moreover', spanish: 'además; aparte de eso' },
  { character: '次要', pinyin: 'cìyào', english: 'secondary; less important', spanish: 'secundario; menos importante' },
  { character: '刺激', pinyin: 'cìjī', english: 'exciting; provoke; irritate', spanish: 'estimular; provocar; emocionante' },
  { character: '匆忙', pinyin: 'cōngmáng', english: 'hasty; hurried', spanish: 'apurado; apresurado' },
  { character: '从此', pinyin: 'cóngcǐ', english: 'from now on; since then', spanish: 'desde entonces; de ahora en adelante' },
  { character: '从而', pinyin: 'cóng\'ér', english: 'thus; thereby; as a result', spanish: 'así; por consiguiente' },
  { character: '从前', pinyin: 'cóngqián', english: 'previously; formerly; in the past', spanish: 'antes; antiguamente' },
  { character: '从事', pinyin: 'cóngshì', english: 'go for; engage in; deal with', spanish: 'dedicarse a; ocuparse de' },
  { character: '粗糙', pinyin: 'cūcāo', english: 'coarse', spanish: 'áspero; tosco' },
  { character: '促进', pinyin: 'cùjìn', english: 'promote (an idea or cause); to advance', spanish: 'promover; impulsar' },
  { character: '促使', pinyin: 'cùshǐ', english: 'to urge; impel; to cause; to push', spanish: 'impulsar; hacer que' },
  { character: '醋', pinyin: 'cù', english: 'vinegar', spanish: 'vinagre' },
  { character: '催', pinyin: 'cuī', english: 'to press; to urge; to hurry', spanish: 'apremiar; instar' },
  { character: '存在', pinyin: 'cúnzài', english: 'to exist; to be', spanish: 'existir' },
  { character: '措施', pinyin: 'cuòshī', english: 'measure; step (to be taken)', spanish: 'medida; acción' },
  { character: '答应', pinyin: 'dāying', english: 'to respond; to promise; to answer; agree', spanish: 'responder; prometer; aceptar' },
  { character: '达到', pinyin: 'dá dào', english: 'achieve; attain; to reach', spanish: 'alcanzar; lograr' },
  { character: '打工', pinyin: 'dǎgōng', english: 'work a part time job; (regional) do manual labor; do odd jobs', spanish: 'trabajar (temporalmente); hacer trabajos ocasionales' },
  { character: '打交道', pinyin: 'dǎ jiāodao', english: 'come into contact with; to deal with', spanish: 'tratar con; relacionarse con' },
  { character: '打喷嚏', pinyin: 'dǎpēntì', english: 'to sneeze', spanish: 'estornudar' },
  { character: '打听', pinyin: 'dǎting', english: 'ask about; inquire about', spanish: 'averiguar; preguntar por' },
  { character: '大方', pinyin: 'dàfang', english: 'generous; poise; (-fang1: expert; scholar)', spanish: 'generoso; elegante' },
  { character: '大厦', pinyin: 'dàshà', english: 'large building; edifice; mansion', spanish: 'edificio grande; inmueble' },
  { character: '大象', pinyin: 'dàxiàng', english: 'elephant', spanish: 'elefante' },
  { character: '大型', pinyin: 'dàxíng', english: 'large-scale; wide-scale', spanish: 'a gran escala' },
  { character: '呆', pinyin: 'dāi', english: 'stupid; foolish; blank; dumbstruck; to stay', spanish: 'tonto; aturdido; quedarse' },
  { character: '代表', pinyin: 'dàibiǎo', english: 'represent; to delegate', spanish: 'representar; representante' },
  { character: '代替', pinyin: 'dàitì', english: 'to replace', spanish: 'reemplazar; sustituir' },
  { character: '贷款', pinyin: 'dài kuǎn', english: '(bank) loan; provide a loan', spanish: 'préstamo; conceder un préstamo' },
  { character: '待遇', pinyin: 'dàiyù', english: 'treatment; pay; wage; salary', spanish: 'trato; remuneración; salario' },
  { character: '担任', pinyin: 'dānrèn', english: 'hold the post of; serve as', spanish: 'ocupar el cargo de; desempeñarse como' },
  { character: '单纯', pinyin: 'dānchún', english: 'simple; pure; merely', spanish: 'simple; puro; meramente' },
  { character: '单调', pinyin: 'dāndiào', english: 'monotonous; dull', spanish: 'monótono; aburrido' },
  { character: '单独', pinyin: 'dāndú', english: 'alone', spanish: 'solo; por separado' },
  { character: '单位', pinyin: 'dānwèi', english: 'unit; work unit', spanish: 'unidad; centro de trabajo' },
  { character: '单元', pinyin: 'dānyuán', english: 'unit; entrance number; staircase (for residential buildings)', spanish: 'unidad; bloque; portal' },
  { character: '耽误', pinyin: 'dānwu', english: 'to delay; waste time', spanish: 'retrasar; perder tiempo' },
  { character: '胆小鬼', pinyin: 'dǎnxiǎoguǐ', english: 'coward', spanish: 'cobarde' },
  { character: '淡', pinyin: 'dàn', english: 'diluted; weak; thin', spanish: 'suave; diluido; ligero' },
  { character: '当地', pinyin: 'dāngdì', english: 'local', spanish: 'local' },
  { character: '当心', pinyin: 'dāngxīn', english: 'take care; watch out', spanish: 'ten cuidado; ojo' },
  { character: '挡', pinyin: 'dǎng', english: 'to block; hinder; gear; equipment', spanish: 'bloquear; obstaculizar' },
  { character: '导演', pinyin: 'dǎoyǎn', english: 'to direct; director', spanish: 'dirigir; director' }
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
console.log(`HSK5 batch 02 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
