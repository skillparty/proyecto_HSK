class MatrixScoreController {
    constructor(game) {
        this.game = game;
    }

    async checkAndSaveHighScore() {
        const accuracy = Math.round((this.game.correctAnswers / (this.game.correctAnswers + this.game.wrongAnswers)) * 100);
        const scoreEntry = {
            score: this.game.score,
            level: this.game.currentLevel,
            difficulty: this.game.difficulty,
            accuracy,
            date: new Date().toISOString()
        };

        const key = 'matrix-highscores-' + this.game.currentLevel + '-' + this.game.difficulty;
        let scores = JSON.parse(localStorage.getItem(key) || '[]');

        const isNewRecord = scores.length === 0 || scoreEntry.score > scores[0].score;

        scores.push(scoreEntry);
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);

        localStorage.setItem(key, JSON.stringify(scores));
        this.game.highScores = scores;

        if (!this.game.legacyBackendApiEnabled) {
            return isNewRecord;
        }

        try {
            const userId = window.app?.userProfile?.userId || 'anonymous';
            const userName = window.app?.userProfile?.userName || 'Anonymous Player';

            const response = await fetch('/api/matrix-game/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    userName,
                    score: this.game.score,
                    hskLevel: this.game.currentLevel,
                    difficulty: this.game.difficulty,
                    correctAnswers: this.game.correctAnswers,
                    wrongAnswers: this.game.wrongAnswers,
                    accuracy,
                    maxStreak: this.game.sessionStats.maxStreak,
                    avgResponseTime: this.game.sessionStats.averageTime,
                    totalTime: this.game.config[this.game.difficulty].timeLimit - this.game.timeRemaining
                })
            });

            const data = await response.json();
            if (data.success) {
                this.game.logInfo('✅ Score saved to server');
                this.loadServerLeaderboard();
            }
        } catch (error) {
            this.game.logError('❌ Error saving score to server:', error);
        }

        return isNewRecord;
    }

    loadHighScores() {
        const key = 'matrix-highscores-' + this.game.currentLevel + '-' + this.game.difficulty;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    async loadServerLeaderboard() {
        if (!this.game.legacyBackendApiEnabled) {
            return;
        }

        try {
            const response = await fetch('/api/matrix-game/leaderboard?level=' + this.game.currentLevel + '&difficulty=' + this.game.difficulty + '&limit=10');
            const data = await response.json();

            if (data.success && data.leaderboard) {
                this.game.logDebug('📊 Leaderboard loaded from server');
                if (document.getElementById('high-scores-list')) {
                    this.displayServerLeaderboard(data.leaderboard);
                }
            }
        } catch (error) {
            this.game.logError('❌ Error loading leaderboard from server:', error);
        }
    }

    displayServerLeaderboard(leaderboard) {
        const listContainer = document.getElementById('high-scores-list');
        if (!listContainer) return;

        if (leaderboard.length === 0) {
            listContainer.innerHTML = '<p class="no-scores">No hay puntuaciones aún</p>';
            return;
        }

        listContainer.innerHTML = leaderboard.map((score) => `
            <div class="score-item">
                <span class="score-rank">#${score.rank}</span>
                <span class="score-name">${score.userName}</span>
                <span class="score-value">${score.score.toLocaleString()}</span>
                <span class="score-accuracy">${score.accuracy}%</span>
                <span class="score-date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }

    updateHighScoresList() {
        const listContainer = document.getElementById('high-scores-list');
        if (!listContainer) return;

        if (this.game.highScores.length === 0) {
            listContainer.innerHTML = '<p class="no-scores">No hay puntuaciones aún</p>';
            return;
        }

        listContainer.innerHTML = this.game.highScores.map((score, index) => `
            <div class="score-item">
                <span class="score-rank">#${index + 1}</span>
                <span class="score-value">${score.score.toLocaleString()}</span>
                <span class="score-accuracy">${score.accuracy}%</span>
                <span class="score-date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }
}

window.MatrixScoreController = MatrixScoreController;
