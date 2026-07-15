/**
 * PastExamsQuestionBank - loads the static question bank + vocabulary and
 * builds exam question sets: static-first selection, procedural generation
 * from vocabulary when a level/section is short, then repeat-fill as a last
 * resort. Pure data/logic, no DOM and no quiz-session state — extracted from
 * PastExamsController, which owns the interactive session on top of it.
 */
class PastExamsQuestionBank {
    constructor(app) {
        this.app = app;
    }

    async ensureQuestionBankLoaded() {
        if (Array.isArray(this.app.pastExamQuestionBank) && this.app.pastExamQuestionBank.length > 0) {
            return this.app.pastExamQuestionBank;
        }

        const response = await fetch('assets/data/hsk_past_exams.json');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const payload = await response.json();
        this.app.pastExamQuestionBank = Array.isArray(payload) ? payload : [];
        return this.app.pastExamQuestionBank;
    }

    async ensureVocabularyLoaded() {
        if (Array.isArray(this.app.vocabulary) && this.app.vocabulary.length > 0) {
            return this.app.vocabulary;
        }

        if (typeof this.app.loadVocabulary === 'function') {
            try {
                await this.app.loadVocabulary();
            } catch (error) {
                this.app.logWarn?.('[past-exams] Could not load vocabulary for generated questions:', error);
            }
        }

        return Array.isArray(this.app.vocabulary) ? this.app.vocabulary : [];
    }

    normalizeRequestedCount(value) {
        const parsed = parseInt(String(value || ''), 10);
        const allowed = new Set([5, 10, 20]);
        return allowed.has(parsed) ? parsed : 10;
    }

    getSelectionStages(level, section) {
        const rawStages = [
            { level, section },
            { level, section: 'all' },
            { level: 'all', section },
            { level: 'all', section: 'all' }
        ];

        const seen = new Set();
        const uniqueStages = [];
        rawStages.forEach((stage) => {
            const normalizedLevel = stage.level || 'all';
            const normalizedSection = stage.section || 'all';
            const key = `${normalizedLevel}:${normalizedSection}`;
            if (seen.has(key)) {
                return;
            }

            seen.add(key);
            uniqueStages.push({
                level: normalizedLevel,
                section: normalizedSection
            });
        });

        return uniqueStages;
    }

    getFilteredStaticQuestions(level, section) {
        const bank = Array.isArray(this.app.pastExamQuestionBank) ? this.app.pastExamQuestionBank : [];
        return bank.filter((item) => {
            const matchesLevel = level === 'all' || String(item.hskLevel) === String(level);
            const matchesSection = section === 'all' || item.sectionType === section;
            const noAudioRequired = item.audioRequired !== true;
            return matchesLevel && matchesSection && noAudioRequired;
        });
    }

    getVocabularyPool(level) {
        const vocabulary = Array.isArray(this.app.vocabulary) ? this.app.vocabulary : [];
        const filtered = vocabulary.filter((word) => {
            if (!word || !word.character || !word.pinyin) {
                return false;
            }

            return level === 'all' || String(word.level) === String(level);
        });

        const seen = new Set();
        return filtered.filter((word) => {
            const uniqueKey = [
                String(word.character || '').trim(),
                String(word.pinyin || '').trim(),
                String(word.english || word.translation || '').trim()
            ].join('|');

            if (seen.has(uniqueKey)) {
                return false;
            }

            seen.add(uniqueKey);
            return true;
        });
    }

    cleanMeaning(value) {
        const raw = String(value || '').trim();
        if (!raw) {
            return '';
        }

        const firstPipe = raw.split('|')[0] || raw;
        const firstSemicolon = firstPipe.split(';')[0] || firstPipe;
        return firstSemicolon.trim() || raw;
    }

    getWordMeaning(word, lang) {
        const english = this.cleanMeaning(word?.english || word?.translation || '');
        const spanish = this.cleanMeaning(word?.spanish || '');

        if (lang === 'es') {
            return spanish || english || '?';
        }

        return english || spanish || '?';
    }

    createLocalizedLabel(esValue, enValue) {
        return {
            es: String(esValue || '').trim(),
            en: String(enValue || '').trim()
        };
    }

