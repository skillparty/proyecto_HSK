import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/lyrics-lab-game.js";

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
    <div id="lyrics-lab">
      <div id="lyrics-song-chips"></div>

      <span id="song-hero-icon"></span>
      <h3 id="song-hero-title"></h3>
      <p id="song-hero-desc"></p>
      <span id="song-hsk-level"></span>
      <span id="song-tempo-tag"></span>

      <button id="lyrics-play-all-btn">
        <span id="lyrics-play-icon">▶️</span>
        <span id="lyrics-play-label">Cantar Canción</span>
      </button>
      <button class="lyrics-speed-btn" data-speed="0.75"></button>
      <button class="lyrics-speed-btn active" data-speed="1.0"></button>
      <button class="lyrics-speed-btn" data-speed="1.25"></button>
      <button id="lyrics-toggle-pinyin-btn">Pinyin: ON</button>

      <div id="lyrics-lines-feed"></div>
      <div id="song-vocab-list"></div>

      <div id="scramble-slots"></div>
      <div id="scramble-options"></div>
      <div id="scramble-feedback" style="display: none;"></div>
    </div>
  `;
};

describe("LyricsLabGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.LyricsLabGame(app);
  });

  test("initializes correctly and loads default song", () => {
    game.init();
    expect(game.currentSong.id).toBe("two-tigers");
    expect(document.getElementById("song-hero-title").textContent).toContain("两只老虎");
    expect(document.querySelectorAll(".lyric-line-card").length).toBe(5);
    expect(document.querySelectorAll(".vocab-note-item").length).toBe(6);
  });

  test("switches songs when chip is clicked", () => {
    game.init();
    const chips = document.querySelectorAll(".song-chip-btn");
    expect(chips.length).toBe(4);

    // Switch to Jasmine Flower (index 3)
    chips[3].click();
    expect(game.currentSong.id).toBe("jasmine-flower");
    expect(document.getElementById("song-hero-title").textContent).toContain("茉莉花");
    expect(document.querySelectorAll(".lyric-line-card").length).toBe(3);
  });

  test("toggles pinyin visibility", () => {
    game.init();
    expect(game.showPinyin).toBe(true);
    expect(document.querySelectorAll(".lyric-pinyin").length).toBe(5);

    document.getElementById("lyrics-toggle-pinyin-btn").click();
    expect(game.showPinyin).toBe(false);
    expect(document.querySelectorAll(".lyric-pinyin").length).toBe(0);
  });

  test("handles lyric scramble challenge correctly", () => {
    game.init();
    const correctLines = game.currentSong.lines.map((l) => l.hanzi);

    // Click all lines in the exact correct order
    correctLines.forEach((text) => {
      game.handleScramblePick(text);
    });

    const feedback = document.getElementById("scramble-feedback");
    expect(feedback.style.display).toBe("block");
    expect(feedback.classList.contains("correct")).toBe(true);
    expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
  });
});
