/**
 * UIController Module - Handles UI state and notifications
 * Extracted from app.js as part of modularization
 */
class UIController {
    constructor(app) {
        this.app = app;
        this.logDebug('📱 UIController module initialized');
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    logWarn(...args) {
        this.getLogger().warn(...args);
    }

    logError(...args) {
        this.getLogger().error(...args);
    }

    switchTab(tabName) {
        // Update app orchestrator state
        this.app.currentTab = tabName;

        try {
            localStorage.setItem(this.app.lastTabStorageKey, tabName);
        } catch (error) {
            this.logWarn('⚠️ Error saving last tab:', error);
        }

        // Hide all tabs
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.style.display = 'block';
        }

        // Update navigation state
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Notify app to initialize tab-specific content
        this.handleTabInitialization(tabName);
        this.renderOnboardingHint(tabName);

        this.logDebug('📱 Switched to tab: ' + tabName);
    }

    handleTabInitialization(tabName) {
        switch (tabName) {
            case 'browse':
                if (!this.app.browseInitialized) {
                    this.app.initializeBrowse();
                    this.app.browseInitialized = true;
                }
                break;
            case 'strokes-radicals':
                this.app.initializeStrokesRadicals();
                break;
            case 'quiz':
                if (!this.app.quizInitialized) {
                    this.app.initializeQuiz();
                    this.app.quizInitialized = true;
                }
                if (this.app.quizEngine) {
                    this.app.renderQuizResumeAction();
                }
                break;
            case 'past-exams':
                this.app.initializePastExams();
                break;
            case 'stats':
                this.app.updateStats();
                break;
            case 'matrix':
                if (!this.app.matrixInitialized) {
                    this.app.initializeMatrixGame();
                    this.app.matrixInitialized = true;
                }
                break;
            case 'leaderboard':
                if (!this.app.leaderboardInitialized) {
                    this.app.initializeLeaderboard();
                    this.app.leaderboardInitialized = true;
                }
                break;
        }
    }

    restoreLastVisitedTab() {
        const allowedTabs = new Set(['home', 'practice', 'browse', 'strokes-radicals', 'quiz', 'past-exams', 'matrix', 'leaderboard', 'stats']);
        try {
            const savedTab = localStorage.getItem(this.app.lastTabStorageKey);
            if (savedTab && allowedTabs.has(savedTab) && document.getElementById(savedTab)) {
                this.switchTab(savedTab);
            }
        } catch (e) { this.logWarn('Tab restore error:', e); }
    }

    showToast(message, type = 'info', duration = 3500, action = null) {
        if (!message) return;

        this.ensureToastStyles();

        let container = document.getElementById('hsk-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hsk-toast-container';
            container.className = 'hsk-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `hsk-toast hsk-toast-${type} ${action ? 'hsk-toast-has-action' : ''}`;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'hsk-toast-text';
        textSpan.textContent = message;
        toast.appendChild(textSpan);

        if (action && typeof action.callback === 'function') {
            const btn = document.createElement('button');
            btn.className = 'hsk-toast-action';
            btn.textContent = action.label || 'OK';
            btn.setAttribute('aria-label', action.label || 'OK');
            btn.onclick = (e) => {
                e.stopPropagation();
                action.callback();
                toast.classList.add('hide');
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
            };
            toast.appendChild(btn);
        }

        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        // Only auto-hide if there's no persistent action, or specify long duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.add('hide');
                    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
                }
            }, duration);
        }
    }

    showUpdateToast(callback) {
        const message = this.app.getTranslation('updateAvailable') || 'New version available';
        const label = this.app.getTranslation('updateAction') || 'Update';
        
        this.showToast(message, 'info', 0, {
            label,
            callback
        });
    }

    showError(message) {
        this.logError('❌ Error:', message);
        this.showToast(message, 'error', 4000);
    }

    ensureToastStyles() {
        if (document.getElementById('hsk-toast-styles')) return;

        const style = document.createElement('style');
        style.id = 'hsk-toast-styles';
        style.textContent = `
            .hsk-toast-container {
                position: fixed;
                top: 84px;
                right: 20px;
                z-index: 10050;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            }
            .hsk-toast {
                min-width: 260px;
                max-width: 400px;
                border-radius: 12px;
                padding: 12px 18px;
                color: #fff;
                font-size: 0.9rem;
                font-weight: 500;
                box-shadow: 0 12px 30px rgba(0,0,0,.3);
                opacity: 0;
                transform: translateY(10px);
                transition: opacity .3s cubic-bezier(0.4, 0, 0.2, 1), transform .3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            .hsk-toast.show { opacity: 1; transform: translateY(0); }
            .hsk-toast.hide { opacity: 0; transform: translateY(-10px); }
            .hsk-toast-success { background: rgba(22, 163, 74, 0.9); border: 1px solid rgba(255,255,255,0.1); }
            .hsk-toast-error { background: rgba(220, 38, 38, 0.9); border: 1px solid rgba(255,255,255,0.1); }
            .hsk-toast-info { background: rgba(37, 99, 235, 0.9); border: 1px solid rgba(255,255,255,0.1); }
            .hsk-toast-warning { background: rgba(217, 119, 6, 0.9); border: 1px solid rgba(255,255,255,0.1); }
            
            .hsk-toast-action {
                background: #fff;
                color: #000;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                cursor: pointer;
                transition: background 0.2s;
                white-space: nowrap;
            }
            .hsk-toast-action:hover {
                background: rgba(255,255,255,0.9);
            }
            .hsk-toast-text {
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }

    renderOnboardingHint(tabName) {
        const panel = document.getElementById(tabName);
        if (!panel || !this.app.onboardingState) return;

        // Remove existing hint
        const existing = panel.querySelector('.onboarding-hint');
        if (existing) existing.remove();

        let hintType = null;
        let hintMessage = '';

        if (tabName === 'home' && !this.app.onboardingState.homeHintShown && !this.app.onboardingState.homeHintDismissed) {
            hintType = 'home';
            hintMessage = this.app.getTranslation('onboardingHomeHint') || 'Welcome! Start in Practice and then try Quiz or Matrix to build streak.';
            this.app.onboardingState.homeHintShown = true;
        } else if (this.app.isLearningModuleTab(tabName) && !this.app.onboardingState.moduleHintShown && !this.app.onboardingState.moduleHintDismissed) {
            const moduleName = this.getTabDisplayName(tabName);
            hintType = 'module';
            hintMessage = this.app.getTranslation('onboardingModuleHint', { module: moduleName }) || `Tip: In ${moduleName}, complete a quick action to generate progress.`;
            this.app.onboardingState.moduleHintShown = true;
        }

        if (!hintType) {
            this.app.saveOnboardingState();
            return;
        }

        const hint = document.createElement('div');
        hint.className = `onboarding-hint onboarding-hint--${hintType}`;
        hint.innerHTML = `
            <div class="onboarding-hint-content">
                <span class="onboarding-hint-icon" aria-hidden="true">💡</span>
                <span class="onboarding-hint-text">${hintMessage}</span>
            </div>
            <button type="button" class="onboarding-hint-close" aria-label="Close">×</button>
        `;

        hint.querySelector('.onboarding-hint-close').addEventListener('click', () => {
            if (hintType === 'home') this.app.onboardingState.homeHintDismissed = true;
            else this.app.onboardingState.moduleHintDismissed = true;
            this.app.saveOnboardingState();
            hint.remove();
        });

        panel.prepend(hint);
        this.app.saveOnboardingState();
    }

    getTabDisplayName(tabName) {
        const tabButton = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
        return tabButton?.querySelector('span')?.textContent?.trim() || tabName;
    }
}
