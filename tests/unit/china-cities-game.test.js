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
      <div id="passport-stamps-wrap"></div>

      <div id="city-avatar-badge"></div>
      <div id="city-chinese-name"></div>
      <h3 id="city-spanish-name"></h3>
      <p id="city-tagline"></p>

      <div id="city-highlights-grid"></div>
      <div id="city-food-grid"></div>
      <div id="city-survival-list"></div>
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
    localStorage.clear();
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
    expect(document.querySelectorAll(".survival-phrase-card").length).toBe(2);
    expect(document.querySelectorAll(".city-vocab-row").length).toBe(3);
  });

  test("switches cities when pill is clicked across all 7 destinations", () => {
    game.init();
    const pills = document.querySelectorAll(".city-pill-btn");
    expect(pills.length).toBe(7);

    // Switch to Hangzhou (index 5)
    pills[5].click();
    expect(game.currentCity.id).toBe("hangzhou");
    expect(document.getElementById("city-chinese-name").textContent).toContain("杭州");

    // Switch to Hong Kong (index 6)
    pills[6].click();
    expect(game.currentCity.id).toBe("hongkong");
    expect(document.getElementById("city-chinese-name").textContent).toContain("香港");
  });

  test("plays audio when survival phrase is clicked", () => {
    game.init();
    const phrase = document.querySelector(".survival-phrase-card");
    phrase.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalled();
  });

  test("validates quiz responses and unlocks passport stamp", () => {
    game.init();
    const q = game.currentCity.quiz;
    const correctIdx = q.options.findIndex((o) => o.isCorrect);

    game.handleQuizAnswer(correctIdx);
    const feedback = document.getElementById("city-quiz-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("correct")).toBe(true);
    expect(game.unlockedStamps).toContain("beijing");
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });
});
