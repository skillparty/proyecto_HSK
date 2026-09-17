// tone-visualizer-game.js — Motor del Visualizador de Curva de Tonos & Entonación

const TONE_MODELS_DATABASE = {
    1: {
        toneNumber: 1,
        name: "1º Tono: Alto y Nivelado (高平调 55)",
        nameEn: "1st Tone: High Level (55)",
        syllable: "mā",
        hanzi: "妈",
        meaning: "Madre",
        meaningEn: "Mother",
        pitchPoints: [
            { x: 0.1, y: 5.0 },
            { x: 0.3, y: 5.0 },
            { x: 0.5, y: 5.0 },
            { x: 0.7, y: 5.0 },
            { x: 0.9, y: 5.0 }
        ],
        rule: "Comienza en el nivel más alto (5) y mantén la voz completamente plana y constante, como cantar una nota 'Sol' sostenida.",
        ruleEn: "Start at the highest pitch (level 5) and keep your voice steady without dropping, like a sustained musical note.",
        frequencyRange: "5 ➔ 5 (440 Hz Constante)",
        baseHz: 440
    },
    2: {
        toneNumber: 2,
        name: "2º Tono: Ascendente (中升调 35)",
        nameEn: "2nd Tone: Rising (35)",
        syllable: "má",
        hanzi: "麻",
        meaning: "Cáñamo / Adormecer",
        meaningEn: "Hemp / Numb",
        pitchPoints: [
            { x: 0.1, y: 3.0 },
            { x: 0.3, y: 3.4 },
            { x: 0.5, y: 3.9 },
            { x: 0.7, y: 4.5 },
            { x: 0.9, y: 5.0 }
        ],
        rule: "Comienza en tono medio (3) y sube con decisión hasta el nivel más alto (5), como si hicieras una pregunta de sorpresa: '¿Qué?'",
        ruleEn: "Start at mid pitch (level 3) and rise quickly to the top (level 5), like asking 'What?' in surprise.",
        frequencyRange: "3 ➔ 5 (260 Hz ➔ 440 Hz)",
        baseHz: 280
    },
    3: {
        toneNumber: 3,
        name: "3º Tono: Descendente-Ascendente (降升调 214)",
        nameEn: "3rd Tone: Dipping / Low Falling-Rising (214)",
        syllable: "mǎ",
        hanzi: "马",
        meaning: "Caballo",
        meaningEn: "Horse",
        pitchPoints: [
            { x: 0.1, y: 2.2 },
            { x: 0.35, y: 1.2 },
            { x: 0.55, y: 1.0 },
            { x: 0.75, y: 2.4 },
            { x: 0.9, y: 4.0 }
        ],
        rule: "Baja la voz hasta el fondo de tu garganta (nivel 1) y luego elévala moderadamente hacia el nivel 4.",
        ruleEn: "Drop your voice low to your throat (level 1) and then allow it to rise back up towards level 4.",
        frequencyRange: "2 ➔ 1 ➔ 4 (220 Hz ➔ 150 Hz ➔ 350 Hz)",
        baseHz: 220
    },
    4: {
        toneNumber: 4,
        name: "4º Tono: Descendente y Firme (全降调 51)",
        nameEn: "4th Tone: High Falling (51)",
        syllable: "mà",
        hanzi: "骂",
        meaning: "Regañar / Insultar",
        meaningEn: "Scold",
        pitchPoints: [
            { x: 0.1, y: 5.0 },
            { x: 0.3, y: 4.0 },
            { x: 0.5, y: 2.8 },
            { x: 0.7, y: 1.8 },
            { x: 0.9, y: 1.0 }
        ],
        rule: "Inicia con fuerza en el nivel máximo (5) y déjalo caer de golpe hacia el nivel más bajo (1), como una orden firme: '¡No!'",
        ruleEn: "Start forcefully at the very top (level 5) and drop sharply to the bottom (level 1), like saying 'No!'",
        frequencyRange: "5 ➔ 1 (440 Hz ➔ 160 Hz)",
        baseHz: 440
    },
    0: {
        toneNumber: 0,
        name: "Tono Neutro: Corto y Ligero (轻声 ·)",
        nameEn: "Neutral Tone: Light & Short (·)",
        syllable: "ma",
        hanzi: "吗",
        meaning: "Partícula interrogativa",
        meaningEn: "Question Particle",
        pitchPoints: [
            { x: 0.25, y: 2.8 },
            { x: 0.45, y: 2.6 },
            { x: 0.65, y: 2.4 }
        ],
        rule: "Se pronuncia de forma muy breve, suave y relajada, descansando sobre la sílaba precedente sin esfuerzo.",
        ruleEn: "Pronounced quickly, softly and lightly without emphasizing any pitch contour.",
        frequencyRange: "Nivel 2.5 (Suave y Breve)",
        baseHz: 240
    }
};