    buildOptions(correctLabel, wrongLabels) {
        const options = [];
        const seen = new Set();

        const addOption = (label, isCorrect) => {
            const key = `${String(label?.es || '').trim()}|${String(label?.en || '').trim()}`;
            if (!label || !label.es || !label.en || seen.has(key)) {
                return;
            }

            seen.add(key);
            options.push({
                label,
                isCorrect
            });
        };

        addOption(correctLabel, true);
        wrongLabels.forEach((label) => addOption(label, false));

        if (options.length < 4) {
            return null;
        }

        const shuffled = this.shuffle([...options]).slice(0, 4);
        const letterKeys = ['A', 'B', 'C', 'D'];
        const formatted = shuffled.map((option, index) => ({
            key: letterKeys[index],
            label: option.label,
            isCorrect: option.isCorrect
        }));
        const correct = formatted.find((option) => option.isCorrect);

        if (!correct) {
            return null;
        }

        return {
            answer: correct.key,
            options: formatted.map((option) => ({
                key: option.key,
                label: option.label
            }))
        };
    }

    collectDistractorWords(vocabularyPool, currentWord, valueGetter, count) {
        const distractors = [];
        const seenValues = new Set();
        const currentValue = valueGetter(currentWord);

        const shuffled = this.shuffle([...vocabularyPool]);
        shuffled.forEach((candidate) => {
            if (distractors.length >= count || candidate === currentWord) {
                return;
            }

            const value = valueGetter(candidate);
            if (!value || value === currentValue || seenValues.has(value)) {
                return;
            }

            seenValues.add(value);
            distractors.push(candidate);
        });

        return distractors;
    }

    createGeneratedQuestion(word, sectionType, vocabularyPool, index) {
        const character = String(word.character || '').trim();
        const pinyin = String(word.pinyin || '').trim();
        if (!character || !pinyin) {
            return null;
        }

        const meaningEs = this.getWordMeaning(word, 'es');
        const meaningEn = this.getWordMeaning(word, 'en');

        if (sectionType === 'writing') {
            const distractors = this.collectDistractorWords(vocabularyPool, word, (item) => String(item.character || '').trim(), 3);
            const wrongLabels = distractors.map((item) => this.createLocalizedLabel(item.character, item.character));
            const optionSet = this.buildOptions(
                this.createLocalizedLabel(character, character),
                wrongLabels
            );

            if (!optionSet) {
                return null;
            }

            return {
                id: `generated-writing-${word.level}-${index}-${this.hashText(character + pinyin)}`,
                hskLevel: Number(word.level) || 1,
                examSetId: 'generated-vocabulary',
                sectionType: 'writing',
                audioRequired: false,
                prompt: {
                    es: `Selecciona el caracter correcto para: ${meaningEs} (${pinyin})`,
                    en: `Select the correct character for: ${meaningEn} (${pinyin})`
                },
                hint: {
                    es: 'Pregunta generada desde el vocabulario del nivel.',
                    en: 'Question generated from level vocabulary.'
                },
                options: optionSet.options,
                answer: optionSet.answer
            };
        }

        if (sectionType === 'grammar') {
            const distractors = this.collectDistractorWords(vocabularyPool, word, (item) => String(item.pinyin || '').trim(), 3);
            const wrongLabels = distractors.map((item) => this.createLocalizedLabel(item.pinyin, item.pinyin));
            const optionSet = this.buildOptions(
                this.createLocalizedLabel(pinyin, pinyin),
                wrongLabels
            );

            if (!optionSet) {
                return null;
            }

            return {
                id: `generated-grammar-${word.level}-${index}-${this.hashText(character + pinyin)}`,
                hskLevel: Number(word.level) || 1,
                examSetId: 'generated-vocabulary',
                sectionType: 'grammar',
                audioRequired: false,
                prompt: {
                    es: `Selecciona el pinyin correcto para: ${character}`,
                    en: `Select the correct pinyin for: ${character}`
                },
                hint: {
                    es: `Significado: ${meaningEs}`,
                    en: `Meaning: ${meaningEn}`
                },
                options: optionSet.options,
                answer: optionSet.answer
            };
        }

        const distractors = this.collectDistractorWords(vocabularyPool, word, (item) => this.getWordMeaning(item, 'en'), 3);
        const wrongLabels = distractors.map((item) => this.createLocalizedLabel(
            this.getWordMeaning(item, 'es'),
            this.getWordMeaning(item, 'en')
        ));
        const optionSet = this.buildOptions(
            this.createLocalizedLabel(meaningEs, meaningEn),
            wrongLabels
        );

        if (!optionSet) {
            return null;
        }

        return {
            id: `generated-reading-${word.level}-${index}-${this.hashText(character + pinyin)}`,
            hskLevel: Number(word.level) || 1,
            examSetId: 'generated-vocabulary',
            sectionType: 'reading',
            audioRequired: false,
            prompt: {
                es: `Selecciona la traduccion correcta de ${character} (${pinyin})`,
                en: `Select the correct meaning of ${character} (${pinyin})`
            },
            hint: {
                es: 'Pregunta generada desde el vocabulario del nivel.',
                en: 'Question generated from level vocabulary.'
            },
            options: optionSet.options,
            answer: optionSet.answer
        };
    }

