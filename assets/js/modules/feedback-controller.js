class FeedbackController {
    constructor(app) {
        this.app = app;
    }

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

        this.app.logDebug('[✓] Knowledge buttons enabled');
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

        this.app.logDebug('🔒 Knowledge buttons disabled');
    }

    async markAsKnown(isKnown) {
        if (!this.app.currentWord || !this.app.isFlipped) return;

        this.app.stats.totalStudied = (Number(this.app.stats.totalStudied) || 0) + 1;

        // Update local stats for backward compatibility
        if (isKnown) {
            this.app.stats.correctAnswers++;
            this.app.stats.currentStreak++;
            if (this.app.stats.currentStreak > this.app.stats.bestStreak) {
                this.app.stats.bestStreak = this.app.stats.currentStreak;
            }
            this.app.logDebug('[OK] Marked "' + this.app.currentWord.character + '" as KNOWN');
        } else {
            this.app.stats.currentStreak = 0;
            this.app.logDebug('[NO] Marked "' + this.app.currentWord.character + '" as NOT KNOWN');
        }

        // Update daily progress - count any interaction (known or not known)
        this.app.updateDailyProgress();

        // Sync with Cloud Persistence if user is authenticated
        if (window.firebaseClient && window.firebaseClient.user) {
            try {
                const hskLevel = this.app.currentWord.level || this.app.currentLevel;
                await window.firebaseClient.updateProgress(hskLevel, isKnown, 0);
                this.app.logDebug('✅ Progress synced with Firebase');
                if (!this.app.syncToastState.syncedShown) {
                    this.app.syncToastState.syncedShown = true;
                    this.app.showToast(this.app.getTranslation('progressSynced') || 'Progress synced to cloud', 'success', 1800);
                }
            } catch (error) {
                this.app.logError('❌ Error syncing progress with Firebase:', error);
                const now = Date.now();
                if (now - this.app.syncToastState.lastErrorAt > 15000) {
                    this.app.syncToastState.lastErrorAt = now;
                    this.app.showToast(this.app.getTranslation('progressSyncFailedLocal') || 'Sync failed - progress saved locally', 'error', 3000);
                }
            }
        }

        // Record in user profile if available
        if (this.app.userProgress) {
            this.app.userProgress.recordWordStudy(this.app.currentWord, isKnown, this.app.practiceMode);
        }

        // Save progress
        this.app.saveStats();
        this.app.updateHeaderStats();
        this.app.updateProgress();
        this.app.updateStreakDisplay();

        // Show feedback
        this.app.showKnowledgeFeedback(isKnown);

        // Automatically advance to next card after a short delay
        setTimeout(() => {
            this.app.nextCard();
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
            const goal = this.app.stats.dailyGoal || 20;
            const done = this.app.stats.todayCards || 0;
            const progress = goal > 0 ? Math.min((done / goal) * 100, 100) : 0;
            progressFill.style.width = `${progress}%`;
            todayText.textContent = `${done} / ${goal}`;
            return;
        }

        // Legacy session-based progress UI
        if (progressFill && legacyText && this.app.currentSession && this.app.currentSession.length > 0) {
            const total = this.app.currentSession.length;
            const index = (typeof this.app.sessionIndex === 'number') ? this.app.sessionIndex : 0;
            const progress = ((index + 1) / total) * 100;
            progressFill.style.width = `${progress}%`;
            legacyText.textContent = `${index + 1}/${total}`;
        }
    }

    updateHeaderStats() {
        const studiedEl = document.getElementById('header-studied');
        const streakEl = document.getElementById('header-streak');
        const progressEl = document.getElementById('header-progress');

        // Use user profile stats if available, otherwise use local stats
        let stats = this.app.stats;
        if (this.app.userProgress && this.app.userProgress.isAuthenticated()) {
            const profileStats = this.app.userProgress.getStatistics();
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
            const progress = totalStudied > 0
                ? Math.min((correctAnswers / totalStudied) * 100, 100)
                : 0;
            progressEl.style.width = `${progress}%`;
        }
    }
}

window.FeedbackController = FeedbackController;
