class VocabularyController {
    constructor(app) {
        this.app = app;
    }

    /**
     * Load all 6 level split files in parallel and merge.
     * Split files have lesson metadata and canonical order pre-computed —
     * no secondary fetches needed.
     */
    async loadAllLevelsSplit(lang) {
        const levels = [1, 2, 3, 4, 5, 6];
        const suffix = lang === 'es' ? 'es' : 'en';
        const results = await Promise.all(
            levels.map(async (level) => {
                try {
                    const response = await fetch(`assets/data/vocab/hsk${level}_${suffix}.json`);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    this.app.logWarn(`[LOAD] Failed to load HSK${level} (${suffix}):`, error);
                    return [];
                }
            })
        );

        const vocabulary = results.flat();
        if (vocabulary.length === 0) {
            throw new Error('No vocabulary level files could be loaded');
        }
        return vocabulary;
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
            this.app.logInfo('[LOAD] Starting lazy load for ' + targetLanguage + ' vocabulary…');

            try {
                // Use pre-split files: lesson metadata + canonical order already embedded.
                // Eliminates secondary fetches for EN canonical order (ES mode) and lesson-order map.
                this.app.vocabulary = await this.loadAllLevelsSplit(targetLanguage);

                if (targetLanguage !== 'es') {
                    this.app.vocabulary = this.app.vocabulary.map((word) => ({
                        ...word,
                        english: word.translation || word.english,
                        spanish: word.spanish || null
                    }));
                }

                // Load example sentences
                try {
                    const sentencesResponse = await fetch('assets/data/hsk_example_sentences.json');
                    if (sentencesResponse.ok) {
                        this.app.exampleSentences = await sentencesResponse.json();
                        this.app.logInfo('[SENTENCES] Loaded dynamic example sentences database');
                    } else {
                        this.app.exampleSentences = {};
                    }
                } catch (sentencesError) {
                    this.app.logWarn('[SENTENCES] Failed to load example sentences:', sentencesError);
                    this.app.exampleSentences = {};
                }

                this.app.logInfo('[OK] Loaded ' + this.app.vocabulary.length + ' items');
                this.app.vocabularyLoaded = true;
                this.app.vocabularyLoading = false;

                window.dispatchEvent(new CustomEvent('hsk:vocabulary-ready'));

                if (this.app.uiController && this.app.uiController.activeTab === 'stats') {
                    this.app.updateStats();
                }

                return this.app.vocabulary;
            } catch (error) {
                this.app.logError('[✗] Error loading ' + targetLanguage + ':', error);

                // Última red: mini-vocabulario embebido para que la UI no quede
                // vacía. Los splits están precacheados por el SW; si fallan,
                // ningún otro fetch al mismo origen va a funcionar.
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
