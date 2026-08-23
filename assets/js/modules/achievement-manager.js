/**
 * achievement-manager.js - Central Gamification & Trophy System (Achievements 2.0)
 * Evaluates progress across SRS, games, calligraphy, tone training, audio & culture.
 */
class AchievementManager {
    static get STORAGE_KEY() {
        return "hsk-achievements-v2";
    }

    constructor(app) {
        this.app = app;
        this.unlockedIds = this.loadUnlocked();
        this.confettiRunning = false;

        this.catalogue = [
            // --- ESTUDIO & SRS ---
            {
                id: "first_word",
                category: "study",
                tier: "bronze",
                points: 10,
                icon: "🌱",
                titleEs: "Primeros Pasos",
                titleEn: "First Steps",
                descEs: "Estudia tu primera palabra de vocabulario en el sistema.",
                descEn: "Study your first vocabulary word in the system.",
                target: 1,
                getProgress: (s) => s.totalStudied || 0,
            },
            {
                id: "vocab_50",
                category: "study",
                tier: "silver",
                points: 25,
                icon: "📚",
                titleEs: "Erudito en Marcha",
                titleEn: "Scholar on the Rise",
                descEs: "Alcanza 50 palabras estudiadas en repetición espaciada.",
                descEn: "Reach 50 words studied in spaced repetition.",
                target: 50,
                getProgress: (s) => s.totalStudied || 0,
            },
            {
                id: "vocab_200",
                category: "study",
                tier: "gold",
                points: 50,
                icon: "🎓",
                titleEs: "Maestro del Léxico",
                titleEn: "Lexicon Master",
                descEs: "Domina 200 palabras con el algoritmo SRS.",
                descEn: "Master 200 words with the SRS algorithm.",
                target: 200,
                getProgress: (s) => s.totalStudied || 0,
            },
            {
                id: "streak_7",
                category: "study",
                tier: "silver",
                points: 25,
                icon: "🔥",
                titleEs: "Llama Imparable",
                titleEn: "Unstoppable Flame",
                descEs: "Mantén una racha de estudio de 7 días consecutivos.",
                descEn: "Maintain a study streak of 7 consecutive days.",
                target: 7,
                getProgress: (s) => s.currentStreak || 0,
            },
            {
                id: "streak_30",
                category: "study",
                tier: "platinum",
                points: 100,
                icon: "⚡",
                titleEs: "Disciplina de Acero",
                titleEn: "Steel Discipline",
                descEs: "Alcanza una legendaria racha de 30 días de estudio.",
                descEn: "Reach a legendary 30-day study streak.",
                target: 30,
                getProgress: (s) => s.currentStreak || 0,
            },

            // --- ESCRITURA & CALIGRAFÍA ---
            {
                id: "canvas_draw_1",
                category: "writing",
                tier: "bronze",
                points: 10,
                icon: "🖌️",
                titleEs: "Trazador de Hanzi",
                titleEn: "Hanzi Inker",
                descEs: "Practica tu primer carácter en el Lienzo de Caligrafía.",
                descEn: "Practice your first character on the Hanzi Stroke Canvas.",
                target: 1,
                getProgress: (s) => s.strokesPracticed || (s.hanziDrawn ? 1 : 0),
            },
            {
                id: "canvas_draw_20",
                category: "writing",
                tier: "gold",
                points: 50,
                icon: "📜",
                titleEs: "Calígrafo Imperial",
                titleEn: "Imperial Calligrapher",
                descEs: "Completa 20 caracteres trazados en el lienzo 米字格.",
                descEn: "Complete 20 characters traced on the Mi Zi Ge canvas.",
                target: 20,
                getProgress: (s) => s.strokesPracticed || 0,
            },

            // --- AUDICIÓN & PRONUNCIACIÓN ---
            {
                id: "tone_trainer_master",
                category: "audio",
                tier: "silver",
                points: 25,
                icon: "🎧",
                titleEs: "Oído Absoluto",
                titleEn: "Absolute Pitch",
                descEs: "Acierta 10 ejercicios seguidos en el Entrenador de Tonos.",
                descEn: "Score 10 correct exercises in a row in Tone Ear Trainer.",
                target: 10,
                getProgress: (s) => s.toneStreak || 0,
            },
            {
                id: "speech_rec_success",
                category: "audio",
                tier: "silver",
                points: 25,
                icon: "🎙️",
                titleEs: "Voz de Pekín",
                titleEn: "Beijing Voice",
                descEs: "Consigue una evaluación oral 100% precisa con el micrófono.",
                descEn: "Get a 100% accurate pronunciation evaluation with the mic.",
                target: 1,
                getProgress: (s) => (s.perfectSpeech ? 1 : 0),
            },

            // --- JUEGOS ---
            {
                id: "sentence_builder_5",
                category: "games",
                tier: "silver",
                points: 25,
                icon: "🧩",
                titleEs: "Arquitecto de Frases",
                titleEn: "Phrase Architect",
                descEs: "Construye con éxito 5 oraciones en el Constructor de Oraciones.",
                descEn: "Successfully construct 5 sentences in Sentence Builder.",
                target: 5,
                getProgress: (s) => s.sentencesBuilt || 0,
            },
            {
                id: "snake_pro",
                category: "games",
                tier: "silver",
                points: 25,
                icon: "🐍",
                titleEs: "Viborita Legendaria",
                titleEn: "Legendary Snake",
                descEs: "Logra más de 60 puntos en la Viborita de Clasificadores.",
                descEn: "Score over 60 points in Quantifier Snake.",
                target: 60,
                getProgress: (s) => s.snakeHighScore || 0,
            },
            {
                id: "matrix_high_score",
                category: "games",
                tier: "gold",
                points: 50,
                icon: "🌌",
                titleEs: "Hacker de la Matriz",
                titleEn: "Matrix Hacker",
                descEs: "Supera 1,000 puntos en el juego de Matriz de Fusión.",
                descEn: "Exceed 1,000 points in Character Fusion Matrix.",
                target: 1000,
                getProgress: (s) => s.matrixHighScore || 0,
            },

            // --- CULTURA ---
            {
                id: "culture_explorer",
                category: "culture",
                tier: "bronze",
                points: 10,
                icon: "🏮",
                titleEs: "Viajero Cultural",
                titleEn: "Cultural Explorer",
                descEs: "Explora los módulos de Cultura y evolución de caracteres.",
                descEn: "Explore Cultural modules and character evolution.",
                target: 1,
                getProgress: () => 1, // Desbloqueado al visitar cultura
            },
        ];

        this.hydrateFromIndexedDB();
    }

