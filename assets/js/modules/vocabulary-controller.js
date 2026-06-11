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

    async mergeLessonOrderMap(vocabulary) {
        try {
            const response = await fetch('assets/data/hsk_lesson_order_map.json');
            if (!response.ok) {
                this.app.logWarn('[ORDER] Could not load lesson order map');
                return vocabulary;
            }

            const mapData = await response.json();
            const entries = Array.isArray(mapData) ? mapData : (mapData.entries || []);
            if (entries.length === 0) {
                return vocabulary;
            }

            // Build a lookup from the map: key = "normalizedChar::normalizedPinyin" → entry
            const mapByCP = new Map();
            for (const entry of entries) {
                if (!entry.character || !entry.pinyin || !entry.lesson) continue;
                const key = this.makeCPKey(entry);
                if (!mapByCP.has(key)) {
                    mapByCP.set(key, []);
                }
                mapByCP.get(key).push(entry);
            }

            let merged = 0;
            const result = vocabulary.map((word) => {
                // Skip words that already have lesson metadata
                if (word.lesson !== undefined && word.lessonOrder !== undefined) {
                    return word;
                }

                const key = this.makeCPKey(word);
                const candidates = mapByCP.get(key);
                if (!candidates || candidates.length === 0) {
                    return word;
                }

                // Match by level first, then by english gloss
                const wordLevel = Number(word.level || 0);
                let match = candidates.find(c => Number(c.level || 0) === wordLevel);
                if (!match && candidates.length === 1) {
                    match = candidates[0];
                }
                if (!match) {
                    // Try matching by english gloss
                    const wordGloss = this.normalizeGloss(word.english || word.translation || '');
                    match = candidates.find(c =>
                        this.normalizeGloss(c.english || c.translation || '') === wordGloss
                    );
                }
                if (!match) {
                    match = candidates[0]; // fallback to first candidate
                }

                merged++;
                return {
                    ...word,
                    book: match.book || word.book,
                    lesson: Number(match.lesson),
                    lessonOrder: Number(match.lessonOrder || 0)
                };
            });

            this.app.logInfo(`[ORDER] Merged lesson metadata for ${merged} words from order map`);
            return result;
        } catch (error) {
            this.app.logWarn('[ORDER] Failed to merge lesson order map:', error);
            return vocabulary;
        }
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

    /**
     * Load all 6 level split files in parallel and merge.
     * Split files have lesson metadata and canonical order pre-computed —
     * no secondary fetches needed.
     */
    async loadAllLevelsSplit(lang) {
        const levels = [1, 2, 3, 4, 5, 6];
        const suffix = lang === 'es' ? 'es' : 'en';
        const results = await Promise.all(
            levels.map(l => fetch(`assets/data/vocab/hsk${l}_${suffix}.json`).then(r => r.ok ? r.json() : []))
        );
        return results.flat();
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

                // Fallback: monolithic files with legacy post-processing
                try {
                    const fallbackFile = targetLanguage === 'es'
                        ? 'assets/data/hsk_vocabulary_spanish.json'
                        : 'assets/data/hsk_vocabulary.json';
                    const fallbackResponse = await fetch(fallbackFile);

                    if (!fallbackResponse.ok) throw new Error('No fallback available');

                    this.app.vocabulary = await fallbackResponse.json();
                    if (targetLanguage !== 'es') {
                        this.app.vocabulary = this.app.vocabulary.map((word) => ({
                            ...word,
                            english: word.translation || word.english,
                            spanish: word.spanish || null
                        }));
                    }
                    this.app.vocabulary = await this.mergeLessonOrderMap(this.app.vocabulary);
                    this.app.vocabulary = await this.attachCanonicalStudyOrder(this.app.vocabulary, targetLanguage);
                } catch (_fallbackError) {
                    this.app.vocabulary = [
                        { character: '你好', pinyin: 'nǐ hǎo', english: 'hello', spanish: 'hola', level: 1 },
                        { character: '谢谢', pinyin: 'xiè xiè', english: 'thank you', spanish: 'gracias', level: 1 }
                    ];
                }

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
