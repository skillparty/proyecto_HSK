import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../../assets/js/modules/culture/culture-hub.js";

describe("CultureHubController", () => {
  let app;
  let controller;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="culture" class="tab-panel">
        <div id="culture-content"></div>
      </div>
    `;

    // Global mock for speech synthesis
    globalThis.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (text) {
      this.text = text;
      this.lang = "zh-CN";
      this.rate = 0.85;
    });

    // Mock hskIcons
    globalThis.hskIcons = {
      render: vi.fn((name) => `<svg class="hsk-icon-${name}"></svg>`),
    };

    app = {
      currentLanguage: "es",
      switchTab: vi.fn(),
      getTranslation: vi.fn((key) => {
        const dict = {
          culturePortalTitle: "Portal Cultural de China · 中华文化大观",
          culturePortalSubtitle: "Un viaje inmersivo por más de 5.000 años de historia.",
          culturePillarLanguage: "Lengua & Caligrafía",
          culturePillarGeography: "Geografía & Ciudades",
          culturePillarArts: "Artes Escénicas & Tradición",
          culturePillarSociety: "Ciencia, Costumbres & Sociedad",
          cultureDailyWisdom: "Sabiduría Milenaria (Proverbio del Día)",
          cultureExploreModule: "Explorar Módulo",
          cultureModulesCount: "Módulos Temáticos",
          cultureFilterAll: "Todos los Módulos",
          cultureDiscoveredPill: "Explorados",
          cultureShuffleWisdom: "Otro Proverbio",
        };
        return dict[key] || key;
      }),
      audioSynthesizer: {
        speak: vi.fn(),
      },
    };

    controller = new window.CultureHubController(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization & DOM Rendering", () => {
    it("renders hero banner, wisdom card, filter bar, 13 module cards, and timeline ribbon", async () => {
      await controller.init();

      expect(controller.isInitialized).toBe(true);
      expect(document.querySelector(".culture-hub-banner")).not.toBeNull();
      expect(document.querySelector(".culture-wisdom-card")).not.toBeNull();
      expect(document.querySelector(".culture-filter-bar")).not.toBeNull();
      expect(document.querySelector(".culture-timeline-card")).not.toBeNull();

      const cards = document.querySelectorAll(".culture-card");
      expect(cards.length).toBe(13);

      const filterChips = document.querySelectorAll(".culture-filter-chip");
      expect(filterChips.length).toBe(5);
    });

    it("falls back to #culture element if #culture-content is absent", async () => {
      document.body.innerHTML = `<div id="culture"></div>`;
      const fallbackController = new window.CultureHubController(app);
      await fallbackController.init();
      expect(fallbackController.container.id).toBe("culture");
      expect(document.querySelectorAll(".culture-card").length).toBe(13);
    });

    it("does not re-initialize if already initialized", async () => {
      await controller.init();
      const firstBanner = document.querySelector(".culture-hub-banner");
      await controller.init();
      const secondBanner = document.querySelector(".culture-hub-banner");
      expect(firstBanner).toBe(secondBanner);
    });
  });

  describe("Pillars and Filtering", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("displays all 13 cards when 'all' filter is active", () => {
      controller.setFilter("all");
      const hiddenCards = document.querySelectorAll(".culture-card.is-hidden");
      expect(hiddenCards.length).toBe(0);
    });

    it("filters to 4 cards for 'lang' pillar", () => {
      controller.setFilter("lang");
      const visibleCards = document.querySelectorAll('.culture-card:not(.is-hidden)');
      expect(visibleCards.length).toBe(4);
      visibleCards.forEach((card) => {
        expect(card.getAttribute("data-card-pillar")).toBe("lang");
      });
    });

    it("filters to 2 cards for 'geo' pillar", () => {
      controller.setFilter("geo");
      const visibleCards = document.querySelectorAll('.culture-card:not(.is-hidden)');
      expect(visibleCards.length).toBe(2);
      visibleCards.forEach((card) => {
        expect(card.getAttribute("data-card-pillar")).toBe("geo");
      });
    });

    it("filters to 4 cards for 'arts' pillar", () => {
      controller.setFilter("arts");
      const visibleCards = document.querySelectorAll('.culture-card:not(.is-hidden)');
      expect(visibleCards.length).toBe(4);
      visibleCards.forEach((card) => {
        expect(card.getAttribute("data-card-pillar")).toBe("arts");
      });
    });

    it("filters to 3 cards for 'sci' pillar", () => {
      controller.setFilter("sci");
      const visibleCards = document.querySelectorAll('.culture-card:not(.is-hidden)');
      expect(visibleCards.length).toBe(3);
      visibleCards.forEach((card) => {
        expect(card.getAttribute("data-card-pillar")).toBe("sci");
      });
    });

    it("responds to filter chip clicks via delegated container listener", () => {
      const geoChip = document.querySelector('.culture-filter-chip[data-pillar="geo"]');
      expect(geoChip).not.toBeNull();
      geoChip.click();

      expect(controller.activePillar).toBe("geo");
      expect(geoChip.classList.contains("active")).toBe(true);
      expect(geoChip.getAttribute("aria-selected")).toBe("true");

      const visibleCards = document.querySelectorAll('.culture-card:not(.is-hidden)');
      expect(visibleCards.length).toBe(2);
    });
  });

  describe("Chengyu / Daily Wisdom", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("renders initial chengyu with hanzi, pinyin, and meaning", () => {
      const hanziEl = document.getElementById("wisdom-hanzi-text");
      const pinyinEl = document.getElementById("wisdom-pinyin-text");
      const literalEl = document.getElementById("wisdom-literal-text");
      expect(hanziEl.textContent.trim().length).toBeGreaterThan(0);
      expect(pinyinEl.textContent.trim().length).toBeGreaterThan(0);
      expect(literalEl.textContent.trim().length).toBeGreaterThan(0);
    });

    it("shuffles wisdom when clicking shuffle button", () => {
      const initialIndex = controller.currentChengyuIndex;
      const shuffleBtn = document.getElementById("culture-wisdom-shuffle-btn");
      shuffleBtn.click();
      expect(controller.currentChengyuIndex).not.toBe(initialIndex);
    });

    it("speaks wisdom hanzi using audioSynthesizer", () => {
      const speakBtn = document.getElementById("wisdom-speak-btn");
      speakBtn.click();
      expect(app.audioSynthesizer.speak).toHaveBeenCalled();
    });

    it("falls back to window.speechSynthesis if audioSynthesizer is not available", () => {
      delete app.audioSynthesizer;
      controller.speakChinese("千里之行");
      expect(globalThis.speechSynthesis.cancel).toHaveBeenCalled();
      expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe("Vocab Audio Playback", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("speaks vocab term when clicking card audio button", () => {
      const audioBtn = document.querySelector("[data-culture-audio]");
      expect(audioBtn).not.toBeNull();
      const textToSpeak = audioBtn.getAttribute("data-culture-audio");
      audioBtn.click();
      expect(app.audioSynthesizer.speak).toHaveBeenCalledWith(textToSpeak);
    });
  });

  describe("Exploration Tracking & Navigation", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("starts with 0 explored modules if storage is empty", () => {
      const explored = controller.getExploredSet();
      expect(explored.size).toBe(0);
      const counterEl = document.getElementById("culture-explored-count");
      expect(counterEl.textContent).toBe("0/13");
    });

    it("marks module as explored and persists to localStorage", () => {
      controller.markExplored("culture-medicine");
      const explored = controller.getExploredSet();
      expect(explored.has("culture-medicine")).toBe(true);

      const counterEl = document.getElementById("culture-explored-count");
      expect(counterEl.textContent).toBe("1/13");
    });

    it("handles corrupted localStorage gracefully", () => {
      localStorage.setItem("hsk_culture_explored", "invalid-json{");
      const explored = controller.getExploredSet();
      expect(explored.size).toBe(0);
    });

    it("navigates to module tab and marks it explored on explore button click", () => {
      const exploreBtn = document.querySelector('.culture-explore-btn[data-goto-tab="culture-opera"]');
      expect(exploreBtn).not.toBeNull();
      exploreBtn.click();

      expect(app.switchTab).toHaveBeenCalledWith("culture-opera");
      expect(controller.getExploredSet().has("culture-opera")).toBe(true);
    });
  });

  describe("Language Switching", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("re-renders content in English when language changes to 'en'", () => {
      app.currentLanguage = "en";
      window.dispatchEvent(new CustomEvent("languageChanged"));

      const literalEl = document.getElementById("wisdom-literal-text");
      expect(literalEl).not.toBeNull();
      expect(literalEl.textContent.length).toBeGreaterThan(0);
    });
  });
});
