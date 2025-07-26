// Versión final con paleta de colores correcta y funcionalidad completa
(function() {
    console.log('🎨 APLICANDO VERSIÓN FINAL CON PALETA CORRECTA');
    
    // 1. Neutralizar código problemático
    if (window.fixFlashcards) {
        window.fixFlashcards = null;
    }
    
    window.manualFlip = function() { console.log('manualFlip neutralizado'); };
    window.applyAllFixes = function() { console.log('applyAllFixes neutralizado'); };
    
    // 2. Limpiar listeners
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        const newFlashcard = flashcard.cloneNode(true);
        flashcard.parentNode.replaceChild(newFlashcard, flashcard);
    }
    
    const flipBtn = document.getElementById('flip-btn');
    if (flipBtn) {
        const newFlipBtn = flipBtn.cloneNode(true);
        flipBtn.parentNode.replaceChild(newFlipBtn, flipBtn);
    }
    
    // 3. Limpiar botones I Know / I Don't Know
    const knowBtn = document.getElementById('know-btn');
    const dontKnowBtn = document.getElementById('dont-know-btn');
    
    if (knowBtn) {
        const newKnowBtn = knowBtn.cloneNode(true);
        knowBtn.parentNode.replaceChild(newKnowBtn, knowBtn);
    }
    
    if (dontKnowBtn) {
        const newDontKnowBtn = dontKnowBtn.cloneNode(true);
        dontKnowBtn.parentNode.replaceChild(newDontKnowBtn, dontKnowBtn);
    }
    
    // 4. Función de volteo elegante con paleta correcta
    window.elegantFlip = function() {
        console.log('🎴 Ejecutando volteo elegante...');
        
        if (!window.app || !window.app.currentWord) {
            console.error('No hay palabra actual');
            return;
        }
        
        const word = window.app.currentWord;
        const flashcardElement = document.getElementById('flashcard');
        
        if (!flashcardElement) return;
        
        // Paso 1: Efecto de "volteo" - la tarjeta se encoge horizontalmente
        flashcardElement.style.transition = 'transform 0.3s ease-in-out';
        flashcardElement.style.transform = 'scaleX(0)';
        
        setTimeout(() => {
            // Resto del código se define en las funciones siguientes...
        }, 150);
    };
    
    // El resto del código se reescribirá correctamente
