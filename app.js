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
        
        // Initialize hash navigation
        this.initializeHashNavigation();
        
        this.init();
    }
    
    initializeHashNavigation() {
        // Handle initial hash
        window.addEventListener('load', () => {
            const hash = window.location.hash.substring(1);
            if (hash && ['practice', 'browse', 'quiz', 'stats'].includes(hash)) {
                setTimeout(() => {
                    this.switchTab(hash);
                }, 500);
            }
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash && ['practice', 'browse', 'quiz', 'stats'].includes(hash)) {
                this.switchTab(hash);
            }
        });
    }
    
    showInitializationSuccess() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.innerHTML = `
            ✅ HSK Learning cargado correctamente<br>
            <small>¡Listo para aprender chino!</small>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    handleInitializationError(error) {
        console.error('🚨 Critical initialization error:', error);
        
        // Try to show user-friendly error message
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ef4444;
            color: white;
            padding: 24px;
            border-radius: 12px;
            font-family: var(--font-family-primary);
            text-align: center;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
        `;
        
        errorContainer.innerHTML = `
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">❌ Error de Inicialización</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">
                La aplicación HSK Learning no pudo inicializarse correctamente.
            </p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ef4444;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
            ">
                🔄 Recargar Página
            </button>
        `;
        
        document.body.appendChild(errorContainer);
        
        // Also try to provide fallback functionality
        this.initializeMinimalFunctionality();
    }
    
    initializeMinimalFunctionality() {
        console.log('🔄 Attempting to initialize minimal functionality...');
        
        try {
            // Ensure basic vocabulary exists
            if (!this.vocabulary || this.vocabulary.length === 0) {
                this.createFallbackVocabulary();
            }
            
            // Try to setup basic event listeners
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    console.log('Next button clicked - minimal mode');
                    this.nextWord();
                });
            }
            
            const flipBtn = document.getElementById('flip-btn');
            if (flipBtn) {
                flipBtn.addEventListener('click', () => {
                    console.log('Flip button clicked - minimal mode');
                    this.flipCard();
                });
            }
            
            // Try to show first word
            if (this.vocabulary && this.vocabulary.length > 0) {
                this.currentWord = this.vocabulary[0];
                this.displayCurrentWord();
            }
            
            console.log('✅ Minimal functionality initialized');
            
        } catch (minimalError) {
            console.error('❌ Even minimal functionality failed:', minimalError);
        }
    }

    async init() {
        try {
            console.log('🚀 Initializing HSK Learning App...');
            
            // Step 1: Load vocabulary with retry mechanism
            await this.loadVocabulary();
            console.log('✅ Vocabulary loaded successfully');
            
            // Step 2: Setup event listeners with error handling
            this.setupEventListeners();
            console.log('✅ Event listeners setup complete');
            
            // Step 3: Initialize UI components
            this.initializeTabs();
            console.log('✅ Tabs initialized');
            
            this.initializeTheme();
            console.log('✅ Theme initialized');
            
            this.initializeAudio();
            console.log('✅ Audio initialized');
            
            // Step 4: Update interface language
            try {
                this.languageManager.updateInterface();
                console.log('✅ Interface language updated');
            } catch (langError) {
                console.warn('⚠️ Language update failed, continuing with defaults:', langError.message);
            }
            
            // Step 5: Initialize content areas
            try {
                this.renderBrowseTab();
                console.log('✅ Browse tab rendered');
            } catch (browseError) {
                console.warn('⚠️ Browse tab rendering failed:', browseError.message);
            }
            
            try {
                this.updateStatsDisplay();
                console.log('✅ Stats display updated');
            } catch (statsError) {
                console.warn('⚠️ Stats display update failed:', statsError.message);
            }
            
            // Step 6: Initialize SRS interface with delay
            setTimeout(() => {
                try {
                    this.updateSRSInterface();
                    console.log('✅ SRS interface initialized');
                } catch (srsError) {
                    console.warn('⚠️ SRS interface initialization failed:', srsError.message);
                }
            }, 100);
            
            // Step 7: Setup practice session
            try {
                this.setupPracticeSession();
                console.log('✅ Practice session setup complete');
            } catch (practiceError) {
                console.warn('⚠️ Practice session setup failed:', practiceError.message);
            }
            
            console.log('🎉 HSK Learning App initialized successfully!');
            
            // Show success indicator
            this.showInitializationSuccess();
            
        } catch (error) {
            console.error('❌ Critical error initializing app:', error);
            this.handleInitializationError(error);
        }
    }

    async loadVocabulary() {
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`📚 Loading vocabulary... (attempt ${retryCount + 1}/${maxRetries})`);
                
                const response = await fetch('hsk_vocabulary.json', {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                }
                
                const vocabularyData = await response.json();
                
                // Validate vocabulary data
                if (!Array.isArray(vocabularyData) || vocabularyData.length === 0) {
                    throw new Error('Invalid vocabulary data: not an array or empty');
                }
                
                this.vocabulary = vocabularyData;
                console.log(`✅ Successfully loaded ${this.vocabulary.length} vocabulary items`);
                
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
                    const requiredFields = ['character', 'pinyin', 'level'];
                    const missingFields = requiredFields.filter(field => !sample[field]);
                    
                    if (missingFields.length > 0) {
                        console.warn('⚠️ Missing fields in vocabulary:', missingFields);
                    } else {
                        console.log('✅ Vocabulary structure validation passed');
                    }
                }
                
                // Success - break out of retry loop
                return;
                
            } catch (error) {
                retryCount++;
                console.error(`❌ Error loading vocabulary (attempt ${retryCount}):`, error.message);
                
                if (retryCount < maxRetries) {
                    console.log(`🔄 Retrying in ${retryCount * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
                } else {
                    console.error('❌ All vocabulary loading attempts failed, using fallback');
                    this.createFallbackVocabulary();
                }
            }
        }
    }
    
    createFallbackVocabulary() {
        console.log('🔄 Creating fallback vocabulary for basic functionality...');
        
        this.vocabulary = [
            { character: '你', pinyin: 'nǐ', english: 'you', translation: 'tú', level: 1 },
            { character: '好', pinyin: 'hǎo', english: 'good', translation: 'bueno', level: 1 },
            { character: '我', pinyin: 'wǒ', english: 'I', translation: 'yo', level: 1 },
            { character: '是', pinyin: 'shì', english: 'to be', translation: 'ser/estar', level: 1 },
            { character: '的', pinyin: 'de', english: 'possessive particle', translation: 'de (partícula)', level: 1 },
            { character: '不', pinyin: 'bù', english: 'not', translation: 'no', level: 1 },
            { character: '在', pinyin: 'zài', english: 'at/in', translation: 'en/estar', level: 1 },
            { character: '有', pinyin: 'yǒu', english: 'to have', translation: 'tener', level: 1 },
            { character: '人', pinyin: 'rén', english: 'person', translation: 'persona', level: 1 },
            { character: '这', pinyin: 'zhè', english: 'this', translation: 'este/esta', level: 1 }
        ];
        
        // Cache the fallback vocabulary
        this.vocabularyByLevel = { 1: this.vocabulary };
        
        console.log(`✅ Fallback vocabulary created with ${this.vocabulary.length} basic words`);
        
        // Show user notification about fallback mode
        this.showFallbackNotification();
    }
    
    showFallbackNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            ⚠️ Modo de vocabulario limitado<br>
            <small>Usando vocabulario básico de respaldo</small>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    setupEventListeners() {
        // Tab navigation with improved error handling
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                
                if (!tabName) {
                    console.error('❌ Tab button missing data-tab attribute');
                    return;
                }
                
                // Add loading state to button
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.style.opacity = '0.7';
                
                // Switch tab with timeout protection
                const switchTimeout = setTimeout(() => {
                    console.warn('⚠️ Tab switch timeout, restoring button');
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 3000);
                
                try {
                    this.switchTab(tabName);
                    clearTimeout(switchTimeout);
                    btn.disabled = false;
                    btn.style.opacity = '1';
                } catch (error) {
                    clearTimeout(switchTimeout);
                    console.error('❌ Error in tab click handler:', error);
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            });
            
            // Add keyboard navigation support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Enhanced Level Selector with robust error handling
        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            let debounceTimer;
            let isProcessing = false;
            
            levelSelect.addEventListener('change', (e) => {
                try {
                    if (isProcessing) {
                        console.log('⏳ Level change already in progress, skipping...');
                        return;
                    }
                    
                    const newLevel = e.target.value;
                    console.log(`🔄 Level selector changed to: ${newLevel}`);
                    
                    // Validate level value
                    const validLevels = ['all', '1', '2', '3', '4', '5', '6'];
                    if (!validLevels.includes(newLevel)) {
                        console.error('❌ Invalid level selected:', newLevel);
                        this.showControlError('Nivel HSK inválido seleccionado');
                        return;
                    }
                    
                    // Add loading state to selector
                    const originalText = levelSelect.options[levelSelect.selectedIndex].text;
                    levelSelect.disabled = true;
                    this.addLoadingIndicator(levelSelect);
                    
                    // Update selected level
                    this.selectedLevel = newLevel;
                    
                    // Use debounce to avoid multiple executions
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        try {
                            isProcessing = true;
                            
                            // Setup new practice session
                            await this.setupPracticeSession();
                            
                            // Update UI elements
                            this.updateLevelDependentUI();
                            
                            console.log(`✅ Level changed successfully to: ${newLevel}`);
                            
                        } catch (error) {
                            console.error('❌ Error setting up practice session:', error);
                            this.showControlError('Error al cambiar nivel HSK');
                            
                            // Revert to previous level if possible
                            this.revertLevelSelection(levelSelect);
                            
                        } finally {
                            isProcessing = false;
                            levelSelect.disabled = false;
                            this.removeLoadingIndicator(levelSelect);
                        }
                    }, 150);
                    
                } catch (error) {
                    console.error('❌ Error in level selector handler:', error);
                    this.showControlError('Error en selector de nivel');
                    levelSelect.disabled = false;
                    this.removeLoadingIndicator(levelSelect);
                }
            });
            
            // Add keyboard navigation support
            levelSelect.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    levelSelect.dispatchEvent(new Event('change'));
                }
            });
            
            // Add visual feedback on focus
            levelSelect.addEventListener('focus', () => {
                levelSelect.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            });
            
            levelSelect.addEventListener('blur', () => {
                levelSelect.style.boxShadow = '';
            });
        }

        // Enhanced Practice Mode Radio Buttons
        const practiceRadios = document.querySelectorAll('input[name="practice-mode"]');
        if (practiceRadios.length > 0) {
            practiceRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    try {
                        const newMode = e.target.value;
                        console.log(`🔄 Practice mode changed to: ${newMode}`);
                        
                        // Validate practice mode
                        const validModes = ['char-to-pinyin', 'char-to-english', 'pinyin-to-char', 'english-to-char'];
                        if (!validModes.includes(newMode)) {
                            console.error('❌ Invalid practice mode:', newMode);
                            this.showControlError('Modo de práctica inválido');
                            return;
                        }
                        
                        // Add visual feedback
                        const label = radio.closest('.mode-option') || radio.nextElementSibling;
                        if (label) {
                            label.style.transform = 'scale(1.05)';
                            setTimeout(() => {
                                label.style.transform = '';
                            }, 200);
                        }
                        
                        // Update practice mode
                        this.practiceMode = newMode;
                        
                        // Setup new session with new mode
                        this.setupPracticeSession();
                        
                        // Update current card display
                        if (this.currentWord) {
                            this.updateCard();
                        }
                        
                        console.log(`✅ Practice mode changed successfully to: ${newMode}`);
                        
                    } catch (error) {
                        console.error('❌ Error in practice mode handler:', error);
                        this.showControlError('Error al cambiar modo de práctica');
                    }
                });
                
                // Add keyboard navigation support
                radio.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change'));
                    }
                });
                
                // Add visual feedback on focus
                radio.addEventListener('focus', () => {
                    const label = radio.closest('.mode-option') || radio.nextElementSibling;
                    if (label) {
                        label.style.outline = '2px solid var(--color-primary-500)';
                        label.style.outlineOffset = '2px';
                    }
                });
                
                radio.addEventListener('blur', () => {
                    const label = radio.closest('.mode-option') || radio.nextElementSibling;
                    if (label) {
                        label.style.outline = '';
                        label.style.outlineOffset = '';
                    }
                });
            });
        } else {
            console.warn('⚠️ No practice mode radio buttons found');
            this.showControlError('Controles de modo de práctica no encontrados');
        }

        // Enhanced Next Button with error handling
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    console.log('🔄 Next button clicked');
                    
                    // Add loading state
                    const originalText = nextBtn.textContent;
                    nextBtn.disabled = true;
                    nextBtn.textContent = 'Cargando...';
                    
                    // Execute with timeout protection
                    const timeout = setTimeout(() => {
                        nextBtn.disabled = false;
                        nextBtn.textContent = originalText;
                        console.warn('⚠️ Next button timeout, restoring state');
                    }, 3000);
                    
                    this.nextCard();
                    
                    // Restore button state
                    clearTimeout(timeout);
                    setTimeout(() => {
                        nextBtn.disabled = false;
                        nextBtn.textContent = originalText;
                    }, 300);
                    
                } catch (error) {
                    console.error('❌ Error in next button handler:', error);
                    nextBtn.disabled = false;
                    nextBtn.textContent = 'Siguiente';
                    this.showFlashcardError('Error al avanzar a la siguiente palabra');
                }
            });
        }

        // Enhanced Flip Button with error handling
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Flip button clicked');
                    
                    // Add visual feedback
                    flipBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        flipBtn.style.transform = '';
                    }, 150);
                    
                    this.doFlip();
                    
                } catch (error) {
                    console.error('❌ Error in flip button handler:', error);
                    this.showFlashcardError('Error al voltear la tarjeta');
                }
            });
            
            // Add keyboard support for flip button
            flipBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    flipBtn.click();
                }
            });
        }

        // Enhanced Flashcard click to flip with better event handling
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', (e) => {
                try {
                    // Permitir volteo si no es un botón y no está en estado de carga
                    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                        console.log('🔄 Flashcard clicked for flip');
                        
                        // Add ripple effect
                        this.addRippleEffect(flashcard, e);
                        
                        // Delay flip slightly for visual feedback
                        setTimeout(() => {
                            this.doFlip();
                        }, 100);
                    }
                } catch (error) {
                    console.error('❌ Error in flashcard click handler:', error);
                    this.showFlashcardError('Error al interactuar con la tarjeta');
                }
            });
            
            // Add hover effects
            flashcard.addEventListener('mouseenter', () => {
                if (!this.isFlipped) {
                    flashcard.style.transform = 'translateY(-2px)';
                    flashcard.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }
            });
            
            flashcard.addEventListener('mouseleave', () => {
                if (!this.isFlipped) {
                    flashcard.style.transform = '';
                    flashcard.style.boxShadow = '';
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
        
        // Enhanced SRS performance buttons with feedback and validation
        const srsButtons = [
            { id: 'srs-again', performance: 'again', known: false, label: 'Again' },
            { id: 'srs-hard', performance: 'hard', known: false, label: 'Hard' },
            { id: 'srs-good', performance: 'good', known: true, label: 'Good' },
            { id: 'srs-easy', performance: 'easy', known: true, label: 'Easy' }
        ];
        
        srsButtons.forEach(({ id, performance, known, label }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', (e) => {
                    try {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log(`🎯 SRS ${label} button clicked`);
                        
                        // Validate that we have a current word and it's flipped
                        if (!this.currentWord) {
                            console.warn('⚠️ No current word for SRS rating');
                            this.showControlError('No hay palabra actual para evaluar');
                            return;
                        }
                        
                        if (!this.isFlipped) {
                            console.warn('⚠️ Card not flipped, cannot rate');
                            this.showControlError('Voltea la tarjeta antes de evaluar');
                            return;
                        }
                        
                        // Add visual feedback
                        button.style.transform = 'scale(0.95)';
                        button.style.opacity = '0.8';
                        
                        // Mark as known with performance rating
                        this.markAsKnown(known, performance);
                        
                        // Show success feedback
                        this.showSRSFeedback(performance, label);
                        
                        // Restore button appearance
                        setTimeout(() => {
                            button.style.transform = '';
                            button.style.opacity = '';
                        }, 200);
                        
                        console.log(`✅ SRS rating ${performance} applied successfully`);
                        
                    } catch (error) {
                        console.error(`❌ Error in SRS ${label} button:`, error);
                        this.showControlError(`Error al aplicar calificación ${label}`);
                        button.style.transform = '';
                        button.style.opacity = '';
                    }
                });
                
                // Add keyboard support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
                
                // Add hover effects
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = '';
                });
                
                // Add focus effects
                button.addEventListener('focus', () => {
                    button.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                });
                
                button.addEventListener('blur', () => {
                    button.style.boxShadow = '';
                });
            }
        });
        
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

        // Enhanced Theme Toggle with animations and error handling
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    console.log('🌓 Theme toggle clicked');
                    
                    // Add click animation
                    themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
                    
                    // Toggle theme
                    this.toggleTheme();
                    
                    // Restore button animation
                    setTimeout(() => {
                        themeToggle.style.transform = '';
                    }, 300);
                    
                    console.log('✅ Theme toggled successfully');
                    
                } catch (error) {
                    console.error('❌ Error toggling theme:', error);
                    this.showControlError('Error al cambiar tema');
                    themeToggle.style.transform = '';
                }
            });
            
            // Add keyboard support
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    themeToggle.click();
                }
            });
            
            // Add hover effects
            themeToggle.addEventListener('mouseenter', () => {
                themeToggle.style.transform = 'scale(1.1)';
            });
            
            themeToggle.addEventListener('mouseleave', () => {
                themeToggle.style.transform = '';
            });
            
            // Add focus effects
            themeToggle.addEventListener('focus', () => {
                themeToggle.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            });
            
            themeToggle.addEventListener('blur', () => {
                themeToggle.style.boxShadow = '';
            });
        }

        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
            });
        }

        // Enhanced Language Selector with validation and feedback
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                try {
                    const newLanguage = e.target.value;
                    console.log(`🌐 Language selector changed to: ${newLanguage}`);
                    
                    // Validate language
                    const validLanguages = ['es', 'en'];
                    if (!validLanguages.includes(newLanguage)) {
                        console.error('❌ Invalid language selected:', newLanguage);
                        this.showControlError('Idioma inválido seleccionado');
                        return;
                    }
                    
                    // Add loading state
                    languageSelect.disabled = true;
                    this.addLoadingIndicator(languageSelect);
                    
                    // Change language
                    this.languageManager.setLanguage(newLanguage);
                    
                    // Show success feedback
                    this.showControlSuccess(`Idioma cambiado a ${newLanguage === 'es' ? 'Español' : 'English'}`);
                    
                    console.log(`✅ Language changed successfully to: ${newLanguage}`);
                    
                } catch (error) {
                    console.error('❌ Error changing language:', error);
                    this.showControlError('Error al cambiar idioma');
                } finally {
                    setTimeout(() => {
                        languageSelect.disabled = false;
                        this.removeLoadingIndicator(languageSelect);
                    }, 500);
                }
            });
            
            // Add keyboard support
            languageSelect.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    languageSelect.dispatchEvent(new Event('change'));
                }
            });
            
            // Add focus effects
            languageSelect.addEventListener('focus', () => {
                languageSelect.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            });
            
            languageSelect.addEventListener('blur', () => {
                languageSelect.style.boxShadow = '';
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
        console.log('🧭 Initializing tab navigation...');
        try {
            this.switchTab('practice');
            console.log('✅ Tab navigation initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing tabs:', error);
            this.handleTabError('practice', error);
        }
    }

    switchTab(tabName) {
        try {
            console.log(`🔄 Switching to tab: ${tabName}`);
            
            // Validate tab name
            const validTabs = ['practice', 'browse', 'quiz', 'stats'];
            if (!validTabs.includes(tabName)) {
                throw new Error(`Invalid tab name: ${tabName}`);
            }
            
            // Store current tab for potential rollback
            const previousTab = this.currentTab || 'practice';
            this.currentTab = tabName;
            
            // Update tab buttons with animation
            this.updateTabButtons(tabName);
            
            // Update tab content with transition
            this.updateTabContent(tabName);
            
            // Load specific tab content with error handling
            this.loadTabSpecificContent(tabName);
            
            // Update URL hash for better UX (optional)
            this.updateURLHash(tabName);
            
            console.log(`✅ Successfully switched to tab: ${tabName}`);
            
        } catch (error) {
            console.error(`❌ Error switching to tab ${tabName}:`, error);
            this.handleTabError(tabName, error);
        }
    }
    
    updateTabButtons(activeTabName) {
        try {
            const tabButtons = document.querySelectorAll('.nav-tab');
            if (tabButtons.length === 0) {
                throw new Error('No tab buttons found');
            }
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Add active class to selected button
            const activeTab = document.querySelector(`[data-tab="${activeTabName}"]`);
            if (!activeTab) {
                throw new Error(`Tab button for ${activeTabName} not found`);
            }
            
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
            
            // Add visual feedback animation
            activeTab.style.transform = 'scale(1.02)';
            setTimeout(() => {
                activeTab.style.transform = '';
            }, 150);
            
        } catch (error) {
            console.error('❌ Error updating tab buttons:', error);
            throw error;
        }
    }
    
    updateTabContent(activeTabName) {
        try {
            const tabPanels = document.querySelectorAll('.tab-panel');
            if (tabPanels.length === 0) {
                throw new Error('No tab panels found');
            }
            
            // Hide all tab panels with fade out
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
                panel.style.opacity = '0';
            });
            
            // Show active tab panel with fade in
            const activePanel = document.getElementById(activeTabName);
            if (!activePanel) {
                throw new Error(`Tab panel for ${activeTabName} not found`);
            }
            
            // Use setTimeout to ensure smooth transition
            setTimeout(() => {
                activePanel.classList.add('active');
                activePanel.setAttribute('aria-hidden', 'false');
                activePanel.style.opacity = '1';
                
                // Trigger any animations for the active panel
                this.triggerTabAnimation(activePanel);
            }, 50);
            
        } catch (error) {
            console.error('❌ Error updating tab content:', error);
            throw error;
        }
    }
    
    loadTabSpecificContent(tabName) {
        try {
            switch (tabName) {
                case 'browse':
                    console.log('📚 Loading browse tab content...');
                    this.renderBrowseTab();
                    break;
                    
                case 'stats':
                    console.log('📊 Loading stats tab content...');
                    this.updateStatsDisplay();
                    break;
                    
                case 'quiz':
                    console.log('🧩 Loading quiz tab content...');
                    this.initializeQuizTab();
                    break;
                    
                case 'practice':
                    console.log('🎯 Loading practice tab content...');
                    this.ensurePracticeSession();
                    break;
                    
                default:
                    console.log(`ℹ️ No specific content loading required for ${tabName}`);
            }
        } catch (error) {
            console.warn(`⚠️ Error loading content for ${tabName}:`, error.message);
            // Don't throw here - tab switching should still work even if content loading fails
        }
    }
    
    triggerTabAnimation(panel) {
        try {
            // Add entrance animation to tab content
            const children = panel.children;
            Array.from(children).forEach((child, index) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } catch (error) {
            console.warn('⚠️ Error triggering tab animation:', error.message);
        }
    }
    
    updateURLHash(tabName) {
        try {
            // Update URL hash without triggering page reload
            if (history.replaceState) {
                history.replaceState(null, null, `#${tabName}`);
            } else {
                window.location.hash = tabName;
            }
        } catch (error) {
            console.warn('⚠️ Error updating URL hash:', error.message);
        }
    }
    
    handleTabError(tabName, error) {
        console.error(`🚨 Tab error for ${tabName}:`, error);
        
        // Try to fallback to practice tab if not already there
        if (tabName !== 'practice') {
            console.log('🔄 Attempting fallback to practice tab...');
            try {
                this.switchTab('practice');
            } catch (fallbackError) {
                console.error('❌ Fallback to practice tab also failed:', fallbackError);
                this.showTabErrorMessage(tabName);
            }
        } else {
            this.showTabErrorMessage(tabName);
        }
    }
    
    showTabErrorMessage(tabName) {
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorMessage.innerHTML = `
            ❌ Error cargando la sección "${tabName}"<br>
            <small>Intenta recargar la página</small>
        `;
        
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 5000);
    }
    
    initializeQuizTab() {
        try {
            // Ensure quiz is in initial state
            const quizSetup = document.getElementById('quiz-setup');
            const quizContainer = document.getElementById('quiz-container');
            const quizResults = document.getElementById('quiz-results');
            
            if (quizSetup) quizSetup.style.display = 'block';
            if (quizContainer) quizContainer.style.display = 'none';
            if (quizResults) quizResults.style.display = 'none';
            
            console.log('✅ Quiz tab initialized');
        } catch (error) {
            console.warn('⚠️ Error initializing quiz tab:', error.message);
        }
    }
    
    ensurePracticeSession() {
        try {
            // Ensure practice session is active
            if (!this.currentSession || this.currentSession.length === 0) {
                this.setupPracticeSession();
            }
            console.log('✅ Practice session ensured');
        } catch (error) {
            console.warn('⚠️ Error ensuring practice session:', error.message);
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
    
    // Alias for nextCard to maintain compatibility
    nextWord() {
        console.log('🔄 nextWord() called - delegating to nextCard()');
        this.nextCard();
    }
    
    // Alias for updateCard to maintain compatibility
    displayCurrentWord() {
        console.log('🔄 displayCurrentWord() called - delegating to updateCard()');
        this.updateCard();
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
        try {
            console.log('🔄 doFlip() called');
            
            if (!this.currentWord) {
                console.warn('⚠️ No hay palabra para voltear');
                this.showFlashcardError('No hay palabra disponible para voltear');
                return;
            }
            
            const flashcard = document.getElementById('flashcard');
            if (!flashcard) {
                console.error('❌ Elemento flashcard no encontrado');
                this.showFlashcardError('Elemento flashcard no encontrado');
                return;
            }
            
            // Si ya está volteada, volver al estado original
            if (this.isFlipped) {
                console.log('🔄 Tarjeta ya volteada, regresando a pregunta');
                this.resetToQuestion();
                return;
            }
            
            console.log('🎯 Iniciando animación de volteo...');
            
            // Efecto visual de volteo elegante
            flashcard.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            flashcard.style.transform = 'scaleX(0)';
            
            setTimeout(() => {
                try {
                    // Guardar contenido original si no existe
                    const cardFront = flashcard.querySelector('.card-front');
                    if (cardFront && !this.originalCardContent) {
                        this.originalCardContent = cardFront.innerHTML;
                    }
                    
                    if (cardFront) {
                        // Mostrar respuesta con estilo mejorado
                        cardFront.innerHTML = this.generateFlashcardAnswerContent();
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
                        
                        // Trigger success animation
                        this.triggerFlipSuccessAnimation(flashcard);
                        
                    }, 100);
                    
                } catch (error) {
                    console.error('❌ Error durante animación de volteo:', error);
                    this.handleFlipError(error);
                }
            }, 150);
            
        } catch (error) {
            console.error('❌ Error crítico en doFlip:', error);
            this.handleFlipError(error);
        }
    }
    
    generateFlashcardAnswerContent() {
        if (!this.currentWord) return '<div>Error: No hay palabra disponible</div>';
        
        return `
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
                font-family: 'JetBrains Mono', monospace;
                cursor: pointer;
                overflow: hidden;
            ">
                <!-- Animated background pattern -->
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 30px 30px;
                    animation: backgroundFloat 15s linear infinite;
                    pointer-events: none;
                "></div>
                
                <div style="position: relative; z-index: 1; text-align: center;">
                    <div style="
                        font-size: 3.5rem; 
                        margin-bottom: 1.5rem; 
                        font-weight: 600; 
                        font-family: 'Noto Sans SC', sans-serif;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        animation: characterPulse 2s ease-in-out infinite;
                    ">
                        ${this.currentWord.character}
                    </div>
                    
                    <div style="
                        font-size: 1.8rem; 
                        margin-bottom: 1rem; 
                        color: #fbbf24; 
                        font-weight: 500;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    ">
                        ${this.currentWord.pinyin}
                    </div>
                    
                    <div style="
                        font-size: 1.3rem; 
                        text-align: center; 
                        line-height: 1.6; 
                        background: rgba(255,255,255,0.15); 
                        padding: 0.8rem 1.2rem; 
                        border-radius: 8px;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        ${this.currentWord.english || this.currentWord.translation || 'Sin traducción'}
                    </div>
                    
                    <div style="
                        font-size: 1rem; 
                        margin-top: 1rem; 
                        background: rgba(255,255,255,0.2); 
                        padding: 8px 16px; 
                        border-radius: 20px;
                        backdrop-filter: blur(5px);
                        border: 1px solid rgba(255,255,255,0.1);
                    ">
                        HSK Nivel ${this.currentWord.level}
                    </div>
                    
                    <div style="
                        font-size: 0.9rem; 
                        margin-top: 1.5rem; 
                        opacity: 0.8; 
                        font-style: italic;
                        animation: fadeInOut 3s ease-in-out infinite;
                    ">
                        ${this.isAudioEnabled ? '🔊 ' : ''}Haz click para volver a la pregunta
                    </div>
                </div>
                
                <style>
                    @keyframes backgroundFloat {
                        0% { transform: translate(0, 0) rotate(0deg); }
                        100% { transform: translate(30px, 30px) rotate(360deg); }
                    }
                    
                    @keyframes characterPulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0.8; }
                        50% { opacity: 0.4; }
                    }
                </style>
            </div>
        `;
    }
    
    triggerFlipSuccessAnimation(flashcard) {
        try {
            // Add success glow effect
            flashcard.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
            
            setTimeout(() => {
                flashcard.style.boxShadow = '';
            }, 1000);
            
        } catch (error) {
            console.warn('⚠️ Error en animación de éxito:', error.message);
        }
    }
    
    handleFlipError(error) {
        console.error('🚨 Error en sistema de flashcards:', error);
        
        // Reset flashcard state
        this.isFlipped = false;
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.classList.remove('flipped');
            flashcard.style.transform = '';
            flashcard.style.transition = '';
            flashcard.style.boxShadow = '';
        }
        
        // Update buttons to safe state
        this.updateControlButtons();
        
        // Show error to user
        this.showFlashcardError('Error en el sistema de flashcards. Intenta de nuevo.');
    }
    
    showFlashcardError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        errorDiv.innerHTML = `
            ❌ ${message}<br>
            <small style="opacity: 0.8;">El error se ha registrado automáticamente</small>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 4000);
    }
    
    addRippleEffect(element, event) {
        try {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: rippleAnimation 0.6s linear;
                pointer-events: none;
                left: ${x - 10}px;
                top: ${y - 10}px;
                width: 20px;
                height: 20px;
                z-index: 1000;
            `;
            
            // Add ripple styles
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rippleAnimation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 600);
            
        } catch (error) {
            console.warn('⚠️ Error creating ripple effect:', error.message);
        }
    }
    
    // Control helper functions
    addLoadingIndicator(element) {
        try {
            const indicator = document.createElement('div');
            indicator.className = 'control-loading-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 50%;
                right: 8px;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                border: 2px solid var(--color-primary-200);
                border-top: 2px solid var(--color-primary-500);
                border-radius: 50%;
                animation: controlSpin 1s linear infinite;
                z-index: 10;
            `;
            
            // Add spinner styles
            const style = document.createElement('style');
            style.textContent = `
                @keyframes controlSpin {
                    0% { transform: translateY(-50%) rotate(0deg); }
                    100% { transform: translateY(-50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            element.style.position = 'relative';
            element.appendChild(indicator);
            
        } catch (error) {
            console.warn('⚠️ Error adding loading indicator:', error.message);
        }
    }
    
    removeLoadingIndicator(element) {
        try {
            const indicator = element.querySelector('.control-loading-indicator');
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        } catch (error) {
            console.warn('⚠️ Error removing loading indicator:', error.message);
        }
    }
    
    showControlError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        errorDiv.innerHTML = `
            ❌ ${message}
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    showControlSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        successDiv.innerHTML = `
            ✅ ${message}
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.parentNode.removeChild(successDiv);
                    }
                }, 300);
            }
        }, 2000);
    }
    
    revertLevelSelection(levelSelect) {
        try {
            // Find the option that matches the current selectedLevel
            const options = levelSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === this.selectedLevel) {
                    levelSelect.selectedIndex = i;
                    break;
                }
            }
            console.log('🔄 Level selection reverted to:', this.selectedLevel);
        } catch (error) {
            console.warn('⚠️ Error reverting level selection:', error.message);
        }
    }
    
    updateLevelDependentUI() {
        try {
            // Update any UI elements that depend on the selected level
            const levelInfo = document.querySelector('.level-info');
            if (levelInfo) {
                levelInfo.textContent = this.selectedLevel === 'all' ? 
                    'Todos los niveles' : `HSK Nivel ${this.selectedLevel}`;
            }
            
            // Update progress bar if it exists
            this.updateProgressBar();
            
            console.log('✅ Level-dependent UI updated');
        } catch (error) {
            console.warn('⚠️ Error updating level-dependent UI:', error.message);
        }
    }
    
    showSRSFeedback(performance, label) {
        const feedbackColors = {
            'again': '#ef4444',
            'hard': '#f59e0b',
            'good': '#10b981',
            'easy': '#3b82f6'
        };
        
        const feedbackMessages = {
            'again': 'Palabra marcada como difícil - se repetirá pronto',
            'hard': 'Palabra marcada como complicada - intervalo reducido',
            'good': 'Palabra marcada como conocida - buen progreso',
            'easy': 'Palabra marcada como fácil - intervalo extendido'
        };
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: ${feedbackColors[performance]};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: var(--font-family-primary);
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        feedbackDiv.innerHTML = `
            <strong>${label}</strong><br>
            <small>${feedbackMessages[performance]}</small>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(feedbackDiv);
        
        setTimeout(() => {
            if (feedbackDiv.parentNode) {
                feedbackDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (feedbackDiv.parentNode) {
                        feedbackDiv.parentNode.removeChild(feedbackDiv);
                    }
                }, 300);
            }
        }, 2500);
    }
    
    // Método para resetear a la pregunta
    resetToQuestion() {
        try {
            console.log('🔄 Regresando a pregunta...');
            
            const flashcard = document.getElementById('flashcard');
            if (!flashcard) {
                console.error('❌ Elemento flashcard no encontrado para reset');
                return;
            }
            
            flashcard.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            flashcard.style.transform = 'scaleX(0)';
            
            setTimeout(() => {
                try {
                    const cardFront = flashcard.querySelector('.card-front');
                    if (cardFront && this.originalCardContent) {
                        cardFront.innerHTML = this.originalCardContent;
                    } else if (cardFront) {
                        // Regenerate question content if original is lost
                        this.updateCard();
                    }
                    
                    flashcard.style.transform = 'scaleX(1)';
                    flashcard.classList.remove('flipped');
                    flashcard.style.boxShadow = '';
                    this.isFlipped = false;
                    this.updateControlButtons();
                    console.log('✅ Tarjeta regresada a pregunta');
                    
                    // Add subtle success animation
                    flashcard.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
                    setTimeout(() => {
                        flashcard.style.boxShadow = '';
                    }, 800);
                    
                } catch (error) {
                    console.error('❌ Error durante reset a pregunta:', error);
                    this.handleFlipError(error);
                }
            }, 150);
            
        } catch (error) {
            console.error('❌ Error crítico en resetToQuestion:', error);
            this.handleFlipError(error);
        }
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
        try {
            console.log(`📊 Updating stats: correct=${correct}, word=${word ? word.character : 'none'}`);
            
            // Validate input
            if (typeof correct !== 'boolean') {
                console.warn('⚠️ Invalid correct value in updateStats:', correct);
                return;
            }
            
            // Update basic stats
            this.stats.totalStudied++;
            
            if (correct) {
                this.stats.correctAnswers++;
                this.stats.currentStreak++;
                
                // Update best streak if current is better
                if (!this.stats.bestStreak || this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
                
                // Si se proporciona una palabra (del quiz), agregarla al historial de práctica
                if (word) {
                    this.addToPracticeHistory(word, true, 'quiz');
                }
            } else {
                this.stats.currentStreak = 0;
                
                // Agregar palabra incorrecta del quiz al historial
                if (word) {
                    this.addToPracticeHistory(word, false, 'quiz');
                }
            }
            
            // Update session stats
            this.updateSessionStats(correct);
            
            // Save stats
            this.saveStats();
            
            // Guardar historial de práctica cuando se actualiza desde el quiz
            if (word) {
                this.savePracticeHistory();
            }
            
            // Update display immediately
            this.updateStatsDisplay();
            
            console.log('✅ Stats updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating stats:', error);
            this.handleStatsError(error);
        }
    }
    
    addToPracticeHistory(word, known, mode = 'practice') {
        try {
            if (!word || !word.character) {
                console.warn('⚠️ Invalid word in practice history:', word);
                return;
            }
            
            const historyEntry = {
                word: {
                    character: word.character,
                    pinyin: word.pinyin,
                    english: word.english || word.translation,
                    level: word.level
                },
                known: known,
                mode: mode,
                timestamp: Date.now(),
                sessionId: this.currentSessionId || Date.now()
            };
            
            this.practiceHistory.push(historyEntry);
            
            // Keep history manageable (last 1000 entries)
            if (this.practiceHistory.length > 1000) {
                this.practiceHistory = this.practiceHistory.slice(-1000);
            }
            
            console.log(`📝 Added to practice history: ${word.character} (${known ? 'known' : 'unknown'})`);
            
        } catch (error) {
            console.error('❌ Error adding to practice history:', error);
        }
    }
    
    updateSessionStats(correct) {
        try {
            // Initialize session stats if not exists
            if (!this.sessionStats) {
                this.sessionStats = {
                    startTime: Date.now(),
                    totalAnswers: 0,
                    correctAnswers: 0,
                    currentStreak: 0
                };
            }
            
            this.sessionStats.totalAnswers++;
            
            if (correct) {
                this.sessionStats.correctAnswers++;
                this.sessionStats.currentStreak++;
            } else {
                this.sessionStats.currentStreak = 0;
            }
            
            // Update session display if element exists
            this.updateSessionDisplay();
            
        } catch (error) {
            console.warn('⚠️ Error updating session stats:', error.message);
        }
    }
    
    updateSessionDisplay() {
        try {
            const sessionElement = document.getElementById('session-stats');
            if (!sessionElement || !this.sessionStats) return;
            
            const sessionAccuracy = this.sessionStats.totalAnswers > 0 ? 
                Math.round((this.sessionStats.correctAnswers / this.sessionStats.totalAnswers) * 100) : 0;
            
            const sessionDuration = Math.round((Date.now() - this.sessionStats.startTime) / 1000 / 60);
            
            sessionElement.innerHTML = `
                <div class="session-stat">
                    <span class="session-label">Session:</span>
                    <span class="session-value">${this.sessionStats.correctAnswers}/${this.sessionStats.totalAnswers} (${sessionAccuracy}%)</span>
                </div>
                <div class="session-stat">
                    <span class="session-label">Time:</span>
                    <span class="session-value">${sessionDuration}m</span>
                </div>
                <div class="session-stat">
                    <span class="session-label">Streak:</span>
                    <span class="session-value">${this.sessionStats.currentStreak}</span>
                </div>
            `;
            
        } catch (error) {
            console.warn('⚠️ Error updating session display:', error.message);
        }
    }

    updateStatsDisplay() {
        try {
            console.log('📊 Updating statistics display...');
            
            // Calculate accuracy with validation
            const accuracy = this.stats.totalStudied > 0 ? 
                Math.round((this.stats.correctAnswers / this.stats.totalStudied) * 100) : 0;
            
            // Update basic stats with error handling
            this.updateStatElement('total-studied', this.stats.totalStudied);
            this.updateStatElement('accuracy-rate', `${accuracy}%`);
            this.updateStatElement('quiz-count', this.stats.quizzesCompleted);
            this.updateStatElement('streak-count', this.stats.currentStreak);
            
            // Update advanced stats
            this.updateAdvancedStats();
            
            // Update level progress
            this.updateLevelProgress();
            
            // Update visual indicators
            this.updateStatsVisualIndicators();
            
            console.log('✅ Statistics display updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating stats display:', error);
            this.handleStatsError(error);
        }
    }
    
    updateStatElement(elementId, value) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                // Add animation effect
                element.style.transform = 'scale(1.1)';
                element.textContent = value;
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
                
            } else {
                console.warn(`⚠️ Stats element not found: ${elementId}`);
            }
        } catch (error) {
            console.error(`❌ Error updating stat element ${elementId}:`, error);
        }
    }
    
    updateAdvancedStats() {
        try {
            // Calculate additional statistics
            const totalWords = this.vocabulary ? this.vocabulary.length : 0;
            const studiedPercentage = totalWords > 0 ? 
                Math.round((this.getUniqueStudiedWords().length / totalWords) * 100) : 0;
            
            // Update study time (estimate based on practice history)
            const estimatedStudyTime = this.calculateEstimatedStudyTime();
            
            // Update best streak
            const bestStreak = this.calculateBestStreak();
            
            // Update additional elements if they exist
            this.updateStatElement('studied-percentage', `${studiedPercentage}%`);
            this.updateStatElement('study-time', estimatedStudyTime);
            this.updateStatElement('best-streak', bestStreak);
            
            // Update recent activity
            this.updateRecentActivity();
            
        } catch (error) {
            console.warn('⚠️ Error updating advanced stats:', error.message);
        }
    }
    
    getUniqueStudiedWords() {
        const uniqueWords = new Set();
        this.practiceHistory.forEach(entry => {
            if (entry.word && entry.word.character) {
                uniqueWords.add(entry.word.character);
            }
        });
        return Array.from(uniqueWords);
    }
    
    calculateEstimatedStudyTime() {
        // Estimate 30 seconds per practice entry
        const totalMinutes = Math.round((this.practiceHistory.length * 0.5));
        
        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h ${minutes}m`;
        }
    }
    
    calculateBestStreak() {
        let bestStreak = 0;
        let currentStreak = 0;
        
        this.practiceHistory.forEach(entry => {
            if (entry.known) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        return bestStreak;
    }
    
    updateRecentActivity() {
        try {
            const recentActivityElement = document.getElementById('recent-activity');
            if (!recentActivityElement) return;
            
            // Get last 5 practice entries
            const recentEntries = this.practiceHistory.slice(-5).reverse();
            
            if (recentEntries.length === 0) {
                recentActivityElement.innerHTML = '<p>No recent activity</p>';
                return;
            }
            
            const activityHTML = recentEntries.map(entry => {
                const timeAgo = this.getTimeAgo(entry.timestamp);
                const statusIcon = entry.known ? '✅' : '❌';
                const character = entry.word ? entry.word.character : '?';
                
                return `
                    <div class="activity-item">
                        <span class="activity-icon">${statusIcon}</span>
                        <span class="activity-character">${character}</span>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                `;
            }).join('');
            
            recentActivityElement.innerHTML = activityHTML;
            
        } catch (error) {
            console.warn('⚠️ Error updating recent activity:', error.message);
        }
    }
    
    getTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    
    updateStatsVisualIndicators() {
        try {
            // Update accuracy color based on performance
            const accuracyElement = document.getElementById('accuracy-rate');
            if (accuracyElement) {
                const accuracy = parseInt(accuracyElement.textContent);
                let colorClass = 'stat-neutral';
                
                if (accuracy >= 80) colorClass = 'stat-excellent';
                else if (accuracy >= 60) colorClass = 'stat-good';
                else if (accuracy >= 40) colorClass = 'stat-fair';
                else colorClass = 'stat-poor';
                
                accuracyElement.className = `stat-value ${colorClass}`;
            }
            
            // Update streak indicator
            const streakElement = document.getElementById('streak-count');
            if (streakElement && this.stats.currentStreak > 0) {
                streakElement.classList.add('streak-active');
                
                if (this.stats.currentStreak >= 10) {
                    streakElement.classList.add('streak-fire');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Error updating visual indicators:', error.message);
        }
    }
    
    handleStatsError(error) {
        console.error('🚨 Statistics system error:', error);
        
        // Try to recover by resetting stats display
        try {
            const statsElements = ['total-studied', 'accuracy-rate', 'quiz-count', 'streak-count'];
            statsElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = '0';
                    element.style.color = '#ef4444';
                }
            });
            
            // Show error notification
            this.showControlError('Error en el sistema de estadísticas. Datos pueden estar incorrectos.');
            
        } catch (recoveryError) {
            console.error('❌ Failed to recover from stats error:', recoveryError);
        }
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
        try {
            const saved = localStorage.getItem('hsk-stats');
            if (saved) {
                const stats = JSON.parse(saved);
                
                // Validate and migrate stats structure
                const validatedStats = this.validateStatsStructure(stats);
                console.log('📊 Stats loaded from localStorage');
                return validatedStats;
            }
        } catch (error) {
            console.error('❌ Error loading stats from localStorage:', error);
        }
        
        // Return default stats
        const defaultStats = {
            totalStudied: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            quizzesCompleted: 0,
            version: '2.1.0',
            createdAt: Date.now(),
            lastUpdated: Date.now()
        };
        
        console.log('📊 Using default stats structure');
        return defaultStats;
    }
    
    validateStatsStructure(stats) {
        try {
            // Ensure all required fields exist
            const requiredFields = {
                totalStudied: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0,
                version: '2.1.0',
                lastUpdated: Date.now()
            };
            
            // Merge with defaults for missing fields
            const validatedStats = { ...requiredFields, ...stats };
            
            // Validate data types
            validatedStats.totalStudied = Math.max(0, parseInt(validatedStats.totalStudied) || 0);
            validatedStats.correctAnswers = Math.max(0, parseInt(validatedStats.correctAnswers) || 0);
            validatedStats.currentStreak = Math.max(0, parseInt(validatedStats.currentStreak) || 0);
            validatedStats.bestStreak = Math.max(0, parseInt(validatedStats.bestStreak) || 0);
            validatedStats.quizzesCompleted = Math.max(0, parseInt(validatedStats.quizzesCompleted) || 0);
            
            // Ensure correctAnswers doesn't exceed totalStudied
            if (validatedStats.correctAnswers > validatedStats.totalStudied) {
                validatedStats.correctAnswers = validatedStats.totalStudied;
            }
            
            return validatedStats;
            
        } catch (error) {
            console.error('❌ Error validating stats structure:', error);
            return this.loadStats(); // Recursive call to get defaults
        }
    }

    saveStats() {
        try {
            // Update timestamp
            this.stats.lastUpdated = Date.now();
            
            // Save to localStorage
            localStorage.setItem('hsk-stats', JSON.stringify(this.stats));
            console.log('💾 Stats saved to localStorage');
            
        } catch (error) {
            console.error('❌ Error saving stats to localStorage:', error);
            this.showControlError('Error guardando estadísticas');
        }
    }

    loadPracticeHistory() {
        try {
            const saved = localStorage.getItem('hsk-practice-history');
            if (saved) {
                const history = JSON.parse(saved);
                
                // Validate history structure
                const validatedHistory = this.validateHistoryStructure(history);
                console.log(`📝 Practice history loaded: ${validatedHistory.length} entries`);
                return validatedHistory;
            }
        } catch (error) {
            console.error('❌ Error loading practice history:', error);
        }
        
        console.log('📝 Using empty practice history');
        return [];
    }
    
    validateHistoryStructure(history) {
        try {
            if (!Array.isArray(history)) {
                console.warn('⚠️ Practice history is not an array, resetting');
                return [];
            }
            
            // Filter and validate entries
            const validatedHistory = history.filter(entry => {
                return entry && 
                       entry.word && 
                       entry.word.character && 
                       typeof entry.known === 'boolean' &&
                       typeof entry.timestamp === 'number';
            }).map(entry => {
                // Ensure all required fields
                return {
                    word: {
                        character: entry.word.character,
                        pinyin: entry.word.pinyin || '',
                        english: entry.word.english || entry.word.translation || '',
                        level: entry.word.level || 1
                    },
                    known: entry.known,
                    mode: entry.mode || 'practice',
                    timestamp: entry.timestamp,
                    sessionId: entry.sessionId || entry.timestamp
                };
            });
            
            // Sort by timestamp (newest first) and limit to last 1000
            validatedHistory.sort((a, b) => b.timestamp - a.timestamp);
            return validatedHistory.slice(0, 1000);
            
        } catch (error) {
            console.error('❌ Error validating history structure:', error);
            return [];
        }
    }

    savePracticeHistory() {
        try {
            // Validate before saving
            const validatedHistory = this.validateHistoryStructure(this.practiceHistory);
            this.practiceHistory = validatedHistory;
            
            localStorage.setItem('hsk-practice-history', JSON.stringify(this.practiceHistory));
            console.log(`💾 Practice history saved: ${this.practiceHistory.length} entries`);
            
        } catch (error) {
            console.error('❌ Error saving practice history:', error);
            this.showControlError('Error guardando historial de práctica');
        }
    }

    resetStats() {
        try {
            console.log('🔄 Resetting all statistics...');
            
            // Reset stats
            this.stats = {
                totalStudied: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0,
                version: '2.1.0',
                createdAt: Date.now(),
                lastUpdated: Date.now()
            };
            
            // Reset practice history
            this.practiceHistory = [];
            
            // Reset session stats
            this.sessionStats = null;
            
            // Save changes
            this.saveStats();
            this.savePracticeHistory();
            
            // Update display
            this.updateStatsDisplay();
            
            // Show success message
            this.showControlSuccess('Estadísticas reiniciadas correctamente');
            
            console.log('✅ Statistics reset successfully');
            
        } catch (error) {
            console.error('❌ Error resetting stats:', error);
            this.showControlError('Error reiniciando estadísticas');
        }
    }
    
    exportStats() {
        try {
            const exportData = {
                stats: this.stats,
                practiceHistory: this.practiceHistory,
                exportDate: new Date().toISOString(),
                version: '2.1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `hsk-learning-stats-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showControlSuccess('Estadísticas exportadas correctamente');
            console.log('📤 Stats exported successfully');
            
        } catch (error) {
            console.error('❌ Error exporting stats:', error);
            this.showControlError('Error exportando estadísticas');
        }
    }
    
    importStats(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate import data
                    if (importData.stats && importData.practiceHistory) {
                        this.stats = this.validateStatsStructure(importData.stats);
                        this.practiceHistory = this.validateHistoryStructure(importData.practiceHistory);
                        
                        // Save imported data
                        this.saveStats();
                        this.savePracticeHistory();
                        
                        // Update display
                        this.updateStatsDisplay();
                        
                        this.showControlSuccess('Estadísticas importadas correctamente');
                        console.log('📥 Stats imported successfully');
                    } else {
                        throw new Error('Invalid import file format');
                    }
                    
                } catch (parseError) {
                    console.error('❌ Error parsing import file:', parseError);
                    this.showControlError('Archivo de importación inválido');
                }
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('❌ Error importing stats:', error);
            this.showControlError('Error importando estadísticas');
        }
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
        try {
            console.log('🌓 Initializing theme system...');
            
            // Determine theme
            const theme = this.isDarkMode ? 'dark' : 'light';
            
            // Apply theme to document elements
            this.applyThemeToDocument(theme);
            
            // Update UI components
            this.updateThemeButton();
            this.updateAppLogo();
            this.updateThemeDependentElements();
            
            // Add theme transition class for smooth changes
            document.body.classList.add('theme-transition');
            
            console.log(`✅ Theme initialized successfully: ${theme}`);
            
        } catch (error) {
            console.error('❌ Error initializing theme:', error);
            this.handleThemeError(error);
        }
    }

    toggleTheme() {
        try {
            console.log('🌓 Toggling theme...');
            
            const previousTheme = this.isDarkMode ? 'dark' : 'light';
            this.isDarkMode = !this.isDarkMode;
            const newTheme = this.isDarkMode ? 'dark' : 'light';
            
            // Add transition effect
            document.body.classList.add('theme-changing');
            
            // Apply new theme
            this.applyThemeToDocument(newTheme);
            
            // Save theme preference
            this.saveTheme();
            
            // Update UI components with animation
            setTimeout(() => {
                this.updateThemeButton();
                this.updateAppLogo();
                this.updateThemeDependentElements();
                
                // Remove transition class
                document.body.classList.remove('theme-changing');
                
                // Trigger theme change event
                this.dispatchThemeChangeEvent(previousTheme, newTheme);
                
            }, 50);
            
            console.log(`✅ Theme toggled successfully: ${previousTheme} → ${newTheme}`);
            
        } catch (error) {
            console.error('❌ Error toggling theme:', error);
            this.handleThemeError(error);
        }
    }

    updateThemeButton() {
        try {
            const themeBtn = document.getElementById('theme-toggle');
            if (!themeBtn) {
                console.warn('⚠️ Theme toggle button not found');
                return;
            }
            
            const lightIcon = themeBtn.querySelector('.light-icon');
            const darkIcon = themeBtn.querySelector('.dark-icon');
            
            if (!lightIcon || !darkIcon) {
                console.warn('⚠️ Theme icons not found in toggle button');
                return;
            }
            
            // Add smooth transitions
            lightIcon.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            darkIcon.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (this.isDarkMode) {
                // Show dark icon, hide light icon
                lightIcon.style.opacity = '0';
                lightIcon.style.transform = 'rotate(180deg) scale(0.5)';
                darkIcon.style.opacity = '1';
                darkIcon.style.transform = 'rotate(0deg) scale(1)';
                
                // Update button attributes
                themeBtn.setAttribute('aria-label', 'Switch to light theme');
                themeBtn.setAttribute('title', 'Switch to light theme');
                
            } else {
                // Show light icon, hide dark icon
                lightIcon.style.opacity = '1';
                lightIcon.style.transform = 'rotate(0deg) scale(1)';
                darkIcon.style.opacity = '0';
                darkIcon.style.transform = 'rotate(180deg) scale(0.5)';
                
                // Update button attributes
                themeBtn.setAttribute('aria-label', 'Switch to dark theme');
                themeBtn.setAttribute('title', 'Switch to dark theme');
            }
            
            // Add visual feedback
            themeBtn.style.background = this.isDarkMode ? 
                'linear-gradient(135deg, #374151, #4b5563)' : 
                'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                
            console.log('✅ Theme button updated');
            
        } catch (error) {
            console.error('❌ Error updating theme button:', error);
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
        try {
            localStorage.setItem('hsk-dark-mode', this.isDarkMode.toString());
            console.log('💾 Theme preference saved:', this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.warn('⚠️ Could not save theme preference:', error.message);
        }
    }
    
    applyThemeToDocument(theme) {
        try {
            // Apply to document elements
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
            
            // Update CSS custom properties for immediate effect
            const root = document.documentElement;
            if (theme === 'dark') {
                root.style.setProperty('--current-bg-primary', '#0f172a');
                root.style.setProperty('--current-text-primary', '#f8fafc');
                root.style.setProperty('--current-border-color', '#475569');
            } else {
                root.style.setProperty('--current-bg-primary', '#ffffff');
                root.style.setProperty('--current-text-primary', '#1e293b');
                root.style.setProperty('--current-border-color', '#e2e8f0');
            }
            
            // Update meta theme-color for mobile browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#e11d48';
            }
            
            console.log(`🎨 Theme applied to document: ${theme}`);
            
        } catch (error) {
            console.error('❌ Error applying theme to document:', error);
            throw error;
        }
    }
    
    updateThemeDependentElements() {
        try {
            // Update flashcards
            this.updateFlashcardTheme();
            
            // Update navigation
            this.updateNavigationTheme();
            
            // Update form elements
            this.updateFormElementsTheme();
            
            // Update statistics cards
            this.updateStatsTheme();
            
            console.log('✅ Theme-dependent elements updated');
            
        } catch (error) {
            console.warn('⚠️ Error updating theme-dependent elements:', error.message);
        }
    }
    
    updateFlashcardTheme() {
        try {
            const flashcard = document.getElementById('flashcard');
            if (flashcard) {
                // Add theme-specific classes or styles
                flashcard.classList.toggle('dark-theme', this.isDarkMode);
                flashcard.classList.toggle('light-theme', !this.isDarkMode);
                
                // Update flashcard content if currently displayed
                if (this.currentWord && this.isFlipped) {
                    // Regenerate content with new theme
                    setTimeout(() => {
                        const cardBack = flashcard.querySelector('.card-back');
                        if (cardBack) {
                            cardBack.innerHTML = this.generateFlashcardBackContent();
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error updating flashcard theme:', error.message);
        }
    }
    
    updateNavigationTheme() {
        try {
            const navTabs = document.querySelectorAll('.nav-tab');
            navTabs.forEach(tab => {
                tab.classList.toggle('dark-theme', this.isDarkMode);
                tab.classList.toggle('light-theme', !this.isDarkMode);
            });
        } catch (error) {
            console.warn('⚠️ Error updating navigation theme:', error.message);
        }
    }
    
    updateFormElementsTheme() {
        try {
            const formElements = document.querySelectorAll('.select-input, .select-control, .search-input, .btn');
            formElements.forEach(element => {
                element.classList.toggle('dark-theme', this.isDarkMode);
                element.classList.toggle('light-theme', !this.isDarkMode);
            });
        } catch (error) {
            console.warn('⚠️ Error updating form elements theme:', error.message);
        }
    }
    
    updateStatsTheme() {
        try {
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.classList.toggle('dark-theme', this.isDarkMode);
                card.classList.toggle('light-theme', !this.isDarkMode);
            });
        } catch (error) {
            console.warn('⚠️ Error updating stats theme:', error.message);
        }
    }
    
    dispatchThemeChangeEvent(previousTheme, newTheme) {
        try {
            const event = new CustomEvent('themeChanged', {
                detail: {
                    previousTheme,
                    newTheme,
                    isDarkMode: this.isDarkMode
                }
            });
            window.dispatchEvent(event);
            console.log('📡 Theme change event dispatched');
        } catch (error) {
            console.warn('⚠️ Error dispatching theme change event:', error.message);
        }
    }
    
    handleThemeError(error) {
        console.error('🚨 Theme system error:', error);
        
        // Try to recover by resetting to light theme
        try {
            this.isDarkMode = false;
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.setAttribute('data-theme', 'light');
            this.saveTheme();
            
            // Show error notification
            this.showControlError('Error en el sistema de temas. Restaurado a tema claro.');
            
        } catch (recoveryError) {
            console.error('❌ Failed to recover from theme error:', recoveryError);
        }
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
