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
    // Deduplicate: resolve immediately if already injected
    if (document.querySelector(`script[src="${url}"]`)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${url}`));
      document.body.appendChild(script);
    });
  }

  loadStylesheet(url) {
    // Deduplicate: resolve immediately if already injected
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return Promise.resolve();
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => {
        this.logWarn(`Stylesheet failed to load: ${url}`);
        resolve(); // non-fatal — game still usable without styles
      };
      document.head.appendChild(link);
    });
  }

  async loadGameAssets({ css = [], js = [] } = {}) {
    await Promise.all([
      ...css.map((u) => this.loadStylesheet(u)),
      ...js.map((u) => this.loadScript(u)),
    ]);
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

    // Expose active tab to CSS (mural backdrop renders on home only)
    document.documentElement.setAttribute("data-active-tab", tabName);

    // Pause matrix game if leaving matrix tab
    if (
      oldTab === "matrix" &&
      window.matrixGame &&
      window.matrixGame.isPlaying &&
      !window.matrixGame.isPaused
    ) {
      this.logDebug("⏸️ Auto-pausing Matrix Game because user switched tabs");
      window.matrixGame.togglePause();
    }
    if (
      oldTab === "tones-invaders" &&
      window.tonesInvadersGame &&
      window.tonesInvadersGame.state.isPlaying &&
      !window.tonesInvadersGame.state.isPaused
    ) {
      window.tonesInvadersGame.togglePause();
    }
    
    if (tabName === "tones-invaders" && window.tonesInvadersGame) {
        // Delay slight to ensure display block is fully applied before measuring
        setTimeout(() => window.tonesInvadersGame.resizeCanvas(), 50);
    }
    if (
      oldTab === "hanzi-builder" &&
      window.hanziBuilderGame &&
      window.hanziBuilderGame.state.isPlaying &&
      !window.hanziBuilderGame.state.isPaused
    ) {
      window.hanziBuilderGame.togglePause();
    }
    if (
      oldTab === "word-linker" &&
      window.wordLinkerGame &&
      window.wordLinkerGame.state.isPlaying &&
      !window.wordLinkerGame.state.isPaused
    ) {
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
    const activeDropdownItem = document.querySelector(
      `.nav-dropdown-item[data-tab="${tabName}"]`,
    );
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
        if (
          this.app.homeController &&
          typeof this.app.homeController.renderDashboard === "function"
        ) {
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
        (async () => {
          await this.loadStylesheet("assets/css/quantifier-snake-styles.css?v=8");
          this.app.initializePastExams();
        })();
        break;
      case "snake-quantifiers":
        (async () => {
          await this.loadStylesheet("assets/css/quantifier-snake-styles.css?v=8");
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
                  this.logError("Failed to initialize quantifier snake tab:", error);
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
        })();
        break;
      case "stats":
        this.app.updateStats();
        break;
      case "matrix":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/matrix-game-styles.css?v=7");
            if (!window.GameStateManager) {
              await this.loadScript("assets/js/modules/game-engine.js");
            }
            if (!window.MatrixSessionController) {
              await this.loadScript("assets/js/modules/matrix-session-controller.js");
            }
            if (!window.MatrixScoreController) {
              await this.loadScript("assets/js/modules/matrix-score-controller.js");
            }
            if (!window.MatrixGame) {
              await this.loadScript("assets/js/matrix-game.js?v=3");
            }
            if (typeof renderMatrixGameInterface === "undefined") {
              await this.loadScript("assets/js/matrix-game-ui.js");
            }
            if (!this.app.matrixInitialized) {
              this.app.initializeMatrixGame();
              this.app.matrixInitialized = true;
            } else if (this.app.matrixController) {
              this.app.matrixController.initialize();
            }
          } catch (err) {
            this.logError("Failed to lazy load matrix game", err);
          }
        })();
        break;
      case "leaderboard":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/leaderboard-styles.css");
            if (!window.LeaderboardManager) {
              await this.loadScript("assets/js/leaderboard.js?v=2");
            }
            if (!this.app.leaderboardInitialized) {
              this.app.initializeLeaderboard();
              this.app.leaderboardInitialized = true;
            }
          } catch (err) {
            this.logError("Failed to lazy load leaderboard", err);
          }
        })();
        break;
      case "tones-invaders":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/tones-invaders-styles.css?v=3");
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
            await this.loadStylesheet("assets/css/hanzi-builder-styles.css?v=2");
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
            await this.loadStylesheet("assets/css/word-linker-styles.css?v=2");
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
      case "etymology":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/etymology-styles.css?v=2");
            if (!window.EtymologyController) {
              await this.loadScript("assets/js/modules/etymology-controller.js?v=2");
            }
            if (!window.etymologyController) {
              window.etymologyController = new EtymologyController(this.app);
            }
            await window.etymologyController.initialize();
          } catch (err) {
            this.logError("etymology init failed:", err);
          }
        })();
        break;
      case "culture-characters":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.CharacterEvolutionModule) {
              await this.loadScript("assets/js/modules/culture/character-evolution.js");
            }
            if (!window.characterEvolutionModule) {
              window.characterEvolutionModule = new CharacterEvolutionModule(this.app);
            }
            await window.characterEvolutionModule.initialize();
          } catch (err) {
            this.logError("culture-characters init failed:", err);
          }
        })();
        break;
      case "culture-medicine":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.TraditionalMedicineModule) {
              await this.loadScript("assets/js/modules/culture/traditional-medicine.js");
            }
            if (!window.traditionalMedicineModule) {
              window.traditionalMedicineModule = new TraditionalMedicineModule(this.app);
            }
            await window.traditionalMedicineModule.initialize();
          } catch (err) {
            this.logError("culture-medicine init failed:", err);
          }
        })();
        break;
      case "culture-opera":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.PekingOperaModule) {
              await this.loadScript("assets/js/modules/culture/peking-opera.js");
            }
            if (!window.pekingOperaModule) {
              window.pekingOperaModule = new PekingOperaModule(this.app);
            }
            await window.pekingOperaModule.initialize();
          } catch (err) {
            this.logError("culture-opera init failed:", err);
          }
        })();
        break;
      case "culture-technology":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.ChineseTechnologyModule) {
              await this.loadScript("assets/js/modules/culture/chinese-technology.js");
            }
            if (!window.chineseTechnologyModule) {
              window.chineseTechnologyModule = new ChineseTechnologyModule(this.app);
            }
            await window.chineseTechnologyModule.initialize();
          } catch (err) {
            this.logError("culture-technology init failed:", err);
          }
        })();
        break;
      case "culture-clothing":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.EthnicClothingModule) {
              await this.loadScript("assets/js/modules/culture/ethnic-clothing.js");
            }
            if (!window.ethnicClothingModule) {
              window.ethnicClothingModule = new EthnicClothingModule(this.app);
            }
            await window.ethnicClothingModule.initialize();
          } catch (err) {
            this.logError("culture-clothing init failed:", err);
          }
        })();
        break;
      case "culture-arts":
        (async () => {
          try {
            if (!window.CultureModuleBase) {
              await this.loadScript("assets/js/modules/culture/culture-module-base.js");
            }
            if (!window.TraditionalArtsModule) {
              await this.loadScript("assets/js/modules/culture/traditional-arts.js");
            }
            if (!window.traditionalArtsModule) {
              window.traditionalArtsModule = new TraditionalArtsModule(this.app);
            }
            await window.traditionalArtsModule.initialize();
          } catch (err) {
            this.logError("culture-arts init failed:", err);
          }
        })();
        break;
    }
  }

  restoreLastVisitedTab() {
    const allowedTabs =
      window.NavigationController && NavigationController.ALLOWED_TABS
        ? NavigationController.ALLOWED_TABS
        : new Set([
            "home",
            "etymology",
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
            "culture-clothing",
            "culture-arts",
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
