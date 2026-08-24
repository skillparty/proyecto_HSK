// calligraphy-scroll-game.js — Motor del Estudio de Caligrafía y Rollos Tradicionales Chinos

const CALLIGRAPHY_PRESETS = {
    "quiet-night": {
        id: "quiet-night",
        title: "《静夜思》",
        author: "【唐】李白",
        lines: [
            "床前明月光",
            "疑是地上霜",
            "举头望明月",
            "低头思故乡"
        ],
        pinyin: "Chuáng qián míng yuè guāng, yí shì dì shàng shuāng. Jǔ tóu wàng míng yuè, dī tóu sī gùxiāng.",
        trans: "Frente a mi lecho brilla la luz de la luna, parece escarcha sobre el suelo. Levanto la cabeza y contemplo la luna clara, la inclino y pienso en mi tierra natal."
    },
    "spring-dawn": {
        id: "spring-dawn",
        title: "《春晓》",
        author: "【唐】孟浩然",
        lines: [
            "春眠不觉晓",
            "处处闻啼鸟",
            "夜来风雨声",
            "花落知多少"
        ],
        pinyin: "Chūn mián bù jué xiǎo, chùchù wén tí niǎo. Yè lái fēng yǔ shēng, huā luò zhī duōshǎo.",
        trans: "El sueño primaveral no siente el alba, por todas partes se oyen cantar las aves. Tras los vientos y lluvias de la noche, ¿cuántas flores habrán caído?"
    },
    "stork-tower": {
        id: "stork-tower",
        title: "《登鹳雀楼》",
        author: "【唐】王之涣",
        lines: [
            "白日依山尽",
            "黄河入海流",
            "欲穷千里目",
            "更上一层楼"
        ],
        pinyin: "Bái rì yī shān jǐn, Huáng Hé rù hǎi liú. Yù qióng qiānlǐ mù, gèng shàng yī céng lóu.",
        trans: "El sol blanco se oculta tras los montes, el Río Amarillo fluye hacia el mar. Si deseas abarcar mil millas con la vista, sube aún un piso más."
    },
    "thousand-miles": {
        id: "thousand-miles",
        title: "《道德经·格言》",
        author: "【春秋】老子",
        lines: [
            "千里之行",
            "始于足下",
            "九层之台",
            "起于累土"
        ],
        pinyin: "Qiān lǐ zhī xíng, shǐ yú zú xià. Jiǔ céng zhī tái, qǐ yú lěi tǔ.",
        trans: "Un viaje de mil millas comienza con un solo paso. Una torre de nueve pisos empieza desde un puñado de tierra."
    },
    "water-stone": {
        id: "water-stone",
        title: "《水滴石穿》",
        author: "【汉】班固",
        lines: [
            "水滴石穿",
            "绳锯木断",
            "锲而不舍",
            "金石可镂"
        ],
        pinyin: "Shuǐ dī shí chuān, shéng jù mù duàn. Qiè ér bù shě, jīn shí kě lòu.",
        trans: "La gota horada la piedra, la cuerda corta la madera. Con perseverancia inquebrantable, hasta el metal y la roca pueden tallarse."
    }
};

class CalligraphyScrollGame {
    constructor(app) {
        this.app = app;
        this.currentPresetKey = "quiet-night";
        this.currentFont = "kaishu";
        this.currentSilkTheme = "imperial-gold";
        this.authorSeal = "孔门雅士";
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.applyPreset(this.currentPresetKey);
    }

    cacheDOM() {
        this.container = document.getElementById("calligraphy-scroll");
        this.presetSelect = document.getElementById("scroll-preset-select");
        this.customInputsWrap = document.getElementById("scroll-custom-inputs");
        this.customTitleInput = document.getElementById("scroll-custom-title");
        this.customContentInput = document.getElementById("scroll-custom-content");

        this.fontSelect = document.getElementById("scroll-font-style");
        this.silkThemeSelect = document.getElementById("scroll-silk-theme");
        this.sealAuthorInput = document.getElementById("scroll-seal-author");

        this.readAloudBtn = document.getElementById("scroll-read-aloud-btn");
        this.printBtn = document.getElementById("scroll-print-btn");

        this.silkMount = document.getElementById("scroll-silk-mount");
        this.poemTitleEl = document.getElementById("scroll-poem-title");
        this.poemAuthorEl = document.getElementById("scroll-poem-author");
        this.calligraphyBodyEl = document.getElementById("scroll-calligraphy-body");
        this.vermilionChop = document.getElementById("scroll-vermilion-chop");
    }

