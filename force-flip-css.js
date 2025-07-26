// Solución CSS definitiva para volteo de flashcards
(function() {
    console.log('🎯 Aplicando solución CSS definitiva...');
    
    // 1. Eliminar cualquier CSS conflictivo previo
    const existingFixes = document.querySelectorAll('style[id*="fix"], style[id*="emergency"]');
    existingFixes.forEach(el => el.remove());
    console.log('✓ CSS conflictivo eliminado');
    
    // 2. Inyectar CSS correcto y completo
    const criticalCSS = document.createElement('style');
    criticalCSS.id = 'critical-flip-css';
    criticalCSS.textContent = `
        /* Reset y base */
        .flashcard-container {
            perspective: 1000px !important;
            -webkit-perspective: 1000px !important;
            height: 300px !important;
            position: relative !important;
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
            transition: transform 0.6s ease-in-out !important;
            -webkit-transition: -webkit-transform 0.6s ease-in-out !important;
            transform: rotateY(0deg) !important;
            -webkit-transform: rotateY(0deg) !important;
        }
        
        /* Estado volteado */
        .flashcard.flipped .flashcard-inner {
            transform: rotateY(180deg) !important;
            -webkit-transform: rotateY(180deg) !important;
        }
        
        /* Caras de la tarjeta */
        .card-face {
            position: absolute !important;
            width: 100% !important;
            height: 100% !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 12px !important;
            padding: 2rem !important;
            box-sizing: border-box !important;
        }
        
        .card-front {
            background: linear-gradient(135deg, #e11d48, #be123c) !important;
            color: white !important;
            z-index: 2 !important;
            transform: rotateY(0deg) !important;
            -webkit-transform: rotateY(0deg) !important;
        }
        
        .card-back {
            background: linear-gradient(135deg, #0ea5e9, #0284c7) !important;
            color: white !important;
            transform: rotateY(180deg) !important;
            -webkit-transform: rotateY(180deg) !important;
        }
        
        /* Contenido de las tarjetas */
        .card-character,
        #question-text,
        #answer-text {
            font-size: 3rem !important;
            font-weight: 500 !important;
            text-align: center !important;
            margin-bottom: 1rem !important;
        }
        
        .card-hint,
        #hint-text {
            font-size: 0.875rem !important;
            opacity: 0.9 !important;
            text-align: center !important;
        }
        
        .card-info,
        #full-info {
            font-size: 1rem !important;
            line-height: 1.6 !important;
            text-align: left !important;
        }
        
        #full-info strong {
            color: #ffffff !important;
            margin-right: 0.5rem !important;
        }
    `;
    
    // Insertar al principio del head para mayor prioridad
    document.head.insertBefore(criticalCSS, document.head.firstChild);
    console.log('✓ CSS crítico inyectado');
    
    // 3. Función para probar el volteo
    window.testFlipNow = function() {
        const flashcard = document.getElementById('flashcard');
        
        if (!flashcard) {
            console.error('No se encuentra el elemento flashcard');
            return;
        }
        
        // Toggle de la clase flipped
        if (flashcard.classList.contains('flipped')) {
            flashcard.classList.remove('flipped');
            console.log('📋 Tarjeta des-volteada');
        } else {
            flashcard.classList.add('flipped');
            console.log('🔄 Tarjeta volteada');
        }
        
        // Verificar el transform aplicado
        const inner = flashcard.querySelector('.flashcard-inner');
        if (inner) {
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(inner);
                console.log('Transform aplicado:', computedStyle.transform);
            }, 100);
        }
    };
    
    // 4. Arreglar los métodos de la app
    if (window.app) {
        window.app.doFlip = function() {
            const flashcard = document.getElementById('flashcard');
            if (!flashcard || !this.currentWord) return;
            
            flashcard.classList.add('flipped');
            this.isFlipped = true;
            
            // Actualizar botones
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
            }
            
            if (dontKnowBtn) {
                dontKnowBtn.disabled = false;
                dontKnowBtn.style.opacity = '1';
            }
            
            console.log('✅ Volteo ejecutado correctamente');
        };
        
        window.app.flipCard = window.app.doFlip;
    }
    
    console.log('\n✅ SOLUCIÓN APLICADA');
    console.log('🎴 Prueba con: testFlipNow()');
    console.log('💡 O haz click en la tarjeta/botón Show Answer');
    
    // Prueba automática
    setTimeout(() => {
        console.log('\n🧪 Ejecutando prueba automática...');
        testFlipNow();
    }, 500);
})();
