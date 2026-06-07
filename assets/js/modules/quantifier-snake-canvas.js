class QuantifierSnakeCanvasRenderer {
    constructor(controller) {
        this.controller = controller;
        // Pre-generate deterministic star positions for background
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.sin(i * 127.3) * 0.5 + 0.5,
                y: Math.cos(i * 83.7) * 0.5 + 0.5,
                size: 0.8 + (Math.sin(i * 41.2) * 0.5 + 0.5) * 1.8,
                twinkleSpeed: 1500 + Math.floor((Math.sin(i * 67.1) * 0.5 + 0.5) * 3000),
                twinklePhase: i * 1.3
            });
        }

        // 10x10 Retro 16-bit Pixel-art Sprite Matrices
        this.HEAD_SPRITE = [
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 3, 3, 3, 2, 2, 2, 1, 0],
            [1, 3, 3, 3, 2, 2, 4, 4, 2, 1], // Eye left
            [1, 3, 2, 2, 2, 2, 6, 4, 1, 1], // Pupil left
            [1, 2, 2, 2, 2, 2, 2, 1, 5, 5], // Animated Tongue slot
            [1, 2, 2, 2, 2, 2, 2, 1, 5, 5], // Animated Tongue slot
            [1, 3, 2, 2, 2, 2, 6, 4, 1, 1], // Pupil right
            [1, 3, 3, 3, 2, 2, 4, 4, 2, 1], // Eye right
            [0, 1, 3, 3, 3, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
        ];

        this.BODY_A = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 3, 3, 2, 2, 3, 3, 2, 2, 1],
            [1, 3, 7, 2, 1, 3, 7, 2, 1, 1], // Gold scale highlights
            [1, 2, 2, 1, 2, 2, 2, 1, 2, 1],
            [1, 2, 1, 2, 2, 2, 1, 2, 2, 1],
            [1, 2, 1, 2, 2, 2, 1, 2, 2, 1],
            [1, 2, 2, 1, 2, 2, 2, 1, 2, 1],
            [1, 3, 7, 2, 1, 3, 7, 2, 1, 1],
            [1, 3, 3, 2, 2, 3, 3, 2, 2, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0]
        ];

        this.BODY_B = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 2, 2, 3, 3, 2, 2, 3, 3, 1],
            [1, 1, 3, 7, 2, 1, 3, 7, 2, 1],
            [1, 2, 1, 2, 2, 2, 1, 2, 2, 1],
            [1, 2, 2, 1, 2, 2, 2, 1, 2, 1],
            [1, 2, 2, 1, 2, 2, 2, 1, 2, 1],
            [1, 2, 1, 2, 2, 2, 1, 2, 2, 1],
            [1, 1, 3, 7, 2, 1, 3, 7, 2, 1],
            [1, 2, 2, 3, 3, 2, 2, 3, 3, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0]
        ];

        this.TAIL_SPRITE = [
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
            [0, 0, 0, 0, 1, 1, 2, 3, 3, 1],
            [0, 0, 0, 1, 2, 2, 2, 7, 3, 1],
            [0, 0, 1, 2, 2, 2, 2, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 2, 1, 2, 1],
            [0, 1, 2, 2, 2, 2, 2, 1, 2, 1],
            [0, 0, 1, 2, 2, 2, 2, 2, 2, 1],
            [0, 0, 0, 1, 2, 2, 2, 7, 3, 1],
            [0, 0, 0, 0, 1, 1, 2, 3, 3, 1],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0]
        ];

        this.COIN_SPRITE = [
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 3, 3, 3, 3, 3, 2, 1, 0],
            [1, 3, 3, 1, 1, 1, 1, 2, 2, 1],
            [1, 3, 1, 1, 1, 1, 1, 1, 2, 1], // Center ring is colored darker (1)
            [1, 3, 1, 1, 1, 1, 1, 1, 2, 1], // for high readability of Hanzi labels
            [1, 3, 1, 1, 1, 1, 1, 1, 2, 1],
            [1, 3, 1, 1, 1, 1, 1, 1, 2, 1],
            [1, 3, 3, 1, 1, 1, 1, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
        ];
    }

    render() {
        const controller = this.controller;

        if (!controller.ctx || !controller.canvas) {
            return;
        }

        const width = controller.canvas.width;
        const height = controller.canvas.height;

        controller.ctx.clearRect(0, 0, width, height);
        this.drawBoardBackground(width, height);
        this.drawGrid();

        if (controller.state.foods.length > 0) {
            this.drawFoods();
        }

        if (controller.state.snake.length > 0) {
            this.drawSnake();
        }

        if (controller.state.isPaused) {
            this.drawOverlay(controller.app.getTranslation('snakeQuantifierPausedOverlay'));
        } else if (!controller.state.isRunning && controller.state.lives <= 0) {
            this.drawOverlay(controller.app.getTranslation('snakeQuantifierGameOverOverlay'));
        }
    }

    drawBoardBackground(width, height) {
        const ctx = this.controller.ctx;

        // Deep space gradient
        const gradient = ctx.createRadialGradient(
            width * 0.3, height * 0.3, 0,
            width * 0.5, height * 0.5, width * 0.85
        );
        gradient.addColorStop(0, '#111827');
        gradient.addColorStop(0.4, '#0d1117');
        gradient.addColorStop(1, '#060a13');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Corner accent glows
        ctx.save();
        const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.35);
        glow1.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, width, height);

        const glow2 = ctx.createRadialGradient(width, height, 0, width, height, width * 0.35);
        glow2.addColorStop(0, 'rgba(37, 99, 235, 0.05)');
        glow2.addColorStop(1, 'transparent');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Twinkling stars
        const now = Date.now();
        ctx.save();
        this.stars.forEach(star => {
            const twinkle = Math.sin((now + star.twinklePhase * 1000) / star.twinkleSpeed * Math.PI * 2);
            const alpha = 0.15 + (twinkle * 0.5 + 0.5) * 0.35;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawGrid() {
        const controller = this.controller;
        const ctx = controller.ctx;

        ctx.save();
        ctx.lineWidth = 0.5;

        for (let index = 0; index <= controller.boardSize; index += 1) {
            const coordinate = index * controller.cellSize;

            // Subtle gradient grid lines - slightly brighter at edges
            const edgeFactor = Math.min(index, controller.boardSize - index) / (controller.boardSize / 2);
            const alpha = 0.06 + (1 - edgeFactor) * 0.04;
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(coordinate, 0);
            ctx.lineTo(coordinate, controller.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, coordinate);
            ctx.lineTo(controller.canvas.width, coordinate);
            ctx.stroke();
        }

        // Outer border glow
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0.5, 0.5, controller.canvas.width - 1, controller.canvas.height - 1);

        ctx.restore();
    }

    drawPixelSprite(ctx, x, y, size, spriteMatrix, colorPalette) {
        const pixels = spriteMatrix.length;
        const pixelSize = size / pixels;

        for (let r = 0; r < pixels; r++) {
            for (let c = 0; c < pixels; c++) {
                const val = spriteMatrix[r][c];
                if (val === 0) continue;

                const color = colorPalette[val];
                if (!color || color === 'transparent') continue;

                ctx.fillStyle = color;
                // Draw a pixel block. We use Math.ceil to prevent tiny gaps between pixels.
                ctx.fillRect(
                    x + c * pixelSize,
                    y + r * pixelSize,
                    Math.ceil(pixelSize),
                    Math.ceil(pixelSize)
                );
            }
        }
    }

    drawSnake() {
        const controller = this.controller;
        const snake = controller.state.snake;
        const bodyLength = snake.length;
        const dir = controller.state.direction || { x: 1, y: 0 };
        const ctx = controller.ctx;

        const snakePalette = {
            1: '#047857', // Dark forest green (border/shadow)
            2: '#10b981', // Emerald green (base skin)
            3: '#34d399', // Mint green (highlights)
            4: '#ffffff', // Sclera (eyes)
            5: (Math.floor(Date.now() / 200) % 2 === 0) ? 'transparent' : '#f43f5e', // Animated tongue
            6: '#0f172a', // Pupil
            7: '#fbbf24'  // Gold scale accent
        };

        snake.forEach((segment, index) => {
            const isHead = index === 0;
            const isTail = index === bodyLength - 1 && index > 0;

            const drawX = segment.x * controller.cellSize;
            const drawY = segment.y * controller.cellSize;
            const size = controller.cellSize;

            ctx.save();
            ctx.imageSmoothingEnabled = false;

            // Neon glow for head
            if (isHead) {
                ctx.shadowBlur = 12;
                ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
            }

            // Translate to center of cell for rotation
            ctx.translate(drawX + size / 2, drawY + size / 2);

            // Determine rotation angle based on movement direction
            let segDir = { x: dir.x, y: dir.y };
            if (index > 0) {
                const prev = snake[index - 1];
                segDir = {
                    x: prev.x - segment.x,
                    y: prev.y - segment.y
                };
                // Handle board wrap
                if (Math.abs(segDir.x) > 1) segDir.x = -Math.sign(segDir.x);
                if (Math.abs(segDir.y) > 1) segDir.y = -Math.sign(segDir.y);
            }

            let angle = 0;
            if (segDir.x === 1) angle = 0;
            else if (segDir.x === -1) angle = Math.PI;
            else if (segDir.y === 1) angle = Math.PI / 2;
            else if (segDir.y === -1) angle = -Math.PI / 2;

            ctx.rotate(angle);

            // Draw correct sprite
            if (isHead) {
                this.drawPixelSprite(ctx, -size / 2, -size / 2, size, this.HEAD_SPRITE, snakePalette);
            } else if (isTail) {
                this.drawPixelSprite(ctx, -size / 2, -size / 2, size, this.TAIL_SPRITE, snakePalette);
            } else {
                // Alternating body segments
                const sprite = (index % 2 === 0) ? this.BODY_A : this.BODY_B;
                this.drawPixelSprite(ctx, -size / 2, -size / 2, size, sprite, snakePalette);
            }

            ctx.restore();
        });
    }

    drawFoods() {
        const controller = this.controller;
        const config = controller.difficultyConfig[controller.state.difficulty] || controller.difficultyConfig.easy;
        const ctx = controller.ctx;

        controller.state.foods.forEach((food) => {
            const x = food.x * controller.cellSize;
            const y = food.y * controller.cellSize;
            const size = controller.cellSize;

            // Floating bob effect
            const bobOffset = Math.sin(Date.now() / 600 + (food.x * 5 + food.y * 11)) * 1.5;
            const drawX = x;
            const drawY = y + bobOffset;

            ctx.save();
            ctx.imageSmoothingEnabled = false;

            // Neon glow for compatible food
            if (config.showColorHints && food.compatible) {
                ctx.shadowBlur = 14;
                ctx.shadowColor = controller.getTargetColor();
            }

            // Setup color palette for the coin
            const targetColor = controller.getTargetColor();
            let coinPalette;
            if (config.showColorHints && food.compatible) {
                coinPalette = {
                    1: this.darkenColor(targetColor, 0.40),
                    2: targetColor,
                    3: this.lightenColor(targetColor, 0.35)
                };
            } else {
                coinPalette = {
                    1: '#1e293b', // Dark border
                    2: '#475569', // Slate grey
                    3: '#94a3b8'  // Highlight
                };
            }

            this.drawPixelSprite(ctx, drawX, drawY, size, this.COIN_SPRITE, coinPalette);

            // Reset shadow before drawing text
            ctx.shadowBlur = 0;

            // Hanzi label
            const label = food.word.hanzi;
            const fontSize = label.length > 1 ? size * 0.36 : size * 0.44;

            ctx.fillStyle = '#f8fafc';
            ctx.font = '700 ' + fontSize.toFixed(1) + 'px "Noto Sans SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow for readability
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText(label, x + size / 2, y + size / 2 + bobOffset + 0.5);

            ctx.restore();
        });
    }

    drawOverlay(message) {
        const controller = this.controller;
        const width = controller.canvas.width;
        const height = controller.canvas.height;

        controller.ctx.save();

        // Darkened frosted glass backdrop
        controller.ctx.fillStyle = 'rgba(6, 10, 19, 0.78)';
        controller.ctx.fillRect(0, 0, width, height);

        // Center card configuration
        const cardW = Math.min(width * 0.78, 380);
        const cardH = Math.min(height * 0.42, 210);
        const cardX = (width - cardW) / 2;
        const cardY = (height - cardH) / 2;

        // Card outer glow
        controller.ctx.shadowBlur = 40;
        controller.ctx.shadowColor = 'rgba(16, 185, 129, 0.15)';

        // Card background gradient
        const panelGrad = controller.ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        panelGrad.addColorStop(0, 'rgba(30, 41, 59, 0.96)');
        panelGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.98)');
        panelGrad.addColorStop(1, 'rgba(20, 30, 50, 0.96)');
        controller.ctx.fillStyle = panelGrad;

        this.drawRoundedRect(cardX, cardY, cardW, cardH, 20);
        controller.ctx.fill();

        // Card border with subtle gradient
        controller.ctx.shadowBlur = 0;
        controller.ctx.strokeStyle = 'rgba(16, 185, 129, 0.20)';
        controller.ctx.lineWidth = 1.5;
        controller.ctx.stroke();

        // Inner top highlight line
        controller.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        controller.ctx.lineWidth = 1;
        controller.ctx.beginPath();
        controller.ctx.moveTo(cardX + 20, cardY + 1);
        controller.ctx.lineTo(cardX + cardW - 20, cardY + 1);
        controller.ctx.stroke();

        // Draw text content
        controller.ctx.textAlign = 'center';
        controller.ctx.textBaseline = 'middle';

        if (controller.state.lives <= 0 && !controller.state.isRunning) {
            // GAME OVER STATE
            controller.ctx.fillStyle = '#ef4444';
            controller.ctx.font = '800 28px "Inter", sans-serif';
            controller.ctx.fillText(message, width / 2, cardY + cardH * 0.28);

            // Divider line
            controller.ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
            controller.ctx.lineWidth = 1;
            controller.ctx.beginPath();
            controller.ctx.moveTo(cardX + cardW * 0.2, cardY + cardH * 0.42);
            controller.ctx.lineTo(cardX + cardW * 0.8, cardY + cardH * 0.42);
            controller.ctx.stroke();

            controller.ctx.fillStyle = '#f8fafc';
            controller.ctx.font = '600 18px "Inter", sans-serif';
            const scoreLabel = controller.app.currentLanguage === 'es' ? 'Puntaje final' : 'Final Score';
            controller.ctx.fillText(scoreLabel, width / 2, cardY + cardH * 0.56);

            controller.ctx.fillStyle = '#34d399';
            controller.ctx.font = '800 32px "Inter", sans-serif';
            controller.ctx.fillText(String(controller.state.score), width / 2, cardY + cardH * 0.72);

            controller.ctx.fillStyle = '#64748b';
            controller.ctx.font = '400 13px "Inter", sans-serif';
            const actionLabel = controller.app.currentLanguage === 'es' ? 'Presiona Reiniciar para jugar de nuevo' : 'Click Restart to play again';
            controller.ctx.fillText(actionLabel, width / 2, cardY + cardH * 0.90);
        } else {
            // PAUSED STATE
            controller.ctx.fillStyle = '#fbbf24';
            controller.ctx.font = '800 28px "Inter", sans-serif';
            controller.ctx.fillText(message, width / 2, cardY + cardH * 0.35);

            // Pause icon decorative
            const iconSize = 18;
            const iconX = width / 2;
            const iconY = cardY + cardH * 0.55;
            controller.ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
            controller.ctx.fillRect(iconX - iconSize * 0.7, iconY - iconSize / 2, iconSize * 0.35, iconSize);
            controller.ctx.fillRect(iconX + iconSize * 0.35, iconY - iconSize / 2, iconSize * 0.35, iconSize);

            controller.ctx.fillStyle = '#94a3b8';
            controller.ctx.font = '400 14px "Inter", sans-serif';
            const pauseLabel = controller.app.currentLanguage === 'es' ? 'Presiona Reanudar o Espacio para seguir' : 'Press Resume or Space to continue';
            controller.ctx.fillText(pauseLabel, width / 2, cardY + cardH * 0.75);
        }

        controller.ctx.restore();
    }

    getFoodColor(food) {
        const controller = this.controller;
        const config = controller.difficultyConfig[controller.state.difficulty] || controller.difficultyConfig.easy;

        if (!config.showColorHints) {
            return 'rgba(51, 65, 85, 0.92)';
        }

        if (food.compatible) {
            return this.withAlpha(controller.getTargetColor(), 0.88);
        }

        return 'rgba(30, 41, 59, 0.90)';
    }

    lightenColor(hexColor, amount) {
        const value = String(hexColor || '').replace('#', '');
        if (value.length !== 6) return hexColor;
        const r = Math.min(255, parseInt(value.slice(0, 2), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(value.slice(2, 4), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(value.slice(4, 6), 16) + Math.floor(255 * amount));
        return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }

    darkenColor(hexColor, amount) {
        const value = String(hexColor || '').replace('#', '');
        if (value.length !== 6) return hexColor;
        const r = Math.max(0, parseInt(value.slice(0, 2), 16) - Math.floor(255 * amount));
        const g = Math.max(0, parseInt(value.slice(2, 4), 16) - Math.floor(255 * amount));
        const b = Math.max(0, parseInt(value.slice(4, 6), 16) - Math.floor(255 * amount));
        return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }

    withAlpha(hexColor, alpha) {
        const value = String(hexColor || '').replace('#', '');
        if (value.length !== 6) {
            return hexColor;
        }

        const red = parseInt(value.slice(0, 2), 16);
        const green = parseInt(value.slice(2, 4), 16);
        const blue = parseInt(value.slice(4, 6), 16);

        return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
    }

    drawRoundedRect(x, y, width, height, radius) {
        const controller = this.controller;
        const clampedRadius = Math.min(radius, width / 2, height / 2);

        controller.ctx.beginPath();
        controller.ctx.moveTo(x + clampedRadius, y);
        controller.ctx.lineTo(x + width - clampedRadius, y);
        controller.ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
        controller.ctx.lineTo(x + width, y + height - clampedRadius);
        controller.ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
        controller.ctx.lineTo(x + clampedRadius, y + height);
        controller.ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
        controller.ctx.lineTo(x, y + clampedRadius);
        controller.ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
        controller.ctx.closePath();
    }
}

window.QuantifierSnakeCanvasRenderer = QuantifierSnakeCanvasRenderer;
