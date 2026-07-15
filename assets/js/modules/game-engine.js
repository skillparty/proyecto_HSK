/**
 * HSK Game Engine Module
 * Provides shared infrastructure for HSK educational games.
 * Includes GameAudioManager, GameTimer, GameStateManager, GameProgressReporter, and GameUtils.
 */

/**
 * GameAudioManager - Singleton that manages a single shared AudioContext
 * to prevent resource leaks and handle browser audio restrictions.
 */
class GameAudioManager {
    constructor() {
        this.audioCtx = null;
        this.isInitialized = false;
    }

    /**
     * Lazy initializes the AudioContext when first user interaction occurs.
     * @returns {AudioContext|null} The active AudioContext or null if unsupported.
     */
    initContext() {
        if (this.isInitialized) return this.audioCtx;

        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtxClass) return null;
            this.audioCtx = new AudioCtxClass();
            this.isInitialized = true;
            return this.audioCtx;
        } catch (e) {
            console.warn('GameAudioManager: Web Audio API not supported or blocked.', e);
            return null;
        }
    }

    /**
     * Checks if audio is enabled in the global app settings.
     * @returns {boolean} True if audio is enabled.
     */
    isAudioEnabled() {
        return window.app?.isAudioEnabled !== false;
    }

    /**
     * Plays a synthesized tone using an oscillator.
     * Compatible with playSynth signature from HanziBuilder, WordLinker, and TonesInvaders.
     * @param {number} frequency - Tone frequency in Hz.
     * @param {string} type - Oscillator type ('sine', 'triangle', 'sawtooth', 'square').
     * @param {number} volume - Volume gain (0.0 to 1.0).
     * @param {number} duration - Sound duration in seconds.
     */
    playSynth(frequency, type = 'sine', volume = 0.1, duration = 0.15) {
        if (!this.isAudioEnabled()) return;

        const ctx = this.initContext();
        if (!ctx) return;

        try {
            // Resume context if suspended (browser auto-play policy)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            // Smoothly ramp down volume to avoid clicks
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            (window.hskLogger || console).debug('GameAudioManager: playSynth blocked or failed', e);
        }
    }

    /**
     * Plays a noise burst (useful for explosion sound effects).
     * @param {number} frequency - Central filter frequency in Hz.
     * @param {number} volume - Volume gain.
     * @param {number} duration - Noise duration in seconds.
     */
    playNoise(frequency, volume = 0.15, duration = 0.25) {
        if (!this.isAudioEnabled()) return;

        const ctx = this.initContext();
        if (!ctx) return;

        try {
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            // Populate random noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = buffer;

            // Apply bandpass filter
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = frequency;

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            noiseNode.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            noiseNode.start();
        } catch (e) {
            (window.hskLogger || console).debug('GameAudioManager: playNoise failed', e);
        }
    }

    /**
     * Plays a sequence of notes.
     * @param {Array<{note: number, type: string, volume: number, duration: number, delay: number}>} notes - Array of note configurations.
     */
    playMelody(notes) {
        if (!this.isAudioEnabled() || !notes || !Array.isArray(notes)) return;

        notes.forEach(config => {
            setTimeout(() => {
                this.playSynth(
                    config.note,
                    config.type || 'sine',
                    config.volume || 0.1,
                    config.duration || 0.15
                );
            }, config.delay || 0);
        });
    }
}

/**
 * GameTimer - Reusable countdown timer class that handles pause/resume internally.
 */
class GameTimer {
    constructor() {
        this.intervalId = null;
        this.timeLeft = 0;
        this.isPaused = false;
        this.onTick = null;
        this.onEnd = null;
    }

    /**
     * Starts the countdown timer.
     * @param {number} seconds - Number of seconds to count down.
     * @param {function} onTick - Callback triggered every second with timeLeft.
     * @param {function} onEnd - Callback triggered when timer reaches 0.
     */
    start(seconds, onTick, onEnd) {
        this.stop();
        this.timeLeft = seconds;
        this.isPaused = false;
        this.onTick = onTick;
        this.onEnd = onEnd;

        // Initial tick
        if (this.onTick) this.onTick(this.timeLeft);

        this.intervalId = setInterval(() => {
            if (this.isPaused) return;

            this.timeLeft--;
            if (this.onTick) this.onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            }
        }, 1000);
    }

    /**
     * Pauses the timer.
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resumes the timer.
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Stops the timer and clears interval.
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Returns the time remaining in seconds.
     * @returns {number} Time left.
     */
    getTimeLeft() {
        return this.timeLeft;
    }

    /**
     * Returns the formatted time string (M:SS).
     * @returns {string} Formatted time string.
     */
    getFormatted() {
        return GameUtils.formatTime(this.timeLeft);
    }
}

