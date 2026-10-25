/**
 * Hanzi Builder – Radical assembly and character structure game
 */
class HanziBuilderGame {
    constructor(app) {
        this.app = app;
        
        // Game configuration
        this.baseTimeLimit = 60; // seconds
        this.activeLevel = "all";
        
        // Decompositions database for HSK words
        this.decompositions = {
            "好": { parts: ["女", "子"], pinyin: "hǎo", translation: "bueno" },
            "你": { parts: ["亻", "尔"], pinyin: "nǐ", translation: "tú" },
            "他": { parts: ["亻", "也"], pinyin: "tā", translation: "él" },
            "她": { parts: ["女", "也"], pinyin: "tā", translation: "ella" },
            "明": { parts: ["日", "月"], pinyin: "míng", translation: "brillante / mañana" },
            "男": { parts: ["田", "力"], pinyin: "nán", translation: "hombre / masculino" },
            "家": { parts: ["宀", "豕"], pinyin: "jiā", translation: "casa / familia" },
            "吗": { parts: ["口", "马"], pinyin: "ma", translation: "partícula interrogativa" },
            "吧": { parts: ["口", "巴"], pinyin: "ba", translation: "partícula de sugerencia" },
            "爸": { parts: ["父", "巴"], pinyin: "bà", translation: "papá" },
            "妈": { parts: ["女", "马"], pinyin: "mā", translation: "mamá" },
            "看": { parts: ["手", "目"], pinyin: "kàn", translation: "mirar / ver" },
            "休": { parts: ["亻", "木"], pinyin: "xiū", translation: "descansar" },
            "森": { parts: ["木", "木", "木"], pinyin: "sēn", translation: "bosque" },
            "林": { parts: ["木", "木"], pinyin: "lín", translation: "arboleda / bosque" },
            "唱": { parts: ["口", "昌"], pinyin: "chàng", translation: "cantar" },
            "早": { parts: ["日", "十"], pinyin: "zǎo", translation: "temprano" },
            "星": { parts: ["日", "生"], pinyin: "xīng", translation: "estrella" },
            "时": { parts: ["日", "寸"], pinyin: "shí", translation: "tiempo / hora" },
            "问": { parts: ["门", "口"], pinyin: "wèn", translation: "preguntar" },
            "间": { parts: ["门", "日"], pinyin: "jiān", translation: "entre / habitación" },
            "尖": { parts: ["小", "大"], pinyin: "jiān", translation: "puntiagudo / afilado" },
            "卡": { parts: ["上", "下"], pinyin: "kǎ", translation: "tarjeta" },
            "国": { parts: ["囗", "玉"], pinyin: "guó", translation: "país / nación" },
            "因": { parts: ["囗", "大"], pinyin: "yīn", translation: "causa / debido a" },
            "回": { parts: ["囗", "口"], pinyin: "huí", translation: "volver / regresar" },
            "园": { parts: ["囗", "元"], pinyin: "yuán", translation: "jardín" },
            "字": { parts: ["宀", "子"], pinyin: "zì", translation: "carácter / letra" },
            "安": { parts: ["宀", "女"], pinyin: "ān", translation: "paz / seguro" },
            "客": { parts: ["宀", "各"], pinyin: "kè", translation: "invitado / cliente" },
            "话": { parts: ["讠", "舌"], pinyin: "huà", translation: "habla / palabra" },
            "语": { parts: ["讠", "吾"], pinyin: "yǔ", translation: "lenguaje / idioma" },
            "说": { parts: ["讠", "兑"], pinyin: "shuō", translation: "hablar / decir" },
            "识": { parts: ["讠", "只"], pinyin: "shí", translation: "conocer / saber" },
            "什": { parts: ["亻", "十"], pinyin: "shén", translation: "qué" },
            "们": { parts: ["亻", "门"], pinyin: "men", translation: "sufijo plural" },
            "位": { parts: ["亻", "立"], pinyin: "wèi", translation: "clasificador de personas" },
            "信": { parts: ["亻", "言"], pinyin: "xìn", translation: "carta / creer" },
            "化": { parts: ["亻", "匕"], pinyin: "huà", translation: "cambiar / derretir" },
            "朋": { parts: ["月", "月"], pinyin: "péng", translation: "amigo" },
            "友": { parts: ["𠂇", "又"], pinyin: "yǒu", translation: "amistad" },
            "会": { parts: ["人", "云"], pinyin: "huì", translation: "saber / reunión" },
            "姐": { parts: ["女", "且"], pinyin: "jiě", translation: "hermana mayor" },
            "妹": { parts: ["女", "未"], pinyin: "mèi", translation: "hermana menor" },
            "哥": { parts: ["可", "可"], pinyin: "gē", translation: "hermano mayor" },
            "饭": { parts: ["饣", "反"], pinyin: "fàn", translation: "comida / arroz" },
            "饮": { parts: ["饣", "欠"], pinyin: "yǐn", translation: "beber / bebida" },
            "玩": { parts: ["王", "元"], pinyin: "wán", translation: "jugar" },
            "跑": { parts: ["𧾷", "包"], pinyin: "pǎo", translation: "correr" },
            "跳": { parts: ["𧾷", "兆"], pinyin: "tiào", translation: "saltar" },
            "喝": { parts: ["口", "曷"], pinyin: "hē", translation: "beber" },
            "打": { parts: ["扌", "丁"], pinyin: "dǎ", translation: "golpear / jugar" },
            "找": { parts: ["扌", "戈"], pinyin: "zhǎo", translation: "buscar" },
            "海": { parts: ["氵", "每"], pinyin: "hǎi", translation: "mar" },
            "江": { parts: ["氵", "工"], pinyin: "jiāng", translation: "río" },
            "河": { parts: ["氵", "可"], pinyin: "hé", translation: "río" },
            "洗": { parts: ["氵", "先"], pinyin: "xǐ", translation: "lavar" },
            "吃": { parts: ["口", "乞"], pinyin: "chī", translation: "comer" },
            "叫": { parts: ["口", "丩"], pinyin: "jiào", translation: "llamarse / gritar" },
            "听": { parts: ["口", "斤"], pinyin: "tīng", translation: "escuchar / oír" },
            "吹": { parts: ["口", "欠"], pinyin: "chuī", translation: "soplar" },
            "响": { parts: ["口", "向"], pinyin: "xiǎng", translation: "sonar / ruidoso" },
            "吵": { parts: ["口", "少"], pinyin: "chǎo", translation: "ruidoso / discutir" },
            "住": { parts: ["亻", "主"], pinyin: "zhù", translation: "vivir / residir" },
            "做": { parts: ["亻", "故"], pinyin: "zuò", translation: "hacer" },
            "件": { parts: ["亻", "牛"], pinyin: "jiàn", translation: "pieza / clasificador" },
            "借": { parts: ["亻", "昔"], pinyin: "jiè", translation: "prestar / pedir prestado" },
            "像": { parts: ["亻", "象"], pinyin: "xiàng", translation: "parecerse" },
            "读": { parts: ["讠", "卖"], pinyin: "dú", translation: "leer" },
            "请": { parts: ["讠", "青"], pinyin: "qǐng", translation: "por favor / invitar" },
            "认": { parts: ["讠", "人"], pinyin: "rèn", translation: "reconocer / conocer" },
            "课": { parts: ["讠", "果"], pinyin: "kè", translation: "lección / clase" },
            "谁": { parts: ["讠", "隹"], pinyin: "shuí", translation: "quién" },
            "晴": { parts: ["日", "青"], pinyin: "qíng", translation: "soleado / despejado" },
            "昨": { parts: ["日", "乍"], pinyin: "zuó", translation: "ayer" },
            "晚": { parts: ["日", "免"], pinyin: "wǎn", translation: "tarde / noche" },
            "清": { parts: ["氵", "青"], pinyin: "qīng", translation: "claro / puro" },
            "汉": { parts: ["氵", "又"], pinyin: "hàn", translation: "chino / lengua Han" },
            "冷": { parts: ["冫", "令"], pinyin: "lěng", translation: "frío" },
            "冰": { parts: ["冫", "水"], pinyin: "bīng", translation: "hielo" },
            "次": { parts: ["冫", "欠"], pinyin: "cì", translation: "vez / número de veces" },
            "准": { parts: ["冫", "隹"], pinyin: "zhǔn", translation: "exacto / preparar" },
            "姓": { parts: ["女", "生"], pinyin: "xìng", translation: "apellido" },
            "始": { parts: ["女", "台"], pinyin: "shǐ", translation: "comenzar / principio" },
            "奶": { parts: ["女", "乃"], pinyin: "nǎi", translation: "leche / abuela" },
            "快": { parts: ["忄", "夬"], pinyin: "kuài", translation: "rápido / alegre" },
            "慢": { parts: ["忄", "曼"], pinyin: "màn", translation: "lento" },
            "忙": { parts: ["忄", "亡"], pinyin: "máng", translation: "ocupado" },
            "懂": { parts: ["忄", "董"], pinyin: "dǒng", translation: "entender / comprender" },
            "想": { parts: ["相", "心"], pinyin: "xiǎng", translation: "pensar / extrañar" },
            "忘": { parts: ["亡", "心"], pinyin: "wàng", translation: "olvidar" },
            "您": { parts: ["你", "心"], pinyin: "nín", translation: "usted (cortés)" },
            "意": { parts: ["音", "心"], pinyin: "yì", translation: "significado / intención" },
            "现": { parts: ["王", "见"], pinyin: "xiàn", translation: "aparecer / presente" },
            "理": { parts: ["王", "里"], pinyin: "lǐ", translation: "razón / lógica" },
            "球": { parts: ["王", "求"], pinyin: "qiú", translation: "pelota / esfera" },
            "钱": { parts: ["钅", "戋"], pinyin: "qián", translation: "dinero" },
            "错": { parts: ["钅", "昔"], pinyin: "cuò", translation: "error / equivocado" },
            "钟": { parts: ["钅", "中"], pinyin: "zhōng", translation: "reloj / campana" },
            "铁": { parts: ["钅", "失"], pinyin: "tiě", translation: "hierro" },
            "饱": { parts: ["饣", "包"], pinyin: "bǎo", translation: "saciado / lleno" },
            "馆": { parts: ["饣", "官"], pinyin: "guǎn", translation: "edificio / restaurante" },
            "饿": { parts: ["饣", "我"], pinyin: "è", translation: "hambriento" },
            "笑": { parts: ["竹", "夭"], pinyin: "xiào", translation: "reír / sonreír" },
            "笔": { parts: ["竹", "毛"], pinyin: "bǐ", translation: "bolígrafo / pluma" }
        };
        
        // Decoy components pool to spice up the game
        this.decoys = [
            "木", "口", "讠", "亻", "女", "宀", "日", "门", "囗", "子", "也", "马", "目", "力",
            "田", "十", "寸", "大", "小", "父", "月", "云", "且", "未", "可", "饣", "王", "元",
            "𧾷", "扌", "氵", "先", "每", "青", "心", "忄", "钅", "冫", "竹", "欠", "亡", "生"
        ];
        
        // State
        this.state = this.getInitialState();
        
        this.timerIntervalId = null;
        this.isInitialized = false;
    }

