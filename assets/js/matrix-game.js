// Matrix Game Module for HSK Learning App
// Juego de matriz donde el usuario debe encontrar el carácter chino correspondiente al pinyin mostrado

class MatrixGame {
    constructor() {
        // Estado del juego
        this.currentLevel = 1;
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
        this.score = 0;
        this.timeRemaining = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentRound = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;

        // Configuración del juego
        this.config = {
            easy: {
                gridSize: 4,
                timeLimit: 90,
                scoreMultiplier: 1,
                timeBonus: 10
            },
            normal: {
                gridSize: 6,
                timeLimit: 60,
                scoreMultiplier: 1.5,
                timeBonus: 5
            },
            hard: {
                gridSize: 6,
                timeLimit: 45,
                scoreMultiplier: 2,
                timeBonus: 3
            }
        };

        // Datos del juego
        this.allVocabulary = [];
        this.vocabulary = [];
        this.currentWord = null;
        this.matrixCharacters = [];
        this.correctPosition = null;
        this.timer = null;
        this.startTime = null;

        // Estadísticas de la sesión
        this.sessionStats = {
            totalRounds: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            averageTime: 0,
            bestTime: Infinity,
            streak: 0,
            maxStreak: 0
        };

        // Historial de puntuaciones
        this.highScores = this.loadHighScores();

        this.sessionStorageKey = 'hsk-matrix-session-v1';
        this.sessionMaxAgeMs = 30 * 60 * 1000;

        // Inicializar
        this.init();
    }

    init() {
        console.log('🎮 Initializing Matrix Game...');
        this.loadVocabulary();
        this.setupEventListeners();
        this.renderGameInterface();
    }

    async loadVocabulary() {
        try {
            // Intentar cargar el vocabulario desde el objeto global de la app
            if (window.app && window.app.vocabulary) {
                this.vocabulary = [...window.app.vocabulary];
                this.allVocabulary = [...window.app.vocabulary];
                console.log('✅ Vocabulary loaded from main app:', this.vocabulary.length, 'words');
            } else {
                // Cargar vocabulario de respaldo
                const response = await fetch('assets/data/hsk_vocabulary_spanish.json');
                const data = await response.json();
                this.vocabulary = [...data];
                this.allVocabulary = [...data];
                console.log('✅ Vocabulary loaded from file:', this.vocabulary.length, 'words');
            }
        } catch (error) {
            console.error('❌ Error loading vocabulary:', error);
            // Usar vocabulario de ejemplo si falla la carga
            this.vocabulary = this.getDefaultVocabulary();
            this.allVocabulary = [...this.vocabulary];
        }
    }

    getDefaultVocabulary() {
        // Vocabulario de respaldo para pruebas
        return [
            { character: "你", pinyin: "nǐ", english: "you", spanish: "tú", level: 1 },
            { character: "好", pinyin: "hǎo", english: "good", spanish: "bueno", level: 1 },
            { character: "我", pinyin: "wǒ", english: "I/me", spanish: "yo", level: 1 },
            { character: "是", pinyin: "shì", english: "to be", spanish: "ser/estar", level: 1 },
            { character: "中", pinyin: "zhōng", english: "middle", spanish: "medio", level: 1 },
            { character: "国", pinyin: "guó", english: "country", spanish: "país", level: 1 },
            { character: "人", pinyin: "rén", english: "person", spanish: "persona", level: 1 },
            { character: "大", pinyin: "dà", english: "big", spanish: "grande", level: 1 },
            { character: "小", pinyin: "xiǎo", english: "small", spanish: "pequeño", level: 1 },
            { character: "爱", pinyin: "ài", english: "love", spanish: "amor", level: 1 }
        ];
    }

