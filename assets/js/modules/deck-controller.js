/**
 * deck-controller.js - UI Controller for managing custom decks, importing, and exporting to Anki/Pleco/CSV
 */
class DeckController {
    constructor(app) {
        this.app = app;
        this.modalEl = null;
        this.activeTab = "list"; // "list" | "create" | "import"
        this.initFlashcardStar();
    }

    initFlashcardStar() {
        const starBtn = document.getElementById("flashcard-fav-btn");
        if (starBtn) {
            starBtn.addEventListener("click", () => {
                if (!this.app.currentWord) return;
                const isFav = this.app.deckManager?.toggleFavorite(this.app.currentWord);
                this.updateStarUI(isFav);
                this.app.audioController?.playClickSound?.();
                try { navigator.vibrate?.(25); } catch { void 0; }
            });
        }
    }

    updateStarUI(isFav) {
        const starBtn = document.getElementById("flashcard-fav-btn");
        if (starBtn) {
            starBtn.classList.toggle("is-fav", Boolean(isFav));
            starBtn.title = isFav ? "Quitar de favoritos" : "Guardar en favoritos";
        }
    }

    syncCurrentWordStar() {
        if (!this.app.currentWord || !this.app.deckManager) return;
        const isFav = this.app.deckManager.isFavorite(this.app.currentWord.character);
        this.updateStarUI(isFav);
    }

    openModal() {
        this.closeModal();

        const modal = document.createElement("div");
        modal.className = "deck-modal-overlay";
        modal.id = "deck-manager-modal";

        const isEs = this.app.currentLanguage !== "en";

        modal.innerHTML = `
            <div class="deck-modal-dialog" role="dialog" aria-modal="true">
                <div class="deck-modal-header">
                    <h3 class="deck-modal-title">
                        <span>📦</span>
                        <span>${isEs ? "Gestor de Mazos & Exportación" : "Deck Manager & Export"}</span>
                    </h3>
                    <button class="deck-modal-close" type="button" aria-label="Cerrar">&times;</button>
                </div>
                <div class="deck-modal-tabs">
                    <button class="deck-tab-btn ${this.activeTab === "list" ? "active" : ""}" data-tab="list" type="button">
                        ${isEs ? "Mis Mazos" : "My Decks"}
                    </button>
                    <button class="deck-tab-btn ${this.activeTab === "create" ? "active" : ""}" data-tab="create" type="button">
                        ${isEs ? "Crear Mazo" : "Create Deck"}
                    </button>
                    <button class="deck-tab-btn ${this.activeTab === "import" ? "active" : ""}" data-tab="import" type="button">
                        ${isEs ? "Importar Lista / CSV" : "Import List / CSV"}
                    </button>
                </div>
                <div class="deck-modal-body" id="deck-modal-body-content"></div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        modal.querySelector(".deck-modal-close").addEventListener("click", () => this.closeModal());
        modal.addEventListener("click", (e) => {
            if (e.target === modal) this.closeModal();
        });

        modal.querySelectorAll(".deck-tab-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                modal.querySelectorAll(".deck-tab-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.activeTab = btn.dataset.tab;
                this.renderTabContent();
            });
        });

        this.renderTabContent();
    }

    closeModal() {
        if (this.modalEl) {
            this.modalEl.remove();
            this.modalEl = null;
        }
    }

    renderTabContent() {
        const content = document.getElementById("deck-modal-body-content");
        if (!content) return;
        content.innerHTML = "";

        const isEs = this.app.currentLanguage !== "en";

        if (this.activeTab === "list") {
            this.renderListTab(content, isEs);
        } else if (this.activeTab === "create") {
            this.renderCreateTab(content, isEs);
        } else if (this.activeTab === "import") {
            this.renderImportTab(content, isEs);
        }
    }

    renderListTab(container, isEs) {
        const decks = this.app.deckManager ? this.app.deckManager.getAllDecks() : [];

        if (decks.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center;">${isEs ? "No hay mazos personalizados creados aún." : "No custom decks created yet."}</p>`;
            return;
        }

        const list = document.createElement("div");
        list.className = "deck-list";

