class StrokesRadicalsController {
    constructor(app) {
        this.app = app;
        this.practiceSessionStorageKey = 'hsk-strokes-radicals-practice-session-v1';
        this.difficultyThresholds = {
            normal: 3,
            hard: 7
        };
        this.strokeMeaningPatterns = [
            /left-curving stroke/i,
            /left-falling stroke/i,
            /right-falling stroke/i,
            /vertical stroke/i,
            /horizontal character stroke/i,
            /horizontal stroke/i,
            /dot stroke/i,
            /rising stroke/i,
            /hook stroke/i,
            /character stroke/i,
            /\btrazo(?:s)?\b/i,
            /\b(heng|shu|pie|na|dian|ti|gou|zhe)\b/i
        ];
        this.strokeCharacters = new Set(['横', '竖', '撇', '捺', '点', '提', '钩', '折', '㇀', '㇏', '丶', '丿', '丨', '一']);
        this.strokeCatalog = window.StrokesRadicalsCatalogData.buildStrokeCatalog();
        this.radicalCatalog = window.StrokesRadicalsCatalogData.buildRadicalCatalog();
        this.radicalCatalogByNumber = new Map(this.radicalCatalog.map((entry) => [entry.number, entry]));
        this.searchRenderTimer = null;

        this.state = {
            initialized: false,
            eventsBound: false,
            sourceItems: [],
            filteredItems: [],
            radicalExamplesByNumber: {},
            typeFilter: 'all',
            levelFilter: 'all',
            searchTerm: ''
        };

        this.practice = new window.StrokesRadicalsPractice(this);
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    logWarn(...args) {
        this.getLogger().warn(...args);
    }


    parseRadicalNumber(...texts) {
        for (const text of texts) {
            const value = String(text || '');
            const match = value.match(/(?:kangxi\s*)?radical(?:\s+de\s+kangxi)?\s*(\d{1,3})/i);
            if (match) {
                return Number(match[1]);
            }
        }

        return null;
    }

    hasStrokeMeaning(...texts) {
        const originalHaystack = texts.map((text) => String(text || '')).join(' | ');
        const haystack = texts.map((text) => String(text || '').toLowerCase()).join(' | ');

        // Exclude frequent non-writing senses that include the word "stroke".
        if (haystack.includes('stroke of good luck') || haystack.includes('to stroke')) {
            return false;
        }

        if (Array.from(this.strokeCharacters).some((character) => originalHaystack.includes(character))) {
            return true;
        }

        return this.strokeMeaningPatterns.some((pattern) => pattern.test(haystack));
    }

    sanitizeMeaning(word) {
        let meaning = this.app.getMeaningForLanguage(word);

        if (typeof meaning !== 'string') {
            meaning = '';
        }

        return meaning || String(word.english || word.translation || '?');
    }

    createSourceItems() {
        const vocabulary = Array.isArray(this.app.vocabulary) ? this.app.vocabulary : [];
        const unique = new Set();
        const result = [];
        const radicalExamplesByNumber = {};

        vocabulary.forEach((word) => {
            const english = String(word.english || word.translation || '').trim();
            const spanish = String(word.spanish || '').trim();
            const translation = String(word.translation || '').trim();
            const radicalNumber = this.parseRadicalNumber(english, translation, spanish);
            const hasRadical = Number.isInteger(radicalNumber) && radicalNumber >= 1 && radicalNumber <= 214;
            const hasStroke = this.hasStrokeMeaning(english, translation, spanish);
            const radicalReference = hasRadical ? this.radicalCatalogByNumber.get(radicalNumber) : null;

            if (!hasRadical && !hasStroke) {
                return;
            }

            const dedupeKey = [
                String(word.character || ''),
                String(word.pinyin || ''),
                String(word.level || ''),
                english
            ].join('|');

            if (unique.has(dedupeKey)) {
                return;
            }

            unique.add(dedupeKey);

            if (hasRadical && !radicalExamplesByNumber[radicalNumber]) {
                radicalExamplesByNumber[radicalNumber] = String(word.character || '');
            }

            result.push({
                word,
                hasRadical,
                hasStroke,
                radicalNumber,
                radicalReference,
                searchText: [
                    String(word.character || ''),
                    String(word.pinyin || ''),
                    english,
                    spanish,
                    translation,
                    String(radicalReference?.symbol || ''),
                    String(radicalReference?.kangxiSymbol || '')
                ].join(' ').toLowerCase()
            });
        });

        result.sort((left, right) => {
            const leftLevel = Number(left.word.level || 99);
            const rightLevel = Number(right.word.level || 99);
            if (leftLevel !== rightLevel) {
                return leftLevel - rightLevel;
            }

            if (left.hasRadical !== right.hasRadical) {
                return left.hasRadical ? -1 : 1;
            }

            if ((left.radicalNumber || 999) !== (right.radicalNumber || 999)) {
                return (left.radicalNumber || 999) - (right.radicalNumber || 999);
            }

            return String(left.word.character || '').localeCompare(String(right.word.character || ''));
        });

        this.state.sourceItems = result;
        this.state.radicalExamplesByNumber = radicalExamplesByNumber;
    }


    readFiltersFromDom() {
        const typeFilter = document.getElementById('strokes-radicals-type');
        const levelFilter = document.getElementById('strokes-radicals-level');
        const searchInput = document.getElementById('strokes-radicals-search');
        const practiceDifficulty = document.getElementById('sr-practice-difficulty');

        this.state.typeFilter = typeFilter ? typeFilter.value : 'all';
        this.state.levelFilter = levelFilter ? levelFilter.value : 'all';
        this.state.searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();
        this.practice.state.difficulty = practiceDifficulty
            ? this.practice.sanitizeDifficulty(practiceDifficulty.value)
            : this.practice.sanitizeDifficulty(this.practice.state.difficulty || 'auto');
    }

    applyFilters() {
        const { sourceItems, typeFilter, levelFilter, searchTerm } = this.state;

        this.state.filteredItems = sourceItems.filter((entry) => {
            if (typeFilter === 'radicals' && !entry.hasRadical) {
                return false;
            }

            if (typeFilter === 'strokes' && !entry.hasStroke) {
                return false;
            }

            if (levelFilter !== 'all' && String(entry.word.level) !== String(levelFilter)) {
                return false;
            }

            if (searchTerm && !entry.searchText.includes(searchTerm)) {
                return false;
            }

            return true;
        });
    }

    updateStats() {
        const totalRadicals = this.state.sourceItems.filter((entry) => entry.hasRadical).length;
        const totalStrokes = this.state.sourceItems.filter((entry) => entry.hasStroke).length;
        const totalResults = this.state.filteredItems.length;

        const radicalsEl = document.getElementById('strokes-radicals-total-radicals');
        const strokesEl = document.getElementById('strokes-radicals-total-strokes');
        const resultsEl = document.getElementById('strokes-radicals-total-results');

        if (radicalsEl) radicalsEl.textContent = String(totalRadicals);
        if (strokesEl) strokesEl.textContent = String(totalStrokes);
        if (resultsEl) resultsEl.textContent = String(totalResults);
    }

    toggleEmptyState(show, reason = 'no-results') {
        const emptyState = document.getElementById('strokes-radicals-empty');
        const grid = document.getElementById('strokes-radicals-grid');

        if (!emptyState || !grid) {
            return;
        }

        if (!show) {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
            return;
        }

        const titleKey = reason === 'no-data'
            ? 'strokesRadicalsNoDataTitle'
            : 'strokesRadicalsNoResultsTitle';
        const hintKey = reason === 'no-data'
            ? 'strokesRadicalsNoDataHint'
            : 'strokesRadicalsNoResultsHint';

        emptyState.innerHTML = '';

        const title = document.createElement('h3');
        title.textContent = this.app.getTranslation(titleKey);

        const hint = document.createElement('p');
        hint.textContent = this.app.getTranslation(hintKey);

        emptyState.appendChild(title);
        emptyState.appendChild(hint);

        emptyState.style.display = 'block';
        grid.style.display = 'none';
    }

    createTag(text, variant) {
        const tag = document.createElement('span');
        tag.className = 'sr-tag sr-tag-' + variant;
        tag.textContent = text;
        return tag;
    }

    createCard(entry) {
        const { word, hasRadical, hasStroke, radicalNumber, radicalReference } = entry;

        const card = document.createElement('article');
        card.className = 'sr-card';

        const top = document.createElement('div');
        top.className = 'sr-card-top';

        const character = document.createElement('div');
        character.className = 'sr-character';
        character.textContent = String(word.character || '?');
        top.appendChild(character);

        const tags = document.createElement('div');
        tags.className = 'sr-tags';

        if (hasRadical) {
            const radicalSymbol = radicalReference?.symbol ? ` · ${radicalReference.symbol}` : '';
            tags.appendChild(this.createTag(
                this.app.getTranslation('strokesRadicalsTagRadical', { number: radicalNumber }) + radicalSymbol,
                'radical'
            ));
        }

        if (hasStroke) {
            tags.appendChild(this.createTag(this.app.getTranslation('strokesRadicalsTagStroke'), 'stroke'));
        }

        top.appendChild(tags);
        card.appendChild(top);

        const pinyin = document.createElement('div');
        pinyin.className = 'sr-pinyin';
        pinyin.textContent = String(word.pinyin || '?');
        card.appendChild(pinyin);

        const meaning = document.createElement('div');
        meaning.className = 'sr-meaning';
        meaning.textContent = this.sanitizeMeaning(word);
        card.appendChild(meaning);

        const footer = document.createElement('div');
        footer.className = 'sr-card-footer';

        const level = document.createElement('span');
        level.className = 'sr-level';
        level.textContent = 'HSK ' + String(word.level || '?');
        footer.appendChild(level);

        const audioBtn = document.createElement('button');
        audioBtn.type = 'button';
        audioBtn.className = 'sr-audio-btn';
        audioBtn.textContent = this.app.getTranslation('playPronunciation');
        audioBtn.addEventListener('click', () => this.app.playAudio(String(word.character || '')));
        footer.appendChild(audioBtn);

        card.appendChild(footer);
        return card;
    }

    getStrokeLabel(entry) {
        if (entry.nameEs || entry.nameEn) {
            const localizedName = this.app.currentLanguage === 'es' ? entry.nameEs : entry.nameEn;
            if (entry.pinyin) {
                return `${localizedName} (${entry.pinyin})`;
            }

            return localizedName;
        }

        return this.app.getTranslation('strokesRadicalsStrokeLabel', { number: entry.order });
    }

    createReferenceEmptyMessage() {
        const empty = document.createElement('div');
        empty.className = 'sr-reference-empty';
        empty.textContent = this.app.getTranslation('strokesRadicalsReferenceNoMatches');
        return empty;
    }

    createStrokeReferenceCard(entry) {
        const card = document.createElement('article');
        card.className = 'sr-reference-card sr-reference-card-stroke';

        const symbol = document.createElement('div');
        symbol.className = 'sr-reference-symbol';
        symbol.textContent = entry.symbol;
        card.appendChild(symbol);

        const label = document.createElement('div');
        label.className = 'sr-reference-label';
        label.textContent = this.getStrokeLabel(entry);
        card.appendChild(label);

        const badge = document.createElement('span');
        badge.className = 'sr-reference-badge';
        badge.textContent = this.app.getTranslation(
            entry.family === 'core'
                ? 'strokesRadicalsStrokeBadgeCore'
                : 'strokesRadicalsStrokeBadgeExtended'
        );
        card.appendChild(badge);

        return card;
    }

    createRadicalReferenceCard(entry) {
        const card = document.createElement('article');
        card.className = 'sr-reference-card sr-reference-card-radical';

        const symbol = document.createElement('div');
        symbol.className = 'sr-reference-symbol';
        symbol.textContent = entry.symbol;
        card.appendChild(symbol);

        if (entry.kangxiSymbol && entry.kangxiSymbol !== entry.symbol) {
            const alt = document.createElement('div');
            alt.className = 'sr-reference-alt-symbol';
            alt.textContent = entry.kangxiSymbol;
            card.appendChild(alt);
        }

        const label = document.createElement('div');
        label.className = 'sr-reference-label';
        label.textContent = this.app.getTranslation('strokesRadicalsTagRadical', { number: entry.number });
        card.appendChild(label);

        const exampleCharacter = this.state.radicalExamplesByNumber[entry.number];
        if (exampleCharacter) {
            const example = document.createElement('div');
            example.className = 'sr-reference-example';
            example.textContent = this.app.getTranslation('strokesRadicalsReferenceExample', {
                character: exampleCharacter
            });
            card.appendChild(example);
        }

        return card;
    }

    renderReferenceCatalogs() {
        const strokesGrid = document.getElementById('strokes-radicals-strokes-catalog');
        const radicalsGrid = document.getElementById('strokes-radicals-radicals-catalog');
        const strokesSection = document.getElementById('strokes-radicals-strokes-section');
        const radicalsSection = document.getElementById('strokes-radicals-radicals-section');
        const strokesCountEl = document.getElementById('strokes-radicals-catalog-strokes');
        const radicalsCountEl = document.getElementById('strokes-radicals-catalog-radicals');

        if (!strokesGrid || !radicalsGrid) {
            return;
        }

        const searchTerm = this.state.searchTerm;
        const showStrokes = this.state.typeFilter !== 'radicals';
        const showRadicals = this.state.typeFilter !== 'strokes';

        if (strokesSection) {
            strokesSection.style.display = showStrokes ? 'block' : 'none';
        }

        if (radicalsSection) {
            radicalsSection.style.display = showRadicals ? 'block' : 'none';
        }

        const filteredStrokes = showStrokes
            ? this.strokeCatalog.filter((entry) => !searchTerm || entry.searchText.includes(searchTerm))
            : [];
        const filteredRadicals = showRadicals
            ? this.radicalCatalog.filter((entry) => !searchTerm || entry.searchText.includes(searchTerm))
            : [];

        if (strokesCountEl) {
            strokesCountEl.textContent = `${filteredStrokes.length}/${this.strokeCatalog.length}`;
        }

        if (radicalsCountEl) {
            radicalsCountEl.textContent = `${filteredRadicals.length}/${this.radicalCatalog.length}`;
        }

        strokesGrid.innerHTML = '';
        if (showStrokes && filteredStrokes.length) {
            const strokeFragment = document.createDocumentFragment();
            filteredStrokes.forEach((entry) => {
                strokeFragment.appendChild(this.createStrokeReferenceCard(entry));
            });
            strokesGrid.appendChild(strokeFragment);
        } else if (showStrokes) {
            strokesGrid.appendChild(this.createReferenceEmptyMessage());
        }

        radicalsGrid.innerHTML = '';
        if (showRadicals && filteredRadicals.length) {
            const radicalFragment = document.createDocumentFragment();
            filteredRadicals.forEach((entry) => {
                radicalFragment.appendChild(this.createRadicalReferenceCard(entry));
            });
            radicalsGrid.appendChild(radicalFragment);
        } else if (showRadicals) {
            radicalsGrid.appendChild(this.createReferenceEmptyMessage());
        }
    }

    renderCards() {
        const grid = document.getElementById('strokes-radicals-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';

        if (this.state.filteredItems.length === 0) {
            this.toggleEmptyState(true, 'no-results');
            return;
        }

        const fragment = document.createDocumentFragment();
        this.state.filteredItems.forEach((entry) => {
            fragment.appendChild(this.createCard(entry));
        });

        grid.appendChild(fragment);
        this.toggleEmptyState(false);
    }

    render() {
        this.readFiltersFromDom();
        this.renderReferenceCatalogs();

        if (!this.state.sourceItems.length) {
            this.state.filteredItems = [];
            this.updateStats();
            this.toggleEmptyState(true, 'no-data');
            this.practice.renderPracticeNoData();
            return;
        }

        this.applyFilters();
        this.updateStats();
        this.renderCards();

        const practicePool = this.practice.getPracticePool();
        if (practicePool.length === 0) {
            this.practice.renderPracticeNoData();
            return;
        }

        const currentEntry = this.practice.state.currentEntry;
        const hasCurrentEntryInPool = currentEntry ? practicePool.includes(currentEntry) : false;

        if (!hasCurrentEntryInPool) {
            this.practice.pickNextPracticeQuestion();
            return;
        }

        this.practice.renderPracticeQuestion(false);
    }

    bindEvents() {
        if (this.state.eventsBound) {
            return;
        }

        const typeFilter = document.getElementById('strokes-radicals-type');
        const levelFilter = document.getElementById('strokes-radicals-level');
        const searchInput = document.getElementById('strokes-radicals-search');
        const practiceDifficulty = document.getElementById('sr-practice-difficulty');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.render());
        }

        if (levelFilter) {
            levelFilter.addEventListener('change', () => this.render());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (this.searchRenderTimer) {
                    clearTimeout(this.searchRenderTimer);
                }

                this.searchRenderTimer = setTimeout(() => {
                    this.searchRenderTimer = null;
                    this.render();
                }, 140);
            });
        }

        if (practiceDifficulty) {
            practiceDifficulty.addEventListener('change', () => {
                this.readFiltersFromDom();
                this.practice.updatePracticeScore();
                this.render();
            });
        }

        const nextPracticeBtn = document.getElementById('sr-practice-next');
        if (nextPracticeBtn) {
            nextPracticeBtn.addEventListener('click', () => this.practice.pickNextPracticeQuestion());
        }

        const resetPracticeBtn = document.getElementById('sr-practice-reset-session');
        if (resetPracticeBtn) {
            resetPracticeBtn.addEventListener('click', () => this.practice.resetPracticeSession());
        }

        this.state.eventsBound = true;
    }

    async loadAndRender() {
        if (!Array.isArray(this.app.vocabulary) || this.app.vocabulary.length === 0) {
            try {
                await this.app.loadVocabulary();
            } catch (error) {
                this.logWarn('Could not load vocabulary for strokes/radicals:', error);
            }
        }

        this.createSourceItems();
        this.render();
        this.logDebug('[✓] StrokesRadicalsController rendered:', this.state.sourceItems.length, 'entries');
    }

    async initialize() {
        if (this.state.initialized) {
            this.render();
            return;
        }

        this.practice.loadPracticeSession();
        this.bindEvents();
        this.practice.syncPracticeControls();
        this.state.initialized = true;
        await this.loadAndRender();
    }

    refresh() {
        if (!this.state.initialized) {
            return;
        }

        this.createSourceItems();
        this.render();
    }
}

window.StrokesRadicalsController = StrokesRadicalsController;
