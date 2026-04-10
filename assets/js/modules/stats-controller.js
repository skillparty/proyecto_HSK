class StatsController {
    constructor(app) {
        this.app = app;
    }

    async updateStats() {
        this.app.logDebug('[stats] Updating stats');

        if (window.firebaseClient && window.firebaseClient.isAuthenticated()) {
            try {
                const firebaseStats = await window.firebaseClient.getUserStatistics();
                if (firebaseStats) {
                    this.app.stats = {
                        ...this.app.stats,
                        totalStudied: Number(firebaseStats.totalStudied) || this.app.stats.totalStudied,
                        correctAnswers: Number(firebaseStats.correctAnswers) || this.app.stats.correctAnswers,
                        incorrectAnswers: Number(firebaseStats.incorrectAnswers) || this.app.stats.incorrectAnswers,
                        currentStreak: Number(firebaseStats.currentStreak) || this.app.stats.currentStreak,
                        bestStreak: Number(firebaseStats.bestStreak) || this.app.stats.bestStreak,
                        totalTimeSpent: Number(firebaseStats.totalTimeSpent) || this.app.stats.totalTimeSpent
                    };

                    if (this.app.userProgress) {
                        const summary = this.app.userProgress.getProgressSummary();
                        this.app.stats.quizzesCompleted = summary.quizzesCompleted || this.app.stats.quizzesCompleted;
                        this.app.stats.matrixRounds = summary.matrixRounds || this.app.stats.matrixRounds;
                    }

                    this.app.logDebug('[stats] Cloud sync completed', this.app.stats);
                }
            } catch (error) {
                this.app.logError('[stats] Cloud sync failed', error);
            }
        }

        const stats = this.app.stats;

        const totalStudiedEl = document.getElementById('total-studied');
        if (totalStudiedEl) totalStudiedEl.textContent = stats.totalStudied;

        const quizCountEl = document.getElementById('quiz-count');
        if (quizCountEl) quizCountEl.textContent = stats.quizzesCompleted || 0;

        const streakCountEl = document.getElementById('current-streak');
        if (streakCountEl) streakCountEl.textContent = stats.currentStreak;

        const accuracy = stats.totalStudied > 0
            ? Math.round((stats.correctAnswers / stats.totalStudied) * 100)
            : 0;

        const accuracyRateEl = document.getElementById('accuracy-rate');
        if (accuracyRateEl) accuracyRateEl.textContent = accuracy + '%';

        const hasStatsProgress = (stats.totalStudied || 0) > 0 ||
            (stats.quizzesCompleted || 0) > 0 ||
            (stats.currentStreak || 0) > 0;

        this.toggleStatsEmptyState(!hasStatsProgress);

        if (hasStatsProgress) {
            try {
                await this.updateLevelProgress();
            } catch (error) {
                this.app.logError('[stats] Level progress update failed', error);
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

        if (!this.app.vocabularyLoaded && this.app.vocabularyPromise) {
            this.app.logDebug('[stats] Waiting vocabulary before level progress');
            await this.app.vocabularyPromise;
        }

        container.innerHTML = '';

        let levelProgressData = [];

        if (this.app.userProgress) {
            levelProgressData = Object.entries(this.app.userProgress.profile.hskProgress || {}).map(([level, data]) => ({
                hsk_level: parseInt(level, 10),
                total_words_studied: data.studied,
                correct_answers: data.correct,
                incorrect_answers: data.incorrect
            }));
        } else if (window.firebaseClient && window.firebaseClient.isAuthenticated()) {
            try {
                const userStats = await window.firebaseClient.getUserStatistics();
                if (userStats && userStats.levelProgress) {
                    levelProgressData = userStats.levelProgress;
                }
            } catch (error) {
                this.app.logError('[stats] Loading level progress failed', error);
            }
        }

        for (let level = 1; level <= 6; level++) {
            const levelWords = this.app.vocabulary.filter(word => word.level === level);
            const totalWords = levelWords.length;

            const levelData = levelProgressData.find(lp => lp.hsk_level === level);
            const studiedWords = levelData ? levelData.total_words_studied : 0;
            const accuracy = levelData && (levelData.correct_answers + levelData.incorrect_answers) > 0
                ? Math.round((levelData.correct_answers / (levelData.correct_answers + levelData.incorrect_answers)) * 100)
                : 0;

            const progress = totalWords > 0 ? Math.min((studiedWords / totalWords) * 100, 100) : 0;

            const progressBar = document.createElement('div');
            progressBar.className = 'level-progress-item';
            const accuracyText = accuracy > 0 ? ' (' + accuracy + '% accuracy)' : '';
            progressBar.innerHTML =
                '<div class="level-label">HSK ' + level + '</div>' +
                '<div class="progress-bar">' +
                    '<div class="progress-fill" style="width: ' + progress + '%"></div>' +
                '</div>' +
                '<div class="progress-text">' +
                    studiedWords + '/' + totalWords + accuracyText +
                '</div>';
            container.appendChild(progressBar);
        }
    }

    resetStats() {
        const resetConfirm = this.app.getTranslation('resetConfirm') || 'Are you sure you want to reset all statistics?';
        if (!window.confirm(resetConfirm)) {
            return;
        }

        try {
            this.app.stats = {
                totalStudied: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0
            };
            this.app.saveStats();
            this.updateStats();
            this.app.updateHeaderStats();
            this.app.showToast(this.app.getTranslation('statsResetDone') || 'Statistics reset', 'success', 1800);
        } catch (error) {
            this.app.logError('[stats] Reset failed', error);
            this.app.showToast(this.app.getTranslation('statsResetFailed') || 'Could not reset statistics', 'error', 2400);
        }
    }
}

window.StatsController = StatsController;
