import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/sentence-builder-game.js";

const stubApp = () => ({
  vocabulary: [
    { character: "汉语", level: 1 },
    { character: "学校", level: 1 },
    { character: "学习", level: 1 },
    { character: "学生", level: 1 },
    { character: "喜欢", level: 1 },
    { character: "米饭", level: 1 },
  ],
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  getTranslation: (k) => k,
  audioController: {
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playStreakFanfare: vi.fn(),
    playGameOver: vi.fn(),
    playAudio: vi.fn(),
  },
});

describe("SentenceBuilderGame", () => {
  let app;
  let game;

  beforeEach(() => {
    app = stubApp();
    game = new window.SentenceBuilderGame(app);
  });

  describe("cleanPunctuation", () => {
    test("strips Chinese and Western punctuation and spaces", () => {
      expect(game.cleanPunctuation("你好！")).toBe("你好");
      expect(game.cleanPunctuation("他是学生。")).toBe("他是学生");
      expect(game.cleanPunctuation("帮我，一下？")).toBe("帮我一下");
      expect(game.cleanPunctuation("")).toBe("");
    });
  });

  describe("tokenizeSentence", () => {
    test("tokenizes multi-character words based on vocabulary dictionary", () => {
      const tokens = game.tokenizeSentence("我们在学校学习汉语。");
      expect(tokens).toContain("学校");
      expect(tokens).toContain("学习");
      expect(tokens).toContain("汉语");
    });

    test("falls back to individual characters when no multi-character words match", () => {
      const tokens = game.tokenizeSentence("你我他");
      expect(tokens).toEqual(["你", "我", "他"]);
    });
  });

  describe("tile interaction and placement", () => {
    beforeEach(() => {
      game.state.currentSentence = {
        chinese: "我是学生。",
        pinyin: "wǒ shì xuésheng。",
        spanish: "Soy estudiante.",
        tokens: ["我", "是", "学生"],
      };
      game.state.targetTokens = ["我", "是", "学生"];
      game.state.placedTiles = [];
      game.state.bankTiles = [
        { id: "t1", text: "是", isPlaced: false },
        { id: "t2", text: "我", isPlaced: false },
        { id: "t3", text: "学生", isPlaced: false },
      ];
      game.state.isSolved = false;
      game.renderTargetSlots = vi.fn();
      game.renderBankTiles = vi.fn();
    });

    test("selectBankTile moves tile from bank to placed list", () => {
      game.selectBankTile("t2"); // "我"
      expect(game.state.placedTiles).toHaveLength(1);
      expect(game.state.placedTiles[0].text).toBe("我");
      expect(game.state.bankTiles.find((t) => t.id === "t2").isPlaced).toBe(true);
    });

    test("removePlacedTile returns tile back to bank", () => {
      game.selectBankTile("t2"); // "我"
      game.removePlacedTile(0);
      expect(game.state.placedTiles).toHaveLength(0);
      expect(game.state.bankTiles.find((t) => t.id === "t2").isPlaced).toBe(false);
    });

    test("resetTiles clears all placed tiles", () => {
      game.selectBankTile("t1");
      game.selectBankTile("t2");
      expect(game.state.placedTiles).toHaveLength(2);

      game.resetTiles();
      expect(game.state.placedTiles).toHaveLength(0);
      expect(game.state.bankTiles.every((t) => !t.isPlaced)).toBe(true);
    });

    test("giveHint places the next expected tile automatically", () => {
      game.giveHint();
      expect(game.state.placedTiles).toHaveLength(1);
      expect(game.state.placedTiles[0].text).toBe("我"); // First target token
    });
  });

  describe("checkAnswer", () => {
    beforeEach(() => {
      game.state.currentSentence = {
        chinese: "我是学生。",
        pinyin: "wǒ shì xuésheng。",
        spanish: "Soy estudiante.",
        tokens: ["我", "是", "学生"],
      };
      game.state.targetTokens = ["我", "是", "学生"];
      game.state.score = 0;
      game.state.streak = 0;
      game.state.isSolved = false;
      game.updateStatsDisplay = vi.fn();
      game.playSentenceAudio = vi.fn();
    });

    test("validates correct token sequence, awards points and plays chime", () => {
      game.state.placedTiles = [
        { id: "t1", text: "我" },
        { id: "t2", text: "是" },
        { id: "t3", text: "学生" },
      ];

      game.checkAnswer();

      expect(game.state.isSolved).toBe(true);
      expect(game.state.score).toBeGreaterThan(0);
      expect(game.state.streak).toBe(1);
      expect(app.audioController.playCorrect).toHaveBeenCalled();
      expect(game.playSentenceAudio).toHaveBeenCalled();
    });

    test("penalizes streak and plays incorrect sound when wrong", () => {
      game.state.placedTiles = [
        { id: "t1", text: "是" },
        { id: "t2", text: "我" },
        { id: "t3", text: "学生" },
      ];
      game.state.streak = 3;

      game.checkAnswer();

      expect(game.state.isSolved).toBe(false);
      expect(game.state.streak).toBe(0);
      expect(app.audioController.playIncorrect).toHaveBeenCalled();
    });
  });

  describe("game mode and pool selection", () => {
    test("returns sentences matching selected level or fallback", () => {
      game.state.level = "1";
      const pool = game.getSentencePool();
      expect(pool.length).toBeGreaterThan(0);
      expect(pool.every((s) => Number(s.level) === 1)).toBe(true);
    });
  });
});
