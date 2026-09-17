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
      <div id="tone-mode-switcher">
        <button id="tone-tab-mono" class="tone-mode-tab-btn active" data-mode="mono"></button>
        <button id="tone-tab-bisyllabic" class="tone-mode-tab-btn" data-mode="bisyllabic"></button>
      </div>

      <div id="mono-controls-panel">
        <div id="tone-selector-pills">
          <button class="tone-pill-btn active" data-tone="1"><span class="tone-pill-char">mā 妈</span></button>
          <button class="tone-pill-btn" data-tone="2"><span class="tone-pill-char">má 麻</span></button>
          <button class="tone-pill-btn" data-tone="3"><span class="tone-pill-char">mǎ 马</span></button>
          <button class="tone-pill-btn" data-tone="4"><span class="tone-pill-char">mà 骂</span></button>
          <button class="tone-pill-btn" data-tone="0"><span class="tone-pill-char">ma 吗</span></button>
        </div>

        <div id="syllable-chips-group">
          <button class="syllable-chip active" data-syllable="ma">ma</button>
          <button class="syllable-chip" data-syllable="ba">ba</button>
          <button class="syllable-chip" data-syllable="da">da</button>
        </div>
      </div>

      <div id="bisyllabic-controls-panel" style="display: none;">
        <div id="word-chips-group">
          <button class="word-chip-btn active" data-word-id="nihao">你好</button>
          <button class="word-chip-btn" data-word-id="zhongguo">中国</button>
        </div>
      </div>

      <span id="vis-tone-title"></span>
      <span id="vis-pinyin-display"></span>
      <div id="tone-canvas-status"></div>
      <p id="tone-rule-desc"></p>
      <div id="tone-freq-badge"></div>

      <canvas id="pitch-graph-canvas" width="600" height="280"></canvas>

      <button id="tone-play-audio-btn"></button>
      <button id="tone-slow-audio-btn"></button>
      <button id="tone-record-btn">
        <span id="tone-record-label">Practicar Entonación</span>
      </button>

      <div class="audio-speed-pills">
        <button class="speed-pill-btn active" data-speed="1.0">1.0x</button>
        <button class="speed-pill-btn" data-speed="0.75">0.75x</button>
      </div>

      <div id="tone-feedback-banner" style="display: none;">
        <div id="feedback-score-circle"></div>
        <h4 id="feedback-heading"></h4>
        <p id="feedback-desc"></p>
        <span id="val-metric-acc"></span>
        <span id="val-metric-height"></span>
        <span id="val-metric-contour"></span>
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

  test("initializes correctly with 1st tone as default and renders 8 minimal pairs", () => {
    game.init();
    expect(game.currentTone).toBe(1);
    expect(game.mode).toBe("mono");
    expect(document.getElementById("vis-tone-title").textContent).toContain("1º Tono");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("mā");
    expect(document.querySelectorAll(".pair-row-card").length).toBe(8);
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

  test("switches base syllable and updates character pill displays", () => {
    game.init();
    const baChip = document.querySelector('.syllable-chip[data-syllable="ba"]');
    baChip.click();

    expect(game.currentSyllable).toBe("ba");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("bā");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("八");

    // 4th tone of 'ba' should be 'bà 爸'
    const tone4Pill = document.querySelector('.tone-pill-btn[data-tone="4"]');
    tone4Pill.click();
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("bà");
    expect(document.getElementById("vis-pinyin-display").textContent).toContain("爸");
  });

  test("switches between monosyllabic and bisyllabic mode", () => {
    game.init();
    const bisyllabicBtn = document.getElementById("tone-tab-bisyllabic");
    bisyllabicBtn.click();

    expect(game.mode).toBe("bisyllabic");
    expect(document.getElementById("mono-controls-panel").style.display).toBe("none");
    expect(document.getElementById("bisyllabic-controls-panel").style.display).toBe("block");
    expect(document.getElementById("vis-tone-title").textContent).toContain("你好");

    // Switch word to zhongguo
    const zgBtn = document.querySelector('.word-chip-btn[data-word-id="zhongguo"]');
    zgBtn.click();
    expect(game.currentWordId).toBe("zhongguo");
    expect(document.getElementById("vis-tone-title").textContent).toContain("中国");
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

  test("detectFundamentalFrequency detects silence and unvoiced audio", () => {
    const silentBuffer = new Float32Array(2048); // all zeros
    const hz = game.detectFundamentalFrequency(silentBuffer, 44100);
    expect(hz).toBe(-1);
  });

  test("smoothPitchPoints applies moving average correctly", () => {
    const raw = [
      { x: 0.1, y: 3.0 },
      { x: 0.5, y: 5.0 },
      { x: 0.9, y: 1.0 },
    ];
    const smoothed = game.smoothPitchPoints(raw);
    expect(smoothed[0].y).toBe(3.0);
    expect(smoothed[1].y).toBeCloseTo(3.0, 1); // (3+5+1)/3 = 3.0
    expect(smoothed[2].y).toBe(1.0);
  });

  test("toggles practice mode and executes simulation feedback", () => {
    vi.useFakeTimers();
    game.init();

    game.togglePractice();
    expect(game.isPracticing).toBe(true);

    vi.advanceTimersByTime(1200);

    expect(game.isPracticing).toBe(false);
    expect(document.getElementById("tone-feedback-banner").style.display).toBe("flex");
    expect(app.audioController.playCorrect).toHaveBeenCalled();

    vi.useRealTimers();
  });

  test("keyboard shortcuts handle tone switching and space play", () => {
    game.init();
    const playSpy = vi.spyOn(game, "playModelAudio");

    // Press key '2'
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" }));
    expect(game.currentTone).toBe(2);

    // Press 'Space'
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(playSpy).toHaveBeenCalled();
  });
});
