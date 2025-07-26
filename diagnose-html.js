// Diagnóstico completo de estructura HTML
(function() {
    console.log('🔍 DIAGNÓSTICO DE ESTRUCTURA HTML');
    
    // 1. Verificar la estructura completa
    console.log('\n1. ESTRUCTURA HTML ACTUAL:');
    const flashcard = document.getElementById('flashcard');
    
    if (flashcard) {
        console.log('HTML de flashcard:');
        console.log(flashcard.outerHTML);
        
        console.log('\nClases de flashcard:', flashcard.className);
        console.log('Hijos directos:', flashcard.children.length);
        
        // Buscar flashcard-inner
        const inner = flashcard.querySelector('.flashcard-inner');
        if (inner) {
            console.log('\n✓ flashcard-inner encontrado');
            console.log('Hijos de flashcard-inner:', inner.children.length);
            
            // Buscar las caras
            const front = inner.querySelector('.card-front');
            const back = inner.querySelector('.card-back');
            
            console.log('card-front:', front ? '✓ Encontrado' : '✗ NO encontrado');
            console.log('card-back:', back ? '✓ Encontrado' : '✗ NO encontrado');
        } else {
            console.log('\n✗ NO se encontró .flashcard-inner');
            console.log('Esto es crítico - sin este elemento el volteo no funcionará');
        }
    }
    
    // 2. Crear la estructura correcta si falta
    console.log('\n2. REPARACIÓN DE ESTRUCTURA:');
    
    window.fixStructure = function() {
        console.log('Intentando reparar estructura...');
        
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) {
            console.error('No se encuentra el elemento flashcard');
            return;
        }
        
        // Verificar si ya tiene la estructura correcta
        let inner = flashcard.querySelector('.flashcard-inner');
        if (!inner) {
            console.log('Creando flashcard-inner...');
            
            // Guardar contenido actual
            const currentContent = flashcard.innerHTML;
            
            // Crear nueva estructura
            flashcard.innerHTML = `
                <div class="flashcard-inner">
                    <div class="card-face card-front">
                        ${currentContent}
                    </div>
                    <div class="card-face card-back">
                        <div id="answer-text"></div>
                        <div id="full-info"></div>
                    </div>
                </div>
            `;
            
            console.log('✓ Estructura creada');
            
            // Mover elementos a sus lugares correctos si es necesario
            const questionText = document.getElementById('question-text');
            const hintText = document.getElementById('hint-text');
            const front = flashcard.querySelector('.card-front');
            
            if (questionText && !front.contains(questionText)) {
                front.appendChild(questionText);
            }
            if (hintText && !front.contains(hintText)) {
                front.appendChild(hintText);
            }
        }
        
        // Verificar CSS
        const testStyle = document.createElement('style');
        testStyle.textContent = `
            #flashcard {
                border: 2px solid red !important;
            }
            .flashcard-inner {
                border: 2px solid blue !important;
            }
            .card-front {
                border: 2px solid green !important;
            }
            .card-back {
                border: 2px solid orange !important;
            }
        `;
        document.head.appendChild(testStyle);
        
        console.log('✓ Bordes de colores agregados para visualizar estructura');
        console.log('Rojo = flashcard, Azul = inner, Verde = front, Naranja = back');
        
        // Intentar volteo manual
        setTimeout(() => {
            console.log('Probando volteo...');
            flashcard.classList.add('flipped');
            console.log('✓ Clase flipped agregada');
        }, 1000);
    };
    
    // 3. Verificar el HTML esperado vs actual
    console.log('\n3. ESTRUCTURA ESPERADA vs ACTUAL:');
    console.log('ESPERADA:');
    console.log(`
    <div id="flashcard" class="flashcard">
        <div class="flashcard-inner">
            <div class="card-face card-front">
                <div id="question-text">...</div>
                <div id="hint-text">...</div>
            </div>
            <div class="card-face card-back">
                <div id="answer-text">...</div>
                <div id="full-info">...</div>
            </div>
        </div>
    </div>
    `);
    
    console.log('\n=== ACCIONES DISPONIBLES ===');
    console.log('1. fixStructure() - Intenta reparar la estructura HTML');
    console.log('2. Si ves bordes de colores después de fixStructure(), la estructura está bien');
    console.log('3. Si no se voltea aún con la estructura correcta, el problema es CSS');
})();
