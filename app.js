// HSK Chinese Learning App
class HSKApp {
    constructor() {
        this.vocabulary = [];
        this.currentWord = null;
        this.practiceMode = 'char-to-pinyin';
        this.selectedLevel = 'all';
        this.isFlipped = false;
        this.practiceHistory = this.loadPracticeHistory();
        this.currentSession = [];
        this.sessionIndex = 0;
        this.stats = this.loadStats();
        this.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            isActive: false
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.initializeTabs();
            this.renderBrowseTab();
            this.updateStatsDisplay();
            this.setupPracticeSession();
        } catch (error) {
            console.error('Error initializing app:', error);
            alert('Error loading vocabulary data. Please check the console for details.');
        }
    }

    async loadVocabulary() {
        try {
            const response = await fetch('hsk_vocabulary.json');
            this.vocabulary = await response.json();
            console.log(`Loaded ${this.vocabulary.length} vocabulary items`);
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Practice controls
        document.getElementById('level-select').addEventListener('change', (e) => {
            this.selectedLevel = e.target.value;
            this.setupPracticeSession();
        });

        document.querySelectorAll('input[name="practice-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.practiceMode = e.target.value;
                this.setupPracticeSession();
            });
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextCard();
        });

        document.getElementById('flip-btn').addEventListener('click', () => {
            this.flipCard();
        });

        document.getElementById('know-btn').addEventListener('click', () => {
            this.markAsKnown(true);
        });

        document.getElementById('dont-know-btn').addEventListener('click', () => {
            this.markAsKnown(false);
        });

        // Browse controls
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterVocabulary(e.target.value);
        });

        document.getElementById('browse-level-filter').addEventListener('change', (e) => {
            this.filterByLevel(e.target.value);
        });

        // Quiz controls
        document.getElementById('start-quiz').addEventListener('click', () => {
            this.startQuiz();
        });

        document.getElementById('quiz-submit').addEventListener('click', () => {
            this.submitQuizAnswer();
        });

        document.getElementById('quiz-next').addEventListener('click', () => {
            this.nextQuizQuestion();
        });

        document.getElementById('restart-quiz').addEventListener('click', () => {
            this.restartQuiz();
        });

        // Stats controls
        document.getElementById('reset-stats').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
                this.resetStats();
            }
        });

        // Flashcard click to flip
        document.querySelector('.flashcard').addEventListener('click', () => {
            if (this.currentWord && !this.isFlipped) {
                this.flipCard();
            }
        });
    }

    initializeTabs() {
        this.switchTab('practice');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load specific tab content
        if (tabName === 'browse') {
            this.renderBrowseTab();
        } else if (tabName === 'stats') {
            this.updateStatsDisplay();
        }
    }

    getFilteredVocabulary() {
        return this.vocabulary.filter(word => {
            if (this.selectedLevel === 'all') return true;
            return word.level.toString() === this.selectedLevel;
        });
    }

    setupPracticeSession() {
        const filtered = this.getFilteredVocabulary();
        this.currentSession = this.shuffleArray([...filtered]);
        this.sessionIndex = 0;
        this.updateProgressBar();
        this.nextCard();
    }

    nextCard() {
        if (this.sessionIndex >= this.currentSession.length) {
            this.setupPracticeSession();
            return;
        }

        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;
        this.sessionIndex++;
        
        this.updateCard();
        this.updateProgressBar();
        this.updateControlButtons();
    }

    updateCard() {
        const questionText = document.getElementById('question-text');
        const hintText = document.getElementById('hint-text');
        const answerText = document.getElementById('answer-text');
        const fullInfo = document.getElementById('full-info');
        const flashcard = document.querySelector('.flashcard');

        // Remove flipped class
        flashcard.classList.remove('flipped');

        if (!this.currentWord) {
            questionText.textContent = 'No hay más palabras disponibles';
            hintText.textContent = '';
            return;
        }

        // Set question based on practice mode
        switch (this.practiceMode) {
            case 'char-to-pinyin':
                questionText.textContent = this.currentWord.character;
                hintText.textContent = `Nivel HSK ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.pinyin;
                break;
            case 'char-to-english':
                questionText.textContent = this.currentWord.character;
                hintText.textContent = `Nivel HSK ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.translation;
                break;
            case 'pinyin-to-char':
                questionText.textContent = this.currentWord.pinyin;
                hintText.textContent = `Nivel HSK ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.character;
                break;
            case 'english-to-char':
                questionText.textContent = this.currentWord.translation;
                hintText.textContent = `Nivel HSK ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.character;
                break;
        }

        // Set full info for back of card
        fullInfo.innerHTML = `
            <div><strong>Carácter:</strong> ${this.currentWord.character}</div>
            <div><strong>Pinyin:</strong> ${this.currentWord.pinyin}</div>
            <div><strong>Traducción:</strong> ${this.currentWord.translation}</div>
            <div><strong>Nivel HSK:</strong> ${this.currentWord.level}</div>
        `;
    }

    flipCard() {
        if (!this.currentWord) return;
        
        const flashcard = document.querySelector('.flashcard');
        flashcard.classList.add('flipped');
        this.isFlipped = true;
        this.updateControlButtons();
    }

    updateControlButtons() {
        const flipBtn = document.getElementById('flip-btn');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');

        if (this.currentWord) {
            flipBtn.disabled = this.isFlipped;
            knowBtn.disabled = !this.isFlipped;
            dontKnowBtn.disabled = !this.isFlipped;
        } else {
            flipBtn.disabled = true;
            knowBtn.disabled = true;
            dontKnowBtn.disabled = true;
        }
    }

    markAsKnown(known) {
        if (!this.currentWord) return;

        this.practiceHistory.push({
            word: this.currentWord,
            known: known,
            mode: this.practiceMode,
            timestamp: Date.now()
        });

        this.updateStats(known);
        this.savePracticeHistory();
        this.nextCard();
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const progress = this.sessionIndex / this.currentSession.length * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${this.sessionIndex}/${this.currentSession.length}`;
    }

    renderBrowseTab() {
        const grid = document.getElementById('vocabulary-grid');
        grid.innerHTML = '';

        const filtered = this.getFilteredVocabulary();
        
        filtered.forEach(word => {
            const item = document.createElement('div');
            item.className = 'vocab-item';
            item.innerHTML = `
                <div class="vocab-character">${word.character}</div>
                <div class="vocab-pinyin">${word.pinyin}</div>
                <div class="vocab-translation">${word.translation}</div>
                <div class="vocab-level">HSK ${word.level}</div>
            `;
            grid.appendChild(item);
        });
    }

    filterVocabulary(searchTerm) {
        const grid = document.getElementById('vocabulary-grid');
        const items = grid.querySelectorAll('.vocab-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    filterByLevel(level) {
        const filtered = level === 'all' ? 
            this.vocabulary : 
            this.vocabulary.filter(word => word.level.toString() === level);
        
        const grid = document.getElementById('vocabulary-grid');
        grid.innerHTML = '';
        
        filtered.forEach(word => {
            const item = document.createElement('div');
            item.className = 'vocab-item';
            item.innerHTML = `
                <div class="vocab-character">${word.character}</div>
                <div class="vocab-pinyin">${word.pinyin}</div>
                <div class="vocab-translation">${word.translation}</div>
                <div class="vocab-level">HSK ${word.level}</div>
            `;
            grid.appendChild(item);
        });
    }

    startQuiz() {
        const level = document.getElementById('quiz-level').value;
        const questionCount = parseInt(document.getElementById('quiz-questions').value);
        
        let filtered = level === 'all' ? 
            this.vocabulary : 
            this.vocabulary.filter(word => word.level.toString() === level);
        
        if (filtered.length < questionCount) {
            alert(`Solo hay ${filtered.length} palabras disponibles para este nivel.`);
            return;
        }

        // Generate quiz questions
        this.quiz.questions = this.generateQuizQuestions(filtered, questionCount);
        this.quiz.currentQuestion = 0;
        this.quiz.score = 0;
        this.quiz.isActive = true;

        // Show quiz container
        document.querySelector('.quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.displayQuizQuestion();
    }

    generateQuizQuestions(vocabulary, count) {
        const shuffled = this.shuffleArray([...vocabulary]);
        const questions = [];

        for (let i = 0; i < count; i++) {
            const correct = shuffled[i];
            const incorrect = this.shuffleArray(
                vocabulary.filter(w => w !== correct)
            ).slice(0, 3);

            questions.push({
                word: correct,
                options: this.shuffleArray([correct, ...incorrect]),
                type: Math.random() > 0.5 ? 'char-to-meaning' : 'meaning-to-char'
            });
        }

        return questions;
    }

    displayQuizQuestion() {
        const question = this.quiz.questions[this.quiz.currentQuestion];
        const questionDisplay = document.getElementById('quiz-question');
        const optionsContainer = document.getElementById('quiz-options');
        
        // Update progress
        document.getElementById('quiz-current').textContent = this.quiz.currentQuestion + 1;
        document.getElementById('quiz-total').textContent = this.quiz.questions.length;
        document.getElementById('quiz-score').textContent = this.quiz.score;

        // Display question
        if (question.type === 'char-to-meaning') {
            questionDisplay.textContent = question.word.character;
        } else {
            questionDisplay.textContent = `${question.word.translation} (${question.word.pinyin})`;
        }

        // Display options
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'quiz-option';
            optionEl.dataset.index = index;
            
            if (question.type === 'char-to-meaning') {
                optionEl.textContent = `${option.translation} (${option.pinyin})`;
            } else {
                optionEl.textContent = option.character;
            }

            optionEl.addEventListener('click', () => {
                this.selectQuizOption(index);
            });

            optionsContainer.appendChild(optionEl);
        });

        // Reset buttons
        document.getElementById('quiz-submit').disabled = true;
        document.getElementById('quiz-next').style.display = 'none';
        this.quiz.selectedAnswer = null;
    }

    selectQuizOption(index) {
        // Remove previous selection
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-index="${index}"]`);
        selectedOption.classList.add('selected');
        
        this.quiz.selectedAnswer = index;
        document.getElementById('quiz-submit').disabled = false;
    }

    submitQuizAnswer() {
        if (this.quiz.selectedAnswer === null) return;

        const question = this.quiz.questions[this.quiz.currentQuestion];
        const correctIndex = question.options.findIndex(opt => opt === question.word);
        const isCorrect = this.quiz.selectedAnswer === correctIndex;

        if (isCorrect) {
            this.quiz.score++;
        }

        // Show correct/incorrect styling
        document.querySelectorAll('.quiz-option').forEach((opt, index) => {
            if (index === correctIndex) {
                opt.classList.add('correct');
            } else if (index === this.quiz.selectedAnswer) {
                opt.classList.add('incorrect');
            }
        });

        // Update buttons
        document.getElementById('quiz-submit').style.display = 'none';
        document.getElementById('quiz-next').style.display = 'inline-block';

        // Update stats - pasar la palabra del quiz para el progreso por nivel
        this.updateStats(isCorrect, question.word);
    }

    nextQuizQuestion() {
        this.quiz.currentQuestion++;
        
        if (this.quiz.currentQuestion >= this.quiz.questions.length) {
            this.finishQuiz();
        } else {
            document.getElementById('quiz-submit').style.display = 'inline-block';
            document.getElementById('quiz-next').style.display = 'none';
            this.displayQuizQuestion();
        }
    }

    finishQuiz() {
        const score = this.quiz.score;
        const total = this.quiz.questions.length;
        const percentage = Math.round((score / total) * 100);

        // Update quiz completed count
        this.stats.quizzesCompleted++;
        this.saveStats();

        // Show results
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        document.getElementById('final-score').textContent = `${score}/${total}`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;

        this.quiz.isActive = false;
    }

    restartQuiz() {
        document.querySelector('.quiz-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
    }

    updateStats(correct, word = null) {
        this.stats.totalStudied++;
        if (correct) {
            this.stats.correctAnswers++;
            this.stats.currentStreak++;
            
            // Si se proporciona una palabra (del quiz), agregarla al historial de práctica
            if (word) {
                this.practiceHistory.push({
                    word: word,
                    known: true,
                    mode: 'quiz',
                    timestamp: Date.now()
                });
            }
        } else {
            this.stats.currentStreak = 0;
            
            // Agregar palabra incorrecta del quiz al historial
            if (word) {
                this.practiceHistory.push({
                    word: word,
                    known: false,
                    mode: 'quiz',
                    timestamp: Date.now()
                });
            }
        }
        this.saveStats();
        
        // Guardar historial de práctica cuando se actualiza desde el quiz
        if (word) {
            this.savePracticeHistory();
        }
    }

    updateStatsDisplay() {
        const accuracy = this.stats.totalStudied > 0 ? 
            Math.round((this.stats.correctAnswers / this.stats.totalStudied) * 100) : 0;

        document.getElementById('total-studied').textContent = this.stats.totalStudied;
        document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
        document.getElementById('quiz-count').textContent = this.stats.quizzesCompleted;
        document.getElementById('streak-count').textContent = this.stats.currentStreak;

        this.updateLevelProgress();
    }

    updateLevelProgress() {
        const progressContainer = document.getElementById('level-progress-bars');
        progressContainer.innerHTML = '';

        for (let level = 1; level <= 6; level++) {
            const levelWords = this.vocabulary.filter(w => w.level === level);
            
            // Si no hay palabras para este nivel, saltarlo
            if (levelWords.length === 0) {
                continue;
            }
            
            // Contar palabras únicas conocidas (evitar duplicados del mismo carácter)
            const studiedWordsSet = new Set();
            this.practiceHistory.forEach(h => {
                if (h.word.level === level && h.known) {
                    studiedWordsSet.add(h.word.character);
                }
            });
            
            const uniqueStudiedWords = studiedWordsSet.size;
            const progress = levelWords.length > 0 ? 
                (uniqueStudiedWords / levelWords.length) * 100 : 0;

            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.innerHTML = `
                <div class="progress-label">HSK ${level}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-percentage">${Math.round(progress)}% (${uniqueStudiedWords}/${levelWords.length})</div>
            `;
            progressContainer.appendChild(progressItem);
        }
    }

    loadStats() {
        const saved = localStorage.getItem('hsk-stats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalStudied: 0,
            correctAnswers: 0,
            currentStreak: 0,
            quizzesCompleted: 0
        };
    }

    saveStats() {
        localStorage.setItem('hsk-stats', JSON.stringify(this.stats));
    }

    loadPracticeHistory() {
        const saved = localStorage.getItem('hsk-practice-history');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    savePracticeHistory() {
        localStorage.setItem('hsk-practice-history', JSON.stringify(this.practiceHistory));
    }

    resetStats() {
        this.stats = {
            totalStudied: 0,
            correctAnswers: 0,
            currentStreak: 0,
            quizzesCompleted: 0
        };
        this.practiceHistory = [];
        this.saveStats();
        this.savePracticeHistory();
        this.updateStatsDisplay();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HSKApp();
});
