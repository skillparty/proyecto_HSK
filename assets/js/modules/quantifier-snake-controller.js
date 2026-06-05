class QuantifierSnakeController {
  constructor(app) {
    this.app = app;

    this.boardSize = 18;
    this.maxLives = 3;
    this.defaultCanvasSize = 540;
    this.dataFilePath = "assets/data/quantifier_snake_words.json";

    this.quantifierColors = {
      ge: "#f97316",
      ben: "#2563eb",
      zhi: "#a855f7",
      zhang: "#14b8a6",
      tiao: "#22c55e",
      bei: "#f59e0b",
      wan: "#06b6d4",
      liang: "#ef4444",
      jian: "#8b5cf6",
    };

    this.difficultyConfig = {
      easy: {
        speedMs: 220,
        wordCount: 6,
        compatibleRatio: 0.5,
        showColorHints: true,
        pointsPerHit: 10,
      },
      normal: {
        speedMs: 165,
        wordCount: 8,
        compatibleRatio: 0.38,
        showColorHints: true,
        pointsPerHit: 14,
      },
      hard: {
        speedMs: 130,
        wordCount: 9,
        compatibleRatio: 0.28,
        showColorHints: false,
        pointsPerHit: 18,
      },
    };

    this.data = {
      quantifiers: [],
      words: [],
    };

    this.wordsByQuantifier = new Map();

    this.state = this.createDefaultState();
    this.directionQueue = [];
    this.loopHandle = null;
    this.isInitialized = false;
    this.eventsBound = false;
    this.isDataReady = false;
    this.dataLoadPromise = null;
    this.initializationPromise = null;

    this.boundResize = this.syncCanvasSize.bind(this);
    this.boundKeyDown = this.handleGlobalKeyDown.bind(this);
    this.renderer =
      typeof QuantifierSnakeCanvasRenderer === "function"
        ? new QuantifierSnakeCanvasRenderer(this)
        : null;
  }

  createDefaultState() {
    return {
      difficulty: "easy",
      score: 0,
      lives: this.maxLives,
      isRunning: false,
      isPaused: false,
      snake: [],
      direction: { x: 1, y: 0 },
      queuedDirection: { x: 1, y: 0 },
      foods: [],
      targetQuantifier: null,
      autoPausedByNavigation: false,
      feedback: {
        key: "snakeQuantifierIdleFeedback",
        replacements: {},
        type: "info",
      },
    };
  }

  async initialize() {
    if (this.isInitialized) {
      this.refreshLanguage();
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      if (
        !this.renderer &&
        typeof QuantifierSnakeCanvasRenderer === "function"
      ) {
        this.renderer = new QuantifierSnakeCanvasRenderer(this);
      }

      this.root = document.getElementById("snake-quantifiers");
      if (!this.root) {
        return;
      }

      this.cacheElements();
      await this.loadData();
      this.bindEvents();
      this.syncCanvasSize();

      this.isInitialized = true;
      this.showSetup();
      this.refreshLanguage();
      this.render();

      this.app.logDebug("🐍 QuantifierSnakeController initialized");
    })();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  cacheElements() {
    this.setupPanel = document.getElementById("snakeq-setup");
    this.gamePanel = document.getElementById("snakeq-game");
    this.difficultySelect = document.getElementById("snakeq-difficulty");
    this.startButton = document.getElementById("snakeq-start");
    this.restartButton = document.getElementById("snakeq-restart");
    this.pauseButton = document.getElementById("snakeq-pause");
    this.backToSetupButton = document.getElementById("snakeq-back");
    this.canvasWrap = document.getElementById("snakeq-board-wrap");
    this.canvas = document.getElementById("snakeq-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.scoreValue = document.getElementById("snakeq-score");
    this.livesValue = document.getElementById("snakeq-lives");
    this.modeValue = document.getElementById("snakeq-mode");
    this.targetBadge = document.getElementById("snakeq-target-badge");
    this.feedbackNode = document.getElementById("snakeq-feedback");
  }

  bindEvents() {
    if (this.eventsBound) {
      return;
    }

    if (this.startButton) {
      this.startButton.addEventListener("click", () => {
        this.startGame();
      });
    }

    if (this.restartButton) {
      this.restartButton.addEventListener("click", () => {
        this.startGame();
      });
    }

    if (this.pauseButton) {
      this.pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }

    if (this.backToSetupButton) {
      this.backToSetupButton.addEventListener("click", () => {
        this.showSetup();
      });
    }

    if (this.difficultySelect) {
      this.difficultySelect.addEventListener("change", () => {
        const selected = this.getSelectedDifficulty();
        this.state.difficulty = selected;
        this.updateModeLabel();
        this.updateTargetBadge();
      });
    }

    // Cache D-pad elements
    this.btnUp = document.getElementById("snakeq-btn-up");
    this.btnDown = document.getElementById("snakeq-btn-down");
    this.btnLeft = document.getElementById("snakeq-btn-left");
    this.btnRight = document.getElementById("snakeq-btn-right");

    const addDirectionTrigger = (element, dir) => {
      if (!element) return;
      const handler = (e) => {
        e.preventDefault();
        this.addDirectionInput(dir);
      };
      element.addEventListener("click", handler);
      element.addEventListener("touchstart", handler, { passive: false });
    };

    addDirectionTrigger(this.btnUp, { x: 0, y: -1 });
    addDirectionTrigger(this.btnDown, { x: 0, y: 1 });
    addDirectionTrigger(this.btnLeft, { x: -1, y: 0 });
    addDirectionTrigger(this.btnRight, { x: 1, y: 0 });

    // Swipe controls on canvas wrapper
    const canvasWrap = this.canvasWrap || this.canvas;
    if (canvasWrap) {
      let touchStartX = 0;
      let touchStartY = 0;

      canvasWrap.addEventListener("touchstart", (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      canvasWrap.addEventListener("touchend", (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;
        const threshold = 30; // pixels

        if (Math.max(Math.abs(diffX), Math.abs(diffY)) < threshold) {
          return;
        }

        let nextDirection = null;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          nextDirection = diffX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
          nextDirection = diffY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        this.addDirectionInput(nextDirection);
      }, { passive: true });
    }

    window.addEventListener("resize", this.boundResize);
    document.addEventListener("keydown", this.boundKeyDown);
    this.eventsBound = true;
  }

  async loadData() {
    if (this.dataLoadPromise) {
      return this.dataLoadPromise;
    }

    this.dataLoadPromise = (async () => {
      try {
        const response = await fetch(this.dataFilePath);
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        const payload = await response.json();
        const normalized = QuantifierSnakeUtils.normalizeData(payload);
        if (!normalized) {
          throw new Error("Invalid data payload");
        }

        this.data = normalized;
        this.wordsByQuantifier = QuantifierSnakeUtils.buildWordLookup(
          this.data,
        );
        this.isDataReady = true;
      } catch (error) {
        this.app.logError("Quantifier snake data load failed:", error);
        this.isDataReady = false;
        this.setFeedback("snakeQuantifierLoadError", {}, "danger");
      } finally {
        this.dataLoadPromise = null;
      }
    })();

    return this.dataLoadPromise;
  }

  getSelectedDifficulty() {
    const selected = this.difficultySelect
      ? this.difficultySelect.value
      : "easy";
    if (!this.difficultyConfig[selected]) {
      return "easy";
    }

    return selected;
  }

  startGame() {
    if (!this.isDataReady) {
      this.setFeedback("snakeQuantifierLoadRetrying", {}, "warning");
      this.renderFeedback();

      this.loadData().then(() => {
        if (this.isDataReady) {
          this.startGame();
          return;
        }

        this.setFeedback("snakeQuantifierLoadError", {}, "danger");
        this.renderFeedback();
      });

      return;
    }

    this.stopLoop();

    this.state = this.createDefaultState();
    this.state.difficulty = this.getSelectedDifficulty();

    this.resetSnakePosition();
    this.selectNextTarget();
    this.spawnFoodsForTarget();

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.autoPausedByNavigation = false;
    this.setFeedback("snakeQuantifierStartFeedback", {}, "info");

    this.showGame();
    this.startLoop();
    this.render();
  }

  showSetup() {
    this.stopLoop();

    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.foods = [];
    this.state.snake = [];

    if (this.setupPanel) {
      this.setupPanel.style.display = "block";
    }

    if (this.gamePanel) {
      this.gamePanel.style.display = "none";
    }

    if (this.isDataReady) {
      this.setFeedback("snakeQuantifierIdleFeedback", {}, "info");
    } else {
      this.setFeedback("snakeQuantifierLoadError", {}, "danger");
    }

    this.updatePauseButtonLabel();
    this.render();
  }

  showGame() {
    if (this.setupPanel) {
      this.setupPanel.style.display = "none";
    }

    if (this.gamePanel) {
      this.gamePanel.style.display = "block";
    }

    this.syncCanvasSize();
    this.updatePauseButtonLabel();
  }

  startLoop() {
    const config =
      this.difficultyConfig[this.state.difficulty] ||
      this.difficultyConfig.easy;

    this.stopLoop();
    this.loopHandle = setInterval(() => {
      this.tick();
    }, config.speedMs);
  }

  stopLoop() {
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
  }

  tick() {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    if (this.app.currentTab !== "snake-quantifiers") {
      this.state.isPaused = true;
      this.state.autoPausedByNavigation = true;
      this.stopLoop();
      this.setFeedback("snakeQuantifierAutoPausedFeedback", {}, "info");
      this.updatePauseButtonLabel();
      this.render();
      return;
    }

    if (this.directionQueue.length > 0) {
      this.state.direction = this.directionQueue.shift();
    }

    const currentHead = this.state.snake[0];
    const nextHead = {
      x: currentHead.x + this.state.direction.x,
      y: currentHead.y + this.state.direction.y,
    };

    const foodIndex = this.state.foods.findIndex(
      (food) => food.x === nextHead.x && food.y === nextHead.y,
    );
    const nextFood = foodIndex >= 0 ? this.state.foods[foodIndex] : null;
    const willGrow = Boolean(nextFood && nextFood.compatible);
    const snakeBodyToCheck = willGrow
      ? this.state.snake
      : this.state.snake.slice(0, -1);

    if (
      this.isOutsideBoard(nextHead) ||
      this.isSnakeCollision(nextHead, snakeBodyToCheck)
    ) {
      // Play particle explosion at head coordinates
      if (typeof window.createParticles === "function" && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        const x = rect.left + (currentHead.x + 0.5) * this.cellSize;
        const y = rect.top + (currentHead.y + 0.5) * this.cellSize;
        window.createParticles(x, y, '#ef4444');
      }

      this.consumeLife("collision");
      return;
    }

    this.state.snake.unshift(nextHead);

    if (foodIndex === -1) {
      this.state.snake.pop();
      this.render();
      return;
    }

    const eatenFood = this.state.foods[foodIndex];
    this.state.foods.splice(foodIndex, 1);

    if (eatenFood.compatible) {
      const config =
        this.difficultyConfig[this.state.difficulty] ||
        this.difficultyConfig.easy;
      this.state.score += config.pointsPerHit;

      this.setFeedback(
        "snakeQuantifierCorrectFeedback",
        {
          word: eatenFood.word?.hanzi ?? "",
          quantifier: this.state.targetQuantifier?.hanzi ?? "",
        },
        "success",
      );

      // Play audio pronunciation of the eaten word
      if (this.app && typeof this.app.playAudio === "function" && eatenFood.word?.hanzi) {
        this.app.playAudio(eatenFood.word.hanzi);
      }

      // Play game coin sound
      if (this.app.audioController) {
        this.app.audioController.playGameCoin();
      }

      // Play particle explosion at coordinates
      if (typeof window.createParticles === "function" && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        const x = rect.left + (eatenFood.x + 0.5) * this.cellSize;
        const y = rect.top + (eatenFood.y + 0.5) * this.cellSize;
        window.createParticles(x, y, this.getTargetColor());
      }

      this.selectNextTarget();
      this.spawnFoodsForTarget();
    } else {
      // Cancel growth when the selected word is not compatible.
      this.state.snake.pop();

      // Play particle explosion at coordinates
      if (typeof window.createParticles === "function" && this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        const x = rect.left + (eatenFood.x + 0.5) * this.cellSize;
        const y = rect.top + (eatenFood.y + 0.5) * this.cellSize;
        window.createParticles(x, y, '#ef4444');
      }

      this.consumeLife("wrong-word", eatenFood.word);
      return;
    }

    this.render();
  }

  consumeLife(reason, word) {
    this.state.lives = Math.max(0, this.state.lives - 1);

    // Play game explosion sound
    if (this.app.audioController) {
      this.app.audioController.playGameExplosion();
    }

    if (reason === "wrong-word") {
      this.setFeedback(
        "snakeQuantifierWrongFeedback",
        {
          word: word ? word.hanzi : "",
          quantifier: this.state.targetQuantifier
            ? this.state.targetQuantifier.hanzi
            : "",
        },
        "danger",
      );
    } else {
      this.setFeedback("snakeQuantifierCollisionFeedback", {}, "warning");
    }

    if (this.state.lives <= 0) {
      this.finishGame();
      return;
    }

    this.resetSnakePosition();
    this.spawnFoodsForTarget();
    this.render();
  }

  finishGame() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.stopLoop();

    // Play game over sound
    if (this.app.audioController) {
      this.app.audioController.playGameOver();
    }

    // Validar y guardar récord de puntuación alta
    let isNewRecord = false;
    if (this.state.score > (this.app.stats.snakeHighScore || 0)) {
      this.app.stats.snakeHighScore = this.state.score;
      this.app.saveStats();
      isNewRecord = true;
    }

    this.setFeedback(
      "snakeQuantifierGameOverFeedback",
      {
        score: this.state.score,
      },
      "danger",
    );

    this.updatePauseButtonLabel();
    this.render();

    const toastMsg = isNewRecord
      ? `🎉 ¡Nuevo récord en Viborita HSK! Puntaje: ${this.state.score}`
      : this.app.getTranslation("snakeQuantifierGameOverToast", { score: this.state.score });

    this.app.showToast(
      toastMsg,
      isNewRecord ? "success" : "warning",
      3000,
    );
  }

  togglePause() {
    if (!this.state.isRunning) {
      return;
    }

    this.state.isPaused = !this.state.isPaused;
    this.state.autoPausedByNavigation = false;

    if (this.state.isPaused) {
      this.stopLoop();
      this.setFeedback("snakeQuantifierPausedFeedback", {}, "info");
    } else {
      this.startLoop();
      this.setFeedback("snakeQuantifierResumeFeedback", {}, "info");
    }

    this.updatePauseButtonLabel();
    this.render();
  }

  handleGlobalKeyDown(event) {
    if (this.app.currentTab !== "snake-quantifiers") {
      return;
    }

    const key = String(event.key || "");

    if (!this.state.isRunning) {
      if (
        key === "Enter" &&
        this.setupPanel &&
        this.setupPanel.style.display !== "none"
      ) {
        event.preventDefault();
        this.startGame();
      }
      return;
    }

    const movementMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    };

    if (key === " ") {
      event.preventDefault();
      this.togglePause();
      return;
    }

    const nextDirection = movementMap[key];
    if (!nextDirection) {
      return;
    }

    event.preventDefault();
    this.addDirectionInput(nextDirection);
  }

  addDirectionInput(nextDirection) {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    const lastDir = this.directionQueue.length > 0
      ? this.directionQueue[this.directionQueue.length - 1]
      : this.state.direction;

    if (!this.isOppositeDirection(nextDirection, lastDir) &&
        (nextDirection.x !== lastDir.x || nextDirection.y !== lastDir.y)) {
      if (this.directionQueue.length < 2) {
        this.directionQueue.push(nextDirection);
      }
    }
  }

  isOppositeDirection(a, b) {
    if (!a || !b) {
      return false;
    }

    return a.x === -b.x && a.y === -b.y;
  }

  isOutsideBoard(point) {
    return (
      point.x < 0 ||
      point.y < 0 ||
      point.x >= this.boardSize ||
      point.y >= this.boardSize
    );
  }

  isSnakeCollision(point, snakeSegments = this.state.snake) {
    return snakeSegments.some(
      (segment) => segment.x === point.x && segment.y === point.y,
    );
  }

  resetSnakePosition() {
    const row = Math.floor(this.boardSize / 2);
    const col = Math.floor(this.boardSize / 2);

    this.state.snake = [
      { x: col, y: row },
      { x: col - 1, y: row },
      { x: col - 2, y: row },
    ];

    this.state.direction = { x: 1, y: 0 };
    this.state.queuedDirection = { x: 1, y: 0 };
    this.directionQueue = [];
  }

  selectNextTarget() {
    const eligible = this.data.quantifiers.filter((quantifier) => {
      const words = this.wordsByQuantifier.get(quantifier.id) || [];
      return words.length >= 3;
    });

    if (eligible.length === 0) {
      this.state.targetQuantifier = null;
      return;
    }

    let next = eligible[Math.floor(Math.random() * eligible.length)];

    if (
      eligible.length > 1 &&
      this.state.targetQuantifier &&
      next.id === this.state.targetQuantifier.id
    ) {
      const alternatives = eligible.filter(
        (quantifier) => quantifier.id !== this.state.targetQuantifier.id,
      );
      next =
        alternatives[Math.floor(Math.random() * alternatives.length)] || next;
    }

    this.state.targetQuantifier = next;
  }

  spawnFoodsForTarget() {
    const target = this.state.targetQuantifier;
    if (!target) {
      this.state.foods = [];
      return;
    }

    const config =
      this.difficultyConfig[this.state.difficulty] ||
      this.difficultyConfig.easy;
    const totalWords = config.wordCount;

    const compatiblePool = this.wordsByQuantifier.get(target.id) || [];
    const incompatiblePool = this.data.words.filter(
      (word) => !word.quantifiers.includes(target.id),
    );

    const desiredCompatible = Math.max(
      1,
      Math.min(totalWords - 1, Math.round(totalWords * config.compatibleRatio)),
    );

    const selectedCompatible = QuantifierSnakeUtils.sampleWords(
      compatiblePool,
      desiredCompatible,
    );
    const selectedIncompatible = QuantifierSnakeUtils.sampleWords(
      incompatiblePool,
      totalWords - desiredCompatible,
    );

    let selectedWords = [...selectedCompatible, ...selectedIncompatible];

    if (selectedWords.length < totalWords) {
      const remaining = totalWords - selectedWords.length;
      selectedWords = selectedWords.concat(
        QuantifierSnakeUtils.sampleWords(this.data.words, remaining),
      );
    }

    QuantifierSnakeUtils.shuffleArray(selectedWords);

    const occupied = new Set(
      this.state.snake.map((segment) =>
        QuantifierSnakeUtils.cellKey(segment.x, segment.y),
      ),
    );
    const foods = [];

    selectedWords.forEach((word) => {
      const cell = QuantifierSnakeUtils.pickRandomFreeCell(
        this.boardSize,
        occupied,
      );
      if (!cell) {
        return;
      }

      occupied.add(QuantifierSnakeUtils.cellKey(cell.x, cell.y));

      foods.push({
        x: cell.x,
        y: cell.y,
        word,
        compatible: word.quantifiers.includes(target.id),
      });
    });

    this.state.foods = foods;
  }

  syncCanvasSize() {
    if (!this.canvas || !this.canvasWrap) {
      return;
    }

    const availableWidth =
      this.canvasWrap.clientWidth || this.defaultCanvasSize;
    const clamped = Math.max(320, Math.min(620, availableWidth));
    const size = Math.floor(clamped);

    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = size / this.boardSize;

    this.render();
  }

  render() {
    this.updateHud();
    this.renderFeedback();

    if (!this.renderer || typeof this.renderer.render !== "function") {
      return;
    }

    this.renderer.render();
  }

  getTargetColor() {
    const targetId = this.state.targetQuantifier
      ? this.state.targetQuantifier.id
      : "";
    return this.quantifierColors[targetId] || "#f97316";
  }

  setFeedback(key, replacements = {}, type = "info") {
    this.state.feedback = {
      key,
      replacements,
      type,
    };
  }

  renderFeedback() {
    if (!this.feedbackNode || !this.state.feedback) {
      return;
    }

    const feedback = this.state.feedback;
    this.feedbackNode.textContent = this.app.getTranslation(
      feedback.key,
      feedback.replacements || {},
    );
    this.feedbackNode.className =
      "snakeq-feedback snakeq-feedback-" + feedback.type;
  }

  updateHud() {
    if (this.scoreValue) {
      this.scoreValue.textContent = String(this.state.score);
    }

    if (this.livesValue) {
      const hearts =
        "❤".repeat(this.state.lives) +
        "♡".repeat(Math.max(0, this.maxLives - this.state.lives));
      this.livesValue.textContent =
        this.state.lives + "/" + this.maxLives + " " + hearts;
    }

    this.updateModeLabel();
    this.updateTargetBadge();
  }

  updateModeLabel() {
    if (!this.modeValue) {
      return;
    }

    const difficulty = this.state.difficulty;
    const key =
      difficulty === "hard"
        ? "snakeQuantifierDifficultyHard"
        : difficulty === "normal"
          ? "snakeQuantifierDifficultyNormal"
          : "snakeQuantifierDifficultyEasy";

    this.modeValue.textContent = this.app.getTranslation(key);
  }

  updateTargetBadge() {
    if (!this.targetBadge) {
      return;
    }

    if (!this.state.targetQuantifier) {
      this.targetBadge.textContent = this.app.getTranslation(
        "snakeQuantifierTargetWaiting",
      );
      this.targetBadge.classList.remove("snakeq-target-badge--neutral");
      this.targetBadge.style.setProperty("--snakeq-target-color", "#64748b");
      return;
    }

    const quantifier = this.state.targetQuantifier;
    const meaning =
      this.app.currentLanguage === "en" ? quantifier.en : quantifier.es;
    this.targetBadge.textContent =
      quantifier.hanzi + " (" + quantifier.pinyin + ") · " + meaning;

    const config =
      this.difficultyConfig[this.state.difficulty] ||
      this.difficultyConfig.easy;
    const showColor = Boolean(config.showColorHints);
    this.targetBadge.classList.toggle(
      "snakeq-target-badge--neutral",
      !showColor,
    );
    this.targetBadge.style.setProperty(
      "--snakeq-target-color",
      showColor ? this.getTargetColor() : "#64748b",
    );
  }

  updatePauseButtonLabel() {
    if (!this.pauseButton) {
      return;
    }

    const key = this.state.isPaused
      ? "snakeQuantifierResume"
      : "snakeQuantifierPause";
    this.pauseButton.textContent = this.app.getTranslation(key);
  }

  refreshLanguage() {
    if (!this.isInitialized) {
      return;
    }

    this.updatePauseButtonLabel();
    this.updateHud();
    this.renderFeedback();
    this.render();
  }

  onTabActivated() {
    if (!this.state.isRunning) {
      return;
    }

    if (this.state.isPaused && this.state.autoPausedByNavigation) {
      this.state.isPaused = false;
      this.state.autoPausedByNavigation = false;
      this.startLoop();
      this.setFeedback("snakeQuantifierResumeFeedback", {}, "info");
      this.updatePauseButtonLabel();
      this.render();
      return;
    }

    this.render();
  }
}

window.QuantifierSnakeController = QuantifierSnakeController;
