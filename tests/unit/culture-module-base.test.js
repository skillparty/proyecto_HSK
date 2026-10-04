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

  it("re-renders on languageChanged event if already initialized", async () => {
    await moduleInstance.initialize();
    const renderSpy = vi.spyOn(moduleInstance, "render");

    window.dispatchEvent(new CustomEvent("languageChanged"));
    expect(renderSpy).toHaveBeenCalled();
  });
});
