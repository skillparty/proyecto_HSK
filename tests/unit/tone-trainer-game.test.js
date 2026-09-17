import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/tone-trainer-game.js";

const stubApp = () => ({
  vocabulary: [
    { character: "汉语", pinyin: "Hànyǔ", spanish: "idioma chino", level: 1 },
    { character: "学校", pinyin: "xuéxiào", spanish: "escuela", level: 1 },
    { character: "朋友", pinyin: "péngyou", spanish: "amigo", level: 1 },
    { character: "医生", pinyin: "yīshēng", spanish: "médico", level: 1 },
  ],
  audioController: {
    playAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playStreakFanfare: vi.fn(),
  },
  logDebug: vi.fn(),
  logWarn: vi.fn(),
});

describe("ToneTrainerGame", () => {
  let app;
  let game;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="tone-trainer">
        <button id="tt-mode-tones-btn" data-mode="tones" class="tt-mode-tab active"></button>
        <button id="tt-mode-tone-pairs-btn" data-mode="tone-pairs" class="tt-mode-tab"></button>
        <button id="tt-mode-pairs-btn" data-mode="pairs" class="tt-mode-tab"></button>
        <button id="tt-mode-vocab-btn" data-mode="vocab" class="tt-mode-tab"></button>
        <button id="tt-mode-challenge-btn" data-mode="challenge" class="tt-mode-tab"></button>

        <div id="tt-level-filter-group" style="display: none;">
          <select id="tt-level-select"><option value="all">All</option></select>
        </div>
        <div id="tt-neutral-toggle-group">
          <input id="tt-include-neutral" type="checkbox" checked />
        </div>

        <div id="tt-challenge-banner" style="display: none;">
          <span id="tt-challenge-countdown">60s</span>
          <div id="tt-challenge-bar-fill"></div>
          <span id="tt-challenge-combo-val">x1</span>
        </div>

        <button id="tt-play-audio-btn"></button>
        <button id="tt-next-btn" style="display: none;"></button>
        <button id="tt-auto-repeat-btn"></button>
        <div id="tt-score-val">0</div>
        <div id="tt-streak-val">0</div>
        <div id="tt-accuracy-val">100%</div>
        <div id="tt-question-prompt"></div>
        <div id="tt-clue-text"></div>

        <div id="tt-tone-options" class="tt-tone-grid">
          <button class="tt-tone-card" data-tone="1"><span id="tt-ex-1"></span></button>
          <button class="tt-tone-card" data-tone="2"><span id="tt-ex-2"></span></button>
          <button class="tt-tone-card" data-tone="3"><span id="tt-ex-3"></span></button>
          <button class="tt-tone-card" data-tone="4"><span id="tt-ex-4"></span></button>
          <button class="tt-tone-card" data-tone="5" id="tt-card-tone-5"><span id="tt-ex-5"></span></button>
        </div>

        <div id="tt-choice-options" style="display: none;"></div>
        <div id="tt-feedback" style="display: none;"></div>

        <div class="tt-reference-card">
          <button id="tt-ref-chao-btn" class="tt-ref-tab active"></button>
          <button id="tt-ref-sandhi-btn" class="tt-ref-tab"></button>
          <div id="tt-ref-chao-panel"></div>
          <div id="tt-ref-sandhi-panel" style="display: none;">
            <button class="tt-play-sandhi-btn" data-audio="你好"></button>
          </div>
        </div>
      </div>
    `;

    app = stubApp();
    game = new window.ToneTrainerGame(app);
  });

  test("initializes game and binds mode buttons", () => {
    game.initialize();
    expect(game.isInitialized).toBe(true);
    expect(game.state.currentQuestion).not.toBeNull();
  });

  test("switchMode toggles between tones, tone-pairs, pairs, vocab, and challenge modes", () => {
    game.initialize();

    game.switchMode("pairs");
    expect(game.state.mode).toBe("pairs");
    expect(document.getElementById("tt-tone-options").style.display).toBe("none");
    expect(document.getElementById("tt-choice-options").style.display).toBe("grid");

    game.switchMode("tone-pairs");
    expect(game.state.mode).toBe("tone-pairs");
    expect(document.getElementById("tt-tone-options").style.display).toBe("none");
    expect(document.getElementById("tt-choice-options").style.display).toBe("grid");
    expect(document.getElementById("tt-level-filter-group").style.display).toBe("flex");

    game.switchMode("vocab");
    expect(game.state.mode).toBe("vocab");

    game.switchMode("challenge");
    expect(game.state.mode).toBe("challenge");
    expect(game.state.challengeActive).toBe(true);
    expect(document.getElementById("tt-challenge-banner").style.display).toBe("flex");
    game.stopChallenge();

    game.switchMode("tones");
    expect(game.state.mode).toBe("tones");
    expect(document.getElementById("tt-tone-options").style.display).toBe("grid");
  });

  test("selectTone correctly evaluates tone selection", () => {
    game.initialize();
    game.state.currentQuestion = {
      audioText: "妈",
      correctAnswer: 1,
      targetPinyin: "mā",
      targetChar: "妈",
    };

    game.selectTone(1);

    expect(game.state.score).toBeGreaterThan(0);
    expect(game.state.streak).toBe(1);
    expect(app.audioController.playCorrect).toHaveBeenCalled();
  });

  test("selectTone evaluates 5th neutral tone selection", () => {
    game.initialize();
    game.state.currentQuestion = {
      audioText: "吗",
      correctAnswer: 5,
      targetPinyin: "ma",
      targetChar: "吗",
    };

    game.selectTone(5);

    expect(game.state.score).toBeGreaterThan(0);
    expect(game.state.streak).toBe(1);
    expect(app.audioController.playCorrect).toHaveBeenCalled();
  });

  test("selectTone penalizes streak on wrong answer", () => {
    game.initialize();
    game.state.streak = 4;
    game.state.currentQuestion = {
      audioText: "妈",
      correctAnswer: 1,
      targetPinyin: "mā",
      targetChar: "妈",
    };

    game.selectTone(2);

    expect(game.state.streak).toBe(0);
    expect(app.audioController.playIncorrect).toHaveBeenCalled();
  });

  test("selectChoice evaluates tone pairs, minimal pairs and vocabulary options", () => {
    game.initialize();
    game.state.mode = "pairs";
    game.state.currentQuestion = {
      audioText: "知道",
      correctAnswer: "zhīdào",
    };

    const mockBtn = document.createElement("button");
    game.selectChoice("zhīdào", mockBtn);

    expect(game.state.score).toBeGreaterThan(0);
    expect(mockBtn.classList.contains("correct")).toBe(true);
  });

  test("generates and plays tone pairs combination questions", () => {
    game.initialize();
    game.switchMode("tone-pairs");

    expect(game.state.currentQuestion).not.toBeNull();
    expect(game.state.currentQuestion.correctAnswer).toBeDefined();

    const choices = document.querySelectorAll(".tt-choice-btn");
    expect(choices.length).toBeGreaterThan(0);

    // Click audio
    game.playAudio();
    expect(app.audioController.playAudio).toHaveBeenCalledWith(game.state.currentQuestion.audioText);
  });

  test("handles challenge mode timer and combo scoring", () => {
    game.initialize();
    game.switchMode("challenge");

    expect(game.state.challengeActive).toBe(true);
    expect(game.state.combo).toBe(1);

    // Correct answer increments combo
    game.state.currentQuestion = {
      audioText: "八",
      correctAnswer: 1,
      targetPinyin: "bā",
      targetChar: "八",
    };

    game.selectTone(1);
    expect(game.state.challengeScore).toBeGreaterThan(0);

    game.stopChallenge();
    expect(game.state.challengeActive).toBe(false);
  });

  test("playAudio calls app audioController with current question text", () => {
    game.initialize();
    game.state.currentQuestion = { audioText: "好" };
    game.playAudio();

    expect(app.audioController.playAudio).toHaveBeenCalledWith("好");
  });

  test("plays sandhi audio on reference card button click", () => {
    game.initialize();
    const sandhiBtn = document.querySelector(".tt-play-sandhi-btn");
    sandhiBtn.click();

    expect(app.audioController.playAudio).toHaveBeenCalledWith("你好");
  });
});
