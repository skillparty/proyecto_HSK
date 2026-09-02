// lyrics-lab-game.js — Motor del Laboratorio de Canciones y Rimas Chinas

const HSK_SONGS_DATABASE = [
    {
        id: "two-tigers",
        title: "《两只老虎》 (Dos Tigres)",
        titleEn: "Two Tigers (Liǎng Zhī Lǎohǔ)",
        icon: "🐅",
        level: "HSK 1",
        tempo: "120 BPM",
        desc: "Canción infantil clásica y divertida para aprender animales y partes del cuerpo.",
        descEn: "Classic fun nursery rhyme to learn animals and body parts.",
        lines: [
            {
                hanzi: "两只老虎，两只老虎，",
                pinyin: "Liǎng zhī lǎohǔ, liǎng zhī lǎohǔ,",
                meaning: "Dos tigres, dos tigres,",
                meaningEn: "Two tigers, two tigers,"
            },
            {
                hanzi: "跑得快，跑得快，",
                pinyin: "Pǎo de kuài, pǎo de kuài,",
                meaning: "Corren rápido, corren rápido,",
                meaningEn: "Running fast, running fast,"
            },
            {
                hanzi: "一只没有耳朵，",
                pinyin: "Yī zhī méiyǒu ěrduo,",
                meaning: "Uno no tiene orejas,",
                meaningEn: "One has no ears,"
            },
            {
                hanzi: "一只没有尾巴，",
                pinyin: "Yī zhī méiyǒu wěiba,",
                meaning: "Uno no tiene cola,",
                meaningEn: "One has no tail,"
            },
            {
                hanzi: "真奇怪！真奇怪！",
                pinyin: "Zhēn qíguài! Zhēn qíguài!",
                meaning: "¡Qué extraño! ¡Qué extraño!",
                meaningEn: "Really strange! Really strange!"
            }
        ],
        vocab: [
            { hanzi: "老虎", pinyin: "lǎohǔ", meaning: "Tigre", meaningEn: "Tiger" },
            { hanzi: "只", pinyin: "zhī", meaning: "Clasificador de animales", meaningEn: "Animal classifier" },
            { hanzi: "跑", pinyin: "pǎo", meaning: "Correr", meaningEn: "To run" },
            { hanzi: "耳朵", pinyin: "ěrduo", meaning: "Oreja", meaningEn: "Ear" },
            { hanzi: "尾巴", pinyin: "wěiba", meaning: "Cola", meaningEn: "Tail" },
            { hanzi: "奇怪", pinyin: "qíguài", meaning: "Extraño / Raro", meaningEn: "Strange / Weird" }
        ]
    },
    {
        id: "find-friend",
        title: "《找朋友》 (Buscando Amigos)",
        titleEn: "Looking for a Friend (Zhǎo Péngyou)",
        icon: "🤝",
        level: "HSK 1",
        tempo: "110 BPM",
        desc: "Canción tradicional china de socialización y saludos de cortesía.",
        descEn: "Traditional Chinese song for making friends and polite greetings.",
        lines: [
            {
                hanzi: "找呀找呀找朋友，",
                pinyin: "Zhǎo ya zhǎo ya zhǎo péngyou,",
                meaning: "Buscando, buscando, buscando un amigo,",
                meaningEn: "Looking, looking, looking for a friend,"
            },
            {
                hanzi: "找到一个好朋友，",
                pinyin: "Zhǎodào yī gè hǎo péngyou,",
                meaning: "Encontré a un buen amigo,",
                meaningEn: "Found a good friend,"
            },
            {
                hanzi: "敬个礼，握握手，",
                pinyin: "Jìng gè lǐ, wò wò shǒu,",
                meaning: "Hacemos una reverencia, nos damos la mano,",
                meaningEn: "Salute politely, shake hands,"
            },
            {
                hanzi: "你是我的好朋友，",
                pinyin: "Nǐ shì wǒ de hǎo péngyou,",
                meaning: "Tú eres mi buen amigo,",
                meaningEn: "You are my good friend,"
            },
            {
                hanzi: "再见！",
                pinyin: "Zàijiàn!",
                meaning: "¡Hasta luego!",
                meaningEn: "Goodbye!"
            }
        ],
        vocab: [
            { hanzi: "找", pinyin: "zhǎo", meaning: "Buscar", meaningEn: "To search / find" },
            { hanzi: "朋友", pinyin: "péngyou", meaning: "Amigo", meaningEn: "Friend" },
            { hanzi: "敬礼", pinyin: "jìnglǐ", meaning: "Hacer reverencia / Saludo", meaningEn: "To salute / bow" },
            { hanzi: "握手", pinyin: "wòshǒu", meaning: "Estrechar la mano", meaningEn: "To shake hands" },
            { hanzi: "再见", pinyin: "zàijiàn", meaning: "Adiós / Hasta la vista", meaningEn: "Goodbye" }
        ]
    },
    {
        id: "little-star",
        title: "《小星星》 (Estrellita)",
        titleEn: "Little Star (Xiǎo Xīngxīng)",
        icon: "⭐",
        level: "HSK 1",
        tempo: "100 BPM",
        desc: "Canción para aprender adjetivos visuales y naturaleza nocturna.",
        descEn: "Song to learn visual adjectives and night sky nature.",
        lines: [
            {
                hanzi: "一闪一闪亮晶晶，",
                pinyin: "Yī shǎn yī shǎn liàng jīngjīng,",
                meaning: "Centellando y brillando resplandeciente,",
                meaningEn: "Twinkle twinkle, shining bright,"
            },
            {
                hanzi: "满天都是小星星，",
                pinyin: "Mǎn tiān dōu shì xiǎo xīngxīng,",
                meaning: "Todo el cielo está lleno de estrellitas,",
                meaningEn: "The whole sky is full of little stars,"
            },
            {
                hanzi: "挂在天空放光明，",
                pinyin: "Guà zài tiānkōng fàng guāngmíng,",
                meaning: "Colgadas en el cielo irradiando luz,",
                meaningEn: "Hanging in the sky shedding light,"
            },
            {
                hanzi: "好像许多小眼睛。",
                pinyin: "Hǎoxiàng xǔduō xiǎo yǎnjing.",
                meaning: "Como si fueran muchos ojitos.",
                meaningEn: "Just like many little eyes."
            }
        ],
        vocab: [
            { hanzi: "闪", pinyin: "shǎn", meaning: "Centellear / Parpadear", meaningEn: "To sparkle / twinkle" },
            { hanzi: "亮晶晶", pinyin: "liàngjīngjīng", meaning: "Brillante / Resplandeciente", meaningEn: "Sparkling / glistening" },
            { hanzi: "天空", pinyin: "tiānkōng", meaning: "Cielo", meaningEn: "Sky" },
            { hanzi: "眼睛", pinyin: "yǎnjing", meaning: "Ojos", meaningEn: "Eyes" }
        ]
    },
    {
        id: "jasmine-flower",
        title: "《茉莉花》 (Flor de Jazmín)",
        titleEn: "Jasmine Flower (Mòlìhuā)",
        icon: "🌸",
        level: "HSK 2-3",
        tempo: "90 BPM",
        desc: "La melodía folclórica tradicional más célebre de China.",
        descEn: "The most famous traditional Chinese folk melody worldwide.",
        lines: [
            {
                hanzi: "好一朵美丽的茉莉花，",
                pinyin: "Hǎo yī duǒ měilì de mòlìhuā,",
                meaning: "¡Qué hermosa flor de jazmín!",
                meaningEn: "What a beautiful jasmine flower!"
            },
            {
                hanzi: "芬芳美丽满枝桠，",
                pinyin: "Fēnfāng měilì mǎn zhīyā,",
                meaning: "Fragante y hermosa colmando las ramas,",
                meaningEn: "Fragrant and beautiful all over the branches,"
            },
            {
                hanzi: "又香又白人人夸。",
                pinyin: "Yòu xiāng yòu bái rénrén kuā.",
                meaning: "Tan fragante y blanca que todos la elogian.",
                meaningEn: "So sweet and white, praised by everyone."
            }
        ],
        vocab: [
            { hanzi: "茉莉花", pinyin: "mòlìhuā", meaning: "Flor de jazmín", meaningEn: "Jasmine flower" },
            { hanzi: "朵", pinyin: "duǒ", meaning: "Clasificador de flores", meaningEn: "Classifier for flowers" },
            { hanzi: "美丽", pinyin: "měilì", meaning: "Hermoso / Bello", meaningEn: "Beautiful" },
            { hanzi: "芬芳", pinyin: "fēnfāng", meaning: "Fragante", meaningEn: "Fragrant" },
            { hanzi: "夸", pinyin: "kuā", meaning: "Elogiar / Alabar", meaningEn: "To praise" }
        ]
    }
];

