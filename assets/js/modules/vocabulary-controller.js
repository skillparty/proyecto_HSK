class VocabularyController {
    constructor(app) {
        this.app = app;
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
            this.app.logInfo('[LOAD] Starting lazy load for ' + targetLanguage + ' vocabulary...');

            try {
                let vocabularyFile;
                let isSpanishStructure = false;

                if (targetLanguage === 'es') {
                    vocabularyFile = 'assets/data/hsk_vocabulary_spanish.json';
                    isSpanishStructure = true;
                } else {
                    vocabularyFile = 'assets/data/hsk_vocabulary.json';
                }

                const response = await fetch(vocabularyFile);
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }

                this.app.vocabulary = await response.json();

                if (!isSpanishStructure) {
                    this.app.vocabulary = this.app.vocabulary.map((word) => ({
                        ...word,
                        english: word.translation || word.english,
                        spanish: word.spanish || null
                    }));
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

                try {
                    const fallbackFile = targetLanguage === 'es'
                        ? 'assets/data/hsk_vocabulary.json'
                        : 'assets/data/hsk_vocabulary_spanish.json';
                    const fallbackResponse = await fetch(fallbackFile);

                    if (fallbackResponse.ok) {
                        this.app.vocabulary = await fallbackResponse.json();
                        if (targetLanguage === 'es' && fallbackFile === 'assets/data/hsk_vocabulary.json') {
                            this.app.vocabulary = this.app.vocabulary.map((word) => ({
                                ...word,
                                english: word.translation || word.english,
                                spanish: word.translation || word.english
                            }));
                        }
                    } else {
                        throw new Error('No fallback available');
                    }
                } catch (_fallbackError) {
                    this.app.vocabulary = [
                        { character: '你好', pinyin: 'nǐ hǎo', english: 'hello', spanish: 'hola', level: 1 },
                        { character: '谢谢', pinyin: 'xiè xiè', english: 'thank you', spanish: 'gracias', level: 1 }
                    ];
                }

                this.app.vocabularyLoaded = true;
                this.app.vocabularyLoading = false;
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
