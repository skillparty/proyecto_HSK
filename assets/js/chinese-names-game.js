// chinese-names-game.js — Motor del Buscador y Generador de Nombres Chinos Tradicionales

const BAI_JIA_XING_SURNAMES = [
    { hanzi: "李", pinyin: "Lǐ", meaning: "Ciruelo (Apellido de la Dinastía Tang y Laozi)", element: "wood" },
    { hanzi: "王", pinyin: "Wáng", meaning: "Rey / Soberano noble", element: "earth" },
    { hanzi: "张", pinyin: "Zhāng", meaning: "Tender el arco / Grandeza", element: "fire" },
    { hanzi: "刘", pinyin: "Liú", meaning: "Hacha de armas (Dinastía Han)", element: "metal" },
    { hanzi: "陈", pinyin: "Chén", meaning: "Antiguo / Exponer con sabiduría", element: "wood" },
    { hanzi: "杨", pinyin: "Yáng", meaning: "Álamo / Rectitud", element: "wood" },
    { hanzi: "赵", pinyin: "Zhào", meaning: "Dinastía Song / Prestigio", element: "fire" },
    { hanzi: "黄", pinyin: "Huáng", meaning: "Amarillo imperial / Tierra fértil", element: "earth" },
    { hanzi: "周", pinyin: "Zhōu", meaning: "Ciclo completo / Dinastía Zhou", element: "metal" },
    { hanzi: "吴", pinyin: "Wú", meaning: "Reino Wu / Claridad", element: "water" },
    { hanzi: "林", pinyin: "Lín", meaning: "Bosque / Fraternidad", element: "wood" },
    { hanzi: "罗", pinyin: "Luó", meaning: "Manto de seda / Protección", element: "fire" }
];

const PHONETIC_NAME_PRESETS = {
    "alejandro": {
        male: { hanzi: "安龙", pinyin: "Ānlóng", literal: "Dragón que trae Paz y Sabiduría", chars: [{ h: "安", p: "ān", m: "Paz / Tranquilidad", e: "earth" }, { h: "龙", p: "lóng", m: "Dragón imperial / Valentía", e: "water" }] },
        female: { hanzi: "雅兰", pinyin: "Yǎlán", literal: "Orquídea Elegante de Alta Cuna", chars: [{ h: "雅", p: "yǎ", m: "Elegancia / Gracia", e: "wood" }, { h: "兰", p: "lán", m: "Orquídea noble", e: "wood" }] },
        neutral: { hanzi: "亚朗", pinyin: "Yàlǎng", literal: "Claridad Resplandeciente", chars: [{ h: "亚", p: "yà", m: "Continuador", e: "earth" }, { h: "朗", p: "lǎng", m: "Luminoso / Brillante", e: "fire" }] }
    },
    "carlos": {
        male: { hanzi: "凯乐", pinyin: "Kǎilè", literal: "Victoria Radiante y Alegría", chars: [{ h: "凯", p: "kǎi", m: "Triunfo victorioso", e: "metal" }, { h: "乐", p: "lè", m: "Alegría y música", e: "fire" }] },
        female: { hanzi: "嘉兰", pinyin: "Jiālán", literal: "Elegancia Primaveral", chars: [{ h: "嘉", p: "jiā", m: "Bondad / Belleza", e: "wood" }, { h: "兰", p: "lán", m: "Orquídea", e: "wood" }] },
        neutral: { hanzi: "康瑞", pinyin: "Kāngruì", literal: "Salud y Presagio Favorable", chars: [{ h: "康", p: "kāng", m: "Bienestar", e: "wood" }, { h: "瑞", p: "ruì", m: "Presagio de fortuna", e: "metal" }] }
    },
    "elena": {
        male: { hanzi: "毅伦", pinyin: "Yìlún", literal: "Firmeza de Carácter y Ética", chars: [{ h: "毅", p: "yì", m: "Perseverancia", e: "metal" }, { h: "伦", p: "lún", m: "Armonía social", e: "fire" }] },
        female: { hanzi: "依莲", pinyin: "Yīlián", literal: "Loto Puro y Fiel", chars: [{ h: "依", p: "yī", m: "Confianza / Gracia", e: "earth" }, { h: "莲", p: "lián", m: "Flor de loto", e: "wood" }] },
        neutral: { hanzi: "逸宁", pinyin: "Yìníng", literal: "Paz Serena y Libertad", chars: [{ h: "逸", p: "yì", m: "Libertad / Talento", e: "water" }, { h: "宁", p: "níng", m: "Serenidad", e: "fire" }] }
    },
    "maria": {
        male: { hanzi: "铭睿", pinyin: "Míngruì", literal: "Inscripción de Profunda Sabiduría", chars: [{ h: "铭", p: "míng", m: "Grabar en oro", e: "metal" }, { h: "睿", p: "ruì", m: "Perspicaz", e: "water" }] },
        female: { hanzi: "曼雅", pinyin: "Mànyǎ", literal: "Elegancia Grácil y Dulzura", chars: [{ h: "曼", p: "màn", m: "Grácil / Fina", e: "water" }, { h: "雅", p: "yǎ", m: "Elegante", e: "wood" }] },
        neutral: { hanzi: "明熙", pinyin: "Míngxī", literal: "Luz Brillante y Armonía", chars: [{ h: "明", p: "míng", m: "Claridad", e: "fire" }, { h: "熙", p: "xī", m: "Esplendor", e: "fire" }] }
    },
    "david": {
        male: { hanzi: "大为", pinyin: "Dàwéi", literal: "Grandes Logros y Visión", chars: [{ h: "大", p: "dà", m: "Grande / Vasto", e: "fire" }, { h: "为", p: "wéi", m: "Acción / Logro", e: "earth" }] },
        female: { hanzi: "黛薇", pinyin: "Dàiwēi", literal: "Belleza Floreciente", chars: [{ h: "黛", p: "dài", m: "Belleza clásica", e: "water" }, { h: "薇", p: "wēi", m: "Helecho aromático", e: "wood" }] },
        neutral: { hanzi: "达仁", pinyin: "Dárén", literal: "Alcanzar la Virtud Humana", chars: [{ h: "达", p: "dá", m: "Trascender", e: "fire" }, { h: "仁", p: "rén", m: "Benevolencia", e: "wood" }] }
    }
};

