// dialogue-tutor-game.js — Motor del Asistente y Tutor Conversacional HSK

const HSK_DIALOGUE_SCENARIOS = [
    {
        id: "restaurant",
        name: "在餐厅点菜",
        nameEn: "At the Restaurant",
        icon: "🥢",
        desc: "Aprende a pedir la carta, ordenar platos típicos y pedir la cuenta.",
        descEn: "Learn to ask for the menu, order typical dishes, and ask for the bill.",
        turns: [
            {
                speaker: "服务员 (Camarero)",
                hanzi: "您好！欢迎光临，请问几位？",
                pinyin: "Nín hǎo! Huānyíng guānglín, qǐngwèn jǐ wèi?",
                meaning: "¡Hola! Bienvenidos, ¿cuántas personas son?",
                meaningEn: "Hello! Welcome, how many people?",
                cultureTip: "En China, '几位' (jǐ wèi) es la forma cortés de preguntar cuántos comensales son utilizando el clasificador de respeto '位'.",
                cultureTipEn: "In China, '几位' (jǐ wèi) is the polite way to ask how many guests using the honorific classifier '位'.",
                options: [
                    {
                        hanzi: "两位，请给我们一张靠窗的桌子。",
                        pinyin: "Liǎng wèi, qǐng gěi wǒmen yī zhāng kào chuāng de zhuōzi.",
                        meaning: "Dos personas, por favor denos una mesa junto a la ventana.",
                        meaningEn: "Two people, please give us a table near the window.",
                        score: 100
                    },
                    {
                        hanzi: "两个人，我们要吃饭。",
                        pinyin: "Liǎng gè rén, wǒmen yào chīfàn.",
                        meaning: "Dos personas, queremos comer.",
                        meaningEn: "Two people, we want to eat.",
                        score: 70
                    }
                ]
            },
            {
                speaker: "服务员 (Camarero)",
                hanzi: "好的，请坐！这是菜单，请问想吃点什么？",
                pinyin: "Hǎo de, qǐng zuò! Zhè shì càidān, qǐngwèn xiǎng chī diǎn shénme?",
                meaning: "Muy bien, ¡tomen asiento! Aquí está el menú, ¿qué desean comer?",
                meaningEn: "Alright, please sit down! Here is the menu, what would you like to eat?",
                cultureTip: "Los platos en China suelen pedirse para compartir al centro de la mesa.",
                cultureTipEn: "Dishes in China are usually ordered to share in the center of the table.",
                options: [
                    {
                        hanzi: "我们要一份宫保鸡丁，一碗米饭和一壶茉莉花茶。",
                        pinyin: "Wǒmen yào yī fèn gōngbǎo jīdīng, yī wǎn mǐfàn hé yī hú mòlìhuā chá.",
                        meaning: "Queremos una porción de pollo Kung Pao, un tazón de arroz y una tetera de té de jazmín.",
                        meaningEn: "We want a portion of Kung Pao chicken, a bowl of rice, and a pot of jasmine tea.",
                        score: 100
                    },
                    {
                        hanzi: "有水吗？我不饿。",
                        pinyin: "Yǒu shuǐ ma? Wǒ bù è.",
                        meaning: "¿Hay agua? No tengo hambre.",
                        meaningEn: "Is there water? I'm not hungry.",
                        score: 50
                    }
                ]
            },
            {
                speaker: "服务员 (Camarero)",
                hanzi: "好的！请问宫保鸡丁需要微辣还是不要辣？",
                pinyin: "Hǎo de! Qǐngwèn gōngbǎo jīdīng xūyào wēilà háishì bù yào là?",
                meaning: "¡De acuerdo! ¿El pollo Kung Pao lo desean poco picante o nada picante?",
                meaningEn: "Alright! Would you like the Kung Pao chicken mildly spicy or not spicy at all?",
                cultureTip: "'微辣' (wēilà - poco picante) es ideal para extranjeros no acostumbrados al picante de Sichuan.",
                cultureTipEn: "'微辣' (wēilà - mildly spicy) is ideal for foreigners not accustomed to Sichuan spice.",
                options: [
                    {
                        hanzi: "微辣就好，谢谢！我们不要太辣。",
                        pinyin: "Wēilà jiù hǎo, xièxie! Wǒmen bù yào tài là.",
                        meaning: "Poco picante está bien, ¡gracias! No lo queremos muy picante.",
                        meaningEn: "Mildly spicy is fine, thanks! We don't want it too spicy.",
                        score: 100
                    },
                    {
                        hanzi: "我不喜欢吃鸡肉。",
                        pinyin: "Wǒ bù xǐhuan chī jīròu.",
                        meaning: "No me gusta comer pollo.",
                        meaningEn: "I don't like eating chicken.",
                        score: 40
                    }
                ]
            },
            {
                speaker: "服务员 (Camarero)",
                hanzi: "菜都上齐了，请慢用！有需要请随时叫我。",
                pinyin: "Cài dōu shàng qí le, qǐng màn yòng! Yǒu xūyào qǐng suíshí jiào wǒ.",
                meaning: "Todos los platos están servidos, ¡buen provecho! Si necesitan algo, llámenme.",
                meaningEn: "All dishes are served, enjoy your meal! Call me anytime if you need anything.",
                cultureTip: "'买单' (mǎidān) o '结账' (jiézhàng) son las expresiones universales para pedir la cuenta.",
                cultureTipEn: "'买单' (mǎidān) or '结账' (jiézhàng) are the universal expressions to ask for the check.",
                options: [
                    {
                        hanzi: "服务员，买单！请问可以用微信支付吗？",
                        pinyin: "Fúwùyuán, mǎidān! Qǐngwèn kěyǐ yòng Wēixìn zhīfù ma?",
                        meaning: "¡Camarero, la cuenta! ¿Se puede pagar con WeChat Pay?",
                        meaningEn: "Waiter, the bill please! Can we pay with WeChat Pay?",
                        score: 100
                    },
                    {
                        hanzi: "谢谢，再见！",
                        pinyin: "Xièxie, zàijiàn!",
                        meaning: "Gracias, ¡adiós!",
                        meaningEn: "Thanks, goodbye!",
                        score: 60
                    }
                ]
            }
        ]
    },
    {
        id: "train-ticket",
        name: "买高铁票",
        nameEn: "Buying High-Speed Train Tickets",
        icon: "🚄",
        desc: "Compra billetes de tren bala de Beijing a Shanghai y elige horario.",
        descEn: "Buy bullet train tickets from Beijing to Shanghai and choose departure time.",
        turns: [
            {
                speaker: "售票员 (Ventanilla)",
                hanzi: "您好，请问您想买去哪里的车票？",
                pinyin: "Nín hǎo, qǐngwèn nín xiǎng mǎi qù nǎlǐ de chēpiào?",
                meaning: "Hola, ¿para dónde desea comprar su billete de tren?",
                meaningEn: "Hello, where would you like to buy your train ticket to?",
                cultureTip: "El tren de alta velocidad en China se llama '高铁' (gāotiě) y las estaciones son enormes y modernas.",
                cultureTipEn: "High-speed rail in China is called '高铁' (gāotiě) and stations are modern and massive.",
                options: [
                    {
                        hanzi: "我要买两张明天上午去上海的高铁票。",
                        pinyin: "Wǒ yào mǎi liǎng zhāng míngtiān shàngwǔ qù Shànghǎi de gāotiě piào.",
                        meaning: "Quiero comprar dos billetes de tren bala para ir a Shanghai mañana por la mañana.",
                        meaningEn: "I want to buy two bullet train tickets to Shanghai for tomorrow morning.",
                        score: 100
                    },
                    {
                        hanzi: "我去火车站。",
                        pinyin: "Wǒ qù huǒchēzhàn.",
                        meaning: "Voy a la estación de tren.",
                        meaningEn: "I'm going to the train station.",
                        score: 50
                    }
                ]
            },
            {
                speaker: "售票员 (Ventanilla)",
                hanzi: "明天早上九点有一趟G1次列车，请问要一等座还是二等座？",
                pinyin: "Míngtiān zǎoshang jiǔ diǎn yǒu yī tàng G1 cì lièchē, qǐngwèn yào yīděngzuò háishì èrděngzuò?",
                meaning: "Mañana a las 9 AM sale el tren G1, ¿desea asiento de primera clase o de segunda?",
                meaningEn: "Tomorrow at 9 AM train G1 departs, would you like first class or second class?",
                cultureTip: "Los asientos '二等座' (segunda clase) son muy cómodos y económicos.",
                cultureTipEn: "'二等座' (second class) seats are very comfortable and economical.",
                options: [
                    {
                        hanzi: "我们要二等座，请问两张票一共多少钱？",
                        pinyin: "Wǒmen yào èrděngzuò, qǐngwèn liǎng zhāng piào yīgòng duōshao qián?",
                        meaning: "Queremos segunda clase, ¿cuánto cuestan los dos billetes en total?",
                        meaningEn: "We want second class, how much are the two tickets in total?",
                        score: 100
                    },
                    {
                        hanzi: "我不坐火车了。",
                        pinyin: "Wǒ bù zuò huǒchē le.",
                        meaning: "Ya no tomaré el tren.",
                        meaningEn: "I won't take the train anymore.",
                        score: 30
                    }
                ]
            }
        ]
    },
    {
        id: "market",
        name: "在市场买水果与讲价",
        nameEn: "At the Market & Bargaining",
        icon: "🍎",
        desc: "Pregunta precios, negocia un descuento amistoso y compra fruta fresca.",
        descEn: "Ask prices, negotiate a friendly discount, and buy fresh fruit.",
        turns: [
            {
                speaker: "摊主 (Vendedor)",
                hanzi: "来看看新鲜的苹果和西瓜！帅哥/美女，想买点什么水果？",
                pinyin: "Lái kànkan xīnxiān de píngguǒ hé xīguā! Shuàigē / Měinǚ, xiǎng mǎi diǎn shénme shuǐguǒ?",
                meaning: "¡Vengan a ver manzanas y sandías frescas! Joven / Señorita, ¿qué fruta desea comprar?",
                meaningEn: "Come check out fresh apples and watermelons! What fruit would you like to buy?",
                cultureTip: "Llamar '帅哥' (guapo) o '美女' (guapa) a los clientes es muy común y amistoso en los mercados de China.",
                cultureTipEn: "Calling customers '帅哥' (handsome) or '美女' (beauty) is friendly and ubiquitous in Chinese markets.",
                options: [
                    {
                        hanzi: "老板，请问这个西瓜多少钱一斤？甜不甜？",
                        pinyin: "Lǎobǎn, qǐngwèn zhège xīguā duōshao qián yī jīn? Tián bù tián?",
                        meaning: "Jefe, ¿cuánto cuesta el medio kilo de esta sandía? ¿Es dulce?",
                        meaningEn: "Boss, how much is this watermelon per 500g? Is it sweet?",
                        score: 100
                    },
                    {
                        hanzi: "我不买西瓜。",
                        pinyin: "Wǒ bù mǎi xīguā.",
                        meaning: "No compro sandía.",
                        meaningEn: "I don't buy watermelon.",
                        score: 50
                    }
                ]
            },
            {
                speaker: "摊主 (Vendedor)",
                hanzi: "保证非常甜！三块钱一斤，一个大概十斤，三十块钱。",
                pinyin: "Bǎozhèng fēicháng tián! Sān kuài qián yī jīn, yī gè dàgài shí jīn, sānshí kuài qián.",
                meaning: "¡Garantizado muy dulce! Tres yuanes el medio kilo, una sandía pesa unos 5 kilos, son treinta yuanes.",
                meaningEn: "Guaranteed very sweet! Three yuan per 500g, one is about 5kg, total thirty yuan.",
                cultureTip: "1 斤 (jīn) en China continental equivale exactamente a 500 gramos.",
                cultureTipEn: "1 斤 (jīn) in mainland China is exactly 500 grams.",
                options: [
                    {
                        hanzi: "太贵了，老板！二十五块钱卖不卖？我下次还来！",
                        pinyin: "Tài guì le, lǎobǎn! Èrshíwǔ kuài qián mài bù mài? Wǒ xià cì hái lái!",
                        meaning: "¡Está muy caro, jefe! ¿Me lo deja en 25 yuanes? ¡Volveré la próxima vez!",
                        meaningEn: "Too expensive, boss! Will you sell it for 25 yuan? I'll come back next time!",
                        score: 100
                    },
                    {
                        hanzi: "三十块钱太便宜了。",
                        pinyin: "Sānshí kuài qián tài piányi le.",
                        meaning: "Treinta yuanes es demasiado barato.",
                        meaningEn: "Thirty yuan is too cheap.",
                        score: 40
                    }
                ]
            }
        ]
    }
];

