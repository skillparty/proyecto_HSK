import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/utils/html.js";
import "../../assets/js/calligraphy-scroll-game.js";

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playWordAudio: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="calligraphy-scroll">
      <select id="scroll-preset-select">
        <option value="quiet-night" selected></option>
        <option value="spring-dawn"></option>
        <option value="stork-tower"></option>
        <option value="thousand-miles"></option>
        <option value="water-stone"></option>
        <option value="custom"></option>
      </select>

      <div id="scroll-custom-inputs" style="display: none;">
        <input id="scroll-custom-title" value="《学无止境》" />
        <textarea id="scroll-custom-content">书山有路勤为径
学海无涯苦作舟</textarea>
      </div>

      <select id="scroll-font-style">
        <option value="kaishu" selected></option>
        <option value="xingshu"></option>
        <option value="zhuanshu"></option>
      </select>

      <select id="scroll-silk-theme">
        <option value="imperial-gold" selected></option>
        <option value="celadon-jade"></option>
        <option value="crimson-silk"></option>
        <option value="ink-sapphire"></option>
      </select>

      <input id="scroll-seal-author" value="孔夫子门生" />

      <button id="scroll-read-aloud-btn"></button>
      <button id="scroll-print-btn"></button>

      <div id="scroll-silk-mount" class="scroll-silk-mount theme-imperial-gold">
        <div id="scroll-poem-title"></div>
        <div id="scroll-poem-author"></div>
        <div id="scroll-calligraphy-body" class="scroll-calligraphy-body font-kaishu"></div>
        <div id="scroll-vermilion-chop"></div>
      </div>
    </div>
  `;
};

describe("CalligraphyScrollGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.CalligraphyScrollGame(app);
  });

  test("initializes correctly and loads default poem (Quiet Night Thoughts)", () => {
    game.init();
    expect(game.currentPresetKey).toBe("quiet-night");
    expect(document.getElementById("scroll-poem-title").textContent).toContain("静夜思");
    expect(document.getElementById("scroll-poem-author").textContent).toContain("李白");
    expect(document.querySelectorAll(".scroll-column").length).toBe(4);
  });

  test("switches poem presets when selector changes", () => {
    game.init();
    const select = document.getElementById("scroll-preset-select");

    // Switch to Spring Dawn
    select.value = "spring-dawn";
    select.dispatchEvent(new Event("change"));

    expect(game.currentPresetKey).toBe("spring-dawn");
    expect(document.getElementById("scroll-poem-title").textContent).toContain("春晓");
    expect(document.getElementById("scroll-poem-author").textContent).toContain("孟浩然");
  });

  test("switches silk mounting theme and font style", () => {
    game.init();
    const themeSelect = document.getElementById("scroll-silk-theme");
    themeSelect.value = "celadon-jade";
    themeSelect.dispatchEvent(new Event("change"));

    expect(game.currentSilkTheme).toBe("celadon-jade");
    expect(document.getElementById("scroll-silk-mount").className).toContain("theme-celadon-jade");

    const fontSelect = document.getElementById("scroll-font-style");
    fontSelect.value = "xingshu";
    fontSelect.dispatchEvent(new Event("change"));

    expect(game.currentFont).toBe("xingshu");
    expect(document.getElementById("scroll-calligraphy-body").className).toContain("font-xingshu");
  });

  test("recites poem via audio synthesizer", () => {
    game.init();
    const reciteBtn = document.getElementById("scroll-read-aloud-btn");
    reciteBtn.click();

    expect(app.audioController.playWordAudio).toHaveBeenCalled();
  });
});
