import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import "../../assets/js/modules/home-cultural-portal-scene.js";
import "../../assets/js/modules/home-controller.js";

describe("HomeController - Daily Quests & Share Card", () => {
  let app;
  let controller;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="dashboard-welcome-title"></div>
      <div id="dashboard-welcome-subtitle"></div>
      <div id="dash-stat-studied"></div>
      <div id="dash-stat-streak"></div>
      <div id="dash-stat-accuracy"></div>
      <div id="quests-progress-badge"></div>
      <div id="daily-quests-container"></div>
    `;

    app = {
      currentLanguage: "es",
      stats: {
        totalStudied: 25,
        currentStreak: 7,
        todayCards: 12,
        correctAnswers: 23,
      },
      switchTab: vi.fn(),
      showToast: vi.fn(),
      audioController: {
        playChime: vi.fn(),
      },
      achievementManager: {
        unlock: vi.fn(),
        fireConfetti: vi.fn(),
        checkAll: vi.fn(),
      },
      logDebug: vi.fn(),
      logWarn: vi.fn(),
    };

    controller = new window.HomeController(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Daily Quests State Management", () => {
    it("returns default initial state when storage is empty", () => {
      const state = controller.getDailyQuestsState();
      expect(state).toEqual({
        srs: false,
        reader: false,
        tones: false,
        tutor: false,
        completedAll: false,
      });
    });

    it("saves and retrieves quest state for current date", () => {
      controller.saveDailyQuestsState({
        srs: true,
        reader: false,
        tones: true,
        tutor: false,
        completedAll: false,
      });

      const retrieved = controller.getDailyQuestsState();
      expect(retrieved.srs).toBe(true);
      expect(retrieved.tones).toBe(true);
      expect(retrieved.reader).toBe(false);
    });

    it("markQuestCompleted updates state and triggers celebration when all 4 are completed", () => {
      controller.saveDailyQuestsState({
        srs: true,
        reader: true,
        tones: true,
        tutor: false,
        completedAll: false,
      });

      controller.markQuestCompleted("tutor");

      const finalState = controller.getDailyQuestsState();
      expect(finalState.tutor).toBe(true);
      expect(finalState.completedAll).toBe(true);
      expect(app.achievementManager.unlock).toHaveBeenCalledWith("daily-champion");
      expect(app.achievementManager.fireConfetti).toHaveBeenCalled();
      expect(app.showToast).toHaveBeenCalled();
    });
  });

  describe("Share Text Generation", () => {
    const sampleQuests = [
      { id: "srs", title: "Repasa 10 tarjetas SRS", done: true },
      { id: "reader", title: "Lee 1 historia en el Lector Graduado", done: true },
      { id: "tones", title: "Entrena 1 ronda en el Entrenador de Tonos", done: false },
      { id: "tutor", title: "Completa 1 diálogo en el Tutor", done: false },
    ];

    it("generates formatted Spanish text with correct streak and quest checkboxes", () => {
      const text = controller.generateDailyQuestsShareText(sampleQuests, 5, true);
      expect(text).toContain("🎋 HSK Master - Mi Progreso Diario (2/4)");
      expect(text).toContain("🔥 Racha de estudio: 5 días");
      expect(text).toContain("✅ Repasa 10 tarjetas SRS");
      expect(text).toContain("✅ Lee 1 historia en el Lector Graduado");
      expect(text).toContain("⬜ Entrena 1 ronda en el Entrenador de Tonos");
      expect(text).toContain("⬜ Completa 1 diálogo en el Tutor");
      expect(text).toContain("¡Aprende chino mandarín conmigo en HSK Master! 🇨🇳");
    });

    it("generates formatted English text when requested", () => {
      const enQuests = [
        { id: "srs", title: "Review 10 SRS cards", done: true },
        { id: "reader", title: "Read 1 story in Graded Reader", done: true },
      ];
      const text = controller.generateDailyQuestsShareText(enQuests, 1, false);
      expect(text).toContain("🎋 HSK Master - Daily Study Progress (2/2)");
      expect(text).toContain("🔥 Study streak: 1 day");
      expect(text).toContain("✅ Review 10 SRS cards");
      expect(text).toContain("Learn Mandarin Chinese with me on HSK Master! 🇨🇳");
    });
  });

  describe("renderDailyQuests & UI elements", () => {
    it("renders quests list and streak share footer button", () => {
      controller.renderDailyQuests();

      const container = document.getElementById("daily-quests-container");
      expect(container).not.toBeNull();

      const shareBtn = container.querySelector("#share-daily-quests-btn");
      expect(shareBtn).not.toBeNull();
      expect(shareBtn.textContent).toContain("Compartir Racha");

      const badge = document.getElementById("quests-progress-badge");
      expect(badge.textContent).toContain("completadas");
    });

    it("navigates to the corresponding tab when a quest action button is clicked", () => {
      controller.renderDailyQuests();
      const container = document.getElementById("daily-quests-container");
      const ctaBtn = container.querySelector('.quest-cta-btn[data-target-tab="graded-reader"]');

      expect(ctaBtn).not.toBeNull();
      ctaBtn.click();
      expect(app.switchTab).toHaveBeenCalledWith("graded-reader");
    });
  });

  describe("shareDailyQuests Execution", () => {
    it("uses navigator.share when available", async () => {
      const shareMock = vi.fn().mockResolvedValue(true);
      navigator.share = shareMock;

      const quests = [{ id: "srs", title: "Test Quest", done: true }];
      const result = await controller.shareDailyQuests(quests, 10);

      expect(shareMock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("falls back to navigator.clipboard.writeText and shows a toast when navigator.share is unavailable", async () => {
      delete navigator.share;
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const quests = [{ id: "srs", title: "Test Quest", done: true }];
      const result = await controller.shareDailyQuests(quests, 10);

      expect(writeTextMock).toHaveBeenCalled();
      expect(app.showToast).toHaveBeenCalledWith(
        expect.stringContaining("copiado al portapapeles"),
        "success",
        3000
      );
      expect(result).toBe(true);
    });
  });
});
