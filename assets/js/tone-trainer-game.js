/**
 * ToneTrainerGame - Interactive Listening & Tone Ear Training for Mandarin Chinese
 * Helps students distinguish between 1st, 2nd, 3rd, 4th tones, neutral tone,
 * tone pairs (combinations), minimal pairs, and HSK vocabulary.
 */
class ToneTrainerGame {
    constructor(app) {
        this.app = app;
        this.isInitialized = false;
        this.playbackSpeed = 1.0;
        this.autoRepeat = false;

        this.state = {
            mode: "tones", // "tones" | "tone-pairs" | "pairs" | "vocab" | "challenge"
            score: 0,
            streak: 0,
            bestStreak: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            currentQuestion: null,
            answered: false,
            selectedLevel: "all",
            includeNeutral: true,
            // Challenge mode
            challengeActive: false,
            challengeSeconds: 60,
            challengeInterval: null,
            combo: 1,
            maxCombo: 1,
            challengeScore: 0,
            challengeCorrect: 0,
            challengeTotal: 0
        };

        this.syllableToneBank = [
            { base: "ma", tones: ["mā", "má", "mǎ", "mà", "ma"], chars: ["妈", "麻", "马", "骂", "吗"] },
            { base: "ba", tones: ["bā", "bá", "bǎ", "bà", "ba"], chars: ["八", "拔", "把", "爸", "吧"] },
            { base: "ta", tones: ["tā", "tá", "tǎ", "tà", "ta"], chars: ["他", "台", "塔", "踏", "踏"] },
            { base: "tang", tones: ["tāng", "táng", "tǎng", "tàng"], chars: ["汤", "糖", "躺", "烫"] },
            { base: "ting", tones: ["tīng", "tíng", "tǐng", "tìng"], chars: ["听", "停", "挺", "定"] },
            { base: "shi", tones: ["shī", "shí", "shǐ", "shì", "shi"], chars: ["师", "十", "使", "是", "事"] },
            { base: "hao", tones: ["hāo", "háo", "hǎo", "hào"], chars: ["蒿", "豪", "好", "号"] },
            { base: "zhong", tones: ["zhōng", "zhóng", "zhǒng", "zhòng"], chars: ["中", "冢", "种", "重"] },
            { base: "guo", tones: ["guō", "guó", "guǒ", "guò"], chars: ["锅", "国", "果", "过"] },
            { base: "shu", tones: ["shū", "shú", "shǔ", "shù"], chars: ["书", "熟", "数", "树"] },
            { base: "dong", tones: ["dōng", "dóng", "dǒng", "dòng"], chars: ["东", "蝀", "懂", "动"] },
            { base: "de", tones: ["dē", "dé", "dě", "dè", "de"], chars: ["得", "得", "底", "得", "的"] },
            { base: "men", tones: ["mēn", "mén", "měn", "mèn", "men"], chars: ["闷", "门", "扪", "闷", "们"] }
        ];

        this.tonePairsBank = [
            // 1st Tone First
            { char: "今天", pinyin: "jīntiān", tones: [1, 1], meaningEs: "hoy", meaningEn: "today", level: 1 },
            { char: "飞机", pinyin: "fēijī", tones: [1, 1], meaningEs: "avión", meaningEn: "airplane", level: 1 },
            { char: "新年", pinyin: "xīnnián", tones: [1, 2], meaningEs: "año nuevo", meaningEn: "new year", level: 1 },
            { char: "身体", pinyin: "shēntǐ", tones: [1, 3], meaningEs: "cuerpo / salud", meaningEn: "body / health", level: 1 },
            { char: "吃饭", pinyin: "chīfàn", tones: [1, 4], meaningEs: "comer", meaningEn: "eat", level: 1 },
            { char: "音乐", pinyin: "yīnyuè", tones: [1, 4], meaningEs: "música", meaningEn: "music", level: 2 },
            { char: "他们", pinyin: "tāmen", tones: [1, 0], meaningEs: "ellos", meaningEn: "they", level: 1 },
            { char: "衣服", pinyin: "yīfu", tones: [1, 0], meaningEs: "ropa", meaningEn: "clothes", level: 1 },

            // 2nd Tone First
            { char: "昨天", pinyin: "zuótiān", tones: [2, 1], meaningEs: "ayer", meaningEn: "yesterday", level: 1 },
            { char: "时间", pinyin: "shíjiān", tones: [2, 1], meaningEs: "tiempo", meaningEn: "time", level: 2 },
            { char: "学习", pinyin: "xuéxí", tones: [2, 2], meaningEs: "estudiar", meaningEn: "study", level: 1 },
            { char: "银行", pinyin: "yínháng", tones: [2, 2], meaningEs: "banco", meaningEn: "bank", level: 2 },
            { char: "苹果", pinyin: "píngguǒ", tones: [2, 3], meaningEs: "manzana", meaningEn: "apple", level: 1 },
            { char: "旅游", pinyin: "lǚyóu", tones: [2, 3], meaningEs: "viajar", meaningEn: "travel", level: 2 },
            { char: "学校", pinyin: "xuéxiào", tones: [2, 4], meaningEs: "escuela", meaningEn: "school", level: 1 },
            { char: "朋友", pinyin: "péngyou", tones: [2, 0], meaningEs: "amigo", meaningEn: "friend", level: 1 },
            { char: "学生", pinyin: "xuésheng", tones: [2, 0], meaningEs: "estudiante", meaningEn: "student", level: 1 },

            // 3rd Tone First
            { char: "北京", pinyin: "Běijīng", tones: [3, 1], meaningEs: "Pekín", meaningEn: "Beijing", level: 1 },
            { char: "首都", pinyin: "shǒudū", tones: [3, 1], meaningEs: "capital", meaningEn: "capital city", level: 3 },
            { char: "起床", pinyin: "qǐchuáng", tones: [3, 2], meaningEs: "levantarse", meaningEn: "get up", level: 2 },
            { char: "语言", pinyin: "yǔyán", tones: [3, 2], meaningEs: "idioma", meaningEn: "language", level: 2 },
            { char: "你好", pinyin: "nǐhǎo", tones: [3, 3], meaningEs: "hola (sandhi 2+3)", meaningEn: "hello (sandhi 2+3)", level: 1 },
            { char: "可以", pinyin: "kěyǐ", tones: [3, 3], meaningEs: "poder (sandhi 2+3)", meaningEn: "can (sandhi 2+3)", level: 2 },
            { char: "好看", pinyin: "hǎokàn", tones: [3, 4], meaningEs: "bonito", meaningEn: "good-looking", level: 2 },
            { char: "喜欢", pinyin: "xǐhuan", tones: [3, 0], meaningEs: "gustar", meaningEn: "like", level: 1 },
            { char: "耳朵", pinyin: "ěrduo", tones: [3, 0], meaningEs: "oreja", meaningEn: "ear", level: 3 },

            // 4th Tone First
            { char: "面包", pinyin: "miànbāo", tones: [4, 1], meaningEs: "pan", meaningEn: "bread", level: 2 },
            { char: "练习", pinyin: "liànxí", tones: [4, 2], meaningEs: "practicar", meaningEn: "practice", level: 3 },
            { char: "汉语", pinyin: "Hànyǔ", tones: [4, 3], meaningEs: "idioma chino", meaningEn: "Chinese language", level: 1 },
            { char: "电脑", pinyin: "diànnǎo", tones: [4, 3], meaningEs: "computadora", meaningEn: "computer", level: 1 },
            { char: "再见", pinyin: "zàijiàn", tones: [4, 4], meaningEs: "adiós", meaningEn: "goodbye", level: 1 },
            { char: "睡觉", pinyin: "shuìjiào", tones: [4, 4], meaningEs: "dormir", meaningEn: "sleep", level: 1 },
            { char: "谢谢", pinyin: "xièxie", tones: [4, 0], meaningEs: "gracias", meaningEn: "thank you", level: 1 },
            { char: "爸爸", pinyin: "bàba", tones: [4, 0], meaningEs: "papá", meaningEn: "father", level: 1 }
        ];

        this.minimalPairsBank = [
            {
                title: "zh vs z",
                options: [
                    { text: "zhīdào", char: "知道", translation: "saber", audio: "知道" },
                    { text: "zìdòng", char: "自动", translation: "automático", audio: "自动" }
                ]
            },
            {
                title: "ch vs c",
                options: [
                    { text: "chīfàn", char: "吃饭", translation: "comer", audio: "吃饭" },
                    { text: "cānjiā", char: "参加", translation: "participar", audio: "参加" }
                ]
            },
            {
                title: "sh vs s",
                options: [
                    { text: "shāngdiàn", char: "商店", translation: "tienda", audio: "商店" },
                    { text: "sānbǎi", char: "三百", translation: "trescientos", audio: "三百" }
                ]
            },
            {
                title: "b vs p",
                options: [
                    { text: "bàba", char: "爸爸", translation: "papá", audio: "爸爸" },
                    { text: "píngguǒ", char: "苹果", translation: "manzana", audio: "苹果" }
                ]
            },
            {
                title: "d vs t",
                options: [
                    { text: "dàxué", char: "大学", translation: "universidad", audio: "大学" },
                    { text: "tīngshuō", char: "听说", translation: "oír decir", audio: "听说" }
                ]
            },
            {
                title: "g vs k",
                options: [
                    { text: "gēge", char: "哥哥", translation: "hermano mayor", audio: "哥哥" },
                    { text: "kě", char: "渴", translation: "sediento", audio: "渴" }
                ]
            },
            {
                title: "j vs q vs x",
                options: [
                    { text: "jīntiān", char: "今天", translation: "hoy", audio: "今天" },
                    { text: "qùnián", char: "去年", translation: "el año pasado", audio: "去年" },
                    { text: "xīngqī", char: "星期", translation: "semana", audio: "星期" }
                ]
            },
            {
                title: "z vs c",
                options: [
                    { text: "zǒu", char: "走", translation: "caminar", audio: "走" },
                    { text: "cǎo", char: "草", translation: "hierba", audio: "草" }
                ]
            },
            {
                title: "zh vs ch",
                options: [
                    { text: "zhè", char: "这", translation: "este / esto", audio: "这" },
                    { text: "chē", char: "车", translation: "coche / vehículo", audio: "车" }
                ]
            },
            {
                title: "-n vs -ng",
                options: [
                    { text: "kàn", char: "看", translation: "mirar / ver", audio: "看" },
                    { text: "kāng", char: "康", translation: "salud / paz", audio: "康" }
                ]
            },
            {
                title: "in vs ing",
                options: [
                    { text: "xīn", char: "心", translation: "corazón", audio: "心" },
                    { text: "xīng", char: "星", translation: "estrella", audio: "星" }
                ]
            },
            {
                title: "u vs ü",
                options: [
                    { text: "lù", char: "路", translation: "camino / calle", audio: "路" },
                    { text: "lǜ", char: "绿", translation: "verde", audio: "绿" }
                ]
            },
            {
                title: "r vs l",
                options: [
                    { text: "rè", char: "热", translation: "caliente / calor", audio: "热" },
                    { text: "lè", char: "乐", translation: "alegría / feliz", audio: "乐" }
                ]
            }
        ];

        this.fallbackVocabBank = [
            { char: "学校", pinyin: "xuéxiào", translation: "escuela", audio: "学校", level: 1 },
            { char: "朋友", pinyin: "péngyou", translation: "amigo", audio: "朋友", level: 1 },
            { char: "医生", pinyin: "yīshēng", translation: "médico", audio: "医生", level: 1 },
            { char: "高兴", pinyin: "gāoxìng", translation: "contento", audio: "高兴", level: 1 },
            { char: "电脑", pinyin: "diànnǎo", translation: "ordenador", audio: "电脑", level: 1 },
            { char: "汉字", pinyin: "hànzì", translation: "caracteres chinos", audio: "汉字", level: 1 },
            { char: "汉语", pinyin: "Hànyǔ", translation: "idioma chino", audio: "汉语", level: 1 },
            { char: "喜欢", pinyin: "xǐhuan", translation: "gustar", audio: "喜欢", level: 1 },
            { char: "天气", pinyin: "tiānqì", translation: "clima", audio: "天气", level: 1 },
            { char: "睡觉", pinyin: "shuìjiào", translation: "dormir", audio: "睡觉", level: 1 }
        ];

        this.keyListener = null;
    }

