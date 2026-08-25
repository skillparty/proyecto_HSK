import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/chinese-names-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
  },
  achievementManager: {
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="chinese-names">
      <input id="western-name-input" value="Alejandro" />
      <select id="name-gender-select">
        <option value="male" selected></option>
        <option value="female"></option>
        <option value="neutral"></option>
      </select>
      <select id="name-trait-select">
        <option value="wisdom" selected></option>
        <option value="bravery"></option>
        <option value="elegance"></option>
        <option value="peace"></option>
        <option value="nature"></option>
      </select>
      <select id="name-element-select">
        <option value="wood" selected></option>
        <option value="fire"></option>
        <option value="earth"></option>
        <option value="metal"></option>
        <option value="water"></option>
      </select>

      <button id="generate-name-btn"></button>

      <div id="res-chinese-hanzi"></div>
      <div id="res-chinese-pinyin"></div>
      <div id="res-chinese-literal"></div>
      <div id="characters-breakdown-grid"></div>

      <button id="play-name-audio-btn"></button>
      <button id="copy-name-btn"></button>

      <div id="surnames-catalog-grid"></div>
    </div>
  `;
};

describe("ChineseNamesGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.ChineseNamesGame(app);
  });

  test("initializes correctly and generates default name for Alejandro", () => {
    game.init();
    expect(game.currentGeneratedName).not.toBeNull();
    expect(document.getElementById("res-chinese-hanzi").textContent.length).toBeGreaterThanOrEqual(2);
    expect(document.querySelectorAll(".char-breakdown-card").length).toBe(3);
    expect(document.querySelectorAll(".surname-chip-card").length).toBe(12);
  });

  test("switches gender to female and generates appropriate name", () => {
    game.init();
    const genderSelect = document.getElementById("name-gender-select");
    genderSelect.value = "female";

    game.generateChineseName();
    expect(document.getElementById("res-chinese-hanzi").textContent).toContain("兰");
    expect(document.getElementById("res-chinese-pinyin").textContent).toContain("Yǎlán");
  });

  test("plays pronunciation audio on button click", () => {
    game.init();
    const playBtn = document.getElementById("play-name-audio-btn");
    playBtn.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalled();
  });

  test("plays surname audio when chip is clicked", () => {
    game.init();
    const surnameCard = document.querySelector(".surname-chip-card");
    surnameCard.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalled();
  });
});