const SYLLABLE_VARIATIONS_BANK = {
    ma: {
        1: { hanzi: "妈", pinyin: "mā", trans: "Madre", transEn: "Mother" },
        2: { hanzi: "麻", pinyin: "má", trans: "Cáñamo", transEn: "Hemp" },
        3: { hanzi: "马", pinyin: "mǎ", trans: "Caballo", transEn: "Horse" },
        4: { hanzi: "骂", pinyin: "mà", trans: "Regañar", transEn: "Scold" },
        0: { hanzi: "吗", pinyin: "ma", trans: "Partícula '¿?'", transEn: "Question particle" }
    },
    ba: {
        1: { hanzi: "八", pinyin: "bā", trans: "Ocho", transEn: "Eight" },
        2: { hanzi: "拔", pinyin: "bá", trans: "Arrancar", transEn: "Pull out" },
        3: { hanzi: "把", pinyin: "bǎ", trans: "Sujetar / Clasificador", transEn: "Hold / Measure word" },
        4: { hanzi: "爸", pinyin: "bà", trans: "Papá", transEn: "Dad" },
        0: { hanzi: "吧", pinyin: "ba", trans: "Sugerencia '¿vale?'", transEn: "Suggestion particle" }
    },
    da: {
        1: { hanzi: "搭", pinyin: "dā", trans: "Subir / Construir", transEn: "Build / Ride" },
        2: { hanzi: "达", pinyin: "dá", trans: "Alcanzar", transEn: "Reach / Achieve" },
        3: { hanzi: "打", pinyin: "dǎ", trans: "Golpear / Llamar", transEn: "Hit / Call" },
        4: { hanzi: "大", pinyin: "dà", trans: "Grande", transEn: "Big" },
        0: { hanzi: "哒", pinyin: "da", trans: "Onomatopeya", transEn: "Onomatopoeia" }
    },
    shi: {
        1: { hanzi: "师", pinyin: "shī", trans: "Maestro", transEn: "Master / Teacher" },
        2: { hanzi: "十", pinyin: "shí", trans: "Diez", transEn: "Ten" },
        3: { hanzi: "始", pinyin: "shǐ", trans: "Comenzar", transEn: "Begin" },
        4: { hanzi: "是", pinyin: "shì", trans: "Ser / Sí", transEn: "To be / Yes" },
        0: { hanzi: "匙", pinyin: "shi", trans: "Cuchara", transEn: "Spoon" }
    },
    ni: {
        1: { hanzi: "妮", pinyin: "nī", trans: "Chica / Niña", transEn: "Girl" },
        2: { hanzi: "泥", pinyin: "ní", trans: "Barro", transEn: "Mud" },
        3: { hanzi: "你", pinyin: "nǐ", trans: "Tú", transEn: "You" },
        4: { hanzi: "逆", pinyin: "nì", trans: "Contrario", transEn: "Contrary / Inverse" },
        0: { hanzi: "呢", pinyin: "ne", trans: "Partícula '¿y tú?'", transEn: "Follow-up particle" }
    },
    hao: {
        1: { hanzi: "蒿", pinyin: "hāo", trans: "Ajenjo", transEn: "Artemisia" },
        2: { hanzi: "毫", pinyin: "háo", trans: "Pelo fino / Milímetro", transEn: "Fine hair / Milli" },
        3: { hanzi: "好", pinyin: "hǎo", trans: "Bueno / Bien", transEn: "Good / Well" },
        4: { hanzi: "号", pinyin: "hào", trans: "Número / Fecha", transEn: "Number / Date" },
        0: { hanzi: "好", pinyin: "hào", trans: "Gustar", transEn: "To like" }
    },
    guo: {
        1: { hanzi: "锅", pinyin: "guō", trans: "Olla / Cazuela", transEn: "Pot / Pan" },
        2: { hanzi: "国", pinyin: "guó", trans: "País / Nación", transEn: "Country / Nation" },
        3: { hanzi: "裹", pinyin: "guǒ", trans: "Envolver", transEn: "Wrap" },
        4: { hanzi: "过", pinyin: "guò", trans: "Pasar / Cruzar", transEn: "Pass / Cross" },
        0: { hanzi: "过", pinyin: "guo", trans: "Aspecto experiencial", transEn: "Experiential particle" }
    }
};

