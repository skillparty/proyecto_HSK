class QuantifierSnakeVersusController {
  constructor(app, solo) {
    this.app = app;
    this.solo = solo;

    this.tickStepMs = 50;
    this.maxLives = 3;
    this.deathPenaltyPoints = 10;
    this.powerupSpawnMs = 7000;
    this.maxPowerupsOnBoard = 2;
    this.effectDurationMs = 6000;
    this.speedMultiplier = 0.55;

    this.modeConfig = {
      timed3: { durationMs: 3 * 60 * 1000, useLives: false },
      timed5: { durationMs: 5 * 60 * 1000, useLives: false },
      lives: { durationMs: 0, useLives: true },
    };

    this.powerupTypes = ["speed", "invert"];
    this.powerupIcons = { speed: "⚡", invert: "🌀" };

    this.isActive = false;
    this.state = this.createDefaultState();
    this.loopHandle = null;
    this.lastTickAt = 0;
    this.powerupTimerMs = 0;

    this.baseRenderer =
      typeof QuantifierSnakeCanvasRenderer === "function"
        ? new QuantifierSnakeCanvasRenderer(this)
        : null;

    this.playerPalettes = [
      {
        1: "#047857",
        2: "#10b981",
        3: "#34d399",
        4: "#ffffff",
        5: "#f43f5e",
        6: "#0f172a",
        7: "#fbbf24",
      },
      {
        1: "#1d4ed8",
        2: "#3b82f6",
        3: "#93c5fd",
        4: "#ffffff",
        5: "#f43f5e",
        6: "#0f172a",
        7: "#fbbf24",
      },
    ];

    this.boundKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener("keydown", this.boundKeyDown);
  }

  // The shared canvas, context and sizing live on the solo controller so the
  // renderer helpers can be reused as-is.
  get canvas() {
    return this.solo.canvas;
  }

  get ctx() {
    return this.solo.ctx;
  }

  get viewSize() {
    return this.solo.viewSize;
  }

  get cellSize() {
    return this.solo.cellSize;
  }

  get boardSize() {
    return this.solo.boardSize;
  }

  get difficultyConfig() {
    return this.solo.difficultyConfig;
  }

  createDefaultState() {
    return {
      mode: "timed3",
      difficulty: "easy",
      isRunning: false,
      isPaused: false,
      autoPausedByNavigation: false,
      timeLeftMs: 0,
      targetQuantifier: null,
      foods: [],
      powerups: [],
      winnerIndex: null,
      isDraw: false,
      players: [this.createPlayer(0), this.createPlayer(1)],
    };
  }

  createPlayer(index) {
    return {
      index,
      score: 0,
      lives: this.maxLives,
      alive: true,
      snake: [],
      direction: { x: index === 0 ? 1 : -1, y: 0 },
      directionQueue: [],
      moveAccumMs: 0,
      speedUntil: 0,
      invertUntil: 0,
    };
  }

  getTargetColor() {
    const targetId = this.state.targetQuantifier
      ? this.state.targetQuantifier.id
      : "";
    return this.solo.quantifierColors[targetId] || "#f97316";
  }

  getPlayerName(index) {
    return this.app.getTranslation(
      index === 0 ? "snakeQuantifierVersusP1" : "snakeQuantifierVersusP2",
    );
  }

  startGame(difficulty, mode) {
    if (!this.solo.isDataReady) {
      return false;
    }

    this.stopLoop();

    this.state = this.createDefaultState();
    this.state.difficulty = this.solo.difficultyConfig[difficulty]
      ? difficulty
      : "easy";
    this.state.mode = this.modeConfig[mode] ? mode : "timed3";
    this.state.timeLeftMs = this.modeConfig[this.state.mode].durationMs;
    this.solo.state.difficulty = this.state.difficulty;

    this.resetPlayerPosition(this.state.players[0]);
    this.resetPlayerPosition(this.state.players[1]);
    this.selectNextTarget();
    this.spawnFoodsForTarget();

    this.state.isRunning = true;
    this.isActive = true;
    this.powerupTimerMs = 0;
    this.lastTickAt = Date.now();

    this.setFeedback("snakeQuantifierVersusStartFeedback", {}, "info");
    this.startLoop();
    this.render();
    return true;
  }

  deactivate() {
    this.stopLoop();
    this.isActive = false;
    this.state.isRunning = false;
    this.state.isPaused = false;
  }

  startLoop() {
    this.stopLoop();
    this.lastTickAt = Date.now();
    this.loopHandle = setInterval(() => {
      this.tick();
    }, this.tickStepMs);
  }

  stopLoop() {
    if (this.loopHandle) {
      clearInterval(this.loopHandle);
      this.loopHandle = null;
    }
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

    this.solo.updatePauseButtonLabel();
    this.render();
  }

  onTabActivated() {
    if (!this.state.isRunning) {
      this.render();
      return;
    }

    if (this.state.isPaused && this.state.autoPausedByNavigation) {
      this.state.isPaused = false;
      this.state.autoPausedByNavigation = false;
      this.startLoop();
      this.setFeedback("snakeQuantifierResumeFeedback", {}, "info");
      this.solo.updatePauseButtonLabel();
    }

    this.render();
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
      this.solo.updatePauseButtonLabel();
      this.render();
      return;
    }

    const now = Date.now();
    const elapsed = Math.min(250, now - this.lastTickAt);
    this.lastTickAt = now;

    if (this.modeConfig[this.state.mode].durationMs > 0) {
      this.state.timeLeftMs -= elapsed;
      if (this.state.timeLeftMs <= 0) {
        this.state.timeLeftMs = 0;
        this.finishGame();
        return;
      }
    }

    this.updatePowerupSpawns(elapsed);

    const config =
      this.difficultyConfig[this.state.difficulty] ||
      this.difficultyConfig.easy;

    for (const player of this.state.players) {
      if (!player.alive) {
        continue;
      }

      const hasSpeed = player.speedUntil > now;
      const moveMs = hasSpeed
        ? config.speedMs * this.speedMultiplier
        : config.speedMs;

      player.moveAccumMs += elapsed;
      while (player.moveAccumMs >= moveMs) {
        player.moveAccumMs -= moveMs;
        this.stepPlayer(player);

        if (!this.state.isRunning) {
          return;
        }
      }
    }

    this.render();
  }

  stepPlayer(player) {
    if (player.directionQueue.length > 0) {
      player.direction = player.directionQueue.shift();
    }

    const head = player.snake[0];
    const nextHead = {
      x: head.x + player.direction.x,
      y: head.y + player.direction.y,
    };

    const foodIndex = this.state.foods.findIndex(
      (food) => food.x === nextHead.x && food.y === nextHead.y,
    );
    const nextFood = foodIndex >= 0 ? this.state.foods[foodIndex] : null;
    const willGrow = Boolean(nextFood && nextFood.compatible);

    const ownBody = willGrow ? player.snake : player.snake.slice(0, -1);
    const rival = this.getRival(player);

    if (
      this.solo.isOutsideBoard(nextHead) ||
      this.solo.isSnakeCollision(nextHead, ownBody) ||
      (rival.alive && this.solo.isSnakeCollision(nextHead, rival.snake))
    ) {
      this.explodeAt(head.x, head.y, "#ef4444");
      this.handleDeath(player, "collision");
      return;
    }

    player.snake.unshift(nextHead);

    const powerupIndex = this.state.powerups.findIndex(
      (item) => item.x === nextHead.x && item.y === nextHead.y,
    );
    if (powerupIndex >= 0) {
      const powerup = this.state.powerups[powerupIndex];
      this.state.powerups.splice(powerupIndex, 1);
      this.applyPowerup(player, powerup.type);
    }

    if (foodIndex === -1) {
      player.snake.pop();
      return;
    }

    const eatenFood = this.state.foods[foodIndex];
    this.state.foods.splice(foodIndex, 1);

    if (eatenFood.compatible) {
      const config =
        this.difficultyConfig[this.state.difficulty] ||
        this.difficultyConfig.easy;
      player.score += config.pointsPerHit;

      this.setFeedback(
        "snakeQuantifierVersusCorrectFeedback",
        {
          player: this.getPlayerName(player.index),
          word: eatenFood.word?.hanzi ?? "",
          quantifier: this.state.targetQuantifier?.hanzi ?? "",
        },
        "success",
      );

      if (this.app && typeof this.app.playAudio === "function" && eatenFood.word?.hanzi) {
        this.app.playAudio(eatenFood.word.hanzi);
      }

      if (this.app.audioController) {
        this.app.audioController.playGameCoin();
      }

      this.explodeAt(eatenFood.x, eatenFood.y, this.getTargetColor());
      this.selectNextTarget();
      this.spawnFoodsForTarget();
    } else {
      player.snake.pop();
      this.explodeAt(eatenFood.x, eatenFood.y, "#ef4444");
      this.handleDeath(player, "wrong-word", eatenFood.word);
    }
  }

  getRival(player) {
    return this.state.players[player.index === 0 ? 1 : 0];
  }

  applyPowerup(player, type) {
    const until = Date.now() + this.effectDurationMs;

    if (this.app.audioController) {
      this.app.audioController.playGameCoin();
    }

    if (type === "speed") {
      player.speedUntil = until;
      this.setFeedback(
        "snakeQuantifierVersusSpeedFeedback",
        { player: this.getPlayerName(player.index) },
        "success",
      );
      return;
    }

    const rival = this.getRival(player);
    rival.invertUntil = until;
    this.setFeedback(
      "snakeQuantifierVersusInvertFeedback",
      {
        player: this.getPlayerName(player.index),
        rival: this.getPlayerName(rival.index),
      },
      "warning",
    );
  }

  updatePowerupSpawns(elapsedMs) {
    this.powerupTimerMs += elapsedMs;

    if (this.powerupTimerMs < this.powerupSpawnMs) {
      return;
    }

    this.powerupTimerMs = 0;

    if (this.state.powerups.length >= this.maxPowerupsOnBoard) {
      return;
    }

    const occupied = this.collectOccupiedCells();
    const cell = QuantifierSnakeUtils.pickRandomFreeCell(
      this.boardSize,
      occupied,
    );
    if (!cell) {
      return;
    }

    const type =
      this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
    this.state.powerups.push({ x: cell.x, y: cell.y, type });
  }

  collectOccupiedCells() {
    const occupied = new Set();

    this.state.players.forEach((player) => {
      player.snake.forEach((segment) => {
        occupied.add(QuantifierSnakeUtils.cellKey(segment.x, segment.y));
      });
    });

    this.state.foods.forEach((food) => {
      occupied.add(QuantifierSnakeUtils.cellKey(food.x, food.y));
    });

    this.state.powerups.forEach((item) => {
      occupied.add(QuantifierSnakeUtils.cellKey(item.x, item.y));
    });

    return occupied;
  }

  handleDeath(player, reason, word) {
    if (this.app.audioController) {
      this.app.audioController.playGameExplosion();
    }

    if (reason === "wrong-word") {
      this.setFeedback(
        "snakeQuantifierVersusWrongFeedback",
        {
          player: this.getPlayerName(player.index),
          word: word ? word.hanzi : "",
          quantifier: this.state.targetQuantifier
            ? this.state.targetQuantifier.hanzi
            : "",
        },
        "danger",
      );
    } else {
      this.setFeedback(
        "snakeQuantifierVersusCrashFeedback",
        { player: this.getPlayerName(player.index) },
        "warning",
      );
    }

    const useLives = this.modeConfig[this.state.mode].useLives;

    if (useLives) {
      player.lives = Math.max(0, player.lives - 1);
      if (player.lives <= 0) {
        player.alive = false;
        player.snake = [];
        this.finishGame();
        return;
      }
    } else {
      player.score = Math.max(0, player.score - this.deathPenaltyPoints);
    }

    player.speedUntil = 0;
    player.invertUntil = 0;
    this.resetPlayerPosition(player);
  }

  resetPlayerPosition(player) {
    const mid = Math.floor(this.boardSize / 2);
    const rival = this.getRival(player);
    const rivalCells = new Set(
      (rival && rival.snake ? rival.snake : []).map((segment) =>
        QuantifierSnakeUtils.cellKey(segment.x, segment.y),
      ),
    );

    const buildSnake = (row) => {
      if (player.index === 0) {
        return [
          { x: 4, y: row },
          { x: 3, y: row },
          { x: 2, y: row },
        ];
      }
      return [
        { x: this.boardSize - 5, y: row },
        { x: this.boardSize - 4, y: row },
        { x: this.boardSize - 3, y: row },
      ];
    };

    const baseRow = player.index === 0 ? mid - 3 : mid + 3;
    let snake = buildSnake(baseRow);

    // Nudge the home row if the rival is currently sitting on the spawn cells.
    for (let offset = 1; offset < this.boardSize; offset += 1) {
      const blocked = snake.some((segment) =>
        rivalCells.has(QuantifierSnakeUtils.cellKey(segment.x, segment.y)),
      );
      if (!blocked) {
        break;
      }

      const candidateRow =
        baseRow + (offset % 2 === 0 ? offset / 2 : -Math.ceil(offset / 2));
      const clampedRow = Math.min(this.boardSize - 1, Math.max(0, candidateRow));
      snake = buildSnake(clampedRow);
    }

    player.snake = snake;
    player.direction = { x: player.index === 0 ? 1 : -1, y: 0 };
    player.directionQueue = [];
    player.moveAccumMs = 0;

    // Clear any food that overlaps the fresh spawn so the player does not
    // instantly eat (or die on) a word they never aimed for.
    const spawnCells = new Set(
      snake.map((segment) =>
        QuantifierSnakeUtils.cellKey(segment.x, segment.y),
      ),
    );
    spawnCells.add(
      QuantifierSnakeUtils.cellKey(
        snake[0].x + player.direction.x,
        snake[0].y,
      ),
    );
    this.state.foods = this.state.foods.filter(
      (food) => !spawnCells.has(QuantifierSnakeUtils.cellKey(food.x, food.y)),
    );
  }

  selectNextTarget() {
    const eligible = this.solo.data.quantifiers.filter((quantifier) => {
      const words = this.solo.wordsByQuantifier.get(quantifier.id) || [];
      return words.length >= 3;
    });

    if (eligible.length === 0) {
      this.state.targetQuantifier = null;
      this.solo.state.targetQuantifier = null;
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
    // The target badge and color hints are rendered through the solo
    // controller, so its state must mirror the versus target.
    this.solo.state.targetQuantifier = next;
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

    const compatiblePool = this.solo.wordsByQuantifier.get(target.id) || [];
    const incompatiblePool = this.solo.data.words.filter(
      (word) => !word.quantifiers.includes(target.id),
    );

    const desiredCompatible = Math.max(
      2,
      Math.min(totalWords - 1, Math.round(totalWords * config.compatibleRatio)),
    );

    let selectedWords = [
      ...QuantifierSnakeUtils.sampleWords(compatiblePool, desiredCompatible),
      ...QuantifierSnakeUtils.sampleWords(
        incompatiblePool,
        totalWords - desiredCompatible,
      ),
    ];

    if (selectedWords.length < totalWords) {
      selectedWords = selectedWords.concat(
        QuantifierSnakeUtils.sampleWords(
          this.solo.data.words,
          totalWords - selectedWords.length,
        ),
      );
    }

    QuantifierSnakeUtils.shuffleArray(selectedWords);

    const occupied = this.collectOccupiedCells();
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

  finishGame() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.stopLoop();

    if (this.app.audioController) {
      this.app.audioController.playGameOver();
    }

    const [p1, p2] = this.state.players;
    const useLives = this.modeConfig[this.state.mode].useLives;

    if (useLives) {
      if (!p1.alive && p2.alive) {
        this.state.winnerIndex = 1;
      } else if (!p2.alive && p1.alive) {
        this.state.winnerIndex = 0;
      } else {
        this.resolveWinnerByScore(p1, p2);
      }
    } else {
      this.resolveWinnerByScore(p1, p2);
    }

    if (this.state.isDraw) {
      this.setFeedback(
        "snakeQuantifierVersusDrawFeedback",
        { p1: p1.score, p2: p2.score },
        "warning",
      );
    } else {
      this.setFeedback(
        "snakeQuantifierVersusWinFeedback",
        {
          player: this.getPlayerName(this.state.winnerIndex),
          p1: p1.score,
          p2: p2.score,
        },
        "success",
      );
    }

    this.solo.updatePauseButtonLabel();
    this.render();

    const toastMsg = this.state.isDraw
      ? this.app.getTranslation("snakeQuantifierVersusDrawFeedback", {
          p1: p1.score,
          p2: p2.score,
        })
      : this.app.getTranslation("snakeQuantifierVersusWinFeedback", {
          player: this.getPlayerName(this.state.winnerIndex),
          p1: p1.score,
          p2: p2.score,
        });
    this.app.showToast(toastMsg, this.state.isDraw ? "warning" : "success", 4000);
  }

  resolveWinnerByScore(p1, p2) {
    if (p1.score === p2.score) {
      this.state.isDraw = true;
      this.state.winnerIndex = null;
      return;
    }

    this.state.winnerIndex = p1.score > p2.score ? 0 : 1;
  }

  handleKeyDown(event) {
    if (!this.isActive || this.app.currentTab !== "snake-quantifiers") {
      return;
    }

    if (!this.state.isRunning) {
      return;
    }

    const key = String(event.key || "");

    if (key === " ") {
      event.preventDefault();
      this.togglePause();
      return;
    }

    const p1Map = {
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 },
    };

    const p2Map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    if (p1Map[key]) {
      event.preventDefault();
      this.addDirectionInput(0, p1Map[key]);
      return;
    }

    if (p2Map[key]) {
      event.preventDefault();
      this.addDirectionInput(1, p2Map[key]);
    }
  }

  addDirectionInput(playerIndex, direction) {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    const player = this.state.players[playerIndex];
    if (!player || !player.alive) {
      return;
    }

    let nextDirection = direction;
    if (player.invertUntil > Date.now()) {
      nextDirection = { x: -direction.x, y: -direction.y };
    }

    const lastDir =
      player.directionQueue.length > 0
        ? player.directionQueue[player.directionQueue.length - 1]
        : player.direction;

    if (
      !this.solo.isOppositeDirection(nextDirection, lastDir) &&
      (nextDirection.x !== lastDir.x || nextDirection.y !== lastDir.y) &&
      player.directionQueue.length < 2
    ) {
      player.directionQueue.push(nextDirection);
    }
  }

  explodeAt(cellX, cellY, color) {
    if (typeof window.createParticles !== "function" || !this.canvas) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = rect.left + (cellX + 0.5) * this.cellSize;
    const y = rect.top + (cellY + 0.5) * this.cellSize;
    window.createParticles(x, y, color);
  }

  setFeedback(key, replacements = {}, type = "info") {
    this.solo.setFeedback(key, replacements, type);
    this.solo.renderFeedback();
  }

  formatTimeLeft() {
    const totalSeconds = Math.max(0, Math.ceil(this.state.timeLeftMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  render() {
    this.updateHud();
    this.solo.updateTargetBadge();

    if (!this.ctx || !this.canvas || !this.baseRenderer) {
      return;
    }

    const width = this.viewSize || this.canvas.width;
    const height = this.viewSize || this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);
    this.baseRenderer.drawBoardBackground(width, height);
    this.baseRenderer.drawGrid();

    if (this.state.foods.length > 0) {
      this.baseRenderer.drawFoods();
    }

    this.drawPowerups();

    this.state.players.forEach((player) => {
      if (player.alive && player.snake.length > 0) {
        this.drawPlayerSnake(player);
      }
    });

    if (this.state.isPaused) {
      this.baseRenderer.drawOverlay(
        this.app.getTranslation("snakeQuantifierPausedOverlay"),
      );
    } else if (!this.state.isRunning && this.isActive) {
      this.drawResultOverlay(width, height);
    }
  }

  drawPowerups() {
    const ctx = this.ctx;
    const now = Date.now();

    this.state.powerups.forEach((item) => {
      const size = this.cellSize;
      const x = item.x * size;
      const bob = Math.sin(now / 400 + item.x * 3 + item.y * 7) * 2;
      const y = item.y * size + bob;

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.shadowBlur = 14;
      ctx.shadowColor = item.type === "speed" ? "#fbbf24" : "#a855f7";

      const palette =
        item.type === "speed"
          ? { 1: "#92400e", 2: "#f59e0b", 3: "#fde68a" }
          : { 1: "#581c87", 2: "#a855f7", 3: "#e9d5ff" };

      this.baseRenderer.drawPixelSprite(
        ctx,
        x,
        y,
        size,
        this.baseRenderer.COIN_SPRITE,
        palette,
      );

      ctx.shadowBlur = 0;
      ctx.font = "700 " + (size * 0.5).toFixed(1) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.powerupIcons[item.type] || "?",
        x + size / 2,
        y + size / 2 + 1,
      );
      ctx.restore();
    });
  }

  drawPlayerSnake(player) {
    const ctx = this.ctx;
    const snake = player.snake;
    const bodyLength = snake.length;
    const now = Date.now();
    const palette = { ...this.playerPalettes[player.index] };
    palette[5] = Math.floor(now / 200) % 2 === 0 ? "transparent" : "#f43f5e";

    const isInverted = player.invertUntil > now;
    const hasSpeed = player.speedUntil > now;

    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const isTail = index === bodyLength - 1 && index > 0;
      const size = this.cellSize;
      const drawX = segment.x * size;
      const drawY = segment.y * size;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (isHead) {
        ctx.shadowBlur = hasSpeed ? 18 : 12;
        if (isInverted) {
          ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
        } else {
          ctx.shadowColor =
            player.index === 0
              ? "rgba(52, 211, 153, 0.6)"
              : "rgba(96, 165, 250, 0.6)";
        }
      }

      ctx.translate(drawX + size / 2, drawY + size / 2);

      let segDir = { x: player.direction.x, y: player.direction.y };
      if (index > 0) {
        const prev = snake[index - 1];
        segDir = { x: prev.x - segment.x, y: prev.y - segment.y };
        if (Math.abs(segDir.x) > 1) segDir.x = -Math.sign(segDir.x);
        if (Math.abs(segDir.y) > 1) segDir.y = -Math.sign(segDir.y);
      }

      let angle = 0;
      if (segDir.x === -1) angle = Math.PI;
      else if (segDir.y === 1) angle = Math.PI / 2;
      else if (segDir.y === -1) angle = -Math.PI / 2;
      ctx.rotate(angle);

      if (isHead) {
        this.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size,
          this.baseRenderer.HEAD_SPRITE, palette,
        );
      } else if (isTail) {
        this.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size,
          this.baseRenderer.TAIL_SPRITE, palette,
        );
      } else {
        const sprite =
          index % 2 === 0 ? this.baseRenderer.BODY_A : this.baseRenderer.BODY_B;
        this.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size, sprite, palette,
        );
      }

      ctx.restore();
    });
  }

  drawResultOverlay(width, height) {
    const ctx = this.ctx;
    const [p1, p2] = this.state.players;

    ctx.save();
    ctx.fillStyle = "rgba(6, 10, 19, 0.78)";
    ctx.fillRect(0, 0, width, height);

    const cardW = Math.min(width * 0.82, 420);
    const cardH = Math.min(height * 0.48, 240);
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    ctx.shadowBlur = 40;
    ctx.shadowColor = "rgba(16, 185, 129, 0.15)";
    const panelGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    panelGrad.addColorStop(0, "rgba(30, 41, 59, 0.96)");
    panelGrad.addColorStop(0.5, "rgba(15, 23, 42, 0.98)");
    panelGrad.addColorStop(1, "rgba(20, 30, 50, 0.96)");
    ctx.fillStyle = panelGrad;
    this.baseRenderer.drawRoundedRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.20)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const title = this.state.isDraw
      ? this.app.getTranslation("snakeQuantifierVersusDrawOverlay")
      : this.app.getTranslation("snakeQuantifierVersusWinnerOverlay", {
          player: this.getPlayerName(this.state.winnerIndex),
        });

    ctx.fillStyle = this.state.isDraw
      ? "#fbbf24"
      : this.state.winnerIndex === 0
        ? "#34d399"
        : "#60a5fa";
    ctx.font = '800 26px "Inter", sans-serif';
    ctx.fillText(title, width / 2, cardY + cardH * 0.26);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + cardW * 0.2, cardY + cardH * 0.4);
    ctx.lineTo(cardX + cardW * 0.8, cardY + cardH * 0.4);
    ctx.stroke();

    ctx.font = '700 20px "Inter", sans-serif';
    ctx.fillStyle = "#34d399";
    ctx.fillText(
      this.getPlayerName(0) + ": " + p1.score,
      width / 2,
      cardY + cardH * 0.55,
    );
    ctx.fillStyle = "#60a5fa";
    ctx.fillText(
      this.getPlayerName(1) + ": " + p2.score,
      width / 2,
      cardY + cardH * 0.72,
    );

    ctx.fillStyle = "#64748b";
    ctx.font = '400 13px "Inter", sans-serif';
    ctx.fillText(
      this.app.getTranslation("snakeQuantifierVersusPlayAgainHint"),
      width / 2,
      cardY + cardH * 0.9,
    );
    ctx.restore();
  }

  updateHud() {
    const now = Date.now();
    const useLives = this.modeConfig[this.state.mode].useLives;

    const timerNode = document.getElementById("snakeq-vs-timer");
    if (timerNode) {
      timerNode.textContent = useLives
        ? "∞"
        : this.formatTimeLeft();
    }

    this.state.players.forEach((player, index) => {
      const suffix = index === 0 ? "p1" : "p2";

      const scoreNode = document.getElementById("snakeq-" + suffix + "-score");
      if (scoreNode) {
        scoreNode.textContent = String(player.score);
      }

      const livesNode = document.getElementById("snakeq-" + suffix + "-lives");
      if (livesNode) {
        if (useLives) {
          livesNode.textContent =
            "❤".repeat(player.lives) +
            "♡".repeat(Math.max(0, this.maxLives - player.lives));
        } else {
          livesNode.textContent = "";
        }
      }

      const fxNode = document.getElementById("snakeq-" + suffix + "-fx");
      if (fxNode) {
        const effects = [];
        if (player.speedUntil > now) effects.push("⚡");
        if (player.invertUntil > now) effects.push("🌀");
        fxNode.textContent = effects.join(" ");
      }
    });
  }
}

window.QuantifierSnakeVersusController = QuantifierSnakeVersusController;