class DialogueTutorGame {
    constructor(app) {
        this.app = app;
        this.currentScenario = HSK_DIALOGUE_SCENARIOS[0];
        this.currentTurnIndex = 0;
        this.chatHistory = [];
        this.totalScore = 0;
        this.earnedScore = 0;
        this.isListening = false;
        this.recognition = null;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderScenarioChips();
        this.loadScenario(this.currentScenario);
    }

    cacheDOM() {
        this.container = document.getElementById("dialogue-tutor");
        this.scenariosBar = document.getElementById("tutor-scenarios-bar");
        this.scenarioIcon = document.getElementById("tutor-scenario-icon");
        this.scenarioName = document.getElementById("tutor-scenario-name");
        this.scenarioDesc = document.getElementById("tutor-scenario-desc");
        this.fluencyScore = document.getElementById("tutor-fluency-score");
        this.chatFeed = document.getElementById("tutor-chat-feed");
        this.replySection = document.getElementById("tutor-reply-section");
        this.replyOptions = document.getElementById("tutor-reply-options");
        this.micBtn = document.getElementById("tutor-mic-btn");
        this.finishedBanner = document.getElementById("tutor-finished-banner");
        this.replayBtn = document.getElementById("tutor-replay-btn");
        this.nextScenarioBtn = document.getElementById("tutor-next-scenario-btn");
    }

