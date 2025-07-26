// Solución definitiva - Neutralizar archivo problemático y arreglar
(function() {
    console.log('🛡️ NEUTRALIZANDO CÓDIGO PROBLEMÁTICO');
    
    // 1. Desactivar completamente las funciones del fix-flashcards.js
    if (window.fixFlashcards) {
        window.fixFlashcards = null;
        console.log('✅ fixFlashcards neutralizado');
    }
    
    // Desactivar funciones globales problemáticas
    window.manualFlip = function() {
        console.log('manualFlip desactivado - usando nueva implementación');
    };
    
    window.applyAllFixes = function() {
        console.log('applyAllFixes desactivado - usando nueva implementación');
    };
    
    // 2. Limpiar todos los event listeners de la flashcard
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        // Clonar para eliminar TODOS los listeners
        const newFlashcard = flashcard.cloneNode(true);
        flashcard.parentNode.replaceChild(newFlashcard, flashcard);
        console.log('✅ Flashcard clonada - listeners problemáticos eliminados');
    }
    
    // 3. Limpiar botón flip
    const flipBtn = document.getElementById('flip-btn');
    if (flipBtn) {
        const newFlipBtn = flipBtn.cloneNode(true);
        flipBtn.parentNode.replaceChild(newFlipBtn, flipBtn);
        console.log('✅ Botón flip clonado - listeners problemáticos eliminados');
    }
    
    // 4. Sobrescribir COMPLETAMENTE los métodos de app
    if (window.app) {
        // Método simple y directo
        window.app.flipCard = function() {
            console.log('🔄 Ejecutando nuevo flipCard...');
            
            if (!this.currentWord) {
                console.warn('No hay palabra para mostrar');
                return;
            }
            
            // Mostrar respuesta usando el método que sabemos que funciona
            forceShowResponse();
            
            // Marcar como volteada
            this.isFlipped = true;
            
            console.log('✅ Respuesta mostrada correctamente');
        };
        
        window.app.doFlip = window.app.flipCard;
        
        // Desactivar updateControlButtons problemático
        window.app.updateControlButtons = function() {
            // No hacer nada - dejamos que forceShowResponse maneje los botones
            console.log('updateControlButtons desactivado');
        };
        
        console.log('✅ Métodos de app sobrescritos');
    }
    
    // 5. Agregar listeners limpios
    setTimeout(() => {
        const newFlashcard = document.getElementById('flashcard');
        const newFlipBtn = document.getElementById('flip-btn');
        
        if (newFlashcard) {
            newFlashcard.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON' && window.app && window.app.currentWord) {
                    console.log('👆 Click en flashcard detectado');
                    window.app.flipCard();
                }
            });
            console.log('✅ Nuevo listener agregado a flashcard');
        }
        
        if (newFlipBtn) {
            newFlipBtn.addEventListener('click', function() {
                if (window.app && window.app.currentWord) {
                    console.log('👆 Click en botón flip detectado');
                    window.app.flipCard();
                }
            });
            console.log('✅ Nuevo listener agregado a botón flip');
        }
    }, 100);
    
    // 6. Mejorar forceShowResponse para que sea más integrada
    window.forceShowResponse = function() {
        console.log('🎯 Mostrando respuesta...');
        
        // Remover respuesta anterior si existe
        const existing = document.getElementById('force-response');
        if (existing) {
            existing.remove();
        }
        
        if (!window.app || !window.app.currentWord) {
            console.error('No hay palabra actual');
            return;
        }
        
        const word = window.app.currentWord;
        
        // Crear respuesta mejorada
        const response = document.createElement('div');
        response.id = 'force-response';
        response.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
            font-family: 'Arial', sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        response.innerHTML = `
            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            </style>
            <h3 style="margin: 0 0 20px 0; font-size: 1.5rem;">📖 Respuesta</h3>
            <div style="font-size: 3rem; margin: 15px 0; font-weight: 500;">${word.character}</div>
            <div style="font-size: 1.5rem; margin: 10px 0; color: #ffd700; font-weight: 500;">${word.pinyin}</div>
            <div style="font-size: 1.2rem; margin: 10px 0; line-height: 1.4;">${word.english || word.translation || 'Sin traducción'}</div>
            <div style="font-size: 0.9rem; margin: 15px 0; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; display: inline-block;">HSK Nivel ${word.level}</div>
            <br>
            <button onclick="this.parentNode.remove()" style="margin-top: 15px; padding: 10px 20px; border: none; background: rgba(255,255,255,0.3); color: white; border-radius: 25px; cursor: pointer; font-size: 1rem; transition: all 0.2s;">Cerrar</button>
        `;
        
        document.body.appendChild(response);
        
        // Habilitar botones I Know / I Don't Know
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        const flipBtn = document.getElementById('flip-btn');
        
        if (knowBtn) {
            knowBtn.disabled = false;
            knowBtn.style.opacity = '1';
            knowBtn.style.cursor = 'pointer';
            knowBtn.style.background = '#22c55e';
        }
        
        if (dontKnowBtn) {
            dontKnowBtn.disabled = false;
            dontKnowBtn.style.opacity = '1';
            dontKnowBtn.style.cursor = 'pointer';
            dontKnowBtn.style.background = '#ef4444';
        }
        
        if (flipBtn) {
            flipBtn.disabled = true;
            flipBtn.style.opacity = '0.5';
        }
        
        // Actualizar estado de la app
        if (window.app) {
            window.app.isFlipped = true;
        }
        
        console.log('✅ Respuesta mostrada y botones habilitados');
        
        // Reproducir audio si está habilitado
        if (window.app && window.app.isAudioEnabled && word.character) {
            try {
                window.app.pronounceText(word.character);
            } catch (e) {
                console.log('Audio no disponible');
            }
        }
    };
    
    console.log('\n✅ NEUTRALIZACIÓN COMPLETA');
    console.log('🎴 Ahora haz click en la flashcard o en "Show Answer"');
    console.log('🎯 La respuesta aparecerá en el centro de la pantalla');
    console.log('✅ Los botones I Know/I Don\'t Know se habilitarán automáticamente');
})();
