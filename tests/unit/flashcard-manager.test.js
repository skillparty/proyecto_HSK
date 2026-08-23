import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/flashcard-manager.js";

const stubApp = () => ({
  vocabulary: [],
  currentLevel: "1",
  practiceMode: "char-to-english",
  practiceOrderMode: "lesson",
  stats: {
    totalCards: 0,
    totalStudied: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  updateProgress: vi.fn(),
  saveStats: vi.fn(),
  updateHeaderStats: vi.fn(),
  markAsKnown: vi.fn(),
  getTranslation: (k) => k,
  audioController: {
    playFlip: vi.fn(),
  },
});

describe("FlashcardManager", () => {
  let app;
  let manager;

  beforeEach(() => {
    app = stubApp();
    manager = new window.FlashcardManager(app);
  });

  describe("getBookRank", () => {
    test("identifies shang / volume 1 as 1", () => {
      expect(manager.getBookRank("shang")).toBe(1);
      expect(manager.getBookRank("vol1")).toBe(1);
      expect(manager.getBookRank("上")).toBe(1);
    });

    test("identifies xia / volume 2 as 2", () => {
      expect(manager.getBookRank("xia")).toBe(2);
      expect(manager.getBookRank("vol2")).toBe(2);
      expect(manager.getBookRank("下")).toBe(2);
    });

    test("falls back to 1 for empty or unknown values", () => {
      expect(manager.getBookRank(null)).toBe(1);
      expect(manager.getBookRank("")).toBe(1);
    });
  });

  describe("getLessonNumber and getLessonSequence", () => {
    test("extracts lesson number from various properties", () => {
      expect(manager.getLessonNumber({ lesson: 5 })).toBe(5);
      expect(manager.getLessonNumber({ lessonNumber: 8 })).toBe(8);
      expect(manager.getLessonNumber({ unit: 3 })).toBe(3);
      expect(manager.getLessonNumber({})).toBe(0);
    });

    test("extracts sequence in lesson", () => {
      expect(manager.getLessonSequence({ lessonOrder: 12 })).toBe(12);
      expect(manager.getLessonSequence({ orderInLesson: 4 })).toBe(4);
      expect(manager.getLessonSequence({ sequence: 7 })).toBe(7);
      expect(manager.getLessonSequence({})).toBe(0);
    });
  });

  describe("sortForPractice", () => {
    test("sorts by lesson and sequence when metadata exists", () => {
      const words = [
        { character: "B", lesson: 2, lessonOrder: 1 },
        { character: "A", lesson: 1, lessonOrder: 2 },
        { character: "C", lesson: 1, lessonOrder: 1 },
      ];
      const sorted = manager.sortForPractice(words, "1");
      expect(sorted.map((w) => w.character)).toEqual(["C", "A", "B"]);
    });

    test("sorts across multiple books (shang before xia)", () => {
      const words = [
        { character: "X", book: "xia", lesson: 1, lessonOrder: 1 },
        { character: "S", book: "shang", lesson: 1, lessonOrder: 1 },
      ];
      const sorted = manager.sortForPractice(words, "4");
      expect(sorted.map((w) => w.character)).toEqual(["S", "X"]);
    });
  });

  describe("getToneVisuals", () => {
    test("identifies correct tone numbers from pinyin marks", () => {
      expect(manager.getToneVisuals("mā")).toContain("tone-1");
      expect(manager.getToneVisuals("má")).toContain("tone-2");
      expect(manager.getToneVisuals("mǎ")).toContain("tone-3");
      expect(manager.getToneVisuals("mà")).toContain("tone-4");
    });

    test("handles multi-syllable pinyin", () => {
      const visuals = manager.getToneVisuals("nǐ hǎo");
      expect(visuals).toContain("tone-3");
    });

    test("returns question mark for empty or falsy pinyin", () => {
      expect(manager.getToneVisuals("")).toBe("?");
      expect(manager.getToneVisuals(null)).toBe("?");
    });
  });

  describe("navigation & flip logic", () => {
    beforeEach(() => {
      manager.currentSession = [
        { character: "你", pinyin: "nǐ", level: 1 },
        { character: "好", pinyin: "hǎo", level: 1 },
        { character: "吗", pinyin: "ma", level: 1 },
      ];
      manager.sessionIndex = 0;
      manager.currentWord = manager.currentSession[0];
      manager.updateCard = vi.fn();
    });

    test("nextCard cycles forward and resets flip state", () => {
      manager.isFlipped = true;
      manager.nextCard();
      expect(manager.sessionIndex).toBe(1);
      expect(manager.currentWord.character).toBe("好");
      expect(manager.isFlipped).toBe(false);
      expect(app.stats.totalCards).toBe(1);
    });

    test("previousCard cycles backward", () => {
      manager.previousCard();
      expect(manager.sessionIndex).toBe(2);
      expect(manager.currentWord.character).toBe("吗");
    });

    test("handleSwipe moves forward on left swipe and backward on right swipe", () => {
      manager.handleSwipe(200, 100); // Swipe left -> Next
      expect(manager.sessionIndex).toBe(1);

      manager.handleSwipe(100, 200); // Swipe right -> Prev
      expect(manager.sessionIndex).toBe(0);
    });

    test("handleDifficulty calls markAsKnown with difficulty rating", () => {
      manager.isFlipped = true;
      manager.handleDifficulty("good");
      expect(app.markAsKnown).toHaveBeenCalledWith(true, "good");

      manager.handleDifficulty("again");
      expect(app.markAsKnown).toHaveBeenCalledWith(false, "again");
    });
  });
});
