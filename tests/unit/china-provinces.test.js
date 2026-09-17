import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";

// Mock CultureModuleBase before loading ChinaProvincesModule
class MockCultureModuleBase {
  constructor(app, containerId, title) {
    this.app = app;
    this.containerId = containerId;
    this.title = title;
    this.isInitialized = false;
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  getSpeakerBtn(text, title) {
    return `<button type="button" class="culture-speaker-btn" data-culture-speak="${text}" title="${title}">🔊</button>`;
  }

  bindAudioButtons(scope) {
    if (!scope) return;
    scope.querySelectorAll("[data-culture-speak]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.dataset.cultureSpeak;
        if (text && typeof window.speechSynthesis !== "undefined") {
          const utt = new window.SpeechSynthesisUtterance(text);
          utt.lang = "zh-CN";
          window.speechSynthesis.speak(utt);
        }
      });
    });
  }
}

globalThis.CultureModuleBase = MockCultureModuleBase;

// Load china-provinces.js
const provincesJsPath = path.resolve(__dirname, "../../assets/js/modules/culture/china-provinces.js");
const provincesJsCode = fs.readFileSync(provincesJsPath, "utf8");
new Function(provincesJsCode)();

// Load actual china-provinces.json
const dataPath = path.resolve(__dirname, "../../assets/data/culture/china-provinces.json");
const provincesData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const setupDOM = () => {
  document.body.innerHTML = `
    <div id="culture-provinces" class="tab-panel">
      <div id="culture-provinces-content"></div>
    </div>
  `;
};

describe("ChinaProvincesModule", () => {
  let app;
  let mod;

  beforeEach(() => {
    setupDOM();
    app = {
      currentLanguage: "es",
      audioController: {
        playWordAudio: vi.fn(),
      },
    };

    mod = new window.ChinaProvincesModule(app);
    // Provide loaded data directly to avoid network fetch in unit tests
    mod.data = JSON.parse(JSON.stringify(provincesData));
  });

  it("loads 34 provincial divisions with comprehensive cultural & geographical attributes", () => {
    expect(mod.data.provinces).toBeDefined();
    expect(mod.data.provinces.length).toBe(34);

    mod.data.provinces.forEach((p) => {
      expect(p.id).toBeTypeOf("string");
      expect(p.name).toBeTypeOf("string");
      expect(p.pinyin).toBeTypeOf("string");
      expect(p.nameEs).toBeTypeOf("string");
      expect(p.capital).toBeTypeOf("string");
      expect(p.climate).toBeTypeOf("string");
      expect(p.language).toBeTypeOf("string");
      expect(p.food).toBeTypeOf("string");
      expect(p.attire).toBeTypeOf("string");
      expect(p.geography).toBeTypeOf("string");
      expect(p.highlights).toBeTypeOf("string");
    });
  });

  it("contains physical geography overview, 3 relief tiers and 2 major rivers", () => {
    const geo = mod.data.physicalGeography;
    expect(geo).toBeDefined();
    expect(geo.steps.length).toBe(3);
    expect(geo.rivers.length).toBe(2);
    expect(geo.dividingLine).toBeDefined();
    expect(geo.dividingLine.name).toContain("Qinling");
  });

  it("renders map view by default with SVG and topography steps", () => {
    mod.render();
    const container = document.getElementById("culture-provinces-content");
    expect(container).not.toBeNull();

    // Check topography step cards
    const stepCards = container.querySelectorAll(".topography-step-card");
    expect(stepCards.length).toBe(3);

    // Check SVG map is present
    const svgMap = container.querySelector(".china-svg-map");
    expect(svgMap).not.toBeNull();

    // Check all 34 province blocks are rendered in SVG
    const svgProvinces = container.querySelectorAll(".map-province-interactive-group");
    expect(svgProvinces.length).toBe(34);
  });

  it("switches to cards view and displays all 34 province cards", () => {
    mod.render();
    const cardsBtn = document.querySelector('.provinces-view-btn[data-view="cards"]');
    expect(cardsBtn).not.toBeNull();

    cardsBtn.click();
    expect(mod.activeView).toBe("cards");

    const cards = document.querySelectorAll(".province-card");
    expect(cards.length).toBe(34);
  });

  it("filters provinces by macro-region correctly", () => {
    mod.render();
    // Test Southwest (xinan) filter
    const swBtn = document.querySelector('.region-pill-btn[data-region="xinan"]');
    expect(swBtn).not.toBeNull();

    swBtn.click();
    expect(mod.activeRegion).toBe("xinan");

    const filtered = mod.getFilteredProvinces();
    expect(filtered.length).toBe(5); // sichuan, chongqing, guizhou, yunnan, tibet
    expect(filtered.map((p) => p.id)).toEqual(
      expect.arrayContaining(["sichuan", "chongqing", "guizhou", "yunnan", "tibet"])
    );
  });

  it("filters provinces by search query across multiple fields (name, food, language)", () => {
    mod.render();

    // Search for Sichuan cuisine
    mod.searchQuery = "tofu mapo";
    let results = mod.getFilteredProvinces();
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("sichuan");

    // Search for Cantonese dialect
    mod.searchQuery = "cantonés";
    results = mod.getFilteredProvinces();
    expect(results.some((p) => p.id === "guangdong")).toBe(true);

    // Search for climate term
    mod.searchQuery = "subtropical";
    results = mod.getFilteredProvinces();
    expect(results.length).toBeGreaterThan(0);
  });

  it("opens and populates province detail dialog when selected", () => {
    mod.render();
    const dialog = document.getElementById("province-detail-dialog");
    expect(dialog).not.toBeNull();

    // Mock HTMLDialogElement methods if not in jsdom
    if (!dialog.showModal) {
      dialog.showModal = vi.fn();
      dialog.close = vi.fn();
    }

    mod.openProvinceModal("sichuan");
    expect(mod.selectedProvince.id).toBe("sichuan");

    const mount = document.getElementById("province-detail-mount");
    expect(mount.innerHTML).toContain("Sichuan");
    expect(mount.innerHTML).toContain("Chengdu");
    expect(mount.innerHTML).toContain("Kung Pao");
  });

  it("switches to quiz view and evaluates answers accurately", () => {
    mod.render();
    const quizBtn = document.querySelector('.provinces-view-btn[data-view="quiz"]');
    expect(quizBtn).not.toBeNull();

    quizBtn.click();
    expect(mod.activeView).toBe("quiz");

    const questionTitle = document.querySelector(".quiz-question-title");
    expect(questionTitle).not.toBeNull();
    expect(questionTitle.textContent.length).toBeGreaterThan(5);

    const optionBtns = document.querySelectorAll(".quiz-option-btn");
    expect(optionBtns.length).toBe(4);

    // Answer the first question correctly
    const currentQ = mod.data.quiz[0];
    const correctIdx = currentQ.correct;

    optionBtns[correctIdx].click();
    expect(mod.quizAnswered).toBe(true);
    expect(mod.quizScore).toBe(1);

    const feedback = document.getElementById("quiz-feedback-box");
    expect(feedback.style.display).toBe("block");
    expect(feedback.textContent).toContain("¡Correcto!");
  });

  it("supports bilingual rendering when language is switched to English", () => {
    app.currentLanguage = "en";
    mod.render();

    const heroTitle = document.querySelector(".provinces-hero-title");
    expect(heroTitle.textContent).toContain("Physical Geography & Provinces");

    const cardsBtn = document.querySelector('.provinces-view-btn[data-view="cards"]');
    expect(cardsBtn.textContent).toContain("Province Cards");
  });
});
