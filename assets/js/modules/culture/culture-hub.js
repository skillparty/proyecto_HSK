/**
 * CultureHubController — Portal Cultural de China (Confuc10++)
 * Organiza los 13 submódulos culturales en 4 pilares temáticos:
 * Lengua & Caligrafía, Geografía & Ciudades, Artes & Tradición, Ciencia & Sociedad.
 */
(function () {
  "use strict";

  const STORAGE_KEY_EXPLORED = "hsk_culture_explored";

  const CULTURE_MODULES_DATA = [
    // Pilar 1: Lengua & Caligrafía
    {
      id: "culture-characters",
      pillar: "lang",
      pillarKey: "culturePillarLanguage",
      titleKey: "cultureCharactersTab",
      title: "Evolución de Caracteres",
      hanzi: "汉字演变",
      descEs: "De los pictogramas en huesos oraculares (甲骨文) y bronce a la estandarización regular moderna.",
      descEn: "From pictograms on oracle bones and bronze vessels to modern regular standard script.",
      vocabHanzi: "甲骨文",
      vocabPinyin: "jiǎ gǔ wén",
      vocabMeaningEs: "Huesos oraculares",
      vocabMeaningEn: "Oracle bone script",
      icon: "lantern",
      sealChar: "演变",
      dynasties: ["shang-zhou", "qin-han"],
    },
    {
      id: "calligraphy-scroll",
      pillar: "lang",
      pillarKey: "culturePillarLanguage",
      titleKey: "calligraphyScrollTab",
      title: "Rollos de Caligrafía",
      hanzi: "书法卷轴",
      descEs: "Lienzo interactivo de caligrafía china, trazos con pincel y apreciación de los Cuatro Tesoros del Estudio.",
      descEn: "Interactive Chinese calligraphy canvas, brush stroke physics, and Four Treasures of the Study.",
      vocabHanzi: "文房四宝",
      vocabPinyin: "wén fáng sì bǎo",
      vocabMeaningEs: "4 Tesoros del Estudio",
      vocabMeaningEn: "4 Treasures of the Study",
      icon: "brush",
      sealChar: "卷轴",
      dynasties: ["shang-zhou", "tang-song"],
    },
    {
      id: "chinese-names",
      pillar: "lang",
      pillarKey: "culturePillarLanguage",
      titleKey: "chineseNamesTab",
      title: "Nombres Chinos",
      hanzi: "中文姓名",
      descEs: "Generador de nombres chinos auténticos basados en etimología, fonética y los Cien Apellidos (百家姓).",
      descEn: "Authentic Chinese name generator based on etymology, phonetics, and the Hundred Family Surnames.",
      vocabHanzi: "百家姓",
      vocabPinyin: "bǎi jiā xìng",
      vocabMeaningEs: "100 Apellidos Chinos",
      vocabMeaningEn: "100 Family Surnames",
      icon: "user",
      sealChar: "百家",
      dynasties: ["shang-zhou", "modern"],
    },
    {
      id: "memories",
      pillar: "lang",
      pillarKey: "culturePillarLanguage",
      titleKey: "memoriesTab",
      title: "Baúl de los Recuerdos",
      hanzi: "记忆宝盒",
      descEs: "Exposiciones culturales del Instituto Confucio, reliquias, festividades y recuerdos de estudio.",
      descEn: "Cultural exhibitions, artifacts, festivals, and memories from the Confucius Institute journey.",
      vocabHanzi: "记忆",
      vocabPinyin: "jì yì",
      vocabMeaningEs: "Memoria / Recuerdo",
      vocabMeaningEn: "Memory / Keepsake",
      icon: "inbox",
      sealChar: "宝盒",
      dynasties: ["modern"],
    },

    // Pilar 2: Geografía & Ciudades
    {
      id: "culture-provinces",
      pillar: "geo",
      pillarKey: "culturePillarGeography",
      titleKey: "cultureProvincesTab",
      title: "Provincias y Geografía",
      hanzi: "省份地理",
      descEs: "Mapa físico y cultural de las 34 divisiones de China: gastronomía regional, relieve, clima y dialectos.",
      descEn: "Physical and cultural atlas across China's 34 regions: regional cuisine, dialects, and landscapes.",
      vocabHanzi: "省份",
      vocabPinyin: "shěng fèn",
      vocabMeaningEs: "Provincias de China",
      vocabMeaningEn: "Provinces of China",
      icon: "map",
      sealChar: "山川",
      dynasties: ["qin-han", "modern"],
    },
    {
      id: "china-cities",
      pillar: "geo",
      pillarKey: "culturePillarGeography",
      titleKey: "chinaCitiesTab",
      title: "Ciudades de China",
      hanzi: "中国名城",
      descEs: "Rutas de viaje interactivas por metrópolis legendarias (Beijing, Shanghai, Xi'an) y pasaporte de viaje HSK.",
      descEn: "Interactive journeys across legendary metropolises (Beijing, Shanghai, Xi'an) with traveler passport.",
      vocabHanzi: "古都",
      vocabPinyin: "gǔ dū",
      vocabMeaningEs: "Capital Antigua",
      vocabMeaningEn: "Ancient Capital",
      icon: "building",
      sealChar: "名城",
      dynasties: ["tang-song", "ming-qing", "modern"],
    },

    // Pilar 3: Artes Escénicas & Tradición
    {
      id: "culture-opera",
      pillar: "arts",
      pillarKey: "culturePillarArts",
      titleKey: "cultureOperaTab",
      title: "Ópera de Pekín",
      hanzi: "京剧艺术",
      descEs: "Patrimonio inmaterial con arquetipos (生, 旦, 净, 丑), simbolismo de máscaras Lianpu y orquesta tradicional.",
      descEn: "Intangible cultural heritage: archetypes (Sheng, Dan, Jing, Chou), Lianpu face masks, and orchestra.",
      vocabHanzi: "脸谱",
      vocabPinyin: "liǎn pǔ",
      vocabMeaningEs: "Máscara de ópera",
      vocabMeaningEn: "Opera face paint",
      icon: "mask",
      sealChar: "京剧",
      dynasties: ["ming-qing"],
    },
    {
      id: "shadow-theatre",
      pillar: "arts",
      pillarKey: "culturePillarArts",
      titleKey: "shadowTheatreTab",
      title: "Teatro de Sombras",
      hanzi: "皮影戏",
      descEs: "Fábulas clásicas narradas en el escenario tradicional de títeres de cuero translúcido y luz cálida.",
      descEn: "Classic folk legends performed on the traditional translucent leather shadow puppet stage.",
      vocabHanzi: "皮影",
      vocabPinyin: "pí yǐng",
      vocabMeaningEs: "Títere de sombra",
      vocabMeaningEn: "Shadow puppet",
      icon: "sparkles",
      sealChar: "皮影",
      dynasties: ["tang-song", "ming-qing"],
    },
    {
      id: "lyrics-lab",
      pillar: "arts",
      pillarKey: "culturePillarArts",
      titleKey: "lyricsLabTab",
      title: "Canciones y Rimas",
      hanzi: "儿歌韵律",
      descEs: "Laboratorio musical con letras sincronizadas, melodías tradicionales y rimas infantiles chinas.",
      descEn: "Musical lab featuring synchronized lyrics, traditional melodies, and classic Chinese nursery rhymes.",
      vocabHanzi: "儿歌",
      vocabPinyin: "ér gē",
      vocabMeaningEs: "Canción infantil",
      vocabMeaningEn: "Nursery rhyme",
      icon: "music",
      sealChar: "诗韵",
      dynasties: ["tang-song"],
    },
    {
      id: "culture-arts",
      pillar: "arts",
      pillarKey: "culturePillarArts",
      titleKey: "cultureArtsTab",
      title: "Artes Tradicionales",
      hanzi: "传统艺术",
      descEs: "Guohua (pintura china), recorte de papel (剪纸), danza del león y artesanía ceremonial festiva.",
      descEn: "Guohua painting, Jianzhi paper cutting, lion dances, and ceremonial festival folk crafts.",
      vocabHanzi: "剪纸",
      vocabPinyin: "jiǎn zhǐ",
      vocabMeaningEs: "Recorte de papel",
      vocabMeaningEn: "Paper cutting craft",
      icon: "layers",
      sealChar: "国画",
      dynasties: ["tang-song", "ming-qing"],
    },

    // Pilar 4: Ciencia, Costumbres & Sociedad
    {
      id: "culture-medicine",
      pillar: "sci",
      pillarKey: "culturePillarSociety",
      titleKey: "cultureMedicineTab",
      title: "Medicina Tradicional",
      hanzi: "中医养生",
      descEs: "Milenios de homeostasis: balance de Qi (气), Yin-Yang (阴阳), acupuntura y teoría de las Cinco Fases.",
      descEn: "Millenia of holistic health: Qi energy, Yin-Yang balance, acupuncture, and Five Phases theory.",
      vocabHanzi: "针灸",
      vocabPinyin: "zhēn jiǔ",
      vocabMeaningEs: "Acupuntura y moxibustión",
      vocabMeaningEn: "Acupuncture & moxibustion",
      icon: "leaf",
      sealChar: "岐黄",
      dynasties: ["shang-zhou", "ming-qing"],
    },
    {
      id: "culture-technology",
      pillar: "sci",
      pillarKey: "culturePillarSociety",
      titleKey: "cultureTechnologyTab",
      title: "Tecnología China",
      hanzi: "中国科技",
      descEs: "Los Cuatro Grandes Inventos (brújula, pólvora, papel, imprenta) y el salto a la ciencia contemporánea.",
      descEn: "The Four Great Inventions (compass, gunpowder, paper, printing) and contemporary science.",
      vocabHanzi: "四大发明",
      vocabPinyin: "sì dà fā míng",
      vocabMeaningEs: "4 Grandes Inventos",
      vocabMeaningEn: "4 Great Inventions",
      icon: "compass",
      sealChar: "墨经",
      dynasties: ["tang-song", "modern"],
    },
    {
      id: "culture-clothing",
      pillar: "sci",
      pillarKey: "culturePillarSociety",
      titleKey: "cultureClothingTab",
      title: "Minorías y Vestimenta",
      hanzi: "民族服饰",
      descEs: "Elegancia del Hanfu (汉服), Qipao (旗袍) y la indumentaria ceremonial de las 56 etnias de China.",
      descEn: "Elegance of Hanfu, Qipao, and festive ceremonial attire across China's 56 ethnic groups.",
      vocabHanzi: "汉服",
      vocabPinyin: "hàn fú",
      vocabMeaningEs: "Vestimenta Hanfu",
      vocabMeaningEn: "Traditional Han clothing",
      icon: "shirt",
      sealChar: "华服",
      dynasties: ["tang-song", "ming-qing"],
    },
  ];

  const CHENGYU_WISDOM_BANK = [
    {
      hanzi: "饮水思源",
      pinyin: "yǐn shuǐ sī yuán",
      literalEs: "Al beber agua, recuerda la fuente.",
      literalEn: "When you drink water, think of its source.",
      descEs: "Nos enseña gratitud, honrando a nuestros maestros, raíces y a quienes nos brindaron ayuda.",
      descEn: "Teaches gratitude and humility: never forget your roots or those who helped you along the way.",
    },
    {
      hanzi: "教学相长",
      pinyin: "jiào xué xiāng zhǎng",
      literalEs: "Enseñar y aprender se enriquecen mutuamente.",
      literalEn: "Teaching and learning nourish each other.",
      descEs: "Confucio nos recuerda que compartir conocimientos profundiza nuestra propia sabiduría.",
      descEn: "Confucian insight that teaching others strengthens and deepens our own mastery.",
    },
    {
      hanzi: "塞翁失马",
      pinyin: "sài wēng shī mǎ",
      literalEs: "La pérdida del caballo del anciano de la frontera.",
      literalEn: "The old frontiersman losing his horse.",
      descEs: "No hay mal que por bien no venga; las adversidades temporales a menudo ocultan bendiciones futuras.",
      descEn: "A blessing in disguise: apparent misfortunes often lead to unexpected positive outcomes.",
    },
    {
      hanzi: "愚公移山",
      pinyin: "yú gōng yí shān",
      literalEs: "El anciano tenaz que movió las montañas.",
      literalEn: "The foolish elder who moved the mountains.",
      descEs: "La determinación paciente y constante supera cualquier barrera aparentemente imposible.",
      descEn: "Patient perseverance and relentless persistence can overcome even the most daunting obstacles.",
    },
    {
      hanzi: "温故知新",
      pinyin: "wēn gù zhī xīn",
      literalEs: "Repasar lo aprendido para descubrir lo nuevo.",
      literalEn: "Review the past to understand the new.",
      descEs: "Volver a estudiar lo básico permite descubrir facetas más profundas de la lengua y la vida.",
      descEn: "Revisiting foundational lessons reveals deeper layers of understanding and insight.",
    },
    {
      hanzi: "熟能生巧",
      pinyin: "shú néng shēng qiǎo",
      literalEs: "La práctica constante engendra destreza.",
      literalEn: "Skill comes from practice.",
      descEs: "Al igual que trazar caracteres cada día, la maestría natural nace de la dedicación habitual.",
      descEn: "Practice makes perfect: daily dedication transforms initial effort into effortless mastery.",
    },
    {
      hanzi: "持之以恒",
      pinyin: "chí zhī yǐ héng",
      literalEs: "Perseverar con constancia constante.",
      literalEn: "Persevere with unswerving dedication.",
      descEs: "El éxito en el estudio del mandarín no es un relámpago, sino una marcha pacífica y constante.",
      descEn: "Success is built day by day through steadfast, unwavering commitment.",
    },
    {
      hanzi: "志同道合",
      pinyin: "zhì tóng dào hé",
      literalEs: "Misma aspiración, mismo camino compartido.",
      literalEn: "Sharing the same ambition and path.",
      descEs: "La alegría de aprender junto a compañeros que comparten la misma pasión por la cultura china.",
      descEn: "The joy of traveling together with fellow companions who share the same passion and vision.",
    },
    {
      hanzi: "循序渐进",
      pinyin: "xún xù jiàn jìn",
      literalEs: "Avanzar paso a paso en orden natural.",
      literalEn: "Progress step by step in orderly sequence.",
      descEs: "Cada nivel HSK es un escalón sólido que da soporte al siguiente horizonte lingüístico.",
      descEn: "Build your knowledge methodically step by step; solid foundations create lasting fluency.",
    },
    {
      hanzi: "万事如意",
      pinyin: "wàn shì rú yì",
      literalEs: "Que todo suceda según tus más nobles anhelos.",
      literalEn: "May all things go according to your wishes.",
      descEs: "Antigua bendición china que augura armonía, serenidad y éxito en cada empresa que emprendas.",
      descEn: "Classic Chinese blessing wishing boundless harmony, prosperity, and success in all endeavors.",
    },
  ];

  const CULTURE_TRIVIA_QUESTIONS = [
    {
      id: "q1",
      questionEs: "¿Qué color de máscara (Lianpu) en la Ópera de Pekín simboliza lealtad, rectitud y coraje heroico?",
      questionEn: "Which mask color (Lianpu) in Peking Opera symbolizes loyalty, righteousness, and heroic courage?",
      optionsEs: ["Rojo (红脸)", "Blanco (白脸)", "Negro (黑脸)", "Amarillo (黄脸)"],
      optionsEn: ["Red (红脸)", "White (白脸)", "Black (黑脸)", "Yellow (黄脸)"],
      correct: 0,
      explanationEs: "El color rojo representa fidelidad y valentía, como en el legendario general Guan Yu (关羽).",
      explanationEn: "Red represents fidelity and valor, best exemplified by the legendary general Guan Yu.",
    },
    {
      id: "q2",
      questionEs: "¿Cuáles son los 'Cuatro Tesoros del Estudio' (文房四宝) de la caligrafía tradicional china?",
      questionEn: "What are the 'Four Treasures of the Study' (文房四宝) in traditional Chinese calligraphy?",
      optionsEs: [
        "Pincel, Tinta, Papel Xuan y Tintero de Piedra",
        "Seda, Bambú, Oro y Jade",
        "Pincel, Madera, Campana y Pergamino",
        "Té, Incienso, Cítara y Pintura",
      ],
      optionsEn: [
        "Brush, Ink, Xuan Paper, and Inkstone",
        "Silk, Bamboo, Gold, and Jade",
        "Brush, Wood, Bell, and Parchment",
        "Tea, Incense, Zither, and Painting",
      ],
      correct: 0,
      explanationEs: "Bǐ (笔), Mò (墨), Zhǐ (纸) y Yàn (砚) son los cuatro instrumentos sagrados del letrado chino.",
      explanationEn: "Bi (brush), Mo (ink), Zhi (paper), and Yan (inkstone) are the scholar's essential tools.",
    },
    {
      id: "q3",
      questionEs: "¿En qué material se registraron los caracteres chinos más antiguos descubiertos (甲骨文)?",
      questionEn: "On what material were the oldest known Chinese characters (甲骨文) inscribed?",
      optionsEs: [
        "Huesos de animales y caparazones de tortuga",
        "Tablillas de madera y rollos de seda",
        "Muros de cuevas de piedra caliza",
        "Vasijas de arcilla cocida",
      ],
      optionsEn: [
        "Animal bones and turtle plastrons",
        "Wooden slips and silk scrolls",
        "Limestone cave walls",
        "Kiln-fired clay pottery",
      ],
      correct: 0,
      explanationEs: "Se tallaban en oráculos de la dinastía Shang para adivinación ceremonial en Anyang.",
      explanationEn: "They were carved for divination during the Shang dynasty at Yinxu in Anyang.",
    },
    {
      id: "q4",
      questionEs: "¿Cuál de estos NO forma parte de los Cuatro Grandes Inventos (四大发明) de la antigua China?",
      questionEn: "Which of the following is NOT one of ancient China's Four Great Inventions (四大发明)?",
      optionsEs: ["El telescopio", "La brújula magnética", "La pólvora", "La imprenta de tipos móviles"],
      optionsEn: ["The telescope", "The magnetic compass", "Gunpowder", "Movable type printing"],
      correct: 0,
      explanationEs: "Los cuatro son la brújula, la pólvora, la fabricación de papel y la imprenta.",
      explanationEn: "The Four Great Inventions are compass, gunpowder, papermaking, and printing.",
    },
    {
      id: "q5",
      questionEs: "¿Qué dinastía china es célebre como la 'Edad de Oro' de la poesía clásica (Li Bai, Du Fu)?",
      questionEn: "Which Chinese dynasty is celebrated as the 'Golden Age' of classical poetry (Li Bai, Du Fu)?",
      optionsEs: ["Dinastía Tang (唐代)", "Dinastía Qin (秦代)", "Dinastía Qing (清代)", "Dinastía Yuan (元代)"],
      optionsEn: ["Tang Dynasty (唐代)", "Qin Dynasty (秦代)", "Qing Dynasty (清代)", "Yuan Dynasty (元代)"],
      correct: 0,
      explanationEs: "La dinastía Tang (618-907 d.C.) produjo cerca de 50.000 poemas compilados en el Quan Tangshi.",
      explanationEn: "The Tang Dynasty (618-907 CE) flourished with nearly 50,000 poems compiled in the Quan Tangshi.",
    },
    {
      id: "q6",
      questionEs: "¿Qué metrópoli histórica fue el punto de partida oriental de la milenaria Ruta de la Seda?",
      questionEn: "Which historic metropolis served as the eastern starting point of the ancient Silk Road?",
      optionsEs: ["Xi'an (Chang'an · 长安)", "Shanghai (上海)", "Guangzhou (广州)", "Chengdu (成都)"],
      optionsEn: ["Xi'an (Chang'an · 长安)", "Shanghai (上海)", "Guangzhou (广州)", "Chengdu (成都)"],
      correct: 0,
      explanationEs: "Chang'an (actual Xi'an) fue la capital cosmopolita que conectó a China con Asia Central y Europa.",
      explanationEn: "Chang'an (modern Xi'an) was the vibrant starting hub connecting China with Eurasia.",
    },
  ];

  class CultureHubController {
    constructor(app) {
      this.app = app;
      this.activePillar = "all";
      this.activeDynasty = null;
      this.searchQuery = "";
      this.currentChengyuIndex = 0;
      this.isPassportOpen = false;
      this.currentTriviaIndex = 0;
      this.triviaAnswered = false;
      this.triviaSelectedOption = null;
      this.isInitialized = false;

      // Listen for language changes
      window.addEventListener("languageChanged", () => {
        if (this.isInitialized) {
          this.render();
        }
      });
    }

    async init() {
      if (this.isInitialized) return;
      this.container = document.getElementById("culture-content");
      if (!this.container) {
        this.container = document.getElementById("culture");
      }
      this.render();
      this.bindEvents();
      this.isInitialized = true;
    }

    getExploredSet() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_EXPLORED);
        return new Set(raw ? JSON.parse(raw) : []);
      } catch (err) {
        if (this.app?.logWarn) this.app.logWarn("Error reading explored culture modules:", err);
        return new Set();
      }
    }

    markExplored(tabId) {
      try {
        const explored = this.getExploredSet();
        explored.add(tabId);
        localStorage.setItem(STORAGE_KEY_EXPLORED, JSON.stringify([...explored]));
        this.updateExploredCounter();
      } catch (err) {
        if (this.app?.logWarn) this.app.logWarn("Error saving explored culture module:", err);
      }
    }

    updateExploredCounter() {
      const counterEl = document.getElementById("culture-explored-count");
      const exploredSet = this.getExploredSet();
      if (counterEl) {
        counterEl.textContent = `${exploredSet.size}/${CULTURE_MODULES_DATA.length}`;
      }

      // Update Passport header and seals in place if present
      const rankBadge = this.container?.querySelector(".passport-rank-badge");
      if (rankBadge) {
        const rank = this.getRank(exploredSet.size);
        const percent = Math.round((exploredSet.size / CULTURE_MODULES_DATA.length) * 100);
        const nameEl = rankBadge.querySelector(".rank-name");
        const countEl = rankBadge.querySelector(".rank-counter");
        if (nameEl) nameEl.textContent = rank.title;
        if (countEl) countEl.textContent = `${exploredSet.size}/${CULTURE_MODULES_DATA.length} (${percent}%)`;
        rankBadge.classList.toggle("rank-master", exploredSet.size === CULTURE_MODULES_DATA.length);
      }

      // Update seal elements
      const seals = this.container?.querySelectorAll(".imperial-seal");
      seals?.forEach((seal) => {
        const modId = seal.getAttribute("data-seal-target");
        const isStamped = exploredSet.has(modId);
        seal.classList.toggle("is-stamped", isStamped);
        seal.classList.toggle("is-pending", !isStamped);
      });
    }

    getCulturalDeckWords() {
      try {
        const raw = localStorage.getItem("hsk_culture_deck_words");
        return new Set(raw ? JSON.parse(raw) : []);
      } catch {
        return new Set();
      }
    }

    toggleVocabDeck(mod) {
      if (!mod || !mod.vocabHanzi) return false;
      const set = this.getCulturalDeckWords();
      const isSaved = set.has(mod.vocabHanzi);
      let nowSaved = false;

      if (isSaved) {
        set.delete(mod.vocabHanzi);
        nowSaved = false;
        try {
          if (this.app?.deckManager) {
            const allDecks = this.app.deckManager.getAllDecks();
            const deck = allDecks.find((d) => d.name === "Vocabulario Cultural");
            if (deck) {
              this.app.deckManager.removeWordFromDeck(deck.id, mod.vocabHanzi);
            }
          }
        } catch (err) {
          if (this.app?.logWarn) this.app.logWarn("Error removing from deckManager:", err);
        }
        const msg = this.app?.getTranslation?.("cultureRemovedFromDeck") || "Eliminado de Vocabulario Cultural";
        if (this.app?.showToast) this.app.showToast(msg);
      } else {
        set.add(mod.vocabHanzi);
        nowSaved = true;
        try {
          if (this.app?.deckManager) {
            const allDecks = this.app.deckManager.getAllDecks();
            let deck = allDecks.find((d) => d.name === "Vocabulario Cultural");
            if (!deck) {
              deck = this.app.deckManager.createDeck("Vocabulario Cultural", "Vocabulario clave del Portal Cultural de China");
            }
            if (deck) {
              this.app.deckManager.addWordToDeck(deck.id, {
                character: mod.vocabHanzi,
                pinyin: mod.vocabPinyin,
                spanish: mod.vocabMeaningEs,
                english: mod.vocabMeaningEn,
                level: "Cultura",
              });
            }
          }
        } catch (err) {
          if (this.app?.logWarn) this.app.logWarn("Error adding to deckManager:", err);
        }
        const msg = this.app?.getTranslation?.("cultureAddedToDeck") || "¡Guardado en Vocabulario Cultural!";
        if (this.app?.showToast) this.app.showToast(msg);
      }

      localStorage.setItem("hsk_culture_deck_words", JSON.stringify([...set]));

      // Update button appearance
      const btn = this.container?.querySelector(`.culture-card-deck-btn[data-culture-deck-mod="${mod.id}"]`);
      if (btn) {
        btn.classList.toggle("is-in-deck", nowSaved);
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", nowSaved ? "currentColor" : "none");
        const titleText = nowSaved
          ? this.app?.getTranslation?.("cultureRemovedFromDeck") || "Guardado en Mazo Cultural"
          : this.app?.getTranslation?.("cultureAddToDeck") || "Guardar en Mazo Cultural";
        btn.setAttribute("title", titleText);
        btn.setAttribute("aria-label", titleText);
      }

      return nowSaved;
    }

    getRank(count) {
      if (count >= 13) {
        return {
          title: this.app?.getTranslation?.("cultureRankMaster") || "Gran Erudito de Sinología",
          code: "master",
        };
      }
      if (count >= 8) {
        return {
          title: this.app?.getTranslation?.("cultureRankScholar") || "Erudito Cultural",
          code: "scholar",
        };
      }
      if (count >= 4) {
        return {
          title: this.app?.getTranslation?.("cultureRankExplorer") || "Explorador de Tradiciones",
          code: "explorer",
        };
      }
      return {
        title: this.app?.getTranslation?.("cultureRankNovice") || "Viajero Principiante",
        code: "novice",
      };
    }

    escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    normalizeText(str) {
      if (!str) return "";
      return String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    matchesSearch(mod, query) {
      if (!query) return true;
      const q = this.normalizeText(query);
      if (!q) return true;

      const translatedTitle = this.app?.getTranslation?.(mod.titleKey) || "";
      const translatedPillar = this.app?.getTranslation?.(mod.pillarKey) || "";

      const haystack = [
        mod.title,
        translatedTitle,
        mod.hanzi,
        mod.descEs,
        mod.descEn,
        mod.vocabHanzi,
        mod.vocabPinyin,
        mod.vocabMeaningEs,
        mod.vocabMeaningEn,
        mod.pillar,
        translatedPillar,
      ]
        .map((s) => this.normalizeText(s))
        .join(" ");

      const terms = q.split(/\s+/).filter(Boolean);
      return terms.every((term) => haystack.includes(term));
    }

    renderPassport(exploredSet) {
      const rank = this.getRank(exploredSet.size);
      const percent = Math.round((exploredSet.size / CULTURE_MODULES_DATA.length) * 100);

      return `
        <div class="culture-passport-card ${this.isPassportOpen ? "is-open" : ""}" id="culture-passport-card">
          <div class="passport-header">
            <div class="passport-title-group">
              <div class="passport-seal-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"></rect><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="3" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="21"></line></svg>
              </div>
              <div>
                <h3 class="passport-title" data-i18n="culturePassportTitle">${this.app?.getTranslation?.("culturePassportTitle") || "Pasaporte Cultural de China"}</h3>
                <p class="passport-subtitle" data-i18n="culturePassportSubtitle">${this.app?.getTranslation?.("culturePassportSubtitle") || "Colección de Sellos Imperiales (朱砂印章)"}</p>
              </div>
            </div>

            <div class="passport-rank-badge ${exploredSet.size === 13 ? "rank-master" : ""}">
              <span class="rank-name">${rank.title}</span>
              <span class="rank-counter">${exploredSet.size}/${CULTURE_MODULES_DATA.length} (${percent}%)</span>
            </div>
          </div>

          <div class="passport-seals-grid">
            ${this.renderSeals(exploredSet)}
          </div>
        </div>
      `;
    }

    renderSeals(exploredSet) {
      return CULTURE_MODULES_DATA.map((mod) => {
        const isStamped = exploredSet.has(mod.id);
        const title = this.app?.getTranslation?.(mod.titleKey) || mod.title;
        const sealChar = mod.sealChar || mod.hanzi.substring(0, 2);

        return `
          <button
            type="button"
            class="imperial-seal ${isStamped ? "is-stamped" : "is-pending"}"
            data-seal-target="${mod.id}"
            title="${title} (${isStamped ? "Estampado" : "Pendiente"})"
            aria-label="${title} (${isStamped ? "Estampado" : "Pendiente"})"
          >
            <span class="seal-char">${sealChar}</span>
            <span class="seal-caption">${title}</span>
            ${
              isStamped
                ? `<span class="seal-status-dot" aria-hidden="true">✓</span>`
                : `<span class="seal-status-pending" aria-hidden="true">○</span>`
            }
          </button>
        `;
      }).join("");
    }

    renderTriviaCard(isEn) {
      const currentTrivia = CULTURE_TRIVIA_QUESTIONS[this.currentTriviaIndex] || CULTURE_TRIVIA_QUESTIONS[0];
      const question = isEn ? currentTrivia.questionEn : currentTrivia.questionEs;
      const options = isEn ? currentTrivia.optionsEn : currentTrivia.optionsEs;
      const explanation = isEn ? currentTrivia.explanationEn : currentTrivia.explanationEs;

      const optionsHtml = options
        .map((opt, idx) => {
          let optClass = "trivia-option-btn";
          let iconSvg = "";
          if (this.triviaAnswered) {
            if (idx === currentTrivia.correct) {
              optClass += " is-correct";
              iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (idx === this.triviaSelectedOption) {
              optClass += " is-wrong";
              iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right:4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            }
          }
          return `
            <button type="button" class="${optClass}" data-trivia-opt="${idx}" ${this.triviaAnswered ? "disabled" : ""}>
              <span>${iconSvg}${opt}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="culture-trivia-card" id="culture-trivia-card">
          <div class="trivia-header">
            <div class="trivia-title-group">
              <span class="trivia-icon-badge" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </span>
              <h3 class="trivia-title" data-i18n="cultureTriviaTitle">${this.app?.getTranslation?.("cultureTriviaTitle") || "Reto Cultural del Día"}</h3>
            </div>
            <span class="trivia-badge-xp">+20 XP</span>
          </div>

          <p class="trivia-question" id="culture-trivia-question">${question}</p>

          <div class="trivia-options-grid" id="culture-trivia-options">
            ${optionsHtml}
          </div>

          <div class="trivia-feedback ${this.triviaAnswered ? "" : "is-hidden"}" id="culture-trivia-feedback">
            <p class="trivia-explanation" id="culture-trivia-explanation">${this.escapeHtml(explanation)}</p>
            <button type="button" class="trivia-next-btn" id="culture-trivia-next-btn">
              <span data-i18n="cultureTriviaNext">${this.app?.getTranslation?.("cultureTriviaNext") || "Siguiente reto"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    }

    updateTriviaView() {
      const triviaCard = this.container?.querySelector("#culture-trivia-card");
      if (!triviaCard) return;
      const isEn = this.app?.currentLanguage === "en";
      const parent = triviaCard.parentElement;
      if (parent) {
        const temp = document.createElement("div");
        temp.innerHTML = this.renderTriviaCard(isEn);
        const newCard = temp.firstElementChild;
        if (newCard) {
          parent.replaceChild(newCard, triviaCard);
        }
      }
    }

    answerTrivia(optionIndex) {
      if (this.triviaAnswered) return;
      this.triviaAnswered = true;
      this.triviaSelectedOption = optionIndex;
      const q = CULTURE_TRIVIA_QUESTIONS[this.currentTriviaIndex];
      const isCorrect = optionIndex === q.correct;

      if (isCorrect) {
        try {
          const currentXP = Number(localStorage.getItem("hsk_culture_trivia_xp") || 0) + 20;
          localStorage.setItem("hsk_culture_trivia_xp", String(currentXP));
        } catch (err) {
          if (this.app?.logWarn) this.app.logWarn("Error saving trivia XP:", err);
        }
        if (this.app?.showToast) {
          this.app.showToast(this.app?.getTranslation?.("cultureTriviaCorrect") || "¡Correcto! +20 XP");
        }
      }
      this.updateTriviaView();
    }

    nextTrivia() {
      this.currentTriviaIndex = (this.currentTriviaIndex + 1) % CULTURE_TRIVIA_QUESTIONS.length;
      this.triviaAnswered = false;
      this.triviaSelectedOption = null;
      this.updateTriviaView();
    }

    render() {
      if (!this.container) return;
      const isEn = this.app?.currentLanguage === "en";
      const exploredSet = this.getExploredSet();
      const currentChengyu = CHENGYU_WISDOM_BANK[this.currentChengyuIndex] || CHENGYU_WISDOM_BANK[0];
      const searchPlaceholder =
        this.app?.getTranslation?.("cultureSearchPlaceholder") ||
        "Buscar módulos, dinastías, artes, medicina, Hanzi...";

      const html = `
        <div class="culture-hub-container">
          <!-- Hero Banner -->
          <div class="culture-hub-banner">
            <div class="culture-hub-title-group">
              <h2 class="culture-hub-main-title">
                <span class="culture-hub-icon-badge" aria-hidden="true">
                  ${window.hskIcons?.render?.("temple", { size: 24 }) || ""}
                </span>
                <span data-i18n="culturePortalTitle">${this.app?.getTranslation?.("culturePortalTitle") || "Portal Cultural de China · 中华文化大观"}</span>
              </h2>
              <p class="culture-hub-subtitle" data-i18n="culturePortalSubtitle">
                ${this.app?.getTranslation?.("culturePortalSubtitle") || "Un viaje inmersivo por más de 5.000 años de historia, arte, medicina, geografía y lengua china."}
              </p>
            </div>
            <div class="culture-hub-stats">
              <div class="culture-hub-stat-item">
                <span class="culture-hub-stat-val">13</span>
                <span data-i18n="cultureModulesCount">${this.app?.getTranslation?.("cultureModulesCount") || "Módulos Temáticos"}</span>
              </div>
              <div class="culture-hub-stat-item">
                <span class="culture-hub-stat-val">4</span>
                <span>Pilares de Sabiduría</span>
              </div>
              <button type="button" class="culture-hub-stat-item culture-passport-toggle-btn" id="culture-passport-toggle-btn" title="Ver Pasaporte Imperial de Sellos">
                <span class="culture-hub-stat-val" id="culture-explored-count">${exploredSet.size}/${CULTURE_MODULES_DATA.length}</span>
                <span data-i18n="cultureDiscoveredPill">${this.app?.getTranslation?.("cultureDiscoveredPill") || "Explorados"}</span>
                <span class="stat-passport-seal-badge" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>
                </span>
              </button>
            </div>
          </div>

          <!-- Imperial Cultural Passport (通关文牒) -->
          ${this.renderPassport(exploredSet)}

          <!-- Wisdom Card & Daily Cultural Trivia Row -->
          <div class="culture-wisdom-trivia-row">
            <!-- Wisdom / Proverb Card -->
            <div class="culture-wisdom-card">
              <div class="wisdom-header">
                <h3 class="wisdom-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>
                  <span data-i18n="cultureDailyWisdom">${this.app?.getTranslation?.("cultureDailyWisdom") || "Sabiduría Milenaria (Proverbio del Día)"}</span>
                </h3>
                <div class="wisdom-actions">
                  <button type="button" class="wisdom-action-btn" id="culture-wisdom-copy-btn" title="Copiar proverbio" aria-label="Copiar proverbio">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span id="wisdom-copy-label" data-i18n="cultureCopyWisdom">${this.app?.getTranslation?.("cultureCopyWisdom") || "Copiar Ficha"}</span>
                  </button>
                  <button type="button" class="wisdom-shuffle-btn" id="culture-wisdom-shuffle-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                    <span data-i18n="cultureShuffleWisdom">${this.app?.getTranslation?.("cultureShuffleWisdom") || "Otro Proverbio"}</span>
                  </button>
                </div>
              </div>
              <div class="wisdom-content-row">
                <div class="wisdom-character-block">
                  <span class="wisdom-hanzi" id="wisdom-hanzi-text">${currentChengyu.hanzi}</span>
                  <span class="wisdom-pinyin" id="wisdom-pinyin-text">${currentChengyu.pinyin}</span>
                  <button type="button" class="wisdom-audio-btn" id="wisdom-speak-btn" title="Escuchar pronunciación" aria-label="Escuchar pronunciación">
                    ${window.hskIcons?.render?.("volume", { size: 16 }) || ""}
                  </button>
                </div>
                <div class="wisdom-meanings">
                  <p class="wisdom-literal" id="wisdom-literal-text">${isEn ? currentChengyu.literalEn : currentChengyu.literalEs}</p>
                  <p class="wisdom-desc" id="wisdom-desc-text">${isEn ? currentChengyu.descEn : currentChengyu.descEs}</p>
                </div>
              </div>
            </div>

            <!-- Daily Cultural Trivia Card -->
            ${this.renderTriviaCard(isEn)}
          </div>

          <!-- Controls Section: Search & Pillar Filters -->
          <div class="culture-controls-section">
            <div class="culture-search-box">
              <span class="culture-search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="search"
                id="culture-search-input"
                class="culture-search-input"
                placeholder="${this.escapeHtml(searchPlaceholder)}"
                value="${this.escapeHtml(this.searchQuery)}"
                aria-label="${this.escapeHtml(searchPlaceholder)}"
                autocomplete="off"
              />
              <button
                type="button"
                id="culture-search-clear"
                class="culture-search-clear-btn ${this.searchQuery ? "" : "is-hidden"}"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="culture-filter-bar" role="tablist" aria-label="Filtro de pilares culturales">
              <button type="button" class="culture-filter-chip ${this.activePillar === "all" ? "active" : ""}" data-pillar="all" role="tab" aria-selected="${this.activePillar === "all"}">
                <span data-i18n="cultureFilterAll">${this.app?.getTranslation?.("cultureFilterAll") || "Todos los Módulos"}</span>
                <span class="chip-count">13</span>
              </button>
              <button type="button" class="culture-filter-chip ${this.activePillar === "lang" ? "active" : ""}" data-pillar="lang" role="tab" aria-selected="${this.activePillar === "lang"}">
                <span data-i18n="culturePillarLanguage">${this.app?.getTranslation?.("culturePillarLanguage") || "Lengua & Caligrafía"}</span>
                <span class="chip-count">4</span>
              </button>
              <button type="button" class="culture-filter-chip ${this.activePillar === "geo" ? "active" : ""}" data-pillar="geo" role="tab" aria-selected="${this.activePillar === "geo"}">
                <span data-i18n="culturePillarGeography">${this.app?.getTranslation?.("culturePillarGeography") || "Geografía & Ciudades"}</span>
                <span class="chip-count">2</span>
              </button>
              <button type="button" class="culture-filter-chip ${this.activePillar === "arts" ? "active" : ""}" data-pillar="arts" role="tab" aria-selected="${this.activePillar === "arts"}">
                <span data-i18n="culturePillarArts">${this.app?.getTranslation?.("culturePillarArts") || "Artes Escénicas & Tradición"}</span>
                <span class="chip-count">4</span>
              </button>
              <button type="button" class="culture-filter-chip ${this.activePillar === "sci" ? "active" : ""}" data-pillar="sci" role="tab" aria-selected="${this.activePillar === "sci"}">
                <span data-i18n="culturePillarSociety">${this.app?.getTranslation?.("culturePillarSociety") || "Ciencia, Costumbres & Sociedad"}</span>
                <span class="chip-count">3</span>
              </button>
            </div>
          </div>

          <!-- Cultural Cards Grid -->
          <div class="culture-cards-grid" id="culture-cards-grid">
            ${this.renderModuleCards(exploredSet, isEn)}
          </div>

          <!-- No Results Empty State -->
          <div class="culture-no-results is-hidden" id="culture-no-results">
            <div class="culture-no-results-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <p class="culture-no-results-text" data-i18n="cultureNoResults">
              ${this.app?.getTranslation?.("cultureNoResults") || "No se encontraron módulos culturales para esta búsqueda."}
            </p>
            <button type="button" class="culture-reset-btn" id="culture-reset-filters-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span data-i18n="cultureResetFilters">${this.app?.getTranslation?.("cultureResetFilters") || "Restablecer filtros"}</span>
            </button>
          </div>

          <!-- Timeline Ribbon with Interactive Dynasties -->
          <div class="culture-timeline-card">
            <div class="timeline-header">
              <h3 class="timeline-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Eje Cronológico de las Dinastías y Logros Culturales</span>
              </h3>
              ${
                this.activeDynasty
                  ? `<button type="button" class="timeline-dynasty-clear-btn" id="culture-dynasty-clear-btn">
                       <span data-i18n="cultureDynastyAll">${this.app?.getTranslation?.("cultureDynastyAll") || "Todas las épocas"}</span>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>`
                  : ""
              }
            </div>
            <div class="timeline-ribbon">
              <div class="timeline-step is-clickable ${this.activeDynasty === "shang-zhou" ? "active" : ""}" data-dynasty="shang-zhou" role="button" tabindex="0">
                <span class="step-dynasty">Shang & Zhou</span>
                <span class="step-period">1600 - 256 a.C.</span>
                <p class="step-highlight">Huesos oraculares (甲骨文), fundición de bronce ceremonial y filosofía clásica.</p>
              </div>
              <div class="timeline-step is-clickable ${this.activeDynasty === "qin-han" ? "active" : ""}" data-dynasty="qin-han" role="button" tabindex="0">
                <span class="step-dynasty">Qin & Han</span>
                <span class="step-period">221 a.C. - 220 d.C.</span>
                <p class="step-highlight">Unificación de caracteres, Gran Muralla, papel e inicio de la Ruta de la Seda.</p>
              </div>
              <div class="timeline-step is-clickable ${this.activeDynasty === "tang-song" ? "active" : ""}" data-dynasty="tang-song" role="button" tabindex="0">
                <span class="step-dynasty">Tang & Song</span>
                <span class="step-period">618 - 1279 d.C.</span>
                <p class="step-highlight">Edad de oro de la poesía, pintura al aguafuerte, brújula e imprenta de tipos móviles.</p>
              </div>
              <div class="timeline-step is-clickable ${this.activeDynasty === "ming-qing" ? "active" : ""}" data-dynasty="ming-qing" role="button" tabindex="0">
                <span class="step-dynasty">Ming & Qing</span>
                <span class="step-period">1368 - 1912 d.C.</span>
                <p class="step-highlight">Ciudad Prohibida, esplendor de la Ópera de Pekín, porcelana y enciclopedia médica.</p>
              </div>
              <div class="timeline-step is-clickable ${this.activeDynasty === "modern" ? "active" : ""}" data-dynasty="modern" role="button" tabindex="0">
                <span class="step-dynasty">China Contemporánea</span>
                <span class="step-period">1912 - Presente</span>
                <p class="step-highlight">Estandarización Pinyin y caracteres simplificados, alta velocidad y vanguardia global.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = html;
      this.applyFilters();
    }

    renderModuleCards(exploredSet, isEn) {
      const culturalDeckWords = this.getCulturalDeckWords();

      return CULTURE_MODULES_DATA.map((mod) => {
        const isExplored = exploredSet.has(mod.id);
        const isWordSaved = culturalDeckWords.has(mod.vocabHanzi);
        const isHidden =
          (this.activePillar !== "all" && this.activePillar !== mod.pillar) ||
          !this.matchesSearch(mod, this.searchQuery) ||
          (this.activeDynasty && (!mod.dynasties || !mod.dynasties.includes(this.activeDynasty)));
        const tagClass = `tag-${mod.pillar}`;
        const pillarName = this.app?.getTranslation?.(mod.pillarKey) || mod.pillar;
        const title = this.app?.getTranslation?.(mod.titleKey) || mod.title;
        const desc = isEn ? mod.descEn : mod.descEs;
        const vocabMeaning = isEn ? mod.vocabMeaningEn : mod.vocabMeaningEs;

        return `
          <div class="culture-card ${isHidden ? "is-hidden" : ""}" data-card-id="${mod.id}" data-card-pillar="${mod.pillar}">
            <div class="culture-card-header">
              <span class="culture-pillar-tag ${tagClass}">
                ${window.hskIcons?.render?.(mod.icon, { size: 14 }) || ""}
                <span>${pillarName}</span>
              </span>
              ${
                isExplored
                  ? `<span class="culture-card-explored-badge">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                       <span>Explorado</span>
                     </span>`
                  : ""
              }
            </div>

            <div class="culture-card-body">
              <h3 class="culture-card-title">
                <span>${title}</span>
                <span class="culture-card-hanzi">${mod.hanzi}</span>
              </h3>
              <p class="culture-card-desc">${desc}</p>

              <div class="culture-key-vocab-box">
                <div class="key-vocab-content">
                  <span class="key-vocab-hanzi">${mod.vocabHanzi}</span>
                  <span class="key-vocab-pinyin">${mod.vocabPinyin}</span>
                  <span class="key-vocab-meaning">· ${vocabMeaning}</span>
                </div>
                <div class="key-vocab-actions">
                  <button
                    type="button"
                    class="culture-card-deck-btn ${isWordSaved ? "is-in-deck" : ""}"
                    data-culture-deck-mod="${mod.id}"
                    title="${isWordSaved ? this.app?.getTranslation?.("cultureRemovedFromDeck") || "Guardado en Mazo Cultural" : this.app?.getTranslation?.("cultureAddToDeck") || "Guardar en Mazo Cultural"}"
                    aria-label="${isWordSaved ? "Guardado en Mazo" : "Guardar en Mazo"}"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="${isWordSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </button>
                  <button type="button" class="culture-card-audio-btn" data-culture-audio="${mod.vocabHanzi}" title="Escuchar ${mod.vocabHanzi}">
                    ${window.hskIcons?.render?.("volume", { size: 13 }) || ""}
                  </button>
                </div>
              </div>
            </div>

            <div class="culture-card-footer">
              <button type="button" class="culture-explore-btn" data-goto-tab="${mod.id}">
                <span data-i18n="cultureExploreModule">${this.app?.getTranslation?.("cultureExploreModule") || "Explorar Módulo"}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    bindEvents() {
      if (!this.container) return;

      // Live search input listener
      const searchInput = this.container.querySelector("#culture-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.searchQuery = e.target.value;
          this.applyFilters();
        });
      }

      // Filter chips and actions click delegation
      this.container.addEventListener("click", (e) => {
        const filterChip = e.target.closest(".culture-filter-chip");
        if (filterChip) {
          const pillar = filterChip.getAttribute("data-pillar");
          if (pillar) {
            this.setFilter(pillar);
          }
          return;
        }

        // Passport toggle button
        const passportToggle = e.target.closest("#culture-passport-toggle-btn");
        if (passportToggle) {
          this.isPassportOpen = !this.isPassportOpen;
          const card = this.container.querySelector("#culture-passport-card");
          if (card) {
            card.classList.toggle("is-open", this.isPassportOpen);
          }
          return;
        }

        // Seal click navigation
        const sealBtn = e.target.closest("[data-seal-target]");
        if (sealBtn) {
          const tabId = sealBtn.getAttribute("data-seal-target");
          if (tabId) {
            this.markExplored(tabId);
            if (this.app?.switchTab) {
              this.app.switchTab(tabId);
            } else if (this.app?.uiController?.switchTab) {
              this.app.uiController.switchTab(tabId);
            }
          }
          return;
        }

        // Vocab bookmark deck button
        const deckBtn = e.target.closest("[data-culture-deck-mod]");
        if (deckBtn) {
          const modId = deckBtn.getAttribute("data-culture-deck-mod");
          const mod = CULTURE_MODULES_DATA.find((m) => m.id === modId);
          if (mod) {
            this.toggleVocabDeck(mod);
          }
          return;
        }

        // Trivia option click
        const triviaOptBtn = e.target.closest("[data-trivia-opt]");
        if (triviaOptBtn) {
          const optIdx = parseInt(triviaOptBtn.getAttribute("data-trivia-opt"), 10);
          this.answerTrivia(optIdx);
          return;
        }

        // Trivia next button
        const triviaNextBtn = e.target.closest("#culture-trivia-next-btn");
        if (triviaNextBtn) {
          this.nextTrivia();
          return;
        }

        // Timeline step click
        const timelineStep = e.target.closest(".timeline-step[data-dynasty]");
        if (timelineStep) {
          const dynasty = timelineStep.getAttribute("data-dynasty");
          if (dynasty) {
            this.setDynastyFilter(dynasty);
          }
          return;
        }

        // Timeline dynasty clear button
        const dynastyClearBtn = e.target.closest("#culture-dynasty-clear-btn");
        if (dynastyClearBtn) {
          this.setDynastyFilter(null);
          return;
        }

        // Search clear button
        const clearBtn = e.target.closest("#culture-search-clear");
        if (clearBtn) {
          this.searchQuery = "";
          const input = this.container.querySelector("#culture-search-input");
          if (input) {
            input.value = "";
            input.focus();
          }
          this.applyFilters();
          return;
        }

        // Reset filters button
        const resetBtn = e.target.closest("#culture-reset-filters-btn");
        if (resetBtn) {
          this.resetFilters();
          return;
        }

        // Wisdom copy button
        const copyBtn = e.target.closest("#culture-wisdom-copy-btn");
        if (copyBtn) {
          this.copyWisdomCard();
          return;
        }

        // Wisdom shuffle click
        const shuffleBtn = e.target.closest("#culture-wisdom-shuffle-btn");
        if (shuffleBtn) {
          this.shuffleWisdom();
          return;
        }

        // Wisdom audio speech
        const speakBtn = e.target.closest("#wisdom-speak-btn");
        if (speakBtn) {
          const current = CHENGYU_WISDOM_BANK[this.currentChengyuIndex];
          if (current) {
            this.speakChinese(current.hanzi);
          }
          return;
        }

        // Vocab box speech button
        const audioBtn = e.target.closest("[data-culture-audio]");
        if (audioBtn) {
          const text = audioBtn.getAttribute("data-culture-audio");
          if (text) {
            this.speakChinese(text);
          }
          return;
        }

        // Go to tab button
        const exploreBtn = e.target.closest("[data-goto-tab]");
        if (exploreBtn) {
          const tabId = exploreBtn.getAttribute("data-goto-tab");
          if (tabId) {
            this.markExplored(tabId);
            if (this.app?.switchTab) {
              this.app.switchTab(tabId);
            } else if (this.app?.uiController?.switchTab) {
              this.app.uiController.switchTab(tabId);
            }
          }
          return;
        }
      });
    }

    applyFilters() {
      if (!this.container) return;
      const cards = this.container.querySelectorAll(".culture-card");
      const clearBtn = this.container.querySelector("#culture-search-clear");
      const noResultsEl = this.container.querySelector("#culture-no-results");

      if (clearBtn) {
        clearBtn.classList.toggle("is-hidden", !this.searchQuery.trim());
      }

      let visibleCount = 0;
      cards.forEach((card) => {
        const cardId = card.getAttribute("data-card-id");
        const cardPillar = card.getAttribute("data-card-pillar");
        const mod = CULTURE_MODULES_DATA.find((m) => m.id === cardId);

        const pillarMatches = this.activePillar === "all" || cardPillar === this.activePillar;
        const searchMatches = mod ? this.matchesSearch(mod, this.searchQuery) : true;
        const dynastyMatches = !this.activeDynasty || (mod?.dynasties && mod.dynasties.includes(this.activeDynasty));

        const isVisible = pillarMatches && searchMatches && dynastyMatches;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) visibleCount++;
      });

      if (noResultsEl) {
        noResultsEl.classList.toggle("is-hidden", visibleCount > 0);
      }
    }

    setFilter(pillar) {
      this.activePillar = pillar;
      const chips = this.container?.querySelectorAll(".culture-filter-chip");
      chips?.forEach((chip) => {
        const p = chip.getAttribute("data-pillar");
        const isActive = p === pillar;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-selected", String(isActive));
      });

      this.applyFilters();
    }

    setDynastyFilter(dynastyId) {
      if (dynastyId === null || dynastyId === undefined) {
        this.activeDynasty = null;
      } else {
        this.activeDynasty = this.activeDynasty === dynastyId ? null : dynastyId;
      }
      const steps = this.container?.querySelectorAll(".timeline-step");
      steps?.forEach((step) => {
        const d = step.getAttribute("data-dynasty");
        const isActive = d === this.activeDynasty;
        step.classList.toggle("active", isActive);
      });

      // Update clear dynasty button in timeline header
      const timelineHeader = this.container?.querySelector(".timeline-header");
      if (timelineHeader) {
        let clearBtn = timelineHeader.querySelector("#culture-dynasty-clear-btn");
        if (this.activeDynasty && !clearBtn) {
          clearBtn = document.createElement("button");
          clearBtn.type = "button";
          clearBtn.className = "timeline-dynasty-clear-btn";
          clearBtn.id = "culture-dynasty-clear-btn";
          clearBtn.innerHTML = `
            <span>${this.app?.getTranslation?.("cultureDynastyAll") || "Todas las épocas"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          `;
          timelineHeader.appendChild(clearBtn);
        } else if (!this.activeDynasty && clearBtn) {
          clearBtn.remove();
        }
      }

      this.applyFilters();
    }

    resetFilters() {
      this.searchQuery = "";
      this.activePillar = "all";
      this.activeDynasty = null;

      const searchInput = this.container?.querySelector("#culture-search-input");
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }

      const chips = this.container?.querySelectorAll(".culture-filter-chip");
      chips?.forEach((chip) => {
        const isAll = chip.getAttribute("data-pillar") === "all";
        chip.classList.toggle("active", isAll);
        chip.setAttribute("aria-selected", String(isAll));
      });

      const steps = this.container?.querySelectorAll(".timeline-step");
      steps?.forEach((step) => step.classList.remove("active"));

      const clearBtn = this.container?.querySelector("#culture-dynasty-clear-btn");
      if (clearBtn) clearBtn.remove();

      this.applyFilters();
    }

    async copyWisdomCard() {
      const current = CHENGYU_WISDOM_BANK[this.currentChengyuIndex] || CHENGYU_WISDOM_BANK[0];
      const isEn = this.app?.currentLanguage === "en";
      const literal = isEn ? current.literalEn : current.literalEs;
      const desc = isEn ? current.descEn : current.descEs;

      const textToCopy = [
        `🏮 Proverbio Chino del Día (中华成语)`,
        `${current.hanzi} · ${current.pinyin}`,
        `"${literal}"`,
        `${isEn ? "Meaning:" : "Significado:"} ${desc}`,
        `— Proyecto HSK (Portal Cultural)`,
      ].join("\n");

      let success = false;
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          success = true;
        } catch {
          success = this.fallbackCopyText(textToCopy);
        }
      } else {
        success = this.fallbackCopyText(textToCopy);
      }

      if (success) {
        const copyLabel = document.getElementById("wisdom-copy-label");
        if (copyLabel) {
          const originalText = copyLabel.textContent;
          const copiedText = this.app?.getTranslation?.("cultureCopiedWisdom") || "¡Copiado!";
          copyLabel.textContent = copiedText;
          setTimeout(() => {
            if (copyLabel) copyLabel.textContent = originalText;
          }, 2000);
        }
        if (this.app?.showToast) {
          this.app.showToast(this.app?.getTranslation?.("cultureCopiedWisdom") || "¡Copiado al portapapeles!");
        }
      }
    }

    fallbackCopyText(text) {
      if (typeof document === "undefined") return false;
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
      } catch (err) {
        if (this.app?.logWarn) this.app.logWarn("Fallback copy error:", err);
        return false;
      }
    }

    shuffleWisdom() {
      let nextIndex = Math.floor(Math.random() * CHENGYU_WISDOM_BANK.length);
      if (nextIndex === this.currentChengyuIndex) {
        nextIndex = (nextIndex + 1) % CHENGYU_WISDOM_BANK.length;
      }
      this.currentChengyuIndex = nextIndex;

      const current = CHENGYU_WISDOM_BANK[this.currentChengyuIndex];
      const isEn = this.app?.currentLanguage === "en";

      const hanziEl = document.getElementById("wisdom-hanzi-text");
      const pinyinEl = document.getElementById("wisdom-pinyin-text");
      const literalEl = document.getElementById("wisdom-literal-text");
      const descEl = document.getElementById("wisdom-desc-text");

      if (hanziEl) hanziEl.textContent = current.hanzi;
      if (pinyinEl) pinyinEl.textContent = current.pinyin;
      if (literalEl) literalEl.textContent = isEn ? current.literalEn : current.literalEs;
      if (descEl) descEl.textContent = isEn ? current.descEn : current.descEs;
    }

    speakChinese(text) {
      if (!text || typeof window === "undefined") return;
      const clean = text.trim();
      if (!clean) return;

      if (this.app?.audioSynthesizer?.speak) {
        this.app.audioSynthesizer.speak(clean);
        return;
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "zh-CN";
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CultureHubController;
  }
  if (typeof window !== "undefined") {
    window.CultureHubController = CultureHubController;
  }
  if (typeof globalThis !== "undefined") {
    globalThis.CultureHubController = CultureHubController;
  }
})();
