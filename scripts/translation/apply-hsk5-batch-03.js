const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const englishPath = path.join(root, 'assets/data/hsk_vocabulary.json');
const spanishPath = path.join(root, 'assets/data/hsk_vocabulary_spanish.json');

const english = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
const spanish = JSON.parse(fs.readFileSync(spanishPath, 'utf8'));

const normalize = (value) => String(value || '').replace(/^\uFEFF/, '').trim();

const translations = [
  { character: '导致', pinyin: 'dǎozhì', english: 'lead to; bring about; to cause', spanish: 'conducir a; causar' },
  { character: '岛屿', pinyin: 'dǎoyǔ', english: 'islands', spanish: 'islas' },
  { character: '倒霉', pinyin: 'dǎoméi', english: 'have bad luck; be out of luck', spanish: 'tener mala suerte' },
  { character: '到达', pinyin: 'dàodá', english: 'to reach; arrive', spanish: 'llegar' },
  { character: '道德', pinyin: 'dàodé', english: 'morals; morality; ethics', spanish: 'moral; ética' },
  { character: '道理', pinyin: 'dàolǐ', english: 'reason; sense; argument', spanish: 'razón; lógica' },
  { character: '登记', pinyin: 'dēngjì', english: 'register (one\'s name); check in; enroll', spanish: 'registrar; hacer check-in' },
  { character: '等待', pinyin: 'děngdài', english: 'to wait (for); expect', spanish: 'esperar' },
  { character: '等于', pinyin: 'děngyú', english: '(Mathematics) equal to', spanish: 'igual a' },
  { character: '滴', pinyin: 'dī', english: 'to drip; drop; (mw for drops of liquid)', spanish: 'gotear; gota' },
  { character: '的确', pinyin: 'díquè', english: 'really; indeed', spanish: 'realmente; en efecto' },
  { character: '敌人', pinyin: 'dírén', english: 'enemy', spanish: 'enemigo' },
  { character: '地道', pinyin: 'dìdao', english: 'authentic; genuine; (-dào: tunnel)', spanish: 'auténtico; genuino' },
  { character: '地理', pinyin: 'dìlǐ', english: 'geography', spanish: 'geografía' },
  { character: '地区', pinyin: 'dìqū', english: 'an area; a region; a district', spanish: 'región; zona; distrito' },
  { character: '地毯', pinyin: 'dìtǎn', english: 'carpet; rug', spanish: 'alfombra' },
  { character: '地位', pinyin: 'dìwèi', english: 'position; status', spanish: 'posición; estatus' },
  { character: '地震', pinyin: 'dìzhèn', english: 'earthquake', spanish: 'terremoto' },
  { character: '递', pinyin: 'dì', english: 'hand over; to pass; to give', spanish: 'pasar; entregar' },
  { character: '点心', pinyin: 'diǎnxin', english: 'dim sum; light refreshments; snacks', spanish: 'tentempié; dim sum' },
  { character: '电池', pinyin: 'diànchí', english: 'battery', spanish: 'batería; pila' },
  { character: '电台', pinyin: 'diàntái', english: 'transceiver; broadcasting station', spanish: 'emisora; estación de radio' },
  { character: '钓', pinyin: 'diào', english: 'to fish', spanish: 'pescar' },
  { character: '顶', pinyin: 'dǐng', english: 'top; roof; carry on one\'s head; prop up; to butt; (mw for headwear, i.e. hats)', spanish: 'cima; techo; sostener; clasificador de sombreros' },
  { character: '动画片', pinyin: 'dònghuàpiàn', english: 'animated film', spanish: 'película de animación' },
  { character: '冻', pinyin: 'dòng', english: 'to freeze', spanish: 'congelar; helarse' },
  { character: '洞', pinyin: 'dòng', english: 'cave; hole', spanish: 'cueva; agujero' },
  { character: '豆腐', pinyin: 'dòufu', english: 'tofu; bean curd', spanish: 'tofu' },
  { character: '逗', pinyin: 'dòu', english: 'to tease; amuse; to stay; to stop; funny', spanish: 'bromear; divertir' },
  { character: '独立', pinyin: 'dúlì', english: 'independent', spanish: 'independiente' },
  { character: '独特', pinyin: 'dútè', english: 'unique; distinctive', spanish: 'único; distintivo' },
  { character: '度过', pinyin: 'dùguò', english: 'spend; to pass', spanish: 'pasar (tiempo)' },
  { character: '断', pinyin: 'duàn', english: 'to break; decide; absolutely (usually negative)', spanish: 'romper; decidir' },
  { character: '堆', pinyin: 'duī', english: 'pile; heap; stack; crowd', spanish: 'montón; pila' },
  { character: '对比', pinyin: 'duìbǐ', english: 'compare; to contrast; comparison', spanish: 'comparar; contraste' },
  { character: '对待', pinyin: 'duìdài', english: 'to treat', spanish: 'tratar' },
  { character: '对方', pinyin: 'duìfāng', english: 'counterpart; the other party involved', spanish: 'la otra parte; contraparte' },
  { character: '对手', pinyin: 'duìshǒu', english: 'opponent; adversary; match', spanish: 'oponente; rival' },
  { character: '对象', pinyin: 'duìxiàng', english: 'target; object; partner; boyfriend or girlfriend', spanish: 'objeto; objetivo; pareja' },
  { character: '兑换', pinyin: 'duìhuàn', english: 'to exchange; to convert (currencies)', spanish: 'cambiar; convertir (moneda)' },
  { character: '吨', pinyin: 'dūn', english: 'ton', spanish: 'tonelada' },
  { character: '蹲', pinyin: 'dūn', english: 'to crouch; to squat', spanish: 'agacharse; ponerse en cuclillas' },
  { character: '顿', pinyin: 'dùn', english: 'pause; arrange; stamp feet; suddenly; (mw for meals)', spanish: 'pausa; de repente; clasificador de comidas' },
  { character: '多亏', pinyin: 'duōkuī', english: 'thanks to; luckily', spanish: 'gracias a; por suerte' },
  { character: '多余', pinyin: 'duōyú', english: 'unnecessary; superfluous', spanish: 'innecesario; superfluo' },
  { character: '朵', pinyin: 'duǒ', english: '(mw for flowers and clouds)', spanish: 'clasificador para flores y nubes' },
  { character: '躲藏', pinyin: 'duǒcáng', english: 'hide oneself; take cover', spanish: 'esconderse; ocultarse' },
  { character: '恶劣', pinyin: 'èliè', english: 'vile; horrible', spanish: 'pésimo; horrible' },
  { character: '耳环', pinyin: 'ěrhuán', english: 'earring', spanish: 'pendiente; arete' },
  { character: '发表', pinyin: 'fābiǎo', english: 'publish; to issue (a statement); announce', spanish: 'publicar; anunciar' },
  { character: '发愁', pinyin: 'fā chóu', english: 'worry about sth.', spanish: 'preocuparse por algo' },
  { character: '发达', pinyin: 'fādá', english: 'developed (country, etc.); flourishing; prosper', spanish: 'desarrollado; próspero' },
  { character: '发抖', pinyin: 'fādǒu', english: 'to shiver; to shudder; tremble', spanish: 'temblar; tiritar' },
  { character: '发挥', pinyin: 'fāhuī', english: 'to bring (skill, talent, etc.) into play; to develop (an idea)', spanish: 'desplegar; desarrollar' },
  { character: '发明', pinyin: 'fāmíng', english: 'invent', spanish: 'inventar; invento' },
  { character: '发票', pinyin: 'fāpiào', english: 'receipt or bill for purchase; invoice', spanish: 'factura; comprobante' },
  { character: '发言', pinyin: 'fāyán', english: 'make a speech; statement', spanish: 'intervenir; declaración' },
  { character: '罚款', pinyin: 'fákuǎn', english: 'fine; penalty (monetary)', spanish: 'multa' },
  { character: '法院', pinyin: 'fǎyuàn', english: 'court of law', spanish: 'tribunal; corte' },
  { character: '翻', pinyin: 'fān', english: 'to turn over; capsize; translate', spanish: 'voltear; traducir' },
  { character: '繁荣', pinyin: 'fánróng', english: 'prosperous; prosperity; booming (economy)', spanish: 'prosperidad; próspero' },
  { character: '反而', pinyin: 'fǎn\'ér', english: 'on the contrary; instead', spanish: 'al contrario; en cambio' },
  { character: '反复', pinyin: 'fǎnfù', english: 'repeatedly; over and over', spanish: 'repetidamente; una y otra vez' },
  { character: '反应', pinyin: 'fǎnyìng', english: 'react; respond; reply', spanish: 'reaccionar; respuesta' },
  { character: '反映', pinyin: 'fǎnyìng', english: 'reflect; reflection; report on', spanish: 'reflejar; reflejo; informar sobre' },
  { character: '反正', pinyin: 'fǎnzhèng', english: 'anyway', spanish: 'de todos modos' },
  { character: '范围', pinyin: 'fànwéi', english: 'scope; range; limits; extent', spanish: 'alcance; rango; ámbito' },
  { character: '方', pinyin: 'fāng', english: 'square; direction; side (Kangxi radical 70)', spanish: 'cuadrado; dirección; lado' },
  { character: '方案', pinyin: 'fāng\'àn', english: 'plan; program (for action, etc.); proposal', spanish: 'plan; propuesta' },
  { character: '方式', pinyin: 'fāngshì', english: 'way; style; fashion; manner', spanish: 'modo; forma; manera' },
  { character: '妨碍', pinyin: 'fáng\'ài', english: 'hinder; to hamper; to obstruct', spanish: 'obstaculizar; impedir' },
  { character: '仿佛', pinyin: 'fǎngfú', english: 'to seem as though; as if', spanish: 'como si; parecer' },
  { character: '非', pinyin: 'fēi', english: 'non-; un-; not be; wrongdoing; simply must (Kangxi radical 175)', spanish: 'no; anti-; tener que' },
  { character: '肥皂', pinyin: 'féizào', english: 'soap', spanish: 'jabón' },
  { character: '废话', pinyin: 'fèihuà', english: 'nonsense; rubbish', spanish: 'tontería; disparate' },
  { character: '分别', pinyin: 'fēnbié', english: 'distinguish; split up; difference; to part', spanish: 'distinguir; separarse; diferencia' },
  { character: '分布', pinyin: 'fēnbù', english: 'be distributed (over an area); be scattered', spanish: 'distribuirse; dispersarse' },
  { character: '分配', pinyin: 'fēnpèi', english: 'distribute; assign; allocate', spanish: 'asignar; distribuir' },
  { character: '分手', pinyin: 'fēnshǒu', english: 'part company; break up', spanish: 'romper; separarse' },
  { character: '分析', pinyin: 'fēnxī', english: 'analyze; analysis', spanish: 'analizar; análisis' },
  { character: '纷纷', pinyin: 'fēnfēn', english: 'one after another; in succession; in profusion; diverse; pell-mell', spanish: 'uno tras otro; en masa' },
  { character: '奋斗', pinyin: 'fèndòu', english: 'strive; to struggle', spanish: 'luchar; esforzarse' },
  { character: '风格', pinyin: 'fēnggé', english: 'style', spanish: 'estilo' },
  { character: '风景', pinyin: 'fēngjǐng', english: 'scenery; landscape', spanish: 'paisaje' },
  { character: '风俗', pinyin: 'fēngsú', english: 'social custom', spanish: 'costumbre social' },
  { character: '风险', pinyin: 'fēngxiǎn', english: 'risk; venture; hazard', spanish: 'riesgo' },
  { character: '疯狂', pinyin: 'fēngkuáng', english: 'crazy; madness; wild; extreme popularity; insane; frenzied; unbridled', spanish: 'loco; frenético; desenfrenado' },
  { character: '讽刺', pinyin: 'fěngcì', english: 'satirize; ridicule; mock; irony', spanish: 'satirizar; ironía; burlarse' },
  { character: '否定', pinyin: 'fǒudìng', english: 'negate; negative', spanish: 'negar; negativo' },
  { character: '否认', pinyin: 'fǒurèn', english: 'deny; declare to be untrue', spanish: 'negar' },
  { character: '扶', pinyin: 'fú', english: 'to support with hand; to help somebody up', spanish: 'sostener; ayudar a levantarse' },
  { character: '服装', pinyin: 'fúzhuāng', english: '(formal) clothing; costume; dress', spanish: 'vestimenta; ropa; atuendo' },
  { character: '幅', pinyin: 'fú', english: 'width of cloth; size; (mw for pictures, paintings, textiles)', spanish: 'ancho; tamaño; clasificador de cuadros' },
  { character: '辅导', pinyin: 'fǔdǎo', english: 'to coach; to tutor; give advice (in study)', spanish: 'tutorizar; orientar' },
  { character: '妇女', pinyin: 'fùnǚ', english: 'woman; women in general', spanish: 'mujer; mujeres' },
  { character: '复制', pinyin: 'fùzhì', english: 'duplicate; reproduce', spanish: 'copiar; reproducir' },
  { character: '改革', pinyin: 'gǎigé', english: 'to reform', spanish: 'reformar; reforma' },
  { character: '改进', pinyin: 'gǎijìn', english: 'improve; make better', spanish: 'mejorar' },
  { character: '改善', pinyin: 'gǎishàn', english: 'improve; make better', spanish: 'mejorar' },
  { character: '改正', pinyin: 'gǎizhèng', english: 'to correct; amend', spanish: 'corregir; enmendar' }
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
console.log(`HSK5 batch 03 applied. Updated=${updated}, Inserted=${inserted}, Total=${spanish.length}`);
