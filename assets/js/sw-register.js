// Service Worker registration + update handling + PWA capabilities.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const appBasePath = window.location.pathname.replace(/\/[^/]*$/, '/');
            const swUrl = `${appBasePath}sw.js?v=11`;

            const registration = await navigator.serviceWorker.register(swUrl, {
                scope: appBasePath
            });
            (window.hskLogger || console).debug('✅ ServiceWorker registered');

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                (window.hskLogger || console).debug('👷 New Service Worker installing');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        (window.hskLogger || console).debug('🔄 New content available; please refresh.');
                        if (window.app && window.app.handleUpdate) {
                            window.app.handleUpdate(registration);
                        }
                    }
                });
            });

            // Check if there is already a waiting worker on load
            if (registration.waiting && navigator.serviceWorker.controller) {
                (window.hskLogger || console).debug('🔄 A waiting Service Worker was found');
                if (window.app && window.app.handleUpdate) {
                    window.app.handleUpdate(registration);
                }
            }

        } catch (error) {
            console.warn('Service Worker registration skipped:', error);
        }
    });

    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        (window.hskLogger || console).debug('🚀 Controller changed, reloading...');
        window.location.reload();
    });
}

// Standalone PWA Detection
const isStandalonePWA = (typeof window !== 'undefined') && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    Boolean(window.navigator.standalone) ||
    document.referrer.includes('android-app://')
);

if (isStandalonePWA && typeof document !== 'undefined') {
    document.documentElement.classList.add('is-pwa-standalone');
    (window.hskLogger || console).debug('📱 Running as Standalone PWA');
}

// PWA Install Prompt Handling
window.deferredPWAInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPWAInstallPrompt = e;
    (window.hskLogger || console).debug('📱 PWA install prompt ready');
    window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
});

window.promptPWAInstall = async function() {
    if (!window.deferredPWAInstallPrompt) return false;
    const promptEvent = window.deferredPWAInstallPrompt;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    window.deferredPWAInstallPrompt = null;
    return result.outcome === 'accepted';
};