const BISYLLABIC_WORDS_DATABASE = {
    nihao: {
        id: "nihao",
        hanzi: "你好",
        pinyin: "nǐhǎo",
        tonesSignature: "3+3 ➔ 2+3",
        meaning: "Hola (Regla de Sandhi)",
        meaningEn: "Hello (Tone Sandhi rule)",
        rule: "Regla de Sandhi: Dos 3º tonos seguidos hacen que el primero se pronuncie como 2º tono (35), mientras el segundo mantiene el 3º tono completo (214).",
        ruleEn: "Tone Sandhi: When two 3rd tones appear together, the first turns into a 2nd tone (35) while the second keeps its 3rd tone (214).",
        frequencyRange: "2º Tono (35) + 3º Tono (214)",
        pitchPoints: [
            { x: 0.05, y: 3.0 },
            { x: 0.15, y: 3.5 },
            { x: 0.25, y: 4.2 },
            { x: 0.38, y: 5.0 },
            { x: 0.55, y: 2.2 },
            { x: 0.65, y: 1.2 },
            { x: 0.75, y: 1.0 },
            { x: 0.85, y: 2.5 },
            { x: 0.95, y: 4.0 }
        ]
    },
    zhongguo: {
        id: "zhongguo",
        hanzi: "中国",
        pinyin: "zhōngguó",
        tonesSignature: "1+2 (55 + 35)",
        meaning: "China (País del Centro)",
        meaningEn: "China",
        rule: "1º tono alto sostenido (55) seguido de un 2º tono ascendente continuo y limpio (35).",
        ruleEn: "High level 1st tone (55) followed by a smooth rising 2nd tone (35).",
        frequencyRange: "1º Tono (55) + 2º Tono (35)",
        pitchPoints: [
            { x: 0.05, y: 5.0 },
            { x: 0.20, y: 5.0 },
            { x: 0.38, y: 5.0 },
            { x: 0.55, y: 3.0 },
            { x: 0.70, y: 3.8 },
            { x: 0.85, y: 4.5 },
            { x: 0.95, y: 5.0 }
        ]
    },
    xiexie: {
        id: "xiexie",
        hanzi: "谢谢",
        pinyin: "xièxie",
        tonesSignature: "4+0 (51 + ·)",
        meaning: "Gracias",
        meaningEn: "Thank you",
        rule: "4º tono tajante y descendente (51) seguido de una sílaba neutra corta, suave y áfona.",
        ruleEn: "Forceful falling 4th tone (51) followed by a soft, short neutral tone.",
        frequencyRange: "4º Tono (51) + Neutro (·)",
        pitchPoints: [
            { x: 0.05, y: 5.0 },
            { x: 0.18, y: 3.5 },
            { x: 0.30, y: 2.0 },
            { x: 0.40, y: 1.0 },
            { x: 0.65, y: 2.6 },
            { x: 0.78, y: 2.3 }
        ]
    },
    zaijian: {
        id: "zaijian",
        hanzi: "再见",
        pinyin: "zàijiàn",
        tonesSignature: "4+4 (51 + 51)",
        meaning: "Adiós / Hasta la vista",
        meaningEn: "Goodbye / See you again",
        rule: "Doble golpe descendente tajante: ambas sílabas caen con firmeza desde el nivel 5 al nivel 1.",
        ruleEn: "Double falling cadence: both syllables drop sharply from level 5 down to 1.",
        frequencyRange: "4º Tono (51) + 4º Tono (51)",
        pitchPoints: [
            { x: 0.05, y: 5.0 },
            { x: 0.18, y: 3.2 },
            { x: 0.30, y: 1.8 },
            { x: 0.40, y: 1.0 },
            { x: 0.58, y: 5.0 },
            { x: 0.72, y: 3.2 },
            { x: 0.85, y: 1.8 },
            { x: 0.95, y: 1.0 }
        ]
    },
    xuexi: {
        id: "xuexi",
        hanzi: "学习",
        pinyin: "xuéxí",
        tonesSignature: "2+2 (35 + 35)",
        meaning: "Estudiar / Aprender",
        meaningEn: "To study / learn",
        rule: "Doble tono ascendente consecutivo: sube con fluidez de nivel 3 a nivel 5 en ambas sílabas.",
        ruleEn: "Double rising cadence: rises smoothly from level 3 up to 5 twice consecutively.",
        frequencyRange: "2º Tono (35) + 2º Tono (35)",
        pitchPoints: [
            { x: 0.05, y: 3.0 },
            { x: 0.18, y: 3.8 },
            { x: 0.30, y: 4.5 },
            { x: 0.40, y: 5.0 },
            { x: 0.58, y: 3.0 },
            { x: 0.72, y: 3.8 },
            { x: 0.85, y: 4.5 },
            { x: 0.95, y: 5.0 }
        ]
    },
    mingtian: {
        id: "mingtian",
        hanzi: "明天",
        pinyin: "míngtiān",
        tonesSignature: "2+1 (35 + 55)",
        meaning: "Mañana (Día siguiente)",
        meaningEn: "Tomorrow",
        rule: "Asciende primero de 3 a 5 y se enlaza manteniendo el tono alto y firme en el nivel 5.",
        ruleEn: "Rises from 3 to 5 in the first syllable, then stays high and level at 5.",
        frequencyRange: "2º Tono (35) + 1º Tono (55)",
        pitchPoints: [
            { x: 0.05, y: 3.0 },
            { x: 0.18, y: 3.8 },
            { x: 0.30, y: 4.5 },
            { x: 0.40, y: 5.0 },
            { x: 0.58, y: 5.0 },
            { x: 0.75, y: 5.0 },
            { x: 0.95, y: 5.0 }
        ]
    },
    laoshi: {
        id: "laoshi",
        hanzi: "老师",
        pinyin: "lǎoshī",
        tonesSignature: "3+1 (21 + 55)",
        meaning: "Profesor / Maestro",
        meaningEn: "Teacher",
        rule: "Medio 3º tono: la voz desciende al fondo (21) sin subir, y salta inmediatamente al 1º tono alto (55).",
        ruleEn: "Half-3rd tone: pitch sinks low (21) without rising, jumping immediately into the high 1st tone (55).",
        frequencyRange: "Medio 3º Tono (21) + 1º Tono (55)",
        pitchPoints: [
            { x: 0.05, y: 2.2 },
            { x: 0.20, y: 1.4 },
            { x: 0.35, y: 1.0 },
            { x: 0.42, y: 1.0 },
            { x: 0.58, y: 5.0 },
            { x: 0.75, y: 5.0 },
            { x: 0.95, y: 5.0 }
        ]
    },
    kaishi: {
        id: "kaishi",
        hanzi: "开始",
        pinyin: "kāishǐ",
        tonesSignature: "1+3 (55 + 214)",
        meaning: "Comenzar / Empezar",
        meaningEn: "To start / begin",
        rule: "Inicia en nivel 5 alto y sostenido (55) y luego desciende al 1 antes de remontar en el 3º tono (214).",
        ruleEn: "Starts high and level (55), then executes a full falling-rising 3rd tone contour (214).",
        frequencyRange: "1º Tono (55) + 3º Tono (214)",
        pitchPoints: [
            { x: 0.05, y: 5.0 },
            { x: 0.20, y: 5.0 },
            { x: 0.38, y: 5.0 },
            { x: 0.55, y: 2.2 },
            { x: 0.65, y: 1.2 },
            { x: 0.75, y: 1.0 },
            { x: 0.85, y: 2.5 },
            { x: 0.95, y: 4.0 }
        ]
    }
};

