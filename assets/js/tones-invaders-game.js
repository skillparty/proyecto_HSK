/**
 * Tones Invaders – Space Invaders tone recognition game
 */
class TonesInvadersGame {
    constructor(app) {
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        
        // Game settings
        this.maxLives = 3;
        this.baseSpeed = 0.8;
        this.activeLevel = "all";
        this.difficulty = "normal";
        
        // State
        this.state = this.getInitialState();
        
        // Game lists
        this.invaders = [];
        this.lasers = [];
        this.particles = [];
        
        // Loop controls
        this.animationFrameId = null;
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2500; // ms between spawns
        
        this.isInitialized = false;
        
        // Tone colors and tones mapping
        this.toneColors = {
            1: '#ef4444', // Tone 1: Red
            2: '#eab308', // Tone 2: Yellow
            3: '#22c55e', // Tone 3: Green
            4: '#3b82f6', // Tone 4: Blue
            5: '#a855f7'  // Tone 5: Purple
        };
        
        // Vowel character mapping for tone detection
        this.toneVowels = {
            'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1,
            'Ā': 1, 'Ē': 1, 'Ī': 1, 'Ō': 1, 'Ū': 1, 'Ǖ': 1,
            'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
            'Á': 2, 'É': 2, 'Í': 2, 'Ó': 2, 'Ú': 2, 'Ǘ': 2,
            'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3,
            'Ǎ': 3, 'Ě': 3, 'Ǐ': 3, 'Ǒ': 3, 'Ǔ': 3, 'Ǚ': 3,
            'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4,
            'À': 4, 'È': 4, 'Ì': 4, 'Ò': 4, 'Ù': 4, 'Ǜ': 4
        };
    }
    
    getInitialState() {
        return {
            isPlaying: false,
            isPaused: false,
            score: 0,
            lives: this.maxLives,
            level: 1,
            speedMultiplier: 1.0,
            vocabulary: []
        };
    }
    
    // Resolve tone number from Pinyin string
    detectTone(pinyin) {
        if (!pinyin) return 5;
        for (let char of pinyin) {
            if (this.toneVowels[char]) {
                return this.toneVowels[char];
            }
        }
        return 5; // Neutral
    }
    
