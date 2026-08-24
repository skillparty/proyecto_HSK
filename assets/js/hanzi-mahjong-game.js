// hanzi-mahjong-game.js — Motor del Laboratorio de Mahjong de Caracteres

const MAHJONG_RADICAL_PAIRS = [
    { id: "hai", partA: "氵", partB: "每", result: "海", meaning: "Mar" },
    { id: "hua", partA: "讠", partB: "舌", result: "话", meaning: "Hablar / Palabra" },
    { id: "hao", partA: "女", partB: "子", result: "好", meaning: "Bueno / Bien" },
    { id: "ni", partA: "亻", partB: "尔", result: "你", meaning: "Tú" },
    { id: "lin", partA: "木", partB: "木", result: "林", meaning: "Bosque" },
    { id: "ming", partA: "日", partB: "月", result: "明", meaning: "Brillante" },
    { id: "chi", partA: "口", partB: "乞", result: "吃", meaning: "Comer" },
    { id: "qiu", partA: "禾", partB: "火", result: "秋", meaning: "Otoño" },
    { id: "xiu", partA: "亻", partB: "木", result: "休", meaning: "Descansar" },
    { id: "ma", partA: "口", partB: "马", result: "吗", meaning: "Partícula interrogativa" },
    { id: "xie", partA: "讠", partB: "身", result: "谢", meaning: "Agradecer" },
    { id: "he", partA: "口", partB: "渴", result: "喝", meaning: "Beber" },
    { id: "qing", partA: "氵", partB: "青", result: "清", meaning: "Claro / Puro" },
    { id: "zhu", partA: "亻", partB: "主", result: "住", meaning: "Vivir / Residir" }
];

const MAHJONG_COMPOUND_PAIRS = [
    { id: "feiji", partA: "飞", partB: "机", result: "飞机", meaning: "Avión" },
    { id: "dianhua", partA: "电", partB: "话", result: "电话", meaning: "Teléfono" },
    { id: "zhongguo", partA: "中", partB: "国", result: "中国", meaning: "China" },
    { id: "pingguo", partA: "苹", partB: "果", result: "苹果", meaning: "Manzana" },
    { id: "xuesheng", partA: "学", partB: "生", result: "学生", meaning: "Estudiante" },
    { id: "mingtian", partA: "明", partB: "天", result: "明天", meaning: "Mañana" },
    { id: "pengyou", partA: "朋", partB: "友", result: "朋友", meaning: "Amigo" },
    { id: "kanjian", partA: "看", partB: "见", result: "看见", meaning: "Ver" },
    { id: "kaishi", partA: "开", partB: "始", result: "开始", meaning: "Empezar" },
    { id: "xihuan", partA: "喜", partB: "欢", result: "喜欢", meaning: "Gustar" },
    { id: "gaoxing", partA: "高", partB: "兴", result: "高兴", meaning: "Feliz" },
    { id: "yiyuan", partA: "医", partB: "院", result: "医院", meaning: "Hospital" },
    { id: "shangdian", partA: "商", partB: "店", result: "商店", meaning: "Tienda" },
    { id: "fanguan", partA: "饭", partB: "馆", result: "饭馆", meaning: "Restaurante" }
];

class HanziMahjongGame {
    constructor(app) {
        this.app = app;
        this.currentMode = "radicals"; // "radicals" | "compounds"
        this.currentDifficulty = "normal"; // "easy" (6) | "normal" (8) | "master" (12)
        this.score = 0;
        this.combo = 0;
        this.hintsRemaining = 3;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.selectedTile = null;
        this.pairsRemaining = 8;
        this.targetPairs = 8;
        this.tiles = [];
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.startNewGame();
    }

    cacheDOM() {
        this.container = document.getElementById("hanzi-mahjong");
        this.scoreEl = document.getElementById("mahjong-score");
        this.comboEl = document.getElementById("mahjong-combo");
        this.pairsLeftEl = document.getElementById("mahjong-pairs-left");
        this.timerEl = document.getElementById("mahjong-timer");
        this.boardEl = document.getElementById("mahjong-board");

        this.hintBtn = document.getElementById("mahjong-hint-btn");
        this.hintsCountEl = document.getElementById("mahjong-hints-count");
        this.shuffleBtn = document.getElementById("mahjong-shuffle-btn");
        this.newGameBtn = document.getElementById("mahjong-new-game-btn");

        this.victoryOverlay = document.getElementById("mahjong-victory-overlay");
        this.finalScoreEl = document.getElementById("mahjong-final-score");
        this.playAgainBtn = document.getElementById("mahjong-play-again-btn");
    }

