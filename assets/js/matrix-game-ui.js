// Matrix Game UI Renderer
// Este archivo contiene la función para renderizar la interfaz HTML del juego

function renderMatrixGameInterface() {
    const gameHTML = `
        <!-- Pantalla de configuración -->
        <div id="matrix-config" class="matrix-config-screen">
            <h2 class="matrix-title" data-i18n="matrixTitle">HSK Matrix Game</h2>
            <p class="matrix-subtitle" data-i18n="matrixSubtitle">Find the Chinese character that matches the shown pinyin</p>
            
            <div class="matrix-settings">
                <div class="setting-group">
                    <label class="setting-label" data-i18n="levelLabel">HSK Level:</label>
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
                    <label class="setting-label" data-i18n="matrixDifficulty">Difficulty</label>
                    <div class="difficulty-selector">
                        <button class="diff-btn" data-difficulty="easy">
                            <span class="diff-icon ascii-art">☺</span>
                            <span class="diff-name" data-i18n="matrixEasy">Easy</span>
                            <span class="diff-desc">4x4 • 90s</span>
                        </button>
                        <button class="diff-btn active" data-difficulty="normal">
                            <span class="diff-icon ascii-art">◉</span>
                            <span class="diff-name" data-i18n="matrixNormal">Normal</span>
                            <span class="diff-desc">6x6 • 60s</span>
                        </button>
                        <button class="diff-btn" data-difficulty="hard">
                            <span class="diff-icon ascii-art">▲</span>
                            <span class="diff-name" data-i18n="matrixHard">Hard</span>
                            <span class="diff-desc">6x6 • 45s</span>
                        </button>
                    </div>
                </div>
                
                <button id="matrix-start-btn" class="matrix-start-btn" data-i18n="startQuiz">
                    Start
                </button>
            </div>
            
            <!-- Tabla de mejores puntuaciones -->
            <div class="high-scores-section">
                <h3><span class="ascii-art">[★]</span> <span data-i18n="matrixHighScores">Top Scores</span></h3>
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
                        <span class="stat-label" data-i18n="matrixLevel">Level</span>
                        <span class="stat-value" id="game-level">HSK 1</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="matrixScore">Score</span>
                        <span class="stat-value" id="game-score">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="matrixStreak">Streak</span>
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
                    <button id="pause-btn" class="control-btn" data-i18n-title="matrixPause" title="Pause"><span class="ascii-art">||</span></button>
                    <button id="quit-btn" class="control-btn" data-i18n-title="matrixQuit" title="Quit"><span class="ascii-art">X</span></button>
                </div>
            </div>
            
            <!-- Palabra objetivo -->
            <div class="target-word">
                <div class="target-label" data-i18n="matrixFindCharacterFor">Find the character for:</div>
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
            <h2 class="results-title"><span class="ascii-art">[!]</span> <span data-i18n="matrixGameOver">Game Over!</span></h2>
            
            <div class="results-stats">
                <div class="result-card highlight">
                    <span class="result-icon ascii-art">[★]</span>
                    <span class="result-label" data-i18n="matrixFinalScore">Final Score</span>
                    <span id="final-score" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon ascii-art">[✓]</span>
                    <span class="result-label" data-i18n="matrixCorrectAnswers">Correct Answers</span>
                    <span id="correct-count" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon ascii-art">[✗]</span>
                    <span class="result-label" data-i18n="matrixWrongAnswers">Wrong Answers</span>
                    <span id="wrong-count" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon ascii-art">[▲]</span>
                    <span class="result-label" data-i18n="matrixBestStreak">Best Streak</span>
                    <span id="best-streak" class="result-value">0</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon ascii-art">[~]</span>
                    <span class="result-label" data-i18n="matrixAvgTime">Average Time</span>
                    <span id="avg-time" class="result-value">0s</span>
                </div>
                
                <div class="result-card">
                    <span class="result-icon ascii-art">[%]</span>
                        <span class="result-label" data-i18n="accuracy">Accuracy</span>
                    <span id="accuracy" class="result-value">0%</span>
                </div>
            </div>
            
            <div id="new-record" class="new-record" style="display: none;">
                <span class="ascii-art">[★]</span> <span data-i18n="matrixNewRecord">New Personal Record!</span> <span class="ascii-art">[★]</span>
            </div>
            
            <div class="results-actions">
                <button id="play-again-btn" class="action-btn primary" data-i18n="tryAgain">
                    Retry
                </button>
                <button id="change-settings-btn" class="action-btn secondary">
                    <span class="ascii-art">[⚙]</span> <span data-i18n="matrixChangeSettings">Change Settings</span>
                </button>
                <button id="back-to-app-btn" class="action-btn secondary">
                    <span class="ascii-art">[←]</span> <span data-i18n="matrixBackHome">Back to Home</span>
                </button>
            </div>
        </div>
    `;
    
    return gameHTML;
}

// La función renderMatrixGameInterface está disponible globalmente
// y será utilizada por matrix-game.js cuando sea necesario
