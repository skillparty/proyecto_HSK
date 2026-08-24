// china-cities-game.js — Motor del Explorador de Ciudades y Rutas de China

const CHINA_CITIES_DATABASE = [
    {
        id: "beijing",
        name: "北京 · Běijīng",
        spanishName: "Pekín / Beijing (Capital Imperial)",
        englishName: "Beijing (Imperial Capital)",
        avatar: "🏯",
        tagline: "El corazón político, cultural y educativo de China con más de 3.000 años de historia.",
        taglineEn: "China's political and cultural heart with over 3,000 years of living history.",
        highlights: [
            { icon: "🏛️", hanzi: "故宫", pinyin: "Gùgōng", trans: "La Ciudad Prohibida", transEn: "Forbidden City" },
            { icon: "🧱", hanzi: "万里长城", pinyin: "Wànlǐ Chángchéng", trans: "La Gran Muralla China", transEn: "Great Wall of China" },
            { icon: "⛩️", hanzi: "天坛", pinyin: "Tiāntán", trans: "El Templo del Cielo", transEn: "Temple of Heaven" },
            { icon: "🎭", hanzi: "京剧", pinyin: "Jīngjù", trans: "Ópera de Pekín", transEn: "Peking Opera" }
        ],
        food: [
            { icon: "🦆", hanzi: "北京烤鸭", pinyin: "Běijīng kǎoyā", trans: "Pato Laqueado Pekinés", transEn: "Peking Roast Duck" },
            { icon: "🥟", hanzi: "水饺", pinyin: "shuǐjiǎo", trans: "Empanadillas Jiaozi", transEn: "Boiled Dumplings" }
        ],
        vocab: [
            { hanzi: "首都", pinyin: "shǒudū", trans: "Capital de un país", transEn: "Capital city" },
            { hanzi: "古迹", pinyin: "gǔjì", trans: "Monumento histórico", transEn: "Historic site" },
            { hanzi: "胡同", pinyin: "hútòng", trans: "Callejón tradicional", transEn: "Traditional alley" }
        ],
        trivia: "La Ciudad Prohibida de Pekín cuenta con exactamente 9.999 habitaciones y media, porque según la mitología china solo el Palacio Celestial del Emperador de Jade podía tener 10.000.",
        triviaEn: "Beijing's Forbidden City has 9,999.5 rooms, as according to Chinese myth, only Heaven's Palace could have 10,000.",
        quiz: {
            question: "¿Qué monumento de Pekín tiene más de 21.000 kilómetros de extensión total?",
            questionEn: "Which Beijing wonder spans over 21,000 kilometers in total length?",
            options: [
                { text: "La Gran Muralla China (万里长城)", isCorrect: true },
                { text: "El Gran Canal de Beijing-Hangzhou", isCorrect: false },
                { text: "El Palacio de Verano (颐和园)", isCorrect: false }
            ]
        }
    },
    {
        id: "shanghai",
        name: "上海 · Shànghǎi",
        spanishName: "Shanghái (La Metrópolis del Futuro)",
        englishName: "Shanghai (The Futuristic Metropolis)",
        avatar: "🏙️",
        tagline: "La capital financiera y vanguardista situada en la desembocadura del río Yangtsé.",
        taglineEn: "The financial and ultra-modern powerhouse on the Yangtze River Delta.",
        highlights: [
            { icon: "🌃", hanzi: "外滩", pinyin: "Wàitān", trans: "El Bund / Paseo fluvial", transEn: "The Bund" },
            { icon: "🗼", hanzi: "东方明珠", pinyin: "Dōngfāng Míngzhū", trans: "Torre Perla Oriental", transEn: "Oriental Pearl Tower" },
            { icon: "🚆", hanzi: "磁悬浮列车", pinyin: "Cíxuánfú lièchē", trans: "Tren de Levitación Maglev", transEn: "Maglev Train" },
            { icon: "🌳", hanzi: "豫园", pinyin: "Yùyuán", trans: "Jardín Yuyuan tradicional", transEn: "Yuyuan Garden" }
        ],
        food: [
            { icon: "🥟", hanzi: "小笼包", pinyin: "xiǎolóngbāo", trans: "Baozi al vapor con caldo", transEn: "Soup Dumplings" },
            { icon: "🦀", hanzi: "大闸蟹", pinyin: "dàzháxiè", trans: "Cangrejo de río de Shanghái", transEn: "Hairy Crab" }
        ],
        vocab: [
            { hanzi: "金融", pinyin: "jīnróng", trans: "Finanzas / Economía", transEn: "Finance" },
            { hanzi: "港口", pinyin: "gǎngkǒu", trans: "Puerto marítimo", transEn: "Seaport" },
            { hanzi: "摩天大楼", pinyin: "mótiān dàlóu", trans: "Rascacielos", transEn: "Skyscraper" }
        ],
        trivia: "El Tren Maglev de Shanghái es el tren comercial de pasajeros más rápido del planeta, alcanzando velocidades operativas de 431 km/h impulsado por electroimanes.",
        triviaEn: "Shanghai's Maglev train is the fastest commercial train in the world, hitting 431 km/h using magnetic levitation.",
        quiz: {
            question: "¿Cómo se llama el famoso plato típico de Shanghái servido en canastas de bambú con caldo caliente por dentro?",
            questionEn: "What is Shanghai's iconic dish served in bamboo steamers with hot broth inside?",
            options: [
                { text: "Xiaolongbao (小笼包)", isCorrect: true },
                { text: "Pato Pekinés (北京烤鸭)", isCorrect: false },
                { text: "Fideos Lanzhou (兰州拉面)", isCorrect: false }
            ]
        }
    },
    {
        id: "xian",
        name: "西安 · Xī'ān",
        spanishName: "Xi'an (Cuna de la Ruta de la Seda)",
        englishName: "Xi'an (Cradle of the Silk Road)",
        avatar: "🏛️",
        tagline: "Antigua capital de trece dinastías y punto de partida de la legendaria Ruta de la Seda.",
        taglineEn: "Ancient capital of 13 dynasties and starting point of the Silk Road.",
        highlights: [
            { icon: "💂", hanzi: "兵马俑", pinyin: "Bīngmǎyǒng", trans: "Guerreros de Terracota", transEn: "Terracotta Army" },
            { icon: "🧱", hanzi: "西安城墙", pinyin: "Xī'ān Chéngqiáng", trans: "Muralla Antigua de Xi'an", transEn: "Ancient City Wall" },
            { icon: "🏯", hanzi: "大雁塔", pinyin: "Dàyàn Tǎ", trans: "Gran Pagoda de la Oca Salvaje", transEn: "Giant Wild Goose Pagoda" },
            { icon: "🐪", hanzi: "丝绸之路", pinyin: "Sīchóu zhī Lù", trans: "Ruta de la Seda", transEn: "The Silk Road" }
        ],
        food: [
            { icon: "🍜", hanzi: "biángbiáng面", pinyin: "biángbiáng miàn", trans: "Fideos anchos Biangbiang", transEn: "Biangbiang Belt Noodles" },
            { icon: "🍔", hanzi: "肉夹馍", pinyin: "ròujiāmó", trans: "Hamburguesa china Roujiamo", transEn: "Chinese Roujiamo Burger" }
        ],
        vocab: [
            { hanzi: "王朝", pinyin: "wángcháo", trans: "Dinastía imperial", transEn: "Dynasty" },
            { hanzi: "考古", pinyin: "kǎogǔ", trans: "Arqueología", transEn: "Archaeology" },
            { hanzi: "丝绸", pinyin: "sīchóu", trans: "Seda", transEn: "Silk" }
        ],
        trivia: "El carácter 'biáng' de los fideos de Xi'an es uno de los más complejos del idioma chino: ¡cuenta con 58 trazos en su forma tradicional!",
        triviaEn: "The character 'biáng' for Xi'an noodles is one of the most complex Chinese characters, boasting 58 strokes!",
        quiz: {
            question: "¿Quién ordenó la creación del ejército de los Guerreros de Terracota en Xi'an?",
            questionEn: "Who commissioned the Terracotta Warriors in Xi'an?",
            options: [
                { text: "El Primer Emperador Qin Shi Huang (秦始皇)", isCorrect: true },
                { text: "El Emperador de Jade (玉皇大帝)", isCorrect: false },
                { text: "El poeta Li Bai (李白)", isCorrect: false }
            ]
        }
    },
    {
        id: "chengdu",
        name: "成都 · Chéngdū",
        spanishName: "Chengdu (Tierra de los Pandas y la Gastronomía)",
        englishName: "Chengdu (Land of Pandas & Spicy Cuisine)",
        avatar: "🐼",
        tagline: "Hogar de los osos panda gigantes, capital culinaria de Sichuan y vida relajada de casas de té.",
        taglineEn: "Home of giant pandas, spicy Sichuan hotpot, and relaxed teahouse lifestyle.",
        highlights: [
            { icon: "🐼", hanzi: "大熊猫基地", pinyin: "Dàxióngmāo Jīdì", trans: "Base de Cría de Pandas", transEn: "Giant Panda Breeding Base" },
            { icon: "🎭", hanzi: "川剧变脸", pinyin: "Chuānjù Biànliǎn", trans: "Teatro de Cambio de Rostros", transEn: "Face-Changing Opera" },
            { icon: "⛩️", hanzi: "武侯祠", pinyin: "Wǔhóu Cí", trans: "Templo Memorial Wuhou", transEn: "Wuhou Shrine" },
            { icon: "🏮", hanzi: "锦里古街", pinyin: "Jǐnlǐ Gǔjiē", trans: "Callejejo histórico Jinli", transEn: "Jinli Ancient Street" }
        ],
        food: [
            { icon: "🍲", hanzi: "四川火锅", pinyin: "Sìchuān huǒguō", trans: "Hot Pot picante de Sichuan", transEn: "Sichuan Spicy Hotpot" },
            { icon: "🌶️", hanzi: "麻婆豆腐", pinyin: "mápó dòufu", trans: "Tofu picante Mapo", transEn: "Mapo Tofu" }
        ],
        vocab: [
            { hanzi: "熊猫", pinyin: "xióngmāo", trans: "Oso Panda", transEn: "Panda bear" },
            { hanzi: "麻辣", pinyin: "málà", trans: "Picante y adormecedor", transEn: "Numbing and spicy" },
            { hanzi: "茶馆", pinyin: "cháguǎn", trans: "Casa de té tradicional", transEn: "Teahouse" }
        ],
        trivia: "Chengdu fue la primera ciudad del mundo en utilizar dinero en papel ('Jiaozi' / 交子) durante la Dinastía Song en el siglo XI.",
        triviaEn: "Chengdu was the very first city in the world to introduce paper currency ('Jiaozi') during the Song Dynasty in the 11th century.",
        quiz: {
            question: "¿Qué técnica mágica de la Ópera de Sichuan cambia de máscara en fracciones de segundo?",
            questionEn: "What magical Sichuan Opera technique changes masks in fractions of a second?",
            options: [
                { text: "Bian Lian / Cambio de Rostros (变脸)", isCorrect: true },
                { text: "Danza del Dragón (舞龙)", isCorrect: false },
                { text: "Acrobacia con Platos (转碟)", isCorrect: false }
            ]
        }
    },
    {
        id: "guilin",
        name: "桂林 · Guìlín",
        spanishName: "Guilin (El Paisaje más Bello Bajo el Cielo)",
        englishName: "Guilin (Finest Scenery Under Heaven)",
        avatar: "🏞️",
        tagline: "Famosa en todo el mundo por sus montañas kársticas de ensueño y las aguas cristalinas del río Li.",
        taglineEn: "World-famous for its magical karst limestone peaks and crystal Li River waters.",
        highlights: [
            { icon: "🚣", hanzi: "漓江山水", pinyin: "Líjiāng Shānshuǐ", trans: "Crucero por el Río Li", transEn: "Li River Karst Cruise" },
            { icon: "🌾", hanzi: "龙脊梯田", pinyin: "Lóngjǐ Tītián", trans: "Terrazas de Arroz de Longji", transEn: "Longji Rice Terraces" },
            { icon: "🪨", hanzi: "象鼻山", pinyin: "Xiàngbí Shān", trans: "Colina de la Trompa del Elefante", transEn: "Elephant Trunk Hill" },
            { icon: "🎋", hanzi: "芦笛岩", pinyin: "Lúdí Yán", trans: "Cueva de la Flauta de Caña", transEn: "Reed Flute Cave" }
        ],
        food: [
            { icon: "🍜", hanzi: "桂林米粉", pinyin: "Guìlín mǐfěn", trans: "Fideos de arroz de Guilin", transEn: "Guilin Rice Noodles" },
            { icon: "🐟", hanzi: "啤酒鱼", pinyin: "píjiǔ yú", trans: "Pescado guisado a la cerveza", transEn: "Beer Fish" }
        ],
        vocab: [
            { hanzi: "山水", pinyin: "shānshuǐ", trans: "Paisaje natural (Montaña y Agua)", transEn: "Landscape / Scenery" },
            { hanzi: "梯田", pinyin: "tītián", trans: "Terrazas de cultivo", transEn: "Terraced fields" },
            { hanzi: "溶洞", pinyin: "róngdòng", trans: "Cueva kárstica", transEn: "Karst cave" }
        ],
        trivia: "El paisaje del Río Li de Guilin es tan icónico en la identidad de China que aparece ilustrado en el reverso del billete de 20 Yuanes.",
        triviaEn: "The Li River scenery in Guilin is so iconic that it is depicted on the back of the official 20 Yuan banknote.",
        quiz: {
            question: "¿En qué billete oficial de la moneda de China (RMB) aparece dibujado el paisaje de Guilin?",
            questionEn: "On which official Chinese RMB banknote is the Guilin scenery depicted?",
            options: [
                { text: "Billete de 20 Yuanes (20元)", isCorrect: true },
                { text: "Billete de 100 Yuanes (100元)", isCorrect: false },
                { text: "Billete de 1 Yuan (1元)", isCorrect: false }
            ]
        }
    }
];

