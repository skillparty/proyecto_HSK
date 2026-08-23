/**
 * SearchController - Handles Header Search and Global Command Palette (Cmd+K)
 */
class SearchController {
    constructor(app) {
        this.app = app;
        this.isPaletteOpen = false;
        this.paletteItems = [];
        this.selectedIndex = 0;
        this.navDefinitions = [
            { id: "home", title: "Inicio", titleEn: "Home", icon: "🏠", group: "nav" },
            { id: "practice", title: "Práctica Flashcards (SRS)", titleEn: "Practice Flashcards (SRS)", icon: "🃏", group: "nav" },
            { id: "browse", title: "Explorar Vocabulario", titleEn: "Browse Vocabulary", icon: "📖", group: "nav" },
            { id: "strokes-radicals", title: "Trazos & Radicales", titleEn: "Strokes & Radicals", icon: "✍️", group: "nav" },
            { id: "writing-sheets", title: "Plantillas de Escritura (PDF)", titleEn: "Writing Sheets (PDF)", icon: "📝", group: "nav" },
            { id: "quiz", title: "Quiz de Evaluación", titleEn: "Evaluation Quiz", icon: "⏱️", group: "nav" },
            { id: "past-exams", title: "Exámenes Oficiales HSK", titleEn: "Past HSK Exams", icon: "📋", group: "nav" },
            { id: "snake-quantifiers", title: "Juego: Viborita de Clasificadores", titleEn: "Game: Quantifier Snake", icon: "🐍", group: "nav" },
            { id: "matrix", title: "Juego: Matrix Vocabulario", titleEn: "Game: Matrix Vocabulary", icon: "⚡", group: "nav" },
            { id: "tones-invaders", title: "Juego: Invasores de Tonos", titleEn: "Game: Tones Invaders", icon: "👾", group: "nav" },
            { id: "hanzi-builder", title: "Juego: Constructor de Hanzi", titleEn: "Game: Hanzi Builder", icon: "🧱", group: "nav" },
            { id: "word-linker", title: "Juego: Conector de Palabras", titleEn: "Game: Word Linker", icon: "🔗", group: "nav" },
            { id: "sentence-builder", title: "Juego: Constructor de Oraciones", titleEn: "Game: Sentence Builder", icon: "🧩", group: "nav" },
            { id: "etymology", title: "Etimología de Caracteres", titleEn: "Character Etymology", icon: "📜", group: "nav" },
            { id: "culture-characters", title: "Cultura: Evolución de Caracteres", titleEn: "Culture: Character Evolution", icon: "🏮", group: "nav" },
            { id: "culture-medicine", title: "Cultura: Medicina Tradicional", titleEn: "Culture: Traditional Medicine", icon: "🌿", group: "nav" },
            { id: "culture-opera", title: "Cultura: Ópera de Pekín", titleEn: "Culture: Peking Opera", icon: "🎭", group: "nav" },
            { id: "culture-technology", title: "Cultura: Tecnología China", titleEn: "Culture: Chinese Technology", icon: "🚀", group: "nav" },
            { id: "culture-clothing", title: "Cultura: Vestimenta Étnica", titleEn: "Culture: Ethnic Clothing", icon: "👘", group: "nav" },
            { id: "culture-arts", title: "Cultura: Artes y Caligrafía", titleEn: "Culture: Arts and Calligraphy", icon: "🖌️", group: "nav" },
            { id: "videos", title: "Videos de Aprendizaje HSK", titleEn: "HSK Learning Videos", icon: "🎬", group: "nav" },
            { id: "stats", title: "Estadísticas y Progreso", titleEn: "Statistics and Progress", icon: "📊", group: "nav" },
            { id: "leaderboard", title: "Tabla de Clasificación (Ranking)", titleEn: "Leaderboard", icon: "🏆", group: "nav" },
        ];

        this.quickActions = [
            {
                id: "action-toggle-theme",
                title: "Alternar Modo Oscuro / Claro",
                titleEn: "Toggle Dark / Light Theme",
                icon: "🌓",
                execute: () => this.app.themeController?.toggleTheme?.(),
            },
            {
                id: "action-toggle-lang",
                title: "Cambiar Idioma (Español / English)",
                titleEn: "Toggle Language (Spanish / English)",
                icon: "🌐",
                execute: () => {
                    const nextLang = this.app.currentLanguage === "es" ? "en" : "es";
                    window.languageManager?.setLanguage?.(nextLang);
                    this.app.updateLanguageDisplay?.();
                },
            },
            {
                id: "action-toggle-audio",
                title: "Activar / Desactivar Sonido",
                titleEn: "Toggle Audio FX",
                icon: "🔊",
                execute: () => this.app.audioController?.toggleAudio?.(),
            },
            {
                id: "action-start-quiz",
                title: "Iniciar Nuevo Quiz de 10 Preguntas",
                titleEn: "Start New 10-Question Quiz",
                icon: "🎯",
                execute: () => {
                    this.app.switchTab("quiz");
                    setTimeout(() => {
                        this.app.quizEngine?.start?.();
                    }, 250);
                },
            },
            {
                id: "action-manage-decks",
                title: "Gestionar Mazos Personalizados & Exportar a Anki",
                titleEn: "Manage Custom Decks & Export to Anki",
                icon: "📦",
                execute: () => {
                    this.app.deckController?.openModal?.();
                },
            },
            {
                id: "action-open-reader",
                title: "Abrir Lector Graduado HSK con Diccionario Flotante",
                titleEn: "Open HSK Graded Reader with Popup Dictionary",
                icon: "📖",
                execute: () => {
                    this.app.switchTab("graded-reader");
                },
            },
            {
                id: "action-open-tutor",
                title: "Iniciar Tutor Conversacional y Simulación de Diálogos",
                titleEn: "Start Dialogue Tutor & Scenario Simulator",
                icon: "💬",
                execute: () => {
                    this.app.switchTab("dialogue-tutor");
                },
            },
        ];
    }