    // Initialize game DOM events
    initialize() {
        if (this.isInitialized) return;
        
        this.canvas = document.getElementById('tones-inv-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Start Button
        const startBtn = document.getElementById('tones-inv-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // Mobile Buttons
        const toneBtns = document.querySelectorAll('.tones-inv-tone-btn');
        toneBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tone = parseInt(btn.getAttribute('data-tone'));
                this.fireLaser(tone);
            });
        });
        
        // Pause Button
        const pauseBtn = document.getElementById('tones-inv-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Quit Button
        const quitBtn = document.getElementById('tones-inv-quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }
        
        // Keyboard bindings
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.isInitialized = true;
    }
    
    handleKeyDown(e) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        // Keys '1' to '5'
        if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            this.fireLaser(parseInt(e.key));
        }
    }
    
    // Start game
    startGame() {
        this.initialize(); // Ensure elements are bound
        
        const levelSelect = document.getElementById('tones-inv-level');
        const speedSelect = document.getElementById('tones-inv-speed');
        
        this.activeLevel = levelSelect ? levelSelect.value : "all";
        this.difficulty = speedSelect ? speedSelect.value : "normal";
        
        // Setup initial stats
        this.state = this.getInitialState();
        this.state.isPlaying = true;
        this.invaders = [];
        this.lasers = [];
        this.particles = [];
        this.spawnTimer = 0;
        
        // Difficulty values
        if (this.difficulty === "easy") {
            this.state.speedMultiplier = 0.7;
            this.spawnInterval = 3200;
        } else if (this.difficulty === "hard") {
            this.state.speedMultiplier = 1.3;
            this.spawnInterval = 1800;
        } else {
            this.state.speedMultiplier = 1.0;
            this.spawnInterval = 2500;
        }
        
        // Filter vocabulary
        let fullList = window.app.vocabulary || [];
        if (fullList.length === 0) {
            // Fallback list
            fullList = [
                { character: "你", pinyin: "nǐ", translation: "tú", level: 1 },
                { character: "我", pinyin: "wǒ", translation: "yo", level: 1 },
                { character: "他", pinyin: "tā", translation: "él", level: 1 },
                { character: "是", pinyin: "shì", translation: "ser / sí", level: 1 },
                { character: "不", pinyin: "bù", translation: "no", level: 1 },
                { character: "好", pinyin: "hǎo", translation: "bueno", level: 1 },
                { character: "大", pinyin: "dà", translation: "grande", level: 1 },
                { character: "小", pinyin: "xiǎo", translation: "pequeño", level: 1 }
            ];
        }
        
        if (this.activeLevel !== "all") {
            const hskLevel = parseInt(this.activeLevel);
            this.state.vocabulary = fullList.filter(w => parseInt(w.level) === hskLevel);
        } else {
            this.state.vocabulary = [...fullList];
        }
        
        if (this.state.vocabulary.length === 0) {
            this.state.vocabulary = [...fullList]; // Safeguard
        }
        
        // Hide setup screen, show game screen
        document.getElementById('tones-inv-setup').style.display = 'none';
        document.getElementById('tones-inv-game-area').style.display = 'block';
        
        // Sync DOM stats
        this.updateHUD();
        
        // Sounds
        this.playSynthesizerSound(150, 'square', 0.25);
        setTimeout(() => this.playSynthesizerSound(300, 'square', 0.2), 150);
        
        // Start Loop
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    // Toggle pause state
    togglePause() {
        if (!this.state.isPlaying) return;
        
        this.state.isPaused = !this.state.isPaused;
        const pauseBtn = document.getElementById('tones-inv-pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.state.isPaused ? "Reanudar" : "Pausar";
        }
        
        if (!this.state.isPaused) {
            this.lastTime = performance.now();
            this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        }
    }
    
    // Exit game
    quitGame() {
        this.state.isPlaying = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        document.getElementById('tones-inv-setup').style.display = 'block';
        document.getElementById('tones-inv-game-area').style.display = 'none';
    }
    
    // Fire laser from bottom center
    fireLaser(tone) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        const shipX = this.canvas.width / 2;
        const shipY = this.canvas.height - 30;
        
        this.lasers.push({
            x: shipX,
            y: shipY,
            speedY: -6,
            tone: tone,
            color: this.toneColors[tone] || '#ffffff'
        });
        
        // Play laser synth sound
        this.playSynthesizerSound(600 + (tone * 100), 'sawtooth', 0.1, 0.08);
    }
    
    // Game loop
    gameLoop(timestamp) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    // Update game logic
    update(dt) {
        // Handle spawns
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnInvader();
        }
        
        // 1. Move invaders
        const speed = this.baseSpeed * this.state.speedMultiplier;
        for (let i = this.invaders.length - 1; i >= 0; i--) {
            const inv = this.invaders[i];
            inv.y += speed;
            
            // Check boundary
            if (inv.y > this.canvas.height - 40) {
                // Invader reached bottom -> lose a life!
                this.invaders.splice(i, 1);
                this.state.lives--;
                this.updateHUD();
                
                // Red flash / error noise
                this.playSynthesizerSound(100, 'triangle', 0.3, 0.3);
                
                if (this.state.lives <= 0) {
                    this.endGame();
                    return;
                }
            }
        }
        
        // 2. Move lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.y += laser.speedY;
            if (laser.y < 0) {
                this.lasers.splice(i, 1);
            }
        }
        
        // 3. Move particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 4. Hit collisions
        for (let l = this.lasers.length - 1; l >= 0; l--) {
            const laser = this.lasers[l];
            for (let i = this.invaders.length - 1; i >= 0; i--) {
                const inv = this.invaders[i];
                
                // Box collision check
                const dx = Math.abs(laser.x - inv.x);
                const dy = Math.abs(laser.y - inv.y);
                
                if (dx < 25 && dy < 25) {
                    // Collision!
                    if (laser.tone === inv.tone) {
                        // Correct tone matched!
                        this.createExplosion(inv.x, inv.y, laser.color);
                        this.invaders.splice(i, 1);
                        this.lasers.splice(l, 1);
                        
                        // Score increment
                        this.state.score += 10;
                        this.state.level = Math.floor(this.state.score / 100) + 1;
                        this.state.speedMultiplier = 1.0 + (this.state.level - 1) * 0.15;
                        
                        this.updateHUD();
                        
                        // Explosion sound
                        this.playSynthesizerSound(120, 'noise', 0.2, 0.25);
                    } else {
                        // Wrong tone -> laser simply passes through or vanishes
                        this.lasers.splice(l, 1);
                        this.playSynthesizerSound(150, 'sawtooth', 0.05, 0.15); // buzzer noise
                    }
                    break; // stop checking invaders for this laser
                }
            }
        }
    }
    
    // Spawn a new character invader
    spawnInvader() {
        if (this.state.vocabulary.length === 0) return;
        
        // Select random word
        const word = this.state.vocabulary[Math.floor(Math.random() * this.state.vocabulary.length)];
        
        // We parse the first character of the word
        const char = word.character.charAt(0);
        const tone = this.detectTone(word.pinyin);
        
        const x = 50 + Math.random() * (this.canvas.width - 100);
        const y = 0;
        
        this.invaders.push({
            x: x,
            y: y,
            char: char,
            pinyin: word.pinyin,
            translation: word.translation || word.spanish || word.english || "",
            tone: tone
        });
    }
    
    // Draw canvas
    draw() {
        // Clear canvas with space galaxy background
        this.ctx.fillStyle = '#070714';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw space stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
            const starX = (Math.sin(i * 123.4) * 0.5 + 0.5) * this.canvas.width;
            const starY = ((performance.now() * 0.02 + i * 20) % this.canvas.height);
            this.ctx.fillRect(starX, starY, 2, 2);
        }
        
        // Draw launcher / spaceship
        const shipX = this.canvas.width / 2;
        const shipY = this.canvas.height - 20;
        
        this.ctx.fillStyle = '#4f46e5';
        this.ctx.beginPath();
        this.ctx.moveTo(shipX, shipY - 15);
        this.ctx.lineTo(shipX - 20, shipY + 15);
        this.ctx.lineTo(shipX + 20, shipY + 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Ship glow
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw invaders
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.invaders.forEach(inv => {
            // Draw character aura based on tone
            const color = this.toneColors[inv.tone] || '#ffffff';
            this.ctx.fillStyle = color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = color;
            
            // Draw circle background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(inv.x, inv.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw character text
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '22px "Noto Sans SC", sans-serif';
            this.ctx.fillText(inv.char, inv.x, inv.y - 2);
            
            // Draw subtexts
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '10px "Inter", sans-serif';
            this.ctx.fillText(inv.translation, inv.x, inv.y + 30);
        });
        
        // Draw lasers
        this.lasers.forEach(laser => {
            this.ctx.fillStyle = laser.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = laser.color;
            
            this.ctx.fillRect(laser.x - 2, laser.y - 12, 4, 15);
            
            this.ctx.shadowBlur = 0;
        });
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
    }
    
    // Create explosion effect particles
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 2 + Math.random() * 3,
                color: color,
                life: 300 + Math.random() * 400 // ms
            });
        }
    }
    
    // Update HTML HUD stats
    updateHUD() {
        const scoreVal = document.getElementById('tones-inv-score');
        const livesVal = document.getElementById('tones-inv-lives');
        const levelVal = document.getElementById('tones-inv-game-level');
        
        if (scoreVal) scoreVal.textContent = this.state.score;
        if (levelVal) levelVal.textContent = this.state.level;
        
        if (livesVal) {
            let hearts = "";
            for (let i = 0; i < this.maxLives; i++) {
                hearts += i < this.state.lives ? "❤️" : "🖤";
            }
            livesVal.textContent = hearts;
        }
    }
    
    // End game
    endGame() {
        this.state.isPlaying = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Draw Game Over on canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 36px "Inter", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText("FIN DEL JUEGO", this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px "Inter", sans-serif';
        this.ctx.fillText(`Puntaje Final: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 25);
        
        // Sound
        this.playSynthesizerSound(180, 'sawtooth', 0.3, 0.4);
        setTimeout(() => this.playSynthesizerSound(90, 'triangle', 0.4, 0.6), 250);
        
        // Save score if possible
        if (window.app && window.app.progressController) {
            // Option to add stats update here
        }
    }
    
    // Retro synthesizer helper using Web Audio API
    playSynthesizerSound(frequency, type = 'sawtooth', volume = 0.1, duration = 0.15) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            
            const audioCtx = new AudioCtx();
            
            // Noise generator helper
            if (type === 'noise') {
                const bufferSize = audioCtx.sampleRate * duration;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noiseNode = audioCtx.createBufferSource();
                noiseNode.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = frequency;
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(volume, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
                
                noiseNode.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                noiseNode.start();
                return;
            }
            
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
            // Silent catch if audio is blocked by browser policies
        }
    }
}

window.TonesInvadersGame = TonesInvadersGame;
