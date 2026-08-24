import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/china-cities-game.js";

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
    <div id="china-cities">
      <div id="cities-nav-pills"></div>

      <div id="city-avatar-badge"></div>
      <div id="city-chinese-name"></div>
      <h3 id="city-spanish-name"></h3>
      <p id="city-tagline"></p>

      <div id="city-highlights-grid"></div>
      <div id="city-food-grid"></div>
      <div id="city-vocab-list"></div>
      <p id="city-trivia-text"></p>

      <p id="city-quiz-question"></p>
      <div id="city-quiz-options"></div>
      <div id="city-quiz-feedback" style="display: none;"></div>
    </div>
  `;
};

describe("ChinaCitiesGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.ChinaCitiesGame(app);
  });

  test("initializes correctly and loads default city (Beijing)", () => {
    game.init();
    expect(game.currentCity.id).toBe("beijing");
    expect(document.getElementById("city-chinese-name").textContent).toContain("北京");
    expect(document.querySelectorAll(".highlight-item-card").length).toBe(4);
    expect(document.querySelectorAll(".food-item-card").length).toBe(2);
    expect(document.querySelectorAll(".city-vocab-row").length).toBe(3);
  });

  test("switches cities when pill is clicked", () => {
    game.init();
    const pills = document.querySelectorAll(".city-pill-btn");
    expect(pills.length).toBe(5);

    // Switch to Chengdu (index 3)
    pills[3].click();
    expect(game.currentCity.id).toBe("chengdu");
    expect(document.getElementById("city-chinese-name").textContent).toContain("成都");
    expect(document.getElementById("city-tagline").textContent).toContain("panda");
  });

  test("plays audio when landmark card is clicked", () => {
    game.init();
    const card = document.querySelector(".highlight-item-card");
    card.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalledWith("故宫");
  });

  test("validates quiz responses correctly", () => {
    game.init();
    const q = game.currentCity.quiz;
    const correctIdx = q.options.findIndex((o) => o.isCorrect);

    game.handleQuizAnswer(correctIdx);
    const feedback = document.getElementById("city-quiz-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("correct")).toBe(true);
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });
});