class LyricsLabGame {
    constructor(app) {
        this.app = app;
        this.currentSong = HSK_SONGS_DATABASE[0];
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.showPinyin = true;
        this.currentLineIndex = -1;
        this.scrambleSelection = [];
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderSongChips();
        this.loadSong(this.currentSong);
    }

    cacheDOM() {
        this.container = document.getElementById("lyrics-lab");
        this.songChips = document.getElementById("lyrics-song-chips");

        this.heroIcon = document.getElementById("song-hero-icon");
        this.heroTitle = document.getElementById("song-hero-title");
        this.heroDesc = document.getElementById("song-hero-desc");
        this.hskLevel = document.getElementById("song-hsk-level");
        this.tempoTag = document.getElementById("song-tempo-tag");

        this.playAllBtn = document.getElementById("lyrics-play-all-btn");
        this.playIcon = document.getElementById("lyrics-play-icon");
        this.playLabel = document.getElementById("lyrics-play-label");
        this.togglePinyinBtn = document.getElementById("lyrics-toggle-pinyin-btn");

        this.linesFeed = document.getElementById("lyrics-lines-feed");
        this.vocabList = document.getElementById("song-vocab-list");

        this.scrambleSlots = document.getElementById("scramble-slots");
        this.scrambleOptions = document.getElementById("scramble-options");
        this.scrambleFeedback = document.getElementById("scramble-feedback");
    }

