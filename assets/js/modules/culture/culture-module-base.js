class CultureModuleBase {
  constructor(app, containerId, title) {
    this.app = app;
    this.containerId = containerId;
    this.title = title;
    this.isInitialized = false;
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
        <div class="culture-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
          <div class="spinner" style="border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: var(--primary-color, #e53e3e); animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 16px; color: var(--text-muted);">Cargando ${this.title}...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
    }
  }

  renderError(msg) {
    if (this.container) {
      this.container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--color-error, #dc2626);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚠️</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;">No se pudo cargar ${this.title}</p>
          <p style="font-size: 0.85rem; color: var(--color-text-muted, #666); margin-bottom: 1.5rem;">${msg || "Error desconocido"}</p>
          <button onclick="this.closest('[id]') && window.app && window.app.uiController && window.app.uiController.handleTabInitialization(this.closest('[id]').parentElement.parentElement.id)"
            style="padding: 0.5rem 1.5rem; background: var(--color-primary, #d32f2f); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  async loadData() {
    // To be implemented by subclasses
  }

  render() {
    // To be implemented by subclasses
  }
}

window.CultureModuleBase = CultureModuleBase;