    buildGeneratedQuestions(level, section, requestedCount) {
        const vocabularyPool = this.getVocabularyPool(level);
        if (!vocabularyPool.length) {
            return [];
        }

        const sectionCycle = section === 'all'
            ? ['reading', 'writing', 'grammar']
            : [section];

        const candidates = this.shuffle([...vocabularyPool]);
        const generated = [];
        let cursor = 0;

        while (generated.length < requestedCount && cursor < candidates.length) {
            const word = candidates[cursor];
            const sectionType = sectionCycle[cursor % sectionCycle.length] || 'reading';
            const question = this.createGeneratedQuestion(word, sectionType, candidates, cursor);
            if (question) {
                generated.push(question);
            }
            cursor += 1;
        }

        return generated;
    }

    appendUniqueQuestions(targetQuestions, sourceQuestions, usedIds, maxCount) {
        if (targetQuestions.length >= maxCount) {
            return;
        }

        this.shuffle([...sourceQuestions]).forEach((question) => {
            if (targetQuestions.length >= maxCount) {
                return;
            }

            const questionId = String(question?.id || '');
            if (!questionId || usedIds.has(questionId)) {
                return;
            }

            usedIds.add(questionId);
            targetQuestions.push(question);
        });
    }

    fillWithRepeats(targetQuestions, requestedCount) {
        if (!targetQuestions.length || targetQuestions.length >= requestedCount) {
            return false;
        }

        const base = this.shuffle([...targetQuestions]);
        let repeatIndex = 0;

        while (targetQuestions.length < requestedCount) {
            const source = base[repeatIndex % base.length];
            const repeatRound = Math.floor(repeatIndex / base.length) + 1;
            targetQuestions.push({
                ...source,
                id: `${source.id}::repeat-${repeatRound}-${repeatIndex}`
            });
            repeatIndex += 1;
        }

        return true;
    }

    selectExamQuestions(level, section, requestedCount, config = {}) {
        const normalizedCount = this.normalizeRequestedCount(requestedCount);
        const selected = [];
        const usedIds = new Set();
        const officialOnly = config.officialOnly === true;
        let usedGenerated = false;
        let usedRepeats = false;

        const stages = this.getSelectionStages(level, section);
        stages.forEach((stage) => {
            if (selected.length >= normalizedCount) {
                return;
            }

            const staticQuestions = this.getFilteredStaticQuestions(stage.level, stage.section);
            this.appendUniqueQuestions(selected, staticQuestions, usedIds, normalizedCount);

            if (selected.length >= normalizedCount || officialOnly) {
                return;
            }

            const missing = normalizedCount - selected.length;
            const generatedQuestions = this.buildGeneratedQuestions(stage.level, stage.section, Math.max(missing * 2, missing));
            if (generatedQuestions.length > 0) {
                usedGenerated = true;
            }

            this.appendUniqueQuestions(selected, generatedQuestions, usedIds, normalizedCount);
        });

        if (selected.length > 0 && selected.length < normalizedCount) {
            usedRepeats = this.fillWithRepeats(selected, normalizedCount);
        }

        const finalQuestions = selected.slice(0, normalizedCount);

        return {
            requestedCount: normalizedCount,
            questions: finalQuestions,
            summary: this.computePoolSummary(finalQuestions),
            usedGenerated,
            usedRepeats,
            officialOnly
        };
    }

    computePoolSummary(questions) {
        const summary = {
            total: Array.isArray(questions) ? questions.length : 0,
            staticCount: 0,
            generatedCount: 0,
            repeatedCount: 0
        };

        (Array.isArray(questions) ? questions : []).forEach((question) => {
            const questionId = String(question?.id || '');
            if (questionId.includes('::repeat-')) {
                summary.repeatedCount += 1;
                return;
            }

            if (questionId.startsWith('generated-')) {
                summary.generatedCount += 1;
                return;
            }

            summary.staticCount += 1;
        });

        return summary;
    }

    hashText(value) {
        let hash = 0;
        const text = String(value || '');
        for (let index = 0; index < text.length; index += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(index);
            hash |= 0;
        }

        return Math.abs(hash);
    }

    shuffle(items) {
        for (let i = items.length - 1; i > 0; i -= 1) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
        }
        return items;
    }

}

window.PastExamsQuestionBank = PastExamsQuestionBank;
