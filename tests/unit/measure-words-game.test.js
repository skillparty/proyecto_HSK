import { beforeEach, describe, expect, test, vi } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import "../../assets/js/utils/html.js";
import "../../assets/js/measure-words-game.js";

const dataset = JSON.parse(
  readFileSync(join(process.cwd(), "assets/data/measure-words-sentences.json"), "utf-8")
);

const stubApp = () => ({
  currentLanguage: "es",
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  showToast: vi.fn(),
  audioController: {
    playAudio: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
  },
  achievementManager: {
    unlock: vi.fn(),
    fireConfetti: vi.fn(),
  },
});

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="measure-words" class="tab-panel active" data-tab="measure-words">
      <div id="mw-streak-count">0</div>
      <div id="mw-score-count">0</div>
      <div id="mw-total-count">0</div>
      <div id="mw-accuracy-rate">0%</div>

      <button id="mw-tab-btn-challenge" class="active"></button>
      <button id="mw-tab-btn-dictionary"></button>

      <section id="mw-view-challenge" style="display: block;">
        <select id="mw-level-filter">
          <option value="all">All</option>
          <option value="1">HSK 1</option>
          <option value="2">HSK 2</option>
          <option value="3">HSK 3</option>
        </select>
        <select id="mw-category-filter">
          <option value="all">All</option>
          <option value="publications">Publications</option>
          <option value="animals">Animals</option>
          <option value="clothes">Clothes</option>
        </select>

        <button id="mw-toggle-pinyin" class="active"></button>
        <button id="mw-toggle-translation" class="active"></button>
        <button id="mw-audio-sentence-btn"></button>

        <span id="mw-badge-hsk"></span>
        <span id="mw-badge-cat"></span>
        <span id="mw-question-counter"></span>

        <div id="mw-pinyin-line"></div>
        <span id="mw-part-before"></span>
        <span id="mw-cloze-target"><span id="mw-target-char">?</span></span>
        <span id="mw-part-after"></span>
        <div id="mw-translation-line"></div>

        <div id="mw-options-grid"></div>

        <div id="mw-feedback-panel" style="display: none;">
          <div id="mw-feedback-status"></div>
          <div id="mw-feedback-text"></div>
          <button id="mw-replay-audio-btn"></button>
          <button id="mw-next-btn"></button>
        </div>
      </section>

      <section id="mw-view-dictionary" style="display: none;">
        <input type="text" id="mw-dict-search" />
        <div id="mw-dict-chips"></div>
        <div id="mw-dictionary-grid"></div>
      </section>
    </div>
  `;
};

describe("MeasureWordsGame", () => {
  let app;
  let game;

  beforeEach(() => {
    setupDOM();
    app = stubApp();
    game = new window.MeasureWordsGame(app);
    // Inject dataset directly for predictable tests
    game.data = dataset;
    game.quantifiers = dataset.quantifiers;
    game.sentences = dataset.sentences;
  });

  test("initializes correctly and loads first sentence", async () => {
    // Mock fetch for init
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });

    await game.init();

    expect(game.currentSentence).toBeDefined();
    expect(game.currentSentence.id).toBe("sent-01");
    expect(document.getElementById("mw-part-before").textContent).toBe("我买了一");
    expect(document.getElementById("mw-target-char").textContent).toBe("?");
    expect(document.getElementById("mw-part-after").textContent).toBe("新汉语词典。");

    const optionCards = document.querySelectorAll(".mw-option-card");
    expect(optionCards.length).toBe(4);
  });

  test("handles correct option selection properly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const targetChar = game.currentSentence.targetClassifier;
    const correctBtn = Array.from(document.querySelectorAll(".mw-option-card")).find(
      (btn) => btn.getAttribute("data-option") === targetChar
    );

    expect(correctBtn).toBeDefined();
    correctBtn.click();

    expect(game.hasAnsweredCurrent).toBe(true);
    expect(game.score).toBe(1);
    expect(game.streak).toBe(1);
    expect(app.audioController.playCorrect).toHaveBeenCalled();

    const clozeTarget = document.getElementById("mw-cloze-target");
    expect(clozeTarget.classList.contains("filled-correct")).toBe(true);
    expect(document.getElementById("mw-target-char").textContent).toBe(targetChar);

    const feedbackPanel = document.getElementById("mw-feedback-panel");
    expect(feedbackPanel.style.display).toBe("block");
    expect(feedbackPanel.classList.contains("success")).toBe(true);
  });

  test("handles incorrect option selection properly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const targetChar = game.currentSentence.targetClassifier;
    const wrongBtn = Array.from(document.querySelectorAll(".mw-option-card")).find(
      (btn) => btn.getAttribute("data-option") !== targetChar
    );

    expect(wrongBtn).toBeDefined();
    wrongBtn.click();

    expect(game.hasAnsweredCurrent).toBe(true);
    expect(game.score).toBe(0);
    expect(game.streak).toBe(0);
    expect(app.audioController.playIncorrect).toHaveBeenCalled();

    const clozeTarget = document.getElementById("mw-cloze-target");
    expect(clozeTarget.classList.contains("filled-incorrect")).toBe(true);

    const feedbackPanel = document.getElementById("mw-feedback-panel");
    expect(feedbackPanel.style.display).toBe("block");
    expect(feedbackPanel.classList.contains("error")).toBe(true);
  });

  test("advances to next question when clicking nextBtn", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const initialId = game.currentSentence.id;
    game.nextQuestion();

    expect(game.currentSentence.id).not.toBe(initialId);
    expect(game.currentIndex).toBe(1);
    expect(game.hasAnsweredCurrent).toBe(false);
  });

  test("toggles pinyin and translation visibility", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const pinyinToggle = document.getElementById("mw-toggle-pinyin");
    const pinyinLine = document.getElementById("mw-pinyin-line");
    pinyinToggle.click();
    expect(pinyinLine.classList.contains("hidden-pinyin")).toBe(true);

    const transToggle = document.getElementById("mw-toggle-translation");
    const transLine = document.getElementById("mw-translation-line");
    transToggle.click();
    expect(transLine.classList.contains("hidden-trans")).toBe(true);
  });

  test("filters sentences by HSK level", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const levelSelect = document.getElementById("mw-level-filter");
    levelSelect.value = "2";
    levelSelect.dispatchEvent(new Event("change"));

    expect(game.levelFilter).toBe("2");
    expect(game.filteredSentences.every((s) => s.hsk === 2)).toBe(true);
  });

  test("switches between Challenge and Dictionary views", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const dictTabBtn = document.getElementById("mw-tab-btn-dictionary");
    dictTabBtn.click();

    expect(game.currentView).toBe("dictionary");
    expect(document.getElementById("mw-view-dictionary").style.display).toBe("block");
    expect(document.getElementById("mw-view-challenge").style.display).toBe("none");

    const cards = document.querySelectorAll(".mw-dict-card");
    expect(cards.length).toBeGreaterThanOrEqual(15);
  });

  test("dictionary search filters cards dynamically", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    const searchInput = document.getElementById("mw-dict-search");
    searchInput.value = "ben";
    searchInput.dispatchEvent(new Event("input"));

    const cards = document.querySelectorAll(".mw-dict-card");
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain("本");
  });

  test("clicking practice button on dictionary card filters challenge mode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    game.switchView("dictionary");
    const practiceBtn = document.querySelector(".mw-practice-filter-btn[data-qid='ben']");
    expect(practiceBtn).toBeDefined();
    practiceBtn.click();

    expect(game.currentView).toBe("challenge");
    expect(game.specificClassifierFilter).toBe("ben");
    expect(game.currentSentence.targetClassifier).toBe("本");
  });

  test("keyboard shortcuts 1-4 and Enter trigger option selection and next question", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dataset,
    });
    await game.init();

    // Trigger keydown "1"
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    expect(game.hasAnsweredCurrent).toBe(true);

    // Trigger keydown "Enter" for next question
    const prevIndex = game.currentIndex;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(game.currentIndex).toBe(prevIndex + 1);
  });
});

describe("Measure Words Dataset Integrity", () => {
  test("contains at least 15 quantifiers with all required localized fields", () => {
    expect(dataset.quantifiers.length).toBeGreaterThanOrEqual(15);
    dataset.quantifiers.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.hanzi).toBeDefined();
      expect(q.pinyin).toBeDefined();
      expect(q.es).toBeDefined();
      expect(q.en).toBeDefined();
      expect(Array.isArray(q.commonNouns)).toBe(true);
      expect(q.commonNouns.length).toBeGreaterThanOrEqual(2);
    });
  });

  test("contains at least 25 cloze challenge sentences spanning HSK 1, 2, and 3", () => {
    expect(dataset.sentences.length).toBeGreaterThanOrEqual(25);
    const levels = new Set(dataset.sentences.map((s) => s.hsk));
    expect(levels.has(1)).toBe(true);
    expect(levels.has(2)).toBe(true);
    expect(levels.has(3)).toBe(true);

    dataset.sentences.forEach((s) => {
      expect(s.id).toBeDefined();
      expect(s.sentenceBefore).toBeDefined();
      expect(s.sentenceAfter).toBeDefined();
      expect(s.targetClassifier).toBeDefined();
      expect(s.fullSentence).toContain(s.targetClassifier);
      expect(s.options).toContain(s.targetClassifier);
      expect(s.options.length).toBe(4);
      expect(s.translations.es).toBeDefined();
      expect(s.translations.en).toBeDefined();
      expect(s.explanation.es).toBeDefined();
      expect(s.explanation.en).toBeDefined();
    });
  });
});
