// Service Worker registration + update handling.
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

    // Recargar solo ante un cambio REAL de service worker. Si la página arrancó
    // sin controlador, el primer claim() es la instalación inicial: recargar ahí
    // tira el estado de la sesión (pestaña activa, partida en curso) a cambio de
    // nada, porque el SW recién instalado sirve exactamente lo ya cargado.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        (window.hskLogger || console).debug('🚀 Controller changed, reloading...');
        window.location.reload();
    });
}
(window.hskLogger || console).debug('[🚀] HSK Learning App Ready');
