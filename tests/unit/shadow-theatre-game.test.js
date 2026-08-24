import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/shadow-theatre-game.js";

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
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="shadow-theatre">
      <div id="shadow-story-chips"></div>

      <div id="puppet-silhouette-wrap">
        <span id="stage-actor-emoji"></span>
      </div>
      <div id="stage-scene-backdrop"></div>

      <div id="stage-caption-hanzi"></div>
      <div id="stage-caption-pinyin"></div>
      <div id="stage-caption-trans"></div>

      <button id="shadow-prev-scene-btn"></button>
      <button id="shadow-next-scene-btn"></button>
      <button id="shadow-play-scene-btn"></button>
      <span id="shadow-scene-indicator"></span>

      <div id="tale-moral-content"></div>
      <div id="tale-chengyu-box"></div>

      <p id="tale-quiz-question"></p>
      <div id="tale-quiz-options"></div>
      <div id="tale-quiz-feedback" style="display: none;"></div>
    </div>
  `;
};

describe("ShadowTheatreGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.ShadowTheatreGame(app);
  });

  test("initializes correctly and loads default tale", () => {
    game.init();
    expect(game.currentTale.id).toBe("hou-yi");
    expect(document.getElementById("stage-caption-hanzi").textContent).toContain("十个太阳");
    expect(document.getElementById("tale-moral-content").textContent).toContain("valentía");
    expect(document.getElementById("tale-chengyu-box").textContent).toContain("拔苗助长");
  });

  test("navigates forward and backward through scenes", () => {
    game.init();
    expect(game.currentSceneIdx).toBe(0);

    game.goToNextScene();
    expect(game.currentSceneIdx).toBe(1);
    expect(document.getElementById("stage-caption-hanzi").textContent).toContain("后羿");

    game.goToPrevScene();
    expect(game.currentSceneIdx).toBe(0);
  });

  test("switches tales when chip is clicked", () => {
    game.init();
    const chips = document.querySelectorAll(".story-chip-btn");
    expect(chips.length).toBe(4);

    // Switch to Monkey King (index 2)
    chips[2].click();
    expect(game.currentTale.id).toBe("monkey-king");
    expect(document.getElementById("stage-caption-hanzi").textContent).toContain("仙石");
    expect(document.getElementById("tale-chengyu-box").textContent).toContain("火眼金睛");
  });

  test("handles comprehension quiz answers accurately", () => {
    game.init();
    const q = game.currentTale.quiz;
    const correctIdx = q.options.findIndex((o) => o.isCorrect);

    game.handleQuizAnswer(correctIdx);
    const feedback = document.getElementById("tale-quiz-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("correct")).toBe(true);
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });
});
