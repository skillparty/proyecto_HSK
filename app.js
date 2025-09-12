// HSK Learning App - Complete Implementation
class HSKApp {
    constructor() {
        this.vocabulary = [];
        this.currentWord = null;
        this.currentSession = [];
        this.sessionIndex = 0;
        this.isFlipped = false;
        this.selectedLevel = '1';
        this.currentLevel = '1';
        this.practiceMode = 'char-to-english';
        this.isDarkMode = true; // Default to dark theme (PlanetScale style)
        this.isAudioEnabled = true;
        this.selectedVoice = 'auto'; // 'male', 'female', 'auto'
        this.availableVoices = [];
        this.chineseVoices = { male: null, female: null };
        this.currentLanguage = localStorage.getItem('hsk-language') || 'es';
        
        // User authentication and profile
        this.githubAuth = null;
        this.userProfile = null;
        
        // Initialize quiz
        this.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            selectedAnswer: null,
            isActive: false
        };
        
        // Statistics
        this.stats = {
            totalCards: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            studyTime: 0,
            dailyGoal: 20,
            todayCards: 0
        };
        
        // Daily progress tracking
        this.dailyProgress = this.loadDailyProgress();
        
        // Load saved data
        this.loadSettings();
        this.loadStats();
        this.loadVoicePreference();
        
        // Initialize the app
        this.init();
        
