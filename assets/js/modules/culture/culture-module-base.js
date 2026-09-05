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
      }
    });
  }

  get container() {
    return document.getElementById(this.containerId);
  }

  async initialize() {
    if (this.isInitialized) return;
    this.renderLoading();
    try {
      await this.loadData();
      this.render();
      this.isInitialized = true;
    } catch (err) {
      console.error(`[CultureModule] Error initializing ${this.title}:`, err);
      this.renderError(err && err.message ? err.message : String(err));
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
          <div style="font-size: 2.8rem; margin-bottom: 1rem;">🏮</div>
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
        if (icon) icon.textContent = '🎬';
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
        if (icon) icon.textContent = '🖼️';
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
