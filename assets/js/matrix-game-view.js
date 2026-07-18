// Matrix Game — screen rendering and DOM transitions.
// Extracted from MatrixGame: owns everything that touches the matrix
// tab's screens (config/game/results) and in-round DOM feedback, while
// MatrixGame keeps round/scoring/timer logic. Mirrors the
// MatrixScoreController/MatrixSessionController delegation pattern.

class MatrixGameView {
    constructor(game) {
        this.game = game;
    }

    renderMatrix() {
        const matrixContainer = document.getElementById('character-matrix');
        const gridSize = this.game.config[this.game.difficulty].gridSize;

        // Limpiar matriz anterior
        matrixContainer.innerHTML = '';

        // Restablecer eventos de puntero
        if (matrixContainer) {
            matrixContainer.style.pointerEvents = 'auto';
        }

        // Establecer grid CSS
        matrixContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        matrixContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

        // Crear celdas
        this.game.matrixCharacters.forEach((char, index) => {
            const cell = document.createElement('button');
            cell.className = 'matrix-char';
            cell.textContent = char;
            cell.dataset.index = index;

            // Añadir animación de entrada
            cell.style.animationDelay = `${index * 0.02}s`;

            matrixContainer.appendChild(cell);
        });
    }

    showFeedback(type, message) {
        const overlay = document.getElementById('feedback-overlay');
        overlay.className = `feedback-overlay ${type}`;
        overlay.textContent = message;
        overlay.style.display = 'flex';

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 800);
    }

    showPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.className = 'pause-overlay';
        overlay.innerHTML = `
            <div class="pause-content">
                <h2>Juego Pausado</h2>
                <p>Presiona espacio o el botón de play para continuar</p>
            </div>
        `;
        document.getElementById('matrix-game').appendChild(overlay);
    }

    hidePauseOverlay() {
        const overlay = document.getElementById('pause-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showResults(accuracy, isNewRecord) {
        const game = this.game;

        // Ocultar pantalla de juego
        document.getElementById('matrix-game').style.display = 'none';

        // Mostrar pantalla de resultados
        document.getElementById('matrix-results').style.display = 'block';

        // Actualizar estadísticas
        document.getElementById('matrix-final-score').textContent = game.score.toLocaleString();
        document.getElementById('matrix-correct-count').textContent = game.correctAnswers;
        document.getElementById('matrix-wrong-count').textContent = game.wrongAnswers;
        document.getElementById('matrix-best-streak').textContent = game.sessionStats.maxStreak;
        document.getElementById('matrix-avg-time').textContent =
            game.sessionStats.averageTime ? `${game.sessionStats.averageTime.toFixed(1)}s` : 'N/A';
        document.getElementById('matrix-accuracy').textContent = `${accuracy}%`;

        // Mostrar mensaje de nuevo récord
        if (isNewRecord) {
            document.getElementById('matrix-new-record').style.display = 'block';
        } else {
            document.getElementById('matrix-new-record').style.display = 'none';
        }

        // Guardar estadísticas en el perfil del usuario si está disponible
        if (window.app && window.app.userProfile) {
            window.app.userProfile.updateGameStats('matrix', {
                score: game.score,
                accuracy: accuracy,
                level: game.currentLevel,
                difficulty: game.difficulty
            });
        }
    }

    updateGameUI() {
        document.getElementById('game-level').textContent = `HSK ${this.game.currentLevel}`;
        document.getElementById('game-score').textContent = this.game.score.toLocaleString();
        document.getElementById('game-streak').textContent = this.game.sessionStats.streak;
    }

    showGame() {
        const game = this.game;
        game.logInfo('🎮 Matrix Game showGame() called');

        // First, render the game interface
        game.logDebug('🎨 About to call renderGameInterface...');

        // Get the container first
        let gameContainer = document.getElementById('matrix-game-container');
        if (!gameContainer) {
            gameContainer = document.getElementById('matrix');
        }

        if (gameContainer && typeof renderMatrixGameInterface === 'function') {
            game.logDebug('🎨 Rendering directly with renderMatrixGameInterface...');
            try {
                const html = renderMatrixGameInterface();
                gameContainer.innerHTML = html;
                game.logDebug('✅ Direct render successful, HTML length:', html.length);

                if (window.languageManager?.updateInterface) {
                    window.languageManager.updateInterface();
                }

                // Setup event listeners
                this.setupGameEventListeners();
            } catch (error) {
                game.logError('❌ Direct render failed:', error);
            }
        } else {
            game.logWarn('⚠️ Container or render function not available');
            this.renderGameInterface();
        }

        game.logDebug('🎨 renderGameInterface completed');

        // After rendering, look for the container again
        let container = document.getElementById('matrix-game-container');
        if (!container) {
            // If still not found, the content was rendered directly in the matrix tab
            container = document.getElementById('matrix');
            game.logDebug('📦 Using matrix tab as container');
        }

        if (container) {
            container.style.display = 'block';
            game.logDebug('✅ Matrix game container shown');
            game.logDebug('📏 Container innerHTML length:', container.innerHTML.length);

            // Wait for DOM to be ready, then show config screen
            setTimeout(() => {
                const configScreen = document.getElementById('matrix-config');
                const gameScreen = document.getElementById('matrix-game');
                const resultsScreen = document.getElementById('matrix-results');

                game.logDebug('🔍 Looking for screens after render...');
                game.logDebug('Config screen found:', !!configScreen);
                game.logDebug('Game screen found:', !!gameScreen);
                game.logDebug('Results screen found:', !!resultsScreen);

                if (configScreen) {
                    configScreen.style.display = 'block';
                    game.logDebug('✅ Config screen shown');
                } else {
                    game.logWarn('⚠️ Config screen not found');
                    // Try to find it in the entire document
                    const allConfigs = document.querySelectorAll('[id*="config"]');
                    game.logDebug('All config elements found:', allConfigs.length);
                    allConfigs.forEach((el, i) => game.logDebug('Config ' + i + ':', el.id));
                }

                if (gameScreen) gameScreen.style.display = 'none';
                if (resultsScreen) resultsScreen.style.display = 'none';

                game.updateHighScoresList();
                game.syncResumeAction();
            }, 100);
        } else {
            game.logError('❌ Matrix game container not found after rendering');
        }
    }

    renderGameInterface() {
        const game = this.game;
        game.logDebug('🎨 Rendering Matrix Game Interface...');

        // Verificar si el contenedor ya existe
        let gameContainer = document.getElementById('matrix-game-container');

        if (!gameContainer) {
            // Si no existe, buscar en el tab de matrix
            const matrixTab = document.getElementById('matrix');
            if (matrixTab) {
                gameContainer = matrixTab.querySelector('.matrix-game-container');
                if (!gameContainer) {
                    // Si tampoco existe, usar el tab de matrix directamente
                    gameContainer = matrixTab;
                    game.logDebug('📦 Using matrix tab as container');
                }
            }
        }

        if (!gameContainer) {
            game.logError('❌ Matrix game container not found');
            return;
        }

        // Usar la función de matrix-game-ui.js si está disponible
        if (typeof renderMatrixGameInterface === 'function') {
            game.logDebug('✅ Using renderMatrixGameInterface function');
            gameContainer.innerHTML = renderMatrixGameInterface();
        } else {
            game.logWarn('⚠️ renderMatrixGameInterface not available, using fallback');
            // Fallback: renderizar interfaz básica
            gameContainer.innerHTML = this.getGameHTML();
        }

        // Configurar event listeners después de renderizar
        this.setupGameEventListeners();

        game.logDebug('✅ Matrix Game Interface rendered successfully');
    }

    setupGameEventListeners() {
        this.game.logDebug('🎛️ Syncing Matrix Game state components...');
        this.game.syncResumeAction();
        this.game.logDebug('✅ State components synced');
    }

    getGameHTML() {
        // HTML de respaldo para el juego
        // typeof: referencia directa lanza ReferenceError si matrix-game-ui.js
        // aún no cargó, y eso abortaba el constructor dejando una instancia
        // fantasma con listeners activos.
        return typeof renderMatrixGameInterface === 'function' ? renderMatrixGameInterface() : `
            <div class="matrix-error">
                <h2>Error cargando el juego</h2>
                <p>Por favor, recarga la página</p>
            </div>
        `;
    }

    hideGame() {
        const game = this.game;
        const container = document.getElementById('matrix-game-container');
        if (container) {
            container.style.display = 'none';
        }

        // Limpiar cualquier juego en progreso
        if (game.isPlaying) {
            game.saveSessionState(true);
            game.isPlaying = false;
            if (game.timer) {
                clearInterval(game.timer);
                game.timer = null;
            }
        }
    }
}

window.MatrixGameView = MatrixGameView;