    initialize() {
        if (this.isInitialized) return;

        // Mode switch buttons
        const tonesBtn = document.getElementById("tt-mode-tones-btn");
        const tonePairsBtn = document.getElementById("tt-mode-tone-pairs-btn");
        const pairsBtn = document.getElementById("tt-mode-pairs-btn");
        const vocabBtn = document.getElementById("tt-mode-vocab-btn");
        const challengeBtn = document.getElementById("tt-mode-challenge-btn");

        if (tonesBtn) tonesBtn.addEventListener("click", () => this.switchMode("tones"));
        if (tonePairsBtn) tonePairsBtn.addEventListener("click", () => this.switchMode("tone-pairs"));
        if (pairsBtn) pairsBtn.addEventListener("click", () => this.switchMode("pairs"));
        if (vocabBtn) vocabBtn.addEventListener("click", () => this.switchMode("vocab"));
        if (challengeBtn) challengeBtn.addEventListener("click", () => this.switchMode("challenge"));

        // Audio and Next buttons
        const playBtn = document.getElementById("tt-play-audio-btn");
        const nextBtn = document.getElementById("tt-next-btn");

        if (playBtn) playBtn.addEventListener("click", () => this.playAudio());
        if (nextBtn) nextBtn.addEventListener("click", () => this.nextQuestion());

        // Speed buttons
        document.querySelectorAll(".tt-speed-btn[data-speed]").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tt-speed-btn[data-speed]").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.playbackSpeed = parseFloat(btn.dataset.speed || "1.0");
                this.playAudio();
            });
        });

        // Auto-repeat toggle
        const autoRepeatBtn = document.getElementById("tt-auto-repeat-btn");
        if (autoRepeatBtn) {
            autoRepeatBtn.addEventListener("click", () => {
                this.autoRepeat = !this.autoRepeat;
                autoRepeatBtn.classList.toggle("active", this.autoRepeat);
            });
        }

        // Tone cards click (1, 2, 3, 4, 5)
        document.querySelectorAll(".tt-tone-card").forEach((card) => {
            card.addEventListener("click", () => {
                const toneNum = parseInt(card.dataset.tone, 10);
                this.selectTone(toneNum);
            });
        });

        // Filter controls
        const levelSelect = document.getElementById("tt-level-select");
        if (levelSelect) {
            levelSelect.addEventListener("change", (e) => {
                this.state.selectedLevel = e.target.value || "all";
                this.nextQuestion();
            });
        }

        const neutralToggle = document.getElementById("tt-include-neutral");
        if (neutralToggle) {
            neutralToggle.addEventListener("change", (e) => {
                this.state.includeNeutral = e.target.checked;
                const card5 = document.getElementById("tt-card-tone-5");
                if (card5) card5.style.display = this.state.includeNeutral ? "flex" : "none";
                this.nextQuestion();
            });
        }

        // Reference Tabs (Chao scale vs Sandhi rules)
        const refChaoBtn = document.getElementById("tt-ref-chao-btn");
        const refSandhiBtn = document.getElementById("tt-ref-sandhi-btn");
        const refChaoPanel = document.getElementById("tt-ref-chao-panel");
        const refSandhiPanel = document.getElementById("tt-ref-sandhi-panel");

        if (refChaoBtn && refSandhiBtn && refChaoPanel && refSandhiPanel) {
            refChaoBtn.addEventListener("click", () => {
                refChaoBtn.classList.add("active");
                refSandhiBtn.classList.remove("active");
                refChaoPanel.style.display = "block";
                refSandhiPanel.style.display = "none";
            });

            refSandhiBtn.addEventListener("click", () => {
                refSandhiBtn.classList.add("active");
                refChaoBtn.classList.remove("active");
                refSandhiPanel.style.display = "block";
                refChaoPanel.style.display = "none";
            });
        }

        // Sandhi example audio buttons
        document.querySelectorAll(".tt-play-sandhi-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const text = btn.dataset.audio;
                if (text) {
                    if (this.app?.audioController?.playAudio) {
                        this.app.audioController.playAudio(text);
                    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        try {
                            window.speechSynthesis.cancel();
                            const utter = new window.SpeechSynthesisUtterance(text);
                            utter.lang = "zh-CN";
                            window.speechSynthesis.speak(utter);
                        } catch {
                            // ignore
                        }
                    }
                }
            });
        });

        // Keyboard shortcuts listener
        this.bindKeyboardShortcuts();

        this.isInitialized = true;
        this.nextQuestion();
    }

    bindKeyboardShortcuts() {
        if (this.keyListener) return;

        this.keyListener = (e) => {
            const panel = document.getElementById("tone-trainer");
            if (!panel || panel.style.display === "none" || !panel.classList.contains("active") && panel.getAttribute("data-active") !== "true") {
                // Only respond when tone-trainer is visible
                const isVisible = panel && getComputedStyle(panel).display !== "none";
                if (!isVisible) return;
            }

            if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) {
                return;
            }

            const key = e.key;
            if (key === "1" || key === "2" || key === "3" || key === "4" || key === "5") {
                if (this.state.mode === "tones") {
                    this.selectTone(parseInt(key, 10));
                }
            } else if (key === " ") {
                e.preventDefault();
                this.playAudio();
            } else if (key === "Enter" || key.toLowerCase() === "n") {
                const nextBtn = document.getElementById("tt-next-btn");
                if (nextBtn && nextBtn.style.display !== "none") {
                    this.nextQuestion();
                }
            }
        };

        window.addEventListener("keydown", this.keyListener);
    }

    switchMode(mode) {
        this.stopChallenge();

        this.state.mode = mode;
        document.querySelectorAll(".tt-mode-tab").forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.mode === mode);
        });

        const toneOptions = document.getElementById("tt-tone-options");
        const choiceOptions = document.getElementById("tt-choice-options");
        const levelFilter = document.getElementById("tt-level-filter-group");
        const neutralToggle = document.getElementById("tt-neutral-toggle-group");
        const challengeBanner = document.getElementById("tt-challenge-banner");

        if (mode === "tones") {
            if (toneOptions) toneOptions.style.display = "grid";
            if (choiceOptions) choiceOptions.style.display = "none";
            if (levelFilter) levelFilter.style.display = "none";
            if (neutralToggle) neutralToggle.style.display = "flex";
            if (challengeBanner) challengeBanner.style.display = "none";
        } else if (mode === "challenge") {
            if (toneOptions) toneOptions.style.display = "grid";
            if (choiceOptions) choiceOptions.style.display = "none";
            if (levelFilter) levelFilter.style.display = "none";
            if (neutralToggle) neutralToggle.style.display = "none";
            if (challengeBanner) challengeBanner.style.display = "flex";
            this.startChallenge();
            return;
        } else {
            if (toneOptions) toneOptions.style.display = "none";
            if (choiceOptions) choiceOptions.style.display = "grid";
            if (levelFilter) levelFilter.style.display = (mode === "vocab" || mode === "tone-pairs") ? "flex" : "none";
            if (neutralToggle) neutralToggle.style.display = "none";
            if (challengeBanner) challengeBanner.style.display = "none";
        }

        this.nextQuestion();
    }

    startChallenge() {
        this.stopChallenge();

        this.state.challengeActive = true;
        this.state.challengeSeconds = 60;
        this.state.combo = 1;
        this.state.maxCombo = 1;
        this.state.challengeScore = 0;
        this.state.challengeCorrect = 0;
        this.state.challengeTotal = 0;

        const countdownEl = document.getElementById("tt-challenge-countdown");
        const barFill = document.getElementById("tt-challenge-bar-fill");
        const comboVal = document.getElementById("tt-challenge-combo-val");

        if (countdownEl) countdownEl.textContent = "60s";
        if (barFill) barFill.style.width = "100%";
        if (comboVal) comboVal.textContent = "x1";

        this.state.challengeInterval = setInterval(() => {
            this.state.challengeSeconds -= 1;
            if (countdownEl) countdownEl.textContent = `${this.state.challengeSeconds}s`;
            if (barFill) {
                const pct = (this.state.challengeSeconds / 60) * 100;
                barFill.style.width = `${Math.max(0, pct)}%`;
            }

            if (this.state.challengeSeconds <= 0) {
                this.endChallenge();
            }
        }, 1000);

        this.nextQuestion();
    }

    stopChallenge() {
        if (this.state.challengeInterval) {
            clearInterval(this.state.challengeInterval);
            this.state.challengeInterval = null;
        }
        this.state.challengeActive = false;
    }

    endChallenge() {
        this.stopChallenge();
        const isEs = this.app?.currentLanguage !== "en";
        const acc = this.state.challengeTotal > 0
            ? Math.round((this.state.challengeCorrect / this.state.challengeTotal) * 100)
            : 0;

        let medal = "🥉 Oído de Bronce";
        if (this.state.challengeScore >= 400) medal = "👑 Maestro del Oído";
        else if (this.state.challengeScore >= 250) medal = "🥇 Oído de Oro";
        else if (this.state.challengeScore >= 120) medal = "🥈 Oído de Plata";

        const feedback = document.getElementById("tt-feedback");
        if (feedback) {
            feedback.innerHTML = `
                <div class="tt-challenge-summary">
                    <h4>🏁 ${isEs ? "¡Desafío 60s Completado!" : "60s Challenge Finished!"}</h4>
                    <p class="tt-challenge-medal">${medal}</p>
                    <div class="tt-summary-metrics">
                        <span>${isEs ? "Puntuación:" : "Score:"} <strong>${this.state.challengeScore} pts</strong></span>
                        <span>${isEs ? "Aciertos:" : "Correct:"} <strong>${this.state.challengeCorrect} / ${this.state.challengeTotal}</strong></span>
                        <span>${isEs ? "Precisión:" : "Accuracy:"} <strong>${acc}%</strong></span>
                        <span>${isEs ? "Combo Máx:" : "Max Combo:"} <strong>x${this.state.maxCombo}</strong></span>
                    </div>
                    <button class="btn btn-primary btn-sm" id="tt-restart-challenge-btn" type="button" style="margin-top: 10px;">
                        ${isEs ? "Jugar de nuevo" : "Play Again"}
                    </button>
                </div>
            `;
            feedback.className = "tt-feedback-card correct";
            feedback.style.display = "block";

            const restartBtn = document.getElementById("tt-restart-challenge-btn");
            if (restartBtn) {
                restartBtn.addEventListener("click", () => this.startChallenge());
            }
        }
    }

    nextQuestion() {
        this.state.answered = false;

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback && !this.state.challengeActive) {
            feedback.style.display = "none";
            feedback.className = "tt-feedback-card";
        }
        if (nextBtn) nextBtn.style.display = "none";

        // Reset tone card styles
        document.querySelectorAll(".tt-tone-card").forEach((card) => {
            card.classList.remove("correct", "incorrect");
        });

        if (this.state.mode === "tones" || this.state.mode === "challenge") {
            this.generateToneQuestion();
        } else if (this.state.mode === "tone-pairs") {
            this.generateTonePairQuestion();
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
        const isEs = this.app?.currentLanguage !== "en";

        // Check if neutral tone is allowed
        const hasNeutral = this.state.includeNeutral && syllableObj.tones.length >= 5;
        const maxTone = hasNeutral ? 5 : 4;
        const targetTone = Math.floor(Math.random() * maxTone) + 1; // 1 to 5

        const targetPinyin = syllableObj.tones[targetTone - 1];
        const targetChar = syllableObj.chars[targetTone - 1];

        this.state.currentQuestion = {
            audioText: targetChar,
            prompt: isEs ? "¿Qué tono escuchas en esta sílaba?" : "Which tone do you hear in this syllable?",
            correctAnswer: targetTone,
            targetPinyin,
            targetChar,
            base: syllableObj.base
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = isEs ? "¿Qué tono escuchas en esta sílaba?" : "Which tone do you hear in this syllable?";
        if (clueEl) clueEl.textContent = `${syllableObj.base}`;

        for (let i = 1; i <= 4; i++) {
            const exEl = document.getElementById(`tt-ex-${i}`);
            if (exEl) exEl.textContent = syllableObj.tones[i - 1];
        }

        const ex5 = document.getElementById("tt-ex-5");
        if (ex5) {
            ex5.textContent = syllableObj.tones[4] || `${syllableObj.base}`;
        }
    }

    generateTonePairQuestion() {
        const isEs = this.app?.currentLanguage !== "en";
        let pool = this.tonePairsBank;

        if (this.state.selectedLevel !== "all") {
            const lvl = parseInt(this.state.selectedLevel, 10);
            const filtered = pool.filter((w) => w.level === lvl);
            if (filtered.length >= 4) pool = filtered;
        }

        const target = pool[Math.floor(Math.random() * pool.length)];
        const correctSignature = `${target.tones[0]}º + ${target.tones[1] === 0 ? "Neutro" : target.tones[1] + "º"}`;

        // Distractor tone combinations
        const distractorSignatures = new Set();
        const allPossibleTones = [
            [1, 1], [1, 2], [1, 3], [1, 4], [1, 0],
            [2, 1], [2, 2], [2, 3], [2, 4], [2, 0],
            [3, 1], [3, 2], [3, 3], [3, 4], [3, 0],
            [4, 1], [4, 2], [4, 3], [4, 4], [4, 0]
        ];

        while (distractorSignatures.size < 3) {
            const pick = allPossibleTones[Math.floor(Math.random() * allPossibleTones.length)];
            const sig = `${pick[0]}º + ${pick[1] === 0 ? "Neutro" : pick[1] + "º"}`;
            if (sig !== correctSignature) {
                distractorSignatures.add(sig);
            }
        }

        const options = [
            { key: correctSignature, primary: correctSignature, secondary: isEs ? "Combinación tonal" : "Tone combination", isCorrect: true },
            ...Array.from(distractorSignatures).map((sig) => ({
                key: sig,
                primary: sig,
                secondary: isEs ? "Combinación tonal" : "Tone combination",
                isCorrect: false
            }))
        ].sort(() => Math.random() - 0.5);

        this.state.currentQuestion = {
            audioText: target.char,
            prompt: isEs ? `Pares Tónicos: ¿Qué combinación de tonos escuchas?` : `Tone Pairs: Which tone combination do you hear?`,
            correctAnswer: correctSignature,
            target,
            options
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = isEs ? "Pares Tónicos: Selecciona la combinación tonal correcta" : "Tone Pairs: Select the correct tone sequence";
        if (clueEl) clueEl.textContent = `${target.char} (${target.pinyin}) · ${isEs ? target.meaningEs : target.meaningEn}`;

        this.renderChoiceButtons(options.map((opt) => ({
            key: opt.key,
            primary: opt.primary,
            secondary: opt.secondary,
            meaning: ""
        })));
    }

    generatePairQuestion() {
        const isEs = this.app?.currentLanguage !== "en";
        const pairGroup = this.minimalPairsBank[Math.floor(Math.random() * this.minimalPairsBank.length)];
        const targetOption = pairGroup.options[Math.floor(Math.random() * pairGroup.options.length)];

        this.state.currentQuestion = {
            audioText: targetOption.audio,
            prompt: isEs ? `Escucha y distingue el sonido (${pairGroup.title}):` : `Listen and distinguish the sound (${pairGroup.title}):`,
            correctAnswer: targetOption.text,
            targetOption
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = isEs ? "Pares Mínimos: ¿Cuál de estas palabras escuchas?" : "Minimal Pairs: Which of these words do you hear?";
        if (clueEl) clueEl.textContent = pairGroup.title;

        this.renderChoiceButtons(pairGroup.options.map((opt) => ({
            key: opt.text,
            primary: opt.char,
            secondary: opt.text,
            meaning: opt.translation
        })));
    }

    generateVocabQuestion() {
        const isEs = this.app?.currentLanguage !== "en";
        let pool = this.fallbackVocabBank;
        if (this.app.vocabulary && Array.isArray(this.app.vocabulary) && this.app.vocabulary.length >= 4) {
            pool = this.app.vocabulary;
        }

        if (this.state.selectedLevel !== "all") {
            const lvl = parseInt(this.state.selectedLevel, 10);
            const filtered = pool.filter((w) => Number(w.level) === lvl);
            if (filtered.length >= 4) pool = filtered;
        }

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 4).map((w) => ({
            key: w.character,
            primary: w.character,
            secondary: w.pinyin,
            meaning: (isEs ? w.spanish : w.english) || w.translation || w.english || w.spanish || "",
            audio: w.character
        }));

        const target = options[Math.floor(Math.random() * options.length)];

        this.state.currentQuestion = {
            audioText: target.audio,
            prompt: isEs ? "Dictado: ¿Qué palabra escuchas?" : "Dictation: Which word do you hear?",
            correctAnswer: target.key,
            target
        };

        const promptEl = document.getElementById("tt-question-prompt");
        const clueEl = document.getElementById("tt-clue-text");

        if (promptEl) promptEl.textContent = isEs ? "Dictado de Vocabulario HSK:" : "HSK Vocabulary Dictation:";
        if (clueEl) clueEl.textContent = isEs ? "Selecciona la palabra correcta" : "Select the correct word";

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
                <span>${opt.primary} ${opt.secondary ? `(${opt.secondary})` : ""}</span>
                ${opt.meaning ? `<span class="tt-choice-sub">${opt.meaning}</span>` : ""}
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
        } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                window.speechSynthesis.cancel();
                const utter = new window.SpeechSynthesisUtterance(text);
                utter.lang = "zh-CN";
                utter.rate = this.playbackSpeed || 1.0;
                window.speechSynthesis.speak(utter);
            } catch {
                // ignore
            }
        }

        // Auto-repeat once more after 700ms if enabled
        if (this.autoRepeat) {
            setTimeout(() => {
                if (this.app?.audioController?.playAudio) {
                    this.app.audioController.playAudio(text);
                }
            }, 750);
        }
    }

    selectTone(selectedTone) {
        if (this.state.answered) return;
        this.state.answered = true;

        const isCorrect = selectedTone === this.state.currentQuestion.correctAnswer;
        const targetCard = document.querySelector(`.tt-tone-card[data-tone="${selectedTone}"]`);
        const correctCard = document.querySelector(`.tt-tone-card[data-tone="${this.state.currentQuestion.correctAnswer}"]`);

        const isEs = this.app?.currentLanguage !== "en";
        const toneDescriptionsEs = {
            1: "1º Tono (55) · Alto y plano",
            2: "2º Tono (35) · Ascendente, como una pregunta",
            3: "3º Tono (214) · Bajo y curvo con descenso profundo",
            4: "4º Tono (51) · Descendente, tajante y firme",
            5: "Tono Neutro · Ligero, breve y sin acento"
        };
        const toneDescriptionsEn = {
            1: "1st Tone (55) · High and flat",
            2: "2nd Tone (35) · Rising, like a question",
            3: "3rd Tone (214) · Low and dipping",
            4: "4th Tone (51) · Falling and sharp",
            5: "Neutral Tone · Light and short"
        };

        const desc = isEs
            ? toneDescriptionsEs[this.state.currentQuestion.correctAnswer]
            : toneDescriptionsEn[this.state.currentQuestion.correctAnswer];

        if (isCorrect) {
            targetCard?.classList.add("correct");
            this.handleSuccess(
                isEs
                    ? `¡Correcto! ${desc} (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`
                    : `Correct! ${desc} (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`
            );
        } else {
            targetCard?.classList.add("incorrect");
            correctCard?.classList.add("correct");
            this.handleFailure(
                isEs
                    ? `Incorrecto. Era el ${desc} (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`
                    : `Incorrect. It was ${desc} (${this.state.currentQuestion.targetPinyin} — ${this.state.currentQuestion.targetChar})`
            );
        }
    }

    selectChoice(selectedKey, clickedBtn) {
        if (this.state.answered) return;
        this.state.answered = true;

        const isCorrect = selectedKey === this.state.currentQuestion.correctAnswer;
        const isEs = this.app?.currentLanguage !== "en";

        if (isCorrect) {
            clickedBtn?.classList.add("correct");
            if (this.state.mode === "tone-pairs" && this.state.currentQuestion.target) {
                const t = this.state.currentQuestion.target;
                this.handleSuccess(isEs ? `¡Excelente! ${t.char} (${t.pinyin}) es ${t.meaningEs}.` : `Excellent! ${t.char} (${t.pinyin}) is ${t.meaningEn}.`);
            } else {
                this.handleSuccess(isEs ? "¡Excelente! Respuesta correcta." : "Excellent! Correct answer.");
            }
        } else {
            clickedBtn?.classList.add("incorrect");
            document.querySelectorAll(".tt-choice-btn").forEach((btn) => {
                if (btn.textContent.includes(this.state.currentQuestion.correctAnswer)) {
                    btn.classList.add("correct");
                }
            });

            if (this.state.mode === "tone-pairs" && this.state.currentQuestion.target) {
                const t = this.state.currentQuestion.target;
                this.handleFailure(isEs
                    ? `Era ${this.state.currentQuestion.correctAnswer}: ${t.char} (${t.pinyin}) = ${t.meaningEs}`
                    : `Correct was ${this.state.currentQuestion.correctAnswer}: ${t.char} (${t.pinyin}) = ${t.meaningEn}`
                );
            } else {
                this.handleFailure(
                    isEs
                        ? "Casi, revisa la opción correcta resaltada en verde."
                        : "Almost! Review the correct option highlighted in green."
                );
            }
        }
    }

    handleSuccess(msg) {
        this.state.totalQuestions += 1;
        this.state.correctAnswers += 1;
        this.state.streak += 1;
        if (this.state.streak > this.state.bestStreak) {
            this.state.bestStreak = this.state.streak;
        }

        // In challenge mode, combo increments
        if (this.state.challengeActive) {
            this.state.challengeTotal += 1;
            this.state.challengeCorrect += 1;
            this.state.combo = Math.min(4, Math.floor(this.state.streak / 2) + 1);
            if (this.state.combo > this.state.maxCombo) {
                this.state.maxCombo = this.state.combo;
            }
            const comboMultiplier = this.state.combo;
            const pts = 10 * comboMultiplier;
            this.state.challengeScore += pts;
            this.state.score += pts;

            const comboEl = document.getElementById("tt-challenge-combo-val");
            if (comboEl) comboEl.textContent = `x${this.state.combo}`;
        } else {
            const pts = 10 + (this.state.streak - 1) * 2;
            this.state.score += pts;
        }

        this.updateStats();

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback) {
            feedback.innerHTML = `<span>🎯 ${msg}</span>`;
            feedback.className = "tt-feedback-card correct";
            feedback.style.display = "block";
        }

        if (this.state.challengeActive) {
            // In challenge mode, quickly auto-advance after 400ms for speed
            setTimeout(() => {
                if (this.state.challengeActive) {
                    this.nextQuestion();
                }
            }, 400);
        } else {
            if (nextBtn) nextBtn.style.display = "inline-flex";
        }

        if (this.state.streak > 0 && this.state.streak % 5 === 0) {
            this.app?.audioController?.playStreakFanfare?.();
        } else {
            this.app?.audioController?.playCorrect?.();
        }

        if (this.state.totalQuestions >= 3) {
            this.app?.homeController?.markQuestCompleted?.("tones");
        }

        try { navigator.vibrate?.(30); } catch { void 0; }
    }

    handleFailure(msg) {
        this.state.totalQuestions += 1;
        this.state.streak = 0;

        if (this.state.challengeActive) {
            this.state.challengeTotal += 1;
            this.state.combo = 1;
            const comboEl = document.getElementById("tt-challenge-combo-val");
            if (comboEl) comboEl.textContent = "x1";
        }

        this.updateStats();

        const feedback = document.getElementById("tt-feedback");
        const nextBtn = document.getElementById("tt-next-btn");

        if (feedback) {
            feedback.innerHTML = `<span>❌ ${msg}</span>`;
            feedback.className = "tt-feedback-card incorrect";
            feedback.style.display = "block";
        }

        if (this.state.challengeActive) {
            setTimeout(() => {
                if (this.state.challengeActive) {
                    this.nextQuestion();
                }
            }, 800);
        } else {
            if (nextBtn) nextBtn.style.display = "inline-flex";
        }

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
