import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/quiz-engine.js";

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="quiz">
      <div id="quiz-setup">
        <select id="quiz-level">
          <option value="1" selected>HSK 1</option>
          <option value="all">All levels</option>
        </select>
        <select id="quiz-mode">
          <option value="meaning" selected>Meaning</option>
          <option value="reverse">Reverse</option>
          <option value="listening">Listening</option>
          <option value="pinyin">Pinyin</option>
        </select>
        <select id="quiz-questions">
          <option value="10" selected>10</option>
        </select>
        <select id="quiz-timer">
          <option value="none" selected>None</option>
          <option value="15">15</option>
        </select>
        <button id="start-quiz">Start</button>
      </div>
      <div id="quiz-container" style="display: none;">
        <div class="quiz-header">
          <span id="quiz-current">1</span>
          <span id="quiz-total">10</span>
          <span id="quiz-score">0</span>
          <div id="quiz-timer-badge" style="display: none;"><span id="quiz-timer-val">15</span></div>
        </div>
        <div id="quiz-content">
          <div id="quiz-question"></div>
          <div id="quiz-options"></div>
          <button id="quiz-submit">Submit</button>
          <button id="quiz-next" style="display: none;">Next</button>
        </div>
      </div>
      <div id="quiz-results" style="display: none;">
        <span id="final-score">0/0</span>
        <span id="final-percentage">0%</span>
        <div id="quiz-grade-banner"></div>
        <button id="restart-quiz">Retry</button>
        <button id="retry-mistakes-btn" style="display: none;">Retry Mistakes</button>
        <button id="save-mistakes-deck-btn" style="display: none;">Save to Deck</button>
        <button id="new-quiz">New Quiz</button>
        <div id="quiz-breakdown-wrapper" style="display: none;">
          <div id="quiz-breakdown-list"></div>
        </div>
      </div>
    </div>
  `;
};

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
  getTranslation: (k, params) => {
    if (k === "quizMistakesDeckCreated" && params) {
      return `Se guardaron ${params.count} palabras en '${params.deckName}'`;
    }
    return k;
  },
  showToast: vi.fn(),
  updateDailyProgress: vi.fn(),
  saveStats: vi.fn(),
  updateProgress: vi.fn(),
  updateHeaderStats: vi.fn(),
  renderQuizResumeAction: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playStreakFanfare: vi.fn(),
  },
  deckManager: {
    getAllDecks: vi.fn(() => []),
    createDeck: vi.fn((name, _desc) => ({ id: "deck_err_1", name, words: [] })),
    isWordInDeck: vi.fn(() => false),
    addWordToDeck: vi.fn(),
  },
});

describe("QuizEngine", () => {
  let app;
  let engine;

  beforeEach(() => {
    window.localStorage.clear();
    setupDOM();
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

  describe("generateOptions across modes", () => {
    test("generates 4 options in meaning mode", () => {
      const target = app.vocabulary[0];
      const correctAnswer = app.getMeaningForLanguage(target);
      const options = engine.generateOptions(target, correctAnswer, "meaning");
      expect(options).toHaveLength(4);
      expect(options).toContain("tú");
      expect(new Set(options).size).toBe(4);
    });

    test("generates 4 character options in reverse mode", () => {
      const target = app.vocabulary[1];
      const options = engine.generateOptions(target, target.character, "reverse");
      expect(options).toHaveLength(4);
      expect(options).toContain("好");
      expect(new Set(options).size).toBe(4);
    });

    test("generates tone-discriminating or vocabulary options in pinyin mode", () => {
      const target = app.vocabulary[0]; // 你 nǐ
      const options = engine.generateOptions(target, target.pinyin, "pinyin");
      expect(options).toHaveLength(4);
      expect(options).toContain("nǐ");
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
        answersHistory: [],
      };
      engine.showFeedback = vi.fn();
    });

    test("increments score and plays correct chime on right answer", () => {
      engine.submitAnswer();
      expect(engine.state.score).toBe(1);
      expect(app.stats.correctAnswers).toBe(1);
      expect(app.stats.totalStudied).toBe(1);
      expect(app.audioController.playCorrect).toHaveBeenCalled();
      expect(engine.state.answersHistory).toHaveLength(1);
      expect(engine.state.answersHistory[0].isCorrect).toBe(true);
    });

    test("does not increment score and plays incorrect sound on wrong answer", () => {
      engine.state.selectedAnswer = "bueno";
      engine.submitAnswer();
      expect(engine.state.score).toBe(0);
      expect(app.stats.correctAnswers).toBe(0);
      expect(app.audioController.playIncorrect).toHaveBeenCalled();
      expect(engine.state.answersHistory).toHaveLength(1);
      expect(engine.state.answersHistory[0].isCorrect).toBe(false);
    });
  });

  describe("results, review breakdown, and mistake handling", () => {
    beforeEach(() => {
      engine.state = {
        questions: [
          { character: "你", pinyin: "nǐ", spanish: "tú", level: 1 },
          { character: "好", pinyin: "hǎo", spanish: "bueno", level: 1 },
        ],
        currentQuestion: 1,
        score: 1,
        isActive: true,
        answersHistory: [
          {
            question: { character: "你", pinyin: "nǐ", spanish: "tú", level: 1 },
            selectedAnswer: "tú",
            correctAnswer: "tú",
            isCorrect: true,
            mode: "meaning",
          },
          {
            question: { character: "好", pinyin: "hǎo", spanish: "bueno", level: 1 },
            selectedAnswer: "malo",
            correctAnswer: "bueno",
            isCorrect: false,
            mode: "meaning",
          },
        ],
      };
    });

    test("renders review breakdown cards and mistake action buttons", () => {
      engine.showResults();

      expect(document.getElementById("quiz-results").style.display).toBe("block");
      expect(document.getElementById("final-score").textContent).toBe("1/2");
      expect(document.getElementById("final-percentage").textContent).toBe("50%");

      // Review breakdown wrapper is displayed
      const breakdownWrapper = document.getElementById("quiz-breakdown-wrapper");
      expect(breakdownWrapper.style.display).toBe("block");

      const cards = document.querySelectorAll(".quiz-breakdown-card");
      expect(cards.length).toBe(2);
      expect(cards[0].classList.contains("is-correct")).toBe(true);
      expect(cards[1].classList.contains("is-wrong")).toBe(true);

      // Mistakes retry button should be visible because 1 question was failed
      const retryMistakesBtn = document.getElementById("retry-mistakes-btn");
      expect(retryMistakesBtn.style.display).toBe("inline-flex");
      expect(retryMistakesBtn.textContent).toContain("1");
    });

    test("retries mistakes only with targeted question set", () => {
      engine.showResults();
      engine.retryMistakes();

      expect(engine.state.questions).toHaveLength(1);
      expect(engine.state.questions[0].character).toBe("好");
      expect(engine.state.currentQuestion).toBe(0);
      expect(engine.state.score).toBe(0);
      expect(engine.state.isMistakeRetry).toBe(true);
      expect(document.getElementById("quiz-container").style.display).toBe("block");
    });

    test("saves missed words to custom deck via DeckManager", () => {
      engine.showResults();
      engine.saveMistakesToDeck();

      expect(app.deckManager.addWordToDeck).toHaveBeenCalled();
      expect(app.showToast).toHaveBeenCalledWith(
        expect.stringContaining("Errores de Quiz"),
        "success",
        3000
      );
    });
  });

  describe("multidimensional modes in showQuestion", () => {
    test("sets up reverse mode with character answer options", () => {
      document.getElementById("quiz-mode").value = "reverse";
      engine.start();

      expect(engine.state.mode).toBe("reverse");
      expect(document.querySelector(".quiz-reverse-meaning")).not.toBeNull();
      const options = document.querySelectorAll(".quiz-option");
      expect(options.length).toBe(4);
    });

    test("sets up listening mode with audio button and hidden characters", () => {
      document.getElementById("quiz-mode").value = "listening";
      engine.start();

      expect(engine.state.mode).toBe("listening");
      expect(document.querySelector(".quiz-listening-hero")).not.toBeNull();
      expect(document.getElementById("quiz-masked-char")).not.toBeNull();
    });

    test("sets up pinyin mode with tone marks", () => {
      document.getElementById("quiz-mode").value = "pinyin";
      engine.start();

      expect(engine.state.mode).toBe("pinyin");
      const options = document.querySelectorAll(".quiz-option");
      expect(options.length).toBe(4);
    });
  });

  describe("timer functionality", () => {
    test("clears and manages timer countdown properly", () => {
      engine.state.timerSeconds = 15;
      engine.setupTimer();
      expect(engine.state.timeLeft).toBe(15);
      expect(document.getElementById("quiz-timer-badge").style.display).toBe("inline-flex");

      engine.clearTimer();
      expect(engine.timerInterval).toBeNull();
    });
  });

  describe("session persistence & reset", () => {
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

    test("resets and restarts cleanly", () => {
      engine.state.isActive = true;
      engine.reset();

      expect(engine.state.isActive).toBe(false);
      expect(engine.state.questions).toHaveLength(0);
      expect(document.getElementById("quiz-setup").style.display).toBe("block");
      expect(document.getElementById("quiz-container").style.display).toBe("none");
      expect(document.getElementById("quiz-results").style.display).toBe("none");
    });
  });
});
