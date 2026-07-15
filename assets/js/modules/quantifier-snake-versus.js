class QuantifierSnakeVersusController {
  constructor(app, solo) {
    this.app = app;
    this.solo = solo;
    this.renderer = new window.QuantifierSnakeVersusRenderer(this);

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

  getPlayerName(index) {
    return this.app.getTranslation(
      index === 0 ? "snakeQuantifierVersusP1" : "snakeQuantifierVersusP2",
    );
  }

  // baseRenderer (shared QuantifierSnakeCanvasRenderer, see constructor)
  // is constructed with `this` as its "controller" and calls
  // controller.getTargetColor() directly — keep this public even though
  // the real lookup now lives in the renderer.
  getTargetColor() {
    return this.renderer.getTargetColor();
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
    this.renderer.explodeAt(cellX, cellY, color);
  }

  setFeedback(key, replacements = {}, type = "info") {
    this.solo.setFeedback(key, replacements, type);
    this.solo.renderFeedback();
  }

  render() {
    this.renderer.render();
  }
}

window.QuantifierSnakeVersusController = QuantifierSnakeVersusController;
