// Service Worker registration + update handling.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const appBasePath = window.location.pathname.replace(/\/[^/]*$/, '/');
            const swUrl = `${appBasePath}sw.js?v=11`;

            const registration = await navigator.serviceWorker.register(swUrl, {
                scope: appBasePath
            });
            console.log('✅ ServiceWorker registered');

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('👷 New Service Worker installing');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 New content available; please refresh.');
                        if (window.app && window.app.handleUpdate) {
                            window.app.handleUpdate(registration);
                        }
                    }
                });
            });

            // Check if there is already a waiting worker on load
            if (registration.waiting && navigator.serviceWorker.controller) {
                console.log('🔄 A waiting Service Worker was found');
                if (window.app && window.app.handleUpdate) {
                    window.app.handleUpdate(registration);
                }
            }

        } catch (error) {
            console.warn('Service Worker registration skipped:', error);
        }
    });

    // Reload when the new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('🚀 Controller changed, reloading...');
        window.location.reload();
    });
}
console.log('[🚀] HSK Learning App Ready');
