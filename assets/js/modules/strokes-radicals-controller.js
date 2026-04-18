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
        this.strokeCodeComponentLabelsByLanguage = {
            es: {
                H: 'horizontal',
                S: 'vertical',
                P: 'descendente izquierda',
                N: 'descendente derecha',
                D: 'punto',
                T: 'ascendente',
                Z: 'giro',
                G: 'gancho',
                W: 'curva',
                B: 'corto',
                X: 'diagonal',
                Q: 'cerrado'
            },
            en: {
                H: 'horizontal',
                S: 'vertical',
                P: 'left-falling',
                N: 'right-falling',
                D: 'dot',
                T: 'rising',
                Z: 'turn',
                G: 'hook',
                W: 'bend',
                B: 'short',
                X: 'diagonal',
                Q: 'enclosed'
            }
        };
        this.strokeCharacters = new Set(['横', '竖', '撇', '捺', '点', '提', '钩', '折', '㇀', '㇏', '丶', '丿', '丨', '一']);
        this.strokeCatalog = this.buildStrokeCatalog();
        this.radicalCatalog = this.buildRadicalCatalog();
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
            searchTerm: '',
            practice: {
                currentEntry: null,
                correctOption: null,
                selectedOption: null,
                answered: false,
                score: 0,
                attempts: 0,
                streak: 0,
                bestStreak: 0,
                difficulty: 'auto',
                lastDifficultyUsed: 'easy',
                sessionStartedAt: null
            }
        };
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

    getStrokeCodeComponentLabels(languageCode = 'en') {
        return this.strokeCodeComponentLabelsByLanguage[languageCode]
            || this.strokeCodeComponentLabelsByLanguage.en;
    }

    buildCompositeStrokeName(strokeCode, languageCode = 'en') {
        const normalizedCode = String(strokeCode || '').trim().toUpperCase();
        if (!normalizedCode) {
            return '';
        }

        const componentLabels = this.getStrokeCodeComponentLabels(languageCode);
        const components = normalizedCode
            .split('')
            .map((part) => componentLabels[part] || part);

        if (components.length === 1) {
            if (languageCode === 'es') {
                return `Variante ${normalizedCode}: ${components[0]}`;
            }

            return `Variant ${normalizedCode}: ${components[0]}`;
        }

        const joiner = ' + ';
        if (languageCode === 'es') {
            return `Compuesto ${normalizedCode}: ${components.join(joiner)}`;
        }

        return `Composite ${normalizedCode}: ${components.join(joiner)}`;
    }

    getExtendedStrokeMetadata() {
        return new Map([
            [0x31c0, { strokeCode: 'T' }],
            [0x31c1, { strokeCode: 'WG' }],
            [0x31c2, { strokeCode: 'XG' }],
            [0x31c3, { strokeCode: 'BXG' }],
            [0x31c4, { strokeCode: 'SW' }],
            [0x31c5, { strokeCode: 'HZZ' }],
            [0x31c6, { strokeCode: 'HZG' }],
            [0x31c7, { strokeCode: 'HP' }],
            [0x31c8, { strokeCode: 'HZWG' }],
            [0x31c9, { strokeCode: 'SZWG' }],
            [0x31ca, { strokeCode: 'HZT' }],
            [0x31cb, { strokeCode: 'HZZP' }],
            [0x31cc, { strokeCode: 'HPWG' }],
            [0x31cd, { strokeCode: 'HZW' }],
            [0x31ce, { strokeCode: 'HZZZ' }],
            [0x31cf, { strokeCode: 'N' }],
            [0x31d0, { strokeCode: 'H' }],
            [0x31d1, { strokeCode: 'S' }],
            [0x31d2, { strokeCode: 'P' }],
            [0x31d3, { strokeCode: 'SP' }],
            [0x31d4, { strokeCode: 'D' }],
            [0x31d5, { strokeCode: 'HZ' }],
            [0x31d6, { strokeCode: 'HG' }],
            [0x31d7, { strokeCode: 'SZ' }],
            [0x31d8, { strokeCode: 'SWZ' }],
            [0x31d9, { strokeCode: 'ST' }],
            [0x31da, { strokeCode: 'SG' }],
            [0x31db, { strokeCode: 'PD' }],
            [0x31dc, { strokeCode: 'PZ' }],
            [0x31dd, { strokeCode: 'TN' }],
            [0x31de, { strokeCode: 'SZZ' }],
            [0x31df, { strokeCode: 'SWG' }],
            [0x31e0, { strokeCode: 'HXWG' }],
            [0x31e1, { strokeCode: 'HZZZG' }],
            [0x31e2, { strokeCode: 'PG' }],
            [0x31e3, { strokeCode: 'Q' }]
        ]);
    }

    buildStrokeCatalog() {
        const coreStrokes = [
            {
                id: 'core-heng',
                symbol: '一',
                pinyin: 'heng',
                nameEs: 'Horizontal',
                nameEn: 'Horizontal',
                family: 'core'
            },
            {
                id: 'core-shu',
                symbol: '丨',
                pinyin: 'shu',
                nameEs: 'Vertical',
                nameEn: 'Vertical',
                family: 'core'
            },
            {
                id: 'core-pie',
                symbol: '丿',
                pinyin: 'pie',
                nameEs: 'Descendente izquierda',
                nameEn: 'Left-falling',
                family: 'core'
            },
            {
                id: 'core-dian',
                symbol: '丶',
                pinyin: 'dian',
                nameEs: 'Punto',
                nameEn: 'Dot',
                family: 'core'
            },
            {
                id: 'core-na',
                symbol: '㇏',
                pinyin: 'na',
                nameEs: 'Descendente derecha',
                nameEn: 'Right-falling',
                family: 'core'
            },
            {
                id: 'core-ti',
                symbol: '㇀',
                pinyin: 'ti',
                nameEs: 'Ascendente',
                nameEn: 'Rising',
                family: 'core'
            },
            {
                id: 'core-gou',
                symbol: '亅',
                pinyin: 'gou',
                nameEs: 'Gancho',
                nameEn: 'Hook',
                family: 'core'
            },
            {
                id: 'core-zhe',
                symbol: '乛',
                pinyin: 'zhe',
                nameEs: 'Giro',
                nameEn: 'Turning',
                family: 'core'
            }
        ];

        const extendedStrokeMetadata = this.getExtendedStrokeMetadata();
        const extensionStrokes = [];
        for (let codePoint = 0x31c0; codePoint <= 0x31e3; codePoint += 1) {
            const metadata = extendedStrokeMetadata.get(codePoint);
            const strokeCode = String(metadata?.strokeCode || '').trim().toUpperCase();
            const computedNameEs = this.buildCompositeStrokeName(strokeCode, 'es');
            const computedNameEn = this.buildCompositeStrokeName(strokeCode, 'en');
            const fallbackHex = codePoint.toString(16).toUpperCase();
            extensionStrokes.push({
                id: `extended-${codePoint.toString(16)}`,
                symbol: String.fromCodePoint(codePoint),
                pinyin: '',
                nameEs: computedNameEs || `Trazo extendido U+${fallbackHex}`,
                nameEn: computedNameEn || `Extended stroke U+${fallbackHex}`,
                strokeCode,
                family: 'extended'
            });
        }

        return [...coreStrokes, ...extensionStrokes].map((entry, index) => ({
            ...entry,
            order: index + 1,
            searchText: String([
                entry.symbol,
                entry.pinyin,
                entry.nameEs,
                entry.nameEn,
                entry.strokeCode,
                entry.family,
                index + 1
            ].join(' ').toLowerCase())
        }));
    }

    buildRadicalCatalog() {
        const radicals = [];

        for (let radicalNumber = 1; radicalNumber <= 214; radicalNumber += 1) {
            const kangxiSymbol = String.fromCodePoint(0x2f00 + (radicalNumber - 1));
            const normalizedSymbol = kangxiSymbol.normalize('NFKC');
            const symbol = normalizedSymbol || kangxiSymbol;

            radicals.push({
                number: radicalNumber,
                symbol,
                kangxiSymbol,
                searchText: String([
                    radicalNumber,
                    symbol,
                    kangxiSymbol,
                    `kangxi radical ${radicalNumber}`
                ].join(' ').toLowerCase())
            });
        }

        return radicals;
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

        if (meaning.toUpperCase().startsWith('MYMEMORY WARNING')) {
            meaning = String(word.english || word.translation || '').trim();
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

    getPracticeCategory(entry) {
        if (entry.hasRadical && entry.hasStroke) return 'both';
        if (entry.hasRadical) return 'radical';
        if (entry.hasStroke) return 'stroke';
        return 'none';
    }

    getPracticeOptionLabel(optionKey) {
        const keyByOption = {
            radical: 'strokesRadicalsPracticeOptionRadical',
            stroke: 'strokesRadicalsPracticeOptionStroke',
            both: 'strokesRadicalsPracticeOptionBoth',
            none: 'strokesRadicalsPracticeOptionNone'
        };

        return this.app.getTranslation(keyByOption[optionKey] || keyByOption.none);
    }

    shuffleArray(items) {
        const copy = [...items];
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
        }

        return copy;
    }

    getNumericValue(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    getPracticeSessionStorageKey() {
        const currentUser = window.backendAuth?.getCurrentUser?.();
        const userId = currentUser?.id || 'guest';
        return `${this.practiceSessionStorageKey}:${userId}`;
    }

    sanitizeDifficulty(value) {
        const allowed = new Set(['auto', 'easy', 'normal', 'hard']);
        return allowed.has(value) ? value : 'auto';
    }

    loadPracticeSession() {
        this.state.practice.sessionStartedAt = Date.now();

        try {
            const raw = sessionStorage.getItem(this.getPracticeSessionStorageKey());
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw);
            this.state.practice.score = this.getNumericValue(parsed.score, 0);
            this.state.practice.attempts = this.getNumericValue(parsed.attempts, 0);
            this.state.practice.streak = this.getNumericValue(parsed.streak, 0);
            this.state.practice.bestStreak = this.getNumericValue(parsed.bestStreak, 0);
            this.state.practice.difficulty = this.sanitizeDifficulty(String(parsed.difficulty || 'auto'));
            this.state.practice.sessionStartedAt = this.getNumericValue(parsed.sessionStartedAt, Date.now());
        } catch (error) {
            this.logWarn('[strokes-radicals] Could not load practice session:', error);
        }
    }

    savePracticeSession() {
        try {
            sessionStorage.setItem(this.getPracticeSessionStorageKey(), JSON.stringify({
                score: this.state.practice.score,
                attempts: this.state.practice.attempts,
                streak: this.state.practice.streak,
                bestStreak: this.state.practice.bestStreak,
                difficulty: this.sanitizeDifficulty(this.state.practice.difficulty),
                sessionStartedAt: this.state.practice.sessionStartedAt || Date.now()
            }));
        } catch (error) {
            this.logWarn('[strokes-radicals] Could not save practice session:', error);
        }
    }

    syncPracticeControls() {
        const difficultySelect = document.getElementById('sr-practice-difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.state.practice.difficulty || 'auto';
        }
    }

    getEffectiveDifficulty() {
        const selectedDifficulty = this.state.practice.difficulty || 'auto';
        if (selectedDifficulty !== 'auto') {
            return selectedDifficulty;
        }

        if (this.state.practice.streak >= this.difficultyThresholds.hard) {
            return 'hard';
        }

        if (this.state.practice.streak >= this.difficultyThresholds.normal) {
            return 'normal';
        }

        return 'easy';
    }

    getDifficultyLabel(difficulty) {
        const keyByDifficulty = {
            auto: 'strokesRadicalsPracticeDifficultyAuto',
            easy: 'strokesRadicalsPracticeDifficultyEasy',
            normal: 'strokesRadicalsPracticeDifficultyNormal',
            hard: 'strokesRadicalsPracticeDifficultyHard'
        };

        return this.app.getTranslation(keyByDifficulty[difficulty] || keyByDifficulty.auto);
    }

    getPracticeOptionsForDifficulty(difficulty, correctOption) {
        if (difficulty === 'easy') {
            if (correctOption === 'radical' || correctOption === 'stroke') {
                return ['radical', 'stroke'];
            }
            return [correctOption, 'radical'];
        }

        if (difficulty === 'normal') {
            const options = ['radical', 'stroke', 'both'];
            if (!options.includes(correctOption)) {
                options.push(correctOption);
            }
            return options;
        }

        return ['radical', 'stroke', 'both'];
    }

    getPracticeHint(entry, difficulty) {
        const pinyin = String(entry.word.pinyin || '?');
        const meaning = this.sanitizeMeaning(entry.word);

        if (difficulty === 'hard') {
            return pinyin;
        }

        if (difficulty === 'normal') {
            const shortMeaning = meaning.split(/[;,|]/)[0]?.trim() || meaning;
            return `${pinyin} · ${shortMeaning}`;
        }

        return `${pinyin} · ${meaning}`;
    }

    getPracticePool() {
        const filteredItems = this.state.filteredItems;
        const effectiveDifficulty = this.getEffectiveDifficulty();
        this.state.practice.lastDifficultyUsed = effectiveDifficulty;

        const pool = filteredItems.filter((entry) => {
            const category = this.getPracticeCategory(entry);

            if (effectiveDifficulty === 'easy') {
                return category === 'radical' || category === 'stroke';
            }

            if (effectiveDifficulty === 'normal') {
                return category !== 'none';
            }

            return true;
        });

        return pool.length ? pool : filteredItems;
    }

    updatePracticeScore() {
        const scoreEl = document.getElementById('sr-practice-score');
        const streakEl = document.getElementById('sr-practice-streak');
        const bestStreakEl = document.getElementById('sr-practice-best-streak');
        const accuracyEl = document.getElementById('sr-practice-accuracy');
        const difficultyEl = document.getElementById('sr-practice-current-difficulty');

        const score = this.state.practice.score;
        const attempts = this.state.practice.attempts;
        const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
        const effectiveDifficulty = this.getEffectiveDifficulty();

        if (scoreEl) {
            scoreEl.textContent = `${score}/${attempts}`;
        }

        if (streakEl) {
            streakEl.textContent = String(this.state.practice.streak);
        }

        if (bestStreakEl) {
            bestStreakEl.textContent = String(this.state.practice.bestStreak);
        }

        if (accuracyEl) {
            accuracyEl.textContent = `${accuracy}%`;
        }

        if (difficultyEl) {
            difficultyEl.textContent = this.getDifficultyLabel(effectiveDifficulty);
        }

        this.savePracticeSession();
    }

    resetPracticeSession() {
        this.state.practice.score = 0;
        this.state.practice.attempts = 0;
        this.state.practice.streak = 0;
        this.state.practice.bestStreak = 0;
        this.state.practice.sessionStartedAt = Date.now();
        this.state.practice.answered = false;
        this.state.practice.selectedOption = null;

        this.savePracticeSession();

        if (this.state.filteredItems.length === 0) {
            this.renderPracticeNoData();
            return;
        }

        this.pickNextPracticeQuestion();
        this.updatePracticeScore();
    }

    renderPracticeNoData() {
        const questionEl = document.getElementById('sr-practice-question');
        const characterEl = document.getElementById('sr-practice-character');
        const hintEl = document.getElementById('sr-practice-hint');
        const optionsEl = document.getElementById('sr-practice-options');
        const feedbackEl = document.getElementById('sr-practice-feedback');
        const nextBtn = document.getElementById('sr-practice-next');

        if (questionEl) questionEl.textContent = this.app.getTranslation('strokesRadicalsPracticeNoData');
        if (characterEl) characterEl.textContent = '-';
        if (hintEl) hintEl.textContent = '';
        if (optionsEl) optionsEl.innerHTML = '';
        if (feedbackEl) feedbackEl.textContent = '';
        if (nextBtn) nextBtn.style.display = 'none';

        this.state.practice.currentEntry = null;
        this.state.practice.correctOption = null;
        this.state.practice.selectedOption = null;
        this.state.practice.answered = false;
        this.updatePracticeScore();
    }

    pickNextPracticeQuestion() {
        const pool = this.getPracticePool();
        if (pool.length === 0) {
            this.renderPracticeNoData();
            return;
        }

        const currentEntry = this.state.practice.currentEntry;
        const available = currentEntry ? pool.filter((entry) => entry !== currentEntry) : pool;
        const selectionPool = available.length ? available : pool;
        const nextEntry = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        this.state.practice.currentEntry = nextEntry;
        this.state.practice.correctOption = this.getPracticeCategory(nextEntry);
        this.state.practice.selectedOption = null;
        this.state.practice.answered = false;

        this.renderPracticeQuestion();
    }

    applyPracticeAnswerState() {
        const selectedOption = this.state.practice.selectedOption;
        const correctOption = this.state.practice.correctOption;
        if (!this.state.practice.answered || !selectedOption || !correctOption) {
            return;
        }

        const isCorrect = selectedOption === correctOption;

        document.querySelectorAll('#sr-practice-options .sr-practice-option').forEach((button) => {
            const option = button.dataset.option;
            if (option === correctOption) {
                button.classList.add('correct');
            } else if (option === selectedOption && !isCorrect) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });

        const feedbackEl = document.getElementById('sr-practice-feedback');
        if (feedbackEl) {
            if (isCorrect) {
                feedbackEl.textContent = this.app.getTranslation('strokesRadicalsPracticeCorrect');
                feedbackEl.className = 'sr-practice-feedback correct';
            } else {
                feedbackEl.textContent = this.app.getTranslation('strokesRadicalsPracticeIncorrect', {
                    answer: this.getPracticeOptionLabel(correctOption)
                });
                feedbackEl.className = 'sr-practice-feedback incorrect';
            }
        }

        const nextBtn = document.getElementById('sr-practice-next');
        if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
        }
    }

    renderPracticeQuestion(resetQuestionState = true) {
        const questionEl = document.getElementById('sr-practice-question');
        const characterEl = document.getElementById('sr-practice-character');
        const hintEl = document.getElementById('sr-practice-hint');
        const optionsEl = document.getElementById('sr-practice-options');
        const feedbackEl = document.getElementById('sr-practice-feedback');
        const nextBtn = document.getElementById('sr-practice-next');

        const entry = this.state.practice.currentEntry;
        if (!entry || !questionEl || !characterEl || !hintEl || !optionsEl || !feedbackEl || !nextBtn) {
            return;
        }

        if (resetQuestionState) {
            this.state.practice.answered = false;
            this.state.practice.selectedOption = null;
        }

        const activeDifficulty = this.state.practice.lastDifficultyUsed || this.getEffectiveDifficulty();
        const optionKeys = this.shuffleArray(
            this.getPracticeOptionsForDifficulty(activeDifficulty, this.state.practice.correctOption)
        );

        questionEl.textContent = this.app.getTranslation('strokesRadicalsPracticePrompt');
        characterEl.textContent = String(entry.word.character || '?');
        hintEl.textContent = this.getPracticeHint(entry, activeDifficulty);
        feedbackEl.textContent = '';
        feedbackEl.className = 'sr-practice-feedback';
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';

        optionKeys.forEach((optionKey) => {
            const optionBtn = document.createElement('button');
            optionBtn.type = 'button';
            optionBtn.className = 'sr-practice-option';
            optionBtn.dataset.option = optionKey;
            optionBtn.textContent = this.getPracticeOptionLabel(optionKey);
            optionBtn.addEventListener('click', () => this.submitPracticeAnswer(optionKey));
            optionsEl.appendChild(optionBtn);
        });

        if (!resetQuestionState && this.state.practice.answered) {
            this.applyPracticeAnswerState();
        }

        this.updatePracticeScore();
    }

    submitPracticeAnswer(selectedOption) {
        if (this.state.practice.answered) {
            return;
        }

        const correctOption = this.state.practice.correctOption;
        const isCorrect = selectedOption === correctOption;
        this.state.practice.selectedOption = selectedOption;
        this.state.practice.answered = true;
        this.state.practice.attempts += 1;
        if (isCorrect) {
            this.state.practice.score += 1;
            this.state.practice.streak += 1;
            this.state.practice.bestStreak = Math.max(this.state.practice.bestStreak, this.state.practice.streak);
        } else {
            this.state.practice.streak = 0;
        }

        this.applyPracticeAnswerState();

        this.updatePracticeScore();
    }

    readFiltersFromDom() {
        const typeFilter = document.getElementById('strokes-radicals-type');
        const levelFilter = document.getElementById('strokes-radicals-level');
        const searchInput = document.getElementById('strokes-radicals-search');
        const practiceDifficulty = document.getElementById('sr-practice-difficulty');

        this.state.typeFilter = typeFilter ? typeFilter.value : 'all';
        this.state.levelFilter = levelFilter ? levelFilter.value : 'all';
        this.state.searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();
        this.state.practice.difficulty = practiceDifficulty
            ? this.sanitizeDifficulty(practiceDifficulty.value)
            : this.sanitizeDifficulty(this.state.practice.difficulty || 'auto');
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

        const title = document.createElement('h4');
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
            this.renderPracticeNoData();
            return;
        }

        this.applyFilters();
        this.updateStats();
        this.renderCards();

        const practicePool = this.getPracticePool();
        if (practicePool.length === 0) {
            this.renderPracticeNoData();
            return;
        }

        const currentEntry = this.state.practice.currentEntry;
        const hasCurrentEntryInPool = currentEntry ? practicePool.includes(currentEntry) : false;

        if (!hasCurrentEntryInPool) {
            this.pickNextPracticeQuestion();
            return;
        }

        this.renderPracticeQuestion(false);
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
                this.updatePracticeScore();
                this.render();
            });
        }

        const nextPracticeBtn = document.getElementById('sr-practice-next');
        if (nextPracticeBtn) {
            nextPracticeBtn.addEventListener('click', () => this.pickNextPracticeQuestion());
        }

        const resetPracticeBtn = document.getElementById('sr-practice-reset-session');
        if (resetPracticeBtn) {
            resetPracticeBtn.addEventListener('click', () => this.resetPracticeSession());
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

        this.loadPracticeSession();
        this.bindEvents();
        this.syncPracticeControls();
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
