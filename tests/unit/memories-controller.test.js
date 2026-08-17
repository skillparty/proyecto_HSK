import { describe, it, expect, beforeEach, vi } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import "../../assets/js/modules/memories-controller.js";

describe("MemoriesController (Baúl de los Recuerdos)", () => {
  let controller;
  let mockApp;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="memories" class="tab-panel">
        <div id="memories-content"></div>
      </div>
    `;

    mockApp = {
      currentLanguage: "es",
      audioController: {
        playText: vi.fn(),
      },
      switchTab: vi.fn(),
      logError: vi.fn(),
      logWarn: vi.fn(),
    };

    window.languageManager = {
      currentLanguage: "es",
    };

    controller = new window.MemoriesController(mockApp);
  });

  describe("Dataset Integrity & Assets", () => {
    it("contains all 27 memory items", () => {
      expect(controller.memoriesData).toBeDefined();
      expect(controller.memoriesData.length).toBe(27);
    });

    it("has unique IDs for every memory", () => {
      const ids = controller.memoriesData.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(27);
    });

    it("all image files exist on disk", () => {
      const root = process.cwd();
      controller.memoriesData.forEach((memory) => {
        const fullPath = join(root, memory.img);
        expect(
          existsSync(fullPath),
          `Missing image file: ${memory.img} for ${memory.id}`,
        ).toBe(true);
      });
    });

    it("every memory has required fields (title, hanzi, pinyin, desc, category, seal, tags, vocab)", () => {
      const validCategories = ["teachers", "milestones", "contests", "events", "friendship"];
      controller.memoriesData.forEach((m) => {
        expect(m.id).toBeTruthy();
        expect(m.title).toBeTruthy();
        expect(m.titleEn).toBeTruthy();
        expect(m.hanzi).toBeTruthy();
        expect(m.pinyin).toBeTruthy();
        expect(m.desc).toBeTruthy();
        expect(m.descEn).toBeTruthy();
        expect(m.seal).toBeTruthy();
        expect(validCategories).toContain(m.category);
        expect(Array.isArray(m.tags)).toBe(true);
        expect(m.tags.length).toBeGreaterThan(0);
        expect(Array.isArray(m.vocab)).toBe(true);
      });
    });
  });

  describe("Filtering & Search", () => {
    it("returns all items when category is 'all' and no search query", () => {
      controller.currentCategory = "all";
      controller.searchQuery = "";
      expect(controller.getFilteredData().length).toBe(27);
    });

    it("filters correctly by category 'teachers'", () => {
      controller.currentCategory = "teachers";
      const teachers = controller.getFilteredData();
      expect(teachers.length).toBe(11);
      teachers.forEach((t) => expect(t.category).toBe("teachers"));
    });

    it("filters correctly by category 'milestones'", () => {
      controller.currentCategory = "milestones";
      const milestones = controller.getFilteredData();
      expect(milestones.length).toBe(4);
      milestones.forEach((m) => expect(m.category).toBe("milestones"));
    });

    it("filters correctly by category 'contests'", () => {
      controller.currentCategory = "contests";
      const contests = controller.getFilteredData();
      expect(contests.length).toBe(4);
      contests.forEach((c) => expect(c.category).toBe("contests"));
    });

    it("filters correctly by category 'events'", () => {
      controller.currentCategory = "events";
      const events = controller.getFilteredData();
      expect(events.length).toBe(7);
      events.forEach((e) => expect(e.category).toBe("events"));
    });

    it("filters correctly by category 'friendship'", () => {
      controller.currentCategory = "friendship";
      const friendship = controller.getFilteredData();
      expect(friendship.length).toBe(1);
      expect(friendship[0].id).toBe("nicole_recuerdo");
    });

    it("searches by teacher name (Guo / Pan / Liu / Xiang)", () => {
      controller.currentCategory = "all";
      controller.searchQuery = "Guo";
      const results = controller.getFilteredData();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.id === "guo_laoshi")).toBe(true);
    });

    it("searches by Chinese hanzi (书法 / 书展 / 汉语)", () => {
      controller.currentCategory = "all";
      controller.searchQuery = "书法";
      const results = controller.getFilteredData();
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it("searches by tags (e.g. HSK, Caligrafía, Humanidades)", () => {
      controller.currentCategory = "all";
      controller.searchQuery = "Humanidades";
      const results = controller.getFilteredData();
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("auditorio_humanidades");
    });
  });

  describe("Favorites Management", () => {
    it("toggles and persists favorites in localStorage", () => {
      expect(controller.favorites).toEqual([]);
      controller.toggleFavorite("guo_laoshi");
      expect(controller.favorites).toContain("guo_laoshi");

      const saved = JSON.parse(localStorage.getItem("hsk_memory_favs"));
      expect(saved).toContain("guo_laoshi");

      // Toggle off
      controller.toggleFavorite("guo_laoshi");
      expect(controller.favorites).not.toContain("guo_laoshi");
    });

    it("filters by 'favorites' category", () => {
      controller.favorites = ["guo_laoshi", "hsk_3_final", "puente_chino"];
      controller.currentCategory = "favorites";
      const results = controller.getFilteredData();
      expect(results.length).toBe(3);
      expect(results.map((r) => r.id)).toEqual(["guo_laoshi", "hsk_3_final", "puente_chino"]);
    });
  });

  describe("Personal Notes Storage", () => {
    it("saves and loads private notes per photo ID", () => {
      controller.saveNote("guo_laoshi", "Clase inolvidable sobre tonos y gramática.");
      expect(controller.loadNote("guo_laoshi")).toBe("Clase inolvidable sobre tonos y gramática.");
    });
  });

  describe("Mystery Chest (Baúl Sorpresa) & Proverbs", () => {
    it("has inspiring proverbs with translations", () => {
      expect(controller.proverbs.length).toBeGreaterThan(0);
      controller.proverbs.forEach((p) => {
        expect(p.hanzi).toBeTruthy();
        expect(p.pinyin).toBeTruthy();
        expect(p.es).toBeTruthy();
        expect(p.en).toBeTruthy();
      });
    });

    it("opens and closes mystery chest modal", () => {
      controller.render();
      controller.openMysteryChest();
      const modal = document.getElementById("memory-chest-modal");
      expect(modal.classList.contains("is-open")).toBe(true);

      controller.closeMysteryChest();
      expect(modal.classList.contains("is-open")).toBe(false);
    });
  });

  describe("Lightbox Modal & Navigation", () => {
    it("opens lightbox with correct image and details", () => {
      controller.render();
      controller.openLightbox(0);

      const modal = document.getElementById("memory-lightbox-modal");
      const img = document.getElementById("memory-lightbox-img");
      const hanzi = document.getElementById("memory-lightbox-hanzi");

      expect(modal.classList.contains("is-open")).toBe(true);
      expect(img.src).toContain("GuoLaoshi.jpg");
      expect(hanzi.textContent).toContain("郭老师");
    });

    it("navigates forward and backward in lightbox", () => {
      controller.render();
      controller.openLightbox(0);
      expect(controller.currentModalIndex).toBe(0);

      controller.navigateLightbox(1);
      expect(controller.currentModalIndex).toBe(1);

      controller.navigateLightbox(-1);
      expect(controller.currentModalIndex).toBe(0);
    });

    it("closes lightbox modal", () => {
      controller.render();
      controller.openLightbox(0);
      controller.closeLightbox();
      const modal = document.getElementById("memory-lightbox-modal");
      expect(modal.classList.contains("is-open")).toBe(false);
    });
  });

  describe("Audio Playback", () => {
    it("delegates pronunciation to app.audioController", () => {
      controller.playAudio("郭老师");
      expect(mockApp.audioController.playText).toHaveBeenCalledWith("郭老师");
    });
  });
});