    setupEventListeners() {
        // Configuración del juego
        document.addEventListener('click', (e) => {
            // Botón de inicio
            if (e.target.id === 'matrix-start-btn' || e.target.closest('#matrix-start-btn')) {
                this.startGame();
            }

            // Selección de dificultad
            if (e.target.closest('.diff-btn')) {
                const btn = e.target.closest('.diff-btn');
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
            }

            // Controles del juego
            if (e.target.id === 'pause-btn') {
                this.togglePause();
            }

            if (e.target.id === 'quit-btn') {
                this.quitGame();
            }

            // Botones de resultados
            if (e.target.id === 'play-again-btn' || e.target.closest('#play-again-btn')) {
                this.playAgain();
            }

            if (e.target.id === 'change-settings-btn' || e.target.closest('#change-settings-btn')) {
                this.showConfig();
            }

            if (e.target.id === 'back-to-app-btn' || e.target.closest('#back-to-app-btn')) {
                this.backToApp();
            }

            // Clic en caracteres de la matriz
            if (e.target.classList.contains('matrix-char')) {
                this.checkAnswer(e.target);
            }
        });

        // Cambio de nivel
        document.addEventListener('change', (e) => {
            if (e.target.id === 'matrix-level-select') {
                this.currentLevel = parseInt(e.target.value);
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying && !this.isPaused) {
                // Teclas numéricas para selección rápida (teclado numérico)
                const gridSize = this.config[this.difficulty].gridSize;
                const keyNum = parseInt(e.key);
                if (keyNum >= 1 && keyNum <= gridSize * gridSize) {
                    const chars = document.querySelectorAll('.matrix-char');
                    if (chars[keyNum - 1]) {
                        this.checkAnswer(chars[keyNum - 1]);
                    }
                }
            }

            // Pausa con espacio
            if (e.key === ' ' && this.isPlaying) {
                e.preventDefault();
                this.togglePause();
            }

            // Salir con Escape
            if (e.key === 'Escape' && this.isPlaying) {
                this.quitGame();
            }
        });
    }

    startGame() {
        console.log('🎮 Starting Matrix Game...');

        if (!this.allVocabulary || this.allVocabulary.length === 0) {
            this.allVocabulary = this.vocabulary && this.vocabulary.length > 0
                ? [...this.vocabulary]
                : this.getDefaultVocabulary();
        }

        // Obtener configuración seleccionada
        const levelSelect = document.getElementById('matrix-level-select');
        this.currentLevel = levelSelect ? parseInt(levelSelect.value) : this.currentLevel;

        // Filtrar vocabulario por nivel
        this.filterVocabularyByLevel();

        // Resetear estadísticas
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.sessionStats.streak = 0;
        this.sessionStats.totalRounds = 0;
        this.currentRound = 0;

        // Configurar tiempo
        this.timeRemaining = this.config[this.difficulty].timeLimit;

        // Cambiar pantallas
        document.getElementById('matrix-config').style.display = 'none';
        document.getElementById('matrix-game').style.display = 'block';

        // Actualizar UI
        this.updateGameUI();

        // Iniciar juego
        this.isPlaying = true;
        this.isPaused = false;
        this.nextRound();
        this.startTimer();
        this.saveSessionState(true);
    }

    filterVocabularyByLevel() {
        const sourceVocabulary = this.allVocabulary && this.allVocabulary.length > 0
            ? this.allVocabulary
            : this.vocabulary;

        // Filtrar vocabulario según el nivel seleccionado
        const levelVocab = sourceVocabulary.filter(word =>
            word.level === this.currentLevel || word.hsk === this.currentLevel
        );

        // Si no hay suficientes palabras del nivel, usar todas las palabras hasta ese nivel
        if (levelVocab.length < 20) {
            this.vocabulary = sourceVocabulary.filter(word =>
                (word.level <= this.currentLevel) || (word.hsk <= this.currentLevel)
            );
        } else {
            this.vocabulary = levelVocab;
        }

        if (!this.vocabulary || this.vocabulary.length === 0) {
            this.vocabulary = [...sourceVocabulary];
        }

        console.log(`📚 Filtered vocabulary: ${this.vocabulary.length} words for HSK ${this.currentLevel}`);
    }