// PWA Install Manager UI Controller
const PWAInstallManager = {
    isIOS: (typeof navigator !== 'undefined') && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(typeof window !== 'undefined' && window.MSStream),
    isStandalone: isStandalonePWA,

    init() {
        if (this.isStandalone) {
            this.hideInstallPrompts();
            return;
        }

        const installRow = document.getElementById('pwa-install-row');
        if (installRow) {
            installRow.style.display = 'flex';
        }

        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.triggerInstall());
        }

        const bannerInstallBtn = document.getElementById('pwa-banner-install-btn');
        if (bannerInstallBtn) {
            bannerInstallBtn.addEventListener('click', () => this.triggerInstall());
        }

        const bannerDismissBtn = document.getElementById('pwa-banner-dismiss-btn');
        if (bannerDismissBtn) {
            bannerDismissBtn.addEventListener('click', () => this.dismissBanner());
        }

        this.initIOSModal();
        this.initReminders();

        window.addEventListener('pwaInstallAvailable', () => {
            this.checkAndShowBanner();
        });

        window.addEventListener('appinstalled', () => {
            (window.hskLogger || console).debug('🎉 PWA installed successfully');
            this.hideInstallPrompts();
            if (window.app?.uiController?.showToast) {
                const isEs = window.app.currentLanguage !== 'en';
                window.app.uiController.showToast(
                    isEs ? '🎉 ¡App instalada con éxito! Ahora puedes abrirla desde tu pantalla de inicio' : '🎉 App installed! You can now open it from your home screen',
                    'success',
                    3500
                );
            }
        });

        // If iOS and not standalone, show smart banner after brief onboarding delay (3s)
        if (this.isIOS && !this.isStandalone) {
            setTimeout(() => this.checkAndShowBanner(), 3000);
        }
    },

    checkAndShowBanner() {
        if (this.isStandalone) return;
        try {
            const dismissedAt = localStorage.getItem('hsk_pwa_banner_dismissed');
            if (dismissedAt) {
                const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
                if (days < 7) return; // Dismissed within 7 days
            }
        } catch { /* storage blocked */ }

        const banner = document.getElementById('pwa-smart-banner');
        if (banner) {
            banner.style.display = 'flex';
        }
    },

    dismissBanner() {
        const banner = document.getElementById('pwa-smart-banner');
        if (banner) {
            banner.style.display = 'none';
        }
        try {
            localStorage.setItem('hsk_pwa_banner_dismissed', String(Date.now()));
        } catch { /* storage blocked */ }
    },

    triggerInstall() {
        if (this.isIOS) {
            this.showIOSModal();
            return;
        }

        if (window.deferredPWAInstallPrompt) {
            window.promptPWAInstall().then((accepted) => {
                if (accepted) {
                    this.dismissBanner();
                    this.hideInstallPrompts();
                }
            });
        } else {
            // Fallback for browsers without beforeinstallprompt or desktop Safari/Firefox
            this.showIOSModal();
        }
    },

    initIOSModal() {
        const dialog = document.getElementById('ios-install-dialog');
        if (!dialog) return;

        const closeBtn = document.getElementById('ios-modal-close');
        const gotItBtn = document.getElementById('ios-modal-got-it');

        const closeDialog = () => {
            if (typeof dialog.close === 'function') dialog.close();
            else dialog.style.display = 'none';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeDialog);
        if (gotItBtn) gotItBtn.addEventListener('click', closeDialog);

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
    },

    showIOSModal() {
        const dialog = document.getElementById('ios-install-dialog');
        if (!dialog) return;
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.style.display = 'block';
        }
    },

    initReminders() {
        const reminderBtn = document.getElementById('reminder-toggle-btn');
        const reminderText = document.getElementById('reminder-btn-text');
        if (!reminderBtn) return;

        const updateReminderBtnState = () => {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                if (reminderText) reminderText.textContent = window.app?.getTranslation?.('reminderActiveText') || 'Activo ✓';
                reminderBtn.classList.add('btn-success');
            } else {
                if (reminderText) reminderText.textContent = window.app?.getTranslation?.('reminderActivateText') || 'Notificar';
                reminderBtn.classList.remove('btn-success');
            }
        };

        updateReminderBtnState();

        reminderBtn.addEventListener('click', async () => {
            if (typeof Notification === 'undefined') {
                if (window.app?.uiController?.showToast) {
                    window.app.uiController.showToast('Las notificaciones no están soportadas en este navegador', 'info');
                }
                return;
            }

            if (Notification.permission === 'granted') {
                if (window.app?.uiController?.showToast) {
                    const isEs = window.app.currentLanguage !== 'en';
                    window.app.uiController.showToast(
                        isEs ? '🔔 Recordatorios diarios ya están activos' : '🔔 Daily reminders are already active',
                        'success'
                    );
                }
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    updateReminderBtnState();
                    if (navigator.serviceWorker?.ready) {
                        const reg = await navigator.serviceWorker.ready;
                        reg.showNotification('Confuc10++ HSK', {
                            body: '🔔 ¡Recordatorios activados! Te avisaremos para mantener tu racha diaria.',
                            icon: 'assets/images/logo05.png',
                            badge: 'assets/images/logo05.png',
                        });
                    }
                }
            } catch (err) {
                (window.hskLogger || console).debug('Notification request failed:', err);
            }
        });
    },

    hideInstallPrompts() {
        const row = document.getElementById('pwa-install-row');
        if (row) row.style.display = 'none';
        const banner = document.getElementById('pwa-smart-banner');
        if (banner) banner.style.display = 'none';
    }
};

window.PWAInstallManager = PWAInstallManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PWAInstallManager.init());
} else {
    PWAInstallManager.init();
}

// PWA App Badging API Helper
window.updateAppBadge = function(count) {
    if ('setAppBadge' in navigator) {
        if (typeof count === 'number' && count > 0) {
            navigator.setAppBadge(count).catch(() => {});
        } else {
            navigator.clearAppBadge().catch(() => {});
        }
    }
};

// Online / Offline Network Notifications
window.addEventListener('online', () => {
    if (window.app?.uiController?.showToast) {
        const isEs = window.app.currentLanguage !== 'en';
        window.app.uiController.showToast(
            isEs ? '🟢 Conexión restablecida - Modo Online' : '🟢 Connection restored - Online Mode',
            'success',
            2200
        );
    }
});

window.addEventListener('offline', () => {
    if (window.app?.uiController?.showToast) {
        const isEs = window.app.currentLanguage !== 'en';
        window.app.uiController.showToast(
            isEs ? '📡 Modo Sin Conexión - Todo el contenido y audios están disponibles offline' : '📡 Offline Mode - All content and audio available offline',
            'info',
            3500
        );
    }
});

(window.hskLogger || console).debug('[🚀] HSK Learning App Ready');

