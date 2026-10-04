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

    const createdDecks = [];
    const deckWords = new Map();

    app = {
      currentLanguage: "es",
      switchTab: vi.fn(),
      showToast: vi.fn(),
      addExperience: vi.fn(),
      deckManager: {
        getAllDecks: vi.fn(() => [...createdDecks]),
        createDeck: vi.fn((name, desc) => {
          const newDeck = { id: `deck-${createdDecks.length + 1}`, name, description: desc };
          createdDecks.push(newDeck);
          deckWords.set(newDeck.id, []);
          return newDeck;
        }),
        addWordToDeck: vi.fn((deckId, wordObj) => {
          const list = deckWords.get(deckId) || [];
          list.push(wordObj);
          deckWords.set(deckId, list);
          return true;
        }),
        removeWordFromDeck: vi.fn((deckId, wordChar) => {
          const list = deckWords.get(deckId) || [];
          deckWords.set(deckId, list.filter((w) => w.character !== wordChar));
          return true;
        }),
      },
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
          cultureSearchPlaceholder: "Buscar módulos, dinastías, artes, medicina, Hanzi...",
          cultureCopyWisdom: "Copiar Ficha",
          cultureCopiedWisdom: "¡Copiado!",
          cultureNoResults: "No se encontraron módulos culturales para esta búsqueda.",
          cultureResetFilters: "Restablecer filtros",
          culturePassportTitle: "Pasaporte Cultural de China",
          culturePassportSubtitle: "Colección de Sellos Imperiales (朱砂印章)",
          cultureRankNovice: "Viajero Principiante",
          cultureRankExplorer: "Explorador de Tradiciones",
          cultureRankScholar: "Erudito Cultural",
          cultureRankMaster: "Gran Erudito de Sinología",
          cultureTriviaTitle: "Reto Cultural del Día",
          cultureTriviaCorrect: "¡Correcto!",
          cultureTriviaIncorrect: "No exactamente...",
          cultureTriviaNext: "Siguiente Reto",
          cultureAddToDeck: "Guardar en Mazo Cultural",
          cultureRemovedFromDeck: "Eliminado de Vocabulario Cultural",
          cultureAddedToDeck: "¡Guardado en Vocabulario Cultural!",
          cultureDynastyAll: "Todas las épocas",
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

  describe("Instant Search and Filtering", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("filters cards dynamically when searching by term (accent-insensitive)", () => {
      const searchInput = document.getElementById("culture-search-input");
      searchInput.value = "opera";
      searchInput.dispatchEvent(new Event("input"));

      expect(controller.searchQuery).toBe("opera");
      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBeGreaterThanOrEqual(1);
      const operaCard = document.querySelector('.culture-card[data-card-id="culture-opera"]');
      expect(operaCard.classList.contains("is-hidden")).toBe(false);
    });

    it("matches Chinese characters in title or vocabulary", () => {
      const searchInput = document.getElementById("culture-search-input");
      searchInput.value = "甲骨文";
      searchInput.dispatchEvent(new Event("input"));

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(1);
      expect(visibleCards[0].getAttribute("data-card-id")).toBe("culture-characters");
    });

    it("shows empty state when no cards match search", () => {
      const searchInput = document.getElementById("culture-search-input");
      searchInput.value = "xyznonexistent999";
      searchInput.dispatchEvent(new Event("input"));

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(0);

      const noResults = document.getElementById("culture-no-results");
      expect(noResults.classList.contains("is-hidden")).toBe(false);
    });

    it("clears search query and restores cards when clicking clear button", () => {
      const searchInput = document.getElementById("culture-search-input");
      searchInput.value = "medicina";
      searchInput.dispatchEvent(new Event("input"));

      const clearBtn = document.getElementById("culture-search-clear");
      expect(clearBtn.classList.contains("is-hidden")).toBe(false);

      clearBtn.click();
      expect(controller.searchQuery).toBe("");
      expect(searchInput.value).toBe("");

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(13);
      expect(clearBtn.classList.contains("is-hidden")).toBe(true);
    });

    it("resets both search query and pillar filter when clicking reset button in empty state", () => {
      controller.setFilter("geo");
      const searchInput = document.getElementById("culture-search-input");
      searchInput.value = "nomatch";
      searchInput.dispatchEvent(new Event("input"));

      const resetBtn = document.getElementById("culture-reset-filters-btn");
      expect(resetBtn).not.toBeNull();
      resetBtn.click();

      expect(controller.searchQuery).toBe("");
      expect(controller.activePillar).toBe("all");
      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(13);
    });
  });

  describe("Wisdom Card Copy & Share", () => {
    beforeEach(async () => {
      app.showToast = vi.fn();
      await controller.init();
    });

    it("copies formatted wisdom markdown to clipboard using navigator.clipboard", async () => {
      let writtenText = "";
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(async (text) => {
            writtenText = text;
          }),
        },
      });

      const copyBtn = document.getElementById("culture-wisdom-copy-btn");
      expect(copyBtn).not.toBeNull();
      copyBtn.click();

      await Promise.resolve();

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(writtenText).toContain("Proverbio Chino del Día");
      expect(writtenText).toContain("Proyecto HSK");
      expect(app.showToast).toHaveBeenCalled();
    });

    it("falls back to execCommand copy when navigator.clipboard is not available", () => {
      delete navigator.clipboard;
      document.execCommand = vi.fn().mockReturnValue(true);

      const copyBtn = document.getElementById("culture-wisdom-copy-btn");
      copyBtn.click();

      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });
  });

  describe("Imperial Cultural Passport (通关文牒)", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("renders passport card with 13 imperial seals", () => {
      const passportCard = document.getElementById("culture-passport-card");
      expect(passportCard).not.toBeNull();
      expect(passportCard.classList.contains("is-open")).toBe(false);

      const seals = passportCard.querySelectorAll(".imperial-seal");
      expect(seals.length).toBe(13);
    });

    it("toggles passport visibility when clicking toggle button in hero stats", () => {
      const toggleBtn = document.getElementById("culture-passport-toggle-btn");
      const passportCard = document.getElementById("culture-passport-card");
      expect(toggleBtn).not.toBeNull();
      expect(passportCard.classList.contains("is-open")).toBe(false);

      toggleBtn.click();
      expect(passportCard.classList.contains("is-open")).toBe(true);
      expect(controller.isPassportOpen).toBe(true);

      toggleBtn.click();
      expect(passportCard.classList.contains("is-open")).toBe(false);
      expect(controller.isPassportOpen).toBe(false);
    });

    it("calculates scholar ranks correctly based on exploration count", () => {
      expect(controller.getRank(0).code).toBe("novice");
      expect(controller.getRank(3).code).toBe("novice");
      expect(controller.getRank(4).code).toBe("explorer");
      expect(controller.getRank(7).code).toBe("explorer");
      expect(controller.getRank(8).code).toBe("scholar");
      expect(controller.getRank(12).code).toBe("scholar");
      expect(controller.getRank(13).code).toBe("master");
    });

    it("updates seal status to is-stamped and navigates when clicking a seal", () => {
      const sealCharacters = document.querySelector('.imperial-seal[data-seal-target="culture-characters"]');
      expect(sealCharacters).not.toBeNull();
      expect(sealCharacters.classList.contains("is-pending")).toBe(true);

      sealCharacters.click();

      expect(app.switchTab).toHaveBeenCalledWith("culture-characters");
      expect(controller.getExploredSet().has("culture-characters")).toBe(true);
      expect(sealCharacters.classList.contains("is-stamped")).toBe(true);
    });
  });

  describe("Daily Cultural Trivia (Reto Cultural del Día)", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("renders daily trivia card with question, options and xp badge", () => {
      const triviaCard = document.getElementById("culture-trivia-card");
      expect(triviaCard).not.toBeNull();

      const options = triviaCard.querySelectorAll(".trivia-option-btn");
      expect(options.length).toBe(4);

      const feedback = triviaCard.querySelector(".trivia-feedback");
      expect(feedback.classList.contains("is-hidden")).toBe(true);
    });

    it("handles correct answer, displays feedback and explanation, and awards +20 XP", () => {
      const correctBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="0"]');
      expect(correctBtn).not.toBeNull();

      correctBtn.click();

      expect(controller.triviaAnswered).toBe(true);
      const updatedBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="0"]');
      expect(updatedBtn.classList.contains("is-correct")).toBe(true);
      expect(app.showToast).toHaveBeenCalled();
      expect(localStorage.getItem("hsk_culture_trivia_xp")).toBe("20");

      const feedback = document.querySelector(".trivia-feedback");
      expect(feedback.classList.contains("is-hidden")).toBe(false);
      const explanation = document.getElementById("culture-trivia-explanation");
      expect(explanation.textContent.length).toBeGreaterThan(0);
    });

    it("handles incorrect answer, marks option wrong, and reveals correct option", () => {
      const wrongBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="1"]');
      expect(wrongBtn).not.toBeNull();

      wrongBtn.click();

      expect(controller.triviaAnswered).toBe(true);
      const updatedWrongBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="1"]');
      expect(updatedWrongBtn.classList.contains("is-wrong")).toBe(true);

      const correctBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="0"]');
      expect(correctBtn.classList.contains("is-correct")).toBe(true);

      const feedback = document.querySelector(".trivia-feedback");
      expect(feedback.classList.contains("is-hidden")).toBe(false);
    });

    it("advances to next question when clicking next trivia button", () => {
      const initialIdx = controller.currentTriviaIndex;
      const optBtn = document.querySelector('.trivia-option-btn[data-trivia-opt="0"]');
      optBtn.click();

      const nextBtn = document.getElementById("culture-trivia-next-btn");
      expect(nextBtn).not.toBeNull();
      nextBtn.click();

      expect(controller.currentTriviaIndex).toBe((initialIdx + 1) % 6);
      expect(controller.triviaAnswered).toBe(false);
      expect(controller.triviaSelectedOption).toBeNull();
    });
  });

  describe("SRS Cultural Vocabulary Connector", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("renders deck bookmark button on each module card", () => {
      const deckBtns = document.querySelectorAll(".culture-card-deck-btn");
      expect(deckBtns.length).toBe(13);
    });

    it("adds vocabulary to Vocabulario Cultural deck on click", () => {
      const firstBtn = document.querySelector('.culture-card-deck-btn[data-culture-deck-mod="culture-characters"]');
      expect(firstBtn).not.toBeNull();
      expect(firstBtn.classList.contains("is-in-deck")).toBe(false);

      firstBtn.click();

      expect(firstBtn.classList.contains("is-in-deck")).toBe(true);
      expect(app.deckManager.createDeck).toHaveBeenCalledWith("Vocabulario Cultural", expect.any(String));
      expect(app.deckManager.addWordToDeck).toHaveBeenCalled();
      expect(app.showToast).toHaveBeenCalled();

      const savedWords = JSON.parse(localStorage.getItem("hsk_culture_deck_words") || "[]");
      expect(savedWords).toContain("甲骨文");
    });

    it("removes vocabulary from deck when clicking bookmark button a second time", () => {
      const firstBtn = document.querySelector('.culture-card-deck-btn[data-culture-deck-mod="culture-characters"]');
      firstBtn.click(); // Add
      expect(firstBtn.classList.contains("is-in-deck")).toBe(true);

      firstBtn.click(); // Remove
      expect(firstBtn.classList.contains("is-in-deck")).toBe(false);
      expect(app.deckManager.removeWordFromDeck).toHaveBeenCalled();

      const savedWords = JSON.parse(localStorage.getItem("hsk_culture_deck_words") || "[]");
      expect(savedWords).not.toContain("甲骨文");
    });
  });

  describe("Dynastic Timeline Filtering", () => {
    beforeEach(async () => {
      await controller.init();
    });

    it("renders 5 clickable dynasty steps in timeline ribbon", () => {
      const steps = document.querySelectorAll(".timeline-step.is-clickable");
      expect(steps.length).toBe(5);
    });

    it("filters cards to specific dynasty when clicking dynasty step", () => {
      const qinHanStep = document.querySelector('.timeline-step[data-dynasty="qin-han"]');
      expect(qinHanStep).not.toBeNull();

      qinHanStep.click();

      expect(controller.activeDynasty).toBe("qin-han");
      expect(qinHanStep.classList.contains("active")).toBe(true);

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBeGreaterThan(0);
      visibleCards.forEach((card) => {
        const id = card.getAttribute("data-card-id");
        expect(["culture-characters", "culture-greatwall", "culture-silkroad", "culture-medicine", "culture-tea", "culture-provinces"]).toContain(id);
      });
    });

    it("clears dynasty filter when clicking active step again (toggle behavior)", () => {
      const qinHanStep = document.querySelector('.timeline-step[data-dynasty="qin-han"]');
      qinHanStep.click();
      expect(controller.activeDynasty).toBe("qin-han");

      qinHanStep.click();
      expect(controller.activeDynasty).toBeNull();
      expect(qinHanStep.classList.contains("active")).toBe(false);

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(13);
    });

    it("clears dynasty filter when clicking the timeline clear button", () => {
      const tangSongStep = document.querySelector('.timeline-step[data-dynasty="tang-song"]');
      tangSongStep.click();
      expect(controller.activeDynasty).toBe("tang-song");

      const clearBtn = document.getElementById("culture-dynasty-clear-btn");
      expect(clearBtn).not.toBeNull();

      clearBtn.click();
      expect(controller.activeDynasty).toBeNull();

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(13);
    });

    it("combines dynasty filter with pillar filter and search", () => {
      // 1. Filter to 'lang' pillar
      controller.setFilter("lang");
      // 2. Filter dynasty to 'shang-zhou'
      controller.setDynastyFilter("shang-zhou");
      // 3. Search for 'caracteres'
      controller.searchQuery = "caracteres";
      controller.applyFilters();

      const visibleCards = document.querySelectorAll(".culture-card:not(.is-hidden)");
      expect(visibleCards.length).toBe(1);
      expect(visibleCards[0].getAttribute("data-card-id")).toBe("culture-characters");
    });
  });
});
