/**
 * ToneTrainerGame - Interactive Listening & Tone Ear Training for Mandarin Chinese
 * Helps students distinguish between 1st, 2nd, 3rd, 4th tones, minimal pairs and vocabulary.
 */
class ToneTrainerGame {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
        this.playbackSpeed = 1.0;

        this.state = {
            mode: "tones", // "tones" | "pairs" | "vocab"
            score: 0,
            streak: 0,
            bestStreak: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            currentQuestion: null,
            answered: false,
        };

        this.syllableToneBank = [
            { base: "ma", tones: ["mā", "má", "mǎ", "mà"], chars: ["妈", "麻", "马", "骂"] },
            { base: "ba", tones: ["bā", "bá", "bǎ", "bà"], chars: ["八", "拔", "把", "爸"] },
            { base: "tang", tones: ["tāng", "táng", "tǎng", "tàng"], chars: ["汤", "糖", "躺", "烫"] },
            { base: "ting", tones: ["tīng", "tíng", "tǐng", "tìng"], chars: ["听", "停", "挺", "定"] },
            { base: "shi", tones: ["shī", "shí", "shǐ", "shì"], chars: ["师", "十", "使", "是"] },
            { base: "hao", tones: ["hāo", "háo", "hǎo", "hào"], chars: ["蒿", "豪", "好", "号"] },
            { base: "zhong", tones: ["zhōng", "zhóng", "zhǒng", "zhòng"], chars: ["中", "冢", "种", "重"] },
            { base: "guo", tones: ["guō", "guó", "guǒ", "guò"], chars: ["锅", "国", "果", "过"] },
            { base: "shu", tones: ["shū", "shú", "shǔ", "shù"], chars: ["书", "熟", "数", "树"] },
            { base: "dong", tones: ["dōng", "dóng", "dǒng", "dòng"], chars: ["东", "蝀", "懂", "动"] },
        ];

        this.minimalPairsBank = [
            {
                title: "zh vs z",
                options: [
                    { text: "zhīdào", char: "知道", translation: "saber", audio: "知道" },
                    { text: "zìdòng", char: "自动", translation: "automático", audio: "自动" },
                ],
            },
            {
                title: "ch vs c",
                options: [
                    { text: "chīfàn", char: "吃饭", translation: "comer", audio: "吃饭" },
                    { text: "cānjiā", char: "参加", translation: "participar", audio: "参加" },
                ],
            },
            {
                title: "sh vs s",
                options: [
                    { text: "shāngdiàn", char: "商店", translation: "tienda", audio: "商店" },
                    { text: "sānbǎi", char: "三百", translation: "trescientos", audio: "三百" },
                ],
            },
            {
                title: "b vs p",
                options: [
                    { text: "bàba", char: "爸爸", translation: "papá", audio: "爸爸" },
                    { text: "píngguǒ", char: "苹果", translation: "manzana", audio: "苹果" },
                ],
            },
            {
                title: "d vs t",
                options: [
                    { text: "dàxué", char: "大学", translation: "universidad", audio: "大学" },
                    { text: "tīngshuō", char: "听说", translation: "oír decir", audio: "听说" },
                ],
            },
            {
                title: "j vs q vs x",
                options: [
                    { text: "jīntiān", char: "今天", translation: "hoy", audio: "今天" },
                    { text: "qùnián", char: "去年", translation: "el año pasado", audio: "去年" },
                    { text: "xīngqī", char: "星期", translation: "semana", audio: "星期" },
                ],
            },
        ];

