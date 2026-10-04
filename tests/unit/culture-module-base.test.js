import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../../assets/js/modules/culture/culture-module-base.js";

describe("CultureModuleBase", () => {
  let app;
  let moduleInstance;

  class TestCultureModule extends window.CultureModuleBase {
    async loadData() {
      this.data = { loaded: true };
    }

    render() {
      if (this.container) {
        this.container.innerHTML = `<div class="test-content">Loaded Test Content</div>`;
      }
    }
  }

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="culture-characters" class="tab-panel">
        <div id="culture-characters-content"></div>
      </div>
    `;

    app = {
      currentLanguage: "es",
      switchTab: vi.fn(),
      getTranslation: vi.fn((key) => {
        if (key === "cultureBackToPortal") return "← Volver al Portal Cultural";
        return key;
      }),
    };

    moduleInstance = new TestCultureModule(app, "culture-characters-content", "Evolución de Caracteres");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes successfully, renders content, injects nav header, and marks explored", async () => {
    await moduleInstance.initialize();

    expect(moduleInstance.isInitialized).toBe(true);

    const nav = document.querySelector(".culture-submodule-header-nav");
    expect(nav).not.toBeNull();
    expect(nav.textContent).toContain("Evolución de Caracteres");
    expect(nav.textContent).toContain("Volver al Portal Cultural");

    const backBtn = nav.querySelector("[data-culture-nav='hub']");
    expect(backBtn).not.toBeNull();
    backBtn.click();
    expect(app.switchTab).toHaveBeenCalledWith("culture");

    const exploredRaw = localStorage.getItem("hsk_culture_explored");
    expect(exploredRaw).not.toBeNull();
    const set = JSON.parse(exploredRaw);
    expect(set).toContain("culture-characters");
  });

  it("does not inject duplicate navigation headers if called again", () => {
    moduleInstance.injectNavigationHeader();
    moduleInstance.injectNavigationHeader();

    const headers = document.querySelectorAll(".culture-submodule-header-nav");
    expect(headers.length).toBe(1);
  });

  it("handles renderError and retry button", () => {
    window.app = {
      uiController: {
        handleTabInitialization: vi.fn(),
      },
    };

    moduleInstance.renderError("Simulated Network Error");

    const errorMsg = document.querySelector("[data-culture-action='retry']");
    expect(errorMsg).not.toBeNull();

    errorMsg.click();
    // retryTabInitialization looks up closest tab panel
    expect(window.app.uiController.handleTabInitialization).toBeDefined();
  });

  it("generates speaker button and binds audio playback", () => {
    globalThis.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (text) {
      this.text = text;
      this.lang = "zh-CN";
    });

    const btnHtml = moduleInstance.getSpeakerBtn("汉字", "Pronunciar");
    expect(btnHtml).toContain('data-culture-speak="汉字"');

    document.getElementById("culture-characters-content").innerHTML = btnHtml;
    moduleInstance.bindAudioButtons(document.getElementById("culture-characters-content"));

    const btn = document.querySelector("[data-culture-speak]");
    btn.click();

    expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("re-renders on languageChanged event if already initialized and preserves navigation header", async () => {
    await moduleInstance.initialize();
    const renderSpy = vi.spyOn(moduleInstance, "render");

    window.dispatchEvent(new CustomEvent("languageChanged"));
    expect(renderSpy).toHaveBeenCalled();

    const header = document.querySelector(".culture-submodule-header-nav");
    expect(header).not.toBeNull();
  });

  it("enriches navigation header with pillar tag, seal badge, and SRS deck button", async () => {
    window.CULTURE_MODULES_DATA = [
      {
        id: "culture-characters",
        pillar: "lang",
        pillarKey: "culturePillarLanguage",
        titleKey: "cultureCharactersTab",
        title: "Evolución de Caracteres",
        hanzi: "汉字演变",
        sealChar: "演变",
        vocabHanzi: "甲骨文",
        icon: "lantern",
      },
    ];

    window.CultureHubController = {
      toggleVocabDeck: vi.fn((mod) => {
        const raw = localStorage.getItem("hsk_culture_deck_words");
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.add(mod.vocabHanzi);
        localStorage.setItem("hsk_culture_deck_words", JSON.stringify([...set]));
        document.querySelectorAll(`.culture-card-deck-btn[data-culture-deck-mod="${mod.id}"]`).forEach((btn) => {
          btn.classList.add("is-in-deck");
        });
        return true;
      }),
    };

    app.cultureHubController = { isPassportOpen: false };

    await moduleInstance.initialize();

    const nav = document.querySelector(".culture-submodule-header-nav");
    expect(nav).not.toBeNull();

    // Check pillar badge
    const pillarTag = nav.querySelector(".culture-crumb-pillar");
    expect(pillarTag).not.toBeNull();
    expect(pillarTag.classList.contains("tag-lang")).toBe(true);

    // Check Hanzi subtitle
    const hanziSpan = nav.querySelector(".culture-crumb-hanzi");
    expect(hanziSpan).not.toBeNull();
    expect(hanziSpan.textContent).toBe("汉字演变");

    // Check seal badge
    const sealBadge = nav.querySelector(".culture-submodule-seal-badge");
    expect(sealBadge).not.toBeNull();
    expect(sealBadge.textContent).toContain("演变");

    // Clicking seal badge returns to culture tab and opens passport
    sealBadge.click();
    expect(app.cultureHubController.isPassportOpen).toBe(true);
    expect(app.switchTab).toHaveBeenCalledWith("culture");

    // Check SRS deck bookmark button
    const deckBtn = nav.querySelector(".culture-card-deck-btn");
    expect(deckBtn).not.toBeNull();
    expect(deckBtn.textContent).toContain("甲骨文");

    deckBtn.click();
    expect(window.CultureHubController.toggleVocabDeck).toHaveBeenCalled();
    expect(deckBtn.classList.contains("is-in-deck")).toBe(true);
  });
});