        console.log('[✓] HSKApp constructor completed');
    }
    
    async init() {
        try {
            console.log('[▶] Initializing HSK Learning App...');
            
            // Initialize LanguageManager first
            if (!window.languageManager && window.LanguageManager) {
                window.languageManager = new window.LanguageManager();
                this.currentLanguage = window.languageManager.currentLanguage;
                
                // Listen for language changes
                window.addEventListener('languageChanged', (e) => {
                    this.currentLanguage = e.detail.language;
                    if (this.currentWord) {
                        this.updateCard();
                    }
                    if (this.browseState) {
                        this.updateVocabularyCards();
                    }
                    // Update user preference
                    if (this.userProfile) {
                        this.userProfile.updatePreference('language', e.detail.language);
                    }
                });
                
                console.log('[✓] LanguageManager initialized');
            }
            
            // Initialize GitHub Authentication
            if (window.GitHubAuth) {
                this.githubAuth = new window.GitHubAuth();
                console.log('[✓] GitHub Auth initialized');
            }
            
            // Initialize User Profile
            if (window.UserProfile && this.githubAuth) {
                this.userProfile = new window.UserProfile(this.githubAuth);
                
                // Load user preferences
                this.loadUserPreferences();
                
                console.log('[✓] User Profile initialized');
            }
            
            // Load vocabulary
            await this.loadVocabulary();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize theme
            this.initializeTheme();
            
            // Initialize language display
            if (window.languageManager) {
                window.languageManager.updateInterface();
            }
            
            // Setup practice session
            this.setupPracticeSession();
            
            // Update header
            this.updateHeaderStats();
            this.updateAudioButton();
            
            // Initialize voices for audio (wait for them to be available)
            if ('speechSynthesis' in window) {
                this.initializeVoices();
                speechSynthesis.onvoiceschanged = () => {
                    this.initializeVoices();
                    this.updateVoiceSelector();
                    console.log('🎤 Voices reloaded:', speechSynthesis.getVoices().length);
                };
            }
            
            // Update voice selector after initialization
            this.updateVoiceSelector();
            
            console.log('[✓] HSK Learning App initialized successfully!');
            
        } catch (error) {
            console.error('[✗] Error initializing app:', error);
        }
    }
    
    async loadVocabulary() {
        try {
            // Try to load complete vocabulary first
            const response = await fetch('hsk_vocabulary_complete.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const completeData = await response.json();
            
            // Convert complete vocabulary format to app format
            this.vocabulary = [];
            Object.keys(completeData.vocabulary).forEach(level => {
                completeData.vocabulary[level].forEach(word => {
                    this.vocabulary.push({
                        character: word.character,
                        pinyin: word.pinyin,
                        english: word.translations.english,
                        spanish: word.translations.spanish,
                        level: parseInt(level),
                        type: word.type,
                        strokes: word.strokes,
                        tones: word.tones,
                        examples: word.examples
                    });
                });
            });
            
            console.log(`[書] Loaded ${this.vocabulary.length} vocabulary items from complete HSK database`);
            console.log(`[^] Distribution: Level 1-6 with ${completeData.metadata.totalWords} total words`);
            
        } catch (error) {
            console.error('[✗] Error loading complete vocabulary:', error);
            // Try fallback to Spanish vocabulary
            try {
                const spanishResponse = await fetch('hsk_vocabulary_spanish.json');
                if (spanishResponse.ok) {
                    this.vocabulary = await spanishResponse.json();
                    console.log(`[書] Loaded ${this.vocabulary.length} vocabulary items (Spanish fallback)`);
                } else {
                    throw new Error('Spanish vocabulary file not found');
                }
            } catch (spanishError) {
                console.error('[✗] Error loading Spanish vocabulary:', spanishError);
                // Try original vocabulary
                try {
                    const originalResponse = await fetch('hsk_vocabulary.json');
                    if (originalResponse.ok) {
                        this.vocabulary = await originalResponse.json();
                        console.log(`[書] Loaded ${this.vocabulary.length} vocabulary items (original fallback)`);
                    } else {
                        throw new Error('All vocabulary files failed to load');
                    }
                } catch (originalError) {
                    console.error('[✗] Error loading original vocabulary:', originalError);
                    // Final fallback vocabulary
                    this.vocabulary = [
                        { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
                        { character: "谢谢", pinyin: "xiè xiè", english: "thank you", spanish: "gracias", level: 1 }
                    ];
                }
            }
        }
    }
    
    createFallbackVocabulary() {
        this.vocabulary = [
            { character: '你', pinyin: 'nǐ', english: 'you', translation: 'tú', level: 1 },
            { character: '好', pinyin: 'hǎo', english: 'good', translation: 'bueno', level: 1 },
            { character: '我', pinyin: 'wǒ', english: 'I/me', translation: 'yo', level: 1 },
            { character: '是', pinyin: 'shì', english: 'to be', translation: 'ser/estar', level: 1 },
            { character: '的', pinyin: 'de', english: 'possessive particle', translation: 'de (partícula)', level: 1 },
            { character: '不', pinyin: 'bù', english: 'not', translation: 'no', level: 1 },
            { character: '在', pinyin: 'zài', english: 'at/in', translation: 'en/estar', level: 1 },
            { character: '有', pinyin: 'yǒu', english: 'to have', translation: 'tener', level: 1 },
            { character: '人', pinyin: 'rén', english: 'person', translation: 'persona', level: 1 },
            { character: '这', pinyin: 'zhè', english: 'this', translation: 'este/esta', level: 1 }
        ];
        console.log('[✓] Fallback vocabulary created');
    }

    // Load user preferences from profile
    loadUserPreferences() {
        if (!this.userProfile) return;
        
        const preferences = this.userProfile.getPreferences();
        
        // Apply language preference
        if (preferences.language && preferences.language !== this.currentLanguage) {
            if (window.languageManager) {
                window.languageManager.setLanguage(preferences.language);
                this.currentLanguage = preferences.language;
            }
        }
        
        // Apply other preferences
        if (preferences.practiceMode) {
            this.practiceMode = preferences.practiceMode;
        }
        
        if (preferences.currentLevel) {
            this.currentLevel = preferences.currentLevel;
        }
        
        if (preferences.isDarkMode !== undefined) {
            this.isDarkMode = preferences.isDarkMode;
        }
        
        if (preferences.isAudioEnabled !== undefined) {
            this.isAudioEnabled = preferences.isAudioEnabled;
        }
        
        console.log('[✓] User preferences loaded:', preferences);
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Tab navigation shortcuts (Alt + number)
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        this.switchTab('practice');
                        e.preventDefault();
                        break;
                    case '2':
                        this.switchTab('browse');
                        e.preventDefault();
                        break;
                    case '3':
                        this.switchTab('quiz');
                        e.preventDefault();
                        break;
                    case '4':
                        this.switchTab('stats');
                        e.preventDefault();
                        break;
                }
            }
            
            // Flashcard controls
            if (this.currentTab === 'practice' && this.currentCard) {
                switch(e.key) {
                    case ' ': // Spacebar to flip
                        this.flipCard();
                        e.preventDefault();
                        break;
                    case '1': // Easy
                        this.handleDifficulty('easy');
                        e.preventDefault();
                        break;
                    case '2': // Good
                        this.handleDifficulty('good');
                        e.preventDefault();
                        break;
                    case '3': // Hard
                        this.handleDifficulty('hard');
                        e.preventDefault();
                        break;
                    case '4': // Again
                        this.handleDifficulty('again');
                        e.preventDefault();
                        break;
                    case 'ArrowRight': // Next card
                        this.nextCard();
                        e.preventDefault();
                        break;
                    case 'ArrowLeft': // Previous card
                        if (this.cardHistory.length > 0) {
                            this.previousCard();
                            e.preventDefault();
                        }
                        break;
                }
            }
            
            // Quiz controls
            if (this.currentTab === 'quiz' && this.quiz.isActive) {
                if (e.key >= '1' && e.key <= '4') {
                    const optionIndex = parseInt(e.key) - 1;
                    const options = document.querySelectorAll('.quiz-option');
                    if (options[optionIndex]) {
                        options[optionIndex].click();
                        e.preventDefault();
                    }
                }
                if (e.key === 'Enter') {
                    const submitBtn = document.getElementById('quiz-submit');
                    const nextBtn = document.getElementById('quiz-next');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    } else if (nextBtn && nextBtn.style.display !== 'none') {
                        nextBtn.click();
                    }
                    e.preventDefault();
                }
            }
            
            // Theme toggle (T key)
            if (e.key === 't' && !e.altKey && !e.ctrlKey) {
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) {
                    themeToggle.click();
                    e.preventDefault();
                }
            }
            
            // Language toggle (L key)
            if (e.key === 'l' && !e.altKey && !e.ctrlKey) {
                const langToggle = document.getElementById('language-toggle');
                if (langToggle) {
                    langToggle.click();
                    e.preventDefault();
                }
            }
            
            // Help dialog (? or h key)
            if (e.key === '?' || e.key === 'h') {
                this.showKeyboardShortcuts();
                e.preventDefault();
            }
        });
    }
    
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Alt + 1-4', action: 'Switch tabs' },
            { key: 'Space', action: 'Flip flashcard' },
            { key: '1-4', action: 'Rate difficulty (Easy/Good/Hard/Again)' },
            { key: '←/→', action: 'Previous/Next card' },
            { key: 'T', action: 'Toggle theme' },
            { key: 'L', action: 'Toggle language' },
            { key: 'H or ?', action: 'Show this help' }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <kbd>${s.key}</kbd>
                            <span>${s.action}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Remove on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    setupEventListeners() {
        // Keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Language toggle
        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = this.languageManager.currentLanguage === 'en' ? 'es' : 'en';
                this.languageManager.setLanguage(newLang);
                this.updateUI();
            });
        }
        
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Practice controls
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextCard());
        }
        
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => this.flipCard());
        }
        
        // Add click handler for flashcard itself
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => {
                if (!this.isFlipped) {
                    this.flipCard();
                }
            });
        }
        
        // Level selector
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', (e) => {
                this.currentLevel = e.target.value;
                this.setupPracticeSession();
            });
        }
        
        // Practice mode
        document.querySelectorAll('input[name="practice-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.practiceMode = e.target.value;
                this.updateCard();
            });
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Language selector - use LanguageManager
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                if (window.languageManager) {
                    window.languageManager.setLanguage(e.target.value);
                    this.currentLanguage = e.target.value;
                    // Update cards after language change
                    if (this.currentWord) {
                        this.updateCard();
                    }
                    if (this.browseState) {
                        this.updateVocabularyCards();
                    }
                }
            });
        }
        
        // Voice selector
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.setVoicePreference(e.target.value);
            });
        }
        
        // Header search functionality
        const headerSearch = document.getElementById('header-search');
        if (headerSearch) {
            headerSearch.addEventListener('input', (e) => {
                this.performHeaderSearch(e.target.value);
            });
            headerSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.switchTab('browse');
                    const browseSearch = document.getElementById('search-input');
                    if (browseSearch) {
                        browseSearch.value = e.target.value;
                        browseSearch.focus();
                        this.filterVocabulary();
                    }
                }
            });
        }
        
        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleAudio());
        }
        
        // Browse functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterVocabulary());
        }
        
        const browseLevelFilter = document.getElementById('browse-level-filter');
        if (browseLevelFilter) {
            browseLevelFilter.addEventListener('change', () => this.filterVocabulary());
        }
        
        // Quiz functionality
        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.startQuiz());
        }
        
        const quizSubmitBtn = document.getElementById('quiz-submit');
        if (quizSubmitBtn) {
            quizSubmitBtn.addEventListener('click', () => this.submitQuizAnswer());
        }
        
        const quizNextBtn = document.getElementById('quiz-next');
        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', () => this.nextQuizQuestion());
        }
        
        const restartQuizBtn = document.getElementById('restart-quiz');
        if (restartQuizBtn) {
            restartQuizBtn.addEventListener('click', () => this.restartQuiz());
        }
        
        // Stats functionality
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', () => this.resetStats());
        }
        
        // Knowledge assessment buttons
        const knowBtn = document.getElementById('know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', () => this.markAsKnown(true));
        }
        
        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => this.markAsKnown(false));
        }
        
        console.log('[✓] Event listeners setup');
    }
    
    // Daily progress management
    updateDailyProgress() {
        const today = new Date().toDateString();
        
        // Reset daily count if it's a new day
        if (this.dailyProgress.lastStudyDate !== today) {
            this.stats.todayCards = 0;
            this.dailyProgress.lastStudyDate = today;
        }
        
        // Increment today's card count
        this.stats.todayCards++;
        
        // Mark today as active in streak
        this.dailyProgress.activeDays.add(today);
        
        console.log(`📊 Daily progress updated: ${this.stats.todayCards} cards today`);
    }
    
    loadDailyProgress() {
        try {
            const saved = localStorage.getItem('hsk-daily-progress');
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    lastStudyDate: data.lastStudyDate || null,
                    activeDays: new Set(data.activeDays || [])
                };
            }
        } catch (error) {
            console.warn('⚠️ Error loading daily progress:', error);
        }
        
        return {
            lastStudyDate: null,
            activeDays: new Set()
        };
    }
    
    saveDailyProgress() {
        try {
            const data = {
                lastStudyDate: this.dailyProgress.lastStudyDate,
                activeDays: Array.from(this.dailyProgress.activeDays)
            };
            localStorage.setItem('hsk-daily-progress', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Error saving daily progress:', error);
        }
    }
    
    updateStreakDisplay() {
        const streakDays = document.querySelectorAll('.streak-day');
        if (!streakDays.length) return;
        
        const today = new Date();
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        
        streakDays.forEach((dayElement, index) => {
            // Calculate the date for this day (going backwards from today)
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() - (6 - index));
            const dateString = dayDate.toDateString();
            
            // Update day letter
            const dayOfWeek = dayDate.getDay();
            dayElement.textContent = dayNames[dayOfWeek];
            
            // Remove existing classes
            dayElement.classList.remove('active', 'today');
            
            // Check if this day has activity
            if (this.dailyProgress.activeDays.has(dateString)) {
                dayElement.classList.add('active');
            }
            
            // Mark today
            if (dateString === today.toDateString()) {
                dayElement.classList.add('today');
            }
        });
        
        console.log('📅 Streak display updated');
    }
    
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Initialize tab-specific content
        switch(tabName) {
            case 'browse':
                this.initializeBrowse();
                break;
            case 'quiz':
                this.initializeQuiz();
                break;
            case 'stats':
                this.updateStats();
                break;
            case 'matrix':
                this.initializeMatrixGame();
                break;
        }
        
        console.log(`🔄 Switched to ${tabName} tab`);
    }
    
    setupPracticeSession() {
        // Wait for vocabulary to load
        if (!this.vocabulary || this.vocabulary.length === 0) {
            console.log('⏳ Waiting for vocabulary to load...');
            setTimeout(() => this.setupPracticeSession(), 500);
            return;
        }
        
        const levelFilter = this.currentLevel === 'all' ? 
            this.vocabulary : 
            this.vocabulary.filter(word => word.level == this.currentLevel);
        
        this.currentSession = [...levelFilter];
        this.sessionIndex = 0;
        
        if (this.currentSession.length > 0) {
            this.currentWord = this.currentSession[0];
            this.isFlipped = false;
            this.updateCard();
            this.updateProgress();
            console.log(`[書] Practice session setup: ${this.currentSession.length} words for level ${this.currentLevel}`);
        } else {
            console.warn('[!] No vocabulary found for current level');
            this.showError(`No vocabulary found for HSK level ${this.currentLevel}`);
        }
    }
    
    updateCard() {
        if (!this.currentWord) {
            console.warn('⚠️ No current word to display');
            return;
        }
        
        const questionText = document.getElementById('question-text');
        const answerText = document.getElementById('answer-text');
        const fullInfo = document.getElementById('full-info');
        const hintText = document.getElementById('hint-text');
        
        if (!questionText || !answerText || !fullInfo) {
            console.warn('⚠️ Card elements not found in DOM');
            return;
        }
        
        let question = '';
        let answer = '';
        let hint = '';
        
        // Get meaning based on selected language
        const meaning = this.getMeaningForLanguage(this.currentWord);
        
        // Default to char-to-english if practiceMode is undefined
        const mode = this.practiceMode || 'char-to-english';
        
        switch(mode) {
            case 'char-to-pinyin':
                question = this.currentWord.character;
                answer = this.currentWord.pinyin;
                hint = meaning;
                break;
            case 'char-to-english':
            default:
                question = this.currentWord.character;
                answer = meaning;
                hint = this.currentWord.pinyin;
                break;
            case 'pinyin-to-char':
                question = this.currentWord.pinyin;
                answer = this.currentWord.character;
                hint = meaning;
                break;
            case 'english-to-char':
                question = meaning;
                answer = this.currentWord.character;
                hint = this.currentWord.pinyin;
                break;
        }
        
        // Update card content
        questionText.textContent = question || '?';
        answerText.textContent = answer || '?';
        if (hintText) hintText.textContent = hint || '';
        
        fullInfo.innerHTML = `
            <div class="word-info-expanded">
                <div class="card-back-header">
                    <div class="card-back-character">${this.currentWord.character || '?'}</div>
                    <div class="card-back-pinyin">${this.currentWord.pinyin || '?'}</div>
                    <button class="card-back-pronunciation" onclick="window.app.playAudio('${this.currentWord.character}')">
                        <span>🔊</span>
                        <span>Pronunciar</span>
                    </button>
                </div>
                
                <div class="translations-section">
                    <div class="translation-item primary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.currentLanguage === 'es' ? '🇪🇸' : '🇬🇧'}</span>
                            <span class="lang-name">${this.currentLanguage === 'es' ? 'Español' : 'English'}</span>
                        </div>
                        <div class="translation-content">${meaning}</div>
                    </div>
                    <div class="translation-item secondary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.currentLanguage === 'es' ? '🇬🇧' : '🇪🇸'}</span>
                            <span class="lang-name">${this.currentLanguage === 'es' ? 'English' : 'Español'}</span>
                        </div>
                        <div class="translation-content">${this.currentLanguage === 'es' ? (this.currentWord.english || '?') : (this.currentWord.spanish || this.currentWord.translation || '?')}</div>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">🏷️</div>
                        <div class="detail-info">
                    <div class="detail-card">
                        <div class="detail-icon">🎵</div>
                        <div class="detail-info">
                            <div class="detail-label">Tonos</div>
                            <div class="detail-value tone-display">${this.getToneMarks(this.currentWord.pinyin) || '?'}</div>
                        </div>
                    </div>
                </div>
                
                ${this.getExampleSentence(this.currentWord)}
            </div>
        `;
        
        // Reset card to front side
        this.resetCardState();
        
        console.log(`🃏 Card updated: ${this.currentWord.character} (${mode})`);
    }
    
    // Helper methods for expanded card content
    getStrokeCount(character) {
        // Approximate stroke count based on character complexity
        const strokeCounts = {
            '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
            '人': 2, '大': 3, '小': 3, '中': 4, '国': 8, '我': 7, '你': 7, '他': 5, '她': 6,
            '好': 6, '不': 4, '是': 9, '的': 8, '在': 6, '有': 6, '了': 2, '会': 6, '说': 14,
            '来': 8, '去': 5, '看': 9, '听': 7, '吃': 6, '喝': 12, '买': 6, '卖': 8, '学': 8,
            '工': 3, '作': 7, '家': 10, '学': 8, '校': 10, '老': 6, '师': 10, '学': 8, '生': 5
        };
        
        if (strokeCounts[character]) {
            return strokeCounts[character];
        }
        
        // Estimate based on character length and complexity
        if (character && character.length === 1) {
            const code = character.charCodeAt(0);
            if (code >= 0x4e00 && code <= 0x9fff) {
                // Simple estimation for Chinese characters
                return Math.floor(Math.random() * 15) + 3; // 3-18 strokes
            }
        }
        return '?';
    }
    
    getWordType(word) {
        const character = word.character;
        const english = word.english?.toLowerCase() || '';
        const pinyin = word.pinyin?.toLowerCase() || '';
        
        // Basic word type classification
        if (english.includes('verb') || english.includes('to ')) {
            return 'Verbo';
        } else if (english.includes('adj') || english.includes('adjective')) {
            return 'Adjetivo';
        } else if (english.includes('noun') || english.includes('person') || english.includes('thing')) {
            return 'Sustantivo';
        } else if (english.includes('number') || /\d/.test(character)) {
            return 'Número';
        } else if (character.length === 1) {
            return 'Carácter';
        } else {
            return 'Palabra';
        }
    }
    
    getToneMarks(pinyin) {
        if (!pinyin) return '?';
        
        const toneMap = {
            'ā': '1', 'á': '2', 'ǎ': '3', 'à': '4', 'a': '0',
            'ē': '1', 'é': '2', 'ě': '3', 'è': '4', 'e': '0',
            'ī': '1', 'í': '2', 'ǐ': '3', 'ì': '4', 'i': '0',
            'ō': '1', 'ó': '2', 'ǒ': '3', 'ò': '4', 'o': '0',
            'ū': '1', 'ú': '2', 'ǔ': '3', 'ù': '4', 'u': '0',
            'ǖ': '1', 'ǘ': '2', 'ǚ': '3', 'ǜ': '4', 'ü': '0'
        };
        
        let tones = [];
        for (let char of pinyin) {
            if (toneMap[char]) {
                tones.push(toneMap[char]);
            }
        }
        
        return tones.length > 0 ? tones.join('') : '0';
    }
    
    getExampleSentence(word) {
        const examples = {
            '你': { chinese: '你好吗？', english: 'How are you?', spanish: '¿Cómo estás?' },
            '好': { chinese: '很好，谢谢。', english: 'Very good, thank you.', spanish: 'Muy bien, gracias.' },
            '我': { chinese: '我是学生。', english: 'I am a student.', spanish: 'Soy estudiante.' },
            '是': { chinese: '他是老师。', english: 'He is a teacher.', spanish: 'Él es profesor.' },
            '的': { chinese: '我的书', english: 'My book', spanish: 'Mi libro' },
            '不': { chinese: '我不知道。', english: 'I don\'t know.', spanish: 'No lo sé.' },
            '在': { chinese: '我在家。', english: 'I am at home.', spanish: 'Estoy en casa.' },
            '有': { chinese: '我有一本书。', english: 'I have a book.', spanish: 'Tengo un libro.' }
        };
        
        const example = examples[word.character];
        if (example) {
            return `
                <div class="example-section">
                    <div class="example-title">💡 Ejemplo de uso:</div>
                    <div class="example-sentence">
                        <div class="example-chinese">${example.chinese}</div>
                        <div class="example-translations">
                            <div class="example-english">🇬🇧 ${example.english}</div>
                            <div class="example-spanish">🇪🇸 ${example.spanish}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="example-section">
                <div class="example-title">💡 Practica con esta palabra</div>
                <div class="practice-tip">
                    Intenta crear una oración usando "${word.character}"
                </div>
            </div>
        `;
    }
    
    resetCardState() {
        const flashcard = document.getElementById('flashcard');
        const flipBtn = document.getElementById('flip-btn');
        
        // Reset flip state
        this.isFlipped = false;
        
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }
        
        // Reset flip button
        if (flipBtn) {
            flipBtn.disabled = false;
            flipBtn.textContent = 'Show Answer';
            flipBtn.style.opacity = '1';
        }
        
        // Disable knowledge assessment buttons
        this.disableKnowledgeButtons();
        
        console.log('🔄 Card reset to front side');
    }
    
    flipCard() {
        const flashcard = document.getElementById('flashcard');
        const flipBtn = document.getElementById('flip-btn');
        
        if (flashcard && !this.isFlipped) {
            flashcard.classList.add('flipped');
            this.isFlipped = true;
            
            // Update button state
            if (flipBtn) {
                flipBtn.disabled = true;
                flipBtn.textContent = 'Answer Shown';
                flipBtn.style.opacity = '0.6';
            }
            
            // Enable knowledge assessment buttons
            this.enableKnowledgeButtons();
            
            // Play audio if enabled and we have a current word
            if (this.isAudioEnabled && this.currentWord) {
                setTimeout(() => {
                    this.playAudio(this.currentWord.character);
                }, 300); // Delay to sync with flip animation
            }
            
            console.log('[卡] Card flipped to show answer');
        }
    }
    
    nextCard() {
        if (this.currentSession.length === 0) return;
        
        this.sessionIndex = (this.sessionIndex + 1) % this.currentSession.length;
        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;
        
        this.updateCard();
        this.updateProgress();
        
        // Update stats
        this.stats.totalCards++;
        this.saveStats();
        this.updateHeaderStats();
    }
    
    // Knowledge assessment functionality
    enableKnowledgeButtons() {
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
        if (knowBtn) {
            knowBtn.disabled = false;
            knowBtn.style.opacity = '1';
        }
        if (dontKnowBtn) {
            dontKnowBtn.disabled = false;
            dontKnowBtn.style.opacity = '1';
        }
        
        console.log('[✓] Knowledge buttons enabled');
    }
    
    disableKnowledgeButtons() {
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
        if (knowBtn) {
            knowBtn.disabled = true;
            knowBtn.style.opacity = '0.6';
        }
        if (dontKnowBtn) {
            dontKnowBtn.disabled = true;
            dontKnowBtn.style.opacity = '0.6';
        }
        
        console.log('🔒 Knowledge buttons disabled');
    }
    
    markAsKnown(isKnown) {
        if (!this.currentWord || !this.isFlipped) return;
        
        // Update local stats for backward compatibility
        if (isKnown) {
            this.stats.correctAnswers++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
            console.log(`[✓] Marked "${this.currentWord.character}" as KNOWN`);
        } else {
            this.stats.currentStreak = 0;
            console.log(`[✗] Marked "${this.currentWord.character}" as NOT KNOWN`);
        }
        
        // Update daily progress - count any interaction (known or not known)
        this.updateDailyProgress();
        
        // Record in user profile if available
        if (this.userProfile) {
            this.userProfile.recordWordStudy(this.currentWord, isKnown, this.practiceMode);
        }
        
        // Save progress
        this.saveStats();
        this.updateHeaderStats();
        this.updateProgress();
        this.updateStreakDisplay();
        
        // Show feedback
        this.showKnowledgeFeedback(isKnown);
        
        // Automatically advance to next card after a short delay
        setTimeout(() => {
            this.nextCard();
        }, 800);
    }
    
    showKnowledgeFeedback(isKnown) {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Create feedback overlay
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isKnown ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            color: white;
            font-size: 2rem;
            font-weight: bold;
            border-radius: 12px;
            z-index: 10;
            animation: feedbackPulse 0.8s ease-out;
        `;
        
        feedback.innerHTML = isKnown ? '[✓] ¡Correcto!' : '[✗] Sigue practicando';
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes feedbackPulse {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        flashcard.style.position = 'relative';
        flashcard.appendChild(feedback);
        
        // Remove feedback after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 800);
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const todayText = document.getElementById('today-progress');
        const legacyText = document.getElementById('progress-text');
        
        // New daily progress UI
        if (progressFill && todayText) {
            const goal = this.stats.dailyGoal || 20;
            const done = this.stats.todayCards || 0;
            const progress = goal > 0 ? Math.min((done / goal) * 100, 100) : 0;
            progressFill.style.width = `${progress}%`;
            todayText.textContent = `${done} / ${goal}`;
            return;
        }
        
        // Legacy session-based progress UI
        if (progressFill && legacyText && this.currentSession && this.currentSession.length > 0) {
            const total = this.currentSession.length;
            const index = (typeof this.sessionIndex === 'number') ? this.sessionIndex : 0;
            const progress = ((index + 1) / total) * 100;
            progressFill.style.width = `${progress}%`;
            legacyText.textContent = `${index + 1}/${total}`;
        }
    }
    
    // Header functionality
    updateHeaderStats() {
        const studiedEl = document.getElementById('header-studied');
        const streakEl = document.getElementById('header-streak');
        const progressEl = document.getElementById('header-progress');

        // Use user profile stats if available, otherwise use local stats
        let stats = this.stats;
        if (this.userProfile && this.userProfile.isAuthenticated()) {
            const profileStats = this.userProfile.getStatistics();
            stats = {
                totalStudied: profileStats.totalStudied,
                currentStreak: profileStats.currentStreak,
                correctAnswers: profileStats.correctAnswers
            };
            
            // Add cloud sync indicator for authenticated users
            const headerStatsEl = document.querySelector('.header-stats');
            if (headerStatsEl && !headerStatsEl.classList.contains('authenticated')) {
                headerStatsEl.classList.add('authenticated');
            }
        }

        if (studiedEl) studiedEl.textContent = stats.totalStudied;
        if (streakEl) streakEl.textContent = stats.currentStreak;
        
        if (progressEl) {
            const progress = stats.totalStudied > 0 ? 
                Math.min((stats.correctAnswers / stats.totalStudied) * 100, 100) : 0;
            progressEl.style.width = `${progress}%`;
        }
    }
    
    performHeaderSearch(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.hideHeaderSearchDropdown();
            return;
        }
        
        // Debounce search
        clearTimeout(this.headerSearchTimeout);
        this.headerSearchTimeout = setTimeout(() => {
            this.showHeaderSearchResults(searchTerm);
        }, 300);
    }
    
    showHeaderSearchResults(searchTerm) {
        try {
            const results = this.vocabulary.filter(word => 
                word.character.includes(searchTerm) ||
                word.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (word.english && word.english.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (word.translation && word.translation.toLowerCase().includes(searchTerm.toLowerCase()))
            ).slice(0, 5);
            
            this.displayHeaderSearchDropdown(results, searchTerm);
        } catch (error) {
            console.warn('⚠️ Error performing header search:', error.message);
        }
    }
    
    displayHeaderSearchDropdown(results, searchTerm) {
        // Remove existing dropdown
        this.hideHeaderSearchDropdown();
        
        if (results.length === 0) return;
        
        const dropdown = document.createElement('div');
        dropdown.id = 'header-search-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--color-border, #e2e8f0);
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 4px;
        `;
        
        results.forEach(word => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            item.innerHTML = `
                <div>
                    <span style="font-size: 1.25rem; font-weight: 600; color: #e11d48;">${word.character}</span>
                    <span style="margin-left: 8px; color: #f59e0b;">${word.pinyin}</span>
                </div>
                <div style="font-size: 0.875rem; color: #64748b;">
                    ${word.english || word.translation}
                </div>
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#fdf2f8';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            item.addEventListener('click', () => {
                this.selectHeaderSearchResult(word);
                this.hideHeaderSearchDropdown();
            });
            
            dropdown.appendChild(item);
        });
        
        const headerSearch = document.getElementById('header-search');
        if (headerSearch && headerSearch.parentElement) {
            headerSearch.parentElement.style.position = 'relative';
            headerSearch.parentElement.appendChild(dropdown);
            
            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', (e) => {
                    if (!headerSearch.parentElement.contains(e.target)) {
                        this.hideHeaderSearchDropdown();
                    }
                }, { once: true });
            }, 100);
        }
    }
    
    hideHeaderSearchDropdown() {
        const existingDropdown = document.getElementById('header-search-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }
    
    selectHeaderSearchResult(word) {
        // Switch to practice tab and set the selected word
        this.switchTab('practice');
        this.currentWord = word;
        this.isFlipped = false;
        this.updateCard();
        
        // Clear search
        const headerSearch = document.getElementById('header-search');
        if (headerSearch) {
            headerSearch.value = '';
        }
        
        console.log(`[#] Selected word from header search: ${word.character}`);
    }
    
    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        localStorage.setItem('hsk-audio-enabled', this.isAudioEnabled.toString());
        this.updateAudioButton();
        
        const message = this.isAudioEnabled ? 'Audio enabled' : 'Audio disabled';
        this.showHeaderNotification(message);
        
        console.log(`🔊 Audio toggled: ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
    }
    
    updateAudioButton() {
        const audioToggle = document.getElementById('audio-toggle');
        if (!audioToggle) return;
        
        const onIcon = audioToggle.querySelector('.audio-on-icon');
        const offIcon = audioToggle.querySelector('.audio-off-icon');
        
        if (onIcon && offIcon) {
            if (this.isAudioEnabled) {
                onIcon.style.display = 'inline';
                offIcon.style.display = 'none';
                audioToggle.classList.add('active');
            } else {
                onIcon.style.display = 'none';
                offIcon.style.display = 'inline';
                audioToggle.classList.remove('active');
            }
        }
    }
    
    showHeaderNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #e11d48;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 2000);
    }
    
    playAudio(text) {
        if (!this.isAudioEnabled || !('speechSynthesis' in window)) {
            console.log('🔇 Audio disabled or not supported');
            return;
        }
        
        try {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            // Wait a bit for cancellation to complete
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.7;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;
                
                // Try to get preferred Chinese voice
                const selectedVoice = this.getPreferredVoice();
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    console.log('🎤 Using voice:', selectedVoice.name);
                }
                
                // Add event listeners for better feedback
                utterance.onstart = () => {
                    console.log('🔊 Playing audio:', text);
                    this.showAudioFeedback(true);
                };
                
                utterance.onerror = (event) => {
                    console.warn('⚠️ Audio error:', event.error);
                    this.showAudioFeedback(false);
                };
                
                utterance.onend = () => {
                    console.log('[✓] Audio playback completed');
                    this.showAudioFeedback(false);
                };
                
                speechSynthesis.speak(utterance);
            }, 100);
        } catch (error) {
            console.warn('⚠️ Audio playback failed:', error);
            this.showAudioFeedback(false);
        }
    }
    
    // Audio Management System
    initializeVoices() {
        if (!('speechSynthesis' in window)) return;
        
        const voices = speechSynthesis.getVoices();
        this.availableVoices = voices;
        
        // Filter Chinese voices
        const chineseVoices = voices.filter(voice => 
            voice.lang.includes('zh') || 
            voice.name.toLowerCase().includes('chinese') ||
            voice.name.toLowerCase().includes('mandarin')
        );
        
        // Try to categorize by gender (this is approximate)
        chineseVoices.forEach(voice => {
            const name = voice.name.toLowerCase();
            if (name.includes('female') || name.includes('woman') || name.includes('mei')) {
                this.chineseVoices.female = voice;
            } else if (name.includes('male') || name.includes('man') || name.includes('wang')) {
                this.chineseVoices.male = voice;
            } else if (!this.chineseVoices.male) {
                // Use first available as male fallback
                this.chineseVoices.male = voice;
            } else if (!this.chineseVoices.female) {
                // Use second available as female fallback
                this.chineseVoices.female = voice;
            }
        });
        
        console.log('🎤 Available Chinese voices:', {
            male: this.chineseVoices.male?.name || 'None',
            female: this.chineseVoices.female?.name || 'None',
            total: chineseVoices.length
        });
    }
    
    getPreferredVoice() {
        switch (this.selectedVoice) {
            case 'male':
                return this.chineseVoices.male || this.chineseVoices.female;
            case 'female':
                return this.chineseVoices.female || this.chineseVoices.male;
            case 'auto':
            default:
                return this.chineseVoices.male || this.chineseVoices.female;
        }
    }
    
    setVoicePreference(voiceType) {
        this.selectedVoice = voiceType;
        localStorage.setItem('hsk-voice-preference', voiceType);
        
        // Test voice with sample
        this.playAudio('你好');
        
        // Show notification
        const voiceNames = {
            male: this.currentLanguage === 'es' ? 'Voz masculina' : 'Male voice',
            female: this.currentLanguage === 'es' ? 'Voz femenina' : 'Female voice',
            auto: this.currentLanguage === 'es' ? 'Voz automática' : 'Auto voice'
        };
        
        const message = `${voiceNames[voiceType]} ${this.currentLanguage === 'es' ? 'seleccionada' : 'selected'}`;
        this.showHeaderNotification(message);
        
        console.log(`🎤 Voice preference set to: ${voiceType}`);
    }
    
    loadVoicePreference() {
        const savedVoice = localStorage.getItem('hsk-voice-preference');
        if (savedVoice) {
            this.selectedVoice = savedVoice;
            console.log(`🎤 Loaded voice preference: ${savedVoice}`);
        }
    }
    
    updateVoiceSelector() {
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.value = this.selectedVoice;
        }
    }
    
    showAudioFeedback(isPlaying) {
        const audioButtons = document.querySelectorAll('.vocab-audio-btn, #audio-toggle');
        audioButtons.forEach(button => {
            if (isPlaying) {
                button.style.animation = 'pulse 1s ease-in-out infinite';
                button.style.color = '#f59e0b';
            } else {
                button.style.animation = '';
                button.style.color = '';
            }
        });
    }
    
    // Language Management System - Use LanguageManager from translations.js
    updateLanguageDisplay() {
        // Update current flashcard if exists
        if (this.currentWord) {
            this.updateCard();
        }
        
        // Update vocabulary cards in browse section
        this.updateVocabularyCards();
    }
    
    getTranslation(key) {
        // Use LanguageManager's translation system
        if (window.languageManager) {
            return window.languageManager.t(key);
        }
        return key; // Fallback to key if no translation found
    }
    
    initializeMatrixGame() {
        // Inicializar el juego de matriz si existe
        if (window.matrixGame) {
            // Pasar el vocabulario actual al juego
            window.matrixGame.vocabulary = this.vocabulary;
            window.matrixGame.showGame();
            console.log('[#] Matrix game initialized');
        } else {
            console.error('[✗] Matrix game not loaded');
        }
    }
    
    getMeaningForLanguage(word) {
        if (this.currentLanguage === 'es') {
            return word.spanish || word.translation || word.english || '?';
        } else {
            return word.english || word.translation || '?';
        }
    }
    
    updateVocabularyCards() {
        // Update all vocabulary cards in browse section
        const vocabCards = document.querySelectorAll('.vocab-card');
        vocabCards.forEach((card, index) => {
            if (this.browseState && this.browseState.displayedItems[index]) {
                const word = this.browseState.displayedItems[index];
                const meaningElement = card.querySelector('.vocab-meaning');
                if (meaningElement) {
                    meaningElement.textContent = this.getMeaningForLanguage(word);
                }
            }
        });
    }
    
    // Browse functionality
    initializeBrowse() {
        this.browseState = {
            filteredVocabulary: [],
            displayedItems: [],
            currentPage: 0,
            itemsPerPage: 20,
            hasMore: true,
            loading: false
        };
        this.filterVocabulary();
        this.setupInfiniteScroll();
    }
    
    setupInfiniteScroll() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        // Remove existing scroll listener
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
        
        this.scrollListener = () => {
            if (this.browseState.loading || !this.browseState.hasMore) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Load more when user is 200px from bottom
            if (scrollTop + windowHeight >= documentHeight - 200) {
                this.loadMoreVocabulary();
            }
        };
        
        window.addEventListener('scroll', this.scrollListener);
    }
    
    loadMoreVocabulary() {
        if (this.browseState.loading || !this.browseState.hasMore) return;
        
        this.browseState.loading = true;
        this.showLoadingIndicator();
        
        const startIndex = this.browseState.currentPage * this.browseState.itemsPerPage;
        const endIndex = startIndex + this.browseState.itemsPerPage;
        const nextBatch = this.browseState.filteredVocabulary.slice(startIndex, endIndex);
        
        if (nextBatch.length === 0) {
            this.browseState.hasMore = false;
            this.hideLoadingIndicator();
            this.showNoMoreItemsIndicator();
            return;
        }
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.renderVocabularyBatch(nextBatch);
            this.browseState.displayedItems.push(...nextBatch);
            this.browseState.currentPage++;
            this.browseState.loading = false;
            this.hideLoadingIndicator();
            
            // Check if we have more items
            if (this.browseState.displayedItems.length >= this.browseState.filteredVocabulary.length) {
                this.browseState.hasMore = false;
                this.showNoMoreItemsIndicator();
            }
        }, 300);
    }
    
    filterVocabulary() {
        const searchInput = document.getElementById('search-input');
        const levelFilter = document.getElementById('browse-level-filter');
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        const browseStats = document.getElementById('browse-stats');
        
        if (!vocabularyGrid) return;
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedLevel = levelFilter ? levelFilter.value : 'all';
        
        let filteredVocab = this.vocabulary;
        
        // Filter by level
        if (selectedLevel !== 'all') {
            filteredVocab = filteredVocab.filter(word => word.level == selectedLevel);
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredVocab = filteredVocab.filter(word =>
                word.character.includes(searchTerm) ||
                word.pinyin.toLowerCase().includes(searchTerm) ||
                (word.english && word.english.toLowerCase().includes(searchTerm)) ||
                (word.translation && word.translation.toLowerCase().includes(searchTerm))
            );
        }
        
        // Reset browse state for new filter
        this.browseState.filteredVocabulary = filteredVocab;
        this.browseState.displayedItems = [];
        this.browseState.currentPage = 0;
        this.browseState.hasMore = filteredVocab.length > 0;
        
        // Update stats
        if (browseStats) {
            browseStats.textContent = `Found ${filteredVocab.length} words`;
        }
        
        // Clear grid and load first batch
        vocabularyGrid.innerHTML = '';
        this.hideNoMoreItemsIndicator();
        
        if (filteredVocab.length > 0) {
            this.loadMoreVocabulary();
        } else {
            this.showNoResultsMessage();
        }
    }
    
    renderVocabularyBatch(words) {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        words.forEach(word => {
            const card = this.createVocabularyCard(word);
            vocabularyGrid.appendChild(card);
        });
    }
    
    createVocabularyCard(word) {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        const meaning = this.getMeaningForLanguage(word);
        card.innerHTML = `
            <div class="vocab-character">${word.character}</div>
            <div class="vocab-pinyin">${word.pinyin}</div>
            <div class="vocab-meaning">${meaning}</div>
            <div class="vocab-level">HSK ${word.level}</div>
            <button class="vocab-audio-btn" title="Play pronunciation">🔊</button>
        `;
        
        // Add click handler for card
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('vocab-audio-btn')) {
                this.selectVocabWord(word);
            }
        });
        
        // Add click handler for audio button
        const audioBtn = card.querySelector('.vocab-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playAudio(word.character);
            });
        }
        
        return card;
    }
    
    showLoadingIndicator() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        let loadingIndicator = document.getElementById('browse-loading');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'browse-loading';
            loadingIndicator.className = 'browse-loading';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading more vocabulary...</div>
            `;
            vocabularyGrid.parentNode.appendChild(loadingIndicator);
        }
        loadingIndicator.style.display = 'flex';
    }
    
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('browse-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    showNoMoreItemsIndicator() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        let noMoreIndicator = document.getElementById('browse-no-more');
        if (!noMoreIndicator) {
            noMoreIndicator = document.createElement('div');
            noMoreIndicator.id = 'browse-no-more';
            noMoreIndicator.className = 'browse-no-more';
            noMoreIndicator.innerHTML = `
                <div class="no-more-text">[✓] All vocabulary loaded!</div>
            `;
            vocabularyGrid.parentNode.appendChild(noMoreIndicator);
        }
        noMoreIndicator.style.display = 'block';
    }
    
    hideNoMoreItemsIndicator() {
        const noMoreIndicator = document.getElementById('browse-no-more');
        if (noMoreIndicator) {
            noMoreIndicator.style.display = 'none';
        }
    }
    
    showNoResultsMessage() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        vocabularyGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No vocabulary found</div>
                <div class="no-results-subtitle">Try adjusting your search or filter</div>
            </div>
        `;
    }
    
    startQuiz() {
        const levelSelect = document.getElementById('quiz-level');
        const questionsSelect = document.getElementById('quiz-questions');
        
        const selectedLevel = levelSelect ? levelSelect.value : '1';
        const numQuestions = questionsSelect ? parseInt(questionsSelect.value) : 10;
        
        // Filter vocabulary by level
        let vocabPool = selectedLevel === 'all' ? 
            this.vocabulary : 
            this.vocabulary.filter(word => word.level == selectedLevel);
        
        // Shuffle and select questions
        vocabPool = vocabPool.sort(() => Math.random() - 0.5);
        this.quiz.questions = vocabPool.slice(0, numQuestions);
        this.quiz.currentQuestion = 0;
        this.quiz.score = 0;
        this.quiz.isActive = true;
        
        // Show quiz container
        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';
        
        this.showQuizQuestion();
    }
    
    showQuizQuestion() {
        const question = this.quiz.questions[this.quiz.currentQuestion];
        const questionDisplay = document.getElementById('quiz-question');
        const optionsContainer = document.getElementById('quiz-options');
        const currentSpan = document.getElementById('quiz-current');
        const totalSpan = document.getElementById('quiz-total');
        const scoreSpan = document.getElementById('quiz-score');
        
        if (currentSpan) currentSpan.textContent = this.quiz.currentQuestion + 1;
        if (totalSpan) totalSpan.textContent = this.quiz.questions.length;
        if (scoreSpan) scoreSpan.textContent = this.quiz.score;
        
        // Show question
        if (questionDisplay) {
            questionDisplay.innerHTML = `
                <div class="quiz-question-text">What does this character mean?</div>
                <div class="quiz-character">${question.character}</div>
                <div class="quiz-pinyin">${question.pinyin}</div>
            `;
        }
        
        // Generate options with guaranteed correct answer
        const correctAnswer = question.english || question.translation;
        const options = this.generateQuizOptions(question, correctAnswer);
        
        // Store correct answer for validation
        this.quiz.correctAnswer = correctAnswer;
        
        // Render options
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'quiz-option';
                optionBtn.textContent = option;
                optionBtn.addEventListener('click', () => {
                    this.selectQuizAnswer(option, correctAnswer);
                });
                optionsContainer.appendChild(optionBtn);
            });
        }
        
        // Reset submit button
        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
        
        this.quiz.selectedAnswer = null;
        
        console.log(`❓ Quiz question ${this.quiz.currentQuestion + 1}: ${question.character} (${correctAnswer})`);
    }
    
    generateQuizOptions(currentWord, correctAnswer) {
        // Get all possible wrong answers
        const allWrongAnswers = this.vocabulary
            .filter(word => word !== currentWord)
            .map(word => word.english || word.translation)
            .filter(meaning => meaning && meaning !== correctAnswer)
            .filter((meaning, index, arr) => arr.indexOf(meaning) === index); // Remove duplicates
        
        // Ensure we have enough wrong answers
        if (allWrongAnswers.length < 3) {
            console.warn('⚠️ Not enough vocabulary for 4 options, using available options');
            // Add some generic wrong answers if needed
            const genericWrongAnswers = ['hello', 'goodbye', 'thank you', 'please', 'sorry', 'yes', 'no'];
            allWrongAnswers.push(...genericWrongAnswers.filter(answer => answer !== correctAnswer));
        }
        
        // Select 3 random wrong answers
        const wrongAnswers = allWrongAnswers
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        // Combine correct and wrong answers
        const allOptions = [correctAnswer, ...wrongAnswers];
        
        // Shuffle all options
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
        
        // Verify correct answer is included
        if (!shuffledOptions.includes(correctAnswer)) {
            console.error('[✗] Correct answer not in options! Adding it back.');
            shuffledOptions[0] = correctAnswer; // Replace first option with correct answer
            shuffledOptions.sort(() => Math.random() - 0.5); // Shuffle again
        }
        
        console.log(`[#] Generated options: [${shuffledOptions.join(', ')}] - Correct: ${correctAnswer}`);
        
        return shuffledOptions;
    }
    
    selectQuizAnswer(selected, correct) {
        this.quiz.selectedAnswer = selected;
        this.quiz.correctAnswer = correct;
        
        // Update UI with clear selection feedback
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.textContent === selected) {
                btn.classList.add('selected');
                // Add selection animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            }
        });
        
        // Enable submit button with visual feedback
        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.add('ready');
            submitBtn.textContent = 'Submit Answer';
        }
        
        console.log(`👆 Selected answer: ${selected} (Correct: ${correct})`);
    }
    
    submitQuizAnswer() {
        if (!this.quiz.selectedAnswer) return;
        
        const isCorrect = this.quiz.selectedAnswer === this.quiz.correctAnswer;
        
        // Update score immediately if correct
        if (isCorrect) {
            this.quiz.score++;
            console.log(`[✓] Correct answer! Score: ${this.quiz.score}/${this.quiz.questions.length}`);
        } else {
            console.log(`[✗] Incorrect answer. Score remains: ${this.quiz.score}/${this.quiz.questions.length}`);
        }
        
        // Update score display immediately
        const scoreSpan = document.getElementById('quiz-score');
        if (scoreSpan) {
            scoreSpan.textContent = this.quiz.score;
        }
        
        // Show correct/incorrect feedback
        document.querySelectorAll('.quiz-option').forEach(btn => {
            if (btn.textContent === this.quiz.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === this.quiz.selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });
        
        // Show feedback message
        this.showQuizFeedback(isCorrect);
        
        // Show next button
        document.getElementById('quiz-submit').style.display = 'none';
        document.getElementById('quiz-next').style.display = 'inline-block';
    }
    
    showQuizFeedback(isCorrect) {
        const quizContent = document.getElementById('quiz-content');
        if (!quizContent) return;
        
        // Remove existing feedback
        const existingFeedback = document.getElementById('quiz-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.id = 'quiz-feedback';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
            <div class="feedback-text">${isCorrect ? 'Correct!' : 'Incorrect'}</div>
            ${!isCorrect ? `<div class="feedback-answer">Correct answer: ${this.quiz.correctAnswer}</div>` : ''}
        `;
        
        quizContent.appendChild(feedback);
        
        // Auto-remove feedback after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.remove();
                    }
                }, 300);
            }
        }, 2000);
    }
    
    nextQuizQuestion() {
        this.quiz.currentQuestion++;
        
        if (this.quiz.currentQuestion >= this.quiz.questions.length) {
            this.showQuizResults();
        } else {
            // Reset button states
            const submitBtn = document.getElementById('quiz-submit');
            const nextBtn = document.getElementById('quiz-next');
            
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.disabled = true;
                submitBtn.classList.remove('ready');
                submitBtn.textContent = 'Select an Answer';
            }
            
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            
            // Clear previous question feedback
            const existingFeedback = document.getElementById('quiz-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            this.showQuizQuestion();
        }
    }
    
    showQuizResults() {
        const percentage = Math.round((this.quiz.score / this.quiz.questions.length) * 100);
        
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        
        document.getElementById('final-score').textContent = `${this.quiz.score}/${this.quiz.questions.length}`;
        document.getElementById('final-percentage').textContent = `${percentage}%`;
        
        // Update stats
        this.stats.quizzesCompleted++;
        this.stats.correctAnswers += this.quiz.score;
        this.saveStats();
    }
    
    restartQuiz() {
        document.getElementById('quiz-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
    }
    
    // Stats functionality
    updateStats() {
        document.getElementById('total-studied').textContent = this.stats.totalStudied;
        document.getElementById('quiz-count').textContent = this.stats.quizzesCompleted;
        document.getElementById('streak-count').textContent = this.stats.currentStreak;
        
        const accuracy = this.stats.totalStudied > 0 ? 
            Math.round((this.stats.correctAnswers / this.stats.totalStudied) * 100) : 0;
        document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
        
        // Update level progress
        this.updateLevelProgress();
    }
    
    updateLevelProgress() {
        const container = document.getElementById('level-progress-bars');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let level = 1; level <= 6; level++) {
            const levelWords = this.vocabulary.filter(word => word.level === level);
            const studiedWords = levelWords.length; // Simplified for now
            const progress = levelWords.length > 0 ? (studiedWords / levelWords.length) * 100 : 0;
            
            const progressBar = document.createElement('div');
            progressBar.className = 'level-progress-item';
            progressBar.innerHTML = `
                <div class="level-label">HSK ${level}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${studiedWords}/${levelWords.length}</div>
            `;
            container.appendChild(progressBar);
        }
    }
    
    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                totalStudied: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0
            };
            this.saveStats();
            this.updateStats();
            this.updateHeaderStats();
        }
    }
    
    // Theme Management System
    initializeTheme() {
        const savedTheme = localStorage.getItem('hsk-theme') || 'dark'; // Default to dark theme
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
        this.updateThemeButton();
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.updateThemeButton();
        localStorage.setItem('hsk-theme', this.isDarkMode ? 'dark' : 'light');
        
        // Show notification
        const message = this.isDarkMode ? 
            this.getTranslation('darkModeActivated') || 'Tema oscuro activado' : 
            this.getTranslation('lightModeActivated') || 'Tema claro activado';
        this.showHeaderNotification(message);
        
        console.log(`🌙 Theme toggled: ${this.isDarkMode ? 'dark' : 'light'}`);
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        
        // Update logo
        const logo = document.getElementById('app-logo-img');
        if (logo) {
            logo.src = this.isDarkMode ? 'logo_appDM.png' : 'logo_appLM.png';
        }
        
        // Update CSS variables for theme
        const root = document.documentElement;
        if (this.isDarkMode) {
            root.style.setProperty('--theme-bg', '#0f0f23');
            root.style.setProperty('--theme-surface', '#1e1e3f');
            root.style.setProperty('--theme-text', '#ffffff');
        } else {
            root.style.setProperty('--theme-bg', '#ffffff');
            root.style.setProperty('--theme-surface', '#f8fafc');
            root.style.setProperty('--theme-text', '#1e293b');
        }
    }
    
    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');
        
        if (lightIcon && darkIcon) {
            if (this.isDarkMode) {
                lightIcon.style.display = 'none';
                darkIcon.style.display = 'inline';
                themeToggle.classList.add('active');
            } else {
                lightIcon.style.display = 'inline';
                darkIcon.style.display = 'none';
                themeToggle.classList.remove('active');
            }
        }
    }
    
    // Language functionality
    changeLanguage(lang) {
        // This would implement language switching
        console.log(`🌐 Language changed to: ${lang}`);
    }
    
    // Data persistence
    loadStats() {
        try {
            const savedStats = localStorage.getItem('hsk-stats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.warn('⚠️ Error loading stats:', error);
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('hsk-stats', JSON.stringify(this.stats));
            this.saveDailyProgress();
            this.updateHeaderStats();
        } catch (error) {
            console.warn('⚠️ Error saving stats:', error);
        }
    }
    
    loadSettings() {
        try {
            // Load audio setting
            const audioEnabled = localStorage.getItem('hsk-audio-enabled');
            if (audioEnabled !== null) {
                this.isAudioEnabled = audioEnabled === 'true';
            }
            
            // Load language setting
            const savedLanguage = localStorage.getItem('hsk-language');
            if (savedLanguage) {
                this.currentLanguage = savedLanguage;
            }
            
            // Load voice preference
            const savedVoice = localStorage.getItem('hsk-voice-preference');
            if (savedVoice) {
                this.selectedVoice = savedVoice;
            }
        } catch (error) {
            console.warn('⚠️ Error loading settings:', error);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded event fired, initializing HSKApp...');
    try {
        window.app = new HSKApp();
        console.log('✅ HSKApp initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing HSKApp:', error);
        console.error('Stack trace:', error.stack);
    }
});

// Backup initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('📄 Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('📄 Document already loaded, initializing immediately');
    setTimeout(() => {
        if (!window.app) {
            console.log('🔧 Backup initialization triggered');
            try {
                window.app = new HSKApp();
                console.log('✅ HSKApp backup initialized successfully');
            } catch (error) {
                console.error('❌ Error in backup initialization:', error);
            }
        }
    }, 100);
}