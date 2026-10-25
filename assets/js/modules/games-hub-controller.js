// games-hub-controller.js — Controlador del Salón de Juegos Arcade HSK (Confuc10++)

class GamesHubController {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.activeFilter = "all";
    this.searchTerm = "";

    this.gamesList = [
      {
        id: "tones-invaders",
        tabId: "tones-invaders",
        title: "Invasores de Tonos",
        titleEn: "Tones Invaders",
        titleRu: "Захватчики тонов",
        titleTh: "ยานรบฝึกวรรณยุกต์",
        hanzi: "声调战机",
        category: "tones",
        levels: "HSK 1 - 6",
        skill: "Tonos & Oído",
        skillEn: "Tones & Listening",
        skillRu: "Тоны и слух",
        skillTh: "เสียงวรรณยุกต์และการฟัง",
        desc: "Destruye caracteres espaciales reconociendo su tono fonético (1º al 5º tono). ¡Pon a prueba tus reflejos auditivos!",
        descEn: "Shoot falling space characters by identifying their correct phonetic tone (1st to 5th tone). Test your auditory reflexes!",
        descRu: "Сбивайте падающие иероглифы, определяя их верный тон (с 1 по 5). Проверьте свою слуховую реакцию!",
        descTh: "ยิงทำลายตัวอักษรที่ตกลงมาโดยระบุเสียงวรรณยุกต์ที่ถูกต้อง (เสียง 1 ถึง 5) ทดสอบการฟังและความไว!",
        modes: ["HSK 1-6", "Fácil / Normal / Difícil", "Teclado [1-5] o Táctil"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))",
        iconColor: "#ef4444",
        scoreKey: "tonesInvadersHighScore"
      },
      {
        id: "snake-quantifiers",
        tabId: "snake-quantifiers",
        title: "Viborita de Clasificadores",
        titleEn: "Quantifier Snake",
        titleRu: "Змейка счетных слов",
        titleTh: "งูกินคำลักษณนาม",
        hanzi: "量词贪吃蛇",
        category: "grammar",
        levels: "HSK 1 - 3",
        skill: "Clasificadores & Gramática",
        skillEn: "Classifiers & Grammar",
        skillRu: "Счетные слова и грамматика",
        skillTh: "ลักษณนามและไวยากรณ์",
        desc: "Conduce la serpiente hacia sustantivos compatibles con el clasificador objetivo. ¡Incluye modo Versus para 2 jugadores!",
        descEn: "Guide the snake to hunt nouns that match the active classifier. Includes 2-player local Versus mode!",
        descRu: "Управляйте змейкой, собирая существительные, подходящие к текущему счетному слову. Есть режим дуэли для 2 игроков!",
        descTh: "บังคับงูให้กินคำนามที่ตรงกับลักษณนามเป้าหมาย มีโหมดประลอง 2 คนในเครื่องเดียว!",
        modes: ["1P Solo", "2P Versus (WASD + Flechas)", "Fácil / Normal / Difícil"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a4 4 0 0 0 4 4h2a2 2 0 0 1 2 2v2"></path><path d="M8 22a4 4 0 0 1-4-4c0-1.5.8-2.8 2-3.5V12a4 4 0 0 0-4-4H0"></path><circle cx="12" cy="5" r="1"></circle></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
        iconColor: "#10b981",
        scoreKey: "snakeHighScore"
      },
      {
        id: "hanzi-builder",
        tabId: "hanzi-builder",
        title: "Constructor de Hanzi",
        titleEn: "Hanzi Builder",
        titleRu: "Конструктор иероглифов",
        titleTh: "สร้างตัวอักษรจีน",
        hanzi: "汉字拼图",
        category: "radicals",
        levels: "HSK 1 - 6",
        skill: "Radicales & Anatomía",
        skillEn: "Radicals & Anatomy",
        skillRu: "Ключи и анатомия",
        skillTh: "หมวดนำและโครงสร้างอักษร",
        desc: "Ensambla caracteres chinos seleccionando sus componentes y radicales en el orden de trazo correcto bajo presión.",
        descEn: "Assemble Chinese characters by picking their radical components in stroke order before the countdown expires.",
        descRu: "Собирайте иероглифы из базовых радикалов и ключей в правильном порядке за отведенное время.",
        descTh: "ประกอบตัวอักษรจีนจากหมวดนำและส่วนประกอบย่อยตามลำดับให้ทันเวลา",
        modes: ["Contrarreloj 60s", "Filtro HSK 1-6", "Feedback háptico"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))",
        iconColor: "#3b82f6",
        scoreKey: "hanziBuilderHighScore"
      },
      {
        id: "word-linker",
        tabId: "word-linker",
        title: "Conector de Palabras",
        titleEn: "Word Linker",
        titleRu: "Соединитель слов",
        titleTh: "เชื่อมคำศัพท์ HSK",
        hanzi: "词语连线",
        category: "vocab",
        levels: "HSK 1 - 6",
        skill: "Vocabulario Compuesto",
        skillEn: "Compound Vocabulary",
        skillRu: "Словарный запас",
        skillTh: "คำศัพท์ประสม",
        desc: "Sopa de letras interactiva: localiza y une caracteres adyacentes para formar palabras HSK de dos sílabas.",
        descEn: "Word search grid: link paired characters to form valid two-syllable HSK vocabulary terms.",
        descRu: "Интерактивный поиск слов: соединяйте соседние иероглифы в устойчивые двусложные слова HSK.",
        descTh: "ตารางค้นหาคำ: เชื่อมโยงตัวอักษรที่อยู่ติดกันเพื่อสร้างคำศัพท์ HSK สองพยางค์",
        modes: ["Contrarreloj 90s", "Pistas de Audio", "Soporte HSK 1-6"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))",
        iconColor: "#ec4899",
        scoreKey: "wordLinkerHighScore"
      },
      {
        id: "sentence-builder",
        tabId: "sentence-builder",
        title: "Constructor de Oraciones",
        titleEn: "Sentence Builder",
        titleRu: "Мастер предложений",
        titleTh: "สร้างประโยคภาษาจีน",
        hanzi: "造句大师",
        category: "grammar",
        levels: "HSK 1 - 6",
        skill: "Sintaxis & Estructura",
        skillEn: "Syntax & Sentence Order",
        skillRu: "Синтаксис и порядок слов",
        skillTh: "ไวยากรณ์และเรียงประโยค",
        desc: "Arrastra u ordena bloques de palabras para formar oraciones coherentes según las reglas de sintaxis del mandarín.",
        descEn: "Arrange scrambled word blocks into natural Mandarin sentences following Chinese word-order rules.",
        descRu: "Расставляйте блоки слов в правильном синтаксическом порядке китайского языка.",
        descTh: "จัดเรียงบล็อกคำศัพท์ให้เป็นประโยคภาษาจีนที่ถูกต้องตามหลักไวยากรณ์",
        modes: ["Práctica Libre", "Contrarreloj 60s", "Racha de aciertos"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))",
        iconColor: "#f59e0b",
        scoreKey: "sentenceBuilderHighScore"
      },
      {
        id: "hanzi-mahjong",
        tabId: "hanzi-mahjong",
        title: "Mahjong de Hanzi",
        titleEn: "Hanzi Mahjong",
        titleRu: "Маджонг иероглифов",
        titleTh: "ไพ่นกกระจอกอักษรจีน",
        hanzi: "汉字麻将",
        category: "radicals",
        levels: "HSK 1 - 6",
        skill: "Memoria & Emparejamiento",
        skillEn: "Tile Pairing & Memory",
        skillRu: "Парные плитки и память",
        skillTh: "จับคู่และฝึกความจำ",
        desc: "Empareja fichas tradicionales combinando radicales complementarios o palabras compuestas antes de que se agote el tiempo.",
        descEn: "Match traditional tiles by combining complementary radicals or compound words under timed pressure.",
        descRu: "Собирайте пары традиционных фишек маджонга, соединяя родственные ключи или части слов.",
        descTh: "จับคู่แผ่นไพ่นกกระจอกจีนโบราณโดยรวมหมวดนำที่เข้ากันหรือคำประสม",
        modes: ["Radicales (部首)", "Palabras HSK (词语)", "Fácil / Normal / Maestro"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))",
        iconColor: "#0ea5e9",
        scoreKey: "mahjongHighScore"
      },
      {
        id: "matrix",
        tabId: "matrix",
        title: "Lluvia Digital Hanzi",
        titleEn: "Hanzi Matrix Rain",
        titleRu: "Матрица иероглифов",
        titleTh: "ฝนดิจิทัลอักษรจีน",
        hanzi: "汉字雨",
        category: "vocab",
        levels: "HSK 1 - 6",
        skill: "Lectura Rápida & Audición",
        skillEn: "Speed Reading & Audio",
        skillRu: "Скорочтение и аудио",
        skillTh: "การอ่านเร็วและฟังเสียง",
        desc: "Cascada cibernética de caracteres chinos con síntesis de voz en tiempo real y selector de velocidad para lectura rápida.",
        descEn: "Cyberpunk digital cascade of Chinese characters with real-time speech synthesis and speed regulation.",
        descRu: "Киберпанк-водопад иероглифов с озвучкой в реальном времени и регулировкой скорости чтения.",
        descTh: "สายฝนตัวอักษรจีนสไตล์ไซเบอร์พังก์พร้อมเสียงอ่านสังเคราะห์แบบเรียลไทม์",
        modes: ["Modo Cascada", "Síntesis de voz zh-CN", "Ajuste de velocidad"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
        iconColor: "#22c55e",
        scoreKey: "matrixHighScore"
      },
      {
        id: "tone-trainer",
        tabId: "tone-trainer",
        title: "Entrenador de Tonos",
        titleEn: "Tone Ear Trainer",
        titleRu: "Тренер тонов",
        titleTh: "ฝึกฟังเสียงวรรณยุกต์",
        hanzi: "声调大师",
        category: "tones",
        levels: "HSK 1 - 6",
        skill: "Oído Fino & Desafío 60s",
        skillEn: "Ear Training & 60s Challenge",
        skillRu: "Слуховая тренировка и 60с спринт",
        skillTh: "ฝึกทักษะการฟังและท้าทาย 60 วิ",
        desc: "Entrena tu oído fonético con pares mínimos, combinaciones de dos tonos, tono neutro y modo desafío contrarreloj con multiplicador de combo.",
        descEn: "Sharpen your ear with minimal pairs, two-tone sandhi combinations, neutral tones, and timed 60s challenge mode.",
        descRu: "Тренируйте слух на минимальных парах, тональных сочетаниях, нейтральном тоне и в спринт-режиме.",
        descTh: "ฝึกทักษะการฟังขั้นสูงด้วยคู่เสียงใกล้เคียง คำประสมสองพยางค์ และโหมดแข่งขันจับเวลา 60 วินาที",
        modes: ["Tonos individuales", "Pares mínimos", "Desafío Contrarreloj 60s"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(168, 85, 247, 0.15))",
        iconColor: "#ef4444",
        scoreKey: "toneTrainerHighScore"
      },
      {
        id: "radical-decomposer",
        tabId: "radical-decomposer",
        title: "Laboratorio de Radicales",
        titleEn: "Radical Decomposer Lab",
        titleRu: "Лаборатория радикалов",
        titleTh: "ห้องทดลองหมวดนำอักษรจีน",
        hanzi: "拆字工坊",
        category: "radicals",
        levels: "HSK 1 - 6",
        skill: "Anatomía & Mnemotecnia",
        skillEn: "Anatomy & Mnemonics",
        skillRu: "Анатомия и мнемоника",
        skillTh: "โครงสร้างอักษรและเทคนิคจำ",
        desc: "Descompón caracteres chinos en sus componentes etimológicos, descubre historias mnemotécnicas ilustradas y explora caracteres hermanos.",
        descEn: "Deconstruct Chinese characters into their etymological building blocks, explore visual mnemonics, and discover sibling characters.",
        descRu: "Разбирайте иероглифы на этимологические составляющие, изучайте мнемонические истории и находите родственные знаки.",
        descTh: "แยกส่วนประกอบตัวอักษรจีนตามหลักนิรุกติศาสตร์ เรียนรู้เรื่องราวช่วยจำ และสำรวจตัวอักษรที่มีรากศัพท์เดียวกัน",
        modes: ["Ecuación de componentes", "Historias mnemotécnicas", "Familia de caracteres"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(14, 165, 233, 0.15))",
        iconColor: "#3b82f6",
        badgeText: "Laboratorio",
        btnText: "Explorar"
      },
      {
        id: "china-cities",
        tabId: "china-cities",
        title: "Explorador de Ciudades",
        titleEn: "China Cities Explorer",
        titleRu: "Города Китая",
        titleTh: "สำรวจเมืองและเส้นทางจีน",
        hanzi: "华夏寻踪",
        category: "culture",
        levels: "Todos",
        skill: "Geografía & Rutas",
        skillEn: "Geography & Travel",
        skillRu: "География и маршруты",
        skillTh: "ภูมิศาสตร์และการท่องเที่ยว",
        desc: "Viaja por las grandes metrópolis de China, aprende frases de supervivencia, descubre gastronomía típica y colecciona sellos de viaje en tu pasaporte.",
        descEn: "Journey across China's iconic cities, master travel survival phrases, discover regional cuisine, and collect passport stamps.",
        descRu: "Путешествуйте по городам Китая, учите фразы выживания, пробуйте местную кухню и собирайте визовые штампы.",
        descTh: "เดินทางสู่เมืองสำคัญของจีน เรียนรู้ประโยคเอาตัวรอด เมนูอาหารท้องถิ่น และสะสมตราประทับลงพาสปอร์ต",
        modes: ["Pasaporte de Sellos", "Guía de Supervivencia", "Quiz Cultural"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(245, 158, 11, 0.15))",
        iconColor: "#ea580c",
        scoreKey: "chinaCitiesStampsCount",
        badgeText: "Pasaporte",
        btnText: "Viajar"
      },
      {
        id: "shadow-theatre",
        tabId: "shadow-theatre",
        title: "Teatro de Sombras",
        titleEn: "Shadow Puppet Theatre",
        titleRu: "Театр теней",
        titleTh: "หุ่นเงาเล่าตำนานจีน",
        hanzi: "皮影戏坊",
        category: "culture",
        levels: "Todos",
        skill: "Leyendas & Chengyu",
        skillEn: "Legends & Idioms",
        skillRu: "Легенды и чэнъюи",
        skillTh: "นิทานโบราณและสำนวนจีน",
        desc: "Revive mitos chinos milenarios a través del arte tradicional de las sombras chinescas con audio sincronizado, moralejas y modismos Chengyu.",
        descEn: "Experience ancient Chinese legends through animated shadow puppetry, synchronized audio, morals, and Chengyu idioms.",
        descRu: "Погрузитесь в мифы древнего Китая через искусство театра теней с озвучкой, моралью и идиомами чэнъюй.",
        descTh: "สัมผัสตำนานจีนโบราณผ่านศิลปะการแสดงหุ่นเงา พร้อมเสียงบรรยาย ข้อคิด และสำนวนเฉิงอวี่",
        modes: ["Escenas interactivas", "Lectura guiada", "Quiz de comprensión"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))",
        iconColor: "#a855f7",
        badgeText: "Teatro",
        btnText: "Ver Obra"
      },
      {
        id: "lyrics-lab",
        tabId: "lyrics-lab",
        title: "Laboratorio de Canciones",
        titleEn: "Lyrics Karaoke Lab",
        titleRu: "Музыкальная лаборатория",
        titleTh: "ร้องเพลงฝึกภาษาจีน",
        hanzi: "音乐歌坊",
        category: "culture",
        levels: "HSK 1 - 4",
        skill: "Karaoke & Rimas",
        skillEn: "Karaoke & Rhymes",
        skillRu: "Караоке и рифмы",
        skillTh: "คาราโอเกะและจังหวะดนตรี",
        desc: "Aprende mandarín cantando clásicos infantiles y canciones populares chinas con karaoke línea por línea, pinyin dinámico y desglose léxico.",
        descEn: "Sing along to popular Chinese rhymes and songs with line-by-line karaoke, dynamic pinyin, and vocabulary highlights.",
        descRu: "Учите китайский язык через классические детские песни и популярные мелодии с построчным караоке и пиньинем.",
        descTh: "เรียนภาษาจีนผ่านการร้องเพลงด้วยคาราโอเกะทีละบรรทัด พร้อมพินอินและเจาะลึกคำศัพท์สำคัญ",
        modes: ["Modo Karaoke", "Lectura guiada línea por línea", "Desglose de vocabulario"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 63, 94, 0.15))",
        iconColor: "#ec4899",
        badgeText: "Karaoke",
        btnText: "Cantar"
      }
    ];

    this.boundPreventScroll = this.onGameKeyScrollLock.bind(this);
  }

  init() {
    this.container = document.getElementById("games");
    if (!this.container) return;

    this.cacheElements();
    this.bindEvents();
    this.renderHeroStats();
    this.renderFeaturedGame();
    this.renderCards();
    this.setupInGameNavigationBars();
    this.setupKeyboardScrollLock();
  }

  cacheElements() {
    this.grid = this.container.querySelector("#gh-games-grid");
    this.chips = this.container.querySelectorAll(".gh-chip-btn");
    this.searchInput = this.container.querySelector("#gh-search-input");
    this.totalGamesEl = this.container.querySelector("#gh-total-games-count");
    this.highScoresSumEl = this.container.querySelector("#gh-high-scores-sum");
    this.gamesPlayedEl = this.container.querySelector("#gh-games-played-count");
    this.featuredTitle = this.container.querySelector("#gh-featured-title");
    this.featuredDesc = this.container.querySelector("#gh-featured-desc");
    this.featuredSkill = this.container.querySelector("#gh-featured-skill");
    this.featuredPlayBtn = this.container.querySelector("#gh-featured-play-btn");
    this.featuredBonusEl = this.container.querySelector(".gh-bonus-xp");
  }

  bindEvents() {
    // Chips filter
    if (this.chips) {
      this.chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          this.chips.forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-selected", "false");
          });
          chip.classList.add("active");
          chip.setAttribute("aria-selected", "true");
          this.activeFilter = chip.getAttribute("data-filter") || "all";
          this.renderCards();
        });
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.renderCards();
      });
    }

    // Featured game button
    if (this.featuredPlayBtn) {
      this.featuredPlayBtn.addEventListener("click", () => {
        const targetTab = this.featuredPlayBtn.getAttribute("data-target-tab");
        if (targetTab && this.app?.switchTab) {
          this.app.switchTab(targetTab);
        }
      });
    }

    // Listen for game results to refresh stats and award daily challenge bonus
    if (GamesHubController._activeResultListener) {
      document.removeEventListener("hsk:game-result", GamesHubController._activeResultListener);
    }
    this.boundGameResultHandler = (e) => {
      this.recordGameLaunch();
      if (e.detail?.game) {
        this.claimDailyBonus(e.detail.game);
      }
      this.renderHeroStats();
      this.renderCards();
    };
    GamesHubController._activeResultListener = this.boundGameResultHandler;
    document.addEventListener("hsk:game-result", this.boundGameResultHandler);
  }

  getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  getDailyFeaturedGame() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return this.gamesList[dayOfYear % this.gamesList.length];
  }

  isDailyBonusClaimed() {
    try {
      return localStorage.getItem(`hsk_daily_game_bonus_${this.getTodayKey()}`) === "true";
    } catch {
      return false;
    }
  }

  claimDailyBonus(gameId) {
    const todayGame = this.getDailyFeaturedGame();
    if (!todayGame) return false;
    if (gameId !== todayGame.id && gameId !== todayGame.tabId) return false;
    if (this.isDailyBonusClaimed()) return false;

    try {
      localStorage.setItem(`hsk_daily_game_bonus_${this.getTodayKey()}`, "true");
      const currentXP = Number(localStorage.getItem("hsk_culture_trivia_xp") || 0) + 50;
      localStorage.setItem("hsk_culture_trivia_xp", String(currentXP));

      if (window.progressIntegrator) {
        window.progressIntegrator.updateProgress({
          totalStudied: (window.progressIntegrator.getLocalProgress().totalStudied || 0) + 1
        });
      }

      const toastMsg = this.app?.currentLanguage === "en"
        ? "🎉 Daily Game Challenge Completed! +50 XP"
        : "🎉 ¡Reto Diario del Salón de Juegos Completado! +50 XP";
      this.app?.showToast?.(toastMsg, "success", 4000);

      this.renderFeaturedGame();
      return true;
    } catch (e) {
      this.app?.logWarn?.("Error claiming daily game bonus", e);
      return false;
    }
  }

  refresh() {
    this.renderHeroStats();
    this.renderFeaturedGame();
    this.renderCards();
  }

  renderHeroStats() {
    let totalScore = 0;
    this.gamesList.forEach((g) => {
      if (g.scoreKey && g.id !== "china-cities") {
        const score = this.getGameHighScore(g);
        totalScore += score;
      }
    });

    if (this.totalGamesEl) this.totalGamesEl.textContent = this.gamesList.length.toString();
    if (this.highScoresSumEl) this.highScoresSumEl.textContent = totalScore.toLocaleString();
    if (this.gamesPlayedEl) {
      const played = parseInt(localStorage.getItem("hsk_total_games_played") || "0", 10);
      this.gamesPlayedEl.textContent = played.toString();
    }
  }

  renderFeaturedGame() {
    const game = this.getDailyFeaturedGame();
    const lang = this.app?.currentLanguage || "es";
    const title = lang === "en" ? game.titleEn : lang === "ru" ? game.titleRu : lang === "th" ? game.titleTh : game.title;
    const desc = lang === "en" ? game.descEn : lang === "ru" ? game.descRu : lang === "th" ? game.descTh : game.desc;
    const skill = lang === "en" ? game.skillEn : lang === "ru" ? game.skillRu : lang === "th" ? game.skillTh : game.skill;

    if (this.featuredTitle) this.featuredTitle.textContent = `${title} · ${game.hanzi}`;
    if (this.featuredDesc) this.featuredDesc.textContent = desc;
    if (this.featuredSkill) this.featuredSkill.textContent = skill;
    if (this.featuredPlayBtn) this.featuredPlayBtn.setAttribute("data-target-tab", game.tabId);

    if (this.featuredBonusEl) {
      const claimed = this.isDailyBonusClaimed();
      if (claimed) {
        this.featuredBonusEl.textContent = lang === "en" ? "✓ Bonus Claimed" : "✓ Bonus Reclamado";
        this.featuredBonusEl.classList.add("claimed");
      } else {
        this.featuredBonusEl.textContent = "+50 XP Bonus";
        this.featuredBonusEl.classList.remove("claimed");
      }
    }
  }

  renderCards() {
    if (!this.grid) return;
    this.grid.innerHTML = "";

    const lang = this.app?.currentLanguage || "es";
    let filtered = [...this.gamesList];

    // Filter by skill
    if (this.activeFilter !== "all") {
      filtered = filtered.filter((g) => g.category === this.activeFilter);
    }

    // Filter by search
    if (this.searchTerm) {
      const term = this.searchTerm;
      filtered = filtered.filter((g) => {
        const title = (g.title || "").toLowerCase();
        const titleEn = (g.titleEn || "").toLowerCase();
        const hanzi = (g.hanzi || "").toLowerCase();
        const skill = (g.skill || "").toLowerCase();
        const desc = (g.desc || "").toLowerCase();
        return title.includes(term) || titleEn.includes(term) || hanzi.includes(term) || skill.includes(term) || desc.includes(term);
      });
    }

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <p>No se encontraron juegos que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((game) => {
      const card = document.createElement("article");
      card.className = "gh-game-card";
      card.setAttribute("data-game", game.id);

      const title = lang === "en" ? game.titleEn : lang === "ru" ? game.titleRu : lang === "th" ? game.titleTh : game.title;
      const desc = lang === "en" ? game.descEn : lang === "ru" ? game.descRu : lang === "th" ? game.descTh : game.desc;
      const skill = lang === "en" ? game.skillEn : lang === "ru" ? game.skillRu : lang === "th" ? game.skillTh : game.skill;
      const highScore = this.getGameHighScore(game);

      let scoreDisplay = "—";
      let scoreLabel = lang === "en" ? "Personal Best" : "Récord Personal";
      if (game.id === "china-cities") {
        scoreLabel = lang === "en" ? "Travel Stamps" : "Sellos de Viaje";
        scoreDisplay = highScore > 0 ? `${highScore} ${lang === "en" ? "unlocked" : "desbloqueados"}` : (lang === "en" ? "0 stamps" : "0 sellos");
      } else if (game.scoreKey) {
        scoreDisplay = highScore > 0 ? `${highScore.toLocaleString()} pts` : "—";
      } else {
        scoreLabel = lang === "en" ? "Experience" : "Modalidad";
        scoreDisplay = game.badgeText || (lang === "en" ? "Interactive" : "Interactivo");
      }

      const playText = game.btnText || (lang === "en" ? "Play" : "Jugar");

      const mechsHtml = game.modes
        .map((m) => `<span class="gh-mech-tag">${m}</span>`)
        .join("");

      card.innerHTML = `
        <div class="gh-card-header">
          <div class="gh-card-icon-avatar" style="background: ${game.bgGradient}; color: ${game.iconColor};">
            ${game.iconSvg}
          </div>
          <div class="gh-card-title-group">
            <div class="gh-card-title-row">
              <h3 class="gh-card-name">${title}</h3>
              <span class="gh-card-hanzi">${game.hanzi}</span>
            </div>
            <div class="gh-card-badges">
              <span class="gh-tag gh-tag-level">${game.levels}</span>
              <span class="gh-tag gh-tag-skill">${skill}</span>
            </div>
          </div>
        </div>

        <p class="gh-card-desc">${desc}</p>

        <div class="gh-card-mechanics">
          ${mechsHtml}
        </div>

        <div class="gh-card-footer">
          <div class="gh-card-score">
            <span class="gh-score-label">${scoreLabel}</span>
            <span class="gh-score-val">${scoreDisplay}</span>
          </div>
          <button type="button" class="gh-btn-play" data-tab-launch="${game.tabId}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>${playText}</span>
          </button>
        </div>
      `;

      const playBtn = card.querySelector(".gh-btn-play");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          this.recordGameLaunch();
          if (this.app?.switchTab) {
            this.app.switchTab(game.tabId);
          }
        });
      }

      this.grid.appendChild(card);
    });
  }

  getGameHighScore(game) {
    let hs = 0;
    try {
      if (game.id === "china-cities") {
        const raw = localStorage.getItem("hsk_unlocked_city_stamps");
        if (raw) {
          try {
            const stamps = JSON.parse(raw);
            if (Array.isArray(stamps)) return stamps.length;
          } catch {
            // Ignore JSON parse error
          }
        }
        return 0;
      }

      if (window.app?.stats && game.scoreKey && window.app.stats[game.scoreKey]) {
        hs = Math.max(hs, parseInt(window.app.stats[game.scoreKey], 10) || 0);
      }
      if (this.app?.stats && game.scoreKey && this.app.stats[game.scoreKey]) {
        hs = Math.max(hs, parseInt(this.app.stats[game.scoreKey], 10) || 0);
      }
      // Check localStorage common keys
      const localDirect = localStorage.getItem(game.scoreKey);
      if (localDirect) hs = Math.max(hs, parseInt(localDirect, 10) || 0);

      // Check quantifier-snake prefixes
      if (game.id === "snake-quantifiers") {
        ["easy", "normal", "hard"].forEach((diff) => {
          const v = localStorage.getItem(`quantifier-snake-highscore-all-${diff}`);
          if (v) hs = Math.max(hs, parseInt(v, 10) || 0);
        });
      }

      // Check matrix multi-level keys fallback
      if (game.id === "matrix") {
        for (let lvl = 1; lvl <= 6; lvl++) {
          ["easy", "normal", "hard"].forEach((diff) => {
            const raw = localStorage.getItem(`matrix-highscores-${lvl}-${diff}`);
            if (raw) {
              try {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr[0]?.score) {
                  hs = Math.max(hs, arr[0].score);
                }
              } catch {
                // Ignore parse errors
              }
            }
          });
        }
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return hs;
  }

  recordGameLaunch() {
    try {
      const current = parseInt(localStorage.getItem("hsk_total_games_played") || "0", 10);
      localStorage.setItem("hsk_total_games_played", (current + 1).toString());
      if (this.gamesPlayedEl) {
        this.gamesPlayedEl.textContent = (current + 1).toString();
      }
    } catch {
      // Ignore
    }
  }

  // --- IN-GAME ARCADE NAVIGATION BAR INJECTION ---
  setupInGameNavigationBars() {
    this.gamesList.forEach((game) => {
      const tabEl = document.getElementById(game.tabId);
      if (!tabEl) return;

      // Avoid injecting multiple times
      if (tabEl.querySelector(".game-arcade-topbar")) return;

      const topBar = document.createElement("nav");
      topBar.className = "game-arcade-topbar";
      topBar.setAttribute("aria-label", "Navegación arcade");

      const optionsHtml = this.gamesList
        .map((g) => `<option value="${g.tabId}" ${g.tabId === game.tabId ? "selected" : ""}>${g.title}</option>`)
        .join("");

      topBar.innerHTML = `
        <div class="game-breadcrumb-group">
          <a href="#games" class="game-breadcrumb-back" data-action="return-games" title="Volver al Salón de Juegos Arcade">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Salón de Juegos</span>
          </a>
          <span class="game-breadcrumb-sep">/</span>
          <span class="game-breadcrumb-current">${game.title}</span>
        </div>

        <div class="game-quick-tools">
          <label for="switcher-${game.tabId}" class="sr-only">Cambiar de juego:</label>
          <select id="switcher-${game.tabId}" class="game-switcher-select" aria-label="Cambiar de juego rápidamente">
            ${optionsHtml}
          </select>
          <button type="button" class="game-tool-btn" data-action="toggle-audio" title="Activar / Desactivar Sonido">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
        </div>
      `;

      // Back to games hub
      const backBtn = topBar.querySelector('[data-action="return-games"]');
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.app?.switchTab) this.app.switchTab("games");
        });
      }

      // Quick switcher
      const switcher = topBar.querySelector(".game-switcher-select");
      if (switcher) {
        switcher.addEventListener("change", (e) => {
          const nextTab = e.target.value;
          if (nextTab && this.app?.switchTab) {
            this.app.switchTab(nextTab);
          }
        });
      }

      // Audio toggle
      const audioBtn = topBar.querySelector('[data-action="toggle-audio"]');
      if (audioBtn) {
        audioBtn.addEventListener("click", () => {
          if (this.app?.audioController?.toggleAudio) {
            this.app.audioController.toggleAudio();
          }
        });
      }

      // Prepend inside shell or container
      const shell = tabEl.querySelector(".snakeq-shell, .tones-inv-shell, .hanzi-build-shell, .word-link-shell, .sentence-builder-container, .mahjong-container, .matrix-game-container, .tone-trainer-container, .decomposer-container, .cities-container, .shadow-container, .lyrics-container");
      if (shell) {
        shell.insertBefore(topBar, shell.firstChild);
      } else {
        tabEl.insertBefore(topBar, tabEl.firstChild);
      }
    });
  }

  // --- KEYBOARD SCROLL LOCK FOR ARCADE GAMES ---
  setupKeyboardScrollLock() {
    window.removeEventListener("keydown", this.boundPreventScroll);
    window.addEventListener("keydown", this.boundPreventScroll, { passive: false });
  }

  onGameKeyScrollLock(e) {
    const activePanel = document.querySelector(".tab-panel.active");
    if (!activePanel) return;

    const gameTabIds = ["snake-quantifiers", "tones-invaders", "matrix", "hanzi-builder", "word-linker", "sentence-builder", "hanzi-mahjong", "tone-trainer"];
    const currentTab = activePanel.getAttribute("data-tab") || activePanel.id;

    if (gameTabIds.includes(currentTab)) {
      // If user presses arrows or space inside gameplay canvas/area and NOT inside an input/select
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
          e.preventDefault();
        }
      }
    }
  }
}

window.GamesHubController = GamesHubController;
