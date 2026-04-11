class VocabularyController {
    constructor(app) {
        this.app = app;
    }

    normalizeText(value) {
        return String(value || '').trim();
    }

    normalizePinyin(value) {
        return this.normalizeText(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    normalizeGloss(value) {
        return this.normalizeText(value)
            .toLowerCase()
            .replace(/\s+/g, ' ');
    }

    makeCPKey(item) {
        return `${this.normalizeText(item.character)}::${this.normalizePinyin(item.pinyin)}`;
    }

    groupByCP(items) {
        return items.reduce((accumulator, item) => {
            const key = this.makeCPKey(item);
            if (!accumulator.has(key)) {
                accumulator.set(key, []);
            }
            accumulator.get(key).push(item);
            return accumulator;
        }, new Map());
    }

    resolveEnglishSourceIndex(spanishItem, englishByCP) {
        const candidates = englishByCP.get(this.makeCPKey(spanishItem)) || [];
        if (candidates.length === 0) {
            return null;
        }

        if (candidates.length === 1) {
            return candidates[0]._sourceOrder;
        }

        const targetGloss = this.normalizeGloss(spanishItem.translation || spanishItem.english);
        const byGloss = candidates.find((candidate) => (
            this.normalizeGloss(candidate.translation || candidate.english) === targetGloss
        ));

        return byGloss ? byGloss._sourceOrder : null;
    }

    async attachCanonicalStudyOrder(vocabulary, targetLanguage) {
        if (!Array.isArray(vocabulary) || vocabulary.length === 0) {
            return vocabulary;
        }

        if (targetLanguage !== 'es') {
            return vocabulary.map((item, index) => ({
                ...item,
                _sourceOrder: index
            }));
        }

        try {
            const englishResponse = await fetch('assets/data/hsk_vocabulary.json');
            if (!englishResponse.ok) {
                throw new Error('Unable to load EN source for canonical order');
            }

            const englishVocabulary = await englishResponse.json();
            const englishWithOrder = englishVocabulary.map((item, index) => ({
                ...item,
                _sourceOrder: index
            }));
            const englishByCP = this.groupByCP(englishWithOrder);

            return vocabulary.map((item, index) => {
                const sourceOrder = this.resolveEnglishSourceIndex(item, englishByCP);
                return {
                    ...item,
                    _sourceOrder: sourceOrder !== null ? sourceOrder : (100000 + index)
                };
            });
        } catch (error) {
            this.app.logWarn('[ORDER] Failed to map ES vocabulary to EN canonical order:', error);
            return vocabulary.map((item, index) => ({
                ...item,
                _sourceOrder: index
            }));
        }
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

                this.app.vocabulary = await this.attachCanonicalStudyOrder(this.app.vocabulary, targetLanguage);

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

                        this.app.vocabulary = await this.attachCanonicalStudyOrder(this.app.vocabulary, targetLanguage);
                    } else {
                        throw new Error('No fallback available');
                    }
                } catch (_fallbackError) {
                    this.app.vocabulary = [
                        { character: '你好', pinyin: 'nǐ hǎo', english: 'hello', spanish: 'hola', level: 1 },
                        { character: '谢谢', pinyin: 'xiè xiè', english: 'thank you', spanish: 'gracias', level: 1 }
                    ];
                }

                this.app.vocabulary = await this.attachCanonicalStudyOrder(this.app.vocabulary, targetLanguage);
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
