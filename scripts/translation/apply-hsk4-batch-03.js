const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '假', pinyin: 'jiǎ, jià', english: 'fake; if; borrow | vacation; holiday', spanish: 'falso; si; pedir prestado | vacaciones; festivo' },
  { character: '价格', pinyin: 'jiàgé', english: 'price', spanish: 'precio' },
  { character: '坚持', pinyin: 'jiānchí', english: 'persist in; persevere', spanish: 'persistir; perseverar' },
  { character: '减肥', pinyin: 'jiǎnféi', english: 'go on a diet; lose weight', spanish: 'ponerse a dieta; adelgazar' },
  { character: '减少', pinyin: 'jiǎnshǎo', english: 'reduce; to decrease', spanish: 'reducir; disminuir' },
  { character: '建议', pinyin: 'jiànyì', english: 'to propose; to suggest; recommend', spanish: 'proponer; sugerir; recomendar' },
  { character: '将来', pinyin: 'jiānglái', english: 'the future', spanish: 'el futuro' },
  { character: '奖金', pinyin: 'jiǎngjīn', english: 'bonus', spanish: 'bono; prima' },
  { character: '降低', pinyin: 'jiàngdī', english: 'reduce; to lower; to drop', spanish: 'reducir; bajar' },
  { character: '降落', pinyin: 'jiàngluò', english: 'descend; to land; put down', spanish: 'descender; aterrizar' },
  { character: '交', pinyin: 'jiāo', english: 'deliver; turn over; intersect; to pay (money); friendship', spanish: 'entregar; transferir; cruzarse; pagar; amistad' },
  { character: '交流', pinyin: 'jiāoliú', english: 'communicate; exchange; give and take; interaction; to alternate', spanish: 'comunicar; intercambiar; interacción' },
  { character: '交通', pinyin: 'jiāotōng', english: 'traffic; transportation', spanish: 'tráfico; transporte' },
  { character: '郊区', pinyin: 'jiāoqū', english: 'suburbs; outskirts', spanish: 'suburbios; afueras' },
  { character: '骄傲', pinyin: 'jiāo\'ào', english: 'proud; arrogant; conceited; take pride in', spanish: 'orgulloso; arrogante; enorgullecerse de' },
  { character: '饺子', pinyin: 'jiǎozi', english: 'dumpling; potsticker', spanish: 'empanadilla china; jiaozi' },
  { character: '教授', pinyin: 'jiàoshòu', english: 'professor; instruct; to lecture', spanish: 'profesor; instruir; dar clase' },
  { character: '教育', pinyin: 'jiàoyù', english: 'education', spanish: 'educación' },
  { character: '接受', pinyin: 'jiēshòu', english: 'accept; receive (honors, etc.)', spanish: 'aceptar; recibir' },
  { character: '接着', pinyin: 'jiēzhe', english: 'continue; carry on; to catch; follow', spanish: 'continuar; seguir' },
  { character: '节', pinyin: 'jié', english: 'section; part; festival; moral integrity; save; (mw for class periods)', spanish: 'sección; parte; festival; integridad; ahorrar; clasificador de clases' },
  { character: '节约', pinyin: 'jiéyuē', english: 'frugal; to save', spanish: 'ahorrar; frugal' },
  { character: '结果', pinyin: 'jiéguǒ', english: 'result; outcome; finally', spanish: 'resultado; finalmente' },
  { character: '解释', pinyin: 'jiěshì', english: 'to explain', spanish: 'explicar' },
  { character: '尽管', pinyin: 'jǐnguǎn', english: 'despite; although; even though | freely; without hesitation', spanish: 'a pesar de; aunque | libremente; sin dudar' },
  { character: '紧张', pinyin: 'jǐnzhāng', english: 'nervous; tension; strain', spanish: 'nervioso; tensión' },
  { character: '进行', pinyin: 'jìnxíng', english: 'carry on; carry out; undertake', spanish: 'llevar a cabo; realizar' },
  { character: '禁止', pinyin: 'jìnzhǐ', english: 'to ban; prohibit', spanish: 'prohibir' },
  { character: '京剧', pinyin: 'jīngjù', english: 'Beijing Opera', spanish: 'Ópera de Pekín' },
  { character: '经济', pinyin: 'jīngjì', english: 'economy; economic', spanish: 'economía; económico' },
  { character: '经历', pinyin: 'jīnglì', english: 'undergo; to experience', spanish: 'experimentar; pasar por' },
  { character: '经验', pinyin: 'jīngyàn', english: 'experience', spanish: 'experiencia' },
  { character: '精彩', pinyin: 'jīngcǎi', english: 'brilliant; spectacular; wonderful', spanish: 'brillante; espectacular; maravilloso' },
  { character: '景色', pinyin: 'jǐngsè', english: 'scenery; landscape; scene; view', spanish: 'paisaje; vista' },
  { character: '警察', pinyin: 'jǐngchá', english: 'police', spanish: 'policía' },
  { character: '竞争', pinyin: 'jìngzhēng', english: 'compete', spanish: 'competir' },
  { character: '竟然', pinyin: 'jìngrán', english: 'unexpectedly; to one\'s surprise; go so far as to', spanish: 'inesperadamente; para sorpresa de uno' },
  { character: '镜子', pinyin: 'jìngzi', english: 'mirror', spanish: 'espejo' },
  { character: '究竟', pinyin: 'jiūjìng', english: 'after all; when all is said and done; actually', spanish: 'al fin y al cabo; en realidad' },
  { character: '举', pinyin: 'jǔ', english: 'lift; raise; cite', spanish: 'levantar; alzar; citar' },
  { character: '举办', pinyin: 'jǔbàn', english: 'to conduct; to hold', spanish: 'organizar; celebrar' },
  { character: '举行', pinyin: 'jǔxíng', english: 'convene; to hold (a meeting, ceremony, etc.)', spanish: 'celebrar; llevar a cabo' },
  { character: '拒绝', pinyin: 'jùjué', english: 'to refuse; to decline; to reject', spanish: 'rechazar; negarse' },
  { character: '距离', pinyin: 'jùlí', english: 'distance; be apart; away from', spanish: 'distancia; estar separado de' },
  { character: '聚会', pinyin: 'jùhuì', english: 'hold a meeting; get together; a party', spanish: 'reunirse; fiesta; reunión' },
  { character: '开玩笑', pinyin: 'kāi wánxiào', english: 'joke; play a joke; make fun of', spanish: 'bromear; tomar el pelo' },
  { character: '开心', pinyin: 'kāixīn', english: 'feel happy; have a great time; make fun of somebody', spanish: 'estar contento; pasarlo bien' },
  { character: '看法', pinyin: 'kànfǎ', english: 'point of view; opinion', spanish: 'punto de vista; opinión' },
  { character: '考虑', pinyin: 'kǎolǜ', english: 'think over; consider', spanish: 'considerar; pensar detenidamente' },
  { character: '烤鸭', pinyin: 'kǎoyā', english: 'roast duck', spanish: 'pato asado' },
  { character: '科学', pinyin: 'kēxué', english: 'science; scientific knowledge', spanish: 'ciencia; conocimiento científico' },
  { character: '棵', pinyin: 'kē', english: '(mw for plants)', spanish: 'clasificador para plantas' },
  { character: '咳嗽', pinyin: 'késou', english: 'to cough', spanish: 'toser; tos' },
  { character: '可怜', pinyin: 'kělián', english: 'pitiful; poor; pathetic', spanish: 'lamentable; pobre; digno de lástima' },
  { character: '可是', pinyin: 'kěshì', english: 'but; however', spanish: 'pero; sin embargo' },
  { character: '可惜', pinyin: 'kěxī', english: 'it\'s a pity; regrettable; too bad', spanish: 'qué lástima; lamentable' },
  { character: '客厅', pinyin: 'kètīng', english: 'living room; parlor', spanish: 'sala de estar' },
  { character: '肯定', pinyin: 'kěndìng', english: 'sure; definite; affirm; approve', spanish: 'seguro; afirmar; aprobar' },
  { character: '空', pinyin: 'kōng, kòng', english: 'empty; sky | leave blank; leisure', spanish: 'vacío; cielo | dejar en blanco; tiempo libre' },
  { character: '空气', pinyin: 'kōngqì', english: 'air', spanish: 'aire' },
  { character: '恐怕', pinyin: 'kǒngpà', english: 'be afraid; to fear; I\'m afraid that...', spanish: 'temer; me temo que...' },
  { character: '苦', pinyin: 'kǔ', english: 'bitter; miserable', spanish: 'amargo; sufriente' },
  { character: '矿泉水', pinyin: 'kuàngquánshuǐ', english: 'mineral water', spanish: 'agua mineral' },
  { character: '困', pinyin: 'kùn', english: 'sleepy; surround; hard-pressed', spanish: 'somnoliento; rodear; en apuros' },
  { character: '困难', pinyin: 'kùnnan', english: 'difficulty; difficult; problem', spanish: 'dificultad; difícil; problema' },
  { character: '垃圾桶', pinyin: 'lājītǒng', english: 'garbage can', spanish: 'cubo de basura' },
  { character: '拉', pinyin: 'lā', english: 'to pull; to play (string instruments); to drag', spanish: 'tirar de; tocar (instrumentos de cuerda); arrastrar' },
  { character: '辣', pinyin: 'là', english: 'hot (spicy)', spanish: 'picante' },
  { character: '来不及', pinyin: 'lái bu jí', english: 'there\'s not enough time (to do something); it\'s too late', spanish: 'no llegar a tiempo; ser demasiado tarde' },
  { character: '来得及', pinyin: 'lái de jí', english: 'there\'s still time', spanish: 'llegar a tiempo; aún hay tiempo' },
  { character: '来自', pinyin: 'láizì', english: 'come from (a place)', spanish: 'venir de' },
  { character: '懒', pinyin: 'lǎn', english: 'lazy', spanish: 'perezoso' },
  { character: '浪费', pinyin: 'làngfèi', english: 'to waste; squander', spanish: 'malgastar; desperdiciar' },
  { character: '浪漫', pinyin: 'làngmàn', english: 'romantic', spanish: 'romántico' },
  { character: '老虎', pinyin: 'lǎohǔ', english: 'tiger', spanish: 'tigre' },
  { character: '冷静', pinyin: 'lěngjìng', english: 'calm; cool-headed; sober', spanish: 'calmado; sereno' },
  { character: '礼拜天', pinyin: 'lǐbàitiān', english: 'Sunday', spanish: 'domingo' },
  { character: '礼貌', pinyin: 'lǐmào', english: 'courtesy; politeness; manners', spanish: 'cortesía; educación' },
  { character: '理发', pinyin: 'lǐfà', english: 'a barber, hairdressing; haircut', spanish: 'cortar el pelo; peluquería' },
  { character: '理解', pinyin: 'lǐjiě', english: 'comprehend; understand', spanish: 'comprender; entender' },
  { character: '理想', pinyin: 'lǐxiǎng', english: 'ideal', spanish: 'ideal' },
  { character: '力气', pinyin: 'lìqi', english: 'physical strength; effort', spanish: 'fuerza física; esfuerzo' },
  { character: '厉害', pinyin: 'lìhai', english: 'terrible; formidable; fierce; cool; awesome', spanish: 'formidable; fuerte; impresionante' },
  { character: '例如', pinyin: 'lìrú', english: 'for example; for instance', spanish: 'por ejemplo' },
  { character: '俩', pinyin: 'liǎng', english: '(colloquial) two (people)', spanish: 'dos (personas, coloquial)' },
  { character: '连', pinyin: 'lián', english: 'even; including; join', spanish: 'incluso; incluyendo; conectar' },
  { character: '联系', pinyin: 'liánxì', english: 'integrate; link; connection; contact', spanish: 'conectar; vínculo; contacto' },
  { character: '凉快', pinyin: 'liángkuai', english: 'nice and cool; pleasantly cool', spanish: 'fresco; agradablemente fresco' },
  { character: '零钱', pinyin: 'língqián', english: 'small change (of money)', spanish: 'calderilla; cambio suelto' },
  { character: '另外', pinyin: 'lìngwài', english: 'another; in addition; besides', spanish: 'otro; además' },
  { character: '留', pinyin: 'liú', english: 'to leave (behind, a message); to retain; to stay', spanish: 'dejar; conservar; quedarse' },
  { character: '流利', pinyin: 'liúlì', english: 'fluent', spanish: 'fluido' },
  { character: '流行', pinyin: 'liúxíng', english: 'spread; prevalent; be popular', spanish: 'popular; ponerse de moda; difundirse' },
  { character: '旅行', pinyin: 'lǚxíng', english: 'travel', spanish: 'viajar; viaje' },
  { character: '律师', pinyin: 'lǜshī', english: 'lawyer', spanish: 'abogado' },
  { character: '乱', pinyin: 'luàn', english: 'disorder; confusion; arbitrarily', spanish: 'desorden; confusión; arbitrariamente' },
  { character: '麻烦', pinyin: 'máfan', english: 'trouble (someone); troubling; bothersome', spanish: 'molestia; problemático; molestar' },
  { character: '马虎', pinyin: 'mǎhu', english: 'careless; sloppy; casual', spanish: 'descuidado; chapucero' },
  { character: '满', pinyin: 'mǎn', english: 'full; abbreviation for Manchurian', spanish: 'lleno; abreviatura de manchú' },
  { character: '毛', pinyin: 'máo', english: 'hair; fur; feather; dime (Kangxi radical 82)', spanish: 'pelo; pelaje; pluma; diez centavos (mao)' }
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
console.log(`HSK4 batch 03 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
