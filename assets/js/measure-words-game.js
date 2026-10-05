// measure-words-game.js — Motor del Reto y Laboratorio de Clasificadores Chinos (量词)

class MeasureWordsGame {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.data = null;
    this.quantifiers = [];
    this.sentences = [];
    this.filteredSentences = [];
    this.currentIndex = 0;
    this.currentSentence = null;
    this.currentOptions = [];

    // Stats
    this.streak = 0;
    this.score = 0;
    this.totalAnswered = 0;
    this.hasAnsweredCurrent = false;

    // Filters and Display
    this.showPinyin = true;
    this.showTranslation = true;
    this.levelFilter = "all";
    this.categoryFilter = "all";
    this.specificClassifierFilter = null;
    this.dictSearchTerm = "";
    this.dictCategory = "all";
    this.currentView = "challenge";

    // Bound listeners for keyboard
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  async init() {
    this.container = document.getElementById("measure-words");
    if (!this.container) return;

    if (window.pendingMeasureWordFilter) {
      this.specificClassifierFilter = window.pendingMeasureWordFilter;
      window.pendingMeasureWordFilter = null;
    }

    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.applyFilters();
    this.renderCurrentSentence();
    this.renderDictionary();
    this.updateStatsUI();
  }

  cacheElements() {
    // Stats elements
    this.streakCountEl = this.container.querySelector("#mw-streak-count");
    this.scoreCountEl = this.container.querySelector("#mw-score-count");
    this.totalCountEl = this.container.querySelector("#mw-total-count");
    this.accuracyRateEl = this.container.querySelector("#mw-accuracy-rate");

    // Views
    this.viewChallenge = this.container.querySelector("#mw-view-challenge");
    this.viewDictionary = this.container.querySelector("#mw-view-dictionary");
    this.tabBtnChallenge = this.container.querySelector("#mw-tab-btn-challenge");
    this.tabBtnDictionary = this.container.querySelector("#mw-tab-btn-dictionary");

    // Active filter banner
    this.activeFilterIndicator = this.container.querySelector("#mw-active-filter-indicator");
    this.activeFilterChar = this.container.querySelector("#mw-filter-char");
    this.clearFilterBtn = this.container.querySelector("#mw-clear-filter-btn");

    // Challenge toolbar
    this.levelFilterSelect = this.container.querySelector("#mw-level-filter");
    this.categoryFilterSelect = this.container.querySelector("#mw-category-filter");
    this.togglePinyinBtn = this.container.querySelector("#mw-toggle-pinyin");
    this.toggleTransBtn = this.container.querySelector("#mw-toggle-translation");
    this.audioSentenceBtn = this.container.querySelector("#mw-audio-sentence-btn");

    // Challenge Card
    this.badgeHsk = this.container.querySelector("#mw-badge-hsk");
    this.badgeCat = this.container.querySelector("#mw-badge-cat");
    this.questionCounterEl = this.container.querySelector("#mw-question-counter");
    this.pinyinLine = this.container.querySelector("#mw-pinyin-line");
    this.partBefore = this.container.querySelector("#mw-part-before");
    this.clozeTarget = this.container.querySelector("#mw-cloze-target");
    this.targetChar = this.container.querySelector("#mw-target-char");
    this.partAfter = this.container.querySelector("#mw-part-after");
    this.translationLine = this.container.querySelector("#mw-translation-line");
    this.optionsGrid = this.container.querySelector("#mw-options-grid");

    // Feedback Panel
    this.feedbackPanel = this.container.querySelector("#mw-feedback-panel");
    this.feedbackStatus = this.container.querySelector("#mw-feedback-status");
    this.feedbackText = this.container.querySelector("#mw-feedback-text");
    this.replayAudioBtn = this.container.querySelector("#mw-replay-audio-btn");
    this.nextBtn = this.container.querySelector("#mw-next-btn");

    // Dictionary elements
    this.dictSearchInput = this.container.querySelector("#mw-dict-search");
    this.dictChipsContainer = this.container.querySelector("#mw-dict-chips");
    this.dictGrid = this.container.querySelector("#mw-dictionary-grid");
  }