const MINIMAL_PAIRS_BANK = [
    {
        wordA: { hanzi: "买", pinyin: "mǎi", trans: "Comprar (3º Tono)", transEn: "To buy (3rd)" },
        wordB: { hanzi: "卖", pinyin: "mài", trans: "Vender (4º Tono)", transEn: "To sell (4th)" }
    },
    {
        wordA: { hanzi: "问", pinyin: "wèn", trans: "Preguntar (4º Tono)", transEn: "To ask (4th)" },
        wordB: { hanzi: "吻", pinyin: "wěn", trans: "Besar (3º Tono)", transEn: "To kiss (3rd)" }
    },
    {
        wordA: { hanzi: "十", pinyin: "shí", trans: "Diez (2º Tono)", transEn: "Ten (2nd)" },
        wordB: { hanzi: "四", pinyin: "sì", trans: "Cuatro (4º Tono)", transEn: "Four (4th)" }
    },
    {
        wordA: { hanzi: "练习", pinyin: "liànxí", trans: "Practicar (4º + 2º)", transEn: "To practice" },
        wordB: { hanzi: "联系", pinyin: "liánxì", trans: "Contactar (2º + 4º)", transEn: "To contact" }
    },
    {
        wordA: { hanzi: "睡觉", pinyin: "shuìjiào", trans: "Dormir (4º + 4º)", transEn: "To sleep (4+4)" },
        wordB: { hanzi: "水饺", pinyin: "shuǐjiǎo", trans: "Empanadillas (3º + 3º)", transEn: "Dumplings (3+3)" }
    },
    {
        wordA: { hanzi: "知道", pinyin: "zhīdào", trans: "Saber (1º + 4º)", transEn: "To know (1+4)" },
        wordB: { hanzi: "迟到", pinyin: "chídào", trans: "Llegar tarde (2º + 4º)", transEn: "Be late (2+4)" }
    },
    {
        wordA: { hanzi: "眼睛", pinyin: "yǎnjing", trans: "Ojos (3º + Neutro)", transEn: "Eyes (3+0)" },
        wordB: { hanzi: "眼镜", pinyin: "yǎnjìng", trans: "Gafas / Lentes (3º + 4º)", transEn: "Glasses (3+4)" }
    },
    {
        wordA: { hanzi: "大意", pinyin: "dàyi", trans: "Descuidado (4º + Neutro)", transEn: "Careless (4+0)" },
        wordB: { hanzi: "大意", pinyin: "dàyì", trans: "Idea central (4º + 4º)", transEn: "Main idea (4+4)" }
    }
];

class ToneVisualizerGame {
    constructor(app) {
        this.app = app;
        this.mode = "mono"; // 'mono' | 'bisyllabic'
        this.currentTone = 1;
        this.currentSyllable = "ma";
        this.currentWordId = "nihao";
        this.playbackRate = 1.0;
        this.userPitchCurve = null;
        this.isPracticing = false;

        // Audio & pitch tracking state
        this.audioCtx = null;
        this.mediaStream = null;
        this.analyser = null;
        this.recordingRafId = null;
        this.recordStartTime = 0;
        this.activeRecordedPoints = [];

        this.boundKeyHandler = this.handleKeyboard.bind(this);
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderMinimalPairs();
        this.loadCurrentTarget();
    }

