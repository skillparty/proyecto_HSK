// Lightweight logger for controlling runtime verbosity.
(function () {
    function isDebugEnabled() {
        try {
            const url = new URL(window.location.href);
            const debugParam = url.searchParams.get('debug');
            const debugStorage = localStorage.getItem('hsk-debug');
            const localHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            return debugParam === '1' || debugParam === 'true' || debugStorage === '1' || localHost;
        } catch (_err) {
            return false;
        }
    }

    const logger = {
        debug: function (...args) {
            if (isDebugEnabled()) {
                console.log(...args);
            }
        },
        info: function (...args) {
            console.log(...args);
        },
        warn: function (...args) {
            console.warn(...args);
        },
        error: function (...args) {
            console.error(...args);
        },
        isDebugEnabled: isDebugEnabled
    };

    window.hskLogger = logger;
})();
