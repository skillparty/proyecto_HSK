const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '对面', pinyin: 'duìmiàn', english: 'opposite; across from; the other side', spanish: 'enfrente; al otro lado' },
  { character: '对于', pinyin: 'duìyú', english: 'regarding; as far as sth. is concerned; with regards to; for', spanish: 'respecto a; en cuanto a' },
  { character: '儿童', pinyin: 'értóng', english: 'child; children', spanish: 'niño; infancia' },
  { character: '而', pinyin: 'ér', english: 'and; but; yet; while (Kangxi radical 126)', spanish: 'y; pero; mientras que' },
  { character: '发生', pinyin: 'fāshēng', english: 'happen; occur; take place', spanish: 'ocurrir; suceder' },
  { character: '发展', pinyin: 'fāzhǎn', english: 'develop; development; growth', spanish: 'desarrollar; desarrollo' },
  { character: '法律', pinyin: 'fǎlǜ', english: 'law; statute', spanish: 'ley; legislación' },
  { character: '翻译', pinyin: 'fānyì', english: 'translate; translation; interpret', spanish: 'traducir; traducción; interpretar' },
  { character: '烦恼', pinyin: 'fánnǎo', english: 'worried; vexed', spanish: 'preocupado; agobiado' },
  { character: '反对', pinyin: 'fǎnduì', english: 'oppose; fight against', spanish: 'oponerse a' },
  { character: '方法', pinyin: 'fāngfǎ', english: 'method; way; means', spanish: 'método; forma' },
  { character: '方面', pinyin: 'fāngmiàn', english: 'aspect; field; side', spanish: 'aspecto; ámbito' },
  { character: '方向', pinyin: 'fāngxiàng', english: 'direction; orientation', spanish: 'dirección' },
  { character: '房东', pinyin: 'fángdōng', english: 'landlord', spanish: 'casero; propietario' },
  { character: '放弃', pinyin: 'fàngqì', english: 'abandon; renounce; give up', spanish: 'abandonar; renunciar' },
  { character: '放暑假', pinyin: 'fàng shǔjià', english: 'have summer vacation', spanish: 'tener vacaciones de verano' },
  { character: '放松', pinyin: 'fàngsōng', english: 'relax; loosen; slacken', spanish: 'relajarse; aflojar' },
  { character: '份', pinyin: 'fèn', english: 'part; portion; (mw for documents, papers, jobs, etc.)', spanish: 'parte; porción; clasificador' },
  { character: '丰富', pinyin: 'fēngfù', english: 'rich; enrich; abundant; plentiful', spanish: 'abundante; enriquecer' },
  { character: '否则', pinyin: 'fǒuzé', english: 'if not; otherwise; or else', spanish: 'si no; de lo contrario' },
  { character: '符合', pinyin: 'fúhé', english: 'in keeping with; in accordance with; conform', spanish: 'ajustarse a; cumplir con' },
  { character: '父亲', pinyin: 'fùqin', english: 'father', spanish: 'padre' },
  { character: '付款', pinyin: 'fù kuǎn', english: 'to pay', spanish: 'pagar' },
  { character: '负责', pinyin: 'fùzé', english: 'responsible for (something); in charge of', spanish: 'ser responsable de' },
  { character: '复印', pinyin: 'fùyìn', english: 'photocopy; duplicate', spanish: 'fotocopiar; copia' },
  { character: '复杂', pinyin: 'fùzá', english: 'complicated; complex', spanish: 'complejo; complicado' },
  { character: '富', pinyin: 'fù', english: 'wealthy', spanish: 'rico; adinerado' },
  { character: '改变', pinyin: 'gǎibiàn', english: 'to change; alter; to transform', spanish: 'cambiar; transformar' },
  { character: '干杯', pinyin: 'gān bēi', english: 'to drink a toast; cheers!; bottoms up!', spanish: 'brindar; ¡salud!' },
  { character: '赶', pinyin: 'gǎn', english: 'catch up; overtake; drive away', spanish: 'alcanzar; darse prisa; ahuyentar' },
  { character: '敢', pinyin: 'gǎn', english: 'to dare', spanish: 'atreverse' },
  { character: '感动', pinyin: 'gǎndòng', english: 'be moved; to touch emotionally', spanish: 'conmover(se)' },
  { character: '感觉', pinyin: 'gǎnjué', english: 'to feel; become aware of; feeling', spanish: 'sentir; sensación' },
  { character: '感情', pinyin: 'gǎnqíng', english: 'feeling; emotion; sensation', spanish: 'sentimiento; emoción' },
  { character: '感谢', pinyin: 'gǎnxiè', english: 'thank; be grateful', spanish: 'agradecer; dar las gracias' },
  { character: '干', pinyin: 'gān', english: 'to concern; shield; dry; clean (Kangxi radical 51)', spanish: 'seco; limpio; hacer' },
  { character: '刚', pinyin: 'gāng', english: 'just (indicating the immediate past); recently; firm', spanish: 'justo; recién; firme' },
  { character: '高速公路', pinyin: 'gāosù gōnglù', english: 'highway', spanish: 'autopista' },
  { character: '胳膊', pinyin: 'gēbo', english: 'arm', spanish: 'brazo' },
  { character: '各', pinyin: 'gè', english: 'each; every', spanish: 'cada' },
  { character: '工资', pinyin: 'gōngzī', english: 'wages; pay; earnings; salary', spanish: 'salario; sueldo' },
  { character: '公里', pinyin: 'gōnglǐ', english: 'kilometer', spanish: 'kilómetro' },
  { character: '功夫', pinyin: 'gōngfu', english: 'kung fu; skill; art; labor', spanish: 'kung fu; habilidad; esfuerzo' },
  { character: '共同', pinyin: 'gòngtóng', english: 'together; common; joint', spanish: 'conjunto; en común' },
  { character: '购物', pinyin: 'gòuwù', english: 'go shopping; buy goods', spanish: 'ir de compras' },
  { character: '够', pinyin: 'gòu', english: 'enough; to reach', spanish: 'suficiente; alcanzar' },
  { character: '估计', pinyin: 'gūjì', english: 'appraise; estimate', spanish: 'estimar; cálculo' },
  { character: '鼓励', pinyin: 'gǔlì', english: 'encourage; inspire', spanish: 'animar; motivar' },
  { character: '故意', pinyin: 'gùyì', english: 'deliberately; intentional; on purpose', spanish: 'a propósito; deliberadamente' },
  { character: '顾客', pinyin: 'gùkè', english: 'customer; client', spanish: 'cliente' },
  { character: '挂', pinyin: 'guà', english: 'hang; put up; suspend', spanish: 'colgar' },
  { character: '关键', pinyin: 'guānjiàn', english: 'crucial; key; pivotal', spanish: 'clave; crucial' },
  { character: '观众', pinyin: 'guānzhòng', english: 'spectator; audience', spanish: 'espectador; audiencia' },
  { character: '管理', pinyin: 'guǎnlǐ', english: 'supervise; manage', spanish: 'gestionar; administrar' },
  { character: '光', pinyin: 'guāng', english: 'light; ray; bright; only; merely; used up', spanish: 'luz; rayo; solo' },
  { character: '广播', pinyin: 'guǎngbō', english: 'broadcast; on the air', spanish: 'radiodifusión; emitir' },
  { character: '广告', pinyin: 'guǎnggào', english: 'advertisement; a commercial', spanish: 'anuncio; publicidad' },
  { character: '逛', pinyin: 'guàng', english: 'to stroll; to visit; go window shopping', spanish: 'pasear; curiosear tiendas' },
  { character: '规定', pinyin: 'guīdìng', english: 'regulation; stipulate; fix; set', spanish: 'norma; estipular' },
  { character: '国籍', pinyin: 'guójí', english: 'nationality', spanish: 'nacionalidad' },
  { character: '国际', pinyin: 'guójì', english: 'international', spanish: 'internacional' },
  { character: '果汁', pinyin: 'guǒzhī', english: 'fruit juice', spanish: 'zumo de fruta' },
  { character: '过程', pinyin: 'guòchéng', english: 'course of events; process', spanish: 'proceso; transcurso' },
  { character: '海洋', pinyin: 'hǎiyáng', english: 'ocean', spanish: 'océano' },
  { character: '害羞', pinyin: 'hài xiū', english: 'blush; shy', spanish: 'tímido; avergonzarse' },
  { character: '寒假', pinyin: 'hánjià', english: 'winter vacation', spanish: 'vacaciones de invierno' },
  { character: '汗', pinyin: 'hàn', english: 'sweat; perspiration; Khan', spanish: 'sudor' },
  { character: '航班', pinyin: 'hángbān', english: 'scheduled flight; flight number', spanish: 'vuelo programado; número de vuelo' },
  { character: '好处', pinyin: 'hǎochu', english: 'benefit; advantage', spanish: 'beneficio; ventaja' },
  { character: '好像', pinyin: 'hǎoxiàng', english: 'as if; seem to be', spanish: 'parecer; como si' },
  { character: '号码', pinyin: 'hàomǎ', english: 'number', spanish: 'número' },
  { character: '合格', pinyin: 'hégé', english: 'qualified; up to standard', spanish: 'apto; conforme a estándar' },
  { character: '合适', pinyin: 'héshì', english: 'suitable; proper; appropriate', spanish: 'adecuado; apropiado' },
  { character: '盒子', pinyin: 'hézi', english: 'box', spanish: 'caja' },
  { character: '后悔', pinyin: 'hòuhuǐ', english: 'to regret; repent', spanish: 'arrepentirse' },
  { character: '厚', pinyin: 'hòu', english: 'thick (for flat things); generous', spanish: 'grueso; generoso' },
  { character: '互联网', pinyin: 'Hùliánwǎng', english: 'Internet', spanish: 'Internet' },
  { character: '互相', pinyin: 'hùxiāng', english: 'mutually; with each other', spanish: 'mutuamente; entre sí' },
  { character: '护士', pinyin: 'hùshi', english: 'nurse', spanish: 'enfermero; enfermera' },
  { character: '怀疑', pinyin: 'huáiyí', english: 'doubt; to suspect; be skeptical', spanish: 'dudar; sospechar' },
  { character: '回忆', pinyin: 'huíyì', english: 'to recall; recollect', spanish: 'recordar; recuerdo' },
  { character: '活动', pinyin: 'huódòng', english: 'activity; exercise; move about', spanish: 'actividad; moverse' },
  { character: '活泼', pinyin: 'huópo', english: 'lively; vivacious', spanish: 'vivaz; alegre' },
  { character: '火', pinyin: 'huǒ', english: 'fire (Kangxi radical 86)', spanish: 'fuego' },
  { character: '获得', pinyin: 'huòdé', english: 'obtain; acquire; to gain', spanish: 'obtener; conseguir' },
  { character: '积极', pinyin: 'jījí', english: 'active; positive; energetic', spanish: 'activo; positivo' },
  { character: '积累', pinyin: 'jīlěi', english: 'accumulate; accumulation', spanish: 'acumular; acumulación' },
  { character: '基础', pinyin: 'jīchǔ', english: 'base; foundation', spanish: 'base; fundamento' },
  { character: '激动', pinyin: 'jīdòng', english: 'excite; agitate', spanish: 'emocionar; alterarse' },
  { character: '及时', pinyin: 'jíshí', english: 'timely; in time; promptly; without delay', spanish: 'a tiempo; oportunamente' },
  { character: '即使', pinyin: 'jíshǐ', english: 'even if; even though', spanish: 'aunque; incluso si' },
  { character: '计划', pinyin: 'jìhuà', english: 'plan; project', spanish: 'plan; proyecto' },
  { character: '记者', pinyin: 'jìzhě', english: 'reporter; journalist', spanish: 'periodista; reportero' },
  { character: '技术', pinyin: 'jìshù', english: 'technology; technique; skill', spanish: 'tecnología; técnica' },
  { character: '既然', pinyin: 'jìrán', english: 'since; given that; now that', spanish: 'ya que; dado que' },
  { character: '继续', pinyin: 'jìxù', english: 'to continue; to go on; to proceed', spanish: 'continuar; seguir' },
  { character: '寄', pinyin: 'jì', english: 'send by mail', spanish: 'enviar por correo' },
  { character: '加班', pinyin: 'jiā bān', english: 'work overtime', spanish: 'hacer horas extra' },
  { character: '加油站', pinyin: 'jiāyóuzhàn', english: 'gas station', spanish: 'gasolinera' },
  { character: '家具', pinyin: 'jiājù', english: 'furniture', spanish: 'muebles' }
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
console.log(`HSK4 batch 02 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);