    bindEvents() {
        if (this.micBtn) {
            this.micBtn.addEventListener("click", () => this.toggleSpeechRecognition());
        }

        if (this.replayBtn) {
            this.replayBtn.addEventListener("click", () => this.loadScenario(this.currentScenario));
        }

        if (this.nextScenarioBtn) {
            this.nextScenarioBtn.addEventListener("click", () => {
                const currentIdx = HSK_DIALOGUE_SCENARIOS.findIndex((s) => s.id === this.currentScenario.id);
                const nextIdx = (currentIdx + 1) % HSK_DIALOGUE_SCENARIOS.length;
                this.loadScenario(HSK_DIALOGUE_SCENARIOS[nextIdx]);
                this.renderScenarioChips();
            });
        }
    }

    renderScenarioChips() {
        if (!this.scenariosBar) return;
        this.scenariosBar.innerHTML = HSK_DIALOGUE_SCENARIOS.map((scenario) => {
            const isActive = scenario.id === this.currentScenario.id;
            return `
                <button type="button" class="tutor-scenario-chip ${isActive ? "active" : ""}" data-scenario-id="${scenario.id}">
                    <span>${scenario.icon}</span>
                    <span>${scenario.name}</span>
                </button>
            `;
        }).join("");

        this.scenariosBar.querySelectorAll(".tutor-scenario-chip").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-scenario-id");
                const found = HSK_DIALOGUE_SCENARIOS.find((s) => s.id === id);
                if (found) {
                    this.loadScenario(found);
                    this.renderScenarioChips();
                }
            });
        });
    }

    loadScenario(scenario) {
        this.currentScenario = scenario;
        this.currentTurnIndex = 0;
        this.chatHistory = [];
        this.totalScore = 0;
        this.earnedScore = 0;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.scenarioIcon) this.scenarioIcon.textContent = scenario.icon;
        if (this.scenarioName) this.scenarioName.textContent = isEs ? scenario.name : (scenario.nameEn || scenario.name);
        if (this.scenarioDesc) this.scenarioDesc.textContent = isEs ? scenario.desc : (scenario.descEn || scenario.desc);
        if (this.fluencyScore) this.fluencyScore.textContent = "100%";

        if (this.finishedBanner) this.finishedBanner.style.display = "none";
        if (this.replySection) this.replySection.style.display = "block";
        if (this.chatFeed) this.chatFeed.innerHTML = "";

        this.processTurn();
    }

    processTurn() {
        const turn = this.currentScenario.turns[this.currentTurnIndex];
        if (!turn) {
            this.finishScenario();
            return;
        }

        // Add bot message to chat
        this.appendBotMessage(turn);

        // Auto-play bot audio
        this.app.audioController?.playWordAudio?.(turn.hanzi);

        // Render reply options
        this.renderReplyOptions(turn);
    }

    appendBotMessage(turn) {
        if (!this.chatFeed) return;
        const isEs = this.app?.currentLanguage !== "en";
        const meaning = isEs ? turn.meaning : (turn.meaningEn || turn.meaning);
        const tip = isEs ? turn.cultureTip : (turn.cultureTipEn || turn.cultureTip);

        const msgEl = document.createElement("div");
        msgEl.className = "tutor-chat-message bot";
        msgEl.innerHTML = `
            <div class="tutor-bubble">
                <div class="tutor-bubble-speaker">${turn.speaker}</div>
                <div class="tutor-bubble-hanzi">${turn.hanzi}</div>
                <div class="tutor-bubble-pinyin">${turn.pinyin}</div>
                <div class="tutor-bubble-meaning">${meaning}</div>
                <button type="button" class="tutor-play-btn" title="Escuchar">🔊</button>
            </div>
            ${tip ? `<div class="tutor-culture-tip"><span>💡</span> <div>${tip}</div></div>` : ""}
        `;

        const playBtn = msgEl.querySelector(".tutor-play-btn");
        if (playBtn) {
            playBtn.addEventListener("click", () => this.app.audioController?.playWordAudio?.(turn.hanzi));
        }

        this.chatFeed.appendChild(msgEl);
        this.scrollToBottom();
    }

    appendUserMessage(option) {
        if (!this.chatFeed) return;
        const isEs = this.app?.currentLanguage !== "en";
        const meaning = isEs ? option.meaning : (option.meaningEn || option.meaning);

        const msgEl = document.createElement("div");
        msgEl.className = "tutor-chat-message user";
        msgEl.innerHTML = `
            <div class="tutor-bubble">
                <div class="tutor-bubble-speaker">Tú (我)</div>
                <div class="tutor-bubble-hanzi">${option.hanzi}</div>
                <div class="tutor-bubble-pinyin">${option.pinyin}</div>
                <div class="tutor-bubble-meaning">${meaning}</div>
                <button type="button" class="tutor-play-btn" title="Escuchar">🔊</button>
            </div>
        `;

        const playBtn = msgEl.querySelector(".tutor-play-btn");
        if (playBtn) {
            playBtn.addEventListener("click", () => this.app.audioController?.playWordAudio?.(option.hanzi));
        }

        this.chatFeed.appendChild(msgEl);
        this.scrollToBottom();
    }

    renderReplyOptions(turn) {
        if (!this.replyOptions) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.replyOptions.innerHTML = turn.options.map((opt, idx) => {
            const meaning = isEs ? opt.meaning : (opt.meaningEn || opt.meaning);
            return `
                <button type="button" class="tutor-reply-card" data-opt-idx="${idx}">
                    <span class="tutor-reply-hanzi">${opt.hanzi}</span>
                    <span class="tutor-reply-pinyin">${opt.pinyin}</span>
                    <span class="tutor-reply-meaning">${meaning}</span>
                </button>
            `;
        }).join("");

        this.replyOptions.querySelectorAll(".tutor-reply-card").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-opt-idx"), 10);
                const selectedOpt = turn.options[idx];
                if (selectedOpt) {
                    this.handleUserReply(selectedOpt);
                }
            });
        });
    }

    handleUserReply(option) {
        this.totalScore += 100;
        this.earnedScore += option.score || 100;

        const currentFluency = Math.round((this.earnedScore / this.totalScore) * 100);
        if (this.fluencyScore) this.fluencyScore.textContent = `${currentFluency}%`;

        this.appendUserMessage(option);
        this.app.audioController?.playWordAudio?.(option.hanzi);

        if (this.replyOptions) this.replyOptions.innerHTML = "";

        this.currentTurnIndex += 1;
        setTimeout(() => {
            this.processTurn();
        }, 1200);
    }

    finishScenario() {
        if (this.replySection) this.replySection.style.display = "none";
        if (this.finishedBanner) this.finishedBanner.style.display = "block";

        const fluency = Math.round((this.earnedScore / this.totalScore) * 100);
        if (this.app?.achievementManager) {
            this.app.achievementManager.unlock?.("tutor-master");
            if (fluency >= 90) {
                this.app.achievementManager.fireConfetti?.();
            }
        }
        this.app.audioController?.playChime?.(587.33);
        this.app?.homeController?.markQuestCompleted?.("tutor");
    }

    scrollToBottom() {
        if (this.chatFeed) {
            this.chatFeed.scrollTop = this.chatFeed.scrollHeight;
        }
    }

    toggleSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            this.app.showToast("El reconocimiento de voz no está soportado en este navegador", "error");
            return;
        }

        if (this.isListening) {
            this.recognition?.stop();
            this.isListening = false;
            if (this.micBtn) this.micBtn.classList.remove("listening");
            return;
        }

        try {
            this.recognition = new SpeechRec();
            this.recognition.lang = "zh-CN";
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.micBtn) this.micBtn.classList.add("listening");
                this.app.showToast("🎙️ Escuchando... Di una de las opciones en mandarín", "info", 2000);
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.matchTranscriptWithOption(transcript);
            };

            this.recognition.onerror = () => {
                this.isListening = false;
                if (this.micBtn) this.micBtn.classList.remove("listening");
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.micBtn) this.micBtn.classList.remove("listening");
            };

            this.recognition.start();
        } catch (e) {
            this.app.logWarn("Speech recognition error:", e);
        }
    }

    matchTranscriptWithOption(transcript) {
        const turn = this.currentScenario.turns[this.currentTurnIndex];
        if (!turn) return;

        const cleanTranscript = transcript.replace(/[^\u3400-\u9fff]/g, "");
        let bestMatch = turn.options[0];
        let bestScore = -1;

        turn.options.forEach((opt) => {
            const cleanOpt = opt.hanzi.replace(/[^\u3400-\u9fff]/g, "");
            let commonChars = 0;
            for (const char of cleanTranscript) {
                if (cleanOpt.includes(char)) commonChars += 1;
            }
            if (commonChars > bestScore) {
                bestScore = commonChars;
                bestMatch = opt;
            }
        });

        this.app.showToast(`🎙️ Detectado: "${transcript}"`, "success", 1800);
        this.handleUserReply(bestMatch);
    }
}

window.DialogueTutorGame = DialogueTutorGame;
