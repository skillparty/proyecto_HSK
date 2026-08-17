/**
 * ============================================================================
 * MemoriesController (Baúl de los Recuerdos / 记忆宝盒)
 * ICUMSS Confucius Institute Memories Vault & Cultural Journey Gallery
 * ============================================================================
 */

class MemoriesController {
  constructor(app) {
    this.app = app;
    this.containerId = "memories-content";
    this.currentView = "grid"; // 'grid' | 'timeline' | 'slideshow'
    this.currentCategory = "all"; // 'all' | 'teachers' | 'milestones' | 'contests' | 'events' | 'friendship' | 'favorites'
    this.searchQuery = "";
    this.currentModalIndex = -1;
    this.slideshowIndex = 0;
    this.slideshowInterval = null;
    this.isSlideshowPlaying = false;
    this.favorites = this.loadFavorites();

    // Chinese Auspicious Proverbs for the Mystery Chest
    this.proverbs = [
      { hanzi: "千里之行，始于足下", pinyin: "Qiān lǐ zhī xíng, shǐ yú zú xià", es: "Un viaje de mil millas comienza con un solo paso.", en: "A journey of a thousand miles begins with a single step." },
      { hanzi: "学贵有恒", pinyin: "Xué guì yǒu héng", es: "Lo más valioso del aprendizaje es la constancia.", en: "Perseverance is the most valuable asset in learning." },
      { hanzi: "温故而知新", pinyin: "Wēn gù ér zhī xīn", es: "Repasar lo aprendido permite adquirir nuevos conocimientos.", en: "Reviewing the old brings understanding of the new." },
      { hanzi: "海内存知己，天涯若比邻", pinyin: "Hǎi nèi cún zhījǐ, tiānyá ruò bǐlín", es: "Teniendo amigos sinceros en el alma, la distancia une los confines del mundo.", en: "True friends make distant corners of the world feel close." },
      { hanzi: "书山有路勤为径，学海无涯苦作舟", pinyin: "Shū shān yǒu lù qín wéi jìng, xué hǎi wú yá kǔ zuò zhōu", es: "La diligencia es el camino a la montaña de libros; la perseverancia es el barco en el océano del saber.", en: "Diligence is the path up the mountain of books; perseverance is the boat across the sea of knowledge." }
    ];

    // Data set of all 27 photos from the ICUMSS journey
    this.memoriesData = [
      // 1. TEACHERS & LEADERSHIP
      {
        id: "guo_laoshi",
        img: "assets/images/memories/GuoLaoshi.jpg",
        seal: "师恩",
        category: "teachers",
        title: "Guo Laoshi — Pasión y Calidez en la Enseñanza",
        titleEn: "Guo Laoshi — Passion and Warmth in Teaching",
        hanzi: "郭老师 — 谆谆教诲与温暖陪伴",
        pinyin: "Guō Lǎoshī — Zhūnzhūn Jiàohuì yǔ Wēnnuǎn Péibàn",
        desc: "Recuerdos invaluables junto a la profesora Guo, guiando con paciencia infinita y dedicación cada sesión de conversación y fonética en el ICUMSS.",
        descEn: "Precious memories with Teacher Guo, guiding each conversation and phonetics session at ICUMSS with endless patience and dedication.",
        tags: ["Docente", "ICUMSS", "Pronunciación", "San Simón"],
        vocab: [
          { hanzi: "老师", pinyin: "lǎoshī", meaning: "profesor/a" },
          { hanzi: "教导", pinyin: "jiàodǎo", meaning: "enseñar/guiar" }
        ]
      },
      {
        id: "liu_laoshi_1",
        img: "assets/images/memories/LiuLaoshi.jpg",
        seal: "严谨",
        category: "teachers",
        title: "Liu Laoshi — Excelencia Académica y Gramática",
        titleEn: "Liu Laoshi — Academic Excellence & Grammar",
        hanzi: "刘老师 — 严谨治学与悉心解惑",
        pinyin: "Liú Lǎoshī — Yánjǐn Zhìxué yǔ Xīxīn Jiěhuò",
        desc: "Clases magistrales de Liu Laoshi profundizando en las sutilezas de la gramática china y la correcta estructura de oraciones.",
        descEn: "Masterful lessons with Teacher Liu delving into the subtleties of Chinese grammar and sentence patterns.",
        tags: ["Docente", "Gramática", "ICUMSS", "Excelencia"],
        vocab: [
          { hanzi: "语法", pinyin: "yǔfǎ", meaning: "gramática" },
          { hanzi: "耐心", pinyin: "nàixīn", meaning: "paciencia" }
        ]
      },
      {
        id: "liu_laoshi_2",
        img: "assets/images/memories/LiuLaoshi(2).jpg",
        seal: "笃学",
        category: "teachers",
        title: "Liu Laoshi — Dinámica de Aula e Intercambio",
        titleEn: "Liu Laoshi — Classroom Dynamics & Exchange",
        hanzi: "刘老师 — 生动课堂与互动交流",
        pinyin: "Liú Lǎoshī — Shēngdòng Kètáng yǔ Hùdòng Jiāoliú",
        desc: "Momentos de participación activa en el aula, practicando diálogos reales y construyendo confianza comunicativa.",
        descEn: "Active classroom sessions practicing real conversations and building confidence in Mandarin.",
        tags: ["Clases", "Diálogo", "ICUMSS"],
        vocab: [
          { hanzi: "课堂", pinyin: "kètáng", meaning: "aula" },
          { hanzi: "交流", pinyin: "jiāoliú", meaning: "intercambio" }
        ]
      },
      {
        id: "pan_laoshi_1",
        img: "assets/images/memories/PanLaoshi.jpg",
        seal: "温厚",
        category: "teachers",
        title: "Pan Laoshi — Calidez Humana y Dedicación",
        titleEn: "Pan Laoshi — Warmth and Guidance",
        hanzi: "潘老师 — 润物无声与温情指引",
        pinyin: "Pān Lǎoshī — Rùnwù Wúshēng yǔ Wēnqíng Zhǐyǐn",
        desc: "La cercanía y calidez de Pan Laoshi, siempre dispuesta a despejar dudas y motivar el estudio continuo del idioma.",
        descEn: "The warmth and approachability of Teacher Pan, always ready to clarify doubts and inspire consistent study.",
        tags: ["Docente", "Motivación", "ICUMSS"],
        vocab: [
          { hanzi: "指引", pinyin: "zhǐyǐn", meaning: "guiar" },
          { hanzi: "鼓励", pinyin: "gǔlì", meaning: "motivar" }
        ]
      },
      {
        id: "pan_laoshi_2",
        img: "assets/images/memories/PanLaoshi(1).jpg",
        seal: "师表",
        category: "teachers",
        title: "Pan Laoshi — Compartiendo Momentos Memorables",
        titleEn: "Pan Laoshi — Memorable Shared Moments",
        hanzi: "潘老师 — 师生同心与欢笑岁月",
        pinyin: "Pān Lǎoshī — Shīshēng Tóngxīn yǔ Huānxiào Suìyuè",
        desc: "Compartiendo sonrisas y metas alcanzadas en el Instituto Confucio UMSS con Pan Laoshi.",
        descEn: "Sharing smiles and milestones at the Confucius Institute with Teacher Pan.",
        tags: ["Amistad", "ICUMSS", "Recuerdos"],
        vocab: [
          { hanzi: "欢笑", pinyin: "huānxiào", meaning: "risas/alegría" },
          { hanzi: "回忆", pinyin: "huíyì", meaning: "recuerdo" }
        ]
      },
      {
        id: "pan_laoshi_3",
        img: "assets/images/memories/PanLaoshi(2).jpg",
        seal: "孔院",
        category: "teachers",
        title: "Pan Laoshi — Espacios del Instituto Confucio",
        titleEn: "Pan Laoshi — Confucius Institute Grounds",
        hanzi: "潘老师 — 孔院留影与成长印记",
        pinyin: "Pān Lǎoshī — Kǒngyuàn Liúyǐng yǔ Chéngzhǎng Yìnjì",
        desc: "Fotografía conmemorativa en los pasillos e instalaciones del ICUMSS, testigas de nuestro progreso diario.",
        descEn: "Commemorative photo in the ICUMSS halls, witnesses to our daily progress.",
        tags: ["Instalaciones", "ICUMSS", "Docente"],
        vocab: [
          { hanzi: "孔子学院", pinyin: "Kǒngzǐ Xuéyuàn", meaning: "Instituto Confucio" },
          { hanzi: "成长", pinyin: "chéngzhǎng", meaning: "crecimiento" }
        ]
      },
      {
        id: "pan_laoshi_4",
        img: "assets/images/memories/panLaoshi(3).JPG",
        seal: "解惑",
        category: "teachers",
        title: "Pan Laoshi — Lección Magistral y Explicación",
        titleEn: "Pan Laoshi — Masterful Lesson & Clarification",
        hanzi: "潘老师 — 妙趣横生的汉语课堂",
        pinyin: "Pān Lǎoshī — Miàoqù Héngshēng de Hànyǔ Kètáng",
        desc: "Desglosando caracteres difíciles y anécdotas culturales en una clase dinámica y enriquecedora.",
        descEn: "Deconstructing complex characters and cultural anecdotes in an enriching classroom setting.",
        tags: ["Clases", "Caracteres", "ICUMSS"],
        vocab: [
          { hanzi: "汉字", pinyin: "hànzì", meaning: "caracteres chinos" },
          { hanzi: "精彩", pinyin: "jīngcǎi", meaning: "maravilloso/espléndido" }
        ]
      },
      {
        id: "xiang_director",
        img: "assets/images/memories/XiangDirector.jpg",
        seal: "领航",
        category: "teachers",
        title: "Director Xiang — Liderazgo y Visión Académica",
        titleEn: "Director Xiang — Leadership & Academic Vision",
        hanzi: "向院长 — 卓越领导与殷切关怀",
        pinyin: "Xiàng Yuànzhǎng — Zhuóyuè Lǐngdǎo yǔ Yīnqiè Guānhuái",
        desc: "Encuentro con el Director Xiang, pilar fundamental en la consolidación de lazos educativos entre China y la UMSS.",
        descEn: "Meeting with Director Xiang, a pillar in establishing educational and cultural ties between China and UMSS.",
        tags: ["Director", "Liderazgo", "ICUMSS", "UMSS"],
        vocab: [
          { hanzi: "院长", pinyin: "yuànzhǎng", meaning: "director/decano" },
          { hanzi: "领导", pinyin: "lǐngdǎo", meaning: "líder/liderazgo" }
        ]
      },
      {
        id: "directores_1",
        img: "assets/images/memories/directoresICUMSS.jpg",
        seal: "宏图",
        category: "teachers",
        title: "Dirección y Autoridades del ICUMSS",
        titleEn: "Leadership & Authorities of ICUMSS",
        hanzi: "孔院领导班子 — 携手共进",
        pinyin: "Kǒngyuàn Lǐngdǎo Bānzi — Xiéshǒu Gòngjìn",
        desc: "El equipo directivo y coordinadores que impulsan programas de becas, exámenes HSK y actividades culturales en San Simón.",
        descEn: "The leadership team coordinating scholarships, HSK exams, and cultural programs at San Simón.",
        tags: ["Dirección", "Autoridades", "ICUMSS"],
        vocab: [
          { hanzi: "合作", pinyin: "hézuò", meaning: "cooperación" },
          { hanzi: "发展", pinyin: "fāzhǎn", meaning: "desarrollo" }
        ]
      },
      {
        id: "directores_2",
        img: "assets/images/memories/directoresICUMSS(2).jpg",
        seal: "共进",
        category: "teachers",
        title: "Directores ICUMSS — Encuentro de Coordinación",
        titleEn: "ICUMSS Directors — Coordination Summit",
        hanzi: "深化中玻教育合作与交流",
        pinyin: "Shēnhuà Zhōng-Bō Jiàoyù Hézuò yǔ Jiāoliú",
        desc: "Reunión de coordinación institucional fortaleciendo la calidad de la enseñanza del chino mandarín en Cochabamba.",
        descEn: "Institutional meeting strengthening Mandarin Chinese teaching quality in Cochabamba.",
        tags: ["Coordinación", "Educación", "ICUMSS"],
        vocab: [
          { hanzi: "教育", pinyin: "jiàoyù", meaning: "educación" },
          { hanzi: "桥梁", pinyin: "qiáoliáng", meaning: "puente" }
        ]
      },
      {
        id: "directores_3",
        img: "assets/images/memories/directoresICUMSS(3).jpg",
        seal: "盛会",
        category: "teachers",
        title: "Directores ICUMSS — Ceremonia y Compromiso",
        titleEn: "ICUMSS Directors — Ceremony & Commitment",
        hanzi: "共筑中玻友谊新篇章",
        pinyin: "Gòngzhù Zhōng-Bō Yǒuyì Xīn Piānzhāng",
        desc: "Celebración y compromiso constante con el éxito académico y cultural de la comunidad estudiantil de la UMSS.",
        descEn: "Celebration and enduring commitment to the academic and cultural success of UMSS students.",
        tags: ["Ceremonia", "Convenios", "ICUMSS"],
        vocab: [
          { hanzi: "友谊", pinyin: "yǒuyì", meaning: "amistad" },
          { hanzi: "未来", pinyin: "wèilái", meaning: "futuro" }
        ]
      },

      // 2. MILESTONES & HSK EXAMS
      {
        id: "hsk_1_inicio",
        img: "assets/images/memories/HSKnivel1.jpg",
        seal: "起航",
        category: "milestones",
        title: "HSK Nivel 1 — Primeros Pasos en el Idioma",
        titleEn: "HSK Level 1 — First Steps into the Language",
        hanzi: "初识汉语 — HSK 1级起航",
        pinyin: "Chūshí Hànyǔ — HSK 1 Jí Qǐháng",
        desc: "El emocionante inicio del viaje: aprendiendo los primeros tonos, radicales y estructuras fundamentales del chino mandarín.",
        descEn: "The exciting beginning of the journey: learning initial tones, radicals, and basic structures.",
        tags: ["HSK 1", "Inicios", "Vocabulario", "Logro"],
        vocab: [
          { hanzi: "汉语", pinyin: "hànyǔ", meaning: "idioma chino" },
          { hanzi: "开始", pinyin: "kāishǐ", meaning: "comenzar" }
        ]
      },
      {
        id: "hsk_1_final",
        img: "assets/images/memories/finalNivel1.JPG",
        seal: "圆满",
        category: "milestones",
        title: "Final de HSK Nivel 1 — Primera Meta Conquistada",
        titleEn: "HSK Level 1 Completion — First Big Milestone",
        hanzi: "勤学不辍 — HSK 1级圆满结业",
        pinyin: "Qínxué Bùchuò — HSK 1 Jí Yuánmǎn Jiéyè",
        desc: "Culminación exitosa del primer nivel, consolidando las bases para afrontar mayores desafíos lingüísticos.",
        descEn: "Successful completion of the first level, establishing strong foundations for advanced stages.",
        tags: ["Graduación", "HSK 1", "Meta Cumplida"],
        vocab: [
          { hanzi: "结业", pinyin: "jiéyè", meaning: "graduación/conclusión" },
          { hanzi: "努力", pinyin: "nǔlì", meaning: "esfuerzo" }
        ]
      },
      {
        id: "hsk_3_final",
        img: "assets/images/memories/finalHSK3.jpg",
        seal: "登高",
        category: "milestones",
        title: "Final de HSK Nivel 3 — Dominio Intermedio y Gran Hito",
        titleEn: "HSK Level 3 Completion — Intermediate Mastery",
        hanzi: "登高望远 — HSK 3级丰硕成果",
        pinyin: "Dēnggāo Wàngyuǎn — HSK 3 Jí Fēngshuò Chéngguǒ",
        desc: "Gran conquista alcanzando más de 600 palabras y estructuras gramaticales intermedias con total fluidez.",
        descEn: "A massive achievement mastering 600+ words and intermediate structures with confidence.",
        tags: ["HSK 3", "Intermedio", "Triunfo", "ICUMSS"],
        vocab: [
          { hanzi: "突破", pinyin: "tūpò", meaning: "avance/hito" },
          { hanzi: "成功", pinyin: "chénggōng", meaning: "éxito" }
        ]
      },
      {
        id: "hsk_examen_oficial",
        img: "assets/images/memories/examenHSK.jpg",
        seal: "沉着",
        category: "milestones",
        title: "Jornada Oficial de Examen HSK",
        titleEn: "Official HSK Examination Day",
        hanzi: "考场沉着 — HSK 官方国际统考",
        pinyin: "Kǎochǎng Chénzhuó — HSK Guānfāng Guójì Tǒngkǎo",
        desc: "Día de concentración y máxima dedicación rindiendo el examen internacional de certificación del idioma chino.",
        descEn: "Day of sharp focus and concentration taking the official international Chinese proficiency test.",
        tags: ["Examen", "Certificación", "HSK Oficial"],
        vocab: [
          { hanzi: "考试", pinyin: "kǎoshì", meaning: "examen" },
          { hanzi: "证书", pinyin: "zhèngshū", meaning: "certificado" }
        ]
      },

      // 3. CONTESTS & CALLIGRAPHY
      {
        id: "concurso_caligrafia_1",
        img: "assets/images/memories/concursoCaligrafia.jpg",
        seal: "墨香",
        category: "contests",
        title: "Concurso de Caligrafía China — Pincel y Tinta",
        titleEn: "Chinese Calligraphy Contest — Brush & Ink",
        hanzi: "翰墨书香 — 中国书法比赛",
        pinyin: "Hànmò Shūxiāng — Zhōngguó Shūfǎ Bǐsài",
        desc: "El arte milenario del pincel en acción: plasmando caracteres tradicionales con técnica, equilibrio y armonía.",
        descEn: "The ancient art of the brush in action: writing traditional characters with technique, balance, and rhythm.",
        tags: ["Caligrafía", "Pincel", "Tinta", "Concurso"],
        vocab: [
          { hanzi: "书法", pinyin: "shūfǎ", meaning: "caligrafía" },
          { hanzi: "毛笔", pinyin: "máobǐ", meaning: "pincel" }
        ]
      },
      {
        id: "concurso_caligrafia_2",
        img: "assets/images/memories/concursoCaligrafia(2).jpg",
        seal: "专精",
        category: "contests",
        title: "Concurso de Caligrafía — Técnica y Concentración",
        titleEn: "Calligraphy Contest — Precision & Focus",
        hanzi: "中国书法 — 精益求精与挥毫写意",
        pinyin: "Zhōngguó Shūfǎ — Jīngyì Qiújīng yǔ Huīháo Xiěyì",
        desc: "Concentración absoluta en cada trazo sobre papel de arroz xuan, dominando la presión y velocidad del trazo.",
        descEn: "Pure concentration on every stroke over Xuan rice paper, mastering brush pressure and speed.",
        tags: ["Caligrafía", "Arte", "Trazos", "Cultura"],
        vocab: [
          { hanzi: "书法", pinyin: "shūfǎ", meaning: "caligrafía" },
          { hanzi: "宣纸", pinyin: "xuānzhǐ", meaning: "papel de arroz" },
          { hanzi: "专注", pinyin: "zhuānzhù", meaning: "concentración" }
        ]
      },
      {
        id: "premiacion_caligrafia",
        img: "assets/images/memories/premiacionCaligrafia.jpg",
        seal: "荣耀",
        category: "contests",
        title: "Premiación de Caligrafía — Reconocimiento al Talento",
        titleEn: "Calligraphy Award Ceremony — Talent Recognized",
        hanzi: "荣耀时刻 — 书法比赛颁奖盛典",
        pinyin: "Róngyào Shíkè — Shūfǎ Bǐsài Bānjiǎng Shèngdiǎn",
        desc: "Momento de inmenso orgullo recibiendo el galardón por la excelencia y dedicación en el certamen de caligrafía china.",
        descEn: "A moment of deep pride receiving awards and honors for calligraphy excellence and dedication.",
        tags: ["Premiación", "Victoria", "Orgullo", "ICUMSS"],
        vocab: [
          { hanzi: "颁奖", pinyin: "bānjiǎng", meaning: "premiación" },
          { hanzi: "荣誉", pinyin: "róngyù", meaning: "honor/premio" }
        ]
      },
      {
        id: "puente_chino",
        img: "assets/images/memories/puenteChino.jpg",
        seal: "荣耀",
        category: "contests",
        title: "Concurso Puente Chino (汉语桥) — Gran Triunfo de Nicole 🏆",
        titleEn: "Chinese Bridge Competition (汉语桥) — Nicole's 1st Place Victory 🏆",
        hanzi: "追梦中文 · 荣获桂冠 — 汉语桥世界大学生中文比赛",
        pinyin: "Zhuīmèng Zhōngwén · Rónghuò Guìguān — Hànyǔ Qiáo Bǐsài",
        desc: "El certamen internacional más prestigioso de elocuencia, conocimiento y cultura china, donde Nicole brilló alcanzando el 1.er Lugar (冠军) en una destacadísima participación que llenó de gloria y orgullo a todo el ICUMSS.",
        descEn: "The premier global competition showcasing Chinese language proficiency, where Nicole shined winning 1st Place (Champion) bringing immense honor and pride to ICUMSS.",
        tags: ["Puente Chino", "1er Lugar", "Nicole", "Campeona", "Elocuencia", "ICUMSS"],
        vocab: [
          { hanzi: "汉语桥", pinyin: "Hànyǔ Qiáo", meaning: "Puente Chino" },
          { hanzi: "冠军", pinyin: "guànjūn", meaning: "campeón / 1er lugar" },
          { hanzi: "比赛", pinyin: "bǐsài", meaning: "competencia" },
          { hanzi: "荣耀", pinyin: "róngyào", meaning: "gloria / honor" }
        ]
      },

      // 4. CULTURE & EVENTS
      {
        id: "aniversario_china_bolivia",
        img: "assets/images/memories/aniversarioChina-Bolivia.jpg",
        seal: "友谊",
        category: "events",
        title: "Aniversario de Relaciones China - Bolivia",
        titleEn: "China - Bolivia Anniversary Gala",
        hanzi: "携手同行 — 中玻友谊与文化周年庆典",
        pinyin: "Xiéshǒu Tóngxíng — Zhōng-Bō Yǒuyì Qìngdiǎn",
        desc: "Conmemorando la fraternidad y estrechos lazos culturales que unen a Bolivia y la República Popular China.",
        descEn: "Commemorating cultural fraternity and diplomatic ties between Bolivia and China.",
        tags: ["Aniversario", "Hermandad", "Cochabamba", "Gala"],
        vocab: [
          { hanzi: "友谊", pinyin: "yǒuyì", meaning: "amistad" },
          { hanzi: "庆典", pinyin: "qìngdiǎn", meaning: "celebración" }
        ]
      },
      {
        id: "feria_libro_1",
        img: "assets/images/memories/feriaDelLibroICUMSS.jpg",
        seal: "书海",
        category: "events",
        title: "Feria Internacional del Libro — Pabellón ICUMSS",
        titleEn: "International Book Fair — ICUMSS Pavilion",
        hanzi: "书香致远 — 国际书展孔子学院展位",
        pinyin: "Shūxiāng Zhìyuǎn — Guójì Shūzhǎn Zhǎnwèi",
        desc: "Llevando la literatura, diccionarios HSK y cultura milenaria china al público de Cochabamba en la Feria del Libro.",
        descEn: "Sharing Chinese literature, HSK textbooks, and cultural heritage with the Cochabamba community.",
        tags: ["Feria del Libro", "Literatura", "ICUMSS", "Difusión"],
        vocab: [
          { hanzi: "图书", pinyin: "túshū", meaning: "libros" },
          { hanzi: "展览", pinyin: "zhǎnlǎn", meaning: "exhibición" }
        ]
      },
      {
        id: "feria_libro_2",
        img: "assets/images/memories/feriaDelLibroICUMSS(2).jpg",
        seal: "博雅",
        category: "events",
        title: "Feria del Libro — Actividades y Talleres Culturales",
        titleEn: "Book Fair — Interactive Cultural Workshops",
        hanzi: "文化传播 — 书展互动体验与展示",
        pinyin: "Wénhuà Chuánbō — Shūzhǎn Hùdòng Tǐyàn",
        desc: "Demostraciones en vivo de caligrafía, corte de papel y asesoramiento académico para nuevos estudiantes.",
        descEn: "Live calligraphy demonstrations, paper cutting, and academic guidance for new learners.",
        tags: ["Talleres", "Comunidad", "Feria del Libro"],
        vocab: [
          { hanzi: "体验", pinyin: "tǐyàn", meaning: "experiencia" },
          { hanzi: "文化", pinyin: "wénhuà", meaning: "cultura" }
        ]
      },
      {
        id: "auditorio_humanidades",
        img: "assets/images/memories/auditorioHumanidades.jpg",
        seal: "雅聚",
        category: "events",
        title: "Auditorio de Humanidades — Gala Artística UMSS",
        titleEn: "Humanities Auditorium — UMSS Cultural Gala",
        hanzi: "高朋满座 — 人文学院礼堂文化汇演",
        pinyin: "Gāopéng Mǎnzuò — Rénwén Xuéyuàn Lǐtáng Huìyǎn",
        desc: "Gran presentación folclórica y artística en el auditorio de la Facultad de Humanidades y Ciencias de la Educación.",
        descEn: "Grand artistic and folk performance at the UMSS Faculty of Humanities Auditorium.",
        tags: ["Humanidades", "UMSS", "Auditorio", "Gala"],
        vocab: [
          { hanzi: "礼堂", pinyin: "lǐtáng", meaning: "auditorio" },
          { hanzi: "表演", pinyin: "biǎoyǎn", meaning: "presentación" }
        ]
      },
      {
        id: "casa_cultura",
        img: "assets/images/memories/casaDeLaCultura.jpg",
        seal: "古韵",
        category: "events",
        title: "Casa de la Cultura — Muestra Tradicional China",
        titleEn: "Casa de la Cultura — Traditional Chinese Exhibition",
        hanzi: "古韵今辉 — 文化中心传统风采展",
        pinyin: "Gǔyùn Jīnhuī — Wénhuà Zhōngxīn Zhǎn",
        desc: "Exhibición de vestimentas tradicionales Hanfu, instrumentos y arte en los históricos salones de la Casa de la Cultura.",
        descEn: "Exhibition of Hanfu attire, instruments, and classical art at the Casa de la Cultura.",
        tags: ["Casa de la Cultura", "Patrimonio", "Cochabamba"],
        vocab: [
          { hanzi: "传统", pinyin: "chuántǒng", meaning: "tradicional" },
          { hanzi: "艺术", pinyin: "yìshù", meaning: "arte" }
        ]
      },
      {
        id: "exposicion_china_1",
        img: "assets/images/memories/expocisionChina.jpg",
        seal: "广博",
        category: "events",
        title: "Gran Exposición de Cultura China",
        titleEn: "Grand Chinese Culture Exhibition",
        hanzi: "博大精深 — 中华风采主题展",
        pinyin: "Bódà Jīngshēn — Zhōnghuá Fēngcǎi Zhǎn",
        desc: "Un recorrido fascinante por milenios de civilización, filosofía, artesanía y sabiduría oriental.",
        descEn: "A fascinating journey through thousands of years of Chinese civilization and philosophy.",
        tags: ["Exposición", "Civilización", "Filosofía"],
        vocab: [
          { hanzi: "博大精深", pinyin: "bódà jīngshēn", meaning: "amplio y profundo" },
          { hanzi: "历史", pinyin: "lìshǐ", meaning: "historia" }
        ]
      },
      {
        id: "exposicion_china_2",
        img: "assets/images/memories/exposicionChina.jpg",
        seal: "华彩",
        category: "events",
        title: "Muestra de Tradiciones y Artesanías Orientales",
        titleEn: "Traditional Crafts & Folklore Exhibition",
        hanzi: "物华天宝 — 东方民俗手工艺展品",
        pinyin: "Wùhuá Tiānbǎo — Dōngfāng Mínsù Zhǎnpǐn",
        desc: "Apreciando detalles de trajes étnicos, nudos chinos y reliquias culturales compartidas en el ICUMSS.",
        descEn: "Appreciating intricate ethnic costumes, Chinese knots, and cultural relics at ICUMSS.",
        tags: ["Artesanía", "Tradición", "Folclor"],
        vocab: [
          { hanzi: "民俗", pinyin: "mínsù", meaning: "costumbres populares" },
          { hanzi: "展品", pinyin: "zhǎnpǐn", meaning: "artículos de exposición" }
        ]
      },

      // 5. SPECIAL MOMENTS & FRIENDSHIP
      {
        id: "nicole_recuerdo",
        img: "assets/images/memories/nicole_recuerdo.jpg",
        seal: "冠军",
        category: "friendship",
        title: "Nicole — 1.er Lugar Concurso Puente Chino & Amistad Inolvidable 🏆",
        titleEn: "Nicole — 1st Place Chinese Bridge Champion & Cherished Friendship 🏆",
        hanzi: "并肩同行 · 汉语桥总冠军 — 璀璨荣耀与真挚情谊",
        pinyin: "Bìngjiān Tóngxíng · Hànyǔ Qiáo Guànjūn — Cuǐcàn Róngyào",
        desc: "¡Celebrando el histórico 1.er Lugar de Nicole en el Concurso Mundial Puente Chino (汉语桥)! Un testimonio de talento, perseverancia y elocuencia que celebramos con inmenso orgullo, compartiendo momentos inolvidables de complicidad, estudio y amistad que perduran para siempre.",
        descEn: "Celebrating Nicole's historic 1st Place victory at the Chinese Bridge Competition (汉语桥)! A testament to talent and perseverance celebrated with great pride, alongside memories of friendship.",
        tags: ["Nicole", "1er Lugar", "Puente Chino", "Campeona", "Amistad", "Orgullo", "ICUMSS"],
        vocab: [
          { hanzi: "冠军", pinyin: "guànjūn", meaning: "campeón / 1er lugar" },
          { hanzi: "汉语桥", pinyin: "Hànyǔ Qiáo", meaning: "Puente Chino" },
          { hanzi: "朋友", pinyin: "péngyou", meaning: "amigo/a" },
          { hanzi: "友谊", pinyin: "yǒuyì", meaning: "amistad" },
          { hanzi: "美好", pinyin: "měihǎo", meaning: "hermoso / maravilloso" }
        ]
      }
    ];

    // Listen for language switch
    window.addEventListener("languageChanged", () => {
      this.render();
    });
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  get lang() {
    return (window.languageManager && window.languageManager.currentLanguage) || "es";
  }

  loadFavorites() {
    try {
      const raw = localStorage.getItem("hsk_memory_favs");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem("hsk_memory_favs", JSON.stringify(this.favorites));
    } catch (e) {
      console.warn("Could not save favorites:", e);
    }
  }

  toggleFavorite(id, e) {
    if (e) e.stopPropagation();
    const idx = this.favorites.indexOf(id);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(id);
    }
    this.saveFavorites();
    this.render();
  }

