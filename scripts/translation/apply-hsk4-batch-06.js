const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '演员', pinyin: 'yǎnyuán', english: 'actor or actress; performer', spanish: 'actor; actriz; intérprete' },
  { character: '阳光', pinyin: 'yángguāng', english: 'sunshine; sunlight', spanish: 'luz del sol; sol' },
  { character: '养成', pinyin: 'yǎngchéng', english: 'cultivate; acquire; to form', spanish: 'cultivar; adquirir; formar (hábito)' },
  { character: '样子', pinyin: 'yàngzi', english: 'manner; air; appearance; looks', spanish: 'apariencia; aspecto; manera' },
  { character: '邀请', pinyin: 'yāoqǐng', english: 'to invite', spanish: 'invitar; invitación' },
  { character: '要是', pinyin: 'yàoshi', english: 'if; suppose; in case', spanish: 'si; en caso de que' },
  { character: '钥匙', pinyin: 'yàoshi', english: 'key', spanish: 'llave' },
  { character: '也许', pinyin: 'yěxǔ', english: 'perhaps; probably; maybe', spanish: 'quizás; tal vez; probablemente' },
  { character: '叶子', pinyin: 'yèzi', english: 'leaves', spanish: 'hoja; hojas' },
  { character: '页', pinyin: 'yè', english: 'page; leaf (Kangxi radical 181)', spanish: 'página; hoja' },
  { character: '一切', pinyin: 'yíqiè', english: 'all; every; everything', spanish: 'todo; todo en general' },
  { character: '以', pinyin: 'yǐ', english: 'to use; according to; so as to; for; by', spanish: 'usar; según; para; por' },
  { character: '以为', pinyin: 'yǐwéi', english: 'think (mistakenly); consider (that); believe', spanish: 'creer (equivocadamente); pensar' },
  { character: '艺术', pinyin: 'yìshù', english: 'art', spanish: 'arte' },
  { character: '意见', pinyin: 'yìjiàn', english: 'opinion; view; suggestion; complaint', spanish: 'opinión; sugerencia; queja' },
  { character: '因此', pinyin: 'yīncǐ', english: 'therefore; thus; that is why; because of this', spanish: 'por lo tanto; por eso' },
  { character: '引起', pinyin: 'yǐnqǐ', english: 'give rise to; lead to; to cause; arouse', spanish: 'causar; provocar; suscitar' },
  { character: '印象', pinyin: 'yìnxiàng', english: 'impression', spanish: 'impresión' },
  { character: '赢', pinyin: 'yíng', english: 'to win; to beat; to profit', spanish: 'ganar; vencer; obtener beneficio' },
  { character: '应聘', pinyin: 'yìngpìn', english: 'accept a job offer; to apply for a job', spanish: 'postularse; aceptar una oferta de trabajo' },
  { character: '永远', pinyin: 'yǒngyuǎn', english: 'forever; eternal; always', spanish: 'siempre; para siempre' },
  { character: '勇敢', pinyin: 'yǒnggǎn', english: 'brave; courageous', spanish: 'valiente; valeroso' },
  { character: '优点', pinyin: 'yōudiǎn', english: 'merit; good point; a strength; a benefit', spanish: 'ventaja; punto fuerte; mérito' },
  { character: '优秀', pinyin: 'yōuxiù', english: 'outstanding; excellent', spanish: 'excelente; sobresaliente' },
  { character: '幽默', pinyin: 'yōumò', english: 'humorous', spanish: 'humorístico; con humor' },
  { character: '尤其', pinyin: 'yóuqí', english: 'especially; particularly', spanish: 'especialmente; en particular' },
  { character: '由', pinyin: 'yóu', english: 'follow; from; by; through', spanish: 'de; por; mediante' },
  { character: '由于', pinyin: 'yóuyú', english: 'due to; owing to; as a result of; thanks to', spanish: 'debido a; a causa de' },
  { character: '邮局', pinyin: 'yóujú', english: 'post office', spanish: 'oficina de correos' },
  { character: '友好', pinyin: 'yǒuhǎo', english: 'friendly (relations); close friends', spanish: 'amistoso; cordial' },
  { character: '友谊', pinyin: 'yǒuyì', english: 'friendship; companionship', spanish: 'amistad' },
  { character: '有趣', pinyin: 'yǒuqù', english: 'interesting; fascinating; amusing', spanish: 'interesante; divertido' },
  { character: '于是', pinyin: 'yúshì', english: 'as a result; thus; therefore', spanish: 'entonces; por lo tanto' },
  { character: '愉快', pinyin: 'yúkuài', english: 'happy; cheerful; delightful', spanish: 'feliz; agradable' },
  { character: '与', pinyin: 'yǔ', english: '(formal) and; to give; together with; participate; final particle expressing doubt or surprise', spanish: 'y (formal); con; participar' },
  { character: '羽毛球', pinyin: 'yǔmáoqiú', english: 'badminton', spanish: 'bádminton' },
  { character: '语法', pinyin: 'yǔfǎ', english: 'grammar', spanish: 'gramática' },
  { character: '语言', pinyin: 'yǔyán', english: 'language', spanish: 'idioma; lengua' },
  { character: '预习', pinyin: 'yùxí', english: '(of students) prepare a lesson before class; preview', spanish: 'preparar la lección; preestudiar' },
  { character: '原来', pinyin: 'yuánlái', english: 'original; former; as it turns out', spanish: 'original; antes; resulta que' },
  { character: '原谅', pinyin: 'yuánliàng', english: 'to excuse; forgive; to pardon', spanish: 'perdonar; disculpar' },
  { character: '原因', pinyin: 'yuányīn', english: 'cause; reason', spanish: 'causa; razón' },
  { character: '约会', pinyin: 'yuēhuì', english: 'appointment; engagement; date', spanish: 'cita; encuentro' },
  { character: '阅读', pinyin: 'yuèdú', english: 'read; reading', spanish: 'leer; lectura' },
  { character: '云', pinyin: 'yún', english: 'cloud; Yunnan province | say; speak', spanish: 'nube; Yunnan | decir; hablar' },
  { character: '允许', pinyin: 'yǔnxǔ', english: 'to permit; allow', spanish: 'permitir; autorizar' },
  { character: '杂志', pinyin: 'zázhì', english: 'magazine', spanish: 'revista' },
  { character: '咱们', pinyin: 'zánmen', english: 'we (including the listener); us; our', spanish: 'nosotros (incluyéndote)' },
  { character: '暂时', pinyin: 'zànshí', english: 'temporary; transient; for the moment', spanish: 'temporalmente; por ahora' },
  { character: '脏', pinyin: 'zāng', english: 'filthy; dirty', spanish: 'sucio' },
  { character: '责任', pinyin: 'zérèn', english: 'responsibility; blame; duty', spanish: 'responsabilidad; deber; culpa' },
  { character: '增加', pinyin: 'zēngjiā', english: 'to increase; to raise; add', spanish: 'aumentar; incrementar; añadir' },
  { character: '占线', pinyin: 'zhànxiàn', english: 'the (phone) line is busy', spanish: 'línea ocupada' },
  { character: '招聘', pinyin: 'zhāopìn', english: 'recruitment; take job applications for a job', spanish: 'reclutar; contratación' },
  { character: '照', pinyin: 'zhào', english: 'to shine; illuminate; according to', spanish: 'iluminar; según' },
  { character: '真正', pinyin: 'zhēnzhèng', english: 'genuine; real; true', spanish: 'verdadero; real' },
  { character: '整理', pinyin: 'zhěnglǐ', english: 'put in order; arrange; straighten up; to tidy; to pack (luggage)', spanish: 'ordenar; arreglar; hacer la maleta' },
  { character: '正常', pinyin: 'zhèngcháng', english: 'normal; regular; ordinary', spanish: 'normal; regular' },
  { character: '正好', pinyin: 'zhènghǎo', english: 'just (in time); just right; just enough; happen to; by chance', spanish: 'justo; justo a tiempo; casualmente' },
  { character: '正确', pinyin: 'zhèngquè', english: 'correct; proper', spanish: 'correcto; adecuado' },
  { character: '正式', pinyin: 'zhèngshì', english: 'formal; official', spanish: 'formal; oficial' },
  { character: '证明', pinyin: 'zhèngmíng', english: 'proof; testify; confirm; certificate', spanish: 'probar; demostrar; certificado' },
  { character: '之', pinyin: 'zhī', english: '(literary equivalent to 的); (pronoun); of', spanish: 'partícula literaria equivalente a 的' },
  { character: '支持', pinyin: 'zhīchí', english: 'sustain; hold out; | support; stand by (e.g. international support)', spanish: 'sostener; apoyar; respaldar' },
  { character: '知识', pinyin: 'zhīshi', english: 'knowledge; intellectual', spanish: 'conocimiento' },
  { character: '直接', pinyin: 'zhíjiē', english: 'direct; immediate', spanish: 'directo; inmediato' },
  { character: '值得', pinyin: 'zhíde', english: 'be worth; deserve', spanish: 'valer la pena; merecer' },
  { character: '职业', pinyin: 'zhíyè', english: 'profession; occupation', spanish: 'profesión; ocupación' },
  { character: '植物', pinyin: 'zhíwù', english: 'plant; botanical; vegetation', spanish: 'planta; vegetal' },
  { character: '只好', pinyin: 'zhǐhǎo', english: 'have to; be forced to', spanish: 'no tener más remedio que' },
  { character: '只要', pinyin: 'zhǐyào', english: 'so long as; if only; provided that', spanish: 'con tal de que; siempre que' },
  { character: '指', pinyin: 'zhǐ', english: 'finger; to point (at, to, out); refer to', spanish: 'dedo; señalar; referirse a' },
  { character: '至少', pinyin: 'zhìshǎo', english: 'at least; (to say the) least', spanish: 'al menos' },
  { character: '质量', pinyin: 'zhìliàng', english: 'quality; mass (physics)', spanish: 'calidad; masa (física)' },
  { character: '重', pinyin: 'zhòng', english: 'heavy; serious; important', spanish: 'pesado; serio; importante' },
  { character: '重点', pinyin: 'zhòngdiǎn', english: 'emphasis; main point', spanish: 'punto clave; énfasis' },
  { character: '重视', pinyin: 'zhòngshì', english: 'to value; take seriously', spanish: 'valorar; tomar en serio' },
  { character: '周围', pinyin: 'zhōuwéi', english: 'surroundings; vicinity; environment', spanish: 'alrededores; entorno' },
  { character: '主意', pinyin: 'zhǔyi', english: 'plan; idea; decision', spanish: 'idea; plan; decisión' },
  { character: '祝贺', pinyin: 'zhùhè', english: 'congratulate', spanish: 'felicitar; felicitación' },
  { character: '著名', pinyin: 'zhùmíng', english: 'famous; well-known; celebration', spanish: 'famoso; reconocido' },
  { character: '专门', pinyin: 'zhuānmén', english: 'specialized', spanish: 'especializado; expresamente' },
  { character: '专业', pinyin: 'zhuānyè', english: 'profession; specialized field of study; major', spanish: 'especialidad; profesión; carrera' },
  { character: '转', pinyin: 'zhuǎn, zhuàn', english: 'to turn; to change; pass on | revolve; rotate', spanish: 'girar; cambiar; transferir | rotar' },
  { character: '赚', pinyin: 'zhuàn', english: 'earn; make a profit', spanish: 'ganar; obtener beneficio' },
  { character: '准确', pinyin: 'zhǔnquè', english: 'accurate; precise', spanish: 'preciso; exacto' },
  { character: '准时', pinyin: 'zhǔnshí', english: 'punctually; on time', spanish: 'puntualmente; a tiempo' },
  { character: '仔细', pinyin: 'zǐxì', english: 'careful; attentive; cautious', spanish: 'cuidadoso; atento' },
  { character: '自然', pinyin: 'zìrán', english: 'nature; natural', spanish: 'naturaleza; natural' },
  { character: '自信', pinyin: 'zìxìn', english: 'self-confidence', spanish: 'confianza en uno mismo' },
  { character: '总结', pinyin: 'zǒngjié', english: 'summarize; conclude', spanish: 'resumir; concluir' },
  { character: '租', pinyin: 'zū', english: 'to rent', spanish: 'alquilar' },
  { character: '最好', pinyin: 'zuìhǎo', english: 'the best; had better ...; it would be best', spanish: 'lo mejor; será mejor que' },
  { character: '尊重', pinyin: 'zūnzhòng', english: 'esteem; to respect; to value; to honor', spanish: 'respetar; respeto; honrar' },
  { character: '左右', pinyin: 'zuǒyòu', english: 'about; approximate; around | left and right', spanish: 'aproximadamente | izquierda y derecha' },
  { character: '作家', pinyin: 'zuòjiā', english: 'author; writer', spanish: 'autor; escritor' },
  { character: '作用', pinyin: 'zuòyòng', english: 'action; activity; effect', spanish: 'efecto; función; acción' },
  { character: '作者', pinyin: 'zuòzhě', english: 'author; writer', spanish: 'autor; escritor' },
  { character: '座', pinyin: 'zuò', english: '(mw for mountains, bridges, tall buildings, etc.); | seat; base; stand; constellation', spanish: 'clasificador de montañas/puentes/edificios | asiento; base; constelación' },
  { character: '座位', pinyin: 'zuòwèi', english: 'seat; place', spanish: 'asiento; plaza' }
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
console.log(`HSK4 batch 06 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