    getAllComponentsPool() {
        const partsSet = new Set(this.decoys || []);
        if (this.decompositions) {
            for (const item of Object.values(this.decompositions)) {
                if (Array.isArray(item.parts)) {
                    item.parts.forEach(p => partsSet.add(p));
                }
            }
        }
        return Array.from(partsSet);
    }
    
    getInitialState() {
        return {
            isPlaying: false,
            isPaused: false,
            score: 0,
            timeLeft: this.baseTimeLimit,
            currentWord: null,
            assembledParts: [],
            gameWords: []
        };
    }
    
    // Initialize DOM binds
    initialize() {
        if (this.isInitialized) return;
        
        // Start Game button
        const startBtn = document.getElementById('hanzi-build-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // Pause Button
        const pauseBtn = document.getElementById('hanzi-build-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Quit Button
        const quitBtn = document.getElementById('hanzi-build-quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }
        
        this.isInitialized = true;
    }
    
    // Start the game
    startGame() {
        this.initialize();
        
        const levelSelect = document.getElementById('hanzi-build-level');
        this.activeLevel = levelSelect ? levelSelect.value : "all";
        
        this.state = this.getInitialState();
        this.state.isPlaying = true;
        
        // Build words list
        const appWords = this.app?.vocabulary || window.app?.vocabulary || [];
        const matchingWords = [];
        
        // Filter from database what matches level
        for (const [char, info] of Object.entries(this.decompositions)) {
            // Find word in app vocabulary if possible to check HSK level
            const vocabularyMatch = appWords.find(w => w.character === char);
            const level = vocabularyMatch ? parseInt(vocabularyMatch.level) : 1;
            
            if (this.activeLevel === "all" || parseInt(this.activeLevel) === level) {
                matchingWords.push({
                    character: char,
                    parts: info.parts,
                    pinyin: info.pinyin,
                    translation: info.translation,
                    level: level
                });
            }
        }
        
        // Safeguard if list is empty
        if (matchingWords.length === 0) {
            for (const [char, info] of Object.entries(this.decompositions)) {
                matchingWords.push({
                    character: char,
                    parts: info.parts,
                    pinyin: info.pinyin,
                    translation: info.translation,
                    level: 1
                });
            }
        }
        
        // Shuffle words
        this.state.gameWords = this.shuffleArray(matchingWords);
        
        // Switch screens
        document.getElementById('hanzi-build-setup').style.display = 'none';
        document.getElementById('hanzi-build-game-area').style.display = 'flex';
        
        // Start countdown timer
        this.startTimer();
        
        // Load first word
        this.loadNextWord();
        
        // Synth start sound
        this.playSynth(200, 'triangle', 0.2, 0.15);
        setTimeout(() => this.playSynth(400, 'triangle', 0.15, 0.2), 150);
    }
    
    // Handle timer loop
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
    
    // Pause / Resume toggle
    togglePause() {
        if (!this.state.isPlaying) return;
        
        this.state.isPaused = !this.state.isPaused;
        const pauseBtn = document.getElementById('hanzi-build-pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.state.isPaused
                ? (window.languageManager ? window.languageManager.t('hanziBuildResumeBtn') : "Reanudar")
                : (window.languageManager ? window.languageManager.t('hanziBuildPauseBtn') : "Pausar");
        }
    }
    
    // Quit Game back to setup
    quitGame() {
        this.state.isPlaying = false;
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        
        document.getElementById('hanzi-build-setup').style.display = 'block';
        document.getElementById('hanzi-build-game-area').style.display = 'none';
    }
    
    // Load next puzzle word
    loadNextWord() {
        if (this.state.gameWords.length === 0) {
            this.endGame();
            return;
        }
        
        this.state.currentWord = this.state.gameWords.pop();
        this.state.assembledParts = [];
        
        // Render slots
        const assemblyZone = document.getElementById('hanzi-build-slots');
        assemblyZone.innerHTML = '';
        
        this.state.currentWord.parts.forEach((_, idx) => {
            const slot = document.createElement('div');
            slot.className = 'hanzi-build-slot';
            slot.setAttribute('data-slot-idx', idx);
            slot.title = 'Haz clic para retirar';
            slot.addEventListener('click', () => this.onSlotClick(idx));
            assemblyZone.appendChild(slot);
        });
        
        // Render targets
        document.getElementById('hanzi-build-translation').textContent = this.state.currentWord.translation;
        document.getElementById('hanzi-build-pinyin').textContent = this.state.currentWord.pinyin;
        
        // Prepare palette parts
        const correctParts = this.state.currentWord.parts;
        let paletteOptions = [...correctParts];
        
        // Add decoys
        const allComponents = this.getAllComponentsPool();
        const shuffledDecoys = this.shuffleArray(allComponents).filter(d => !correctParts.includes(d));
        for (let i = 0; i < 4; i++) {
            if (shuffledDecoys[i]) {
                paletteOptions.push(shuffledDecoys[i]);
            }
        }
        
        // Shuffle palette
        paletteOptions = this.shuffleArray(paletteOptions);
        
        // Render palette
        const paletteContainer = document.getElementById('hanzi-build-palette-container');
        paletteContainer.innerHTML = '';
        
        paletteOptions.forEach(part => {
            const partEl = document.createElement('div');
            partEl.className = 'hanzi-build-part';
            partEl.textContent = part;
            
            partEl.addEventListener('click', () => this.onPartClick(part, partEl));
            paletteContainer.appendChild(partEl);
        });
        
        this.updateHUD();
    }

    // Handle clicking an assembled slot to undo/return component
    onSlotClick(slotIdx) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        if (this.state.assembledParts.length === 0) return;
        if (slotIdx !== this.state.assembledParts.length - 1) return;

        const removedPart = this.state.assembledParts.pop();
        if (!removedPart) return;

        const slots = document.querySelectorAll('.hanzi-build-slot');
        if (slots[slotIdx]) {
            slots[slotIdx].textContent = '';
            slots[slotIdx].classList.remove('filled');
        }

        const paletteParts = document.querySelectorAll('.hanzi-build-part.used');
        for (const p of paletteParts) {
            if (p.textContent === removedPart) {
                p.classList.remove('used');
                break;
            }
        }

        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(15);
        }
        this.playSynth(240, 'sine', 0.1, 0.08);
    }
    
    // Handle component selection clicks
    onPartClick(part, element) {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        const correctParts = this.state.currentWord.parts;
        const nextIndexNeeded = this.state.assembledParts.length;
        
        if (correctParts[nextIndexNeeded] === part) {
            // Correct component selected!
            this.state.assembledParts.push(part);
            element.classList.add('used');
            
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(15);
            }

            // Fill slots
            const slots = document.querySelectorAll('.hanzi-build-slot');
            if (slots[nextIndexNeeded]) {
                slots[nextIndexNeeded].textContent = part;
                slots[nextIndexNeeded].classList.add('filled');
            }
            
            // Sound feedback
            this.playSynth(350 + (nextIndexNeeded * 100), 'sine', 0.15, 0.1);
            
            // Check completed
            if (this.state.assembledParts.length === correctParts.length) {
                this.onWordCompleted();
            }
        } else {
            // Wrong component selected!
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
            this.playSynth(130, 'sawtooth', 0.2, 0.25); // buzzer noise
            
            // Flash red on target card
            const targetCard = document.getElementById('hanzi-build-target');
            targetCard.style.borderColor = '#ef4444';
            targetCard.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            
            setTimeout(() => {
                targetCard.style.borderColor = '';
                targetCard.style.backgroundColor = '';
            }, 300);
        }
    }
    
