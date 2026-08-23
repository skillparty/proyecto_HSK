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
        <button id="tt-mode-pairs-btn" data-mode="pairs" class="tt-mode-tab"></button>
        <button id="tt-mode-vocab-btn" data-mode="vocab" class="tt-mode-tab"></button>
        <button id="tt-play-audio-btn"></button>
        <button id="tt-next-btn"></button>
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
        </div>
        <div id="tt-choice-options"></div>
        <div id="tt-feedback"></div>
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

  test("switchMode toggles between tones, pairs and vocab modes", () => {
    game.initialize();

    game.switchMode("pairs");
    expect(game.state.mode).toBe("pairs");
    expect(document.getElementById("tt-tone-options").style.display).toBe("none");
    expect(document.getElementById("tt-choice-options").style.display).toBe("grid");

    game.switchMode("vocab");
    expect(game.state.mode).toBe("vocab");

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

  test("selectChoice evaluates minimal pairs and vocabulary options", () => {
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

  test("playAudio calls app audioController with current question text", () => {
    game.initialize();
    game.state.currentQuestion = { audioText: "好" };
    game.playAudio();

    expect(app.audioController.playAudio).toHaveBeenCalledWith("好");
  });
});
