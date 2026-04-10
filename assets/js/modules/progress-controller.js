class ProgressController {
    constructor(app) {
        this.app = app;
    }

    updateDailyProgress() {
        const today = new Date().toDateString();

        if (this.app.dailyProgress.lastStudyDate !== today) {
            this.app.stats.todayCards = 0;
            this.app.dailyProgress.lastStudyDate = today;
        }

        this.app.stats.todayCards += 1;
        this.app.dailyProgress.activeDays.add(today);

        this.app.logDebug('Daily progress updated: ' + this.app.stats.todayCards + ' cards today');
    }

    setupGlobalProgressTracking() {
        if (this.app.globalProgressTrackingReady) {
            return;
        }

        window.addEventListener('hsk:matrix-round', (event) => {
            const isCorrect = !!(event && event.detail && event.detail.correct);

            this.app.stats.totalStudied = (Number(this.app.stats.totalStudied) || 0) + 1;
            this.app.stats.matrixRounds = (Number(this.app.stats.matrixRounds) || 0) + 1;

            if (isCorrect) {
                this.app.stats.correctAnswers = (Number(this.app.stats.correctAnswers) || 0) + 1;
            }

            this.updateDailyProgress();
            this.app.saveStats();
            this.app.updateProgress();
            this.app.updateHeaderStats();
        });

        this.app.globalProgressTrackingReady = true;
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
            this.app.logWarn('Error loading daily progress:', error);
        }

        return {
            lastStudyDate: null,
            activeDays: new Set()
        };
    }

    saveDailyProgress() {
        try {
            const data = {
                lastStudyDate: this.app.dailyProgress.lastStudyDate,
                activeDays: Array.from(this.app.dailyProgress.activeDays)
            };
            localStorage.setItem('hsk-daily-progress', JSON.stringify(data));
        } catch (error) {
            this.app.logWarn('Error saving daily progress:', error);
        }
    }

    updateStreakDisplay() {
        const streakDays = document.querySelectorAll('.streak-day');
        if (!streakDays.length) {
            return;
        }

        const today = new Date();
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        streakDays.forEach((dayElement, index) => {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() - (6 - index));
            const dateString = dayDate.toDateString();

            const dayOfWeek = dayDate.getDay();
            dayElement.textContent = dayNames[dayOfWeek];
            dayElement.classList.remove('active', 'today');

            if (this.app.dailyProgress.activeDays.has(dateString)) {
                dayElement.classList.add('active');
            }

            if (dateString === today.toDateString()) {
                dayElement.classList.add('today');
            }
        });

        this.app.logDebug('Streak display updated');
    }
}

window.ProgressController = ProgressController;
