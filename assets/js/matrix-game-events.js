// Matrix Game — global document-level event wiring, registered once.
// Extracted from MatrixGame.setupEventListeners(): dispatches always to
// window.matrixGame (canonical instance), never `this`, so a stray
// orphaned instance from a load race never double-handles input.

function setupMatrixGameEventListeners() {
        // Los listeners viven en document y se registran UNA sola vez de forma
        // global. Despachan siempre a window.matrixGame (instancia canónica),
        // nunca a `this`: si por cualquier carrera de carga llegara a existir
        // una instancia huérfana, sus eventos no duplican respuestas/rondas.
        if (window.__matrixGameListenersWired) return;
        window.__matrixGameListenersWired = true;

        const game = () => window.matrixGame;

        // Configuración del juego
        document.addEventListener('click', (e) => {
            const g = game();
            if (!g) return;

            // Botón de inicio
            if (e.target.id === 'matrix-start-btn' || e.target.closest('#matrix-start-btn')) {
                g.startGame();
            }

            // Selección de dificultad
            if (e.target.closest('.diff-btn')) {
                const btn = e.target.closest('.diff-btn');
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                g.difficulty = btn.dataset.difficulty;
            }

            // Controles del juego
            if (e.target.closest('#pause-btn')) {
                g.togglePause();
            }

            if (e.target.closest('#quit-btn')) {
                g.quitGame();
            }

            // Botones de resultados
            if (e.target.id === 'play-again-btn' || e.target.closest('#play-again-btn')) {
                g.playAgain();
            }

            if (e.target.id === 'change-settings-btn' || e.target.closest('#change-settings-btn')) {
                g.showConfig();
            }

            if (e.target.id === 'back-to-app-btn' || e.target.closest('#back-to-app-btn')) {
                g.backToApp();
            }

            // Clic en caracteres de la matriz
            const charBtn = e.target.closest('.matrix-char');
            if (charBtn) {
                g.checkAnswer(charBtn);
            }
        });

        // Cambio de nivel
        document.addEventListener('change', (e) => {
            const g = game();
            if (!g) return;
            if (e.target.id === 'matrix-level-select') {
                g.currentLevel = parseInt(e.target.value);
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            const g = game();
            if (!g) return;
            if (g.isPlaying && !g.isPaused) {
                // Teclas numéricas para selección rápida (teclado numérico)
                const gridSize = g.config[g.difficulty].gridSize;
                const keyNum = parseInt(e.key);
                if (keyNum >= 1 && keyNum <= gridSize * gridSize) {
                    const chars = document.querySelectorAll('.matrix-char');
                    if (chars[keyNum - 1]) {
                        g.checkAnswer(chars[keyNum - 1]);
                    }
                }
            }

            // Pausa con espacio
            if (e.key === ' ' && g.isPlaying) {
                e.preventDefault();
                g.togglePause();
            }

            // Salir con Escape
            if (e.key === 'Escape' && g.isPlaying) {
                g.quitGame();
            }
        });
    }
