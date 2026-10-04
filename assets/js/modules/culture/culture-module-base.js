class CultureModuleBase {
  constructor(app, containerId, title) {
    this.app = app;
    this.containerId = containerId;
    this.title = title;
    this.isInitialized = false;

    // Auto-re-render on language changes
    window.addEventListener('languageChanged', () => {
      if (this.isInitialized) {
        this.render();
        this.injectNavigationHeader();
      }
    });
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  get moduleMetadata() {
    const panel = this.container?.closest(".tab-panel");
    const tabId = panel?.id || this.containerId.replace("-content", "");
    const modules = window.CULTURE_MODULES_DATA || window.CultureHubController?.MODULES_DATA || [];
    return modules.find((m) => m.id === tabId) || null;
  }

  async initialize() {
    if (this.isInitialized) return;
    this.renderLoading();
    try {
      await this.loadData();
      this.render();
      this.injectNavigationHeader();
      this.markExploredInStorage();
      this.isInitialized = true;
    } catch (err) {
      console.error(`[CultureModule] Error initializing ${this.title}:`, err);
      this.renderError(err && err.message ? err.message : String(err));
    }
  }

  injectNavigationHeader() {
    if (!this.container) return;
    if (this.container.querySelector(".culture-submodule-header-nav")) return;

    const mod = this.moduleMetadata;
    const nav = document.createElement("div");
    nav.className = "culture-submodule-header-nav";

    const label = this.app?.getTranslation?.("cultureBackToPortal") || "Portal Cultural";
    const pillarName = mod ? (this.app?.getTranslation?.(mod.pillarKey) || mod.pillar) : "";
    const title = mod ? (this.app?.getTranslation?.(mod.titleKey) || this.title) : this.title;
    const hanzi = mod?.hanzi || "";
    const sealChar = mod?.sealChar || "";
    const vocabHanzi = mod?.vocabHanzi || "";

    const rawDeck = localStorage.getItem("hsk_culture_deck_words");
    let isInDeck = false;
    try {
      const deckSet = new Set(rawDeck ? JSON.parse(rawDeck) : []);
      isInDeck = vocabHanzi ? deckSet.has(vocabHanzi) : false;
    } catch {
      isInDeck = false;
    }

    nav.innerHTML = `
      <div class="culture-submodule-nav-left">
        <button type="button" class="culture-back-to-hub-btn" data-culture-nav="hub" title="Volver al Portal Cultural" aria-label="Volver al Portal Cultural">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span data-i18n="cultureBackToPortal">${label}</span>
        </button>
        <span class="culture-crumb-sep" aria-hidden="true">/</span>
        ${mod ? `<span class="culture-pillar-tag tag-${mod.pillar} culture-crumb-pillar">${window.hskIcons?.render?.(mod.icon, { size: 12 }) || ""}<span>${pillarName}</span></span><span class="culture-crumb-sep" aria-hidden="true">/</span>` : ""}
        <span class="culture-crumb-current">${title} ${hanzi ? `<span class="culture-crumb-hanzi">${hanzi}</span>` : ""}</span>
      </div>

      <div class="culture-submodule-nav-actions">
        ${sealChar ? `
          <button type="button" class="culture-submodule-seal-badge is-stamped" data-culture-nav="passport" title="Sello Imperial (通关文牒)" aria-label="Ver Pasaporte Imperial">
            <span class="submodule-seal-char">${sealChar}</span>
            <span class="submodule-seal-text">朱砂印章</span>
          </button>
        ` : ""}
        ${vocabHanzi ? `
          <button type="button" class="culture-card-deck-btn ${isInDeck ? "is-in-deck" : ""}" data-culture-deck-mod="${mod.id}" title="${isInDeck ? (this.app?.getTranslation?.("cultureRemovedFromDeck") || "Guardado en Mazo Cultural") : (this.app?.getTranslation?.("cultureAddToDeck") || "Guardar en Mazo Cultural")}" aria-label="Mazo Cultural">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${isInDeck ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            <span>${vocabHanzi}</span>
          </button>
        ` : ""}
      </div>
    `;

    // Back to hub click
    const backBtn = nav.querySelector("[data-culture-nav='hub']");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (this.app?.switchTab) {
          this.app.switchTab("culture");
        } else if (this.app?.uiController?.switchTab) {
          this.app.uiController.switchTab("culture");
        }
      });
    }

    // Passport click
    const passportBtn = nav.querySelector("[data-culture-nav='passport']");
    if (passportBtn) {
      passportBtn.addEventListener("click", () => {
        if (this.app?.cultureHubController) {
          this.app.cultureHubController.isPassportOpen = true;
        }
        if (this.app?.switchTab) {
          this.app.switchTab("culture");
        } else if (this.app?.uiController?.switchTab) {
          this.app.uiController.switchTab("culture");
        }
      });
    }

    // Deck toggle button click
    const deckBtn = nav.querySelector("[data-culture-deck-mod]");
    if (deckBtn && mod) {
      deckBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.CultureHubController?.toggleVocabDeck) {
          window.CultureHubController.toggleVocabDeck(mod, this.app);
        }
      });
    }

    this.container.insertBefore(nav, this.container.firstChild);
  }

  markExploredInStorage() {
    try {
      const panel = this.container?.closest(".tab-panel");
      const tabId = panel?.id || this.containerId.replace("-content", "");
      if (tabId) {
        const raw = localStorage.getItem("hsk_culture_explored");
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.add(tabId);
        localStorage.setItem("hsk_culture_explored", JSON.stringify([...set]));
      }
    } catch (err) {
      if (this.app?.logWarn) this.app.logWarn("Error saving explored culture module in storage:", err);
    }
  }

  renderLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="culture-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 20px;">
          <div class="spinner" style="border: 3px solid rgba(229, 57, 53, 0.15); width: 42px; height: 42px; border-radius: 50%; border-left-color: var(--color-primary, #e53935); animation: spin 0.8s linear infinite;"></div>
          <p style="margin-top: 18px; color: var(--color-text-muted, #71717a); font-weight: 600; font-size: 0.95rem;">Cargando ${this.title}...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
    }
  }

  renderError(msg) {
    if (this.container) {
      this.container.innerHTML = `
        <div style="padding: 2.5rem 1.5rem; text-align: center; color: var(--color-error, #ef4444); background: var(--color-bg-panel, #ffffff); border-radius: var(--radius-lg, 14px); border: 1px solid var(--color-border, #e4e4e7); max-width: 600px; margin: 2rem auto;">
          <div style="margin-bottom: 1rem; color: var(--color-primary, #e53935); display: flex; justify-content: center;">
            ${window.hskIcons?.render?.('lantern', { size: 44 }) || ''}
          </div>
          <p style="font-weight: 700; font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-text-main, #18181b);">No se pudo cargar ${this.title}</p>
          <p style="font-size: 0.88rem; color: var(--color-text-muted, #71717a); margin-bottom: 1.5rem;">${msg || "Error desconocido"}</p>
          <button data-culture-action="retry"
            style="padding: 0.6rem 1.8rem; background: linear-gradient(135deg, var(--color-primary, #e53935), var(--color-primary-hover, #c62828)); color: #fff; border: none; border-radius: 9999px; cursor: pointer; font-size: 0.92rem; font-weight: 700; box-shadow: 0 4px 12px rgba(229,57,53,0.3);">
            Reintentar
          </button>
        </div>
      `;

      const retryBtn = this.container.querySelector('[data-culture-action="retry"]');
      if (retryBtn) {
        retryBtn.addEventListener("click", () =>
          this.retryTabInitialization(retryBtn),
        );
      }
    }
  }

  // Pronounce Chinese text with synthesis engine
  speakChinese(text) {
    if (!text || typeof window === 'undefined') return;
    const cleanText = text.trim();
    if (!cleanText) return;

    if (window.app?.audioSynthesizer?.speak) {
      window.app.audioSynthesizer.speak(cleanText);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Helper to generate a standardized audio speaker button
  getSpeakerBtn(text, title = 'Escuchar pronunciación') {
    const cleanText = (text || '').replace(/["'<>]/g, '').trim();
    if (!cleanText) return '';
    return `<button type="button" class="culture-audio-btn" data-culture-speak="${cleanText}" title="${title}" aria-label="${title}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
    </button>`;
  }

  // Bind audio clicks to all .culture-audio-btn / [data-culture-speak] in container
  bindAudioButtons(container = this.container) {
    if (!container) return;
    container.querySelectorAll('[data-culture-speak]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-culture-speak') || btn.dataset.cultureSpeak;
        if (text) {
          this.speakChinese(text);
          btn.classList.add('playing');
          setTimeout(() => btn.classList.remove('playing'), 800);
        }
      });
    });
  }

  retryTabInitialization(fromElement) {
    const tabPanel = fromElement?.closest("[id]")?.parentElement?.parentElement;
    const uiController = window.app?.uiController;
    if (tabPanel?.id && uiController) {
      uiController.handleTabInitialization(tabPanel.id);
    }
  }

  // Helper to toggle between video and photo in hero banner
  bindMediaToggle(prefix, lang = 'es') {
    if (!this.container) return;
    const toggleBtn = this.container.querySelector(`#culture-${prefix}-toggle`);
    if (!toggleBtn) return;
    toggleBtn.addEventListener('click', () => {
      const video = this.container.querySelector(`#culture-${prefix}-video`);
      const img = this.container.querySelector(`#culture-${prefix}-img`);
      const badge = this.container.querySelector(`#culture-${prefix}-badge`);
      const isVideo = video && video.style.display !== 'none';
      if (isVideo) {
        if (video) {
          video.pause();
          video.style.display = 'none';
        }
        if (img) img.style.display = 'block';
        if (badge) badge.style.display = 'none';
        const icon = toggleBtn.querySelector('.toggle-icon');
        const text = toggleBtn.querySelector('.toggle-text');
        if (icon) icon.innerHTML = window.hskIcons?.render?.('video', { size: 14 }) || '';
        if (text) text.textContent = lang === 'en' ? 'View Video' : 'Ver Vídeo';
        toggleBtn.title = lang === 'en' ? 'Switch to Video view' : 'Cambiar a vista Vídeo';
      } else {
        if (img) img.style.display = 'none';
        if (video) {
          video.style.display = 'block';
          video.play().catch(() => {});
        }
        if (badge) badge.style.display = 'inline-flex';
        const icon = toggleBtn.querySelector('.toggle-icon');
        const text = toggleBtn.querySelector('.toggle-text');
        if (icon) icon.innerHTML = window.hskIcons?.render?.('image', { size: 14 }) || '';
        if (text) text.textContent = lang === 'en' ? 'View Photo' : 'Ver Foto';
        toggleBtn.title = lang === 'en' ? 'Switch to Photo view' : 'Cambiar a vista Foto';
      }
    });
  }

  async loadData() {
    // To be implemented by subclasses
  }

  render() {
    // To be implemented by subclasses
  }
}

window.CultureModuleBase = CultureModuleBase;
