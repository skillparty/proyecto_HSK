import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/graded-reader-game.js";

const stubApp = () => ({
  vocabulary: [
    { character: "李明", pinyin: "Lǐ Míng", spanish: "Li Ming", english: "Li Ming" },
    { character: "朋友", pinyin: "péngyou", spanish: "amigo", english: "friend" },
    { character: "中国", pinyin: "Zhōngguó", spanish: "China", english: "China" },
    { character: "喜欢", pinyin: "xǐhuan", spanish: "gustar", english: "like" },
    { character: "苹果", pinyin: "píngguǒ", spanish: "manzana", english: "apple" },
  ],
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playChime: vi.fn(),
  },
  deckManager: {
    toggleFavorite: vi.fn().mockReturnValue(true),
    isFavorite: vi.fn().mockReturnValue(false),
  },
  achievementManager: {
    unlock: vi.fn(),
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="graded-reader">
      <select id="reader-level-select">
        <option value="1">1</option>
        <option value="2">2</option>
      </select>
      <button id="reader-toggle-pinyin-btn"><span data-i18n="pinyin">Pinyin: ON</span></button>
      <button id="reader-read-aloud-btn"><span data-i18n="read">Leer</span></button>
      <div id="reader-story-chips"></div>
      <div id="reader-article-card">
        <h3 id="reader-story-title"></h3>
        <p id="reader-story-pinyin-title"></p>
        <span id="reader-story-level-badge"></span>
        <span id="reader-story-word-count"></span>
        <div id="reader-story-body"></div>
        <div id="reader-word-popover" style="display: none;">
          <span id="rwp-char"></span>
          <span id="rwp-pinyin"></span>
          <span id="rwp-meaning"></span>
          <button id="rwp-audio-btn">🔊</button>
          <button id="rwp-fav-btn">⭐</button>
        </div>
        <div id="reader-quiz-section">
          <div id="reader-quiz-questions"></div>
          <div id="reader-quiz-score-banner" style="display: none;"></div>
        </div>
      </div>
    </div>
  `;
};

describe("GradedReaderGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.GradedReaderGame(app);
  });

  test("initializes correctly and loads first HSK 1 story", () => {
    game.init();
    expect(game.currentStory).toBeDefined();
    expect(game.currentStory.level).toBe(1);
    expect(document.getElementById("reader-story-title").textContent).toBe(game.currentStory.title);
  });

  test("tokenizes text matching vocabulary items", () => {
    const vocabMap = new Map();
    vocabMap.set("苹果", { character: "苹果", pinyin: "píngguǒ", spanish: "manzana" });

    const tokens = game.tokenizeText("我吃苹果。", vocabMap);
    expect(tokens.some((t) => t.text === "苹果" && t.isWord)).toBe(true);
  });

  test("toggles pinyin visibility", () => {
    game.init();
    const btn = document.getElementById("reader-toggle-pinyin-btn");
    btn.click();

    expect(game.showPinyin).toBe(false);
    expect(document.getElementById("reader-story-body").classList.contains("hide-pinyin")).toBe(true);
  });

  test("shows and hides word popover on word click", () => {
    game.init();
    const wordEl = document.querySelector(".reader-word");
    if (wordEl) {
      wordEl.click();
      const popover = document.getElementById("reader-word-popover");
      expect(popover.style.display).toBe("block");
      expect(game.activePopoverWord).not.toBeNull();
    }
  });

  test("evaluates quiz answers and shows completion banner", () => {
    game.init();
    const qCount = game.currentStory.quiz.length;

    for (let i = 0; i < qCount; i++) {
      const correctOpt = game.currentStory.quiz[i].correct;
      game.handleQuizAnswer(i, correctOpt);
    }

    const banner = document.getElementById("reader-quiz-score-banner");
    expect(banner.style.display).toBe("block");
    expect(banner.innerHTML).toContain(`${qCount} / ${qCount}`);
    expect(app.achievementManager.unlock).toHaveBeenCalledWith("reader-master");
  });
});