/**
 * GameStateManager - Base class for game state management.
 */
class GameStateManager {
    constructor() {
        this.state = this.getInitialState();
    }

    /**
     * Overridable method to define the initial state of the game.
     * @returns {Object} Initial state object.
     */
    getInitialState() {
        return {
            isPlaying: false,
            isPaused: false,
            score: 0
        };
    }

    /**
     * Resets the current state to the initial state.
     */
    resetState() {
        this.state = this.getInitialState();
        this.emitStateChange('reset');
    }

    /**
     * Saves the current game score or state to localStorage.
     * @param {string} key - LocalStorage key.
     */
    saveToLocalStorage(key) {
        try {
            localStorage.setItem(key, JSON.stringify(this.state));
        } catch (e) {
            console.error('GameStateManager: Failed to save state to localStorage', e);
        }
    }

    /**
     * Loads the state from localStorage.
     * @param {string} key - LocalStorage key.
     * @returns {Object|null} State object if found, otherwise null.
     */
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                this.state = JSON.parse(data);
                this.emitStateChange('loaded');
                return this.state;
            }
        } catch (e) {
            console.error('GameStateManager: Failed to load state from localStorage', e);
        }
        return null;
    }

    /**
     * Emits a custom event indicating the state changed.
     * @param {string} action - Action details.
     */
    emitStateChange(action) {
        document.dispatchEvent(new CustomEvent('hsk:game-state-change', {
            detail: { state: this.state, action }
        }));
    }
}

/**
 * GameProgressReporter - Handles progress submission and highscore saves.
 */
class GameProgressReporter {
    /**
     * Reports game results and handles progress updates.
     * @param {string} gameId - Unique identifier of the game (e.g. 'hanzi-builder', 'tones-invaders', 'word-linker').
     * @param {Object} result - Result metrics.
     * @param {number} result.score - Score achieved.
     * @param {number} [result.accuracy] - Accuracy (0 to 100).
     * @param {number} [result.wordsStudied] - Number of words studied.
     * @param {number} [result.correctAnswers] - Number of correct answers.
     * @param {number} [result.incorrectAnswers] - Number of incorrect answers.
     * @param {number} [result.timeSpent] - Time spent in seconds.
     * @param {number} [result.bestStreak] - Best streak.
     * @param {string|number} [level] - HSK Level studied (1-6 or 'all').
     * @param {string} [difficulty] - Game difficulty ('easy', 'normal', 'hard').
     */
    static reportGameResult(gameId, result, level = 'all', difficulty = 'normal') {
        (window.hskLogger || console).debug(`📊 GameProgressReporter: Reporting result for ${gameId}`, result);

        // 1. Save highscore locally
        const hsKey = `${gameId}-highscore-${level}-${difficulty}`;
        try {
            const currentHS = parseInt(localStorage.getItem(hsKey) || '0', 10);
            if (result.score > currentHS) {
                localStorage.setItem(hsKey, result.score.toString());
            }
        } catch (e) {
            console.error('GameProgressReporter: LocalStorage save failed', e);
        }

        // 2. Update overall app stats if available
        if (window.app && window.app.stats) {
            const stats = window.app.stats;
            
            // Map game IDs to specific stat high scores
            const scoreMap = {
                'hanzi-builder': 'hanziBuilderHighScore',
                'tones-invaders': 'tonesInvadersHighScore',
                'word-linker': 'wordLinkerHighScore',
                'quantifier-snake': 'snakeHighScore',
                'matrix': 'matrixHighScore'
            };

            const statKey = scoreMap[gameId];
            if (statKey) {
                const prevHighScore = stats[statKey] || 0;
                if (result.score > prevHighScore) {
                    stats[statKey] = result.score;
                }
            }

            // Update generic counters if available
            if (result.correctAnswers) {
                stats.correctAnswers = (stats.correctAnswers || 0) + result.correctAnswers;
            }
            if (result.incorrectAnswers) {
                stats.incorrectAnswers = (stats.incorrectAnswers || 0) + result.incorrectAnswers;
            }
            if (result.wordsStudied) {
                stats.totalStudied = (stats.totalStudied || 0) + result.wordsStudied;
            }

            if (typeof window.app.saveStats === 'function') {
                window.app.saveStats();
            }
        }

        // 3. Sync to window.progressIntegrator
        if (window.progressIntegrator) {
            const studyUpdate = {
                correctAnswers: result.correctAnswers || 0,
                incorrectAnswers: result.incorrectAnswers || 0,
                totalStudied: result.wordsStudied || 0
            };
            window.progressIntegrator.updateProgress(studyUpdate);
        }

        // 4. Dispatch global custom event
        document.dispatchEvent(new CustomEvent('hsk:game-result', {
            detail: {
                game: gameId,
                score: result.score,
                level,
                difficulty,
                metrics: result
            }
        }));
    }
}

