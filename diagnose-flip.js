// Diagnóstico específico del volteo de tarjetas
(function() {
    console.log('🔍 DIAGNÓSTICO DE VOLTEO DE TARJETAS');
    
    // 1. Verificar estructura HTML
    console.log('\n1. ESTRUCTURA HTML:');
    const flashcard = document.getElementById('flashcard');
    const flashcardInner = document.querySelector('.flashcard-inner');
    const cardFront = document.querySelector('.card-front');
    const cardBack = document.querySelector('.card-back');
    
    console.log('- flashcard:', flashcard);
    console.log('- flashcard-inner:', flashcardInner);
    console.log('- card-front:', cardFront);
    console.log('- card-back:', cardBack);
    
    // 2. Verificar CSS crítico
    console.log('\n2. CSS CRÍTICO:');
    if (flashcardInner) {
        const styles = window.getComputedStyle(flashcardInner);
        console.log('- transform-style:', styles.transformStyle);
        console.log('- transition:', styles.transition);
        console.log('- transform actual:', styles.transform);
    }
    
    // 3. Probar volteo manual con CSS
    console.log('\n3. PRUEBA DE VOLTEO MANUAL:');
    
    window.testFlip = function() {
        console.log('Probando volteo manual...');
        
        if (flashcard && flashcardInner) {
            // Opción 1: Agregar clase flipped
            flashcard.classList.add('flipped');
            console.log('✓ Clase flipped agregada al flashcard');
            
            // Opción 2: Aplicar transform directamente
            flashcardInner.style.transform = 'rotateY(180deg)';
            console.log('✓ Transform aplicado directamente a flashcard-inner');
            
            // Verificar resultado
            setTimeout(() => {
                const newTransform = window.getComputedStyle(flashcardInner).transform;
                console.log('Transform después de aplicar:', newTransform);
                
                if (newTransform !== 'none' && newTransform !== 'matrix(1, 0, 0, 1, 0, 0)') {
                    console.log('✅ ¡El volteo funciona visualmente!');
                } else {
                    console.log('❌ El volteo NO funciona - el transform no se aplicó');
                }
            }, 100);
        }
    };
    
    // 4. Buscar reglas CSS que puedan estar interfiriendo
    console.log('\n4. BUSCANDO REGLAS CSS:');
    const sheets = document.styleSheets;
    let foundFlipRules = false;
    
    for (let i = 0; i < sheets.length; i++) {
        try {
            const rules = sheets[i].cssRules || sheets[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && 
                        (rule.selectorText.includes('.flashcard.flipped') || 
                         rule.selectorText.includes('.flashcard-inner'))) {
                        console.log(`Regla encontrada: ${rule.selectorText}`);
                        console.log(`Estilos: ${rule.style.cssText}`);
                        foundFlipRules = true;
                    }
                }
            }
        } catch (e) {
            // Ignorar CORS
        }
    }
    
    if (!foundFlipRules) {
        console.log('⚠️ No se encontraron reglas CSS para .flashcard.flipped');
        console.log('Esto podría ser el problema - las reglas CSS no están cargadas');
    }
    
    // 5. Inyectar CSS de emergencia
    console.log('\n5. INYECTANDO CSS DE EMERGENCIA:');
    
    window.injectFlipCSS = function() {
        const style = document.createElement('style');
        style.id = 'emergency-flip-css';
        style.textContent = `
            .flashcard-container {
                perspective: 1000px !important;
            }
            
            .flashcard-inner {
                width: 100% !important;
                height: 100% !important;
                position: relative !important;
                transform-style: preserve-3d !important;
                transition: transform 0.6s !important;
            }
            
            .flashcard.flipped .flashcard-inner {
                transform: rotateY(180deg) !important;
            }
            
            .card-face {
                position: absolute !important;
                width: 100% !important;
                height: 100% !important;
                backface-visibility: hidden !important;
                -webkit-backface-visibility: hidden !important;
            }
            
            .card-back {
                transform: rotateY(180deg) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS de emergencia inyectado');
        console.log('Ahora prueba: testFlip() nuevamente');
    };
    
    console.log('\n=== ACCIONES DISPONIBLES ===');
    console.log('1. testFlip() - Probar volteo manual');
    console.log('2. injectFlipCSS() - Inyectar CSS necesario');
    console.log('3. Si injectFlipCSS() funciona, el problema es que falta CSS');
})();
