// Solución rápida: limpiar el caché del service worker y recargar
(async function() {
    console.log('🧹 Limpiando caché del navegador...');
    
    // Desregistrar todos los service workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
            console.log('✅ Service Worker desregistrado');
        }
    }
    
    // Limpiar todos los cachés
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (let name of cacheNames) {
            await caches.delete(name);
            console.log(`✅ Caché "${name}" eliminado`);
        }
    }
    
    // Forzar recarga completa sin caché
    console.log('🔄 Recargando la página sin caché...');
    console.log('⚠️ Después de recargar, las flashcards deberían funcionar normalmente');
    
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
})();
