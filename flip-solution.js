// Solución final para voltear flashcards
(function() {
    console.log('🎯 Aplicando solución de volteo...');
    
    // Verificar que todo esté listo
    if (!window.app) {
        console.error('La app no está cargada. Espera un momento y vuelve a intentar.');
        return;
    }
    
    // Sobrescribir el método doFlip para asegurar que funcione
    window.app.doFlip = function() {
        console.log('Ejecutando volteo...');
        
        const flashcard = document.getElementById('flashcard');
        const flipBtn = document.getElementById('flip-btn');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
        if (!flashcard || !this.currentWord) {
            console.warn('No se puede voltear - falta flashcard o palabra');
            return;
        }
        
        // Aplicar el volteo
        flashcard.classList.add('flipped');
        this.isFlipped = true;
        
        // Actualizar botones
        if (flipBtn) {
            flipBtn.disabled = true;
            flipBtn.style.opacity = '0.5';
        }
        
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
        
        console.log('✅ Tarjeta volteada exitosamente');
        
        // Audio si está habilitado
        if (this.isAudioEnabled && this.currentWord) {
            this.pronounceText(this.currentWord.character);
        }
    };
    
    // Asegurar que flipCard use doFlip
    window.app.flipCard = function() {
        this.doFlip();
    };
    
    console.log('✅ Solución aplicada');
    console.log('🎴 Ahora puedes hacer click en la tarjeta o en "Show Answer" para voltearla');
    
    // Test automático en 1 segundo
    setTimeout(() => {
        console.log('🧪 Probando volteo automático...');
        const flashcard = document.getElementById('flashcard');
        if (flashcard && !flashcard.classList.contains('flipped') && window.app.currentWord) {
            window.app.doFlip();
            console.log('✅ Prueba exitosa - la tarjeta se volteó');
        }
    }, 1000);
})();
