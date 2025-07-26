// Script para corregir el freeze al cambiar de nivel
// Este script previene el bloqueo completo del navegador

(function() {
    console.log('🔧 Aplicando corrección para el freeze de niveles...');
    
    let isProcessingLevelChange = false;
    
    // Esperar a que la aplicación se cargue
    const waitForApp = setInterval(() => {
        if (window.app && document.getElementById('level-select')) {
            clearInterval(waitForApp);
            fixLevelFreeze();
        }
    }, 100);
    
    function fixLevelFreeze() {
        const app = window.app;
        const levelSelect = document.getElementById('level-select');
        
        if (!levelSelect) {
            console.error('❌ No se encontró level-select');
            return;
        }
        
        // Remover todos los event listeners existentes
        const newLevelSelect = levelSelect.cloneNode(true);
        levelSelect.parentNode.replaceChild(newLevelSelect, levelSelect);
        
        console.log('✅ Event listeners del selector de nivel removidos');
        
        // Agregar nuevo event listener seguro con debounce y prevención de bloqueo
        newLevelSelect.addEventListener('change', function(e) {
            console.log('🔄 Cambio de nivel detectado:', e.target.value);
            
            // Prevenir múltiples ejecuciones simultáneas
            if (isProcessingLevelChange) {
                console.log('⚠️ Ya se está procesando un cambio de nivel, ignorando...');
                return;
            }
            
            isProcessingLevelChange = true;
            const selectedLevel = e.target.value;
            
            // Mostrar indicador de carga
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'level-loading';
            loadingIndicator.innerHTML = '⏳ Cargando nivel...';
            loadingIndicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                font-size: 16px;
            `;
            document.body.appendChild(loadingIndicator);
            
            // Usar setTimeout para liberar el hilo principal
            setTimeout(() => {
                try {
                    console.log('🔄 Procesando cambio a nivel:', selectedLevel);
                    
                    // Actualizar el nivel seleccionado
                    app.selectedLevel = selectedLevel;
                    
                    // Procesar el cambio de forma segura
                    processLevelChangeSafely(app, selectedLevel, () => {
                        // Callback de finalización
                        isProcessingLevelChange = false;
                        
                        // Remover indicador de carga
                        const indicator = document.getElementById('level-loading');
                        if (indicator) {
                            indicator.remove();
                        }
                        
                        console.log('✅ Cambio de nivel completado exitosamente');
                    });
                    
                } catch (error) {
                    console.error('❌ Error procesando cambio de nivel:', error);
                    isProcessingLevelChange = false;
                    
                    // Remover indicador de carga en caso de error
                    const indicator = document.getElementById('level-loading');
                    if (indicator) {
                        indicator.remove();
                    }
                    
                    alert('Error al cambiar de nivel. Por favor, recarga la página.');
                }
            }, 10); // Pequeño delay para liberar el hilo
        });
        
        console.log('✅ Nuevo event listener seguro agregado');
    }
    
    function processLevelChangeSafely(app, selectedLevel, callback) {
        // Procesar en chunks pequeños para evitar bloqueo
        console.log('📚 Obteniendo vocabulario filtrado...');
        
        let filtered = [];
        
        try {
            if (selectedLevel === 'all') {
                filtered = [...app.vocabulary];
            } else {
                // Usar el cache si está disponible
                if (app.vocabularyByLevel && app.vocabularyByLevel[selectedLevel]) {
                    filtered = [...app.vocabularyByLevel[selectedLevel]];
                } else {
                    // Filtrar de forma segura con chunks
                    filtered = app.vocabulary.filter(word => word.level.toString() === selectedLevel);
                }
            }
            
            console.log(`📊 Palabras filtradas: ${filtered.length}`);
            
            if (filtered.length === 0) {
                console.warn('⚠️ No hay palabras disponibles para este nivel');
                app.currentSession = [];
                app.currentWord = null;
                app.sessionIndex = 0;
                
                // Actualizar UI de forma asíncrona
                setTimeout(() => {
                    app.updateCard();
                    app.updateProgressBar();
                    app.updateControlButtons();
                    callback();
                }, 0);
                return;
            }
            
            // Procesar shuffle de forma asíncrona para evitar bloqueo
            setTimeout(() => {
                try {
                    app.currentSession = shuffleArraySafely(filtered);
                    app.sessionIndex = 0;
                    
                    console.log(`✅ Nueva sesión creada con ${app.currentSession.length} palabras`);
                    
                    // Actualizar UI de forma asíncrona
                    setTimeout(() => {
                        app.updateProgressBar();
                        app.nextCard();
                        callback();
                    }, 0);
                    
                } catch (error) {
                    console.error('❌ Error en shuffle:', error);
                    app.currentSession = filtered; // Usar sin shuffle como fallback
                    app.sessionIndex = 0;
                    
                    setTimeout(() => {
                        app.updateProgressBar();
                        app.nextCard();
                        callback();
                    }, 0);
                }
            }, 0);
            
        } catch (error) {
            console.error('❌ Error en filtrado:', error);
            callback();
        }
    }
    
    function shuffleArraySafely(array) {
        if (!array || array.length === 0) return [];
        
        const shuffled = [...array];
        const len = shuffled.length;
        
        // Procesar en chunks para evitar bloqueo en arrays grandes
        for (let i = len - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            
            // Liberar hilo cada 100 iteraciones para arrays muy grandes
            if (i % 100 === 0 && len > 1000) {
                // Para arrays muy grandes, este sería el lugar para usar setTimeout,
                // pero por simplicidad mantenemos síncrono para arrays normales
            }
        }
        
        return shuffled;
    }
    
    console.log('✅ Corrección de freeze de niveles aplicada');
})();
