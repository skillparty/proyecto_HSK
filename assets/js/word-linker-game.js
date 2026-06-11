/**
 * Word Linker – HSK grid character connection game
 */
class WordLinkerGame {
    constructor(app) {
        this.app = app;
        
        // Game settings
        this.baseTimeLimit = 90; // seconds
        this.gridSize = 4; // 4x4 grid
        this.activeLevel = "all";
        
        // State
        this.state = this.getInitialState();
        
        this.timerIntervalId = null;
        this.isInitialized = false;
        
        // Fallback vocabulary list for grid generation if empty
        this.fallbackVocab = [
            { character: "明天", pinyin: "míngtiān", translation: "mañana" },
            { character: "今天", pinyin: "jīntiān", translation: "hoy" },
            { character: "朋友", pinyin: "péngyou", translation: "amigo" },
            { character: "中国", pinyin: "zhōngguó", translation: "China" },
            { character: "老师", pinyin: "lǎoshī", translation: "profesor" },
            { character: "学生", pinyin: "xuéshēng", translation: "estudiante" },
            { character: "医生", pinyin: "yīshēng", translation: "médico" },
            { character: "高兴", pinyin: "gāoxìng", translation: "contento" },
            { character: "汉字", pinyin: "hànzì", translation: "caracteres chinos" },
            { character: "学校", pinyin: "xuéxiào", translation: "escuela" },
            { character: "再见", pinyin: "zàijiàn", translation: "adiós" },
            { character: "谢谢", pinyin: "xièxie", translation: "gracias" },
            { character: "喜欢", pinyin: "xǐhuan", translation: "gustar / encantar" },
            { character: "电脑", pinyin: "diànnǎo", translation: "ordenador" },
            { character: "飞机", pinyin: "fēijī", translation: "avión" }
        ];
    }
    
    getInitialState() {
        return {
            isPlaying: false,
            isPaused: false,
            score: 0,
            timeLeft: this.baseTimeLimit,
            currentClueWord: null, // the word the player is looking for
            gridCells: [], // characters in grid cells
            selectedIndices: [], // list of selected cell indices
            levelWords: [], // words for HSK level
            wordsInGrid: [], // words placed in the current grid
            foundWords: [] // words found in current grid
        };
    }
    