    // Character assembled successfully
    onWordCompleted() {
        // Neon Success Flash on Slots
        const targetCard = document.getElementById('hanzi-build-target');
        targetCard.classList.add('hanzi-build-success-anim');
        targetCard.style.borderColor = '#10b981';
        targetCard.style.backgroundColor = 'rgba(16, 185, 201, 0.05)';
        
        // Show built character
        const assemblyZone = document.getElementById('hanzi-build-slots');
        assemblyZone.innerHTML = `<span style="font-size: 3.5rem; font-weight: 700; color: #10b981; animation: word-link-pulse 0.4s;">${this.state.currentWord.character}</span>`;
        
        // Score points
        this.state.score += 20;
        
        // Pronounce completed character with SpeechSynthesis
        if (window.app && typeof window.app.playAudio === "function" && this.state.currentWord?.character) {
            window.app.playAudio(this.state.currentWord.character);
        }
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(35);
        }

        // Record word study progress
        window.progressIntegrator?.recordWordStudy({
            character: this.state.currentWord.character,
            pinyin: this.state.currentWord.pinyin,
            isCorrect: true,
            hskLevel: this.state.currentWord.level,
            responseTime: 3000
        });
        
        // Sound
        this.playSynth(523.25, 'sine', 0.2, 0.15); // C5 note
        setTimeout(() => this.playSynth(659.25, 'sine', 0.15, 0.25), 120); // E5 note
        
