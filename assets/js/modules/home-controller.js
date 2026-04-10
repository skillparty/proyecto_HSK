/**
 * HomeController Module - Handles home cards, stats CTA, and matrix fallback actions
 */
class HomeController {
    constructor(app) {
        this.app = app;
        this.bound = false;
        this.logDebug('🏠 HomeController module initialized');
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    setupEventListeners() {
        if (this.bound) return;

        document.addEventListener('click', (e) => {
            const homeCard = e.target.closest('.home-card[data-tab-target]');
            if (homeCard) {
                const targetTab = homeCard.getAttribute('data-tab-target');
                if (targetTab) {
                    this.app.switchTab(targetTab);
                }
                return;
            }

            const goToPracticeBtn = e.target.closest('#go-to-practice-btn');
            if (goToPracticeBtn) {
                this.app.switchTab('practice');
                return;
            }

            const actionBtn = e.target.closest('[data-matrix-action]');
            if (!actionBtn) return;

            const action = actionBtn.getAttribute('data-matrix-action');
            if (action === 'debug') {
                this.app.debugMatrixGame();
            } else if (action === 'retry') {
                this.app.initializeMatrixGame();
            } else if (action === 'reload') {
                window.location.reload();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            const homeCard = e.target.closest('.home-card[data-tab-target]');
            if (!homeCard) return;

            e.preventDefault();
            const targetTab = homeCard.getAttribute('data-tab-target');
            if (targetTab) {
                this.app.switchTab(targetTab);
            }
        });

        this.bound = true;
    }
}
