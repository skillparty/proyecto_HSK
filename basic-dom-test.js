// Diagnóstico básico de DOM y eventos
(function() {
    console.log('🔍 DIAGNÓSTICO BÁSICO DE DOM');
    
    // 1. Verificar que podemos manipular el DOM básicamente
    console.log('\n1. PRUEBA BÁSICA DE DOM:');
    
    // Crear un elemento de prueba
    const testDiv = document.createElement('div');
    testDiv.id = 'dom-test';
    testDiv.style.cssText = 'background: red; color: white; padding: 10px; margin: 10px; border-radius: 5px;';
    testDiv.textContent = '🧪 PRUEBA DOM - Si ves esto, el DOM funciona';
    
    // Intentar agregarlo
    const body = document.body;
    if (body) {
        body.appendChild(testDiv);
        console.log('✅ Elemento de prueba agregado al DOM');
    } else {
        console.error('❌ No se puede acceder a document.body');
    }
    
    // 2. Verificar event listeners
    console.log('\n2. PRUEBA DE EVENT LISTENERS:');
    
    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
        console.log('✅ Flashcard encontrado');
        
        // Agregar un listener simple
        const simpleListener = function() {
            console.log('🎯 CLICK DETECTADO EN FLASHCARD!');
            
            // Intentar algo muy simple
            const alert1 = document.createElement('div');
            alert1.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: orange; color: white; padding: 20px; border-radius: 10px; z-index: 9999; font-size: 18px;';
            alert1.textContent = '🔥 CLICK FUNCIONÓ!';
            document.body.appendChild(alert1);
            
            // Remover después de 2 segundos
            setTimeout(() => {
                if (alert1.parentNode) {
                    alert1.parentNode.removeChild(alert1);
                }
            }, 2000);
        };
        
        flashcard.addEventListener('click', simpleListener);
        console.log('✅ Listener agregado a flashcard');
        
        // También agregar al testDiv
        testDiv.addEventListener('click', function() {
            console.log('🧪 CLICK en elemento de prueba');
            testDiv.style.background = 'green';
            testDiv.textContent = '✅ Click funcionó en elemento de prueba';
        });
        
    } else {
        console.error('❌ No se encuentra elemento flashcard');
    }
    
    // 3. Verificar función showAnswer directa
    console.log('\n3. PRUEBA DIRECTA:');
    
    window.forceShowResponse = function() {
        console.log('🔥 Ejecutando mostrar respuesta directa...');
        
        // Crear respuesta muy simple
        const response = document.createElement('div');
        response.id = 'force-response';
        response.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
        `;
        
        if (window.app && window.app.currentWord) {
            const word = window.app.currentWord;
            response.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">🎯 RESPUESTA</h3>
                <div style="font-size: 2rem; margin: 10px 0;">${word.character}</div>
                <div style="font-size: 1.2rem; margin: 5px 0; color: #ffd700;">${word.pinyin}</div>
                <div style="font-size: 1rem;">${word.english || word.translation || 'Sin traducción'}</div>
                <div style="font-size: 0.8rem; margin-top: 10px; opacity: 0.8;">HSK ${word.level}</div>
                <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px 10px; border: none; background: rgba(255,255,255,0.3); color: white; border-radius: 5px; cursor: pointer;">Cerrar</button>
            `;
        } else {
            response.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">⚠️ PROBLEMA</h3>
                <p>No hay palabra actual cargada</p>
                <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px 10px; border: none; background: rgba(255,255,255,0.3); color: white; border-radius: 5px; cursor: pointer;">Cerrar</button>
            `;
        }
        
        document.body.appendChild(response);
        console.log('✅ Respuesta forzada mostrada');
        
        // Habilitar botones
        const knowBtn = document.getElementById('know-btn');
        const dontKnowBtn = document.getElementById('dont-know-btn');
        
        if (knowBtn) {
            knowBtn.disabled = false;
            knowBtn.style.background = '#22c55e';
            knowBtn.style.opacity = '1';
        }
        
        if (dontKnowBtn) {
            dontKnowBtn.disabled = false;
            dontKnowBtn.style.background = '#ef4444';
            dontKnowBtn.style.opacity = '1';
        }
        
        console.log('✅ Botones habilitados');
    };
    
    // 4. Información del sistema
    console.log('\n4. INFORMACIÓN DEL SISTEMA:');
    console.log('Navegador:', navigator.userAgent);
    console.log('JavaScript habilitado:', typeof window !== 'undefined');
    console.log('DOM cargado:', document.readyState);
    console.log('App existe:', !!window.app);
    console.log('Current word:', window.app?.currentWord?.character || 'No disponible');
    
    console.log('\n=== INSTRUCCIONES ===');
    console.log('1. ¿Ves una caja roja arriba? Si SÍ, el DOM funciona');
    console.log('2. Haz click en la flashcard - ¿ves un mensaje naranja? Si SÍ, los eventos funcionan');
    console.log('3. Ejecuta: forceShowResponse() - ¿aparece una caja en la esquina? Si SÍ, todo debería funcionar');
    console.log('4. Si nada funciona, hay algo muy extraño bloqueando JavaScript');
})();
