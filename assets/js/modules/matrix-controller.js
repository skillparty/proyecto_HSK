/**
 * MatrixController Module - Handles matrix initialization, debug and fallback rendering
 */
class MatrixController {
    constructor(app) {
        this.app = app;
        this.app.logDebug('🧩 MatrixController module initialized');
    }

    initialize() {
        this.app.logInfo('🎮 Initializing Matrix Game...');
        this.app.logDebug('🔍 Checking window.matrixGame:', !!window.matrixGame);
        this.app.logDebug('🔍 Checking renderMatrixGameInterface:', typeof renderMatrixGameInterface);

        if (!window.matrixGame) {
            this.app.logWarn('⚠️ Matrix game not found, attempting to create it...');

            try {
                if (typeof MatrixGame !== 'undefined') {
                    window.matrixGame = new MatrixGame();
                    this.app.logInfo('✅ Matrix game created manually');
                } else {
                    this.app.logError('❌ MatrixGame class not found');
                    this.showFallback();
                    return;
                }
            } catch (error) {
                this.app.logError('❌ Error creating matrix game:', error);
                this.showFallback();
                return;
            }
        }

        if (window.matrixGame) {
            this.app.logInfo('[✓] Matrix game object found');

            if (this.app.vocabulary && this.app.vocabulary.length > 0) {
                window.matrixGame.vocabulary = this.app.vocabulary;
                window.matrixGame.allVocabulary = [...this.app.vocabulary];
                this.app.logDebug('[OK] Vocabulary passed to matrix game: ' + this.app.vocabulary.length + ' words');
            } else {
                this.app.logWarn('[⚠] No vocabulary available for matrix game');
            }

            try {
                window.matrixGame.showGame();
                this.app.logInfo('[✓] Matrix game showGame() called successfully');
            } catch (error) {
                this.app.logError('[✗] Error calling showGame():', error);
                this.app.logDebug('Error details:', error.stack);
                this.showFallback();
            }
        } else {
            this.app.logError('[❌] Matrix game still not available after creation attempt');
            this.showFallback();
        }
    }

    debug() {
        this.app.logDebug('🔍 === MATRIX GAME DEBUG ===');
        this.app.logDebug('window.matrixGame exists:', !!window.matrixGame);
        this.app.logDebug('MatrixGame class exists:', typeof MatrixGame !== 'undefined');
        this.app.logDebug('renderMatrixGameInterface exists:', typeof renderMatrixGameInterface !== 'undefined');

        const matrixTab = document.getElementById('matrix');
        const matrixContainer = document.getElementById('matrix-game-container');

        this.app.logDebug('Matrix tab exists:', !!matrixTab);
        this.app.logDebug('Matrix container exists:', !!matrixContainer);

        if (matrixContainer) {
            this.app.logDebug('Matrix container display:', matrixContainer.style.display);
            this.app.logDebug('Matrix container innerHTML length:', matrixContainer.innerHTML.length);
            this.app.logDebug('Matrix container content preview:', matrixContainer.innerHTML.substring(0, 200));
        }

        if (typeof renderMatrixGameInterface !== 'undefined') {
            this.app.logDebug('Attempting manual render...');
            try {
                const html = renderMatrixGameInterface();
                this.app.logDebug('Generated HTML length:', html.length);
                if (matrixContainer) {
                    matrixContainer.innerHTML = html;
                    this.app.logDebug('✅ Manual render successful');
                }
            } catch (error) {
                this.app.logError('❌ Manual render failed:', error);
            }
        }

        this.app.logDebug('🔍 === END DEBUG ===');
    }

    showFallback() {
        const matrixSection = document.getElementById('matrix');
        if (!matrixSection) return;

        matrixSection.innerHTML = `
            <div class="matrix-fallback">
                <div class="fallback-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="6" y1="12" x2="10" y2="12"></line>
                        <line x1="8" y1="10" x2="8" y2="14"></line>
                        <line x1="15" y1="13" x2="15.01" y2="13"></line>
                        <line x1="18" y1="11" x2="18.01" y2="11"></line>
                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    </svg>
                </div>
                <h3>Juego Matrix</h3>
                <p>El juego Matrix no se pudo cargar correctamente.</p>
                <p>Esto puede deberse a que los scripts aun se estan cargando.</p>
                <div class="fallback-actions">
                    <button class="debug-btn" data-matrix-action="debug">
                        Debug
                    </button>
                    <button class="retry-btn" data-matrix-action="retry">
                        Reintentar
                    </button>
                    <button class="reload-btn" data-matrix-action="reload">
                        Recargar Pagina
                    </button>
                </div>
                <div class="debug-info">
                    <p><strong>Debug Info:</strong></p>
                    <p>Matrix Game Object: ${window.matrixGame ? 'Disponible' : 'No encontrado'}</p>
                    <p>Vocabulario: ${this.app.vocabulary ? this.app.vocabulary.length + ' palabras' : 'No cargado'}</p>
                </div>
            </div>
            <style>
                .matrix-fallback {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-color);
                }
                .fallback-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                .matrix-fallback h3 {
                    margin-bottom: 15px;
                    color: var(--accent-color);
                }
                .matrix-fallback p {
                    margin-bottom: 10px;
                    opacity: 0.8;
                }
                .fallback-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin: 20px 0;
                }
                .debug-btn, .retry-btn, .reload-btn {
                    background: var(--accent-color);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.3s ease;
                }
                .debug-btn {
                    background: #6366f1;
                }
                .debug-btn:hover {
                    background: #4f46e5;
                }
                .retry-btn {
                    background: #10b981;
                }
                .retry-btn:hover {
                    background: #059669;
                }
                .reload-btn:hover {
                    background: var(--accent-color-dark, #c41e3a);
                }
                .debug-info {
                    margin-top: 30px;
                    padding: 15px;
                    background: rgba(0,0,0,0.1);
                    border-radius: 8px;
                    font-size: 0.9rem;
                }
                .debug-info p {
                    margin: 5px 0;
                }
            </style>
        `;
    }
}
