// Diagnóstico profundo del problema de flashcards
(function() {
    console.log('=== DIAGNÓSTICO PROFUNDO ===');
    
    // 1. Verificar si hay algún error en la consola
    console.log('\n1. VERIFICANDO ESTRUCTURA DOM:');
    const flashcard = document.getElementById('flashcard');
    const flashcardInner = document.querySelector('.flashcard-inner');
    
    console.log('flashcard elemento:', flashcard);
    console.log('flashcard-inner elemento:', flashcardInner);
    
    // 2. Verificar event listeners
    console.log('\n2. PROBANDO CLICK DIRECTO:');
    
    // Intentar click directo en el botón flip
    const flipBtn = document.getElementById('flip-btn');
    if (flipBtn) {
        console.log('Botón flip encontrado, estado disabled:', flipBtn.disabled);
        
        // Simular click
        console.log('Simulando click en botón flip...');
        flipBtn.click();
        
        setTimeout(() => {
            console.log('Estado después del click:');
            console.log('- flashcard tiene .flipped:', flashcard?.classList.contains('flipped'));
            console.log('- app.isFlipped:', window.app?.isFlipped);
        }, 500);
    }
    
    // 3. Verificar CSS
    console.log('\n3. VERIFICANDO CSS:');
    const styles = window.getComputedStyle(flashcardInner || flashcard);
    console.log('transform:', styles.transform);
    console.log('transform-style:', styles.transformStyle);
    console.log('transition:', styles.transition);
    
    // 4. Intentar volteo manual forzado
    console.log('\n4. VOLTEO MANUAL FORZADO:');
    
    window.forceFlip = function() {
        console.log('Ejecutando volteo forzado...');
        
        const flashcard = document.getElementById('flashcard');
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        const flipBtn = document.getElementById('flip-btn');
        
        if (flashcard) {
            // Agregar clase flipped
            flashcard.classList.add('flipped');
            console.log('✓ Clase flipped agregada');
            
            // Forzar estado en app
            if (window.app) {
                window.app.isFlipped = true;
                console.log('✓ app.isFlipped = true');
            }
            
            // Habilitar botones manualmente
            if (knowBtn) {
                knowBtn.disabled = false;
                knowBtn.removeAttribute('disabled');
                knowBtn.style.opacity = '1';
                knowBtn.style.cursor = 'pointer';
                knowBtn.style.pointerEvents = 'auto';
                
                // Remover cualquier handler que pueda estar bloqueando
                const newKnowBtn = knowBtn.cloneNode(true);
                knowBtn.parentNode.replaceChild(newKnowBtn, knowBtn);
                
                // Agregar nuevo handler
                newKnowBtn.addEventListener('click', function() {
                    console.log('¡Botón I Know clickeado!');
                    if (window.app && window.app.markAsKnown) {
                        window.app.markAsKnown(true);
                    }
                });
                
                console.log('✓ Botón I Know habilitado y con nuevo handler');
            }
            
            if (dontKnowBtn) {
                dontKnowBtn.disabled = false;
                dontKnowBtn.removeAttribute('disabled');
                dontKnowBtn.style.opacity = '1';
                dontKnowBtn.style.cursor = 'pointer';
                dontKnowBtn.style.pointerEvents = 'auto';
                
                // Remover cualquier handler que pueda estar bloqueando
                const newDontKnowBtn = dontKnowBtn.cloneNode(true);
                dontKnowBtn.parentNode.replaceChild(newDontKnowBtn, dontKnowBtn);
                
                // Agregar nuevo handler
                newDontKnowBtn.addEventListener('click', function() {
                    console.log('¡Botón I Don\'t Know clickeado!');
                    if (window.app && window.app.markAsKnown) {
                        window.app.markAsKnown(false);
                    }
                });
                
                console.log('✓ Botón I Don\'t Know habilitado y con nuevo handler');
            }
            
            if (flipBtn) {
                flipBtn.disabled = true;
                flipBtn.style.opacity = '0.5';
            }
            
            console.log('✅ Volteo forzado completado');
            console.log('Ahora los botones deberían funcionar');
        }
    };
    
    // 5. Verificar si hay algún CSS que esté bloqueando
    console.log('\n5. BUSCANDO CSS BLOQUEANTE:');
    const allStyleSheets = document.styleSheets;
    let foundBlockingRules = false;
    
    for (let i = 0; i < allStyleSheets.length; i++) {
        try {
            const rules = allStyleSheets[i].cssRules || allStyleSheets[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.selectorText && 
                        (rule.selectorText.includes('.flipped') || 
                         rule.selectorText.includes('rotateY') ||
                         rule.selectorText.includes('#know-btn') ||
                         rule.selectorText.includes('#dont-know-btn'))) {
                        console.log('Regla encontrada:', rule.selectorText);
                        console.log('Estilos:', rule.style.cssText);
                        foundBlockingRules = true;
                    }
                }
            }
        } catch (e) {
            // Ignorar errores CORS
        }
    }
    
    if (!foundBlockingRules) {
        console.log('No se encontraron reglas CSS problemáticas');
    }
    
    console.log('\n=== ACCIONES DISPONIBLES ===');
    console.log('1. Ejecuta: forceFlip() - para forzar el volteo y habilitar botones');
    console.log('2. Si eso funciona, el problema está en el flujo normal de la app');
    console.log('3. Si no funciona, hay algo más profundo bloqueando la funcionalidad');
})();