    bindEvents() {
        document.querySelectorAll(".mahjong-mode-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".mahjong-mode-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentMode = btn.getAttribute("data-mode") || "radicals";
                this.startNewGame();
            });
        });

        document.querySelectorAll(".mahjong-diff-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".mahjong-diff-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentDifficulty = btn.getAttribute("data-diff") || "normal";
                this.startNewGame();
            });
        });

        if (this.hintBtn) {
            this.hintBtn.addEventListener("click", () => this.useHint());
        }

        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener("click", () => this.shuffleRemainingTiles());
        }

        if (this.newGameBtn) {
            this.newGameBtn.addEventListener("click", () => this.startNewGame());
        }

        if (this.playAgainBtn) {
            this.playAgainBtn.addEventListener("click", () => {
                if (this.victoryOverlay) this.victoryOverlay.style.display = "none";
                this.startNewGame();
            });
        }
    }

    playTileClickSound() {
        try {
            const ctx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        } catch {
            // Audio ignore
        }
    }

    startNewGame() {
        this.targetPairs = this.currentDifficulty === "easy" ? 6 : (this.currentDifficulty === "master" ? 12 : 8);
        this.pairsRemaining = this.targetPairs;
        this.score = 0;
        this.combo = 0;
        this.hintsRemaining = 3;
        this.selectedTile = null;

        if (this.victoryOverlay) this.victoryOverlay.style.display = "none";
        this.updateStatsDisplay();

        this.startTimer();
        this.setupBoardTiles();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerSeconds = 0;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timerSeconds += 1;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        if (!this.timerEl) return;
        const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, "0");
        const secs = (this.timerSeconds % 60).toString().padStart(2, "0");
        this.timerEl.textContent = `${mins}:${secs}`;
    }

    updateStatsDisplay() {
        if (this.scoreEl) this.scoreEl.textContent = this.score;
        if (this.comboEl) this.comboEl.textContent = `${this.combo}×`;
        if (this.pairsLeftEl) this.pairsLeftEl.textContent = this.pairsRemaining;
        if (this.hintsCountEl) this.hintsCountEl.textContent = this.hintsRemaining;
    }

    setupBoardTiles() {
        const dataset = this.currentMode === "radicals" ? MAHJONG_RADICAL_PAIRS : MAHJONG_COMPOUND_PAIRS;
        const pool = [...dataset].sort(() => Math.random() - 0.5).slice(0, this.targetPairs);
        const rawTiles = [];

        pool.forEach((pair) => {
            rawTiles.push({
                uid: `${pair.id}-A`,
                pairId: pair.id,
                hanzi: pair.partA,
                type: this.currentMode === "radicals" ? "Radical" : "Hanzi 1",
                meaning: pair.meaning,
                result: pair.result,
                isMatched: false
            });
            rawTiles.push({
                uid: `${pair.id}-B`,
                pairId: pair.id,
                hanzi: pair.partB,
                type: this.currentMode === "radicals" ? "Componente" : "Hanzi 2",
                meaning: pair.meaning,
                result: pair.result,
                isMatched: false
            });
        });

        // Barajar aleatoriamente
        this.tiles = rawTiles.sort(() => Math.random() - 0.5);
        this.renderBoard();
    }

    renderBoard() {
        if (!this.boardEl) return;

        this.boardEl.className = `mahjong-board grid-${this.currentDifficulty}`;

        this.boardEl.innerHTML = this.tiles.map((tile, idx) => `
            <div class="mahjong-tile ${tile.isMatched ? "matched" : ""}" data-idx="${idx}" data-uid="${tile.uid}">
                <div class="tile-hanzi">${tile.hanzi}</div>
                <div class="tile-type-label">${tile.type}</div>
            </div>
        `).join("");

        this.boardEl.querySelectorAll(".mahjong-tile").forEach((tileEl) => {
            tileEl.addEventListener("click", () => {
                const idx = parseInt(tileEl.getAttribute("data-idx"), 10);
                this.handleTileClick(idx, tileEl);
            });
        });
    }

    handleTileClick(idx, tileEl) {
        const tile = this.tiles[idx];
        if (!tile || tile.isMatched) return;

        this.playTileClickSound();

        // Limpiar hints
        this.boardEl?.querySelectorAll(".hinted").forEach((el) => el.classList.remove("hinted"));

        if (!this.selectedTile) {
            // Primer click
            this.selectedTile = { idx, tile, el: tileEl };
            tileEl.classList.add("selected");
            this.app?.audioController?.playWordAudio?.(tile.hanzi);
            return;
        }

        if (this.selectedTile.idx === idx) {
            // Deseleccionar mismo tile
            tileEl.classList.remove("selected");
            this.selectedTile = null;
            return;
        }

        // Segundo click: evaluar pareja
        const first = this.selectedTile;
        this.selectedTile = null;
        first.el.classList.remove("selected");

        if (first.tile.pairId === tile.pairId && first.tile.uid !== tile.uid) {
            // ¡Acierto!
            this.handleMatchSuccess(first, { idx, tile, el: tileEl });
        } else {
            // Error
            this.handleMatchFail(first, { idx, tile, el: tileEl });
        }
    }

    handleMatchSuccess(first, second) {
        first.tile.isMatched = true;
        second.tile.isMatched = true;

        first.el.classList.add("matched");
        second.el.classList.add("matched");

        this.combo += 1;
        const pts = 100 + (this.combo - 1) * 25;
        this.score += pts;
        this.pairsRemaining -= 1;

        this.updateStatsDisplay();

        this.app?.audioController?.playCorrect?.();
        this.app?.showToast?.(`¡Emparejado! ${first.tile.hanzi} + ${second.tile.hanzi} = ${first.tile.result} (${first.tile.meaning})`, "success", 1500);

        if (this.pairsRemaining <= 0) {
            this.handleVictory();
        }
    }

    handleMatchFail(first, second) {
        this.combo = 0;
        this.updateStatsDisplay();

        first.el.style.transform = "translateX(-6px)";
        second.el.style.transform = "translateX(6px)";

        this.app?.audioController?.playIncorrect?.();

        setTimeout(() => {
            first.el.style.transform = "";
            second.el.style.transform = "";
        }, 300);
    }

    useHint() {
        if (this.hintsRemaining <= 0 || this.pairsRemaining <= 0) return;
        this.hintsRemaining -= 1;
        this.updateStatsDisplay();

        // Encontrar un par no emparejado
        const activeTiles = this.tiles.filter((t) => !t.isMatched);
        let foundPairId = null;

        for (const t of activeTiles) {
            if (activeTiles.some((other) => other.pairId === t.pairId && other.uid !== t.uid)) {
                foundPairId = t.pairId;
                break;
            }
        }

        if (foundPairId) {
            this.boardEl?.querySelectorAll(`.mahjong-tile`).forEach((el) => {
                const uid = el.getAttribute("data-uid");
                if (uid && uid.startsWith(foundPairId)) {
                    el.classList.add("hinted");
                }
            });
        }
    }

    shuffleRemainingTiles() {
        if (this.pairsRemaining <= 0) return;
        this.selectedTile = null;

        const unmatched = this.tiles.filter((t) => !t.isMatched);
        const shuffledUnmatched = [...unmatched].sort(() => Math.random() - 0.5);

        let unIdx = 0;
        this.tiles = this.tiles.map((t) => {
            if (!t.isMatched) {
                return shuffledUnmatched[unIdx++];
            }
            return t;
        });

        this.renderBoard();
        this.app?.showToast?.("Fichas barajadas", "info", 1200);
    }

    handleVictory() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Bonificación por tiempo
        const timeBonus = Math.max(0, 300 - this.timerSeconds) * 2;
        this.score += timeBonus;
        this.updateStatsDisplay();

        if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
        if (this.victoryOverlay) this.victoryOverlay.style.display = "flex";

        this.app?.audioController?.playStreakFanfare?.();
        this.app?.achievementManager?.fireConfetti?.();
    }
}

window.HanziMahjongGame = HanziMahjongGame;
