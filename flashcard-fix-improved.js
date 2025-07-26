// Fix mejorado para flashcards que maneja el reseteo automático
(function() {
    console.log('🔧 Aplicando correcciones mejoradas de flashcards...');
    
    // Verificar que la app esté cargada
    if (!window.app) {
        console.error('❌ La aplicación no está cargada. Espera a que cargue completamente.');
        return;
    }
    
    // Sobrescribir el método updateCard para prevenir el reseteo del flip
    const originalUpdateCard = window.app.updateCard.bind(window.app);
    let skipFlipReset = false;
    
    window.app.updateCard = function() {
        const wasFlipped = this.isFlipped;
        const flashcard = document.querySelector('.flashcard');
        
        // Llamar al método original
        originalUpdateCard();
        
        // Si estábamos volteados y no debemos resetear, restaurar el estado
        if (wasFlipped && skipFlipReset) {
            this.isFlipped = true;
            if (flashcard) {
                flashcard.classList.add('flipped');
            }
            this.updateControlButtons();
            skipFlipReset = false;
        }
    };
    
    // Mejorar el método flipCard
    const originalFlipCard = window.app.flipCard.bind(window.app);
    window.app.flipCard = function() {
        console.log('🔄 Volteando tarjeta...');
        
        // Marcar que no queremos resetear el flip en la próxima actualización
        skipFlipReset = true;
        
        // Llamar al método original
        originalFlipCard();
        
        // Asegurar que los botones se actualicen correctamente
        setTimeout(() => {
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');
            const flipBtn = document.getElementById('flip-btn');
            
            if (this.isFlipped) {
                console.log('✅ Tarjeta volteada - habilitando botones de respuesta');
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
                if (flipBtn) {
                    flipBtn.disabled = true;
                    flipBtn.style.opacity = '0.5';
                }
            } else {
                console.log('↩️ Tarjeta no volteada - modo pregunta');
                if (knowBtn) {
                    knowBtn.disabled = true;
                    knowBtn.style.opacity = '0.5';
                    knowBtn.style.cursor = 'not-allowed';
                }
                if (dontKnowBtn) {
                    dontKnowBtn.disabled = true;
                    dontKnowBtn.style.opacity = '0.5';
                    dontKnowBtn.style.cursor = 'not-allowed';
                }
                if (flipBtn) {
                    flipBtn.disabled = false;
                    flipBtn.style.opacity = '1';
                }
            }
        }, 50);
    };
    
    // Agregar listener de click directo en la flashcard
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        // Remover listeners anteriores si existen
        flashcard.removeEventListener('click', window.flashcardClickHandler);
        
        // Crear nuevo handler
        window.flashcardClickHandler = function(e) {
            // No hacer nada si clickeamos en un botón
            if (e.target.tagName === 'BUTTON') return;
            
            // Si no está volteada, voltearla
            if (!window.app.isFlipped && window.app.currentWord) {
                console.log('👆 Click en flashcard detectado');
                window.app.flipCard();
            }
        };
        
        flashcard.addEventListener('click', window.flashcardClickHandler);
        flashcard.style.cursor = 'pointer';
    }
    
    // Agregar estilos CSS mejorados
    const existingStyles = document.getElementById('flashcard-fix-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'flashcard-fix-styles';
    style.textContent = `
        /* Estilos para el volteo 3D */
        .flashcard-container {
            perspective: 1000px !important;
            -webkit-perspective: 1000px !important;
        }
        
        .flashcard {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            cursor: pointer !important;
            transform-style: preserve-3d !important;
            -webkit-transform-style: preserve-3d !important;
        }
        
        .flashcard-inner {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            transform-style: preserve-3d !important;
            -webkit-transform-style: preserve-3d !important;
            transition: transform 0.6s !important;
            -webkit-transition: -webkit-transform 0.6s !important;
        }
        
        .flashcard.flipped .flashcard-inner {
            transform: rotateY(180deg) !important;
            -webkit-transform: rotateY(180deg) !important;
        }
        
        .card-face {
            position: absolute !important;
            width: 100% !important;
            height: 100% !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 2rem !important;
            box-sizing: border-box !important;
        }
        
        .card-front {
            transform: rotateY(0deg) !important;
            -webkit-transform: rotateY(0deg) !important;
        }
        
        .card-back {
            transform: rotateY(180deg) !important;
            -webkit-transform: rotateY(180deg) !important;
            background: var(--card-bg, #f0f0f0) !important;
        }
        
        /* Estilos para botones */
        #know-btn:not(:disabled),
        #dont-know-btn:not(:disabled) {
            cursor: pointer !important;
            opacity: 1 !important;
            transform: scale(1) !important;
            transition: all 0.2s !important;
        }
        
        #know-btn:not(:disabled):hover,
        #dont-know-btn:not(:disabled):hover {
            transform: scale(1.05) !important;
        }
        
        #know-btn:disabled,
        #dont-know-btn:disabled {
            cursor: not-allowed !important;
            opacity: 0.5 !important;
            transform: scale(1) !important;
        }
        
        /* Indicador visual de que la flashcard es clickeable */
        .flashcard:not(.flipped):hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        /* Mejorar la visibilidad del texto */
        .card-character {
            font-size: 3rem !important;
            font-weight: 500 !important;
            text-align: center !important;
        }
        
        .card-info {
            font-size: 1.1rem !important;
            line-height: 1.8 !important;
        }
        
        .card-info strong {
            color: var(--primary-color, #e11d48) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Verificar estado inicial
    window.app.updateControlButtons();
    
    console.log('✅ Correcciones aplicadas exitosamente');
    console.log('💡 Tip: Haz click en la flashcard o presiona el botón "Show Answer" para voltearla');
})();
