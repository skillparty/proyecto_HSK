// Fix de flashcards simplificado para copiar y pegar en la consola
(function() {
    console.log('Aplicando correcciones de flashcards...');
    
    // Verificar elementos
    const flashcard = document.getElementById('flashcard');
    const flashcardInner = document.querySelector('.flashcard-inner');
    
    if (!flashcard || !flashcardInner) {
        console.error('No se encontraron los elementos de flashcard');
        return;
    }
    
    // Agregar estilos CSS necesarios
    const style = document.createElement('style');
    style.textContent = `
        .flashcard-container {
            perspective: 1000px !important;
            -webkit-perspective: 1000px !important;
        }
        
        .flashcard {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
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
            -webkit-transform: rotateX(0deg) !important;
            transform: rotateX(0deg) !important;
        }
        
        .card-back {
            transform: rotateY(180deg) !important;
            -webkit-transform: rotateY(180deg) !important;
        }
        
        #know-btn:not(:disabled),
        #dont-know-btn:not(:disabled) {
            cursor: pointer !important;
            opacity: 1 !important;
        }
        
        #know-btn:disabled,
        #dont-know-btn:disabled {
            cursor: not-allowed !important;
            opacity: 0.5 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Interceptar la función flipCard si existe
    if (window.app && window.app.flipCard) {
        const originalFlipCard = window.app.flipCard.bind(window.app);
        window.app.flipCard = function() {
            console.log('Volteando tarjeta...');
            originalFlipCard();
            
            // Actualizar botones después del volteo
            setTimeout(() => {
                const knowBtn = document.getElementById('know-btn');
                const dontKnowBtn = document.getElementById('dont-know-btn');
                const flipBtn = document.getElementById('flip-btn');
                
                if (window.app.isFlipped) {
                    console.log('Tarjeta volteada - habilitando botones');
                    if (knowBtn) {
                        knowBtn.disabled = false;
                        knowBtn.style.opacity = '1';
                    }
                    if (dontKnowBtn) {
                        dontKnowBtn.disabled = false;
                        dontKnowBtn.style.opacity = '1';
                    }
                    if (flipBtn) flipBtn.disabled = true;
                } else {
                    console.log('Tarjeta no volteada - deshabilitando botones');
                    if (knowBtn) {
                        knowBtn.disabled = true;
                        knowBtn.style.opacity = '0.5';
                    }
                    if (dontKnowBtn) {
                        dontKnowBtn.disabled = true;
                        dontKnowBtn.style.opacity = '0.5';
                    }
                    if (flipBtn) flipBtn.disabled = false;
                }
            }, 100);
        };
        
        console.log('✅ Correcciones aplicadas exitosamente');
    } else {
        console.error('❌ No se encontró window.app o window.app.flipCard');
    }
})();
