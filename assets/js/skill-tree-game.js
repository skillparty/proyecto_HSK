// skill-tree-game.js — Motor del Mapa de Aventura y Árbol de Habilidades RPG

const HSK_ADVENTURE_ZONES = [
    {
        id: "zone-1",
        name: "La Aldea de los Primeros Trazos",
        nameEn: "Village of First Strokes",
        badge: "🏮 Zona 1: HSK 1 Inicial",
        nodes: [
            {
                id: "node-1",
                icon: "👋",
                title: "Saludos y Cortesía",
                titleEn: "Greetings & Politeness",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Cómo se dice 'Hola' en mandarín?",
                        promptEn: "How do you say 'Hello' in Mandarin?",
                        options: ["你好 (nǐ hǎo)", "再见 (zàijiàn)", "谢谢 (xièxie)", "对不起 (duìbuqǐ)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cuál es el tono de '谢' en '谢谢' (xièxie)?",
                        promptEn: "What is the tone of '谢' in '谢谢' (xièxie)?",
                        options: ["1º Tono", "2º Tono", "3º Tono", "4º Tono (Descendente)"],
                        optionsEn: ["1st Tone", "2nd Tone", "3rd Tone", "4th Tone (Falling)"],
                        correct: 3
                    },
                    {
                        prompt: "¿Cómo se responde cortésmente a '谢谢'?",
                        promptEn: "How do you politely reply to '谢谢'?",
                        options: ["不客气 (bú kèqi)", "没关系 (méi guānxi)", "我是学生 (wǒ shì xuésheng)", "很好 (hěn hǎo)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-2",
                icon: "🔢",
                title: "Números y Fechas",
                titleEn: "Numbers & Dates",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué número representa el carácter '八' (bā)?",
                        promptEn: "What number is '八' (bā)?",
                        options: ["6", "7", "8", "10"],
                        correct: 2
                    },
                    {
                        prompt: "¿Cómo se dice 'Lunes' en chino?",
                        promptEn: "How do you say 'Monday' in Chinese?",
                        options: ["星期一 (xīngqīyī)", "星期天 (xīngqītiān)", "一月 (yī yuè)", "明天 (míngtiān)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '今天' (jīntiān)?",
                        promptEn: "What does '今天' (jīntiān) mean?",
                        options: ["Ayer", "Hoy", "Mañana", "El año pasado"],
                        optionsEn: ["Yesterday", "Today", "Tomorrow", "Last year"],
                        correct: 1
                    }
                ]
            },
            {
                id: "node-3",
                icon: "👨‍👩‍👧",
                title: "Familia y Amigos",
                titleEn: "Family & Friends",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué significa '爸爸' (bàba)?",
                        promptEn: "What does '爸爸' (bàba) mean?",
                        options: ["Papá", "Mamá", "Hermano", "Abuelo"],
                        optionsEn: ["Dad", "Mom", "Brother", "Grandfather"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se dice 'amigo' en mandarín?",
                        promptEn: "How do you say 'friend' in Mandarin?",
                        options: ["朋友 (péngyou)", "老师 (lǎoshī)", "学生 (xuésheng)", "医生 (yīshēng)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué clasificador se usa para personas en familia (口)?",
                        promptEn: "Which classifier is used for family members?",
                        options: ["口 (kǒu)", "本 (běn)", "只 (zhī)", "张 (zhāng)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-4",
                icon: "👑",
                title: "Guardián de la Aldea",
                titleEn: "Village Guardian Boss",
                isBoss: true,
                questions: [
                    {
                        prompt: "¿Cuál oración significa 'Yo soy estudiante'?",
                        promptEn: "Which sentence means 'I am a student'?",
                        options: ["我是学生 (Wǒ shì xuésheng)", "我喜欢学生 (Wǒ xǐhuan xuésheng)", "他不吃米饭 (Tā bù chī mǐfàn)", "这是水 (Zhè shì shuǐ)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué partícula se usa para hacer preguntas de Sí/No?",
                        promptEn: "Which particle is used for Yes/No questions?",
                        options: ["吗 (ma)", "呢 (ne)", "的 (de)", "了 (le)"],
                        correct: 0
                    },
                    {
                        prompt: "Completa: '____ hǎo ma?' (¿Cómo estás?)",
                        promptEn: "Complete: '____ hǎo ma?' (How are you?)",
                        options: ["Nǐ (你)", "Wǒ (我)", "Tā (他)", "Men (们)"],
                        correct: 0
                    }
                ]
            }
        ]
    },
    {
        id: "zone-2",
        name: "La Casa de Té y el Mercado Imperial",
        nameEn: "Teahouse & Imperial Market",
        badge: "🍵 Zona 2: HSK 1-2 Cotidiano",
        nodes: [
            {
                id: "node-5",
                icon: "🥢",
                title: "Comida y Bebida",
                titleEn: "Food & Drinks",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué significa '米饭' (mǐfàn)?",
                        promptEn: "What does '米饭' (mǐfàn) mean?",
                        options: ["Arroz cocido", "Fideos", "Té verde", "Agua caliente"],
                        optionsEn: ["Cooked rice", "Noodles", "Green tea", "Hot water"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se pide agua en mandarín?",
                        promptEn: "How do you ask for water in Mandarin?",
                        options: ["我要水 (Wǒ yào shuǐ)", "我要茶 (Wǒ yào chá)", "我要吃肉 (Wǒ yào chī ròu)", "我要去学校 (Wǒ yào qù xuéxiào)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '多少钱' (duōshao qián)?",
                        promptEn: "What does '多少钱' (duōshao qián) mean?",
                        options: ["¿Cuánto cuesta?", "¿Dónde está?", "¿Quién es?", "¿Qué hora es?"],
                        optionsEn: ["How much is it?", "Where is it?", "Who is it?", "What time is it?"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-6",
                icon: "🏥",
                title: "Lugares y Ciudad",
                titleEn: "Places & Town",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué lugar es '医院' (yīyuàn)?",
                        promptEn: "What place is '医院' (yīyuàn)?",
                        options: ["Hospital", "Escuela", "Hotel", "Aeropuerto"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué palabra significa 'dónde'?",
                        promptEn: "Which word means 'where'?",
                        options: ["哪儿 (nǎr)", "这儿 (zhèr)", "那儿 (nàr)", "什么 (shénme)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se dice 'ir' en chino?",
                        promptEn: "How do you say 'to go' in Chinese?",
                        options: ["去 (qù)", "来 (lái)", "在 (zài)", "有 (yǒu)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-7",
                icon: "🎭",
                title: "Verbos y Gustos",
                titleEn: "Verbs & Preferences",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué significa '喜欢' (xǐhuan)?",
                        promptEn: "What does '喜欢' (xǐhuan) mean?",
                        options: ["Gustar", "Odiar", "Pensar", "Dormir"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se dice 'leer un libro'?",
                        promptEn: "How do you say 'to read a book'?",
                        options: ["看书 (kàn shū)", "听音乐 (tīng yīnyuè)", "写字 (xiě zì)", "买东西 (mǎi dōngxi)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué verbo significa 'escuchar'?",
                        promptEn: "Which verb means 'to listen'?",
                        options: ["听 (tīng)", "说 (shuō)", "读 (dú)", "写 (xiě)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-8",
                icon: "👑",
                title: "El Mercader Maestro",
                titleEn: "Master Merchant Boss",
                isBoss: true,
                questions: [
                    {
                        prompt: "Traduce: 'Este libro cuesta 20 yuanes.'",
                        promptEn: "Translate: 'This book costs 20 yuan.'",
                        options: ["这本书二十块钱 (Zhè běn shū èrshí kuài qián)", "那个人很高 (Nà ge rén hěn gāo)", "我想吃水果 (Wǒ xiǎng chī shuǐguǒ)", "今天天气很好 (Jīntiān tiānqì hěn hǎo)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '太贵了' (tài guì le)?",
                        promptEn: "What does '太贵了' (tài guì le) mean?",
                        options: ["Demasiado caro", "Muy barato", "Muy sabroso", "Muy lejos"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cuál es el clasificador para libros?",
                        promptEn: "What is the classifier for books?",
                        options: ["本 (běn)", "个 (gè)", "张 (zhāng)", "条 (tiáo)"],
                        correct: 0
                    }
                ]
            }
        ]
    },
    {
        id: "zone-3",
        name: "La Ciudad Prohibida de la Gramática",
        nameEn: "Forbidden City of Grammar",
        badge: "🏯 Zona 3: HSK 2-3 Estructuras",
        nodes: [
            {
                id: "node-9",
                icon: "⚖️",
                title: "La Estructura 把 y 被",
                titleEn: "Ba & Bei Structures",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Para qué sirve la estructura 把 (bǎ)?",
                        promptEn: "What is the '把' (bǎ) construction used for?",
                        options: ["Disposición / Acción directa sobre el objeto", "Voz pasiva", "Comparación", "Pregunta"],
                        optionsEn: ["Disposal / Direct action on the object", "Passive voice", "Comparison", "Question"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué partícula introduce la voz pasiva en mandarín?",
                        promptEn: "Which particle introduces the passive voice?",
                        options: ["被 (bèi)", "把 (bǎ)", "着 (zhe)", "过 (guo)"],
                        correct: 0
                    },
                    {
                        prompt: "Orden correcto: 'Wǒ bǎ píngguǒ ____ le.'",
                        promptEn: "Correct word: 'Wǒ bǎ píngguǒ ____ le.'",
                        options: ["chī (吃 - comí)", "kàn (看 - miré)", "zài (在)", "shì (是)"],
                        optionsEn: ["chī (吃 - ate)", "kàn (看 - watched)", "zài (在)", "shì (是)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-10",
                icon: "🔗",
                title: "Conectores Lógicos",
                titleEn: "Logical Connectors",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué par de conectores significa 'Aunque... sin embargo'?",
                        promptEn: "Which connector pair means 'Although... however'?",
                        options: ["虽然...但是... (suīrán... dànshì...)", "因为...所以... (yīnwèi... suǒyǐ...)", "不但...而且... (búdàn... érqiě...)", "如果...就... (rúguǒ... jiù...)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '因为...所以...'?",
                        promptEn: "What does '因为...所以...' mean?",
                        options: ["Porque... por eso...", "Si... entonces...", "Tanto... como...", "Primero... luego..."],
                        optionsEn: ["Because... therefore...", "If... then...", "Both... and...", "First... then..."],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se dice 'además / y también'?",
                        promptEn: "How do you say 'and also / furthermore'?",
                        options: ["而且 (érqiě)", "但是 (dànshì)", "或者 (huòzhě)", "然后 (ránhòu)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-11",
                icon: "⏱️",
                title: "Aspectos Verbales (了/着/过)",
                titleEn: "Verbal Aspects",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué partícula indica una experiencia pasada ('haber hecho alguna vez')?",
                        promptEn: "Which particle indicates past experience ('ever done')?",
                        options: ["过 (guo)", "了 (le)", "着 (zhe)", "的 (de)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué partícula indica estado continuo o durativo?",
                        promptEn: "Which particle indicates continuous state?",
                        options: ["着 (zhe)", "过 (guo)", "了 (le)", "得 (de)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué indica '了' (le) al final de la oración?",
                        promptEn: "What does sentence-final '了' indicate?",
                        options: ["Cambio de estado o acción completada", "Pregunta", "Posesión", "Negación"],
                        optionsEn: ["Change of state or completed action", "Question", "Possession", "Negation"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-12",
                icon: "👑",
                title: "Erudito Imperial",
                titleEn: "Imperial Scholar Boss",
                isBoss: true,
                questions: [
                    {
                        prompt: "Traduce: 'Él corre muy rápido.' (Uso de 得)",
                        promptEn: "Translate: 'He runs very fast.'",
                        options: ["他跑得很快 (Tā pǎo de hěn kuài)", "他看书很快 (Tā kàn shū hěn kuài)", "他是很跑 (Tā shì hěn pǎo)", "他快跑了 (Tā kuài pǎo le)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cuál oración es correcta con '过'?",
                        promptEn: "Which sentence correctly uses '过'?",
                        options: ["我去过中国 (Wǒ qù guo Zhōngguó)", "我吃着苹果 (Wǒ chī zhe píngguǒ)", "他是过老师 (Tā shì guo lǎoshī)", "明天过星期一 (Míngtiān guo xīngqīyī)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '越...越...' (yuè... yuè...)?",
                        promptEn: "What does '越...越...' mean?",
                        options: ["Cuanto más... más...", "Ni... ni...", "A veces... a veces...", "Primero... después..."],
                        optionsEn: ["The more... the more...", "Neither... nor...", "Sometimes... sometimes...", "First... then..."],
                        correct: 0
                    }
                ]
            }
        ]
    },
    {
        id: "zone-4",
        name: "La Cumbre del Dragón Celestial",
        nameEn: "Celestial Dragon Summit",
        badge: "🐉 Zona 4: HSK 3-4 Maestría",
        nodes: [
            {
                id: "node-13",
                icon: "📜",
                title: "Modismos y Chengyu",
                titleEn: "Idioms & Chengyu",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué significa el proverbio '一心一意' (yī xīn yī yì)?",
                        promptEn: "What does '一心一意' mean?",
                        options: ["Concentrado de todo corazón / con devoción plena", "Estar confundido", "Tener dos opiniones", "Comenzar desde cero"],
                        optionsEn: ["Wholeheartedly / with full devotion", "Being confused", "Having mixed feelings", "Starting from scratch"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cuántos caracteres componen tradicionalmente un Chengyu (成语)?",
                        promptEn: "How many characters make up a traditional Chengyu?",
                        options: ["4 caracteres", "2 caracteres", "6 caracteres", "8 caracteres"],
                        optionsEn: ["4 characters", "2 characters", "6 characters", "8 characters"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué significa '马马虎虎' (mǎmǎhūhū)?",
                        promptEn: "What does '马马虎虎' mean?",
                        options: ["Más o menos / regular / descuidado", "Rápido como un caballo", "Fuerte como un tigre", "Muy peligroso"],
                        optionsEn: ["So-so / careless / mediocre", "Fast as a horse", "Strong as a tiger", "Very dangerous"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-14",
                icon: "🗣️",
                title: "Argumentación y Debates",
                titleEn: "Arguments & Discussions",
                isBoss: false,
                questions: [
                    {
                        prompt: "¿Qué significa '我认为' (wǒ rènwéi)?",
                        promptEn: "What does '我认为' (wǒ rènwéi) mean?",
                        options: ["En mi opinión / yo considero", "Yo no sé", "Él me dijo", "Es imposible"],
                        optionsEn: ["In my opinion / I consider", "I do not know", "He told me", "It is impossible"],
                        correct: 0
                    },
                    {
                        prompt: "¿Cómo se dice 'discutir / debatir' en chino?",
                        promptEn: "How do you say 'to discuss / debate'?",
                        options: ["讨论 (tǎolùn)", "吃饭 (chīfàn)", "休息 (xiūxi)", "睡觉 (shuìjiào)"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué palabra significa 'acuerdo / coincidir'?",
                        promptEn: "Which word means 'to agree'?",
                        options: ["同意 (tóngyì)", "反对 (fǎnduì)", "怀疑 (huáiyí)", "放弃 (fàngqì)"],
                        correct: 0
                    }
                ]
            },
            {
                id: "node-15",
                icon: "🐲",
                title: "Gran Maestro del Dragón",
                titleEn: "Dragon Grandmaster Summit",
                isBoss: true,
                questions: [
                    {
                        prompt: "¿Cuál es el significado profundo de '学无止境' (xué wú zhǐ jìng)?",
                        promptEn: "What does '学无止境' mean?",
                        options: ["El aprendizaje no tiene límites / nunca termina", "El examen fue fácil", "La escuela está cerrada", "Aprender rápido es mejor"],
                        optionsEn: ["Learning has no bounds / never ends", "The test was easy", "The school is closed", "Learning fast is better"],
                        correct: 0
                    },
                    {
                        prompt: "¿Qué estructura expresa 'no solo... sino también...'?",
                        promptEn: "Which structure means 'not only... but also...'?",
                        options: ["不但...而且... (búdàn... érqiě...)", "只要...就... (zhǐyào... jiù...)", "宁可...也... (nìngkě... yě...)", "与其...不如... (yǔqí... bùrú...)"],
                        correct: 0
                    },
                    {
                        prompt: "¡Última prueba! ¿Qué nivel has alcanzado al completar el Camino del Dragón?",
                        promptEn: "What level have you reached upon completing the Dragon Path?",
                        options: ["Gran Maestro del Mandarín HSK 🐉", "Principiante", "Turista", "Oyente"],
                        optionsEn: ["Grand Master of HSK Mandarin 🐉", "Beginner", "Tourist", "Listener"],
                        correct: 0
                    }
                ]
            }
        ]
    }
];

const HSK_PASSIVE_TALENTS = [
    {
        id: "streak-shield",
        icon: "🛡️",
        name: "Escudo de Racha",
        nameEn: "Streak Shield",
        cost: 5,
        desc: "Protege automáticamente tu racha de estudio diaria si olvidas repasar un día.",
        descEn: "Protects your daily study streak automatically if you miss a day."
    },
    {
        id: "xp-boost",
        icon: "⚡",
        name: "Multiplicador de XP (+25%)",
        nameEn: "XP Multiplier (+25%)",
        cost: 10,
        desc: "Otorga un +25% de XP adicional en todas las actividades de la aplicación.",
        descEn: "Grants +25% bonus XP on all app learning activities."
    },
    {
        id: "scholar-eye",
        icon: "👁️",
        name: "Ojo del Erudito",
        nameEn: "Scholar's Eye",
        cost: 15,
        desc: "Muestra pistas etimológicas y componentes de caracteres durante los exámenes.",
        descEn: "Reveals etymological hints and components during exams."
    },
    {
        id: "dragon-aurora",
        icon: "🐉",
        name: "Aura del Dragón Imperial",
        nameEn: "Imperial Dragon Aura",
        cost: 25,
        desc: "Efectos visuales dorados en toda la interfaz y avatar exclusivo en tablas de clasificación.",
        descEn: "Golden visual flair across the UI and exclusive leaderboard avatar."
    }
];

class SkillTreeGame {
    constructor(app) {
        this.app = app;
        this.storageKey = "hsk_skill_tree_state";
        this.state = this.loadState();
        this.currentNode = null;
        this.currentStep = 0;
        this.correctAnswersCount = 0;
    }

    loadState() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            this.app?.logWarn?.("Error loading skill tree state:", e);
        }
        return {
            completedNodes: { "node-1": 0 }, // node-1 is available
            talents: [],
            totalStars: 0
        };
    }

    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            this.app?.logWarn?.("Error saving skill tree state:", e);
        }
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderAll();
    }

    cacheDOM() {
        this.container = document.getElementById("skill-tree");
        this.zonesContainer = document.getElementById("tree-zones-container");
        this.totalStarsEl = document.getElementById("tree-total-stars");
        this.playerLevelEl = document.getElementById("tree-player-level");
        this.unlockedTalentsEl = document.getElementById("tree-unlocked-talents");

        this.talentsList = document.getElementById("tree-talents-list");
        this.rankAvatar = document.getElementById("tree-rank-avatar");
        this.rankName = document.getElementById("tree-rank-name");
        this.rankDesc = document.getElementById("tree-rank-desc");

        // Modal
        this.modal = document.getElementById("tree-node-modal");
        this.modalCloseBtn = document.getElementById("tree-modal-close-btn");
        this.modalIcon = document.getElementById("modal-node-icon");
        this.modalTitle = document.getElementById("modal-node-title");
        this.modalZone = document.getElementById("modal-node-zone");
        this.modalChallengeBody = document.getElementById("modal-challenge-body");
        this.modalStepIndicator = document.getElementById("modal-step-indicator");
        this.modalQuestionText = document.getElementById("modal-question-text");
        this.modalOptionsGrid = document.getElementById("modal-options-grid");
        this.modalResultBanner = document.getElementById("modal-result-banner");
        this.modalResultStars = document.getElementById("modal-result-stars");
        this.modalResultTitle = document.getElementById("modal-result-title");
        this.modalResultDesc = document.getElementById("modal-result-desc");
        this.modalContinueBtn = document.getElementById("modal-result-continue-btn");
    }

    bindEvents() {
        if (this.modalCloseBtn) {
            this.modalCloseBtn.addEventListener("click", () => this.closeModal());
        }

        if (this.modalContinueBtn) {
            this.modalContinueBtn.addEventListener("click", () => this.closeModal());
        }

        if (this.modal) {
            this.modal.addEventListener("click", (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
    }

    renderAll() {
        this.calculateStats();
        this.renderZones();
        this.renderTalents();
        this.renderRank();
    }

    calculateStats() {
        let stars = 0;
        Object.values(this.state.completedNodes || {}).forEach((nodeStars) => {
            stars += Number(nodeStars) || 0;
        });
        this.state.totalStars = stars;
        this.saveState();

        if (this.totalStarsEl) this.totalStarsEl.textContent = stars;
        if (this.unlockedTalentsEl) {
            this.unlockedTalentsEl.textContent = this.state.talents?.length || 0;
        }

        if (this.playerLevelEl) {
            const lvl = Math.floor(stars / 5) + 1;
            this.playerLevelEl.textContent = `Nivel ${lvl} (${this.getRankTitle(stars)})`;
        }
    }

    getRankTitle(stars) {
        const isEs = this.app?.currentLanguage !== "en";
        if (stars >= 35) return isEs ? "Gran Maestro del Dragón" : "Dragon Grandmaster";
        if (stars >= 20) return isEs ? "Erudito Imperial" : "Imperial Scholar";
        if (stars >= 10) return isEs ? "Viajero del Camino de Seda" : "Silk Road Traveler";
        return isEs ? "Aprendiz de la Aldea" : "Village Apprentice";
    }

    renderZones() {
        if (!this.zonesContainer) return;
        const isEs = this.app?.currentLanguage !== "en";

        const allNodesFlat = [];
        HSK_ADVENTURE_ZONES.forEach((z) => {
            z.nodes.forEach((n) => allNodesFlat.push(n));
        });

        this.zonesContainer.innerHTML = HSK_ADVENTURE_ZONES.map((zone) => {
            const zoneName = isEs ? zone.name : (zone.nameEn || zone.name);
            const nodesHTML = zone.nodes.map((node) => {
                const nodeIdx = allNodesFlat.findIndex((n) => n.id === node.id);
                const prevNode = nodeIdx > 0 ? allNodesFlat[nodeIdx - 1] : null;

                const isCompleted = (this.state.completedNodes[node.id] || 0) > 0;
                const isAvailable = node.id === "node-1" || (prevNode && (this.state.completedNodes[prevNode.id] || 0) > 0);
                const starsCount = this.state.completedNodes[node.id] || 0;

                let stateClass = "locked";
                if (isCompleted) stateClass = "completed";
                else if (isAvailable) stateClass = "available";
                if (node.isBoss) stateClass += " boss";

                const starsDisplay = "⭐".repeat(starsCount) + "☆".repeat(3 - starsCount);
                const title = isEs ? node.title : (node.titleEn || node.title);

                return `
                    <div class="trail-node ${stateClass}" data-node-id="${node.id}">
                        <div class="node-orb">
                            <span>${node.icon}</span>
                        </div>
                        <div class="node-title-label">${title}</div>
                        <div class="node-stars-row">${starsDisplay}</div>
                    </div>
                `;
            }).join("");

            return `
                <div class="map-zone">
                    <div class="zone-header-badge">${zone.badge} — ${zoneName}</div>
                    <div class="zone-nodes-trail">${nodesHTML}</div>
                </div>
            `;
        }).join("");

        this.zonesContainer.querySelectorAll(".trail-node").forEach((el) => {
            el.addEventListener("click", () => {
                if (el.classList.contains("locked")) {
                    this.app?.showToast?.("Completa el nodo anterior para desbloquear este sendero", "info");
                    return;
                }
                const nodeId = el.getAttribute("data-node-id");
                const foundNode = allNodesFlat.find((n) => n.id === nodeId);
                if (foundNode) {
                    this.openNodeChallenge(foundNode);
                }
            });
        });
    }

    renderTalents() {
        if (!this.talentsList) return;
        const isEs = this.app?.currentLanguage !== "en";
        const currentStars = this.state.totalStars || 0;

        this.talentsList.innerHTML = HSK_PASSIVE_TALENTS.map((talent) => {
            const isUnlocked = this.state.talents?.includes(talent.id);
            const canAfford = currentStars >= talent.cost;
            const name = isEs ? talent.name : (talent.nameEn || talent.name);
            const desc = isEs ? talent.desc : (talent.descEn || talent.desc);

            return `
                <div class="talent-card-item ${isUnlocked ? "unlocked" : ""}">
                    <div class="talent-left">
                        <span class="talent-icon">${talent.icon}</span>
                        <div>
                            <div class="talent-name">${name}</div>
                            <div class="talent-desc">${desc}</div>
                        </div>
                    </div>
                    ${
                        isUnlocked
                            ? `<span style="font-size:0.75rem; font-weight:700; color:#10b981;">✅ Activo</span>`
                            : `<button type="button" class="talent-unlock-btn" data-talent-id="${talent.id}" ${canAfford ? "" : "disabled"}>
                                ${talent.cost} ⭐
                               </button>`
                    }
                </div>
            `;
        }).join("");

        this.talentsList.querySelectorAll(".talent-unlock-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-talent-id");
                this.unlockTalent(id);
            });
        });
    }

    unlockTalent(talentId) {
        const talent = HSK_PASSIVE_TALENTS.find((t) => t.id === talentId);
        if (!talent) return;

        if (this.state.totalStars < talent.cost) {
            this.app?.showToast?.("Necesitas más estrellas de nodos para desbloquear este talento", "error");
            return;
        }

        if (!this.state.talents) this.state.talents = [];
        if (!this.state.talents.includes(talentId)) {
            this.state.talents.push(talentId);
            this.saveState();
            this.app?.showToast?.(`🔮 ¡Talento '${talent.name}' desbloqueado!`, "success");
            this.app?.audioController?.playChime?.(587.33);
            this.app?.achievementManager?.fireConfetti?.();
            this.renderAll();
        }
    }

    renderRank() {
        const stars = this.state.totalStars || 0;
        let avatar = "🥋";
        let name = "Aprendiz de la Aldea";
        let desc = "Has comenzado tu viaje por los senderos del mandarín antiguo.";

        if (stars >= 35) {
            avatar = "🐉";
            name = "Gran Maestro del Dragón";
            desc = "Has alcanzado la cima celestial de la fluidez y dominio del chino.";
        } else if (stars >= 20) {
            avatar = "📜";
            name = "Erudito Imperial";
            desc = "Dominas las estructuras clave y la gramática de la Ciudad Prohibida.";
        } else if (stars >= 10) {
            avatar = "🗡️";
            name = "Viajero del Camino de Seda";
            desc = "Te desenvuelves con soltura en los mercados y situaciones cotidianas.";
        }

        if (this.rankAvatar) this.rankAvatar.textContent = avatar;
        if (this.rankName) this.rankName.textContent = name;
        if (this.rankDesc) this.rankDesc.textContent = desc;
    }

    openNodeChallenge(node) {
        this.currentNode = node;
        this.currentStep = 0;
        this.correctAnswersCount = 0;

        const isEs = this.app?.currentLanguage !== "en";
        const title = isEs ? node.title : (node.titleEn || node.title);

        if (this.modalIcon) this.modalIcon.textContent = node.icon;
        if (this.modalTitle) this.modalTitle.textContent = title;
        if (this.modalZone) {
            this.modalZone.textContent = node.isBoss ? "👑 Desafío de Guardián de Zona" : "Nodo de Aventura";
        }

        if (this.modalResultBanner) this.modalResultBanner.style.display = "none";
        if (this.modalChallengeBody) this.modalChallengeBody.style.display = "block";
        if (this.modal) this.modal.style.display = "flex";

        this.renderChallengeStep();
    }

    renderChallengeStep() {
        const q = this.currentNode.questions[this.currentStep];
        if (!q) {
            this.finishNodeChallenge();
            return;
        }

        const isEs = this.app?.currentLanguage !== "en";
        if (this.modalStepIndicator) {
            this.modalStepIndicator.textContent = isEs
                ? `Pregunta ${this.currentStep + 1} de ${this.currentNode.questions.length}`
                : `Question ${this.currentStep + 1} of ${this.currentNode.questions.length}`;
        }
        if (this.modalQuestionText) {
            this.modalQuestionText.textContent = isEs ? q.prompt : (q.promptEn || q.prompt);
        }

        if (this.modalOptionsGrid) {
            const opts = isEs ? q.options : (q.optionsEn || q.options);
            this.modalOptionsGrid.innerHTML = opts.map((opt, idx) => `
                <button type="button" class="node-option-btn" data-opt-idx="${idx}">
                    ${opt}
                </button>
            `).join("");

            this.modalOptionsGrid.querySelectorAll(".node-option-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const chosenIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
                    this.handleOptionSelection(chosenIdx, q.correct, btn);
                });
            });
        }
    }

    handleOptionSelection(chosenIdx, correctIdx, btn) {
        const isCorrect = chosenIdx === correctIdx;
        if (isCorrect) {
            btn.classList.add("correct");
            this.correctAnswersCount += 1;
            this.app?.audioController?.playCorrect?.();
        } else {
            btn.classList.add("incorrect");
            this.app?.audioController?.playIncorrect?.();
        }

        this.modalOptionsGrid?.querySelectorAll(".node-option-btn").forEach((b) => {
            b.disabled = true;
            if (parseInt(b.getAttribute("data-opt-idx"), 10) === correctIdx) {
                b.classList.add("correct");
            }
        });

        setTimeout(() => {
            this.currentStep += 1;
            this.renderChallengeStep();
        }, 1100);
    }

    finishNodeChallenge() {
        if (this.modalChallengeBody) this.modalChallengeBody.style.display = "none";
        if (this.modalResultBanner) this.modalResultBanner.style.display = "block";

        let stars = 1;
        if (this.correctAnswersCount === 3) stars = 3;
        else if (this.correctAnswersCount === 2) stars = 2;

        const previousStars = this.state.completedNodes[this.currentNode.id] || 0;
        if (stars > previousStars) {
            this.state.completedNodes[this.currentNode.id] = stars;
            this.saveState();
        }

        if (this.modalResultStars) this.modalResultStars.textContent = "⭐".repeat(stars);
        if (this.modalResultTitle) {
            this.modalResultTitle.textContent = stars === 3 ? "¡Victoria Perfecta!" : "¡Nodo Conquistado!";
        }
        if (this.modalResultDesc) {
            this.modalResultDesc.textContent = `Acertaste ${this.correctAnswersCount} / 3 preguntas. +${stars * 25} XP y ${stars} Estrellas ganadas.`;
        }

        this.app?.audioController?.playChime?.(587.33);
        if (stars >= 2) {
            this.app?.achievementManager?.fireConfetti?.();
        }

        this.renderAll();
    }

    closeModal() {
        if (this.modal) this.modal.style.display = "none";
    }
}

window.SkillTreeGame = SkillTreeGame;
