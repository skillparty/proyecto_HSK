// Script para corregir los problemas de la aplicación HSK
// Este script reemplaza las funciones problemáticas para solucionar:
// 1. Botones "Lo sé" y "No lo sé" que no se habilitan después de voltear
// 2. Freeze al cambiar el nivel

(function() {
    console.log('🔧 Aplicando correcciones a la aplicación HSK...');
    
    // Esperar a que la aplicación se cargue
    const waitForApp = setInterval(() => {
        if (window.app && window.app.updateControlButtons) {
            clearInterval(waitForApp);
            applyFixes();
        }
    }, 100);
    
    function applyFixes() {
        const app = window.app;
        
        // 1. Corregir el método updateControlButtons
        app.updateControlButtons = function() {
            const flipBtn = document.getElementById('flip-btn');
            const knowBtn = document.getElementById('know-btn');
            const dontKnowBtn = document.getElementById('dont-know-btn');
            const flashcard = document.getElementById('flashcard');
    
        // 2. Corregir markAsKnown para evitar avance prematuro
        app.markAsKnown = function(known, performance = null) {
            if (!this.currentWord) return;

            if (performance === null) {
                performance = known ? 'good' : 'again';
            }

            const srsUpdate = this.srs.calculateNextReview(this.currentWord, performance);
            this.srs.saveWordData(this.currentWord, srsUpdate);

            this.practiceHistory.push({
                word: this.currentWord,
                known: known,
                mode: this.practiceMode,
                timestamp: Date.now(),
                srsPerformance: performance
            });

            this.updateStats(known);
            this.savePracticeHistory();
            
            // Actualizar luego de marcado pero sin avanzar de inmediato
            this.updateProgressBar();
            this.updateControlButtons();

            console.log('Decision tomada, presione siguiente para continuar');
        };

        console.log('🔄 Actualizando botones de control...');
            console.log('Estado actual:', {
                isFlipped: this.isFlipped,
                hasCurrentWord: !!this.currentWord,
                flashcardHasFlippedClass: flashcard?.classList.contains('flipped')
            });

            if (this.currentWord) {
                if (flipBtn) {
                    flipBtn.disabled = false;
                    flipBtn.style.opacity = '1';
                    flipBtn.textContent = this.isFlipped ? 
                        (this.languageManager?.t('back') || 'Volver') : 
                        (this.languageManager?.t('showAnswer') || 'Mostrar Respuesta');
                }
                
                // Habilitar/deshabilitar botones según el estado de volteo
                const enableButtons = this.isFlipped;
                
                if (knowBtn) {
                    knowBtn.disabled = !enableButtons;
                    knowBtn.style.opacity = enableButtons ? '1' : '0.5';
                    knowBtn.style.cursor = enableButtons ? 'pointer' : 'not-allowed';
                    // Remover pointerEvents para permitir clicks cuando esté habilitado
                    if (enableButtons) {
                        knowBtn.style.pointerEvents = 'auto';
                    }
                }
                
                if (dontKnowBtn) {
                    dontKnowBtn.disabled = !enableButtons;
                    dontKnowBtn.style.opacity = enableButtons ? '1' : '0.5';
                    dontKnowBtn.style.cursor = enableButtons ? 'pointer' : 'not-allowed';
                    // Remover pointerEvents para permitir clicks cuando esté habilitado
                    if (enableButtons) {
                        dontKnowBtn.style.pointerEvents = 'auto';
                    }
                }
            } else {
                // No hay palabra actual, deshabilitar todos los botones
                if (flipBtn) {
                    flipBtn.disabled = true;
                    flipBtn.style.opacity = '0.5';
                }
                if (knowBtn) {
                    knowBtn.disabled = true;
                    knowBtn.style.opacity = '0.5';
                    knowBtn.style.pointerEvents = 'none';
                }
                if (dontKnowBtn) {
                    dontKnowBtn.disabled = true;
                    dontKnowBtn.style.opacity = '0.5';
                    dontKnowBtn.style.pointerEvents = 'none';
                }
            }
            
            console.log('✅ Botones actualizados correctamente');
        };
        
        // 2. Corregir el método doFlip para asegurar que actualice los botones
        const originalDoFlip = app.doFlip.bind(app);
        app.doFlip = function() {
            console.log('🔄 Ejecutando volteo de tarjeta...');
            originalDoFlip();
            
            // Asegurar que los botones se actualicen después del volteo
            setTimeout(() => {
                this.updateControlButtons();
                console.log('✅ Botones actualizados después del volteo');
            }, 400);
        };
        
        // 3. Corregir el método setupPracticeSession para evitar freeze
        app.setupPracticeSession = function() {
            console.log('🔄 Configurando sesión de práctica...');
            
            try {
                const filtered = this.getFilteredVocabulary();
                console.log(`📚 Vocabulario filtrado: ${filtered.length} palabras`);
                
                if (filtered.length === 0) {
                    console.warn('⚠️ No hay palabras disponibles para este nivel');
                    this.currentSession = [];
                    this.currentWord = null;
                    this.sessionIndex = 0;
                    this.updateCard();
                    this.updateProgressBar();
                    this.updateControlButtons();
                    return;
                }
                
                // Crear una nueva sesión con las palabras filtradas
                this.currentSession = this.shuffleArray([...filtered]);
                this.sessionIndex = 0;
                
                console.log(`✅ Sesión creada con ${this.currentSession.length} palabras`);
                
                // Matcher de nivel para evitar carga inconsistente y corregir el freeze
                if (this.selectedLevel !== 'all') {
                    this.currentSession = this.currentSession.filter(word = word.level.toString() === this.selectedLevel);
                }

                // Usar setTimeout para evitar bloqueo del UI
                setTimeout(() =, 0);
                    this.updateProgressBar();
                    this.nextCard();
                }, 0);
                
            } catch (error) {
                console.error('❌ Error configurando sesión de práctica:', error);
                this.currentSession = [];
                this.currentWord = null;
                this.updateCard();
                this.updateProgressBar();
                this.updateControlButtons();
            }
        };
        
        // 4. Mejorar el manejo de eventos de los botones
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
        if (knowBtn) {
            // Remover listeners antiguos
            const newKnowBtn = knowBtn.cloneNode(true);
            knowBtn.parentNode.replaceChild(newKnowBtn, knowBtn);
            
            // Agregar nuevo listener
            newKnowBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!app.isFlipped || newKnowBtn.disabled) {
                    console.log('⚠️ Botón presionado pero no disponible');
                    return;
                }
                
                console.log('✅ Marcando como conocida...');
                app.markAsKnown(true);
            });
        }
        
        if (dontKnowBtn) {
            // Remover listeners antiguos
            const newDontKnowBtn = dontKnowBtn.cloneNode(true);
            dontKnowBtn.parentNode.replaceChild(newDontKnowBtn, dontKnowBtn);
            
            // Agregar nuevo listener
            newDontKnowBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!app.isFlipped || newDontKnowBtn.disabled) {
                    console.log('⚠️ Botón presionado pero no disponible');
                    return;
                }
                
                console.log('✅ Marcando como no conocida...');
                app.markAsKnown(false);
            });
        }
        
        // 5. Asegurar que shuffleArray esté definido
        if (!app.shuffleArray) {
            app.shuffleArray = function(array) {
                const newArray = [...array];
                for (let i = newArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                }
                return newArray;
            };
        }
        
        console.log('✅ Todas las correcciones aplicadas exitosamente');
        
        // Forzar actualización inicial de botones
        app.updateControlButtons();
    }
})();
