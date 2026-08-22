/**
 * FlashcardPdfController
 * Minimalist and professional PDF generation and printing system for HSK flashcards,
 * calligraphy practice sheets, and etymology breakdown cards.
 */
class FlashcardPdfController {
    constructor(app) {
        this.app = app;
        this.currentConfig = null;
        this.modalElement = null;
    }

    t(key, replacements = {}) {
        if (this.app && typeof this.app.getTranslation === "function") {
            const translated = this.app.getTranslation(key, replacements);
            if (translated && translated !== key) return translated;
        }
        // Fallbacks
        const fallbacks = {
            pdfModalTitle: "Exportar Tarjetas a PDF / Imprimir",
            pdfModalSubtitle: "Genera fichas de estudio recortables o cuadernos de caligrafía listos para imprimir",
            pdfSourceLabel: "¿Qué palabras o caracteres deseas incluir?",
            pdfScopeCurrentLevel: "Nivel HSK actual (HSK {level} · {count} palabras)",
            pdfScopeSelectLevel: "Elegir nivel HSK específico",
            pdfScopeFiltered: "Resultados de búsqueda/filtro actual ({count} palabras)",
            pdfScopeSelected: "Palabras seleccionadas manualmente ({count} seleccionadas)",
            pdfScopeCurrentLesson: "Lección actual ({lesson} · {count} caracteres)",
            pdfScopeCurrentSection: "Sección completa ({section} · {count} caracteres)",
            pdfFormatLabel: "Formato de impresión",
            pdfFormatFlashcards: "Fichas de estudio recortables (Flashcards)",
            pdfFormatFlashcardsDesc: "Tarjetas con cuadrícula Tianzige, pinyin, significado y líneas de corte",
            pdfFormatPractice: "Cuaderno de caligrafía y escritura (Tianzige)",
            pdfFormatPracticeDesc: "Carácter modelo + casillas vacías para practicar trazos a mano",
            pdfFormatEtymology: "Fichas de etimología y descomposición",
            pdfFormatEtymologyDesc: "Origen etimológico, historia de la forma y desglose de componentes",
            pdfDensityLabel: "Tarjetas por página",
            pdfDensity6: "6 por página (Grandes · 3x2)",
            pdfDensity8: "8 por página (Compactas · 4x2)",
            pdfLangLabel: "Idioma de traducción",
            pdfPrintBtn: "Imprimir / Guardar como PDF",
            pdfPreviewBtn: "Actualizar Vista Previa",
            pdfCloseBtn: "Cerrar",
            pdfNoItemsWarning: "No hay palabras seleccionadas o disponibles para generar el PDF"
        };
        let text = fallbacks[key] || key;
        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                text = text.replace(new RegExp("\\{" + k + "\\}", "g"), v);
            });
        }
        return text;
    }

    openModal(config) {
        this.currentConfig = config;
        this.renderModal();
        this.updatePreview();
    }

    closeModal() {
        if (this.modalElement) {
            this.modalElement.classList.remove("is-open");
            setTimeout(() => {
                if (this.modalElement && this.modalElement.parentNode) {
                    this.modalElement.parentNode.removeChild(this.modalElement);
                    this.modalElement = null;
                }
            }, 250);
        }
    }

    getMeaning(item, lang) {
        if (lang === "es") {
            return item.spanish || item.translation || item.english || item.meaning || "";
        }
        return item.english || item.translation || item.spanish || item.meaning || "";
    }

    resolveItems(config, scope, customLevel) {
        const { source, vocabulary, filteredVocabulary, selectedItems, currentLevel, currentLesson, currentSection } = config;
        let items = [];

        if (source === "etymology") {
            if (scope === "selected" && selectedItems && selectedItems.size > 0) {
                const charMap = config.charIndex || new Map();
                items = Array.from(selectedItems).map(h => charMap.get(h) || { hanzi: h, pinyin: "", meaning: "" });
            } else if (scope === "lesson" && currentLesson) {
                items = currentLesson.chars || [];
            } else if (scope === "section" && currentSection) {
                items = [];
                (currentSection.lessons || []).forEach(l => {
                    if (l.chars) items.push(...l.chars);
                });
            } else {
                items = currentLesson ? (currentLesson.chars || []) : [];
            }
        } else {
            // Browse / HSK source
            const vocab = vocabulary || [];
            if (scope === "selected" && selectedItems && selectedItems.size > 0) {
                items = vocab.filter(w => selectedItems.has(w.character));
            } else if (scope === "filtered" && filteredVocabulary && filteredVocabulary.length > 0) {
                items = [...filteredVocabulary];
            } else if (scope === "custom-level" && customLevel) {
                items = vocab.filter(w => Number(w.level) === Number(customLevel));
            } else if (scope === "level" && currentLevel && currentLevel !== "all") {
                items = vocab.filter(w => Number(w.level) === Number(currentLevel));
            } else {
                // If all or default
                items = filteredVocabulary && filteredVocabulary.length > 0 ? [...filteredVocabulary] : vocab.filter(w => Number(w.level) === 1);
            }
        }

        return items;
    }

    renderModal() {
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }

        const config = this.currentConfig;
        const isEtymology = config.source === "etymology";
        const hasSelected = config.selectedItems && config.selectedItems.size > 0;
        const defaultScope = hasSelected ? "selected" : (isEtymology ? "lesson" : (config.currentLevel && config.currentLevel !== "all" ? "level" : "filtered"));

        const modal = document.createElement("div");
        modal.className = "pdf-modal-backdrop";
        modal.id = "pdf-export-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "pdf-modal-title");

        const filteredCount = (config.filteredVocabulary || []).length;
        const selectedCount = (config.selectedItems || new Set()).size;
        const currentLevelNum = config.currentLevel && config.currentLevel !== "all" ? config.currentLevel : 1;
        const levelCount = (config.vocabulary || []).filter(w => Number(w.level) === Number(currentLevelNum)).length || filteredCount;

        const lessonTitle = config.currentLesson ? (config.currentLesson.id + " " + (config.currentLesson.theme || "")) : "Lección actual";
        const lessonCount = config.currentLesson && config.currentLesson.chars ? config.currentLesson.chars.length : 0;

        const sectionTitle = config.currentSection ? config.currentSection.title : "Sección actual";
        let sectionCount = 0;
        if (config.currentSection && config.currentSection.lessons) {
            config.currentSection.lessons.forEach(l => { sectionCount += (l.chars || []).length; });
        }

        modal.innerHTML = `
            <div class="pdf-modal-dialog">
                <header class="pdf-modal-header">
                    <div class="pdf-modal-title-wrap">
                        <div class="pdf-modal-icon" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div>
                            <h2 id="pdf-modal-title" class="pdf-modal-title">${this.t("pdfModalTitle")}</h2>
                            <p class="pdf-modal-subtitle">${this.t("pdfModalSubtitle")}</p>
                        </div>
                    </div>
                    <button type="button" class="pdf-modal-close" id="pdf-modal-close-btn" aria-label="${this.t("pdfCloseBtn")}">✕</button>
                </header>

                <div class="pdf-modal-body">
                    <!-- Config column -->
                    <div class="pdf-modal-controls">
                        <!-- Source section -->
                        <div class="pdf-control-group">
                            <label class="pdf-control-label">${this.t("pdfSourceLabel")}</label>
                            <div class="pdf-radio-group">
                                ${!isEtymology ? `
                                    <label class="pdf-radio-card ${defaultScope === "level" ? "is-selected" : ""}">
                                        <input type="radio" name="pdf-scope" value="level" ${defaultScope === "level" ? "checked" : ""}>
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">${this.t("pdfScopeCurrentLevel", { level: currentLevelNum, count: levelCount })}</span>
                                        </div>
                                    </label>

                                    <label class="pdf-radio-card ${defaultScope === "custom-level" ? "is-selected" : ""}">
                                        <input type="radio" name="pdf-scope" value="custom-level" ${defaultScope === "custom-level" ? "checked" : ""}>
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">${this.t("pdfScopeSelectLevel")}</span>
                                            <select id="pdf-custom-level-select" class="pdf-select-compact">
                                                <option value="1">HSK 1 (150 palabras)</option>
                                                <option value="2">HSK 2 (150 palabras)</option>
                                                <option value="3">HSK 3 (300 palabras)</option>
                                                <option value="4">HSK 4 (600 palabras)</option>
                                                <option value="5">HSK 5 (1300 palabras)</option>
                                                <option value="6">HSK 6 (2500 palabras)</option>
                                            </select>
                                        </div>
                                    </label>

                                    <label class="pdf-radio-card ${defaultScope === "filtered" ? "is-selected" : ""}">
                                        <input type="radio" name="pdf-scope" value="filtered" ${defaultScope === "filtered" ? "checked" : ""}>
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">${this.t("pdfScopeFiltered", { count: filteredCount })}</span>
                                        </div>
                                    </label>
                                ` : `
                                    <label class="pdf-radio-card ${defaultScope === "lesson" ? "is-selected" : ""}">
                                        <input type="radio" name="pdf-scope" value="lesson" ${defaultScope === "lesson" ? "checked" : ""}>
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">${this.t("pdfScopeCurrentLesson", { lesson: lessonTitle, count: lessonCount })}</span>
                                        </div>
                                    </label>

                                    <label class="pdf-radio-card ${defaultScope === "section" ? "is-selected" : ""}">
                                        <input type="radio" name="pdf-scope" value="section" ${defaultScope === "section" ? "checked" : ""}>
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">${this.t("pdfScopeCurrentSection", { section: sectionTitle, count: sectionCount })}</span>
                                        </div>
                                    </label>
                                `}

                                <label class="pdf-radio-card ${defaultScope === "selected" ? "is-selected" : ""} ${!hasSelected ? "is-disabled" : ""}">
                                    <input type="radio" name="pdf-scope" value="selected" ${defaultScope === "selected" ? "checked" : ""} ${!hasSelected ? "disabled" : ""}>
                                    <div class="pdf-radio-content">
                                        <span class="pdf-radio-title">${this.t("pdfScopeSelected", { count: selectedCount })}</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Format section -->
                        <div class="pdf-control-group">
                            <label class="pdf-control-label">${this.t("pdfFormatLabel")}</label>
                            <div class="pdf-radio-group">
                                <label class="pdf-radio-card is-selected" id="pdf-format-card-flashcards">
                                    <input type="radio" name="pdf-format" value="flashcards" checked>
                                    <div class="pdf-radio-content">
                                        <span class="pdf-radio-title">🎴 ${this.t("pdfFormatFlashcards")}</span>
                                        <span class="pdf-radio-desc">${this.t("pdfFormatFlashcardsDesc")}</span>
                                    </div>
                                </label>

                                <label class="pdf-radio-card" id="pdf-format-card-practice">
                                    <input type="radio" name="pdf-format" value="practice">
                                    <div class="pdf-radio-content">
                                        <span class="pdf-radio-title">✍️ ${this.t("pdfFormatPractice")}</span>
                                        <span class="pdf-radio-desc">${this.t("pdfFormatPracticeDesc")}</span>
                                    </div>
                                </label>

                                ${isEtymology ? `
                                    <label class="pdf-radio-card" id="pdf-format-card-etymology">
                                        <input type="radio" name="pdf-format" value="etymology">
                                        <div class="pdf-radio-content">
                                            <span class="pdf-radio-title">📖 ${this.t("pdfFormatEtymology")}</span>
                                            <span class="pdf-radio-desc">${this.t("pdfFormatEtymologyDesc")}</span>
                                        </div>
                                    </label>
                                ` : ""}
                            </div>
                        </div>

                        <!-- Options row -->
                        <div class="pdf-options-row">
                            <div class="pdf-option-item">
                                <label for="pdf-density-select" class="pdf-control-label-sm">${this.t("pdfDensityLabel")}</label>
                                <select id="pdf-density-select" class="pdf-select-input">
                                    <option value="6" selected>${this.t("pdfDensity6")}</option>
                                    <option value="8">${this.t("pdfDensity8")}</option>
                                </select>
                            </div>

                            <div class="pdf-option-item">
                                <label for="pdf-lang-select" class="pdf-control-label-sm">${this.t("pdfLangLabel")}</label>
                                <select id="pdf-lang-select" class="pdf-select-input">
                                    <option value="es" ${this.app.currentLanguage === "es" ? "selected" : ""}>Español</option>
                                    <option value="en" ${this.app.currentLanguage !== "es" ? "selected" : ""}>English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Preview column -->
                    <div class="pdf-modal-preview-col">
                        <div class="pdf-preview-header">
                            <span class="pdf-preview-title">👁️ Vista Previa (Hoja A4)</span>
                            <span class="pdf-preview-badge" id="pdf-preview-item-count">0 items</span>
                        </div>
                        <div class="pdf-preview-viewport" id="pdf-preview-container">
                            <div class="pdf-preview-sheet" id="pdf-preview-sheet">
                                <!-- Preview rendered here -->
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="pdf-modal-footer">
                    <button type="button" class="btn btn-outline" id="pdf-cancel-btn">${this.t("pdfCloseBtn")}</button>
                    <button type="button" class="btn btn-primary" id="pdf-print-action-btn" style="display:inline-flex; align-items:center; gap:8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        <span>${this.t("pdfPrintBtn")}</span>
                    </button>
                </footer>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;

        // Animate entrance
        requestAnimationFrame(() => {
            modal.classList.add("is-open");
        });

        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = this.modalElement;
        if (!modal) return;

        // Close handlers
        const closeBtn = modal.querySelector("#pdf-modal-close-btn");
        const cancelBtn = modal.querySelector("#pdf-cancel-btn");
        if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener("click", () => this.closeModal());
        modal.addEventListener("click", (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Radio cards active state styling
        const radioCards = modal.querySelectorAll(".pdf-radio-card");
        radioCards.forEach(card => {
            const input = card.querySelector("input[type=radio]");
            if (!input) return;
            input.addEventListener("change", () => {
                const groupName = input.name;
                modal.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
                    const parent = r.closest(".pdf-radio-card");
                    if (parent) parent.classList.toggle("is-selected", r.checked);
                });
                this.updatePreview();
            });
        });

        // Select changes
        const customLevelSelect = modal.querySelector("#pdf-custom-level-select");
        if (customLevelSelect) {
            customLevelSelect.addEventListener("change", () => {
                const radio = modal.querySelector("input[name=pdf-scope][value=custom-level]");
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event("change"));
                }
            });
        }

        const densitySelect = modal.querySelector("#pdf-density-select");
        if (densitySelect) {
            densitySelect.addEventListener("change", () => this.updatePreview());
        }

        const langSelect = modal.querySelector("#pdf-lang-select");
        if (langSelect) {
            langSelect.addEventListener("change", () => this.updatePreview());
        }

        // Print button
        const printBtn = modal.querySelector("#pdf-print-action-btn");
        if (printBtn) {
            printBtn.addEventListener("click", () => this.executePrint());
        }
    }

    getSelectedOptions() {
        const modal = this.modalElement;
        if (!modal) {
            return {
                scope: "filtered",
                format: "flashcards",
                density: 6,
                lang: this.app.currentLanguage || "es",
                customLevel: 1
            };
        }

        const scopeInput = modal.querySelector("input[name=pdf-scope]:checked");
        const formatInput = modal.querySelector("input[name=pdf-format]:checked");
        const densitySelect = modal.querySelector("#pdf-density-select");
        const langSelect = modal.querySelector("#pdf-lang-select");
        const customLevelSelect = modal.querySelector("#pdf-custom-level-select");

        return {
            scope: scopeInput ? scopeInput.value : "filtered",
            format: formatInput ? formatInput.value : "flashcards",
            density: densitySelect ? parseInt(densitySelect.value, 10) : 6,
            lang: langSelect ? langSelect.value : (this.app.currentLanguage || "es"),
            customLevel: customLevelSelect ? parseInt(customLevelSelect.value, 10) : 1
        };
    }

    updatePreview() {
        const modal = this.modalElement;
        if (!modal) return;

        const container = modal.querySelector("#pdf-preview-sheet");
        const countBadge = modal.querySelector("#pdf-preview-item-count");
        if (!container) return;

        const options = this.getSelectedOptions();
        const items = this.resolveItems(this.currentConfig, options.scope, options.customLevel);

        if (countBadge) {
            countBadge.textContent = items.length + " " + (items.length === 1 ? "palabra" : "palabras");
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="pdf-preview-empty">
                    <p>${this.t("pdfNoItemsWarning")}</p>
                </div>`;
            return;
        }

        // Generate only first page for the modal preview (first 6 or 8 items)
        const previewItems = items.slice(0, options.density);
        const previewHtml = this.renderPageContent(previewItems, {
            ...options,
            pageIndex: 1,
            totalPages: Math.ceil(items.length / options.density),
            totalItems: items.length,
            title: this.getPageTitle(this.currentConfig, options)
        });

        container.innerHTML = previewHtml;
    }

    getPageTitle(config, options) {
        if (config.source === "etymology") {
            if (options.scope === "lesson" && config.currentLesson) {
                return `Etimología China · ${config.currentLesson.id} ${config.currentLesson.theme || ""}`;
            }
            if (options.scope === "section" && config.currentSection) {
                return `Etimología China · ${config.currentSection.title || ""}`;
            }
            return "Etimología China · Caracteres Seleccionados";
        }
        // Browse
        if (options.scope === "level" || options.scope === "custom-level") {
            const lvl = options.scope === "custom-level" ? options.customLevel : (config.currentLevel || 1);
            return `HSK ++ · Vocabulario HSK Nivel ${lvl}`;
        }
        return "HSK ++ · Flashcards de Estudio";
    }

    executePrint() {
        const options = this.getSelectedOptions();
        const items = this.resolveItems(this.currentConfig, options.scope, options.customLevel);

        if (items.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification(this.t("pdfNoItemsWarning"), "warning");
            } else {
                alert(this.t("pdfNoItemsWarning"));
            }
            return;
        }

        const title = this.getPageTitle(this.currentConfig, options);
        const fullHtml = this.generateFullDocument(items, { ...options, title });

        this.printIframe(fullHtml);
    }

    printIframe(htmlContent) {
        // Clean up previous print iframe if any
        const existingIframe = document.getElementById("flashcard-print-frame");
        if (existingIframe) {
            existingIframe.parentNode.removeChild(existingIframe);
        }

        const iframe = document.createElement("iframe");
        iframe.id = "flashcard-print-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Allow fonts and styles to render before triggering print
        setTimeout(() => {
            iframe.contentWindow.focus();
            try {
                iframe.contentWindow.print();
            } catch (err) {
                console.error("Print error:", err);
            }
            // Remove after print dialog closes
            setTimeout(() => {
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }, 3000);
        }, 350);
    }

    generateFullDocument(items, options) {
        const density = options.format === "practice" ? 6 : options.density;
        const totalPages = Math.ceil(items.length / density);
        let pagesHtml = "";

        for (let p = 0; p < totalPages; p++) {
            const pageItems = items.slice(p * density, (p + 1) * density);
            const pageContent = this.renderPageContent(pageItems, {
                ...options,
                pageIndex: p + 1,
                totalPages,
                totalItems: items.length
            });
            pagesHtml += `<div class="print-page">${pageContent}</div>`;
        }

        return `<!DOCTYPE html>
<html lang="${options.lang}">
<head>
    <meta charset="utf-8">
    <title>${options.title}</title>
    <style>
        ${this.getPrintStyles(options)}
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>`;
    }

    renderPageContent(items, options) {
        const { format, pageIndex, totalPages, title, density, lang } = options;

        const headerHtml = `
            <header class="print-page-header">
                <div class="print-header-brand">
                    <span class="print-header-logo">Confuc10++</span>
                    <span class="print-header-sep">/</span>
                    <span class="print-header-title">${title}</span>
                </div>
                <div class="print-header-meta">
                    <span>Pág. ${pageIndex} de ${totalPages}</span>
                </div>
            </header>
        `;

        let bodyHtml = "";

        if (format === "practice") {
            bodyHtml = `
                <div class="practice-page-info">
                    <span class="practice-field">Estudiante: _______________________________</span>
                    <span class="practice-field">Fecha: ____ / ____ / 2026</span>
                </div>
                <div class="practice-rows-container">
                    ${items.map(item => this.renderPracticeRow(item, lang)).join("")}
                </div>
            `;
        } else if (format === "etymology") {
            bodyHtml = `
                <div class="etymology-cards-grid density-${density}">
                    ${items.map(item => this.renderEtymologyPrintCard(item, lang)).join("")}
                </div>
            `;
        } else {
            // Flashcards format
            bodyHtml = `
                <div class="flashcards-grid density-${density}">
                    ${items.map(item => this.renderFlashcardCutout(item, lang)).join("")}
                </div>
            `;
        }

        const footerHtml = `
            <footer class="print-page-footer">
                <span>Confuc10++ · Chinese Learning Platform</span>
                <span>${options.totalItems} tarjetas en total</span>
            </footer>
        `;

        return headerHtml + bodyHtml + footerHtml;
    }

    renderFlashcardCutout(word, lang) {
        const meaning = this.getMeaning(word, lang);
        const chars = Array.from(word.character || word.hanzi || "");
        const tones = (this.app && this.app.getTonesFromPinyin && this.app.getTonesFromPinyin(word.pinyin || "")) || [];
        const levelBadge = word.level ? `HSK ${word.level}` : (word.lessonId || "HSK");

        let tianzigeHtml = "";
        if (chars.length > 1) {
            tianzigeHtml = `<div class="tianzige-container multi">` +
                chars.map((c, i) => {
                    const tone = tones[i] !== undefined ? tones[i] : 0;
                    return `<div class="tianzige-box tone-${tone}">${c}</div>`;
                }).join("") + `</div>`;
        } else {
            const tone = tones[0] !== undefined ? tones[0] : 0;
            tianzigeHtml = `<div class="tianzige-container single"><div class="tianzige-box tone-${tone}">${word.character || word.hanzi || ""}</div></div>`;
        }

        const etymologySnippet = word.etymology ? `<div class="print-card-etym-snippet">${word.etymology.length > 95 ? word.etymology.slice(0, 92) + "…" : word.etymology}</div>` : "";

        return `
            <div class="flashcard-cutout">
                <div class="cut-guide-corner top-left"></div>
                <div class="cut-guide-corner top-right"></div>
                <div class="cut-guide-corner bottom-left"></div>
                <div class="cut-guide-corner bottom-right"></div>

                <div class="print-card-header">
                    <span class="print-card-badge">${levelBadge}</span>
                    <span class="print-card-order">${word.pinyin || ""}</span>
                </div>

                ${tianzigeHtml}

                <div class="print-card-pinyin">${word.pinyin || ""}</div>
                <div class="print-card-meaning">${meaning}</div>
                ${etymologySnippet}
            </div>
        `;
    }

    renderPracticeRow(item, lang) {
        const char = item.character || item.hanzi || "";
        const meaning = this.getMeaning(item, lang);
        const pinyin = item.pinyin || "";

        return `
            <div class="practice-row">
                <div class="practice-model-col">
                    <div class="tianzige-box model">${char}</div>
                    <div class="practice-model-meta">
                        <span class="practice-pinyin">${pinyin}</span>
                        <span class="practice-meaning">${meaning.length > 25 ? meaning.slice(0, 24) + "…" : meaning}</span>
                    </div>
                </div>
                <div class="practice-grid-slots">
                    <div class="tianzige-box empty"></div>
                    <div class="tianzige-box empty"></div>
                    <div class="tianzige-box empty"></div>
                    <div class="tianzige-box empty"></div>
                    <div class="tianzige-box empty"></div>
                    <div class="tianzige-box empty"></div>
                </div>
            </div>
        `;
    }

    renderEtymologyPrintCard(item, lang) {
        const meaning = this.getMeaning(item, lang);
        const hanzi = item.hanzi || item.character || "";
        const pinyin = item.pinyin || "";
        const components = item.components || [];

        const componentsHtml = components.length > 0
            ? `<div class="print-etym-components">
                <span class="print-etym-label">Partes:</span>
                ${components.map(c => `<span class="print-comp-chip"><b>${c.char}</b> ${c.gloss || ""}</span>`).join(" ")}
              </div>`
            : "";

        return `
            <div class="etymology-print-card">
                <div class="etym-card-left">
                    <div class="tianzige-box etym-large">${hanzi}</div>
                    <div class="print-card-pinyin">${pinyin}</div>
                    <div class="print-card-meaning">${meaning}</div>
                </div>
                <div class="etym-card-right">
                    <div class="print-etym-story">
                        <span class="print-etym-label">Origen & Etimología:</span>
                        <p>${item.etymology || "Carácter pictográfico tradicional."}</p>
                    </div>
                    ${componentsHtml}
                </div>
            </div>
        `;
    }

    getPrintStyles(_options) {
        return `
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
                font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #0f172a;
                background: #ffffff;
                font-size: 10pt;
            }
            .print-page {
                page-break-after: always;
                break-after: page;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 275mm;
                max-height: 275mm;
                padding: 2mm 0;
                overflow: hidden;
            }
            .print-page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 2mm;
                margin-bottom: 3mm;
                font-size: 8pt;
                color: #64748b;
            }
            .print-header-brand {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .print-header-logo {
                font-weight: 700;
                color: #dc2626;
            }
            .print-header-sep {
                color: #cbd5e1;
            }
            .print-header-title {
                font-weight: 600;
                color: #334155;
            }
            .print-page-footer {
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #e2e8f0;
                padding-top: 2mm;
                font-size: 7.5pt;
                color: #94a3b8;
            }

            /* Tianzige Boxes */
            .tianzige-container {
                display: flex;
                justify-content: center;
                gap: 2.5mm;
                margin: 2mm 0;
            }
            .tianzige-box {
                width: 21mm;
                height: 21mm;
                background-color: #fffdfa;
                border: 1.2pt solid rgba(220, 38, 38, 0.45);
                border-radius: 2px;
                background-image:
                    linear-gradient(to bottom, transparent calc(50% - 0.4pt), rgba(220, 38, 38, 0.2) calc(50% - 0.4pt), rgba(220, 38, 38, 0.2) calc(50% + 0.4pt), transparent calc(50% + 0.4pt)),
                    linear-gradient(to right, transparent calc(50% - 0.4pt), rgba(220, 38, 38, 0.2) calc(50% - 0.4pt), rgba(220, 38, 38, 0.2) calc(50% + 0.4pt), transparent calc(50% + 0.4pt));
                background-size: 100% 100%;
                font-family: "Noto Serif SC", "Songti SC", "KaiTi", "SimSun", serif;
                font-size: 28pt;
                font-weight: 600;
                color: #0f172a;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            .tianzige-box.etym-large {
                width: 25mm;
                height: 25mm;
                font-size: 34pt;
            }
            .tianzige-box.empty {
                border-color: #cbd5e1;
                background-image:
                    linear-gradient(to bottom, transparent calc(50% - 0.4pt), rgba(203, 213, 225, 0.5) calc(50% - 0.4pt), rgba(203, 213, 225, 0.5) calc(50% + 0.4pt), transparent calc(50% + 0.4pt)),
                    linear-gradient(to right, transparent calc(50% - 0.4pt), rgba(203, 213, 225, 0.5) calc(50% - 0.4pt), rgba(203, 213, 225, 0.5) calc(50% + 0.4pt), transparent calc(50% + 0.4pt));
            }

            /* Flashcards Grid */
            .flashcards-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 4mm;
                flex: 1;
            }
            .flashcards-grid.density-6 {
                grid-template-rows: repeat(3, 1fr);
                gap: 5mm;
            }
            .flashcards-grid.density-8 {
                grid-template-rows: repeat(4, 1fr);
                gap: 3.5mm;
            }
            .flashcard-cutout {
                border: 1px dashed #cbd5e1;
                border-radius: 4px;
                padding: 3mm 4mm;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                text-align: center;
                background: #ffffff;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .cut-guide-corner {
                position: absolute;
                width: 4px;
                height: 4px;
                border-color: #94a3b8;
                border-style: solid;
            }
            .cut-guide-corner.top-left { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
            .cut-guide-corner.top-right { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
            .cut-guide-corner.bottom-left { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
            .cut-guide-corner.bottom-right { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

            .print-card-header {
                display: flex;
                justify-content: space-between;
                width: 100%;
                font-size: 7.5pt;
                color: #64748b;
            }
            .print-card-badge {
                font-weight: 700;
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                padding: 1px 5px;
                border-radius: 3px;
                color: #475569;
            }
            .print-card-pinyin {
                font-size: 10.5pt;
                font-weight: 600;
                color: #dc2626;
                margin-top: 1mm;
            }
            .print-card-meaning {
                font-size: 8.5pt;
                color: #334155;
                font-weight: 500;
                line-height: 1.25;
                margin-top: 0.5mm;
            }
            .print-card-etym-snippet {
                font-size: 7pt;
                color: #64748b;
                line-height: 1.2;
                margin-top: 1.5mm;
                border-top: 1px dotted #e2e8f0;
                padding-top: 1mm;
                text-align: left;
                width: 100%;
            }

            /* Practice Worksheet */
            .practice-page-info {
                display: flex;
                justify-content: space-between;
                font-size: 8.5pt;
                color: #475569;
                margin-bottom: 4mm;
                padding-bottom: 2mm;
                border-bottom: 1px solid #e2e8f0;
            }
            .practice-rows-container {
                display: flex;
                flex-direction: column;
                gap: 4.5mm;
                flex: 1;
            }
            .practice-row {
                display: flex;
                align-items: center;
                gap: 4mm;
                page-break-inside: avoid;
                break-inside: avoid;
                padding-bottom: 2.5mm;
                border-bottom: 1px dotted #e2e8f0;
            }
            .practice-model-col {
                display: flex;
                align-items: center;
                gap: 3mm;
                width: 48mm;
            }
            .practice-model-meta {
                display: flex;
                flex-direction: column;
                gap: 1px;
            }
            .practice-pinyin {
                font-size: 9.5pt;
                font-weight: 700;
                color: #dc2626;
            }
            .practice-meaning {
                font-size: 8pt;
                color: #475569;
            }
            .practice-grid-slots {
                display: flex;
                gap: 2.5mm;
                flex: 1;
            }

            /* Etymology Print Cards */
            .etymology-cards-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 4.5mm;
                flex: 1;
            }
            .etymology-print-card {
                border: 1px dashed #cbd5e1;
                border-radius: 4px;
                padding: 3mm 4mm;
                display: flex;
                gap: 4mm;
                background: #ffffff;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .etym-card-left {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                width: 28mm;
            }
            .etym-card-right {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-size: 8pt;
                color: #334155;
            }
            .print-etym-label {
                font-size: 7pt;
                font-weight: 700;
                text-transform: uppercase;
                color: #64748b;
                display: block;
                margin-bottom: 1px;
            }
            .print-etym-story p {
                margin: 0;
                line-height: 1.35;
                font-size: 7.8pt;
            }
            .print-etym-components {
                margin-top: 2mm;
                border-top: 1px dotted #e2e8f0;
                padding-top: 1.5mm;
            }
            .print-comp-chip {
                display: inline-block;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 7.5pt;
                margin-right: 3px;
                margin-top: 2px;
            }
        `;
    }
}

window.FlashcardPdfController = FlashcardPdfController;
