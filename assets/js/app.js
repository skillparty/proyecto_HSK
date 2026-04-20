// HSK Learning App - Complete Implementation
class HSKApp {
    constructor() {
        this.currentWord = null;
        this.currentSession = [];
        this.sessionIndex = 0;
        this.isFlipped = false;
        this.selectedLevel = '1';
        this.currentLevel = '1';
        this.practiceMode = 'char-to-english';
        this.practiceOrderMode = 'lesson';
        this.isDarkMode = true; // Default to dark theme (PlanetScale style)
        this.isAudioEnabled = true;
        this.selectedVoice = 'auto'; // 'male', 'female', 'auto'
        this.availableVoices = [];
        this.chineseVoices = { male: null, female: null };
        this.currentLanguage = localStorage.getItem('hsk-language') || 'es';

        // Vocabulary State (Lazy Loading)
        this.vocabulary = [];
        this.vocabularyLoaded = false;
        this.vocabularyLoading = false;
        this.vocabularyPromise = null;

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

        // Core Modules Initialization
        this.uiController = new UIController(this);
        this.flashcardManager = new FlashcardManager(this);
        this.quizEngine = new QuizEngine(this);
        this.quizLegacyController = new QuizLegacyController(this);
        this.homeController = new HomeController(this);
        this.matrixController = new MatrixController(this);
        this.statsController = new StatsController(this);
        this.themeController = new ThemeController(this);
        this.audioController = new AudioController(this);
        this.browseController = new BrowseController(this);
        this.strokesRadicalsController = new StrokesRadicalsController(this);
        this.modalController = new ModalController(this);
        this.healthController = new HealthController(this);
        this.storageController = new StorageController(this);
        this.languageController = new LanguageController(this);
        this.progressController = new ProgressController(this);
        this.navigationController = new NavigationController(this);
        this.searchController = new SearchController(this);
        this.practiceViewController = new PracticeViewController(this);
        this.feedbackController = new FeedbackController(this);
        this.interactionController = new InteractionController(this);
        this.pastExamsController = new PastExamsController(this);
        this.quantifierSnakeController = new QuantifierSnakeController(this);
        this.vocabularyController = new VocabularyController(this);
        this.legacyFlowController = new LegacyFlowController(this);
        this.startupController = new StartupController(this);

        // Load onboarding state
        this.onboardingState = this.loadOnboardingState();

        // Daily progress tracking
        this.dailyProgress = this.loadDailyProgress();

        // Load saved data
        this.loadSettings();
        this.loadStats();
        this.loadVoicePreference();

        // Initialize the app
        this.init();

        this.logDebug('[✓] HSKApp constructor completed');
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    logInfo(...args) {
        this.getLogger().info(...args);
    }

    logWarn(...args) {
        this.getLogger().warn(...args);
    }

    logError(...args) {
        this.getLogger().error(...args);
    }

    async init() {
        return this.startupController.init();
    }

    setupKeyboardAccessibility() { return this.legacyFlowController.setupKeyboardAccessibility(); }
    isHealthCheckEnabled() { return this.healthController.isHealthCheckEnabled(); }
    async initHealthCheckPanelIfRequested() { return this.healthController.initHealthCheckPanelIfRequested(); }
    async getServiceWorkerVersion() { return this.healthController.getServiceWorkerVersion(); }
    getBuildMetadata() { return this.healthController.getBuildMetadata(); }
    getHealthChecklist({ swVersion, digest, authUser, hasFirebaseConfig }) { return this.healthController.getHealthChecklist({ swVersion, digest, authUser, hasFirebaseConfig }); }
    setupErrorDigestMonitoring() { return this.healthController.setupErrorDigestMonitoring(); }
    getErrorDigest() { return this.healthController.getErrorDigest(); }
    saveErrorDigest(entries) { return this.healthController.saveErrorDigest(entries); }
    clearErrorDigest() { return this.healthController.clearErrorDigest(); }
    async buildHealthSummary() { return this.healthController.buildHealthSummary(); }
    async copyHealthSummaryToClipboard() { return this.healthController.copyHealthSummaryToClipboard(); }
    downloadHealthSummaryFile() { return this.healthController.downloadHealthSummaryFile(); }
    logRuntimeIssue(source, message) { return this.healthController.logRuntimeIssue(source, message); }
    async loadVocabulary(forceLanguage = null) { return this.vocabularyController.loadVocabulary(forceLanguage); }
    createFallbackVocabulary() { return this.vocabularyController.createFallbackVocabulary(); }
    loadUserPreferences() { return this.vocabularyController.loadUserPreferences(); }
    initializeKeyboardShortcuts() { return this.interactionController.initializeKeyboardShortcuts(); }

    handleDifficulty(difficulty) { this.flashcardManager.handleDifficulty(difficulty); }

    toggleZenMode() { return this.interactionController.toggleZenMode(); }
    showKeyboardShortcuts() { return this.interactionController.showKeyboardShortcuts(); }
    setupEventListeners() { return this.interactionController.setupEventListeners(); }
    updateDailyProgress() { return this.progressController.updateDailyProgress(); }
    setupGlobalProgressTracking() { return this.progressController.setupGlobalProgressTracking(); }
    loadDailyProgress() { return this.progressController.loadDailyProgress(); }
    saveDailyProgress() { return this.progressController.saveDailyProgress(); }
    updateStreakDisplay() { return this.progressController.updateStreakDisplay(); }
    switchTab(tabName) { return this.navigationController.switchTab(tabName); }
    loadLastVisitedTab() { return this.navigationController.loadLastVisitedTab(); }
    restoreLastVisitedTab() { return this.navigationController.restoreLastVisitedTab(); }
    loadOnboardingState() { return this.navigationController.loadOnboardingState(); }
    saveOnboardingState() { return this.navigationController.saveOnboardingState(); }
    isLearningModuleTab(tabName) { return this.navigationController.isLearningModuleTab(tabName); }
    getTabDisplayName(tabName) { return this.navigationController.getTabDisplayName(tabName); }
    removeOnboardingHintFromTab(tabName) { return this.navigationController.removeOnboardingHintFromTab(tabName); }

    renderOnboardingHintForTab(tabName) { this.uiController.renderOnboardingHint(tabName); }

    setupPracticeSession() { this.flashcardManager.setupSession(); }
    updateCard() { return this.practiceViewController.updateCard(); }
    getStrokeCount(character) { return this.practiceViewController.getStrokeCount(character); }
    getWordType(word) { return this.practiceViewController.getWordType(word); }
    normalizePinyin(text) { return this.practiceViewController.normalizePinyin(text); }
    checkPinyinAnswer() { return this.practiceViewController.checkPinyinAnswer(); }
    getToneMarks(pinyin) { return this.practiceViewController.getToneMarks(pinyin); }
    getExampleSentence(word) { return this.practiceViewController.getExampleSentence(word); }
    resetCardState() { return this.practiceViewController.resetCardState(); }
    flipCard() { this.flashcardManager.flipCard(); }

    nextCard() { this.flashcardManager.nextCard(); }
    previousCard() { this.flashcardManager.previousCard(); }

    enableKnowledgeButtons() { return this.feedbackController.enableKnowledgeButtons(); }
    disableKnowledgeButtons() { return this.feedbackController.disableKnowledgeButtons(); }
    async markAsKnown(isKnown) { return this.feedbackController.markAsKnown(isKnown); }
    showKnowledgeFeedback(isKnown) { return this.feedbackController.showKnowledgeFeedback(isKnown); }
    updateProgress() { return this.feedbackController.updateProgress(); }
    updateHeaderStats() { return this.feedbackController.updateHeaderStats(); }
    performHeaderSearch(searchTerm) { return this.searchController.performHeaderSearch(searchTerm); }
    showHeaderSearchResults(searchTerm) { return this.searchController.showHeaderSearchResults(searchTerm); }
    displayHeaderSearchDropdown(results, searchTerm) { return this.searchController.displayHeaderSearchDropdown(results, searchTerm); }
    hideHeaderSearchDropdown() { return this.searchController.hideHeaderSearchDropdown(); }
    selectHeaderSearchResult(word) { return this.searchController.selectHeaderSearchResult(word); }
    toggleAudio() { return this.audioController.toggleAudio(); }
    updateAudioButton() { return this.audioController.updateAudioButton(); }

    showHeaderNotification(message) {
        return this.legacyFlowController.showHeaderNotification(message);
    }

    showToast(message, type, duration, action) { this.uiController.showToast(message, type, duration, action); }
    showUpdateToast(callback) { this.uiController.showUpdateToast(callback); }
    showError(message) { this.uiController.showError(message); }

    handleUpdate(registration) { return this.legacyFlowController.handleUpdate(registration); }
    showSpanishLevelMessage() { return this.modalController.showSpanishLevelMessage(); }
    playAudio(text) { return this.audioController.playAudio(text); }
    initializeVoices() { return this.audioController.initializeVoices(); }
    getPreferredVoice() { return this.audioController.getPreferredVoice(); }
    setVoicePreference(voiceType) { return this.audioController.setVoicePreference(voiceType); }
    loadVoicePreference() { return this.audioController.loadVoicePreference(); }
    updateVoiceSelector() { return this.audioController.updateVoiceSelector(); }
    showAudioFeedback(isPlaying) { return this.audioController.showAudioFeedback(isPlaying); }
    updateLanguageDisplay() { return this.languageController.updateLanguageDisplay(); }
    updateHeaderControlMicrocopy() { return this.languageController.updateHeaderControlMicrocopy(); }
    relocalizeQuizQuestionsToCurrentVocabulary() { return this.languageController.relocalizeQuizQuestionsToCurrentVocabulary(); }
    getTranslation(key, replacements = {}) { return this.languageController.getTranslation(key, replacements); }
    initializeMatrixGameLegacy() { return this.legacyFlowController.initializeMatrixGameLegacy(); }
    initializeLeaderboard() { return this.legacyFlowController.initializeLeaderboard(); }
    getMeaningForLanguage(word) { return this.browseController.getMeaningForLanguage(word); }
    updateVocabularyCards() { return this.browseController.updateVocabularyCards(); }
    initializeBrowse() { return this.browseController.initializeBrowse(); }
    initializeStrokesRadicals() { return this.strokesRadicalsController.initialize(); }
    refreshStrokesRadicals() { return this.strokesRadicalsController.refresh(); }
    setupInfiniteScroll() { return this.browseController.setupInfiniteScroll(); }
    loadMoreVocabulary() { return this.browseController.loadMoreVocabulary(); }
    filterVocabulary() { return this.browseController.filterVocabulary(); }
    renderVocabularyBatch(words) { return this.browseController.renderVocabularyBatch(words); }
    createVocabularyCard(word) { return this.browseController.createVocabularyCard(word); }
    showLoadingIndicator() { return this.browseController.showLoadingIndicator(); }
    hideLoadingIndicator() { return this.browseController.hideLoadingIndicator(); }
    showNoMoreItemsIndicator() { return this.browseController.showNoMoreItemsIndicator(); }
    hideNoMoreItemsIndicator() { return this.browseController.hideNoMoreItemsIndicator(); }
    showNoResultsMessage() { return this.browseController.showNoResultsMessage(); }

                    showQuizQuestion() { this.quizEngine.showQuestion(); }
    submitQuizAnswer() { this.quizEngine.submitAnswer(); }
    nextQuizQuestion() { this.quizEngine.nextQuestion(); }
    showQuizResults() { this.quizEngine.showResults(); }
    restartQuiz() { this.quizEngine.restart(); }
    saveQuizSessionState() { this.quizEngine.saveSession(); }
    loadQuizSessionState() { return this.quizEngine.loadSession(); }
    clearQuizSessionState() { this.quizEngine.clearSession(); }
    renderQuizResumeAction() { return this.legacyFlowController.renderQuizResumeAction(); }
    resumeQuizSession() { return this.legacyFlowController.resumeQuizSession(); }
    hasResumableQuizSession(session) { return this.quizEngine.hasResumableSession(session); }

    async updateStats() { return this.statsController.updateStats(); }
    toggleStatsEmptyState(showEmpty) { return this.statsController.toggleStatsEmptyState(showEmpty); }
    async updateLevelProgress() { return this.statsController.updateLevelProgress(); }
    resetStats() { return this.statsController.resetStats(); }
    initializeTheme() { return this.themeController.initializeTheme(); }
    toggleTheme() { return this.themeController.toggleTheme(); }
    applyTheme() { return this.themeController.applyTheme(); }
    updateThemeButton() { return this.themeController.updateThemeButton(); }
    changeLanguage(lang) { return this.languageController.changeLanguage(lang); }
    loadStats() { return this.storageController.loadStats(); }
    saveStats() { return this.storageController.saveStats(); }
    loadSettings() { return this.storageController.loadSettings(); }
    initializePastExams() { return this.pastExamsController.initialize(); }
    refreshPastExamsLanguage() { return this.pastExamsController.refreshLanguage(); }
    initializeQuantifierSnake() { return this.quantifierSnakeController.initialize(); }
    refreshQuantifierSnakeLanguage() { return this.quantifierSnakeController.refreshLanguage(); }
    resumeQuantifierSnakeIfNeeded() { return this.quantifierSnakeController.onTabActivated(); }
    initializeQuiz() { return this.legacyFlowController.initializeQuiz(); }
    setupQuizEventListeners() { return this.legacyFlowController.setupQuizEventListeners(); }

    startQuizDeprecated() {
        return this.legacyFlowController.startQuizDeprecated();
    }

    showQuizQuestionDeprecated() {
        return this.legacyFlowController.showQuizQuestionDeprecated();
    }

    generateQuizOptionsLegacy(correctWord, correctAnswer) {
        return this.legacyFlowController.generateQuizOptionsLegacy(correctWord, correctAnswer);
    }

    selectQuizAnswerLegacy(selectedAnswer) {
        return this.legacyFlowController.selectQuizAnswerLegacy(selectedAnswer);
    }

    showQuizFeedbackLegacy(isCorrect) {
        return this.legacyFlowController.showQuizFeedbackLegacy(isCorrect);
    }

    endQuizLegacy() {
        return this.legacyFlowController.endQuizLegacy();
    }

    resetQuizLegacy() {
        return this.legacyFlowController.resetQuizLegacy();
    }

    // Matrix Game functionality
    initializeMatrixGame() {
        return this.legacyFlowController.initializeMatrixGame();
    }

    // Debug function for Matrix Game
    debugMatrixGame() {
        return this.legacyFlowController.debugMatrixGame();
    }

    showMatrixGameFallback() {
        return this.legacyFlowController.showMatrixGameFallback();
    }
}
window.HSKApp = HSKApp;
window.dispatchEvent(new CustomEvent('hsk:app-class-ready'));
(window.hskLogger || console).debug('📦 HSKApp class loaded - Ready for manual instantiation');