class ChinaCitiesGame {
    constructor(app) {
        this.app = app;
        this.currentCity = CHINA_CITIES_DATABASE[0];
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderCityPills();
        this.loadCity(this.currentCity);
    }

    cacheDOM() {
        this.container = document.getElementById("china-cities");
        this.pillsContainer = document.getElementById("cities-nav-pills");

        this.avatarBadge = document.getElementById("city-avatar-badge");
        this.chineseName = document.getElementById("city-chinese-name");
        this.spanishName = document.getElementById("city-spanish-name");
        this.tagline = document.getElementById("city-tagline");

        this.highlightsGrid = document.getElementById("city-highlights-grid");
        this.foodGrid = document.getElementById("city-food-grid");
        this.vocabList = document.getElementById("city-vocab-list");
        this.triviaText = document.getElementById("city-trivia-text");

        this.quizQuestion = document.getElementById("city-quiz-question");
        this.quizOptions = document.getElementById("city-quiz-options");
        this.quizFeedback = document.getElementById("city-quiz-feedback");
    }

    bindEvents() {
        // Events bound through delegate or render
    }

    renderCityPills() {
        if (!this.pillsContainer) return;
        this.pillsContainer.innerHTML = CHINA_CITIES_DATABASE.map((city) => {
            const isActive = city.id === this.currentCity.id;
            return `
                <button type="button" class="city-pill-btn ${isActive ? "active" : ""}" data-city-id="${city.id}">
                    <span>${city.avatar}</span>
                    <span>${city.name.split("·")[0].trim()}</span>
                </button>
            `;
        }).join("");

        this.pillsContainer.querySelectorAll(".city-pill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-city-id");
                const found = CHINA_CITIES_DATABASE.find((c) => c.id === id);
                if (found) {
                    this.loadCity(found);
                    this.renderCityPills();
                }
            });
        });
    }

    loadCity(city) {
        this.currentCity = city;
        const isEs = this.app?.currentLanguage !== "en";

        if (this.avatarBadge) this.avatarBadge.textContent = city.avatar;
        if (this.chineseName) this.chineseName.textContent = city.name;
        if (this.spanishName) this.spanishName.textContent = isEs ? city.spanishName : (city.englishName || city.spanishName);
        if (this.tagline) this.tagline.textContent = isEs ? city.tagline : (city.taglineEn || city.tagline);
        if (this.triviaText) this.triviaText.textContent = isEs ? city.trivia : (city.triviaEn || city.trivia);

        this.renderHighlights();
        this.renderFood();
        this.renderVocab();
        this.renderQuiz();
    }

    renderHighlights() {
        if (!this.highlightsGrid) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.highlightsGrid.innerHTML = this.currentCity.highlights.map((item) => {
            const trans = isEs ? item.trans : (item.transEn || item.trans);
            return `
                <div class="highlight-item-card" data-hanzi="${item.hanzi}">
                    <span class="item-icon">${item.icon}</span>
                    <div class="item-info">
                        <div class="item-hanzi">${item.hanzi}</div>
                        <div class="item-pinyin">${item.pinyin}</div>
                        <div class="item-trans">${trans}</div>
                    </div>
                </div>
            `;
        }).join("");

        this.highlightsGrid.querySelectorAll(".highlight-item-card").forEach((card) => {
            card.addEventListener("click", () => {
                const text = card.getAttribute("data-hanzi");
                this.app?.audioController?.playWordAudio?.(text);
            });
        });
    }

    renderFood() {
        if (!this.foodGrid) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.foodGrid.innerHTML = this.currentCity.food.map((item) => {
            const trans = isEs ? item.trans : (item.transEn || item.trans);
            return `
                <div class="food-item-card" data-hanzi="${item.hanzi}">
                    <span class="item-icon">${item.icon}</span>
                    <div class="item-info">
                        <div class="item-hanzi">${item.hanzi}</div>
                        <div class="item-pinyin">${item.pinyin}</div>
                        <div class="item-trans">${trans}</div>
                    </div>
                </div>
            `;
        }).join("");

        this.foodGrid.querySelectorAll(".food-item-card").forEach((card) => {
            card.addEventListener("click", () => {
                const text = card.getAttribute("data-hanzi");
                this.app?.audioController?.playWordAudio?.(text);
            });
        });
    }

    renderVocab() {
        if (!this.vocabList) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.vocabList.innerHTML = this.currentCity.vocab.map((item) => {
            const trans = isEs ? item.trans : (item.transEn || item.trans);
            return `
                <div class="city-vocab-row">
                    <span class="vocab-row-hanzi">${item.hanzi}</span>
                    <span class="vocab-row-pinyin">${item.pinyin}</span>
                    <span class="vocab-row-trans">${trans}</span>
                </div>
            `;
        }).join("");
    }

    renderQuiz() {
        if (!this.quizQuestion || !this.quizOptions) return;
        const isEs = this.app?.currentLanguage !== "en";
        const q = this.currentCity.quiz;

        this.quizQuestion.textContent = isEs ? q.question : (q.questionEn || q.question);
        if (this.quizFeedback) this.quizFeedback.style.display = "none";

        this.quizOptions.innerHTML = q.options.map((opt, idx) => `
            <button type="button" class="city-quiz-opt-btn" data-idx="${idx}">
                ${opt.text}
            </button>
        `).join("");

        this.quizOptions.querySelectorAll(".city-quiz-opt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-idx"), 10);
                this.handleQuizAnswer(idx);
            });
        });
    }

    handleQuizAnswer(idx) {
        const isEs = this.app?.currentLanguage !== "en";
        const opt = this.currentCity.quiz.options[idx];
        if (!opt || !this.quizFeedback) return;

        if (opt.isCorrect) {
            this.quizFeedback.className = "city-quiz-feedback correct";
            this.quizFeedback.innerHTML = isEs
                ? "🎉 ¡Correcto! Eres un auténtico experto en la geografía y cultura china. +50 XP"
                : "🎉 Correct! You are a true expert in Chinese geography and culture. +50 XP";
            this.quizFeedback.style.display = "block";

            this.app?.audioController?.playCorrect?.();
            this.app?.achievementManager?.fireConfetti?.();
        } else {
            this.quizFeedback.className = "city-quiz-feedback incorrect";
            this.quizFeedback.innerHTML = isEs
                ? "❌ No es correcto. Revisa los puntos clave de la ciudad e inténtalo de nuevo."
                : "❌ That's not correct. Review the city highlights and try again.";
            this.quizFeedback.style.display = "block";

            this.app?.audioController?.playIncorrect?.();
        }
    }
}

window.ChinaCitiesGame = ChinaCitiesGame;
