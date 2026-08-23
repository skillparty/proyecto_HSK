/**
 * deck-manager.js - Custom Decks, Bookmarking, and Anki/Pleco/CSV Export/Import Hub
 * Enables custom study collections, favorite lists, and interoperability with Anki and Pleco.
 */
class DeckManager {
    static get STORAGE_KEY() {
        return "hsk-custom-decks-v1";
    }

    static get FAVORITES_DECK_ID() {
        return "favorites";
    }

    constructor(app) {
        this.app = app;
        this.decks = this.loadDecks();
        this.ensureDefaultFavoritesDeck();
        this.hydrateFromIndexedDB();
    }

    ensureDefaultFavoritesDeck() {
        if (!this.decks[DeckManager.FAVORITES_DECK_ID]) {
            this.decks[DeckManager.FAVORITES_DECK_ID] = {
                id: DeckManager.FAVORITES_DECK_ID,
                name: "⭐ Palabras Favoritas / Difíciles",
                nameEn: "⭐ Favorite / Hard Words",
                description: "Palabras marcadas durante el estudio diario",
                createdAt: new Date().toISOString(),
                words: [],
            };
            this.saveDecks();
        }
    }

    loadDecks() {
        try {
            const raw = localStorage.getItem(DeckManager.STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    saveDecks() {
        try {
            localStorage.setItem(DeckManager.STORAGE_KEY, JSON.stringify(this.decks));
            window.idbStorage?.set?.(DeckManager.STORAGE_KEY, this.decks);
        } catch {
            void 0;
        }
    }

    async hydrateFromIndexedDB() {
        if (!window.idbStorage) return;
        try {
            const idbDecks = await window.idbStorage.get(DeckManager.STORAGE_KEY);
            if (idbDecks && typeof idbDecks === "object") {
                this.decks = { ...idbDecks, ...this.decks };
                this.saveDecks();
            }
        } catch {
            void 0;
        }
    }

    // --- Deck Operations ---

    createDeck(name, description = "") {
        if (!name || typeof name !== "string") return null;
        const trimmed = name.trim();
        if (!trimmed) return null;

        const id = `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newDeck = {
            id,
            name: trimmed,
            description: description.trim(),
            createdAt: new Date().toISOString(),
            words: [],
        };

        this.decks[id] = newDeck;
        this.saveDecks();
        return newDeck;
    }

    deleteDeck(deckId) {
        if (deckId === DeckManager.FAVORITES_DECK_ID) return false;
        if (this.decks[deckId]) {
            delete this.decks[deckId];
            this.saveDecks();
            return true;
        }
        return false;
    }

    getAllDecks() {
        return Object.values(this.decks);
    }

    getDeck(deckId) {
        return this.decks[deckId] || null;
    }

    // --- Word Management ---

    isWordInDeck(deckId, wordChar) {
        const deck = this.getDeck(deckId);
        if (!deck || !wordChar) return false;
        return deck.words.some((w) => (typeof w === "string" ? w === wordChar : w.character === wordChar));
    }

    isFavorite(wordChar) {
        return this.isWordInDeck(DeckManager.FAVORITES_DECK_ID, wordChar);
    }

    toggleFavorite(word) {
        if (!word) return false;
        const char = typeof word === "string" ? word : word.character;
        if (!char) return false;

        const isFav = this.isFavorite(char);
        if (isFav) {
            this.removeWordFromDeck(DeckManager.FAVORITES_DECK_ID, char);
            return false;
        } else {
            this.addWordToDeck(DeckManager.FAVORITES_DECK_ID, word);
            return true;
        }
    }

    addWordToDeck(deckId, word) {
        const deck = this.getDeck(deckId);
        if (!deck || !word) return false;

        const char = typeof word === "string" ? word : word.character;
        if (!char || this.isWordInDeck(deckId, char)) return false;

        const wordObj = typeof word === "object" ? {
            character: word.character,
            pinyin: word.pinyin || "",
            spanish: word.spanish || word.translation || "",
            english: word.english || "",
            level: word.level || 1,
        } : { character: char };

        deck.words.push(wordObj);
        this.saveDecks();
        return true;
    }

    removeWordFromDeck(deckId, wordChar) {
        const deck = this.getDeck(deckId);
        if (!deck || !wordChar) return false;

        const initLen = deck.words.length;
        deck.words = deck.words.filter((w) => (typeof w === "string" ? w !== wordChar : w.character !== wordChar));

        if (deck.words.length !== initLen) {
            this.saveDecks();
            return true;
        }
        return false;
    }

    // --- Export Engines ---

    /**
     * Anki TSV/TXT Format
     * Fields: Character, Pinyin, Spanish, English, Level, Tags
     */
    exportToAnki(deckId) {
        const deck = this.getDeck(deckId);
        if (!deck || deck.words.length === 0) return null;

        const lines = [
            "#separator:tab",
            "#html:false",
            "#tags column:6",
            "#deck:" + (deck.name || "HSK_Custom_Deck"),
            "Character\tPinyin\tSpanish\tEnglish\tLevel\tTags",
        ];

        deck.words.forEach((w) => {
            const char = w.character || "";
            const py = w.pinyin || "";
            const es = (w.spanish || "").replace(/\t/g, " ");
            const en = (w.english || "").replace(/\t/g, " ");
            const lvl = w.level || "HSK";
            const tag = `HSK_App ${deck.id}`;
            lines.push(`${char}\t${py}\t${es}\t${en}\t${lvl}\t${tag}`);
        });

        return lines.join("\n");
    }

    /**
     * Pleco Flashcards Format
     * Format: Hanzi [pinyin] Definition
     */
    exportToPleco(deckId) {
        const deck = this.getDeck(deckId);
        if (!deck || deck.words.length === 0) return null;

        const lines = ["// Pleco Flashcard Export from HSK Learning App", `// Category: ${deck.name}`];

        deck.words.forEach((w) => {
            const char = w.character || "";
            const py = w.pinyin ? `[${w.pinyin}]` : "";
            const def = w.spanish || w.english || "";
            lines.push(`${char}\t${py}\t${def}`.trim());
        });

        return lines.join("\n");
    }

    /**
     * CSV (UTF-8 with BOM for Excel compatibility)
     */
    exportToCSV(deckId) {
        const deck = this.getDeck(deckId);
        if (!deck || deck.words.length === 0) return null;

        const headers = ["Hanzi", "Pinyin", "Español", "English", "Nivel HSK"];
        const rows = [headers.join(",")];

        deck.words.forEach((w) => {
            const char = `"${(w.character || "").replace(/"/g, '""')}"`;
            const py = `"${(w.pinyin || "").replace(/"/g, '""')}"`;
            const es = `"${(w.spanish || "").replace(/"/g, '""')}"`;
            const en = `"${(w.english || "").replace(/"/g, '""')}"`;
            const lvl = `"${w.level || 1}"`;
            rows.push([char, py, es, en, lvl].join(","));
        });

        return "\uFEFF" + rows.join("\r\n");
    }

    /**
     * Full JSON Backup
     */
    exportToJSON(deckId) {
        const deck = this.getDeck(deckId);
        if (!deck) return null;
        return JSON.stringify(deck, null, 2);
    }

    downloadFile(content, filename, mimeType = "text/plain;charset=utf-8") {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);
    }

    // --- Import Engines ---

    /**
     * Imports from simple text list (comma, space or newline separated Hanzi)
     */
    importFromTextList(deckName, rawText) {
        if (!rawText || typeof rawText !== "string") return null;

        // Extract Chinese characters using Regex
        const hanziRegex = /[\u4e00-\u9fa5]+/g;
        const matches = rawText.match(hanziRegex);
        if (!matches || matches.length === 0) return null;

        const uniqueChars = Array.from(new Set(matches));
        const deck = this.createDeck(deckName || "Mazo Importado");

        uniqueChars.forEach((char) => {
            // Check if word exists in app vocabulary to enrich with pinyin & translation
            let foundWord = null;
            if (this.app?.vocabulary && Array.isArray(this.app.vocabulary)) {
                foundWord = this.app.vocabulary.find((v) => v.character === char);
            }

            if (foundWord) {
                this.addWordToDeck(deck.id, foundWord);
            } else {
                this.addWordToDeck(deck.id, { character: char, pinyin: "", spanish: "", english: "" });
            }
        });

        return deck;
    }

    /**
     * Imports from CSV content
     */
    importFromCSV(deckName, csvContent) {
        if (!csvContent || typeof csvContent !== "string") return null;

        const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) return null;

        const deck = this.createDeck(deckName || "CSV Importado");
        let startIdx = 0;

        // Skip header if present
        if (lines[0].toLowerCase().includes("hanzi") || lines[0].toLowerCase().includes("character")) {
            startIdx = 1;
        }

        for (let i = startIdx; i < lines.length; i++) {
            const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
            if (parts.length > 0 && parts[0]) {
                this.addWordToDeck(deck.id, {
                    character: parts[0],
                    pinyin: parts[1] || "",
                    spanish: parts[2] || "",
                    english: parts[3] || "",
                    level: parseInt(parts[4], 10) || 1,
                });
            }
        }

        return deck;
    }
}

window.DeckManager = DeckManager;
