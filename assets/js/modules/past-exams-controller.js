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

    async startExam() {
        await this.initialize();

        const level = this.getSelectValue('past-exam-level', 'all');
        const section = this.getSelectValue('past-exam-section', 'all');
        const requestedCount = parseInt(this.getSelectValue('past-exam-questions', '10'), 10) || 10;

        const bank = Array.isArray(this.app.pastExamQuestionBank) ? this.app.pastExamQuestionBank : [];
        const filtered = bank.filter((item) => {
            const matchesLevel = level === 'all' || String(item.hskLevel) === String(level);
            const matchesSection = section === 'all' || item.sectionType === section;
            const noAudioRequired = item.audioRequired !== true;
            return matchesLevel && matchesSection && noAudioRequired;
        });

        if (filtered.length === 0) {
            this.app.showToast(this.app.getTranslation('pastExamsNoQuestions') || 'No questions available for this filter', 'warning', 2400);
            return;
        }

        const randomized = this.shuffle([...filtered]);
        this.state.questions = randomized.slice(0, Math.min(requestedCount, randomized.length));
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.selectedAnswer = null;
        this.state.correctAnswer = null;
        this.state.isActive = true;

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
