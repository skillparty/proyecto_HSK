/**
 * EtymologyController
 * Top-level module inspired by Pedro Ceinos' «Manual de Escritura de los
 * Caracteres Chinos». Groups characters by theme/component and explains the
 * "why" of each grouping, with Pleco/KTdict-style animated stroke order
 * (powered by hanzi-writer) plus an etymological component breakdown and,
 * in Sección B, example vocabulary built from each character.
 *
 * Content is Spanish-only for now; an English version is announced as coming
 * soon.
 */
class EtymologyController {
  constructor(app) {
    this.app = app;
    this.containerId = "etymology-content";
    this.dataUrls = [
      "assets/data/etymology/seccion-a.json?v=2",
      "assets/data/etymology/seccion-b.json?v=24",
      "assets/data/etymology/seccion-c.json?v=5",
    ];
    this.strokeBaseUrl = "assets/data/etymology/strokes/";
    this.hanziWriterUrl = "assets/vendor/hanzi-writer.min.js";

    this.sections = []; // [{ section, title, intro, source, lessons, families, charIndex }]
    this.isInitialized = false;

    this.activeSectionId = "A";
    this.activeView = "lessons"; // "lessons" | "families"
    this.activeLessonId = null;
    this.activeFamily = null;
    this.selectedHanzi = null;
    this.writer = null;

    this.selectedHanziSet = new Set();
    this.isSelectionMode = false;
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  get section() {
    return (
      this.sections.find((s) => s.section === this.activeSectionId) ||
      this.sections[0]
    );
  }

  async initialize() {
    if (this.isInitialized) {
      this.render();
      return;
    }
    this.renderLoading();
    try {
      await Promise.all([this.loadData(), this.loadHanziWriter()]);
      this.sections.forEach((s) => this.buildIndexes(s));
      this.resetSelection();
      this.isInitialized = true;
      this.render();
    } catch (err) {
      console.error("[Etymology] init failed:", err);
      this.renderError(err && err.message ? err.message : String(err));
    }
  }

  async loadData() {
    const results = await Promise.all(
      this.dataUrls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`No se pudo cargar el contenido (${res.status})`);
        return res.json();
      })
    );
    this.sections = results;
  }

  loadHanziWriter() {
    if (window.HanziWriter) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(
        `script[src="${this.hanziWriterUrl}"]`
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("No se pudo cargar hanzi-writer"))
        );
        return;
      }
      const script = document.createElement("script");
      script.src = this.hanziWriterUrl;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar hanzi-writer"));
      document.head.appendChild(script);
    });
  }

  buildIndexes(section) {
    const charIndex = new Map();
    const familyMap = new Map();

    section.lessons.forEach((lesson) => {
      lesson.chars.forEach((entry) => {
        charIndex.set(entry.hanzi, {
          ...entry,
          lessonId: lesson.id,
          theme: lesson.theme,
        });
        (entry.components || []).forEach((comp) => {
          if (!comp || !comp.char) return;
          if (!familyMap.has(comp.char)) {
            familyMap.set(comp.char, { gloss: comp.gloss || "", members: new Set() });
          }
          const fam = familyMap.get(comp.char);
          if (!fam.gloss && comp.gloss) fam.gloss = comp.gloss;
          fam.members.add(entry.hanzi);
        });
      });
    });

    section.charIndex = charIndex;
    section.families = Array.from(familyMap.entries())
      .map(([component, info]) => ({
        component,
        gloss: info.gloss,
        members: Array.from(info.members),
      }))
      .filter((fam) => fam.members.length >= 2)
      .sort((a, b) => b.members.length - a.members.length);
  }

  resetSelection() {
    const s = this.section;
    this.activeView = "lessons";
    this.activeLessonId = s.lessons[0] ? s.lessons[0].id : null;
    this.activeFamily = s.families[0] ? s.families[0].component : null;
    this.selectedHanzi =
      s.lessons[0] && s.lessons[0].chars[0] ? s.lessons[0].chars[0].hanzi : null;
  }

  /* ---------- rendering ---------- */

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="etym-loading">
        <div class="etym-spinner" role="status" aria-label="Cargando"></div>
        <p>Cargando etimología...</p>
      </div>`;
  }

  renderError(msg) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="etym-error" role="alert">
        <div class="etym-error-icon" aria-hidden="true">⚠️</div>
        <p class="etym-error-title">No se pudo cargar el módulo</p>
        <p class="etym-error-msg">${this.escape(msg)}</p>
        <button class="etym-retry" type="button">Reintentar</button>
      </div>`;
    const retry = this.container.querySelector(".etym-retry");
    if (retry) {
      retry.addEventListener("click", () => {
        this.isInitialized = false;
        this.initialize();
      });
    }
  }

  render() {
    if (!this.container) return;
    const s = this.section;

    this.container.innerHTML = `
      <section class="etym-wrap ${this.isSelectionMode ? "selection-mode-active" : ""}" aria-label="Etimología de caracteres">
        ${this.renderHeader(s)}
        ${this.renderSelectionBar()}
        ${this.renderSectionTabs()}
        ${this.renderViewToggle()}
        <div class="etym-body">
          <div class="etym-left">
            ${this.activeView === "lessons" ? this.renderLessonsNav(s) : this.renderFamiliesNav(s)}
            ${this.renderLessonIntro(s)}
            <div class="etym-grid" id="etym-grid">
              ${this.renderGrid()}
            </div>
          </div>
          <aside class="etym-detail" id="etym-detail" aria-live="polite">
            ${this.renderDetail()}
          </aside>
        </div>
        ${this.renderFooter(s)}
      </section>`;

    this.bindEvents();
    this.mountWriter();
  }

  renderHeader(s) {
    const selCount = this.selectedHanziSet.size;
    return `
      <header class="etym-header">
        <div class="etym-header-text">
          <h2 class="etym-title">${this.escape(s.title)}</h2>
          <p class="etym-intro">${this.escape(s.intro)}</p>
        </div>
        <div class="etym-header-actions">
          <button type="button" class="btn btn-secondary btn-sm etym-pdf-btn" id="etym-export-pdf-btn" title="Generar PDF imprimible de tarjetas y hojas de práctica" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Exportar PDF</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm etym-select-btn ${this.isSelectionMode ? "is-active" : ""}" id="etym-select-mode-btn" title="Activar/desactivar modo selección">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span id="etym-select-mode-text">Seleccionar</span>
            <span id="etym-selected-badge" class="badge-count" style="display:${selCount > 0 ? "inline-block" : "none"};">${selCount}</span>
          </button>
          <span class="etym-lang-badge" title="Próximamente en inglés">
            🌐 English coming soon
          </span>
        </div>
      </header>`;
  }

  renderSelectionBar() {
    const selCount = this.selectedHanziSet.size;
    return `
      <div id="etym-selection-bar" class="selection-floating-bar" style="display:${(this.isSelectionMode || selCount > 0) ? "flex" : "none"}; margin-bottom: 1rem;">
        <div class="selection-bar-info">
          <span id="etym-selected-text">${selCount} seleccionados</span>
        </div>
        <div class="selection-bar-actions">
          <button type="button" id="etym-select-all-btn" class="btn btn-sm btn-outline">Seleccionar visibles</button>
          <button type="button" id="etym-clear-selection-btn" class="btn btn-sm btn-outline">Deseleccionar</button>
          <button type="button" id="etym-print-selected-btn" class="btn btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span id="etym-print-selected-text">Generar PDF (${selCount})</span>
          </button>
        </div>
      </div>`;
  }

  renderSectionTabs() {
    const labels = {
      A: "Sección A · Pictográficos",
      B: "Sección B · Compuestos",
      C: "Sección C · Por radical",
    };
    return `
      <div class="etym-section-tabs" role="tablist" aria-label="Secciones del libro">
        ${this.sections
          .map(
            (s) => `
            <button class="etym-section-tab ${
              s.section === this.activeSectionId ? "is-active" : ""
            }" role="tab" aria-selected="${s.section === this.activeSectionId}"
              data-section="${s.section}" type="button">
              ${labels[s.section] || "Sección " + s.section}
            </button>`
          )
          .join("")}
      </div>`;
  }

  renderViewToggle() {
    return `
      <div class="etym-toggle" role="tablist" aria-label="Modo de agrupación">
        <button class="etym-toggle-btn ${
          this.activeView === "lessons" ? "is-active" : ""
        }" role="tab" aria-selected="${this.activeView === "lessons"}"
          data-view="lessons" type="button">Lecciones por tema</button>
        <button class="etym-toggle-btn ${
          this.activeView === "families" ? "is-active" : ""
        }" role="tab" aria-selected="${this.activeView === "families"}"
          data-view="families" type="button">Familias por componente</button>
      </div>`;
  }

  renderLessonsNav(s) {
    const chips = s.lessons
      .map(
        (lesson) => `
          <button class="etym-chip ${
            lesson.id === this.activeLessonId ? "is-active" : ""
          }" data-lesson="${lesson.id}" type="button">
            <span class="etym-chip-icon">${lesson.icon}</span>
            <span class="etym-chip-label">${lesson.id} · ${this.escape(lesson.theme)}</span>
          </button>`
      )
      .join("");
    return `<nav class="etym-chips" aria-label="Lecciones">${chips}</nav>`;
  }

  renderFamiliesNav(s) {
    const chips = s.families
      .map(
        (fam) => `
          <button class="etym-chip ${
            fam.component === this.activeFamily ? "is-active" : ""
          }" data-family="${fam.component}" type="button">
            <span class="etym-chip-icon">${fam.component}</span>
            <span class="etym-chip-label">${this.escape(fam.gloss || fam.component)} · ${fam.members.length}</span>
          </button>`
      )
      .join("");
    return `<nav class="etym-chips" aria-label="Familias por componente">
      <p class="etym-fam-hint">Caracteres que comparten un mismo componente y el porqué de esa relación.</p>
      ${chips}</nav>`;
  }

  renderLessonIntro(s) {
    if (this.activeView !== "lessons") return "";
    const lesson = s.lessons.find((l) => l.id === this.activeLessonId);
    if (!lesson || !lesson.intro) return "";
    return `<p class="etym-lesson-intro">${this.escape(lesson.intro)}</p>`;
  }

  currentChars() {
    const s = this.section;
    if (this.activeView === "lessons") {
      const lesson = s.lessons.find((l) => l.id === this.activeLessonId);
      return lesson ? lesson.chars : [];
    }
    const fam = s.families.find((f) => f.component === this.activeFamily);
    if (!fam) return [];
    return fam.members.map((h) => s.charIndex.get(h)).filter(Boolean);
  }

  renderGrid() {
    const chars = this.currentChars();
    if (!chars.length) {
      return `<p class="etym-empty">Sin caracteres en esta selección.</p>`;
    }
    return chars
      .map(
        (entry) => {
          const isSelected = this.selectedHanziSet.has(entry.hanzi);
          return `
          <div class="etym-card-wrap ${isSelected ? "is-card-selected" : ""}">
            <label class="etym-card-select-label" title="Seleccionar para PDF">
              <input type="checkbox" class="etym-card-checkbox" data-hanzi="${entry.hanzi}" aria-label="Seleccionar ${entry.hanzi} para PDF" ${isSelected ? "checked" : ""}>
              <span class="etym-card-select-custom"></span>
            </label>
            <button class="etym-card ${
              entry.hanzi === this.selectedHanzi ? "is-selected" : ""
            }" data-hanzi="${entry.hanzi}" type="button"
              aria-label="${entry.hanzi} ${this.escape(entry.meaning)}">
              <span class="etym-card-hanzi">${entry.hanzi}</span>
              <span class="etym-card-pinyin">${this.escape(entry.pinyin)}</span>
              <span class="etym-card-meaning">${this.escape(
                entry.meaning.split(",")[0].split(";")[0]
              )}</span>
            </button>
          </div>`;
        }
      )
      .join("");
  }

  renderDetail() {
    const s = this.section;
    const entry = this.selectedHanzi ? s.charIndex.get(this.selectedHanzi) : null;
    if (!entry) {
      return `<p class="etym-empty">Selecciona un carácter para ver su orden de trazos y descomposición.</p>`;
    }

    const components = entry.components || [];
    const decomposition = components.length
      ? `
        <div class="etym-decomp">
          <h3 class="etym-section-title">Descomposición</h3>
          <div class="etym-decomp-chips">
            ${components
              .map(
                (c) => `
                <span class="etym-decomp-chip ${
                  s.charIndex.has(c.char) ? "is-link" : ""
                }" ${
                  s.charIndex.has(c.char)
                    ? `data-goto="${c.char}" role="button" tabindex="0"`
                    : ""
                }>
                  <span class="etym-decomp-char">${c.char}</span>
                  <span class="etym-decomp-gloss">${this.escape(c.gloss)}</span>
                </span>`
              )
              .join("")}
          </div>
        </div>`
      : `<p class="etym-decomp-none">Carácter pictográfico básico: no se descompone en componentes con significado propio.</p>`;

    const words = entry.words && entry.words.length
      ? `
        <div class="etym-words">
          <h3 class="etym-section-title">Palabras de ejemplo</h3>
          <ul class="etym-word-list">
            ${entry.words
              .map(
                (w) => `
                <li class="etym-word">
                  <span class="etym-word-hanzi">${w.hanzi}</span>
                  <span class="etym-word-pinyin">${this.escape(w.pinyin)}</span>
                  <span class="etym-word-meaning">${this.escape(w.meaning)}</span>
                  ${w.gloss ? `<span class="etym-word-gloss">${this.escape(w.gloss)}</span>` : ""}
                </li>`
              )
              .join("")}
          </ul>
        </div>`
      : "";

    return `
      <div class="etym-detail-head">
        <div class="etym-stroke-box">
          <div id="etym-writer-target" class="etym-writer-target" aria-hidden="true"></div>
        </div>
        <div class="etym-detail-meta">
          <div class="etym-detail-hanzi">${entry.hanzi}</div>
          <div class="etym-detail-pinyin">${this.escape(entry.pinyin)}</div>
          <div class="etym-detail-meaning">${this.escape(entry.meaning)}</div>
          ${
            entry.jp
              ? `<span class="etym-jp-tag" title="También usado en japonés (kanji)">JP · kanji</span>`
              : ""
          }
          <div class="etym-detail-actions">
            <button class="etym-detail-btn etym-replay" type="button">Repetir trazos</button>
            <button class="etym-detail-btn etym-quiz" type="button">Practicar</button>
          </div>
        </div>
      </div>

      <div class="etym-story">
        <h3 class="etym-section-title">Por qué de su forma</h3>
        <p class="etym-story-text">${this.highlightComponents(entry.etymology)}</p>
      </div>

      ${decomposition}
      ${words}`;
  }

  renderFooter(s) {
    return `
      <footer class="etym-footer">
        <p class="etym-source">Fuente: <em>${this.escape(s.source)}</em></p>
      </footer>`;
  }

  /* ---------- hanzi-writer integration ---------- */

  mountWriter() {
    const target = document.getElementById("etym-writer-target");
    if (!target || !this.selectedHanzi) return;
    target.innerHTML = "";

    if (!window.HanziWriter) {
      target.innerHTML = `<span class="etym-writer-fallback">${this.selectedHanzi}</span>`;
      return;
    }

    try {
      this.writer = window.HanziWriter.create(target, this.selectedHanzi, {
        width: 140,
        height: 140,
        padding: 6,
        showOutline: true,
        showCharacter: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 180,
        strokeColor:
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-primary")
            .trim() || "#d32f2f",
        outlineColor: "rgba(128,128,128,0.28)",
        radicalColor: "#2e7d32",
        charDataLoader: (char, onComplete) => this.loadStroke(char, onComplete),
        onLoadCharDataError: () => {
          target.innerHTML = `<span class="etym-writer-fallback">${this.selectedHanzi}</span>`;
        },
      });
      this.animateStrokes();
    } catch {
      target.innerHTML = `<span class="etym-writer-fallback">${this.selectedHanzi}</span>`;
    }
  }

  loadStroke(char, onComplete) {
    const url = `${this.strokeBaseUrl}${encodeURIComponent(char)}.json`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`stroke ${res.status}`);
        return res.json();
      })
      .then((json) => onComplete(json))
      .catch(() => onComplete(null));
  }

  animateStrokes() {
    if (this.writer && typeof this.writer.animateCharacter === "function") {
      this.writer.animateCharacter();
    }
  }

  startQuiz() {
    if (this.writer && typeof this.writer.quiz === "function") {
      this.writer.quiz({ leniency: 1.2 });
    }
  }

  /* ---------- events ---------- */

  bindEvents() {
    const root = this.container;
    if (!root) return;

    root.querySelectorAll("[data-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.section === this.activeSectionId) return;
        this.activeSectionId = btn.dataset.section;
        this.resetSelection();
        this.render();
      });
    });

    root.querySelectorAll(".etym-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeView = btn.dataset.view;
        this.render();
      });
    });

    root.querySelectorAll("[data-lesson]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeLessonId = btn.dataset.lesson;
        const lesson = this.section.lessons.find((l) => l.id === this.activeLessonId);
        if (lesson && lesson.chars[0]) this.selectedHanzi = lesson.chars[0].hanzi;
        this.render();
      });
    });

    root.querySelectorAll("[data-family]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeFamily = btn.dataset.family;
        const fam = this.section.families.find((f) => f.component === this.activeFamily);
        if (fam && fam.members[0]) this.selectedHanzi = fam.members[0];
        this.render();
      });
    });

    root.querySelectorAll(".etym-card").forEach((btn) => {
      btn.addEventListener("click", () => this.selectHanzi(btn.dataset.hanzi));
    });

    const pdfBtn = root.querySelector("#etym-export-pdf-btn");
    if (pdfBtn) pdfBtn.addEventListener("click", () => this.openPdfModal());

    const selectBtn = root.querySelector("#etym-select-mode-btn");
    if (selectBtn) selectBtn.addEventListener("click", () => this.toggleSelectionMode());

    const selectAllBtn = root.querySelector("#etym-select-all-btn");
    if (selectAllBtn) selectAllBtn.addEventListener("click", () => this.selectAllVisible());

    const clearBtn = root.querySelector("#etym-clear-selection-btn");
    if (clearBtn) clearBtn.addEventListener("click", () => this.clearSelection());

    const printSelBtn = root.querySelector("#etym-print-selected-btn");
    if (printSelBtn) printSelBtn.addEventListener("click", () => this.openPdfModal());

    root.querySelectorAll(".etym-card-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        e.stopPropagation();
        this.toggleHanziSelection(cb.dataset.hanzi, cb.closest(".etym-card-wrap"), cb.checked);
      });
      cb.addEventListener("click", (e) => e.stopPropagation());
    });

    this.bindGoto(root);

    const replay = root.querySelector(".etym-replay");
    if (replay) replay.addEventListener("click", () => this.animateStrokes());
    const quiz = root.querySelector(".etym-quiz");
    if (quiz) quiz.addEventListener("click", () => this.startQuiz());
  }

  bindGoto(scope) {
    scope.querySelectorAll("[data-goto]").forEach((el) => {
      const go = () => this.gotoChar(el.dataset.goto);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
  }

  selectHanzi(hanzi) {
    if (this.isSelectionMode) {
      const isSelected = this.selectedHanziSet.has(hanzi);
      const cardWrap = this.container.querySelector(`.etym-card-checkbox[data-hanzi="${hanzi}"]`)?.closest(".etym-card-wrap");
      const cb = cardWrap?.querySelector(".etym-card-checkbox");
      if (cb) cb.checked = !isSelected;
      this.toggleHanziSelection(hanzi, cardWrap, !isSelected);
      return;
    }

    if (!this.section.charIndex.has(hanzi)) return;
    this.selectedHanzi = hanzi;
    const detail = document.getElementById("etym-detail");
    if (detail) detail.innerHTML = this.renderDetail();
    this.container.querySelectorAll(".etym-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.hanzi === hanzi);
    });
    this.bindDetailEvents();
    this.mountWriter();
  }

  bindDetailEvents() {
    const detail = document.getElementById("etym-detail");
    if (!detail) return;
    this.bindGoto(detail);
    const replay = detail.querySelector(".etym-replay");
    if (replay) replay.addEventListener("click", () => this.animateStrokes());
    const quiz = detail.querySelector(".etym-quiz");
    if (quiz) quiz.addEventListener("click", () => this.startQuiz());
  }

  gotoChar(hanzi) {
    const entry = this.section.charIndex.get(hanzi);
    if (!entry) return;
    if (this.activeView === "lessons") {
      this.activeLessonId = entry.lessonId;
    }
    this.selectedHanzi = hanzi;
    this.render();
  }

  /* ---------- PDF & Selection Helpers ---------- */

  async getPdfController() {
    if (this.app && this.app.flashcardPdfController) {
      return this.app.flashcardPdfController;
    }
    if (typeof window !== "undefined" && !window.FlashcardPdfController) {
      if (this.app && this.app.uiController && typeof this.app.uiController.loadScript === "function") {
        await this.app.uiController.loadScript("assets/js/modules/flashcard-pdf-controller.js");
        await this.app.uiController.loadStylesheet("assets/css/flashcard-pdf-styles.css");
      } else {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "assets/js/modules/flashcard-pdf-controller.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
    }
    const controller = new window.FlashcardPdfController(this.app);
    if (this.app) {
      this.app.flashcardPdfController = controller;
    }
    return controller;
  }

  async openPdfModal() {
    try {
      const pdfCtrl = await this.getPdfController();
      const s = this.section;
      const lesson = s.lessons.find((l) => l.id === this.activeLessonId);

      pdfCtrl.openModal({
        source: "etymology",
        charIndex: s.charIndex,
        currentLesson: lesson,
        currentSection: s,
        selectedItems: this.selectedHanziSet
      });
    } catch (err) {
      console.error("[Etymology] Error opening PDF modal:", err);
    }
  }

  toggleSelectionMode(forceState) {
    this.isSelectionMode = typeof forceState === "boolean" ? forceState : !this.isSelectionMode;
    const wrap = this.container.querySelector(".etym-wrap");
    if (wrap) wrap.classList.toggle("selection-mode-active", this.isSelectionMode);
    const selectBtn = this.container.querySelector("#etym-select-mode-btn");
    if (selectBtn) selectBtn.classList.toggle("is-active", this.isSelectionMode);
    this.updateSelectionUI();
  }

  toggleHanziSelection(hanzi, cardWrap, isChecked) {
    if (!hanzi) return;
    if (isChecked) {
      this.selectedHanziSet.add(hanzi);
      if (cardWrap) cardWrap.classList.add("is-card-selected");
    } else {
      this.selectedHanziSet.delete(hanzi);
      if (cardWrap) cardWrap.classList.remove("is-card-selected");
    }
    this.updateSelectionUI();
  }

  selectAllVisible() {
    const chars = this.currentChars();
    chars.forEach((entry) => {
      if (entry && entry.hanzi) {
        this.selectedHanziSet.add(entry.hanzi);
      }
    });
    this.container.querySelectorAll(".etym-card-checkbox").forEach((cb) => {
      cb.checked = true;
      const wrap = cb.closest(".etym-card-wrap");
      if (wrap) wrap.classList.add("is-card-selected");
    });
    this.updateSelectionUI();
  }

  clearSelection() {
    this.selectedHanziSet.clear();
    this.container.querySelectorAll(".etym-card-checkbox").forEach((cb) => {
      cb.checked = false;
      const wrap = cb.closest(".etym-card-wrap");
      if (wrap) wrap.classList.remove("is-card-selected");
    });
    this.updateSelectionUI();
  }

  updateSelectionUI() {
    const count = this.selectedHanziSet.size;
    const bar = this.container.querySelector("#etym-selection-bar");
    const badge = this.container.querySelector("#etym-selected-badge");
    const text = this.container.querySelector("#etym-selected-text");
    const printText = this.container.querySelector("#etym-print-selected-text");

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    }
    if (text) {
      text.textContent = `${count} seleccionados`;
    }
    if (printText) {
      printText.textContent = `Generar PDF (${count})`;
    }
    if (bar) {
      bar.style.display = (this.isSelectionMode || count > 0) ? "flex" : "none";
    }
  }

  /* ---------- helpers ---------- */

  highlightComponents(text) {
    const idx = this.section.charIndex;
    const escaped = this.escape(text);
    return escaped.replace(/([一-鿿㐀-䶿]+)/g, (m) => {
      const linkable = idx.has(m);
      return `<span class="etym-inline-char ${
        linkable ? "is-link" : ""
      }" ${linkable ? `data-goto="${m}" role="button" tabindex="0"` : ""}>${m}</span>`;
    });
  }

  escape(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

window.EtymologyController = EtymologyController;
