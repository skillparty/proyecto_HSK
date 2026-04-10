/**
 * QuizLegacyController Module - Keeps old quiz flow isolated from app core
 */
class QuizLegacyController {
    constructor(app) {
        this.app = app;
        this.logDebug('🧩 QuizLegacyController module initialized');
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    start() {
        const levelSelect = document.getElementById('quiz-level');
        const questionsSelect = document.getElementById('quiz-questions');

        const selectedLevel = levelSelect ? levelSelect.value : '1';
        const numQuestions = questionsSelect ? parseInt(questionsSelect.value, 10) : 10;

        let vocabPool = selectedLevel === 'all'
            ? this.app.vocabulary
            : this.app.vocabulary.filter((word) => word.level == selectedLevel);

        if (vocabPool.length === 0) {
            this.app.showError('No vocabulary available for HSK level ' + selectedLevel);
            return;
        }

        vocabPool = vocabPool.sort(() => Math.random() - 0.5);
        this.app.quiz.questions = vocabPool.slice(0, Math.min(numQuestions, vocabPool.length));
        this.app.quiz.currentQuestion = 0;
        this.app.quiz.score = 0;
        this.app.quiz.isActive = true;

        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.app.showQuizQuestion();
        this.app.logInfo('[QUIZ] Quiz started: ' + this.app.quiz.questions.length + ' questions, level ' + selectedLevel);
    }

    showQuestion() {
        if (!this.app.quiz.questions || this.app.quiz.currentQuestion >= this.app.quiz.questions.length) {
            this.end();
            return;
        }

        const question = this.app.quiz.questions[this.app.quiz.currentQuestion];
        const questionDisplay = document.getElementById('quiz-question');
        const optionsContainer = document.getElementById('quiz-options');
        const currentSpan = document.getElementById('quiz-current');
        const totalSpan = document.getElementById('quiz-total');
        const scoreSpan = document.getElementById('quiz-score');

        if (currentSpan) currentSpan.textContent = this.app.quiz.currentQuestion + 1;
        if (totalSpan) totalSpan.textContent = this.app.quiz.questions.length;
        if (scoreSpan) scoreSpan.textContent = this.app.quiz.score;

        if (questionDisplay) {
            questionDisplay.innerHTML =
                '<div class="quiz-question-text">Que significa este caracter?</div>' +
                '<div class="quiz-character">' + question.character + '</div>' +
                '<div class="quiz-pinyin">' + question.pinyin + '</div>';
        }

        const correctAnswer = this.app.getMeaningForLanguage(question);
        const options = this.generateOptions(correctAnswer);

        this.app.quiz.correctAnswer = correctAnswer;

        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            options.forEach((option) => {
                const button = document.createElement('button');
                button.className = 'quiz-option';
                button.textContent = option;
                button.onclick = () => this.selectAnswer(option);
                optionsContainer.appendChild(button);
            });
        }
    }

    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        const usedAnswers = new Set([correctAnswer]);

        while (options.length < 4 && this.app.vocabulary.length > options.length) {
            const randomWord = this.app.vocabulary[Math.floor(Math.random() * this.app.vocabulary.length)];
            const wrongAnswer = this.app.getMeaningForLanguage(randomWord);

            if (!usedAnswers.has(wrongAnswer)) {
                options.push(wrongAnswer);
                usedAnswers.add(wrongAnswer);
            }
        }

        return options.sort(() => Math.random() - 0.5);
    }

    selectAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.app.quiz.correctAnswer;

        if (isCorrect) {
            this.app.quiz.score++;
        }

        this.showFeedback();

        setTimeout(() => {
            this.app.quiz.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    showFeedback() {
        const optionsContainer = document.getElementById('quiz-options');
        if (!optionsContainer) return;

        const buttons = optionsContainer.querySelectorAll('.quiz-option');
        buttons.forEach((button) => {
            button.disabled = true;
            if (button.textContent === this.app.quiz.correctAnswer) {
                button.style.backgroundColor = '#10b981';
                button.style.color = 'white';
            } else {
                button.style.backgroundColor = '#ef4444';
                button.style.color = 'white';
            }
        });
    }

    end() {
        this.app.quiz.isActive = false;

        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';

        const finalScore = document.getElementById('final-score');
        const scorePercentage = document.getElementById('score-percentage');

        if (finalScore) {
            finalScore.textContent = this.app.quiz.score + ' / ' + this.app.quiz.questions.length;
        }

        if (scorePercentage) {
            const percentage = Math.round((this.app.quiz.score / this.app.quiz.questions.length) * 100);
            scorePercentage.textContent = percentage + '%';
        }

        this.app.logInfo('[QUIZ] Quiz completed: ' + this.app.quiz.score + '/' + this.app.quiz.questions.length);
    }

    reset() {
        this.app.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            isActive: false,
            correctAnswer: null
        };

        document.getElementById('quiz-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';

        this.app.logDebug('[QUIZ] Quiz reset');
    }
}
