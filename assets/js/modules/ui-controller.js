/**
 * UIController Module - Handles UI state and notifications
 * Extracted from app.js as part of modularization
 */
class UIController {
  constructor(app) {
    this.app = app;
    this.logDebug("📱 UIController module initialized");
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${url}`));
      document.body.appendChild(script);
    });
  }

  getLogger() {
    return window.hskLogger || console;
  }

  logDebug(...args) {
    this.getLogger().debug(...args);
  }

  logWarn(...args) {
    this.getLogger().warn(...args);
  }

  logError(...args) {
    this.getLogger().error(...args);
  }

  switchTab(tabName) {
    const oldTab = this.app.currentTab;

    // Update app orchestrator state
    this.app.currentTab = tabName;

    // Pause matrix game if leaving matrix tab
    if (oldTab === "matrix" && window.matrixGame && window.matrixGame.isPlaying && !window.matrixGame.isPaused) {
      this.logDebug("⏸️ Auto-pausing Matrix Game because user switched tabs");
      window.matrixGame.togglePause();
    }
    if (oldTab === "tones-invaders" && window.tonesInvadersGame && window.tonesInvadersGame.state.isPlaying && !window.tonesInvadersGame.state.isPaused) {
      window.tonesInvadersGame.togglePause();
    }
    if (oldTab === "hanzi-builder" && window.hanziBuilderGame && window.hanziBuilderGame.state.isPlaying && !window.hanziBuilderGame.state.isPaused) {
      window.hanziBuilderGame.togglePause();
    }
    if (oldTab === "word-linker" && window.wordLinkerGame && window.wordLinkerGame.state.isPlaying && !window.wordLinkerGame.state.isPaused) {
      window.wordLinkerGame.togglePause();
    }

    try {
      localStorage.setItem(this.app.lastTabStorageKey, tabName);
    } catch (error) {
      this.logWarn("⚠️ Error saving last tab:", error);
    }

    // Hide all tabs
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.remove("active");
      panel.style.display = "none";
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
      selectedTab.classList.add("active");
      selectedTab.style.display = "block";
    }

    // Update navigation state
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    // Deactivate all dropdown items and groups
    document.querySelectorAll(".nav-dropdown-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.tab === tabName);
    });
    document.querySelectorAll(".nav-group").forEach((group) => {
      group.classList.remove("parent-active");
    });

    // If the target tab is inside a dropdown group, make that group parent-active
    const activeDropdownItem = document.querySelector(`.nav-dropdown-item[data-tab="${tabName}"]`);
    if (activeDropdownItem) {
      const parentGroup = activeDropdownItem.closest(".nav-group");
      if (parentGroup) {
        parentGroup.classList.add("parent-active");
      }
    }

    // Notify app to initialize tab-specific content
    this.handleTabInitialization(tabName);
    this.renderOnboardingHint(tabName);

    this.logDebug("📱 Switched to tab: " + tabName);
  }

  handleTabInitialization(tabName) {
    switch (tabName) {
      case "home":
        if (this.app.homeController && typeof this.app.homeController.renderDashboard === "function") {
          this.app.homeController.renderDashboard();
        }
        break;
      case "browse":
        if (!this.app.browseInitialized) {
          this.app.initializeBrowse();
          this.app.browseInitialized = true;
        }
        break;
      case "strokes-radicals":
        this.app.initializeStrokesRadicals();
        break;
      case "quiz":
        if (!this.app.quizInitialized) {
          this.app.initializeQuiz();
          this.app.quizInitialized = true;
        }
        if (this.app.quizEngine) {
          this.app.renderQuizResumeAction();
        }
        break;
      case "past-exams":
        this.app.initializePastExams();
        break;
      case "snake-quantifiers":
        if (!this.app.snakeQuantifierInitialized) {
          const initResult = this.app.initializeQuantifierSnake();

          if (initResult && typeof initResult.then === "function") {
            initResult
              .then(() => {
                this.app.snakeQuantifierInitialized = Boolean(
                  this.app.quantifierSnakeController &&
                  this.app.quantifierSnakeController.isInitialized,
                );

                if (this.app.snakeQuantifierInitialized) {
                  this.app.resumeQuantifierSnakeIfNeeded();
                }
              })
              .catch((error) => {
                this.app.snakeQuantifierInitialized = false;
                this.logError(
                  "Failed to initialize quantifier snake tab:",
                  error,
                );
              });
          } else {
            this.app.snakeQuantifierInitialized = Boolean(
              this.app.quantifierSnakeController &&
              this.app.quantifierSnakeController.isInitialized,
            );
          }
        } else {
          this.app.resumeQuantifierSnakeIfNeeded();
        }
        break;
      case "stats":
        this.app.updateStats();
        break;
      case "matrix":
        if (!this.app.matrixInitialized) {
          this.app.initializeMatrixGame();
          this.app.matrixInitialized = true;
        } else if (this.app.matrixController) {
          this.app.matrixController.initialize();
        }
        break;
      case "leaderboard":
        if (!this.app.leaderboardInitialized) {
          this.app.initializeLeaderboard();
          this.app.leaderboardInitialized = true;
        }
        break;
      case "tones-invaders":
        (async () => {
          try {
            if (!window.TonesInvadersGame) {
              await this.loadScript("assets/js/tones-invaders-game.js?v=4");
            }
            if (!window.tonesInvadersGame) {
              window.tonesInvadersGame = new TonesInvadersGame(this.app);
            }
            window.tonesInvadersGame.initialize();
          } catch (err) {
            this.logError("Failed to lazy load tones-invaders-game", err);
          }
        })();
        break;
      case "hanzi-builder":
        (async () => {
          try {
            if (!window.HanziBuilderGame) {
              await this.loadScript("assets/js/hanzi-builder-game.js?v=2");
            }
            if (!window.hanziBuilderGame) {
              window.hanziBuilderGame = new HanziBuilderGame(this.app);
            }
            window.hanziBuilderGame.initialize();
          } catch (err) {
            this.logError("Failed to lazy load hanzi-builder-game", err);
          }
        })();
        break;
      case "word-linker":
        (async () => {
          try {
            if (!window.WordLinkerGame) {
              await this.loadScript("assets/js/word-linker-game.js?v=2");
            }
            if (!window.wordLinkerGame) {
              window.wordLinkerGame = new WordLinkerGame(this.app);
            }
            window.wordLinkerGame.initialize();
          } catch (err) {
            this.logError("Failed to lazy load word-linker-game", err);
          }
        })();
        break;
      case "culture-characters":
        try {
          if (!window.characterEvolutionModule && window.CharacterEvolutionModule) {
            window.characterEvolutionModule = new CharacterEvolutionModule(this.app);
          }
          if (window.characterEvolutionModule) {
            window.characterEvolutionModule.initialize();
          }
        } catch (err) {
          this.logError("Failed to initialize character-evolution", err);
        }
        break;
      case "culture-medicine":
        try {
          if (!window.traditionalMedicineModule && window.TraditionalMedicineModule) {
            window.traditionalMedicineModule = new TraditionalMedicineModule(this.app);
          }
          if (window.traditionalMedicineModule) {
            window.traditionalMedicineModule.initialize();
          }
        } catch (err) {
          this.logError("Failed to initialize traditional-medicine", err);
        }
        break;
      case "culture-opera":
        try {
          if (!window.pekingOperaModule && window.PekingOperaModule) {
            window.pekingOperaModule = new PekingOperaModule(this.app);
          }
          if (window.pekingOperaModule) {
            window.pekingOperaModule.initialize();
          }
        } catch (err) {
          this.logError("Failed to initialize peking-opera", err);
        }
        break;
      case "culture-technology":
        try {
          if (!window.chineseTechnologyModule && window.ChineseTechnologyModule) {
            window.chineseTechnologyModule = new ChineseTechnologyModule(this.app);
          }
          if (window.chineseTechnologyModule) {
            window.chineseTechnologyModule.initialize();
          }
        } catch (err) {
          this.logError("Failed to initialize chinese-technology", err);
        }
        break;
    }
  }

  restoreLastVisitedTab() {
    const allowedTabs =
      window.NavigationController && NavigationController.ALLOWED_TABS
        ? NavigationController.ALLOWED_TABS
        : new Set([
            "home",
            "practice",
            "browse",
            "strokes-radicals",
            "quiz",
            "past-exams",
            "snake-quantifiers",
            "matrix",
            "leaderboard",
            "stats",
            "culture-characters",
            "culture-medicine",
            "culture-opera",
            "culture-technology",
          ]);
    try {
      const savedTab = localStorage.getItem(this.app.lastTabStorageKey);
      if (
        savedTab &&
        allowedTabs.has(savedTab) &&
        document.getElementById(savedTab)
      ) {
        this.switchTab(savedTab);
      }
    } catch (e) {
      this.logWarn("Tab restore error:", e);
    }
  }

  showToast(message, type = "info", duration = 3500, action = null) {
    if (!message) return;

    this.ensureToastStyles();

    let container = document.getElementById("hsk-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "hsk-toast-container";
      container.className = "hsk-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `hsk-toast hsk-toast-${type} ${action ? "hsk-toast-has-action" : ""}`;

    const textSpan = document.createElement("span");
    textSpan.className = "hsk-toast-text";
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (action && typeof action.callback === "function") {
      const btn = document.createElement("button");
      btn.className = "hsk-toast-action";
      btn.textContent = action.label || "OK";
      btn.setAttribute("aria-label", action.label || "OK");
      btn.onclick = (e) => {
        e.stopPropagation();
        action.callback();
        toast.classList.add("hide");
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      };
      toast.appendChild(btn);
    }

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    // Only auto-hide if there's no persistent action, or specify long duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add("hide");
          setTimeout(() => {
            if (toast.parentNode) toast.remove();
          }, 300);
        }
      }, duration);
    }
  }

  showUpdateToast(callback) {
    const message =
      this.app.getTranslation("updateAvailable") || "New version available";
    const label = this.app.getTranslation("updateAction") || "Update";

    this.showToast(message, "info", 0, {
      label,
      callback,
    });
  }

  showError(message) {
    this.logError("❌ Error:", message);
    this.showToast(message, "error", 4000);
  }

  ensureToastStyles() {
    // Toast styles are now in styles-professional.css.
    // This method is kept for backward compatibility but no longer injects inline CSS.
    // If the stylesheet somehow failed to load, styles degrade gracefully.
  }

  renderOnboardingHint(tabName) {
    const panel = document.getElementById(tabName);
    if (!panel || !this.app.onboardingState) return;

    // Remove existing hint
    const existing = panel.querySelector(".onboarding-hint");
    if (existing) existing.remove();

    let hintType = null;
    let hintMessage = "";

    if (
      tabName === "home" &&
      !this.app.onboardingState.homeHintShown &&
      !this.app.onboardingState.homeHintDismissed
    ) {
      hintType = "home";
      hintMessage =
        this.app.getTranslation("onboardingHomeHint") ||
        "Welcome! Start in Practice and then try Quiz or Matrix to build streak.";
      this.app.onboardingState.homeHintShown = true;
    } else if (
      this.app.isLearningModuleTab(tabName) &&
      !this.app.onboardingState.moduleHintShown &&
      !this.app.onboardingState.moduleHintDismissed
    ) {
      const moduleName = this.getTabDisplayName(tabName);
      hintType = "module";
      hintMessage =
        this.app.getTranslation("onboardingModuleHint", {
          module: moduleName,
        }) ||
        `Tip: In ${moduleName}, complete a quick action to generate progress.`;
      this.app.onboardingState.moduleHintShown = true;
    }

    if (!hintType) {
      this.app.saveOnboardingState();
      return;
    }

    const hint = document.createElement("div");
    hint.className = `onboarding-hint onboarding-hint--${hintType}`;
    hint.innerHTML = `
            <div class="onboarding-hint-content">
                <span class="onboarding-hint-icon" aria-hidden="true">💡</span>
                <span class="onboarding-hint-text">${hintMessage}</span>
            </div>
            <button type="button" class="onboarding-hint-close" aria-label="Close">×</button>
        `;

    hint
      .querySelector(".onboarding-hint-close")
      .addEventListener("click", () => {
        if (hintType === "home")
          this.app.onboardingState.homeHintDismissed = true;
        else this.app.onboardingState.moduleHintDismissed = true;
        this.app.saveOnboardingState();
        hint.remove();
      });

    panel.prepend(hint);
    this.app.saveOnboardingState();
  }

  getTabDisplayName(tabName) {
    const tabButton = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    return tabButton?.querySelector("span")?.textContent?.trim() || tabName;
  }
}
