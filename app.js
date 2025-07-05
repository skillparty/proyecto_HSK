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
        
        // Initialize LanguageManager with safety check
        if (typeof LanguageManager !== 'undefined') {
            this.languageManager = new LanguageManager();
        } else {
            console.warn('LanguageManager not available, creating fallback');
            this.languageManager = {
                t: (key) => key,
                setLanguage: (lang) => console.warn('Language manager not available'),
                updateInterface: () => console.warn('Language manager not available')
            };
        }
        
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
            
            // Inicializar SRS interface después de DOM completo
            setTimeout(() => {
                this.updateSRSInterface();
            }, 100);
            
            this.setupPracticeSession();
        } catch (error) {
            console.error('Error initializing app:', error);
            const errorMsg = this.languageManager.t('loadingError');
            alert(errorMsg);
        }
    }

    async loadVocabulary() {
        try {
            console.log('Loading vocabulary...');
            const response = await fetch('hsk_vocabulary.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.vocabulary = await response.json();
            console.log(`Successfully loaded ${this.vocabulary.length} vocabulary items`);
            
            // Cache the vocabulary for better performance
            this.vocabularyByLevel = {};
            this.vocabulary.forEach(word => {
                if (!this.vocabularyByLevel[word.level]) {
                    this.vocabularyByLevel[word.level] = [];
                }
                this.vocabularyByLevel[word.level].push(word);
            });
            
            // Validate vocabulary structure
            if (this.vocabulary.length > 0) {
                const sample = this.vocabulary[0];
                console.log('Sample vocabulary item:', sample);
                const requiredFields = ['character', 'pinyin', 'level'];
                const missingFields = requiredFields.filter(field => !sample[field]);
                if (missingFields.length > 0) {
                    console.warn('Missing fields in vocabulary:', missingFields);
                }
            }
            
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            // Create fallback vocabulary for testing
            this.vocabulary = [
                { character: '你', pinyin: 'nǐ', english: 'you', translation: 'tú', level: 1 },
                { character: '好', pinyin: 'hǎo', english: 'good', translation: 'bueno', level: 1 },
                { character: '我', pinyin: 'wǒ', english: 'I', translation: 'yo', level: 1 }
            ];
            console.log('Using fallback vocabulary for testing');
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Practice controls
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', (e) => {
                this.selectedLevel = e.target.value;
                this.setupPracticeSession();
            });
        }

        document.querySelectorAll('input[name="practice-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.practiceMode = e.target.value;
                this.setupPracticeSession();
            });
        });

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextCard();
            });
        }

        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                this.doFlip();
            });
        }

        // Flashcard click to flip - Mejorado para permitir volteo en ambas direcciones
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', (e) => {
                // Permitir volteo si no es un botón
                if (e.target.tagName !== 'BUTTON') {
                    this.doFlip();
                }
            });
        }

        const knowBtn = document.getElementById('know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.isFlipped) {
                    console.log('Botón I Know presionado pero tarjeta no está volteada');
                    return;
                }
                console.log('Marcando como conocida y avanzando...');
                this.markAsKnown(true);
                // Avanzar automáticamente a la siguiente tarjeta
                setTimeout(() => {
                    this.nextCard();
                }, 500);
            });
        }

        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.isFlipped) {
                    console.log('Botón I Don\'t Know presionado pero tarjeta no está volteada');
                    return;
                }
                console.log('Marcando como no conocida y avanzando...');
                this.markAsKnown(false);
                // Avanzar automáticamente a la siguiente tarjeta
                setTimeout(() => {
                    this.nextCard();
                }, 500);
            });
        }
        
        // SRS performance buttons
        const srsAgainBtn = document.getElementById('srs-again');
        if (srsAgainBtn) {
            srsAgainBtn.addEventListener('click', () => {
                this.markAsKnown(false, 'again');
            });
        }
        
        const srsHardBtn = document.getElementById('srs-hard');
        if (srsHardBtn) {
            srsHardBtn.addEventListener('click', () => {
                this.markAsKnown(false, 'hard');
            });
        }
        
        const srsGoodBtn = document.getElementById('srs-good');
        if (srsGoodBtn) {
            srsGoodBtn.addEventListener('click', () => {
                this.markAsKnown(true, 'good');
            });
        }
        
        const srsEasyBtn = document.getElementById('srs-easy');
        if (srsEasyBtn) {
            srsEasyBtn.addEventListener('click', () => {
                this.markAsKnown(true, 'easy');
            });
        }
        
        // Toggle SRS mode
        const toggleSrsBtn = document.getElementById('toggle-srs');
        if (toggleSrsBtn) {
            toggleSrsBtn.addEventListener('click', () => {
                this.toggleSRSMode();
            });
        }

        // Browse controls
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterVocabulary(e.target.value);
            });
        }

        const browseLevelFilter = document.getElementById('browse-level-filter');
        if (browseLevelFilter) {
            browseLevelFilter.addEventListener('change', (e) => {
                this.filterByLevel(e.target.value);
            });
        }

        // Quiz controls
        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        const quizSubmitBtn = document.getElementById('quiz-submit');
        if (quizSubmitBtn) {
            quizSubmitBtn.addEventListener('click', () => {
                this.submitQuizAnswer();
            });
        }

        const quizNextBtn = document.getElementById('quiz-next');
        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', () => {
                this.nextQuizQuestion();
            });
        }

        const restartQuizBtn = document.getElementById('restart-quiz');
        if (restartQuizBtn) {
            restartQuizBtn.addEventListener('click', () => {
                this.restartQuiz();
            });
        }

        // Stats controls
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
                    this.resetStats();
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
            });
        }

        // Language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.languageManager.setLanguage(e.target.value);
            });
        }

        // Voice selector
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.voicePreference = e.target.value;
                this.saveVoicePreference();
                this.setupChineseVoice();
                console.log('Voice preference changed to:', this.voicePreference);
            });
        }

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
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-panel').forEach(content => {
            content.classList.remove('active');
        });
        const tabPanel = document.getElementById(tabName);
        if (tabPanel) {
            tabPanel.classList.add('active');
        }

        // Load specific tab content
        if (tabName === 'browse') {
            this.renderBrowseTab();
        } else if (tabName === 'stats') {
            this.updateStatsDisplay();
        }
    }

    getFilteredVocabulary() {
        if (this.selectedLevel === 'all') {
            return [...this.vocabulary];
        }
        
        // Use cached vocabulary by level for better performance
        if (this.vocabularyByLevel && this.vocabularyByLevel[this.selectedLevel]) {
            return [...this.vocabularyByLevel[this.selectedLevel]];
        }
        
        // Fallback to filtering
        return this.vocabulary.filter(word => word.level.toString() === this.selectedLevel);
    }

    setupPracticeSession() {
        console.log('Setting up practice session...');
        const filtered = this.getFilteredVocabulary();
        console.log(`Filtered vocabulary: ${filtered.length} words`);
        
        if (filtered.length === 0) {
            console.warn('No vocabulary words available');
            this.currentSession = [];
            this.currentWord = null;
            this.updateCard();
            return;
        }
        
        // Load ALL words from the selected level, shuffled
        this.currentSession = this.shuffleArray([...filtered]);
        
        console.log(`Practice session created with ${this.currentSession.length} words`);
        this.sessionIndex = 0;
        this.updateProgressBar();
        this.nextCard();
    }

    nextCard() {
        console.log(`Next card called. Session index: ${this.sessionIndex}, Session length: ${this.currentSession.length}`);
        
        // Prevent infinite loop if no words available
        if (!this.currentSession || this.currentSession.length === 0) {
            console.warn('No words available in current session');
            this.currentWord = null;
            this.updateCard();
            this.updateProgressBar();
            this.updateControlButtons();
            return;
        }
        
        if (this.sessionIndex >= this.currentSession.length) {
            console.log('End of session, restarting from beginning');
            this.sessionIndex = 0;
            this.updateProgressBar();
        }

        this.currentWord = this.currentSession[this.sessionIndex];
        console.log('Current word:', this.currentWord);
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

        if (!questionText || !answerText || !flashcard) {
            console.error('Required DOM elements not found for flashcard');
            return;
        }

        // Remove flipped class and reset state
        flashcard.classList.remove('flipped');
        this.isFlipped = false;
        this.originalCardContent = null; // Reset original content

        if (!this.currentWord) {
            questionText.textContent = this.languageManager.t('noWordsAvailable') || 'No words available';
            if (hintText) hintText.textContent = '';
            return;
        }

        // Set question based on practice mode
        switch (this.practiceMode) {
            case 'char-to-pinyin':
                questionText.textContent = this.currentWord.character;
                if (hintText) hintText.textContent = `${this.languageManager.t('level') || 'Level'} ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.pinyin;
                break;
            case 'char-to-english':
                questionText.textContent = this.currentWord.character;
                if (hintText) hintText.textContent = `${this.languageManager.t('level') || 'Level'} ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.english || this.currentWord.translation;
                break;
            case 'pinyin-to-char':
                questionText.textContent = this.currentWord.pinyin;
                if (hintText) hintText.textContent = `${this.languageManager.t('level') || 'Level'} ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.character;
                break;
            case 'english-to-char':
                questionText.textContent = this.currentWord.english || this.currentWord.translation;
                if (hintText) hintText.textContent = `${this.languageManager.t('level') || 'Level'} ${this.currentWord.level}`;
                answerText.textContent = this.currentWord.character;
                break;
        }

        // Set full info for back of card
        if (fullInfo) {
            fullInfo.innerHTML = `
                <div><strong>${this.languageManager.t('character') || 'Character'}</strong> <span class="clickable-character">${this.currentWord.character}</span></div>
                <div><strong>${this.languageManager.t('pinyin') || 'Pinyin'}</strong> ${this.currentWord.pinyin}</div>
                <div><strong>${this.languageManager.t('translation') || 'Translation'}</strong> ${this.currentWord.english || this.currentWord.translation}</div>
                <div><strong>${this.languageManager.t('level') || 'Level'}</strong> ${this.currentWord.level}</div>
            `;
        }
        
        // Update control buttons solo si no está volteada
        if (!this.isFlipped) {
            this.updateControlButtons();
        }
        
        // Add pronunciation to characters (only if not already added)
        requestAnimationFrame(() => {
            const characterElements = document.querySelectorAll('#question-text, #answer-text, .clickable-character');
            characterElements.forEach(el => {
                if (el.textContent.match(/[\u4e00-\u9fff]/) && !el.hasAttribute('data-pronunciation-added')) {
                    this.addPronunciationToCharacter(el, this.currentWord.character);
                    el.setAttribute('data-pronunciation-added', 'true');
                }
            });
        });
    }

    // Método de volteo integrado mejorado
    doFlip() {
        if (!this.currentWord) {
            console.warn('No hay palabra para voltear');
            return;
        }
        
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        // Si ya está volteada, volver al estado original
        if (this.isFlipped) {
            this.resetToQuestion();
            return;
        }
        
        // Efecto visual de volteo elegante
        flashcard.style.transition = 'transform 0.3s ease-in-out';
        flashcard.style.transform = 'scaleX(0)';
        
        setTimeout(() => {
            // Guardar contenido original si no existe
            const cardFront = flashcard.querySelector('.card-front');
            if (cardFront && !this.originalCardContent) {
                this.originalCardContent = cardFront.innerHTML;
            }
            
            if (cardFront) {
                // Mostrar respuesta con estilo
                cardFront.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #e11d48, #be123c);
                        color: white;
                        padding: 2rem;
                        border-radius: 12px;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        font-family: 'Ubuntu Mono', monospace;
                        cursor: pointer;
                    ">
                        <div style="font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: 600; font-family: 'Noto Sans SC', sans-serif;">
                            ${this.currentWord.character}
                        </div>
                        <div style="font-size: 1.8rem; margin-bottom: 1rem; color: #fbbf24; font-weight: 500;">
                            ${this.currentWord.pinyin}
                        </div>
                        <div style="font-size: 1.3rem; text-align: center; line-height: 1.6; background: rgba(255,255,255,0.1); padding: 0.8rem 1.2rem; border-radius: 8px;">
                            ${this.currentWord.english || this.currentWord.translation || 'Sin traducción'}
                        </div>
                        <div style="font-size: 1rem; margin-top: 1rem; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px;">
                            HSK Nivel ${this.currentWord.level}
                        </div>
                        <div style="font-size: 0.9rem; margin-top: 1.5rem; opacity: 0.8; font-style: italic;">
                            Haz click para volver a la pregunta
                        </div>
                    </div>
                `;
            }
            
            // Expandir tarjeta y marcar como volteada
            flashcard.style.transform = 'scaleX(1)';
            flashcard.classList.add('flipped');
            this.isFlipped = true;
            
            // Actualizar botones
            setTimeout(() => {
                this.updateControlButtons();
                console.log('✅ Tarjeta volteada exitosamente');
                
                // Audio si está habilitado
                if (this.isAudioEnabled && this.currentWord) {
                    this.pronounceText(this.currentWord.character);
                }
            }, 300);
            
        }, 150);
    }
    
    // Método para resetear a la pregunta
    resetToQuestion() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        flashcard.style.transition = 'transform 0.3s ease-in-out';
        flashcard.style.transform = 'scaleX(0)';
        
        setTimeout(() => {
            const cardFront = flashcard.querySelector('.card-front');
            if (cardFront && this.originalCardContent) {
                cardFront.innerHTML = this.originalCardContent;
            }
            
            flashcard.style.transform = 'scaleX(1)';
            flashcard.classList.remove('flipped');
            this.isFlipped = false;
            this.updateControlButtons();
            console.log('✅ Tarjeta regresada a pregunta');
        }, 150);
    }
    
    // Método principal de volteo
    flipCard() {
        this.doFlip();
    }

    updateControlButtons() {
        const flipBtn = document.getElementById('flip-btn');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        const flashcard = document.getElementById('flashcard');

        // Verificar si la tarjeta realmente está volteada
        const isFlipped = this.isFlipped && flashcard && flashcard.classList.contains('flipped');

        if (this.currentWord) {
            if (flipBtn) {
                flipBtn.disabled = false;
                flipBtn.style.opacity = '1';
                flipBtn.textContent = isFlipped ? 'Volver' : 'Voltear';
            }
            if (knowBtn) {
                knowBtn.disabled = !isFlipped;
                knowBtn.style.opacity = isFlipped ? '1' : '0.5';
                knowBtn.style.cursor = isFlipped ? 'pointer' : 'not-allowed';
                knowBtn.style.pointerEvents = isFlipped ? 'auto' : 'none';
            }
            if (dontKnowBtn) {
                dontKnowBtn.disabled = !isFlipped;
                dontKnowBtn.style.opacity = isFlipped ? '1' : '0.5';
                dontKnowBtn.style.cursor = isFlipped ? 'pointer' : 'not-allowed';
                dontKnowBtn.style.pointerEvents = isFlipped ? 'auto' : 'none';
            }
        } else {
            if (flipBtn) {
                flipBtn.disabled = true;
                flipBtn.style.opacity = '0.5';
            }
            if (knowBtn) {
                knowBtn.disabled = true;
                knowBtn.style.opacity = '0.5';
                knowBtn.style.pointerEvents = 'none';
            }
            if (dontKnowBtn) {
                dontKnowBtn.disabled = true;
                dontKnowBtn.style.opacity = '0.5';
                dontKnowBtn.style.pointerEvents = 'none';
            }
        }
        
        console.log('Botones actualizados:', {
            isFlipped: isFlipped,
            knowBtnDisabled: knowBtn ? knowBtn.disabled : 'N/A',
            dontKnowBtnDisabled: dontKnowBtn ? dontKnowBtn.disabled : 'N/A'
        });
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
        
        if (!progressFill || !progressText) return;
        
        if (!this.currentSession || this.currentSession.length === 0) {
            progressFill.style.width = '0%';
            progressText.textContent = '0/0';
            return;
        }
        
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
            
            // Filter Chinese voices with comprehensive detection
            const chineseVoices = voices.filter(voice => {
                const name = voice.name.toLowerCase();
                const lang = voice.lang.toLowerCase();
                return (
                    lang.includes('zh') || 
                    lang.includes('zh-cn') ||
                    lang.includes('zh-tw') ||
                    lang.includes('zh-hk') ||
                    lang.includes('cmn') ||
                    name.includes('chinese') ||
                    name.includes('mandarin') ||
                    name.includes('台灣') ||
                    name.includes('中文') ||
                    name.includes('普通话') ||
                    name.includes('国语')
                );
            });
            
            console.log('ALL Available voices:', voices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
            console.log('Chinese voices found:', chineseVoices.map(v => `${v.name} (${v.lang})`));
            console.log('Voice preference:', this.voicePreference);
            
            let selectedVoice = null;
            
            if (this.voicePreference === 'female') {
                // More comprehensive female voice detection
                selectedVoice = chineseVoices.find(voice => {
                    const name = voice.name.toLowerCase();
                    // Common female voice names across platforms
                    return (
                        name.includes('female') ||
                        name.includes('woman') ||
                        name.includes('femenina') ||
                        name.includes('mujer') ||
                        name.includes('女') ||
                        name.includes('xiaoxiao') ||
                        name.includes('xiaoyi') ||
                        name.includes('xiaochen') ||
                        name.includes('xiaomei') ||
                        name.includes('xiaolin') ||
                        name.includes('hanhan') ||
                        name.includes('yaoyao') ||
                        name.includes('tingting') ||
                        name.includes('huihui') ||
                        name.includes('siqi') ||
                        name.includes('siri') && lang.includes('zh') ||
                        name.includes('ava') && lang.includes('zh') ||
                        name.includes('karen') && lang.includes('zh') ||
                        name.includes('moira') && lang.includes('zh') ||
                        name.includes('samantha') && lang.includes('zh') ||
                        name.includes('tessa') && lang.includes('zh')
                    );
                });
                
                // macOS specific: Try to find Siri female voices
                if (!selectedVoice) {
                    selectedVoice = chineseVoices.find(voice => {
                        const name = voice.name.toLowerCase();
                        return name.includes('siri') && (name.includes('female') || !name.includes('male'));
                    });
                }
                
                // If still no female voice, try voices that end with common female indicators
                if (!selectedVoice) {
                    selectedVoice = chineseVoices.find(voice => {
                        const name = voice.name.toLowerCase();
                        return name.endsWith('female') || name.endsWith('f') || 
                               name.match(/\s+f$/i) || name.match(/_f$/i);
                    });
                }
                
                // Try to exclude explicitly male voices
                if (!selectedVoice) {
                    const nonMaleVoices = chineseVoices.filter(voice => {
                        const name = voice.name.toLowerCase();
                        return !name.includes('male') && !name.includes('man') && 
                               !name.includes('masculino') && !name.includes('男');
                    });
                    if (nonMaleVoices.length > 0) {
                        // Prefer the last one as it's often female
                        selectedVoice = nonMaleVoices[nonMaleVoices.length - 1];
                    }
                }
                
            } else if (this.voicePreference === 'male') {
                // Male voice detection
                selectedVoice = chineseVoices.find(voice => {
                    const name = voice.name.toLowerCase();
                    return (
                        name.includes('male') && !name.includes('female') ||
                        name.includes('man') && !name.includes('woman') ||
                        name.includes('masculino') ||
                        name.includes('hombre') ||
                        name.includes('男') ||
                        name.includes('yunxi') ||
                        name.includes('kangkang') ||
                        name.includes('daniel') && lang.includes('zh') ||
                        name.includes('thomas') && lang.includes('zh') ||
                        name.includes('alex') && lang.includes('zh')
                    );
                });
                
                // macOS specific: Try to find Siri male voices
                if (!selectedVoice) {
                    selectedVoice = chineseVoices.find(voice => {
                        const name = voice.name.toLowerCase();
                        return name.includes('siri') && name.includes('male');
                    });
                }
                
                // If no explicit male, use first Chinese voice
                if (!selectedVoice && chineseVoices.length > 0) {
                    selectedVoice = chineseVoices[0];
                }
            }
            
            // Auto mode or fallback
            if (!selectedVoice && chineseVoices.length > 0) {
                selectedVoice = chineseVoices[0];
            }
            
            // Final fallback to any available voice
            this.chineseVoice = selectedVoice || voices[0];
            
            console.log('SELECTED VOICE:', {
                name: this.chineseVoice?.name,
                lang: this.chineseVoice?.lang,
                localService: this.chineseVoice?.localService,
                preference: this.voicePreference
            });
                       
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
            audioIcon.textContent = '♪';
            audioBtn.title = this.languageManager.t('disableAudio');
        } else {
            audioBtn.classList.add('muted');
            audioIcon.textContent = '♪';
            audioBtn.title = this.languageManager.t('enableAudio');
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
        const modeKey = this.srsMode ? 'srsAdvanced' : 'simple';
        const mode = this.languageManager.t(modeKey);
        this.showNotification(this.languageManager.t('modeActivated', {mode: mode}), 'info');
    }

    updateSRSInterface() {
        if (document.readyState !== 'complete') {
            console.warn('DOM not ready, deferring SRS interface update.');
            document.addEventListener('DOMContentLoaded', () => this.updateSRSInterface());
            return;
        }

        console.log('🔧 updateSRSInterface called');
        
        try {
            const srsButtons = document.getElementById('srs-buttons');
            const simpleButtons = document.getElementById('simple-buttons');
            const toggleButton = document.getElementById('toggle-srs');

            if (!srsButtons || !simpleButtons || !toggleButton) {
                console.warn('❌ SRS elements not found. App will function without SRS UI changes.');
                return;
            }

            if (this.srsMode) {
                srsButtons.style.display = 'flex';
                simpleButtons.style.display = 'none';
                toggleButton.textContent = 'Simple Mode';
                toggleButton.title = 'Switch to Simple Mode';
            } else {
                srsButtons.style.display = 'none';
                simpleButtons.style.display = 'flex';
                toggleButton.textContent = 'SRS Mode';
                toggleButton.title = 'Switch to SRS Mode';
            }

            console.log('✅ SRS Interface updated successfully');

        } catch (error) {
            console.error('❌ Critical error in updateSRSInterface:', error);
        }
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
        if (questionText && questionText.textContent === '点击\"Siguiente\" para comenzar') {
            questionText.textContent = this.languageManager.t('clickToStart');
        }
        
        // Force update of all i18n elements
        this.languageManager.updateInterface();
    }

    // Add pronunciation to character display
    addPronunciationToCharacter(element, character) {
        if (!this.isAudioEnabled || !character) return;
        
        // Add click listener for pronunciation
        element.style.cursor = 'pointer';
        element.title = this.languageManager.t('clickToPronounce');
        
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
            installBtn.innerHTML = '📱 ' + this.languageManager.t('installApp');
            installBtn.title = this.languageManager.t('installAppDescription');
            
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
    try {
        // Check if required dependencies are available
        if (typeof translations === 'undefined') {
            console.warn('Translations not loaded, using English fallback');
            window.translations = { es: {}, en: {} };
        }
        
        // Initialize the app
        const app = new HSKApp();
        
        // Make app globally available for debugging
        window.app = app;
        
        // Simple welcome message (optional)
        setTimeout(() => {
            if (!localStorage.getItem('hsk-app-welcomed')) {
                console.log('¡Bienvenido a HSK Learning! - Desarrollado por Jose Alejandro Rollano Revollo');
                localStorage.setItem('hsk-app-welcomed', 'true');
            }
        }, 1000);
        
        console.log('✅ HSK Learning App initialized successfully');
        
    } catch (error) {
        console.error('❌ Critical error initializing HSK Learning App:', error);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
            max-width: 90%;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ Application Error</h3>
            <p>The HSK Learning app encountered an error during initialization.</p>
            <p>Please refresh the page or check your browser console for details.</p>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }
});