    nextRound() {
        if (!this.isPlaying) return;

        if (!this.vocabulary || this.vocabulary.length === 0) {
            this.vocabulary = this.getDefaultVocabulary();
            this.allVocabulary = [...this.vocabulary];
        }

        this.currentRound++;
        this.sessionStats.totalRounds++;

        // Seleccionar palabra objetivo aleatoria
        this.currentWord = this.vocabulary[Math.floor(Math.random() * this.vocabulary.length)];

        // Generar matriz
        this.generateMatrix();

        // Actualizar UI con la palabra objetivo
        document.getElementById('target-pinyin').textContent = this.currentWord.pinyin || this.currentWord.pinyinTones;

        // Mostrar significado según el idioma actual
        const currentLang = window.languageManager?.currentLanguage || 'es';
        const meaning = currentLang === 'es' ?
            (this.currentWord.spanish || this.currentWord.translation) :
            (this.currentWord.english || this.currentWord.translation);
        document.getElementById('target-meaning').textContent = meaning || '';

        // Iniciar temporizador de respuesta
        this.startTime = Date.now();
        this.saveSessionState(true);
    }

    generateMatrix() {
        const gridSize = this.config[this.difficulty].gridSize;
        const totalCells = gridSize * gridSize;

        // Crear array de caracteres para la matriz
        this.matrixCharacters = [];

        // Posición aleatoria para la respuesta correcta
        this.correctPosition = Math.floor(Math.random() * totalCells);

        // Obtener caracteres aleatorios diferentes al correcto
        const otherChars = this.vocabulary
            .filter(word => word.character !== this.currentWord.character)
            .sort(() => Math.random() - 0.5)
            .slice(0, totalCells - 1)
            .map(word => word.character);

        // Construir la matriz
        for (let i = 0; i < totalCells; i++) {
            if (i === this.correctPosition) {
                this.matrixCharacters.push(this.currentWord.character);
            } else {
                const char = otherChars.pop() || this.getRandomCharacter();
                this.matrixCharacters.push(char);
            }
        }

        // Renderizar la matriz
        this.renderMatrix();
    }

    getRandomCharacter() {
        // Caracteres de respaldo si no hay suficiente vocabulario
        const backupChars = ['的', '一', '是', '在', '不', '了', '有', '和', '人', '这', '中', '大', '为', '上', '个', '国', '我', '以', '要', '他'];
        return backupChars[Math.floor(Math.random() * backupChars.length)];
    }

    renderMatrix() {
        const matrixContainer = document.getElementById('character-matrix');
        const gridSize = this.config[this.difficulty].gridSize;

        // Limpiar matriz anterior
        matrixContainer.innerHTML = '';

        // Establecer grid CSS
        matrixContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        matrixContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

        // Crear celdas
        this.matrixCharacters.forEach((char, index) => {
            const cell = document.createElement('button');
            cell.className = 'matrix-char';
            cell.textContent = char;
            cell.dataset.index = index;

            // Añadir animación de entrada
            cell.style.animationDelay = `${index * 0.02}s`;

            matrixContainer.appendChild(cell);
        });
    }

    checkAnswer(element) {
        if (!this.isPlaying || this.isPaused) return;

        const index = parseInt(element.dataset.index);
        const responseTime = (Date.now() - this.startTime) / 1000; // en segundos

        if (index === this.correctPosition) {
            // Respuesta correcta
            this.handleCorrectAnswer(element, responseTime);
        } else {
            // Respuesta incorrecta
            this.handleWrongAnswer(element);
        }
    }

