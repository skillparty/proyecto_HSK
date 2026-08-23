/**
 * UIController Module - Handles UI state and notifications
 * Extracted from app.js as part of modularization
 */
class UIController {
  constructor(app) {
    this.app = app;
    // Hidrataciones de panel en curso, por nombre de tab.
    this.pendingHydrations = new Map();
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

  // Baja el markup de un panel diferido y lo mete en su contenedor vacío. El
  // <div id="<tab>" class="tab-panel"> sí viaja en index.html: lo que falta es
  // su contenido, que escribe assemble-index.js en assets/partials/tabs/.
  //
  // Devuelve true si el panel quedó listo para que corra su init. Nunca
  // rechaza: un fallo de red se loguea y devuelve false, para no correr el init
  // sobre un panel vacío.
  hydrateTabPanel(tabName) {
    const panel = document.getElementById(tabName);
    if (!panel) return Promise.resolve(false);
    if (panel.dataset.hydrated === "true") return Promise.resolve(true);

    // Dos clicks rápidos sobre la misma pestaña no deben disparar dos fetches
    // ni inyectar el markup dos veces.
    const inFlight = this.pendingHydrations.get(tabName);
    if (inFlight) return inFlight;

    const url = `assets/partials/tabs/${tabName}.html`;
    const pending = fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`${response.status} al pedir ${url}`);
        panel.innerHTML = await response.text();
        panel.dataset.hydrated = "true";

        // El markup recién inyectado trae data-i18n sin traducir: sin esto la
        // pestaña aparece con los textos por defecto del template hasta el
        // próximo cambio de idioma.
        window.languageManager?.updateInterface?.();
        return true;
      })
      .catch((err) => {
        this.logError(`No se pudo cargar el markup de la pestaña ${tabName}`, err);
        return false;
      })
      .finally(() => this.pendingHydrations.delete(tabName));

    this.pendingHydrations.set(tabName, pending);
    return pending;
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

    const updateTabDOM = () => {
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
    };

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (typeof document !== "undefined" && typeof document.startViewTransition === "function" && !prefersReducedMotion) {
      const transition = document.startViewTransition(() => updateTabDOM());
      transition.finished.finally(() => {
        const heading = document.querySelector(`#${tabName} h2, #${tabName} h3, #${tabName}`);
        if (heading && typeof heading.focus === "function") {
          if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      });
    } else {
      updateTabDOM();
    }

    // Notify app to initialize tab-specific content
    this.handleTabInitialization(tabName);
    this.renderOnboardingHint(tabName);

    this.logDebug("📱 Switched to tab: " + tabName);
  }

  handleTabInitialization(tabName) {
    // Los paneles diferidos llegan vacíos: hay que inyectar su markup antes de
    // correr el init, que consulta el DOM de la pestaña.
    if (UIController.DEFERRED_TAB_PANELS.has(tabName)) {
      this.hydrateTabPanel(tabName).then((ready) => {
        if (ready) this.runTabInitialization(tabName);
      });
      return;
    }

    this.runTabInitialization(tabName);
  }

  runTabInitialization(tabName) {
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
        (async () => {
          try {
            if (!window.BrowseController) {
              await this.loadScript("assets/js/modules/browse-controller.js?v=6c8c3c15");
            }
            if (!this.app.browseController) {
              this.app.browseController = new window.BrowseController(this.app);
            }
            if (!this.app.browseInitialized) {
              this.app.initializeBrowse();
              this.app.browseInitialized = true;
            } else if (typeof this.app.browseController.onTabActivated === "function") {
              this.app.browseController.onTabActivated();
            }
          } catch (err) {
            this.logError("Failed to lazy load browse tab", err);
          }
        })();
        break;
      case "strokes-radicals":
        (async () => {
          try {
            if (!window.StrokesRadicalsCatalogData) {
              await this.loadScript("assets/js/modules/strokes-radicals-catalog-data.js");
            }
            if (!window.StrokesRadicalsPractice) {
              await this.loadScript("assets/js/modules/strokes-radicals-practice.js");
            }
            if (!window.HanziCanvasController) {
              await this.loadScript("assets/js/modules/hanzi-canvas-controller.js");
            }
            if (!window.StrokesRadicalsController) {
              await this.loadScript("assets/js/modules/strokes-radicals-controller.js?v=6369da31");
            }
            if (!this.app.strokesRadicalsController) {
              this.app.strokesRadicalsController = new window.StrokesRadicalsController(this.app);
            }
            this.app.initializeStrokesRadicals();
          } catch (err) {
            this.logError("Failed to lazy load strokes-radicals", err);
          }
        })();
        break;
      case "quiz":
        (async () => {
          try {
            if (!window.QuizEngine) {
              await this.loadScript("assets/js/modules/quiz-engine.js?v=0f8dc82d");
            }
            if (!window.QuizLegacyController) {
              await this.loadScript("assets/js/modules/quiz-legacy-controller.js?v=0c8d314f");
            }
            if (!this.app.quizEngine) {
              this.app.quizEngine = new window.QuizEngine(this.app);
            }
            if (!this.app.quizLegacyController) {
              this.app.quizLegacyController = new window.QuizLegacyController(this.app);
            }
            if (!this.app.quizInitialized) {
              this.app.initializeQuiz();
              this.app.quizInitialized = true;
            }
            this.app.renderQuizResumeAction();
          } catch (err) {
            this.logError("Failed to lazy load quiz tab", err);
          }
        })();
        break;
      case "past-exams":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/quantifier-snake-styles.css?v=73064cd6");
            if (!window.PastExamsQuestionBank) {
              await this.loadScript("assets/js/modules/past-exams-question-bank.js");
            }
            if (!window.PastExamsController) {
              await this.loadScript("assets/js/modules/past-exams-controller.js?v=380d4198");
            }
            if (!this.app.pastExamsController) {
              this.app.pastExamsController = new window.PastExamsController(this.app);
            }
            this.app.initializePastExams();
          } catch (err) {
            this.logError("Failed to lazy load past-exams", err);
          }
        })();
        break;
      case "tone-trainer":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/tone-trainer-styles.css");
            if (!window.ToneTrainerGame) {
              await this.loadScript("assets/js/tone-trainer-game.js");
            }
            if (!window.toneTrainerGame) {
              window.toneTrainerGame = new ToneTrainerGame(this.app);
            }
            window.toneTrainerGame.initialize();
          } catch (err) {
            this.logError("Failed to lazy load tone-trainer", err);
          }
        })();
        break;
      case "snake-quantifiers":
        (async () => {
          await this.loadStylesheet("assets/css/quantifier-snake-styles.css?v=73064cd6");
          try {
            if (!window.QuantifierSnakeUtils) {
              await this.loadScript("assets/js/modules/quantifier-snake-utils.js?v=cf878469");
            }
            if (!window.QuantifierSnakeCanvasRenderer) {
              await this.loadScript("assets/js/modules/quantifier-snake-canvas.js?v=11c68752");
            }
            if (!window.QuantifierSnakeController) {
              await this.loadScript("assets/js/modules/quantifier-snake-controller.js?v=a9fbbef3");
            }
            if (!window.QuantifierSnakeVersusRenderer) {
              await this.loadScript("assets/js/modules/quantifier-snake-versus-renderer.js");
            }
            if (!window.QuantifierSnakeVersusController) {
              await this.loadScript("assets/js/modules/quantifier-snake-versus.js?v=ff794386");
            }
            if (!this.app.quantifierSnakeController) {
              this.app.quantifierSnakeController = new window.QuantifierSnakeController(this.app);
            }
          } catch (err) {
            this.logError("Failed to lazy load quantifier snake scripts", err);
          }
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
        (async () => {
          try {
            if (!window.StatsController) {
              await this.loadScript("assets/js/modules/stats-controller.js?v=df78e753");
            }
            if (!this.app.statsController) {
              this.app.statsController = new window.StatsController(this.app);
            }
            this.app.updateStats();
          } catch (err) {
            this.logError("Failed to lazy load stats tab", err);
          }
        })();
        break;
      case "matrix":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/matrix-game-styles.css?v=1864034e");
            if (!window.GameStateManager) {
              await this.loadScript("assets/js/modules/game-engine.js");
            }
            if (!window.MatrixSessionController) {
              await this.loadScript("assets/js/modules/matrix-session-controller.js");
            }
            if (!window.MatrixScoreController) {
              await this.loadScript("assets/js/modules/matrix-score-controller.js");
            }
            if (typeof setupMatrixGameEventListeners === "undefined") {
              await this.loadScript("assets/js/matrix-game-events.js");
            }
            if (!window.MatrixGameView) {
              await this.loadScript("assets/js/matrix-game-view.js");
            }
            if (!window.MatrixGame) {
              await this.loadScript("assets/js/matrix-game.js?v=9da2483d");
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
              await this.loadScript("assets/js/leaderboard.js?v=104e8458");
            }
            // La instancia se crea acá, no en startup-controller: leaderboard.js
            // es lazy, así que al arrancar la app la clase todavía no existe y
            // aquella comprobación nunca se cumplía.
            if (!this.app.leaderboardManager && window.LeaderboardManager) {
              this.app.leaderboardManager = new window.LeaderboardManager();
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
            await this.loadStylesheet("assets/css/tones-invaders-styles.css?v=5821d4f3");
            if (!window.TonesInvadersRenderer) {
              await this.loadScript("assets/js/tones-invaders-renderer.js");
            }
            if (!window.TonesInvadersGame) {
              await this.loadScript("assets/js/tones-invaders-game.js?v=3dde898f");
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
            await this.loadStylesheet("assets/css/hanzi-builder-styles.css?v=6cfca79e");
            if (!window.HanziBuilderGame) {
              await this.loadScript("assets/js/hanzi-builder-game.js?v=745260cd");
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
            await this.loadStylesheet("assets/css/word-linker-styles.css?v=ba5d13f3");
            if (!window.WordLinkerGame) {
              await this.loadScript("assets/js/word-linker-game.js?v=d263c1b3");
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
      case "sentence-builder":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/sentence-builder-styles.css");
            if (!window.SentenceBuilderGame) {
              await this.loadScript("assets/js/sentence-builder-game.js");
            }
            if (!window.sentenceBuilderGame) {
              window.sentenceBuilderGame = new SentenceBuilderGame(this.app);
            }
            window.sentenceBuilderGame.initialize();
          } catch (err) {
            this.logError("Failed to lazy load sentence-builder-game", err);
          }
        })();
        break;
      case "etymology":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/etymology-styles.css?v=019824da");
            if (!window.EtymologyController) {
              await this.loadScript("assets/js/modules/etymology-controller.js?v=36ae41ab");
            }
            if (!window.etymologyController) {
              window.etymologyController = new EtymologyController(this.app);
            }
            this.app.etymologyController = window.etymologyController;
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
      case "videos":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/app-videos.css?v=f5735c3e");
            if (!window.VideosController) {
              await this.loadScript("assets/js/modules/videos-controller.js?v=3fc0373d");
            }
            if (!this.app.videosController) {
              this.app.videosController = new window.VideosController(this.app);
            }
            await this.app.videosController.init();
          } catch (err) {
            this.logError("videos init failed:", err);
          }
        })();
        break;
      case "memories":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/app-memories.css");
            if (!window.MemoriesController) {
              await this.loadScript("assets/js/modules/memories-controller.js");
            }
            if (!this.app.memoriesController) {
              this.app.memoriesController = new window.MemoriesController(this.app);
            }
            await this.app.memoriesController.init();
          } catch (err) {
            this.logError("memories init failed:", err);
          }
        })();
        break;
      case "writing-sheets":
        (async () => {
          try {
            await this.loadStylesheet("assets/css/app-writing-sheets.css");
            if (!window.WritingSheetsController) {
              await this.loadScript("assets/js/modules/writing-sheets-controller.js");
            }
            if (!this.app.writingSheetsController) {
              this.app.writingSheetsController = new window.WritingSheetsController(this.app);
            }
            await this.app.writingSheetsController.initialize();
          } catch (err) {
            this.logError("writing-sheets init failed:", err);
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
            "videos",
            "memories",
            "writing-sheets",
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
    // Toast styles are now in app-enhancements.css.
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

// Tabs cuyo markup NO viaja en index.html y se baja de assets/partials/tabs/
// al abrirlas. Tiene que coincidir con los `defer-include` de
// templates/index.template.html y con PRECACHE_FILES de sw.js — lo verifica
// scripts/ci/check-deferred-panels.js.
//
// home y practice quedan afuera por ser las pestañas de arranque. browse, quiz,
// past-exams y matrix también: su markup lo consultan scripts que corren en el
// boot (interaction-controller ata 15 listeners ahí), y diferirlo los dejaría
// enganchando a la nada, en silencio.
UIController.DEFERRED_TAB_PANELS = new Set([
  "strokes-radicals",
  "snake-quantifiers",
  "tones-invaders",
  "hanzi-builder",
  "word-linker",
  "sentence-builder",
  "tone-trainer",
  "stats",
  "leaderboard",
  "etymology",
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

window.UIController = UIController;
