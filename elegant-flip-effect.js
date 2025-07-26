// Versión mejorada con efecto de volteo elegante
(function() {
    console.log('✨ APLICANDO EFECTO DE VOLTEO ELEGANTE');
    
    // 1. Neutralizar código problemático (igual que antes)
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
    
    // 3. Función de volteo elegante MEJORADA
    window.elegantFlip = function() {
        console.log('🎴 Ejecutando volteo elegante...');
        
        if (!window.app || !window.app.currentWord) {
            console.error('No hay palabra actual');
            return;
        }
        
        const word = window.app.currentWord;
        const flashcardElement = document.getElementById('flashcard');
        
        if (!flashcardElement) return;
        
        // Remover respuesta anterior si existe
        const existing = document.getElementById('elegant-answer');
        if (existing) {
            existing.remove();
        }
        
        // Paso 1: Efecto de "volteo" - la tarjeta se encoge horizontalmente
        flashcardElement.style.transition = 'transform 0.3s ease-in-out';
        flashcardElement.style.transform = 'scaleX(0)';
        
        setTimeout(() => {
            // Paso 2: Crear el contenido de respuesta dentro de la tarjeta
            const cardFront = flashcardElement.querySelector('.card-front');
            if (cardFront) {
                // Guardar contenido original
                const originalContent = cardFront.innerHTML;
                
                // Crear contenido de respuesta
                cardFront.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #0ea5e9, #0284c7);
                        color: white;
                        padding: 2rem;
                        border-radius: 12px;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        overflow: hidden;
                    ">
                        <!-- Efecto de brillo -->
                        <div style="
                            position: absolute;
                            top: -50%;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                            animation: shimmer 2s ease-in-out infinite;
                        "></div>
                        
                        <div style="font-size: 3rem; margin-bottom: 1rem; font-weight: 500; z-index: 1;">
                            ${word.character}
                        </div>
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #ffd700; font-weight: 500; z-index: 1;">
                            ${word.pinyin}
                        </div>
                        <div style="font-size: 1.2rem; margin-bottom: 1rem; text-align: center; line-height: 1.4; z-index: 1;">
                            ${word.english || word.translation || 'Sin traducción'}
                        </div>
                        <div style="
                            font-size: 0.9rem; 
                            opacity: 0.8; 
                            background: rgba(255,255,255,0.2); 
                            padding: 5px 15px; 
                            border-radius: 20px;
                            z-index: 1;
                        ">
                            HSK Nivel ${word.level}
                        </div>
                        
                        <!-- Botón para volver -->
                        <button onclick="window.resetFlashcard()" style="
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: rgba(255,255,255,0.3);
                            border: none;
                            color: white;
                            padding: 8px 12px;
                            border-radius: 20px;
                            cursor: pointer;
                            font-size: 0.8rem;
                            z-index: 2;
                            transition: all 0.2s;
                        ">
                            ↻ Volver
                        </button>
                    </div>
                `;
                
                // Agregar estilos de animación
                const shimmerStyle = document.createElement('style');
                shimmerStyle.innerHTML = `
                    @keyframes shimmer {
                        0% { transform: rotate(0deg); opacity: 0.3; }
                        50% { opacity: 0.1; }
                        100% { transform: rotate(360deg); opacity: 0.3; }
                    }
                `;
                document.head.appendChild(shimmerStyle);
                
                // Función para resetear la tarjeta
                window.resetFlashcard = function() {
                    flashcardElement.style.transform = 'scaleX(0)';
                    setTimeout(() => {
                        cardFront.innerHTML = originalContent;
                        flashcardElement.style.transform = 'scaleX(1)';
                        window.app.isFlipped = false;
                        
                        // Resetear botones
                        const knowBtn = document.getElementById('know-btn');
                        const dontKnowBtn = document.getElementById('dont-know-btn');
                        const flipBtn = document.getElementById('flip-btn');
                        
                        if (knowBtn) {
                            knowBtn.disabled = true;
                            knowBtn.style.opacity = '0.5';
                            knowBtn.style.background = '';
                        }
                        if (dontKnowBtn) {
                            dontKnowBtn.disabled = true;
                            dontKnowBtn.style.opacity = '0.5';
                            dontKnowBtn.style.background = '';
                        }
                        if (flipBtn) {
                            flipBtn.disabled = false;
                            flipBtn.style.opacity = '1';
                        }
                    }, 150);
                };
            }
            
            // Paso 3: La tarjeta se expande de nuevo mostrando la respuesta
            flashcardElement.style.transform = 'scaleX(1)';
            
            // Habilitar botones
            setTimeout(() => {
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
                
                window.app.isFlipped = true;
                console.log('✅ Volteo elegante completado');
                
                // Audio si está habilitado
                if (window.app.isAudioEnabled && word.character) {
                    try {
                        window.app.pronounceText(word.character);
                    } catch (e) {
                        console.log('Audio no disponible');
                    }
                }
            }, 300);
            
        }, 150);
    };
    
    // 4. Sobrescribir métodos de app
    if (window.app) {
        window.app.flipCard = function() {
            elegantFlip();
        };
        
        window.app.doFlip = window.app.flipCard;
        
        window.app.updateControlButtons = function() {
            // Desactivado para evitar interferencias
        };
        
        console.log('✅ Métodos de app actualizados');
    }
    
    // 5. Agregar listeners limpios
    setTimeout(() => {
        const newFlashcard = document.getElementById('flashcard');
        const newFlipBtn = document.getElementById('flip-btn');
        
        if (newFlashcard) {
            newFlashcard.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON' && window.app && window.app.currentWord && !window.app.isFlipped) {
                    console.log('👆 Click en flashcard detectado');
                    window.app.flipCard();
                }
            });
        }
        
        if (newFlipBtn) {
            newFlipBtn.addEventListener('click', function() {
                if (window.app && window.app.currentWord && !window.app.isFlipped) {
                    console.log('👆 Click en botón flip detectado');
                    window.app.flipCard();
                }
            });
        }
    }, 100);
    
    console.log('\n✨ EFECTO ELEGANTE APLICADO');
    console.log('🎴 La tarjeta ahora se "voltea" con un efecto de encogimiento/expansión');
    console.log('✨ Incluye efectos de brillo y transiciones suaves');
    console.log('🔄 Puedes usar el botón "Volver" para ver la pregunta nuevamente');
})();