        this.fallbackVocabBank = [
            { char: "学校", pinyin: "xuéxiào", translation: "escuela", audio: "学校" },
            { char: "朋友", pinyin: "péngyou", translation: "amigo", audio: "朋友" },
            { char: "医生", pinyin: "yīshēng", translation: "médico", audio: "医生" },
            { char: "高兴", pinyin: "gāoxìng", translation: "contento", audio: "高兴" },
            { char: "电脑", pinyin: "diànnǎo", translation: "ordenador", audio: "电脑" },
            { char: "汉字", pinyin: "hànzì", translation: "caracteres chinos", audio: "汉字" },
            { char: "汉语", pinyin: "Hànyǔ", translation: "idioma chino", audio: "汉语" },
            { char: "喜欢", pinyin: "xǐhuan", translation: "gustar", audio: "喜欢" },
        ];
    }

    initialize() {
        if (this.isInitialized) return;

        // Mode switch buttons
        const tonesBtn = document.getElementById("tt-mode-tones-btn");
        const pairsBtn = document.getElementById("tt-mode-pairs-btn");
        const vocabBtn = document.getElementById("tt-mode-vocab-btn");

        if (tonesBtn) tonesBtn.addEventListener("click", () => this.switchMode("tones"));
        if (pairsBtn) pairsBtn.addEventListener("click", () => this.switchMode("pairs"));
        if (vocabBtn) vocabBtn.addEventListener("click", () => this.switchMode("vocab"));

        // Audio and Next buttons
        const playBtn = document.getElementById("tt-play-audio-btn");
        const nextBtn = document.getElementById("tt-next-btn");

        if (playBtn) playBtn.addEventListener("click", () => this.playAudio());
        if (nextBtn) nextBtn.addEventListener("click", () => this.nextQuestion());

        // Speed buttons
        document.querySelectorAll(".tt-speed-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tt-speed-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.playbackSpeed = parseFloat(btn.dataset.speed || "1.0");
                this.playAudio();
            });
        });

        // Tone cards click
        document.querySelectorAll(".tt-tone-card").forEach((card) => {
            card.addEventListener("click", () => {
                const toneNum = parseInt(card.dataset.tone, 10);
                this.selectTone(toneNum);
            });
        });

        this.isInitialized = true;
        this.nextQuestion();
    }

    switchMode(mode) {
        this.state.mode = mode;
        document.querySelectorAll(".tt-mode-tab").forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.mode === mode);
        });

        const toneOptions = document.getElementById("tt-tone-options");
        const choiceOptions = document.getElementById("tt-choice-options");

        if (mode === "tones") {
            if (toneOptions) toneOptions.style.display = "grid";
            if (choiceOptions) choiceOptions.style.display = "none";
        } else {
            if (toneOptions) toneOptions.style.display = "none";
            if (choiceOptions) choiceOptions.style.display = "grid";
        }

        this.nextQuestion();
    }

    nextQuestion() {
        this.state.answered = false;

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback) {
            feedback.style.display = "none";
            feedback.className = "tt-feedback-card";
        }
        if (nextBtn) nextBtn.style.display = "none";

        // Reset tone card styles
        document.querySelectorAll(".tt-tone-card").forEach((card) => {
            card.classList.remove("correct", "incorrect");
        });

        if (this.state.mode === "tones") {
            this.generateToneQuestion();
        } else if (this.state.mode === "pairs") {
            this.generatePairQuestion();
        } else {
            this.generateVocabQuestion();
        }

        // Auto-play audio with slight delay
        setTimeout(() => this.playAudio(), 150);
    }

    generateToneQuestion() {
        const syllableObj = this.syllableToneBank[Math.floor(Math.random() * this.syllableToneBank.length)];
        const targetTone = Math.floor(Math.random() * 4) + 1; // 1 to 4
        const targetPinyin = syllableObj.tones[targetTone - 1];
        const targetChar = syllableObj.chars[targetTone - 1];

        this.state.currentQuestion = {
            audioText: targetChar,
            prompt: "¿Qué tono escuchas en esta sílaba?",
            correctAnswer: targetTone,
            targetPinyin,
            targetChar,
            base: syllableObj.base,
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = "¿Qué tono escuchas en esta sílaba?";
        if (clueEl) clueEl.textContent = `${syllableObj.base}`;

        for (let i = 1; i <= 4; i++) {
            const exEl = document.getElementById(`tt-ex-${i}`);
            if (exEl) exEl.textContent = syllableObj.tones[i - 1];
        }
    }

    generatePairQuestion() {
        const pairGroup = this.minimalPairsBank[Math.floor(Math.random() * this.minimalPairsBank.length)];
        const targetOption = pairGroup.options[Math.floor(Math.random() * pairGroup.options.length)];

        this.state.currentQuestion = {
            audioText: targetOption.audio,
            prompt: `Escucha y distingue el sonido (${pairGroup.title}):`,
            correctAnswer: targetOption.text,
            targetOption,
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = `Pares Mínimos: ¿Cuál de estas palabras escuchas?`;
        if (clueEl) clueEl.textContent = pairGroup.title;

        this.renderChoiceButtons(pairGroup.options.map((opt) => ({
            key: opt.text,
            primary: opt.char,
            secondary: opt.text,
            meaning: opt.translation,
        })));
    }

    generateVocabQuestion() {
        let pool = this.fallbackVocabBank;
        if (this.app.vocabulary && Array.isArray(this.app.vocabulary) && this.app.vocabulary.length >= 4) {
            pool = this.app.vocabulary;
        }

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 4).map((w) => ({
            key: w.character,
            primary: w.character,
            secondary: w.pinyin,
            meaning: w.spanish || w.translation || w.english || "",
            audio: w.character,
        }));

        const target = options[Math.floor(Math.random() * options.length)];

        this.state.currentQuestion = {
            audioText: target.audio,
            prompt: "Dictado: ¿Qué palabra escuchas?",
            correctAnswer: target.key,
            target,
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = "Dictado de Vocabulario HSK:";
        if (clueEl) clueEl.textContent = "Selecciona la palabra correcta";

        this.renderChoiceButtons(options);
    }

    renderChoiceButtons(options) {
        const choiceContainer = document.getElementById("tt-choice-options");
        if (!choiceContainer) return;

        choiceContainer.innerHTML = "";

        options.forEach((opt) => {
            const btn = document.createElement("button");
            btn.className = "tt-choice-btn";
            btn.type = "button";
            btn.innerHTML = `
                <span>${opt.primary} (${opt.secondary})</span>
                <span class="tt-choice-sub">${opt.meaning}</span>
            `;
            btn.addEventListener("click", () => this.selectChoice(opt.key, btn));
            choiceContainer.appendChild(btn);
        });
    }

    playAudio() {
        if (!this.state.currentQuestion) return;
        const text = this.state.currentQuestion.audioText;
        if (this.app?.audioController?.playAudio) {
            this.app.audioController.playAudio(text);
        }
    }

    selectTone(selectedTone) {
        if (this.state.answered) return;
        this.state.answered = true;

        const isCorrect = selectedTone === this.state.currentQuestion.correctAnswer;
        const targetCard = document.querySelector(`.tt-tone-card[data-tone="${selectedTone}"]`);
        const correctCard = document.querySelector(`.tt-tone-card[data-tone="${this.state.currentQuestion.correctAnswer}"]`);

        if (isCorrect) {
            targetCard?.classList.add("correct");
            this.handleSuccess(`¡Correcto! Era el ${selectedTone}º tono (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`);
        } else {
            targetCard?.classList.add("incorrect");
            correctCard?.classList.add("correct");
            this.handleFailure(`Incorrecto. La respuesta correcta era el ${this.state.currentQuestion.correctAnswer}º tono (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`);
        }
    }

    selectChoice(selectedKey, clickedBtn) {
        if (this.state.answered) return;
        this.state.answered = true;

        const isCorrect = selectedKey === this.state.currentQuestion.correctAnswer;

        if (isCorrect) {
            clickedBtn?.classList.add("correct");
            this.handleSuccess("¡Excelente! Respuesta correcta.");
        } else {
            clickedBtn?.classList.add("incorrect");
            document.querySelectorAll(".tt-choice-btn").forEach((btn) => {
                if (btn.textContent.includes(this.state.currentQuestion.correctAnswer)) {
                    btn.classList.add("correct");
                }
            });
            this.handleFailure("Casi, revisa la opción correcta resaltada en verde.");
        }
    }

    handleSuccess(msg) {
        this.state.totalQuestions += 1;
        this.state.correctAnswers += 1;
        this.state.streak += 1;
        if (this.state.streak > this.state.bestStreak) {
            this.state.bestStreak = this.state.streak;
        }

        const pts = 10 + (this.state.streak - 1) * 2;
        this.state.score += pts;

        this.updateStats();

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback) {
            feedback.textContent = `🎯 ${msg} (+${pts} pts)`;
            feedback.className = "tt-feedback-card correct";
            feedback.style.display = "block";
        }
        if (nextBtn) nextBtn.style.display = "inline-flex";

        if (this.state.streak > 0 && this.state.streak % 5 === 0) {
            this.app?.audioController?.playStreakFanfare?.();
        } else {
            this.app?.audioController?.playCorrect?.();
        }

        try { navigator.vibrate?.(30); } catch { void 0; }
    }

    handleFailure(msg) {
        this.state.totalQuestions += 1;
        this.state.streak = 0;
        this.updateStats();

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback) {
            feedback.textContent = `❌ ${msg}`;
            feedback.className = "tt-feedback-card incorrect";
            feedback.style.display = "block";
        }
        if (nextBtn) nextBtn.style.display = "inline-flex";

        this.app?.audioController?.playIncorrect?.();
        try { navigator.vibrate?.([40, 40]); } catch { void 0; }
    }

    updateStats() {
        const scoreVal = document.getElementById("tt-score-val");
        const streakVal = document.getElementById("tt-streak-val");
        const accVal = document.getElementById("tt-accuracy-val");

        if (scoreVal) scoreVal.textContent = this.state.score;
        if (streakVal) streakVal.textContent = `${this.state.streak} 🔥`;

        if (accVal) {
            const pct = this.state.totalQuestions > 0
                ? Math.round((this.state.correctAnswers / this.state.totalQuestions) * 100)
                : 100;
            accVal.textContent = `${pct}%`;
        }
    }
}

window.ToneTrainerGame = ToneTrainerGame;
