// radical-decomposer-game.js — Motor del Laboratorio de Descomposición Anatómica de Radicales y Mnemotecnias

const HSK_DECOMPOSITION_DATABASE = [
    {
        char: "休",
        pinyin: "xiū",
        meaning: "Descansar, reposar",
        meaningEn: "To rest, relax",
        hsk: 2,
        type: "会意字 (Ideograma compuesto)",
        typeEn: "Compound Ideograph",
        radical: {
            char: "亻",
            name: "人字旁 (Radical de Persona)",
            nameEn: "Person Radical",
            pinyin: "rén",
            meaning: "Persona, ser humano",
            meaningEn: "Person, human"
        },
        formula: [
            { char: "亻", name: "人 (Persona)", meaning: "Hombre / Humano" },
            { char: "木", name: "木 (Árbol)", meaning: "Madera / Árbol" }
        ],
        mnemonic: "Imagina a una persona (亻) apoyada descansando plácidamente contra el tronco de un árbol (木) en un día soleado. ¡Persona + Árbol = Descansar (休)!",
        mnemonicEn: "Imagine a person (亻) leaning and resting against a tree (木) on a sunny day. Person + Tree = Rest (休)!",
        siblings: [
            { char: "你", pinyin: "nǐ", meaning: "Tú" },
            { char: "他", pinyin: "tā", meaning: "Él" },
            { char: "们", pinyin: "men", meaning: "Plural" },
            { char: "住", pinyin: "zhù", meaning: "Vivir" },
            { char: "体", pinyin: "tǐ", meaning: "Cuerpo" }
        ],
        challengeOptions: ["亻", "木", "日", "氵"]
    },
    {
        char: "明",
        pinyin: "míng",
        meaning: "Brillante, claro, iluminado",
        meaningEn: "Bright, clear",
        hsk: 1,
        type: "会意字 (Ideograma compuesto)",
        typeEn: "Compound Ideograph",
        radical: {
            char: "日",
            name: "日字旁 (Radical de Sol)",
            nameEn: "Sun Radical",
            pinyin: "rì",
            meaning: "Sol, día",
            meaningEn: "Sun, day"
        },
        formula: [
            { char: "日", name: "日 (Sol)", meaning: "Astro Rey / Luz solar" },
            { char: "月", name: "月 (Luna)", meaning: "Luz nocturna / Mes" }
        ],
        mnemonic: "Los dos cuerpos celestes más luminosos del firmamento: el Sol (日) y la Luna (月). Cuando se unen, el mundo queda completamente ¡Brillante y Claro (明)!",
        mnemonicEn: "The two brightest celestial bodies: the Sun (日) and the Moon (月). When united, everything becomes Bright and Clear (明)!",
        siblings: [
            { char: "早", pinyin: "zǎo", meaning: "Temprano" },
            { char: "时", pinyin: "shí", meaning: "Tiempo" },
            { char: "星", pinyin: "xīng", meaning: "Estrella" },
            { char: "晚", pinyin: "wǎn", meaning: "Noche" }
        ],
        challengeOptions: ["日", "月", "木", "火"]
    },
    {
        char: "想",
        pinyin: "xiǎng",
        meaning: "Pensar, desear, extrañar",
        meaningEn: "To think, miss, wish",
        hsk: 1,
        type: "形声字 (Fono-semántico)",
        typeEn: "Phono-semantic Compound",
        radical: {
            char: "心",
            name: "心字底 (Radical de Corazón)",
            nameEn: "Heart Radical",
            pinyin: "xīn",
            meaning: "Corazón, mente, emociones",
            meaningEn: "Heart, mind"
        },
        formula: [
            { char: "木", name: "木 (Árbol)", meaning: "Naturaleza" },
            { char: "目", name: "目 (Ojo)", meaning: "Mirar atentamente" },
            { char: "心", name: "心 (Corazón)", meaning: "Sentimiento / Mente" }
        ],
        mnemonic: "Observar con tus ojos (目) un árbol (木) genera una imagen (相). Cuando colocas esa imagen en el fondo de tu corazón (心), estás pensando o extrañando a alguien (想).",
        mnemonicEn: "Looking with your eye (目) at a tree (木) forms a mutual image (相). Put that image in your heart (心), and you are thinking or missing someone (想).",
        siblings: [
            { char: "忘", pinyin: "wàng", meaning: "Olvidar" },
            { char: "态", pinyin: "tài", meaning: "Actitud" },
            { char: "意", pinyin: "yì", meaning: "Significado" },
            { char: "感", pinyin: "gǎn", meaning: "Sentir" }
        ],
        challengeOptions: ["木", "目", "心", "口"]
    },
    {
        char: "好",
        pinyin: "hǎo",
        meaning: "Bueno, bien, correcto",
        meaningEn: "Good, well, fine",
        hsk: 1,
        type: "会意字 (Ideograma compuesto)",
        typeEn: "Compound Ideograph",
        radical: {
            char: "女",
            name: "女字旁 (Radical de Mujer)",
            nameEn: "Woman Radical",
            pinyin: "nǚ",
            meaning: "Mujer, femenino",
            meaningEn: "Woman, female"
        },
        formula: [
            { char: "女", name: "女 (Mujer)", meaning: "Madre / Mujer" },
            { char: "子", name: "子 (Hijo/Niño)", meaning: "Hijo / Bebé" }
        ],
        mnemonic: "En la China antigua, una madre (女) abrazando a su hijo (子) era la representación máxima de la armonía, paz y bienestar. ¡Mujer + Hijo = Bueno (好)!",
        mnemonicEn: "In ancient China, a mother (女) holding her child (子) was the ultimate symbol of harmony and joy. Woman + Child = Good (好)!",
        siblings: [
            { char: "妈", pinyin: "mā", meaning: "Mamá" },
            { char: "妹", pinyin: "mèi", meaning: "Hermana menor" },
            { char: "姐", pinyin: "jiě", meaning: "Hermana mayor" },
            { char: "奶", pinyin: "nǎi", meaning: "Abuela / Leche" }
        ],
        challengeOptions: ["女", "子", "口", "父"]
    },
    {
        char: "家",
        pinyin: "jiā",
        meaning: "Casa, hogar, familia",
        meaningEn: "Home, family",
        hsk: 1,
        type: "会意字 (Ideograma compuesto)",
        typeEn: "Compound Ideograph",
        radical: {
            char: "宀",
            name: "宝盖头 (Radical de Techo)",
            nameEn: "Roof Radical",
            pinyin: "mián",
            meaning: "Techo, hogar, casa",
            meaningEn: "Roof, shelter"
        },
        formula: [
            { char: "宀", name: "宀 (Techo)", meaning: "Vivienda / Tejado" },
            { char: "豕", name: "豕 (Cerdo)", meaning: "Ganado doméstico" }
        ],
        mnemonic: "En la antigüedad agrícola china, un cerdo o ganado (豕) resguardado bajo un techo (宀) era símbolo de prosperidad y alimento asegurado para toda la familia y el hogar (家).",
        mnemonicEn: "In ancient agrarian China, keeping pigs (豕) safely sheltered under a roof (宀) meant prosperity and food security for the entire family & home (家).",
        siblings: [
            { char: "字", pinyin: "zì", meaning: "Carácter" },
            { char: "安", pinyin: "ān", meaning: "Paz / Seguro" },
            { char: "定", pinyin: "dìng", meaning: "Fijar" },
            { char: "室", pinyin: "shì", meaning: "Habitación" }
        ],
        challengeOptions: ["宀", "豕", "犬", "木"]
    },
    {
        char: "看",
        pinyin: "kàn",
        meaning: "Mirar, ver, leer",
        meaningEn: "To look, watch, read",
        hsk: 1,
        type: "会意字 (Ideograma compuesto)",
        typeEn: "Compound Ideograph",
        radical: {
            char: "目",
            name: "目字旁 (Radical de Ojo)",
            nameEn: "Eye Radical",
            pinyin: "mù",
            meaning: "Ojo, vista",
            meaningEn: "Eye, vision"
        },
        formula: [
            { char: "手", name: "手/龵 (Mano)", meaning: "Mano que hace sombra" },
            { char: "目", name: "目 (Ojo)", meaning: "Ojo que otea" }
        ],
        mnemonic: "El gesto universal de llevarse la mano (手 / 龵) sobre los ojos (目) como visera para otear el horizonte frente al sol brillante. ¡Mano + Ojo = Mirar / Ver (看)!",
        mnemonicEn: "The universal gesture of shading your eye (目) with your hand (手) to gaze into the bright horizon. Hand + Eye = Look / Watch (看)!",
        siblings: [
            { char: "眼", pinyin: "yǎn", meaning: "Ojo" },
            { char: "睛", pinyin: "jīng", meaning: "Pupila" },
            { char: "睡", pinyin: "shuì", meaning: "Dormir" }
        ],
        challengeOptions: ["手", "目", "口", "耳"]
    },
    {
        char: "药",
        pinyin: "yào",
        meaning: "Medicina, medicamento, fármaco",
        meaningEn: "Medicine, drug",
        hsk: 2,
        type: "形声字 (Fono-semántico)",
        typeEn: "Phono-semantic Compound",
        radical: {
            char: "艹",
            name: "草字头 (Radical de Hierba)",
            nameEn: "Grass/Herb Radical",
            pinyin: "cǎo",
            meaning: "Hierbas medicinales, plantas",
            meaningEn: "Grass, herbs"
        },
        formula: [
            { char: "艹", name: "艹 (Hierba)", meaning: "Plantas medicinales" },
            { char: "约", name: "约 (Acuerdo)", meaning: "Componente fonético" }
        ],
        mnemonic: "La base de la medicina tradicional china son las hierbas curativas (艹). Las hierbas que alivian el cuerpo son la verdadera Medicina (药).",
        mnemonicEn: "Traditional Chinese medicine originates from natural healing herbs (艹). Herbs that heal the body are Medicine (药).",
        siblings: [
            { char: "茶", pinyin: "chá", meaning: "Té" },
            { char: "花", pinyin: "huā", meaning: "Flor" },
            { char: "菜", pinyin: "cài", meaning: "Verdura / Plato" }
        ],
        challengeOptions: ["艹", "约", "木", "氵"]
    }
];

