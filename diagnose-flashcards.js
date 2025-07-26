// Diagnóstico completo de flashcards
(function() {
    console.log('=== DIAGNÓSTICO DE FLASHCARDS ===');
    
    // 1. Verificar elementos DOM
    console.log('\n1. ELEMENTOS DOM:');
    const elements = {
        flashcard: document.getElementById('flashcard'),
        flashcardInner: document.querySelector('.flashcard-inner'),
        flipBtn: document.getElementById('flip-btn'),
        knowBtn: document.getElementById('know-btn'),
        dontKnowBtn: document.getElementById('dont-know-btn'),
        questionText: document.getElementById('question-text'),
        answerText: document.getElementById('answer-text')
    };
    
    for (const [name, elem] of Object.entries(elements)) {
        console.log(`- ${name}:`, elem ? '✓ Encontrado' : '✗ NO encontrado');
        if (elem && (name.includes('Btn'))) {
            console.log(`  disabled: ${elem.disabled}, opacity: ${elem.style.opacity}`);
        }
    }
    
    // 2. Verificar estado de la aplicación
    console.log('\n2. ESTADO DE LA APLICACIÓN:');
    if (window.app) {
        console.log('- app existe: ✓');
        console.log('- currentWord:', window.app.currentWord);
        console.log('- isFlipped:', window.app.isFlipped);
        console.log('- practiceMode:', window.app.practiceMode);
    } else {
        console.log('- app existe: ✗ NO ENCONTRADO');
    }
    
    // 3. Verificar clases CSS
    console.log('\n3. CLASES CSS:');
    if (elements.flashcard) {
        console.log('- flashcard.classList:', elements.flashcard.classList.toString());
        console.log('- tiene .flipped:', elements.flashcard.classList.contains('flipped'));
    }
    
    // 4. Probar volteo manual
    console.log('\n4. PRUEBA DE VOLTEO MANUAL:');
    console.log('Ejecutando volteo manual...');
    
    if (elements.flashcard && window.app) {
        // Forzar estado
        window.app.isFlipped = false;
        elements.flashcard.classList.remove('flipped');
        
        // Voltear
        window.app.isFlipped = true;
        elements.flashcard.classList.add('flipped');
        
        // Forzar habilitación de botones
        if (elements.knowBtn) {
            elements.knowBtn.disabled = false;
            elements.knowBtn.style.opacity = '1';
            elements.knowBtn.style.cursor = 'pointer';
            elements.knowBtn.style.pointerEvents = 'auto';
        }
        if (elements.dontKnowBtn) {
            elements.dontKnowBtn.disabled = false;
            elements.dontKnowBtn.style.opacity = '1';
            elements.dontKnowBtn.style.cursor = 'pointer';
            elements.dontKnowBtn.style.pointerEvents = 'auto';
        }
        if (elements.flipBtn) {
            elements.flipBtn.disabled = true;
            elements.flipBtn.style.opacity = '0.5';
        }
        
        console.log('✓ Volteo manual completado');
        console.log('✓ Botones habilitados forzadamente');
    }
    
    // 5. Verificar event listeners
    console.log('\n5. EVENT LISTENERS:');
    console.log('Para verificar manualmente: $._data($("#flip-btn")[0], "events")');
    
    // 6. Proporcionar funciones de ayuda
    window.debugFlashcards = {
        forceEnable: function() {
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');
            
            [knowBtn, dontKnowBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.removeAttribute('disabled');
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.style.pointerEvents = 'auto';
                    // Remover cualquier clase que pueda estar interfiriendo
                    btn.className = btn.className.replace(/disabled/g, '');
                }
            });
            console.log('✓ Botones habilitados forzadamente');
        },
        
        testFlip: function() {
            if (window.app && window.app.flipCard) {
                window.app.flipCard();
                console.log('✓ flipCard ejecutado');
            } else {
                console.log('✗ No se puede ejecutar flipCard');
            }
        },
        
        checkStyles: function() {
            const styles = document.styleSheets;
            console.log(`Total de hojas de estilo: ${styles.length}`);
            
            // Buscar reglas que afecten a los botones
            for (let i = 0; i < styles.length; i++) {
                try {
                    const rules = styles[i].cssRules || styles[i].rules;
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            const rule = rules[j];
                            if (rule.selectorText && 
                                (rule.selectorText.includes('#know-btn') || 
                                 rule.selectorText.includes('#dont-know-btn') ||
                                 rule.selectorText.includes(':disabled'))) {
                                console.log(`Regla CSS: ${rule.selectorText}`);
                                console.log(`  Estilos: ${rule.style.cssText}`);
                            }
                        }
                    }
                } catch (e) {
                    // Ignorar errores de CORS
                }
            }
        }
    };
    
    console.log('\n=== FUNCIONES DE AYUDA DISPONIBLES ===');
    console.log('- debugFlashcards.forceEnable() - Habilita los botones forzadamente');
    console.log('- debugFlashcards.testFlip() - Prueba el volteo');
    console.log('- debugFlashcards.checkStyles() - Revisa estilos CSS');
})();
