const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '熟悉', pinyin: 'shúxī', english: 'familiar with; know well', spanish: 'familiarizado con; conocer bien' },
  { character: '数量', pinyin: 'shùliàng', english: 'amount; quantity; number', spanish: 'cantidad; número' },
  { character: '数字', pinyin: 'shùzì', english: 'number; numeral; figure; digit', spanish: 'número; cifra; dígito' },
  { character: '帅', pinyin: 'shuài', english: 'handsome; graceful; commander-in-chief', spanish: 'guapo; elegante; comandante en jefe' },
  { character: '顺便', pinyin: 'shùnbiàn', english: 'conveniently; in passing; on the way', spanish: 'de paso; ya que estoy' },
  { character: '顺利', pinyin: 'shùnlì', english: 'go smoothly; without a hitch; successful', spanish: 'sin contratiempos; exitoso' },
  { character: '顺序', pinyin: 'shùnxù', english: 'sequence; order', spanish: 'secuencia; orden' },
  { character: '说明', pinyin: 'shuōmíng', english: 'explain; explanation; illustrate; to show', spanish: 'explicar; explicación; mostrar' },
  { character: '硕士', pinyin: 'shuòshì', english: "Master's degree (M.A.)", spanish: 'maestría; máster' },
  { character: '死', pinyin: 'sǐ', english: 'to die; dead; fixed; impassible; extremely', spanish: 'morir; muerto; rígido; extremadamente' },
  { character: '速度', pinyin: 'sùdù', english: 'speed; rate; velocity', spanish: 'velocidad; ritmo' },
  { character: '塑料袋', pinyin: 'sùliàodài', english: 'plastic bag', spanish: 'bolsa de plástico' },
  { character: '酸', pinyin: 'suān', english: 'sour; sore; ache', spanish: 'agrio; dolorido' },
  { character: '随便', pinyin: 'suíbiàn', english: 'as one pleases; informal; random; casual', spanish: 'como quieras; casual; informal' },
  { character: '随着', pinyin: 'suízhe', english: 'along with; in the wake of', spanish: 'a medida que; junto con' },
  { character: '孙子', pinyin: 'sūnzi', english: "grandson; son's son", spanish: 'nieto' },
  { character: '所有', pinyin: 'suǒyǒu', english: 'all; to have; to possess', spanish: 'todo; poseer' },
  { character: '台', pinyin: 'tái', english: 'platform; Taiwan (abbr.); desk; stage; typhoon; (mw for machines); (classical) you (in letters)', spanish: 'plataforma; Taiwán (abrev.); mesa; escenario; tifón; clasificador para máquinas' },
  { character: '抬', pinyin: 'tái', english: 'to lift; to raise (with both palms up); carry (together)', spanish: 'levantar; alzar; cargar entre varios' },
  { character: '态度', pinyin: 'tàidu', english: 'manner; bearing; attitude', spanish: 'actitud; manera' },
  { character: '谈', pinyin: 'tán', english: 'to talk; to chat; discuss', spanish: 'hablar; charlar; discutir' },
  { character: '弹钢琴', pinyin: 'tán gāngqín', english: 'play the piano', spanish: 'tocar el piano' },
  { character: '汤', pinyin: 'tāng', english: 'soup; broth', spanish: 'sopa; caldo' },
  { character: '糖', pinyin: 'táng', english: 'sugar; candy; sweets', spanish: 'azúcar; caramelo; dulces' },
  { character: '躺', pinyin: 'tǎng', english: 'recline; lie down (on back or side)', spanish: 'tumbarse; recostarse' },
  { character: '趟', pinyin: 'tàng, tāng', english: '(mw for trips times) | to wade', spanish: 'vez (clasificador de viajes) | vadear' },
  { character: '讨论', pinyin: 'tǎolùn', english: 'to discuss; discussion; to talk over', spanish: 'discutir; debate' },
  { character: '讨厌', pinyin: 'tǎoyàn', english: 'to hate; loathe; disgusting; troublesome', spanish: 'odiar; molesto; desagradable' },
  { character: '特点', pinyin: 'tèdiǎn', english: 'a characteristic; trait; feature', spanish: 'característica; rasgo' },
  { character: '提', pinyin: 'tí', english: 'to carry; to lift; to raise (an issue)', spanish: 'llevar en la mano; levantar; plantear' },
  { character: '提供', pinyin: 'tígōng', english: 'to supply; provide; furnish', spanish: 'proporcionar; suministrar' },
  { character: '提前', pinyin: 'tíqián', english: 'shift to an earlier date; bring forward; to advance', spanish: 'adelantar; anticipar' },
  { character: '提醒', pinyin: 'tíxǐng', english: 'remind; call attention to; warn of', spanish: 'recordar; avisar' },
  { character: '填空', pinyin: 'tiánkòng', english: 'fill in the blanks; fill a vacancy', spanish: 'rellenar espacios en blanco; cubrir una vacante' },
  { character: '条件', pinyin: 'tiáojiàn', english: 'condition; circumstances; prerequisite', spanish: 'condición; requisito; circunstancia' },
  { character: '停', pinyin: 'tíng', english: 'to stop; to halt; to park (a car)', spanish: 'parar; detener; estacionar' },
  { character: '挺', pinyin: 'tǐng', english: 'straighten up; stick out; rather (good); very', spanish: 'enderezar; sobresalir; bastante; muy' },
  { character: '通过', pinyin: 'tōngguò', english: 'by means of; through (a method); pass through; via', spanish: 'por medio de; a través de' },
  { character: '通知', pinyin: 'tōngzhī', english: 'notify; to inform; notice', spanish: 'notificar; informar; aviso' },
  { character: '同情', pinyin: 'tóngqíng', english: 'compassion; sympathy', spanish: 'compasión; simpatía' },
  { character: '同时', pinyin: 'tóngshí', english: 'at the same time; simultaneously', spanish: 'al mismo tiempo; simultáneamente' },
  { character: '推', pinyin: 'tuī', english: 'to push; to scrape; to decline; postpone; elect', spanish: 'empujar; raspar; rechazar; posponer; elegir' },
  { character: '推迟', pinyin: 'tuīchí', english: 'postpone; defer', spanish: 'posponer; aplazar' },
  { character: '脱', pinyin: 'tuō', english: 'to shed; take off; to escape', spanish: 'quitarse; desprenderse; escapar' },
  { character: '袜子', pinyin: 'wàzi', english: 'socks; stockings', spanish: 'calcetines; medias' },
  { character: '完全', pinyin: 'wánquán', english: 'complete; whole; totally', spanish: 'completo; totalmente' },
  { character: '网球', pinyin: 'wǎngqiú', english: 'tennis; tennis ball', spanish: 'tenis; pelota de tenis' },
  { character: '网站', pinyin: 'wǎngzhàn', english: 'website', spanish: 'sitio web' },
  { character: '往往', pinyin: 'wǎngwǎng', english: 'often; frequently; more often than not', spanish: 'a menudo; frecuentemente' },
  { character: '危险', pinyin: 'wēixiǎn', english: 'danger; dangerous; perilous', spanish: 'peligro; peligroso' },
  { character: '卫生间', pinyin: 'wèishēngjiān', english: 'restroom; bathroom; water closet (WC)', spanish: 'baño; aseo; WC' },
  { character: '味道', pinyin: 'wèidao', english: 'flavor; taste', spanish: 'sabor; gusto' },
  { character: '温度', pinyin: 'wēndù', english: 'temperature', spanish: 'temperatura' },
  { character: '文章', pinyin: 'wénzhāng', english: 'article; essay', spanish: 'artículo; ensayo' },
  { character: '污染', pinyin: 'wūrǎn', english: 'pollution; contamination', spanish: 'contaminación' },
  { character: '无', pinyin: 'wú', english: 'have not; without; not (Kangxi radical 71)', spanish: 'sin; no tener' },
  { character: '无聊', pinyin: 'wúliáo', english: 'nonsense; bored; silly; stupid', spanish: 'aburrido; tontería' },
  { character: '无论', pinyin: 'wúlùn', english: 'no matter what; regardless of whether...', spanish: 'sin importar; no importa si...' },
  { character: '误会', pinyin: 'wùhuì', english: 'to misunderstand; to mistake', spanish: 'malentender; malentendido' },
  { character: '西红柿', pinyin: 'xīhóngshì', english: 'tomato', spanish: 'tomate' },
  { character: '吸引', pinyin: 'xīyǐn', english: 'attract (interest, investment, etc.)', spanish: 'atraer' },
  { character: '咸', pinyin: 'xián', english: 'salty; salted; all', spanish: 'salado; todos (arcaico)' },
  { character: '现金', pinyin: 'xiànjīn', english: 'cash', spanish: 'efectivo' },
  { character: '羡慕', pinyin: 'xiànmù', english: 'to envy; admire', spanish: 'envidiar; admirar' },
  { character: '相反', pinyin: 'xiāngfǎn', english: 'opposite; contrary', spanish: 'opuesto; al contrario' },
  { character: '相同', pinyin: 'xiāngtóng', english: 'identical; same; alike', spanish: 'igual; idéntico' },
  { character: '香', pinyin: 'xiāng', english: 'fragrant; savory (Kangxi radical 186)', spanish: 'fragante; aromático' },
  { character: '详细', pinyin: 'xiángxì', english: 'detailed; in detail; minute', spanish: 'detallado; minucioso' },
  { character: '响', pinyin: 'xiǎng', english: 'make a sound; to ring; echo', spanish: 'sonar; hacer ruido; resonar' },
  { character: '橡皮', pinyin: 'xiàngpí', english: 'rubber; an eraser', spanish: 'goma; borrador' },
  { character: '消息', pinyin: 'xiāoxi', english: 'news; information', spanish: 'noticia; información' },
  { character: '小吃', pinyin: 'xiǎochī', english: 'snack; refreshments', spanish: 'aperitivo; tentempié' },
  { character: '小伙子', pinyin: 'xiǎohuǒzi', english: 'young man; lad; youngster', spanish: 'muchacho; joven' },
  { character: '小说', pinyin: 'xiǎoshuō', english: 'novel; fiction', spanish: 'novela; ficción' },
  { character: '笑话', pinyin: 'xiàohua', english: 'joke; laugh at', spanish: 'chiste; burlarse de' },
  { character: '效果', pinyin: 'xiàoguǒ', english: 'effect; result', spanish: 'efecto; resultado' },
  { character: '心情', pinyin: 'xīnqíng', english: 'mood; state of mind', spanish: 'estado de ánimo' },
  { character: '辛苦', pinyin: 'xīnkǔ', english: 'hard; exhausting; toilsome; laborious', spanish: 'duro; agotador; laborioso' },
  { character: '信封', pinyin: 'xìnfēng', english: 'envelope', spanish: 'sobre' },
  { character: '信息', pinyin: 'xìnxī', english: 'information; news; message', spanish: 'información; mensaje' },
  { character: '信心', pinyin: 'xìnxīn', english: 'confidence; faith (in sb. or sth.)', spanish: 'confianza; fe' },
  { character: '兴奋', pinyin: 'xīngfèn', english: 'excitement； be excited', spanish: 'emocionado; excitación' },
  { character: '行', pinyin: 'xíng', english: 'walk; be current; do; will do; okay', spanish: 'caminar; funcionar; vale; estar bien' },
  { character: '醒', pinyin: 'xǐng', english: 'wake up', spanish: 'despertarse' },
  { character: '幸福', pinyin: 'xìngfú', english: 'happy; blessed; fortunate', spanish: 'feliz; afortunado; felicidad' },
  { character: '性别', pinyin: 'xìngbié', english: 'gender; sex; sexual distinction', spanish: 'género; sexo' },
  { character: '性格', pinyin: 'xìnggé', english: 'nature; personality; temperament', spanish: 'carácter; personalidad; temperamento' },
  { character: '修理', pinyin: 'xiūlǐ', english: 'to repair; perform maintenance; to overhaul', spanish: 'reparar; hacer mantenimiento' },
  { character: '许多', pinyin: 'xǔduō', english: 'many; a lot; much', spanish: 'muchos; mucho' },
  { character: '学期', pinyin: 'xuéqī', english: 'semester; school term', spanish: 'semestre; periodo escolar' },
  { character: '压力', pinyin: 'yālì', english: 'pressure; stress', spanish: 'presión; estrés' },
  { character: '呀', pinyin: 'ya', english: 'ah; oh; (used for 啊 after words ending with a, e, i, o, or ü)', spanish: 'ah; oh; partícula exclamativa' },
  { character: '牙膏', pinyin: 'yágāo', english: 'toothpaste', spanish: 'pasta de dientes' },
  { character: '亚洲', pinyin: 'Yàzhōu', english: 'Asia', spanish: 'Asia' },
  { character: '严格', pinyin: 'yángé', english: 'strict; stringent; tight', spanish: 'estricto; riguroso' },
  { character: '严重', pinyin: 'yánzhòng', english: 'grave; serious; critical', spanish: 'grave; serio; crítico' },
  { character: '研究', pinyin: 'yánjiū', english: 'to study; to research', spanish: 'investigar; estudiar' },
  { character: '盐', pinyin: 'yán', english: 'salt', spanish: 'sal' },
  { character: '眼镜', pinyin: 'yǎnjìng', english: 'glasses; spectacles', spanish: 'gafas; lentes' },
  { character: '演出', pinyin: 'yǎnchū', english: 'to act (in a play); to perform; to put on a show; performance', spanish: 'actuar; presentar un espectáculo; función' }
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
console.log(`HSK4 batch 05 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
