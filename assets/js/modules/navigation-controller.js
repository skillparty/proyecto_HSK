class NavigationController {
  static get ALLOWED_TABS() {
    return new Set([
      "home",
      "etymology",
      "practice",
      "browse",
      "strokes-radicals",
      "quiz",
      "past-exams",
      "snake-quantifiers",
      "matrix",
      "tones-invaders",
      "hanzi-builder",
      "word-linker",
      "sentence-builder",
      "tone-trainer",
      "leaderboard",
      "stats",
      "culture-characters",
      "culture-medicine",
      "culture-opera",
      "culture-technology",
      "culture-clothing",
      "culture-arts",
      "videos",
      "memories",
      "writing-sheets",
    ]);
  }

  constructor(app) {
    this.app = app;

    if (!this.app.lastTabStorageKey) {
      // Desde el registro central en vez de repetir el literal: si no, cambiar
      // la clave en StorageController.KEYS no tendría ningún efecto acá.
      this.app.lastTabStorageKey = StorageController.KEYS.LAST_TAB;
    }

    if (!this.app.onboardingSessionStorageKey) {
      this.app.onboardingSessionStorageKey = "hsk-onboarding-state";
    }
  }

  switchTab(tabName) {
    this.app.uiController.switchTab(tabName);
  }

  loadLastVisitedTab() {
    try {
      const raw = localStorage.getItem(this.app.lastTabStorageKey);
      return raw || null;
    } catch (error) {
      this.app.logWarn("Error loading last tab:", error);
      return null;
    }
  }

  restoreLastVisitedTab() {
    const allowedTabs = NavigationController.ALLOWED_TABS;
    const savedTab = this.loadLastVisitedTab();

    if (!savedTab || !allowedTabs.has(savedTab)) {
      return;
    }

    if (!document.getElementById(savedTab)) {
      return;
    }

    this.switchTab(savedTab);
  }

  loadOnboardingState() {
    const defaults = {
      homeHintShown: false,
      moduleHintShown: false,
      homeHintDismissed: false,
      moduleHintDismissed: false,
    };

    try {
      const raw = sessionStorage.getItem(this.app.onboardingSessionStorageKey);
      if (!raw) {
        return { ...defaults };
      }

      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    } catch (error) {
      this.app.logWarn("Error loading onboarding state:", error);
      return { ...defaults };
    }
  }

  saveOnboardingState() {
    try {
      sessionStorage.setItem(
        this.app.onboardingSessionStorageKey,
        JSON.stringify(this.app.onboardingState || {}),
      );
    } catch (error) {
      this.app.logWarn("Error saving onboarding state:", error);
    }
  }

  isLearningModuleTab(tabName) {
    return [
      "practice",
      "browse",
      "strokes-radicals",
      "quiz",
      "past-exams",
      "snake-quantifiers",
      "matrix",
      "tones-invaders",
      "hanzi-builder",
      "word-linker",
      "leaderboard",
      "stats",
      "videos",
      "memories",
    ].includes(tabName);
  }

  getTabDisplayName(tabName) {
    const tabButton = document.querySelector(
      '.nav-tab[data-tab="' + tabName + '"]',
    );
    const labelElement = tabButton ? tabButton.querySelector("span") : null;
    const text =
      labelElement && labelElement.textContent
        ? labelElement.textContent.trim()
        : "";
    return text || tabName;
  }

  removeOnboardingHintFromTab(tabName) {
    const panel = document.getElementById(tabName);
    const existingHint = panel ? panel.querySelector(".onboarding-hint") : null;
    if (existingHint) {
      existingHint.remove();
    }
  }
}

window.NavigationController = NavigationController;
