import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/hanzi-builder-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  vocabulary: [
    { character: "好", level: 1 },
    { character: "你", level: 1 },
    { character: "看", level: 1 },
    { character: "读", level: 2 },
    { character: "晴", level: 2 },
    { character: "懂", level: 3 },
  ],
  stats: {
    hanziBuilderHighScore: 50,
  },
  saveStats: vi.fn(),
  achievementManager: {
    checkAchievements: vi.fn(),
  },
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  audioController: {
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="hanzi-builder">
      <div id="hanzi-build-setup" style="display: block;">
        <select id="hanzi-build-level">
          <option value="all">Todos los niveles</option>
          <option value="1">HSK 1</option>
          <option value="2">HSK 2</option>
          <option value="3">HSK 3</option>
        </select>
        <button id="hanzi-build-start-btn">Iniciar</button>
      </div>
      <div id="hanzi-build-game-area" style="display: none;">
        <span id="hanzi-build-score">0</span>
        <span id="hanzi-build-timer">1:00</span>
        <div id="hanzi-build-target">
          <span id="hanzi-build-translation">-</span>
          <span id="hanzi-build-pinyin">-</span>
        </div>
        <div id="hanzi-build-slots"></div>
        <div id="hanzi-build-palette-container"></div>
        <button id="hanzi-build-pause-btn">Pausar</button>
        <button id="hanzi-build-quit-btn">Salir</button>
      </div>
    </div>
  `;
};

describe("HanziBuilderGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.HanziBuilderGame(app);
  });

  test("initializes with over 100 character decompositions", () => {
    expect(Object.keys(game.decompositions).length).toBeGreaterThanOrEqual(100);
    const pool = game.getAllComponentsPool();
    expect(pool.length).toBeGreaterThan(40);
  });

  test("startGame transitions UI and populates target and palette", () => {
    game.startGame();
    expect(game.state.isPlaying).toBe(true);
    expect(document.getElementById("hanzi-build-setup").style.display).toBe("none");
    expect(document.getElementById("hanzi-build-game-area").style.display).toBe("flex");
    expect(game.state.currentWord).not.toBeNull();
    expect(document.querySelectorAll(".hanzi-build-slot").length).toBe(game.state.currentWord.parts.length);
    expect(document.querySelectorAll(".hanzi-build-part").length).toBeGreaterThanOrEqual(game.state.currentWord.parts.length);
  });

  test("filters characters by active level when selected", () => {
    const levelSelect = document.getElementById("hanzi-build-level");
    levelSelect.value = "2";
    game.startGame();
    expect(game.activeLevel).toBe("2");
    // All game words in level 2 should be matched against level 2 words
    expect(game.state.gameWords.length).toBeGreaterThan(0);
  });

  test("clicking correct components in order completes the character and awards points", () => {
    game.startGame();
    // Force a known word for predictable testing
    game.state.gameWords = [
      {
        character: "好",
        parts: ["女", "子"],
        pinyin: "hǎo",
        translation: "bueno",
        level: 1,
      },
    ];
    game.loadNextWord();

    // Click parts in order
    const parts = Array.from(document.querySelectorAll(".hanzi-build-part"));
    const partNu = parts.find((p) => p.textContent === "女");
    const partZi = parts.find((p) => p.textContent === "子");

    expect(partNu).toBeDefined();
    expect(partZi).toBeDefined();

    partNu.click();
    expect(game.state.assembledParts).toContain("女");

    partZi.click();
    expect(game.state.score).toBeGreaterThan(0);
  });

  test("onSlotClick returns the last placed component to the palette", () => {
    game.startGame();
    game.state.gameWords = [
      {
        character: "好",
        parts: ["女", "子"],
        pinyin: "hǎo",
        translation: "bueno",
        level: 1,
      },
    ];
    game.loadNextWord();

    const parts = Array.from(document.querySelectorAll(".hanzi-build-part"));
    const partNu = parts.find((p) => p.textContent === "女");
    partNu.click();

    expect(game.state.assembledParts.length).toBe(1);
    expect(partNu.classList.contains("used")).toBe(true);

    // Click slot 0 to return component
    game.onSlotClick(0);
    expect(game.state.assembledParts.length).toBe(0);
    expect(partNu.classList.contains("used")).toBe(false);
  });

  test("togglePause pauses countdown and updates button text", () => {
    game.startGame();
    expect(game.state.isPaused).toBe(false);

    game.togglePause();
    expect(game.state.isPaused).toBe(true);

    game.togglePause();
    expect(game.state.isPaused).toBe(false);
    clearInterval(game.timerIntervalId);
  });

  test("quitGame resets UI back to setup screen", () => {
    game.startGame();
    game.quitGame();
    expect(game.state.isPlaying).toBe(false);
    expect(document.getElementById("hanzi-build-setup").style.display).toBe("block");
    expect(document.getElementById("hanzi-build-game-area").style.display).toBe("none");
  });

  test("endGame updates high score, saves stats, and dispatches hsk:game-result", () => {
    game.startGame();
    game.state.score = 150;

    const eventSpy = vi.fn();
    document.addEventListener("hsk:game-result", eventSpy);

    game.endGame();

    expect(app.stats.hanziBuilderHighScore).toBe(150);
    expect(app.saveStats).toHaveBeenCalled();
    expect(app.achievementManager.checkAchievements).toHaveBeenCalled();
    expect(localStorage.getItem("hanziBuilderHighScore")).toBe("150");
    expect(eventSpy).toHaveBeenCalled();
  });
});
