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
        this.logicalWidth = 600;
        this.logicalHeight = 400;
        
        // State
        this.state = this.getInitialState();
        
        // Game lists
        this.invaders = [];
        this.lasers = [];
        
        // Pre-allocate particle pool to reduce GC pressure
        this.particlePool = [];
        for (let i = 0; i < 150; i++) {
            this.particlePool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 0,
                color: '#ffffff',
                life: 0,
                active: false
            });
        }
        
        // Loop controls
        this.animationFrameId = null;
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2500; // ms between spawns
        
        this.isInitialized = false;
        
        // Tone colors (Pedagogical Standard)
        this.toneColors = {
            1: '#d97706', // Tone 1: Amarillo
            2: '#2563eb', // Tone 2: Azul
            3: '#16a34a', // Tone 3: Verde
            4: '#dc2626', // Tone 4: Rojo
            5: '#6b7280'  // Tone 5: Gris (Neutro)
        };
        
        // Ship movement properties
        this.playerX = 300;
        this.playerY = 350;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false
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
    
    // Recalculates canvas size based on container and applies devicePixelRatio
    resizeCanvas() {
        if (!this.canvas) return;
        const parentNode = this.canvas.parentNode;
        const rect = parentNode.getBoundingClientRect();

        // Guard: skip resize when container is hidden (rect.width = 0).
        // startGame() calls resizeCanvas() again after the game area is shown.
        if (rect.width === 0) return;

        const dpr = window.devicePixelRatio || 1;
        
        // Measure exact content width (subtract borders and padding to prevent infinite expansion / layout quirks)
        const style = window.getComputedStyle(parentNode);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;
        const paddingLeft = parseFloat(style.paddingLeft) || 0;
        const paddingRight = parseFloat(style.paddingRight) || 0;
        const width = rect.width - (borderLeft + borderRight + paddingLeft + paddingRight);
        
        // Maintain 3:2 aspect ratio
        const height = width * (this.logicalHeight / this.logicalWidth);
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        this.ctx = this.canvas.getContext('2d');
        // Reset transform to identity before scaling to prevent cumulative/exponential scaling bugs
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr * (width / this.logicalWidth), dpr * (height / this.logicalHeight));
    }
    
    // Initialize game DOM events
    initialize() {
        if (this.isInitialized) return;
        
        this.canvas = document.getElementById('tones-inv-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Responsive sizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
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
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch & Mouse bindings for canvas ship movement
        const handlePointer = (e) => {
            if (!this.state.isPlaying || this.state.isPaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const canvasX = ((clientX - rect.left) / rect.width) * this.logicalWidth;
            const canvasY = ((clientY - rect.top) / rect.height) * this.logicalHeight;
            
            this.playerX = Math.max(20, Math.min(this.logicalWidth - 20, canvasX));
            this.playerY = Math.max(150, Math.min(this.logicalHeight - 20, canvasY));
        };
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left click held
                handlePointer(e);
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            handlePointer(e);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.state.isPlaying && !this.state.isPaused) {
                e.preventDefault();
                handlePointer(e);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state.isPlaying && !this.state.isPaused) {
                e.preventDefault();
                handlePointer(e);
            }
        }, { passive: false });
        
        this.isInitialized = true;
    }
    
    handleKeyDown(e) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        // Shoot tones: '1' to '4' or 'Space' for neutral tone (5)
        if (e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            this.fireLaser(parseInt(e.key));
        } else if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            this.fireLaser(5);
        }
        
        // Movements: arrow keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            this.keys[e.key] = true;
        }
    }
    
    handleKeyUp(e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            this.keys[e.key] = false;
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
        this.particlePool.forEach(p => p.active = false);
        this.spawnTimer = 0;
        
        // Reset player ship
        this.playerX = this.canvas ? this.logicalWidth / 2 : 300;
        this.playerY = this.canvas ? this.logicalHeight - 35 : 350;
        this.lastFiredTone = 5;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false
        };
        
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
        
        // Filter vocabulary — SRS-due words weighted higher
        let fullList = window.app.vocabulary || [];
        if (fullList.length > 0 && window.app && window.app.srsEngine) {
            fullList = window.app.srsEngine.getWeightedGamePool(fullList);
        }
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
        
        // Recalculate canvas size now that game area is visible and has a layout
        this.resizeCanvas();
        
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
            pauseBtn.textContent = this.state.isPaused
                ? (window.languageManager ? window.languageManager.t('tonesInvResumeBtn') : "Reanudar")
                : (window.languageManager ? window.languageManager.t('tonesInvPauseBtn') : "Pausar");
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
    
    // Fire laser from ship position
    fireLaser(tone) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        const shipX = this.playerX;
        const shipY = this.playerY - 10;
        
        this.lastFiredTone = tone;
        
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
        
        let dt = timestamp - this.lastTime;
        // Clamp delta time to avoid large movement jumps during lag spikes
        if (dt > 100) dt = 16.67;
        this.lastTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    // Update game logic
    update(dt) {
        // Move player ship based on key states
        const playerSpeed = 0.25 * dt;
        if (this.keys.ArrowLeft) {
            this.playerX = Math.max(20, this.playerX - playerSpeed);
        }
        if (this.keys.ArrowRight) {
            this.playerX = Math.min(this.logicalWidth - 20, this.playerX + playerSpeed);
        }
        if (this.keys.ArrowUp) {
            this.playerY = Math.max(150, this.playerY - playerSpeed);
        }
        if (this.keys.ArrowDown) {
            this.playerY = Math.min(this.logicalHeight - 20, this.playerY + playerSpeed);
        }

        // Handle spawns
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnInvader();
        }
        
        // 1. Move invaders (delta time normalized to 60 FPS baseline of 16.67ms)
        const speed = this.baseSpeed * this.state.speedMultiplier;
        for (let i = this.invaders.length - 1; i >= 0; i--) {
            const inv = this.invaders[i];
            inv.y += speed * (dt / 16.67);
            
            // Check boundary
            if (inv.y > this.logicalHeight - 40) {
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
        
        // 2. Move lasers (delta time normalized to 60 FPS baseline of 16.67ms)
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.y += laser.speedY * (dt / 16.67);
            if (laser.y < 0) {
                this.lasers.splice(i, 1);
            }
        }
        
        // 3. Move particles (using pre-allocated object pool to reduce GC pressure)
        for (let i = 0; i < this.particlePool.length; i++) {
            const p = this.particlePool[i];
            if (p.active) {
                p.x += p.vx * (dt / 16.67);
                p.y += p.vy * (dt / 16.67);
                p.life -= dt;
                if (p.life <= 0) {
                    p.active = false;
                }
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
                        
                        // Record correct tone match
                        window.progressIntegrator?.recordWordStudy({
                            character: inv.char,
                            pinyin: inv.pinyin,
                            isCorrect: true,
                            hskLevel: 1,
                            responseTime: 2000
                        });
                        
                        // Explosion sound
                        this.playSynthesizerSound(120, 'noise', 0.2, 0.25);
                    } else {
                        // Wrong tone -> laser simply passes through or vanishes
                        this.lasers.splice(l, 1);
                        this.playSynthesizerSound(150, 'sawtooth', 0.05, 0.15); // buzzer noise
                        
                        // Record incorrect tone match
                        window.progressIntegrator?.recordWordStudy({
                            character: inv.char,
                            pinyin: inv.pinyin,
                            isCorrect: false,
                            hskLevel: 1,
                            responseTime: 2000
                        });
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
        
        const x = 50 + Math.random() * (this.logicalWidth - 100);
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
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
        
        // Draw space stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
            const starX = (Math.sin(i * 123.4) * 0.5 + 0.5) * this.logicalWidth;
            const starY = ((performance.now() * 0.02 + i * 20) % this.logicalHeight);
            this.ctx.fillRect(starX, starY, 2, 2);
        }
        
        // Draw launcher / spaceship
        const shipX = this.playerX;
        const shipY = this.playerY;
        
        // 1. Draw Thruster Flames (pulsing/animating behind the ship)
        const flamePulse = 8 + Math.sin(performance.now() * 0.04) * 3;
        
        // Left Engine Flame
        const leftFlameGrad = this.ctx.createRadialGradient(shipX - 8, shipY + 12, 1, shipX - 8, shipY + 12 + flamePulse, flamePulse);
        leftFlameGrad.addColorStop(0, '#38bdf8'); // Cyan core
        leftFlameGrad.addColorStop(0.4, '#4f46e5'); // Purple middle
        leftFlameGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        this.ctx.fillStyle = leftFlameGrad;
        this.ctx.beginPath();
        this.ctx.arc(shipX - 8, shipY + 12, flamePulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right Engine Flame
        const rightFlameGrad = this.ctx.createRadialGradient(shipX + 8, shipY + 12, 1, shipX + 8, shipY + 12 + flamePulse, flamePulse);
        rightFlameGrad.addColorStop(0, '#38bdf8');
        rightFlameGrad.addColorStop(0.4, '#4f46e5');
        rightFlameGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        this.ctx.fillStyle = rightFlameGrad;
        this.ctx.beginPath();
        this.ctx.arc(shipX + 8, shipY + 12, flamePulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 2. Draw Swept Wings
        const wingGrad = this.ctx.createLinearGradient(shipX - 22, shipY, shipX + 22, shipY);
        wingGrad.addColorStop(0, '#06b6d4'); // Cyan wingtips
        wingGrad.addColorStop(0.3, '#3b82f6'); // Blue
        wingGrad.addColorStop(0.5, '#6366f1'); // Indigo middle
        wingGrad.addColorStop(0.7, '#3b82f6');
        wingGrad.addColorStop(1, '#06b6d4');
        
        this.ctx.fillStyle = wingGrad;
        this.ctx.beginPath();
        // Left wing
        this.ctx.moveTo(shipX - 6, shipY - 2);
        this.ctx.lineTo(shipX - 22, shipY + 12);
        this.ctx.lineTo(shipX - 18, shipY + 15);
        this.ctx.lineTo(shipX - 6, shipY + 8);
        // Right wing
        this.ctx.lineTo(shipX + 6, shipY + 8);
        this.ctx.lineTo(shipX + 18, shipY + 15);
        this.ctx.lineTo(shipX + 22, shipY + 12);
        this.ctx.lineTo(shipX + 6, shipY - 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 3. Draw Wingtip Cannons
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#06b6d4';
        // Left cannon
        this.ctx.fillRect(shipX - 23, shipY + 2, 2, 10);
        // Right cannon
        this.ctx.fillRect(shipX + 21, shipY + 2, 2, 10);
        this.ctx.shadowBlur = 0;
        
        // 4. Draw Main Fuselage (Metallic Body)
        const bodyGrad = this.ctx.createLinearGradient(shipX, shipY - 22, shipX, shipY + 12);
        bodyGrad.addColorStop(0, '#c7d2fe'); // Indigo-200 (nose tip highlight)
        bodyGrad.addColorStop(0.4, '#6366f1'); // Indigo-500
        bodyGrad.addColorStop(1, '#1e1b4b'); // Indigo-950
        
        this.ctx.fillStyle = bodyGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(shipX, shipY - 22); // Sharp nose
        this.ctx.lineTo(shipX + 6, shipY - 5);
        this.ctx.lineTo(shipX + 6, shipY + 12);
        this.ctx.lineTo(shipX - 6, shipY + 12);
        this.ctx.lineTo(shipX - 6, shipY - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 5. Draw Glowing Energy Reactor Core (changes color to match the last fired tone!)
        const activeTone = this.lastFiredTone || 5;
        const coreColor = this.toneColors[activeTone] || '#06b6d4';
        
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = coreColor;
        this.ctx.fillStyle = coreColor;
        this.ctx.beginPath();
        this.ctx.arc(shipX, shipY + 4, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Inner white-hot plasma core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(shipX, shipY + 4, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 6. Draw Glass Cockpit Canopy
        const canopyGrad = this.ctx.createLinearGradient(shipX, shipY - 12, shipX, shipY - 2);
        canopyGrad.addColorStop(0, '#e0f2fe'); // Ice blue
        canopyGrad.addColorStop(1, '#0284c7'); // Sky blue
        
        this.ctx.fillStyle = canopyGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(shipX, shipY - 7, 3.5, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sleek cyan highlight outline around the body
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        this.ctx.lineWidth = 1.5;
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
        this.ctx.shadowBlur = 0; // Ensure no shadow blur leaks to particles
        for (let i = 0; i < this.particlePool.length; i++) {
            const p = this.particlePool[i];
            if (p.active) {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
    }
    
    // Create explosion effect particles
    createExplosion(x, y, color) {
        let activatedCount = 0;
        for (let i = 0; i < this.particlePool.length; i++) {
            if (activatedCount >= 20) break;
            const p = this.particlePool[i];
            if (!p.active) {
                const angle = Math.random() * Math.PI * 2;
                const velocity = 1 + Math.random() * 4;
                p.x = x;
                p.y = y;
                p.vx = Math.cos(angle) * velocity;
                p.vy = Math.sin(angle) * velocity;
                p.size = 2 + Math.random() * 3;
                p.color = color;
                p.life = 300 + Math.random() * 400; // ms
                p.active = true;
                activatedCount++;
            }
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
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 36px "Inter", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const gameOverText = window.languageManager ? window.languageManager.t('tonesInvGameOver') : "FIN DEL JUEGO";
        const finalScoreLabel = window.languageManager ? window.languageManager.t('tonesInvFinalScore') : "Puntaje Final";
        this.ctx.fillText(gameOverText, this.logicalWidth / 2, this.logicalHeight / 2 - 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px "Inter", sans-serif';
        this.ctx.fillText(`${finalScoreLabel}: ${this.state.score}`, this.logicalWidth / 2, this.logicalHeight / 2 + 25);
        
        // Sound
        this.playSynthesizerSound(180, 'sawtooth', 0.3, 0.4);
        setTimeout(() => this.playSynthesizerSound(90, 'triangle', 0.4, 0.6), 250);
        
        // Save high score and report progress
        if (window.app && window.app.stats) {
            const prevHigh = window.app.stats.tonesInvadersHighScore || 0;
            if (this.state.score > prevHigh) {
                window.app.stats.tonesInvadersHighScore = this.state.score;
            }
            window.app.saveStats();
        }
        
        // Fire game result event for dashboard integration
        document.dispatchEvent(new CustomEvent('hsk:game-result', {
            detail: { game: 'tones-invaders', score: this.state.score }
        }));
    }
    
    // Retro synthesizer helper using Web Audio API
    playSynthesizerSound(frequency, type = 'sawtooth', volume = 0.1, duration = 0.15) {
        if (window.gameAudioManager) {
            if (type === 'noise') {
                window.gameAudioManager.playNoise(frequency, volume, duration);
            } else {
                window.gameAudioManager.playSynth(frequency, type, volume, duration);
            }
            return;
        }
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
