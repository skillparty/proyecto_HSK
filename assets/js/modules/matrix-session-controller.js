class MatrixSessionController {
    constructor(game) {
        this.game = game;
    }

    saveSessionState(force = false) {
        try {
            if (!force && !this.game.isPlaying) return;

            const state = {
                currentLevel: this.game.currentLevel,
                difficulty: this.game.difficulty,
                score: this.game.score,
                timeRemaining: this.game.timeRemaining,
                currentRound: this.game.currentRound,
                correctAnswers: this.game.correctAnswers,
                wrongAnswers: this.game.wrongAnswers,
                isPlaying: this.game.isPlaying,
                isPaused: this.game.isPaused,
                currentWord: this.game.currentWord,
                matrixCharacters: this.game.matrixCharacters,
                correctPosition: this.game.correctPosition,
                sessionStats: this.game.sessionStats,
                updatedAt: Date.now()
            };

            localStorage.setItem(this.game.sessionStorageKey, JSON.stringify(state));
        } catch (error) {
            this.game.logWarn('⚠️ Error saving matrix session:', error);
        }
    }

    loadSessionState() {
        try {
            const raw = localStorage.getItem(this.game.sessionStorageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            this.game.logWarn('⚠️ Error loading matrix session:', error);
            return null;
        }
    }

    clearSessionState() {
        try {
            localStorage.removeItem(this.game.sessionStorageKey);
        } catch (error) {
            this.game.logWarn('⚠️ Error clearing matrix session:', error);
        }
    }

    getResumableSession() {
        const state = this.loadSessionState();
        if (!state || !state.updatedAt) return null;

        const age = Date.now() - Number(state.updatedAt);
        if (age > this.game.sessionMaxAgeMs) {
            this.clearSessionState();
            return null;
        }

        const hasRound = !!(state.currentWord && Array.isArray(state.matrixCharacters) && state.matrixCharacters.length > 0);
        if (!state.isPlaying || !hasRound || Number(state.timeRemaining || 0) <= 0) {
            return null;
        }

        return state;
    }

    syncResumeAction() {
        const configScreen = document.getElementById('matrix-config');
        const startBtn = document.getElementById('matrix-start-btn');
        if (!configScreen || !startBtn) return;

        let resumeBtn = document.getElementById('matrix-resume-btn');
        const resumable = this.getResumableSession();

        if (!resumable) {
            if (resumeBtn) resumeBtn.remove();
            return;
        }

        if (!resumeBtn) {
            resumeBtn = document.createElement('button');
            resumeBtn.id = 'matrix-resume-btn';
            resumeBtn.className = 'matrix-start-btn';
            resumeBtn.style.marginTop = '10px';
            startBtn.parentNode.insertBefore(resumeBtn, startBtn.nextSibling);
            resumeBtn.addEventListener('click', () => this.resumeSession());
        }

        const label = window.languageManager?.t
            ? window.languageManager.t('resumeMatrix')
            : 'Resume Matrix';
        resumeBtn.textContent = label || 'Resume Matrix';
    }

    resumeSession() {
        const state = this.getResumableSession();
        if (!state) {
            this.syncResumeAction();
            return;
        }

        if (this.game.timer) {
            clearInterval(this.game.timer);
            this.game.timer = null;
        }

        this.game.currentLevel = Number(state.currentLevel || 1);
        this.game.difficulty = state.difficulty || 'normal';
        this.game.score = Number(state.score || 0);
        this.game.timeRemaining = Number(state.timeRemaining || this.game.config[this.game.difficulty].timeLimit);
        this.game.currentRound = Number(state.currentRound || 0);
        this.game.correctAnswers = Number(state.correctAnswers || 0);
        this.game.wrongAnswers = Number(state.wrongAnswers || 0);
        this.game.currentWord = state.currentWord || null;
        this.game.matrixCharacters = Array.isArray(state.matrixCharacters) ? state.matrixCharacters : [];
        this.game.correctPosition = Number(state.correctPosition || 0);
        this.game.sessionStats = state.sessionStats || this.game.sessionStats;

        const levelSelect = document.getElementById('matrix-level-select');
        if (levelSelect) {
            levelSelect.value = String(this.game.currentLevel);
        }

        document.querySelectorAll('.diff-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.game.difficulty);
        });

        document.getElementById('matrix-config').style.display = 'none';
        document.getElementById('matrix-results').style.display = 'none';
        document.getElementById('matrix-game').style.display = 'block';

        this.game.isPlaying = true;
        this.game.isPaused = false;
        this.game.startTime = Date.now();

        this.game.renderMatrix();

        document.getElementById('target-pinyin').textContent = this.game.currentWord?.pinyin || this.game.currentWord?.pinyinTones || '';
        const currentLang = window.languageManager?.currentLanguage || 'es';
        const meaning = currentLang === 'es'
            ? (this.game.currentWord?.spanish || this.game.currentWord?.translation)
            : (this.game.currentWord?.english || this.game.currentWord?.translation);
        document.getElementById('target-meaning').textContent = meaning || '';

        this.game.updateGameUI();
        this.game.startTimer();
        this.saveSessionState(true);
    }
}

window.MatrixSessionController = MatrixSessionController;
