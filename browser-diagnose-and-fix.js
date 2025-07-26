// Diagnóstico completo del navegador y solución alternativa
(function() {
    console.log('🔍 DIAGNÓSTICO DEL NAVEGADOR Y SISTEMA');
    
    // 1. Información del navegador
    console.log('\n1. INFORMACIÓN DEL NAVEGADOR:');
    console.log('User Agent:', navigator.userAgent);
    console.log('Plataforma:', navigator.platform);
    
    // 2. Verificar soporte de transformaciones 3D
    console.log('\n2. SOPORTE DE TRANSFORMACIONES 3D:');
    const testDiv = document.createElement('div');
    testDiv.style.transform = 'rotateY(180deg)';
    testDiv.style.webkitTransform = 'rotateY(180deg)';
    
    const supports3D = testDiv.style.transform !== '' || testDiv.style.webkitTransform !== '';
    console.log('Soporte 3D:', supports3D ? '✓ Soportado' : '✗ NO soportado');
    
    // 3. Verificar si hay algún error de CSS
    console.log('\n3. VERIFICANDO CSS COMPUTADO:');
    const flashcard = document.getElementById('flashcard');
    const inner = document.querySelector('.flashcard-inner');
    
    if (inner) {
        const computed = window.getComputedStyle(inner);
        console.log('transform-style:', computed.transformStyle);
        console.log('backface-visibility:', computed.backfaceVisibility);
        console.log('perspective en parent:', window.getComputedStyle(flashcard.parentElement).perspective);
    }
    
    // 4. SOLUCIÓN ALTERNATIVA SIN 3D
    console.log('\n4. APLICANDO SOLUCIÓN ALTERNATIVA (SIN 3D):');
    
    // Eliminar CSS 3D conflictivo
    const all3DStyles = document.querySelectorAll('style');
    all3DStyles.forEach(style => {
        if (style.textContent.includes('rotateY')) {
            style.remove();
            console.log('✓ CSS 3D eliminado');
        }
    });
    
    // Aplicar solución con fade/slide
    const alternativeCSS = document.createElement('style');
    alternativeCSS.id = 'alternative-flip-solution';
    alternativeCSS.textContent = `
        /* Reset completo */
        .flashcard-container {
            height: 300px !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        .flashcard {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            cursor: pointer !important;
        }
        
        .flashcard-inner {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
        }
        
        /* Solución alternativa con opacidad y posición */
        .card-face {
            position: absolute !important;
            width: 100% !important;
            height: 100% !important;
            top: 0 !important;
            left: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 2rem !important;
            border-radius: 12px !important;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
            box-sizing: border-box !important;
        }
        
        /* Estado inicial */
        .card-front {
            background: linear-gradient(135deg, #e11d48, #be123c) !important;
            color: white !important;
            opacity: 1 !important;
            transform: translateX(0) !important;
            z-index: 2 !important;
        }
        
        .card-back {
            background: linear-gradient(135deg, #0ea5e9, #0284c7) !important;
            color: white !important;
            opacity: 0 !important;
            transform: translateX(20px) !important;
            z-index: 1 !important;
        }
        
        /* Estado volteado */
        .flashcard.flipped .card-front {
            opacity: 0 !important;
            transform: translateX(-20px) !important;
            z-index: 1 !important;
        }
        
        .flashcard.flipped .card-back {
            opacity: 1 !important;
            transform: translateX(0) !important;
            z-index: 2 !important;
        }
        
        /* Estilos de contenido */
        #question-text, #answer-text {
            font-size: 3rem !important;
            font-weight: 500 !important;
            text-align: center !important;
            margin-bottom: 1rem !important;
        }
        
        #hint-text {
            font-size: 0.875rem !important;
            opacity: 0.9 !important;
        }
        
        #full-info {
            font-size: 1rem !important;
            line-height: 1.6 !important;
        }
        
        #full-info strong {
            color: white !important;
            font-weight: 600 !important;
        }
    `;
    
    document.head.appendChild(alternativeCSS);
    console.log('✅ Solución alternativa aplicada (fade + slide)');
    
    // 5. Función de test mejorada
    window.flipTest = function() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) {
            console.error('No se encuentra flashcard');
            return;
        }
        
        if (flashcard.classList.contains('flipped')) {
            flashcard.classList.remove('flipped');
            console.log('⬅️ Mostrando frente (pregunta)');
        } else {
            flashcard.classList.add('flipped');
            console.log('➡️ Mostrando reverso (respuesta)');
        }
    };
    
    // 6. Arreglar métodos de la app
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
                knowBtn.style.cursor = 'pointer';
            }
            
            if (dontKnowBtn) {
                dontKnowBtn.disabled = false;
                dontKnowBtn.style.opacity = '1';
                dontKnowBtn.style.cursor = 'pointer';
            }
            
            console.log('✅ Volteo ejecutado (modo alternativo)');
            
            if (this.isAudioEnabled && this.currentWord) {
                this.pronounceText(this.currentWord.character);
            }
        };
        
        window.app.flipCard = window.app.doFlip;
    }
    
    console.log('\n✅ SOLUCIÓN ALTERNATIVA LISTA');
    console.log('🎴 Prueba con: flipTest()');
    console.log('📱 Esta solución usa fade/slide en lugar de rotación 3D');
    
    // Test automático
    setTimeout(() => {
        console.log('\n🧪 Probando solución alternativa...');
        flipTest();
        setTimeout(() => {
            flipTest();
            console.log('✅ Prueba completada');
        }, 1000);
    }, 500);
})();
