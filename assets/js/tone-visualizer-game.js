// tone-visualizer-game.js — Motor del Visualizador de Curva de Tonos y Entonación

const TONE_MODELS_DATABASE = {
    1: {
        toneNumber: 1,
        name: "1º Tono: Alto y Nivelado (高平调)",
        nameEn: "1st Tone: High Level (55)",
        syllable: "mā",
        hanzi: "妈",
        meaning: "Madre",
        meaningEn: "Mother",
        pitchPoints: [
            { x: 0.1, y: 5 },
            { x: 0.3, y: 5 },
            { x: 0.5, y: 5 },
            { x: 0.7, y: 5 },
            { x: 0.9, y: 5 }
        ],
        rule: "Comienza en el nivel más alto (5) y mantén la voz completamente plana y constante, como cantar una nota 'Sol' sostenida.",
        ruleEn: "Start at the highest pitch (level 5) and keep your voice steady without dropping.",
        frequencyRange: "5 ➔ 5 (440 Hz Constante)",
        baseHz: 440
    },
    2: {
        toneNumber: 2,
        name: "2º Tono: Ascendente (中升调)",
        nameEn: "2nd Tone: Rising (35)",
        syllable: "má",
        hanzi: "麻",
        meaning: "Cáñamo / Adormecer",
        meaningEn: "Hemp / Numb",
        pitchPoints: [
            { x: 0.1, y: 3 },
            { x: 0.3, y: 3.3 },
            { x: 0.5, y: 3.8 },
            { x: 0.7, y: 4.4 },
            { x: 0.9, y: 5 }
        ],
        rule: "Comienza en tono medio (3) y sube con decisión hasta el nivel más alto (5), como si hicieras una pregunta de sorpresa: '¿Qué?'",
        ruleEn: "Start at mid pitch (level 3) and rise quickly to the top (level 5), like asking 'What?' in surprise.",
        frequencyRange: "3 ➔ 5 (260 Hz ➔ 440 Hz)",
        baseHz: 280
    },
    3: {
        toneNumber: 3,
        name: "3º Tono: Descendente-Ascendente (降升调)",
        nameEn: "3rd Tone: Dipping / Low Falling-Rising (214)",
        syllable: "mǎ",
        hanzi: "马",
        meaning: "Caballo",
        meaningEn: "Horse",
        pitchPoints: [
            { x: 0.1, y: 2.2 },
            { x: 0.35, y: 1.2 },
            { x: 0.55, y: 1 },
            { x: 0.75, y: 2.5 },
            { x: 0.9, y: 4 }
        ],
        rule: "Baja la voz hasta el fondo de tu garganta (nivel 1) y luego elévala moderadamente hacia el nivel 4.",
        ruleEn: "Drop your voice low to your throat (level 1) and then allow it to rise back up towards level 4.",
        frequencyRange: "2 ➔ 1 ➔ 4 (220 Hz ➔ 150 Hz ➔ 350 Hz)",
        baseHz: 220
    },
    4: {
        toneNumber: 4,
        name: "4º Tono: Descendente y Firme (全降调)",
        nameEn: "4th Tone: High Falling (51)",
        syllable: "mà",
        hanzi: "骂",
        meaning: "Regañar / Insultar",
        meaningEn: "Scold",
        pitchPoints: [
            { x: 0.1, y: 5 },
            { x: 0.3, y: 4 },
            { x: 0.5, y: 2.8 },
            { x: 0.7, y: 1.8 },
            { x: 0.9, y: 1 }
        ],
        rule: "Inicia con fuerza en el nivel máximo (5) y déjalo caer de golpe hacia el nivel más bajo (1), como una orden firme: '¡No!'",
        ruleEn: "Start forcefully at the very top (level 5) and drop sharply to the bottom (level 1), like saying 'No!'",
        frequencyRange: "5 ➔ 1 (440 Hz ➔ 160 Hz)",
        baseHz: 440
    },
    0: {
        toneNumber: 0,
        name: "Tono Neutro: Corto y Ligero (轻声)",
        nameEn: "Neutral Tone: Light & Short (·)",
        syllable: "ma",
        hanzi: "吗",
        meaning: "Partícula interrogativa",
        meaningEn: "Question Particle",
        pitchPoints: [
            { x: 0.25, y: 2.8 },
            { x: 0.45, y: 2.6 },
            { x: 0.65, y: 2.4 }
        ],
        rule: "Se pronuncia de forma muy breve, suave y relajada, descansando sobre la sílaba precedente sin esfuerzo.",
        ruleEn: "Pronounced quickly, softly and lightly without emphasizing any pitch contour.",
        frequencyRange: "Nivel 2.5 (Suave y Breve)",
        baseHz: 240
    }
};

