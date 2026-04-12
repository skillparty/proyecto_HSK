class InteractionController {
    constructor(app) {
        this.app = app;
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            if (event.altKey) {
                switch (event.key) {
                    case '1':
                        this.app.switchTab('home');
                        event.preventDefault();
                        break;
                    case '2':
                        this.app.switchTab('practice');
                        event.preventDefault();
                        break;
                    case '3':
                        this.app.switchTab('browse');
                        event.preventDefault();
                        break;
                    case '4':
                        this.app.switchTab('quiz');
                        event.preventDefault();
                        break;
                    case '5':
                        this.app.switchTab('matrix');
                        event.preventDefault();
                        break;
                    case '6':
                        this.app.switchTab('leaderboard');
                        event.preventDefault();
                        break;
                    case '7':
                        this.app.switchTab('stats');
                        event.preventDefault();
                        break;
                }
            }

            if (this.app.currentTab === 'practice' && this.app.currentWord) {
                switch (event.key) {
                    case ' ':
                        this.app.flipCard();
                        event.preventDefault();
                        break;
                    case '1':
                        this.app.handleDifficulty('easy');
                        event.preventDefault();
                        break;
                    case '2':
                        this.app.handleDifficulty('good');
                        event.preventDefault();
                        break;
                    case '3':
                        this.app.handleDifficulty('hard');
                        event.preventDefault();
                        break;
                    case '4':
                        this.app.handleDifficulty('again');
                        event.preventDefault();
                        break;
                    case 'ArrowRight':
                        this.app.nextCard();
                        event.preventDefault();
                        break;
                    case 'ArrowLeft':
                        this.app.previousCard();
                        event.preventDefault();
                        break;
                    case 'z':
                        this.toggleZenMode();
                        event.preventDefault();
                        break;
                }
            }
        });
    }

    handleDifficulty(difficulty) {
        this.app.flashcardManager.handleDifficulty(difficulty);
    }

    toggleZenMode() {
        document.body.classList.toggle('zen-mode');
        const isZen = document.body.classList.contains('zen-mode');
        this.app.logDebug('Zen Mode: ' + (isZen ? 'ON' : 'OFF'));
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Alt + 1-7', action: 'Switch tabs' },
            { key: 'Space', action: 'Flip flashcard' },
            { key: '1-4', action: 'Rate difficulty (Easy/Good/Hard/Again)' },
            { key: '←/→', action: 'Previous/Next card' },
            { key: 'Z', action: 'Toggle Zen Mode' },
            { key: 'T', action: 'Toggle theme' },
            { key: 'L', action: 'Toggle language' },
            { key: 'H or ?', action: 'Show this help' }
        ];

        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map((shortcut) => `
                        <div class="shortcut-item">
                            <kbd>${shortcut.key}</kbd>
                            <span>${shortcut.action.replace('🧘 ', '')}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });
    }

    setupEventListeners() {
        this.initializeKeyboardShortcuts();

        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const manager = window.languageManager;
                if (!manager) return;
                const newLang = manager.currentLanguage === 'en' ? 'es' : 'en';
                manager.setLanguage(newLang);
                this.app.updateLanguageDisplay();
            });
        }

        document.querySelectorAll('.nav-tab').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const tabButton = event.target.closest('.nav-tab');
                if (!tabButton) return;
                const tabName = tabButton.dataset.tab;
                if (tabName) {
                    this.app.uiController.switchTab(tabName);
                }
            });
        });

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.app.flashcardManager.nextCard());
        }

        const pinyinInput = document.getElementById('pinyin-input');
        const checkBtn = document.getElementById('check-btn');
        const nextCardBtn = document.getElementById('next-card-next-btn');

        if (pinyinInput) {
            pinyinInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    if (this.app.flashcardManager.waitingForNext) {
                        this.app.flashcardManager.nextCard();
                    } else {
                        this.app.flashcardManager.checkPinyinAnswer();
                    }
                }
            });
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.app.flashcardManager.checkPinyinAnswer());
        }

        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', () => this.app.flashcardManager.nextCard());
        }

        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.app.flipCard();
            });
        }

        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', () => {
                // Reserved for future interaction behavior.
            });
        }

        document.querySelectorAll('.difficulty-button').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const difficulty = event.target.dataset.difficulty;
                this.app.flashcardManager.handleDifficulty(difficulty);
            });
        });

        const flashcardArea = document.querySelector('.flashcard-area');
        if (flashcardArea) {
            let touchStartX = 0;
            let touchEndX = 0;

            flashcardArea.addEventListener('touchstart', (event) => {
                touchStartX = event.changedTouches[0].screenX;
            }, { passive: true });

            flashcardArea.addEventListener('touchend', (event) => {
                touchEndX = event.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }

        const levelSelect = document.getElementById('level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', (event) => {
                this.app.currentLevel = event.target.value;
                this.app.flashcardManager.setupSession();
            });
        }

        const practiceOrderSelect = document.getElementById('practice-order-mode');
        if (practiceOrderSelect) {
            practiceOrderSelect.value = this.app.practiceOrderMode || 'lesson';
            practiceOrderSelect.addEventListener('change', (event) => {
                const nextMode = event.target.value === 'mixed' ? 'mixed' : 'lesson';
                this.app.practiceOrderMode = nextMode;

                try {
                    localStorage.setItem('hsk-practice-order-mode', nextMode);
                } catch (error) {
                    this.app.logWarn('Error saving practice order mode:', error);
                }

                if (this.app.userProgress && typeof this.app.userProgress.updatePreference === 'function') {
                    this.app.userProgress.updatePreference('practiceOrderMode', nextMode);
                }

                this.app.flashcardManager.setupSession();
            });
        }

        document.querySelectorAll('input[name="practice-mode"]').forEach((radio) => {
            radio.addEventListener('change', (event) => {
                this.app.practiceMode = event.target.value;
                this.app.flashcardManager.updateCard();
            });
        });

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.app.toggleTheme());
        }

        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (event) => {
                if (window.languageManager) {
                    window.languageManager.setLanguage(event.target.value);
                }
            });
        }

        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (event) => {
                this.app.setVoicePreference(event.target.value);
            });
        }

        const headerSearch = document.getElementById('header-search');
        if (headerSearch) {
            headerSearch.addEventListener('input', (event) => {
                this.app.performHeaderSearch(event.target.value);
            });
            headerSearch.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.app.switchTab('browse');
                    const browseSearch = document.getElementById('search-input');
                    if (browseSearch) {
                        browseSearch.value = event.target.value;
                        browseSearch.focus();
                        this.app.filterVocabulary();
                    }
                }
            });
        }

        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.app.toggleAudio());
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.app.filterVocabulary());
        }

        const browseLevelFilter = document.getElementById('browse-level-filter');
        if (browseLevelFilter) {
            browseLevelFilter.addEventListener('change', () => this.app.filterVocabulary());
        }

        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.app.quizEngine.start());
        }

        const quizSubmitBtn = document.getElementById('quiz-submit');
        if (quizSubmitBtn) {
            quizSubmitBtn.addEventListener('click', () => this.app.quizEngine.submitAnswer());
        }

        const quizNextBtn = document.getElementById('quiz-next');
        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', () => this.app.quizEngine.nextQuestion());
        }

        const restartQuizBtn = document.getElementById('restart-quiz');
        if (restartQuizBtn) {
            restartQuizBtn.addEventListener('click', () => this.app.quizEngine.restart());
        }

        const newQuizBtn = document.getElementById('new-quiz');
        if (newQuizBtn) {
            newQuizBtn.addEventListener('click', () => this.app.quizEngine.restart());
        }

        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', () => this.app.resetStats());
        }

        const knowBtn = document.getElementById('know-btn');
        if (knowBtn) {
            knowBtn.addEventListener('click', () => this.app.markAsKnown(true));
        }

        const dontKnowBtn = document.getElementById('dont-know-btn');
        if (dontKnowBtn) {
            dontKnowBtn.addEventListener('click', () => this.app.markAsKnown(false));
        }

        this.app.homeController.setupEventListeners();

        window.addEventListener('beforeunload', () => {
            this.app.saveQuizSessionState();
        });

        this.app.logDebug('[✓] Event listeners setup');
    }

    handleSwipe(startX, endX) {
        if (Math.abs(endX - startX) < 50) {
            return;
        }

        if (endX < startX) {
            this.app.flashcardManager.nextCard();
        } else {
            this.app.flashcardManager.previousCard();
        }
    }
}

window.InteractionController = InteractionController;
