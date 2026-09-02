import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../assets/js/progress-integrator.js";

describe("ProgressIntegrator", () => {
  let integrator;

  beforeEach(() => {
    localStorage.clear();

    window.firebaseSync = {
      currentUser: { uid: "user-456" },
      getUserProgress: vi.fn().mockResolvedValue({ success: false }),
      syncUserProgress: vi.fn().mockResolvedValue({ success: true }),
      recordWordStudy: vi.fn().mockResolvedValue({ success: true }),
      recordStudyEvent: vi.fn().mockResolvedValue({ success: true }),
      updateStudyHeatmap: vi.fn().mockResolvedValue({ success: true }),
      getSyncStatus: vi.fn().mockReturnValue({ isOnline: true }),
    };

    integrator = new (window.ProgressIntegrator || require("../../assets/js/progress-integrator.js"))();
  });

  describe("Local Progress Storage", () => {
    it("returns empty object if no progress is saved", () => {
      expect(integrator.getLocalProgress()).toEqual({});
    });

    it("saves and retrieves progress from localStorage", () => {
      const sample = { totalStudied: 42, correctAnswers: 40 };
      integrator.saveLocalProgress(sample);

      expect(integrator.getLocalProgress()).toEqual(sample);
    });

    it("generates structured initial progress with 6 HSK levels", () => {
      const initial = integrator.createInitialProgress();
      expect(initial.totalStudied).toBe(0);
      expect(initial.hskLevels["1"]).toBeDefined();
      expect(initial.hskLevels["6"]).toBeDefined();
    });
  });

  describe("Merging Progress", () => {
    it("merges local and cloud progress taking highest metrics", () => {
      const local = {
        totalStudied: 100,
        correctAnswers: 90,
        currentStreak: 5,
        bestStreak: 12,
        lastStudyDate: "2026-08-01T10:00:00Z",
      };

      const cloud = {
        total_studied: 150,
        correct_answers: 80,
        current_streak: 10,
        best_streak: 15,
        last_study_date: "2026-08-02T10:00:00Z",
      };

      const merged = integrator.mergeProgress(local, cloud);

      expect(merged.totalStudied).toBe(150);
      expect(merged.correctAnswers).toBe(90);
      expect(merged.currentStreak).toBe(10);
      expect(merged.bestStreak).toBe(15);
      expect(merged.lastStudyDate).toBe("2026-08-02T10:00:00Z");
    });
  });

  describe("Recording Word Study", () => {
    it("increments counters and updates HSK level stats on correct answer", async () => {
      const wordData = {
        hskLevel: 2,
        isCorrect: true,
        responseTime: 1800,
      };

      const progress = await integrator.recordWordStudy(wordData);

      expect(progress.totalStudied).toBe(1);
      expect(progress.correctAnswers).toBe(1);
      expect(progress.currentStreak).toBe(1);
      expect(progress.bestStreak).toBe(1);

      expect(window.firebaseSync.recordWordStudy).toHaveBeenCalledWith(wordData);
      expect(window.firebaseSync.recordStudyEvent).toHaveBeenCalledWith(
        2,
        true,
        expect.any(Number),
      );
    });

    it("resets streak on incorrect answer", async () => {
      await integrator.recordWordStudy({ hskLevel: 1, isCorrect: true });
      await integrator.recordWordStudy({ hskLevel: 1, isCorrect: true });
      expect(integrator.getLocalProgress().currentStreak).toBe(2);

      const progress = await integrator.recordWordStudy({ hskLevel: 1, isCorrect: false });
      expect(progress.totalStudied).toBe(3);
      expect(progress.correctAnswers).toBe(2);
      expect(progress.incorrectAnswers).toBe(1);
      expect(progress.currentStreak).toBe(0);
      expect(progress.bestStreak).toBe(2);
    });
  });

  describe("Sync Lifecycle", () => {
    it("starts and stops periodic sync timer", () => {
      integrator.startPeriodicSync();
      expect(integrator.syncInterval).not.toBeNull();

      integrator.stopPeriodicSync();
      expect(integrator.syncInterval).toBeNull();
    });
  });
});
