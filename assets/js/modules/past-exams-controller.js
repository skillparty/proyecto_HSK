class PastExamsController {
    constructor(app) {
        this.app = app;
        this.questionBank = new window.PastExamsQuestionBank(app);
        this.state = {
            ready: false,
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            correctAnswer: null,
            isActive: false,
            isSimulationMode: true,
            userAnswers: {},
            flaggedQuestions: new Set(),
            timerSeconds: 0,
            timerInterval: null,
            audioPlayCount: 0,
            maxAudioPlays: 2,
            mistakes: [],
            history: [],
            examConfig: {
                officialOnly: false,
                simulationMode: true,
                timeLimit: 'auto',
                level: 'all',
                section: 'all'
            },
            poolSummary: {
                total: 0,
                staticCount: 0,
                generatedCount: 0,
                repeatedCount: 0
            }
        };
        this.listenersAttached = false;
    }

    async initialize() {
        this.setupEventListeners();

        if (this.state.ready) {
            return;
        }

        try {
            await this.questionBank.ensureQuestionBankLoaded();
            this.state.ready = true;
            this.app.logDebug?.('[✓] Past exams module initialized');
        } catch (error) {
            this.app.logError?.('[✗] Failed to initialize past exams module:', error);
            this.app.showToast(this.app.getTranslation('pastExamsLoadError') || 'Could not load past exams data', 'error', 2600);
        }
    }

    setupEventListeners() {
        if (this.listenersAttached) {
            return;
        }

        const prevBtn = document.getElementById('past-exam-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }

        const flagBtn = document.getElementById('past-exam-flag-btn');
        if (flagBtn) {
            flagBtn.addEventListener('click', () => this.toggleFlagQuestion());
        }

        const finishBtn = document.getElementById('past-exam-finish-btn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishExamPrompt());
        }

        const playAudioBtn = document.getElementById('past-exam-play-audio-btn');
        if (playAudioBtn) {
            playAudioBtn.addEventListener('click', () => this.playCurrentAudio());
        }

        const retryMistakesBtn = document.getElementById('past-exam-retry-mistakes');
        if (retryMistakesBtn) {
            retryMistakesBtn.addEventListener('click', () => this.retryMistakes());
        }

        const viewCertBtn = document.getElementById('past-exam-view-cert');
        if (viewCertBtn) {
            viewCertBtn.addEventListener('click', () => this.showCertificateModal());
        }

        const certCloseBtn = document.getElementById('past-exam-cert-close');
        if (certCloseBtn) {
            certCloseBtn.addEventListener('click', () => this.closeCertificateModal());
        }

        const certModal = document.getElementById('past-exam-cert-modal');
        if (certModal) {
            certModal.addEventListener('click', (event) => {
                if (event.target === certModal) {
                    this.closeCertificateModal();
                }
            });
        }

        const simModeCheckbox = document.getElementById('past-exam-sim-mode');
        const timerGroup = document.getElementById('past-exam-timer-group');
        if (simModeCheckbox && timerGroup) {
            simModeCheckbox.addEventListener('change', () => {
                timerGroup.style.display = simModeCheckbox.checked ? 'flex' : 'none';
            });
        }

        this.listenersAttached = true;
    }

    async startExam(overrideQuestions = null) {
        await this.initialize();

        let questionsToUse = [];
        let summary = null;
        let officialOnly = false;
        let isSimMode = true;
        let timeLimit = 'auto';
        let level = 'all';
        let section = 'all';

        if (Array.isArray(overrideQuestions) && overrideQuestions.length > 0) {
            questionsToUse = [...overrideQuestions];
            summary = this.questionBank.computePoolSummary(questionsToUse);
            isSimMode = this.state.isSimulationMode;
            officialOnly = this.state.examConfig.officialOnly;
            level = this.state.examConfig.level;
            section = this.state.examConfig.section;
            timeLimit = this.state.examConfig.timeLimit;
        } else {
            level = this.getSelectValue('past-exam-level', 'all');
            section = this.getSelectValue('past-exam-section', 'all');
            const requestedCount = this.questionBank.normalizeRequestedCount(this.getSelectValue('past-exam-questions', '10'));
            officialOnly = this.getCheckboxValue('past-exam-official-only', false);
            isSimMode = this.getCheckboxValue('past-exam-sim-mode', true);
            timeLimit = this.getSelectValue('past-exam-time-limit', 'auto');

            const strictStaticPool = this.questionBank.getFilteredStaticQuestions(level, section);
            if (!officialOnly && strictStaticPool.length < requestedCount) {
                await this.questionBank.ensureVocabularyLoaded();
            }

            const selection = this.questionBank.selectExamQuestions(level, section, requestedCount, { officialOnly });
            if (!selection.questions.length) {
                this.app.showToast(this.app.getTranslation('pastExamsNoQuestions') || 'No questions available for this filter', 'warning', 2400);
                return;
            }

            questionsToUse = selection.questions;
            summary = selection.summary || this.questionBank.computePoolSummary(selection.questions);

            if (selection.usedGenerated) {
                this.app.showToast(
                    this.app.getTranslation('pastExamsPoolExpanded', { count: String(selection.questions.length) })
                    || `Exam expanded to ${selection.questions.length} questions using adaptive pool`,
                    'info',
                    2400
                );
            } else if (selection.usedRepeats) {
                const messageKey = officialOnly ? 'pastExamsPoolExpandedOfficial' : 'pastExamsPoolExpandedRepeats';
                this.app.showToast(
                    this.app.getTranslation(messageKey, { count: String(selection.questions.length) })
                    || `Exam expanded to ${selection.questions.length} questions with repeated items`,
                    'info',
                    2400
                );
            }
        }

        this.stopTimer();

        this.state.questions = questionsToUse;
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.selectedAnswer = null;
        this.state.correctAnswer = null;
        this.state.isActive = true;
        this.state.isSimulationMode = isSimMode;
        this.state.userAnswers = {};
        this.state.flaggedQuestions = new Set();
        this.state.audioPlayCount = 0;
        this.state.mistakes = [];
        this.state.history = [];
        this.state.examConfig = {
            officialOnly,
            simulationMode: isSimMode,
            timeLimit,
            level,
            section
        };
        this.state.poolSummary = summary;

        // Configure timer in simulation mode
        if (isSimMode && timeLimit !== 'none') {
            let totalSeconds = 600; // default 10 min
            if (timeLimit === 'auto') {
                // Official pacing: ~1.5 minutes per question
                totalSeconds = Math.max(300, Math.round(questionsToUse.length * 90));
            } else {
                const parsed = parseInt(timeLimit, 10);
                totalSeconds = Number.isFinite(parsed) && parsed > 0 ? parsed * 60 : 600;
            }
            this.startTimer(totalSeconds);
        } else {
            const timerBadge = document.getElementById('past-exam-timer-badge');
            if (timerBadge) {
                timerBadge.style.display = 'none';
            }
        }

        // Adjust UI controls for Simulation vs Practice mode
        const navWrapper = document.getElementById('past-exam-nav-wrapper');
        const flagBtn = document.getElementById('past-exam-flag-btn');
        const prevBtn = document.getElementById('past-exam-prev');
        const nextBtn = document.getElementById('past-exam-next');
        const submitBtn = document.getElementById('past-exam-submit');
        const finishBtn = document.getElementById('past-exam-finish-btn');
        const scoreLabel = document.getElementById('past-exam-score-label');
        const scoreVal = document.getElementById('past-exam-score');

        if (navWrapper) navWrapper.style.display = isSimMode ? 'block' : 'none';
        if (flagBtn) flagBtn.style.display = isSimMode ? 'inline-block' : 'none';
        if (prevBtn) prevBtn.style.display = isSimMode ? 'inline-block' : 'none';
        if (nextBtn) nextBtn.style.display = isSimMode ? 'inline-block' : 'none';
        if (submitBtn) submitBtn.style.display = isSimMode ? 'none' : 'inline-block';
        if (finishBtn) finishBtn.style.display = isSimMode ? 'inline-block' : 'none';

        if (isSimMode) {
            if (scoreLabel) scoreLabel.textContent = this.app.getTranslation('pastExamsAnsweredLabel') || 'Answered';
            if (scoreVal) scoreVal.textContent = `0/${questionsToUse.length}`;
        } else {
            if (scoreLabel) scoreLabel.textContent = this.app.getTranslation('score') || 'Score';
            if (scoreVal) scoreVal.textContent = '0';
        }

        this.renderNavGrid();
        this.toggleLayout('running');
        this.renderQuestion();
    }

    renderNavGrid() {
        const grid = document.getElementById('past-exam-nav-grid');
        if (!grid) {
            return;
        }

        grid.innerHTML = '';
        const total = this.state.questions.length;

        for (let i = 0; i < total; i += 1) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'past-exam-grid-btn';
            btn.textContent = String(i + 1);
            btn.dataset.questionIndex = String(i);

            if (i === this.state.currentQuestion) {
                btn.classList.add('current');
            }
            if (this.state.userAnswers[i] != null) {
                btn.classList.add('answered');
            }
            if (this.state.flaggedQuestions.has(i)) {
                btn.classList.add('flagged');
            }

            btn.addEventListener('click', () => {
                this.goToQuestion(i);
            });

            grid.appendChild(btn);
        }
    }

    updateNavGrid() {
        const buttons = document.querySelectorAll('#past-exam-nav-grid .past-exam-grid-btn');
        buttons.forEach((btn) => {
            const index = parseInt(btn.dataset.questionIndex, 10);
            btn.classList.toggle('current', index === this.state.currentQuestion);
            btn.classList.toggle('answered', this.state.userAnswers[index] != null);
            btn.classList.toggle('flagged', this.state.flaggedQuestions.has(index));
        });

        if (this.state.isSimulationMode) {
            const answeredCount = Object.keys(this.state.userAnswers).length;
            this.setText('past-exam-score', `${answeredCount}/${this.state.questions.length}`);
        }
    }

    renderQuestion() {
        const question = this.state.questions[this.state.currentQuestion];
        if (!question) {
            this.showResults();
            return;
        }

        this.setText('past-exam-current', String(this.state.currentQuestion + 1));
        this.setText('past-exam-total', String(this.state.questions.length));
        this.renderPoolSummary();
        this.updateNavGrid();

        // Audio configuration
        this.state.audioPlayCount = 0;
        const isAudio = Boolean(question.audioRequired || question.sectionType === 'listening' || question.audioText);
        const audioContainer = document.getElementById('past-exam-audio-container');
        if (audioContainer) {
            audioContainer.style.display = isAudio ? 'flex' : 'none';
            if (isAudio) {
                const maxPlays = (question.hskLevel <= 3) ? 2 : 1;
                this.state.maxAudioPlays = maxPlays;
                this.setText('past-exam-audio-plays', `(0 / ${maxPlays})`);
                const playBtn = document.getElementById('past-exam-play-audio-btn');
                if (playBtn) playBtn.disabled = false;
            }
        }

        // Section and meta labels
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
                button.textContent = `${option.key}. ${option.label}`;
                button.dataset.optionKey = option.key;

                if (this.state.isSimulationMode) {
                    const savedAnswer = this.state.userAnswers[this.state.currentQuestion];
                    if (savedAnswer === option.key) {
                        button.classList.add('selected');
                    }
                }

                button.addEventListener('click', () => this.selectAnswer(option.key));
                optionsHost.appendChild(button);
            });
        }

        // Navigation buttons state
        if (this.state.isSimulationMode) {
            const prevBtn = document.getElementById('past-exam-prev');
            if (prevBtn) {
                prevBtn.disabled = (this.state.currentQuestion === 0);
            }

            const nextBtn = document.getElementById('past-exam-next');
            if (nextBtn) {
                nextBtn.disabled = (this.state.currentQuestion === this.state.questions.length - 1);
            }

            const flagBtn = document.getElementById('past-exam-flag-btn');
            if (flagBtn) {
                const isFlagged = this.state.flaggedQuestions.has(this.state.currentQuestion);
                flagBtn.classList.toggle('active', isFlagged);
                flagBtn.textContent = isFlagged
                    ? (this.app.getTranslation('pastExamsQuestionFlagged') || '🚩 Marcada para revisar')
                    : (this.app.getTranslation('pastExamsFlagQuestion') || '🚩 Marcar para revisar');
            }
        } else {
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
        }

        this.state.correctAnswer = String(question.answer || '');
    }

    selectAnswer(optionKey) {
        if (!this.state.isActive) {
            return;
        }

        if (this.state.isSimulationMode) {
            this.state.userAnswers[this.state.currentQuestion] = String(optionKey || '');

            document.querySelectorAll('#past-exam-options .quiz-option').forEach((button) => {
                const isSelected = button.dataset.optionKey === String(optionKey);
                button.classList.toggle('selected', isSelected);
            });

            this.updateNavGrid();
            return;
        }

        // Practice Mode logic
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

    toggleFlagQuestion() {
        if (!this.state.isActive) {
            return;
        }

        const curr = this.state.currentQuestion;
        if (this.state.flaggedQuestions.has(curr)) {
            this.state.flaggedQuestions.delete(curr);
        } else {
            this.state.flaggedQuestions.add(curr);
        }

        const flagBtn = document.getElementById('past-exam-flag-btn');
        if (flagBtn) {
            const isFlagged = this.state.flaggedQuestions.has(curr);
            flagBtn.classList.toggle('active', isFlagged);
            flagBtn.textContent = isFlagged
                ? (this.app.getTranslation('pastExamsQuestionFlagged') || '🚩 Marcada para revisar')
                : (this.app.getTranslation('pastExamsFlagQuestion') || '🚩 Marcar para revisar');
        }

        this.updateNavGrid();
    }

    goToQuestion(index) {
        if (!this.state.isActive || index < 0 || index >= this.state.questions.length) {
            return;
        }

        this.state.currentQuestion = index;
        this.renderQuestion();
    }

    prevQuestion() {
        if (!this.state.isActive || this.state.currentQuestion <= 0) {
            return;
        }

        this.state.currentQuestion -= 1;
        this.renderQuestion();
    }

    nextQuestion() {
        if (!this.state.isActive) {
            return;
        }

        if (this.state.isSimulationMode) {
            if (this.state.currentQuestion < this.state.questions.length - 1) {
                this.state.currentQuestion += 1;
                this.renderQuestion();
            }
            return;
        }

        // Practice Mode
        this.state.currentQuestion += 1;
        if (this.state.currentQuestion >= this.state.questions.length) {
            this.showResults();
            return;
        }

        this.renderQuestion();
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

    playCurrentAudio() {
        const question = this.state.questions[this.state.currentQuestion];
        if (!question) {
            return;
        }

        const textToPlay = String(question.audioText || question.prompt?.zh || question.character || '').trim();
        if (!textToPlay) {
            return;
        }

        if (this.state.audioPlayCount >= this.state.maxAudioPlays) {
            this.app.showToast(this.app.getTranslation('pastExamsAudioLimitReached') || 'Play limit reached for this question', 'warning', 2000);
            return;
        }

        this.state.audioPlayCount += 1;
        this.setText('past-exam-audio-plays', `(${this.state.audioPlayCount} / ${this.state.maxAudioPlays})`);

        if (this.state.audioPlayCount >= this.state.maxAudioPlays) {
            const playBtn = document.getElementById('past-exam-play-audio-btn');
            if (playBtn) playBtn.disabled = true;
        }

        if (this.app.audioController && typeof this.app.audioController.playWordAudio === 'function') {
            this.app.audioController.playWordAudio(textToPlay);
            return;
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function') {
            try {
                window.speechSynthesis.cancel();
                const utter = new window.SpeechSynthesisUtterance(textToPlay);
                utter.lang = 'zh-CN';
                utter.rate = question.hskLevel <= 2 ? 0.85 : 1.0;
                window.speechSynthesis.speak(utter);
            } catch (err) {
                this.app.logWarn?.('Speech synthesis failed', err);
            }
        }
    }

    finishExamPrompt() {
        if (!this.state.isActive) {
            return;
        }

        const total = this.state.questions.length;
        const answeredCount = Object.keys(this.state.userAnswers).length;
        const unanswered = total - answeredCount;

        if (unanswered > 0) {
            const confirmMsg = this.app.getTranslation('pastExamsUnansweredPrompt', { count: String(unanswered) })
                || `You have ${unanswered} unanswered question(s). Are you sure you want to finish and submit the exam?`;
            if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                if (!window.confirm(confirmMsg)) {
                    return;
                }
            }
        }

        this.finishExam();
    }

    finishExam() {
        this.stopTimer();

        let totalScore = 0;
        const history = [];
        const mistakes = [];

        this.state.questions.forEach((question, index) => {
            let userAnswer = null;
            if (this.state.isSimulationMode) {
                userAnswer = this.state.userAnswers[index] || null;
            } else {
                userAnswer = this.state.currentQuestion === index ? this.state.selectedAnswer : null;
            }

            const isCorrect = userAnswer != null && String(userAnswer) === String(question.answer);
            if (isCorrect) {
                totalScore += 1;
            } else {
                mistakes.push(question);
            }

            history.push({
                question,
                userAnswer,
                isCorrect
            });
        });

        this.state.score = totalScore;
        this.state.history = history;
        this.state.mistakes = mistakes;
        this.state.isActive = false;

        this.showResults();
    }

    startTimer(seconds) {
        this.stopTimer();
        this.state.timerSeconds = seconds;

        const badge = document.getElementById('past-exam-timer-badge');
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.classList.remove('warning', 'danger');
        }

        this.updateTimerDisplay();

        this.state.timerInterval = setInterval(() => {
            this.state.timerSeconds -= 1;
            this.updateTimerDisplay();

            if (this.state.timerSeconds <= 0) {
                this.stopTimer();
                this.app.showToast(this.app.getTranslation('pastExamsTimeUp') || 'Time is up! Submitting exam...', 'warning', 2500);
                this.finishExam();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const seconds = Math.max(0, this.state.timerSeconds);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        this.setText('past-exam-timer-val', display);

        const badge = document.getElementById('past-exam-timer-badge');
        if (badge) {
            if (seconds <= 60) {
                badge.classList.add('danger');
                badge.classList.remove('warning');
            } else if (seconds <= 180) {
                badge.classList.add('warning');
                badge.classList.remove('danger');
            } else {
                badge.classList.remove('warning', 'danger');
            }
        }
    }

    restart() {
        if (!this.state.questions.length) {
            this.toggleLayout('setup');
            return;
        }

        this.startExam(this.state.questions);
    }

    async retryMistakes() {
        if (!Array.isArray(this.state.mistakes) || !this.state.mistakes.length) {
            this.app.showToast(this.app.getTranslation('pastExamsNoMistakesToRetry') || 'No mistakes to retry!', 'info', 2000);
            return;
        }

        return this.startExam(this.state.mistakes);
    }

    newExam() {
        this.stopTimer();
        this.state.isActive = false;
        this.state.questions = [];
        this.state.userAnswers = {};
        this.state.flaggedQuestions = new Set();
        this.state.history = [];
        this.state.mistakes = [];
        this.state.examConfig = {
            officialOnly: false,
            simulationMode: true,
            timeLimit: 'auto',
            level: 'all',
            section: 'all'
        };
        this.state.poolSummary = {
            total: 0,
            staticCount: 0,
            generatedCount: 0,
            repeatedCount: 0
        };
        this.toggleLayout('setup');
        this.renderPoolSummary();
    }

    showResults() {
        this.stopTimer();
        const total = this.state.questions.length;
        const percentage = total > 0 ? Math.round((this.state.score / total) * 100) : 0;
        const isPassed = percentage >= 60;

        this.setText('past-exam-final-score', `${this.state.score}/${total}`);
        this.setText('past-exam-final-percentage', `${percentage}%`);

        // Official Scaled Score: HSK 1-2 max 200 (pass 120), HSK 3-6 max 300 (pass 180)
        const highestLevel = this.state.questions.reduce((max, q) => Math.max(max, Number(q.hskLevel) || 1), 1);
        const maxScaled = highestLevel <= 2 ? 200 : 300;
        const scaledScore = Math.round((percentage / 100) * maxScaled);
        const passThreshold = Math.round(maxScaled * 0.6);

        const scaledHost = document.getElementById('past-exam-scaled-score');
        if (scaledHost) {
            scaledHost.innerHTML = `
                <div class="scaled-points-label">${this.app.getTranslation('pastExamsScaledScoreLabel') || 'Official Scaled HSK Score'}:</div>
                <div class="scaled-points-val"><strong>${scaledScore}</strong> / ${maxScaled} ${this.app.getTranslation('pastExamsPoints') || 'points'}</div>
                <div class="scaled-threshold-note">${this.app.getTranslation('pastExamsPassThresholdNote', { pass: String(passThreshold) }) || `Passing score: ${passThreshold} points (60%)`}</div>
            `;
        }

        const gradeHost = document.getElementById('past-exam-grade-badge');
        if (gradeHost) {
            gradeHost.className = `past-exam-grade-badge ${isPassed ? 'pass' : 'fail'}`;
            gradeHost.innerHTML = isPassed
                ? `<span class="badge-title">合格 · PASSED</span><span class="badge-desc">${this.app.getTranslation('pastExamsPassedCongrats') || 'Congratulations! You met the official HSK standard.'}</span>`
                : `<span class="badge-title">不合格 · NOT PASSED</span><span class="badge-desc">${this.app.getTranslation('pastExamsFailedNote') || 'Keep practicing! Review your mistakes below to improve.'}</span>`;
        }

        // Section Breakdown
        this.renderSectionsBreakdown();

        // Question-by-Question Review Breakdown
        this.renderReviewBreakdown();

        // Control action buttons
        const retryMistakesBtn = document.getElementById('past-exam-retry-mistakes');
        if (retryMistakesBtn) {
            retryMistakesBtn.style.display = this.state.mistakes.length > 0 ? 'inline-block' : 'none';
        }

        const viewCertBtn = document.getElementById('past-exam-view-cert');
        if (viewCertBtn) {
            viewCertBtn.style.display = isPassed ? 'inline-block' : 'none';
        }

        this.state.isActive = false;
        this.toggleLayout('results');
    }

    renderSectionsBreakdown() {
        const breakdownHost = document.getElementById('past-exam-sections-breakdown');
        if (!breakdownHost) {
            return;
        }

        const sectionStats = {};
        this.state.history.forEach((item) => {
            const sec = item.question.sectionType || 'reading';
            if (!sectionStats[sec]) {
                sectionStats[sec] = { total: 0, correct: 0 };
            }
            sectionStats[sec].total += 1;
            if (item.isCorrect) {
                sectionStats[sec].correct += 1;
            }
        });

        const sections = Object.keys(sectionStats);
        if (sections.length === 0) {
            breakdownHost.innerHTML = '';
            return;
        }

        let html = `<h4 class="breakdown-subtitle">${this.app.getTranslation('pastExamsSectionPerformance') || 'Performance by Section'}</h4><div class="section-bars-grid">`;

        sections.forEach((sec) => {
            const data = sectionStats[sec];
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            const label = this.localizeSection(sec);
            const statusClass = pct >= 60 ? 'good' : 'needs-work';

            html += `
                <div class="section-stat-card ${statusClass}">
                    <div class="section-stat-head">
                        <span class="section-name">${label}</span>
                        <span class="section-pct">${pct}% (${data.correct}/${data.total})</span>
                    </div>
                    <div class="section-stat-bar-track">
                        <div class="section-stat-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        breakdownHost.innerHTML = html;
    }

    renderReviewBreakdown() {
        const listHost = document.getElementById('past-exam-review-list');
        if (!listHost) {
            return;
        }

        listHost.innerHTML = '';

        this.state.history.forEach((item, index) => {
            const q = item.question;
            const qNum = index + 1;
            const secLabel = this.localizeSection(q.sectionType);
            const promptText = this.localizeValue(q.prompt);
            const isListening = Boolean(q.audioRequired || q.sectionType === 'listening' || q.audioText);

            // Explanation logic
            let explanationText = this.localizeValue(q.explanation);
            if (!explanationText) {
                const hintText = this.localizeValue(q.hint);
                if (hintText) {
                    explanationText = hintText;
                } else {
                    const correctOption = Array.isArray(q.options)
                        ? q.options.find((opt) => opt.key === q.answer)
                        : null;
                    const correctLabel = correctOption ? this.localizeValue(correctOption.label) : q.answer;
                    explanationText = `${this.app.getTranslation('pastExamsCorrectAnswerExplanation') || 'Correct answer'}: ${q.answer} (${correctLabel}).`;
                }
            }

            const card = document.createElement('div');
            card.className = `past-exam-review-card ${item.isCorrect ? 'correct' : 'incorrect'}`;

            // Format user and correct answer labels
            const options = this.localizeOptions(q.options);
            const userOption = options.find((opt) => opt.key === item.userAnswer);
            const userLabel = userOption ? `${userOption.key}. ${userOption.label}` : (item.userAnswer ? item.userAnswer : (this.app.getTranslation('pastExamsUnanswered') || 'Sin responder'));
            const correctOption = options.find((opt) => opt.key === q.answer);
            const correctLabel = correctOption ? `${correctOption.key}. ${correctOption.label}` : q.answer;

            let audioButtonHtml = '';
            if (isListening && q.audioText) {
                audioButtonHtml = `
                    <div class="review-audio-row">
                        <button type="button" class="btn btn-outline btn-sm review-audio-btn" data-audio="${encodeURIComponent(q.audioText)}">
                            🔊 ${this.app.getTranslation('pastExamsReplayAudio') || 'Escuchar audio'}
                        </button>
                        <span class="review-audio-script">"${q.audioText}"</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="review-card-header">
                    <span class="review-qnum">#${qNum} · HSK ${q.hskLevel} (${secLabel})</span>
                    <span class="review-status-pill ${item.isCorrect ? 'correct' : 'incorrect'}">
                        ${item.isCorrect ? '✓ ' + (this.app.getTranslation('correctQuizFeedback') || 'Correct') : '✗ ' + (this.app.getTranslation('incorrectQuizFeedback') || 'Incorrect')}
                    </span>
                </div>
                <div class="review-qprompt">${promptText}</div>
                ${audioButtonHtml}
                <div class="review-answers-grid">
                    <div class="review-user-answer ${item.isCorrect ? 'correct' : 'incorrect'}">
                        <span class="ans-label">${this.app.getTranslation('pastExamsYourAnswer') || 'Your Answer'}:</span>
                        <strong>${userLabel}</strong>
                    </div>
                    <div class="review-correct-answer">
                        <span class="ans-label">${this.app.getTranslation('pastExamsCorrectAnswer') || 'Correct Answer'}:</span>
                        <strong>${correctLabel}</strong>
                    </div>
                </div>
                <div class="review-explanation">
                    <span class="exp-icon">💡</span>
                    <div class="exp-text">${explanationText}</div>
                </div>
            `;

            // Bind audio button in review card if present
            const replayBtn = card.querySelector('.review-audio-btn');
            if (replayBtn) {
                replayBtn.addEventListener('click', () => {
                    const audioText = decodeURIComponent(replayBtn.dataset.audio || '');
                    if (audioText) {
                        if (this.app.audioController && typeof this.app.audioController.playWordAudio === 'function') {
                            this.app.audioController.playWordAudio(audioText);
                        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                            try {
                                window.speechSynthesis.cancel();
                                const utter = new window.SpeechSynthesisUtterance(audioText);
                                utter.lang = 'zh-CN';
                                window.speechSynthesis.speak(utter);
                            } catch {
                                // ignore
                            }
                        }
                    }
                });
            }

            listHost.appendChild(card);
        });
    }

    showCertificateModal() {
        const modal = document.getElementById('past-exam-cert-modal');
        if (!modal) {
            return;
        }

        const highestLevel = this.state.questions.reduce((max, q) => Math.max(max, Number(q.hskLevel) || 1), 1);
        const maxScore = highestLevel <= 2 ? 200 : 300;
        const total = this.state.questions.length;
        const percentage = total > 0 ? Math.round((this.state.score / total) * 100) : 0;
        const scaledScore = Math.round((percentage / 100) * maxScore);

        const candidateName = this.app.userProfile?.displayName || 'HSK Candidate';
        const today = new Date().toISOString().split('T')[0];

        this.setText('cert-candidate-name', candidateName);
        this.setText('cert-level', `HSK ${highestLevel}`);
        this.setText('cert-date', today);
        this.setText('cert-max-score', String(maxScore));
        this.setText('cert-total-score', String(scaledScore));

        // Build section rows for table
        const rowsHost = document.getElementById('cert-table-rows');
        if (rowsHost) {
            rowsHost.innerHTML = '';
            const sectionStats = {};
            this.state.history.forEach((item) => {
                const sec = item.question.sectionType || 'reading';
                if (!sectionStats[sec]) {
                    sectionStats[sec] = { total: 0, correct: 0 };
                }
                sectionStats[sec].total += 1;
                if (item.isCorrect) sectionStats[sec].correct += 1;
            });

            const sections = Object.keys(sectionStats);
            const maxPerSection = Math.round(maxScore / Math.max(1, sections.length));

            sections.forEach((sec) => {
                const data = sectionStats[sec];
                const secScore = data.total > 0 ? Math.round((data.correct / data.total) * maxPerSection) : 0;
                const row = document.createElement('div');
                row.className = 'table-row';
                row.innerHTML = `
                    <span>${this.localizeSection(sec)}</span>
                    <span>${maxPerSection}</span>
                    <strong>${secScore}</strong>
                `;
                rowsHost.appendChild(row);
            });
        }

        modal.style.display = 'flex';
    }

    closeCertificateModal() {
        const modal = document.getElementById('past-exam-cert-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    refreshLanguage() {
        const runningContainer = document.getElementById('past-exams-container');
        const resultsContainer = document.getElementById('past-exams-results');
        const isRunningVisible = runningContainer && runningContainer.style.display !== 'none';
        const isResultsVisible = resultsContainer && resultsContainer.style.display !== 'none';

        if (isRunningVisible && this.state.questions.length > 0) {
            this.renderQuestion();
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
            listening: this.app.getTranslation('pastExamsSectionListening') || 'Listening (听力)',
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

    renderPoolSummary() {
        const summaryEl = document.getElementById('past-exam-pool-summary');
        if (!summaryEl) {
            return;
        }

        const hasQuestions = Array.isArray(this.state.questions) && this.state.questions.length > 0;
        if (!hasQuestions) {
            summaryEl.textContent = '';
            summaryEl.style.display = 'none';
            return;
        }

        const summary = this.state.poolSummary || this.questionBank.computePoolSummary(this.state.questions);
        const total = Number(summary.total || 0);
        const staticCount = Number(summary.staticCount || 0);
        const generatedCount = Number(summary.generatedCount || 0);
        const repeatedCount = Number(summary.repeatedCount || 0);
        const modeLabel = this.state.examConfig?.officialOnly
            ? (this.app.getTranslation('pastExamsModeOfficial') || 'Official only')
            : (this.app.getTranslation('pastExamsModeAdaptive') || 'Adaptive');

        summaryEl.textContent = this.app.getTranslation('pastExamsPoolSummary', {
            mode: modeLabel,
            staticCount: String(staticCount),
            generatedCount: String(generatedCount),
            repeatedCount: String(repeatedCount),
            staticPct: String(this.getPercentage(staticCount, total)),
            generatedPct: String(this.getPercentage(generatedCount, total)),
            repeatedPct: String(this.getPercentage(repeatedCount, total))
        });
        summaryEl.style.display = 'block';
    }

    getPercentage(value, total) {
        if (!Number.isFinite(total) || total <= 0) {
            return 0;
        }

        return Math.round((Number(value || 0) / total) * 100);
    }

    getCheckboxValue(id, fallbackValue = false) {
        const element = document.getElementById(id);
        if (!element || element.type !== 'checkbox') {
            return fallbackValue;
        }

        return element.checked;
    }
}

window.PastExamsController = PastExamsController;