        decks.forEach((deck) => {
            const card = document.createElement("div");
            card.className = "deck-item-card";
            const wordCount = deck.words ? deck.words.length : 0;

            card.innerHTML = `
                <div class="deck-item-info">
                    <h4>${deck.name} <span class="deck-word-count">${wordCount} ${isEs ? "palabras" : "words"}</span></h4>
                    <p>${deck.description || (isEs ? "Sin descripción" : "No description")}</p>
                </div>
                <div class="deck-actions-group">
                    <button class="deck-btn-sm deck-btn-study" data-action="study" data-id="${deck.id}" type="button">
                        ▶ ${isEs ? "Estudiar" : "Study"}
                    </button>
                    <button class="deck-btn-sm" data-action="anki" data-id="${deck.id}" title="Exportar para Anki (.txt)" type="button">
                        📥 Anki
                    </button>
                    <button class="deck-btn-sm" data-action="pleco" data-id="${deck.id}" title="Exportar para Pleco (.txt)" type="button">
                        📑 Pleco
                    </button>
                    <button class="deck-btn-sm" data-action="csv" data-id="${deck.id}" title="Exportar CSV para Excel" type="button">
                        📊 CSV
                    </button>
                    ${deck.id !== "favorites" ? `<button class="deck-btn-sm" data-action="delete" data-id="${deck.id}" title="Eliminar mazo" style="color: #ef4444;" type="button">🗑️</button>` : ""}
                </div>
            `;

            // Action handlers
            card.querySelector('[data-action="study"]')?.addEventListener("click", () => {
                this.studyDeck(deck.id);
            });

            card.querySelector('[data-action="anki"]')?.addEventListener("click", () => {
                const data = this.app.deckManager?.exportToAnki(deck.id);
                if (data) this.app.deckManager?.downloadFile(data, `${deck.name.replace(/\s+/g, "_")}_anki.txt`);
            });

            card.querySelector('[data-action="pleco"]')?.addEventListener("click", () => {
                const data = this.app.deckManager?.exportToPleco(deck.id);
                if (data) this.app.deckManager?.downloadFile(data, `${deck.name.replace(/\s+/g, "_")}_pleco.txt`);
            });

            card.querySelector('[data-action="csv"]')?.addEventListener("click", () => {
                const data = this.app.deckManager?.exportToCSV(deck.id);
                if (data) this.app.deckManager?.downloadFile(data, `${deck.name.replace(/\s+/g, "_")}.csv`, "text/csv;charset=utf-8;");
            });

            card.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
                if (confirm(isEs ? `¿Eliminar el mazo "${deck.name}"?` : `Delete deck "${deck.name}"?`)) {
                    this.app.deckManager?.deleteDeck(deck.id);
                    this.renderTabContent();
                }
            });

            list.appendChild(card);
        });

        container.appendChild(list);
    }

    studyDeck(deckId) {
        const deck = this.app.deckManager?.getDeck(deckId);
        if (!deck || deck.words.length === 0) {
            alert(this.app.currentLanguage === "es" ? "Este mazo no tiene palabras todavía." : "This deck has no words yet.");
            return;
        }

        this.closeModal();

        // Switch to practice tab and load words into flashcard manager
        this.app.uiController?.switchTab?.("practice");
        if (this.app.flashcardManager) {
            this.app.flashcardManager.currentWords = [...deck.words];
            this.app.flashcardManager.currentIndex = 0;
            this.app.flashcardManager.showCard();
        }
    }

    renderCreateTab(container, isEs) {
        container.innerHTML = `
            <form class="deck-import-form" id="deck-create-form">
                <div class="deck-input-group">
                    <label for="new-deck-name">${isEs ? "Nombre del Mazo:" : "Deck Name:"}</label>
                    <input id="new-deck-name" placeholder="${isEs ? "Ej. Verbos HSK 2, Palabras de Viaje..." : "e.g. HSK 2 Verbs, Travel words..."}" required />
                </div>
                <div class="deck-input-group">
                    <label for="new-deck-desc">${isEs ? "Descripción (Opcional):" : "Description (Optional):"}</label>
                    <input id="new-deck-desc" placeholder="${isEs ? "Breve resumen de este mazo" : "Brief summary of this deck"}" />
                </div>
                <button class="btn btn-primary" type="submit" style="align-self: flex-start; margin-top: 8px;">
                    ➕ ${isEs ? "Crear Mazo" : "Create Deck"}
                </button>
            </form>
        `;

        document.getElementById("deck-create-form")?.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("new-deck-name").value;
            const desc = document.getElementById("new-deck-desc").value;
            if (this.app.deckManager?.createDeck(name, desc)) {
                this.activeTab = "list";
                const listBtn = this.modalEl?.querySelector('.deck-tab-btn[data-tab="list"]');
                listBtn?.click();
            }
        });
    }

    renderImportTab(container, isEs) {
        container.innerHTML = `
            <form class="deck-import-form" id="deck-import-form">
                <div class="deck-input-group">
                    <label for="import-deck-name">${isEs ? "Nombre para el Mazo Importado:" : "Imported Deck Name:"}</label>
                    <input id="import-deck-name" placeholder="${isEs ? "Mazo Importado" : "Imported Deck"}" required />
                </div>
                <div class="deck-input-group">
                    <label for="import-deck-text">${isEs ? "Pega aquí tu lista de caracteres o texto en chino:" : "Paste your character list or Chinese text here:"}</label>
                    <textarea id="import-deck-text" placeholder="你好, 谢谢, 再见, 苹果, 学习..."></textarea>
                </div>
                <div class="deck-input-group">
                    <label for="import-deck-file">${isEs ? "O selecciona un archivo CSV / TSV:" : "Or choose a CSV / TSV file:"}</label>
                    <input type="file" id="import-deck-file" accept=".csv,.txt,.tsv" />
                </div>
                <button class="btn btn-primary" type="submit" style="align-self: flex-start; margin-top: 8px;">
                    📥 ${isEs ? "Importar Mazo" : "Import Deck"}
                </button>
            </form>
        `;

        document.getElementById("deck-import-form")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("import-deck-name").value;
            const text = document.getElementById("import-deck-text").value;
            const fileInput = document.getElementById("import-deck-file");

            if (fileInput?.files?.length > 0) {
                const file = fileInput.files[0];
                const content = await file.text();
                this.app.deckManager?.importFromCSV(name, content);
            } else if (text.trim()) {
                this.app.deckManager?.importFromTextList(name, text);
            }

            this.activeTab = "list";
            const listBtn = this.modalEl?.querySelector('.deck-tab-btn[data-tab="list"]');
            listBtn?.click();
        });
    }
}

window.DeckController = DeckController;
