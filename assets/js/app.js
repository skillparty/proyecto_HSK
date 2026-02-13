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

        // Module Initialization Flags
        this.browseInitialized = false;
        this.quizInitialized = false;
        this.leaderboardInitialized = false;
        this.matrixInitialized = false;

        // User authentication and profile (Backend-integrated)
        this.backendAuth = null;
        this.userProgress = null;
        this.leaderboardManager = null;

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
            totalStudied: 0,
            correctAnswers: 0,
            currentStreak: 0,
            bestStreak: 0,
            studyTime: 0,
            dailyGoal: 20,
            todayCards: 0,
            quizzesCompleted: 0,
            quizAnswered: 0,
            matrixRounds: 0
        };

        this.syncToastState = {
            syncedShown: false,
            lastErrorAt: 0
        };

        this.errorDigestStorageKey = 'hsk-error-digest-v1';
        this.maxErrorDigestEntries = 10;

        this.quizSessionStorageKey = 'hsk-quiz-session-v1';
        this.quizSessionMaxAgeMs = 30 * 60 * 1000;
        this.lastTabStorageKey = 'hsk-last-tab-v1';
        this.onboardingSessionStorageKey = 'hsk-onboarding-session-v1';
        this.onboardingState = this.loadOnboardingState();

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
                window.addEventListener('languageChanged', async (e) => {
                    const nextLanguage = e?.detail?.language;
                    if (!nextLanguage || nextLanguage === this.currentLanguage) {
                        return;
                    }

                    const previousLanguage = this.currentLanguage;

                    try {
                        this.currentLanguage = nextLanguage;

                        // Reload vocabulary for the new language
                        console.log(`[🌐] Language changed to ${nextLanguage}, reloading vocabulary...`);
                        await this.loadVocabulary(nextLanguage);

                        // Refresh language-dependent UI after vocabulary is ready
                        this.updateLanguageDisplay();

                        // Update browse section if active
                        if (this.browseState) {
                            // Refresh the browse display with new vocabulary
                            this.initializeBrowse();
                        }

                        // Update user preference
                        if (this.userProgress) {
                            this.userProgress.updatePreference('language', nextLanguage);
                        }

                        const langLabel = nextLanguage === 'es'
                            ? (this.getTranslation('spanish') || 'Español')
                            : (this.getTranslation('english') || 'English');
                        this.showToast(`${this.getTranslation('languageUpdated') || 'Language updated'}: ${langLabel}`, 'success', 1800);

                        console.log(`[✓] Language change completed: ${nextLanguage}`);
                    } catch (error) {
                        this.currentLanguage = previousLanguage;
                        console.error('❌ Language change failed:', error);
                        this.showToast(this.getTranslation('languageUpdateFailed') || 'Language update failed', 'error', 2600);
                    }
                });

                console.log('[✓] LanguageManager initialized');
            }

            this.setupErrorDigestMonitoring();

            // Initialize Backend Authentication
            if (window.BackendAuth) {
                this.backendAuth = new window.BackendAuth();
                console.log('[✓] Backend Auth initialized');
            }

            // Initialize User Progress with Backend
            if (window.BackendUserProgress && this.backendAuth) {
                this.userProgress = new window.BackendUserProgress(this.backendAuth);

                // Load user preferences
                this.loadUserPreferences();

                console.log('[✓] Backend User Progress initialized');
            }

            // Initialize Leaderboard Manager
            if (window.LeaderboardManager) {
                this.leaderboardManager = new window.LeaderboardManager();
                console.log('[✓] Leaderboard Manager initialized');
            }

            // Load vocabulary
            await this.loadVocabulary();

            // Setup event listeners
            this.setupEventListeners();
            this.setupKeyboardAccessibility();

            // Hook module progress events
            this.setupGlobalProgressTracking();

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
            this.updateHeaderControlMicrocopy();
            this.restoreLastVisitedTab();
            await this.initHealthCheckPanelIfRequested();

            console.log('[✓] HSK Learning App initialized successfully!');

        } catch (error) {
            console.error('[✗] Error initializing app:', error);
        }
    }

    setupKeyboardAccessibility() {
        document.querySelectorAll('.home-card[data-tab-target]').forEach(card => {
            card.setAttribute('role', 'button');

            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const targetTab = card.dataset.tabTarget;

                    if (targetTab) {
                        this.switchTab(targetTab);
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
                    this.flipCard();
                }
            });
        }
    }

    isHealthCheckEnabled() {
        const params = new URLSearchParams(window.location.search);
        return params.get('health') === 'true';
    }

    async initHealthCheckPanelIfRequested() {
        if (!this.isHealthCheckEnabled()) {
            return;
        }

        const panelId = 'health-check-panel';
        if (document.getElementById(panelId)) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = panelId;
        panel.style.cssText = [
            'position:fixed',
            'bottom:16px',
            'right:16px',
            'z-index:10050',
            'width:320px',
            'max-width:calc(100vw - 24px)',
            'padding:12px',
            'border-radius:10px',
            'background:#0f172a',
            'border:1px solid rgba(148,163,184,0.35)',
            'color:#e2e8f0',
            'font:12px/1.4 Inter, system-ui, sans-serif',
            'box-shadow:0 8px 24px rgba(2,6,23,0.45)'
        ].join(';');

        panel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <strong style="font-size:12px;letter-spacing:.02em;">Health Check</strong>
                <div style="display:flex;gap:6px;">
                    <button id="health-check-download" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Download</button>
                    <button id="health-check-copy" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Copy</button>
                    <button id="health-check-clear" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Clear</button>
                    <button id="health-check-refresh" type="button" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:11px;">Refresh</button>
                </div>
            </div>
            <div id="health-check-content">Loading...</div>
        `;

        document.body.appendChild(panel);

        const render = async () => {
            const content = panel.querySelector('#health-check-content');
            if (!content) return;

            const authUser = window.supabaseClient?.getCurrentUser?.();
            const swVersion = await this.getServiceWorkerVersion();
            const digest = this.getErrorDigest();
            const latestError = digest[0]
                ? `${digest[0].source}: ${digest[0].message}`
                : 'none';

            const rows = [
                ['Online', navigator.onLine ? 'yes' : 'no'],
                ['Language', this.currentLanguage || 'unknown'],
                ['Auth user', authUser?.email || authUser?.id || 'guest'],
                ['Supabase config', window.SUPABASE_CONFIG?.url ? 'loaded' : 'missing'],
                ['SW control', navigator.serviceWorker?.controller ? 'active' : 'none'],
                ['SW version', swVersion || 'unknown'],
                ['Legacy API', window.HSK_ENABLE_LEGACY_BACKEND_API === true ? 'enabled' : 'disabled'],
                ['Errors (max 10)', String(digest.length)],
                ['Last error', latestError]
            ];

            content.innerHTML = rows
                .map(([label, value]) => `<div style="display:flex;justify-content:space-between;gap:8px;margin:2px 0;"><span style="color:#94a3b8;">${label}</span><span style="text-align:right;word-break:break-word;">${value}</span></div>`)
                .join('');
        };

        panel.querySelector('#health-check-refresh')?.addEventListener('click', () => {
            render();
        });

        panel.querySelector('#health-check-clear')?.addEventListener('click', () => {
            this.clearErrorDigest();
            render();
        });

        panel.querySelector('#health-check-copy')?.addEventListener('click', async () => {
            await this.copyHealthSummaryToClipboard();
        });

        panel.querySelector('#health-check-download')?.addEventListener('click', () => {
            this.downloadHealthSummaryFile();
        });

        await render();
    }

    async getServiceWorkerVersion() {
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        const controller = navigator.serviceWorker.controller;
        if (!controller) {
            return null;
        }

        return new Promise((resolve) => {
            const channel = new MessageChannel();
            const timeoutId = setTimeout(() => resolve(null), 1200);

            channel.port1.onmessage = (event) => {
                clearTimeout(timeoutId);
                resolve(event.data?.version || null);
            };

            try {
                controller.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
            } catch (error) {
                clearTimeout(timeoutId);
                resolve(null);
            }
        });
    }

    setupErrorDigestMonitoring() {
        if (window.__hskErrorDigestMonitoringEnabled) {
            return;
        }

        window.__hskErrorDigestMonitoringEnabled = true;

        window.addEventListener('error', (event) => {
            const target = event.target;

            if (target && target !== window) {
                const resourceUrl = target.currentSrc || target.src || target.href || 'unknown resource';
                this.logRuntimeIssue('resource', `Failed to load: ${resourceUrl}`);
                return;
            }

            const message = event.message || event.error?.message || 'Unknown runtime error';
            this.logRuntimeIssue('error', message);
        }, true);

        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason;
            let message = 'Unhandled promise rejection';

            if (typeof reason === 'string') {
                message = reason;
            } else if (reason?.message) {
                message = reason.message;
            } else {
                try {
                    message = JSON.stringify(reason);
                } catch (error) {
                    message = String(reason);
                }
            }

            this.logRuntimeIssue('promise', message);
        });
    }

    getErrorDigest() {
        try {
            const raw = localStorage.getItem(this.errorDigestStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    saveErrorDigest(entries) {
        try {
            localStorage.setItem(this.errorDigestStorageKey, JSON.stringify(entries));
        } catch (error) {
            console.warn('⚠️ Could not save error digest:', error);
        }
    }

    clearErrorDigest() {
        try {
            localStorage.removeItem(this.errorDigestStorageKey);
        } catch (error) {
            console.warn('⚠️ Could not clear error digest:', error);
        }
    }

    async buildHealthSummary() {
        const digest = this.getErrorDigest();
        const authUser = window.supabaseClient?.getCurrentUser?.();
        const swVersion = await this.getServiceWorkerVersion();
        const swControl = navigator.serviceWorker?.controller ? 'active' : 'none';

        const lines = [
            `time=${new Date().toISOString()}`,
            `online=${navigator.onLine}`,
            `language=${this.currentLanguage || 'unknown'}`,
            `authUser=${authUser?.email || authUser?.id || 'guest'}`,
            `supabaseConfig=${window.SUPABASE_CONFIG?.url ? 'loaded' : 'missing'}`,
            `swControl=${swControl}`,
            `swVersion=${swVersion || 'unknown'}`,
            `legacyApi=${window.HSK_ENABLE_LEGACY_BACKEND_API === true ? 'enabled' : 'disabled'}`,
            `errors=${digest.length}`
        ];

        digest.forEach((entry, index) => {
            lines.push(`error[${index + 1}]=${entry.timestamp} | ${entry.source} | ${entry.message}`);
        });

        return lines.join('\n');
    }

    async copyHealthSummaryToClipboard() {
        const text = await this.buildHealthSummary();
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                this.showToast('Health summary copied', 'success', 1500);
                return;
            }
        } catch (error) {
            console.warn('⚠️ Clipboard API unavailable:', error);
        }

        this.showToast('Could not copy summary automatically', 'error', 1800);
    }

    downloadHealthSummaryFile() {
        this.buildHealthSummary().then((text) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `hsk-health-${timestamp}.txt`;

            try {
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                URL.revokeObjectURL(url);
                this.showToast('Health summary downloaded', 'success', 1500);
            } catch (error) {
                console.warn('⚠️ Could not download summary:', error);
                this.showToast('Could not download summary', 'error', 1800);
            }
        }).catch((error) => {
            console.warn('⚠️ Could not build health summary:', error);
            this.showToast('Could not download summary', 'error', 1800);
        });
    }

    logRuntimeIssue(source, message) {
        const normalizedMessage = String(message || 'unknown error').slice(0, 220);
        const digest = this.getErrorDigest();
        const now = Date.now();
        const latest = digest[0];

        if (latest && latest.source === source && latest.message === normalizedMessage) {
            const latestTs = new Date(latest.timestamp || 0).getTime();
            if (now - latestTs < 2000) {
                return;
            }
        }

        const nextDigest = [{
            source,
            message: normalizedMessage,
            timestamp: new Date(now).toISOString()
        }, ...digest].slice(0, this.maxErrorDigestEntries);

        this.saveErrorDigest(nextDigest);
    }

    async loadVocabulary(forceLanguage = null) {
        const targetLanguage = forceLanguage || this.currentLanguage || 'en';

        try {
            let vocabularyFile;
            let isSpanishStructure = false;

            // Determine which file to load based on language
            if (targetLanguage === 'es') {
                vocabularyFile = 'assets/data/hsk_vocabulary_spanish.json';
                isSpanishStructure = true;
                console.log('[HTML] Loading Spanish vocabulary file...');
            } else {
                vocabularyFile = 'assets/data/hsk_vocabulary.json';
                console.log('[HTML] Loading English vocabulary file...');
            }

            const response = await fetch(vocabularyFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.vocabulary = await response.json();

            // If loading English file, ensure proper structure for compatibility
            if (!isSpanishStructure) {
                this.vocabulary = this.vocabulary.map(word => ({
                    ...word,
                    english: word.translation || word.english,
                    spanish: word.spanish || null // Keep Spanish null for English-only file
                }));
            }

            console.log(`[HTML] Loaded ${this.vocabulary.length} vocabulary items from ${vocabularyFile}`);
            console.log(`[SYS] Language: ${targetLanguage === 'es' ? 'Spanish' : 'English'} structure`);

        } catch (error) {
            console.error(`[✗] Error loading ${targetLanguage} vocabulary:`, error);

            // Fallback logic
            try {
                const fallbackFile = targetLanguage === 'es' ? 'assets/data/hsk_vocabulary.json' : 'assets/data/hsk_vocabulary_spanish.json';
                const fallbackResponse = await fetch(fallbackFile);

                    if (fallbackResponse.ok) {
                    this.vocabulary = await fallbackResponse.json();

                    // Normalize structure for fallback
                    if (targetLanguage === 'es' && fallbackFile === 'assets/data/hsk_vocabulary.json') {
                        // Loading English file as fallback for Spanish
                        this.vocabulary = this.vocabulary.map(word => ({
                            ...word,
                            english: word.translation || word.english,
                            spanish: word.translation || word.english // Use English as Spanish fallback
                        }));
                    } else if (targetLanguage === 'en' && fallbackFile === 'assets/data/hsk_vocabulary_spanish.json') {
                        // Loading Spanish file as fallback for English - already has proper structure
                    }

                    console.log(`[書] Loaded ${this.vocabulary.length} vocabulary items (fallback: ${fallbackFile})`);
                } else {
                    throw new Error('Fallback vocabulary file not found');
                }
            } catch (fallbackError) {
                console.error('[✗] Error loading fallback vocabulary:', fallbackError);
                // Final emergency fallback
                this.vocabulary = [
                    { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
                    { character: "谢谢", pinyin: "xiè xiè", english: "thank you", spanish: "gracias", level: 1 },
                    { character: "我", pinyin: "wǒ", english: "I/me", spanish: "yo", level: 1 },
                    { character: "你", pinyin: "nǐ", english: "you", spanish: "tú", level: 1 }
                ];
                console.log('[書] Using emergency fallback vocabulary');
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
        if (!this.userProgress) return;

        const preferences = this.userProgress.getPreferences();

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
                switch (e.key) {
                    case '1':
                        this.switchTab('home');
                        e.preventDefault();
                        break;
                    case '2':
                        this.switchTab('practice');
                        e.preventDefault();
                        break;
                    case '3':
                        this.switchTab('browse');
                        e.preventDefault();
                        break;
                    case '4':
                        this.switchTab('quiz');
                        e.preventDefault();
                        break;
                    case '5':
                        this.switchTab('matrix');
                        e.preventDefault();
                        break;
                    case '6':
                        this.switchTab('leaderboard');
                        e.preventDefault();
                        break;
                    case '7':
                        this.switchTab('stats');
                        e.preventDefault();
                        break;
                }
            }

            // Flashcard controls
            if (this.currentTab === 'practice' && this.currentWord) {
                switch (e.key) {
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
                        this.previousCard();
                        e.preventDefault();
                        break;
                    case 'z': // Zen Mode
                        this.toggleZenMode();
                        e.preventDefault();
                        break;
                }
            }
        });
    }

    handleDifficulty(difficulty) {
        if (!this.currentWord || !this.isFlipped) return;

        const isKnown = ['easy', 'good'].includes(difficulty);
        console.log(`🧠 Rated as: ${difficulty} (Known: ${isKnown})`);

        // Call existing markAsKnown which handles stats and feedback
        this.markAsKnown(isKnown);

        // Visual feedback for rating
        const btn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (btn) {
            btn.classList.add('active-rating');
            setTimeout(() => btn.classList.remove('active-rating'), 200);
        }
    }

    toggleZenMode() {
        document.body.classList.toggle('zen-mode');
        const isZen = document.body.classList.contains('zen-mode');
        console.log(`🧘 Zen Mode: ${isZen ? 'ON' : 'OFF'}`);
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
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <kbd>${s.key}</kbd>
                            <span>${s.action.replace('🧘 ', '')}</span>
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
                const tabButton = e.target.closest('.nav-tab');
                if (!tabButton) return;
                const tabName = tabButton.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Practice controls
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextCard());
        }

        // Pinyin Input Handling
        const pinyinInput = document.getElementById('pinyin-input');
        const checkBtn = document.getElementById('check-btn');
        const nextCardBtn = document.getElementById('next-card-next-btn'); // For manual next

        if (pinyinInput) {
            pinyinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (this.waitingForNext) {
                        this.nextCard();
                    } else {
                        this.checkPinyinAnswer();
                    }
                }
            });
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkPinyinAnswer());
        }

        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', () => this.nextCard());
        }

        // Flip button
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling to flashcard click
                this.flipCard();
            });
        }

        // Add click handler for flashcard itself
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', (e) => {
                // Ignore clicks in input mode, let user focus on typing
                // Or maybe focus input if clicked?
                // if (e.target.closest('button') || e.target.closest('.card-back-pronunciation') || e.target.closest('input')) return;
                // if (!this.isFlipped) {
                //     document.getElementById('pinyin-input')?.focus();
                // }
            });
        }


        // Difficulty Buttons (New SRS Controls)
        document.querySelectorAll('.difficulty-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.handleDifficulty(difficulty);
            });
        });

        // Touch Gestures for Mobile (Swipe)
        const flashcardArea = document.querySelector('.flashcard-area');
        if (flashcardArea) {
            let touchStartX = 0;
            let touchEndX = 0;

            flashcardArea.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            flashcardArea.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });

            this.handleSwipe = (startX, endX) => {
                // Minimum swipe distance
                if (Math.abs(endX - startX) < 50) return;

                if (endX < startX) {
                    // Swipe Left (Next)
                    this.nextCard();
                } else {
                    // Swipe Right (Previous)
                    this.previousCard();
                }
            };
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

        const newQuizBtn = document.getElementById('new-quiz');
        if (newQuizBtn) {
            newQuizBtn.addEventListener('click', () => this.restartQuiz());
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

        window.addEventListener('beforeunload', () => {
            this.saveQuizSessionState();
        });

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

    setupGlobalProgressTracking() {
        if (this.globalProgressTrackingReady) return;

        window.addEventListener('hsk:matrix-round', (event) => {
            const isCorrect = !!event?.detail?.correct;

            this.stats.totalStudied = (Number(this.stats.totalStudied) || 0) + 1;
            this.stats.matrixRounds = (Number(this.stats.matrixRounds) || 0) + 1;

            if (isCorrect) {
                this.stats.correctAnswers = (Number(this.stats.correctAnswers) || 0) + 1;
            }

            this.updateDailyProgress();
            this.saveStats();
            this.updateProgress();
            this.updateHeaderStats();
        });

        this.globalProgressTrackingReady = true;
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
        // Update functionality based on tab
        this.currentTab = tabName;

        try {
            localStorage.setItem(this.lastTabStorageKey, tabName);
        } catch (error) {
            console.warn('⚠️ Error saving last tab:', error);
        }

        // Hide all tabs
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none'; // Ensure display is toggled off
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.style.display = 'block'; // Ensure display is toggled on
        }

        // Update navigation state
        document.querySelectorAll('.nav-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Initialize specific tab content optimized
        switch (tabName) {
            case 'practice':
                // Always ready
                break;
            case 'browse':
                if (!this.browseInitialized) {
                    this.initializeBrowse();
                    this.browseInitialized = true;
                }
                break;
            case 'quiz':
                if (!this.quizInitialized) {
                    this.initializeQuiz();
                    this.quizInitialized = true;
                }
                this.renderQuizResumeAction();
                break;
            case 'stats':
                this.updateStats();
                break;
            case 'matrix':
                if (!this.matrixInitialized) {
                    this.initializeMatrixGame();
                    this.matrixInitialized = true;
                }
                break;
            case 'leaderboard':
                if (!this.leaderboardInitialized) {
                    this.initializeLeaderboard();
                    this.leaderboardInitialized = true;
                }
                break;
        }

        this.renderOnboardingHintForTab(tabName);

        console.log(`📱 Switched to tab: ${tabName}`);
    }

    loadLastVisitedTab() {
        try {
            const raw = localStorage.getItem(this.lastTabStorageKey);
            return raw || null;
        } catch (error) {
            console.warn('⚠️ Error loading last tab:', error);
            return null;
        }
    }

    restoreLastVisitedTab() {
        const allowedTabs = new Set(['home', 'practice', 'browse', 'quiz', 'matrix', 'leaderboard', 'stats']);
        const savedTab = this.loadLastVisitedTab();

        if (!savedTab || !allowedTabs.has(savedTab)) {
            return;
        }

        if (!document.getElementById(savedTab)) {
            return;
        }

        this.switchTab(savedTab);
    }

    loadOnboardingState() {
        const defaults = {
            homeHintShown: false,
            moduleHintShown: false,
            homeHintDismissed: false,
            moduleHintDismissed: false
        };

        try {
            const raw = sessionStorage.getItem(this.onboardingSessionStorageKey);
            if (!raw) return { ...defaults };

            const parsed = JSON.parse(raw);
            return { ...defaults, ...parsed };
        } catch (error) {
            console.warn('⚠️ Error loading onboarding state:', error);
            return { ...defaults };
        }
    }

    saveOnboardingState() {
        try {
            sessionStorage.setItem(this.onboardingSessionStorageKey, JSON.stringify(this.onboardingState || {}));
        } catch (error) {
            console.warn('⚠️ Error saving onboarding state:', error);
        }
    }

    isLearningModuleTab(tabName) {
        return ['practice', 'browse', 'quiz', 'matrix', 'leaderboard', 'stats'].includes(tabName);
    }

    getTabDisplayName(tabName) {
        const tabButton = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
        const labelElement = tabButton?.querySelector('span');
        const text = labelElement?.textContent?.trim();
        return text || tabName;
    }

    removeOnboardingHintFromTab(tabName) {
        const panel = document.getElementById(tabName);
        const existingHint = panel?.querySelector('.onboarding-hint');
        if (existingHint) {
            existingHint.remove();
        }
    }

    renderOnboardingHintForTab(tabName) {
        const panel = document.getElementById(tabName);
        if (!panel || !this.onboardingState) return;

        this.removeOnboardingHintFromTab(tabName);

        let hintType = null;
        let hintMessage = '';

        if (
            tabName === 'home' &&
            !this.onboardingState.homeHintShown &&
            !this.onboardingState.homeHintDismissed
        ) {
            hintType = 'home';
            hintMessage = this.getTranslation('onboardingHomeHint') || 'Welcome! Start in Practice and then try Quiz or Matrix to build streak.';
            this.onboardingState.homeHintShown = true;
        } else if (
            this.isLearningModuleTab(tabName) &&
            !this.onboardingState.moduleHintShown &&
            !this.onboardingState.moduleHintDismissed
        ) {
            const moduleName = this.getTabDisplayName(tabName);
            hintType = 'module';
            hintMessage = this.getTranslation('onboardingModuleHint', { module: moduleName }) || `Tip: In ${moduleName}, complete a quick action to generate progress.`;
            this.onboardingState.moduleHintShown = true;
        }

        if (!hintType) {
            this.saveOnboardingState();
            return;
        }

        const hint = document.createElement('div');
        hint.className = `onboarding-hint onboarding-hint--${hintType}`;
        hint.innerHTML = `
            <div class="onboarding-hint-content">
                <span class="onboarding-hint-icon" aria-hidden="true">💡</span>
                <span class="onboarding-hint-text">${hintMessage}</span>
            </div>
            <button type="button" class="onboarding-hint-close" aria-label="Close onboarding hint">×</button>
        `;

        const closeButton = hint.querySelector('.onboarding-hint-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                if (hintType === 'home') {
                    this.onboardingState.homeHintDismissed = true;
                } else {
                    this.onboardingState.moduleHintDismissed = true;
                }

                this.saveOnboardingState();
                hint.remove();
            });
        }

        panel.prepend(hint);
        this.saveOnboardingState();
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
                this.showError(this.getTranslation('noVocabularyForLevel', { level: this.currentLevel }) || `No vocabulary found for HSK level ${this.currentLevel}`);

            // Check if we're in Spanish mode and trying to access levels 2-6
            if (this.currentLanguage === 'es' && this.currentLevel > 1) {
                this.showSpanishLevelMessage();
            } else {
                this.showError(`No vocabulary found for HSK level ${this.currentLevel}`);
            }
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

        switch (mode) {
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

        // Reset flip state visually
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            // Force reset transition to prevent peek
            flashcard.style.transition = 'none';
            flashcard.classList.remove('flipped');
            void flashcard.offsetWidth; // Trigger reflow
            setTimeout(() => {
                flashcard.style.transition = '';
            }, 50);

            this.isFlipped = false;
        }

        // Reset inputs
        if (questionText) questionText.textContent = question || '?';
        // Note: Answer is now only populated in the back to prevent peeking
        if (hintText) hintText.textContent = hint || '';
        if (fullInfo) fullInfo.style.opacity = '1';

        // Reset Pinyin Input
        const pinyinInput = document.getElementById('pinyin-input');
        const feedbackMsg = document.getElementById('feedback-message');
        const nextCardBtn = document.getElementById('next-card-next-btn'); // ID from HTML update

        if (pinyinInput) {
            pinyinInput.value = '';
            pinyinInput.disabled = false;
            pinyinInput.className = 'pinyin-input'; // Reset classes
            pinyinInput.focus();
        }

        if (feedbackMsg) {
            feedbackMsg.textContent = '';
            feedbackMsg.className = 'feedback-message';
        }

        if (nextCardBtn) {
            nextCardBtn.style.display = 'none';
        }

        this.waitingForNext = false;

        fullInfo.innerHTML = `
            <div class="word-info-expanded">
                <div class="card-back-header">
                    <div class="card-back-character">${this.currentWord.character || '?'}</div>
                    <div class="card-back-pinyin">${this.currentWord.pinyin || '?'}</div>
                    <button class="card-back-pronunciation" onclick="window.app.playAudio('${this.currentWord.character}')">
                        <span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        </span>
                        <span>${this.getTranslation('playPronunciation')}</span>
                    </button>
                </div>
                
                <div class="translations-section">
                    <div class="translation-item primary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.currentLanguage === 'es' ? 'ES' : 'EN'}</span>
                            <span class="lang-name">${this.currentLanguage === 'es' ? 'Español' : 'English'}</span>
                        </div>
                        <div class="translation-content">${meaning}</div>
                    </div>
                    <div class="translation-item secondary-translation">
                        <div class="translation-header">
                            <span class="lang-flag">${this.currentLanguage === 'es' ? 'EN' : 'ES'}</span>
                            <span class="lang-name">${this.currentLanguage === 'es' ? 'English' : 'Español'}</span>
                        </div>
                        <div class="translation-content">${this.currentLanguage === 'es' ? (this.currentWord.english || '?') : (this.currentWord.spanish || this.currentWord.translation || '?')}</div>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.getTranslation('wordTypeLabel')}</div>
                            <div class="detail-value">${this.getWordType(this.currentWord)}</div>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                        <div class="detail-info">
                            <div class="detail-label">${this.getTranslation('tonesLabel')}</div>
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
            return this.getTranslation('wordTypeVerb') || 'Verb';
        } else if (english.includes('adj') || english.includes('adjective')) {
            return this.getTranslation('wordTypeAdjective') || 'Adjective';
        } else if (english.includes('noun') || english.includes('person') || english.includes('thing')) {
            return this.getTranslation('wordTypeNoun') || 'Noun';
        } else if (english.includes('number') || /\d/.test(character)) {
            return this.getTranslation('wordTypeNumber') || 'Number';
        } else if (character.length === 1) {
            return this.getTranslation('wordTypeCharacter') || 'Character';
        } else {
            return this.getTranslation('wordTypeWord') || 'Word';
        }
    }

    normalizePinyin(text) {
        if (!text) return '';
        // Normalize basic latin characters and remove diacritics
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    checkPinyinAnswer() {
        if (this.isFlipped) return; // Already answered

        const pinyinInput = document.getElementById('pinyin-input');
        const feedbackMsg = document.getElementById('feedback-message');
        const nextCardBtn = document.getElementById('next-card-next-btn');

        if (!pinyinInput) return;

        const userPinyin = this.normalizePinyin(pinyinInput.value);
        const correctPinyin = this.normalizePinyin(this.currentWord.pinyin);

        if (userPinyin === correctPinyin) {
            // Correct
            pinyinInput.classList.add('correct');
            if (feedbackMsg) {
                feedbackMsg.textContent = this.getTranslation('pinyinCorrectFeedback') || 'Correct!';
                feedbackMsg.className = 'feedback-message visible correct-text';
            }

            // Play audio
            if (this.isAudioEnabled) this.playAudio(this.currentWord.character);

            this.markAsKnown(true);

            // Flip and show Next button
            setTimeout(() => {
                this.flipCard();
                this.waitingForNext = true;
                if (nextCardBtn) {
                    nextCardBtn.style.display = 'block';
                    nextCardBtn.focus();
                }
            }, 600);

        } else {
            // Incorrect
            pinyinInput.classList.add('incorrect');
            if (feedbackMsg) {
                feedbackMsg.textContent = this.getTranslation('pinyinIncorrectFeedback', { answer: this.currentWord.pinyin }) || `Incorrect. The answer is ${this.currentWord.pinyin}`;
                feedbackMsg.className = 'feedback-message visible incorrect-text';
            }

            // Shake and then flip
            setTimeout(() => {
                pinyinInput.classList.remove('incorrect');
                this.flipCard();
                this.markAsKnown(false);
                this.waitingForNext = true;
                if (nextCardBtn) {
                    nextCardBtn.style.display = 'block';
                    nextCardBtn.focus();
                }
            }, 1000);
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
                    <div class="example-title">${this.getTranslation('usageExample')}</div>
                    <div class="example-sentence">
                        <div class="example-chinese">${example.chinese}</div>
                        <div class="example-translations">
                            <div class="example-english"><span class="lang-flag">EN</span> ${example.english}</div>
                            <div class="example-spanish"><span class="lang-flag">ES</span> ${example.spanish}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="example-section">
                <div class="example-title">${this.getTranslation('practiceWithWord')}</div>
                <div class="practice-tip">
                    ${this.getTranslation('createSentenceUsing', { character: word.character })}
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
            flipBtn.textContent = this.getTranslation('showAnswer') || 'Show answer';
            flipBtn.style.opacity = '1';
        }

        // Disable knowledge assessment buttons
        this.disableKnowledgeButtons();

        console.log('🔄 Card reset to front side');
    }

    flipCard() {
        const flashcard = document.getElementById('flashcard');
        const pinyinInput = document.getElementById('pinyin-input');

        if (flashcard && !this.isFlipped) {
            flashcard.classList.add('flipped');
            this.isFlipped = true;

            // Disable input when flipped
            if (pinyinInput) {
                pinyinInput.disabled = true;
            }

            // Enable knowledge buttons if visible (legacy support)
            this.enableKnowledgeButtons();

            console.log('[卡] Card flipped');
        }
    }

    previousCard() {
        if (!this.currentSession || this.currentSession.length === 0) return;

        this.sessionIndex = (this.sessionIndex - 1 + this.currentSession.length) % this.currentSession.length;
        this.currentWord = this.currentSession[this.sessionIndex];
        this.isFlipped = false;

        this.updateCard();
        this.updateProgress();
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

    async markAsKnown(isKnown) {
        if (!this.currentWord || !this.isFlipped) return;

        this.stats.totalStudied = (Number(this.stats.totalStudied) || 0) + 1;

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

        // Sync with Supabase if user is authenticated
        if (window.supabaseClient && window.supabaseClient.isAuthenticated()) {
            try {
                const hskLevel = this.currentWord.level || this.currentLevel;
                await window.supabaseClient.updateProgress(hskLevel, isKnown, 0);
                console.log('✅ Progress synced with Supabase');
                if (!this.syncToastState.syncedShown) {
                    this.syncToastState.syncedShown = true;
                    this.showToast(this.getTranslation('progressSynced') || 'Progress synced to cloud', 'success', 1800);
                }
            } catch (error) {
                console.error('❌ Error syncing progress with Supabase:', error);
                const now = Date.now();
                if (now - this.syncToastState.lastErrorAt > 15000) {
                    this.syncToastState.lastErrorAt = now;
                    this.showToast(this.getTranslation('progressSyncFailedLocal') || 'Sync failed - progress saved locally', 'error', 3000);
                }
            }
        }

        // Record in user profile if available
        if (this.userProgress) {
            this.userProgress.recordWordStudy(this.currentWord, isKnown, this.practiceMode);
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

        feedback.innerHTML = isKnown ? 'Correcto' : 'Sigue practicando';

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
        if (this.userProgress && this.userProgress.isAuthenticated()) {
            const profileStats = this.userProgress.getStatistics();
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

        const totalStudied = Number(stats.totalStudied ?? stats.totalCards ?? 0) || 0;
        const correctAnswers = Number(stats.correctAnswers || 0) || 0;
        const currentStreak = Number(stats.currentStreak || 0) || 0;

        if (studiedEl) studiedEl.textContent = totalStudied;
        if (streakEl) streakEl.textContent = currentStreak;

        if (progressEl) {
            const progress = totalStudied > 0 ?
                Math.min((correctAnswers / totalStudied) * 100, 100) : 0;
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

        const message = this.isAudioEnabled
            ? (this.getTranslation('audioEnabledMsg') || 'Audio enabled')
            : (this.getTranslation('audioDisabledMsg') || 'Audio disabled');
        this.showHeaderNotification(message);

        console.log(`🔊 Audio toggled: ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
    }

    updateAudioButton() {
        const audioToggle = document.getElementById('audio-toggle');
        if (!audioToggle) return;

        const audioToggleLabel = this.isAudioEnabled
            ? (this.getTranslation('disableAudio') || 'Disable audio')
            : (this.getTranslation('enableAudio') || 'Enable audio');

        audioToggle.title = audioToggleLabel;
        audioToggle.setAttribute('aria-label', audioToggleLabel);
        audioToggle.setAttribute('data-tooltip', audioToggleLabel);

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
        this.showToast(message, 'success');
    }

    showError(message) {
        console.error('❌ Error:', message);
        this.showToast(message, 'error', 4000);
    }

    ensureToastStyles() {
        if (document.getElementById('hsk-toast-styles')) return;

        const style = document.createElement('style');
        style.id = 'hsk-toast-styles';
        style.textContent = `
            .hsk-toast-container {
                position: fixed;
                top: 84px;
                right: 20px;
                z-index: 10050;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            }
            .hsk-toast {
                min-width: 220px;
                max-width: 360px;
                border-radius: 10px;
                padding: 10px 14px;
                color: #fff;
                font-size: 0.875rem;
                box-shadow: 0 10px 24px rgba(0,0,0,.25);
                opacity: 0;
                transform: translateX(16px);
                transition: opacity .2s ease, transform .2s ease;
                pointer-events: auto;
            }
            .hsk-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            .hsk-toast.hide {
                opacity: 0;
                transform: translateX(16px);
            }
            .hsk-toast-success { background: #16a34a; }
            .hsk-toast-error { background: #dc2626; }
            .hsk-toast-info { background: #2563eb; }
            .hsk-toast-warning { background: #d97706; }
        `;
        document.head.appendChild(style);
    }

    showToast(message, type = 'info', duration = 2200) {
        if (!message) return;

        this.ensureToastStyles();

        let container = document.getElementById('hsk-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hsk-toast-container';
            container.className = 'hsk-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `hsk-toast hsk-toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 220);
        }, duration);
    }

    showSpanishLevelMessage() {
        console.log('ℹ️ Spanish level limitation message');

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px 32px;
            border-radius: 16px;
            font-size: 0.95rem;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.4s ease-out;
            max-width: 90%;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;

        const soonTitle = this.getTranslation('spanishLevelSoonTitle', { level: this.currentLevel }) || `HSK Level ${this.currentLevel} - Coming Soon`;
        const soonBody = this.getTranslation('spanishLevelSoonBody') || 'Remaining Spanish levels will be added soon. You can use all 6 levels in English right now.';
        const switchToEnglishLabel = this.getTranslation('switchToEnglishBtn') || 'Switch to English';
        const backToHsk1Label = this.getTranslation('backToHsk1Btn') || 'Go to HSK 1';

        // Add informative message with action button
        notification.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; justify-content: center;">
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px;">
                    ${soonTitle}
                </div>
                <div style="line-height: 1.5; opacity: 0.95; max-width: 400px;">
                    ${soonBody}
                </div>
                <div style="display: flex; gap: 12px; margin-top: 8px;">
                    <button id="switch-to-english" style="
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9em;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 6px;">
                            <path d="M3 5h12M9 3v2m-4 8h10m-5-2v2m-7 8h18M12 19v2"></path>
                        </svg>
                        ${switchToEnglishLabel}
                    </button>
                    <button id="back-to-level1" style="
                        background: rgba(255, 255, 255, 0.9);
                        color: #667eea;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.9em;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='white'" 
                       onmouseout="this.style.background='rgba(255,255,255,0.9)'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 6px;">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        ${backToHsk1Label}
                    </button>
                </div>
                <button id="close-message" style="
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1.5em;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.3s ease;
                " onmouseover="this.style.color='white'" 
                   onmouseout="this.style.color='rgba(255,255,255,0.7)'">×</button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalSlideIn {
                from { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
                to { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
            }
            @keyframes modalSlideOut {
                from { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                to { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        `;
        backdrop.innerHTML = `<style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>`;
        document.body.appendChild(backdrop);

        // Event listeners
        const closeModal = () => {
            notification.style.animation = 'modalSlideOut 0.3s ease-out';
            backdrop.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) notification.remove();
                if (backdrop.parentNode) backdrop.remove();
                if (style.parentNode) style.remove();
            }, 300);
        };

        document.getElementById('close-message').addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        document.getElementById('switch-to-english').addEventListener('click', () => {
            // Switch to English and reload vocabulary
            if (window.languageManager) {
                window.languageManager.setLanguage('en');
            }
            this.currentLanguage = 'en';
            localStorage.setItem('hsk-language', 'en');
            this.loadVocabulary();
            closeModal();
        });

        document.getElementById('back-to-level1').addEventListener('click', () => {
            // Go back to HSK level 1
            this.currentLevel = 1;
            const levelSelector = document.getElementById('level-selector');
            if (levelSelector) levelSelector.value = '1';
            this.setupPracticeSession();
            closeModal();
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                closeModal();
            }
        }, 10000);
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

        // Re-link active quiz questions to current-language vocabulary entries
        this.relocalizeQuizQuestionsToCurrentVocabulary();

        // Update active quiz question/options in-place after language change
        const quizContainer = document.getElementById('quiz-container');
        const isQuizVisible = quizContainer && quizContainer.style.display !== 'none';
        const hasActiveQuestion = this.quiz && this.quiz.isActive &&
            Array.isArray(this.quiz.questions) &&
            this.quiz.currentQuestion < this.quiz.questions.length;

        if (isQuizVisible && hasActiveQuestion) {
            this.showQuizQuestion();
        }

        this.updateThemeButton();
        this.updateAudioButton();
        this.updateHeaderControlMicrocopy();
    }

    updateHeaderControlMicrocopy() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            const title = this.getTranslation('languageSelectorTitle') || 'Language';
            const tooltip = this.getTranslation('languageSelectorTooltip') || 'Change interface language';
            languageSelect.title = title;
            languageSelect.setAttribute('aria-label', title);
            languageSelect.setAttribute('data-tooltip', tooltip);
        }

        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            const title = this.getTranslation('voiceSelectorTitle') || 'Voice';
            const tooltip = this.getTranslation('voiceSelectorTooltip') || 'Select voice for pronunciation';
            voiceSelect.title = title;
            voiceSelect.setAttribute('aria-label', title);
            voiceSelect.setAttribute('data-tooltip', tooltip);
        }
    }

    relocalizeQuizQuestionsToCurrentVocabulary() {
        if (!this.quiz || !Array.isArray(this.quiz.questions) || this.quiz.questions.length === 0) {
            return;
        }

        this.quiz.questions = this.quiz.questions.map((question) => {
            const byCharacterAndPinyin = this.vocabulary.find((word) =>
                word.character === question.character && word.pinyin === question.pinyin
            );
            if (byCharacterAndPinyin) return byCharacterAndPinyin;

            const byCharacter = this.vocabulary.find((word) => word.character === question.character);
            if (byCharacter) return byCharacter;

            const byPinyin = this.vocabulary.find((word) => word.pinyin === question.pinyin);
            if (byPinyin) return byPinyin;

            return question;
        });
    }

    getTranslation(key, replacements = {}) {
        // Use LanguageManager's translation system
        if (window.languageManager) {
            return window.languageManager.t(key, replacements);
        }
        return key; // Fallback to key if no translation found
    }

    initializeMatrixGameLegacy() {
        // Inicializar el juego de matriz si existe
        if (window.matrixGame) {
            // Pasar el vocabulario actual al juego
            window.matrixGame.vocabulary = this.vocabulary;
            window.matrixGame.showGame();
            console.log('[✓] Matrix game initialized');
        } else {
            console.error('[✗] Matrix game not loaded');
        }
    }

    // Initialize leaderboard
    initializeLeaderboard() {
        if (this.leaderboardManager) {
            this.leaderboardManager.loadLeaderboard();
            console.log('[✓] Leaderboard initialized');
        } else {
            console.warn('[⚠] Leaderboard manager not available');
        }
    }

    getMeaningForLanguage(word) {
        if (this.currentLanguage === 'es') {
            // For Spanish: prefer spanish field, fallback to translation, then english
            return word.spanish || word.translation || word.english || '?';
        } else {
            // For English: prefer english field, fallback to translation
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
            browseStats.textContent = this.getTranslation('wordsFound', { count: filteredVocab.length }) || `Found ${filteredVocab.length} words`;
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
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${word.character} ${word.pinyin}`);
        const meaning = this.getMeaningForLanguage(word);
        card.innerHTML = `
            <div class="vocab-character">${word.character}</div>
            <div class="vocab-pinyin">${word.pinyin}</div>
            <div class="vocab-meaning">${meaning}</div>
            <div class="vocab-level">HSK ${word.level}</div>
            <button class="vocab-audio-btn" title="${this.getTranslation('playPronunciation') || 'Play pronunciation'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            </button>
        `;

        // Add click handler for card
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.vocab-audio-btn')) {
                this.selectVocabWord(word);
            }
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target.closest('.vocab-audio-btn')) {
                    return;
                }

                e.preventDefault();
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
                <div class="loading-text">${this.getTranslation('loadingMoreVocabulary') || 'Loading more vocabulary...'}</div>
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
                <div class="no-more-text">${this.getTranslation('allVocabularyLoaded') || '[✓] All vocabulary loaded!'}</div>
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
                <div class="no-results-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <div class="no-results-text">${this.getTranslation('noVocabularyFound') || 'No vocabulary found'}</div>
                <div class="no-results-subtitle">${this.getTranslation('tryAdjustingSearch') || 'Try adjusting your search or filter'}</div>
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
        this.quiz.correctAnswer = null;
        this.quiz.selectedAnswer = null;
        this.quiz.isActive = true;

        // Show quiz container
        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.saveQuizSessionState();

        this.showQuizQuestion();
    }

    showQuizQuestion() {
        const question = this.quiz.questions[this.quiz.currentQuestion];
        const questionDisplay = document.getElementById('quiz-question');
        const optionsContainer = document.getElementById('quiz-options');
        const currentSpan = document.getElementById('quiz-current');
        const totalSpan = document.getElementById('quiz-total');
        const scoreSpan = document.getElementById('quiz-score');
        const currentQuestionNumber = this.quiz.currentQuestion + 1;
        const totalQuestions = this.quiz.questions.length;

        if (currentSpan) currentSpan.textContent = currentQuestionNumber;
        if (totalSpan) totalSpan.textContent = totalQuestions;
        if (scoreSpan) scoreSpan.textContent = this.quiz.score;

        // Show question
        if (questionDisplay) {
            const hskLevelLabel = this.getTranslation('quizHskLevel') || 'HSK Level';
            const questionLabel = this.getTranslation('quizQuestionCounter') || (this.getTranslation('question') || 'Question');
            const ofLabel = this.getTranslation('of') || 'of';
            const hskLevelValue = question?.level ? `HSK ${question.level}` : (this.getTranslation('allLevels') || 'All levels');

            questionDisplay.innerHTML = `
                <div class="quiz-question-meta">
                    <span class="quiz-meta-pill">${hskLevelLabel}: ${hskLevelValue}</span>
                    <span class="quiz-meta-pill">${questionLabel} ${currentQuestionNumber} ${ofLabel} ${totalQuestions}</span>
                </div>
                <div class="quiz-question-text">${this.getTranslation('whatDoesThisCharacterMean') || 'What does this character mean?'}</div>
                <div class="quiz-character">${question.character}</div>
                <div class="quiz-pinyin">${question.pinyin}</div>
            `;
        }

        // Generate options with guaranteed correct answer
        const correctAnswer = this.getMeaningForLanguage(question);
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

        this.saveQuizSessionState();

        console.log(`❓ Quiz question ${this.quiz.currentQuestion + 1}: ${question.character} (${correctAnswer})`);
    }

    generateQuizOptions(currentWord, correctAnswer) {
        // Get all possible wrong answers
        const allWrongAnswers = this.vocabulary
            .filter(word => word !== currentWord)
            .map(word => this.getMeaningForLanguage(word))
            .filter(meaning => meaning && meaning !== correctAnswer)
            .filter((meaning, index, arr) => arr.indexOf(meaning) === index); // Remove duplicates

        // Ensure we have enough wrong answers
        if (allWrongAnswers.length < 3) {
            console.warn('⚠️ Not enough vocabulary for 4 options, using available options');
            // Add some generic wrong answers if needed
            const genericWrongAnswers = this.currentLanguage === 'es'
                ? ['hola', 'adiós', 'gracias', 'por favor', 'lo siento', 'sí', 'no']
                : ['hello', 'goodbye', 'thank you', 'please', 'sorry', 'yes', 'no'];
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
            submitBtn.textContent = this.getTranslation('submit') || 'Submit';
        }

        console.log(`👆 Selected answer: ${selected} (Correct: ${correct})`);
    }

    submitQuizAnswer() {
        if (!this.quiz.selectedAnswer) {
            this.showToast(this.getTranslation('selectAnAnswer') || 'Select an answer', 'warning', 1400);
            return;
        }

        const isCorrect = this.quiz.selectedAnswer === this.quiz.correctAnswer;

        this.stats.totalStudied = (Number(this.stats.totalStudied) || 0) + 1;
        this.stats.quizAnswered = (Number(this.stats.quizAnswered) || 0) + 1;

        // Update score immediately if correct
        if (isCorrect) {
            this.quiz.score++;
            this.stats.correctAnswers = (Number(this.stats.correctAnswers) || 0) + 1;
            console.log(`[✓] Correct answer! Score: ${this.quiz.score}/${this.quiz.questions.length}`);
        } else {
            console.log(`[✗] Incorrect answer. Score remains: ${this.quiz.score}/${this.quiz.questions.length}`);
        }

        this.updateDailyProgress();
        this.saveStats();
        this.updateProgress();
        this.updateHeaderStats();

        this.saveQuizSessionState();

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
        this.showToast(
            isCorrect
                ? (this.getTranslation('answerCorrectToast') || 'Correct answer!')
                : (this.getTranslation('answerIncorrectToast') || 'Incorrect answer'),
            isCorrect ? 'success' : 'error',
            1400
        );

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
            <div class="feedback-icon">${isCorrect
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'}</div>
            <div class="feedback-text">${isCorrect
                ? (this.getTranslation('correctQuizFeedback') || 'Correct!')
                : (this.getTranslation('incorrectQuizFeedback') || 'Incorrect')}</div>
            ${!isCorrect ? `<div class="feedback-answer">${this.getTranslation('correctAnswerLabel') || 'Correct answer'}: ${this.quiz.correctAnswer}</div>` : ''}
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
                submitBtn.textContent = this.getTranslation('selectAnAnswer') || 'Select an Answer';
            }

            if (nextBtn) {
                nextBtn.style.display = 'none';
            }

            // Clear previous question feedback
            const existingFeedback = document.getElementById('quiz-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            this.saveQuizSessionState();
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
        this.saveStats();
        this.clearQuizSessionState();
        this.renderQuizResumeAction();

        // Sync quiz completion to backend profile when available
        if (this.userProgress && typeof this.userProgress.recordQuizCompletion === 'function') {
            this.userProgress.recordQuizCompletion(
                this.currentLevel,
                this.quiz.score,
                this.quiz.questions.length
            );
        }
    }

    restartQuiz() {
        document.getElementById('quiz-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
        this.quiz.isActive = false;
        this.clearQuizSessionState();
        this.renderQuizResumeAction();
    }

    saveQuizSessionState() {
        try {
            if (!this.quiz || !this.quiz.isActive || !Array.isArray(this.quiz.questions) || this.quiz.questions.length === 0) {
                return;
            }

            const levelSelect = document.getElementById('quiz-level');
            const questionsSelect = document.getElementById('quiz-questions');

            const state = {
                selectedLevel: levelSelect?.value || '1',
                numQuestions: Number(questionsSelect?.value || this.quiz.questions.length) || this.quiz.questions.length,
                quiz: {
                    questions: this.quiz.questions,
                    currentQuestion: Number(this.quiz.currentQuestion || 0),
                    score: Number(this.quiz.score || 0),
                    selectedAnswer: this.quiz.selectedAnswer || null,
                    correctAnswer: this.quiz.correctAnswer || null,
                    isActive: true
                },
                updatedAt: Date.now()
            };

            localStorage.setItem(this.quizSessionStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Error saving quiz session state:', error);
        }
    }

    loadQuizSessionState() {
        try {
            const raw = localStorage.getItem(this.quizSessionStorageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.warn('⚠️ Error loading quiz session state:', error);
            return null;
        }
    }

    clearQuizSessionState() {
        try {
            localStorage.removeItem(this.quizSessionStorageKey);
        } catch (error) {
            console.warn('⚠️ Error clearing quiz session state:', error);
        }
    }

    hasResumableQuizSession(session = null) {
        const state = session || this.loadQuizSessionState();
        if (!state || !state.updatedAt || !state.quiz) return false;

        const age = Date.now() - Number(state.updatedAt);
        if (age > this.quizSessionMaxAgeMs) {
            this.clearQuizSessionState();
            return false;
        }

        return !!(state.quiz.isActive && Array.isArray(state.quiz.questions) && state.quiz.questions.length > 0);
    }

    renderQuizResumeAction() {
        const quizSetup = document.getElementById('quiz-setup');
        if (!quizSetup) return;

        let resumeBtn = document.getElementById('resume-quiz');
        if (!this.hasResumableQuizSession()) {
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

            resumeBtn.addEventListener('click', () => this.resumeQuizSession());
        }

        resumeBtn.textContent = this.getTranslation('resumeQuiz') || 'Resume Quiz';
    }

    resumeQuizSession() {
        const state = this.loadQuizSessionState();
        if (!this.hasResumableQuizSession(state)) {
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

        this.quiz = {
            ...this.quiz,
            ...state.quiz,
            isActive: true
        };

        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.showQuizQuestion();
        this.showToast(this.getTranslation('quizSessionResumed') || 'Quiz session resumed', 'success', 1600);
    }

    // Stats functionality
    async updateStats() {
        console.log('📊 Updating stats...');

        // Show loading state if needed here, or just update silently

        // Load stats from Supabase if user is authenticated
        let stats = this.stats;

        if (window.supabaseClient && window.supabaseClient.isAuthenticated()) {
            try {
                const supabaseStats = await window.supabaseClient.getUserStatistics();
                if (supabaseStats) {
                    stats = {
                        totalStudied: supabaseStats.totalStudied || 0,
                        correctAnswers: supabaseStats.correctAnswers || 0,
                        incorrectAnswers: supabaseStats.incorrectAnswers || 0,
                        currentStreak: supabaseStats.currentStreak || 0,
                        bestStreak: supabaseStats.bestStreak || 0,
                        quizzesCompleted: this.stats.quizzesCompleted // Keep local quiz count for now
                    };
                    console.log('✅ Loaded stats from Supabase:', stats);
                }
            } catch (error) {
                console.error('❌ Error loading stats from Supabase:', error);
                // Fallback to local stats is already set
            }
        }

        // Safely update stats elements with null checks
        const totalStudiedEl = document.getElementById('total-studied');
        if (totalStudiedEl) totalStudiedEl.textContent = stats.totalStudied;

        const quizCountEl = document.getElementById('quiz-count');
        if (quizCountEl) quizCountEl.textContent = stats.quizzesCompleted || 0;

        const streakCountEl = document.getElementById('current-streak');
        if (streakCountEl) streakCountEl.textContent = stats.currentStreak;

        const accuracy = stats.totalStudied > 0 ?
            Math.round((stats.correctAnswers / stats.totalStudied) * 100) : 0;

        const accuracyRateEl = document.getElementById('accuracy-rate');
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;

        const hasStatsProgress = (stats.totalStudied || 0) > 0 ||
            (stats.quizzesCompleted || 0) > 0 ||
            (stats.currentStreak || 0) > 0;

        this.toggleStatsEmptyState(!hasStatsProgress);

        // Update level progress safely
        if (hasStatsProgress) {
            try {
                await this.updateLevelProgress();
            } catch (error) {
                console.error('❌ Error updating level progress:', error);
            }
        }
    }

    toggleStatsEmptyState(showEmpty) {
        const statsCards = document.querySelector('#stats .stats-cards');
        const levelProgress = document.querySelector('#stats .level-progress');
        const resetBtn = document.getElementById('reset-stats');
        const emptyState = document.getElementById('stats-empty-state');

        if (statsCards) statsCards.style.display = showEmpty ? 'none' : '';
        if (levelProgress) levelProgress.style.display = showEmpty ? 'none' : '';
        if (resetBtn) resetBtn.style.display = showEmpty ? 'none' : '';
        if (emptyState) emptyState.style.display = showEmpty ? 'flex' : 'none';
    }

    async updateLevelProgress() {
        const container = document.getElementById('level-progress-bars');
        if (!container) return;

        container.innerHTML = '';

        // Get level progress from Supabase if authenticated
        let levelProgressData = [];
        if (window.supabaseClient && window.supabaseClient.isAuthenticated()) {
            try {
                const userStats = await window.supabaseClient.getUserStatistics();
                if (userStats && userStats.levelProgress) {
                    levelProgressData = userStats.levelProgress;
                }
            } catch (error) {
                console.error('❌ Error loading level progress:', error);
            }
        }

        for (let level = 1; level <= 6; level++) {
            const levelWords = this.vocabulary.filter(word => word.level === level);
            const totalWords = levelWords.length;

            // Get studied words from Supabase data or use local fallback
            const levelData = levelProgressData.find(lp => lp.hsk_level === level);
            const studiedWords = levelData ? levelData.total_words_studied : 0;
            const accuracy = levelData && (levelData.correct_answers + levelData.incorrect_answers) > 0
                ? Math.round((levelData.correct_answers / (levelData.correct_answers + levelData.incorrect_answers)) * 100)
                : 0;

            const progress = totalWords > 0 ? Math.min((studiedWords / totalWords) * 100, 100) : 0;

            const progressBar = document.createElement('div');
            progressBar.className = 'level-progress-item';
            progressBar.innerHTML = `
                <div class="level-label">HSK ${level}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    ${studiedWords}/${totalWords}
                    ${accuracy > 0 ? ` (${accuracy}% accuracy)` : ''}
                </div>
            `;
            container.appendChild(progressBar);
        }
    }

    resetStats() {
        if (confirm(this.getTranslation('resetConfirm') || 'Are you sure you want to reset all statistics?')) {
            try {
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
                this.showToast(this.getTranslation('statsResetDone') || 'Statistics reset', 'success', 1800);
            } catch (error) {
                console.error('❌ Error resetting stats:', error);
                this.showToast(this.getTranslation('statsResetFailed') || 'Could not reset statistics', 'error', 2400);
            }
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

        // Force background image (Visual Redesign Fix)
        // Use Base64 data if available to bypass all loading issues
        let bgSource = "url('assets/images/bg-fusion.png')";

        if (window.bgFusionBase64) {
            console.log('🖼️ Using Base64 background image');
            bgSource = `url('${window.bgFusionBase64}')`;
        }

        document.body.style.background = `
            linear-gradient(rgba(15, 23, 42, 0.40), rgba(15, 23, 42, 0.60)),
            ${bgSource}
        `;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    }

    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) {
            console.warn('⚠️ Theme toggle button not found');
            return;
        }

        const nextThemeLabel = this.isDarkMode
            ? (this.getTranslation('switchToLightMode') || 'Switch to light mode')
            : (this.getTranslation('switchToDarkMode') || 'Switch to dark mode');

        themeToggle.title = nextThemeLabel;
        themeToggle.setAttribute('aria-label', nextThemeLabel);
        themeToggle.setAttribute('data-tooltip', nextThemeLabel);

        const lightIcon = themeToggle.querySelector('.light-icon');
        const darkIcon = themeToggle.querySelector('.dark-icon');

        // If icons don't exist, create them or update button text
        if (!lightIcon || !darkIcon) {
            // Fallback: update button text or create simple icons
            if (this.isDarkMode) {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'; // Light mode icon when in dark mode
                themeToggle.classList.add('active');
            } else {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'; // Dark mode icon when in light mode
                themeToggle.classList.remove('active');
            }
            return;
        }

        // Original logic if icons exist
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

            this.stats.totalCards = Number(this.stats.totalCards || 0) || 0;
            this.stats.totalStudied = Number(this.stats.totalStudied ?? this.stats.totalCards ?? 0) || 0;
            this.stats.correctAnswers = Number(this.stats.correctAnswers || 0) || 0;
            this.stats.currentStreak = Number(this.stats.currentStreak || 0) || 0;
            this.stats.bestStreak = Number(this.stats.bestStreak || 0) || 0;
            this.stats.dailyGoal = Number(this.stats.dailyGoal || 20) || 20;
            this.stats.todayCards = Number(this.stats.todayCards || 0) || 0;
            this.stats.quizzesCompleted = Number(this.stats.quizzesCompleted || 0) || 0;
            this.stats.quizAnswered = Number(this.stats.quizAnswered || 0) || 0;
            this.stats.matrixRounds = Number(this.stats.matrixRounds || 0) || 0;
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

    // Quiz functionality
    initializeQuiz() {
        console.log('🎯 Initializing Quiz module...');

        // Initialize quiz state if not exists
        if (!this.quiz) {
            this.quiz = {
                questions: [],
                currentQuestion: 0,
                score: 0,
                isActive: false,
                correctAnswer: null
            };
        }

        // Reset quiz UI
        const quizSetup = document.getElementById('quiz-setup');
        const quizContainer = document.getElementById('quiz-container');
        const quizResults = document.getElementById('quiz-results');

        if (quizSetup) quizSetup.style.display = 'block';
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResults) quizResults.style.display = 'none';

        console.log('[✓] Quiz module initialized');
    }

    setupQuizEventListeners() {
        // Start quiz button
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.onclick = () => this.startQuiz();
        }

        // Quiz option buttons (will be created dynamically)
        // Reset quiz button
        const resetQuizBtn = document.getElementById('reset-quiz-btn');
        if (resetQuizBtn) {
            resetQuizBtn.onclick = () => this.restartQuiz();
        }
    }

    startQuizDeprecated() {
        const levelSelect = document.getElementById('quiz-level');
        const questionsSelect = document.getElementById('quiz-questions');

        const selectedLevel = levelSelect ? levelSelect.value : '1';
        const numQuestions = questionsSelect ? parseInt(questionsSelect.value) : 10;

        // Filter vocabulary by level
        let vocabPool = selectedLevel === 'all' ?
            this.vocabulary :
            this.vocabulary.filter(word => word.level == selectedLevel);

        if (vocabPool.length === 0) {
            this.showError(`No vocabulary available for HSK level ${selectedLevel}`);
            return;
        }

        // Shuffle and select questions
        vocabPool = vocabPool.sort(() => Math.random() - 0.5);
        this.quiz.questions = vocabPool.slice(0, Math.min(numQuestions, vocabPool.length));
        this.quiz.currentQuestion = 0;
        this.quiz.score = 0;
        this.quiz.isActive = true;

        // Show quiz container
        document.getElementById('quiz-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';

        this.showQuizQuestion();
        console.log(`[🎯] Quiz started: ${this.quiz.questions.length} questions, level ${selectedLevel}`);
    }

    showQuizQuestionDeprecated() {
        if (!this.quiz.questions || this.quiz.currentQuestion >= this.quiz.questions.length) {
            this.endQuizLegacy();
            return;
        }

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
                <div class="quiz-question-text">¿Qué significa este carácter?</div>
                <div class="quiz-character">${question.character}</div>
                <div class="quiz-pinyin">${question.pinyin}</div>
            `;
        }

        // Generate options
        const correctAnswer = this.getMeaningForLanguage(question);
        const options = this.generateQuizOptions(question, correctAnswer);

        // Store correct answer
        this.quiz.correctAnswer = correctAnswer;

        // Render options
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'quiz-option';
                button.textContent = option;
                button.onclick = () => this.selectQuizAnswerLegacy(option);
                optionsContainer.appendChild(button);
            });
        }
    }

    generateQuizOptionsLegacy(correctWord, correctAnswer) {
        const options = [correctAnswer];
        const usedAnswers = new Set([correctAnswer]);

        // Generate 3 wrong answers
        while (options.length < 4 && this.vocabulary.length > options.length) {
            const randomWord = this.vocabulary[Math.floor(Math.random() * this.vocabulary.length)];
            const wrongAnswer = this.getMeaningForLanguage(randomWord);

            if (!usedAnswers.has(wrongAnswer)) {
                options.push(wrongAnswer);
                usedAnswers.add(wrongAnswer);
            }
        }

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    selectQuizAnswerLegacy(selectedAnswer) {
        const isCorrect = selectedAnswer === this.quiz.correctAnswer;

        if (isCorrect) {
            this.quiz.score++;
        }

        // Show feedback
        this.showQuizFeedbackLegacy(isCorrect);

        // Move to next question after delay
        setTimeout(() => {
            this.quiz.currentQuestion++;
            this.showQuizQuestionDeprecated();
        }, 1500);
    }

    showQuizFeedbackLegacy(isCorrect) {
        const optionsContainer = document.getElementById('quiz-options');
        if (!optionsContainer) return;

        // Disable all buttons and show correct answer
        const buttons = optionsContainer.querySelectorAll('.quiz-option');
        buttons.forEach(button => {
            button.disabled = true;
            if (button.textContent === this.quiz.correctAnswer) {
                button.style.backgroundColor = '#10b981';
                button.style.color = 'white';
            } else if (button.textContent !== this.quiz.correctAnswer) {
                button.style.backgroundColor = '#ef4444';
                button.style.color = 'white';
            }
        });
    }

    endQuizLegacy() {
        this.quiz.isActive = false;

        // Show results
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';

        const finalScore = document.getElementById('final-score');
        const scorePercentage = document.getElementById('score-percentage');

        if (finalScore) {
            finalScore.textContent = `${this.quiz.score} / ${this.quiz.questions.length}`;
        }

        if (scorePercentage) {
            const percentage = Math.round((this.quiz.score / this.quiz.questions.length) * 100);
            scorePercentage.textContent = `${percentage}%`;
        }

        console.log(`[🎯] Quiz completed: ${this.quiz.score}/${this.quiz.questions.length}`);
    }

    resetQuizLegacy() {
        this.quiz = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            isActive: false,
            correctAnswer: null
        };

        document.getElementById('quiz-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';

        console.log('[🔄] Quiz reset');
    }

    // Matrix Game functionality
    initializeMatrixGame() {
        console.log('🎮 Initializing Matrix Game...');
        console.log('🔍 Checking window.matrixGame:', !!window.matrixGame);
        console.log('🔍 Checking renderMatrixGameInterface:', typeof renderMatrixGameInterface);

        // Force create matrix game if it doesn't exist
        if (!window.matrixGame) {
            console.log('⚠️ Matrix game not found, attempting to create it...');

            // Try to create it manually
            try {
                // Check if MatrixGame class is available
                if (typeof MatrixGame !== 'undefined') {
                    window.matrixGame = new MatrixGame();
                    console.log('✅ Matrix game created manually');
                } else {
                    console.error('❌ MatrixGame class not found');
                    this.showMatrixGameFallback();
                    return;
                }
            } catch (error) {
                console.error('❌ Error creating matrix game:', error);
                this.showMatrixGameFallback();
                return;
            }
        }

        // Check if matrix game is available
        if (window.matrixGame) {
            console.log('[✓] Matrix game object found');

            // Pass vocabulary to the game
            if (this.vocabulary && this.vocabulary.length > 0) {
                window.matrixGame.vocabulary = this.vocabulary;
                window.matrixGame.allVocabulary = [...this.vocabulary];
                console.log(`[✓] Vocabulary passed to matrix game: ${this.vocabulary.length} words`);
            } else {
                console.warn('[⚠] No vocabulary available for matrix game');
            }

            // Try to show the game
            try {
                window.matrixGame.showGame();
                console.log('[✓] Matrix game showGame() called successfully');
            } catch (error) {
                console.error('[✗] Error calling showGame():', error);
                console.error('Error details:', error.stack);
                this.showMatrixGameFallback();
            }
        } else {
            console.error('[❌] Matrix game still not available after creation attempt');
            this.showMatrixGameFallback();
        }
    }

    // Debug function for Matrix Game
    debugMatrixGame() {
        console.log('🔍 === MATRIX GAME DEBUG ===');
        console.log('window.matrixGame exists:', !!window.matrixGame);
        console.log('MatrixGame class exists:', typeof MatrixGame !== 'undefined');
        console.log('renderMatrixGameInterface exists:', typeof renderMatrixGameInterface !== 'undefined');

        const matrixTab = document.getElementById('matrix');
        const matrixContainer = document.getElementById('matrix-game-container');

        console.log('Matrix tab exists:', !!matrixTab);
        console.log('Matrix container exists:', !!matrixContainer);

        if (matrixContainer) {
            console.log('Matrix container display:', matrixContainer.style.display);
            console.log('Matrix container innerHTML length:', matrixContainer.innerHTML.length);
            console.log('Matrix container content preview:', matrixContainer.innerHTML.substring(0, 200));
        }

        // Try to manually render the interface
        if (typeof renderMatrixGameInterface !== 'undefined') {
            console.log('Attempting manual render...');
            try {
                const html = renderMatrixGameInterface();
                console.log('Generated HTML length:', html.length);
                if (matrixContainer) {
                    matrixContainer.innerHTML = html;
                    console.log('✅ Manual render successful');
                }
            } catch (error) {
                console.error('❌ Manual render failed:', error);
            }
        }

        console.log('🔍 === END DEBUG ===');
    }

    showMatrixGameFallback() {
        const matrixSection = document.getElementById('matrix');
        if (matrixSection) {
            matrixSection.innerHTML = `
                <div class="matrix-fallback">
                    <div class="fallback-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="6" y1="12" x2="10" y2="12"></line>
                            <line x1="8" y1="10" x2="8" y2="14"></line>
                            <line x1="15" y1="13" x2="15.01" y2="13"></line>
                            <line x1="18" y1="11" x2="18.01" y2="11"></line>
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                        </svg>
                    </div>
                    <h3>Juego Matrix</h3>
                    <p>El juego Matrix no se pudo cargar correctamente.</p>
                    <p>Esto puede deberse a que los scripts aún se están cargando.</p>
                    <div class="fallback-actions">
                        <button onclick="window.app.debugMatrixGame()" class="debug-btn">
                            Debug
                        </button>
                        <button onclick="window.app.initializeMatrixGame()" class="retry-btn">
                            Reintentar
                        </button>
                        <button onclick="window.location.reload()" class="reload-btn">
                            Recargar Página
                        </button>
                    </div>
                    <div class="debug-info">
                        <p><strong>Debug Info:</strong></p>
                        <p>Matrix Game Object: ${window.matrixGame ? 'Disponible' : 'No encontrado'}</p>
                        <p>Vocabulario: ${this.vocabulary ? this.vocabulary.length + ' palabras' : 'No cargado'}</p>
                    </div>
                </div>
                <style>
                    .matrix-fallback {
                        text-align: center;
                        padding: 40px 20px;
                        color: var(--text-color);
                    }
                    .fallback-icon {
                        font-size: 4rem;
                        margin-bottom: 20px;
                    }
                    .matrix-fallback h3 {
                        margin-bottom: 15px;
                        color: var(--accent-color);
                    }
                    .matrix-fallback p {
                        margin-bottom: 10px;
                        opacity: 0.8;
                    }
                    .fallback-actions {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        margin: 20px 0;
                    }
                    .debug-btn, .retry-btn, .reload-btn {
                        background: var(--accent-color);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: background-color 0.3s ease;
                    }
                    .debug-btn {
                        background: #6366f1;
                    }
                    .debug-btn:hover {
                        background: #4f46e5;
                    }
                    .retry-btn {
                        background: #10b981;
                    }
                    .retry-btn:hover {
                        background: #059669;
                    }
                    .reload-btn:hover {
                        background: var(--accent-color-dark, #c41e3a);
                    }
                    .debug-info {
                        margin-top: 30px;
                        padding: 15px;
                        background: rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-size: 0.9rem;
                    }
                    .debug-info p {
                        margin: 5px 0;
                    }
                </style>
            `;
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