    // --- Command Palette (Cmd+K / Ctrl+K) -----------------------------------

    toggleCommandPalette() {
        if (this.isPaletteOpen) {
            this.closeCommandPalette();
        } else {
            this.openCommandPalette();
        }
    }

    openCommandPalette() {
        this.isPaletteOpen = true;
        this.ensurePaletteDOMElements();

        const backdrop = document.getElementById("cmd-palette-backdrop");
        const input = document.getElementById("cmd-palette-input");

        if (backdrop) {
            backdrop.classList.add("open");
            backdrop.setAttribute("aria-hidden", "false");
        }

        if (input) {
            input.value = "";
            input.focus();
        }

        this.performPaletteSearch("");
    }

    closeCommandPalette() {
        this.isPaletteOpen = false;
        const backdrop = document.getElementById("cmd-palette-backdrop");
        if (backdrop) {
            backdrop.classList.remove("open");
            backdrop.setAttribute("aria-hidden", "true");
        }
    }

    ensurePaletteDOMElements() {
        if (document.getElementById("cmd-palette-backdrop")) return;

        const isEs = this.app.currentLanguage !== "en";

        const backdrop = document.createElement("div");
        backdrop.id = "cmd-palette-backdrop";
        backdrop.className = "cmd-palette-backdrop";
        backdrop.setAttribute("role", "dialog");
        backdrop.setAttribute("aria-modal", "true");
        backdrop.setAttribute("aria-hidden", "true");

        backdrop.innerHTML = `
            <div class="cmd-palette-modal" id="cmd-palette-modal">
                <div class="cmd-palette-header">
                    <svg class="cmd-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="cmd-palette-input" class="cmd-input" placeholder="${isEs ? "Buscar vocabulario, navegar o ejecutar acción..." : "Search vocabulary, navigate or run action..."}" autocomplete="off" spellcheck="false" />
                    <kbd class="cmd-esc-badge" id="cmd-esc-btn">ESC</kbd>
                </div>
                <div class="cmd-palette-results" id="cmd-palette-results" role="listbox"></div>
                <div class="cmd-palette-footer">
                    <div class="cmd-hints">
                        <span class="cmd-hint"><kbd>↑</kbd><kbd>↓</kbd> ${isEs ? "navegar" : "navigate"}</span>
                        <span class="cmd-hint"><kbd>↵</kbd> ${isEs ? "seleccionar" : "select"}</span>
                        <span class="cmd-hint"><kbd>esc</kbd> ${isEs ? "cerrar" : "close"}</span>
                    </div>
                    <span class="cmd-brand-tag">Confuc10++</span>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) this.closeCommandPalette();
        });

        const escBtn = document.getElementById("cmd-esc-btn");
        if (escBtn) escBtn.addEventListener("click", () => this.closeCommandPalette());

        const input = document.getElementById("cmd-palette-input");
        if (input) {
            input.addEventListener("input", (e) => this.performPaletteSearch(e.target.value));
            input.addEventListener("keydown", (e) => this.handlePaletteKeyDown(e));
        }
    }

    performPaletteSearch(query) {
        const trimmed = (query || "").trim().toLowerCase();
        const isEs = this.app.currentLanguage !== "en";

        const items = [];

        // 1. Actions matching query
        const matchedActions = this.quickActions.filter((a) => {
            if (!trimmed) return true;
            const title = isEs ? a.title : a.titleEn;
            return title.toLowerCase().includes(trimmed);
        }).map((a) => ({
            type: "action",
            id: a.id,
            title: isEs ? a.title : a.titleEn,
            subtitle: isEs ? "Acción Rápida" : "Quick Action",
            icon: a.icon,
            execute: a.execute,
        }));

        // 2. Navigation matching query
        const matchedNav = this.navDefinitions.filter((n) => {
            if (!trimmed) return true;
            const title = isEs ? n.title : n.titleEn;
            return title.toLowerCase().includes(trimmed) || n.id.toLowerCase().includes(trimmed);
        }).map((n) => ({
            type: "nav",
            id: n.id,
            title: isEs ? n.title : n.titleEn,
            subtitle: isEs ? "Ir a la pestaña" : "Go to tab",
            icon: n.icon,
            execute: () => this.app.switchTab(n.id),
        }));

        // 3. Vocabulary matching query (if query has at least 1 character)
        const matchedVocab = [];
        if (trimmed && this.app.vocabulary && Array.isArray(this.app.vocabulary)) {
            const vocabResults = this.app.vocabulary.filter((w) => {
                const charMatch = w.character && w.character.includes(trimmed);
                const pinyinMatch = w.pinyin && w.pinyin.toLowerCase().includes(trimmed);
                const esMatch = w.spanish && w.spanish.toLowerCase().includes(trimmed);
                const enMatch = w.english && w.english.toLowerCase().includes(trimmed);
                const transMatch = w.translation && w.translation.toLowerCase().includes(trimmed);
                return charMatch || pinyinMatch || esMatch || enMatch || transMatch;
            }).slice(0, 8);

            vocabResults.forEach((w) => {
                const meaning = isEs ? (w.spanish || w.translation || w.english) : (w.english || w.translation || w.spanish);
                matchedVocab.push({
                    type: "vocab",
                    id: `vocab-${w.character}`,
                    word: w,
                    title: `${w.character} (${w.pinyin})`,
                    subtitle: meaning,
                    icon: "🔤",
                    level: w.level || 1,
                    execute: () => this.selectHeaderSearchResult(w),
                });
            });
        }

        if (matchedVocab.length > 0) items.push(...matchedVocab);
        if (matchedNav.length > 0) items.push(...matchedNav);
        if (matchedActions.length > 0) items.push(...matchedActions);

        this.paletteItems = items;
        this.selectedIndex = 0;
        this.renderPaletteResults();
    }

    renderPaletteResults() {
        const resultsEl = document.getElementById("cmd-palette-results");
        if (!resultsEl) return;

        resultsEl.innerHTML = "";

        if (this.paletteItems.length === 0) {
            const empty = document.createElement("div");
            empty.className = "cmd-empty-state";
            empty.textContent = this.app.currentLanguage === "es"
                ? "No se encontraron resultados para tu búsqueda."
                : "No matching results found.";
            resultsEl.appendChild(empty);
            return;
        }

        this.paletteItems.forEach((item, index) => {
            const itemEl = document.createElement("div");
            itemEl.className = "cmd-item" + (index === this.selectedIndex ? " active" : "");
            itemEl.setAttribute("role", "option");
            itemEl.setAttribute("aria-selected", index === this.selectedIndex ? "true" : "false");

            let rightContent = "";
            if (item.type === "vocab") {
                rightContent = `
                    <div class="cmd-item-right">
                        <span class="cmd-level-pill">HSK ${item.level}</span>
                        <button class="cmd-audio-btn" title="Escuchar pronunciación" data-audio="${item.word.character}">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </button>
                    </div>
                `;
            }

            itemEl.innerHTML = `
                <div class="cmd-item-left">
                    <span class="cmd-item-icon">${item.icon}</span>
                    <div class="cmd-item-text">
                        <span class="cmd-item-title">${item.title}</span>
                        <span class="cmd-item-sub">${item.subtitle}</span>
                    </div>
                </div>
                ${rightContent}
            `;

            itemEl.addEventListener("mouseenter", () => {
                this.selectedIndex = index;
                this.highlightPaletteItem();
            });

            itemEl.addEventListener("click", (e) => {
                const audioBtn = e.target.closest(".cmd-audio-btn");
                if (audioBtn) {
                    e.stopPropagation();
                    const text = audioBtn.dataset.audio;
                    this.app.audioController?.playAudio?.(text);
                    return;
                }
                this.executePaletteItem(index);
            });

            resultsEl.appendChild(itemEl);
        });
    }

    highlightPaletteItem() {
        const resultsEl = document.getElementById("cmd-palette-results");
        if (!resultsEl) return;

        const items = resultsEl.querySelectorAll(".cmd-item");
        items.forEach((el, idx) => {
            el.classList.toggle("active", idx === this.selectedIndex);
            el.setAttribute("aria-selected", idx === this.selectedIndex ? "true" : "false");
            if (idx === this.selectedIndex) {
                if (typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({ block: "nearest" });
                }
            }
        });
    }

    handlePaletteKeyDown(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (this.paletteItems.length > 0) {
                this.selectedIndex = (this.selectedIndex + 1) % this.paletteItems.length;
                this.highlightPaletteItem();
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (this.paletteItems.length > 0) {
                this.selectedIndex = (this.selectedIndex - 1 + this.paletteItems.length) % this.paletteItems.length;
                this.highlightPaletteItem();
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (this.paletteItems[this.selectedIndex]) {
                this.executePaletteItem(this.selectedIndex);
            }
        } else if (event.key === "Escape") {
            event.preventDefault();
            this.closeCommandPalette();
        }
    }

    executePaletteItem(index) {
        const item = this.paletteItems[index];
        if (!item) return;

        this.closeCommandPalette();
        if (typeof item.execute === "function") {
            item.execute();
        }
    }

    // --- Header Quick Search (Dropdown fallback) ----------------------------

    performHeaderSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim() === "") {
            this.hideHeaderSearchDropdown();
            return;
        }

        clearTimeout(this.app.headerSearchTimeout);
        this.app.headerSearchTimeout = setTimeout(() => {
            this.showHeaderSearchResults(searchTerm);
        }, 200);
    }

    showHeaderSearchResults(searchTerm) {
        try {
            const normalizedTerm = searchTerm.toLowerCase();
            const results = (this.app.vocabulary || []).filter((word) =>
                (word.character && word.character.includes(searchTerm)) ||
                (word.pinyin && word.pinyin.toLowerCase().includes(normalizedTerm)) ||
                (word.english && word.english.toLowerCase().includes(normalizedTerm)) ||
                (word.spanish && word.spanish.toLowerCase().includes(normalizedTerm)) ||
                (word.translation && word.translation.toLowerCase().includes(normalizedTerm)),
            ).slice(0, 6);

            this.displayHeaderSearchDropdown(results);
        } catch (error) {
            this.app.logWarn("Error performing header search:", error);
        }
    }

    displayHeaderSearchDropdown(results) {
        this.hideHeaderSearchDropdown();
        if (!results || results.length === 0) return;

        const dropdown = document.createElement("div");
        dropdown.id = "header-search-dropdown";
        dropdown.style.cssText = [
            "position: absolute",
            "top: 100%",
            "left: 0",
            "right: 0",
            "background: var(--bg-panel, #1e1e24)",
            "border: 1px solid var(--color-border, #333)",
            "border-radius: 10px",
            "box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35)",
            "z-index: 1000",
            "max-height: 320px",
            "overflow-y: auto",
            "margin-top: 6px",
            "padding: 6px",
        ].join(";") + ";";

        results.forEach((word) => {
            const item = document.createElement("div");
            item.style.cssText = [
                "padding: 10px 14px",
                "cursor: pointer",
                "border-radius: 8px",
                "transition: background-color 0.15s ease",
                "display: flex",
                "justify-content: space-between",
                "align-items: center",
            ].join(";") + ";";

            const meaning = this.app.currentLanguage === "es"
                ? (word.spanish || word.translation || word.english || "")
                : (word.english || word.translation || word.spanish || "");

            item.innerHTML =
                "<div>" +
                    `<span style="font-size: 1.2rem; font-weight: 700; color: var(--primary, #e11d48);">${word.character}</span>` +
                    `<span style="margin-left: 8px; color: #f59e0b; font-size: 0.95rem;">${word.pinyin || ""}</span>` +
                "</div>" +
                `<div style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${meaning}</div>`;

            item.addEventListener("mouseenter", () => {
                item.style.backgroundColor = "var(--color-bg-input, rgba(225, 29, 72, 0.12))";
            });

            item.addEventListener("mouseleave", () => {
                item.style.backgroundColor = "";
            });

            item.addEventListener("click", () => {
                this.selectHeaderSearchResult(word);
                this.hideHeaderSearchDropdown();
            });

            dropdown.appendChild(item);
        });

        const headerSearch = document.getElementById("header-search");
        if (headerSearch && headerSearch.parentElement) {
            const parent = headerSearch.parentElement;
            parent.style.position = "relative";
            parent.appendChild(dropdown);

            setTimeout(() => {
                document.addEventListener("click", (event) => {
                    if (!parent.contains(event.target)) {
                        this.hideHeaderSearchDropdown();
                    }
                }, { once: true });
            }, 100);
        }
    }

    hideHeaderSearchDropdown() {
        const existingDropdown = document.getElementById("header-search-dropdown");
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    selectHeaderSearchResult(word) {
        this.app.switchTab("practice");
        this.app.currentWord = word;
        this.app.isFlipped = false;
        this.app.updateCard();

        const headerSearch = document.getElementById("header-search");
        if (headerSearch) {
            headerSearch.value = "";
        }

        this.app.logDebug("[SEARCH] Selected word: " + word.character);
    }
}

window.SearchController = SearchController;