class RadicalDecomposerGame {
    constructor(app) {
        this.app = app;
        this.currentCharacter = HSK_DECOMPOSITION_DATABASE[0];
        this.challengeSelection = [];
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderQuickChips();
        this.loadCharacter(this.currentCharacter);
    }

    cacheDOM() {
        this.container = document.getElementById("radical-decomposer");
        this.searchInput = document.getElementById("decomposer-search-input");
        this.quickChips = document.getElementById("decomposer-quick-chips");

        this.charDisplay = document.getElementById("decomp-char-display");
        this.pinyinEl = document.getElementById("decomp-pinyin");
        this.meaningEl = document.getElementById("decomp-meaning");
        this.hskBadge = document.getElementById("decomp-hsk-badge");
        this.typeBadge = document.getElementById("decomp-type-badge");
        this.audioBtn = document.getElementById("decomp-audio-btn");

        this.formulaEquation = document.getElementById("decomp-formula-equation");
        this.mnemonicStory = document.getElementById("decomp-mnemonic-story");

        this.radicalHighlight = document.getElementById("decomp-radical-highlight");
        this.siblingsGrid = document.getElementById("decomp-siblings-grid");

        this.challengeSlots = document.getElementById("decomp-challenge-slots");
        this.challengeOptions = document.getElementById("decomp-challenge-options");
        this.challengeFeedback = document.getElementById("decomp-challenge-feedback");
    }