    loadUnlocked() {
        try {
            const raw = localStorage.getItem(AchievementManager.STORAGE_KEY);
            if (!raw) return new Set();
            const arr = JSON.parse(raw);
            return new Set(Array.isArray(arr) ? arr : []);
        } catch {
            return new Set();
        }
    }

    saveUnlocked() {
        try {
            const arr = Array.from(this.unlockedIds);
            localStorage.setItem(AchievementManager.STORAGE_KEY, JSON.stringify(arr));
            window.idbStorage?.set?.(AchievementManager.STORAGE_KEY, arr);
        } catch {
            void 0;
        }
    }

    async hydrateFromIndexedDB() {
        if (!window.idbStorage) return;
        try {
            const idbArr = await window.idbStorage.get(AchievementManager.STORAGE_KEY);
            if (Array.isArray(idbArr)) {
                idbArr.forEach((id) => this.unlockedIds.add(id));
                this.saveUnlocked();
            }
        } catch {
            void 0;
        }
    }

    checkAll(stats = {}) {
        const newlyUnlocked = [];

        this.catalogue.forEach((ach) => {
            if (this.unlockedIds.has(ach.id)) return;

            const current = ach.getProgress(stats);
            if (current >= ach.target) {
                this.unlockedIds.add(ach.id);
                newlyUnlocked.push(ach);
            }
        });

        if (newlyUnlocked.length > 0) {
            this.saveUnlocked();
            newlyUnlocked.forEach((ach) => this.triggerCelebration(ach));
        }

        return newlyUnlocked;
    }

    triggerCelebration(ach) {
        const isEs = this.app?.currentLanguage !== "en";
        const title = isEs ? ach.titleEs : ach.titleEn;
        const desc = isEs ? ach.descEs : ach.descEn;

        // Play Fanfare
        this.app?.audioController?.playStreakFanfare?.();

        // Trigger Confetti Burst
        this.fireConfetti();

        // Show Toast
        this.showToast({
            icon: ach.icon,
            title,
            desc,
            tier: ach.tier,
            points: ach.points,
        });

        // Haptic feedback
        try {
            navigator.vibrate?.([60, 40, 60, 40, 100]);
        } catch {
            void 0;
        }
    }

