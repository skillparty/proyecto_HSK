// Early diagnostics: resource validation + global error/rejection banners.
// Loaded synchronously (no defer) so error listeners attach during head parse.

// Validate critical resources on load
window.addEventListener('load', function () {
    (window.hskLogger || console).debug('🔍 Validating critical resources...');

    // Check if main stylesheet loaded
    const mainStylesheet = document.getElementById('main-stylesheet');
    if (mainStylesheet && !mainStylesheet.sheet) {
        console.warn('⚠️ Main stylesheet failed to load, applying fallback styles');

        // Create fallback styles
        const fallbackCSS = document.createElement('style');
        fallbackCSS.textContent = `
            body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; background: #1a1a1a; color: white; }
            .app-container { min-height: 100vh; display: flex; flex-direction: column; }
            .nav-tab.active { background: #3b82f6; color: white; }
            .flashcard { background: #2a2a2a; border-radius: 12px; padding: 2rem; margin: 2rem auto; }
        `;
        document.head.appendChild(fallbackCSS);
    }

    (window.hskLogger || console).debug('[✓] Resource validation complete');
});

// Error handler for missing resources
function showResourceError(resource) {
    console.error(`[✗] Failed to load: ${resource}`);

    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #ef4444; color: white; padding: 12px 16px;
        border-radius: 8px; font-size: 14px; max-width: 300px;
    `;
    errorDiv.textContent = `Error loading ${resource}. Some features may not work correctly.`;
    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Global uncaught error display
window.addEventListener('error', (event) => {
    console.error('[✗] Uncaught error:', event.message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'debug-error-banner';
    errorDiv.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; z-index: 20000;
        background: #b91c1c; color: white; padding: 16px;
        border-radius: 8px; font-size: 14px; max-width: 450px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 2px solid #ef4444;
        font-family: monospace; line-height: 1.4; pointer-events: auto;
    `;
    const filename = event.filename ? event.filename.split('/').pop() : 'inline';
    errorDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">❌ JS Runtime Error</div>
        <div style="margin-bottom: 8px;">${event.message}</div>
        <div style="color: #fca5a5; font-size: 12px;">File: ${filename} (Line ${event.lineno}:${event.colno})</div>
        <button type="button" class="dismiss-err-btn" style="margin-top: 10px; background: white; color: #b91c1c; border: none; padding: 4px 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">Dismiss</button>
    `;
    document.body.appendChild(errorDiv);
    const dismissBtn = errorDiv.querySelector('.dismiss-err-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => errorDiv.remove());
    }
});

// Global promise rejection display
window.addEventListener('unhandledrejection', (event) => {
    console.error('[✗] Unhandled rejection:', event.reason);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'debug-error-banner';
    errorDiv.style.cssText = `
        position: fixed; bottom: 180px; left: 20px; z-index: 20000;
        background: #ea580c; color: white; padding: 16px;
        border-radius: 8px; font-size: 14px; max-width: 450px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 2px solid #f97316;
        font-family: monospace; line-height: 1.4; pointer-events: auto;
    `;
    const reasonMsg = event.reason?.message || event.reason;
    const stack = event.reason?.stack ? event.reason.stack.split('\n')[0] : 'No stack trace';
    errorDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">⚠️ Promise Rejection</div>
        <div style="margin-bottom: 8px;">${reasonMsg}</div>
        <div style="color: #ffedd5; font-size: 12px; white-space: pre-wrap;">Trace: ${stack}</div>
        <button type="button" class="dismiss-rejection-btn" style="margin-top: 10px; background: white; color: #ea580c; border: none; padding: 4px 8px; border-radius: 4px; font-weight: bold; cursor: pointer;">Dismiss</button>
    `;
    document.body.appendChild(errorDiv);
    const dismissBtn = errorDiv.querySelector('.dismiss-rejection-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => errorDiv.remove());
    }
});
