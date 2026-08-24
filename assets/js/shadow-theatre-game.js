// shadow-theatre-game.js — Motor del Teatro de Sombras y Leyendas Chinas

const SHADOW_TALES_DATABASE = [
    {
        id: "hou-yi",
        title: "《后羿射日》 (Hou Yi y los Diez Soles)",
        titleEn: "Hou Yi Shoots the Suns (Hòuyì Shè Rì)",
        icon: "🏹",
        moral: "La valentía, la perseverancia y la destreza puesta al servicio de la comunidad pueden superar las adversidades más abrumadoras.",
        moralEn: "Courage, dedication and mastery serving the community can overcome even the most overwhelming catastrophes.",
        chengyu: {
            hanzi: "拔苗助长",
            pinyin: "bá miáo zhù zhǎng",
            meaning: "Tratar de forzar el crecimiento de algo arruina su desarrollo natural. Enseña paciencia y armonía.",
            meaningEn: "Trying to pull up sprouts to help them grow spoils natural development. Teaches patience."
        },
        quiz: {
            question: "¿Por qué Hou Yi decidió disparar a los soles con su arco mágico?",
            questionEn: "Why did Hou Yi decide to shoot down the suns with his bow?",
            options: [
                { text: "Porque 10 soles quemaban la tierra y secaban los ríos", isCorrect: true },
                { text: "Porque quería que siempre fuera de noche", isCorrect: false },
                { text: "Para competir con otros arqueros de la aldea", isCorrect: false }
            ]
        },
        scenes: [
            {
                actor: "☀️",
                backdrop: "🔥🌵🌾",
                hanzi: "很久很久以前，天上有十个太阳，大地干旱，河流干枯。",
                pinyin: "Hěnjiǔ hěnjiǔ yǐqián, tiānshang yǒu shí gè tàiyáng, dàdì gānhàn, héliú gānkū.",
                trans: "Hace mucho tiempo, había 10 soles en el cielo, la tierra sufría sequía y los ríos se secaron.",
                transEn: "Long ago, there were 10 suns in the sky, drought scorched the earth and rivers dried up."
            },
            {
                actor: "🏹",
                backdrop: "⛰️🎯",
                hanzi: "神箭手后羿登上了昆仑山顶，拉开了巨大的神弓。",
                pinyin: "Shénjiànshǒu Hòuyì dēngshangle Kūnlún shāndǐng, lākāile jùdà de shéngōng.",
                trans: "El arquero legendario Hou Yi subió a la cumbre del monte Kunlun y tensó su gran arco divino.",
                transEn: "The legendary archer Hou Yi climbed Mount Kunlun and drew his mighty divine bow."
            },
            {
                actor: "🎯",
                backdrop: "⚡💥",
                hanzi: "他一箭又一箭，精准地射下了九个太阳。",
                pinyin: "Tā yī jiàn yòu yī jiàn, jīngzhǔn de shèxiàle jiǔ gè tàiyáng.",
                trans: "Flecha tras flecha, derribó con precisión milimétrica a nueve de los diez soles.",
                transEn: "Arrow after arrow, he accurately shot down nine of the scorching suns."
            },
            {
                actor: "🌸",
                backdrop: "🌱💧🌈",
                hanzi: "留下一颗温暖的太阳，大地恢复了生机与繁荣。",
                pinyin: "Liúxià yī kē wēnnuǎn de tàiyáng, dàdì huìfùle shēngjī yǔ fánróng.",
                trans: "Dejó un solo sol cálido en el cielo, y la tierra recuperó la vida y la prosperidad.",
                transEn: "Leaving one warm sun behind, the earth regained vibrant life and prosperity."
            }
        ]
    },
    {
        id: "nian-monster",
        title: "《年兽的传说》 (La Leyenda del Monstruo Nian)",
        titleEn: "Legend of the Nian Monster (Niánshòu de Chuánshuō)",
        icon: "🦁",
        moral: "La unión colectiva y la sabiduría ancestral transforman el miedo en una celebración eterna de alegría y renovación.",
        moralEn: "Collective unity and ancestral wisdom transform ancient fear into an everlasting celebration of joy.",
        chengyu: {
            hanzi: "辞旧迎新",
            pinyin: "cí jiù yíng xīn",
            meaning: "Despedir lo viejo y dar la bienvenida a lo nuevo con esperanza y purificación.",
            meaningEn: "Bid farewell to the old and usher in the brand new."
        },
        quiz: {
            question: "¿Qué tres cosas aterrorizaban al monstruo Nian cada víspera de año nuevo?",
            questionEn: "What three things terrified the Nian beast on New Year's Eve?",
            options: [
                { text: "El color rojo, el fuego brillante y el ruido de los petardos", isCorrect: true },
                { text: "El agua fría, la nieve y las espadas de bronce", isCorrect: false },
                { text: "Los tambores gigantes y las canciones solemnes", isCorrect: false }
            ]
        },
        scenes: [
            {
                actor: "🌊",
                backdrop: "🌑👹",
                hanzi: "深海里住着凶猛的怪兽‘年’，每逢除夕便上岸伤人。",
                pinyin: "Shēnhǎi lǐ zhùzhe xiōngměng de guàishòu 'Nián', měiféng Chúxī biàn shàng'àn shāngrén.",
                trans: "En las profundidades del mar vivía la temible bestia 'Nian', que emergía en la víspera de año nuevo.",
                transEn: "In the deep sea lived the ferocious beast 'Nian', who surfaced every New Year's Eve."
            },
            {
                actor: "👴",
                backdrop: "🏮📜",
                hanzi: "一位白发老人告诉村民：年兽最怕红色、火光和巨响。",
                pinyin: "Yī wèi bái fà lǎorén gàosù cūnmín: Niánshòu zuì pà hóngsè, huǒguāng hé jùxiǎng.",
                trans: "Un sabio anciano reveló a la aldea: Nian le teme al color rojo, a las llamas y a los estruendos.",
                transEn: "A wise elder told villagers: Nian fears the red color, bright fire, and loud noises."
            },
            {
                actor: "🧨",
                backdrop: "🏮🎇✨",
                hanzi: "大家贴红春联，放爆竹，年兽吓得落荒而逃，再不敢来。",
                pinyin: "Dàjiā tiē hóng chūnlián, fàng bàozhú, Niánshòu xià de luòhuāng'értáo, zài bù gǎn lái.",
                trans: "Colgaron coplas rojas y encendieron petardos; Nian huyó aterrado para no volver jamás.",
                transEn: "They put up red couplets and set off firecrackers; Nian fled in terror never to return."
            },
            {
                actor: "🥟",
                backdrop: "🎊🎉",
                hanzi: "从此人们把这一天叫做‘过年’，庆祝平安与吉祥。",
                pinyin: "Cóngcǐ rénmen bǎ zhè yī tiān jiàozuò 'Guònián', qìngzhù píng'ān yǔ jíxiáng.",
                trans: "Desde entonces, celebramos el Año Nuevo ('Guonian') con alegría, prosperidad y paz.",
                transEn: "Ever since, people call this day 'Guonian', celebrating safety, peace and good fortune."
            }
        ]
    },
    {
        id: "monkey-king",
        title: "《美猴王》 (El Rey Mono - Sun Wukong)",
        titleEn: "The Monkey King (Měi Hóuwáng)",
        icon: "🐒",
        moral: "La curiosidad insaciable y el ingenio no tienen límites cuando van acompañados de lealtad y rectitud.",
        moralEn: "Boundless curiosity, cleverness and courage know no limits when guided by loyalty.",
        chengyu: {
            hanzi: "火眼金睛",
            pinyin: "huǒ yǎn jīn jīng",
            meaning: "Ojos de fuego y pupilas de oro: la habilidad de ver a través de los engaños y discernir la verdad.",
            meaningEn: "Eyes of fire and gold: the keen ability to see through deception and discern truth."
        },
        quiz: {
            question: "¿De dónde nació el legendario Rey Mono Sun Wukong?",
            questionEn: "Where was the legendary Monkey King Sun Wukong born from?",
            options: [
                { text: "De una piedra mágica inmortal en la Montaña Huaguo", isCorrect: true },
                { text: "De una semilla dorada del Árbol de Melocotones del Cielo", isCorrect: false },
                { text: "De un rayo celestial sobre el Palacio de Jade", isCorrect: false }
            ]
        },
        scenes: [
            {
                actor: "🪨",
                backdrop: "✨⛰️🐒",
                hanzi: "花果山上一块仙石迸裂，诞生了一只聪明灵巧的石猴。",
                pinyin: "Huāguǒ Shān shàng yī kuài xiānshí bèngliè, dànshēngle yī zhī cōngmíng língqiǎo de shíhóu.",
                trans: "En la Montaña Huaguo, una roca sagrada se abrió, naciendo un mono de piedra extraordinario.",
                transEn: "On Mount Huaguo, a sacred stone cracked open, giving birth to a brilliant stone monkey."
            },
            {
                actor: "👑",
                backdrop: "🌊🏞️",
                hanzi: "他第一个跳进水帘洞，被万千猴群尊奉为‘美猴王’。",
                pinyin: "Tā dì-yī gè tiàojìn Shuǐliándòng, bèi wànqiān hóuqún zūnfèng wéi 'Měi Hóuwáng'.",
                trans: "Fue el primero en saltar la cascada hacia la Cueva de la Cortina de Agua y fue coronado rey.",
                transEn: "He bravely leapt through the waterfall into the Water Curtain Cave and was crowned king."
            },
            {
                actor: "🪄",
                backdrop: "🐉🌊✨",
                hanzi: "他从东海龙宫获得了重达一万三千五百斤的如意金箍棒。",
                pinyin: "Tā cóng Dōnghǎi Lónggōng huòdéle zhòng dá yī wàn sān qiān wǔ bǎi jīn de Rúyì Jīngūbàng.",
                trans: "En el Palacio del Dragón consiguió su bastón mágico dorado Ruyi Jingu Bang.",
                transEn: "From the East Sea Dragon Palace, he obtained his 13,500-pound magical golden staff."
            },
            {
                actor: "☁️",
                backdrop: "🏯🌈☁️",
                hanzi: "驾驭筋斗云，一个筋斗便可行十万八千里，威震四海。",
                pinyin: "Jiàyù Jīndǒuyún, yī gè jīndǒu biàn kě xíng shí wàn bā qiān lǐ, wēizhèn sìhǎi.",
                trans: "Surcando la Nube Voladora, viaja miles de leguas de un salto, protegiendo a los suyos.",
                transEn: "Riding the Somersault Cloud, he travels 108,000 miles in a single leap with legendary bravery."
            }
        ]
    },
    {
        id: "wait-rabbit",
        title: "《守株待兔》 (Esperar al Conejo junto al Árbol)",
        titleEn: "Waiting for a Rabbit by a Tree (Shǒu Zhū Dài Tù)",
        icon: "🐢",
        moral: "No se puede confiar en la suerte o la casualidad; el verdadero éxito proviene del trabajo constante y el esfuerzo propio.",
        moralEn: "One cannot rely on pure luck; true achievement comes from diligence and dedicated effort.",
        chengyu: {
            hanzi: "守株待兔",
            pinyin: "shǒu zhū dài tù",
            meaning: "Esperar sentado a que la suerte te dé todo sin trabajar ni esforzarte.",
            meaningEn: "To wait passively for a stroke of luck instead of working hard."
        },
        quiz: {
            question: "¿Por qué el campesino dejó de cultivar su campo en la fábula?",
            questionEn: "Why did the farmer stop farming his fields in the fable?",
            options: [
                { text: "Esperaba que otro conejo chocara contra el árbol por pura suerte", isCorrect: true },
                { text: "Porque se rompió su azadón de hierro", isCorrect: false },
                { text: "Porque comenzó la temporada de invierno", isCorrect: false }
            ]
        },
        scenes: [
            {
                actor: "🌾",
                backdrop: "👨‍🌾🚜",
                hanzi: "古代宋国有一个农夫，每天在田地里辛苦地耕作。",
                pinyin: "Gǔdài Sòng guó yǒu yī gè nóngfū, měitiān zài tiándì lǐ xīnkǔ de gēngzuò.",
                trans: "En el antiguo estado de Song, un campesino trabajaba duramente sus campos cada día.",
                transEn: "In the ancient State of Song, a farmer worked hard in his fields every single day."
            },
            {
                actor: "🐇",
                backdrop: "🌳💥😵",
                hanzi: "一只跑得太快的野兔不小心撞在树桩上，倒地身亡。",
                pinyin: "Yī zhī pǎo de tài kuài de yětù bù xiǎoxīn zhuàng zài shùzhuāng shàng, dǎodì shēnwáng.",
                trans: "Un conejo que corría veloz chocó sin querer contra el tronco de un árbol y cayó.",
                transEn: "A swift wild rabbit accidentally crashed into a tree stump and fell down."
            },
            {
                actor: "💤",
                backdrop: "🌳🪑",
                hanzi: "农夫高兴地捡起兔子，从此放下农具，天天守在树旁等兔子。",
                pinyin: "Nóngfū gāoxìng de jiǎnqǐ tùzi, cóngcǐ fàngxià nóngjù, tiāntiān shǒu zài shù páng děng tùzi.",
                trans: "El campesino se alegró tanto que abandonó el azadón para sentarse a esperar otro conejo.",
                transEn: "The farmer picked up the rabbit happily, dropped his hoe and waited by the tree forever."
            },
            {
                actor: "🥀",
                backdrop: "🍂🌾",
                hanzi: "他再也没有等到第二只兔子，田里的庄稼却全部荒芜了。",
                pinyin: "Tā zài yě méiyǒu děngdào dì-èr zhī tùzi, tián lǐ de zhuāngjia què quánbù huāngwúle.",
                trans: "Nunca volvió a aparecer otro conejo, y todas sus cosechas se marchitaron por descuido.",
                transEn: "No other rabbit ever came, and his untended crops withered away completely."
            }
        ]
    }
];