/**
 * GameUtils - General static helper functions.
 */
class GameUtils {
    /**
     * Fisher-Yates array shuffler.
     * @param {Array} array - Array to shuffle.
     * @returns {Array} Shuffled shallow copy of the array.
     */
    static shuffleArray(array) {
        if (!array || !Array.isArray(array)) return [];
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Formats seconds into 'M:SS' format.
     * @param {number} seconds - Number of seconds.
     * @returns {string} Formatted string.
     */
    static formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    /**
     * Clamps a value between a minimum and maximum.
     * @param {number} val - Input value.
     * @param {number} min - Minimum limit.
     * @param {number} max - Maximum limit.
     * @returns {number} Clamped value.
     */
    static clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    /**
     * Generates a random integer between min and max (inclusive).
     * @param {number} min - Minimum value.
     * @param {number} max - Maximum value.
     * @returns {number} Random integer.
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Shows one DOM element and hides another.
     * @param {string} showId - Element ID to show.
     * @param {string} hideId - Element ID to hide.
     * @param {string} [displayType] - Display value (e.g. 'block', 'flex'). Defaults to 'block'.
     */
    static toggleScreens(showId, hideId, displayType = 'block') {
        const showEl = document.getElementById(showId);
        const hideEl = document.getElementById(hideId);
        if (showEl) showEl.style.display = displayType;
        if (hideEl) hideEl.style.display = 'none';
    }
}

/**
 * BaseGame - Shared base class for HSK games
 */
class BaseGame {
    constructor(gameId, config = {}) {
        this.gameId = gameId;
        this.config = config;
        this.state = 'idle'; // idle | playing | paused | ended
        this.score = 0;
        this.timer = new GameTimer();
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.wordsStudied = 0;
        this.startTime = null;
    }

    start() {
        this.state = 'playing';
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.wordsStudied = 0;
        this.startTime = performance.now();
        if (this.onStart) this.onStart();
    }

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this.timer.pause();
        if (this.onPause) this.onPause();
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        this.timer.resume();
        if (this.onResume) this.onResume();
    }

    end() {
        if (this.state === 'ended') return;
        this.state = 'ended';
        this.timer.stop();
        const timeSpent = this.startTime ? Math.round((performance.now() - this.startTime) / 1000) : 0;
        
        const result = {
            score: this.score,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            wordsStudied: this.wordsStudied,
            timeSpent: timeSpent
        };

        GameProgressReporter.reportGameResult(this.gameId, result, this.config.level || 'all', this.config.difficulty || 'normal');
        
        if (this.onEnd) this.onEnd(result);
    }

    startTimer(seconds, onTick, onEnd) {
        this.timer.start(seconds, onTick, () => {
            this.end();
            if (onEnd) onEnd();
        });
    }

    addScore(points, multiplier = 1) {
        this.score += Math.round(points * multiplier);
    }

    showCorrectFeedback() {
        if (window.gameAudioManager) {
            window.gameAudioManager.playSynth(523.25, 'sine', 0.15, 0.15); // C5
            setTimeout(() => window.gameAudioManager.playSynth(659.25, 'sine', 0.12, 0.25), 120); // E5
        }
    }

    showIncorrectFeedback() {
        if (window.gameAudioManager) {
            window.gameAudioManager.playSynth(220, 'sawtooth', 0.15, 0.25); // A3
            setTimeout(() => window.gameAudioManager.playSynth(110, 'triangle', 0.2, 0.4), 250); // A2
        }
    }
}

// Global exports
window.GameAudioManager = GameAudioManager;
window.gameAudioManager = new GameAudioManager();
window.GameTimer = GameTimer;
window.GameStateManager = GameStateManager;
window.GameProgressReporter = GameProgressReporter;
window.GameUtils = GameUtils;
window.BaseGame = BaseGame;

