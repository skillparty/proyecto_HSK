class LegacyFlowController {
    constructor(app) {
        this.app = app;
    }

    setupKeyboardAccessibility() {
        document.querySelectorAll('.home-card[data-tab-target]').forEach((card) => {
            card.setAttribute('role', 'button');

            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const targetTab = card.dataset.tabTarget;

                    if (targetTab) {
                        this.app.switchTab(targetTab);
                    }
                }
            });
        });

        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.setAttribute('role', 'button');
            flashcard.setAttribute('tabindex', '0');

            flashcard.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    if (event.target.closest('button, input, textarea, select')) {
                        return;
                    }

                    event.preventDefault();
                    this.app.flipCard();
                }
            });
        }
    }

    handleUpdate(registration) {
        if (!registration || !registration.waiting) {
            return;
        }

        this.app.logDebug('New update available, showing notification');
        this.app.showUpdateToast(() => {
            this.app.logDebug('User clicked update, skipWaiting triggered');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        });
    }

    initializeMatrixGameLegacy() {
        if (window.matrixGame) {
            window.matrixGame.vocabulary = this.app.vocabulary;
            window.matrixGame.showGame();
            this.app.logDebug('[✓] Matrix game initialized');
        } else {
            this.app.logError('[✗] Matrix game not loaded');
        }
    }

    initializeLeaderboard() {
        if (this.app.leaderboardManager) {
            this.app.leaderboardManager.loadLeaderboard();
            this.app.logDebug('[✓] Leaderboard initialized');
        } else {
            this.app.logWarn('[⚠] Leaderboard manager not available');
        }
    }

    renderQuizResumeAction() {
        const quizSetup = document.getElementById('quiz-setup');
        if (!quizSetup) {
            return;
        }

        let resumeBtn = document.getElementById('resume-quiz');
        if (!this.app.hasResumableQuizSession()) {
            if (resumeBtn) {
                resumeBtn.remove();
            }
            return;
        }

        if (!resumeBtn) {
            const startBtn = document.getElementById('start-quiz');
            resumeBtn = document.createElement('button');
            resumeBtn.id = 'resume-quiz';
            resumeBtn.className = 'btn btn-secondary';
            resumeBtn.style.marginLeft = '10px';

            if (startBtn && startBtn.parentNode) {
                startBtn.parentNode.insertBefore(resumeBtn, startBtn.nextSibling);
            } else {
                quizSetup.appendChild(resumeBtn);
            }

            resumeBtn.addEventListener('click', () => this.resumeQuizSession());
        }

        resumeBtn.textContent = this.app.getTranslation('resumeQuiz') || 'Resume Quiz';
    }

    resumeQuizSession() {
        const state = this.app.loadQuizSessionState();
        if (!this.app.hasResumableQuizSession(state)) {
            this.renderQuizResumeAction();
            return;
        }

        const levelSelect = document.getElementById('quiz-level');
        const questionsSelect = document.getElementById('quiz-questions');

        if (levelSelect && state.selectedLevel) {
            levelSelect.value = state.selectedLevel;
        }

        if (questionsSelect && state.numQuestions) {
            questionsSelect.value = String(state.numQuestions);
        }

        this.app.quiz = {
            ...this.app.quiz,
            ...state.quiz,
            isActive: true
        };

        const quizSetup = document.getElementById('quiz-setup');
        const quizContainer = document.getElementById('quiz-container');
        const quizResults = document.getElementById('quiz-results');

        if (quizSetup) {
            quizSetup.style.display = 'none';
        }
        if (quizContainer) {
            quizContainer.style.display = 'block';
        }
        if (quizResults) {
            quizResults.style.display = 'none';
        }

        this.app.showQuizQuestion();
        this.app.showToast(this.app.getTranslation('quizSessionResumed') || 'Quiz session resumed', 'success', 1600);
    }

    initializeQuiz() {
        this.app.logDebug('Initializing Quiz module...');

        if (!this.app.quiz) {
            this.app.quiz = {
                questions: [],
                currentQuestion: 0,
                score: 0,
                isActive: false,
                correctAnswer: null
            };
        }

        const quizSetup = document.getElementById('quiz-setup');
        const quizContainer = document.getElementById('quiz-container');
        const quizResults = document.getElementById('quiz-results');

        if (quizSetup) quizSetup.style.display = 'block';
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResults) quizResults.style.display = 'none';

        this.app.logDebug('[✓] Quiz module initialized');
    }

    setupQuizEventListeners() {
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.onclick = () => this.app.quizEngine.start();
        }

        const resetQuizBtn = document.getElementById('reset-quiz-btn');
        if (resetQuizBtn) {
            resetQuizBtn.onclick = () => this.app.restartQuiz();
        }
    }

    showHeaderNotification(message) {
        this.app.showToast(message, 'success');
    }

    startQuizDeprecated() {
        this.app.quizLegacyController.start();
    }

    showQuizQuestionDeprecated() {
        this.app.quizLegacyController.showQuestion();
    }

    generateQuizOptionsLegacy(_correctWord, correctAnswer) {
        return this.app.quizLegacyController.generateOptions(correctAnswer);
    }

    selectQuizAnswerLegacy(selectedAnswer) {
        this.app.quizLegacyController.selectAnswer(selectedAnswer);
    }

    showQuizFeedbackLegacy(_isCorrect) {
        this.app.quizLegacyController.showFeedback();
    }

    endQuizLegacy() {
        this.app.quizLegacyController.end();
    }

    resetQuizLegacy() {
        this.app.quizLegacyController.reset();
    }

    initializeMatrixGame() {
        this.app.matrixController.initialize();
    }

    debugMatrixGame() {
        this.app.matrixController.debug();
    }

    showMatrixGameFallback() {
        this.app.matrixController.showFallback();
    }
}

window.LegacyFlowController = LegacyFlowController;