        // Wait a second then load next word
        setTimeout(() => {
            targetCard.classList.remove('hanzi-build-success-anim');
            targetCard.style.borderColor = '';
            targetCard.style.backgroundColor = '';
            
            this.loadNextWord();
        }, 1200);
    }
    
    // End game
    endGame() {
        this.state.isPlaying = false;
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        
        const assemblyZone = document.getElementById('hanzi-build-slots');
        const finishedText = window.languageManager ? window.languageManager.t('hanziBuildFinished') : "¡Tiempo Terminado!";
        const scoreText = window.languageManager ? window.languageManager.t('hanziBuildScoreText', { score: this.state.score }) : `Puntaje Final: <strong>${this.state.score}</strong> puntos`;
        assemblyZone.innerHTML = `
            <div style="padding: 1rem;">
                <h3 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 0.5rem;">${finishedText}</h3>
                <p style="font-size: 1.1rem;">${scoreText}</p>
            </div>
        `;
        
        // Sound
        this.playSynth(220, 'sawtooth', 0.2, 0.3);
        setTimeout(() => this.playSynth(110, 'triangle', 0.25, 0.45), 250);
        
        // Save high score and report progress
        const appRef = this.app || window.app;
        if (appRef && appRef.stats) {
            const prevHigh = appRef.stats.hanziBuilderHighScore || 0;
            if (this.state.score > prevHigh) {
                appRef.stats.hanziBuilderHighScore = this.state.score;
            }
            appRef.saveStats?.();
            appRef.achievementManager?.checkAchievements?.();
        }
        try {
            const localHs = parseInt(localStorage.getItem("hanziBuilderHighScore") || "0", 10);
            if (this.state.score > localHs) {
                localStorage.setItem("hanziBuilderHighScore", String(this.state.score));
            }
        } catch {
            // Ignore storage restrictions
        }
        
        // Fire game result event for dashboard integration
        document.dispatchEvent(new CustomEvent('hsk:game-result', {
            detail: { game: 'hanzi-builder', score: this.state.score }
        }));
    }
    
    // Update HTML elements
    updateHUD() {
        const scoreVal = document.getElementById('hanzi-build-score');
        const timerVal = document.getElementById('hanzi-build-timer');
        
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
    
    // Helper to shuffle arrays
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    // Retro synthesizer helper
    playSynth(frequency, type = 'sine', volume = 0.1, duration = 0.15) {
        if (window.gameAudioManager) {
            window.gameAudioManager.playSynth(frequency, type, volume, duration);
            return;
        }
        try {
            if (!this.audioCtx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.audioCtx = new AudioCtx();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const audioCtx = this.audioCtx;
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
        } catch {
            // Ignored browser context blocks
        }
    }
}

window.HanziBuilderGame = HanziBuilderGame;
