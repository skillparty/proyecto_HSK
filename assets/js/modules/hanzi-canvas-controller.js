/**
 * HanziCanvasController - Interactive Chinese Calligraphy & Stroke Drawing Canvas
 * Supports high-DPI rendering, touch/pen/mouse inputs, Mi Zi Ge practice grid,
 * ghost guide tracing, stroke undo, and brush customizations.
 */
class HanziCanvasController {
    constructor(app) {
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentStroke = [];
        this.strokes = []; // Array of strokes: [ [{x, y}], ... ]
        this.currentChar = "中";
        this.showGhost = true;
        this.brushColor = "#e11d48";
        this.brushWidth = 12;
        this.isInitialized = false;
    }

    initialize() {
        this.canvas = document.getElementById("hanzi-draw-canvas");
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
        this.setupCanvasDPI();
        this.bindEvents();
        this.redraw();
        this.isInitialized = true;
    }

    setupCanvasDPI() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const size = Math.min(360, Math.max(280, rect.width || 320));

        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;

        this.ctx.scale(dpr, dpr);
        this.canvasSize = size;
    }

    bindEvents() {
        if (!this.canvas) return;

        // Pointer events (unifies mouse, pen, and touch)
        this.canvas.addEventListener("pointerdown", (e) => this.handlePointerDown(e));
        this.canvas.addEventListener("pointermove", (e) => this.handlePointerMove(e));
        this.canvas.addEventListener("pointerup", (e) => this.handlePointerUp(e));
        this.canvas.addEventListener("pointercancel", (e) => this.handlePointerUp(e));

        // Canvas controls
        const clearBtn = document.getElementById("hanzi-canvas-clear-btn");
        const undoBtn = document.getElementById("hanzi-canvas-undo-btn");
        const ghostToggle = document.getElementById("hanzi-canvas-ghost-toggle");
        const audioBtn = document.getElementById("hanzi-canvas-audio-btn");
        const charInput = document.getElementById("hanzi-canvas-char-input");
        const animateBtn = document.getElementById("hanzi-canvas-animate-btn");

        if (clearBtn) clearBtn.addEventListener("click", () => this.clear());
        if (undoBtn) undoBtn.addEventListener("click", () => this.undo());
        if (ghostToggle) {
            ghostToggle.addEventListener("click", () => {
                this.showGhost = !this.showGhost;
                ghostToggle.classList.toggle("active", this.showGhost);
                this.redraw();
            });
        }
        if (audioBtn) {
            audioBtn.addEventListener("click", () => {
                this.app?.audioController?.playAudio?.(this.currentChar);
            });
        }
        if (charInput) {
            charInput.addEventListener("input", (e) => {
                const val = (e.target.value || "").trim();
                if (val) {
                    this.setCharacter(val[val.length - 1]);
                }
            });
        }
        if (animateBtn) {
            animateBtn.addEventListener("click", () => this.animateStrokes());
        }

        // Color chips
        document.querySelectorAll(".hz-color-chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                document.querySelectorAll(".hz-color-chip").forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                this.brushColor = chip.dataset.color || "#e11d48";
            });
        });

        // Quick character chips
        document.querySelectorAll(".hz-quick-char").forEach((chip) => {
            chip.addEventListener("click", () => {
                const char = chip.textContent.trim();
                if (char) this.setCharacter(char);
            });
        });

        window.addEventListener("resize", () => {
            if (this.canvas && this.canvas.offsetParent !== null) {
                this.setupCanvasDPI();
                this.redraw();
            }
        });
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Support Apple Pencil / Stylus pressure (0.0 to 1.0)
        const hasPressure = typeof e.pressure === "number" && e.pressure > 0;
        const pressure = hasPressure ? e.pressure : 0.5;
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: pressure,
            pointerType: e.pointerType || "touch",
        };
    }

    handlePointerDown(e) {
        e.preventDefault();
        this.canvas.setPointerCapture(e.pointerId);
        this.isDrawing = true;
        const pt = this.getCanvasCoordinates(e);
        this.currentStroke = [pt];
        const dotWidth = this.brushWidth * (0.4 + 1.2 * pt.pressure);
        this.drawDot(pt.x, pt.y, dotWidth);
    }

    handlePointerMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        const pt = this.getCanvasCoordinates(e);
        this.currentStroke.push(pt);
        this.redraw();
    }

    handlePointerUp(_e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentStroke.length > 0) {
            this.strokes.push({
                points: this.currentStroke,
                color: this.brushColor,
                width: this.brushWidth,
            });
            this.currentStroke = [];
        }
        this.redraw();
    }

    drawDot(x, y, width) {
        const w = width || this.brushWidth;
        this.ctx.fillStyle = this.brushColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, Math.max(1, w / 2), 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGrid() {
        const size = this.canvasSize || 320;
        const ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = "rgba(225, 29, 72, 0.25)"; // Red grid lines
        ctx.lineWidth = 1;

        // Outer border
        ctx.strokeRect(4, 4, size - 8, size - 8);

        // Center cross
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(size / 2, 4);
        ctx.lineTo(size / 2, size - 4);
        ctx.moveTo(4, size / 2);
        ctx.lineTo(size - 4, size / 2);

        // Diagonals (Mi Zi Ge)
        ctx.moveTo(4, 4);
        ctx.lineTo(size - 4, size - 4);
        ctx.moveTo(size - 4, 4);
        ctx.lineTo(4, size - 4);
        ctx.stroke();

        ctx.restore();
    }

    drawGhostCharacter() {
        if (!this.showGhost || !this.currentChar) return;

        const size = this.canvasSize || 320;
        const ctx = this.ctx;

        ctx.save();
        ctx.font = `bold ${Math.round(size * 0.72)}px "Noto Serif SC", "Kaiti", "STKaiti", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Ghost character in light tint
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillText(this.currentChar, size / 2, size / 2 + size * 0.04);

        // Subtle outline for tracing
        ctx.strokeStyle = "rgba(225, 29, 72, 0.18)";
        ctx.lineWidth = 1.5;
        ctx.strokeText(this.currentChar, size / 2, size / 2 + size * 0.04);

        ctx.restore();
    }

    drawStroke(stroke) {
        const pts = stroke.points;
        if (!pts || pts.length === 0) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = stroke.color || this.brushColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const baseWidth = stroke.width || this.brushWidth;

        if (pts.length === 1) {
            const dotWidth = baseWidth * (0.4 + 1.2 * (pts[0].pressure || 0.5));
            this.drawDot(pts[0].x, pts[0].y, dotWidth);
            ctx.restore();
            return;
        }

        // Draw segmented strokes with variable brush width based on stylus pressure
        for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p1Width = baseWidth * (0.4 + 1.2 * (p1.pressure || 0.5));
            const p2Width = baseWidth * (0.4 + 1.2 * (p2.pressure || 0.5));
            const avgWidth = (p1Width + p2Width) / 2;

            ctx.lineWidth = Math.max(2, avgWidth);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    redraw() {
        if (!this.ctx) return;
        const size = this.canvasSize || 320;
        this.ctx.clearRect(0, 0, size, size);

        this.drawGrid();
        this.drawGhostCharacter();

        // Draw all finished strokes
        this.strokes.forEach((stroke) => this.drawStroke(stroke));

        // Draw current in-progress stroke
        if (this.currentStroke.length > 0) {
            this.drawStroke({
                points: this.currentStroke,
                color: this.brushColor,
                width: this.brushWidth,
            });
        }
    }

    undo() {
        if (this.strokes.length > 0) {
            this.strokes.pop();
            this.redraw();
        }
    }

    clear() {
        this.strokes = [];
        this.currentStroke = [];
        this.redraw();
    }

    setCharacter(char) {
        if (!char) return;
        this.currentChar = char;
        this.clear();

        const displayEl = document.getElementById("hanzi-canvas-char-display");
        if (displayEl) displayEl.textContent = char;

        const charInput = document.getElementById("hanzi-canvas-char-input");
        if (charInput && charInput.value !== char) charInput.value = char;

        this.redraw();
        this.app?.audioController?.playAudio?.(char);
    }

    animateStrokes() {
        // Pulse animation effect
        const canvas = this.canvas;
        if (!canvas) return;

        canvas.style.transition = "transform 0.25s ease, filter 0.25s ease";
        canvas.style.transform = "scale(1.04)";
        canvas.style.filter = "drop-shadow(0 0 15px rgba(225, 29, 72, 0.6))";

        this.app?.audioController?.playAudio?.(this.currentChar);

        setTimeout(() => {
            canvas.style.transform = "";
            canvas.style.filter = "";
        }, 400);
    }
}

window.HanziCanvasController = HanziCanvasController;
