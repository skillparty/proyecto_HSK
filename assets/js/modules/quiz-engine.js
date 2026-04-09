/**
 * QuizEngine Module - Handles HSK testing logic
 * Extracted from app.js as part of modularization
 */
class QuizEngine {
    constructor(app) {
        this.app = app;
        this.state = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            isActive: false,
            selectedAnswer: null,
            correctAnswer: null
        };
        
        console.log('📝 QuizEngine module initialized');
    }

    // Method to link existing quiz data from app if needed
    syncFromApp() {
        if (this.app.quiz) {
            this.state = this.app.quiz;
        }
    }

    start() {
        const levelSelect = document.getElementById('quiz-level');
        const questionsSelect = document.getElementById('quiz-questions');

        const selectedLevel = levelSelect ? levelSelect.value : '1';
        const numQuestions = questionsSelect ? parseInt(questionsSelect.value) : 10;

        // Filter vocabulary by level
        let vocabPool = selectedLevel === 'all' ?
            this.app.vocabulary :
            this.app.vocabulary.filter(word => word.level == selectedLevel);

        if (vocabPool.length === 0) {
            this.app.showToast(this.app.getTranslation('noVocabularyForLevel') || 'No vocabulary for this level', 'error', 2000);
            return;
        }

        // Shuffle and select questions
        vocabPool = vocabPool.sort(() => Math.random() - 0.5);
        this.state.questions = vocabPool.slice(0, numQuestions);
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.correctAnswer = null;
        this.state.selectedAnswer = null;
        this.state.isActive = true;

        // Sync back to app for compatibility during transition
        this.app.quiz = this.state;

        // Show quiz container
        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.saveSession();
        this.showQuestion();
    }

    showQuestion() {
        const question = this.state.questions[this.state.currentQuestion];
        const questionDisplay = document.getElementById('quiz-question');
        const optionsContainer = document.getElementById('quiz-options');
        const currentSpan = document.getElementById('quiz-current');
        const totalSpan = document.getElementById('quiz-total');
        const scoreSpan = document.getElementById('quiz-score');
        const currentQuestionNumber = this.state.currentQuestion + 1;
        const totalQuestions = this.state.questions.length;

        if (currentSpan) currentSpan.textContent = currentQuestionNumber;
        if (totalSpan) totalSpan.textContent = totalQuestions;
        if (scoreSpan) scoreSpan.textContent = this.state.score;

        // Show question
        if (questionDisplay) {
            const hskLevelLabel = this.app.getTranslation('quizHskLevel') || 'HSK Level';
            const questionLabel = this.app.getTranslation('quizQuestionCounter') || (this.app.getTranslation('question') || 'Question');
            const ofLabel = this.app.getTranslation('of') || 'of';
            const hskLevelValue = question?.level ? `HSK ${question.level}` : (this.app.getTranslation('allLevels') || 'All levels');

            questionDisplay.innerHTML = `
                <div class="quiz-question-meta">
                    <span class="quiz-meta-pill">${hskLevelLabel}: ${hskLevelValue}</span>
                    <span class="quiz-meta-pill">${questionLabel} ${currentQuestionNumber} ${ofLabel} ${totalQuestions}</span>
                </div>
                <div class="quiz-question-text">${this.app.getTranslation('whatDoesThisCharacterMean') || 'What does this character mean?'}</div>
                <div class="quiz-character">${question.character}</div>
                <div class="quiz-pinyin">${question.pinyin}</div>
            `;
        }

        // Generate options with guaranteed correct answer
        const correctAnswer = this.app.getMeaningForLanguage(question);
        const options = this.generateOptions(question, correctAnswer);

        // Store correct answer for validation
        this.state.correctAnswer = correctAnswer;

        // Render options
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            options.forEach((option) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'quiz-option';
                optionBtn.textContent = option;
                optionBtn.addEventListener('click', () => {
                    this.selectAnswer(option, correctAnswer);
                });
                optionsContainer.appendChild(optionBtn);
            });
        }

        // Reset submit button
        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.display = 'inline-block';
        }

        const nextBtn = document.getElementById('quiz-next');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }

        this.state.selectedAnswer = null;
        this.saveSession();

        console.log(`❓ Quiz question ${this.state.currentQuestion + 1}: ${question.character} (${correctAnswer})`);
    }

    generateOptions(currentWord, correctAnswer) {
        // Get all possible wrong answers from app vocabulary
        const allWrongAnswers = this.app.vocabulary
            .filter(word => word !== currentWord)
            .map(word => this.app.getMeaningForLanguage(word))
            .filter(meaning => meaning && meaning !== correctAnswer)
            .filter((meaning, index, arr) => arr.indexOf(meaning) === index);

        // Ensure we have enough wrong answers
        if (allWrongAnswers.length < 3) {
            const genericWrongAnswers = this.app.currentLanguage === 'es'
                ? ['hola', 'adiós', 'gracias', 'por favor', 'lo siento', 'sí', 'no']
                : ['hello', 'goodbye', 'thank you', 'please', 'sorry', 'yes', 'no'];
            allWrongAnswers.push(...genericWrongAnswers.filter(answer => answer !== correctAnswer));
        }

        // Select 3 random wrong answers
        const wrongAnswers = allWrongAnswers
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // Combine and shuffle
        const shuffledOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        // Safety check
        if (!shuffledOptions.includes(correctAnswer)) {
            shuffledOptions[0] = correctAnswer;
            shuffledOptions.sort(() => Math.random() - 0.5);
        }

        return shuffledOptions;
    }

    selectAnswer(selected, correct) {
        this.state.selectedAnswer = selected;
        this.state.correctAnswer = correct;

        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === selected) {
                btn.classList.add('selected');
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);
            }
        });

        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.add('ready');
            submitBtn.textContent = this.app.getTranslation('submit') || 'Submit';
        }
    }

    submitAnswer() {
        if (!this.state.selectedAnswer) return;

        const isCorrect = this.state.selectedAnswer === this.state.correctAnswer;

        // Update stats in app
        this.app.stats.totalStudied++;
        this.app.stats.quizAnswered++;

        if (isCorrect) {
            this.state.score++;
            this.app.stats.correctAnswers++;
        }

        this.app.updateDailyProgress();
        this.app.saveStats();
        this.app.updateProgress();
        this.app.updateHeaderStats();

        this.saveSession();

        // Update UI
        const scoreSpan = document.getElementById('quiz-score');
        if (scoreSpan) scoreSpan.textContent = this.state.score;

        document.querySelectorAll('.quiz-option').forEach(btn => {
            if (btn.textContent === this.state.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === this.state.selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        this.showFeedback(isCorrect);
        
        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) submitBtn.style.display = 'none';
        
        const nextBtn = document.getElementById('quiz-next');
        if (nextBtn) nextBtn.style.display = 'inline-block';
    }

    showFeedback(isCorrect) {
        const quizContent = document.getElementById('quiz-content');
        if (!quizContent) return;

        const existingFeedback = document.getElementById('quiz-feedback');
        if (existingFeedback) existingFeedback.remove();

        const feedback = document.createElement('div');
        feedback.id = 'quiz-feedback';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <div class="feedback-icon">${isCorrect
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}</div>
            <div class="feedback-text">${isCorrect
                ? (this.app.getTranslation('correctQuizFeedback') || 'Correct!')
                : (this.app.getTranslation('incorrectQuizFeedback') || 'Incorrect')}</div>
            ${!isCorrect ? `<div class="feedback-answer">${this.app.getTranslation('correctAnswerLabel') || 'Correct answer'}: ${this.state.correctAnswer}</div>` : ''}
        `;

        quizContent.appendChild(feedback);
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.opacity = '0';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 2000);
    }

    nextQuestion() {
        this.state.currentQuestion++;

        if (this.state.currentQuestion >= this.state.questions.length) {
            this.showResults();
        } else {
            const submitBtn = document.getElementById('quiz-submit');
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true;
                submitBtn.classList.remove('ready');
                submitBtn.textContent = this.app.getTranslation('selectAnAnswer') || 'Select an Answer';
            }
            document.getElementById('quiz-next').style.display = 'none';
            this.saveSession();
            this.showQuestion();
        }
    }

    showResults() {
        const percentage = Math.round((this.state.score / this.state.questions.length) * 100);

        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        document.getElementById('final-score').textContent = `${this.state.score}/${this.state.questions.length}`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;

        this.app.stats.quizzesCompleted++;
        this.app.saveStats();
        this.clearSession();
        this.app.renderQuizResumeAction();

        if (this.app.userProgress?.recordQuizCompletion) {
            this.app.userProgress.recordQuizCompletion(
                this.app.currentLevel,
                this.state.score,
                this.state.questions.length
            );
        }
    }

    renderResumeAction() {
        const quizSetup = document.getElementById('quiz-setup');
        if (!quizSetup) return;

        let resumeBtn = document.getElementById('resume-quiz');
        if (!this.hasResumableSession()) {
            if (resumeBtn) resumeBtn.remove();
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

            resumeBtn.addEventListener('click', () => this.resumeSession());
        }

        resumeBtn.textContent = this.app.getTranslation('resumeQuiz') || 'Resume Quiz';
    }

    hasResumableSession(session = null) {
        const state = session || this.loadSession();
        if (!state || !state.updatedAt || !state.quiz) return false;

        const age = Date.now() - Number(state.updatedAt);
        if (age > this.app.quizSessionMaxAgeMs) {
            this.clearSession();
            return false;
        }

        return !!(state.quiz.isActive && Array.isArray(state.quiz.questions) && state.quiz.questions.length > 0);
    }

    resumeSession() {
        const state = this.loadSession();
        if (!this.hasResumableSession(state)) {
            this.renderResumeAction();
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

        this.state = {
            ...this.state,
            ...state.quiz,
            isActive: true
        };

        // Sync back to app
        this.app.quiz = this.state;

        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.showToast(this.app.getTranslation('quizSessionResumed') || 'Quiz session resumed', 'success', 1600);
        this.showQuestion();
    }

    showToast(message, type, duration) {
        if (this.app.uiController) {
            this.app.uiController.showToast(message, type, duration);
        } else if (typeof this.app.showToast === 'function') {
            this.app.showToast(message, type, duration);
        }
    }
}