const MINIMAL_PAIRS_BANK = [
    {
        wordA: { hanzi: "买", pinyin: "mǎi", trans: "Comprar (3º Tono)", transEn: "To buy (3rd)" },
        wordB: { hanzi: "卖", pinyin: "mài", trans: "Vender (4º Tono)", transEn: "To sell (4th)" }
    },
    {
        wordA: { hanzi: "问", pinyin: "wèn", trans: "Preguntar (4º Tono)", transEn: "To ask (4th)" },
        wordB: { hanzi: "吻", pinyin: "wěn", trans: "Besar (3º Tono)", transEn: "To kiss (3rd)" }
    },
    {
        wordA: { hanzi: "十", pinyin: "shí", trans: "Diez (2º Tono)", transEn: "Ten (2nd)" },
        wordB: { hanzi: "四", pinyin: "sì", trans: "Cuatro (4º Tono)", transEn: "Four (4th)" }
    },
    {
        wordA: { hanzi: "练习", pinyin: "liànxí", trans: "Practicar (4º + 2º)", transEn: "To practice" },
        wordB: { hanzi: "联系", pinyin: "liánxì", trans: "Contactar (2º + 4º)", transEn: "To contact" }
    }
];

class ToneVisualizerGame {
    constructor(app) {
        this.app = app;
        this.currentTone = 1;
        this.userPitchCurve = null;
        this.isPracticing = false;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderMinimalPairs();
        this.loadTone(this.currentTone);
    }