const TRAIT_CHARACTERS = {
    wisdom: [
        { h: "智", p: "zhì", m: "Sabiduría profunda", e: "water" },
        { h: "睿", p: "ruì", m: "Mente perspicaz", e: "water" },
        { h: "博", p: "bó", m: "Erudición vasta", e: "water" },
        { h: "思", p: "sī", m: "Pensamiento reflexivo", e: "metal" }
    ],
    bravery: [
        { h: "勇", p: "yǒng", m: "Valentía sin miedo", e: "earth" },
        { h: "刚", p: "gāng", m: "Firmeza de acero", e: "metal" },
        { h: "毅", p: "yì", m: "Determinación férrea", e: "metal" },
        { h: "峰", p: "fēng", m: "Cima de la montaña", e: "earth" }
    ],
    elegance: [
        { h: "雅", p: "yǎ", m: "Elegancia refinada", e: "wood" },
        { h: "华", p: "huá", m: "Esplendor cultural", e: "fire" },
        { h: "婷", p: "tíng", m: "Gracia y porte", e: "fire" },
        { h: "宇", p: "yǔ", m: "Presencia noble", e: "earth" }
    ],
    peace: [
        { h: "安", p: "ān", m: "Paz y seguridad", e: "earth" },
        { h: "宁", p: "níng", m: "Serenidad de espíritu", e: "fire" },
        { h: "泰", p: "tài", m: "Gran armonía y calma", e: "water" },
        { h: "和", p: "hé", m: "Concordia universal", e: "water" }
    ],
    nature: [
        { h: "森", p: "sēn", m: "Bosque majestuoso", e: "wood" },
        { h: "海", p: "hǎi", m: "Inmensidad del océano", e: "water" },
        { h: "云", p: "yún", m: "Nube libre en el cielo", e: "water" },
        { h: "朗", p: "lǎng", m: "Cielo despejado y brillante", e: "fire" }
    ]
};

class ChineseNamesGame {
    constructor(app) {
        this.app = app;
        this.currentGeneratedName = null;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderSurnamesCatalog();
        this.generateChineseName();
    }

    cacheDOM() {
        this.container = document.getElementById("chinese-names");
        this.westernNameInput = document.getElementById("western-name-input");
        this.genderSelect = document.getElementById("name-gender-select");
        this.traitSelect = document.getElementById("name-trait-select");
        this.elementSelect = document.getElementById("name-element-select");
        this.generateBtn = document.getElementById("generate-name-btn");

        this.resHanzi = document.getElementById("res-chinese-hanzi");
        this.resPinyin = document.getElementById("res-chinese-pinyin");
        this.resLiteral = document.getElementById("res-chinese-literal");
        this.breakdownGrid = document.getElementById("characters-breakdown-grid");

        this.playAudioBtn = document.getElementById("play-name-audio-btn");
        this.copyNameBtn = document.getElementById("copy-name-btn");
        this.surnamesGrid = document.getElementById("surnames-catalog-grid");
    }

