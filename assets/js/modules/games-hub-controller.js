// games-hub-controller.js — Controlador del Salón de Juegos Arcade HSK (Confuc10++)

class GamesHubController {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.activeFilter = "all";
    this.searchTerm = "";

    this.gamesList = [
      {
        id: "tones-invaders",
        tabId: "tones-invaders",
        title: "Invasores de Tonos",
        titleEn: "Tones Invaders",
        titleRu: "Захватчики тонов",
        titleTh: "ยานรบฝึกวรรณยุกต์",
        hanzi: "声调战机",
        category: "tones",
        levels: "HSK 1 - 6",
        skill: "Tonos & Oído",
        skillEn: "Tones & Listening",
        skillRu: "Тоны и слух",
        skillTh: "เสียงวรรณยุกต์และการฟัง",
        desc: "Destruye caracteres espaciales reconociendo su tono fonético (1º al 5º tono). ¡Pon a prueba tus reflejos auditivos!",
        descEn: "Shoot falling space characters by identifying their correct phonetic tone (1st to 5th tone). Test your auditory reflexes!",
        descRu: "Сбивайте падающие иероглифы, определяя их верный тон (с 1 по 5). Проверьте свою слуховую реакцию!",
        descTh: "ยิงทำลายตัวอักษรที่ตกลงมาโดยระบุเสียงวรรณยุกต์ที่ถูกต้อง (เสียง 1 ถึง 5) ทดสอบการฟังและความไว!",
        modes: ["HSK 1-6", "Fácil / Normal / Difícil", "Teclado [1-5] o Táctil"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))",
        iconColor: "#ef4444",
        scoreKey: "tonesInvadersHighScore"
      },
      {
        id: "snake-quantifiers",
        tabId: "snake-quantifiers",
        title: "Viborita de Clasificadores",
        titleEn: "Quantifier Snake",
        titleRu: "Змейка счетных слов",
        titleTh: "งูกินคำลักษณนาม",
        hanzi: "量词贪吃蛇",
        category: "grammar",
        levels: "HSK 1 - 3",
        skill: "Clasificadores & Gramática",
        skillEn: "Classifiers & Grammar",
        skillRu: "Счетные слова и грамматика",
        skillTh: "ลักษณนามและไวยากรณ์",
        desc: "Conduce la serpiente hacia sustantivos compatibles con el clasificador objetivo. ¡Incluye modo Versus para 2 jugadores!",
        descEn: "Guide the snake to hunt nouns that match the active classifier. Includes 2-player local Versus mode!",
        descRu: "Управляйте змейкой, собирая существительные, подходящие к текущему счетному слову. Есть режим дуэли для 2 игроков!",
        descTh: "บังคับงูให้กินคำนามที่ตรงกับลักษณนามเป้าหมาย มีโหมดประลอง 2 คนในเครื่องเดียว!",
        modes: ["1P Solo", "2P Versus (WASD + Flechas)", "Fácil / Normal / Difícil"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a4 4 0 0 0 4 4h2a2 2 0 0 1 2 2v2"></path><path d="M8 22a4 4 0 0 1-4-4c0-1.5.8-2.8 2-3.5V12a4 4 0 0 0-4-4H0"></path><circle cx="12" cy="5" r="1"></circle></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
        iconColor: "#10b981",
        scoreKey: "snakeHighScore"
      },
      {
        id: "hanzi-builder",
        tabId: "hanzi-builder",
        title: "Constructor de Hanzi",
        titleEn: "Hanzi Builder",
        titleRu: "Конструктор иероглифов",
        titleTh: "สร้างตัวอักษรจีน",
        hanzi: "汉字拼图",
        category: "radicals",
        levels: "HSK 1 - 6",
        skill: "Radicales & Anatomía",
        skillEn: "Radicals & Anatomy",
        skillRu: "Ключи и анатомия",
        skillTh: "หมวดนำและโครงสร้างอักษร",
        desc: "Ensambla caracteres chinos seleccionando sus componentes y radicales en el orden de trazo correcto bajo presión.",
        descEn: "Assemble Chinese characters by picking their radical components in stroke order before the countdown expires.",
        descRu: "Собирайте иероглифы из базовых радикалов и ключей в правильном порядке за отведенное время.",
        descTh: "ประกอบตัวอักษรจีนจากหมวดนำและส่วนประกอบย่อยตามลำดับให้ทันเวลา",
        modes: ["Contrarreloj 60s", "Filtro HSK 1-6", "Feedback háptico"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))",
        iconColor: "#3b82f6",
        scoreKey: "hanziBuilderHighScore"
      },
      {
        id: "word-linker",
        tabId: "word-linker",
        title: "Conector de Palabras",
        titleEn: "Word Linker",
        titleRu: "Соединитель слов",
        titleTh: "เชื่อมคำศัพท์ HSK",
        hanzi: "词语连线",
        category: "vocab",
        levels: "HSK 1 - 6",
        skill: "Vocabulario Compuesto",
        skillEn: "Compound Vocabulary",
        skillRu: "Словарный запас",
        skillTh: "คำศัพท์ประสม",
        desc: "Sopa de letras interactiva: localiza y une caracteres adyacentes para formar palabras HSK de dos sílabas.",
        descEn: "Word search grid: link paired characters to form valid two-syllable HSK vocabulary terms.",
        descRu: "Интерактивный поиск слов: соединяйте соседние иероглифы в устойчивые двусложные слова HSK.",
        descTh: "ตารางค้นหาคำ: เชื่อมโยงตัวอักษรที่อยู่ติดกันเพื่อสร้างคำศัพท์ HSK สองพยางค์",
        modes: ["Contrarreloj 90s", "Pistas de Audio", "Soporte HSK 1-6"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))",
        iconColor: "#ec4899",
        scoreKey: "wordLinkerHighScore"
      },
      {
        id: "sentence-builder",
        tabId: "sentence-builder",
        title: "Constructor de Oraciones",
        titleEn: "Sentence Builder",
        titleRu: "Мастер предложений",
        titleTh: "สร้างประโยคภาษาจีน",
        hanzi: "造句大师",
        category: "grammar",
        levels: "HSK 1 - 6",
        skill: "Sintaxis & Estructura",
        skillEn: "Syntax & Sentence Order",
        skillRu: "Синтаксис и порядок слов",
        skillTh: "ไวยากรณ์และเรียงประโยค",
        desc: "Arrastra u ordena bloques de palabras para formar oraciones coherentes según las reglas de sintaxis del mandarín.",
        descEn: "Arrange scrambled word blocks into natural Mandarin sentences following Chinese word-order rules.",
        descRu: "Расставляйте блоки слов в правильном синтаксическом порядке китайского языка.",
        descTh: "จัดเรียงบล็อกคำศัพท์ให้เป็นประโยคภาษาจีนที่ถูกต้องตามหลักไวยากรณ์",
        modes: ["Práctica Libre", "Contrarreloj 60s", "Racha de aciertos"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))",
        iconColor: "#f59e0b",
        scoreKey: "sentenceBuilderHighScore"
      },
      {
        id: "hanzi-mahjong",
        tabId: "hanzi-mahjong",
        title: "Mahjong de Hanzi",
        titleEn: "Hanzi Mahjong",
        titleRu: "Маджонг иероглифов",
        titleTh: "ไพ่นกกระจอกอักษรจีน",
        hanzi: "汉字麻将",
        category: "radicals",
        levels: "HSK 1 - 6",
        skill: "Memoria & Emparejamiento",
        skillEn: "Tile Pairing & Memory",
        skillRu: "Парные плитки и память",
        skillTh: "จับคู่และฝึกความจำ",
        desc: "Empareja fichas tradicionales combinando radicales complementarios o palabras compuestas antes de que se agote el tiempo.",
        descEn: "Match traditional tiles by combining complementary radicals or compound words under timed pressure.",
        descRu: "Собирайте пары традиционных фишек маджонга, соединяя родственные ключи или части слов.",
        descTh: "จับคู่แผ่นไพ่นกกระจอกจีนโบราณโดยรวมหมวดนำที่เข้ากันหรือคำประสม",
        modes: ["Radicales (部首)", "Palabras HSK (词语)", "Fácil / Normal / Maestro"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))",
        iconColor: "#0ea5e9",
        scoreKey: "mahjongHighScore"
      },
      {
        id: "matrix",
        tabId: "matrix",
        title: "Lluvia Digital Hanzi",
        titleEn: "Hanzi Matrix Rain",
        titleRu: "Матрица иероглифов",
        titleTh: "ฝนดิจิทัลอักษรจีน",
        hanzi: "汉字雨",
        category: "vocab",
        levels: "HSK 1 - 6",
        skill: "Lectura Rápida & Audición",
        skillEn: "Speed Reading & Audio",
        skillRu: "Скорочтение и аудио",
        skillTh: "การอ่านเร็วและฟังเสียง",
        desc: "Cascada cibernética de caracteres chinos con síntesis de voz en tiempo real y selector de velocidad para lectura rápida.",
        descEn: "Cyberpunk digital cascade of Chinese characters with real-time speech synthesis and speed regulation.",
        descRu: "Киберпанк-водопад иероглифов с озвучкой в реальном времени и регулировкой скорости чтения.",
        descTh: "สายฝนตัวอักษรจีนสไตล์ไซเบอร์พังก์พร้อมเสียงอ่านสังเคราะห์แบบเรียลไทม์",
        modes: ["Modo Cascada", "Síntesis de voz zh-CN", "Ajuste de velocidad"],
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
        bgGradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
        iconColor: "#22c55e",
        scoreKey: "matrixHighScore"
      }
    ];

    this.boundPreventScroll = this.onGameKeyScrollLock.bind(this);
  }

  init() {
    this.container = document.getElementById("games");
    if (!this.container) return;

    this.cacheElements();
    this.bindEvents();
    this.renderHeroStats();
    this.renderFeaturedGame();
    this.renderCards();
    this.setupInGameNavigationBars();
    this.setupKeyboardScrollLock();
  }

  cacheElements() {
    this.grid = this.container.querySelector("#gh-games-grid");
    this.chips = this.container.querySelectorAll(".gh-chip-btn");
    this.searchInput = this.container.querySelector("#gh-search-input");
    this.totalGamesEl = this.container.querySelector("#gh-total-games-count");
    this.highScoresSumEl = this.container.querySelector("#gh-high-scores-sum");
    this.gamesPlayedEl = this.container.querySelector("#gh-games-played-count");
    this.featuredTitle = this.container.querySelector("#gh-featured-title");
    this.featuredDesc = this.container.querySelector("#gh-featured-desc");
    this.featuredSkill = this.container.querySelector("#gh-featured-skill");
    this.featuredPlayBtn = this.container.querySelector("#gh-featured-play-btn");
  }

  bindEvents() {
    // Chips filter
    if (this.chips) {
      this.chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          this.chips.forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-selected", "false");
          });
          chip.classList.add("active");
          chip.setAttribute("aria-selected", "true");
          this.activeFilter = chip.getAttribute("data-filter") || "all";
          this.renderCards();
        });
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.renderCards();
      });
    }

    // Featured game button
    if (this.featuredPlayBtn) {
      this.featuredPlayBtn.addEventListener("click", () => {
        const targetTab = this.featuredPlayBtn.getAttribute("data-target-tab");
        if (targetTab && this.app?.switchTab) {
          this.app.switchTab(targetTab);
        }
      });
    }
  }

  renderHeroStats() {
    let totalScore = 0;
    this.gamesList.forEach((g) => {
      const score = this.getGameHighScore(g);
      totalScore += score;
    });

    if (this.totalGamesEl) this.totalGamesEl.textContent = this.gamesList.length.toString();
    if (this.highScoresSumEl) this.highScoresSumEl.textContent = totalScore.toLocaleString();
    if (this.gamesPlayedEl) {
      const played = parseInt(localStorage.getItem("hsk_total_games_played") || "0", 10);
      this.gamesPlayedEl.textContent = played.toString();
    }
  }

  renderFeaturedGame() {
    // Determine daily featured game based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const game = this.gamesList[dayOfYear % this.gamesList.length];

    const lang = this.app?.currentLanguage || "es";
    const title = lang === "en" ? game.titleEn : lang === "ru" ? game.titleRu : lang === "th" ? game.titleTh : game.title;
    const desc = lang === "en" ? game.descEn : lang === "ru" ? game.descRu : lang === "th" ? game.descTh : game.desc;
    const skill = lang === "en" ? game.skillEn : lang === "ru" ? game.skillRu : lang === "th" ? game.skillTh : game.skill;

    if (this.featuredTitle) this.featuredTitle.textContent = `${title} · ${game.hanzi}`;
    if (this.featuredDesc) this.featuredDesc.textContent = desc;
    if (this.featuredSkill) this.featuredSkill.textContent = skill;
    if (this.featuredPlayBtn) this.featuredPlayBtn.setAttribute("data-target-tab", game.tabId);
  }

  renderCards() {
    if (!this.grid) return;
    this.grid.innerHTML = "";

    const lang = this.app?.currentLanguage || "es";
    let filtered = [...this.gamesList];

    // Filter by skill
    if (this.activeFilter !== "all") {
      filtered = filtered.filter((g) => g.category === this.activeFilter);
    }

    // Filter by search
    if (this.searchTerm) {
      const term = this.searchTerm;
      filtered = filtered.filter((g) => {
        const title = (g.title || "").toLowerCase();
        const titleEn = (g.titleEn || "").toLowerCase();
        const hanzi = (g.hanzi || "").toLowerCase();
        const skill = (g.skill || "").toLowerCase();
        const desc = (g.desc || "").toLowerCase();
        return title.includes(term) || titleEn.includes(term) || hanzi.includes(term) || skill.includes(term) || desc.includes(term);
      });
    }

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <p>No se encontraron juegos que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((game) => {
      const card = document.createElement("article");
      card.className = "gh-game-card";

      const title = lang === "en" ? game.titleEn : lang === "ru" ? game.titleRu : lang === "th" ? game.titleTh : game.title;
      const desc = lang === "en" ? game.descEn : lang === "ru" ? game.descRu : lang === "th" ? game.descTh : game.desc;
      const skill = lang === "en" ? game.skillEn : lang === "ru" ? game.skillRu : lang === "th" ? game.skillTh : game.skill;
      const highScore = this.getGameHighScore(game);

      const mechsHtml = game.modes
        .map((m) => `<span class="gh-mech-tag">${m}</span>`)
        .join("");

      card.innerHTML = `
        <div class="gh-card-header">
          <div class="gh-card-icon-avatar" style="background: ${game.bgGradient}; color: ${game.iconColor};">
            ${game.iconSvg}
          </div>
          <div class="gh-card-title-group">
            <div class="gh-card-title-row">
              <h3 class="gh-card-name">${title}</h3>
              <span class="gh-card-hanzi">${game.hanzi}</span>
            </div>
            <div class="gh-card-badges">
              <span class="gh-tag gh-tag-level">${game.levels}</span>
              <span class="gh-tag gh-tag-skill">${skill}</span>
            </div>
          </div>
        </div>

        <p class="gh-card-desc">${desc}</p>

        <div class="gh-card-mechanics">
          ${mechsHtml}
        </div>

        <div class="gh-card-footer">
          <div class="gh-card-score">
            <span class="gh-score-label">Récord Personal</span>
            <span class="gh-score-val">${highScore > 0 ? highScore.toLocaleString() + " pts" : "—"}</span>
          </div>
          <button type="button" class="gh-btn-play" data-tab-launch="${game.tabId}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Jugar</span>
          </button>
        </div>
      `;

      const playBtn = card.querySelector(".gh-btn-play");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          this.recordGameLaunch();
          if (this.app?.switchTab) {
            this.app.switchTab(game.tabId);
          }
        });
      }

      this.grid.appendChild(card);
    });
  }

  getGameHighScore(game) {
    let hs = 0;
    try {
      if (window.app?.stats && game.scoreKey && window.app.stats[game.scoreKey]) {
        hs = Math.max(hs, parseInt(window.app.stats[game.scoreKey], 10) || 0);
      }
      // Check localStorage common keys
      const localDirect = localStorage.getItem(game.scoreKey);
      if (localDirect) hs = Math.max(hs, parseInt(localDirect, 10) || 0);

      // Check quantifier-snake prefixes
      if (game.id === "snake-quantifiers") {
        ["easy", "normal", "hard"].forEach((diff) => {
          const v = localStorage.getItem(`quantifier-snake-highscore-all-${diff}`);
          if (v) hs = Math.max(hs, parseInt(v, 10) || 0);
        });
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return hs;
  }

  recordGameLaunch() {
    try {
      const current = parseInt(localStorage.getItem("hsk_total_games_played") || "0", 10);
      localStorage.setItem("hsk_total_games_played", (current + 1).toString());
      if (this.gamesPlayedEl) {
        this.gamesPlayedEl.textContent = (current + 1).toString();
      }
    } catch {
      // Ignore
    }
  }

  // --- IN-GAME ARCADE NAVIGATION BAR INJECTION ---
  setupInGameNavigationBars() {
    this.gamesList.forEach((game) => {
      const tabEl = document.getElementById(game.tabId);
      if (!tabEl) return;

      // Avoid injecting multiple times
      if (tabEl.querySelector(".game-arcade-topbar")) return;

      const topBar = document.createElement("nav");
      topBar.className = "game-arcade-topbar";
      topBar.setAttribute("aria-label", "Navegación arcade");

      const optionsHtml = this.gamesList
        .map((g) => `<option value="${g.tabId}" ${g.tabId === game.tabId ? "selected" : ""}>${g.title}</option>`)
        .join("");

      topBar.innerHTML = `
        <div class="game-breadcrumb-group">
          <a href="#games" class="game-breadcrumb-back" data-action="return-games" title="Volver al Salón de Juegos Arcade">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Salón de Juegos</span>
          </a>
          <span class="game-breadcrumb-sep">/</span>
          <span class="game-breadcrumb-current">${game.title}</span>
        </div>

        <div class="game-quick-tools">
          <label for="switcher-${game.tabId}" class="sr-only">Cambiar de juego:</label>
          <select id="switcher-${game.tabId}" class="game-switcher-select" aria-label="Cambiar de juego rápidamente">
            ${optionsHtml}
          </select>
          <button type="button" class="game-tool-btn" data-action="toggle-audio" title="Activar / Desactivar Sonido">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
        </div>
      `;

      // Back to games hub
      const backBtn = topBar.querySelector('[data-action="return-games"]');
      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.app?.switchTab) this.app.switchTab("games");
        });
      }

      // Quick switcher
      const switcher = topBar.querySelector(".game-switcher-select");
      if (switcher) {
        switcher.addEventListener("change", (e) => {
          const nextTab = e.target.value;
          if (nextTab && this.app?.switchTab) {
            this.app.switchTab(nextTab);
          }
        });
      }

      // Audio toggle
      const audioBtn = topBar.querySelector('[data-action="toggle-audio"]');
      if (audioBtn) {
        audioBtn.addEventListener("click", () => {
          if (this.app?.audioController?.toggleAudio) {
            this.app.audioController.toggleAudio();
          }
        });
      }

      // Prepend inside shell or container
      const shell = tabEl.querySelector(".snakeq-shell, .tones-inv-shell, .hanzi-build-shell, .word-link-shell, .sentence-builder-container, .mahjong-container, .matrix-game-container");
      if (shell) {
        shell.insertBefore(topBar, shell.firstChild);
      } else {
        tabEl.insertBefore(topBar, tabEl.firstChild);
      }
    });
  }

  // --- KEYBOARD SCROLL LOCK FOR ARCADE GAMES ---
  setupKeyboardScrollLock() {
    window.removeEventListener("keydown", this.boundPreventScroll);
    window.addEventListener("keydown", this.boundPreventScroll, { passive: false });
  }

  onGameKeyScrollLock(e) {
    const activePanel = document.querySelector(".tab-panel.active");
    if (!activePanel) return;

    const gameTabIds = ["snake-quantifiers", "tones-invaders", "matrix", "hanzi-builder", "word-linker", "sentence-builder", "hanzi-mahjong"];
    const currentTab = activePanel.getAttribute("data-tab") || activePanel.id;

    if (gameTabIds.includes(currentTab)) {
      // If user presses arrows or space inside gameplay canvas/area and NOT inside an input/select
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
          e.preventDefault();
        }
      }
    }
  }
}

window.GamesHubController = GamesHubController;
