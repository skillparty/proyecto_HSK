import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/user-progress-backend.js";

describe("BackendUserProgress", () => {
  let mockAuth;
  let progressManager;

  beforeEach(() => {
    localStorage.clear();

    mockAuth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
    };

    window.FirebaseSDK = {
      doc: vi.fn().mockReturnValue({ id: "doc-1" }),
      setDoc: vi.fn().mockResolvedValue(),
      serverTimestamp: vi.fn().mockReturnValue("2026-09-01T00:00:00Z"),
    };

    window.firebaseClient = {
      db: {},
      user: { uid: "user-123" },
      getUserProfile: vi.fn().mockResolvedValue(null),
      getUserProgress: vi.fn().mockResolvedValue([]),
      saveWordProgress: vi.fn().mockResolvedValue(),
      updateProgress: vi.fn().mockResolvedValue(),
      saveUserProfile: vi.fn().mockResolvedValue(),
      updateUserProfile: vi.fn().mockResolvedValue(),
    };

    progressManager = new window.BackendUserProgress(mockAuth);
  });

  describe("Initial State & Defaults", () => {
    it("initializes with sensible default preferences", () => {
      const prefs = progressManager.getPreferences();
      expect(prefs.language).toBe("es");
      expect(prefs.theme).toBe("dark");
      expect(prefs.audioEnabled).toBe(true);
      expect(prefs.defaultHskLevel).toBe("1");
      expect(prefs.dailyGoal).toBe(20);
    });

    it("initializes empty progress counters", () => {
      const stats = progressManager.getStatistics();
      expect(stats.totalStudied).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.incorrectAnswers).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
      expect(stats.accuracyRate).toBe(0);
    });
  });

  describe("Guest Profile Persistence", () => {
    it("loads saved guest profile from localStorage on init", () => {
      localStorage.setItem(
        "hsk-guest-profile",
        JSON.stringify({
          preferences: { dailyGoal: 50 },
          progress: { totalStudied: 120, correctAnswers: 100, incorrectAnswers: 20 },
        }),
      );

      const manager = new window.BackendUserProgress(mockAuth);
      expect(manager.getPreferences().dailyGoal).toBe(50);
      expect(manager.getStatistics().totalStudied).toBe(120);
      expect(manager.getStatistics().accuracyRate).toBe(83);
    });

    it("updates and saves preference changes", () => {
      progressManager.updatePreference("dailyGoal", 35);
      expect(progressManager.getPreferences().dailyGoal).toBe(35);

      const saved = JSON.parse(localStorage.getItem("hsk-guest-profile"));
      expect(saved.preferences.dailyGoal).toBe(35);
    });
  });

  describe("Word Study Recording", () => {
    it("records a correct answer and increments streaks", async () => {
      const word = { character: "你好", pinyin: "nǐ hǎo", translation: "hola", level: "1" };

      await progressManager.recordWordStudy(word, true, "char-to-pinyin", 2);

      const stats = progressManager.getStatistics();
      expect(stats.totalStudied).toBe(1);
      expect(stats.correctAnswers).toBe(1);
      expect(stats.incorrectAnswers).toBe(0);
      expect(stats.currentStreak).toBe(1);
      expect(stats.bestStreak).toBe(1);
      expect(stats.accuracyRate).toBe(100);

      const hsk1 = progressManager.profile.hskProgress["1"];
      expect(hsk1.studied).toBe(1);
      expect(hsk1.correct).toBe(1);
      expect(hsk1.incorrect).toBe(0);
    });

    it("resets currentStreak on incorrect answer but keeps bestStreak", async () => {
      const word = { character: "谢谢", pinyin: "xièxie", translation: "gracias", level: "1" };

      await progressManager.recordWordStudy(word, true, "char-to-pinyin", 1);
      await progressManager.recordWordStudy(word, true, "char-to-pinyin", 1);
      expect(progressManager.getStatistics().currentStreak).toBe(2);

      await progressManager.recordWordStudy(word, false, "char-to-pinyin", 1);
      const stats = progressManager.getStatistics();
      expect(stats.totalStudied).toBe(3);
      expect(stats.correctAnswers).toBe(2);
      expect(stats.incorrectAnswers).toBe(1);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(2);
      expect(stats.accuracyRate).toBe(67);
    });

    it("forwards word study to Firebase when user is authenticated", async () => {
      mockAuth.isAuthenticated.mockReturnValue(true);
      const word = { character: "猫", pinyin: "māo", translation: "gato", level: "1" };

      await progressManager.recordWordStudy(word, true, "char-to-pinyin", 1.5);

      expect(window.firebaseClient.saveWordProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          word_character: "猫",
          word_pinyin: "māo",
          hsk_level: "1",
          is_correct: true,
        }),
      );
      expect(window.firebaseClient.updateProgress).toHaveBeenCalledWith("1", true, 1.5);
    });
  });

  describe("Quiz Completion & Statistics", () => {
    it("updates quizzes completed counter and recalculates stats", async () => {
      await progressManager.recordQuizCompletion(1, 8, 10);

      const summary = progressManager.getProgressSummary();
      expect(summary.quizzesCompleted).toBe(1);
    });
  });

  describe("Session Tracking", () => {
    it("tracks session duration upon endSession", async () => {
      progressManager.startSession();
      // Simulate 2 minutes passing
      progressManager.sessionStartTime = Date.now() - 120 * 1000;

      await progressManager.endSession();
      expect(progressManager.profile.progress.totalTimeSpent).toBeGreaterThanOrEqual(2);
      expect(progressManager.sessionStartTime).toBeNull();
    });
  });
});