    bindEvents() {
        if (this.searchInput) {
            this.searchInput.addEventListener("input", (e) => this.handleSearch(e.target.value));
        }

        if (this.audioBtn) {
            this.audioBtn.addEventListener("click", () => {
                this.app.audioController?.playWordAudio?.(this.currentCharacter.char);
            });
        }
    }

    renderQuickChips() {
        if (!this.quickChips) return;
        this.quickChips.innerHTML = HSK_DECOMPOSITION_DATABASE.map((item) => {
            const isActive = item.char === this.currentCharacter.char;
            return `
                <button type="button" class="decomposer-chip ${isActive ? "active" : ""}" data-char="${item.char}">
                    ${item.char} ${item.pinyin}
                </button>
            `;
        }).join("");

        this.quickChips.querySelectorAll(".decomposer-chip").forEach((btn) => {
            btn.addEventListener("click", () => {
                const char = btn.getAttribute("data-char");
                const found = HSK_DECOMPOSITION_DATABASE.find((i) => i.char === char);
                if (found) {
                    this.loadCharacter(found);
                    this.renderQuickChips();
                }
            });
        });
    }

    normalizeText(str) {
        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    handleSearch(query) {
        const clean = this.normalizeText(query);
        if (!clean) return;

        const found = HSK_DECOMPOSITION_DATABASE.find((item) => {
            const normPinyin = this.normalizeText(item.pinyin);
            const normMeaning = this.normalizeText(item.meaning);
            const normMeaningEn = this.normalizeText(item.meaningEn);
            return (
                item.char === query.trim() ||
                normPinyin.includes(clean) ||
                normMeaning.includes(clean) ||
                normMeaningEn.includes(clean)
            );
        });

        if (found) {
            this.loadCharacter(found);
            this.renderQuickChips();
        }
    }

    loadCharacter(item) {
        this.currentCharacter = item;
        const isEs = this.app?.currentLanguage !== "en";

        if (this.charDisplay) this.charDisplay.textContent = item.char;
        if (this.pinyinEl) this.pinyinEl.textContent = item.pinyin;
        if (this.meaningEl) this.meaningEl.textContent = isEs ? item.meaning : (item.meaningEn || item.meaning);
        if (this.hskBadge) this.hskBadge.textContent = `HSK ${item.hsk}`;
        if (this.typeBadge) this.typeBadge.textContent = isEs ? item.type : (item.typeEn || item.type);

        if (this.mnemonicStory) {
            this.mnemonicStory.textContent = isEs ? item.mnemonic : (item.mnemonicEn || item.mnemonic);
        }

        this.renderFormula(item);
        this.renderRadicalInfo(item);
        this.renderSiblings(item);
        this.setupChallenge(item);
    }

    renderFormula(item) {
        if (!this.formulaEquation) return;
        const parts = item.formula.map((comp) => `
            <div class="formula-component">
                <span class="comp-hanzi">${comp.char}</span>
                <div class="comp-info">
                    <span class="comp-name">${comp.name}</span>
                    <span class="comp-meaning">${comp.meaning}</span>
                </div>
            </div>
        `);

        this.formulaEquation.innerHTML = `
            ${parts.join('<span class="formula-operator">+</span>')}
            <span class="formula-operator">=</span>
            <div class="formula-component" style="border-color: var(--primary, #d32f2f); background: rgba(211,47,47,0.04);">
                <span class="comp-hanzi">${item.char}</span>
                <div class="comp-info">
                    <span class="comp-name">${item.pinyin}</span>
                    <span class="comp-meaning">${item.meaning}</span>
                </div>
            </div>
        `;
    }

    renderRadicalInfo(item) {
        if (!this.radicalHighlight) return;
        const isEs = this.app?.currentLanguage !== "en";
        const rad = item.radical;

        this.radicalHighlight.innerHTML = `
            <div class="rad-big-char">${rad.char}</div>
            <div class="rad-details">
                <div class="rad-pinyin">${isEs ? rad.name : (rad.nameEn || rad.name)} (${rad.pinyin})</div>
                <div class="rad-meaning">${isEs ? rad.meaning : (rad.meaningEn || rad.meaning)}</div>
            </div>
        `;
    }

    renderSiblings(item) {
        if (!this.siblingsGrid) return;
        this.siblingsGrid.innerHTML = item.siblings.map((sib) => `
            <div class="sibling-item" data-char="${sib.char}">
                <span class="sibling-char">${sib.char}</span>
                <span class="sibling-pinyin">${sib.pinyin}</span>
            </div>
        `).join("");

        this.siblingsGrid.querySelectorAll(".sibling-item").forEach((el) => {
            el.addEventListener("click", () => {
                const char = el.getAttribute("data-char");
                this.app.audioController?.playWordAudio?.(char);
                this.app.showToast?.(`Carácter hermano: ${char}`, "info", 1500);
            });
        });
    }

    setupChallenge(item) {
        this.challengeSelection = [];
        if (this.challengeFeedback) this.challengeFeedback.style.display = "none";
        this.updateChallengeSlots();

        if (!this.challengeOptions) return;
        const shuffled = [...item.challengeOptions].sort(() => Math.random() - 0.5);

        this.challengeOptions.innerHTML = shuffled.map((opt) => `
            <button type="button" class="challenge-opt-btn" data-char="${opt}">
                ${opt}
            </button>
        `).join("");

        this.challengeOptions.querySelectorAll(".challenge-opt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const char = btn.getAttribute("data-char");
                this.handleChallengePick(char);
            });
        });
    }

    updateChallengeSlots() {
        if (!this.challengeSlots) return;
        if (this.challengeSelection.length === 0) {
            this.challengeSlots.innerHTML = '<span style="color: var(--text-secondary, #9ca3af); font-size: 0.85rem;">Pulsa los componentes abajo para armarlo...</span>';
            return;
        }

        this.challengeSlots.innerHTML = this.challengeSelection.map((char) => `
            <span class="challenge-slot-item">${char}</span>
        `).join("");
    }

    handleChallengePick(char) {
        this.challengeSelection.push(char);
        this.updateChallengeSlots();

        const neededChars = this.currentCharacter.formula.map((f) => f.char);
        if (this.challengeSelection.length === neededChars.length) {
            const isCorrect = neededChars.every((c, i) => this.challengeSelection[i] === c);
            this.showChallengeResult(isCorrect);
        }
    }

    showChallengeResult(isCorrect) {
        if (!this.challengeFeedback) return;
        const isEs = this.app?.currentLanguage !== "en";

        if (isCorrect) {
            this.challengeFeedback.className = "challenge-feedback correct";
            this.challengeFeedback.innerHTML = isEs
                ? `🎉 ¡Excelente! Has ensamblado correctamente <strong>${this.currentCharacter.char}</strong> (${this.currentCharacter.pinyin}).`
                : `🎉 Excellent! You correctly assembled <strong>${this.currentCharacter.char}</strong> (${this.currentCharacter.pinyin}).`;
            this.challengeFeedback.style.display = "block";

            this.app.audioController?.playCorrect?.();
            this.app.achievementManager?.fireConfetti?.();
        } else {
            this.challengeFeedback.className = "challenge-feedback incorrect";
            this.challengeFeedback.innerHTML = isEs
                ? "❌ Orden o componentes incorrectos. Vuelve a intentarlo."
                : "❌ Incorrect components or order. Try again.";
            this.challengeFeedback.style.display = "block";

            this.app.audioController?.playIncorrect?.();
            setTimeout(() => {
                this.setupChallenge(this.currentCharacter);
            }, 1400);
        }
    }
}

window.RadicalDecomposerGame = RadicalDecomposerGame;