    cacheDOM() {
        this.container = document.getElementById("tone-visualizer");
        this.canvas = document.getElementById("pitch-graph-canvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

        this.tabMonoBtn = document.getElementById("tone-tab-mono");
        this.tabBisyllabicBtn = document.getElementById("tone-tab-bisyllabic");
        this.monoPanel = document.getElementById("mono-controls-panel");
        this.bisyllabicPanel = document.getElementById("bisyllabic-controls-panel");

        this.toneTitle = document.getElementById("vis-tone-title");
        this.pinyinDisplay = document.getElementById("vis-pinyin-display");
        this.canvasStatus = document.getElementById("tone-canvas-status");
        this.ruleDesc = document.getElementById("tone-rule-desc");
        this.freqBadge = document.getElementById("tone-freq-badge");

        this.playAudioBtn = document.getElementById("tone-play-audio-btn");
        this.slowAudioBtn = document.getElementById("tone-slow-audio-btn");
        this.recordBtn = document.getElementById("tone-record-btn");
        this.recordLabel = document.getElementById("tone-record-label");

        this.feedbackBanner = document.getElementById("tone-feedback-banner");
        this.feedbackScore = document.getElementById("feedback-score-circle");
        this.feedbackHeading = document.getElementById("feedback-heading");
        this.feedbackDesc = document.getElementById("feedback-desc");

        this.valMetricAcc = document.getElementById("val-metric-acc");
        this.valMetricHeight = document.getElementById("val-metric-height");
        this.valMetricContour = document.getElementById("val-metric-contour");

        this.pairsList = document.getElementById("minimal-pairs-list");
    }

    bindEvents() {
        // Mode Tabs (Monosyllabic vs Bisyllabic)
        if (this.tabMonoBtn) {
            this.tabMonoBtn.addEventListener("click", () => this.switchMode("mono"));
        }
        if (this.tabBisyllabicBtn) {
            this.tabBisyllabicBtn.addEventListener("click", () => this.switchMode("bisyllabic"));
        }

        // Monosyllabic Tone Pills (1, 2, 3, 4, 0)
        document.querySelectorAll(".tone-pill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tone-pill-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const tone = parseInt(btn.getAttribute("data-tone"), 10);
                this.currentTone = tone;
                this.loadCurrentTarget();
            });
        });

        // Syllable Chips (ma, ba, da, shi, ni, hao, guo)
        document.querySelectorAll(".syllable-chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                document.querySelectorAll(".syllable-chip").forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                this.currentSyllable = chip.getAttribute("data-syllable") || "ma";
                this.updatePillLabelsForSyllable();
                this.loadCurrentTarget();
            });
        });

        // Bisyllabic Word Chips
        document.querySelectorAll(".word-chip-btn").forEach((chip) => {
            chip.addEventListener("click", () => {
                document.querySelectorAll(".word-chip-btn").forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                this.currentWordId = chip.getAttribute("data-word-id") || "nihao";
                this.loadCurrentTarget();
            });
        });

        // Speed Pills (1.0x, 0.75x, 0.5x)
        document.querySelectorAll(".speed-pill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".speed-pill-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.playbackRate = parseFloat(btn.getAttribute("data-speed")) || 1.0;
            });
        });

        // Audio Action Buttons
        if (this.playAudioBtn) {
            this.playAudioBtn.addEventListener("click", () => this.playModelAudio(this.playbackRate));
        }

        if (this.slowAudioBtn) {
            this.slowAudioBtn.addEventListener("click", () => this.playModelAudio(0.75));
        }

        if (this.recordBtn) {
            this.recordBtn.addEventListener("click", () => this.togglePractice());
        }

        // Global Keyboard Handler
        window.removeEventListener("keydown", this.boundKeyHandler);
        window.addEventListener("keydown", this.boundKeyHandler);
    }

    handleKeyboard(e) {
        if (!this.container || this.container.style.display === "none") return;
        const tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;

        if (this.mode === "mono") {
            if (["1", "2", "3", "4", "0"].includes(e.key)) {
                const tone = parseInt(e.key, 10);
                const pill = document.querySelector(`.tone-pill-btn[data-tone="${tone}"]`);
                if (pill) pill.click();
            }
        }

        if (e.code === "Space") {
            e.preventDefault();
            this.playModelAudio(this.playbackRate);
        } else if (e.key === "r" || e.key === "R") {
            e.preventDefault();
            this.togglePractice();
        }
    }

    switchMode(mode) {
        this.mode = mode;
        this.userPitchCurve = null;
        if (this.feedbackBanner) this.feedbackBanner.style.display = "none";

        if (mode === "mono") {
            if (this.tabMonoBtn) this.tabMonoBtn.classList.add("active");
            if (this.tabBisyllabicBtn) this.tabBisyllabicBtn.classList.remove("active");
            if (this.monoPanel) this.monoPanel.style.display = "block";
            if (this.bisyllabicPanel) this.bisyllabicPanel.style.display = "none";
        } else {
            if (this.tabMonoBtn) this.tabMonoBtn.classList.remove("active");
            if (this.tabBisyllabicBtn) this.tabBisyllabicBtn.classList.add("active");
            if (this.monoPanel) this.monoPanel.style.display = "none";
            if (this.bisyllabicPanel) this.bisyllabicPanel.style.display = "block";
        }

        this.loadCurrentTarget();
    }

    updatePillLabelsForSyllable() {
        const syl = this.currentSyllable;
        const sylData = SYLLABLE_VARIATIONS_BANK[syl];
        if (!sylData) return;

        document.querySelectorAll(".tone-pill-btn").forEach((btn) => {
            const tone = parseInt(btn.getAttribute("data-tone"), 10);
            const varItem = sylData[tone];
            const charSpan = btn.querySelector(".tone-pill-char");
            if (charSpan && varItem) {
                charSpan.textContent = `${varItem.pinyin} ${varItem.hanzi}`;
            }
        });
    }

    getCurrentModel() {
        const isEs = this.app?.currentLanguage !== "en";

        if (this.mode === "mono") {
            const baseModel = TONE_MODELS_DATABASE[this.currentTone] || TONE_MODELS_DATABASE[1];
            const sylData = SYLLABLE_VARIATIONS_BANK[this.currentSyllable]?.[this.currentTone];

            return {
                isBisyllabic: false,
                toneNumber: baseModel.toneNumber,
                name: isEs ? baseModel.name : baseModel.nameEn,
                syllable: sylData ? sylData.pinyin : baseModel.syllable,
                hanzi: sylData ? sylData.hanzi : baseModel.hanzi,
                meaning: isEs ? (sylData ? sylData.trans : baseModel.meaning) : (sylData ? sylData.transEn : baseModel.meaningEn),
                pitchPoints: baseModel.pitchPoints,
                rule: isEs ? baseModel.rule : baseModel.ruleEn,
                frequencyRange: baseModel.frequencyRange,
                baseHz: baseModel.baseHz
            };
        }

        const word = BISYLLABIC_WORDS_DATABASE[this.currentWordId] || BISYLLABIC_WORDS_DATABASE.nihao;
        return {
            isBisyllabic: true,
            toneNumber: null,
            name: `${word.hanzi} (${word.tonesSignature})`,
            syllable: word.pinyin,
            hanzi: word.hanzi,
            meaning: isEs ? word.meaning : word.meaningEn,
            pitchPoints: word.pitchPoints,
            rule: isEs ? word.rule : word.ruleEn,
            frequencyRange: word.frequencyRange,
            baseHz: 300
        };
    }

    loadCurrentTarget() {
        this.userPitchCurve = null;
        if (this.feedbackBanner) this.feedbackBanner.style.display = "none";
        this.updateStatusBadge(this.app?.currentLanguage === "en" ? "Ready to practice" : "Listo para practicar");

        const model = this.getCurrentModel();
        if (!model) return;

        if (this.toneTitle) {
            this.toneTitle.textContent = model.name;
        }
        if (this.pinyinDisplay) {
            this.pinyinDisplay.textContent = `${model.syllable} · ${model.hanzi} (${model.meaning})`;
        }
        if (this.ruleDesc) {
            this.ruleDesc.textContent = model.rule;
        }
        if (this.freqBadge) {
            this.freqBadge.innerHTML = `<span>Frecuencia / Chao:</span> <strong>${model.frequencyRange}</strong>`;
        }

        this.drawPitchGraph();
    }

    loadTone(toneNumber) {
        // Backwards compatible method used in existing tests & controllers
        this.currentTone = toneNumber;
        this.switchMode("mono");
        const pill = document.querySelector(`.tone-pill-btn[data-tone="${toneNumber}"]`);
        if (pill) {
            document.querySelectorAll(".tone-pill-btn").forEach((b) => b.classList.remove("active"));
            pill.classList.add("active");
        }
        this.loadCurrentTarget();
    }

    updateStatusBadge(text) {
        if (this.canvasStatus) {
            this.canvasStatus.textContent = text;
        }
    }

    drawPitchGraph() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Fondo oscuro y elegante
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        const topPadding = 32;
        const bottomPadding = 32;
        const leftPadding = 56;
        const rightPadding = 30;
        const graphHeight = h - topPadding - bottomPadding;
        const graphWidth = w - leftPadding - rightPadding;

        // 5 Niveles de Escala Chao
        const pitchLevels = [
            { level: 5, label: "5 (Alto / High)", color: "#475569" },
            { level: 4, label: "4 (Medio-Alto)", color: "#334155" },
            { level: 3, label: "3 (Medio / Mid)", color: "#334155" },
            { level: 2, label: "2 (Medio-Bajo)", color: "#334155" },
            { level: 1, label: "1 (Bajo / Low)", color: "#475569" }
        ];

        pitchLevels.forEach((p) => {
            const y = topPadding + (5 - p.level) * (graphHeight / 4);

            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.level === 5 || p.level === 1 ? 1.5 : 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(w - rightPadding, y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px system-ui, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(p.label, leftPadding - 10, y + 4);
        });

        // En modo bisilábico: divisor vertical en el centro (transición entre sílabas)
        const model = this.getCurrentModel();
        if (model && model.isBisyllabic) {
            const midX = leftPadding + graphWidth * 0.48;
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(midX, topPadding);
            ctx.lineTo(midX, h - bottomPadding);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "#64748b";
            ctx.font = "10px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Sílaba 1", leftPadding + graphWidth * 0.22, topPadding - 12);
            ctx.fillText("Sílaba 2", leftPadding + graphWidth * 0.74, topPadding - 12);
        }

        if (!model || !model.pitchPoints) return;

        // 1. Banda o Corredor de Tolerancia (Área sombreada alrededor del modelo nativo)
        const tol = 0.42; // ±0.42 niveles de tolerancia
        ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        // Borde superior
        model.pitchPoints.forEach((pt, idx) => {
            const px = leftPadding + pt.x * graphWidth;
            const pyTop = topPadding + (5 - Math.min(5, pt.y + tol)) * (graphHeight / 4);
            if (idx === 0) ctx.moveTo(px, pyTop);
            else ctx.lineTo(px, pyTop);
        });
        // Borde inferior invertido
        for (let i = model.pitchPoints.length - 1; i >= 0; i--) {
            const pt = model.pitchPoints[i];
            const px = leftPadding + pt.x * graphWidth;
            const pyBottom = topPadding + (5 - Math.max(1, pt.y - tol)) * (graphHeight / 4);
            ctx.lineTo(px, pyBottom);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Curva Nativa (Azul Cyan con resplandor)
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        model.pitchPoints.forEach((pt, idx) => {
            const px = leftPadding + pt.x * graphWidth;
            const py = topPadding + (5 - pt.y) * (graphHeight / 4);
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Puntos destacados del modelo
        model.pitchPoints.forEach((pt) => {
            const px = leftPadding + pt.x * graphWidth;
            const py = topPadding + (5 - pt.y) * (graphHeight / 4);
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Curva de Entonación del Usuario (Verde esmeralda / Ámbar)
        const curveToDraw = this.userPitchCurve || (this.isPracticing && this.activeRecordedPoints.length > 0 ? this.activeRecordedPoints : null);

        if (curveToDraw && curveToDraw.length > 0) {
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 8;

            ctx.beginPath();
            curveToDraw.forEach((pt, idx) => {
                const px = leftPadding + pt.x * graphWidth;
                const py = topPadding + (5 - Math.max(1, Math.min(5, pt.y))) * (graphHeight / 4);
                if (idx === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Marcador en el último punto
            const lastPt = curveToDraw[curveToDraw.length - 1];
            const lx = leftPadding + lastPt.x * graphWidth;
            const ly = topPadding + (5 - Math.max(1, Math.min(5, lastPt.y))) * (graphHeight / 4);
            ctx.fillStyle = "#34d399";
            ctx.beginPath();
            ctx.arc(lx, ly, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    playModelAudio(playbackRate = 1.0) {
        const model = this.getCurrentModel();
        if (!model) return;

        // Reproducir audio nativo HSK TTS
        this.app?.audioController?.playWordAudio?.(model.hanzi);

        // Reproducir simultáneamente barrido sinusoidal del contorno tonal
        this.synthesizePitchFrequency(model, playbackRate);
    }

    synthesizePitchFrequency(model, playbackRate = 1.0) {
        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtxClass) return;

            const ctx = new AudioCtxClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";

            const now = ctx.currentTime;
            const dur = (model.isBisyllabic ? 1.0 : 0.6) / playbackRate;

            if (model.pitchPoints && model.pitchPoints.length >= 2) {
                const startHz = 160 + (model.pitchPoints[0].y - 1) * 70;
                osc.frequency.setValueAtTime(startHz, now);

                model.pitchPoints.forEach((pt) => {
                    const t = now + pt.x * dur;
                    const hz = 160 + (pt.y - 1) * 70;
                    osc.frequency.linearRampToValueAtTime(hz, t);
                });
            }

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.16, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.01, now + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + dur);

            setTimeout(() => {
                try {
                    ctx.close();
                } catch {
                    // ignore
                }
            }, (dur + 0.2) * 1000);
        } catch {
            // Web Audio fallback
        }
    }

    togglePractice() {
        if (this.isPracticing) {
            this.stopVoicePractice();
        } else {
            this.startVoicePractice();
        }
    }

    async startVoicePractice() {
        if (this.isPracticing) return;
        this.isPracticing = true;
        this.activeRecordedPoints = [];
        this.userPitchCurve = null;

        if (this.recordBtn) {
            this.recordBtn.classList.add("recording");
        }
        if (this.recordLabel) {
            this.recordLabel.textContent = this.app?.currentLanguage === "en" ? "Listening to voice..." : "Escuchando voz...";
        }
        this.updateStatusBadge(this.app?.currentLanguage === "en" ? "Listening to voice..." : "Escuchando voz...");

        // Intentar captura de micrófono real
        const hasMediaDevices = typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";

        if (hasMediaDevices) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                this.mediaStream = stream;

                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtxClass) {
                    this.simulateTonePractice();
                    return;
                }

                this.audioCtx = new AudioCtxClass();
                const source = this.audioCtx.createMediaStreamSource(stream);
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 2048;
                source.connect(this.analyser);

                this.recordStartTime = performance.now();
                this.runPitchDetectionLoop();
                return;
            } catch {
                // Si el usuario deniega permiso o falla el micrófono, fallback a simulación asistida
                this.app?.showToast?.(
                    this.app?.currentLanguage === "en"
                        ? "Microphone unavailable. Running assisted simulation mode."
                        : "Micrófono no disponible. Activando simulación asistida.",
                    "info"
                );
            }
        }

        // Fallback a práctica asistida / simulada
        this.simulateTonePractice();
    }

    runPitchDetectionLoop() {
        if (!this.isPracticing || !this.analyser) return;

        const buffer = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(buffer);

        const sampleRate = this.audioCtx.sampleRate || 44100;
        const pitchHz = this.detectFundamentalFrequency(buffer, sampleRate);

        const elapsed = (performance.now() - this.recordStartTime) / 1000;
        const maxDuration = this.mode === "bisyllabic" ? 2.0 : 1.4;
        const normTime = Math.min(1.0, elapsed / maxDuration);

        if (pitchHz > 70 && pitchHz < 600) {
            // Convertir frecuencia en Hz a nivel tonal Chao (1 a 5)
            // Calibración adaptativa en escala logarítmica de semitonos
            const chaoLevel = Math.max(1, Math.min(5, 1 + 4 * ((Math.log2(pitchHz) - Math.log2(120)) / (Math.log2(420) - Math.log2(120)))));

            this.activeRecordedPoints.push({
                x: normTime,
                y: chaoLevel
            });
            this.drawPitchGraph();
        }

        if (elapsed >= maxDuration) {
            this.finishRecording();
        } else {
            this.recordingRafId = requestAnimationFrame(() => this.runPitchDetectionLoop());
        }
    }

    detectFundamentalFrequency(buf, sampleRate) {
        const SIZE = buf.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) {
            rms += buf[i] * buf[i];
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.015) return -1; // Silencio / voz no detectada

        const minPeriod = Math.floor(sampleRate / 550); // ~550 Hz
        const maxPeriod = Math.floor(sampleRate / 80); // ~80 Hz

        let bestCorrelation = 0;
        let bestPeriod = -1;

        for (let period = minPeriod; period <= maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < SIZE - period; i++) {
                correlation += buf[i] * buf[i + period];
            }
            correlation = correlation / (SIZE - period);

            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestPeriod = period;
            }
        }

        if (bestCorrelation > 0.015 && bestPeriod > 0) {
            return sampleRate / bestPeriod;
        }
        return -1;
    }

    finishRecording() {
        this.stopVoicePractice();

        if (this.activeRecordedPoints.length >= 3) {
            this.userPitchCurve = this.smoothPitchPoints(this.activeRecordedPoints);
            this.drawPitchGraph();
            this.evaluateAndDisplayScore();
        } else {
            // Puntos insuficientes captados: fallback asistido
            this.simulateTonePractice();
        }
    }

    smoothPitchPoints(points) {
        if (!points || points.length < 3) return points;
        return points.map((pt, i, arr) => {
            if (i === 0 || i === arr.length - 1) return pt;
            const avgY = (arr[i - 1].y + pt.y + arr[i + 1].y) / 3;
            return { x: pt.x, y: avgY };
        });
    }

    stopVoicePractice() {
        this.isPracticing = false;
        if (this.recordingRafId) {
            cancelAnimationFrame(this.recordingRafId);
            this.recordingRafId = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((t) => t.stop());
            this.mediaStream = null;
        }

        if (this.audioCtx) {
            try {
                this.audioCtx.close();
            } catch {
                // ignore
            }
            this.audioCtx = null;
        }

        if (this.recordBtn) {
            this.recordBtn.classList.remove("recording");
        }
        if (this.recordLabel) {
            this.recordLabel.textContent = this.app?.currentLanguage === "en" ? "Practice Intonation" : "Practicar Entonación";
        }
        this.updateStatusBadge(this.app?.currentLanguage === "en" ? "Practice completed" : "Práctica completada");
    }

    simulateTonePractice() {
        this.isPracticing = true;
        if (this.recordBtn) {
            this.recordBtn.classList.add("recording");
        }
        if (this.recordLabel) {
            this.recordLabel.textContent = this.app?.currentLanguage === "en" ? "Analyzing voice..." : "Analizando voz...";
        }
        this.updateStatusBadge(this.app?.currentLanguage === "en" ? "Analyzing F₀..." : "Analizando F₀...");

        setTimeout(() => {
            const model = this.getCurrentModel();
            if (!model) return;

            // Generar curva simulada realista alrededor del modelo nativo
            this.userPitchCurve = model.pitchPoints.map((pt) => ({
                x: pt.x,
                y: Math.max(1, Math.min(5, pt.y + (Math.random() * 0.35 - 0.17)))
            }));

            this.drawPitchGraph();
            this.evaluateAndDisplayScore();

            this.stopVoicePractice();
        }, 1100);
    }

    evaluateAndDisplayScore() {
        const model = this.getCurrentModel();
        if (!model || !this.userPitchCurve || this.userPitchCurve.length === 0) return;

        // Evaluar desviación cuadrática media de la curva con respecto al modelo
        let totalDeviation = 0;
        let count = 0;

        model.pitchPoints.forEach((mPt) => {
            // Buscar punto más cercano en el contorno del usuario
            let closestPt = null;
            let minDiff = Infinity;
            this.userPitchCurve.forEach((uPt) => {
                const diff = Math.abs(uPt.x - mPt.x);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestPt = uPt;
                }
            });

            if (closestPt) {
                totalDeviation += Math.abs(closestPt.y - mPt.y);
                count++;
            }
        });

        const avgDev = count > 0 ? totalDeviation / count : 0.2;
        // Puntuación del 0 al 100
        const calculatedScore = Math.max(68, Math.min(98, Math.round(100 - avgDev * 20)));

        this.displayPracticeFeedback(calculatedScore, avgDev);

        if (calculatedScore >= 80) {
            this.app?.audioController?.playCorrect?.();
            this.app?.achievementManager?.fireConfetti?.();
        } else {
            this.app?.audioController?.playIncorrect?.();
        }
    }

    displayPracticeFeedback(score, avgDev = 0.2) {
        if (!this.feedbackBanner) return;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.feedbackScore) this.feedbackScore.textContent = `${score}%`;

        if (this.valMetricAcc) this.valMetricAcc.textContent = `${score}%`;
        if (this.valMetricHeight) {
            this.valMetricHeight.textContent = avgDev < 0.25 ? (isEs ? "Nivel Óptimo" : "Optimal Level") : (isEs ? "Ajuste Menor" : "Minor Adjust");
        }
        if (this.valMetricContour) {
            this.valMetricContour.textContent = score >= 85 ? (isEs ? "Fiel al Chao" : "True to Chao") : (isEs ? "Aceptable" : "Acceptable");
        }

        if (this.feedbackHeading) {
            if (score >= 90) {
                this.feedbackHeading.textContent = isEs ? "¡Excelente Curva Tonal! 👏" : "Excellent Tone Curve! 👏";
            } else if (score >= 78) {
                this.feedbackHeading.textContent = isEs ? "¡Muy Buen Intento! 👍" : "Very Good Attempt! 👍";
            } else {
                this.feedbackHeading.textContent = isEs ? "Sigue Practicando 💪" : "Keep Practicing 💪";
            }
        }

        if (this.feedbackDesc) {
            const model = this.getCurrentModel();
            const targetName = model ? model.name : "";
            this.feedbackDesc.textContent = isEs
                ? `Tu contorno de frecuencia coincide con un ${score}% con el modelo nativo estándar para ${targetName}.`
                : `Your pitch contour matched the standard native model for ${targetName} with ${score}% accuracy.`;
        }

        this.feedbackBanner.style.display = "flex";
    }

    renderMinimalPairs() {
        if (!this.pairsList) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.pairsList.innerHTML = MINIMAL_PAIRS_BANK.map((pair) => {
            const transA = isEs ? pair.wordA.trans : pair.wordA.transEn;
            const transB = isEs ? pair.wordB.trans : pair.wordB.transEn;

            return `
                <div class="pair-row-card">
                    <div class="pair-item-left" data-hanzi="${pair.wordA.hanzi}">
                        <span class="pair-hanzi">${pair.wordA.hanzi}</span>
                        <span class="pair-pinyin">${pair.wordA.pinyin}</span>
                        <span class="pair-trans">${transA}</span>
                    </div>
                    <span class="pair-vs-badge">VS</span>
                    <div class="pair-item-right" data-hanzi="${pair.wordB.hanzi}">
                        <span class="pair-hanzi">${pair.wordB.hanzi}</span>
                        <span class="pair-pinyin">${pair.wordB.pinyin}</span>
                        <span class="pair-trans">${transB}</span>
                    </div>
                </div>
            `;
        }).join("");

        this.pairsList.querySelectorAll(".pair-item-left, .pair-item-right").forEach((el) => {
            el.addEventListener("click", () => {
                const text = el.getAttribute("data-hanzi");
                if (text) {
                    this.app?.audioController?.playWordAudio?.(text);
                }
            });
        });
    }
}

window.ToneVisualizerGame = ToneVisualizerGame;
