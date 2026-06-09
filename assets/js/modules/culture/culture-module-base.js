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
    await this.loadData();
    this.render();
    this.isInitialized = true;
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

  async loadData() {
    // To be implemented by subclasses
  }

  render() {
    // To be implemented by subclasses
  }
}

window.CultureModuleBase = CultureModuleBase;
