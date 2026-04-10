class StartupController {
    constructor(app) {
        this.app = app;
    }

    async init() {
        try {
            this.app.logInfo('[▶] Initializing HSK Learning App...');

            if (!window.languageManager && window.LanguageManager) {
                window.languageManager = new window.LanguageManager();
                this.app.currentLanguage = window.languageManager.currentLanguage;

                window.addEventListener('languageChanged', async (event) => {
                    const nextLanguage = event && event.detail ? event.detail.language : null;
                    if (!nextLanguage || nextLanguage === this.app.currentLanguage) {
                        return;
                    }

                    const previousLanguage = this.app.currentLanguage;

                    try {
                        this.app.currentLanguage = nextLanguage;
                        this.app.logInfo('[LANG] Language changed to ' + nextLanguage + ', reloading vocabulary...');
                        await this.app.loadVocabulary(nextLanguage);

                        this.app.updateLanguageDisplay();

                        if (this.app.browseState) {
                            this.app.initializeBrowse();
                        }

                        if (this.app.userProgress) {
                            this.app.userProgress.updatePreference('language', nextLanguage);
                        }

                        const langLabel = nextLanguage === 'es'
                            ? (this.app.getTranslation('spanish') || 'Español')
                            : (this.app.getTranslation('english') || 'English');
                        this.app.showToast(
                            (this.app.getTranslation('languageUpdated') || 'Language updated') + ': ' + langLabel,
                            'success',
                            1800
                        );

                        this.app.logInfo('[OK] Language change completed: ' + nextLanguage);
                    } catch (error) {
                        this.app.currentLanguage = previousLanguage;
                        this.app.logError('Language change failed:', error);
                        this.app.showToast(this.app.getTranslation('languageUpdateFailed') || 'Language update failed', 'error', 2600);
                    }
                });

                this.app.logDebug('[✓] LanguageManager initialized');
            }

            this.app.setupErrorDigestMonitoring();

            if (window.BackendAuth) {
                this.app.backendAuth = new window.BackendAuth();
                this.app.logDebug('[✓] Backend Auth initialized');
            }

            if (window.BackendUserProgress && this.app.backendAuth) {
                this.app.userProgress = new window.BackendUserProgress(this.app.backendAuth);
                this.app.loadUserPreferences();
                this.app.logDebug('[✓] Backend User Progress initialized');
            }

            if (window.LeaderboardManager) {
                this.app.leaderboardManager = new window.LeaderboardManager();
                this.app.logDebug('[✓] Leaderboard Manager initialized');
            }

            this.app.loadVocabulary();
            this.app.setupEventListeners();
            this.app.setupKeyboardAccessibility();
            this.app.setupGlobalProgressTracking();
            this.app.initializeTheme();

            if (window.languageManager) {
                window.languageManager.updateInterface();
            }

            this.app.setupPracticeSession();
            this.app.updateHeaderStats();
            this.app.updateAudioButton();

            if ('speechSynthesis' in window) {
                this.app.initializeVoices();
                speechSynthesis.onvoiceschanged = () => {
                    this.app.initializeVoices();
                    this.app.updateVoiceSelector();
                    this.app.logDebug('Voices reloaded: ' + speechSynthesis.getVoices().length);
                };
            }

            this.app.updateVoiceSelector();
            this.app.updateHeaderControlMicrocopy();
            this.app.uiController.restoreLastVisitedTab();
            await this.app.initHealthCheckPanelIfRequested();

            this.app.logInfo('[✓] HSK Learning App initialized successfully!');
        } catch (error) {
            this.app.logError('[✗] Error initializing app:', error);
        }
    }
}

window.StartupController = StartupController;
