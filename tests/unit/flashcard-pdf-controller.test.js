import { describe, it, expect, beforeEach, vi } from "vitest";
import "../../assets/js/modules/flashcard-pdf-controller.js";

describe("FlashcardPdfController", () => {
  let controller;
  let mockApp;
  let mockVocab;
  let mockEtymologyLesson;
  let mockEtymologySection;

  beforeEach(() => {
    document.body.innerHTML = "";

    mockVocab = [
      { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1 },
      { character: "谢谢", pinyin: "xiè xie", english: "thank you", spanish: "gracias", level: 1 },
      { character: "再见", pinyin: "zài jiàn", english: "goodbye", spanish: "adiós", level: 1 },
      { character: "苹果", pinyin: "píng guǒ", english: "apple", spanish: "manzana", level: 2 },
      { character: "猫", pinyin: "māo", english: "cat", spanish: "gato", level: 2 },
      { character: "狗", pinyin: "gǒu", english: "dog", spanish: "perro", level: 2 },
      { character: "书", pinyin: "shū", english: "book", spanish: "libro", level: 3 }
    ];

    mockEtymologyLesson = {
      id: "A-1",
      theme: "De las personas",
      chars: [
        { hanzi: "人", pinyin: "rén", meaning: "hombre, persona", etymology: "Pictograma de persona de pie", components: [] },
        { hanzi: "大", pinyin: "dà", meaning: "grande", etymology: "Persona con brazos extendidos", components: [{ char: "人", gloss: "persona" }] }
      ]
    };

    mockEtymologySection = {
      section: "A",
      title: "Sección A · Pictográficos",
      lessons: [mockEtymologyLesson]
    };

    mockApp = {
      vocabulary: [...mockVocab],
      currentLanguage: "es",
      getMeaningForLanguage: (w) => w.spanish || w.english,
      getTonesFromPinyin: (_p) => [1, 2],
      getTranslation: (k, r) => k + (r ? JSON.stringify(r) : ""),
      showNotification: vi.fn()
    };

    controller = new window.FlashcardPdfController(mockApp);
  });

  describe("Modal rendering & lifecycle", () => {
    it("renders the PDF export modal with Browse configuration", () => {
      controller.openModal({
        source: "browse",
        vocabulary: mockVocab,
        filteredVocabulary: mockVocab.slice(0, 3),
        selectedItems: new Set(["你好"]),
        currentLevel: 1
      });

      const modal = document.getElementById("pdf-export-modal");
      expect(modal).toBeTruthy();

      const title = modal.querySelector(".pdf-modal-title");
      expect(title.textContent).toBeTruthy();

      const options = controller.getSelectedOptions();
      expect(options.scope).toBe("selected");
    });

    it("renders the PDF export modal with Etymology configuration", () => {
      controller.openModal({
        source: "etymology",
        currentLesson: mockEtymologyLesson,
        currentSection: mockEtymologySection,
        selectedItems: new Set()
      });

      const modal = document.getElementById("pdf-export-modal");
      expect(modal).toBeTruthy();

      const options = controller.getSelectedOptions();
      expect(options.scope).toBe("lesson");

      const etymFormatCard = modal.querySelector("#pdf-format-card-etymology");
      expect(etymFormatCard).toBeTruthy();
    });

    it("closes modal properly", () => {
      controller.openModal({
        source: "browse",
        vocabulary: mockVocab,
        selectedItems: new Set()
      });

      expect(document.getElementById("pdf-export-modal")).toBeTruthy();
      controller.closeModal();

      // Should remove is-open immediately
      const modal = document.getElementById("pdf-export-modal");
      if (modal) {
        expect(modal.classList.contains("is-open")).toBe(false);
      }
    });
  });

  describe("Item resolution based on scope", () => {
    it("resolves items for current level in Browse", () => {
      const config = {
        source: "browse",
        vocabulary: mockVocab,
        currentLevel: 1,
        selectedItems: new Set()
      };
      const items = controller.resolveItems(config, "level", 1);
      expect(items.length).toBe(3);
      expect(items.map(i => i.character)).toEqual(["你好", "谢谢", "再见"]);
    });

    it("resolves items for custom chosen level", () => {
      const config = {
        source: "browse",
        vocabulary: mockVocab,
        selectedItems: new Set()
      };
      const items = controller.resolveItems(config, "custom-level", 2);
      expect(items.length).toBe(3);
      expect(items.map(i => i.character)).toEqual(["苹果", "猫", "狗"]);
    });

    it("resolves manually selected words", () => {
      const config = {
        source: "browse",
        vocabulary: mockVocab,
        selectedItems: new Set(["你好", "猫"])
      };
      const items = controller.resolveItems(config, "selected", null);
      expect(items.length).toBe(2);
      expect(items.map(i => i.character)).toEqual(["你好", "猫"]);
    });

    it("resolves etymology lesson characters", () => {
      const config = {
        source: "etymology",
        currentLesson: mockEtymologyLesson,
        selectedItems: new Set()
      };
      const items = controller.resolveItems(config, "lesson", null);
      expect(items.length).toBe(2);
      expect(items.map(i => i.hanzi)).toEqual(["人", "大"]);
    });
  });

  describe("Full document generation", () => {
    it("generates HTML document for Flashcards format with Tianzige & dashed cut lines", () => {
      const html = controller.generateFullDocument(mockVocab.slice(0, 4), {
        format: "flashcards",
        density: 6,
        lang: "es",
        title: "HSK 1 Test"
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("HSK 1 Test");
      expect(html).toContain("flashcard-cutout");
      expect(html).toContain("tianzige-box");
      expect(html).toContain("你");
      expect(html).toContain("好");
      expect(html).toContain("nǐ hǎo");
      expect(html).toContain("hola");
      expect(html).toContain("cut-guide-corner");
      expect(html).toContain("@page");
    });

    it("generates HTML document for Writing Practice Worksheet format with empty Tianzige slots", () => {
      const html = controller.generateFullDocument(mockVocab.slice(0, 3), {
        format: "practice",
        density: 6,
        lang: "es",
        title: "Cuaderno de Caligrafía HSK 1"
      });

      expect(html).toContain("practice-row");
      expect(html).toContain("tianzige-box model");
      expect(html).toContain("tianzige-box empty");
      expect(html).toContain("Estudiante: _______________________________");
    });

    it("generates HTML document for Etymology detailed cards format", () => {
      const html = controller.generateFullDocument(mockEtymologyLesson.chars, {
        format: "etymology",
        density: 6,
        lang: "es",
        title: "Etimología Sección A"
      });

      expect(html).toContain("etymology-print-card");
      expect(html).toContain("tianzige-box etym-large");
      expect(html).toContain("Origen & Etimología:");
      expect(html).toContain("Pictograma de persona de pie");
    });

    it("generates HTML document for Duplex double-sided format with front and back pages", () => {
      const items = [
        { character: "你好", pinyin: "nǐ hǎo", spanish: "hola", level: 1 },
        { character: "谢谢", pinyin: "xiè xie", spanish: "gracias", level: 1 }
      ];
      const html = controller.generateFullDocument(items, {
        format: "duplex",
        density: 6,
        lang: "es",
        title: "Flashcards Duplex"
      });

      expect(html).toContain("duplex-card");
      expect(html).toContain("duplex-front");
      expect(html).toContain("duplex-back");
      expect(html).toContain("duplex-hanzi");
      expect(html).toContain("duplex-pinyin");
      expect(html).toContain("duplex-meaning");
    });

    it("calculates pagination correctly for 15 items with density 6", () => {
      const items = [];
      for (let i = 1; i <= 15; i++) {
        items.push({ character: "字" + i, pinyin: "zì", spanish: "palabra" });
      }
      const html = controller.generateFullDocument(items, {
        format: "flashcards",
        density: 6,
        lang: "es",
        title: "Test Pag"
      });

      expect(html).toContain("Pág. 1 de 3");
      expect(html).toContain("Pág. 2 de 3");
      expect(html).toContain("Pág. 3 de 3");
    });
  });

  describe("Print dispatch", () => {
    it("dispatches print via iframe without throwing", () => {
      const html = "<html><body>Test</body></html>";
      expect(() => controller.printIframe(html)).not.toThrow();

      const iframe = document.getElementById("flashcard-print-frame");
      expect(iframe).toBeTruthy();
    });
  });
});
