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

    drawSnake() {
        const controller = this.controller;
        const snake = controller.state.snake;
        const bodyLength = snake.length;
        const dir = controller.state.direction || { x: 1, y: 0 };

        snake.forEach((segment, index) => {
            const isHead = index === 0;
            const isTail = index === bodyLength - 1;
            
            // Estrechamiento orgánico progresivo hacia la cola
            const taperFactor = isHead ? 1.0 : Math.max(0.42, 1.0 - (index * 0.055));
            const inset = controller.cellSize * 0.08;
            const baseSize = controller.cellSize - inset * 2;
            const size = baseSize * taperFactor;
            
            // Centrado en la celda
            const centerOffset = (controller.cellSize - size) / 2;
            const drawX = segment.x * controller.cellSize + centerOffset;
            const drawY = segment.y * controller.cellSize + centerOffset;

            controller.ctx.save();

            // Configurar resplandor neón sólo para la cabeza
            if (isHead) {
                controller.ctx.shadowBlur = 14;
                controller.ctx.shadowColor = 'rgba(52, 211, 153, 0.7)';
                
                // Dibujar lengua bífida animada
                this.drawSnakeTongue(drawX, drawY, size, dir);
            }

            // Gradientes premium
            if (isHead) {
                const headGrad = controller.ctx.createRadialGradient(
                    drawX + size * 0.35, drawY + size * 0.35, size * 0.08,
                    drawX + size * 0.5, drawY + size * 0.5, size * 0.68
                );
                headGrad.addColorStop(0, '#6ee7b7'); // Emerald light
                headGrad.addColorStop(0.4, '#34d399'); // Emerald
                headGrad.addColorStop(0.75, '#10b981'); // Emerald medium
                headGrad.addColorStop(1, '#047857'); // Forest green
                controller.ctx.fillStyle = headGrad;
            } else {
                const bodyGrad = controller.ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
                const segmentProgress = index / Math.max(1, bodyLength - 1);
                if (index % 2 === 0) {
                    bodyGrad.addColorStop(0, `hsl(152, ${72 - segmentProgress * 15}%, ${48 - segmentProgress * 12}%)`);
                    bodyGrad.addColorStop(1, `hsl(155, ${65 - segmentProgress * 10}%, ${35 - segmentProgress * 10}%)`);
                } else {
                    bodyGrad.addColorStop(0, `hsl(160, ${68 - segmentProgress * 12}%, ${44 - segmentProgress * 10}%)`);
                    bodyGrad.addColorStop(1, `hsl(170, ${60 - segmentProgress * 10}%, ${30 - segmentProgress * 8}%)`);
                }
                controller.ctx.fillStyle = bodyGrad;
            }

            // Determinar radios de esquinas dinámicamente según dirección y posición
            let tl = size * 0.25, tr = size * 0.25, br = size * 0.25, bl = size * 0.25;
            if (isHead) {
                const strongRadius = size * 0.5;
                const weakRadius = size * 0.2;
                if (dir.x === 1) {
                    tl = weakRadius; bl = weakRadius; tr = strongRadius; br = strongRadius;
                } else if (dir.x === -1) {
                    tr = weakRadius; br = weakRadius; tl = strongRadius; bl = strongRadius;
                } else if (dir.y === 1) {
                    tl = weakRadius; tr = weakRadius; bl = strongRadius; br = strongRadius;
                } else if (dir.y === -1) {
                    bl = weakRadius; br = weakRadius; tl = strongRadius; tr = strongRadius;
                }
            } else if (isTail) {
                tl = tr = br = bl = size * 0.45;
            }

            this.drawCustomRoundedRect(drawX, drawY, size, size, tl, tr, br, bl);
            controller.ctx.fill();

            // 3D sheen/gloss highlight
            controller.ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
            controller.ctx.beginPath();
            controller.ctx.arc(drawX + size * 0.30, drawY + size * 0.30, size * 0.14, 0, Math.PI * 2);
            controller.ctx.fill();

            // Subtle body shadow
            if (!isHead) {
                controller.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
                controller.ctx.beginPath();
                controller.ctx.arc(drawX + size * 0.6, drawY + size * 0.65, size * 0.18, 0, Math.PI * 2);
                controller.ctx.fill();
            }

            // Dibujar ojos direccionales detallados
            if (isHead) {
                this.drawSnakeEyes(drawX, drawY, size, dir);
            }

            controller.ctx.restore();
        });
    }

    drawSnakeEyes(x, y, size, dir) {
        const controller = this.controller;
        const eyeRadius = Math.max(2.5, size * 0.12);
        const pupilRadius = Math.max(1.2, eyeRadius * 0.45);
        
        let leftEye = { x: 0, y: 0 };
        let rightEye = { x: 0, y: 0 };
        
        if (dir.x === 1) {
            leftEye = { x: x + size * 0.65, y: y + size * 0.28 };
            rightEye = { x: x + size * 0.65, y: y + size * 0.72 };
        } else if (dir.x === -1) {
            leftEye = { x: x + size * 0.35, y: y + size * 0.28 };
            rightEye = { x: x + size * 0.35, y: y + size * 0.72 };
        } else if (dir.y === 1) {
            leftEye = { x: x + size * 0.28, y: y + size * 0.65 };
            rightEye = { x: x + size * 0.72, y: y + size * 0.65 };
        } else if (dir.y === -1) {
            leftEye = { x: x + size * 0.28, y: y + size * 0.35 };
            rightEye = { x: x + size * 0.72, y: y + size * 0.35 };
        } else {
            leftEye = { x: x + size * 0.35, y: y + size * 0.35 };
            rightEye = { x: x + size * 0.65, y: y + size * 0.35 };
        }

        // Esclerótica con borde sutil
        controller.ctx.fillStyle = '#ffffff';
        controller.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        controller.ctx.lineWidth = 0.5;
        
        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();
        controller.ctx.stroke();
        
        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();
        controller.ctx.stroke();

        // Pupilas
        controller.ctx.fillStyle = '#0f172a';
        const pupOffsetX = dir.x * (eyeRadius * 0.22);
        const pupOffsetY = dir.y * (eyeRadius * 0.22);

        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x + pupOffsetX, leftEye.y + pupOffsetY, pupilRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x + pupOffsetX, rightEye.y + pupOffsetY, pupilRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        // Destello brillante
        controller.ctx.fillStyle = '#ffffff';
        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x + pupOffsetX - pupilRadius * 0.3, leftEye.y + pupOffsetY - pupilRadius * 0.3, pupilRadius * 0.35, 0, Math.PI * 2);
        controller.ctx.fill();

        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x + pupOffsetX - pupilRadius * 0.3, rightEye.y + pupOffsetY - pupilRadius * 0.3, pupilRadius * 0.35, 0, Math.PI * 2);
        controller.ctx.fill();
    }

    drawSnakeTongue(drawX, drawY, size, dir) {
        if (Math.floor(Date.now() / 250) % 2 === 0) {
            return;
        }

        const ctx = this.controller.ctx;
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = Math.max(1.8, size * 0.08);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const startX = drawX + size / 2 + dir.x * (size / 2);
        const startY = drawY + size / 2 + dir.y * (size / 2);

        const length = size * 0.28;
        const mainX = startX + dir.x * length;
        const mainY = startY + dir.y * length;

        ctx.moveTo(startX, startY);
        ctx.lineTo(mainX, mainY);

        const forkSize = size * 0.14;
        if (dir.x !== 0) {
            ctx.moveTo(mainX, mainY);
            ctx.lineTo(mainX + dir.x * forkSize, mainY - forkSize);
            ctx.moveTo(mainX, mainY);
            ctx.lineTo(mainX + dir.x * forkSize, mainY + forkSize);
        } else if (dir.y !== 0) {
            ctx.moveTo(mainX, mainY);
            ctx.lineTo(mainX - forkSize, mainY + dir.y * forkSize);
            ctx.moveTo(mainX, mainY);
            ctx.lineTo(mainX + forkSize, mainY + dir.y * forkSize);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawCustomRoundedRect(x, y, w, h, tl, tr, br, bl) {
        const ctx = this.controller.ctx;
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        ctx.lineTo(x + bl, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.closePath();
    }

    drawFoods() {
        const controller = this.controller;
        const config = controller.difficultyConfig[controller.state.difficulty] || controller.difficultyConfig.easy;

        controller.state.foods.forEach((food) => {
            const x = food.x * controller.cellSize;
            const y = food.y * controller.cellSize;
            const inset = controller.cellSize * 0.06;

            // Floating bob effect
            const bobOffset = Math.sin(Date.now() / 600 + (food.x * 5 + food.y * 11)) * 1.5;

            // Pulse scaling
            const pulseFactor = 0.92 + 0.08 * Math.sin(Date.now() / 180 + (food.x * 3 + food.y * 7));
            const baseSize = controller.cellSize - inset * 2;
            const size = baseSize * pulseFactor;
            const centerOffset = (controller.cellSize - size) / 2;
            const drawX = x + centerOffset;
            const drawY = y + centerOffset + bobOffset;
            const radius = size * 0.28;

            controller.ctx.save();

            // Neon glow for compatible food
            if (config.showColorHints && food.compatible) {
                controller.ctx.shadowBlur = 16;
                controller.ctx.shadowColor = controller.getTargetColor();
            }

            // Food background with gradient
            const foodColor = this.getFoodColor(food);
            const foodGrad = controller.ctx.createRadialGradient(
                drawX + size * 0.35, drawY + size * 0.35, size * 0.05,
                drawX + size * 0.5, drawY + size * 0.5, size * 0.65
            );

            if (config.showColorHints && food.compatible) {
                const baseColor = controller.getTargetColor();
                foodGrad.addColorStop(0, this.lightenColor(baseColor, 0.3));
                foodGrad.addColorStop(0.6, foodColor);
                foodGrad.addColorStop(1, this.darkenColor(baseColor, 0.2));
            } else {
                foodGrad.addColorStop(0, 'rgba(71, 85, 105, 0.95)');
                foodGrad.addColorStop(1, foodColor);
            }

            controller.ctx.fillStyle = foodGrad;
            this.drawRoundedRect(drawX, drawY, size, size, radius);
            controller.ctx.fill();

            // Inner highlight sheen
            controller.ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
            controller.ctx.beginPath();
            controller.ctx.arc(drawX + size * 0.35, drawY + size * 0.32, size * 0.18, 0, Math.PI * 2);
            controller.ctx.fill();

            // Subtle border
            controller.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            controller.ctx.lineWidth = 1.2;
            controller.ctx.stroke();

            // Reset shadow for text
            controller.ctx.shadowBlur = 0;

            // Hanzi label
            const label = food.word.hanzi;
            const fontSize = label.length > 1 ? size * 0.36 : size * 0.48;

            controller.ctx.fillStyle = '#f8fafc';
            controller.ctx.font = '700 ' + fontSize.toFixed(1) + 'px "Noto Sans SC", sans-serif';
            controller.ctx.textAlign = 'center';
            controller.ctx.textBaseline = 'middle';

            // Text shadow for readability
            controller.ctx.shadowBlur = 3;
            controller.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            controller.ctx.fillText(label, x + controller.cellSize / 2, y + controller.cellSize / 2 + bobOffset + 1);
            controller.ctx.shadowBlur = 0;

            controller.ctx.restore();
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
