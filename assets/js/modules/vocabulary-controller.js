class VocabularyController {
    constructor(app) {
        this.app = app;
        this.levelCache = new Map();
        this.backgroundLoadingPromise = null;
        this.isFullyLoaded = false;
    }

    async loadSingleLevel(level, lang) {
        const numLevel = Number(level);
        if (!numLevel || numLevel < 1 || numLevel > 6) return [];
        const suffix = lang === 'es' ? 'es' : 'en';
        const cacheKey = `hsk${numLevel}_${suffix}`;
        if (this.levelCache.has(cacheKey)) {
            return this.levelCache.get(cacheKey);
        }

        try {
            const response = await fetch(`assets/data/vocab/hsk${numLevel}_${suffix}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            let words = await response.json();
            if (lang !== 'es') {
                words = words.map((word) => ({
                    ...word,
                    english: word.translation || word.english,
                    spanish: word.spanish || null
                }));
            }
            this.levelCache.set(cacheKey, words);
            return words;
        } catch (error) {
            this.app.logWarn(`[LOAD] Failed to load HSK${numLevel} (${suffix}):`, error);
            return [];
        }
    }

    /**
     * Load all 6 level split files in parallel and merge.
     */
    async loadAllLevelsSplit(lang) {
        const levels = [1, 2, 3, 4, 5, 6];
        const results = await Promise.all(
            levels.map((level) => this.loadSingleLevel(level, lang))
        );

        const vocabulary = results.flat();
        if (vocabulary.length === 0) {
            throw new Error('No vocabulary level files could be loaded');
        }
        return vocabulary;
    }

    mergeWordsIntoApp(newWords) {
        const existingMap = new Map();
        (this.app.vocabulary || []).forEach(w => {
            const key = `${w.character}_${w.pinyin}_${w.level}`;
            existingMap.set(key, w);
        });

        let added = false;
        newWords.forEach(w => {
            const key = `${w.character}_${w.pinyin}_${w.level}`;
            if (!existingMap.has(key)) {
                existingMap.set(key, w);
                added = true;
            }
        });

        if (added) {
            this.app.vocabulary = Array.from(existingMap.values());
            this.app.vocabulary.sort((a, b) => Number(a.level || 0) - Number(b.level || 0));
        }
    }

    async ensureLevelLoaded(level) {
        const targetLanguage = this.app.currentLanguage || 'en';
        if (level === 'all') {
            return this.ensureAllLevelsLoaded();
        }
        const numLevel = Number(level);
        if (!numLevel || numLevel < 1 || numLevel > 6) {
            return this.app.vocabulary;
        }

        const hasLevel = (this.app.vocabulary || []).some(w => Number(w.level) === numLevel);
        if (hasLevel) {
            return this.app.vocabulary;
        }

        const words = await this.loadSingleLevel(numLevel, targetLanguage);
        if (words && words.length > 0) {
            this.mergeWordsIntoApp(words);
        }
        return this.app.vocabulary;
    }

    async ensureAllLevelsLoaded() {
        if (this.isFullyLoaded && this.app.vocabulary && this.app.vocabulary.length > 1000) {
            return this.app.vocabulary;
        }
        if (this.backgroundLoadingPromise) {
            await this.backgroundLoadingPromise;
            return this.app.vocabulary;
        }
        const targetLanguage = this.app.currentLanguage || 'en';
        this.app.vocabulary = await this.loadAllLevelsSplit(targetLanguage);
        this.isFullyLoaded = true;
        this.app.allVocabularyLoaded = true;
        window.dispatchEvent(new CustomEvent('hsk:vocabulary-fully-loaded'));
        return this.app.vocabulary;
    }

    async streamRemainingLevels(priorityLevel, lang) {
        const remainingLevels = [1, 2, 3, 4, 5, 6].filter(lvl => lvl !== priorityLevel);
        this.backgroundLoadingPromise = (async () => {
            for (const level of remainingLevels) {
                // Pequeña pausa para no congestionar el hilo de red durante las animaciones de boot
                await new Promise(r => setTimeout(r, 60));
                const words = await this.loadSingleLevel(level, lang);
                if (words && words.length > 0) {
                    this.mergeWordsIntoApp(words);
                    window.dispatchEvent(new CustomEvent('hsk:vocabulary-level-ready', {
                        detail: { level, total: this.app.vocabulary.length }
                    }));
                }
            }
            this.isFullyLoaded = true;
            this.app.allVocabularyLoaded = true;
            this.app.logDebug(`[OK] All HSK levels loaded in background: ${this.app.vocabulary.length} total items`);
            window.dispatchEvent(new CustomEvent('hsk:vocabulary-fully-loaded'));

            if (this.app.uiController && this.app.uiController.activeTab === 'stats') {
                this.app.updateStats();
            }
        })();

        return this.backgroundLoadingPromise;
    }

    async loadVocabulary(forceLanguage = null) {
        if (this.app.vocabularyLoading && !forceLanguage) {
            return this.app.vocabularyPromise;
        }

        if (this.app.vocabularyLoaded && !forceLanguage) {
            return Promise.resolve(this.app.vocabulary);
        }

        this.app.vocabularyLoading = true;

        const loadTask = async () => {
            const targetLanguage = forceLanguage || this.app.currentLanguage || 'en';
            this.app.logDebug('[LOAD] Starting optimized progressive load for ' + targetLanguage + ' vocabulary…');

            try {
                const requestedLevel = this.app.currentLevel;
                const priorityLevel = (requestedLevel && requestedLevel !== 'all') ? Number(requestedLevel) : 1;

                if (requestedLevel === 'all') {
                    this.app.vocabulary = await this.loadAllLevelsSplit(targetLanguage);
                    this.isFullyLoaded = true;
                    this.app.allVocabularyLoaded = true;
                } else {
                    // Carga rápida del nivel prioritario (ej. HSK 1 ~20 KB)
                    this.app.vocabulary = await this.loadSingleLevel(priorityLevel, targetLanguage);
                    if (!this.app.vocabulary || this.app.vocabulary.length === 0) {
                        this.app.vocabulary = await this.loadSingleLevel(1, targetLanguage);
                    }
                    // Carga progresiva en segundo plano de los demás niveles
                    this.streamRemainingLevels(priorityLevel, targetLanguage);
                }

                // Las frases de ejemplo NO bloquean el arranque: son 238 KB
                // gzip y solo se ven en el reverso de la tarjeta.
                this.app.exampleSentences = this.app.exampleSentences || {};
                this.loadExampleSentences();
                this.app.classifierMap = this.app.classifierMap || {};
                this.loadClassifierMap();

                this.app.logDebug('[OK] Priority vocabulary loaded: ' + this.app.vocabulary.length + ' items');
                this.app.vocabularyLoaded = true;
                this.app.vocabularyLoading = false;

                window.dispatchEvent(new CustomEvent('hsk:vocabulary-ready'));

                if (this.app.uiController && this.app.uiController.activeTab === 'stats') {
                    this.app.updateStats();
                }

                return this.app.vocabulary;
            } catch (error) {
                this.app.logError('[✗] Error loading ' + targetLanguage + ':', error);

                this.createFallbackVocabulary();

                this.app.vocabularyLoaded = true;
                this.app.vocabularyLoading = false;
                window.dispatchEvent(new CustomEvent('hsk:vocabulary-ready'));
                return this.app.vocabulary;
            }
        };

        this.app.vocabularyPromise = loadTask();
        return this.app.vocabularyPromise;
    }

    // Fetch en segundo plano, sin await desde loadVocabulary. Se guarda la
    // promesa para no dispararlo dos veces si se recarga el vocabulario al
    // cambiar de idioma: el archivo es el mismo para ambos idiomas.
    loadExampleSentences() {
        if (this.app.exampleSentencesPromise) return this.app.exampleSentencesPromise;

        this.app.exampleSentencesPromise = fetch('assets/data/hsk_example_sentences.json')
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((sentences) => {
                this.app.exampleSentences = sentences;
                this.app.logDebug('[SENTENCES] Loaded dynamic example sentences database');
                return sentences;
            })
            .catch((error) => {
                this.app.logWarn('[SENTENCES] Failed to load example sentences:', error);
                this.app.exampleSentences = {};
                // Se limpia para que un fallo de red se pueda reintentar en la
                // próxima carga de vocabulario en vez de quedar sin ejemplos
                // por el resto de la sesión.
                this.app.exampleSentencesPromise = null;
                return {};
            });

        return this.app.exampleSentencesPromise;
    }

    loadClassifierMap() {
        if (this.app.classifierMapPromise) return this.app.classifierMapPromise;

        this.app.classifierMapPromise = fetch('assets/data/measure-words-sentences.json')
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((data) => {
                const map = {};
                (data.quantifiers || []).forEach((q) => {
                    (q.commonNouns || []).forEach((noun) => {
                        if (!map[noun.hanzi]) map[noun.hanzi] = [];
                        if (!map[noun.hanzi].some((existing) => existing.hanzi === q.hanzi)) {
                            map[noun.hanzi].push({
                                qId: q.id,
                                hanzi: q.hanzi,
                                pinyin: q.pinyin,
                                category: q.category,
                                es: q.es,
                                en: q.en,
                                ru: q.ru,
                                th: q.th
                            });
                        }
                    });
                });
                this.app.classifierMap = map;
                this.app.logDebug('[CLASSIFIERS] Loaded dynamic classifier map:', Object.keys(map).length, 'nouns');
                return map;
            })
            .catch((error) => {
                this.app.logWarn('[CLASSIFIERS] Failed to load classifier map:', error);
                this.app.classifierMap = {};
                this.app.classifierMapPromise = null;
                return {};
            });

        return this.app.classifierMapPromise;
    }

    createFallbackVocabulary() {
        this.app.vocabulary = [
            { character: '你', pinyin: 'nǐ', english: 'you', translation: 'tú', level: 1 },
            { character: '好', pinyin: 'hǎo', english: 'good', translation: 'bueno', level: 1 },
            { character: '我', pinyin: 'wǒ', english: 'I/me', translation: 'yo', level: 1 },
            { character: '是', pinyin: 'shì', english: 'to be', translation: 'ser/estar', level: 1 },
            { character: '的', pinyin: 'de', english: 'possessive particle', translation: 'de (partícula)', level: 1 },
            { character: '不', pinyin: 'bù', english: 'not', translation: 'no', level: 1 },
            { character: '在', pinyin: 'zài', english: 'at/in', translation: 'en/estar', level: 1 },
            { character: '有', pinyin: 'yǒu', english: 'to have', translation: 'tener', level: 1 },
            { character: '人', pinyin: 'rén', english: 'person', translation: 'persona', level: 1 },
            { character: '这', pinyin: 'zhè', english: 'this', translation: 'este/esta', level: 1 }
        ];

        this.app.logDebug('[✓] Fallback vocabulary created');
    }

    loadUserPreferences() {
        if (!this.app.userProgress) {
            return;
        }

        const preferences = this.app.userProgress.getPreferences();

        if (preferences.language && preferences.language !== this.app.currentLanguage) {
            if (window.languageManager) {
                window.languageManager.setLanguage(preferences.language);
                this.app.currentLanguage = preferences.language;
            }
        }

        if (preferences.practiceMode) {
            this.app.practiceMode = preferences.practiceMode;
        }

        if (preferences.practiceOrderMode && ['lesson', 'mixed', 'srs'].includes(preferences.practiceOrderMode)) {
            this.app.practiceOrderMode = preferences.practiceOrderMode;
            const practiceOrderSelect = document.getElementById('practice-order-mode');
            if (practiceOrderSelect) {
                practiceOrderSelect.value = preferences.practiceOrderMode;
            }
        }

        if (preferences.currentLevel) {
            this.app.currentLevel = preferences.currentLevel;
        }

        if (preferences.isDarkMode !== undefined) {
            this.app.isDarkMode = preferences.isDarkMode;
        }

        if (preferences.isAudioEnabled !== undefined) {
            this.app.isAudioEnabled = preferences.isAudioEnabled;
        }

        this.app.logDebug('[✓] User preferences loaded:', preferences);
    }
}

window.VocabularyController = VocabularyController;
