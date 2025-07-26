// Solución definitiva para flashcards - desactiva listeners conflictivos
(function() {
    console.log('🚀 Aplicando solución definitiva para flashcards...');
    
    // Paso 1: Eliminar todos los event listeners conflictivos
    const flashcard = document.getElementById('flashcard');
    const flipBtn = document.getElementById('flip-btn');
    
    if (flashcard) {
        // Clonar el elemento para eliminar TODOS los event listeners
        const newFlashcard = flashcard.cloneNode(true);
        flashcard.parentNode.replaceChild(newFlashcard, flashcard);
        console.log('✅ Listeners de flashcard eliminados');
    }
    
    if (flipBtn) {
        // Clonar el botón para eliminar TODOS los event listeners
        const newFlipBtn = flipBtn.cloneNode(true);
        flipBtn.parentNode.replaceChild(newFlipBtn, flipBtn);
        console.log('✅ Listeners del botón flip eliminados');
    }
    
    // Paso 2: Sobrescribir completamente el método flipCard
    if (window.app) {
        window.app.flipCard = function() {
            if (!this.currentWord) {
                console.warn('No hay palabra actual para voltear');
                return;
            }
            
            const flashcard = document.getElementById('flashcard');
            const flipBtn = document.getElementById('flip-btn');
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');
            
            if (!flashcard) {
                console.error('Elemento flashcard no encontrado');
                return;
            }
            
            // Cambiar el estado
            this.isFlipped = !this.isFlipped;
            
            // Aplicar la clase CSS
            if (this.isFlipped) {
                flashcard.classList.add('flipped');
                console.log('✅ Tarjeta volteada - mostrando respuesta');
                
                // Habilitar botones de respuesta
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
                
                // Reproducir audio si está habilitado
                if (this.isAudioEnabled && this.currentWord) {
                    this.pronounceText(this.currentWord.character);
                }
            } else {
                flashcard.classList.remove('flipped');
                console.log('↩️ Tarjeta no volteada - mostrando pregunta');
                
                // Deshabilitar botones de respuesta
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
        };
        
        // Sobrescribir updateCard para prevenir el reseteo del estado
        const originalUpdateCard = window.app.updateCard.bind(window.app);
        window.app.updateCard = function() {
            const wasFlipped = this.isFlipped;
            originalUpdateCard();
            
            // Si necesitamos preservar el estado volteado
            if (wasFlipped && window.preserveFlipState) {
                const flashcard = document.getElementById('flashcard');
                this.isFlipped = true;
                if (flashcard) {
                    flashcard.classList.add('flipped');
                }
                
                // Actualizar botones
                const knowBtn = document.getElementById('know-btn');
                const dontKnowBtn = document.getElementById('dont-know-btn');
                const flipBtn = document.getElementById('flip-btn');
                
                if (knowBtn) knowBtn.disabled = false;
                if (dontKnowBtn) dontKnowBtn.disabled = false;
                if (flipBtn) flipBtn.disabled = true;
                
                window.preserveFlipState = false;
            }
        };
        
        // Sobrescribir updateControlButtons para asegurar consistencia
        window.app.updateControlButtons = function() {
            const flipBtn = document.getElementById('flip-btn');
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');

            if (this.currentWord) {
                if (flipBtn) {
                    flipBtn.disabled = this.isFlipped;
                    flipBtn.style.opacity = this.isFlipped ? '0.5' : '1';
                }
                if (knowBtn) {
                    knowBtn.disabled = !this.isFlipped;
                    knowBtn.style.opacity = this.isFlipped ? '1' : '0.5';
                    knowBtn.style.cursor = this.isFlipped ? 'pointer' : 'not-allowed';
                }
                if (dontKnowBtn) {
                    dontKnowBtn.disabled = !this.isFlipped;
                    dontKnowBtn.style.opacity = this.isFlipped ? '1' : '0.5';
                    dontKnowBtn.style.cursor = this.isFlipped ? 'pointer' : 'not-allowed';
                }
            } else {
                if (flipBtn) flipBtn.disabled = true;
                if (knowBtn) knowBtn.disabled = true;
                if (dontKnowBtn) dontKnowBtn.disabled = true;
            }
        };
    }
    
    // Paso 3: Agregar nuevos event listeners limpios
    setTimeout(() => {
        const flipBtn = document.getElementById('flip-btn');
        const flashcard = document.getElementById('flashcard');
        
        if (flipBtn) {
            flipBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.app && window.app.flipCard) {
                    window.app.flipCard();
                }
            });
            console.log('✅ Nuevo listener agregado al botón flip');
        }
        
        if (flashcard) {
            flashcard.addEventListener('click', function(e) {
                // No hacer nada si es un botón
                if (e.target.tagName === 'BUTTON') return;
                
                // Voltear solo si no está volteada
                if (window.app && !window.app.isFlipped && window.app.currentWord) {
                    window.app.flipCard();
                }
            });
            flashcard.style.cursor = 'pointer';
            console.log('✅ Nuevo listener agregado a la flashcard');
        }
    }, 100);
    
    // Paso 4: Aplicar estilos CSS correctivos
    const existingStyles = document.getElementById('flashcard-fix-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'flashcard-fix-final-styles';
    style.textContent = `
        /* Reset de estilos conflictivos */
        .flashcard-container {
            perspective: 1000px !important;
            -webkit-perspective: 1000px !important;
        }
        
        .flashcard {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            cursor: pointer !important;
            user-select: none !important;
        }
        
        .flashcard-inner {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            transform-style: preserve-3d !important;
            -webkit-transform-style: preserve-3d !important;
            transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
            -webkit-transition: -webkit-transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
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
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 2rem !important;
            box-sizing: border-box !important;
        }
        
        .card-front {
            background: var(--card-bg, white) !important;
            transform: rotateY(0deg) !important;
        }
        
        .card-back {
            background: var(--card-bg-back, #f8f9fa) !important;
            transform: rotateY(180deg) !important;
        }
        
        /* Estados de botones más claros */
        #know-btn:disabled,
        #dont-know-btn:disabled {
            opacity: 0.4 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
        
        #know-btn:not(:disabled),
        #dont-know-btn:not(:disabled) {
            opacity: 1 !important;
            cursor: pointer !important;
            pointer-events: auto !important;
        }
        
        /* Hover effect para flashcard */
        .flashcard:not(.flipped):hover .flashcard-inner {
            transform: rotateY(10deg) !important;
        }
        
        /* Mejorar textos */
        .card-character {
            font-size: 3.5rem !important;
            font-weight: 500 !important;
            margin-bottom: 1rem !important;
        }
        
        .card-info {
            text-align: left !important;
            max-width: 100% !important;
        }
        
        .card-info div {
            margin: 0.5rem 0 !important;
        }
        
        .card-info strong {
            color: var(--primary-color, #e11d48) !important;
            margin-right: 0.5rem !important;
        }
    `;
    document.head.appendChild(style);
    
    // Paso 5: Verificar y actualizar el estado inicial
    if (window.app) {
        window.app.updateControlButtons();
    }
    
    console.log('✅ Solución definitiva aplicada exitosamente');
    console.log('💡 La flashcard ahora debería funcionar correctamente');
    console.log('🔧 Todos los listeners conflictivos han sido eliminados');
})();
