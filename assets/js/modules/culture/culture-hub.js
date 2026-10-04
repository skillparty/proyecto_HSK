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

  class CultureHubController {
    constructor(app) {
      this.app = app;
      this.activePillar = "all";
      this.currentChengyuIndex = 0;
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
      if (counterEl) {
        const count = this.getExploredSet().size;
        counterEl.textContent = `${count}/${CULTURE_MODULES_DATA.length}`;
      }
    }

    render() {
      if (!this.container) return;
      const isEn = this.app?.currentLanguage === "en";
      const exploredSet = this.getExploredSet();
      const currentChengyu = CHENGYU_WISDOM_BANK[this.currentChengyuIndex] || CHENGYU_WISDOM_BANK[0];

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
              <div class="culture-hub-stat-item">
                <span class="culture-hub-stat-val" id="culture-explored-count">${exploredSet.size}/${CULTURE_MODULES_DATA.length}</span>
                <span data-i18n="cultureDiscoveredPill">${this.app?.getTranslation?.("cultureDiscoveredPill") || "Explorados"}</span>
              </div>
            </div>
          </div>

          <!-- Wisdom / Proverb Card -->
          <div class="culture-wisdom-card">
            <div class="wisdom-header">
              <h3 class="wisdom-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v4M12 18v4M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>
                <span data-i18n="cultureDailyWisdom">${this.app?.getTranslation?.("cultureDailyWisdom") || "Sabiduría Milenaria (Proverbio del Día)"}</span>
              </h3>
              <button type="button" class="wisdom-shuffle-btn" id="culture-wisdom-shuffle-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                <span data-i18n="cultureShuffleWisdom">${this.app?.getTranslation?.("cultureShuffleWisdom") || "Otro Proverbio"}</span>
              </button>
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

          <!-- Pillar Filters Bar -->
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

          <!-- Cultural Cards Grid -->
          <div class="culture-cards-grid" id="culture-cards-grid">
            ${this.renderModuleCards(exploredSet, isEn)}
          </div>

          <!-- Timeline Ribbon -->
          <div class="culture-timeline-card">
            <h3 class="timeline-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Eje Cronológico de las Dinastías y Logros Culturales</span>
            </h3>
            <div class="timeline-ribbon">
              <div class="timeline-step">
                <span class="step-dynasty">Shang & Zhou</span>
                <span class="step-period">1600 - 256 a.C.</span>
                <p class="step-highlight">Huesos oraculares (甲骨文), fundición de bronce ceremonial y filosofía clásica.</p>
              </div>
              <div class="timeline-step">
                <span class="step-dynasty">Qin & Han</span>
                <span class="step-period">221 a.C. - 220 d.C.</span>
                <p class="step-highlight">Unificación de caracteres, Gran Muralla, papel e inicio de la Ruta de la Seda.</p>
              </div>
              <div class="timeline-step">
                <span class="step-dynasty">Tang & Song</span>
                <span class="step-period">618 - 1279 d.C.</span>
                <p class="step-highlight">Edad de oro de la poesía, pintura al aguafuerte, brújula e imprenta de tipos móviles.</p>
              </div>
              <div class="timeline-step">
                <span class="step-dynasty">Ming & Qing</span>
                <span class="step-period">1368 - 1912 d.C.</span>
                <p class="step-highlight">Ciudad Prohibida, esplendor de la Ópera de Pekín, porcelana y enciclopedia médica.</p>
              </div>
              <div class="timeline-step">
                <span class="step-dynasty">China Contemporánea</span>
                <span class="step-period">1912 - Presente</span>
                <p class="step-highlight">Estandarización Pinyin y caracteres simplificados, alta velocidad y vanguardia global.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = html;
    }

    renderModuleCards(exploredSet, isEn) {
      return CULTURE_MODULES_DATA.map((mod) => {
        const isExplored = exploredSet.has(mod.id);
        const isHidden = this.activePillar !== "all" && this.activePillar !== mod.pillar;
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
                <button type="button" class="culture-card-audio-btn" data-culture-audio="${mod.vocabHanzi}" title="Escuchar ${mod.vocabHanzi}">
                  ${window.hskIcons?.render?.("volume", { size: 13 }) || ""}
                </button>
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

      // Filter chips click
      this.container.addEventListener("click", (e) => {
        const filterChip = e.target.closest(".culture-filter-chip");
        if (filterChip) {
          const pillar = filterChip.getAttribute("data-pillar");
          if (pillar) {
            this.setFilter(pillar);
          }
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

    setFilter(pillar) {
      this.activePillar = pillar;
      const chips = this.container?.querySelectorAll(".culture-filter-chip");
      chips?.forEach((chip) => {
        const p = chip.getAttribute("data-pillar");
        const isActive = p === pillar;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-selected", String(isActive));
      });

      const cards = this.container?.querySelectorAll(".culture-card");
      cards?.forEach((card) => {
        const cardPillar = card.getAttribute("data-card-pillar");
        if (pillar === "all" || cardPillar === pillar) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
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
