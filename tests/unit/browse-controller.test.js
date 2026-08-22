import { describe, it, expect, beforeEach, vi } from "vitest";
import "../../assets/js/modules/browse-controller.js";

describe("BrowseController", () => {
  let controller;
  let mockApp;
  let mockVocab;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="browse" class="tab-panel">
        <div class="search-section">
          <input type="text" id="search-input" />
          <select id="browse-level-filter">
            <option value="all">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          <select id="browse-sort-order">
            <option value="lesson">Lesson</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <button id="export-anki-btn"></button>
          <button id="export-pdf-btn"></button>
          <button id="browse-select-mode-btn">
            <span id="browse-select-mode-text">Select</span>
            <span id="browse-selected-count-badge">0</span>
          </button>
        </div>
        <div id="browse-selection-bar" style="display:none;">
          <span id="browse-selected-text">0 selected</span>
          <button id="browse-select-all-btn">All</button>
          <button id="browse-clear-selection-btn">Clear</button>
          <button id="browse-print-selected-btn">
            <span id="browse-print-selected-text">PDF</span>
          </button>
        </div>
        <div id="browse-stats"></div>
        <div id="vocabulary-grid"></div>
      </div>
    `;

    mockVocab = [
      { character: "你好", pinyin: "nǐ hǎo", english: "hello", spanish: "hola", level: 1, _sourceOrder: 1, lesson: 1, lessonOrder: 1 },
      { character: "谢谢", pinyin: "xiè xie", english: "thank you", spanish: "gracias", level: 1, _sourceOrder: 2, lesson: 1, lessonOrder: 2 },
      { character: "再见", pinyin: "zài jiàn", english: "goodbye", spanish: "adiós", level: 1, _sourceOrder: 3, lesson: 2, lessonOrder: 1 },
      { character: "苹果", pinyin: "píng guǒ", english: "apple", spanish: "manzana", level: 2, _sourceOrder: 4, lesson: 1, lessonOrder: 1 }
    ];

    // Generate 50 items for pagination tests
    for (let i = 5; i <= 65; i++) {
      mockVocab.push({
        character: "字" + i,
        pinyin: "zì " + i,
        english: "word " + i,
        spanish: "palabra " + i,
        level: (i % 2) + 1,
        _sourceOrder: i,
        lesson: Math.floor(i / 10) + 1,
        lessonOrder: i % 10
      });
    }

    mockApp = {
      vocabulary: [...mockVocab],
      currentLanguage: "es",
      getMeaningForLanguage: (w) => w.spanish || w.english,
      getTonesFromPinyin: (_p) => [1, 2],
      colorPinyinByTone: (p) => p,
      getTranslation: (k, r) => k + (r ? JSON.stringify(r) : ""),
      showNotification: vi.fn(),
      selectVocabWord: vi.fn(),
      playAudio: vi.fn(),
      logDebug: vi.fn(),
      logError: vi.fn(),
      logWarn: vi.fn()
    };

    controller = new window.BrowseController(mockApp);
  });

  describe("initializeBrowse & initial render", () => {
    it("initializes browseState and renders first batch", () => {
      controller.initializeBrowse();

      expect(mockApp.browseState).toBeDefined();
      expect(mockApp.browseState.currentPage).toBe(1);
      expect(mockApp.browseState.itemsPerPage).toBe(30);
      expect(mockApp.browseState.displayedItems.length).toBe(30);

      const grid = document.getElementById("vocabulary-grid");
      expect(grid.children.length).toBe(30);
    });

    it("creates and observes browse-sentinel", () => {
      controller.initializeBrowse();

      const sentinel = document.getElementById("browse-sentinel");
      expect(sentinel).not.toBeNull();
      expect(controller.intersectionObserver).toBeDefined();
    });
  });

  describe("Infinite Scroll / Pagination", () => {
    it("loads next batch when loadMoreVocabulary is called", () => {
      controller.initializeBrowse();
      expect(mockApp.browseState.displayedItems.length).toBe(30);
      expect(mockApp.browseState.currentPage).toBe(1);

      controller.loadMoreVocabulary();
      expect(mockApp.browseState.displayedItems.length).toBe(60);
      expect(mockApp.browseState.currentPage).toBe(2);

      const grid = document.getElementById("vocabulary-grid");
      expect(grid.children.length).toBe(60);

      // Load last batch
      controller.loadMoreVocabulary();
      expect(mockApp.browseState.displayedItems.length).toBe(65);
      expect(mockApp.browseState.hasMore).toBe(false);

      const noMore = document.getElementById("browse-no-more");
      expect(noMore).not.toBeNull();
      expect(noMore.style.display).toBe("block");
    });

    it("container scroll triggers loadMoreVocabulary", async () => {
      controller.initializeBrowse();
      const browseContainer = document.getElementById("browse");

      // Mock scroll dimensions
      Object.defineProperty(browseContainer, "scrollHeight", { value: 2000, configurable: true });
      Object.defineProperty(browseContainer, "clientHeight", { value: 800, configurable: true });
      Object.defineProperty(browseContainer, "scrollTop", { value: 1000, configurable: true, writable: true });

      expect(mockApp.browseState.displayedItems.length).toBe(30);

      // Scroll near the bottom
      browseContainer.scrollTop = 1800;
      browseContainer.dispatchEvent(new Event("scroll"));

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockApp.browseState.displayedItems.length).toBe(60);
    });
  });

  describe("Filtering and Sorting", () => {
    it("filters vocabulary by level", () => {
      controller.initializeBrowse();
      const levelFilter = document.getElementById("browse-level-filter");
      levelFilter.value = "2";

      controller.filterVocabulary();

      const filtered = mockApp.browseState.filteredVocabulary;
      expect(filtered.every((w) => Number(w.level) === 2)).toBe(true);
    });

    it("filters vocabulary by search query in character, pinyin, or meaning", () => {
      controller.initializeBrowse();
      const searchInput = document.getElementById("search-input");

      searchInput.value = "你好";
      controller.filterVocabulary();
      expect(mockApp.browseState.filteredVocabulary.length).toBe(1);
      expect(mockApp.browseState.filteredVocabulary[0].character).toBe("你好");

      searchInput.value = "xie";
      controller.filterVocabulary();
      expect(mockApp.browseState.filteredVocabulary.length).toBe(1);
      expect(mockApp.browseState.filteredVocabulary[0].character).toBe("谢谢");

      searchInput.value = "manzana";
      controller.filterVocabulary();
      expect(mockApp.browseState.filteredVocabulary.length).toBe(1);
      expect(mockApp.browseState.filteredVocabulary[0].character).toBe("苹果");
    });

    it("shows no-results state when search yields no matches", () => {
      controller.initializeBrowse();
      const searchInput = document.getElementById("search-input");
      searchInput.value = "inexistentwordxyz";

      controller.filterVocabulary();

      expect(mockApp.browseState.filteredVocabulary.length).toBe(0);
      const grid = document.getElementById("vocabulary-grid");
      expect(grid.querySelector(".no-results")).not.toBeNull();
    });
  });

  describe("Anki CSV Export", () => {
    it("exports filtered vocabulary correctly", () => {
      controller.initializeBrowse();
      const searchInput = document.getElementById("search-input");
      searchInput.value = "你好";
      controller.filterVocabulary();

      const createObjectURLMock = vi.fn(() => "blob:http://localhost/dummy");
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      controller.exportToAnkiCsv();
      expect(mockApp.showNotification).toHaveBeenCalledWith(
        expect.stringContaining("¡Exportadas 1 palabras a CSV para Anki!"),
        "success"
      );
    });
  });

  describe("Selection Mode & PDF Integration", () => {
    it("toggles selection mode and updates container and buttons", () => {
      controller.initializeBrowse();
      expect(controller.isSelectionMode).toBe(false);

      controller.toggleSelectionMode();
      expect(controller.isSelectionMode).toBe(true);
      expect(document.getElementById("browse").classList.contains("selection-mode-active")).toBe(true);

      controller.toggleSelectionMode();
      expect(controller.isSelectionMode).toBe(false);
      expect(document.getElementById("browse").classList.contains("selection-mode-active")).toBe(false);
    });

    it("selects and deselects individual words", () => {
      controller.initializeBrowse();
      controller.toggleWordSelection("你好", null, true);

      expect(controller.selectedWords.has("你好")).toBe(true);
      expect(controller.selectedWords.size).toBe(1);

      controller.toggleWordSelection("你好", null, false);
      expect(controller.selectedWords.has("你好")).toBe(false);
      expect(controller.selectedWords.size).toBe(0);
    });

    it("selects all visible items and clears selection", () => {
      controller.initializeBrowse();
      controller.selectAllVisible();

      expect(controller.selectedWords.size).toBeGreaterThanOrEqual(30);

      controller.clearSelection();
      expect(controller.selectedWords.size).toBe(0);
    });

    it("opens PDF modal with correct state", async () => {
      controller.initializeBrowse();
      const mockPdfController = {
        openModal: vi.fn()
      };
      mockApp.flashcardPdfController = mockPdfController;

      await controller.openPdfModal();
      expect(mockPdfController.openModal).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "browse",
          vocabulary: expect.any(Array),
          selectedItems: expect.any(Set)
        })
      );
    });
  });
});

