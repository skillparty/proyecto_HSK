/**
 * QuantifierSnakeVersusRenderer - canvas rendering for 2P versus mode:
 * board/snakes/powerups draw pass, particle bursts, HUD text, result
 * overlay. Extracted from QuantifierSnakeVersusController; mirrors the
 * QuantifierSnakeCanvasRenderer(controller) pattern used by solo mode.
 * Read-only on game state — never mutates it.
 */
class QuantifierSnakeVersusRenderer {
    constructor(versus) {
        this.versus = versus;
    }

  getTargetColor() {
    const targetId = this.versus.state.targetQuantifier
      ? this.versus.state.targetQuantifier.id
      : "";
    return this.versus.solo.quantifierColors[targetId] || "#f97316";
  }

  explodeAt(cellX, cellY, color) {
    if (typeof window.createParticles !== "function" || !this.versus.canvas) {
      return;
    }

    const rect = this.versus.canvas.getBoundingClientRect();
    const x = rect.left + (cellX + 0.5) * this.versus.cellSize;
    const y = rect.top + (cellY + 0.5) * this.versus.cellSize;
    window.createParticles(x, y, color);
  }

  formatTimeLeft() {
    const totalSeconds = Math.max(0, Math.ceil(this.versus.state.timeLeftMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  render() {
    this.updateHud();
    this.versus.solo.updateTargetBadge();

    if (!this.versus.ctx || !this.versus.canvas || !this.versus.baseRenderer) {
      return;
    }

    const width = this.versus.viewSize || this.versus.canvas.width;
    const height = this.versus.viewSize || this.versus.canvas.height;

    this.versus.ctx.clearRect(0, 0, width, height);
    this.versus.baseRenderer.drawBoardBackground(width, height);
    this.versus.baseRenderer.drawGrid();

    if (this.versus.state.foods.length > 0) {
      this.versus.baseRenderer.drawFoods();
    }

    this.drawPowerups();

    this.versus.state.players.forEach((player) => {
      if (player.alive && player.snake.length > 0) {
        this.drawPlayerSnake(player);
      }
    });

    if (this.versus.state.isPaused) {
      this.versus.baseRenderer.drawOverlay(
        this.versus.app.getTranslation("snakeQuantifierPausedOverlay"),
      );
    } else if (!this.versus.state.isRunning && this.versus.isActive) {
      this.drawResultOverlay(width, height);
    }
  }

  drawPowerups() {
    const ctx = this.versus.ctx;
    const now = Date.now();

    this.versus.state.powerups.forEach((item) => {
      const size = this.versus.cellSize;
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

      this.versus.baseRenderer.drawPixelSprite(
        ctx,
        x,
        y,
        size,
        this.versus.baseRenderer.COIN_SPRITE,
        palette,
      );

      ctx.shadowBlur = 0;
      ctx.font = "700 " + (size * 0.5).toFixed(1) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.versus.powerupIcons[item.type] || "?",
        x + size / 2,
        y + size / 2 + 1,
      );
      ctx.restore();
    });
  }

  drawPlayerSnake(player) {
    const ctx = this.versus.ctx;
    const snake = player.snake;
    const bodyLength = snake.length;
    const now = Date.now();
    const palette = { ...this.versus.playerPalettes[player.index] };
    palette[5] = Math.floor(now / 200) % 2 === 0 ? "transparent" : "#f43f5e";

    const isInverted = player.invertUntil > now;
    const hasSpeed = player.speedUntil > now;

    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const isTail = index === bodyLength - 1 && index > 0;
      const size = this.versus.cellSize;
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
        this.versus.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size,
          this.versus.baseRenderer.HEAD_SPRITE, palette,
        );
      } else if (isTail) {
        this.versus.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size,
          this.versus.baseRenderer.TAIL_SPRITE, palette,
        );
      } else {
        const sprite =
          index % 2 === 0 ? this.versus.baseRenderer.BODY_A : this.versus.baseRenderer.BODY_B;
        this.versus.baseRenderer.drawPixelSprite(
          ctx, -size / 2, -size / 2, size, sprite, palette,
        );
      }

      ctx.restore();
    });
  }

  drawResultOverlay(width, height) {
    const ctx = this.versus.ctx;
    const [p1, p2] = this.versus.state.players;

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
    this.versus.baseRenderer.drawRoundedRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.20)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const title = this.versus.state.isDraw
      ? this.versus.app.getTranslation("snakeQuantifierVersusDrawOverlay")
      : this.versus.app.getTranslation("snakeQuantifierVersusWinnerOverlay", {
          player: this.versus.getPlayerName(this.versus.state.winnerIndex),
        });

    ctx.fillStyle = this.versus.state.isDraw
      ? "#fbbf24"
      : this.versus.state.winnerIndex === 0
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
      this.versus.getPlayerName(0) + ": " + p1.score,
      width / 2,
      cardY + cardH * 0.55,
    );
    ctx.fillStyle = "#60a5fa";
    ctx.fillText(
      this.versus.getPlayerName(1) + ": " + p2.score,
      width / 2,
      cardY + cardH * 0.72,
    );

    ctx.fillStyle = "#64748b";
    ctx.font = '400 13px "Inter", sans-serif';
    ctx.fillText(
      this.versus.app.getTranslation("snakeQuantifierVersusPlayAgainHint"),
      width / 2,
      cardY + cardH * 0.9,
    );
    ctx.restore();
  }

  updateHud() {
    const now = Date.now();
    const useLives = this.versus.modeConfig[this.versus.state.mode].useLives;

    const timerNode = document.getElementById("snakeq-vs-timer");
    if (timerNode) {
      timerNode.textContent = useLives
        ? "∞"
        : this.formatTimeLeft();
    }

    this.versus.state.players.forEach((player, index) => {
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
            "♡".repeat(Math.max(0, this.versus.maxLives - player.lives));
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

window.QuantifierSnakeVersusRenderer = QuantifierSnakeVersusRenderer;
