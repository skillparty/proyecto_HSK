// chinese-names-game.js — Motor del Buscador y Generador de Nombres Chinos Tradicionales

const BAI_JIA_XING_SURNAMES = [
    { hanzi: "李", pinyin: "Lǐ", meaning: "Ciruelo (Apellido Real Tang)", meaningEn: "Plum Tree (Tang Royal Surname)", element: "wood" },
    { hanzi: "王", pinyin: "Wáng", meaning: "Rey / Soberano noble", meaningEn: "King / Noble Monarch", element: "earth" },
    { hanzi: "张", pinyin: "Zhāng", meaning: "Tender el arco / Grandeza", meaningEn: "Drawing the Bow / Greatness", element: "fire" },
    { hanzi: "刘", pinyin: "Liú", meaning: "Hacha de armas (Dinastía Han)", meaningEn: "Battle Axe (Han Imperial House)", element: "metal" },
    { hanzi: "陈", pinyin: "Chén", meaning: "Antiguo / Exponer sabiduría", meaningEn: "Ancient / Express Wisdom", element: "wood" },
    { hanzi: "杨", pinyin: "Yáng", meaning: "Álamo / Rectitud", meaningEn: "Poplar Tree / Uprightness", element: "wood" },
    { hanzi: "赵", pinyin: "Zhào", meaning: "Dinastía Song / Prestigio", meaningEn: "Song Dynasty / Prestige", element: "fire" },
    { hanzi: "黄", pinyin: "Huáng", meaning: "Amarillo imperial / Fértil", meaningEn: "Imperial Yellow / Fertile", element: "earth" },
    { hanzi: "周", pinyin: "Zhōu", meaning: "Ciclo completo / Dinastía Zhou", meaningEn: "Complete Cycle / Zhou Dynasty", element: "metal" },
    { hanzi: "吴", pinyin: "Wú", meaning: "Reino Wu / Claridad", meaningEn: "Kingdom of Wu / Clarity", element: "water" },
    { hanzi: "林", pinyin: "Lín", meaning: "Bosque / Fraternidad", meaningEn: "Forest / Brotherhood", element: "wood" },
    { hanzi: "罗", pinyin: "Luó", meaning: "Manto de seda / Protección", meaningEn: "Silk Net / Noble Protection", element: "fire" }
];

