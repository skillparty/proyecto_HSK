import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/quiz-engine.js";

const stubApp = () => ({
  vocabulary: [
    { character: "你", pinyin: "nǐ", english: "you", spanish: "tú", level: 1 },
    { character: "好", pinyin: "hǎo", english: "good", spanish: "bueno", level: 1 },
    { character: "吗", pinyin: "ma", english: "question particle", spanish: "partícula", level: 1 },
    { character: "我", pinyin: "wǒ", english: "I, me", spanish: "yo", level: 1 },
    { character: "他", pinyin: "tā", english: "he", spanish: "él", level: 1 },
  ],
  currentLanguage: "es",
  currentLevel: "1",
  stats: {
    totalStudied: 0,
    quizAnswered: 0,
    correctAnswers: 0,
    quizzesCompleted: 0,
  },
  getMeaningForLanguage: (w) => w?.spanish || w?.english || "",
  getTranslation: (k) => k,
  updateDailyProgress: vi.fn(),
  saveStats: vi.fn(),
  updateProgress: vi.fn(),
  updateHeaderStats: vi.fn(),
  renderQuizResumeAction: vi.fn(),
  audioController: {
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playStreakFanfare: vi.fn(),
  },
});

describe("QuizEngine", () => {
  let app;
  let engine;

  beforeEach(() => {
    window.localStorage.clear();
    app = stubApp();
    engine = new window.QuizEngine(app);
  });

  describe("shuffleArray", () => {
    test("does not mutate original array", () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      const shuffled = engine.shuffleArray(original);
      expect(original).toEqual(copy);
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(copy.sort());
    });
  });

  describe("generateOptions", () => {
    test("generates 4 options containing the correct answer", () => {
      const target = app.vocabulary[0];
      const correctAnswer = app.getMeaningForLanguage(target);
      const options = engine.generateOptions(target, correctAnswer);
      expect(options).toHaveLength(4);
      expect(options).toContain("tú");
      // All options must be unique
      expect(new Set(options).size).toBe(4);
    });
  });

  describe("scoring & answer validation", () => {
    beforeEach(() => {
      engine.state = {
        questions: [
          { character: "你", pinyin: "nǐ", spanish: "tú", level: 1 },
          { character: "好", pinyin: "hǎo", spanish: "bueno", level: 1 },
        ],
        currentQuestion: 0,
        score: 0,
        isActive: true,
        correctAnswer: "tú",
        selectedAnswer: "tú",
      };
      engine.showFeedback = vi.fn();
    });

    test("increments score and plays correct chime on right answer", () => {
      engine.submitAnswer();
      expect(engine.state.score).toBe(1);
      expect(app.stats.correctAnswers).toBe(1);
      expect(app.stats.totalStudied).toBe(1);
      expect(app.audioController.playCorrect).toHaveBeenCalled();
    });

    test("does not increment score and plays incorrect sound on wrong answer", () => {
      engine.state.selectedAnswer = "bueno";
      engine.submitAnswer();
      expect(engine.state.score).toBe(0);
      expect(app.stats.correctAnswers).toBe(0);
      expect(app.audioController.playIncorrect).toHaveBeenCalled();
    });
  });

  describe("session persistence", () => {
    test("saves and checks resumable session", () => {
      engine.state = {
        questions: [{ character: "你", pinyin: "nǐ", level: 1 }],
        currentQuestion: 0,
        score: 0,
        isActive: true,
      };
      engine.saveSession();
      expect(engine.hasResumableSession()).toBe(true);

      engine.clearSession();
      expect(engine.hasResumableSession()).toBe(false);
    });
  });
});
