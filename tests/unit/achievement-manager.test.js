import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/achievement-manager.js";

const stubApp = () => ({
  currentLanguage: "es",
  audioController: {
    playStreakFanfare: vi.fn(),
  },
  logDebug: vi.fn(),
  logWarn: vi.fn(),
});

describe("AchievementManager", () => {
  let app;
  let manager;

  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = `
      <div id="stats-achievements-grid"></div>
    `;

    app = stubApp();
    manager = new window.AchievementManager(app);
  });

  test("initializes with empty or loaded achievements", () => {
    expect(manager.unlockedIds.size).toBe(0);
    expect(manager.catalogue.length).toBeGreaterThan(5);
  });

  test("checkAll unlocks eligible achievements and updates points", () => {
    const stats = {
      totalStudied: 1,
      currentStreak: 7,
      snakeHighScore: 65,
    };

    const unlocked = manager.checkAll(stats);
    expect(unlocked.length).toBeGreaterThanOrEqual(3);
    expect(manager.unlockedIds.has("first_word")).toBe(true);
    expect(manager.unlockedIds.has("streak_7")).toBe(true);
    expect(manager.unlockedIds.has("snake_pro")).toBe(true);
    expect(manager.getTotalPoints()).toBeGreaterThan(0);
    expect(app.audioController.playStreakFanfare).toHaveBeenCalled();
  });

  test("does not duplicate already unlocked achievements", () => {
    const stats = { totalStudied: 10 };
    manager.checkAll(stats);
    const countBefore = manager.unlockedIds.size;

    const secondCheck = manager.checkAll(stats);
    expect(secondCheck.length).toBe(0);
    expect(manager.unlockedIds.size).toBe(countBefore);
  });

  test("renderShowcase builds filterable trophy showcase", () => {
    manager.unlockedIds.add("first_word");
    manager.renderShowcase("stats-achievements-grid", { totalStudied: 20 });

    const grid = document.getElementById("ach-cards-grid");
    expect(grid).not.toBeNull();
    expect(grid.children.length).toBe(manager.catalogue.length);

    // Test category filter buttons
    const studyBtn = document.querySelector('.ach-filter-btn[data-filter="study"]');
    if (studyBtn) {
      studyBtn.click();
      const studyCount = manager.catalogue.filter((a) => a.category === "study").length;
      expect(grid.children.length).toBe(studyCount);
    }
  });

  test("showToast creates and displays celebration banner", () => {
    manager.showToast({
      icon: "🏆",
      title: "Test Achievement",
      desc: "Test Description",
      points: 25,
    });

    const toast = document.querySelector(".ach-toast");
    expect(toast).not.toBeNull();
    expect(toast.textContent).toContain("Test Achievement");
  });
});
