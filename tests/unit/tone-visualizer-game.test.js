import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/tone-visualizer-game.js";

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
    <div id="tone-visualizer">
      <div id="tone-selector-pills">
        <button class="tone-pill-btn active" data-tone="1"></button>
        <button class="tone-pill-btn" data-tone="2"></button>
        <button class="tone-pill-btn" data-tone="3"></button>
        <button class="tone-pill-btn" data-tone="4"></button>
        <button class="tone-pill-btn" data-tone="0"></button>
      </div>

      <span id="vis-tone-title"></span>
      <span id="vis-pinyin-display"></span>
      <p id="tone-rule-desc"></p>
      <div id="tone-freq-badge"></div>

      <canvas id="pitch-graph-canvas" width="600" height="280"></canvas>

      <button id="tone-play-audio-btn"></button>
      <button id="tone-slow-audio-btn"></button>
      <button id="tone-record-btn">
        <span id="tone-record-label">Practicar Entonación</span>
      </button>

      <div id="tone-feedback-banner" style="display: none;">
        <div id="feedback-score-circle"></div>
        <h4 id="feedback-heading"></h4>
        <p id="feedback-desc"></p>
      </div>

      <div id="minimal-pairs-list"></div>
    </div>
  `;
};

describe("ToneVisualizerGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.ToneVisualizerGame(app);
  });

  test("initializes correctly with 1st tone as default", () => {
    game.init();
    expect(game.currentTone).toBe(1);
    expect(document.getElementById("vis-tone-title").textContent).toContain("1º Tono");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("mā");
    expect(document.querySelectorAll(".pair-row-card").length).toBe(4);
  });

  test("switches tones when selector pill is clicked", () => {
    game.init();
    const pills = document.querySelectorAll(".tone-pill-btn");

    // Click 3rd tone (index 2)
    pills[2].click();
    expect(game.currentTone).toBe(3);
    expect(document.getElementById("vis-tone-title").textContent).toContain("3º Tono");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("mǎ");

    // Click 4th tone (index 3)
    pills[3].click();
    expect(game.currentTone).toBe(4);
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("mà");
  });

  test("plays model audio on button click", () => {
    game.init();
    const playBtn = document.getElementById("tone-play-audio-btn");
    playBtn.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalledWith("妈");
  });

  test("plays audio when minimal pair item is clicked", () => {
    game.init();
    const pairItem = document.querySelector(".pair-item-left");
    pairItem.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalledWith("买");
  });
});