    bindEvents() {
        if (this.presetSelect) {
            this.presetSelect.addEventListener("change", () => {
                const key = this.presetSelect.value;
                if (key === "custom") {
                    if (this.customInputsWrap) this.customInputsWrap.style.display = "block";
                    this.applyCustomScroll();
                } else {
                    if (this.customInputsWrap) this.customInputsWrap.style.display = "none";
                    this.applyPreset(key);
                }
            });
        }

        if (this.customTitleInput) {
            this.customTitleInput.addEventListener("input", () => this.applyCustomScroll());
        }

        if (this.customContentInput) {
            this.customContentInput.addEventListener("input", () => this.applyCustomScroll());
        }

        if (this.fontSelect) {
            this.fontSelect.addEventListener("change", () => {
                this.currentFont = this.fontSelect.value;
                this.updateScrollStyling();
            });
        }

        if (this.silkThemeSelect) {
            this.silkThemeSelect.addEventListener("change", () => {
                this.currentSilkTheme = this.silkThemeSelect.value;
                this.updateScrollStyling();
            });
        }

        if (this.sealAuthorInput) {
            this.sealAuthorInput.addEventListener("input", () => {
                this.authorSeal = this.sealAuthorInput.value.trim() || "孔夫子";
                this.updateSealDisplay();
            });
        }

        if (this.readAloudBtn) {
            this.readAloudBtn.addEventListener("click", () => this.recitePoemAudio());
        }

        if (this.printBtn) {
            this.printBtn.addEventListener("click", () => this.printScroll());
        }
    }

    applyPreset(presetKey) {
        this.currentPresetKey = presetKey;
        const data = CALLIGRAPHY_PRESETS[presetKey];
        if (!data) return;

        if (this.poemTitleEl) this.poemTitleEl.textContent = data.title;
        if (this.poemAuthorEl) this.poemAuthorEl.textContent = data.author;

        if (this.calligraphyBodyEl) {
            this.calligraphyBodyEl.innerHTML = data.lines.map((line) => `
                <div class="scroll-column">${line}</div>
            `).join("");
        }

        this.updateScrollStyling();
        this.updateSealDisplay();
    }

    applyCustomScroll() {
        const title = this.customTitleInput?.value.trim() || "《书山有路》";
        const content = this.customContentInput?.value.trim() || "学无止境";
        const author = this.authorSeal ? `【学士】${this.authorSeal}` : "【书家】雅士";

        if (this.poemTitleEl) this.poemTitleEl.textContent = title;
        if (this.poemAuthorEl) this.poemAuthorEl.textContent = author;

        const lines = content.split("\n").filter((l) => l.trim().length > 0);

        if (this.calligraphyBodyEl) {
            this.calligraphyBodyEl.innerHTML = lines.map((line) => `
                <div class="scroll-column">${line}</div>
            `).join("");
        }

        this.updateScrollStyling();
        this.updateSealDisplay();
    }

    updateScrollStyling() {
        if (this.silkMount) {
            this.silkMount.className = `scroll-silk-mount theme-${this.currentSilkTheme}`;
        }
        if (this.calligraphyBodyEl) {
            this.calligraphyBodyEl.className = `scroll-calligraphy-body font-${this.currentFont}`;
        }
    }

    updateSealDisplay() {
        if (!this.vermilionChop) return;
        const text = this.authorSeal || "孔门雅士";
        const topText = text.slice(0, 2);
        const btmText = text.slice(2, 4) || "之印";

        this.vermilionChop.innerHTML = `
            <span>${topText}</span>
            <span>${btmText}</span>
        `;
    }

    recitePoemAudio() {
        let textToRead = "";
        if (this.currentPresetKey !== "custom") {
            const data = CALLIGRAPHY_PRESETS[this.currentPresetKey];
            if (data) textToRead = data.lines.join("，");
        } else {
            textToRead = this.customContentInput?.value.replace(/\n/g, "，") || "";
        }

        if (textToRead) {
            this.app?.audioController?.playWordAudio?.(textToRead);
        }
    }

    printScroll() {
        window.print();
    }
}

window.CalligraphyScrollGame = CalligraphyScrollGame;
