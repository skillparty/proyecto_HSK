class StorageController {
    constructor(app) {
        this.app = app;
    }

    loadStats() {
        try {
            const savedStats = localStorage.getItem('hsk-stats');
            if (savedStats) {
                this.app.stats = { ...this.app.stats, ...JSON.parse(savedStats) };
            }

            this.app.stats.totalCards = Number(this.app.stats.totalCards || 0) || 0;
            this.app.stats.totalStudied = Number(this.app.stats.totalStudied ?? this.app.stats.totalCards ?? 0) || 0;
            this.app.stats.correctAnswers = Number(this.app.stats.correctAnswers || 0) || 0;
            this.app.stats.currentStreak = Number(this.app.stats.currentStreak || 0) || 0;
            this.app.stats.bestStreak = Number(this.app.stats.bestStreak || 0) || 0;
            this.app.stats.dailyGoal = Number(this.app.stats.dailyGoal || 20) || 20;
            this.app.stats.todayCards = Number(this.app.stats.todayCards || 0) || 0;
            this.app.stats.quizzesCompleted = Number(this.app.stats.quizzesCompleted || 0) || 0;
            this.app.stats.quizAnswered = Number(this.app.stats.quizAnswered || 0) || 0;
            this.app.stats.matrixRounds = Number(this.app.stats.matrixRounds || 0) || 0;
        } catch (error) {
            this.app.logWarn('Error loading stats:', error);
        }
    }

    saveStats() {
        try {
            localStorage.setItem('hsk-stats', JSON.stringify(this.app.stats));
            this.app.saveDailyProgress();
            this.app.updateHeaderStats();
        } catch (error) {
            this.app.logWarn('Error saving stats:', error);
        }
    }

    loadSettings() {
        try {
            const audioEnabled = localStorage.getItem('hsk-audio-enabled');
            if (audioEnabled !== null) {
                this.app.isAudioEnabled = audioEnabled === 'true';
            }

            const savedLanguage = localStorage.getItem('hsk-language');
            if (savedLanguage) {
                this.app.currentLanguage = savedLanguage;
            }

            const savedVoice = localStorage.getItem('hsk-voice-preference');
            if (savedVoice) {
                this.app.selectedVoice = savedVoice;
            }

            const practiceOrderMode = localStorage.getItem('hsk-practice-order-mode');
            if (practiceOrderMode === 'lesson' || practiceOrderMode === 'mixed') {
                this.app.practiceOrderMode = practiceOrderMode;
            }
        } catch (error) {
            this.app.logWarn('Error loading settings:', error);
        }
    }
}

window.StorageController = StorageController;
