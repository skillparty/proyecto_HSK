// Solución ULTRA SIMPLE - Solo mostrar/ocultar
(function() {
    console.log('🐉 SOLUCIÓN DRAGÓN DE FUEGO (Ultra Simple)');
    
    // 1. Crear elementos de respuesta si no existen
    function ensureAnswerElements() {
        let answerContainer = document.getElementById('simple-answer-container');
        if (!answerContainer) {
            const flashcard = document.getElementById('flashcard');
            if (!flashcard) {
                console.error('No se encuentra flashcard');
                return null;
            }
            
            // Crear contenedor de respuesta simple
            answerContainer = document.createElement('div');
            answerContainer.id = 'simple-answer-container';
            answerContainer.style.cssText = `
                display: none;
                background: linear-gradient(135deg, #0ea5e9, #0284c7);
                color: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                margin-top: 1rem;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            
            // Insertar después del flashcard
            flashcard.parentNode.insertBefore(answerContainer, flashcard.nextSibling);
        }
        return answerContainer;
    }
    
    // 2. Función simple de mostrar respuesta
    window.showAnswer = function() {
        console.log('🔥 Mostrando respuesta...');
        
        const answerContainer = ensureAnswerElements();
        if (!answerContainer || !window.app || !window.app.currentWord) {
            console.error('No hay palabra actual');
            return;
        }
        
        const word = window.app.currentWord;
        
        // Construir contenido de respuesta
        answerContainer.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">
                ${word.character}
            </div>
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #ffd700;">
                ${word.pinyin}
            </div>
            <div style="font-size: 1.2rem;">
                ${word.english || word.translation || 'Sin traducción'}
            </div>
            <div style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">
                Nivel HSK ${word.level}
            </div>
        `;
        
        // Mostrar respuesta
        answerContainer.style.display = 'block';
        
        // Actualizar estado y botones
        window.app.isFlipped = true;
        
        const flipBtn = document.getElementById('flip-btn');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
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
        
        console.log('✅ Respuesta mostrada y botones habilitados');
    };
    
    // 3. Función para ocultar respuesta
    window.hideAnswer = function() {
        const answerContainer = document.getElementById('simple-answer-container');
        if (answerContainer) {
            answerContainer.style.display = 'none';
        }
        window.app.isFlipped = false;
    };
    
    // 4. Sobrescribir métodos de la app
    if (window.app) {
        // Método principal de volteo
        window.app.doFlip = function() {
            showAnswer();
        };
        
        window.app.flipCard = function() {
            showAnswer();
        };
        
        // Modificar updateCard para ocultar respuestas
        const originalUpdateCard = window.app.updateCard;
        window.app.updateCard = function() {
            hideAnswer();
            originalUpdateCard.call(this);
        };
    }
    
    // 5. Agregar listeners a los elementos
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        // Remover listeners anteriores
        const newFlashcard = flashcard.cloneNode(true);
        flashcard.parentNode.replaceChild(newFlashcard, flashcard);
        
        // Agregar nuevo listener
        newFlashcard.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON' && window.app && !window.app.isFlipped) {
                showAnswer();
            }
        });
    }
    
    const flipBtn = document.getElementById('flip-btn');
    if (flipBtn) {
        // Remover listeners anteriores
        const newFlipBtn = flipBtn.cloneNode(true);
        flipBtn.parentNode.replaceChild(newFlipBtn, flipBtn);
        
        // Agregar nuevo listener
        newFlipBtn.addEventListener('click', function() {
            showAnswer();
        });
    }
    
    // 6. Agregar algo de estilo divertido
    const dragonStyle = document.createElement('style');
    dragonStyle.textContent = `
        #simple-answer-container {
            animation: fireBreath 0.5s ease-out;
        }
        
        @keyframes fireBreath {
            0% {
                transform: scale(0.8) translateY(20px);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
        }
        
        /* Mejorar visibilidad de botones */
        #know-btn:not(:disabled),
        #dont-know-btn:not(:disabled) {
            background: #10b981 !important;
            cursor: pointer !important;
            transform: scale(1) !important;
            transition: transform 0.2s !important;
        }
        
        #know-btn:not(:disabled):hover,
        #dont-know-btn:not(:disabled):hover {
            transform: scale(1.05) !important;
        }
        
        #know-btn:disabled,
        #dont-know-btn:disabled {
            background: #6b7280 !important;
            cursor: not-allowed !important;
        }
    `;
    document.head.appendChild(dragonStyle);
    
    console.log('\n✅ SOLUCIÓN IMPLEMENTADA');
    console.log('🐲 Click en la tarjeta o "Show Answer" para ver la respuesta');
    console.log('🔥 La respuesta aparecerá debajo con animación de fuego de dragón');
    console.log('\n💡 Para probar manualmente: showAnswer()');
})();
