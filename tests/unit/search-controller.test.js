import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/search-controller.js";

const stubApp = () => ({
  vocabulary: [
    { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
    { character: "谢谢", pinyin: "xièxie", english: "thank you", spanish: "gracias", level: 1 },
    { character: "学习", pinyin: "xuéxí", english: "to study", spanish: "estudiar", level: 1 },
  ],
  currentLanguage: "es",
  switchTab: vi.fn(),
  updateCard: vi.fn(),
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  themeController: { toggleTheme: vi.fn() },
  audioController: { toggleAudio: vi.fn(), playAudio: vi.fn() },
});

describe("SearchController & Command Palette", () => {
  let app;
  let controller;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="header-search-container">
        <input id="header-search" type="text" />
      </div>
    `;
    app = stubApp();
    controller = new window.SearchController(app);
  });

  test("performHeaderSearch filters vocabulary and displays dropdown", () => {
    vi.useFakeTimers();
    controller.performHeaderSearch("hola");
    vi.advanceTimersByTime(250);

    const dropdown = document.getElementById("header-search-dropdown");
    expect(dropdown).not.toBeNull();
    expect(dropdown.textContent).toContain("你好");
    vi.useRealTimers();
  });

  test("selectHeaderSearchResult switches to practice tab and sets currentWord", () => {
    const word = { character: "你好", pinyin: "nǐ hǎo" };
    controller.selectHeaderSearchResult(word);

    expect(app.switchTab).toHaveBeenCalledWith("practice");
    expect(app.currentWord).toBe(word);
    expect(app.isFlipped).toBe(false);
    expect(app.updateCard).toHaveBeenCalled();
  });

  test("openCommandPalette renders modal and focuses input", () => {
    controller.openCommandPalette();
    expect(controller.isPaletteOpen).toBe(true);

    const backdrop = document.getElementById("cmd-palette-backdrop");
    expect(backdrop).not.toBeNull();
    expect(backdrop.classList.contains("open")).toBe(true);
  });

  test("closeCommandPalette hides modal", () => {
    controller.openCommandPalette();
    controller.closeCommandPalette();
    expect(controller.isPaletteOpen).toBe(false);

    const backdrop = document.getElementById("cmd-palette-backdrop");
    expect(backdrop.classList.contains("open")).toBe(false);
  });

  test("performPaletteSearch searches across vocabulary, tabs and actions", () => {
    controller.openCommandPalette();
    controller.performPaletteSearch("quiz");

    expect(controller.paletteItems.some((i) => i.id === "quiz")).toBe(true);
  });

  test("handlePaletteKeyDown navigates and executes items with Enter", () => {
    controller.openCommandPalette();
    controller.performPaletteSearch("");

    const initialIndex = controller.selectedIndex;
    controller.handlePaletteKeyDown({ key: "ArrowDown", preventDefault: vi.fn() });
    expect(controller.selectedIndex).toBe(initialIndex + 1);

    const targetItem = controller.paletteItems[controller.selectedIndex];
    const execSpy = vi.fn();
    targetItem.execute = execSpy;

    controller.handlePaletteKeyDown({ key: "Enter", preventDefault: vi.fn() });
    expect(execSpy).toHaveBeenCalled();
    expect(controller.isPaletteOpen).toBe(false);
  });
});