    handleCorrectAnswer(element, responseTime) {
        this.correctAnswers++;
        this.sessionStats.correctAnswers++;
        this.sessionStats.streak++;

        // Actualizar racha máxima
        if (this.sessionStats.streak > this.sessionStats.maxStreak) {
            this.sessionStats.maxStreak = this.sessionStats.streak;
        }

        // Calcular puntos
        const basePoints = 100;
        const timeBonus = Math.max(0, Math.floor((10 - responseTime) * 10)); // Bonus por velocidad
        const streakBonus = this.sessionStats.streak * 10;
        const difficultyMultiplier = this.config[this.difficulty].scoreMultiplier;

        const roundPoints = Math.floor((basePoints + timeBonus + streakBonus) * difficultyMultiplier);
        this.score += roundPoints;

        window.dispatchEvent(new CustomEvent('hsk:matrix-round', {
            detail: {
                correct: true,
                points: roundPoints,
                level: this.currentLevel,
                difficulty: this.difficulty
            }
        }));

        // Feedback visual
        element.classList.add('correct');
        this.showFeedback('correct', `+${roundPoints} puntos`);

        // Actualizar estadísticas de tiempo
        if (responseTime < this.sessionStats.bestTime) {
            this.sessionStats.bestTime = responseTime;
        }

        const totalTime = this.sessionStats.averageTime * (this.sessionStats.totalRounds - 1) + responseTime;
        this.sessionStats.averageTime = totalTime / this.sessionStats.totalRounds;

        // Actualizar UI
        this.updateGameUI();

        // Siguiente ronda después de un breve delay
        setTimeout(() => {
            this.nextRound();
        }, 1000);
    }

