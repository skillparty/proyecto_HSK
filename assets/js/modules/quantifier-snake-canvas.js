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

        controller.state.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const x = segment.x * controller.cellSize;
            const y = segment.y * controller.cellSize;
            const inset = controller.cellSize * 0.08;
            const size = controller.cellSize - inset * 2;
            const radius = controller.cellSize * 0.25;

            controller.ctx.save();

            controller.ctx.fillStyle = isHead ? '#22c55e' : '#16a34a';
            this.drawRoundedRect(x + inset, y + inset, size, size, radius);
            controller.ctx.fill();

            if (isHead) {
                this.drawSnakeEyes(x + inset, y + inset, size);
            }

            controller.ctx.restore();
        });
    }

    drawSnakeEyes(x, y, size) {
        const controller = this.controller;
        const eyeRadius = Math.max(1.5, size * 0.08);
        const offsetY = size * 0.35;
        const leftX = x + size * 0.32;
        const rightX = x + size * 0.68;

        controller.ctx.fillStyle = '#052e16';
        controller.ctx.beginPath();
        controller.ctx.arc(leftX, y + offsetY, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();

        controller.ctx.beginPath();
        controller.ctx.arc(rightX, y + offsetY, eyeRadius, 0, Math.PI * 2);
        controller.ctx.fill();
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
