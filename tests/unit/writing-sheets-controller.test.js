import { describe, it, expect, beforeEach, vi } from "vitest";
import "../../assets/js/modules/writing-sheets-controller.js";

describe("WritingSheetsController", () => {
  let controller;
  let mockApp;
  let mockVocab;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="writing-sheets" class="tab-panel">
        <button id="ws-presets-btn"></button>
        <button id="ws-print-btn"></button>
        <button id="ws-toolbar-print-btn"></button>

        <div class="ws-source-tabs">
          <button class="ws-source-tab is-active" data-source="text"></button>
          <button class="ws-source-tab" data-source="hsk"></button>
          <button class="ws-source-tab" data-source="etymology"></button>
        </div>

        <div id="ws-source-panel-text" class="ws-source-panel is-active">
          <textarea id="ws-custom-input"></textarea>
          <button class="ws-preset-btn" data-preset="greetings"></button>
          <button class="ws-preset-btn" data-preset="yong"></button>
          <button class="ws-preset-btn" data-preset="numbers"></button>
        </div>

        <div id="ws-source-panel-hsk" class="ws-source-panel">
          <select id="ws-hsk-select"><option value="1">1</option></select>
          <select id="ws-hsk-count-select"><option value="5">5</option></select>
          <button id="ws-load-hsk-btn"></button>
        </div>

        <div id="ws-source-panel-etymology" class="ws-source-panel">
          <select id="ws-etym-lesson-select"><option value="A-1">A-1</option></select>
          <button id="ws-load-etym-btn"></button>
        </div>

        <span id="ws-char-count-text"></span>
        <button id="ws-clear-chars-btn"></button>
        <div id="ws-selected-chips"></div>

        <div id="ws-grid-type-group">
          <div class="ws-option-card is-selected" data-grid="tianzige"></div>
          <div class="ws-option-card" data-grid="mige"></div>
          <div class="ws-option-card" data-grid="huizige"></div>
          <div class="ws-option-card" data-grid="jiugongge"></div>
          <div class="ws-option-card" data-grid="pingzige"></div>
        </div>

        <div id="ws-practice-mode-group">
          <div class="ws-mode-card is-selected" data-mode="stroke-by-stroke"></div>
          <div class="ws-mode-card" data-mode="tracing"></div>
          <div class="ws-mode-card" data-mode="model-blank"></div>
        </div>

        <select id="ws-size-select">
          <option value="large">L</option>
          <option value="medium" selected>M</option>
          <option value="small">S</option>
        </select>

        <select id="ws-slots-select">
          <option value="auto">Auto</option>
          <option value="6">6</option>
          <option value="8" selected>8</option>
        </select>

        <div id="ws-color-swatches">
          <button class="ws-color-swatch is-selected" data-color="#dc2626"></button>
          <button class="ws-color-swatch" data-color="#64748b"></button>
          <button class="ws-color-swatch" data-color="#059669"></button>
        </div>

        <input type="text" id="ws-title-input" value="Práctica de Caligrafía China" />
        <input type="checkbox" id="ws-toggle-pinyin" checked />
        <input type="checkbox" id="ws-toggle-meaning" checked />
        <input type="checkbox" id="ws-toggle-pinyin-lines" />
        <input type="checkbox" id="ws-toggle-student-header" checked />

        <span id="ws-page-count-badge"></span>
        <div id="ws-preview-pages"></div>
      </div>
    `;

    mockVocab = [
      { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
      { character: "谢谢", pinyin: "xiè xie", english: "thank you", spanish: "gracias", level: 1 },
      { character: "再见", pinyin: "zài jiàn", english: "goodbye", spanish: "adiós", level: 1 },
      { character: "人", pinyin: "rén", english: "person", spanish: "persona", level: 1 },
      { character: "大", pinyin: "dà", english: "big", spanish: "grande", level: 1 }
    ];

    mockApp = {
      vocabulary: [...mockVocab],
      currentLanguage: "es",
      showNotification: vi.fn()
    };

    controller = new window.WritingSheetsController(mockApp);
  });

  describe("Initialization and character loading", () => {
    it("initializes and binds controls", async () => {
      await controller.initialize();
      expect(controller.isInitialized).toBe(true);
      expect(controller.state.characters.length).toBeGreaterThan(0);

      const previewContainer = document.getElementById("ws-preview-pages");
      expect(previewContainer.children.length).toBeGreaterThan(0);
    });

    it("loads characters from arbitrary text ignoring non-CJK", async () => {
      await controller.loadCharactersFromText("Hello 你好 123 谢谢! ¡Hola!");
      expect(controller.state.characters.map(c => c.hanzi)).toEqual(["你", "好", "谢"]);
    });

    it("loads preset characters", async () => {
      await controller.loadPreset("yong");
      expect(controller.state.characters.map(c => c.hanzi)).toEqual(["永"]);
    });

    it("loads characters from HSK vocabulary", async () => {
      await controller.loadFromHskLevel(1, 4);
      expect(controller.state.characters.length).toBeGreaterThanOrEqual(2);
      expect(controller.state.characters[0].pinyin).toBeTruthy();
    });

    it("loads characters from Etymology lesson", async () => {
      await controller.loadFromEtymologyLesson("A-1");
      expect(controller.state.characters.map(c => c.hanzi)).toEqual(["人", "大", "女", "子"]);
    });
  });

  describe("Grid SVG generators", () => {
    it("generates Tianzige grid SVG with cross guidelines", () => {
      const svg = controller.renderGridSvg("tianzige", "#dc2626");
      expect(svg).toContain("ws-grid-svg");
      expect(svg).toContain("stroke-dasharray");
      expect(svg).toContain("color: #dc2626");
    });

    it("generates Mige grid SVG with star diagonal guidelines", () => {
      const svg = controller.renderGridSvg("mige", "#059669");
      expect(svg).toContain("ws-grid-svg");
      expect(svg).toContain("line x1=");
    });

    it("generates Huizige grid SVG with inner square", () => {
      const svg = controller.renderGridSvg("huizige", "#64748b");
      expect(svg).toContain("ws-grid-svg");
      expect(svg).toContain("rect x=");
    });

    it("generates Jiugongge grid SVG with 3x3 lines", () => {
      const svg = controller.renderGridSvg("jiugongge", "#2563eb");
      expect(svg).toContain("ws-grid-svg");
      expect(svg).toContain("33.33");
    });

    it("generates Pingzige clean frame", () => {
      const svg = controller.renderGridSvg("pingzige", "#dc2626");
      expect(svg).toContain("ws-grid-svg");
      expect(svg).not.toContain("stroke-dasharray");
    });
  });

  describe("Practice modes and row rendering", () => {
    it("renders stroke-by-stroke row when stroke data is available", () => {
      const mockItem = {
        hanzi: "人",
        pinyin: "rén",
        meaning: "persona",
        strokes: ["M 10 10 L 20 20 Z", "M 30 30 L 40 40 Z"]
      };

      const rowHtml = controller.renderPracticeRow(mockItem, {
        gridType: "tianzige",
        practiceMode: "stroke-by-stroke",
        gridSize: "medium",
        slotsPerRow: "8",
        gridColor: "#dc2626",
        showPinyin: true,
        showMeaning: true,
        showPinyinLines: true
      });

      expect(rowHtml).toContain("ws-practice-row");
      expect(rowHtml).toContain("rén");
      expect(rowHtml).toContain("persona");
      expect(rowHtml).toContain("ws-stroke-svg");
      expect(rowHtml).toContain("ws-pinyin-guide-box");
    });

    it("renders tracing mode row with faded guide characters", () => {
      const mockItem = {
        hanzi: "好",
        pinyin: "hǎo",
        meaning: "bueno",
        strokes: []
      };

      const rowHtml = controller.renderPracticeRow(mockItem, {
        gridType: "mige",
        practiceMode: "tracing",
        gridSize: "large",
        slotsPerRow: "6",
        gridColor: "#dc2626",
        showPinyin: true,
        showMeaning: false,
        showPinyinLines: false
      });

      expect(rowHtml).toContain("is-faded");
      expect(rowHtml).toContain("好");
    });

    it("renders model-blank mode row with model character and empty slots", () => {
      const mockItem = {
        hanzi: "大",
        pinyin: "dà",
        meaning: "grande",
        strokes: []
      };

      const rowHtml = controller.renderPracticeRow(mockItem, {
        gridType: "huizige",
        practiceMode: "model-blank",
        gridSize: "small",
        slotsPerRow: "10",
        gridColor: "#64748b",
        showPinyin: false,
        showMeaning: false,
        showPinyinLines: false
      });

      expect(rowHtml).toContain("ws-practice-row");
      expect(rowHtml).toContain("size-small");
      expect(rowHtml).toContain("大");
    });

    it("includes radical and stroke count metadata in character items and practice row", async () => {
      await controller.loadCharactersFromText("你好水");
      expect(controller.state.characters[0].radical).toBe("亻");
      expect(controller.state.characters[2].radical).toBe("水");

      const rowHtml = controller.renderPracticeRow(controller.state.characters[0], {
        gridType: "tianzige",
        practiceMode: "model-blank",
        gridSize: "medium",
        slotsPerRow: "8",
        gridColor: "#dc2626",
        showPinyin: true,
        showMeaning: true,
        showPinyinLines: false
      });

      expect(rowHtml).toContain("ws-meta-details");
      expect(rowHtml).toContain("部首");
    });

    it("renders continuous composition grid in composition mode", () => {
      const items = [
        { hanzi: "千", pinyin: "qiān", meaning: "mil", strokes: [], radical: "十", strokeCount: 3 },
        { hanzi: "里", pinyin: "lǐ", meaning: "milla", strokes: [], radical: "里", strokeCount: 7 }
      ];

      const compHtml = controller.renderCompositionGrid(items, {
        gridType: "mige",
        gridSize: "medium",
        gridColor: "#059669",
        showPinyinLines: false
      });

      expect(compHtml).toContain("ws-composition-grid");
      expect(compHtml).toContain("千");
      expect(compHtml).toContain("里");
    });
  });

  describe("Document generation and print dispatch", () => {
    it("generates full A4 HTML printable document with branding outside grid and student header", () => {
      controller.state.characters = [
        { hanzi: "你", pinyin: "nǐ", meaning: "tú", strokes: [] },
        { hanzi: "好", pinyin: "hǎo", meaning: "bueno", strokes: [] }
      ];

      const html = controller.generateFullDocument();
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Confuc10++");
      expect(html).toContain("Estudiante:");
      expect(html).toContain("Fecha:");
      expect(html).toContain("Nota: [ ★★★★★ ]");
      expect(html).toContain("@page");
      expect(html).toContain("Pág. 1 de 1");
    });

    it("dispatches print via hidden iframe without throwing", () => {
      controller.state.characters = [{ hanzi: "永", pinyin: "yǒng", meaning: "eterno", strokes: [] }];
      expect(() => controller.triggerPrint()).not.toThrow();

      const iframe = document.getElementById("writing-sheets-print-frame");
      expect(iframe).toBeTruthy();
    });
  });
});