    handleWrongAnswer(element) {
        this.wrongAnswers++;
        this.sessionStats.streak = 0; // Resetear racha

        // Penalización de puntos
        const penalty = 50;
        this.score = Math.max(0, this.score - penalty);

        window.dispatchEvent(new CustomEvent('hsk:matrix-round', {
            detail: {
                correct: false,
                points: -penalty,
                level: this.currentLevel,
                difficulty: this.difficulty
            }
        }));

        // Feedback visual
        element.classList.add('wrong');
        this.showFeedback('wrong', `-${penalty} puntos`);

        // Mostrar la respuesta correcta
        const correctElement = document.querySelector(`.matrix-char[data-index="${this.correctPosition}"]`);
        if (correctElement) {
            correctElement.classList.add('highlight-correct');
        }

        // Actualizar UI
        this.updateGameUI();

        // Siguiente ronda después de un delay más largo
        setTimeout(() => {
            this.nextRound();
        }, 2000);
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

    startTimer() {
        // Limpiar timer anterior si existe
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if (!this.isPaused && this.isPlaying) {
                this.timeRemaining--;

                // Actualizar barra de tiempo
                const percentage = (this.timeRemaining / this.config[this.difficulty].timeLimit) * 100;
                document.getElementById('timer-bar').style.width = `${percentage}%`;

                // Cambiar color según tiempo restante
                const timerBar = document.getElementById('timer-bar');
                if (percentage < 20) {
                    timerBar.style.backgroundColor = '#ef4444'; // Rojo
                } else if (percentage < 50) {
                    timerBar.style.backgroundColor = '#f59e0b'; // Naranja
                } else {
                    timerBar.style.backgroundColor = '#10b981'; // Verde
                }

                // Actualizar texto
                document.getElementById('timer-text').textContent = `${this.timeRemaining}s`;

                if (this.timeRemaining % 3 === 0) {
                    this.saveSessionState(true);
                }

                // Verificar si se acabó el tiempo
                if (this.timeRemaining <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    togglePause() {
        if (!this.isPlaying) return;

        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');

        if (this.isPaused) {
            pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
            // Mostrar overlay de pausa
            this.showPauseOverlay();
        } else {
            pauseBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
            // Ocultar overlay de pausa
            this.hidePauseOverlay();
        }

        this.saveSessionState(true);
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

    quitGame() {
        if (confirm('¿Estás seguro de que quieres salir del juego?')) {
            this.endGame();
        }
    }

    endGame() {
        console.log('🏁 Game ended');

        this.isPlaying = false;

        // Detener timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Calcular estadísticas finales
        const accuracy = this.correctAnswers > 0 ?
            Math.round((this.correctAnswers / (this.correctAnswers + this.wrongAnswers)) * 100) : 0;

        // Verificar si es un nuevo récord
        const isNewRecord = this.checkAndSaveHighScore();

        // Mostrar pantalla de resultados
        this.showResults(accuracy, isNewRecord);
        this.clearSessionState();
    }

    showResults(accuracy, isNewRecord) {
        // Ocultar pantalla de juego
        document.getElementById('matrix-game').style.display = 'none';

        // Mostrar pantalla de resultados
        document.getElementById('matrix-results').style.display = 'block';

        // Actualizar estadísticas
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('correct-count').textContent = this.correctAnswers;
        document.getElementById('wrong-count').textContent = this.wrongAnswers;
        document.getElementById('best-streak').textContent = this.sessionStats.maxStreak;
        document.getElementById('avg-time').textContent =
            this.sessionStats.averageTime ? `${this.sessionStats.averageTime.toFixed(1)}s` : 'N/A';
        document.getElementById('accuracy').textContent = `${accuracy}%`;

        // Mostrar mensaje de nuevo récord
        if (isNewRecord) {
            document.getElementById('new-record').style.display = 'block';
        } else {
            document.getElementById('new-record').style.display = 'none';
        }

        // Guardar estadísticas en el perfil del usuario si está disponible
        if (window.app && window.app.userProfile) {
            window.app.userProfile.updateGameStats('matrix', {
                score: this.score,
                accuracy: accuracy,
                level: this.currentLevel,
                difficulty: this.difficulty
            });
        }
    }

    async checkAndSaveHighScore() {
        const accuracy = Math.round((this.correctAnswers / (this.correctAnswers + this.wrongAnswers)) * 100);
        const scoreEntry = {
            score: this.score,
            level: this.currentLevel,
            difficulty: this.difficulty,
            accuracy: accuracy,
            date: new Date().toISOString()
        };

        // Obtener puntuaciones existentes localmente
        const key = `matrix-highscores-${this.currentLevel}-${this.difficulty}`;
        let scores = JSON.parse(localStorage.getItem(key) || '[]');

        // Verificar si es un nuevo récord
        const isNewRecord = scores.length === 0 || scoreEntry.score > scores[0].score;

        // Agregar nueva puntuación localmente
        scores.push(scoreEntry);
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // Mantener solo top 10

        // Guardar localmente
        localStorage.setItem(key, JSON.stringify(scores));

        // Actualizar lista de puntuaciones altas
        this.highScores = scores;

        // Intentar guardar en el servidor
        try {
            const userId = window.app?.userProfile?.userId || 'anonymous';
            const userName = window.app?.userProfile?.userName || 'Anonymous Player';

            const response = await fetch('/api/matrix-game/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    userName: userName,
                    score: this.score,
                    hskLevel: this.currentLevel,
                    difficulty: this.difficulty,
                    correctAnswers: this.correctAnswers,
                    wrongAnswers: this.wrongAnswers,
                    accuracy: accuracy,
                    maxStreak: this.sessionStats.maxStreak,
                    avgResponseTime: this.sessionStats.averageTime,
                    totalTime: this.config[this.difficulty].timeLimit - this.timeRemaining
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('✅ Score saved to server');
                // Actualizar leaderboard desde el servidor
                this.loadServerLeaderboard();
            }
        } catch (error) {
            console.error('❌ Error saving score to server:', error);
            // El juego continúa funcionando con almacenamiento local
        }

        return isNewRecord;
    }

    loadHighScores() {
        const key = `matrix-highscores-${this.currentLevel}-${this.difficulty}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    async loadServerLeaderboard() {
        try {
            const response = await fetch(`/api/matrix-game/leaderboard?level=${this.currentLevel}&difficulty=${this.difficulty}&limit=10`);
            const data = await response.json();

            if (data.success && data.leaderboard) {
                console.log('📊 Leaderboard loaded from server');
                // Actualizar la visualización del leaderboard si está visible
                if (document.getElementById('high-scores-list')) {
                    this.displayServerLeaderboard(data.leaderboard);
                }
            }
        } catch (error) {
            console.error('❌ Error loading leaderboard from server:', error);
        }
    }

    displayServerLeaderboard(leaderboard) {
        const listContainer = document.getElementById('high-scores-list');
        if (!listContainer) return;

        if (leaderboard.length === 0) {
            listContainer.innerHTML = '<p class="no-scores">No hay puntuaciones aún</p>';
            return;
        }

        listContainer.innerHTML = leaderboard.map((score) => `
            <div class="score-item">
                <span class="score-rank">#${score.rank}</span>
                <span class="score-name">${score.userName}</span>
                <span class="score-value">${score.score.toLocaleString()}</span>
                <span class="score-accuracy">${score.accuracy}%</span>
                <span class="score-date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }

    updateHighScoresList() {
        const listContainer = document.getElementById('high-scores-list');
        if (!listContainer) return;

        if (this.highScores.length === 0) {
            listContainer.innerHTML = '<p class="no-scores">No hay puntuaciones aún</p>';
            return;
        }

        listContainer.innerHTML = this.highScores.map((score, index) => `
            <div class="score-item">
                <span class="score-rank">#${index + 1}</span>
                <span class="score-value">${score.score.toLocaleString()}</span>
                <span class="score-accuracy">${score.accuracy}%</span>
                <span class="score-date">${new Date(score.date).toLocaleDateString()}</span>
            </div>
        `).join('');
    }

    updateGameUI() {
        document.getElementById('game-level').textContent = `HSK ${this.currentLevel}`;
        document.getElementById('game-score').textContent = this.score.toLocaleString();
        document.getElementById('game-streak').textContent = this.sessionStats.streak;
    }

    playAgain() {
        // Resetear y volver a empezar con la misma configuración
        document.getElementById('matrix-results').style.display = 'none';
        this.startGame();
    }

    showConfig() {
        // Volver a la pantalla de configuración
        document.getElementById('matrix-results').style.display = 'none';
        document.getElementById('matrix-config').style.display = 'block';
        this.updateHighScoresList();
        this.syncResumeAction();
    }

    backToApp() {
        // Volver a la aplicación principal
        this.hideGame();
        if (window.app) {
            window.app.switchTab('home');
        }
    }

    showGame() {
        console.log('🎮 Matrix Game showGame() called');

        // First, render the game interface
        console.log('🎨 About to call renderGameInterface...');

        // Get the container first
        let gameContainer = document.getElementById('matrix-game-container');
        if (!gameContainer) {
            gameContainer = document.getElementById('matrix');
        }

        if (gameContainer && typeof renderMatrixGameInterface === 'function') {
            console.log('🎨 Rendering directly with renderMatrixGameInterface...');
            try {
                const html = renderMatrixGameInterface();
                gameContainer.innerHTML = html;
                console.log('✅ Direct render successful, HTML length:', html.length);

                if (window.languageManager?.updateInterface) {
                    window.languageManager.updateInterface();
                }

                // Setup event listeners
                this.setupGameEventListeners();
            } catch (error) {
                console.error('❌ Direct render failed:', error);
            }
        } else {
            console.warn('⚠️ Container or render function not available');
            this.renderGameInterface();
        }

        console.log('🎨 renderGameInterface completed');

        // After rendering, look for the container again
        let container = document.getElementById('matrix-game-container');
        if (!container) {
            // If still not found, the content was rendered directly in the matrix tab
            container = document.getElementById('matrix');
            console.log('📦 Using matrix tab as container');
        }

        if (container) {
            container.style.display = 'block';
            console.log('✅ Matrix game container shown');
            console.log('📏 Container innerHTML length:', container.innerHTML.length);

            // Wait for DOM to be ready, then show config screen
            setTimeout(() => {
                const configScreen = document.getElementById('matrix-config');
                const gameScreen = document.getElementById('matrix-game');
                const resultsScreen = document.getElementById('matrix-results');

                console.log('🔍 Looking for screens after render...');
                console.log('Config screen found:', !!configScreen);
                console.log('Game screen found:', !!gameScreen);
                console.log('Results screen found:', !!resultsScreen);

                if (configScreen) {
                    configScreen.style.display = 'block';
                    console.log('✅ Config screen shown');
                } else {
                    console.warn('⚠️ Config screen not found');
                    // Try to find it in the entire document
                    const allConfigs = document.querySelectorAll('[id*="config"]');
                    console.log('All config elements found:', allConfigs.length);
                    allConfigs.forEach((el, i) => console.log(`Config ${i}:`, el.id));
                }

                if (gameScreen) gameScreen.style.display = 'none';
                if (resultsScreen) resultsScreen.style.display = 'none';

                this.updateHighScoresList();
                this.syncResumeAction();
            }, 100);
        } else {
            console.error('❌ Matrix game container not found after rendering');
        }
    }

    renderGameInterface() {
        console.log('🎨 Rendering Matrix Game Interface...');

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
                    console.log('📦 Using matrix tab as container');
                }
            }
        }

        if (!gameContainer) {
            console.error('❌ Matrix game container not found');
            return;
        }

        // Usar la función de matrix-game-ui.js si está disponible
        if (typeof renderMatrixGameInterface === 'function') {
            console.log('✅ Using renderMatrixGameInterface function');
            gameContainer.innerHTML = renderMatrixGameInterface();
        } else {
            console.warn('⚠️ renderMatrixGameInterface not available, using fallback');
            // Fallback: renderizar interfaz básica
            gameContainer.innerHTML = this.getGameHTML();
        }

        // Configurar event listeners después de renderizar
        this.setupGameEventListeners();

        console.log('✅ Matrix Game Interface rendered successfully');
    }

    setupGameEventListeners() {
        console.log('🎛️ Setting up Matrix Game event listeners...');

        // Botón de inicio
        const startBtn = document.getElementById('matrix-start-btn');
        if (startBtn) {
            startBtn.onclick = () => this.startGame();
        }

        this.syncResumeAction();

        // Botones de dificultad
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
            });
        });

