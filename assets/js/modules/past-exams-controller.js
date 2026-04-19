class PastExamsController {
    constructor(app) {
        this.app = app;
        this.state = {
            ready: false,
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            correctAnswer: null,
            isActive: false
        };
    }

    async initialize() {
        if (this.state.ready) {
            return;
        }

        try {
            await this.ensureQuestionBankLoaded();
            this.state.ready = true;
            this.app.logDebug('[✓] Past exams module initialized');
        } catch (error) {
            this.app.logError('[✗] Failed to initialize past exams module:', error);
            this.app.showToast(this.app.getTranslation('pastExamsLoadError') || 'Could not load past exams data', 'error', 2600);
        }
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

    selectExamQuestions(level, section, requestedCount) {
        const normalizedCount = this.normalizeRequestedCount(requestedCount);
        const selected = [];
        const usedIds = new Set();
        let usedGenerated = false;
        let usedRepeats = false;

        const stages = this.getSelectionStages(level, section);
        stages.forEach((stage) => {
            if (selected.length >= normalizedCount) {
                return;
            }

            const staticQuestions = this.getFilteredStaticQuestions(stage.level, stage.section);
            this.appendUniqueQuestions(selected, staticQuestions, usedIds, normalizedCount);

            if (selected.length >= normalizedCount) {
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

        return {
            requestedCount: normalizedCount,
            questions: selected.slice(0, normalizedCount),
            usedGenerated,
            usedRepeats
        };
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

    async startExam() {
        await this.initialize();

        const level = this.getSelectValue('past-exam-level', 'all');
        const section = this.getSelectValue('past-exam-section', 'all');
        const requestedCount = this.normalizeRequestedCount(this.getSelectValue('past-exam-questions', '10'));

        const strictStaticPool = this.getFilteredStaticQuestions(level, section);
        if (strictStaticPool.length < requestedCount) {
            await this.ensureVocabularyLoaded();
        }

        const selection = this.selectExamQuestions(level, section, requestedCount);
        if (!selection.questions.length) {
            this.app.showToast(this.app.getTranslation('pastExamsNoQuestions') || 'No questions available for this filter', 'warning', 2400);
            return;
        }

        this.state.questions = selection.questions;
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.selectedAnswer = null;
        this.state.correctAnswer = null;
        this.state.isActive = true;

        if (selection.usedGenerated || selection.usedRepeats) {
            this.app.showToast(
                this.app.getTranslation('pastExamsPoolExpanded', { count: String(selection.questions.length) })
                || `Exam expanded to ${selection.questions.length} questions using adaptive pool`,
                'info',
                2400
            );
        }

        this.toggleLayout('running');
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.state.questions[this.state.currentQuestion];
        if (!question) {
            this.showResults();
            return;
        }

        this.setText('past-exam-current', String(this.state.currentQuestion + 1));
        this.setText('past-exam-total', String(this.state.questions.length));
        this.setText('past-exam-score', String(this.state.score));

        const sectionLabel = this.localizeSection(question.sectionType);
        const questionPrompt = this.localizeValue(question.prompt) || '';
        const questionHint = this.localizeValue(question.hint) || '';

        const questionHost = document.getElementById('past-exam-question');
        if (questionHost) {
            const hskLabel = this.app.getTranslation('quizHskLevel') || 'HSK Level';
            const sectionText = this.app.getTranslation('pastExamsSectionLabel') || 'Section';
            const hintMarkup = questionHint ? `<div class="past-exams-hint">${questionHint}</div>` : '';

            questionHost.innerHTML = `
                <div class="quiz-question-meta">
                    <span class="quiz-meta-pill">${hskLabel}: HSK ${question.hskLevel}</span>
                    <span class="quiz-meta-pill">${sectionText}: ${sectionLabel}</span>
                </div>
                <div class="quiz-question-text">${questionPrompt}</div>
                ${hintMarkup}
            `;
        }

        const optionsHost = document.getElementById('past-exam-options');
        if (optionsHost) {
            optionsHost.innerHTML = '';
            const options = this.localizeOptions(question.options);

            options.forEach((option) => {
                const button = document.createElement('button');
                button.className = 'quiz-option';
                button.type = 'button';
                button.textContent = option.label;
                button.dataset.optionKey = option.key;
                button.addEventListener('click', () => this.selectAnswer(option.key));
                optionsHost.appendChild(button);
            });
        }

        const submitBtn = document.getElementById('past-exam-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.display = 'inline-block';
            submitBtn.textContent = this.app.getTranslation('submit') || 'Submit';
        }

        const nextBtn = document.getElementById('past-exam-next');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }

        this.state.selectedAnswer = null;
        this.state.correctAnswer = String(question.answer || '');
    }

    selectAnswer(optionKey) {
        this.state.selectedAnswer = String(optionKey || '');

        document.querySelectorAll('#past-exam-options .quiz-option').forEach((button) => {
            const isSelected = button.dataset.optionKey === this.state.selectedAnswer;
            button.classList.toggle('selected', isSelected);
        });

        const submitBtn = document.getElementById('past-exam-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    submitAnswer() {
        if (!this.state.isActive || !this.state.selectedAnswer) {
            return;
        }

        const isCorrect = this.state.selectedAnswer === this.state.correctAnswer;
        if (isCorrect) {
            this.state.score += 1;
        }

        document.querySelectorAll('#past-exam-options .quiz-option').forEach((button) => {
            const key = button.dataset.optionKey;
            if (key === this.state.correctAnswer) {
                button.classList.add('correct');
            } else if (key === this.state.selectedAnswer && !isCorrect) {
                button.classList.add('incorrect');
            }
            button.disabled = true;
        });

        this.showFeedback(isCorrect);

        const submitBtn = document.getElementById('past-exam-submit');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }

        const nextBtn = document.getElementById('past-exam-next');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
        }

        this.setText('past-exam-score', String(this.state.score));
    }

    nextQuestion() {
        if (!this.state.isActive) {
            return;
        }

        this.state.currentQuestion += 1;
        if (this.state.currentQuestion >= this.state.questions.length) {
            this.showResults();
            return;
        }

        this.renderQuestion();
    }

    restart() {
        if (!this.state.questions.length) {
            this.toggleLayout('setup');
            return;
        }

        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.selectedAnswer = null;
        this.state.correctAnswer = null;
        this.state.isActive = true;

        this.toggleLayout('running');
        this.renderQuestion();
    }

    newExam() {
        this.state.isActive = false;
        this.toggleLayout('setup');
    }

    showResults() {
        const total = this.state.questions.length;
        const percentage = total > 0 ? Math.round((this.state.score / total) * 100) : 0;

        this.setText('past-exam-final-score', `${this.state.score}/${total}`);
        this.setText('past-exam-final-percentage', `${percentage}%`);

        this.state.isActive = false;
        this.toggleLayout('results');
    }

    refreshLanguage() {
        const runningContainer = document.getElementById('past-exams-container');
        const resultsContainer = document.getElementById('past-exams-results');
        const isRunningVisible = runningContainer && runningContainer.style.display !== 'none';
        const isResultsVisible = resultsContainer && resultsContainer.style.display !== 'none';

        if (isRunningVisible && this.state.questions.length > 0) {
            const selectedAnswer = this.state.selectedAnswer;
            const answerWasSubmitted = document.getElementById('past-exam-next')?.style.display === 'inline-block';

            this.renderQuestion();

            if (answerWasSubmitted && selectedAnswer) {
                this.state.selectedAnswer = selectedAnswer;
                const isCorrect = this.state.selectedAnswer === this.state.correctAnswer;

                document.querySelectorAll('#past-exam-options .quiz-option').forEach((button) => {
                    const key = button.dataset.optionKey;
                    const isSelected = key === this.state.selectedAnswer;
                    button.classList.toggle('selected', isSelected);

                    if (key === this.state.correctAnswer) {
                        button.classList.add('correct');
                    } else if (isSelected && !isCorrect) {
                        button.classList.add('incorrect');
                    }

                    button.disabled = true;
                });

                const submitBtn = document.getElementById('past-exam-submit');
                const nextBtn = document.getElementById('past-exam-next');
                if (submitBtn) submitBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'inline-block';
            }

            return;
        }

        if (isResultsVisible) {
            this.showResults();
        }
    }

    showFeedback(isCorrect) {
        const content = document.getElementById('past-exam-content');
        if (!content) {
            return;
        }

        const existing = document.getElementById('past-exam-feedback');
        if (existing) {
            existing.remove();
        }

        const feedback = document.createElement('div');
        feedback.id = 'past-exam-feedback';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect
            ? (this.app.getTranslation('correctQuizFeedback') || 'Correct!')
            : (this.app.getTranslation('incorrectQuizFeedback') || 'Incorrect');

        content.appendChild(feedback);

        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 1500);
    }

    localizeSection(sectionType) {
        const map = {
            reading: this.app.getTranslation('pastExamsSectionReading') || 'Reading',
            writing: this.app.getTranslation('pastExamsSectionWriting') || 'Writing',
            grammar: this.app.getTranslation('pastExamsSectionGrammar') || 'Grammar'
        };
        return map[sectionType] || sectionType;
    }

    localizeValue(value) {
        if (!value) {
            return '';
        }

        if (typeof value === 'string') {
            return value;
        }

        const lang = this.app.currentLanguage === 'es' ? 'es' : 'en';
        return value[lang] || value.en || value.es || '';
    }

    localizeOptions(options) {
        if (!Array.isArray(options)) {
            return [];
        }

        return options.map((option, index) => {
            if (typeof option === 'string') {
                return {
                    key: String(index),
                    label: option
                };
            }

            const key = option.key != null ? String(option.key) : String(index);
            return {
                key,
                label: this.localizeValue(option.label)
            };
        });
    }

    toggleLayout(mode) {
        const setup = document.getElementById('past-exams-setup');
        const container = document.getElementById('past-exams-container');
        const results = document.getElementById('past-exams-results');

        if (setup) {
            setup.style.display = mode === 'setup' ? 'block' : 'none';
        }

        if (container) {
            container.style.display = mode === 'running' ? 'block' : 'none';
        }

        if (results) {
            results.style.display = mode === 'results' ? 'block' : 'none';
        }
    }

    getSelectValue(id, fallbackValue) {
        const element = document.getElementById(id);
        if (!element) {
            return fallbackValue;
        }
        return element.value || fallbackValue;
    }

    setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    shuffle(items) {
        for (let i = items.length - 1; i > 0; i -= 1) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [items[i], items[randomIndex]] = [items[randomIndex], items[i]];
        }
        return items;
    }
}

window.PastExamsController = PastExamsController;
