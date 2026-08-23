import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/radical-decomposer-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
  },
  achievementManager: {
    unlock: vi.fn(),
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="radical-decomposer">
      <input type="text" id="decomposer-search-input" />
      <div id="decomposer-quick-chips"></div>

      <div id="decomp-char-display"></div>
      <div id="decomp-pinyin"></div>
      <div id="decomp-meaning"></div>
      <span id="decomp-hsk-badge"></span>
      <span id="decomp-type-badge"></span>
      <button id="decomp-audio-btn">🔊</button>

      <div id="decomp-formula-equation"></div>
      <div id="decomp-mnemonic-story"></div>

      <div id="decomp-radical-highlight"></div>
      <div id="decomp-siblings-grid"></div>

      <div id="decomp-challenge-slots"></div>
      <div id="decomp-challenge-options"></div>
      <div id="decomp-challenge-feedback" style="display: none;"></div>
    </div>
  `;
};

describe("RadicalDecomposerGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.RadicalDecomposerGame(app);
  });

  test("initializes correctly with default character '休'", () => {
    game.init();
    expect(game.currentCharacter.char).toBe("休");
    expect(document.getElementById("decomp-char-display").textContent).toBe("休");
    expect(document.getElementById("decomp-pinyin").textContent).toBe("xiū");
    expect(document.querySelectorAll(".formula-component").length).toBeGreaterThanOrEqual(2);
  });

  test("searches and loads character '明' via handleSearch", () => {
    game.init();
    game.handleSearch("ming");
    expect(game.currentCharacter.char).toBe("明");
    expect(document.getElementById("decomp-char-display").textContent).toBe("明");
    expect(document.getElementById("decomp-pinyin").textContent).toBe("míng");
  });

  test("handles correct component assembly in challenge", () => {
    game.init(); // '休' requires ['亻', '木']
    game.handleChallengePick("亻");
    game.handleChallengePick("木");

    const feedback = document.getElementById("decomp-challenge-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("correct")).toBe(true);
    expect(app.audioController.playCorrect).toHaveBeenCalled();
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });

  test("handles incorrect component assembly in challenge", () => {
    game.init(); // '休' requires ['亻', '木']
    game.handleChallengePick("木");
    game.handleChallengePick("亻");

    const feedback = document.getElementById("decomp-challenge-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("incorrect")).toBe(true);
    expect(app.audioController.playIncorrect).toHaveBeenCalled();
  });
});
