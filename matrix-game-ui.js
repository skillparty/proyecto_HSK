// Matrix Game UI Renderer
// Este archivo contiene la función para renderizar la interfaz HTML del juego

function renderMatrixGameInterface() {
    const gameHTML = `
        <!-- Pantalla de configuración -->
        <div id="matrix-config" class="matrix-config-screen">
            <h2 class="matrix-title">🎯 Juego de Matriz HSK</h2>
            <p class="matrix-subtitle">Encuentra el carácter chino que corresponde al pinyin mostrado</p>
            
            <div class="matrix-settings">
                <div class="setting-group">
                    <label class="setting-label">Nivel HSK</label>
                    <select id="matrix-level-select" class="matrix-select">
                        <option value="1">HSK 1</option>
                        <option value="2">HSK 2</option>
                        <option value="3">HSK 3</option>
                        <option value="4">HSK 4</option>
                        <option value="5">HSK 5</option>
                        <option value="6">HSK 6</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label class="setting-label">Dificultad</label>
                    <div class="difficulty-selector">
                        <button class="diff-btn" data-difficulty="easy">
                            <span class="diff-icon">😊</span>
                            <span class="diff-name">Fácil</span>
                            <span class="diff-desc">4x4 • 90s</span>
                        </button>
                        <button class="diff-btn active" data-difficulty="normal">
                            <span class="diff-icon">😎</span>
                            <span class="diff-name">Normal</span>
                            <span class="diff-desc">6x6 • 60s</span>
                        </button>
                        <button class="diff-btn" data-difficulty="hard">
                            <span class="diff-icon">🔥</span>
                            <span class="diff-name">Difícil</span>
                            <span class="diff-desc">6x6 • 45s</span>
                        </button>
                    </div>
                </div>
                
                <button id="matrix-start-btn" class="matrix-start-btn">
                    <span>🚀 Comenzar Juego</span>
                </button>
            </div>
            
            <!-- Tabla de mejores puntuaciones -->
            <div class="high-scores-section">
                <h3>🏆 Mejores Puntuaciones</h3>
                <div id="high-scores-list" class="high-scores-list">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>
        </div>
        
        <!-- Pantalla de juego -->
        <div id="matrix-game" class="matrix-game-screen" style="display: none;">
            <!-- Header del juego -->
            <div class="game-header">
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Nivel</span>
                        <span class="stat-value" id="game-level">HSK 1</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Puntuación</span>
                        <span class="stat-value" id="game-score">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Racha</span>
                        <span class="stat-value" id="game-streak">0</span>
                    </div>
                </div>
                
                <div class="game-timer">
                    <div class="timer-bar-container">
                        <div id="timer-bar" class="timer-bar"></div>
                    </div>
                    <span id="timer-text" class="timer-text">60s</span>
                </div>
                
                <div class="game-controls">
                    <button id="pause-btn" class="control-btn" title="Pausar">⏸️</button>
                    <button id="quit-btn" class="control-btn" title="Salir">❌</button>
                </div>
            </div>
            
            <!-- Palabra objetivo -->
            <div class="target-word">
                <div class="target-label">Encuentra el carácter para:</div>
                <div id="target-pinyin" class="target-pinyin">nǐ hǎo</div>
                <div id="target-meaning" class="target-meaning">hola</div>
            </div>
            
            <!-- Matriz de caracteres -->
            <div id="character-matrix" class="character-matrix">
                <!-- Se llenará dinámicamente -->
            </div>
            
            <!-- Feedback visual -->
            <div id="feedback-overlay" class="feedback-overlay"></div>
        </div>
        
        <!-- Pantalla de resultados -->
        <div id="matrix-results" class="matrix-results-screen" style="display: none;">
            <h2 class="results-title">🎉 ¡Juego Terminado!</h2>
            
            <div class="results-stats">
                <div class="result-card highlight">
                    <span class="result-icon">🏆</span>
                    <span class="result-label">Puntuación Final</span>
                    <span id="final-score" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon">✅</span>
                    <span class="result-label">Respuestas Correctas</span>
                    <span id="correct-count" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon">❌</span>
                    <span class="result-label">Respuestas Incorrectas</span>
                    <span id="wrong-count" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon">🔥</span>
                    <span class="result-label">Mejor Racha</span>
                    <span id="best-streak" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon">⚡</span>
                    <span class="result-label">Tiempo Promedio</span>
                    <span id="avg-time" class="result-value">0s</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon">📊</span>
                    <span class="result-label">Precisión</span>
                    <span id="accuracy" class="result-value">0%</span>
                </div>
            </div>
            
            <div id="new-record" class="new-record" style="display: none;">
                🌟 ¡Nuevo Récord Personal! 🌟
            </div>
            
            <div class="results-actions">
                <button id="play-again-btn" class="action-btn primary">
                    <span>🔄 Jugar de Nuevo</span>
                </button>
                <button id="change-settings-btn" class="action-btn secondary">
                    <span>⚙️ Cambiar Configuración</span>
                </button>
                <button id="back-to-app-btn" class="action-btn secondary">
                    <span>🏠 Volver al Inicio</span>
                </button>
            </div>
        </div>
    `;
    
    return gameHTML;
}

// Actualizar el método renderGameInterface en MatrixGame
MatrixGame.prototype.renderGameInterface = function() {
    const gameContainer = document.createElement('div');
    gameContainer.id = 'matrix-game-container';
    gameContainer.className = 'matrix-game-container';
    gameContainer.style.display = 'none';
    gameContainer.innerHTML = renderMatrixGameInterface();
    
    // Insertar el contenedor del juego en el main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.appendChild(gameContainer);
    }
    
    // Actualizar la lista de puntuaciones altas
    this.updateHighScoresList();
};
