// Solución simple y directa para arreglar las flashcards
(function() {
    console.log('🔧 Aplicando fix simple...');
    
    if (!window.app) {
        console.error('❌ La app no está cargada');
        return;
    }
    
    // Guardar referencia al método original
    const originalUpdateControlButtons = window.app.updateControlButtons;
    
    // Sobrescribir el método problemático
    window.app.updateControlButtons = function() {
        // Llamar al método original
        originalUpdateControlButtons.call(this);
        
        // Si la tarjeta está volteada, asegurar que los botones estén habilitados
        if (this.isFlipped) {
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');
            
            if (knowBtn) {
                knowBtn.disabled = false;
                knowBtn.style.opacity = '1';
                knowBtn.style.cursor = 'pointer';
            }
            if (dontKnowBtn) {
                dontKnowBtn.disabled = false;
                dontKnowBtn.style.opacity = '1';
                dontKnowBtn.style.cursor = 'pointer';
            }
        }
    };
    
    console.log('✅ Fix aplicado - prueba a voltear una tarjeta ahora');
})();
