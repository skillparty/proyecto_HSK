/**
 * SentenceBuilderGame - Interactive Chinese sentence building & grammar game
 * Segment Chinese sentences into word blocks and validate word order
 */
class SentenceBuilderGame {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
        this.sentencesData = null;
        this.isLoadingSentences = false;

        this.state = {
            isPlaying: false,
            mode: "practice", // "practice" | "time-attack"
            level: "all",
            score: 0,
            streak: 0,
            bestStreak: 0,
            timeLeft: 60,
            timerInterval: null,
            currentSentence: null,
            targetTokens: [], // expected sequence of strings
            bankTiles: [], // [{ id, text, isPlaced }]
            placedTiles: [], // [{ id, text }]
            hintCount: 0,
            isSolved: false,
        };

        this.fallbackSentences = [
            {
                chinese: "你好！",
                pinyin: "nǐ hǎo！",
                english: "Hello!",
                spanish: "¡Hola!",
                level: 1,
                tokens: ["你", "好"],
            },
            {
                chinese: "我是学生。",
                pinyin: "wǒ shì xuésheng。",
                english: "I am a student.",
                spanish: "Soy estudiante.",
                level: 1,
                tokens: ["我", "是", "学生"],
            },
            {
                chinese: "他喜欢吃米饭。",
                pinyin: "tā xǐhuan chī mǐfàn。",
                english: "He likes to eat rice.",
                spanish: "A él le gusta comer arroz.",
                level: 1,
                tokens: ["他", "喜欢", "吃", "米饭"],
            },
            {
                chinese: "我们在学校学习汉语。",
                pinyin: "wǒmen zài xuéxiào xuéxí Hànyǔ。",
                english: "We study Chinese at school.",
                spanish: "Estudiamos chino en la escuela.",
                level: 1,
                tokens: ["我们", "在", "学校", "学习", "汉语"],
            },
            {
                chinese: "今天天气很好。",
                pinyin: "jīntiān tiānqì hěn hǎo。",
                english: "The weather is very good today.",
                spanish: "Hoy hace muy buen tiempo.",
                level: 1,
                tokens: ["今天", "天气", "很", "好"],
            },
            {
                chinese: "我想喝一杯热茶。",
                pinyin: "wǒ xiǎng hē yì bēi rè chá。",
                english: "I want to drink a cup of hot tea.",
                spanish: "Quiero tomar una taza de té caliente.",
                level: 2,
                tokens: ["我", "想", "喝", "一杯", "热茶"],
            },
            {
                chinese: "她每天都去图书馆看书。",
                pinyin: "tā měitiān dōu qù túshūguǎn kàn shū。",
                english: "She goes to the library to read books every day.",
                spanish: "Ella va a la biblioteca a leer libros todos los días.",
                level: 2,
                tokens: ["她", "每天", "都", "去", "图书馆", "看书"],
            },
            {
                chinese: "帮我一下。",
                pinyin: "bāng wǒ yí xià。",
                english: "Help me a moment.",
                spanish: "Ayúdame un momento.",
                level: 1,
                tokens: ["帮", "我", "一下"],
            },
        ];
    }

    async loadSentencesData() {
        if (this.sentencesData) return this.sentencesData;
        if (this.isLoadingSentences) return null;

        this.isLoadingSentences = true;
        try {
            const response = await fetch("assets/data/hsk_example_sentences.json");
            if (response.ok) {
                const data = await response.json();
                this.sentencesData = data;
            }
        } catch (error) {
            this.app?.logWarn?.("Could not load full example sentences dataset, using fallback:", error);
        } finally {
            this.isLoadingSentences = false;
        }
        return this.sentencesData;
    }

    cleanPunctuation(text) {
        if (!text) return "";
        return text.replace(/[。！？!?.,，、；;：“”"'\s]/g, "");
    }

    tokenizeSentence(chineseText) {
        const cleaned = this.cleanPunctuation(chineseText);
        if (!cleaned) return [];

        // Build a dictionary of words from vocabulary if available
        const wordsDict = new Set();
        if (this.app?.vocabulary && Array.isArray(this.app.vocabulary)) {
            for (const item of this.app.vocabulary) {
                if (item.character && item.character.length > 1) {
                    wordsDict.add(item.character);
                }
            }
        }

        // Maximum match tokenization
        const tokens = [];
        let i = 0;
        const maxLen = 4;

        while (i < cleaned.length) {
            let matched = false;
            for (let len = maxLen; len >= 2; len--) {
                if (i + len <= cleaned.length) {
                    const chunk = cleaned.slice(i, i + len);
                    if (wordsDict.has(chunk)) {
                        tokens.push(chunk);
                        i += len;
                        matched = true;
                        break;
                    }
                }
            }
            if (!matched) {
                tokens.push(cleaned[i]);
                i += 1;
            }
        }

        return tokens.length > 1 ? tokens : cleaned.split("");
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    initialize() {
        if (this.isInitialized) return;

        const startBtn = document.getElementById("sb-start-btn");
        const checkBtn = document.getElementById("sb-check-btn");
        const clearBtn = document.getElementById("sb-clear-btn");
        const hintBtn = document.getElementById("sb-hint-btn");
        const nextBtn = document.getElementById("sb-next-btn");
        const listenBtn = document.getElementById("sb-listen-btn");
        const playAgainBtn = document.getElementById("sb-play-again-btn");

        if (startBtn) startBtn.addEventListener("click", () => this.startGame());
        if (checkBtn) checkBtn.addEventListener("click", () => this.checkAnswer());
        if (clearBtn) clearBtn.addEventListener("click", () => this.resetTiles());
        if (hintBtn) hintBtn.addEventListener("click", () => this.giveHint());
        if (nextBtn) nextBtn.addEventListener("click", () => this.nextSentence());
        if (listenBtn) listenBtn.addEventListener("click", () => this.playSentenceAudio());
        if (playAgainBtn) playAgainBtn.addEventListener("click", () => this.startGame());

        this.loadSentencesData();
        this.isInitialized = true;
    }

    startGame() {
        const levelSelect = document.getElementById("sb-level-select");
        const modeSelect = document.getElementById("sb-mode-select");

        this.state.level = levelSelect ? levelSelect.value : "all";
        this.state.mode = modeSelect ? modeSelect.value : "practice";
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.isPlaying = true;

        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }

        const arena = document.getElementById("sb-arena");
        const gameOverCard = document.getElementById("sb-game-over");
        const timerBox = document.getElementById("sb-timer-box");

        if (arena) arena.style.display = "flex";
        if (gameOverCard) gameOverCard.style.display = "none";

        if (this.state.mode === "time-attack") {
            this.state.timeLeft = 60;
            if (timerBox) timerBox.style.display = "flex";
            this.updateTimerDisplay();
            this.state.timerInterval = setInterval(() => this.tickTimer(), 1000);
        } else {
            if (timerBox) timerBox.style.display = "none";
        }

        this.updateStatsDisplay();
        this.nextSentence();
    }

    tickTimer() {
        if (!this.state.isPlaying) return;
        this.state.timeLeft -= 1;
        this.updateTimerDisplay();

        if (this.state.timeLeft <= 0) {
            this.endGame();
        }
    }

    updateTimerDisplay() {
        const timerVal = document.getElementById("sb-timer-val");
        if (timerVal) {
            timerVal.textContent = `${this.state.timeLeft}s`;
            if (this.state.timeLeft <= 10) {
                timerVal.style.color = "#ef4444";
            } else {
                timerVal.style.color = "";
            }
        }
    }

    endGame() {
        this.state.isPlaying = false;
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }

        const arena = document.getElementById("sb-arena");
        const gameOverCard = document.getElementById("sb-game-over");
        const finalScore = document.getElementById("sb-final-score");
        const finalStreak = document.getElementById("sb-final-streak");

        if (arena) arena.style.display = "none";
        if (gameOverCard) gameOverCard.style.display = "flex";
        if (finalScore) finalScore.textContent = this.state.score;
        if (finalStreak) finalStreak.textContent = `${this.state.bestStreak} 🔥`;

        if (this.state.score >= 50) {
            this.app?.audioController?.playStreakFanfare?.();
        } else {
            this.app?.audioController?.playGameOver?.();
        }
    }

    getSentencePool() {
        let pool = [];
        if (this.sentencesData) {
            const entries = Object.values(this.sentencesData);
            if (this.state.level === "all") {
                pool = entries;
            } else {
                const lvlNum = Number(this.state.level);
                pool = entries.filter((e) => {
                    const wordLevel = Number(e.level || 0);
                    return wordLevel === lvlNum || (wordLevel === 0 && lvlNum <= 2);
                });
            }
        }

        if (pool.length < 5) {
            pool = this.fallbackSentences.filter((s) =>
                this.state.level === "all" ? true : Number(s.level) === Number(this.state.level),
            );
            if (pool.length === 0) pool = this.fallbackSentences;
        }

        return pool;
    }

    nextSentence() {
        const pool = this.getSentencePool();
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[randomIndex];

        this.state.currentSentence = selected;
        this.state.isSolved = false;
        this.state.hintCount = 0;

        let tokens = selected.tokens;
        if (!tokens || tokens.length === 0) {
            tokens = this.tokenizeSentence(selected.chinese);
        }

        this.state.targetTokens = tokens;
        this.state.placedTiles = [];

        // Build bank tiles
        const tiles = tokens.map((text, idx) => ({
            id: `tile-${idx}-${text}`,
            text,
            isPlaced: false,
        }));
        this.state.bankTiles = this.shuffleArray(tiles);

        this.renderArena();
    }

    renderArena() {
        const targetMeaning = document.getElementById("sb-target-meaning");
        const pinyinReveal = document.getElementById("sb-pinyin-reveal");
        const feedback = document.getElementById("sb-feedback");
        const listenBtn = document.getElementById("sb-listen-btn");
        const checkBtn = document.getElementById("sb-check-btn");
        const nextBtn = document.getElementById("sb-next-btn");

        if (targetMeaning) {
            const isEs = this.app?.currentLanguage !== "en";
            const text = isEs
                ? (this.state.currentSentence.spanish || this.state.currentSentence.english)
                : (this.state.currentSentence.english || this.state.currentSentence.spanish);
            targetMeaning.textContent = text || this.state.currentSentence.chinese;
        }

        if (pinyinReveal) {
            pinyinReveal.style.display = "none";
            pinyinReveal.textContent = this.state.currentSentence.pinyin || "";
        }

        if (feedback) {
            feedback.style.display = "none";
            feedback.className = "sb-feedback";
        }

        if (listenBtn) listenBtn.style.display = "none";
        if (checkBtn) checkBtn.style.display = "inline-flex";
        if (nextBtn) nextBtn.style.display = "none";

        this.renderTargetSlots();
        this.renderBankTiles();
    }

    renderTargetSlots() {
        const container = document.querySelector(".sb-target-container");
        const slotsEl = document.getElementById("sb-target-slots");
        if (!slotsEl) return;

        slotsEl.innerHTML = "";

        if (this.state.placedTiles.length === 0) {
            container?.classList.remove("has-items");
            const emptyPrompt = document.createElement("span");
            emptyPrompt.id = "sb-empty-prompt";
            emptyPrompt.className = "sb-empty-prompt";
            emptyPrompt.textContent =
                this.app?.getTranslation?.("sentenceBuilderDropPrompt") ||
                "Haz clic en las fichas inferiores para armar la oración aquí...";
            slotsEl.appendChild(emptyPrompt);
            return;
        }

        container?.classList.add("has-items");

        this.state.placedTiles.forEach((tile, index) => {
            const tileBtn = document.createElement("button");
            tileBtn.className = "sb-target-tile";
            tileBtn.textContent = tile.text;
            tileBtn.title = "Haz clic para devolver esta palabra";
            tileBtn.addEventListener("click", () => this.removePlacedTile(index));
            slotsEl.appendChild(tileBtn);
        });
    }

    renderBankTiles() {
        const bankEl = document.getElementById("sb-tiles-bank");
        if (!bankEl) return;

        bankEl.innerHTML = "";

        this.state.bankTiles.forEach((tile) => {
            const tileBtn = document.createElement("button");
            tileBtn.className = "sb-tile" + (tile.isPlaced ? " placed" : "");
            tileBtn.textContent = tile.text;
            if (!tile.isPlaced) {
                tileBtn.addEventListener("click", () => this.selectBankTile(tile.id));
            }
            bankEl.appendChild(tileBtn);
        });
    }

    selectBankTile(tileId) {
        if (this.state.isSolved) return;
        const tile = this.state.bankTiles.find((t) => t.id === tileId);
        if (!tile || tile.isPlaced) return;

        tile.isPlaced = true;
        this.state.placedTiles.push({ id: tile.id, text: tile.text });

        this.app?.audioController?.playFlip?.();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }

        this.renderTargetSlots();
        this.renderBankTiles();
    }

    removePlacedTile(index) {
        if (this.state.isSolved) return;
        const removed = this.state.placedTiles.splice(index, 1)[0];
        if (!removed) return;

        const bankTile = this.state.bankTiles.find((t) => t.id === removed.id);
        if (bankTile) bankTile.isPlaced = false;

        this.app?.audioController?.playFlip?.();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }

        this.renderTargetSlots();
        this.renderBankTiles();
    }

    resetTiles() {
        if (this.state.isSolved) return;
        this.state.placedTiles = [];
        this.state.bankTiles.forEach((t) => (t.isPlaced = false));
        this.renderTargetSlots();
        this.renderBankTiles();
    }

    giveHint() {
        if (this.state.isSolved) return;
        const nextTargetIndex = this.state.placedTiles.length;
        if (nextTargetIndex >= this.state.targetTokens.length) return;

        const expectedText = this.state.targetTokens[nextTargetIndex];

        // Find available tile matching expectedText
        const matchingBankTile = this.state.bankTiles.find(
            (t) => !t.isPlaced && t.text === expectedText,
        );

        if (matchingBankTile) {
            matchingBankTile.isPlaced = true;
            this.state.placedTiles.push({ id: matchingBankTile.id, text: matchingBankTile.text });
            this.renderTargetSlots();
            this.renderBankTiles();
        }

        const feedback = document.getElementById("sb-feedback");
        if (feedback) {
            feedback.textContent = `💡 Siguiente palabra: "${expectedText}"`;
            feedback.className = "sb-feedback hint";
            feedback.style.display = "block";
        }
    }

    checkAnswer() {
        if (this.state.isSolved) return;

        const userJoined = this.state.placedTiles.map((t) => t.text).join("");
        const expectedJoined = this.state.targetTokens.join("");

        const feedback = document.getElementById("sb-feedback");
        const pinyinReveal = document.getElementById("sb-pinyin-reveal");
        const listenBtn = document.getElementById("sb-listen-btn");
        const checkBtn = document.getElementById("sb-check-btn");
        const nextBtn = document.getElementById("sb-next-btn");
        const container = document.querySelector(".sb-target-container");

        if (userJoined === expectedJoined && this.state.placedTiles.length === this.state.targetTokens.length) {
            // Correct!
            this.state.isSolved = true;
            this.state.streak += 1;
            if (this.state.streak > this.state.bestStreak) {
                this.state.bestStreak = this.state.streak;
            }

            const pointsAwarded = Math.max(10, 10 + (this.state.streak - 1) * 2);
            this.state.score += pointsAwarded;

            if (this.state.mode === "time-attack") {
                this.state.timeLeft = Math.min(120, this.state.timeLeft + 5);
                this.updateTimerDisplay();
            }

            this.updateStatsDisplay();

            if (feedback) {
                feedback.textContent =
                    this.app?.getTranslation?.("sentenceBuilderSuccessMsg") ||
                    `¡Excelente! Oración correcta (+${pointsAwarded} pts)`;
                feedback.className = "sb-feedback correct";
                feedback.style.display = "block";
            }

            if (pinyinReveal) {
                pinyinReveal.style.display = "block";
            }

            if (listenBtn) listenBtn.style.display = "inline-flex";
            if (checkBtn) checkBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "inline-flex";

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(40);
            }

            if (this.state.streak > 0 && this.state.streak % 5 === 0) {
                this.app?.audioController?.playStreakFanfare?.();
            } else {
                this.app?.audioController?.playCorrect?.();
            }

            if (typeof window.createParticles === 'function' && container) {
                const rect = container.getBoundingClientRect();
                window.createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, '#10b981');
            }

            // Pronounce Chinese sentence
            this.playSentenceAudio();
        } else {
            // Incorrect
            this.state.streak = 0;
            this.updateStatsDisplay();

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([60, 40, 60]);
            }

            if (container) {
                container.classList.add("shake");
                setTimeout(() => container.classList.remove("shake"), 500);
            }

            if (feedback) {
                feedback.textContent =
                    this.app?.getTranslation?.("sentenceBuilderIncorrectMsg") ||
                    "Casi, revisa el orden de las palabras.";
                feedback.className = "sb-feedback incorrect";
                feedback.style.display = "block";
            }

            this.app?.audioController?.playIncorrect?.();
        }
    }

    playSentenceAudio() {
        if (!this.state.currentSentence) return;
        const text = this.cleanPunctuation(this.state.currentSentence.chinese);
        this.app?.audioController?.playAudio?.(text);
    }

    updateStatsDisplay() {
        const scoreVal = document.getElementById("sb-score-val");
        const streakVal = document.getElementById("sb-streak-val");

        if (scoreVal) scoreVal.textContent = this.state.score;
        if (streakVal) streakVal.textContent = `${this.state.streak} 🔥`;
    }
}

window.SentenceBuilderGame = SentenceBuilderGame;
