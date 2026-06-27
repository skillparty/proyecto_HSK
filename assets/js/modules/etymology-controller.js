/**
 * EtymologyController
 * Top-level module inspired by Pedro Ceinos' «Manual de Escritura de los
 * Caracteres Chinos». Groups characters by theme/component and explains the
 * "why" of each grouping, with Pleco/KTdict-style animated stroke order
 * (powered by hanzi-writer) plus an etymological component breakdown.
 *
 * Content is Spanish-only for now; an English version is announced as coming
 * soon.
 */
class EtymologyController {
  constructor(app) {
    this.app = app;
    this.containerId = "etymology-content";
    this.dataUrl = "assets/data/etymology/seccion-a.json?v=2";
    this.strokeBaseUrl = "assets/data/etymology/strokes/";
    this.hanziWriterUrl = "assets/vendor/hanzi-writer.min.js";

    this.data = null;
    this.charIndex = new Map(); // hanzi -> char entry
    this.families = []; // [{ component, gloss, members: [hanzi] }]
    this.isInitialized = false;

    this.activeView = "lessons"; // "lessons" | "families"
    this.activeLessonId = null;
    this.activeFamily = null;
    this.selectedHanzi = null;
    this.writer = null;
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  async initialize() {
    if (this.isInitialized) {
      this.render();
      return;
    }
    this.renderLoading();
    try {
      await Promise.all([this.loadData(), this.loadHanziWriter()]);
      this.buildIndexes();
      this.activeLessonId = this.data.lessons[0] ? this.data.lessons[0].id : null;
      this.selectedHanzi =
        this.data.lessons[0] && this.data.lessons[0].chars[0]
          ? this.data.lessons[0].chars[0].hanzi
          : null;
      this.isInitialized = true;
      this.render();
    } catch (err) {
      console.error("[Etymology] init failed:", err);
      this.renderError(err && err.message ? err.message : String(err));
    }
  }

  async loadData() {
    const res = await fetch(this.dataUrl);
    if (!res.ok) throw new Error(`No se pudo cargar el contenido (${res.status})`);
    this.data = await res.json();
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

  buildIndexes() {
    this.charIndex.clear();
    const familyMap = new Map(); // component -> { gloss, members: Set }

    this.data.lessons.forEach((lesson) => {
      lesson.chars.forEach((entry) => {
        const withLesson = { ...entry, lessonId: lesson.id, theme: lesson.theme };
        this.charIndex.set(entry.hanzi, withLesson);

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

    // A family is meaningful when its component is shared by 2+ characters.
    this.families = Array.from(familyMap.entries())
      .map(([component, info]) => ({
        component,
        gloss: info.gloss,
        members: Array.from(info.members),
      }))
      .filter((fam) => fam.members.length >= 2)
      .sort((a, b) => b.members.length - a.members.length);

    if (!this.activeFamily && this.families.length) {
      this.activeFamily = this.families[0].component;
    }
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

    this.container.innerHTML = `
      <section class="etym-wrap" aria-label="Etimología de caracteres">
        ${this.renderHeader()}
        ${this.renderViewToggle()}
        <div class="etym-body">
          <div class="etym-left">
            ${
              this.activeView === "lessons"
                ? this.renderLessonsNav()
                : this.renderFamiliesNav()
            }
            <div class="etym-grid" id="etym-grid">
              ${this.renderGrid()}
            </div>
          </div>
          <aside class="etym-detail" id="etym-detail" aria-live="polite">
            ${this.renderDetail()}
          </aside>
        </div>
        ${this.renderFooter()}
      </section>`;

    this.bindEvents();
    this.mountWriter();
  }

  renderHeader() {
    return `
      <header class="etym-header">
        <div class="etym-header-text">
          <h2 class="etym-title">${this.escape(this.data.title)}</h2>
          <p class="etym-intro">${this.escape(this.data.intro)}</p>
        </div>
        <span class="etym-lang-badge" title="Próximamente en inglés">
          🌐 English coming soon
        </span>
      </header>`;
  }

  renderViewToggle() {
    return `
      <div class="etym-toggle" role="tablist" aria-label="Modo de agrupación">
        <button class="etym-toggle-btn ${
          this.activeView === "lessons" ? "is-active" : ""
        }" role="tab" aria-selected="${this.activeView === "lessons"}"
          data-view="lessons" type="button">
          Lecciones por tema
        </button>
        <button class="etym-toggle-btn ${
          this.activeView === "families" ? "is-active" : ""
        }" role="tab" aria-selected="${this.activeView === "families"}"
          data-view="families" type="button">
          Familias por componente
        </button>
      </div>`;
  }

  renderLessonsNav() {
    const chips = this.data.lessons
      .map(
        (lesson) => `
          <button class="etym-chip ${
            lesson.id === this.activeLessonId ? "is-active" : ""
          }" data-lesson="${lesson.id}" type="button">
            <span class="etym-chip-icon">${lesson.icon}</span>
            <span class="etym-chip-label">${lesson.id} · ${this.escape(
          lesson.theme
        )}</span>
          </button>`
      )
      .join("");
    return `<nav class="etym-chips" aria-label="Lecciones">${chips}</nav>`;
  }

  renderFamiliesNav() {
    const chips = this.families
      .map(
        (fam) => `
          <button class="etym-chip ${
            fam.component === this.activeFamily ? "is-active" : ""
          }" data-family="${fam.component}" type="button">
            <span class="etym-chip-icon">${fam.component}</span>
            <span class="etym-chip-label">${this.escape(
              fam.gloss || fam.component
            )} · ${fam.members.length}</span>
          </button>`
      )
      .join("");
    return `<nav class="etym-chips" aria-label="Familias por componente">
      <p class="etym-fam-hint">Caracteres que comparten un mismo componente y el porqué de esa relación.</p>
      ${chips}</nav>`;
  }

  currentChars() {
    if (this.activeView === "lessons") {
      const lesson = this.data.lessons.find((l) => l.id === this.activeLessonId);
      return lesson ? lesson.chars : [];
    }
    const fam = this.families.find((f) => f.component === this.activeFamily);
    if (!fam) return [];
    return fam.members
      .map((h) => this.charIndex.get(h))
      .filter(Boolean);
  }

  renderGrid() {
    const chars = this.currentChars();
    if (!chars.length) {
      return `<p class="etym-empty">Sin caracteres en esta selección.</p>`;
    }
    return chars
      .map(
        (entry) => `
          <button class="etym-card ${
            entry.hanzi === this.selectedHanzi ? "is-selected" : ""
          }" data-hanzi="${entry.hanzi}" type="button"
            aria-label="${entry.hanzi} ${this.escape(entry.meaning)}">
            <span class="etym-card-hanzi">${entry.hanzi}</span>
            <span class="etym-card-pinyin">${this.escape(entry.pinyin)}</span>
            <span class="etym-card-meaning">${this.escape(
              entry.meaning.split(",")[0].split(";")[0]
            )}</span>
          </button>`
      )
      .join("");
  }

  renderDetail() {
    const entry = this.selectedHanzi
      ? this.charIndex.get(this.selectedHanzi)
      : null;
    if (!entry) {
      return `<p class="etym-empty">Selecciona un carácter para ver su orden de trazos y descomposición.</p>`;
    }

    const components = entry.components || [];
    const decomposition = components.length
      ? `
        <div class="etym-decomp">
          <h4 class="etym-section-title">Descomposición</h4>
          <div class="etym-decomp-chips">
            ${components
              .map(
                (c) => `
                <span class="etym-decomp-chip ${
                  this.charIndex.has(c.char) ? "is-link" : ""
                }" ${
                  this.charIndex.has(c.char)
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
        </div>
      </div>
      <div class="etym-stroke-actions">
        <button class="etym-btn etym-replay" type="button">▶ Animar trazos</button>
        <button class="etym-btn etym-secondary etym-quiz" type="button">✎ Practicar</button>
      </div>
      <div class="etym-why">
        <h4 class="etym-section-title">El porqué (${entry.lessonId} · ${this.escape(
      entry.theme
    )})</h4>
        <p class="etym-why-text">${this.highlightComponents(entry.etymology)}</p>
      </div>
      ${decomposition}`;
  }

  renderFooter() {
    return `
      <footer class="etym-footer">
        <p class="etym-source">Fuente: ${this.escape(this.data.source)}</p>
        <p class="etym-credit">Orden de trazos: <a href="https://github.com/chanind/hanzi-writer" target="_blank" rel="noopener">Hanzi Writer</a> · datos de Make Me a Hanzi (LGPL/Arphic).</p>
      </footer>`;
  }

  /* ---------- stroke animation ---------- */

  mountWriter() {
    const target = document.getElementById("etym-writer-target");
    if (!target || !this.selectedHanzi || !window.HanziWriter) return;
    target.innerHTML = "";
    this.writer = null;

    const size = 200;
    try {
      this.writer = window.HanziWriter.create(target, this.selectedHanzi, {
        width: size,
        height: size,
        padding: 12,
        showOutline: true,
        showCharacter: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 180,
        strokeColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--color-primary")
          .trim() || "#d32f2f",
        outlineColor: "rgba(128,128,128,0.28)",
        radicalColor: "#2e7d32",
        charDataLoader: (char, onComplete) => this.loadStroke(char, onComplete),
        onLoadCharDataError: () => {
          target.innerHTML = `<span class="etym-writer-fallback">${this.selectedHanzi}</span>`;
        },
      });
    } catch (err) {
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

    root.querySelectorAll(".etym-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeView = btn.dataset.view;
        this.render();
      });
    });

    root.querySelectorAll("[data-lesson]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeLessonId = btn.dataset.lesson;
        const lesson = this.data.lessons.find((l) => l.id === this.activeLessonId);
        if (lesson && lesson.chars[0]) this.selectedHanzi = lesson.chars[0].hanzi;
        this.render();
      });
    });

    root.querySelectorAll("[data-family]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeFamily = btn.dataset.family;
        const fam = this.families.find((f) => f.component === this.activeFamily);
        if (fam && fam.members[0]) this.selectedHanzi = fam.members[0];
        this.render();
      });
    });

    root.querySelectorAll("[data-hanzi]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectHanzi(btn.dataset.hanzi);
      });
    });

    root.querySelectorAll("[data-goto]").forEach((el) => {
      const go = () => this.gotoChar(el.dataset.goto);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });

    const replay = root.querySelector(".etym-replay");
    if (replay) replay.addEventListener("click", () => this.animateStrokes());
    const quiz = root.querySelector(".etym-quiz");
    if (quiz) quiz.addEventListener("click", () => this.startQuiz());
  }

  selectHanzi(hanzi) {
    if (!this.charIndex.has(hanzi)) return;
    this.selectedHanzi = hanzi;
    // Update only the detail + selection highlight to avoid full re-render flicker.
    const detail = document.getElementById("etym-detail");
    if (detail) detail.innerHTML = this.renderDetail();
    this.container.querySelectorAll(".etym-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.hanzi === hanzi);
    });
    this.bindDetailEvents();
    this.mountWriter();
    this.animateStrokes();
  }

  bindDetailEvents() {
    const detail = document.getElementById("etym-detail");
    if (!detail) return;
    detail.querySelectorAll("[data-goto]").forEach((el) => {
      const go = () => this.gotoChar(el.dataset.goto);
      el.addEventListener("click", go);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
    const replay = detail.querySelector(".etym-replay");
    if (replay) replay.addEventListener("click", () => this.animateStrokes());
    const quiz = detail.querySelector(".etym-quiz");
    if (quiz) quiz.addEventListener("click", () => this.startQuiz());
  }

  gotoChar(hanzi) {
    const entry = this.charIndex.get(hanzi);
    if (!entry) return;
    if (this.activeView === "lessons") {
      this.activeLessonId = entry.lessonId;
    }
    this.selectedHanzi = hanzi;
    this.render();
  }

  /* ---------- helpers ---------- */

  highlightComponents(text) {
    // Wrap CJK characters in a styled span so the breakdown reads like the book.
    const escaped = this.escape(text);
    return escaped.replace(/([一-鿿㐀-䶿]+)/g, (m) => {
      const linkable = this.charIndex.has(m);
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