    bindEvents() {
        if (this.generateBtn) {
            this.generateBtn.addEventListener("click", () => this.generateChineseName());
        }

        if (this.westernNameInput) {
            this.westernNameInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") this.generateChineseName();
            });
        }

        if (this.playAudioBtn) {
            this.playAudioBtn.addEventListener("click", () => {
                if (this.currentGeneratedName?.fullHanzi) {
                    this.app?.audioController?.playWordAudio?.(this.currentGeneratedName.fullHanzi);
                }
            });
        }

        if (this.copyNameBtn) {
            this.copyNameBtn.addEventListener("click", () => this.copyNameToClipboard());
        }
    }

    generateChineseName() {
        const rawName = (this.westernNameInput?.value || "Alejandro").trim().toLowerCase();
        const gender = this.genderSelect?.value || "male";
        const trait = this.traitSelect?.value || "wisdom";
        const element = this.elementSelect?.value || "wood";

        // Elegir apellido representativo basado en la primera letra del nombre
        const initial = rawName.charAt(0) || "a";
        const surnameIdx = Math.abs(initial.charCodeAt(0) * 7) % BAI_JIA_XING_SURNAMES.length;
        const surname = BAI_JIA_XING_SURNAMES[surnameIdx];

        let givenNameChars = [];
        let literalMeaning = "";
        let fullPinyin = "";

        // Revisar si existe preset directo para nombres comunes
        const matchedKey = Object.keys(PHONETIC_NAME_PRESETS).find((k) => rawName.includes(k));

        if (matchedKey && PHONETIC_NAME_PRESETS[matchedKey][gender]) {
            const preset = PHONETIC_NAME_PRESETS[matchedKey][gender];
            givenNameChars = preset.chars;
            literalMeaning = `"${preset.literal}"`;
            fullPinyin = `${surname.pinyin} ${preset.pinyin}`;
        } else {
            // Generación algorítmica basada en rasgo Wu Xing
            const traitPool = TRAIT_CHARACTERS[trait] || TRAIT_CHARACTERS.wisdom;
            const char1 = traitPool[Math.floor(Math.random() * traitPool.length)];
            const char2 = traitPool.find((c) => c.h !== char1.h) || traitPool[0];

            givenNameChars = [char1, char2];
            literalMeaning = `"Portador de ${char1.m} y ${char2.m}"`;
            fullPinyin = `${surname.pinyin} ${char1.p.charAt(0).toUpperCase() + char1.p.slice(1)}${char2.p}`;
        }

        const fullHanzi = `${surname.hanzi}${givenNameChars.map((c) => c.h).join("")}`;

        this.currentGeneratedName = {
            surname,
            givenNameChars,
            fullHanzi,
            fullPinyin,
            literalMeaning,
            element
        };

        this.renderNameResult();
        this.app?.achievementManager?.fireConfetti?.();
    }

    renderNameResult() {
        if (!this.currentGeneratedName) return;
        const { surname, givenNameChars, fullHanzi, fullPinyin, literalMeaning } = this.currentGeneratedName;

        if (this.resHanzi) this.resHanzi.textContent = fullHanzi;
        if (this.resPinyin) this.resPinyin.textContent = fullPinyin;
        if (this.resLiteral) this.resLiteral.textContent = literalMeaning;

        if (this.breakdownGrid) {
            const allChars = [
                { h: surname.hanzi, p: surname.pinyin, m: `Apellido: ${surname.meaning}`, e: surname.element },
                ...givenNameChars
            ];

            this.breakdownGrid.innerHTML = allChars.map((c) => `
                <div class="char-breakdown-card">
                    <span class="breakdown-hanzi">${c.h}</span>
                    <span class="breakdown-pinyin">${c.p}</span>
                    <span class="breakdown-meaning">${c.m}</span>
                    <span class="breakdown-wuxing-badge ${c.e || "wood"}">${this.getElementName(c.e)}</span>
                </div>
            `).join("");
        }
    }

    getElementName(elemKey) {
        const names = {
            wood: "Madera 木",
            fire: "Fuego 火",
            earth: "Tierra 土",
            metal: "Metal 金",
            water: "Agua 水"
        };
        return names[elemKey] || "Madera 木";
    }

    copyNameToClipboard() {
        if (!this.currentGeneratedName?.fullHanzi) return;

        const text = `${this.currentGeneratedName.fullHanzi} (${this.currentGeneratedName.fullPinyin})`;
        navigator.clipboard?.writeText?.(text);

        const isEs = this.app?.currentLanguage !== "en";
        this.app?.showToast?.(
            isEs ? `¡Copiado al portapapeles: ${text}!` : `Copied to clipboard: ${text}!`,
            "success"
        );
    }

    renderSurnamesCatalog() {
        if (!this.surnamesGrid) return;

        this.surnamesGrid.innerHTML = BAI_JIA_XING_SURNAMES.map((s) => `
            <div class="surname-chip-card" data-hanzi="${s.hanzi}">
                <span class="surname-hanzi">${s.hanzi}</span>
                <div class="surname-meta">
                    <span class="surname-pinyin">${s.pinyin}</span>
                    <span class="surname-meaning">${s.meaning.split(" ")[0]}</span>
                </div>
            </div>
        `).join("");

        this.surnamesGrid.querySelectorAll(".surname-chip-card").forEach((card) => {
            card.addEventListener("click", () => {
                const hanzi = card.getAttribute("data-hanzi");
                this.app?.audioController?.playWordAudio?.(hanzi);
            });
        });
    }
}

window.ChineseNamesGame = ChineseNamesGame;
