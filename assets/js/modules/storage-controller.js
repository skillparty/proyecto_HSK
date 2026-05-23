class StorageController {
  // Centralized storage key registry — update here if keys ever change
  static get KEYS() {
    return {
      STATS: "hsk-stats",
      AUDIO_ENABLED: "hsk-audio-enabled",
      LANGUAGE: "hsk-language",
      VOICE_PREFERENCE: "hsk-voice-preference",
      PRACTICE_ORDER: "hsk-practice-order-mode",
      LAST_TAB: "hsk-last-tab",
      TONE_CHECK_MODE: "hsk-tone-check-mode",
    };
  }

  constructor(app) {
    this.app = app;
  }

  loadStats() {
    try {
      const savedStats = localStorage.getItem(StorageController.KEYS.STATS);
      if (savedStats) {
        this.app.stats = { ...this.app.stats, ...JSON.parse(savedStats) };
      }

      this.app.stats.totalCards = Number(this.app.stats.totalCards || 0) || 0;
      this.app.stats.totalStudied =
        Number(this.app.stats.totalStudied ?? this.app.stats.totalCards ?? 0) ||
        0;
      this.app.stats.correctAnswers =
        Number(this.app.stats.correctAnswers || 0) || 0;
      this.app.stats.currentStreak =
        Number(this.app.stats.currentStreak || 0) || 0;
      this.app.stats.bestStreak = Number(this.app.stats.bestStreak || 0) || 0;
      this.app.stats.dailyGoal = Number(this.app.stats.dailyGoal || 20) || 20;
      this.app.stats.todayCards = Number(this.app.stats.todayCards || 0) || 0;
      this.app.stats.quizzesCompleted =
        Number(this.app.stats.quizzesCompleted || 0) || 0;
      this.app.stats.quizAnswered =
        Number(this.app.stats.quizAnswered || 0) || 0;
      this.app.stats.matrixRounds =
        Number(this.app.stats.matrixRounds || 0) || 0;
      this.app.stats.snakeHighScore =
        Number(this.app.stats.snakeHighScore || 0) || 0;
    } catch (error) {
      this.app.logWarn("Error loading stats:", error);
    }
  }

  saveStats() {
    try {
      localStorage.setItem(
        StorageController.KEYS.STATS,
        JSON.stringify(this.app.stats),
      );
      this.app.saveDailyProgress();
      this.app.updateHeaderStats();
    } catch (error) {
      this.app.logWarn("Error saving stats:", error);
    }
  }

  loadSettings() {
    try {
      const audioEnabled = localStorage.getItem(
        StorageController.KEYS.AUDIO_ENABLED,
      );
      if (audioEnabled !== null) {
        this.app.isAudioEnabled = audioEnabled === "true";
      }

      const savedLanguage = localStorage.getItem(
        StorageController.KEYS.LANGUAGE,
      );
      if (savedLanguage) {
        this.app.currentLanguage = savedLanguage;
      }

      const savedVoice = localStorage.getItem(
        StorageController.KEYS.VOICE_PREFERENCE,
      );
      if (savedVoice) {
        this.app.selectedVoice = savedVoice;
      }

      const practiceOrderMode = localStorage.getItem(
        StorageController.KEYS.PRACTICE_ORDER,
      );
      if (practiceOrderMode === "lesson" || practiceOrderMode === "mixed") {
        this.app.practiceOrderMode = practiceOrderMode;
      }

      const toneCheckMode = localStorage.getItem(
        StorageController.KEYS.TONE_CHECK_MODE,
      );
      if (toneCheckMode === "standard" || toneCheckMode === "strict") {
        this.app.toneCheckMode = toneCheckMode;
      }
    } catch (error) {
      this.app.logWarn("Error loading settings:", error);
    }
  }
}

window.StorageController = StorageController;