    // Bind buttons
    initialize() {
        if (this.isInitialized) return;
        
        const startBtn = document.getElementById('word-link-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        const pauseBtn = document.getElementById('word-link-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        const quitBtn = document.getElementById('word-link-quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }
        
        this.isInitialized = true;
    }
    
    // Start game
    startGame() {
        this.initialize();
        
        const levelSelect = document.getElementById('word-link-level');
        this.activeLevel = levelSelect ? levelSelect.value : "all";
        
        this.state = this.getInitialState();
        this.state.isPlaying = true;
        
        // Filter vocabulary to 2-character words — SRS-due words weighted higher
        let rawVocab = window.app.vocabulary || [];
        if (rawVocab.length > 0 && window.app && window.app.srsEngine) {
            rawVocab = window.app.srsEngine.getWeightedGamePool(rawVocab);
        }
        if (rawVocab.length === 0) {
            rawVocab = [...this.fallbackVocab];
        }
        
        let filtered = rawVocab.filter(w => w.character && w.character.length === 2);
        
        if (this.activeLevel !== "all") {
            const lvl = parseInt(this.activeLevel);
            this.state.levelWords = filtered.filter(w => parseInt(w.level) === lvl);
        } else {
            this.state.levelWords = [...filtered];
        }
        
        if (this.state.levelWords.length < 5) {
            this.state.levelWords = [...filtered]; // Safeguard
        }
        if (this.state.levelWords.length < 5) {
            this.state.levelWords = [...this.fallbackVocab]; // Fallback safeguard
        }
        
        // Hide setup, show game
        document.getElementById('word-link-setup').style.display = 'none';
        document.getElementById('word-link-game-area').style.display = 'flex';
        
        // Start countdown timer
        this.startTimer();
        
        // Generate grid
        this.generateNewGrid();
        
        // Start Sound
        this.playSynth(261.63, 'sine', 0.2, 0.15); // C4 note
        setTimeout(() => this.playSynth(329.63, 'sine', 0.15, 0.25), 120); // E4 note
    }
    
    startTimer() {
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        
        this.timerIntervalId = setInterval(() => {
            if (this.state.isPaused || !this.state.isPlaying) return;
            
            this.state.timeLeft--;
            this.updateHUD();
            
            if (this.state.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    // Pause toggle
    togglePause() {
        if (!this.state.isPlaying) return;
        
        this.state.isPaused = !this.state.isPaused;
        const pauseBtn = document.getElementById('word-link-pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.state.isPaused
                ? (window.languageManager ? window.languageManager.t('wordLinkResumeBtn') : "Reanudar")
                : (window.languageManager ? window.languageManager.t('wordLinkPauseBtn') : "Pausar");
        }
    }
    
    // Quit Game
    quitGame() {
        this.state.isPlaying = false;
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        
        document.getElementById('word-link-setup').style.display = 'block';
        document.getElementById('word-link-game-area').style.display = 'none';
    }
    
    // Generate new grid cells and pick words
    generateNewGrid() {
        this.state.foundWords = [];
        this.state.selectedIndices = [];
        
        // Pick 4 random words for the grid
        const shuffled = this.shuffleArray(this.state.levelWords);
        this.state.wordsInGrid = shuffled.slice(0, 4);
        
        // Extract all characters of the 4 words
        let gridChars = [];
        this.state.wordsInGrid.forEach(word => {
            gridChars.push(word.character.charAt(0));
            gridChars.push(word.character.charAt(1));
        });
        
        // Fill remaining 8 cells with random characters
        const extraWords = shuffled.slice(4, 10);
        while (gridChars.length < 16) {
            const randomWord = extraWords[Math.floor(Math.random() * extraWords.length)];
            if (randomWord) {
                const char = randomWord.character.charAt(Math.floor(Math.random() * 2));
                gridChars.push(char);
            } else {
                gridChars.push("中"); // Absolute fallback
            }
        }
        
        // Shuffle grid characters
        this.state.gridCells = this.shuffleArray(gridChars);
        
        // Render grid in DOM
        const gridContainer = document.getElementById('word-link-grid-board');
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'word-link-cell';
            cell.textContent = this.state.gridCells[i];
            
            cell.addEventListener('click', () => this.onCellClick(i, cell));
            gridContainer.appendChild(cell);
        }
        
        // Load first clue
        this.loadClue();
    }
    
    // Pick the next word to search from the grid
    loadClue() {
        // Find a word in wordsInGrid that hasn't been found yet
        const remaining = this.state.wordsInGrid.filter(w => !this.state.foundWords.includes(w));
        
        if (remaining.length === 0) {
            // All words found in this grid -> generate new grid!
            this.playSynth(523.25, 'sine', 0.2, 0.1);
            setTimeout(() => this.playSynth(659.25, 'sine', 0.2, 0.1), 100);
            setTimeout(() => this.playSynth(783.99, 'sine', 0.2, 0.2), 200);
            
            this.generateNewGrid();
            return;
        }
        
        this.state.currentClueWord = remaining[Math.floor(Math.random() * remaining.length)];
        
        // Show clue text
        const trans = this.state.currentClueWord.translation || this.state.currentClueWord.spanish || this.state.currentClueWord.english || "";
        document.getElementById('word-link-clue').textContent = `${trans} (${this.state.currentClueWord.pinyin})`;
        
        // Clear selections
        this.clearSelection();
        this.updateHUD();
    }
    
    // Handle cell selections
    onCellClick(index, element) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        // Check if cell is already selected
        const selectionIndex = this.state.selectedIndices.indexOf(index);
        if (selectionIndex !== -1) {
            // Deselect it
            this.state.selectedIndices.splice(selectionIndex, 1);
            element.classList.remove('selected');
            this.playSynth(400, 'sine', 0.08, 0.05);
        } else {
            // Select it (max 2 characters, as target words are length 2)
            if (this.state.selectedIndices.length < 2) {
                this.state.selectedIndices.push(index);
                element.classList.add('selected');
                this.playSynth(500 + (this.state.selectedIndices.length * 100), 'sine', 0.1, 0.06);
            }
        }
        
        // Check if selected word is complete
        if (this.state.selectedIndices.length === 2) {
            this.checkMatch();
        }
    }
    
    // Verify spelling
    checkMatch() {
        const char1 = this.state.gridCells[this.state.selectedIndices[0]];
        const char2 = this.state.gridCells[this.state.selectedIndices[1]];
        
        const spelled1 = char1 + char2;
        const spelled2 = char2 + char1;
        const target = this.state.currentClueWord.character;
        
        const cells = document.querySelectorAll('.word-link-cell');
        
        if (spelled1 === target || spelled2 === target) {
            // Match success!
            this.state.foundWords.push(this.state.currentClueWord);
            this.state.score += 25;
            
            // Record correct word match
            window.progressIntegrator?.recordWordStudy({
                character: this.state.currentClueWord.character,
                pinyin: this.state.currentClueWord.pinyin,
                isCorrect: true,
                hskLevel: this.state.currentClueWord.level || 1,
                responseTime: 3000
            });
            
            // Neon pulse on matched cells
            this.state.selectedIndices.forEach(idx => {
                if (cells[idx]) {
                    cells[idx].classList.remove('selected');
                    cells[idx].classList.add('matched');
                }
            });
            
            this.playSynth(523.25, 'sine', 0.15, 0.12);
            setTimeout(() => this.playSynth(659.25, 'sine', 0.15, 0.2), 100);
            
            // Clear current selection indices and load next clue after short delay
            const oldIndices = [...this.state.selectedIndices];
            this.state.selectedIndices = [];
            
            setTimeout(() => {
                oldIndices.forEach(idx => {
                    if (cells[idx]) {
                        cells[idx].classList.remove('matched');
                        cells[idx].textContent = '✓'; // Mark found cell
                    }
                });
                this.loadClue();
            }, 800);
            
        } else {
            // Failure buzzer
            this.playSynth(140, 'sawtooth', 0.18, 0.22);
            
            // Record incorrect word match
            window.progressIntegrator?.recordWordStudy({
                character: this.state.currentClueWord.character,
                pinyin: this.state.currentClueWord.pinyin,
                isCorrect: false,
                hskLevel: this.state.currentClueWord.level || 1,
                responseTime: 3000
            });
            
            // Flash selection red
            this.state.selectedIndices.forEach(idx => {
                if (cells[idx]) {
                    cells[idx].style.borderColor = '#ef4444';
                    cells[idx].style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                }
            });
            
            setTimeout(() => {
                this.state.selectedIndices.forEach(idx => {
                    if (cells[idx]) {
                        cells[idx].style.borderColor = '';
                        cells[idx].style.backgroundColor = '';
                    }
                });
                this.clearSelection();
            }, 500);
        }
    }
    
    // Clear active grid selection
    clearSelection() {
        const cells = document.querySelectorAll('.word-link-cell');
        this.state.selectedIndices.forEach(idx => {
            if (cells[idx]) {
                cells[idx].classList.remove('selected');
            }
        });
        this.state.selectedIndices = [];
    }
    
    // End Game
    endGame() {
        this.state.isPlaying = false;
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        
        const board = document.getElementById('word-link-grid-board');
        const finishedText = window.languageManager ? window.languageManager.t('wordLinkFinished') : "¡Fin del Tiempo!";
        const scoreText = window.languageManager ? window.languageManager.t('wordLinkScoreText', { score: this.state.score }) : `Puntaje Final: <strong>${this.state.score}</strong> puntos`;
        board.innerHTML = `
            <div style="padding: 2rem; width: 100%;">
                <h3 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 0.5rem;">${finishedText}</h3>
                <p style="font-size: 1.1rem;">${scoreText}</p>
            </div>
        `;
        
        this.playSynth(220, 'sawtooth', 0.2, 0.3);
        setTimeout(() => this.playSynth(110, 'triangle', 0.25, 0.45), 250);
        
        // Save high score and report progress
        if (window.app && window.app.stats) {
            const prevHigh = window.app.stats.wordLinkerHighScore || 0;
            if (this.state.score > prevHigh) {
                window.app.stats.wordLinkerHighScore = this.state.score;
            }
            window.app.saveStats();
        }
        
        // Fire game result event for dashboard integration
        document.dispatchEvent(new CustomEvent('hsk:game-result', {
            detail: { game: 'word-linker', score: this.state.score }
        }));
    }
    
    // Update stats
    updateHUD() {
        const scoreVal = document.getElementById('word-link-score');
        const timerVal = document.getElementById('word-link-timer');
        
        if (scoreVal) scoreVal.textContent = this.state.score;
        if (timerVal) {
            const minutes = Math.floor(this.state.timeLeft / 60);
            const seconds = this.state.timeLeft % 60;
            timerVal.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            
            if (this.state.timeLeft <= 10) {
                timerVal.style.color = '#ef4444';
            } else {
                timerVal.style.color = '';
            }
        }
    }
    
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    // Synth audio
    playSynth(frequency, type = 'sine', volume = 0.1, duration = 0.15) {
        if (window.gameAudioManager) {
            window.gameAudioManager.playSynth(frequency, type, volume, duration);
            return;
        }
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            
            const audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(volume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Ignored browser sound blocks
        }
    }
}

window.WordLinkerGame = WordLinkerGame;