    bindEvents() {
        if (this.playAllBtn) {
            this.playAllBtn.addEventListener("click", () => this.togglePlayAll());
        }

        if (this.togglePinyinBtn) {
            this.togglePinyinBtn.addEventListener("click", () => {
                this.showPinyin = !this.showPinyin;
                this.togglePinyinBtn.textContent = `Pinyin: ${this.showPinyin ? "ON" : "OFF"}`;
                this.renderLines();
            });
        }

        document.querySelectorAll(".lyrics-speed-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".lyrics-speed-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                this.playbackSpeed = parseFloat(btn.getAttribute("data-speed")) || 1.0;
            });
        });
    }

    renderSongChips() {
        if (!this.songChips) return;
        this.songChips.innerHTML = HSK_SONGS_DATABASE.map((song) => {
            const isActive = song.id === this.currentSong.id;
            return `
                <button type="button" class="song-chip-btn ${isActive ? "active" : ""}" data-song-id="${song.id}">
                    <span>${song.icon}</span>
                    <span>${song.title}</span>
                </button>
            `;
        }).join("");

        this.songChips.querySelectorAll(".song-chip-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-song-id");
                const found = HSK_SONGS_DATABASE.find((s) => s.id === id);
                if (found) {
                    this.stopPlayback();
                    this.loadSong(found);
                    this.renderSongChips();
                }
            });
        });
    }

    loadSong(song) {
        this.currentSong = song;
        const isEs = this.app?.currentLanguage !== "en";

        if (this.heroIcon) this.heroIcon.textContent = song.icon;
        if (this.heroTitle) this.heroTitle.textContent = isEs ? song.title : (song.titleEn || song.title);
        if (this.heroDesc) this.heroDesc.textContent = isEs ? song.desc : (song.descEn || song.desc);
        if (this.hskLevel) this.hskLevel.textContent = song.level;
        if (this.tempoTag) this.tempoTag.textContent = song.tempo;

        this.renderLines();
        this.renderVocab();
        this.setupScrambleChallenge();
    }

    renderLines() {
        if (!this.linesFeed) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.linesFeed.innerHTML = this.currentSong.lines.map((line, idx) => {
            const meaning = isEs ? line.meaning : (line.meaningEn || line.meaning);
            return `
                <div class="lyric-line-card" data-line-idx="${idx}">
                    <button type="button" class="lyric-line-play-btn" title="Reproducir verso">🔊</button>
                    <div class="lyric-line-text-wrap">
                        <div class="lyric-hanzi">${line.hanzi}</div>
                        ${this.showPinyin ? `<div class="lyric-pinyin">${line.pinyin}</div>` : ""}
                        <div class="lyric-meaning">${meaning}</div>
                    </div>
                </div>
            `;
        }).join("");

        this.linesFeed.querySelectorAll(".lyric-line-card").forEach((card) => {
            card.addEventListener("click", () => {
                const idx = parseInt(card.getAttribute("data-line-idx"), 10);
                this.playSingleLine(idx);
            });
        });
    }

    renderVocab() {
        if (!this.vocabList) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.vocabList.innerHTML = this.currentSong.vocab.map((item) => {
            const meaning = isEs ? item.meaning : (item.meaningEn || item.meaning);
            return `
                <div class="vocab-note-item">
                    <span class="vocab-note-hanzi">${item.hanzi}</span>
                    <span class="vocab-note-pinyin">${item.pinyin}</span>
                    <span class="vocab-note-meaning">${meaning}</span>
                </div>
            `;
        }).join("");
    }

    playSingleLine(idx) {
        this.stopPlayback();
        const line = this.currentSong.lines[idx];
        if (!line) return;

        this.highlightLine(idx);

        if ("speechSynthesis" in window) {
            const utter = new SpeechSynthesisUtterance(line.hanzi);
            utter.lang = "zh-CN";
            utter.rate = this.playbackSpeed;
            utter.onend = () => {
                this.unhighlightAll();
            };
            speechSynthesis.speak(utter);
        } else {
            this.app?.audioController?.playWordAudio?.(line.hanzi);
        }
    }

    togglePlayAll() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayAll();
        }
    }

    startPlayAll() {
        this.isPlaying = true;
        if (this.playIcon) this.playIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>';
        if (this.playLabel) this.playLabel.textContent = "Detener";

        this.currentLineIndex = 0;
        this.playNextLineSequence();
    }

    playNextLineSequence() {
        if (!this.isPlaying) return;
        if (this.currentLineIndex >= this.currentSong.lines.length) {
            this.stopPlayback();
            this.app?.achievementManager?.fireConfetti?.();
            this.app?.audioController?.playStreakFanfare?.();
            return;
        }

        const line = this.currentSong.lines[this.currentLineIndex];
        this.highlightLine(this.currentLineIndex);

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(line.hanzi);
            utter.lang = "zh-CN";
            utter.rate = this.playbackSpeed;

            utter.onend = () => {
                this.currentLineIndex += 1;
                setTimeout(() => {
                    this.playNextLineSequence();
                }, 350);
            };

            speechSynthesis.speak(utter);
        } else {
            this.app?.audioController?.playWordAudio?.(line.hanzi);
            this.currentLineIndex += 1;
            setTimeout(() => {
                this.playNextLineSequence();
            }, 2000);
        }
    }

    stopPlayback() {
        this.isPlaying = false;
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }
        if (this.playIcon) this.playIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        if (this.playLabel) this.playLabel.textContent = "Cantar Canción";
        this.unhighlightAll();
    }

    highlightLine(idx) {
        this.unhighlightAll();
        const card = this.linesFeed?.querySelector(`.lyric-line-card[data-line-idx="${idx}"]`);
        if (card) {
            card.classList.add("active-singing");
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    unhighlightAll() {
        this.linesFeed?.querySelectorAll(".active-singing").forEach((el) => {
            el.classList.remove("active-singing");
        });
    }

    setupScrambleChallenge() {
        this.scrambleSelection = [];
        if (this.scrambleFeedback) this.scrambleFeedback.style.display = "none";
        this.updateScrambleSlots();

        if (!this.scrambleOptions) return;
        const shuffled = [...this.currentSong.lines].sort(() => Math.random() - 0.5);

        this.scrambleOptions.innerHTML = shuffled.map((line) => `
            <button type="button" class="scramble-opt-btn" data-hanzi="${line.hanzi}">
                ${line.hanzi}
            </button>
        `).join("");

        this.scrambleOptions.querySelectorAll(".scramble-opt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const text = btn.getAttribute("data-hanzi");
                this.handleScramblePick(text);
                btn.style.display = "none";
            });
        });
    }

    updateScrambleSlots() {
        if (!this.scrambleSlots) return;
        if (this.scrambleSelection.length === 0) {
            this.scrambleSlots.innerHTML = '<span style="color: var(--text-secondary, #9ca3af); font-size: 0.82rem;">Pulsa los versos abajo en orden...</span>';
            return;
        }

        this.scrambleSlots.innerHTML = this.scrambleSelection.map((line, i) => `
            <div class="scramble-slot-item">${i + 1}. ${line}</div>
        `).join("");
    }

    handleScramblePick(text) {
        this.scrambleSelection.push(text);
        this.updateScrambleSlots();

        if (this.scrambleSelection.length === this.currentSong.lines.length) {
            const isCorrect = this.currentSong.lines.every((line, idx) => {
                return this.scrambleSelection[idx] === line.hanzi;
            });
            this.showScrambleResult(isCorrect);
        }
    }

    showScrambleResult(isCorrect) {
        if (!this.scrambleFeedback) return;
        const isEs = this.app?.currentLanguage !== "en";

        if (isCorrect) {
            this.scrambleFeedback.className = "scramble-feedback correct";
            this.scrambleFeedback.innerHTML = isEs
                ? "¡Excelente! Has ordenado la canción a la perfección. +50 XP"
                : "Excellent! You ordered the song lyrics perfectly. +50 XP";
            this.scrambleFeedback.style.display = "block";

            this.app?.audioController?.playCorrect?.();
            this.app?.achievementManager?.fireConfetti?.();
        } else {
            this.scrambleFeedback.className = "scramble-feedback incorrect";
            this.scrambleFeedback.innerHTML = isEs
                ? "❌ El orden de los versos no es correcto. Vuelve a intentarlo."
                : "❌ The lyric order is not correct. Try again.";
            this.scrambleFeedback.style.display = "block";

            this.app?.audioController?.playIncorrect?.();
            setTimeout(() => {
                this.setupScrambleChallenge();
            }, 1400);
        }
    }
}

window.LyricsLabGame = LyricsLabGame;
