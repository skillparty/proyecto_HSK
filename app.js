// HSK Chinese Learning App

// Spaced Repetition System (SRS) Class
class SpacedRepetitionSystem {
    constructor() {
        this.intervals = [1, 3, 7, 14, 30, 90]; // days
        this.easeFactor = {
            again: 1.2,    // Very difficult
            hard: 1.3,     // Difficult
            good: 2.5,     // Normal
            easy: 2.8      // Easy
        };
    }

    // Calculate next review date based on performance
    calculateNextReview(word, performance) {
        const now = new Date();
        const wordData = this.getWordData(word);
        
        let interval = wordData.interval || 1;
        let easeFactor = wordData.easeFactor || 2.5;
        let repetitions = wordData.repetitions || 0;
        
        switch(performance) {
            case 'again':
                repetitions = 0;
                interval = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
                break;
            case 'hard':
                repetitions++;
                interval = Math.max(1, Math.round(interval * 1.2));
                easeFactor = Math.max(1.3, easeFactor - 0.15);
                break;
            case 'good':
                repetitions++;
                if (repetitions === 1) interval = 1;
                else if (repetitions === 2) interval = 6;
                else interval = Math.round(interval * easeFactor);
                break;
            case 'easy':
                repetitions++;
                if (repetitions === 1) interval = 4;
                else interval = Math.round(interval * easeFactor * 1.3);
                easeFactor += 0.15;
                break;
        }
        
        const nextReview = new Date(now.getTime() + (interval * 24 * 60 * 60 * 1000));
        
        return {
            nextReview: nextReview.getTime(),
            interval,
            easeFactor,
            repetitions,
            lastReviewed: now.getTime(),
            performance
        };
    }
    
    getWordData(word) {
        const srsData = JSON.parse(localStorage.getItem('srsData') || '{}');
        const wordKey = `${word.character}_${word.pinyin}`;
        return srsData[wordKey] || {};
    }
    
    saveWordData(word, data) {
        const srsData = JSON.parse(localStorage.getItem('srsData') || '{}');
        const wordKey = `${word.character}_${word.pinyin}`;
        srsData[wordKey] = { ...srsData[wordKey], ...data };
        localStorage.setItem('srsData', JSON.stringify(srsData));
    }
    
    // Get words due for review
    getDueWords(vocabulary) {
        const now = Date.now();
        return vocabulary.filter(word => {
            const wordData = this.getWordData(word);
            if (!wordData.nextReview) return true; // New words
            return wordData.nextReview <= now;
        });
    }
    
    // Sort words by priority (overdue first, then by difficulty)
    prioritizeWords(words) {
        const now = Date.now();
        return words.sort((a, b) => {
            const aData = this.getWordData(a);
            const bData = this.getWordData(b);
            
            // New words first
            if (!aData.nextReview && bData.nextReview) return -1;
            if (aData.nextReview && !bData.nextReview) return 1;
            if (!aData.nextReview && !bData.nextReview) return 0;
            
            // Then by how overdue they are
            const aOverdue = now - aData.nextReview;
            const bOverdue = now - bData.nextReview;
            
            if (aOverdue !== bOverdue) return bOverdue - aOverdue;
            
            // Finally by difficulty (lower ease factor = more difficult)
            return (aData.easeFactor || 2.5) - (bData.easeFactor || 2.5);
        });
    }
    