    showToast(ach) {
        let container = document.querySelector(".ach-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "ach-toast-container";
            document.body.appendChild(container);
        }

        const isEs = this.app?.currentLanguage !== "en";
        const toast = document.createElement("div");
        toast.className = "ach-toast";
        toast.innerHTML = `
            <div class="ach-toast-icon">${ach.icon}</div>
            <div class="ach-toast-text">
                <div class="ach-toast-heading">🏆 ${isEs ? "¡Logro Desbloqueado!" : "Achievement Unlocked!"} (+${ach.points} pts)</div>
                <div class="ach-toast-title">${ach.title}</div>
                <div class="ach-toast-desc">${ach.desc}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-10px)";
            setTimeout(() => toast.remove(), 450);
        }, 5000);
    }

    fireConfetti() {
        let canvas = document.getElementById("ach-confetti-canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "ach-confetti-canvas";
            document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#fbbf24"];
        const particles = Array.from({ length: 65 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.4 - 50,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 4 + 3,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 8,
        }));

        const startTime = Date.now();
        const duration = 2800;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rotSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            });

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    getTotalPoints() {
        return this.catalogue
            .filter((ach) => this.unlockedIds.has(ach.id))
            .reduce((sum, ach) => sum + (ach.points || 0), 0);
    }

    renderShowcase(containerId, stats = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isEs = this.app?.currentLanguage !== "en";
        const totalPoints = this.getTotalPoints();
        const unlockedCount = this.unlockedIds.size;
        const totalCount = this.catalogue.length;

        container.innerHTML = `
            <div class="achievements-showcase-container">
                <div class="ach-summary-banner">
                    <div class="ach-summary-left">
                        <div class="ach-trophy-large-icon">🏆</div>
                        <div class="ach-summary-text">
                            <h3>${isEs ? "Vitrina de Trofeos & Medallas" : "Trophy & Medal Showcase"}</h3>
                            <p>${isEs ? `Has desbloqueado ${unlockedCount} de ${totalCount} logros.` : `You have unlocked ${unlockedCount} of ${totalCount} achievements.`}</p>
                        </div>
                    </div>
                    <div class="ach-points-pill">
                        <span>⭐</span>
                        <span>${totalPoints} ${isEs ? "Puntos" : "Pts"}</span>
                    </div>
                </div>

                <div class="ach-filters-bar">
                    <button class="ach-filter-btn active" data-filter="all">${isEs ? "Todos" : "All"} (${totalCount})</button>
                    <button class="ach-filter-btn" data-filter="study">${isEs ? "Estudio" : "Study"}</button>
                    <button class="ach-filter-btn" data-filter="writing">${isEs ? "Caligrafía" : "Writing"}</button>
                    <button class="ach-filter-btn" data-filter="audio">${isEs ? "Audición" : "Audio"}</button>
                    <button class="ach-filter-btn" data-filter="games">${isEs ? "Juegos" : "Games"}</button>
                </div>

                <div class="ach-grid" id="ach-cards-grid"></div>
            </div>
        `;

        const renderCards = (filter = "all") => {
            const grid = document.getElementById("ach-cards-grid");
            if (!grid) return;
            grid.innerHTML = "";

            const filtered = filter === "all"
                ? this.catalogue
                : this.catalogue.filter((a) => a.category === filter);

            filtered.forEach((ach) => {
                const isUnlocked = this.unlockedIds.has(ach.id);
                const title = isEs ? ach.titleEs : ach.titleEn;
                const desc = isEs ? ach.descEs : ach.descEn;
                const current = ach.getProgress(stats);
                const pct = Math.min(100, Math.round((current / ach.target) * 100));

                const card = document.createElement("div");
                card.className = `ach-card ${isUnlocked ? "unlocked" : "locked"}`;
                card.innerHTML = `
                    <div class="ach-card-top">
                        <div class="ach-icon-box">${ach.icon}</div>
                        <div class="ach-info-box">
                            <div class="ach-title">${title}</div>
                            <span class="ach-tier-badge ach-tier-${ach.tier}">${ach.tier} · ${ach.points} pts</span>
                        </div>
                    </div>
                    <p class="ach-desc">${desc}</p>
                    <div class="ach-progress-wrap">
                        <div class="ach-progress-labels">
                            <span>${isUnlocked ? (isEs ? "Completado" : "Completed") : `${current} / ${ach.target}`}</span>
                            <span>${pct}%</span>
                        </div>
                        <div class="ach-progress-track">
                            <div class="ach-progress-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        };

        renderCards("all");

        // Filter buttons click
        container.querySelectorAll(".ach-filter-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                container.querySelectorAll(".ach-filter-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                renderCards(btn.dataset.filter);
            });
        });
    }
}

window.AchievementManager = AchievementManager;
