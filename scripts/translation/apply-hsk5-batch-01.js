const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '哎', pinyin: 'āi', english: 'hey!; (interjection of surprise or dissatisfaction)', spanish: 'eh; ay (interjección de sorpresa o descontento)' },
  { character: '唉', pinyin: 'ài', english: '(an exclamation indicating resignation); oh well; oh; mm', spanish: 'ay; bueno; oh (resignación)' },
  { character: '爱护', pinyin: 'àihù', english: 'cherish; reassure; take good care of', spanish: 'cuidar; proteger; tratar con cariño' },
  { character: '爱惜', pinyin: 'àixī', english: 'cherish; treasure; use sparingly', spanish: 'valorar; cuidar; usar con moderación' },
  { character: '爱心', pinyin: 'àixīn', english: 'compassion', spanish: 'compasión; amor al prójimo' },
  { character: '安慰', pinyin: 'ānwèi', english: 'to comfort; to console', spanish: 'consolar; consuelo' },
  { character: '安装', pinyin: 'ānzhuāng', english: 'install; erect; to fix; to mount', spanish: 'instalar; montar; colocar' },
  { character: '岸', pinyin: 'àn', english: 'bank; shore; beach; coast', spanish: 'orilla; costa; ribera' },
  { character: '暗', pinyin: 'àn', english: 'dark; gloomy; hidden; secret', spanish: 'oscuro; sombrío; oculto; secreto' },
  { character: '熬夜', pinyin: 'áoyè', english: 'stay up very late or all night', spanish: 'trasnochar; quedarse despierto hasta tarde' },
  { character: '把握', pinyin: 'bǎwò', english: 'grasp; hold; certainty; assurance', spanish: 'dominar; captar; seguridad' },
  { character: '摆', pinyin: 'bǎi', english: 'to put (on); arrange; to sway; pendulum', spanish: 'colocar; disponer; balancear' },
  { character: '办理', pinyin: 'bànlǐ', english: 'to handle; to transact; to conduct', spanish: 'tramitar; gestionar' },
  { character: '傍晚', pinyin: 'bàngwǎn', english: 'in the evening; when night falls', spanish: 'atardecer; al anochecer' },
  { character: '包裹', pinyin: 'bāoguǒ', english: 'wrap up; bind up; package', spanish: 'envolver; paquete' },
  { character: '包含', pinyin: 'bāohán', english: 'contain; embody; include', spanish: 'contener; incluir' },
  { character: '包括', pinyin: 'bāokuò', english: 'comprise; include; consist of', spanish: 'incluir; abarcar' },
  { character: '薄', pinyin: 'báo', english: 'thin; flimsy; weak (first two pronunciations)', spanish: 'fino; delgado; débil' },
  { character: '宝贝', pinyin: 'bǎobèi', english: 'treasure; precious things; darling; baby', spanish: 'tesoro; cariño; bebé' },
  { character: '宝贵', pinyin: 'bǎoguì', english: 'valuable; precious; value', spanish: 'valioso; precioso' },
  { character: '保持', pinyin: 'bǎochí', english: 'to keep; maintain; to hold', spanish: 'mantener; conservar' },
  { character: '保存', pinyin: 'bǎocún', english: 'conserve; preserve; to keep, to save a file in a computer', spanish: 'guardar; conservar' },
  { character: '保留', pinyin: 'bǎoliú', english: 'to reserve; hold back; retain', spanish: 'reservar; retener; conservar' },
  { character: '保险', pinyin: 'bǎoxiǎn', english: 'insurance; insure; safe', spanish: 'seguro; asegurar; seguro (adj.)' },
  { character: '报到', pinyin: 'bàodào', english: 'report for duty; to check in; register', spanish: 'presentarse; registrarse' },
  { character: '报道', pinyin: 'bàodào', english: 'to report; news report', spanish: 'informar; reportaje' },
  { character: '报告', pinyin: 'bàogào', english: 'to report; make known; inform; speech; lecture', spanish: 'informar; informe; exposición' },
  { character: '报社', pinyin: 'bàoshè', english: 'newspaper office', spanish: 'redacción; oficina del periódico' },
  { character: '抱怨', pinyin: 'bàoyuàn', english: 'complain; grumble', spanish: 'quejarse; queja' },
  { character: '背', pinyin: 'bēi', english: 'carry on one\'s back; to bear', spanish: 'llevar a la espalda; cargar' },
  { character: '悲观', pinyin: 'bēiguān', english: 'pessimistic', spanish: 'pesimista' },
  { character: '背景', pinyin: 'bèijǐng', english: 'background', spanish: 'fondo; contexto; antecedentes' },
  { character: '被子', pinyin: 'bèizi', english: 'quilt; blanket', spanish: 'edredón; manta' },
  { character: '本科', pinyin: 'běnkē', english: 'undergraduate', spanish: 'grado universitario' },
  { character: '本领', pinyin: 'běnlǐng', english: 'skill; ability; capability', spanish: 'habilidad; capacidad' },
  { character: '本质', pinyin: 'běnzhì', english: 'essence; nature; innate character', spanish: 'esencia; naturaleza' },
  { character: '比例', pinyin: 'bǐlì', english: 'proportion; scale', spanish: 'proporción; escala' },
  { character: '彼此', pinyin: 'bǐcǐ', english: 'each other; one another', spanish: 'mutuamente; entre sí' },
  { character: '必然', pinyin: 'bìrán', english: 'inevitable; certain; necessary', spanish: 'inevitable; necesariamente' },
  { character: '必要', pinyin: 'bìyào', english: 'necessary; essential; indispensable', spanish: 'necesario; esencial' },
  { character: '毕竟', pinyin: 'bìjìng', english: 'after all; overall; when all is said and done', spanish: 'al fin y al cabo; después de todo' },
  { character: '避免', pinyin: 'bìmiǎn', english: 'avoid; avert; prevent', spanish: 'evitar; prevenir' },
  { character: '编辑', pinyin: 'biānjí', english: 'to edit; compile; editor', spanish: 'editar; compilar; editor' },
  { character: '鞭炮', pinyin: 'biānpào', english: 'firecracker; a long string of small firecrackers', spanish: 'petardo; ristra de petardos' },
  { character: '便', pinyin: 'biàn, pián', english: 'plain; convenient; excretion; formal equivalent to 就 | cheap', spanish: 'conveniente; entonces (formal); barato' },
  { character: '辩论', pinyin: 'biànlùn', english: 'argue; debate; argue over', spanish: 'debatir; debate' },
  { character: '标点', pinyin: 'biāodiǎn', english: 'punctuation; punctuation mark; punctuate', spanish: 'puntuación; signo de puntuación' },
  { character: '标志', pinyin: 'biāozhì', english: 'sign; mark; signal; symbol', spanish: 'señal; símbolo; marca' },
  { character: '表达', pinyin: 'biǎodá', english: 'to express; to voice; convey', spanish: 'expresar; transmitir' },
  { character: '表面', pinyin: 'biǎomiàn', english: 'surface; outside; face', spanish: 'superficie; apariencia' },
  { character: '表明', pinyin: 'biǎomíng', english: 'make clear; make known', spanish: 'dejar claro; indicar' },
  { character: '表情', pinyin: 'biǎoqíng', english: '(facial) expression; express one\'s feelings', spanish: 'expresión facial; expresar sentimientos' },
  { character: '表现', pinyin: 'biǎoxiàn', english: 'to show; to show off; display; performance', spanish: 'mostrar; desempeño; actuación' },
  { character: '冰激凌', pinyin: 'bīngjīlíng', english: 'ice cream', spanish: 'helado' },
  { character: '病毒', pinyin: 'bìngdú', english: 'virus', spanish: 'virus' },
  { character: '玻璃', pinyin: 'bōli', english: 'glass; nylon; plastic', spanish: 'vidrio; cristal; plástico' },
  { character: '播放', pinyin: 'bōfàng', english: 'broadcast; transmit', spanish: 'emitir; reproducir' },
  { character: '脖子', pinyin: 'bózi', english: 'neck', spanish: 'cuello' },
  { character: '博物馆', pinyin: 'bówùguǎn', english: 'museum', spanish: 'museo' },
  { character: '补充', pinyin: 'bǔchōng', english: 'replenish; to supplement; to complement', spanish: 'complementar; reponer' },
  { character: '不安', pinyin: 'bù\'ān', english: 'uneasy; unstable; disturbed', spanish: 'intranquilo; inquieto' },
  { character: '不得了', pinyin: 'bùdéliǎo', english: 'extremely; very; terribly; my god! (expression of surprise)', spanish: 'muy; tremendo; ¡madre mía!' },
  { character: '不断', pinyin: 'búduàn', english: 'unceasing; uninterrupted; continuously', spanish: 'incesante; continuamente' },
  { character: '不见得', pinyin: 'bújiàndé', english: 'not necessarily; not likely', spanish: 'no necesariamente' },
  { character: '不耐烦', pinyin: 'búnàifán', english: 'impatience; impatient', spanish: 'impaciente; impaciencia' },
  { character: '不然', pinyin: 'bùrán', english: 'otherwise; not so', spanish: 'si no; de lo contrario' },
  { character: '不如', pinyin: 'bùrú', english: 'not as good as; inferior to', spanish: 'no tan bueno como; inferior a' },
  { character: '不要紧', pinyin: 'bú yàojǐn', english: 'unimportant; not serious; it doesn\'t matter', spanish: 'no importa; no es grave' },
  { character: '不足', pinyin: 'bùzú', english: 'insufficient; not enough', spanish: 'insuficiente; no basta' },
  { character: '布', pinyin: 'bù', english: 'cloth; announce; to spread', spanish: 'tela; anunciar; extender' },
  { character: '步骤', pinyin: 'bùzhòu', english: 'step; move; measure; procedure', spanish: 'paso; procedimiento' },
  { character: '部门', pinyin: 'bùmén', english: 'department; branch; section', spanish: 'departamento; sección' },
  { character: '财产', pinyin: 'cáichǎn', english: 'property; fortune', spanish: 'propiedad; patrimonio' },
  { character: '采访', pinyin: 'cǎifǎng', english: 'interview; gather news; hunt for and collect', spanish: 'entrevistar; recopilar información' },
  { character: '采取', pinyin: 'cǎiqǔ', english: 'carry out or adopt; take(measures, policies, attitudes, etc.)', spanish: 'adoptar; tomar (medidas)' },
  { character: '彩虹', pinyin: 'cǎihóng', english: 'rainbow', spanish: 'arcoíris' },
  { character: '踩', pinyin: 'cǎi', english: 'step upon; to tread; to stamp', spanish: 'pisar; hollar' },
  { character: '参考', pinyin: 'cānkǎo', english: 'reference; consult', spanish: 'referencia; consultar' },
  { character: '参与', pinyin: 'cānyù', english: 'participate (in sth.); attach oneself to', spanish: 'participar (en); involucrarse' },
  { character: '惭愧', pinyin: 'cánkuì', english: 'ashamed', spanish: 'avergonzado' },
  { character: '操场', pinyin: 'cāochǎng', english: 'playground; sports field', spanish: 'patio; cancha deportiva' },
  { character: '操心', pinyin: 'cāo xīn', english: 'worry about', spanish: 'preocuparse por' },
  { character: '册', pinyin: 'cè', english: 'book; (mw for books)', spanish: 'libro; clasificador de libros' },
  { character: '测验', pinyin: 'cèyàn', english: 'test; exam; to test', spanish: 'prueba; examen; examinar' },
  { character: '曾经', pinyin: 'céngjīng', english: 'once; (refers to something that happened previously)', spanish: 'una vez; anteriormente' },
  { character: '叉子', pinyin: 'chāzi', english: 'fork; cross', spanish: 'tenedor' },
  { character: '差距', pinyin: 'chājù', english: 'disparity; gap; the difference (in distance; amount; progress; etc.)', spanish: 'brecha; diferencia' },
  { character: '插', pinyin: 'chā', english: 'to insert; stick in; pierce', spanish: 'insertar; meter; pinchar' },
  { character: '拆', pinyin: 'chāi', english: 'unravel; to tear; demolish', spanish: 'desmontar; deshacer; demoler' },
  { character: '产品', pinyin: 'chǎnpǐn', english: 'product; goods; merchandise', spanish: 'producto; mercancía' },
  { character: '产生', pinyin: 'chǎnshēng', english: 'to produce; emerge; to cause', spanish: 'producir; surgir; causar' },
  { character: '长途', pinyin: 'chángtú', english: 'long distance', spanish: 'larga distancia' },
  { character: '常识', pinyin: 'chángshí', english: 'common sense; general knowledge', spanish: 'sentido común; conocimientos generales' },
  { character: '抄', pinyin: 'chāo', english: 'to copy; plagiarize; search and confiscate', spanish: 'copiar; plagiar; requisar' },
  { character: '超级', pinyin: 'chāojí', english: 'super; transcending; high grade', spanish: 'súper; de alto nivel' },
  { character: '朝', pinyin: 'cháo', english: 'to face; towards; dynasty', spanish: 'hacia; de cara a; dinastía' },
  { character: '潮湿', pinyin: 'cháoshī', english: 'damp; moist; humid', spanish: 'húmedo' },
  { character: '吵', pinyin: 'chǎo', english: 'to quarrel; make noise', spanish: 'discutir; hacer ruido' },
  { character: '吵架', pinyin: 'chǎo jià', english: 'to quarrel; to squabble; bicker', spanish: 'pelearse; discutir' },
  { character: '炒', pinyin: 'chǎo', english: 'to stir-fry; saute', spanish: 'saltear; freír salteando' }
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
console.log(`HSK5 batch 01 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
