// graded-reader-game.js — Motor de Lector Graduado HSK con Diccionario Emergente y Comprensión

const HSK_GRADED_STORIES = [
    {
        id: "hsk1-story-1",
        level: 1,
        title: "我的朋友李明",
        pinyinTitle: "Wǒ de péngyou Lǐ Míng",
        titleEn: "My Friend Li Ming",
        wordCount: 85,
        paragraphs: [
            "你好！我叫大卫，我是美国人。我现在在北京学习汉语。",
            "我有一个好朋友，他叫李明。李明是中国人，他是北京人。李明也是二十岁，我们都在北京大学读书。",
            "李明很高兴认识我。他喜欢喝茶，也喜欢吃苹果。我们每天一起去教室，一起看书。李明是我的好朋友！"
        ],
        quiz: [
            {
                question: "¿De dónde es David (大卫)?",
                questionEn: "Where is David (大卫) from?",
                options: ["中国 (China)", "美国 (Estados Unidos)", "英国 (Reino Unido)", "日本 (Japón)"],
                correct: 1
            },
            {
                question: "¿Dónde estudian Li Ming y David?",
                questionEn: "Where do Li Ming and David study?",
                options: ["清华大学", "北京大学", "复旦大学", "上海大学"],
                correct: 1
            },
            {
                question: "¿Qué le gusta beber a Li Ming?",
                questionEn: "What does Li Ming like to drink?",
                options: ["咖啡 (Café)", "牛奶 (Leche)", "茶 (Té)", "果汁 (Jugo)"],
                correct: 2
            }
        ]
    },
    {
        id: "hsk1-story-2",
        level: 1,
        title: "大学的一天",
        pinyinTitle: "Dàxué de yī tiān",
        titleEn: "A Day at the University",
        wordCount: 95,
        paragraphs: [
            "今天天气很好。早上八点，我和同学一起吃早饭。我们吃了米饭和鸡蛋。",
            "上午有两节汉语课。王老师教我们写汉字。汉字很有意思，但是有一点儿难。",
            "中午十二点，我去图书馆看书。下午三点，我和朋友在学校后面打篮球。今天我非常开心！"
        ],
        quiz: [
            {
                question: "¿Qué desayunaron por la mañana?",
                questionEn: "What did they eat for breakfast?",
                options: ["面包和牛奶", "米饭和鸡蛋", "苹果和茶", "面条"],
                correct: 1
            },
            {
                question: "¿A qué hora fue a la biblioteca a leer?",
                questionEn: "What time did he go to the library to read?",
                options: ["早上八点", "上午十点", "中午十二点", "下午三点"],
                correct: 2
            }
        ]
    },
    {
        id: "hsk2-story-1",
        level: 2,
        title: "在商场买衣服",
        pinyinTitle: "Zài shāngchǎng mǎi yīfu",
        titleEn: "Buying Clothes at the Mall",
        wordCount: 110,
        paragraphs: [
            "昨天是星期天，我和姐姐一起去商店买衣服。商场里人很多，非常热闹。",
            "姐姐想买一件红色的衣服，因为她觉得红色非常漂亮。我看到了一件黑色的衣服，价格也不贵，只要两百块钱。",
            "服务员对我们非常客气。姐姐试了试红色的衣服，觉得有点儿大，服务员给她换了一件小的。最后我们都买了喜欢的衣服。"
        ],
        quiz: [
            {
                question: "¿De qué color quería la ropa la hermana?",
                questionEn: "What color clothes did the sister want?",
                options: ["黑色 (Negro)", "红色 (Rojo)", "白色 (Blanco)", "蓝色 (Azul)"],
                correct: 1
            },
            {
                question: "¿Cuánto costaba la ropa negra?",
                questionEn: "How much was the black clothes?",
                options: ["一百块", "两百块", "五百块", "免费"],
                correct: 1
            }
        ]
    },
    {
        id: "hsk3-story-1",
        level: 3,
        title: "春节的传说：年兽",
        pinyinTitle: "Chūnjié de chuánshuō: Nián shòu",
        titleEn: "The Legend of Spring Festival: The Nian Monster",
        wordCount: 140,
        paragraphs: [
            "在中国传统文化中，春节是最重要的节日。相传在很久以前，有一种叫做“年”的怪兽，生活在深海里。",
            "每到除夕夜，“年”兽就会爬上岸，伤害村民和动物。大家都很害怕，只能跑到山上去躲避。",
            "后来，一位老爷爷发现“年”兽最害怕红色、火光和巨大的声音。于是人们在门上贴红春联，放红色的鞭炮。“年”兽被吓跑了，再也不敢回来了。",
            "从此以后，每年春节过年，中国人都会贴春联、穿红衣服、放爆竹，庆祝平安。"
        ],
        quiz: [
            {
                question: "¿Dónde vivía el monstruo Nian (年兽)?",
                questionEn: "Where did the Nian monster live?",
                options: ["森林里", "高山上", "深海里", "村庄里"],
                correct: 2
            },
            {
                question: "¿A qué le temía más el monstruo Nian?",
                questionEn: "What was the Nian monster most afraid of?",
                options: ["水和雪", "红色、火光和巨大声响", "冬天和寒冷", "医生和草药"],
                correct: 1
            }
        ]
    }
];

