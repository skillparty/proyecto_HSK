import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/hanzi-mahjong-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playStreakFanfare: vi.fn(),
  },
  achievementManager: {
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="hanzi-mahjong">
      <strong id="mahjong-score">0</strong>
      <strong id="mahjong-combo">0×</strong>
      <strong id="mahjong-pairs-left">8</strong>
      <strong id="mahjong-timer">00:00</strong>

      <button class="mahjong-mode-btn active" data-mode="radicals"></button>
      <button class="mahjong-mode-btn" data-mode="compounds"></button>

      <button class="mahjong-diff-btn" data-diff="easy"></button>
      <button class="mahjong-diff-btn active" data-diff="normal"></button>
      <button class="mahjong-diff-btn" data-diff="master"></button>

      <button id="mahjong-hint-btn"></button>
      <span id="mahjong-hints-count">3</span>
      <button id="mahjong-shuffle-btn"></button>
      <button id="mahjong-new-game-btn"></button>

      <div id="mahjong-board"></div>

      <div id="mahjong-victory-overlay" style="display: none;">
        <strong id="mahjong-final-score">0</strong>
        <button id="mahjong-play-again-btn"></button>
      </div>
    </div>
  `;
};

describe("HanziMahjongGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.HanziMahjongGame(app);
  });

  test("initializes correctly and sets up 16 tiles (8 pairs)", () => {
    game.init();
    expect(game.tiles.length).toBe(16);
    expect(game.pairsRemaining).toBe(8);
    expect(document.querySelectorAll(".mahjong-tile").length).toBe(16);
  });

  test("switches difficulty to easy (6 pairs / 12 tiles) and master (12 pairs / 24 tiles)", () => {
    game.init();
    const diffBtns = document.querySelectorAll(".mahjong-diff-btn");
    diffBtns[0].click(); // Easy
    expect(game.currentDifficulty).toBe("easy");
    expect(game.tiles.length).toBe(12);
    expect(game.pairsRemaining).toBe(6);

    diffBtns[2].click(); // Master
    expect(game.currentDifficulty).toBe("master");
    expect(game.tiles.length).toBe(24);
    expect(game.pairsRemaining).toBe(12);
  });

  test("matches correct pair successfully and increases score & combo", () => {
    game.init();
    const pairId = game.tiles[0].pairId;
    const firstIdx = 0;
    const secondIdx = game.tiles.findIndex((t, idx) => idx !== 0 && t.pairId === pairId);

    const tileEls = document.querySelectorAll(".mahjong-tile");
    tileEls[firstIdx].click();
    expect(tileEls[firstIdx].classList.contains("selected")).toBe(true);

    tileEls[secondIdx].click();
    expect(game.tiles[firstIdx].isMatched).toBe(true);
    expect(game.tiles[secondIdx].isMatched).toBe(true);
    expect(game.score).toBeGreaterThan(0);
    expect(game.combo).toBe(1);
    expect(game.pairsRemaining).toBe(7);
  });

  test("resets combo on mismatch", () => {
    game.init();
    game.combo = 3;

    const firstIdx = 0;
    const secondIdx = game.tiles.findIndex((t) => t.pairId !== game.tiles[0].pairId);

    const tileEls = document.querySelectorAll(".mahjong-tile");
    tileEls[firstIdx].click();
    tileEls[secondIdx].click();

    expect(game.combo).toBe(0);
    expect(app.audioController.playIncorrect).toHaveBeenCalled();
  });

  test("uses hint to highlight active matching pair", () => {
    game.init();
    expect(game.hintsRemaining).toBe(3);

    game.useHint();
    expect(game.hintsRemaining).toBe(2);
    expect(document.querySelectorAll(".mahjong-tile.hinted").length).toBe(2);
  });
});
