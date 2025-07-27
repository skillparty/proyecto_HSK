// Minimal HSK App for testing
class HSKApp {
    constructor() {
        this.vocabulary = [];
        this.currentWord = null;
        this.currentSession = [];
        this.sessionIndex = 0;
        this.isFlipped = false;
        this.selectedLevel = '1';
        this.practiceMode = 'char-to-pinyin';
        this.isDarkMode = false;
        this.isAudioEnabled = true;
        
        // Initialize stats
        this.stats = {
            totalStudied: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            quizzesCompleted: 0
        };
        
        // Initialize quiz
        this.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            isActive: false
        };
        
        console.log('HSKApp constructor completed');
    }
    
    async init() {
        try {
            console.log('🚀 Initializing HSK Learning App...');
            
            // Load vocabulary
            await this.loadVocabulary();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize theme
            this.initializeTheme();
            
            // Setup practice session
            this.setupPracticeSession();
            
            console.log('✅ HSK Learning App initialized successfully!');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }
    
    async loadVocabulary() {
        try {
            const response = await fetch('hsk_vocabulary.json');
            const vocabularyData = await response.json();
            this.vocabulary = vocabularyData;
            console.log(`✅ Loaded ${this.vocabulary.length} vocabulary items`);
        } catch (error) {
            console.error('❌ Error loading vocabulary:', error);
            this.createFallbackVocabulary();
        }
    }
    
    createFallbackVocabulary() {
        this.vocabulary = [
            { character: '你', pinyin: 'nǐ', english: 'you', translation: 'tú', level: 1 },
            { character: '好', pinyin: 'hǎo', english: 'good', translation: 'bueno', level: 1 },
            { character: '我', pinyin: 'wǒ', english: 'I/me', translation: 'yo', level: 1 }
        ];
        console.log('✅ Fallback vocabulary created');
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Next button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextCard();
            });
        }
        
        // Flip button
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                this.flipCard();
            });
        }
        
        console.log('✅ Event listeners setup');
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Add active class to selected tab and panel
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedPanel = document.getElementById(tabName);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedPanel) selectedPanel.classList.add('active');
        
        console.log(`✅ Switched to ${tabName} tab`);
    }
    
    setupPracticeSession() {
        if (this.vocabulary.length > 0) {
            this.currentSession = [...this.vocabulary];
            this.sessionIndex = 0;
            this.currentWord = this.currentSession[0];
            this.updateCard();
            console.log('✅ Practice session setup');
        }
    }
    
    updateCard() {
        const flashcard = document.getElementById('flashcard');
        if (flashcard && this.currentWord) {
            const cardFront = flashcard.querySelector('.card-front');
            if (cardFront) {
                cardFront.innerHTML = `
                    <div class="character">${this.currentWord.character}</div>
                    <div class="pinyin">${this.currentWord.pinyin}</div>
                `;
            }
        }
    }
    
    flipCard() {
        this.isFlipped = !this.isFlipped;
        console.log('Card flipped:', this.isFlipped);
    }
    
    nextCard() {
        this.sessionIndex++;
        if (this.sessionIndex >= this.currentSession.length) {
            this.sessionIndex = 0;
        }
        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;
        this.updateCard();
        console.log('Next card:', this.currentWord.character);
    }
    
    initializeTheme() {
        this.isDarkMode = localStorage.getItem('hsk-dark-mode') === 'true';
        this.applyTheme();
        console.log('✅ Theme initialized');
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('hsk-dark-mode', this.isDarkMode.toString());
        this.applyTheme();
        console.log('Theme toggled:', this.isDarkMode ? 'dark' : 'light');
    }
}

// Initialize app when DOM is ready
if (typeof window !== 'undefined') {
    console.log('✅ HSKApp class loaded successfully');
}