const PHONETIC_NAME_PRESETS = {
    "alejandro": {
        male: { hanzi: "安龙", pinyin: "Ānlóng", literal: "Dragón que trae Paz y Sabiduría", literalEn: "Dragon bringing Peace and Wisdom", chars: [{ h: "安", p: "ān", m: "Paz / Tranquilidad", mEn: "Peace / Tranquility", e: "earth" }, { h: "龙", p: "lóng", m: "Dragón imperial / Valentía", mEn: "Imperial Dragon / Valor", e: "water" }] },
        female: { hanzi: "雅兰", pinyin: "Yǎlán", literal: "Orquídea Elegante de Alta Cuna", literalEn: "Noble and Elegant Orchid", chars: [{ h: "雅", p: "yǎ", m: "Elegancia / Gracia", mEn: "Elegance / Grace", e: "wood" }, { h: "兰", p: "lán", m: "Orquídea noble", mEn: "Noble Orchid", e: "wood" }] },
        neutral: { hanzi: "亚朗", pinyin: "Yàlǎng", literal: "Claridad Resplandeciente", literalEn: "Radiant Clarity", chars: [{ h: "亚", p: "yà", m: "Continuador", mEn: "Successor", e: "earth" }, { h: "朗", p: "lǎng", m: "Luminoso / Brillante", mEn: "Bright / Luminous", e: "fire" }] }
    },
    "carlos": {
        male: { hanzi: "凯乐", pinyin: "Kǎilè", literal: "Victoria Radiante y Alegría", literalEn: "Triumphant Victory and Joy", chars: [{ h: "凯", p: "kǎi", m: "Triunfo victorioso", mEn: "Victorious Triumph", e: "metal" }, { h: "乐", p: "lè", m: "Alegría y música", mEn: "Joy and Harmony", e: "fire" }] },
        female: { hanzi: "嘉兰", pinyin: "Jiālán", literal: "Elegancia Primaveral", literalEn: "Springtime Elegance", chars: [{ h: "嘉", p: "jiā", m: "Bondad / Belleza", mEn: "Goodness / Beauty", e: "wood" }, { h: "兰", p: "lán", m: "Orquídea", mEn: "Orchid", e: "wood" }] },
        neutral: { hanzi: "康瑞", pinyin: "Kāngruì", literal: "Salud y Presagio Favorable", literalEn: "Good Health and Auspicious Omen", chars: [{ h: "康", p: "kāng", m: "Bienestar", mEn: "Well-being", e: "wood" }, { h: "瑞", p: "ruì", m: "Presagio de fortuna", mEn: "Auspicious Sign", e: "metal" }] }
    },
    "elena": {
        male: { hanzi: "毅伦", pinyin: "Yìlún", literal: "Firmeza de Carácter y Ética", literalEn: "Steadfast Character and Ethics", chars: [{ h: "毅", p: "yì", m: "Perseverancia", mEn: "Perseverance", e: "metal" }, { h: "伦", p: "lún", m: "Armonía social", mEn: "Social Harmony", e: "fire" }] },
        female: { hanzi: "依莲", pinyin: "Yīlián", literal: "Loto Puro y Fiel", literalEn: "Pure and Faithful Lotus", chars: [{ h: "依", p: "yī", m: "Confianza / Gracia", mEn: "Trust / Grace", e: "earth" }, { h: "莲", p: "lián", m: "Flor de loto", mEn: "Lotus Flower", e: "wood" }] },
        neutral: { hanzi: "逸宁", pinyin: "Yìníng", literal: "Paz Serena y Libertad", literalEn: "Serene Peace and Freedom", chars: [{ h: "逸", p: "yì", m: "Libertad / Talento", mEn: "Freedom / Ease", e: "water" }, { h: "宁", p: "níng", m: "Serenidad", mEn: "Serenity", e: "fire" }] }
    },
    "maria": {
        male: { hanzi: "铭睿", pinyin: "Míngruì", literal: "Inscripción de Profunda Sabiduría", literalEn: "Inscription of Profound Wisdom", chars: [{ h: "铭", p: "míng", m: "Grabar en oro", mEn: "Engrave in Gold", e: "metal" }, { h: "睿", p: "ruì", m: "Perspicaz", mEn: "Astute / Far-sighted", e: "water" }] },
        female: { hanzi: "曼雅", pinyin: "Mànyǎ", literal: "Elegancia Grácil y Dulzura", literalEn: "Graceful Elegance and Sweetness", chars: [{ h: "曼", p: "màn", m: "Grácil / Fina", mEn: "Graceful / Gentle", e: "water" }, { h: "雅", p: "yǎ", m: "Elegante", mEn: "Elegant", e: "wood" }] },
        neutral: { hanzi: "明熙", pinyin: "Míngxī", literal: "Luz Brillante y Armonía", literalEn: "Bright Light and Harmony", chars: [{ h: "明", p: "míng", m: "Claridad", mEn: "Clarity / Brightness", e: "fire" }, { h: "熙", p: "xī", m: "Esplendor", mEn: "Splendor / Warmth", e: "fire" }] }
    },
    "david": {
        male: { hanzi: "大为", pinyin: "Dàwéi", literal: "Grandes Logros y Visión", literalEn: "Great Achievements and Vision", chars: [{ h: "大", p: "dà", m: "Grande / Vasto", mEn: "Great / Vast", e: "fire" }, { h: "为", p: "wéi", m: "Acción / Logro", mEn: "Action / Achievement", e: "earth" }] },
        female: { hanzi: "黛薇", pinyin: "Dàiwēi", literal: "Belleza Floreciente", literalEn: "Blooming Grace and Beauty", chars: [{ h: "黛", p: "dài", m: "Belleza clásica", mEn: "Classic Beauty", e: "water" }, { h: "薇", p: "wēi", m: "Helecho aromático", mEn: "Fragrant Fern", e: "wood" }] },
        neutral: { hanzi: "达仁", pinyin: "Dárén", literal: "Alcanzar la Virtud Humana", literalEn: "Attaining Universal Benevolence", chars: [{ h: "达", p: "dá", m: "Trascender", mEn: "Attain / Reach", e: "fire" }, { h: "仁", p: "rén", m: "Benevolencia", mEn: "Benevolence", e: "wood" }] }
    }
};