  bindEvents() {
    // View Switcher
    if (this.tabBtnChallenge) {
      this.tabBtnChallenge.addEventListener("click", () => this.switchView("challenge"));
    }
    if (this.tabBtnDictionary) {
      this.tabBtnDictionary.addEventListener("click", () => this.switchView("dictionary"));
    }

    // Active filter clear button
    if (this.clearFilterBtn) {
      this.clearFilterBtn.addEventListener("click", () => {
        this.specificClassifierFilter = null;
        this.applyFilters();
        this.currentIndex = 0;
        this.renderCurrentSentence();
        this.updateActiveFilterIndicator();
      });
    }

    // Filter controls
    if (this.levelFilterSelect) {
      this.levelFilterSelect.addEventListener("change", (e) => {
        this.levelFilter = e.target.value;
        this.specificClassifierFilter = null;
        this.applyFilters();
        this.currentIndex = 0;
        this.renderCurrentSentence();
        this.updateActiveFilterIndicator();
      });
    }

    if (this.categoryFilterSelect) {
      this.categoryFilterSelect.addEventListener("change", (e) => {
        this.categoryFilter = e.target.value;
        this.specificClassifierFilter = null;
        this.applyFilters();
        this.currentIndex = 0;
        this.renderCurrentSentence();
        this.updateActiveFilterIndicator();
      });
    }

    // Toggles
    if (this.togglePinyinBtn) {
      this.togglePinyinBtn.addEventListener("click", () => {
        this.showPinyin = !this.showPinyin;
        this.togglePinyinBtn.classList.toggle("active", this.showPinyin);
        if (this.pinyinLine) {
          this.pinyinLine.classList.toggle("hidden-pinyin", !this.showPinyin);
        }
      });
    }

    if (this.toggleTransBtn) {
      this.toggleTransBtn.addEventListener("click", () => {
        this.showTranslation = !this.showTranslation;
        this.toggleTransBtn.classList.toggle("active", this.showTranslation);
        if (this.translationLine) {
          this.translationLine.classList.toggle("hidden-trans", !this.showTranslation);
        }
      });
    }

    // Sentence Audio
    if (this.audioSentenceBtn) {
      this.audioSentenceBtn.addEventListener("click", () => {
        if (this.currentSentence) {
          this.playSentenceAudio(this.currentSentence.fullSentence);
        }
      });
    }

    // Feedback Next & Replay
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.nextQuestion());
    }

    if (this.replayAudioBtn) {
      this.replayAudioBtn.addEventListener("click", () => {
        if (this.currentSentence) {
          this.playSentenceAudio(this.currentSentence.fullSentence);
        }
      });
    }

    // Dictionary search
    if (this.dictSearchInput) {
      this.dictSearchInput.addEventListener("input", (e) => {
        this.dictSearchTerm = e.target.value.trim().toLowerCase();
        this.renderDictionary();
      });
    }

    // Global keyboard listener
    window.removeEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  async loadData() {
    try {
      const response = await fetch("assets/data/measure-words-sentences.json");
      if (response.ok) {
        this.data = await response.json();
        this.quantifiers = this.data.quantifiers || [];
        this.sentences = this.data.sentences || [];
      } else {
        throw new Error(`HTTP status ${response.status}`);
      }
    } catch (err) {
      if (this.app?.logWarn) {
        this.app.logWarn("[measure-words] Failed to load json dataset:", err);
      }
      this.fallbackData();
    }
  }

  fallbackData() {
    this.quantifiers = [
      { id: "ben", hanzi: "本", pinyin: "běn", es: "Libros y publicaciones", en: "Books and publications" },
      { id: "ge", hanzi: "个", pinyin: "gè", es: "Uso general", en: "General use" },
      { id: "zhi", hanzi: "只", pinyin: "zhī", es: "Animales y aves", en: "Animals and birds" },
      { id: "zhang", hanzi: "张", pinyin: "zhāng", es: "Objetos planos", en: "Flat objects" },
      { id: "tiao", hanzi: "条", pinyin: "tiáo", es: "Cosas largas y flexibles", en: "Long flexible items" },
      { id: "jian", hanzi: "件", pinyin: "jiàn", es: "Prendas de ropa y asuntos", en: "Clothes and matters" },
      { id: "liang", hanzi: "辆", pinyin: "liàng", es: "Vehículos con ruedas", en: "Wheeled vehicles" },
      { id: "bei", hanzi: "杯", pinyin: "bēi", es: "Bebidas en vaso o taza", en: "Cups and glasses" }
    ];
    this.sentences = [
      {
        id: "sent-01",
        hsk: 1,
        category: "publications",
        sentenceBefore: "我买了一",
        sentenceAfter: "新汉语词典。",
        displaySentence: "我买了一 [ ___ ] 新汉语词典。",
        fullSentence: "我买了一本新汉语词典。",
        pinyin: "Wǒ mǎi le yì běn xīn hànyǔ cídiǎn.",
        pinyinCloze: "Wǒ mǎi le yì [ ___ ] xīn hànyǔ cídiǎn.",
        translations: { es: "Compré un nuevo diccionario de chino.", en: "I bought a new Chinese dictionary." },
        targetClassifier: "本",
        targetClassifierId: "ben",
        targetNoun: "词典",
        options: ["本", "张", "个", "条"],
        explanation: {
          es: "本 (běn) es el clasificador para libros, cuadernos, revistas y diccionarios.",
          en: "本 (běn) is used for books, notebooks, magazines, and dictionaries."
        }
      }
    ];
  }

  applyFilters() {
    let pool = [...this.sentences];

    if (this.specificClassifierFilter) {
      pool = pool.filter((s) => s.targetClassifierId === this.specificClassifierFilter || s.targetClassifier === this.specificClassifierFilter);
    } else {
      if (this.levelFilter !== "all") {
        const lvl = parseInt(this.levelFilter, 10);
        pool = pool.filter((s) => s.hsk === lvl);
      }
      if (this.categoryFilter !== "all") {
        pool = pool.filter((s) => s.category === this.categoryFilter);
      }
    }

    if (pool.length === 0) {
      pool = [...this.sentences];
    }

    this.filteredSentences = pool;
    this.updateActiveFilterIndicator();
  }

  updateActiveFilterIndicator() {
    if (!this.activeFilterIndicator) return;
    if (this.specificClassifierFilter) {
      const qData = this.quantifiers.find(
        (q) => q.id === this.specificClassifierFilter || q.hanzi === this.specificClassifierFilter
      );
      const char = qData ? `${qData.hanzi} (${qData.pinyin})` : this.specificClassifierFilter;
      if (this.activeFilterChar) this.activeFilterChar.textContent = char;
      this.activeFilterIndicator.style.display = "flex";
    } else {
      this.activeFilterIndicator.style.display = "none";
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    if (this.tabBtnChallenge) {
      this.tabBtnChallenge.classList.toggle("active", viewName === "challenge");
    }
    if (this.tabBtnDictionary) {
      this.tabBtnDictionary.classList.toggle("active", viewName === "dictionary");
    }
    if (this.viewChallenge) {
      this.viewChallenge.style.display = viewName === "challenge" ? "block" : "none";
    }
    if (this.viewDictionary) {
      this.viewDictionary.style.display = viewName === "dictionary" ? "block" : "none";
    }
  }

  renderCurrentSentence() {
    if (!this.filteredSentences || this.filteredSentences.length === 0) return;

    if (this.currentIndex >= this.filteredSentences.length) {
      this.currentIndex = 0;
    }

    const item = this.filteredSentences[this.currentIndex];
    this.currentSentence = item;
    this.hasAnsweredCurrent = false;

    // Badges & Counter
    if (this.badgeHsk) {
      this.badgeHsk.textContent = `HSK ${item.hsk || 1}`;
    }
    if (this.badgeCat) {
      this.badgeCat.textContent = this.formatCategoryName(item.category);
    }
    if (this.questionCounterEl) {
      this.questionCounterEl.textContent = `${this.currentIndex + 1} / ${this.filteredSentences.length}`;
    }

    // Sentence Texts
    const lang = this.app?.currentLanguage || "es";
    if (this.pinyinLine) {
      this.pinyinLine.textContent = item.pinyinCloze || item.pinyin;
      this.pinyinLine.classList.toggle("hidden-pinyin", !this.showPinyin);
    }

    if (this.partBefore) this.partBefore.textContent = item.sentenceBefore || "";
    if (this.partAfter) this.partAfter.textContent = item.sentenceAfter || "";
    if (this.clozeTarget) {
      this.clozeTarget.className = "mw-cloze-target";
    }
    if (this.targetChar) {
      this.targetChar.textContent = "?";
    }

    if (this.translationLine) {
      const trans = item.translations?.[lang] || item.translations?.es || item.translations?.en || "";
      this.translationLine.textContent = trans;
      this.translationLine.classList.toggle("hidden-trans", !this.showTranslation);
    }

    // Reset feedback
    if (this.feedbackPanel) {
      this.feedbackPanel.style.display = "none";
      this.feedbackPanel.className = "mw-feedback-panel";
    }

    // Render Options
    this.renderOptions(item);
  }

  renderOptions(item) {
    if (!this.optionsGrid) return;
    this.optionsGrid.innerHTML = "";

    // Generate options pool: targetClassifier + distractors, shuffled
    let opts = [...(item.options || [item.targetClassifier, "个", "本", "只"])];
    if (!opts.includes(item.targetClassifier)) {
      opts[0] = item.targetClassifier;
    }
    // Remove duplicates
    opts = [...new Set(opts)];
    // Ensure 4 options
    while (opts.length < 4) {
      const fallbackOptions = ["个", "本", "只", "张", "条", "件", "辆", "杯"];
      const candidate = fallbackOptions.find((o) => !opts.includes(o));
      if (candidate) opts.push(candidate);
      else break;
    }

    // Shuffle options predictably per question
    opts.sort(() => 0.5 - Math.random());
    this.currentOptions = opts;

    opts.forEach((optChar, idx) => {
      const qData = this.quantifiers.find((q) => q.hanzi === optChar);
      const pinyin = qData ? qData.pinyin : "";
      const lang = this.app?.currentLanguage || "es";
      const hint = qData ? (qData[lang] || qData.es || qData.en || "") : "";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mw-option-card";
      btn.setAttribute("data-option", optChar);
      btn.setAttribute("data-index", (idx + 1).toString());

      btn.innerHTML = `
        <span class="mw-option-key" aria-hidden="true">[${idx + 1}]</span>
        <span class="mw-option-char">${optChar}</span>
        <span class="mw-option-pinyin">${pinyin}</span>
        <span class="mw-option-hint">${this.truncate(hint, 28)}</span>
      `;

      btn.addEventListener("click", () => this.handleOptionSelection(optChar, btn));
      this.optionsGrid.appendChild(btn);
    });
  }

  handleOptionSelection(chosenChar, btnElement) {
    if (this.hasAnsweredCurrent || !this.currentSentence) return;
    this.hasAnsweredCurrent = true;
    this.totalAnswered += 1;

    const isCorrect = chosenChar === this.currentSentence.targetClassifier;
    const allBtns = this.optionsGrid.querySelectorAll(".mw-option-card");
    allBtns.forEach((b) => {
      b.disabled = true;
      if (b.getAttribute("data-option") === this.currentSentence.targetClassifier) {
        b.classList.add("correct");
      }
    });

    if (isCorrect) {
      this.streak += 1;
      this.score += 1;
      if (btnElement) btnElement.classList.add("correct");

      if (this.clozeTarget) {
        this.clozeTarget.classList.add("filled-correct");
      }
      if (this.targetChar) {
        this.targetChar.textContent = chosenChar;
      }

      this.app?.audioController?.playCorrect?.();

      if (this.streak >= 5 && this.streak % 5 === 0) {
        this.app?.achievementManager?.fireConfetti?.();
        this.app?.showToast?.(`¡Racha de ${this.streak} aciertos seguidos!`, "success", 2000);
      }

      this.showFeedback(true);
    } else {
      this.streak = 0;
      if (btnElement) btnElement.classList.add("incorrect");

      if (this.clozeTarget) {
        this.clozeTarget.classList.add("filled-incorrect");
      }
      if (this.targetChar) {
        this.targetChar.textContent = chosenChar;
      }

      this.app?.audioController?.playIncorrect?.();
      this.showFeedback(false);
    }

    this.updateStatsUI();
  }

  showFeedback(isCorrect) {
    if (!this.feedbackPanel) return;

    this.feedbackPanel.style.display = "block";
    this.feedbackPanel.className = `mw-feedback-panel ${isCorrect ? "success" : "error"}`;

    const lang = this.app?.currentLanguage || "es";
    const statusText = isCorrect
      ? (lang === "en" ? "Correct!" : lang === "ru" ? "Правильно!" : lang === "th" ? "ถูกต้อง!" : "¡Correcto!")
      : (lang === "en" ? "Incorrect" : lang === "ru" ? "Неверно" : lang === "th" ? "ยังไม่ถูกต้อง" : "Incorrecto");

    if (this.feedbackStatus) {
      this.feedbackStatus.textContent = statusText;
    }

    const explanation = this.currentSentence.explanation?.[lang] ||
      this.currentSentence.explanation?.es ||
      this.currentSentence.explanation?.en ||
      `El clasificador correcto es ${this.currentSentence.targetClassifier}.`;

    if (this.feedbackText) {
      this.feedbackText.textContent = explanation;
    }

    // Scroll to feedback gently if needed
    if (this.nextBtn) {
      this.nextBtn.focus();
    }
  }

  nextQuestion() {
    this.currentIndex += 1;
    if (this.currentIndex >= this.filteredSentences.length) {
      this.currentIndex = 0;
      this.app?.showToast?.("¡Completaste todas las oraciones del filtro actual!", "success", 2500);
    }
    this.renderCurrentSentence();
  }

  playSentenceAudio(text) {
    if (!text) return;
    if (this.app?.audioController?.playAudio) {
      this.app.audioController.playAudio(text);
    }
  }

  updateStatsUI() {
    if (this.streakCountEl) this.streakCountEl.textContent = this.streak.toString();
    if (this.scoreCountEl) this.scoreCountEl.textContent = this.score.toString();
    if (this.totalCountEl) this.totalCountEl.textContent = this.totalAnswered.toString();

    if (this.accuracyRateEl) {
      const rate = this.totalAnswered > 0 ? Math.round((this.score / this.totalAnswered) * 100) : 0;
      this.accuracyRateEl.textContent = `${rate}%`;
    }
  }

  onKeyDown(e) {
    // Only respond if measure-words is currently visible in DOM
    const panel = document.getElementById("measure-words");
    if (!panel || !panel.classList.contains("active")) return;
    if (this.currentView !== "challenge") return;

    // Keys 1 to 4
    if (["1", "2", "3", "4"].includes(e.key) && !this.hasAnsweredCurrent) {
      const index = parseInt(e.key, 10) - 1;
      if (this.optionsGrid) {
        const btns = this.optionsGrid.querySelectorAll(".mw-option-card");
        if (btns[index]) {
          btns[index].click();
        }
      }
      return;
    }

    // Enter or Space for Next Question
    if ((e.key === "Enter" || e.key === " ") && this.hasAnsweredCurrent) {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT") return;
      e.preventDefault();
      this.nextQuestion();
    }
  }

  // --- DICTIONARY VIEW METHODS ---

  renderDictionary() {
    if (!this.dictGrid) return;
    this.dictGrid.innerHTML = "";

    this.renderCategoryChips();

    const lang = this.app?.currentLanguage || "es";
    let list = [...this.quantifiers];

    if (this.dictCategory !== "all") {
      list = list.filter((q) => q.category === this.dictCategory);
    }

    if (this.dictSearchTerm) {
      const q = this.stripTones(this.dictSearchTerm);
      list = list.filter((item) => {
        const id = (item.id || "").toLowerCase();
        const hanzi = (item.hanzi || "").toLowerCase();
        const pinyin = (item.pinyin || "").toLowerCase();
        const pinyinClean = this.stripTones(item.pinyin);
        const es = (item.es || "").toLowerCase();
        const en = (item.en || "").toLowerCase();
        const nouns = (item.commonNouns || [])
          .map((n) => `${n.hanzi} ${n.pinyin} ${this.stripTones(n.pinyin)} ${n.es} ${n.en}`)
          .join(" ")
          .toLowerCase();
        return (
          id.includes(q) ||
          hanzi.includes(q) ||
          pinyin.includes(q) ||
          pinyinClean.includes(q) ||
          es.includes(q) ||
          en.includes(q) ||
          nouns.includes(q)
        );
      });
    }

    if (list.length === 0) {
      this.dictGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No se encontraron clasificadores con "${this.escapeHtml(this.dictSearchTerm)}".</p>
        </div>
      `;
      return;
    }

    list.forEach((q) => {
      const card = document.createElement("div");
      card.className = "mw-dict-card";

      const nounsHtml = (q.commonNouns || [])
        .slice(0, 4)
        .map((n) => `<span class="mw-noun-tag"><span class="mw-noun-tag-hanzi">${n.hanzi}</span> <span class="mw-noun-tag-es">${n[lang] || n.es || n.en}</span></span>`)
        .join("");

      const exampleHtml = q.example ? `
        <div class="mw-dict-example-box">
          <div class="mw-dict-ex-hanzi">${q.example.hanzi}</div>
          <div class="mw-dict-ex-trans">${q.example[lang] || q.example.es || q.example.en}</div>
        </div>
      ` : "";

      card.innerHTML = `
        <div class="mw-dict-card-head">
          <div class="mw-dict-char-wrap">
            <div class="mw-dict-char">${q.hanzi}</div>
            <div class="mw-dict-title-meta">
              <span class="mw-dict-pinyin">${q.pinyin}</span>
              <span class="mw-dict-cat-tag">${this.formatCategoryName(q.category)}</span>
            </div>
          </div>
          <button type="button" class="mw-mini-audio-btn" title="Escuchar pronunciación" data-audio="${q.hanzi}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
        </div>
        <p class="mw-dict-desc">${q[lang] || q.es || q.en}</p>
        <div class="mw-dict-nouns-group">
          <span class="mw-dict-nouns-label">Sustantivos típicos:</span>
          <div class="mw-dict-nouns-chips">${nounsHtml}</div>
        </div>
        ${exampleHtml}
        <div class="mw-dict-action">
          <button type="button" class="mw-practice-filter-btn" data-qid="${q.id}" data-char="${q.hanzi}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Practicar este clasificador</span>
          </button>
        </div>
      `;

      // Audio click
      const audioBtn = card.querySelector(".mw-mini-audio-btn");
      if (audioBtn) {
        audioBtn.addEventListener("click", () => this.playSentenceAudio(q.hanzi));
      }

      // Practice filter click
      const practiceBtn = card.querySelector(".mw-practice-filter-btn");
      if (practiceBtn) {
        practiceBtn.addEventListener("click", () => {
          this.specificClassifierFilter = q.id;
          this.applyFilters();
          this.currentIndex = 0;
          this.switchView("challenge");
          this.renderCurrentSentence();
          this.app?.showToast?.(`Filtrando oraciones para el clasificador "${q.hanzi}"`, "info", 1800);
        });
      }

      this.dictGrid.appendChild(card);
    });
  }

  renderCategoryChips() {
    if (!this.dictChipsContainer) return;
    this.dictChipsContainer.innerHTML = "";

    const categories = [
      { id: "all", label: "Todos" },
      { id: "general", label: "General" },
      { id: "publications", label: "Publicaciones" },
      { id: "animals", label: "Animales" },
      { id: "flat", label: "Planos" },
      { id: "long", label: "Largos" },
      { id: "clothes", label: "Ropa" },
      { id: "vehicles", label: "Vehículos" },
      { id: "containers", label: "Contenedores" },
      { id: "tools", label: "Herramientas" },
      { id: "places", label: "Lugares" }
    ];

    categories.forEach((cat) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `mw-chip-btn ${this.dictCategory === cat.id ? "active" : ""}`;
      chip.textContent = cat.label;
      chip.addEventListener("click", () => {
        this.dictCategory = cat.id;
        this.renderDictionary();
      });
      this.dictChipsContainer.appendChild(chip);
    });
  }

  formatCategoryName(categoryKey) {
    const map = {
      publications: "Publicaciones",
      animals: "Animales",
      clothes: "Ropa",
      vehicles: "Vehículos",
      containers: "Contenedores",
      flat: "Planos",
      long: "Largos",
      tools: "Instrumentos",
      machines: "Aparatos",
      places: "Lugares",
      respect: "Respeto",
      general: "General"
    };
    return map[categoryKey] || categoryKey || "General";
  }

  stripTones(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  truncate(str, max) {
    if (!str) return "";
    return str.length > max ? `${str.slice(0, max)}...` : str;
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[m]);
  }
}

window.MeasureWordsGame = MeasureWordsGame;
