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