        // Selector de nivel
        const levelSelect = document.getElementById('matrix-level-select');
        if (levelSelect) {
            levelSelect.onchange = (e) => {
                this.currentLevel = parseInt(e.target.value);
            };
        }

        // Controles del juego
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.onclick = () => this.togglePause();
        }

        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) {
            quitBtn.onclick = () => this.endGame();
        }

        // Botones de resultados
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.onclick = () => this.playAgain();
        }

        const changeSettingsBtn = document.getElementById('change-settings-btn');
        if (changeSettingsBtn) {
            changeSettingsBtn.onclick = () => this.showConfig();
        }

        const backToAppBtn = document.getElementById('back-to-app-btn');
        if (backToAppBtn) {
            backToAppBtn.onclick = () => this.backToApp();
        }

        console.log('✅ Event listeners configured');
    }

    getGameHTML() {
        // HTML de respaldo para el juego
        return renderMatrixGameInterface ? renderMatrixGameInterface() : `
            <div class="matrix-error">
                <h2>Error cargando el juego</h2>
                <p>Por favor, recarga la página</p>
            </div>
        `;
    }

    hideGame() {
        const container = document.getElementById('matrix-game-container');
        if (container) {
            container.style.display = 'none';
        }

        // Limpiar cualquier juego en progreso
        if (this.isPlaying) {
            this.saveSessionState(true);
            this.isPlaying = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    saveSessionState(force = false) {
        try {
            if (!force && !this.isPlaying) return;

            const state = {
                currentLevel: this.currentLevel,
                difficulty: this.difficulty,
                score: this.score,
                timeRemaining: this.timeRemaining,
                currentRound: this.currentRound,
                correctAnswers: this.correctAnswers,
                wrongAnswers: this.wrongAnswers,
                isPlaying: this.isPlaying,
                isPaused: this.isPaused,
                currentWord: this.currentWord,
                matrixCharacters: this.matrixCharacters,
                correctPosition: this.correctPosition,
                sessionStats: this.sessionStats,
                updatedAt: Date.now()
            };

            localStorage.setItem(this.sessionStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Error saving matrix session:', error);
        }
    }

    loadSessionState() {
        try {
            const raw = localStorage.getItem(this.sessionStorageKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.warn('⚠️ Error loading matrix session:', error);
            return null;
        }
    }

    clearSessionState() {
        try {
            localStorage.removeItem(this.sessionStorageKey);
        } catch (error) {
            console.warn('⚠️ Error clearing matrix session:', error);
        }
    }

    getResumableSession() {
        const state = this.loadSessionState();
        if (!state || !state.updatedAt) return null;

        const age = Date.now() - Number(state.updatedAt);
        if (age > this.sessionMaxAgeMs) {
            this.clearSessionState();
            return null;
        }

        const hasRound = !!(state.currentWord && Array.isArray(state.matrixCharacters) && state.matrixCharacters.length > 0);
        if (!state.isPlaying || !hasRound || Number(state.timeRemaining || 0) <= 0) {
            return null;
        }

        return state;
    }

    syncResumeAction() {
        const configScreen = document.getElementById('matrix-config');
        const startBtn = document.getElementById('matrix-start-btn');
        if (!configScreen || !startBtn) return;

        let resumeBtn = document.getElementById('matrix-resume-btn');
        const resumable = this.getResumableSession();

        if (!resumable) {
            if (resumeBtn) resumeBtn.remove();
            return;
        }

        if (!resumeBtn) {
            resumeBtn = document.createElement('button');
            resumeBtn.id = 'matrix-resume-btn';
            resumeBtn.className = 'matrix-start-btn';
            resumeBtn.style.marginTop = '10px';
            startBtn.parentNode.insertBefore(resumeBtn, startBtn.nextSibling);
            resumeBtn.addEventListener('click', () => this.resumeSession());
        }

        const label = window.languageManager?.t
            ? window.languageManager.t('resumeMatrix')
            : 'Resume Matrix';
        resumeBtn.textContent = label || 'Resume Matrix';
    }

    resumeSession() {
        const state = this.getResumableSession();
        if (!state) {
            this.syncResumeAction();
            return;
        }

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.currentLevel = Number(state.currentLevel || 1);
        this.difficulty = state.difficulty || 'normal';
        this.score = Number(state.score || 0);
        this.timeRemaining = Number(state.timeRemaining || this.config[this.difficulty].timeLimit);
        this.currentRound = Number(state.currentRound || 0);
        this.correctAnswers = Number(state.correctAnswers || 0);
        this.wrongAnswers = Number(state.wrongAnswers || 0);
        this.currentWord = state.currentWord || null;
        this.matrixCharacters = Array.isArray(state.matrixCharacters) ? state.matrixCharacters : [];
        this.correctPosition = Number(state.correctPosition || 0);
        this.sessionStats = state.sessionStats || this.sessionStats;

        const levelSelect = document.getElementById('matrix-level-select');
        if (levelSelect) {
            levelSelect.value = String(this.currentLevel);
        }

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.difficulty);
        });

        document.getElementById('matrix-config').style.display = 'none';
        document.getElementById('matrix-results').style.display = 'none';
        document.getElementById('matrix-game').style.display = 'block';

        this.isPlaying = true;
        this.isPaused = false;
        this.startTime = Date.now();

        this.renderMatrix();

        document.getElementById('target-pinyin').textContent = this.currentWord?.pinyin || this.currentWord?.pinyinTones || '';
        const currentLang = window.languageManager?.currentLanguage || 'es';
        const meaning = currentLang === 'es'
            ? (this.currentWord?.spanish || this.currentWord?.translation)
            : (this.currentWord?.english || this.currentWord?.translation);
        document.getElementById('target-meaning').textContent = meaning || '';

        this.updateGameUI();
        this.startTimer();
        this.saveSessionState(true);
    }
}

// Inicializar el juego cuando se carga el documento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.matrixGame = new MatrixGame();
    });
} else {
    window.matrixGame = new MatrixGame();
}