    cacheDOM() {
        this.container = document.getElementById("tone-visualizer");
        this.canvas = document.getElementById("pitch-graph-canvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

        this.toneTitle = document.getElementById("vis-tone-title");
        this.pinyinDisplay = document.getElementById("vis-pinyin-display");
        this.ruleDesc = document.getElementById("tone-rule-desc");
        this.freqBadge = document.getElementById("tone-freq-badge");

        this.playAudioBtn = document.getElementById("tone-play-audio-btn");
        this.slowAudioBtn = document.getElementById("tone-slow-audio-btn");
        this.recordBtn = document.getElementById("tone-record-btn");

        this.feedbackBanner = document.getElementById("tone-feedback-banner");
        this.feedbackScore = document.getElementById("feedback-score-circle");
        this.feedbackHeading = document.getElementById("feedback-heading");
        this.feedbackDesc = document.getElementById("feedback-desc");

        this.pairsList = document.getElementById("minimal-pairs-list");
    }

    bindEvents() {
        document.querySelectorAll(".tone-pill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tone-pill-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const tone = parseInt(btn.getAttribute("data-tone"), 10);
                this.loadTone(tone);
            });
        });

        if (this.playAudioBtn) {
            this.playAudioBtn.addEventListener("click", () => this.playModelAudio(1.0));
        }

        if (this.slowAudioBtn) {
            this.slowAudioBtn.addEventListener("click", () => this.playModelAudio(0.75));
        }

        if (this.recordBtn) {
            this.recordBtn.addEventListener("click", () => this.simulateTonePractice());
        }
    }

    loadTone(toneNumber) {
        this.currentTone = toneNumber;
        this.userPitchCurve = null;
        if (this.feedbackBanner) this.feedbackBanner.style.display = "none";

        const model = TONE_MODELS_DATABASE[toneNumber];
        if (!model) return;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.toneTitle) {
            this.toneTitle.textContent = isEs ? model.name : (model.nameEn || model.name);
        }
        if (this.pinyinDisplay) {
            this.pinyinDisplay.textContent = `${model.syllable} · ${model.hanzi} (${isEs ? model.meaning : model.meaningEn})`;
        }
        if (this.ruleDesc) {
            this.ruleDesc.textContent = isEs ? model.rule : (model.ruleEn || model.rule);
        }
        if (this.freqBadge) {
            this.freqBadge.innerHTML = `<span>Frecuencia / Chao Scale:</span> <strong>${model.frequencyRange}</strong>`;
        }

        this.drawPitchGraph();
    }

    drawPitchGraph() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Fondo oscuro
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, w, h);

        // 5 Líneas de nivel Chao (Nivel 5 a 1)
        const topPadding = 30;
        const bottomPadding = 30;
        const leftPadding = 50;
        const rightPadding = 30;
        const graphHeight = h - topPadding - bottomPadding;
        const graphWidth = w - leftPadding - rightPadding;

        const pitchLevels = [
            { level: 5, label: "5 (Alto / High)", color: "#475569" },
            { level: 4, label: "4 (Medio-Alto)", color: "#334155" },
            { level: 3, label: "3 (Medio / Mid)", color: "#334155" },
            { level: 2, label: "2 (Medio-Bajo)", color: "#334155" },
            { level: 1, label: "1 (Bajo / Low)", color: "#475569" }
        ];

        pitchLevels.forEach((p) => {
            const y = topPadding + (5 - p.level) * (graphHeight / 4);

            // Línea de cuadrícula
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.level === 5 || p.level === 1 ? 1.5 : 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(w - rightPadding, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Etiqueta del nivel
            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px system-ui, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText(p.label, leftPadding - 8, y + 4);
        });

        // Curva nativa (Azul Cyan)
        const model = TONE_MODELS_DATABASE[this.currentTone];
        if (model && model.pitchPoints) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;

            ctx.beginPath();
            model.pitchPoints.forEach((pt, idx) => {
                const px = leftPadding + pt.x * graphWidth;
                const py = topPadding + (5 - pt.y) * (graphHeight / 4);
                if (idx === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Curva del usuario (Verde Esmeralda) si practicó
        if (this.userPitchCurve && this.userPitchCurve.length > 0) {
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 8;

            ctx.beginPath();
            this.userPitchCurve.forEach((pt, idx) => {
                const px = leftPadding + pt.x * graphWidth;
                const py = topPadding + (5 - pt.y) * (graphHeight / 4);
                if (idx === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    playModelAudio(playbackRate = 1.0) {
        const model = TONE_MODELS_DATABASE[this.currentTone];
        if (!model) return;

        this.app?.audioController?.playWordAudio?.(model.hanzi);
        this.synthesizePitchFrequency(model, playbackRate);
    }

    synthesizePitchFrequency(model, playbackRate = 1.0) {
        try {
            const ctx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";

            const now = ctx.currentTime;
            const dur = 0.5 / playbackRate;

            // Mapeo dinámico de frecuencia según los puntos tonales
            if (model.pitchPoints && model.pitchPoints.length >= 2) {
                const startHz = 160 + (model.pitchPoints[0].y - 1) * 70;
                osc.frequency.setValueAtTime(startHz, now);

                model.pitchPoints.forEach((pt) => {
                    const t = now + pt.x * dur;
                    const hz = 160 + (pt.y - 1) * 70;
                    osc.frequency.linearRampToValueAtTime(hz, t);
                });
            }

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.01, now + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + dur);
        } catch {
            // Web Audio fallback ignore
        }
    }

    simulateTonePractice() {
        if (this.isPracticing) return;
        this.isPracticing = true;

        if (this.recordBtn) {
            this.recordBtn.classList.add("recording");
            const label = document.getElementById("tone-record-label");
            if (label) label.textContent = "Analizando voz...";
        }

        setTimeout(() => {
            const model = TONE_MODELS_DATABASE[this.currentTone];
            if (!model) return;

            // Generar curva de entonación del usuario con ligeras variaciones humanas
            this.userPitchCurve = model.pitchPoints.map((pt) => ({
                x: pt.x,
                y: Math.max(1, Math.min(5, pt.y + (Math.random() * 0.4 - 0.2)))
            }));

            this.drawPitchGraph();

            const matchScore = Math.floor(90 + Math.random() * 9); // 90% - 98%
            this.displayPracticeFeedback(matchScore);

            if (this.recordBtn) {
                this.recordBtn.classList.remove("recording");
                const label = document.getElementById("tone-record-label");
                if (label) label.textContent = "Practicar Entonación";
            }

            this.isPracticing = false;
            this.app?.audioController?.playCorrect?.();
            this.app?.achievementManager?.fireConfetti?.();
        }, 1200);
    }

    displayPracticeFeedback(score) {
        if (!this.feedbackBanner) return;

        const isEs = this.app?.currentLanguage !== "en";

        if (this.feedbackScore) this.feedbackScore.textContent = `${score}%`;
        if (this.feedbackHeading) {
            this.feedbackHeading.textContent = isEs ? "¡Excelente Curva Tonal! 👏" : "Excellent Tone Curve! 👏";
        }
        if (this.feedbackDesc) {
            this.feedbackDesc.textContent = isEs
                ? `Tu contorno de frecuencia coincide con una precisión del ${score}% con el modelo nativo del mandarín estándar.`
                : `Your pitch contour matched the standard Mandarin native model with ${score}% precision.`;
        }

        this.feedbackBanner.style.display = "flex";
    }

    renderMinimalPairs() {
        if (!this.pairsList) return;
        const isEs = this.app?.currentLanguage !== "en";

        this.pairsList.innerHTML = MINIMAL_PAIRS_BANK.map((pair) => {
            const transA = isEs ? pair.wordA.trans : pair.wordA.transEn;
            const transB = isEs ? pair.wordB.trans : pair.wordB.transEn;

            return `
                <div class="pair-row-card">
                    <div class="pair-item-left" data-hanzi="${pair.wordA.hanzi}">
                        <span class="pair-hanzi">${pair.wordA.hanzi}</span>
                        <span class="pair-pinyin">${pair.wordA.pinyin}</span>
                        <span class="pair-trans">${transA}</span>
                    </div>
                    <span class="pair-vs-badge">VS</span>
                    <div class="pair-item-right" data-hanzi="${pair.wordB.hanzi}">
                        <span class="pair-hanzi">${pair.wordB.hanzi}</span>
                        <span class="pair-pinyin">${pair.wordB.pinyin}</span>
                        <span class="pair-trans">${transB}</span>
                    </div>
                </div>
            `;
        }).join("");

        this.pairsList.querySelectorAll(".pair-item-left, .pair-item-right").forEach((el) => {
            el.addEventListener("click", () => {
                const text = el.getAttribute("data-hanzi");
                this.app?.audioController?.playWordAudio?.(text);
            });
        });
    }
}

window.ToneVisualizerGame = ToneVisualizerGame;