const escapeHtml = (str) => {
    if (typeof window !== "undefined" && typeof window.hskEscapeHtml === "function") {
        return window.hskEscapeHtml(str);
    }
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

class GradedReaderGame {
    constructor(app) {
        this.app = app;
        this.currentLevel = 1;
        this.currentStory = HSK_GRADED_STORIES[0];
        this.showPinyin = true;
        this.isReading = false;
        this.activePopoverWord = null;
        this.quizAnswers = {};
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderStoryList();
        this.loadStory(this.currentStory);
    }

    cacheDOM() {
        this.container = document.getElementById("graded-reader");
        this.levelSelect = document.getElementById("reader-level-select");
        this.togglePinyinBtn = document.getElementById("reader-toggle-pinyin-btn");
        this.readAloudBtn = document.getElementById("reader-read-aloud-btn");
        this.storyChips = document.getElementById("reader-story-chips");
        this.articleCard = document.getElementById("reader-article-card");
        this.storyTitle = document.getElementById("reader-story-title");
        this.storyPinyinTitle = document.getElementById("reader-story-pinyin-title");
        this.storyLevelBadge = document.getElementById("reader-story-level-badge");
        this.storyWordCount = document.getElementById("reader-story-word-count");
        this.storyBody = document.getElementById("reader-story-body");
        this.wordPopover = document.getElementById("reader-word-popover");
        this.rwpChar = document.getElementById("rwp-char");
        this.rwpPinyin = document.getElementById("rwp-pinyin");
        this.rwpMeaning = document.getElementById("rwp-meaning");
        this.rwpAudioBtn = document.getElementById("rwp-audio-btn");
        this.rwpFavBtn = document.getElementById("rwp-fav-btn");
        this.quizQuestions = document.getElementById("reader-quiz-questions");
        this.quizScoreBanner = document.getElementById("reader-quiz-score-banner");
    }

    bindEvents() {
        if (this.levelSelect) {
            this.levelSelect.addEventListener("change", (e) => {
                this.currentLevel = parseInt(e.target.value, 10);
                this.renderStoryList();
                const firstForLevel = HSK_GRADED_STORIES.find((s) => s.level === this.currentLevel) || HSK_GRADED_STORIES[0];
                this.loadStory(firstForLevel);
            });
        }

        if (this.togglePinyinBtn) {
            this.togglePinyinBtn.addEventListener("click", () => {
                this.showPinyin = !this.showPinyin;
                this.togglePinyinBtn.classList.toggle("active", this.showPinyin);
                if (this.storyBody) {
                    this.storyBody.classList.toggle("hide-pinyin", !this.showPinyin);
                }
                const label = this.togglePinyinBtn.querySelector("span[data-i18n]");
                if (label) {
                    label.textContent = this.showPinyin ? "Pinyin: ON" : "Pinyin: OFF";
                }
            });
        }

        if (this.readAloudBtn) {
            this.readAloudBtn.addEventListener("click", () => {
                if (this.isReading) {
                    this.stopReadAloud();
                } else {
                    this.startReadAloud();
                }
            });
        }

        if (this.rwpAudioBtn) {
            this.rwpAudioBtn.addEventListener("click", () => {
                if (this.activePopoverWord) {
                    this.app.audioController?.playWordAudio?.(this.activePopoverWord.character);
                }
            });
        }

        if (this.rwpFavBtn) {
            this.rwpFavBtn.addEventListener("click", () => {
                if (this.activePopoverWord && this.app.deckManager) {
                    const isNowFav = this.app.deckManager.toggleFavorite(this.activePopoverWord);
                    this.rwpFavBtn.textContent = isNowFav ? "⭐" : "☆";
                    this.app.showToast(
                        isNowFav ? "Guardado en Favoritos" : "Retirado de Favoritos",
                        "success",
                        1500
                    );
                }
            });
        }

        document.addEventListener("click", (e) => {
            if (
                this.wordPopover &&
                !this.wordPopover.contains(e.target) &&
                !e.target.closest(".reader-word")
            ) {
                this.hidePopover();
            }
        });
    }

    renderStoryList() {
        if (!this.storyChips) return;
        const filtered = HSK_GRADED_STORIES.filter((s) => s.level === this.currentLevel);
        const storiesToRender = filtered.length > 0 ? filtered : HSK_GRADED_STORIES;

        this.storyChips.innerHTML = storiesToRender
            .map((story) => {
                const isActive = story.id === this.currentStory.id;
                return `
                <button type="button" class="reader-story-chip ${isActive ? "active" : ""}" data-story-id="${story.id}">
                    <span>${story.title}</span>
                    <span class="reader-chip-pinyin">${story.pinyinTitle}</span>
                </button>
            `;
            })
            .join("");

        this.storyChips.querySelectorAll(".reader-story-chip").forEach((btn) => {
            btn.addEventListener("click", () => {
                const storyId = btn.getAttribute("data-story-id");
                const found = HSK_GRADED_STORIES.find((s) => s.id === storyId);
                if (found) {
                    this.loadStory(found);
                    this.renderStoryList();
                }
            });
        });
    }

    loadStory(story) {
        this.currentStory = story;
        this.quizAnswers = {};
        this.stopReadAloud();
        this.hidePopover();

        if (this.storyTitle) this.storyTitle.textContent = story.title;
        if (this.storyPinyinTitle) this.storyPinyinTitle.textContent = story.pinyinTitle;
        if (this.storyLevelBadge) this.storyLevelBadge.textContent = `HSK ${story.level}`;
        if (this.storyWordCount) this.storyWordCount.textContent = `${story.wordCount} palabras`;

        this.renderStoryContent(story);
        this.renderQuiz(story);
    }

    renderStoryContent(story) {
        if (!this.storyBody) return;

        const isEs = this.app?.currentLanguage !== "en";
        const vocabMap = new Map();
        if (Array.isArray(this.app?.vocabulary)) {
            for (const item of this.app.vocabulary) {
                if (item?.character && !vocabMap.has(item.character)) {
                    vocabMap.set(item.character, item);
                }
            }
        }

        const paragraphsHtml = story.paragraphs.map((p) => {
            const tokens = this.tokenizeText(p, vocabMap);
            const tokensHtml = tokens.map((t) => {
                if (t.isWord) {
                    const meaning = isEs ? (t.data?.spanish || t.data?.english || "Significado") : (t.data?.english || t.data?.spanish || "Meaning");
                    const pinyin = t.data?.pinyin || "";
                    return `
                        <span class="reader-word" data-word="${escapeHtml(t.text)}" data-pinyin="${escapeHtml(pinyin)}" data-meaning="${escapeHtml(meaning)}">
                            <span class="pinyin-ruby">${pinyin}</span>
                            <span class="char-span">${t.text}</span>
                        </span>
                    `;
                }
                return `<span>${t.text}</span>`;
            }).join("");

            return `<p class="reader-paragraph">${tokensHtml}</p>`;
        }).join("");

        this.storyBody.innerHTML = paragraphsHtml;
        this.storyBody.classList.toggle("hide-pinyin", !this.showPinyin);

        // Bind clicks & hovers on words
        this.storyBody.querySelectorAll(".reader-word").forEach((wordEl) => {
            wordEl.addEventListener("click", (e) => {
                e.stopPropagation();
                this.showPopover(wordEl);
            });
        });
    }

    tokenizeText(text, vocabMap) {
        const tokens = [];
        let i = 0;
        const len = text.length;

        while (i < len) {
            let matched = false;
            // Greedy match up to 4 characters in vocabulary map
            for (let l = Math.min(4, len - i); l >= 2; l--) {
                const sub = text.substr(i, l);
                if (vocabMap.has(sub)) {
                    tokens.push({ text: sub, isWord: true, data: vocabMap.get(sub) });
                    i += l;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const char = text[i];
                if (vocabMap.has(char)) {
                    tokens.push({ text: char, isWord: true, data: vocabMap.get(char) });
                } else {
                    tokens.push({ text: char, isWord: /[\u3400-\u9fff]/.test(char) });
                }
                i += 1;
            }
        }
        return tokens;
    }

    showPopover(targetEl) {
        if (!this.wordPopover) return;
        const word = targetEl.getAttribute("data-word") || "";
        const pinyin = targetEl.getAttribute("data-pinyin") || "";
        const meaning = targetEl.getAttribute("data-meaning") || "";

        this.activePopoverWord = { character: word, pinyin, spanish: meaning, english: meaning };

        if (this.rwpChar) this.rwpChar.textContent = word;
        if (this.rwpPinyin) this.rwpPinyin.textContent = pinyin;
        if (this.rwpMeaning) this.rwpMeaning.textContent = meaning;

        if (this.rwpFavBtn && this.app?.deckManager) {
            const isFav = this.app.deckManager.isFavorite(word);
            this.rwpFavBtn.textContent = isFav ? "⭐" : "☆";
        }

        // Position popover relative to article card
        const cardRect = this.articleCard.getBoundingClientRect();
        const wordRect = targetEl.getBoundingClientRect();

        const top = wordRect.bottom - cardRect.top + 8;
        let left = wordRect.left - cardRect.left - 40;

        if (left < 10) left = 10;
        if (left + 240 > cardRect.width) left = cardRect.width - 250;

        this.wordPopover.style.top = `${top}px`;
        this.wordPopover.style.left = `${left}px`;
        this.wordPopover.style.display = "block";
    }

    hidePopover() {
        if (this.wordPopover) {
            this.wordPopover.style.display = "none";
        }
        this.activePopoverWord = null;
    }

    startReadAloud() {
        if (!("speechSynthesis" in window)) {
            this.app.showToast("La síntesis de voz no está soportada en este navegador", "error");
            return;
        }

        this.isReading = true;
        if (this.readAloudBtn) {
            this.readAloudBtn.classList.add("active");
            const label = this.readAloudBtn.querySelector("span[data-i18n]");
            if (label) label.textContent = "Detener Audio";
        }

        const fullText = this.currentStory.paragraphs.join(" ");
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = "zh-CN";
        utterance.rate = 0.85;

        utterance.onend = () => this.stopReadAloud();
        utterance.onerror = () => this.stopReadAloud();

        speechSynthesis.speak(utterance);
    }

    stopReadAloud() {
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }
        this.isReading = false;
        if (this.readAloudBtn) {
            this.readAloudBtn.classList.remove("active");
            const label = this.readAloudBtn.querySelector("span[data-i18n]");
            if (label) label.textContent = "Leer en voz alta";
        }
        this.storyBody?.querySelectorAll(".reading-active").forEach((el) => {
            el.classList.remove("reading-active");
        });
    }

    renderQuiz(story) {
        if (!this.quizQuestions) return;
        if (this.quizScoreBanner) this.quizScoreBanner.style.display = "none";

        if (!story.quiz || story.quiz.length === 0) {
            this.quizQuestions.innerHTML = "<p>No hay preguntas para esta lectura.</p>";
            return;
        }

        const isEs = this.app?.currentLanguage !== "en";

        this.quizQuestions.innerHTML = story.quiz
            .map((q, qIndex) => {
                const title = isEs ? q.question : (q.questionEn || q.question);
                const optionsHtml = q.options
                    .map((opt, optIndex) => `
                    <button type="button" class="reader-quiz-option" data-qindex="${qIndex}" data-optindex="${optIndex}">
                        <span>${String.fromCharCode(65 + optIndex)}. ${opt}</span>
                    </button>
                `)
                    .join("");

                return `
                <div class="reader-quiz-card" id="quiz-card-${qIndex}">
                    <p class="reader-quiz-question-title">${qIndex + 1}. ${title}</p>
                    <div class="reader-quiz-options">${optionsHtml}</div>
                </div>
            `;
            })
            .join("");

        this.quizQuestions.querySelectorAll(".reader-quiz-option").forEach((btn) => {
            btn.addEventListener("click", () => {
                const qIndex = parseInt(btn.getAttribute("data-qindex"), 10);
                const optIndex = parseInt(btn.getAttribute("data-optindex"), 10);
                this.handleQuizAnswer(qIndex, optIndex);
            });
        });
    }

    handleQuizAnswer(qIndex, optIndex) {
        const question = this.currentStory.quiz[qIndex];
        if (!question || this.quizAnswers[qIndex] !== undefined) return;

        this.quizAnswers[qIndex] = optIndex;
        const card = document.getElementById(`quiz-card-${qIndex}`);
        if (!card) return;

        const isCorrect = optIndex === question.correct;
        const options = card.querySelectorAll(".reader-quiz-option");

        options.forEach((optBtn, idx) => {
            if (idx === question.correct) {
                optBtn.classList.add("correct");
            } else if (idx === optIndex && !isCorrect) {
                optBtn.classList.add("incorrect");
            }
            optBtn.disabled = true;
        });

        if (isCorrect) {
            this.app.audioController?.playChime?.(587.33);
        } else {
            this.app.audioController?.playChime?.(220);
        }

        // Check if all answered
        if (Object.keys(this.quizAnswers).length === this.currentStory.quiz.length) {
            this.showQuizResults();
        }
    }

    showQuizResults() {
        if (!this.quizScoreBanner) return;
        let correctCount = 0;
        this.currentStory.quiz.forEach((q, idx) => {
            if (this.quizAnswers[idx] === q.correct) correctCount += 1;
        });

        const total = this.currentStory.quiz.length;
        const isEs = this.app?.currentLanguage !== "en";

        this.quizScoreBanner.innerHTML = isEs
            ? `🎉 ¡Completado! Acertaste <strong>${correctCount} / ${total}</strong> preguntas de comprensión.`
            : `🎉 Completed! You got <strong>${correctCount} / ${total}</strong> comprehension questions correct.`;
        this.quizScoreBanner.style.display = "block";

        if (correctCount === total && this.app?.achievementManager) {
            this.app.achievementManager.unlock?.("reader-master");
            this.app.achievementManager.fireConfetti?.();
        }
    }
}

window.GradedReaderGame = GradedReaderGame;
