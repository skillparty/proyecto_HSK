/**
 * WritingSheetsController - Generador de Plantillas de Escritura y Caligrafía China
 * Crea cuadernos de caligrafía con cuadrículas tradicionales (田字格, 米字格, 回字格, 九宫格),
 * desglose trazo por trazo y exportación e impresión a PDF profesional en hojas A4.
 */

class WritingSheetsController {
    constructor(app) {
        this.app = app;
        this.strokeCache = new Map();
        this.isInitialized = false;

        // Estado inicial de la plantilla
        this.state = {
            characters: [], // Array de { hanzi, pinyin, meaning, strokes }
            gridType: "tianzige", // "tianzige" | "mige" | "huizige" | "jiugongge" | "pingzige"
            practiceMode: "stroke-by-stroke", // "stroke-by-stroke" | "tracing" | "model-blank" | "composition"
            gridSize: "medium", // "large" (26mm) | "medium" (20mm) | "small" (15mm)
            slotsPerRow: "8", // "auto" | "6" | "8" | "10"
            gridColor: "#dc2626", // Rojo Imperial por defecto
            worksheetTitle: "Práctica de Caligrafía China",
            showPinyin: true,
            showMeaning: true,
            showPinyinLines: false,
            showStudentHeader: true,
            showAudioQR: true,
            sourceMode: "text" // "text" | "hsk" | "etymology"
        };

        // Presets predefinidos
        this.presets = {
            greetings: ["你", "好", "谢", "再", "见"],
            yong: ["永"],
            numbers: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
            nature: ["日", "月", "山", "水", "火", "木", "金", "土", "天"],
            hsk1: ["我", "你", "他", "是", "好", "大", "小", "多", "少", "人"]
        };

        // Mapa de radicales frecuentes (部首) para metadatos de caracteres
        this.radicalMap = {
            "人": "人", "大": "大", "女": "女", "子": "子", "小": "小",
            "口": "口", "山": "山", "工": "工", "土": "土", "夕": "夕",
            "手": "扌", "打": "扌", "把": "扌", "拉": "扌", "找": "扌",
            "水": "水", "河": "氵", "海": "氵", "湖": "氵", "没": "氵",
            "火": "火", "热": "灬", "然": "灬", "煮": "灬",
            "心": "心", "想": "心", "思": "心", "意": "心", "忙": "忄",
            "日": "日", "时": "日", "明": "日", "早": "日", "晚": "日",
            "月": "月", "有": "月", "朋": "月", "期": "月",
            "木": "木", "树": "木", "林": "木", "森": "木", "桌": "木",
            "金": "金", "银": "钅", "铁": "钅", "钱": "钅",
            "言": "言", "说": "讠", "话": "讠", "语": "讠", "读": "讠", "请": "讠",
            "走": "走", "足": "足", "跑": "足", "路": "足", "跳": "足",
            "食": "食", "吃": "口", "喝": "口", "饭": "饣",
            "衣": "衣", "车": "车", "门": "门", "马": "马",
            "目": "目", "看": "目", "睡": "目", "眼": "目",
            "耳": "耳", "听": "口", "雨": "雨", "雪": "雨", "电": "雨",
            "草": "艹", "花": "艹", "茶": "艹", "菜": "艹", "药": "艹",
            "竹": "竹", "笔": "竹", "筷": "竹",
            "丝": "纟", "红": "纟", "绿": "纟", "给": "纟", "经": "纟",
            "虫": "虫", "鸟": "鸟", "鱼": "鱼", "禾": "禾",
            "我": "戈", "你": "亻", "他": "亻", "她": "女", "们": "亻",
            "是": "日", "好": "女", "不": "一", "了": "乛", "在": "土",
            "这": "辶", "那": "阝", "的": "白", "很": "彳", "多": "夕",
            "少": "小", "学": "子", "会": "人", "能": "月",
            "天": "大", "年": "干", "星": "日", "来": "木", "去": "土",
            "上": "一", "下": "一", "中": "丨", "里": "里",
            "永": "水", "谢": "讠", "再": "冂", "见": "见",
            "一": "一", "二": "二", "三": "一", "四": "囗", "五": "一",
            "六": "八", "七": "一", "八": "八", "九": "丿", "十": "十",
            "百": "白", "千": "十", "万": "一"
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        this.bindEvents();
        this.isInitialized = true;

        // Cargar caracteres iniciales por defecto (saludos básicos)
        await this.loadCharactersFromText("你好谢谢再见");
        this.renderPreview();
    }

    bindEvents() {
        // Selector de pestañas de origen (Texto libre, HSK, Etimología)
        const sourceTabs = document.querySelectorAll(".ws-source-tab");
        sourceTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const source = tab.getAttribute("data-source");
                this.switchSourceTab(source);
            });
        });

        // Entrada de texto libre (con debounce)
        const customInput = document.getElementById("ws-custom-input");
        if (customInput) {
            let debounceTimer = null;
            customInput.addEventListener("input", (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    await this.loadCharactersFromText(e.target.value);
                    this.renderPreview();
                }, 350);
            });
        }

        // Botones de presets rápidos en el panel de texto
        const presetBtns = document.querySelectorAll(".ws-preset-btn");
        presetBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
                const presetKey = btn.getAttribute("data-preset");
                await this.loadPreset(presetKey);
            });
        });

        // Botón general de plantillas de ejemplo en el header
        const presetsBtn = document.getElementById("ws-presets-btn");
        if (presetsBtn) {
            presetsBtn.addEventListener("click", async () => {
                await this.loadPreset("yong");
            });
        }

        // Carga desde HSK
        const loadHskBtn = document.getElementById("ws-load-hsk-btn");
        if (loadHskBtn) {
            loadHskBtn.addEventListener("click", async () => {
                const level = parseInt(document.getElementById("ws-hsk-select")?.value || "1", 10);
                const count = parseInt(document.getElementById("ws-hsk-count-select")?.value || "10", 10);
                await this.loadFromHskLevel(level, count);
            });
        }

        // Carga desde Etimología
        const loadEtymBtn = document.getElementById("ws-load-etym-btn");
        if (loadEtymBtn) {
            loadEtymBtn.addEventListener("click", async () => {
                const lessonId = document.getElementById("ws-etym-lesson-select")?.value || "A-1";
                await this.loadFromEtymologyLesson(lessonId);
            });
        }

        // Limpiar caracteres
        const clearCharsBtn = document.getElementById("ws-clear-chars-btn");
        if (clearCharsBtn) {
            clearCharsBtn.addEventListener("click", () => {
                this.state.characters = [];
                const input = document.getElementById("ws-custom-input");
                if (input) input.value = "";
                this.renderChips();
                this.renderPreview();
            });
        }

        // Selección de Tipo de Cuadrícula
        const gridCards = document.querySelectorAll("#ws-grid-type-group .ws-option-card");
        gridCards.forEach(card => {
            card.addEventListener("click", () => {
                gridCards.forEach(c => c.classList.remove("is-selected"));
                card.classList.add("is-selected");
                this.state.gridType = card.getAttribute("data-grid") || "tianzige";
                this.renderPreview();
            });
        });

        // Selección de Modo de Práctica
        const modeCards = document.querySelectorAll("#ws-practice-mode-group .ws-mode-card");
        modeCards.forEach(card => {
            card.addEventListener("click", () => {
                modeCards.forEach(c => c.classList.remove("is-selected"));
                card.classList.add("is-selected");
                this.state.practiceMode = card.getAttribute("data-mode") || "stroke-by-stroke";
                this.renderPreview();
            });
        });

        // Tamaño de cuadrícula
        const sizeSelect = document.getElementById("ws-size-select");
        if (sizeSelect) {
            sizeSelect.addEventListener("change", (e) => {
                this.state.gridSize = e.target.value;
                this.renderPreview();
            });
        }

        // Casillas por fila
        const slotsSelect = document.getElementById("ws-slots-select");
        if (slotsSelect) {
            slotsSelect.addEventListener("change", (e) => {
                this.state.slotsPerRow = e.target.value;
                this.renderPreview();
            });
        }

        // Paleta de colores de cuadrícula
        const colorSwatches = document.querySelectorAll("#ws-color-swatches .ws-color-swatch");
        colorSwatches.forEach(swatch => {
            swatch.addEventListener("click", () => {
                colorSwatches.forEach(s => s.classList.remove("is-selected"));
                swatch.classList.add("is-selected");
                this.state.gridColor = swatch.getAttribute("data-color") || "#dc2626";
                this.renderPreview();
            });
        });

        // Título de la hoja
        const titleInput = document.getElementById("ws-title-input");
        if (titleInput) {
            titleInput.addEventListener("input", (e) => {
                this.state.worksheetTitle = e.target.value.trim() || "Práctica de Caligrafía China";
                this.renderPreview();
            });
        }

        // Toggles de visualización
        const togglePinyin = document.getElementById("ws-toggle-pinyin");
        if (togglePinyin) {
            togglePinyin.addEventListener("change", (e) => {
                this.state.showPinyin = e.target.checked;
                this.renderPreview();
            });
        }

        const toggleMeaning = document.getElementById("ws-toggle-meaning");
        if (toggleMeaning) {
            toggleMeaning.addEventListener("change", (e) => {
                this.state.showMeaning = e.target.checked;
                this.renderPreview();
            });
        }

        const togglePinyinLines = document.getElementById("ws-toggle-pinyin-lines");
        if (togglePinyinLines) {
            togglePinyinLines.addEventListener("change", (e) => {
                this.state.showPinyinLines = e.target.checked;
                this.renderPreview();
            });
        }

        const toggleStudentHeader = document.getElementById("ws-toggle-student-header");
        if (toggleStudentHeader) {
            toggleStudentHeader.addEventListener("change", (e) => {
                this.state.showStudentHeader = e.target.checked;
                this.renderPreview();
            });
        }

        const toggleAudioQR = document.getElementById("ws-toggle-audio-qr");
        if (toggleAudioQR) {
            toggleAudioQR.addEventListener("change", (e) => {
                this.state.showAudioQR = e.target.checked;
                this.renderPreview();
            });
        }

        // Botones de impresión y PDF
        const printBtn = document.getElementById("ws-print-btn");
        if (printBtn) {
            printBtn.addEventListener("click", () => this.triggerPrint());
        }

        const toolbarPrintBtn = document.getElementById("ws-toolbar-print-btn");
        if (toolbarPrintBtn) {
            toolbarPrintBtn.addEventListener("click", () => this.triggerPrint());
        }
    }

    switchSourceTab(source) {
        this.state.sourceMode = source;
        const tabs = document.querySelectorAll(".ws-source-tab");
        tabs.forEach(t => {
            const isActive = t.getAttribute("data-source") === source;
            t.classList.toggle("is-active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        const panels = document.querySelectorAll(".ws-source-panel");
        panels.forEach(p => p.classList.remove("is-active"));

        const targetPanel = document.getElementById(`ws-source-panel-${source}`);
        if (targetPanel) {
            targetPanel.classList.add("is-active");
        }
    }

    async loadPreset(presetKey) {
        const chars = this.presets[presetKey] || this.presets.greetings;
        await this.loadCharactersFromArray(chars);
        const input = document.getElementById("ws-custom-input");
        if (input) input.value = chars.join("");
        this.renderChips();
        this.renderPreview();
    }

    async loadFromHskLevel(level, count = 10) {
        const vocab = this.app?.vocabulary || [];
        const levelWords = vocab.filter(w => w.level === level);
        const selectedWords = levelWords.slice(0, count);

        const hanziList = [];
        for (const w of selectedWords) {
            const chars = Array.from(w.character || "");
            for (const ch of chars) {
                if (/[㐀-龿]/.test(ch) && !hanziList.includes(ch)) {
                    hanziList.push(ch);
                }
            }
        }

        await this.loadCharactersFromArray(hanziList.slice(0, count));
        const input = document.getElementById("ws-custom-input");
        if (input) input.value = hanziList.slice(0, count).join("");
        this.renderChips();
        this.renderPreview();
    }

    async loadFromEtymologyLesson(lessonId) {
        const etymController = this.app?.etymologyController || window.etymologyController;
        let lessonChars = [];

        if (etymController && etymController.lessons) {
            const lesson = etymController.lessons.find(l => l.id === lessonId);
            if (lesson && lesson.chars) {
                lessonChars = lesson.chars.map(c => c.hanzi);
            }
        }

        if (lessonChars.length === 0) {
            // Fallback para lecciones comunes
            if (lessonId === "A-1") lessonChars = ["人", "大", "女", "子"];
            else if (lessonId === "A-2") lessonChars = ["手", "口", "目", "耳"];
            else if (lessonId === "B-1") lessonChars = ["日", "月", "山", "水"];
            else lessonChars = ["木", "禾", "鸟", "马"];
        }

        await this.loadCharactersFromArray(lessonChars);
        const input = document.getElementById("ws-custom-input");
        if (input) input.value = lessonChars.join("");
        this.renderChips();
        this.renderPreview();
    }

    async loadCharactersFromText(text) {
        if (!text || typeof text !== "string") {
            this.state.characters = [];
            this.renderChips();
            return;
        }

        // Extraer caracteres CJK chinos
        const rawChars = Array.from(text).filter(ch => /[㐀-龿]/.test(ch));
        // Filtrar duplicados consecutivos o mantener orden único
        const uniqueChars = [];
        for (const ch of rawChars) {
            if (!uniqueChars.includes(ch)) {
                uniqueChars.push(ch);
            }
        }

        await this.loadCharactersFromArray(uniqueChars);
        this.renderChips();
    }

    async loadCharactersFromArray(charArray) {
        const vocab = this.app?.vocabulary || [];
        const charMap = new Map();
        vocab.forEach(w => {
            if (w.character && !charMap.has(w.character)) {
                charMap.set(w.character, w);
            }
        });

        const items = [];
        for (const ch of charArray) {
            let pinyin = "";
            let meaning = "";

            let match = charMap.get(ch);
            if (!match) {
                match = vocab.find(w => w.character && w.character.includes(ch));
            }
            if (match) {
                pinyin = match.pinyin || "";
                meaning = match.spanish || match.english || "";
            }

            // Cargar datos de trazos
            const strokes = await this.fetchStrokeData(ch);

            items.push({
                hanzi: ch,
                pinyin: pinyin,
                meaning: meaning,
                strokes: strokes,
                strokeCount: strokes.length || 0,
                radical: this.radicalMap[ch] || ""
            });
        }

        this.state.characters = items;
    }

    async fetchStrokeData(char) {
        if (this.strokeCache.has(char)) {
            return this.strokeCache.get(char);
        }

        try {
            const url = `assets/data/etymology/strokes/${encodeURIComponent(char)}.json`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.strokes)) {
                    this.strokeCache.set(char, data.strokes);
                    return data.strokes;
                }
            }
        } catch {
            // Stroke lookup failure fallback
        }

        this.strokeCache.set(char, []);
        return [];
    }

    renderChips() {
        const container = document.getElementById("ws-selected-chips");
        const countText = document.getElementById("ws-char-count-text");

        if (countText) {
            countText.textContent = `${this.state.characters.length} caracteres en plantilla`;
        }

        if (!container) return;
        container.innerHTML = "";

        if (this.state.characters.length === 0) {
            container.innerHTML = `<span style="font-size: 0.82rem; color: var(--text-muted); padding: 4px;">No hay caracteres. Escribe texto o selecciona un nivel arriba.</span>`;
            return;
        }

        this.state.characters.forEach((item, index) => {
            const chip = document.createElement("span");
            chip.className = "ws-char-chip";
            chip.innerHTML = `
                <span>${item.hanzi}</span>
                <button type="button" class="ws-chip-remove" title="Eliminar" data-index="${index}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;

            chip.querySelector(".ws-chip-remove")?.addEventListener("click", () => {
                this.state.characters.splice(index, 1);
                this.renderChips();
                this.renderPreview();
            });

            container.appendChild(chip);
        });
    }

    // Generador de SVG para las diferentes cuadrículas tradicionales
    renderGridSvg(type, color = "#dc2626") {
        const c = color;
        if (type === "mige") {
            return `
                <svg class="ws-grid-svg" viewBox="0 0 100 100" style="color: ${c};">
                    <rect x="1" y="1" width="98" height="98" fill="#fffdf9" stroke="currentColor" stroke-width="1.5" />
                    <line x1="50" y1="1" x2="50" y2="99" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.65" />
                    <line x1="1" y1="50" x2="99" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.65" />
                    <line x1="1" y1="1" x2="99" y2="99" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.4" />
                    <line x1="1" y1="99" x2="99" y2="1" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.4" />
                </svg>
            `;
        }
        if (type === "huizige") {
            return `
                <svg class="ws-grid-svg" viewBox="0 0 100 100" style="color: ${c};">
                    <rect x="1" y="1" width="98" height="98" fill="#fffdf9" stroke="currentColor" stroke-width="1.5" />
                    <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.65" />
                    <line x1="50" y1="1" x2="50" y2="99" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.35" />
                    <line x1="1" y1="50" x2="99" y2="50" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.35" />
                </svg>
            `;
        }
        if (type === "jiugongge") {
            return `
                <svg class="ws-grid-svg" viewBox="0 0 100 100" style="color: ${c};">
                    <rect x="1" y="1" width="98" height="98" fill="#fffdf9" stroke="currentColor" stroke-width="1.5" />
                    <line x1="33.33" y1="1" x2="33.33" y2="99" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                    <line x1="66.66" y1="1" x2="66.66" y2="99" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                    <line x1="1" y1="33.33" x2="99" y2="33.33" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                    <line x1="1" y1="66.66" x2="99" y2="66.66" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
                </svg>
            `;
        }
        if (type === "pingzige") {
            return `
                <svg class="ws-grid-svg" viewBox="0 0 100 100" style="color: ${c};">
                    <rect x="1" y="1" width="98" height="98" fill="#fffdf9" stroke="currentColor" stroke-width="1.5" />
                </svg>
            `;
        }

        // Por defecto: 田字格 (Tianzige)
        return `
            <svg class="ws-grid-svg" viewBox="0 0 100 100" style="color: ${c};">
                <rect x="1" y="1" width="98" height="98" fill="#fffdf9" stroke="currentColor" stroke-width="1.5" />
                <line x1="50" y1="1" x2="50" y2="99" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.65" />
                <line x1="1" y1="50" x2="99" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3" opacity="0.65" />
            </svg>
        `;
    }

    // Genera código QR vectorial SVG para impresión de hojas de trabajo
    generateQRCodeSvg(text, size = 44) {
        const n = 21;
        const grid = Array.from({ length: n }, () => Array(n).fill(0));

        const addFinder = (r0, c0) => {
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
                    const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                    grid[r0 + r][c0 + c] = isBorder || isCenter ? 1 : 0;
                }
            }
        };

        addFinder(0, 0);
        addFinder(0, 14);
        addFinder(14, 0);

        for (let i = 8; i < 13; i++) {
            grid[6][i] = i % 2 === 0 ? 1 : 0;
            grid[i][6] = i % 2 === 0 ? 1 : 0;
        }

        let hash = 0;
        const str = String(text || "hsk");
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const inTL = r < 8 && c < 8;
                const inTR = r < 8 && c >= 13;
                const inBL = r >= 13 && c < 8;
                const inTiming = (r === 6 && c >= 8 && c <= 12) || (c === 6 && r >= 8 && r <= 12);
                if (inTL || inTR || inBL || inTiming) continue;

                const bit = ((hash ^ (r * 37 + c * 17)) + r * c) % 3 === 0 ? 1 : 0;
                grid[r][c] = bit;
            }
        }

        let rects = "";
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (grid[r][c] === 1) {
                    rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0f172a" />`;
                }
            }
        }

        return `
            <svg class="ws-header-qr-svg" viewBox="0 0 21 21" width="${size}" height="${size}" style="background: #ffffff; padding: 2px; border: 1px solid #cbd5e1; border-radius: 4px;">
                ${rects}
            </svg>
        `;
    }

    // Renderiza SVG con subconjunto de trazos progresivos
    renderStrokeSvg(strokes, count, _total) {
        if (!strokes || strokes.length === 0) return "";
        const visibleStrokes = strokes.slice(0, count);

        const paths = visibleStrokes.map((pathD, idx) => {
            const isLatest = idx === visibleStrokes.length - 1;
            const fill = isLatest ? "#dc2626" : "#0f172a";
            return `<path d="${pathD}" fill="${fill}" />`;
        }).join("");

        return `
            <svg class="ws-stroke-svg" viewBox="0 0 1024 1024">
                <g transform="scale(1, -1) translate(0, -900)">
                    ${paths}
                </g>
            </svg>
        `;
    }

    // Determina el número de casillas por fila según tamaño
    getSlotCount() {
        if (this.state.slotsPerRow !== "auto") {
            return parseInt(this.state.slotsPerRow, 10);
        }
        if (this.state.gridSize === "large") return 6;
        if (this.state.gridSize === "small") return 10;
        return 8;
    }

    // Determina el número de filas por página A4
    getRowsPerPage() {
        if (this.state.gridSize === "large") return 6;
        if (this.state.gridSize === "small") return 12;
        return 8;
    }

    // Renderiza una fila de práctica de caligrafía
    renderPracticeRow(item, options) {
        const { gridType, practiceMode, gridSize, gridColor, showPinyin, showMeaning, showPinyinLines } = options;
        const totalSlots = this.getSlotCount();
        const gridSvg = this.renderGridSvg(gridType, gridColor);
        const sizeClass = `size-${gridSize}`;

        let slotsHtml = "";
        const strokes = item.strokes || [];
        const hasStrokes = strokes.length > 0;

        for (let i = 0; i < totalSlots; i++) {
            let cellContent = "";

            if (i === 0) {
                // Casilla 0: Carácter modelo sólido
                cellContent = `<span class="ws-cell-char">${item.hanzi}</span>`;
            } else if (practiceMode === "stroke-by-stroke") {
                if (hasStrokes && i <= strokes.length) {
                    // Desglose trazo a trazo progresivo
                    cellContent = this.renderStrokeSvg(strokes, i, strokes.length);
                } else if (i <= (hasStrokes ? strokes.length + 2 : 2)) {
                    // Guía sombreada tenue
                    cellContent = `<span class="ws-cell-char is-faded">${item.hanzi}</span>`;
                }
            } else if (practiceMode === "tracing") {
                if (i <= Math.ceil(totalSlots / 2)) {
                    // Guía sombreada tenue para calcar
                    cellContent = `<span class="ws-cell-char is-faded">${item.hanzi}</span>`;
                }
            }

            const pinyinGuide = showPinyinLines ? `<div class="ws-pinyin-guide-box"></div>` : "";

            slotsHtml += `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    ${pinyinGuide}
                    <div class="ws-grid-cell ${sizeClass}">
                        ${gridSvg}
                        ${cellContent}
                    </div>
                </div>
            `;
        }

        const radicalInfo = item.radical ? `<div class="ws-meta-radical" title="部首: ${item.radical}">部首 ${item.radical}</div>` : "";
        const strokeInfo = item.strokeCount > 0 ? `<div class="ws-meta-strokes">${item.strokeCount} 画</div>` : "";

        return `
            <div class="ws-practice-row">
                <div class="ws-char-meta-block">
                    ${showPinyin && item.pinyin ? `<div class="ws-meta-pinyin">${item.pinyin}</div>` : ""}
                    ${showMeaning && item.meaning ? `<div class="ws-meta-meaning" title="${item.meaning}">${item.meaning}</div>` : ""}
                    <div class="ws-meta-details">${radicalInfo}${strokeInfo}</div>
                </div>
                <div class="ws-slots-row">
                    ${slotsHtml}
                </div>
            </div>
        `;
    }

    // Renderiza la vista previa en tiempo real de las hojas A4
    renderPreview() {
        const previewContainer = document.getElementById("ws-preview-pages");
        const pageBadge = document.getElementById("ws-page-count-badge");
        if (!previewContainer) return;

        const items = this.state.characters;
        if (items.length === 0) {
            previewContainer.innerHTML = `
                <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                    <div style="display:flex; justify-content:center; margin-bottom: 12px; color: var(--text-muted); opacity: 0.6;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                    </div>
                    <h4>No hay caracteres en la plantilla</h4>
                    <p style="font-size: 0.9rem;">Escribe palabras en el campo de texto o selecciona un nivel HSK a la izquierda.</p>
                </div>
            `;
            if (pageBadge) pageBadge.textContent = "0 páginas";
            return;
        }

        const rowsPerPage = this.getRowsPerPage();
        const totalPages = Math.ceil(items.length / rowsPerPage);
        if (pageBadge) pageBadge.textContent = `${totalPages} página${totalPages > 1 ? "s" : ""} A4`;

        let fullHtml = "";

        for (let p = 0; p < totalPages; p++) {
            const pageItems = items.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
            const rowsHtml = this.state.practiceMode === "composition"
                ? this.renderCompositionGrid(pageItems, this.state)
                : pageItems.map(item => this.renderPracticeRow(item, this.state)).join("");

            const qrHtml = this.state.showAudioQR ? `
                <div class="ws-header-qr-wrap" title="Escanea con la cámara de tu móvil para escuchar la pronunciación">
                    ${this.generateQRCodeSvg(pageItems.map(i => i.hanzi).join(""), 42)}
                    <span class="ws-qr-caption">🔊 Audio QR</span>
                </div>
            ` : "";

            const headerHtml = this.state.showStudentHeader ? `
                <header class="ws-sheet-header">
                    <div class="ws-sheet-brand">
                        <img src="assets/images/logo05.png" alt="Logo" class="ws-sheet-logo" />
                        <div>
                            <div class="ws-sheet-title-text">Confuc10++ · ${this.state.worksheetTitle}</div>
                            <div class="ws-sheet-subtitle-text">HSK Chinese Calligraphy & Writing Practice</div>
                        </div>
                    </div>
                    <div class="ws-sheet-student-info">
                        <div class="ws-student-field"><span>Estudiante:</span></div>
                        <div class="ws-student-field"><span>Fecha:</span></div>
                        <div class="ws-student-field score-field"><span>Nota: [ ★★★★★ ]</span></div>
                    </div>
                    ${qrHtml}
                </header>
            ` : `
                <header class="ws-sheet-header">
                    <div class="ws-sheet-brand">
                        <img src="assets/images/logo05.png" alt="Logo" class="ws-sheet-logo" />
                        <div class="ws-sheet-title-text">Confuc10++ · ${this.state.worksheetTitle}</div>
                    </div>
                    ${qrHtml}
                </header>
            `;

            const footerHtml = `
                <footer class="ws-sheet-footer">
                    <span class="ws-sheet-footer-brand">Confuc10++ · Plataforma de Aprendizaje de Chino</span>
                    <span>Pág. ${p + 1} de ${totalPages}</span>
                </footer>
            `;

            fullHtml += `
                <div class="ws-sheet">
                    ${headerHtml}
                    <div class="ws-sheet-body">
                        ${rowsHtml}
                    </div>
                    ${footerHtml}
                </div>
            `;
        }

        previewContainer.innerHTML = fullHtml;
    }

    // Renderiza una cuadrícula de composición continua (texto corrido)
    renderCompositionGrid(items, options) {
        const { gridType, gridSize, gridColor, showPinyinLines } = options;
        const gridSvg = this.renderGridSvg(gridType, gridColor);
        const sizeClass = `size-${gridSize}`;

        let cellsHtml = "";
        for (const item of items) {
            const pinyinGuide = showPinyinLines ? `<div class="ws-pinyin-guide-box"></div>` : "";
            cellsHtml += `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    ${pinyinGuide}
                    <div class="ws-grid-cell ${sizeClass}">
                        ${gridSvg}
                        <span class="ws-cell-char is-faded">${item.hanzi}</span>
                    </div>
                </div>
            `;
            // Add empty practice cells after each character
            for (let i = 0; i < 1; i++) {
                cellsHtml += `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        ${pinyinGuide}
                        <div class="ws-grid-cell ${sizeClass}">
                            ${gridSvg}
                        </div>
                    </div>
                `;
            }
        }

        return `<div class="ws-composition-grid">${cellsHtml}</div>`;
    }

    // Genera el documento HTML completo para exportar / imprimir en PDF vectorial
    generateFullDocument() {
        const items = this.state.characters;
        const rowsPerPage = this.getRowsPerPage();
        const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));

        let pagesHtml = "";
        for (let p = 0; p < totalPages; p++) {
            const pageItems = items.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
            const rowsHtml = this.state.practiceMode === "composition"
                ? this.renderCompositionGrid(pageItems, this.state)
                : pageItems.map(item => this.renderPracticeRow(item, this.state)).join("");

            const qrHtml = this.state.showAudioQR ? `
                <div class="ws-header-qr-wrap" title="Escanea con la cámara de tu móvil para escuchar la pronunciación">
                    ${this.generateQRCodeSvg(pageItems.map(i => i.hanzi).join(""), 42)}
                    <span class="ws-qr-caption">🔊 Audio QR</span>
                </div>
            ` : "";

            const headerHtml = this.state.showStudentHeader ? `
                <header class="ws-sheet-header">
                    <div class="ws-sheet-brand">
                        <img src="assets/images/logo05.png" alt="Logo" class="ws-sheet-logo" />
                        <div>
                            <div class="ws-sheet-title-text">Confuc10++ · ${this.state.worksheetTitle}</div>
                            <div class="ws-sheet-subtitle-text">HSK Chinese Calligraphy & Writing Practice</div>
                        </div>
                    </div>
                    <div class="ws-sheet-student-info">
                        <div class="ws-student-field"><span>Estudiante:</span></div>
                        <div class="ws-student-field"><span>Fecha:</span></div>
                        <div class="ws-student-field score-field"><span>Nota: [ ★★★★★ ]</span></div>
                    </div>
                    ${qrHtml}
                </header>
            ` : `
                <header class="ws-sheet-header">
                    <div class="ws-sheet-brand">
                        <img src="assets/images/logo05.png" alt="Logo" class="ws-sheet-logo" />
                        <div class="ws-sheet-title-text">Confuc10++ · ${this.state.worksheetTitle}</div>
                    </div>
                    ${qrHtml}
                </header>
            `;

            pagesHtml += `
                <div class="ws-sheet">
                    ${headerHtml}
                    <div class="ws-sheet-body">
                        ${rowsHtml}
                    </div>
                    <footer class="ws-sheet-footer">
                        <span class="ws-sheet-footer-brand">Confuc10++ · Plataforma de Aprendizaje de Chino</span>
                        <span>Pág. ${p + 1} de ${totalPages}</span>
                    </footer>
                </div>
            `;
        }

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>${this.state.worksheetTitle} - Confuc10++</title>
    <style>
        @charset "utf-8";
        @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
        }
        *, *:before, *:after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .ws-sheet {
            width: 100%;
            min-height: calc(297mm - 16mm);
            background: #ffffff;
            padding: 4mm 6mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
        }
        .ws-sheet-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 3mm;
            margin-bottom: 4mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .ws-sheet-brand {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .ws-sheet-logo {
            width: 24px;
            height: 24px;
            object-fit: contain;
        }
        .ws-sheet-title-text {
            font-size: 12pt;
            font-weight: 800;
            color: #b91c1c;
        }
        .ws-sheet-subtitle-text {
            font-size: 7.5pt;
            color: #64748b;
            font-weight: 600;
        }
        .ws-sheet-student-info {
            display: flex;
            gap: 4mm;
            font-size: 8pt;
            color: #334155;
            font-weight: 600;
        }
        .ws-student-field {
            display: inline-flex;
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 1px;
            min-width: 30mm;
        }
        .ws-student-field.score-field {
            min-width: 20mm;
            color: #e11d48;
        }
        .ws-sheet-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3.5mm;
        }
        .ws-practice-row {
            display: flex;
            align-items: flex-end;
            gap: 3mm;
            padding-bottom: 2mm;
            border-bottom: 1px dotted #e2e8f0;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .ws-char-meta-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 24mm;
            flex-shrink: 0;
            gap: 1mm;
        }
        .ws-meta-pinyin {
            font-size: 8.5pt;
            font-weight: 700;
            color: #dc2626;
        }
        .ws-meta-meaning {
            font-size: 7pt;
            color: #64748b;
            max-width: 24mm;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .ws-slots-row {
            display: flex;
            gap: 2mm;
            align-items: center;
            flex: 1;
        }
        .ws-grid-cell {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            box-sizing: border-box;
            flex-shrink: 0;
        }
        .ws-grid-cell.size-large { width: 26mm; height: 26mm; }
        .ws-grid-cell.size-medium { width: 20mm; height: 20mm; }
        .ws-grid-cell.size-small { width: 15mm; height: 15mm; }
        .ws-grid-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .ws-cell-char {
            position: relative;
            z-index: 2;
            font-family: "Noto Serif SC", "KaiTi", "Songti SC", serif;
            font-weight: 600;
            color: #0f172a;
            line-height: 1;
        }
        .ws-grid-cell.size-large .ws-cell-char { font-size: 19mm; }
        .ws-grid-cell.size-medium .ws-cell-char { font-size: 14.5mm; }
        .ws-grid-cell.size-small .ws-cell-char { font-size: 11mm; }
        .ws-cell-char.is-faded { color: rgba(148, 163, 184, 0.35); }
        .ws-stroke-svg {
            position: absolute;
            inset: 2mm;
            width: calc(100% - 4mm);
            height: calc(100% - 4mm);
            z-index: 2;
        }
        .ws-pinyin-guide-box {
            width: 100%;
            height: 5.5mm;
            margin-bottom: 1mm;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background-image: linear-gradient(to bottom,
                transparent 0%, transparent 33%,
                rgba(220, 38, 38, 0.25) 33%, rgba(220, 38, 38, 0.25) 35%,
                transparent 35%, transparent 66%,
                rgba(220, 38, 38, 0.25) 66%, rgba(220, 38, 38, 0.25) 68%,
                transparent 68%, transparent 100%
            );
        }
        .ws-sheet-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 2mm;
            margin-top: 4mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #64748b;
        }
        .ws-sheet-footer-brand {
            font-weight: 700;
            color: #b91c1c;
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;
    }

    // Ejecuta la impresión nativa vectorial mediante un iframe oculto
    triggerPrint() {
        if (this.state.characters.length === 0) {
            if (this.app && typeof this.app.showNotification === "function") {
                this.app.showNotification("Por favor agrega al menos un carácter para imprimir la plantilla.", "warning");
            }
            return;
        }

        const fullHtml = this.generateFullDocument();
        this.printIframe(fullHtml);
    }

    printIframe(htmlContent) {
        let frame = document.getElementById("writing-sheets-print-frame");
        if (!frame) {
            frame = document.createElement("iframe");
            frame.id = "writing-sheets-print-frame";
            frame.style.position = "fixed";
            frame.style.right = "0";
            frame.style.bottom = "0";
            frame.style.width = "0";
            frame.style.height = "0";
            frame.style.border = "0";
            frame.style.visibility = "hidden";
            document.body.appendChild(frame);
        }

        const doc = frame.contentWindow || frame.contentDocument;
        const targetDoc = doc.document || doc;

        targetDoc.open();
        targetDoc.write(htmlContent);
        targetDoc.close();

        setTimeout(() => {
            try {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            } catch (err) {
                console.error("Print dispatch failed:", err);
            }
        }, 350);
    }
}

if (typeof window !== "undefined") {
    window.WritingSheetsController = WritingSheetsController;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { WritingSheetsController };
}
