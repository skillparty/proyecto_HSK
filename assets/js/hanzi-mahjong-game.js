// hanzi-mahjong-game.js — Motor del Laboratorio de Mahjong de Caracteres

const MAHJONG_RADICAL_PAIRS = [
    { id: "hai", partA: "氵", partB: "每", result: "海", meaning: "Mar" },
    { id: "hua", partA: "讠", partB: "舌", result: "话", meaning: "Hablar / Palabra" },
    { id: "hao", partA: "女", partB: "子", result: "好", meaning: "Bueno / Bien" },
    { id: "ni", partA: "亻", partB: "尔", result: "你", meaning: "Tú" },
    { id: "lin", partA: "木", partB: "木", result: "林", meaning: "Bosque / Arboleda" },
    { id: "ming", partA: "日", partB: "月", result: "明", meaning: "Brillante / Mañana" },
    { id: "chi", partA: "口", partB: "乞", result: "吃", meaning: "Comer" },
    { id: "qiu", partA: "禾", partB: "火", result: "秋", meaning: "Otoño" },
    { id: "xiu", partA: "亻", partB: "木", result: "休", meaning: "Descansar" },
    { id: "ma", partA: "口", partB: "马", result: "吗", meaning: "Partícula interrogativa" },
    { id: "ba", partA: "口", partB: "巴", result: "吧", meaning: "Partícula sugerencia" },
    { id: "he", partA: "口", partB: "曷", result: "喝", meaning: "Beber" },
    { id: "qing_shui", partA: "氵", partB: "青", result: "清", meaning: "Claro / Puro" },
    { id: "zhu", partA: "亻", partB: "主", result: "住", meaning: "Vivir / Residir" },
    { id: "ta_m", partA: "亻", partB: "也", result: "他", meaning: "Él" },
    { id: "ta_f", partA: "女", partB: "也", result: "她", meaning: "Ella" },
    { id: "ma_mum", partA: "女", partB: "马", result: "妈", meaning: "Mamá" },
    { id: "ba_dad", partA: "父", partB: "巴", result: "爸", meaning: "Papá" },
    { id: "nan", partA: "田", partB: "力", result: "男", meaning: "Hombre / Masculino" },
    { id: "jia", partA: "宀", partB: "豕", result: "家", meaning: "Casa / Familia" },
    { id: "zao", partA: "日", partB: "十", result: "早", meaning: "Temprano" },
    { id: "xing", partA: "日", partB: "生", result: "星", meaning: "Estrella" },
    { id: "shi", partA: "日", partB: "寸", result: "时", meaning: "Tiempo / Hora" },
    { id: "wen", partA: "门", partB: "口", result: "问", meaning: "Preguntar" },
    { id: "jian_room", partA: "门", partB: "日", result: "间", meaning: "Espacio / Habitación" },
    { id: "jian_sharp", partA: "小", partB: "大", result: "尖", meaning: "Puntiagudo" },
    { id: "guo", partA: "囗", partB: "玉", result: "国", meaning: "País / Nación" },
    { id: "yin", partA: "囗", partB: "大", result: "因", meaning: "Causa / Porque" },
    { id: "hui", partA: "囗", partB: "口", result: "回", meaning: "Volver / Regresar" },
    { id: "yuan", partA: "囗", partB: "元", result: "园", meaning: "Jardín / Parque" },
    { id: "zi", partA: "宀", partB: "子", result: "字", meaning: "Carácter / Letra" },
    { id: "an", partA: "宀", partB: "女", result: "安", meaning: "Paz / Tranquilo" },
    { id: "shuo", partA: "讠", partB: "兑", result: "说", meaning: "Hablar / Decir" },
    { id: "yu", partA: "讠", partB: "吾", result: "语", meaning: "Idioma / Lengua" },
    { id: "shi_know", partA: "讠", partB: "只", result: "识", meaning: "Conocer / Saber" },
    { id: "du", partA: "讠", partB: "卖", result: "读", meaning: "Leer" },
    { id: "qing_ask", partA: "讠", partB: "青", result: "请", meaning: "Por favor / Invitar" },
    { id: "men", partA: "亻", partB: "门", result: "们", meaning: "Sufijo plural" },
    { id: "wei", partA: "亻", partB: "立", result: "位", meaning: "Clasificador cortés" },
    { id: "xin", partA: "亻", partB: "言", result: "信", meaning: "Carta / Creer" },
    { id: "peng", partA: "月", partB: "月", result: "朋", meaning: "Amigo" },
    { id: "hui_can", partA: "人", partB: "云", result: "会", meaning: "Saber / Reunión" },
    { id: "jie", partA: "女", partB: "且", result: "姐", meaning: "Hermana mayor" },
    { id: "mei", partA: "女", partB: "未", result: "妹", meaning: "Hermana menor" },
    { id: "fan", partA: "饣", partB: "反", result: "饭", meaning: "Comida / Arroz" },
    { id: "yin_drink", partA: "饣", partB: "欠", result: "饮", meaning: "Beber" },
    { id: "da", partA: "扌", partB: "丁", result: "打", meaning: "Golpear / Jugar" },
    { id: "zhao", partA: "扌", partB: "戈", result: "找", meaning: "Buscar" },
    { id: "jiang", partA: "氵", partB: "工", result: "江", meaning: "Río Yangtze" },
    { id: "he_river", partA: "氵", partB: "可", result: "河", meaning: "Río" },
    { id: "xi", partA: "氵", partB: "先", result: "洗", meaning: "Lavar" },
    { id: "qing_day", partA: "日", partB: "青", result: "晴", meaning: "Soleado" },
    { id: "kuai", partA: "忄", partB: "夬", result: "快", meaning: "Rápido / Feliz" },
    { id: "mang", partA: "忄", partB: "亡", result: "忙", meaning: "Ocupado" },
    { id: "xiang", partA: "相", partB: "心", result: "想", meaning: "Pensar / Extrañar" },
    { id: "wang", partA: "亡", partB: "心", result: "忘", meaning: "Olvidar" },
    { id: "xian", partA: "王", partB: "见", result: "现", meaning: "Presente / Ahora" },
    { id: "wan", partA: "王", partB: "元", result: "玩", meaning: "Jugar" },
    { id: "qian", partA: "钅", partB: "戋", result: "钱", meaning: "Dinero" },
    { id: "cuo", partA: "钅", partB: "昔", result: "错", meaning: "Equivocado / Error" }
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
    { id: "fanguan", partA: "饭", partB: "馆", result: "饭馆", meaning: "Restaurante" },
    { id: "laoshi", partA: "老", partB: "师", result: "老师", meaning: "Profesor" },
    { id: "renshi", partA: "认", partB: "识", result: "认识", meaning: "Conocer" },
    { id: "xuexi", partA: "学", partB: "习", result: "学习", meaning: "Estudiar" },
    { id: "diannao", partA: "电", partB: "脑", result: "电脑", meaning: "Ordenador" },
    { id: "dianying", partA: "电", partB: "影", result: "电影", meaning: "Película" },
    { id: "dianshi", partA: "电", partB: "视", result: "电视", meaning: "Televisión" },
    { id: "dongxi", partA: "东", partB: "西", result: "东西", meaning: "Cosas / Objetos" },
    { id: "tianqi", partA: "天", partB: "气", result: "天气", meaning: "Clima / Tiempo" },
    { id: "piaoliang", partA: "漂", partB: "亮", result: "漂亮", meaning: "Bonito / Hermoso" },
    { id: "shuohua", partA: "说", partB: "话", result: "说话", meaning: "Hablar" },
    { id: "hanyu", partA: "汉", partB: "语", result: "汉语", meaning: "Idioma chino" },
    { id: "shihou", partA: "时", partB: "候", result: "时候", meaning: "Momento / Tiempo" },
    { id: "xiansheng", partA: "先", partB: "生", result: "先生", meaning: "Señor" },
    { id: "xiaojie", partA: "小", partB: "姐", result: "小姐", meaning: "Señorita" },
    { id: "yisheng", partA: "医", partB: "生", result: "医生", meaning: "Médico" },
    { id: "yifu", partA: "衣", partB: "服", result: "衣服", meaning: "Ropa" },
    { id: "shuiguo", partA: "水", partB: "果", result: "水果", meaning: "Fruta" },
    { id: "shuijiao", partA: "睡", partB: "觉", result: "睡觉", meaning: "Dormir" },
    { id: "paobu", partA: "跑", partB: "步", result: "跑步", meaning: "Correr" },
    { id: "yundong", partA: "运", partB: "动", result: "运动", meaning: "Deporte / Ejercicio" },
    { id: "shijian", partA: "时", partB: "间", result: "时间", meaning: "Tiempo" },
    { id: "zhunbei", partA: "准", partB: "备", result: "准备", meaning: "Preparar" },
    { id: "jieshao", partA: "介", partB: "绍", result: "介绍", meaning: "Presentar" },
    { id: "shenti", partA: "身", partB: "体", result: "身体", meaning: "Cuerpo / Salud" },
    { id: "bangzhu", partA: "帮", partB: "助", result: "帮助", meaning: "Ayudar / Ayuda" },
    { id: "pianyi", partA: "便", partB: "宜", result: "便宜", meaning: "Barato" },
    { id: "shiqing", partA: "事", partB: "情", result: "事情", meaning: "Asunto / Cosa" },
    { id: "xiwang", partA: "希", partB: "望", result: "希望", meaning: "Esperar / Desear" },
    { id: "yisi", partA: "意", partB: "思", result: "意思", meaning: "Significado" },
    { id: "jingchang", partA: "经", partB: "常", result: "经常", meaning: "A menudo" },
    { id: "yijing", partA: "已", partB: "经", result: "已经", meaning: "Ya" },
    { id: "fangjian", partA: "房", partB: "间", result: "房间", meaning: "Habitación" },
    { id: "jichang", partA: "机", partB: "场", result: "机场", meaning: "Aeropuerto" },
    { id: "chezhan", partA: "车", partB: "站", result: "车站", meaning: "Estación / Parada" },
    { id: "gongsi", partA: "公", partB: "司", result: "公司", meaning: "Empresa" },
    { id: "youxi", partA: "游", partB: "戏", result: "游戏", meaning: "Juego" }
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
        this.isPaused = false;
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
            if (!this.audioCtx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.audioCtx = new AudioCtx();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const ctx = this.audioCtx;
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

    getAvailablePairs() {
        if (this.currentMode === "radicals") {
            return [...MAHJONG_RADICAL_PAIRS];
        }

        // Modo palabras compuestas: intentar enriquecer con vocabulario real de la app
        const dynamicPairs = [];
        if (this.app?.vocabulary && Array.isArray(this.app.vocabulary)) {
            for (const item of this.app.vocabulary) {
                if (item.character && item.character.length === 2) {
                    const charA = item.character[0];
                    const charB = item.character[1];
                    // Filtrar caracteres repetidos para tablero limpio (ej. 妈妈)
                    if (charA !== charB) {
                        const meaning = (this.app.currentLanguage === "es"
                            ? (item.spanish || item.translation || item.english)
                            : (item.english || item.translation || item.spanish)) || item.character;
                        dynamicPairs.push({
                            id: `dyn_${item.character}`,
                            partA: charA,
                            partB: charB,
                            result: item.character,
                            meaning
                        });
                    }
                }
            }
        }

        if (dynamicPairs.length >= this.targetPairs) {
            return dynamicPairs;
        }

        return [...MAHJONG_COMPOUND_PAIRS];
    }

    setupBoardTiles() {
        const available = this.getAvailablePairs();
        const shuffled = [...available].sort(() => Math.random() - 0.5);

        // Seleccionar pares garantizando caracteres únicos en el tablero para evitar ambigüedades
        const selectedPairs = [];
        const usedChars = new Set();

        for (const pair of shuffled) {
            if (!usedChars.has(pair.partA) && !usedChars.has(pair.partB)) {
                selectedPairs.push(pair);
                usedChars.add(pair.partA);
                usedChars.add(pair.partB);
                if (selectedPairs.length >= this.targetPairs) break;
            }
        }

        // Si faltasen pares disjuntos, rellenar del resto del conjunto
        if (selectedPairs.length < this.targetPairs) {
            for (const pair of shuffled) {
                if (!selectedPairs.some(p => p.id === pair.id)) {
                    selectedPairs.push(pair);
                    if (selectedPairs.length >= this.targetPairs) break;
                }
            }
        }

        const rawTiles = [];

        selectedPairs.forEach((pair) => {
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
        if (!tile || tile.isMatched || this.isPaused) return;

        this.playTileClickSound();

        // Limpiar hints
        this.boardEl?.querySelectorAll(".hinted").forEach((el) => el.classList.remove("hinted"));

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }

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

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(35);
        }

        if (this.combo >= 4) {
            this.app?.audioController?.playStreakFanfare?.();
        } else if (this.combo >= 2) {
            this.app?.audioController?.playGameCoin?.();
        } else {
            this.app?.audioController?.playCorrect?.();
        }

        // Pronounce completed character / compound word
        if (this.app && typeof this.app.playAudio === 'function' && first.tile?.result) {
            this.app.playAudio(first.tile.result);
        }

        this.app?.showToast?.(`¡Emparejado! ${first.tile.hanzi} + ${second.tile.hanzi} = ${first.tile.result} (${first.tile.meaning})`, "success", 1500);

        if (this.pairsRemaining <= 0) {
            this.handleVictory();
        }
    }

    handleMatchFail(first, second) {
        this.combo = 0;
        this.updateStatsDisplay();

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }

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

    pause() {
        if (this.isPaused || this.pairsRemaining <= 0) return;
        this.isPaused = true;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.boardEl?.classList?.add("mahjong-paused");
    }

    resume() {
        if (!this.isPaused || this.pairsRemaining <= 0) return;
        this.isPaused = false;
        this.boardEl?.classList?.remove("mahjong-paused");
        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                if (this.isPaused) return;
                this.timerSeconds += 1;
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    handleVictory() {
        this.isPaused = false;
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Bonificación por tiempo
        const timeBonus = Math.max(0, 300 - this.timerSeconds) * 2;
        this.score += timeBonus;
        this.updateStatsDisplay();

        if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
        if (this.victoryOverlay) this.victoryOverlay.style.display = "flex";

        // Guardar récord de puntuación y emitir evento
        if (this.app?.stats) {
            const prevHigh = this.app.stats.mahjongHighScore || 0;
            if (this.score > prevHigh) {
                this.app.stats.mahjongHighScore = this.score;
            }
            this.app.saveStats?.();
            this.app.achievementManager?.checkAchievements?.();
        }
        try {
            const localHs = parseInt(localStorage.getItem("mahjongHighScore") || "0", 10);
            if (this.score > localHs) {
                localStorage.setItem("mahjongHighScore", String(this.score));
            }
        } catch {
            // Ignore storage access restrictions
        }

        document.dispatchEvent(new CustomEvent('hsk:game-result', {
            detail: {
                game: 'hanzi-mahjong',
                score: this.score,
                mode: this.currentMode,
                difficulty: this.currentDifficulty,
                timeSpent: this.timerSeconds
            }
        }));

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 150]);
        }

        this.app?.audioController?.playStreakFanfare?.();
        this.app?.achievementManager?.fireConfetti?.();
    }
}

window.HanziMahjongGame = HanziMahjongGame;