const TRAIT_CHARACTERS = {
    wisdom: [
        { h: "智", p: "zhì", m: "Sabiduría profunda", mEn: "Deep Wisdom", e: "water" },
        { h: "睿", p: "ruì", m: "Mente perspicaz", mEn: "Astute Insight", e: "water" },
        { h: "博", p: "bó", m: "Erudición vasta", mEn: "Vast Erudition", e: "water" },
        { h: "思", p: "sī", m: "Pensamiento reflexivo", mEn: "Reflective Thought", e: "metal" }
    ],
    bravery: [
        { h: "勇", p: "yǒng", m: "Valentía sin miedo", mEn: "Fearless Valor", e: "earth" },
        { h: "刚", p: "gāng", m: "Firmeza de acero", mEn: "Steely Strength", e: "metal" },
        { h: "毅", p: "yì", m: "Determinación férrea", mEn: "Iron Resolve", e: "metal" },
        { h: "峰", p: "fēng", m: "Cima de la montaña", mEn: "Mountain Peak", e: "earth" }
    ],
    elegance: [
        { h: "雅", p: "yǎ", m: "Elegancia refinada", mEn: "Refined Elegance", e: "wood" },
        { h: "华", p: "huá", m: "Esplendor cultural", mEn: "Cultural Splendor", e: "fire" },
        { h: "婷", p: "tíng", m: "Gracia y porte", mEn: "Grace and Poise", e: "fire" },
        { h: "宇", p: "yǔ", m: "Presencia noble", mEn: "Noble Bearing", e: "earth" }
    ],
    peace: [
        { h: "安", p: "ān", m: "Paz y seguridad", mEn: "Peace and Safety", e: "earth" },
        { h: "宁", p: "níng", m: "Serenidad de espíritu", mEn: "Serenity of Spirit", e: "fire" },
        { h: "泰", p: "tài", m: "Gran armonía y calma", mEn: "Grand Harmony", e: "water" },
        { h: "和", p: "hé", m: "Concordia universal", mEn: "Universal Concord", e: "water" }
    ],
    nature: [
        { h: "森", p: "sēn", m: "Bosque majestuoso", mEn: "Majestic Forest", e: "wood" },
        { h: "海", p: "hǎi", m: "Inmensidad del océano", mEn: "Ocean Vastness", e: "water" },
        { h: "云", p: "yún", m: "Nube libre en el cielo", mEn: "Free Cloud in Sky", e: "water" },
        { h: "朗", p: "lǎng", m: "Cielo despejado", mEn: "Clear Bright Sky", e: "fire" }
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
        const isEs = this.app?.currentLanguage !== "en";
        const matchedKey = Object.keys(PHONETIC_NAME_PRESETS).find((k) => rawName.includes(k));

        if (matchedKey && PHONETIC_NAME_PRESETS[matchedKey][gender]) {
            const preset = PHONETIC_NAME_PRESETS[matchedKey][gender];
            givenNameChars = preset.chars;
            literalMeaning = `"${isEs ? preset.literal : (preset.literalEn || preset.literal)}"`;
            fullPinyin = `${surname.pinyin} ${preset.pinyin}`;
        } else {
            // Generación algorítmica basada en rasgo Wu Xing
            const traitPool = TRAIT_CHARACTERS[trait] || TRAIT_CHARACTERS.wisdom;
            const char1 = traitPool[Math.floor(Math.random() * traitPool.length)];
            const char2 = traitPool.find((c) => c.h !== char1.h) || traitPool[0];

            givenNameChars = [char1, char2];
            const m1 = isEs ? char1.m : (char1.mEn || char1.m);
            const m2 = isEs ? char2.m : (char2.mEn || char2.m);
            literalMeaning = isEs ? `"Portador de ${m1} y ${m2}"` : `"Bearer of ${m1} and ${m2}"`;
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
        const isEs = this.app?.currentLanguage !== "en";

        if (this.resHanzi) this.resHanzi.textContent = fullHanzi;
        if (this.resPinyin) this.resPinyin.textContent = fullPinyin;
        if (this.resLiteral) this.resLiteral.textContent = literalMeaning;

        if (this.breakdownGrid) {
            const surnameM = isEs ? `Apellido: ${surname.meaning}` : `Surname: ${surname.meaningEn || surname.meaning}`;
            const allChars = [
                { h: surname.hanzi, p: surname.pinyin, m: surnameM, e: surname.element },
                ...givenNameChars.map((c) => ({
                    h: c.h,
                    p: c.p,
                    m: isEs ? c.m : (c.mEn || c.m),
                    e: c.e
                }))
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
        const isEs = this.app?.currentLanguage !== "en";
        const names = {
            wood: isEs ? "Madera 木" : "Wood 木",
            fire: isEs ? "Fuego 火" : "Fire 火",
            earth: isEs ? "Tierra 土" : "Earth 土",
            metal: isEs ? "Metal 金" : "Metal 金",
            water: isEs ? "Agua 水" : "Water 水"
        };
        return names[elemKey] || (isEs ? "Madera 木" : "Wood 木");
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
        const isEs = this.app?.currentLanguage !== "en";

        this.surnamesGrid.innerHTML = BAI_JIA_XING_SURNAMES.map((s) => {
            const meaningStr = isEs ? s.meaning : (s.meaningEn || s.meaning);
            return `
            <div class="surname-chip-card" data-hanzi="${s.hanzi}">
                <span class="surname-hanzi">${s.hanzi}</span>
                <div class="surname-meta">
                    <span class="surname-pinyin">${s.pinyin}</span>
                    <span class="surname-meaning">${meaningStr.split(" ")[0]}</span>
                </div>
            </div>
            `;
        }).join("");

        this.surnamesGrid.querySelectorAll(".surname-chip-card").forEach((card) => {
            card.addEventListener("click", () => {
                const hanzi = card.getAttribute("data-hanzi");
                this.app?.audioController?.playWordAudio?.(hanzi);
            });
        });
    }
}

window.ChineseNamesGame = ChineseNamesGame;