    getWordStats(word) {
        const data = this.getWordData(word);
        const now = Date.now();
        const isNew = !data.lastReviewed;
        const isDue = !data.nextReview || data.nextReview <= now;
        const daysUntilDue = data.nextReview ? Math.ceil((data.nextReview - now) / (24 * 60 * 60 * 1000)) : 0;
        
        return {
            isNew,
            isDue,
            daysUntilDue,
            repetitions: data.repetitions || 0,
            easeFactor: data.easeFactor || 2.5,
            lastPerformance: data.performance || 'none'
        };
    }
}

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
        
        // Initialize Spaced Repetition System
        this.srs = new SpacedRepetitionSystem();
        this.srsMode = this.loadSRSMode();
        this.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            isActive: false
        };
        
        // Dark mode, audio and language settings
        this.isDarkMode = this.loadTheme();
        this.isAudioEnabled = this.loadAudioSetting();
        this.voicePreference = this.loadVoicePreference();
        this.languageManager = new LanguageManager();
        
        // PWA features
        this.deferredPrompt = null;
        this.initializePWA();
        
        this.init();
    }

    async init() {
        try {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.initializeTabs();
            this.initializeTheme();
            this.initializeAudio();
            this.languageManager.updateInterface();
            this.renderBrowseTab();
            this.updateStatsDisplay();
            this.updateSRSInterface(); // Initialize SRS interface
            this.setupPracticeSession();
        } catch (error) {
            console.error('Error initializing app:', error);
            const errorMsg = this.languageManager.t('loadingError');
            alert(errorMsg);
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
        
        // SRS performance buttons
        document.getElementById('srs-again').addEventListener('click', () => {
            this.markAsKnown(false, 'again');
        });
        
        document.getElementById('srs-hard').addEventListener('click', () => {
            this.markAsKnown(false, 'hard');
        });
        
        document.getElementById('srs-good').addEventListener('click', () => {
            this.markAsKnown(true, 'good');
        });
        
        document.getElementById('srs-easy').addEventListener('click', () => {
            this.markAsKnown(true, 'easy');
        });
        
        // Toggle SRS mode
        document.getElementById('toggle-srs').addEventListener('click', () => {
            this.toggleSRSMode();
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

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Audio toggle
        document.getElementById('audio-toggle').addEventListener('click', () => {
            this.toggleAudio();
        });

        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.languageManager.setLanguage(e.target.value);
        });

        // Voice selector
        document.getElementById('voice-select').addEventListener('change', (e) => {
            this.voicePreference = e.target.value;
            this.saveVoicePreference();
            this.setupChineseVoice();
            console.log('Voice preference changed to:', this.voicePreference);
        });

        // Listen for language changes to update dynamic content
        window.addEventListener('languageChanged', (e) => {
            this.updateDynamicContent();
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
        
        // Use SRS to get due words first, then prioritize them
        const dueWords = this.srs.getDueWords(filtered);
        const prioritizedWords = this.srs.prioritizeWords(dueWords);
        
        // If we have enough due words, use them. Otherwise, add some random ones
        if (prioritizedWords.length >= 20) {
            this.currentSession = prioritizedWords.slice(0, 20);
        } else {
            // Mix due words with random ones
            const remainingWords = filtered.filter(word => !dueWords.includes(word));
            const randomWords = this.shuffleArray(remainingWords).slice(0, 20 - prioritizedWords.length);
            this.currentSession = [...prioritizedWords, ...randomWords];
        }
        
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
            questionText.textContent = this.languageManager.t('noWordsAvailable');
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
            <div><strong>${this.languageManager.t('character')}</strong> <span class="clickable-character">${this.currentWord.character}</span></div>
            <div><strong>${this.languageManager.t('pinyin')}</strong> ${this.currentWord.pinyin}</div>
            <div><strong>${this.languageManager.t('translation')}</strong> ${this.currentWord.translation}</div>
            <div><strong>${this.languageManager.t('level')}</strong> ${this.currentWord.level}</div>
        `;
        
        // Add pronunciation to characters
        setTimeout(() => {
            const characterElements = document.querySelectorAll('#question-text, #answer-text, .clickable-character');
            characterElements.forEach(el => {
                if (el.textContent.match(/[\u4e00-\u9fff]/)) {
                    this.addPronunciationToCharacter(el, this.currentWord.character);
                }
            });
        }, 100);
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

    markAsKnown(known, performance = null) {
        if (!this.currentWord) return;

        // Determine SRS performance if not explicitly provided
        if (performance === null) {
            performance = known ? 'good' : 'again';
        }

        // Update SRS data
        const srsUpdate = this.srs.calculateNextReview(this.currentWord, performance);
        this.srs.saveWordData(this.currentWord, srsUpdate);

        this.practiceHistory.push({
            word: this.currentWord,
            known: known,
            mode: this.practiceMode,
            timestamp: Date.now(),
            srsPerformance: performance
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
                <div class="vocab-character clickable-character">${word.character}</div>
                <div class="vocab-pinyin">${word.pinyin}</div>
                <div class="vocab-translation">${word.translation}</div>
                <div class="vocab-level">HSK ${word.level}</div>
            `;
            
            // Add pronunciation to character
            const charElement = item.querySelector('.vocab-character');
            this.addPronunciationToCharacter(charElement, word.character);
            
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
                <div class="vocab-character clickable-character">${word.character}</div>
                <div class="vocab-pinyin">${word.pinyin}</div>
                <div class="vocab-translation">${word.translation}</div>
                <div class="vocab-level">HSK ${word.level}</div>
            `;
            
            // Add pronunciation to character
            const charElement = item.querySelector('.vocab-character');
            this.addPronunciationToCharacter(charElement, word.character);
            
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
            // Add pronunciation to quiz question
            setTimeout(() => {
                this.addPronunciationToCharacter(questionDisplay, question.word.character);
            }, 100);
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

    // Theme management
    initializeTheme() {
        // Asegurar que el tema se aplique correctamente al body y html
        const theme = this.isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        this.updateThemeButton();
        this.updateAppLogo();
        console.log('Theme initialized:', theme);
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const theme = this.isDarkMode ? 'dark' : 'light';
        
        // Aplicar tema al documento completo
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        this.saveTheme();
        this.updateThemeButton();
        this.updateAppLogo();
        
        console.log('Theme toggled to:', theme);
        
        // Forzar re-renderizado de estilos
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }

    updateThemeButton() {
        const themeBtn = document.getElementById('theme-toggle');
        const lightIcon = themeBtn.querySelector('.light-icon');
        const darkIcon = themeBtn.querySelector('.dark-icon');
        
        if (this.isDarkMode) {
            lightIcon.style.opacity = '0';
            lightIcon.style.transform = 'rotate(180deg) scale(0.5)';
            darkIcon.style.opacity = '1';
            darkIcon.style.transform = 'rotate(0deg) scale(1)';
        } else {
            lightIcon.style.opacity = '1';
            lightIcon.style.transform = 'rotate(0deg) scale(1)';
            darkIcon.style.opacity = '0';
            darkIcon.style.transform = 'rotate(180deg) scale(0.5)';
        }
    }

    updateAppLogo() {
        const appLogo = document.getElementById('app-logo');
        if (appLogo) {
            const logoSrc = this.isDarkMode ? 'logo_appDM.png' : 'logo_appLM.png';
            appLogo.src = logoSrc;
            
            // Add smooth transition
            appLogo.style.transition = 'all 0.3s ease';
            appLogo.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                appLogo.style.transform = 'scale(1)';
            }, 150);
        }
    }

    loadTheme() {
        const saved = localStorage.getItem('hsk-dark-mode');
        return saved === 'true';
    }

    saveTheme() {
        localStorage.setItem('hsk-dark-mode', this.isDarkMode.toString());
    }

    // Audio management
    initializeAudio() {
        this.updateAudioButton();
        
        // Initialize speech synthesis
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.setupChineseVoice();
        } else {
            console.warn('Speech synthesis not supported');
            document.getElementById('audio-toggle').style.display = 'none';
        }
    }

    setupChineseVoice() {
        // Wait for voices to load
        const setVoice = () => {
            const voices = this.speechSynthesis.getVoices();
            
            // Filter Chinese voices with more comprehensive detection
            const chineseVoices = voices.filter(voice => {
                const name = voice.name.toLowerCase();
                const lang = voice.lang.toLowerCase();
                return (
                    lang.includes('zh') || 
                    lang.includes('zh-cn') ||
                    lang.includes('zh-tw') ||
                    lang.includes('cmn') ||
                    name.includes('chinese') ||
                    name.includes('mandarin') ||
                    name.includes('台灣') ||
                    name.includes('中文') ||
                    name.includes('普通话')
                );
            });
            
            let selectedVoice = null;
            
            console.log('Available Chinese voices:', chineseVoices.map(v => `${v.name} (${v.lang})`));
            
            if (this.voicePreference === 'male') {
                // Try to find male voice with better patterns
                selectedVoice = chineseVoices.find(voice => {
                    const name = voice.name.toLowerCase();
                    return (
                        name.includes('male') ||
                        name.includes('man') ||
                        name.includes('masculino') ||
                        name.includes('hombre') ||
                        name.includes('男') ||
                        (name.includes('xiaoyun') && name.includes('male')) ||
                        name.includes('yunxi')
                    );
                });
            } else if (this.voicePreference === 'female') {
                // Try to find female voice with better patterns
                selectedVoice = chineseVoices.find(voice => {
                    const name = voice.name.toLowerCase();
                    return (
                        name.includes('female') ||
                        name.includes('woman') ||
                        name.includes('femenina') ||
                        name.includes('mujer') ||
                        name.includes('女') ||
                        name.includes('xiaoxiao') ||
                        name.includes('xiaoyi') ||
                        name.includes('hanhan') ||
                        name.includes('yaoyao')
                    );
                });
            }
            
            // If no specific preference match, try alternative approaches
            if (!selectedVoice && this.voicePreference !== 'auto') {
                // For female, try voices that typically are female
                if (this.voicePreference === 'female') {
                    selectedVoice = chineseVoices.find(voice => 
                        !voice.name.toLowerCase().includes('male') &&
                        !voice.name.toLowerCase().includes('man')
                    );
                }
                // For male, try remaining voices
                else if (this.voicePreference === 'male') {
                    selectedVoice = chineseVoices.find(voice => 
                        !voice.name.toLowerCase().includes('female') &&
                        !voice.name.toLowerCase().includes('woman')
                    );
                }
            }
            
            // Fallback to any Chinese voice
            if (!selectedVoice && chineseVoices.length > 0) {
                selectedVoice = chineseVoices[0];
            }
            
            // Final fallback to any available voice
            this.chineseVoice = selectedVoice || voices[0];
            
            console.log('Selected voice:', this.chineseVoice?.name || 'Default', 
                       'Language:', this.chineseVoice?.lang || 'Unknown',
                       'Preference:', this.voicePreference);
                       
            // Update voice selector UI
            const voiceSelect = document.getElementById('voice-select');
            if (voiceSelect) {
                voiceSelect.value = this.voicePreference;
            }
        };

        if (this.speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            this.speechSynthesis.addEventListener('voiceschanged', setVoice);
        }
    }

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        this.saveAudioSetting();
        this.updateAudioButton();
    }

    updateAudioButton() {
        const audioBtn = document.getElementById('audio-toggle');
        const audioIcon = audioBtn.querySelector('.audio-icon');
        
        if (this.isAudioEnabled) {
            audioBtn.classList.remove('muted');
            audioIcon.textContent = 'Audio';
            audioBtn.title = 'Desactivar audio';
        } else {
            audioBtn.classList.add('muted');
            audioIcon.textContent = 'Mute';
            audioBtn.title = 'Activar audio';
        }
    }

    loadAudioSetting() {
        const saved = localStorage.getItem('hsk-audio-enabled');
        return saved !== 'false'; // Default to true
    }

    saveAudioSetting() {
        localStorage.setItem('hsk-audio-enabled', this.isAudioEnabled.toString());
    }

    // Voice preference management
    loadVoicePreference() {
        const saved = localStorage.getItem('hsk-voice-preference');
        return saved || 'auto';
    }

    saveVoicePreference() {
        localStorage.setItem('hsk-voice-preference', this.voicePreference);
    }

    // SRS mode management
    loadSRSMode() {
        const saved = localStorage.getItem('hsk-srs-mode');
        return saved === 'true';
    }

    saveSRSMode() {
        localStorage.setItem('hsk-srs-mode', this.srsMode.toString());
    }

    toggleSRSMode() {
        this.srsMode = !this.srsMode;
        this.saveSRSMode();
        this.updateSRSInterface();
        
        // Show notification
        const mode = this.srsMode ? 'SRS Avanzado' : 'Simple';
        this.showNotification(`Modo ${mode} activado`, 'info');
    }

    updateSRSInterface() {
        const srsButtons = document.querySelector('.srs-buttons');
        const simpleButtons = document.querySelector('.simple-buttons');
        const toggleButton = document.getElementById('toggle-srs');
        
        if (this.srsMode) {
            srsButtons.style.display = 'flex';
            simpleButtons.style.display = 'none';
            toggleButton.textContent = 'Modo Simple';
            toggleButton.title = 'Cambiar a modo simple';
        } else {
            srsButtons.style.display = 'none';
            simpleButtons.style.display = 'flex';
            toggleButton.textContent = 'Modo SRS';
            toggleButton.title = 'Cambiar a modo SRS avanzado';
        }
        
        // Update button states
        this.updateControlButtons();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-medium);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Pronunciation function
    pronounceText(text, language = 'zh-CN') {
        if (!this.isAudioEnabled || !this.speechSynthesis || !text) {
            return;
        }

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1;
        utterance.volume = 0.8;

        if (this.chineseVoice) {
            utterance.voice = this.chineseVoice;
        }

        // Error handling
        utterance.onerror = (event) => {
            console.warn('Speech synthesis error:', event.error);
        };

        this.speechSynthesis.speak(utterance);
    }

    // Language management
    updateDynamicContent() {
        // Update question text if current word exists
        if (this.currentWord) {
            this.updateCard();
        }
        
        // Update quiz confirmation messages
        const resetBtn = document.getElementById('reset-stats');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm(this.languageManager.t('resetConfirm'))) {
                    this.resetStats();
                }
            };
        }
        
        // Update audio button titles
        this.updateAudioButton();
        
        // Update search placeholder
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = this.languageManager.t('searchPlaceholder');
        }
        
        // Update initial flashcard text
        const questionText = document.getElementById('question-text');
        if (questionText && questionText.textContent === '点击"Siguiente" para comenzar') {
            questionText.textContent = this.languageManager.t('clickToStart');
        }
    }

    // Add pronunciation to character display
    addPronunciationToCharacter(element, character) {
        if (!this.isAudioEnabled || !character) return;
        
        // Add click listener for pronunciation
        element.style.cursor = 'pointer';
        element.title = 'Hacer clic para escuchar pronunciación';
        
        const clickHandler = (e) => {
            e.stopPropagation();
            this.pronounceText(character);
            
            // Visual feedback
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        };
        
        element.addEventListener('click', clickHandler);
        
        // Add pronunciation icon
        if (!element.querySelector('.pronunciation-icon')) {
            const icon = document.createElement('span');
            icon.className = 'pronunciation-icon';
            icon.innerHTML = ' ♪';
            icon.style.fontSize = '0.6em';
            icon.style.opacity = '0.7';
            element.appendChild(icon);
        }
    }

    // PWA initialization
    initializePWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW: Service Worker registered successfully:', registration.scope);
                        
                        // Listen for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New update available
                                    this.showUpdateAvailable();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('SW: Service Worker registration failed:', error);
                    });
            });
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle app installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.hideInstallButton();
            this.deferredPrompt = null;
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'install-btn';
            installBtn.className = 'install-btn';
            installBtn.innerHTML = '📱 Instalar App';
            installBtn.title = 'Instalar HSK Learning en tu dispositivo';
            
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
            
            // Add to header controls
            const headerControls = document.querySelector('.header-controls');
            headerControls.insertBefore(installBtn, headerControls.firstChild);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted the install prompt');
            } else {
                console.log('PWA: User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    showUpdateAvailable() {
        // Create update notification
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>🆕 Nueva versión disponible</span>
                <button onclick="window.location.reload()">Actualizar</button>
            </div>
        `;
        
        document.body.insertBefore(updateBanner, document.body.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (updateBanner && updateBanner.parentNode) {
                updateBanner.remove();
            }
        }, 10000);
    }

    showConnectionStatus(status) {
        // Create connection status indicator
        let statusIndicator = document.getElementById('connection-status');
        
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'connection-status';
            statusIndicator.className = 'connection-status';
            document.body.appendChild(statusIndicator);
        }
        
        if (status === 'offline') {
            statusIndicator.innerHTML = '📴 Sin conexión - Modo offline';
            statusIndicator.className = 'connection-status offline';
        } else {
            statusIndicator.innerHTML = '🌐 Conectado';
            statusIndicator.className = 'connection-status online';
            
            // Hide after 3 seconds
            setTimeout(() => {
                if (statusIndicator) {
                    statusIndicator.style.display = 'none';
                }
            }, 3000);
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HSKApp();
});