class ShadowTheatreGame {
    constructor(app) {
        this.app = app;
        this.currentTale = SHADOW_TALES_DATABASE[0];
        this.currentSceneIdx = 0;
        this.isAutoplaying = false;
        this.autoplayTimer = null;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderStoryChips();
        this.loadTale(this.currentTale);
    }

    cacheDOM() {
        this.container = document.getElementById("shadow-theatre");
        this.chipsContainer = document.getElementById("shadow-story-chips");

        this.actorWrap = document.getElementById("puppet-silhouette-wrap");
        this.actorEmoji = document.getElementById("stage-actor-emoji");
        this.sceneBackdrop = document.getElementById("stage-scene-backdrop");

        this.captionHanzi = document.getElementById("stage-caption-hanzi");
        this.captionPinyin = document.getElementById("stage-caption-pinyin");
        this.captionTrans = document.getElementById("stage-caption-trans");

        this.prevBtn = document.getElementById("shadow-prev-scene-btn");
        this.nextBtn = document.getElementById("shadow-next-scene-btn");
        this.playBtn = document.getElementById("shadow-play-scene-btn");
        this.autoplayBtn = document.getElementById("shadow-autoplay-btn");
        this.sceneIndicator = document.getElementById("shadow-scene-indicator");

        this.moralContent = document.getElementById("tale-moral-content");
        this.chengyuBox = document.getElementById("tale-chengyu-box");

        this.quizQuestion = document.getElementById("tale-quiz-question");
        this.quizOptions = document.getElementById("tale-quiz-options");
        this.quizFeedback = document.getElementById("tale-quiz-feedback");
    }

    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", () => {
                this.stopAutoplay();
                this.goToPrevScene();
            });
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => {
                this.stopAutoplay();
                this.goToNextScene();
            });
        }
        if (this.playBtn) {
            this.playBtn.addEventListener("click", () => this.narrateCurrentScene());
        }
        if (this.autoplayBtn) {
            this.autoplayBtn.addEventListener("click", () => this.toggleAutoplay());
        }
    }

    toggleAutoplay() {
        if (this.isAutoplaying) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    startAutoplay() {
        this.isAutoplaying = true;
        if (this.autoplayBtn) this.autoplayBtn.classList.add("playing");
        this.runAutoplayStep();
    }

    stopAutoplay() {
        this.isAutoplaying = false;
        if (this.autoplayTimer) clearTimeout(this.autoplayTimer);
        if (this.autoplayBtn) this.autoplayBtn.classList.remove("playing");
    }

    runAutoplayStep() {
        if (!this.isAutoplaying) return;
        this.narrateCurrentScene();

        this.autoplayTimer = setTimeout(() => {
            if (!this.isAutoplaying) return;
            if (this.currentSceneIdx < this.currentTale.scenes.length - 1) {
                this.goToNextScene();
                this.runAutoplayStep();
            } else {
                this.stopAutoplay();
                this.app?.showToast?.("Fin del relato tradicional.", "success", 2000);
            }
        }, 5500);
    }

    renderStoryChips() {
        if (!this.chipsContainer) return;
        this.chipsContainer.innerHTML = SHADOW_TALES_DATABASE.map((tale) => {
            const isActive = tale.id === this.currentTale.id;
            return `
                <button type="button" class="story-chip-btn ${isActive ? "active" : ""}" data-tale-id="${tale.id}">
                    <span>${tale.icon}</span>
                    <span>${tale.title}</span>
                </button>
            `;
        }).join("");

        this.chipsContainer.querySelectorAll(".story-chip-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-tale-id");
                const found = SHADOW_TALES_DATABASE.find((t) => t.id === id);
                if (found) {
                    this.loadTale(found);
                    this.renderStoryChips();
                }
            });
        });
    }

    loadTale(tale) {
        this.currentTale = tale;
        this.currentSceneIdx = 0;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.moralContent) {
            this.moralContent.textContent = isEs ? tale.moral : (tale.moralEn || tale.moral);
        }

        if (this.chengyuBox) {
            const ch = tale.chengyu;
            const meaning = isEs ? ch.meaning : (ch.meaningEn || ch.meaning);
            this.chengyuBox.innerHTML = `
                <div class="chengyu-hanzi">${ch.hanzi}</div>
                <div class="chengyu-pinyin">${ch.pinyin}</div>
                <div class="chengyu-meaning">${meaning}</div>
            `;
        }

        this.renderCurrentScene();
        this.renderQuiz();
    }

    renderCurrentScene() {
        const scene = this.currentTale.scenes[this.currentSceneIdx];
        if (!scene) return;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.actorEmoji) this.actorEmoji.textContent = scene.actor;
        if (this.sceneBackdrop) this.sceneBackdrop.textContent = scene.backdrop;

        if (this.actorWrap) {
            this.actorWrap.classList.remove("animate-pop");
            void this.actorWrap.offsetWidth; // Trigger reflow
            this.actorWrap.classList.add("animate-pop");
        }

        if (this.captionHanzi) this.captionHanzi.textContent = scene.hanzi;
        if (this.captionPinyin) this.captionPinyin.textContent = scene.pinyin;
        if (this.captionTrans) this.captionTrans.textContent = isEs ? scene.trans : (scene.transEn || scene.trans);

        if (this.sceneIndicator) {
            const total = this.currentTale.scenes.length;
            this.sceneIndicator.textContent = isEs
                ? `Escena ${this.currentSceneIdx + 1} de ${total}`
                : `Scene ${this.currentSceneIdx + 1} of ${total}`;
        }
    }

    goToPrevScene() {
        if (this.currentSceneIdx > 0) {
            this.currentSceneIdx -= 1;
            this.renderCurrentScene();
        }
    }

    goToNextScene() {
        if (this.currentSceneIdx < this.currentTale.scenes.length - 1) {
            this.currentSceneIdx += 1;
            this.renderCurrentScene();
        }
    }

    narrateCurrentScene() {
        const scene = this.currentTale.scenes[this.currentSceneIdx];
        if (!scene) return;

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(scene.hanzi);
            utter.lang = "zh-CN";
            utter.rate = 0.9;
            speechSynthesis.speak(utter);
        } else {
            this.app?.audioController?.playWordAudio?.(scene.hanzi);
        }
    }

    renderQuiz() {
        if (!this.quizQuestion || !this.quizOptions) return;
        const isEs = this.app?.currentLanguage !== "en";
        const q = this.currentTale.quiz;

        this.quizQuestion.textContent = isEs ? q.question : (q.questionEn || q.question);
        if (this.quizFeedback) this.quizFeedback.style.display = "none";

        this.quizOptions.innerHTML = q.options.map((opt, idx) => `
            <button type="button" class="tale-quiz-opt-btn" data-idx="${idx}">
                ${opt.text}
            </button>
        `).join("");

        this.quizOptions.querySelectorAll(".tale-quiz-opt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                this.handleQuizAnswer(idx);
            });
        });
    }

    handleQuizAnswer(idx) {
        const isEs = this.app?.currentLanguage !== "en";
        const opt = this.currentTale.quiz.options[idx];
        if (!opt || !this.quizFeedback) return;

        if (opt.isCorrect) {
            this.quizFeedback.className = "tale-quiz-feedback correct";
            this.quizFeedback.innerHTML = isEs
                ? "🎉 ¡Respuesta Correcta! Has captado la sabiduría de la leyenda. +50 XP"
                : "🎉 Correct Answer! You grasped the wisdom of the legend. +50 XP";
            this.quizFeedback.style.display = "block";

            this.app?.audioController?.playCorrect?.();
            this.app?.achievementManager?.fireConfetti?.();
        } else {
            this.quizFeedback.className = "tale-quiz-feedback incorrect";
            this.quizFeedback.innerHTML = isEs
                ? "❌ Intenta de nuevo y presta atención a los detalles de la historia."
                : "❌ Try again and pay close attention to the details in the tale.";
            this.quizFeedback.style.display = "block";

            this.app?.audioController?.playIncorrect?.();
        }
    }
}

window.ShadowTheatreGame = ShadowTheatreGame;