  loadNote(id) {
    try {
      return localStorage.getItem(`hsk_memory_note_${id}`) || "";
    } catch {
      return "";
    }
  }

  saveNote(id, text) {
    try {
      localStorage.setItem(`hsk_memory_note_${id}`, text.trim());
    } catch (e) {
      console.warn("Could not save note:", e);
    }
  }

  async init() {
    this.render();
    this.attachGlobalListeners();
  }

  attachGlobalListeners() {
    document.addEventListener("keydown", (e) => {
      const modal = document.getElementById("memory-lightbox-modal");
      if (!modal || !modal.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        this.closeLightbox();
      } else if (e.key === "ArrowLeft") {
        this.navigateLightbox(-1);
      } else if (e.key === "ArrowRight") {
        this.navigateLightbox(1);
      }
    });
  }

  getFilteredData() {
    let list = this.memoriesData;

    // Filter by Category
    if (this.currentCategory === "favorites") {
      list = list.filter((item) => this.favorites.includes(item.id));
    } else if (this.currentCategory !== "all") {
      list = list.filter((item) => item.category === this.currentCategory);
    }

    // Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.hanzi.toLowerCase().includes(q) ||
          item.pinyin.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.vocab.some(
            (v) =>
              v.hanzi.includes(q) ||
              v.pinyin.toLowerCase().includes(q) ||
              v.meaning.toLowerCase().includes(q),
          ),
      );
    }

    return list;
  }

  getCategoryCount(cat) {
    if (cat === "all") return this.memoriesData.length;
    if (cat === "favorites") return this.favorites.length;
    return this.memoriesData.filter((item) => item.category === cat).length;
  }

  render() {
    if (!this.container) return;

    const isEs = this.lang === "es";
    const filteredList = this.getFilteredData();

    this.container.innerHTML = `
      <div class="memories-container">
        <!-- 1. HERO BANNER -->
        <header class="memories-hero">
          <div class="memories-hero-content">
            <div class="memories-hero-header">
              <div class="memories-title-group">
                <div class="memories-badge-row">
                  <span class="memories-badge">
                    <span>🏮</span> ICUMSS · Confucio UMSS
                  </span>
                  <span class="memories-badge memories-badge-icumss">
                    <span>📜</span> ${isEs ? "27 Momentos Inolvidables" : "27 Unforgettable Memories"}
                  </span>
                </div>
                <h1 class="memories-title">
                  ${isEs ? "Baúl de los Recuerdos" : "Memory Trunk"}
                  <span class="memories-title-hanzi">记忆宝盒</span>
                </h1>
                <p class="memories-subtitle">
                  ${
                    isEs
                      ? "Mi trayectoria, maestros y vivencias en el Instituto Confucio de la Universidad Mayor de San Simón (ICUMSS). Cada fotografía encierra una lección, una meta cumplida y recuerdos imborrables."
                      : "My journey, teachers, and experiences at the Confucius Institute of UMSS. Each photograph holds a lesson, a milestone, and unforgettable memories."
                  }
                </p>
              </div>

              <!-- Action buttons -->
              <div class="memories-hero-actions">
                <button type="button" class="memories-hero-btn memories-hero-btn-primary" id="memories-chest-btn">
                  <span>🎁</span> ${isEs ? "Abrir el Baúl (Al Azar)" : "Open Mystery Chest"}
                </button>
                <button type="button" class="memories-hero-btn memories-hero-btn-secondary" id="memories-slideshow-btn">
                  <span>🎬</span> ${isEs ? "Presentación" : "Slideshow"}
                </button>
              </div>
            </div>

            <!-- Stats summary -->
            <div class="memories-stats-bar">
              <div class="memories-stat-item">
                <span class="memories-stat-val">27</span>
                <span class="memories-stat-lbl">${isEs ? "Fotografías" : "Photographs"}</span>
              </div>
              <div class="memories-stat-item">
                <span class="memories-stat-val">11</span>
                <span class="memories-stat-lbl">${isEs ? "Momentos con Docentes" : "Teacher Moments"}</span>
              </div>
              <div class="memories-stat-item">
                <span class="memories-stat-val">HSK 1 ➔ 3</span>
                <span class="memories-stat-lbl">${isEs ? "Niveles Conquistados" : "Levels Achieved"}</span>
              </div>
              <div class="memories-stat-item">
                <span class="memories-stat-val">${this.favorites.length}</span>
                <span class="memories-stat-lbl">${isEs ? "Favoritos" : "Favorites"} ❤️</span>
              </div>
            </div>
          </div>
        </header>

        <!-- 2. CONTROLS BAR -->
        <section class="memories-controls-bar" aria-label="Filtros de recuerdos">
          <div class="memories-search-and-views">
            <!-- Search -->
            <div class="memories-search-box">
              <svg class="memories-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                class="memories-search-input"
                id="memories-search-input"
                placeholder="${isEs ? "Buscar por profesor, evento, HSK o palabra china..." : "Search by teacher, event, HSK, or Chinese keyword..."}"
                value="${this.searchQuery}"
              />
            </div>

            <!-- View Switcher -->
            <div class="memories-view-switchers" role="tablist" aria-label="Cambiar vista de galería">
              <button
                type="button"
                class="memories-view-btn ${this.currentView === "grid" ? "is-active" : ""}"
                data-view="grid"
                title="${isEs ? "Vista de Mosaico" : "Grid View"}"
              >
                <span>🔲</span> ${isEs ? "Mosaico" : "Grid"}
              </button>
              <button
                type="button"
                class="memories-view-btn ${this.currentView === "timeline" ? "is-active" : ""}"
                data-view="timeline"
                title="${isEs ? "Vista de Línea de Tiempo" : "Timeline View"}"
              >
                <span>⏳</span> ${isEs ? "Línea de Tiempo" : "Timeline"}
              </button>
              <button
                type="button"
                class="memories-view-btn ${this.currentView === "slideshow" ? "is-active" : ""}"
                data-view="slideshow"
                title="${isEs ? "Modo Presentación" : "Slideshow Mode"}"
              >
                <span>🎬</span> ${isEs ? "Presentación" : "Slideshow"}
              </button>
            </div>
          </div>

          <!-- Category Chips -->
          <div class="memories-categories" role="group" aria-label="Categorías">
            <button type="button" class="memories-cat-chip ${this.currentCategory === "all" ? "is-active" : ""}" data-cat="all">
              <span>🌟</span> ${isEs ? "Todos" : "All"}
              <span class="memories-cat-count">${this.getCategoryCount("all")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "teachers" ? "is-active" : ""}" data-cat="teachers">
              <span>👨‍🏫</span> ${isEs ? "Maestros & Liderazgo" : "Teachers & Leaders"}
              <span class="memories-cat-count">${this.getCategoryCount("teachers")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "milestones" ? "is-active" : ""}" data-cat="milestones">
              <span>🎓</span> ${isEs ? "Hitos & Exámenes HSK" : "HSK Milestones"}
              <span class="memories-cat-count">${this.getCategoryCount("milestones")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "contests" ? "is-active" : ""}" data-cat="contests">
              <span>🖌️</span> ${isEs ? "Concursos & Caligrafía" : "Contests & Calligraphy"}
              <span class="memories-cat-count">${this.getCategoryCount("contests")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "events" ? "is-active" : ""}" data-cat="events">
              <span>🏮</span> ${isEs ? "Cultura & Eventos" : "Culture & Events"}
              <span class="memories-cat-count">${this.getCategoryCount("events")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "friendship" ? "is-active" : ""}" data-cat="friendship">
              <span>💖</span> ${isEs ? "Momentos Especiales" : "Special Moments"}
              <span class="memories-cat-count">${this.getCategoryCount("friendship")}</span>
            </button>
            <button type="button" class="memories-cat-chip ${this.currentCategory === "favorites" ? "is-active" : ""}" data-cat="favorites">
              <span>❤️</span> ${isEs ? "Mis Favoritos" : "Favorites"}
              <span class="memories-cat-count">${this.getCategoryCount("favorites")}</span>
            </button>
          </div>
        </section>

        <!-- 3. MAIN CONTENT VIEW -->
        <main id="memories-main-view">
          ${this.renderActiveView(filteredList)}
        </main>
      </div>

      <!-- 4. LIGHTBOX MODAL -->
      <div id="memory-lightbox-modal" class="memory-lightbox-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="memory-lightbox-dialog">
          <button type="button" class="memory-lightbox-close-btn" id="memory-lightbox-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Media container -->
          <div class="memory-lightbox-media">
            <button type="button" class="memory-lightbox-nav-btn memory-lightbox-nav-prev" id="memory-lightbox-prev" aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <img id="memory-lightbox-img" class="memory-lightbox-img" src="" alt="Recuerdo ICUMSS" />

            <button type="button" class="memory-lightbox-nav-btn memory-lightbox-nav-next" id="memory-lightbox-next" aria-label="Siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <!-- Info sidebar -->
          <div class="memory-lightbox-info">
            <div class="memory-lightbox-header">
              <div>
                <div class="memory-lightbox-hanzi" id="memory-lightbox-hanzi"></div>
                <div class="memory-lightbox-pinyin" id="memory-lightbox-pinyin"></div>
              </div>
              <button type="button" class="memory-card-fav-btn" id="memory-lightbox-fav-btn" title="Guardar en favoritos">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            <h3 class="memory-lightbox-title" id="memory-lightbox-title"></h3>
            <p class="memory-lightbox-desc" id="memory-lightbox-desc"></p>

            <button type="button" class="memory-lightbox-audio-btn" id="memory-lightbox-audio">
              <span>🔊</span> ${isEs ? "Pronunciar en Chino" : "Hear Pronunciation"}
            </button>

            <div class="memory-lightbox-vocab-box">
              <div class="memory-lightbox-vocab-title">${isEs ? "Vocabulario Destacado" : "Featured Vocabulary"}</div>
              <div class="memory-lightbox-vocab-list" id="memory-lightbox-vocab-list"></div>
            </div>

            <!-- Private user note editor -->
            <div class="memory-lightbox-notes-box">
              <div class="memory-notes-label">
                <span>📝 ${isEs ? "Mis Apuntes de este Recuerdo" : "My Personal Notes"}</span>
                <span class="memory-notes-save-msg" id="memory-notes-save-msg">Guardado ✓</span>
              </div>
              <textarea
                class="memory-notes-textarea"
                id="memory-notes-textarea"
                placeholder="${isEs ? "Escribe tus anécdotas o apuntes sobre esta foto..." : "Write your personal notes or anecdotes..."}"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. MYSTERY CHEST (BAÚL MÁGICO) MODAL -->
      <div id="memory-chest-modal" class="memory-chest-modal" aria-hidden="true" role="dialog">
        <div class="memory-chest-dialog">
          <div class="memory-chest-icon-wrap">🎁</div>
          <h2 style="font-family: var(--font-display); color: var(--color-primary); margin: 0 0 6px;">
            ${isEs ? "¡Has Abierto el Baúl de los Recuerdos!" : "You opened the Memory Chest!"}
          </h2>
          <p style="font-size: 0.9rem; color: var(--color-text-muted); margin: 0 0 14px;">
            ${isEs ? "Un recuerdo al azar de tu camino por el ICUMSS junto a una máxima tradicional china:" : "A random memory of your ICUMSS journey with a traditional Chinese proverb:"}
          </p>

          <div class="memory-chest-proverb" id="chest-proverb-box">
            <div class="memory-chest-proverb-hanzi" id="chest-proverb-hanzi"></div>
            <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--color-text-dim);" id="chest-proverb-pinyin"></div>
            <div class="memory-chest-proverb-meaning" id="chest-proverb-meaning"></div>
          </div>

          <div id="chest-revealed-card-wrap" style="margin: 16px 0;"></div>

          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 14px;">
            <button type="button" class="memories-hero-btn memories-hero-btn-primary" id="chest-inspect-btn">
              ${isEs ? "Ver en Detalle" : "Inspect Memory"}
            </button>
            <button type="button" class="memories-hero-btn memories-hero-btn-secondary" id="chest-another-btn">
              ${isEs ? "Sacar Otro" : "Draw Another"}
            </button>
            <button type="button" class="memories-hero-btn memories-hero-btn-secondary" id="chest-close-btn">
              ${isEs ? "Cerrar" : "Close"}
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderActiveView(list) {
    if (list.length === 0) {
      const isEs = this.lang === "es";
      return `
        <div class="memories-empty">
          <div class="memories-empty-icon">📭</div>
          <h3>${isEs ? "No se encontraron recuerdos" : "No memories found"}</h3>
          <p>${isEs ? "Intenta con otro término de búsqueda o selecciona otra categoría." : "Try another search keyword or pick a different category."}</p>
        </div>
      `;
    }

    if (this.currentView === "timeline") {
      return this.renderTimelineView(list);
    } else if (this.currentView === "slideshow") {
      return this.renderSlideshowView(list);
    }
    return this.renderGridView(list);
  }

  renderGridView(list) {
    const isEs = this.lang === "es";
    return `
      <div class="memories-grid">
        ${list
          .map((item) => {
            const isFav = this.favorites.includes(item.id);
            const userNote = this.loadNote(item.id);
            const catNames = {
              teachers: isEs ? "Docente" : "Teacher",
              milestones: isEs ? "Hito HSK" : "HSK Milestone",
              contests: isEs ? "Caligrafía" : "Calligraphy",
              events: isEs ? "Cultura" : "Culture",
              friendship: isEs ? "Amistad" : "Friendship"
            };
            return `
              <article class="memory-card" data-id="${item.id}" tabindex="0" role="button" aria-label="${isEs ? item.title : item.titleEn}">
                <div class="memory-card-img-wrap">
                  <img src="${item.img}" alt="${isEs ? item.title : item.titleEn}" class="memory-card-img" loading="lazy" />
                  <span class="memory-card-seal">${item.seal}</span>
                  <span class="memory-card-cat-badge">${catNames[item.category] || item.category}</span>
                  <button type="button" class="memory-card-fav-btn ${isFav ? "is-fav" : ""}" data-fav-id="${item.id}" title="${isFav ? "Quitar de favoritos" : "Guardar en favoritos"}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

                <div class="memory-card-body">
                  <div class="memory-card-hanzi">${item.hanzi}</div>
                  <div class="memory-card-pinyin">${item.pinyin}</div>
                  <h3 class="memory-card-title">${isEs ? item.title : item.titleEn}</h3>
                  <p class="memory-card-desc">${isEs ? item.desc : item.descEn}</p>

                  <div class="memory-card-footer">
                    <div class="memory-card-tags">
                      ${item.tags
                        .slice(0, 2)
                        .map((t) => `<span class="memory-card-tag">#${t}</span>`)
                        .join("")}
                    </div>
                    ${userNote ? `<span class="memory-card-note-badge" title="Tiene apuntes personales">📝</span>` : ""}
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  renderTimelineView(list) {
    const isEs = this.lang === "es";
    return `
      <div class="memories-timeline-wrap">
        ${list
          .map((item) => {
            return `
              <div class="timeline-item" data-id="${item.id}">
                <div class="timeline-node"></div>
                <div class="timeline-content">
                  <div class="timeline-card" data-id="${item.id}" tabindex="0">
                    <div class="timeline-img-wrap">
                      <img src="${item.img}" alt="${isEs ? item.title : item.titleEn}" class="timeline-img" loading="lazy" />
                      <span class="memory-card-seal">${item.seal}</span>
                    </div>
                    <div class="timeline-body">
                      <div class="timeline-hanzi">${item.hanzi}</div>
                      <h4 class="timeline-title">${isEs ? item.title : item.titleEn}</h4>
                      <p class="timeline-desc">${isEs ? item.desc : item.descEn}</p>
                      <div class="timeline-tags">
                        ${item.tags.map((t) => `<span class="memory-card-tag">#${t}</span>`).join("")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  renderSlideshowView(list) {
    const isEs = this.lang === "es";
    const current = list[this.slideshowIndex % list.length] || list[0];
    return `
      <div class="memories-slideshow-wrap">
        <div class="slideshow-stage">
          <img src="${current.img}" alt="${isEs ? current.title : current.titleEn}" class="slideshow-img" id="slideshow-active-img" />
          <div class="slideshow-overlay-info">
            <div class="slideshow-hanzi">${current.hanzi}</div>
            <div class="slideshow-title">${isEs ? current.title : current.titleEn}</div>
            <p class="slideshow-desc">${isEs ? current.desc : current.descEn}</p>
          </div>
        </div>

        <div class="slideshow-controls-bar">
          <button type="button" class="slideshow-ctrl-btn" id="slideshow-prev-btn">
            ◀ ${isEs ? "Anterior" : "Prev"}
          </button>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="slideshow-ctrl-btn" id="slideshow-play-btn">
              ${this.isSlideshowPlaying ? "⏸ " + (isEs ? "Pausar" : "Pause") : "▶ " + (isEs ? "Reproducir" : "Play")}
            </button>
            <span style="font-family: var(--font-mono); font-size: 0.85rem;">
              ${(this.slideshowIndex % list.length) + 1} / ${list.length}
            </span>
          </div>

          <button type="button" class="slideshow-ctrl-btn" id="slideshow-next-btn">
            ${isEs ? "Siguiente" : "Next"} ▶
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("memories-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        const main = document.getElementById("memories-main-view");
        if (main) {
          main.innerHTML = this.renderActiveView(this.getFilteredData());
          this.bindCardEvents();
        }
      });
    }

    // View switchers
    document.querySelectorAll(".memories-view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentView = btn.dataset.view;
        this.render();
      });
    });

    // Category chips
    document.querySelectorAll(".memories-cat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this.currentCategory = chip.dataset.cat;
        this.render();
      });
    });

    // Mystery Chest button in hero
    const chestBtn = document.getElementById("memories-chest-btn");
    if (chestBtn) {
      chestBtn.addEventListener("click", () => this.openMysteryChest());
    }

    // Slideshow button in hero
    const slideshowBtn = document.getElementById("memories-slideshow-btn");
    if (slideshowBtn) {
      slideshowBtn.addEventListener("click", () => {
        this.currentView = "slideshow";
        this.render();
      });
    }

    // Lightbox modal close & navigation
    const lbClose = document.getElementById("memory-lightbox-close");
    if (lbClose) lbClose.addEventListener("click", () => this.closeLightbox());

    const lbPrev = document.getElementById("memory-lightbox-prev");
    if (lbPrev) lbPrev.addEventListener("click", () => this.navigateLightbox(-1));

    const lbNext = document.getElementById("memory-lightbox-next");
    if (lbNext) lbNext.addEventListener("click", () => this.navigateLightbox(1));

    const lbAudio = document.getElementById("memory-lightbox-audio");
    if (lbAudio) {
      lbAudio.addEventListener("click", () => {
        const list = this.getFilteredData();
        const item = list[this.currentModalIndex];
        if (item) {
          this.playAudio(item.hanzi.split("—")[0].trim());
        }
      });
    }

    const lbNotes = document.getElementById("memory-notes-textarea");
    if (lbNotes) {
      lbNotes.addEventListener("input", (e) => {
        const list = this.getFilteredData();
        const item = list[this.currentModalIndex];
        if (item) {
          this.saveNote(item.id, e.target.value);
          const saveMsg = document.getElementById("memory-notes-save-msg");
          if (saveMsg) {
            saveMsg.style.display = "inline";
            setTimeout(() => {
              saveMsg.style.display = "none";
            }, 1200);
          }
        }
      });
    }

    const lbFavBtn = document.getElementById("memory-lightbox-fav-btn");
    if (lbFavBtn) {
      lbFavBtn.addEventListener("click", () => {
        const list = this.getFilteredData();
        const item = list[this.currentModalIndex];
        if (item) {
          this.toggleFavorite(item.id);
          lbFavBtn.classList.toggle("is-fav", this.favorites.includes(item.id));
        }
      });
    }

    // Mystery Chest dialog actions
    const chestClose = document.getElementById("chest-close-btn");
    if (chestClose) chestClose.addEventListener("click", () => this.closeMysteryChest());

    const chestAnother = document.getElementById("chest-another-btn");
    if (chestAnother) chestAnother.addEventListener("click", () => this.openMysteryChest());

    const chestInspect = document.getElementById("chest-inspect-btn");
    if (chestInspect) {
      chestInspect.addEventListener("click", () => {
        const revealedId = chestInspect.dataset.revealedId;
        this.closeMysteryChest();
        if (revealedId) {
          const list = this.getFilteredData();
          const idx = list.findIndex((m) => m.id === revealedId);
          if (idx > -1) {
            this.openLightbox(idx);
          } else {
            // Find in global list
            const gIdx = this.memoriesData.findIndex((m) => m.id === revealedId);
            this.currentCategory = "all";
            this.render();
            this.openLightbox(gIdx);
          }
        }
      });
    }

    this.bindCardEvents();
    this.bindSlideshowEvents();
  }

  bindCardEvents() {
    // Click on memory cards or timeline cards opens the lightbox
    document.querySelectorAll(".memory-card, .timeline-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // If clicking fav button, do not open modal
        if (e.target.closest(".memory-card-fav-btn")) return;
        const id = card.dataset.id;
        const list = this.getFilteredData();
        const idx = list.findIndex((item) => item.id === id);
        if (idx > -1) {
          this.openLightbox(idx);
        }
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Card Favorite Buttons
    document.querySelectorAll(".memory-card-fav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.favId;
        if (id) this.toggleFavorite(id, e);
      });
    });
  }

  bindSlideshowEvents() {
    const prevBtn = document.getElementById("slideshow-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const list = this.getFilteredData();
        this.slideshowIndex = (this.slideshowIndex - 1 + list.length) % list.length;
        this.render();
      });
    }

    const nextBtn = document.getElementById("slideshow-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const list = this.getFilteredData();
        this.slideshowIndex = (this.slideshowIndex + 1) % list.length;
        this.render();
      });
    }

    const playBtn = document.getElementById("slideshow-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        this.toggleSlideshowPlay();
      });
    }
  }

  toggleSlideshowPlay() {
    this.isSlideshowPlaying = !this.isSlideshowPlaying;
    if (this.isSlideshowPlaying) {
      this.slideshowInterval = setInterval(() => {
        const list = this.getFilteredData();
        this.slideshowIndex = (this.slideshowIndex + 1) % list.length;
        this.render();
      }, 4000);
    } else {
      if (this.slideshowInterval) clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
    this.render();
  }

  openLightbox(index) {
    const list = this.getFilteredData();
    if (index < 0 || index >= list.length) return;

    this.currentModalIndex = index;
    const item = list[index];
    const isEs = this.lang === "es";

    const modal = document.getElementById("memory-lightbox-modal");
    const img = document.getElementById("memory-lightbox-img");
    const hanzi = document.getElementById("memory-lightbox-hanzi");
    const pinyin = document.getElementById("memory-lightbox-pinyin");
    const title = document.getElementById("memory-lightbox-title");
    const desc = document.getElementById("memory-lightbox-desc");
    const vocabList = document.getElementById("memory-lightbox-vocab-list");
    const notes = document.getElementById("memory-notes-textarea");
    const favBtn = document.getElementById("memory-lightbox-fav-btn");

    if (modal && img) {
      img.src = item.img;
      hanzi.textContent = item.hanzi;
      pinyin.textContent = item.pinyin;
      title.textContent = isEs ? item.title : item.titleEn;
      desc.textContent = isEs ? item.desc : item.descEn;

      if (favBtn) {
        favBtn.classList.toggle("is-fav", this.favorites.includes(item.id));
      }

      if (vocabList) {
        vocabList.innerHTML = item.vocab
          .map(
            (v) => `
            <span class="memory-vocab-chip">
              <strong>${v.hanzi}</strong> <span>(${v.pinyin})</span> <em>${v.meaning}</em>
            </span>
          `,
          )
          .join("");
      }

      if (notes) {
        notes.value = this.loadNote(item.id);
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  }

  navigateLightbox(direction) {
    const list = this.getFilteredData();
    if (list.length === 0) return;
    const newIdx = (this.currentModalIndex + direction + list.length) % list.length;
    this.openLightbox(newIdx);
  }

  closeLightbox() {
    const modal = document.getElementById("memory-lightbox-modal");
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  openMysteryChest() {
    const randomMemory = this.memoriesData[Math.floor(Math.random() * this.memoriesData.length)];
    const randomProverb = this.proverbs[Math.floor(Math.random() * this.proverbs.length)];
    const isEs = this.lang === "es";

    const modal = document.getElementById("memory-chest-modal");
    const phanzi = document.getElementById("chest-proverb-hanzi");
    const ppinyin = document.getElementById("chest-proverb-pinyin");
    const pmeaning = document.getElementById("chest-proverb-meaning");
    const cardWrap = document.getElementById("chest-revealed-card-wrap");
    const inspectBtn = document.getElementById("chest-inspect-btn");

    if (modal && randomMemory && randomProverb) {
      phanzi.textContent = randomProverb.hanzi;
      ppinyin.textContent = randomProverb.pinyin;
      pmeaning.textContent = isEs ? `«${randomProverb.es}»` : `«${randomProverb.en}»`;

      cardWrap.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: center; text-align: left; background: var(--color-bg-hover); padding: 10px; border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
          <img src="${randomMemory.img}" alt="${randomMemory.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: var(--radius-md);" />
          <div>
            <div style="font-family: var(--font-chinese-serif); font-weight: 700; color: var(--color-primary);">${randomMemory.hanzi}</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">${isEs ? randomMemory.title : randomMemory.titleEn}</div>
          </div>
        </div>
      `;

      if (inspectBtn) {
        inspectBtn.dataset.revealedId = randomMemory.id;
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  }

  closeMysteryChest() {
    const modal = document.getElementById("memory-chest-modal");
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  playAudio(text) {
    if (this.app.audioController && typeof this.app.audioController.playText === "function") {
      this.app.audioController.playText(text);
    } else if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      window.speechSynthesis.speak(utterance);
    }
  }
}

window.MemoriesController = MemoriesController;
