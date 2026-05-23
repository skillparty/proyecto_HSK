class QuantifierSnakeCanvasRenderer {
    constructor(controller) {
        this.controller = controller;
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
        const controller = this.controller;
        const gradient = controller.ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#111827');
        gradient.addColorStop(1, '#1f2937');

        controller.ctx.fillStyle = gradient;
        controller.ctx.fillRect(0, 0, width, height);
    }

    drawGrid() {
        const controller = this.controller;

        controller.ctx.save();
        controller.ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        controller.ctx.lineWidth = 1;

        for (let index = 0; index <= controller.boardSize; index += 1) {
            const coordinate = index * controller.cellSize;

            controller.ctx.beginPath();
            controller.ctx.moveTo(coordinate, 0);
            controller.ctx.lineTo(coordinate, controller.canvas.height);
            controller.ctx.stroke();

            controller.ctx.beginPath();
            controller.ctx.moveTo(0, coordinate);
            controller.ctx.lineTo(controller.canvas.width, coordinate);
            controller.ctx.stroke();
        }

        controller.ctx.restore();
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
            const taperFactor = isHead ? 1.0 : Math.max(0.42, 1.0 - (index * 0.065));
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
                controller.ctx.shadowBlur = 10;
                controller.ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
                
                // Dibujar lengua bífida animada
                this.drawSnakeTongue(drawX, drawY, size, dir);
            }

            // Gradientes premium
            if (isHead) {
                const headGrad = controller.ctx.createRadialGradient(
                    drawX + size * 0.35, drawY + size * 0.35, size * 0.08,
                    drawX + size * 0.5, drawY + size * 0.5, size * 0.68
                );
                headGrad.addColorStop(0, '#34d399'); // Emerald claro
                headGrad.addColorStop(0.55, '#10b981'); // Emerald medio
                headGrad.addColorStop(1, '#047857'); // Forest green
                controller.ctx.fillStyle = headGrad;
            } else {
                const bodyGrad = controller.ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
                if (index % 2 === 0) {
                    bodyGrad.addColorStop(0, '#22c55e');
                    bodyGrad.addColorStop(1, '#15803d');
                } else {
                    bodyGrad.addColorStop(0, '#10b981');
                    bodyGrad.addColorStop(1, '#0f766e');
                }
                controller.ctx.fillStyle = bodyGrad;
            }

            // Determinar radios de esquinas dinámicamente según dirección y posición
            let tl = size * 0.25, tr = size * 0.25, br = size * 0.25, bl = size * 0.25;
            if (isHead) {
                // Radio muy pronunciado en el lado frontal de movimiento
                const strongRadius = size * 0.5;
                const weakRadius = size * 0.2;
                if (dir.x === 1) { // Derecha
                    tl = weakRadius; bl = weakRadius; tr = strongRadius; br = strongRadius;
                } else if (dir.x === -1) { // Izquierda
                    tr = weakRadius; br = weakRadius; tl = strongRadius; bl = strongRadius;
                } else if (dir.y === 1) { // Abajo
                    tl = weakRadius; tr = weakRadius; bl = strongRadius; br = strongRadius;
                } else if (dir.y === -1) { // Arriba
                    bl = weakRadius; br = weakRadius; tl = strongRadius; tr = strongRadius;
                }
            } else if (isTail) {
                // Cola redondeada casi esférica
                tl = tr = br = bl = size * 0.45;
            }

            this.drawCustomRoundedRect(drawX, drawY, size, size, tl, tr, br, bl);
            controller.ctx.fill();

            // Sombra interna y escala 3D con reflejo blanco brillante (sheen gloss)
            controller.ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            controller.ctx.beginPath();
            controller.ctx.arc(drawX + size * 0.32, drawY + size * 0.32, size * 0.16, 0, Math.PI * 2);
            controller.ctx.fill();

            // Dibujar ojos direccionales detallados
            if (isHead) {
                this.drawSnakeEyes(drawX, drawY, size, dir);
            }

            controller.ctx.restore();
        });
    }

    drawSnakeEyes(x, y, size, dir) {
        const controller = this.controller;
        const eyeRadius = Math.max(2.2, size * 0.11);
        const pupilRadius = Math.max(1.0, eyeRadius * 0.45);
        
        let leftEye = { x: 0, y: 0 };
        let rightEye = { x: 0, y: 0 };
        
        // Orientación de ojos según dirección de movimiento
        if (dir.x === 1) { // Derecha
            leftEye = { x: x + size * 0.65, y: y + size * 0.28 };
            rightEye = { x: x + size * 0.65, y: y + size * 0.72 };
        } else if (dir.x === -1) { // Izquierda
            leftEye = { x: x + size * 0.35, y: y + size * 0.28 };
            rightEye = { x: x + size * 0.35, y: y + size * 0.72 };
        } else if (dir.y === 1) { // Abajo
            leftEye = { x: x + size * 0.28, y: y + size * 0.65 };
            rightEye = { x: x + size * 0.72, y: y + size * 0.65 };
        } else if (dir.y === -1) { // Arriba
            leftEye = { x: x + size * 0.28, y: y + size * 0.35 };
            rightEye = { x: x + size * 0.72, y: y + size * 0.35 };
        } else {
            // Default
            leftEye = { x: x + size * 0.35, y: y + size * 0.35 };
            rightEye = { x: x + size * 0.65, y: y + size * 0.35 };
        }

        // Dibujar base blanca del ojo (esclerótica)
        controller.ctx.fillStyle = '#ffffff';
        
        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();
        
        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        // Dibujar pupilas oscuras con micro-mirada adaptada
        controller.ctx.fillStyle = '#0f172a';
        const pupOffsetX = dir.x * (eyeRadius * 0.22);
        const pupOffsetY = dir.y * (eyeRadius * 0.22);

        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x + pupOffsetX, leftEye.y + pupOffsetY, pupilRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x + pupOffsetX, rightEye.y + pupOffsetY, pupilRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        // Destello brillante en la pupila
        controller.ctx.fillStyle = '#ffffff';
        controller.ctx.beginPath();
        controller.ctx.arc(leftEye.x + pupOffsetX - pupilRadius * 0.25, leftEye.y + pupOffsetY - pupilRadius * 0.25, pupilRadius * 0.3, 0, Math.PI * 2);
        controller.ctx.fill();

        controller.ctx.beginPath();
        controller.ctx.arc(rightEye.x + pupOffsetX - pupilRadius * 0.25, rightEye.y + pupOffsetY - pupilRadius * 0.25, pupilRadius * 0.3, 0, Math.PI * 2);
        controller.ctx.fill();
    }

    drawSnakeTongue(drawX, drawY, size, dir) {
        // Parpadeo: sólo se dibuja en ciertos intervalos de tiempo
        if (Math.floor(Date.now() / 250) % 2 === 0) {
            return;
        }

        const ctx = this.controller.ctx;
        ctx.save();
        ctx.strokeStyle = '#f43f5e'; // Rojo frambuesa vibrante
        ctx.lineWidth = Math.max(1.8, size * 0.08);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // Punto de inicio centrado en la cara correspondiente de la cabeza
        const startX = drawX + size / 2 + dir.x * (size / 2);
        const startY = drawY + size / 2 + dir.y * (size / 2);

        // Extensión
        const length = size * 0.24;
        const mainX = startX + dir.x * length;
        const mainY = startY + dir.y * length;

        ctx.moveTo(startX, startY);
        ctx.lineTo(mainX, mainY);

        // Ramificación bífida
        const forkSize = size * 0.12;
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

        controller.state.foods.forEach((food) => {
            const x = food.x * controller.cellSize;
            const y = food.y * controller.cellSize;
            const inset = controller.cellSize * 0.08;
            const size = controller.cellSize - inset * 2;
            const radius = controller.cellSize * 0.24;

            controller.ctx.save();
            controller.ctx.fillStyle = this.getFoodColor(food);
            this.drawRoundedRect(x + inset, y + inset, size, size, radius);
            controller.ctx.fill();

            controller.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            controller.ctx.lineWidth = 1;
            controller.ctx.stroke();

            const label = food.word.hanzi;
            const fontSize = label.length > 1 ? controller.cellSize * 0.38 : controller.cellSize * 0.48;

            controller.ctx.fillStyle = '#f8fafc';
            controller.ctx.font = '600 ' + fontSize.toFixed(1) + 'px "Noto Sans SC", sans-serif';
            controller.ctx.textAlign = 'center';
            controller.ctx.textBaseline = 'middle';
            controller.ctx.fillText(label, x + controller.cellSize / 2, y + controller.cellSize / 2 + 1);

            controller.ctx.restore();
        });
    }

    drawOverlay(message) {
        const controller = this.controller;

        controller.ctx.save();
        controller.ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
        controller.ctx.fillRect(0, 0, controller.canvas.width, controller.canvas.height);

        controller.ctx.fillStyle = '#f8fafc';
        controller.ctx.font = '700 24px Inter, sans-serif';
        controller.ctx.textAlign = 'center';
        controller.ctx.textBaseline = 'middle';
        controller.ctx.fillText(message, controller.canvas.width / 2, controller.canvas.height / 2);
        controller.ctx.restore();
    }

    getFoodColor(food) {
        const controller = this.controller;
        const config = controller.difficultyConfig[controller.state.difficulty] || controller.difficultyConfig.easy;

        if (!config.showColorHints) {
            return 'rgba(51, 65, 85, 0.95)';
        }

        if (food.compatible) {
            return this.withAlpha(controller.getTargetColor(), 0.92);
        }

        return 'rgba(30, 41, 59, 0.92)';
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
