const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '盖', pinyin: 'gài', english: 'lid; top; cover; to build', spanish: 'tapa; cubrir; construir' },
  { character: '概括', pinyin: 'gàikuò', english: 'summarize; generalize', spanish: 'resumir; generalizar' },
  { character: '概念', pinyin: 'gàiniàn', english: 'concept; idea', spanish: 'concepto; idea' },
  { character: '干脆', pinyin: 'gāncuì', english: 'straightforward; clear-cut; blunt', spanish: 'directo; tajante' },
  { character: '干燥', pinyin: 'gānzào', english: 'to dry (of paint, cement, etc.); dry; dryness', spanish: 'secar; seco; sequedad' },
  { character: '赶紧', pinyin: 'gǎnjǐn', english: 'at once; hurriedly; lose no time', spanish: 'rápidamente; enseguida' },
  { character: '赶快', pinyin: 'gǎnkuài', english: 'at once; immediately', spanish: 'de inmediato' },
  { character: '感激', pinyin: 'gǎnjī', english: 'appreciate; feel grateful', spanish: 'agradecer; sentirse agradecido' },
  { character: '感受', pinyin: 'gǎnshòu', english: 'feel; experience; emotion; impression', spanish: 'sentir; experiencia; impresión' },
  { character: '感想', pinyin: 'gǎnxiǎng', english: 'impressions; reflections; thoughts', spanish: 'impresiones; reflexiones' },
  { character: '干活儿', pinyin: 'gàn huór', english: 'do manual labor; to work', spanish: 'trabajar; hacer labores manuales' },
  { character: '钢铁', pinyin: 'gāngtiě', english: 'steel', spanish: 'acero' },
  { character: '高档', pinyin: 'gāodàng', english: 'top quality; first rate; high class', spanish: 'de alta gama; de primera' },
  { character: '高级', pinyin: 'gāojí', english: 'high-level; high-grade; advanced', spanish: 'avanzado; de alto nivel' },
  { character: '搞', pinyin: 'gǎo', english: 'do; make; be engaged in', spanish: 'hacer; dedicarse a' },
  { character: '告别', pinyin: 'gàobié', english: 'say goodbye to; to leave; to part', spanish: 'despedirse; separarse' },
  { character: '格外', pinyin: 'géwài', english: 'especially; additionally', spanish: 'especialmente; particularmente' },
  { character: '隔壁', pinyin: 'gébì', english: 'next door', spanish: 'al lado; pared de por medio' },
  { character: '个别', pinyin: 'gèbié', english: 'individual; specific; isolated; very few', spanish: 'individual; puntual; muy pocos' },
  { character: '个人', pinyin: 'gèrén', english: 'individual; personal; oneself', spanish: 'personal; individual; uno mismo' },
  { character: '个性', pinyin: 'gèxìng', english: 'individuality; personality', spanish: 'personalidad; individualidad' },
  { character: '各自', pinyin: 'gèzì', english: 'each; respective; apiece', spanish: 'cada uno; respectivamente' },
  { character: '根', pinyin: 'gēn', english: 'root; base; (mw for long, slender objects)', spanish: 'raíz; base; clasificador de objetos largos' },
  { character: '根本', pinyin: 'gēnběn', english: 'root; essence; fundamental; basic; (not) at all; simply', spanish: 'fundamental; en absoluto; esencia' },
  { character: '工厂', pinyin: 'gōngchǎng', english: 'factory', spanish: 'fábrica' },
  { character: '工程师', pinyin: 'gōngchéngshī', english: 'engineer', spanish: 'ingeniero' },
  { character: '工具', pinyin: 'gōngjù', english: 'tool; instrument; utensil', spanish: 'herramienta; utensilio' },
  { character: '工人', pinyin: 'gōngrén', english: 'worker', spanish: 'obrero; trabajador' },
  { character: '工业', pinyin: 'gōngyè', english: 'industry', spanish: 'industria' },
  { character: '公布', pinyin: 'gōngbù', english: 'make public; announce; publicize', spanish: 'publicar; anunciar' },
  { character: '公开', pinyin: 'gōngkāi', english: 'public; make public', spanish: 'público; hacer público' },
  { character: '公平', pinyin: 'gōngpíng', english: 'fair; impartial; just', spanish: 'justo; imparcial' },
  { character: '公寓', pinyin: 'gōngyù', english: 'apartment building', spanish: 'edificio de apartamentos' },
  { character: '公元', pinyin: 'gōngyuán', english: '(year) AD or CE; Christian era; common era', spanish: 'era común; d. C.' },
  { character: '公主', pinyin: 'gōngzhǔ', english: 'princess', spanish: 'princesa' },
  { character: '功能', pinyin: 'gōngnéng', english: 'function; feature', spanish: 'función; característica' },
  { character: '恭喜', pinyin: 'gōngxǐ', english: 'congratulate', spanish: 'felicitar; enhorabuena' },
  { character: '贡献', pinyin: 'gòngxiàn', english: 'contribute; dedicate; contribution', spanish: 'contribuir; aporte' },
  { character: '沟通', pinyin: 'gōutōng', english: 'link; connect; communicate', spanish: 'comunicar; conexión' },
  { character: '构成', pinyin: 'gòuchéng', english: 'to constitute; to compose', spanish: 'constituir; componer' },
  { character: '姑姑', pinyin: 'gūgu', english: 'paternal aunt; father\'s sister', spanish: 'tía paterna' },
  { character: '姑娘', pinyin: 'gūniang', english: 'young woman; girl', spanish: 'chica; joven' },
  { character: '古代', pinyin: 'gǔdài', english: 'ancient times', spanish: 'antigüedad; tiempos antiguos' },
  { character: '古典', pinyin: 'gǔdiǎn', english: 'classical', spanish: 'clásico' },
  { character: '股票', pinyin: 'gǔpiào', english: 'shares; stock (market)', spanish: 'acciones; bolsa' },
  { character: '骨头', pinyin: 'gǔtou', english: 'bone; moral character', spanish: 'hueso; carácter' },
  { character: '鼓舞', pinyin: 'gǔwǔ', english: 'inspire; heartening', spanish: 'inspirar; animar' },
  { character: '鼓掌', pinyin: 'gǔ zhǎng', english: 'applaud', spanish: 'aplaudir' },
  { character: '固定', pinyin: 'gùdìng', english: 'fixed; regular; stable', spanish: 'fijo; estable' },
  { character: '挂号', pinyin: 'guà hào', english: 'register; check into hospital; send by registered mail', spanish: 'registrarse; correo certificado' },
  { character: '乖', pinyin: 'guāi', english: '(of a child) obedient; well-behaved; clever; perverse; contrary to reason', spanish: 'obediente; bien portado' },
  { character: '拐弯', pinyin: 'guǎi wān', english: 'turn a corner; make a turn', spanish: 'doblar; girar' },
  { character: '怪不得', pinyin: 'guài bu de', english: 'no wonder; so that\'s why', spanish: 'con razón; no me extraña' },
  { character: '关闭', pinyin: 'guānbì', english: 'close; shut', spanish: 'cerrar' },
  { character: '观察', pinyin: 'guānchá', english: 'observe; to watch; to survey', spanish: 'observar' },
  { character: '观点', pinyin: 'guāndiǎn', english: 'point of view; standpoint', spanish: 'punto de vista' },
  { character: '观念', pinyin: 'guānniàn', english: 'notion; thought; concept', spanish: 'concepto; noción' },
  { character: '官', pinyin: 'guān', english: 'an official; organ; governmental', spanish: 'funcionario; oficial' },
  { character: '管子', pinyin: 'guǎnzi', english: 'tube; pipe; drinking straw', spanish: 'tubo; pajita' },
  { character: '冠军', pinyin: 'guànjūn', english: 'champion', spanish: 'campeón' },
  { character: '光滑', pinyin: 'guānghuá', english: 'glossy; sleek; smooth', spanish: 'liso; suave; pulido' },
  { character: '光临', pinyin: 'guānglín', english: '(polite) welcome!; honor somebody with one\'s presence', spanish: 'bienvenido (formal); honrar con su presencia' },
  { character: '光明', pinyin: 'guāngmíng', english: 'bright (future); promising; illuminate', spanish: 'luminoso; prometedor' },
  { character: '光盘', pinyin: 'guāngpán', english: 'CD (compact disc)', spanish: 'CD; disco óptico' },
  { character: '广场', pinyin: 'guǎngchǎng', english: 'public square; plaza', spanish: 'plaza' },
  { character: '广大', pinyin: 'guǎngdà', english: 'vast; extensive', spanish: 'amplio; vasto' },
  { character: '广泛', pinyin: 'guǎngfàn', english: 'extensive; wide ranging', spanish: 'amplio; extenso' },
  { character: '归纳', pinyin: 'guīnà', english: 'conclude from the facts; induce; sum up from the facts', spanish: 'inducir; resumir; concluir' },
  { character: '规矩', pinyin: 'guīju', english: 'rule; custom', spanish: 'regla; norma; costumbre' },
  { character: '规律', pinyin: 'guīlǜ', english: 'law (e.g. of science); regular pattern; discipline', spanish: 'ley; patrón; regularidad' },
  { character: '规模', pinyin: 'guīmó', english: 'scale; scope; extent', spanish: 'escala; magnitud' },
  { character: '规则', pinyin: 'guīzé', english: 'rule; law; regulation', spanish: 'regla; reglamento' },
  { character: '柜台', pinyin: 'guìtái', english: 'counter; bar; front desk', spanish: 'mostrador; ventanilla' },
  { character: '滚', pinyin: 'gǔn', english: 'to roll; get lost; to boil', spanish: 'rodar; hervir; lárgate' },
  { character: '锅', pinyin: 'guō', english: 'pot; pan; boiler', spanish: 'olla; sartén' },
  { character: '国庆节', pinyin: 'Guóqìng Jié', english: 'National Day', spanish: 'Día Nacional' },
  { character: '国王', pinyin: 'guówáng', english: 'king', spanish: 'rey' },
  { character: '果然', pinyin: 'guǒrán', english: 'really; sure enough; as expected', spanish: 'efectivamente; como era de esperar' },
  { character: '果实', pinyin: 'guǒshí', english: 'fruit; gains; results', spanish: 'fruto; resultado' },
  { character: '过分', pinyin: 'guòfèn', english: 'excessive; overly', spanish: 'excesivo; demasiado' },
  { character: '过敏', pinyin: 'guòmǐn', english: 'be allergic; allergy', spanish: 'ser alérgico; alergia' },
  { character: '过期', pinyin: 'guòqī', english: 'overdue; expire', spanish: 'caducar; vencido' },
  { character: '哈', pinyin: 'hā', english: 'exhale; sip; (sound of laughter)', spanish: 'ja; aspirar; sorber' },
  { character: '海关', pinyin: 'hǎiguān', english: 'customs (i.e. border inspection)', spanish: 'aduana' },
  { character: '海鲜', pinyin: 'hǎixiān', english: 'seafood', spanish: 'marisco; mariscos' },
  { character: '喊', pinyin: 'hǎn', english: 'call; cry; shout', spanish: 'gritar; llamar' },
  { character: '行业', pinyin: 'hángyè', english: 'industry; business', spanish: 'sector; industria' },
  { character: '豪华', pinyin: 'háohuá', english: 'luxurious', spanish: 'lujoso' },
  { character: '好客', pinyin: 'hàokè', english: 'hospitable; to enjoy having guests', spanish: 'hospitalario' },
  { character: '好奇', pinyin: 'hàoqí', english: 'curious', spanish: 'curioso' },
  { character: '合法', pinyin: 'héfǎ', english: 'lawful; legitimate; legal', spanish: 'legal; legítimo' },
  { character: '合理', pinyin: 'hélǐ', english: 'rational; reasonable', spanish: 'razonable' },
  { character: '合同', pinyin: 'hétong', english: 'contract', spanish: 'contrato' },
  { character: '合影', pinyin: 'héyǐng', english: 'joint photo; group photo', spanish: 'foto grupal' },
  { character: '合作', pinyin: 'hézuò', english: 'cooperate; collaborate; work together', spanish: 'cooperar; colaborar' },
  { character: '何必', pinyin: 'hébì', english: 'why should; there is no need to', spanish: 'no hace falta; para qué' },
  { character: '何况', pinyin: 'hékuàng', english: 'let alone; much less', spanish: 'y menos aún; ni que decir tiene' },
  { character: '和平', pinyin: 'hépíng', english: 'peace', spanish: 'paz' },
  { character: '核心', pinyin: 'héxīn', english: 'core; nucleus', spanish: 'núcleo; corazón' },
  { character: '恨', pinyin: 'hèn', english: 'to hate', spanish: 'odiar' }
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
console.log(`HSK5 batch 04 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
