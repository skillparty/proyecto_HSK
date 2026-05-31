class StatsController {
    constructor(app) {
        this.app = app;
    }

    async updateStats() {
        this.app.logDebug('[stats] Updating stats');

        if (window.firebaseClient && window.firebaseClient.isAuthenticated()) {
            try {
                const firebaseStats = await window.firebaseClient.getUserStatistics();
                if (firebaseStats) {
                    this.app.stats = {
                        ...this.app.stats,
                        totalStudied: isNaN(Number(firebaseStats.totalStudied)) ? this.app.stats.totalStudied : Number(firebaseStats.totalStudied),
                        correctAnswers: isNaN(Number(firebaseStats.correctAnswers)) ? this.app.stats.correctAnswers : Number(firebaseStats.correctAnswers),
                        incorrectAnswers: isNaN(Number(firebaseStats.incorrectAnswers)) ? this.app.stats.incorrectAnswers : Number(firebaseStats.incorrectAnswers),
                        currentStreak: isNaN(Number(firebaseStats.currentStreak)) || firebaseStats.currentStreak === -Infinity || Number(firebaseStats.currentStreak) === -Infinity ? this.app.stats.currentStreak : Math.max(0, Number(firebaseStats.currentStreak)),
                        bestStreak: isNaN(Number(firebaseStats.bestStreak)) || firebaseStats.bestStreak === -Infinity || Number(firebaseStats.bestStreak) === -Infinity ? this.app.stats.bestStreak : Math.max(0, Number(firebaseStats.bestStreak)),
                        totalTimeSpent: isNaN(Number(firebaseStats.totalTimeSpent)) ? this.app.stats.totalTimeSpent : Number(firebaseStats.totalTimeSpent),
                        snakeHighScore: isNaN(Number(firebaseStats.snakeHighScore)) ? this.app.stats.snakeHighScore : Number(firebaseStats.snakeHighScore)
                    };

                    if (this.app.userProgress) {
                        const summary = this.app.userProgress.getProgressSummary();
                        this.app.stats.quizzesCompleted = summary.quizzesCompleted || this.app.stats.quizzesCompleted;
                        this.app.stats.matrixRounds = summary.matrixRounds || this.app.stats.matrixRounds;
                    }

                    this.app.logDebug('[stats] Cloud sync completed', this.app.stats);
                }
            } catch (error) {
                this.app.logError('[stats] Cloud sync failed', error);
            }
        }

        const stats = this.app.stats;

        // Renderizar elementos de texto clásicos
        const totalStudiedEl = document.getElementById('total-studied');
        if (totalStudiedEl) totalStudiedEl.textContent = stats.totalStudied;

        const quizCountEl = document.getElementById('quiz-count');
        if (quizCountEl) quizCountEl.textContent = stats.quizzesCompleted || 0;

        const streakCountEl = document.getElementById('current-streak');
        if (streakCountEl) streakCountEl.textContent = stats.currentStreak;

        const accuracy = stats.totalStudied > 0
            ? Math.round((stats.correctAnswers / stats.totalStudied) * 100)
            : 0;

        const accuracyRateEl = document.getElementById('accuracy-rate');
        if (accuracyRateEl) accuracyRateEl.textContent = accuracy + '%';

        // Renderizar nuevas estadísticas: Tiempo de estudio
        let timeMins = stats.totalTimeSpent || 0;
        if (this.app.userProgress && this.app.userProgress.profile && this.app.userProgress.profile.progress) {
            timeMins = Math.max(timeMins, this.app.userProgress.profile.progress.totalTimeSpent || 0);
        }
        
        let timeText = '0m';
        if (timeMins >= 60) {
            const hrs = Math.floor(timeMins / 60);
            const mins = timeMins % 60;
            timeText = `${hrs}h ${mins}m`;
        } else {
            timeText = `${timeMins}m`;
        }
        
        const studyTimeEl = document.getElementById('study-time');
        if (studyTimeEl) studyTimeEl.textContent = timeText;

        // Récord de Viborita
        const snakeHighEl = document.getElementById('snake-highscore');
        if (snakeHighEl) snakeHighEl.textContent = stats.snakeHighScore || 0;

        // Determinar si hay progreso en absoluto para mostrar estados
        const hasStatsProgress = (stats.totalStudied || 0) > 0 ||
            (stats.quizzesCompleted || 0) > 0 ||
            (stats.currentStreak || 0) > 0 ||
            (stats.snakeHighScore || 0) > 0;

        this.toggleStatsEmptyState(!hasStatsProgress);

        if (hasStatsProgress) {
            try {
                const progressData = await this.updateLevelProgress();
                this.drawCanvasChart(progressData);
                this.drawHeatmap();
                this.renderAchievements(stats);
            } catch (error) {
                this.app.logError('[stats] Level progress update failed', error);
            }
        }
    }

    toggleStatsEmptyState(showEmpty) {
        const statsCards = document.querySelector('#stats .stats-cards');
        const levelProgress = document.querySelector('#stats .level-progress');
        const resetBtn = document.getElementById('reset-stats');
        const emptyState = document.getElementById('stats-empty-state');
        const dashboardRow = document.getElementById('stats-dashboard-row');

        if (statsCards) statsCards.style.display = showEmpty ? 'none' : '';
        if (levelProgress) levelProgress.style.display = showEmpty ? 'none' : '';
        if (resetBtn) resetBtn.style.display = showEmpty ? 'none' : '';
        if (emptyState) emptyState.style.display = showEmpty ? 'flex' : 'none';
        if (dashboardRow) dashboardRow.style.display = showEmpty ? 'none' : 'grid';
    }

    async updateLevelProgress() {
        const ringsGrid = document.getElementById('stats-rings-grid');
        const container = document.getElementById('level-progress-bars');
        if (!ringsGrid && !container) return [];

        if (!this.app.vocabularyLoaded && this.app.vocabularyPromise) {
            this.app.logDebug('[stats] Waiting vocabulary before level progress');
            await this.app.vocabularyPromise;
        }

        if (container) container.innerHTML = '';
        if (ringsGrid) ringsGrid.innerHTML = '';

        let levelProgressData = [];

        if (this.app.userProgress) {
            levelProgressData = Object.entries(this.app.userProgress.profile.hskProgress || {}).map(([level, data]) => ({
                hsk_level: parseInt(level, 10),
                total_words_studied: data.studied,
                correct_answers: data.correct,
                incorrect_answers: data.incorrect
            }));
        } else if (window.firebaseClient && window.firebaseClient.isAuthenticated()) {
            try {
                const userStats = await window.firebaseClient.getUserStatistics();
                if (userStats && userStats.levelProgress) {
                    levelProgressData = userStats.levelProgress;
                }
            } catch (error) {
                this.app.logError('[stats] Loading level progress failed', error);
            }
        }

        const normalizedProgress = [];

        for (let level = 1; level <= 6; level++) {
            const levelWords = this.app.vocabulary.filter(word => word.level === level);
            const totalWords = levelWords.length || 150; // Fallback razonable

            const levelData = levelProgressData.find(lp => lp.hsk_level === level);
            const studiedWords = levelData ? levelData.total_words_studied : 0;
            const correctAnswers = levelData ? levelData.correct_answers : 0;
            const incorrectAnswers = levelData ? levelData.incorrect_answers : 0;
            
            const accuracy = levelData && (levelData.correct_answers + levelData.incorrect_answers) > 0
                ? Math.round((levelData.correct_answers / (levelData.correct_answers + levelData.incorrect_answers)) * 100)
                : 0;

            const progress = totalWords > 0 ? Math.min((studiedWords / totalWords) * 100, 100) : 0;

            normalizedProgress.push({
                hsk_level: level,
                total_words_studied: studiedWords,
                total_words: totalWords,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                accuracy: accuracy,
                progress: progress
            });

            if (container) {
                // Recrear barra clásica de progreso
                const progressBar = document.createElement('div');
                progressBar.className = 'level-progress-item';
                const accuracyText = accuracy > 0 ? ` (${accuracy}% accuracy)` : '';
                progressBar.innerHTML =
                    `<div class="level-label">HSK ${level}</div>` +
                    `<div class="progress-bar">` +
                        `<div class="progress-fill" style="width: ${progress}%"></div>` +
                    `</div>` +
                    `<div class="progress-text">` +
                        `${studiedWords}/${totalWords}${accuracyText}` +
                    `</div>`;
                container.appendChild(progressBar);
            }
        }

        if (ringsGrid) {
            this.renderRadialRings(normalizedProgress);
        }

        return normalizedProgress;
    }

    drawCanvasChart(progressData) {
        const canvas = document.getElementById('stats-canvas-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Limpiar lienzo
        ctx.clearRect(0, 0, width, height);

        // Fondo redondeado con gradiente oscuro suave y borde translúcido
        ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
        this.drawCanvasRoundedRect(ctx, 0, 0, width, height, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Parámetros de margen
        const margin = { top: 32, right: 18, bottom: 42, left: 45 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Dibujar líneas guía horizontales
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#64748b';
        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const lines = 4;
        for (let i = 0; i <= lines; i++) {
            const pct = i / lines;
            const y = margin.top + chartHeight * (1 - pct);
            
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();

            // Dibujar porcentajes en el eje Y
            ctx.fillText(`${Math.round(pct * 100)}%`, margin.left - 8, y);
        }

        // Dibujar barras comparativas HSK 1-6
        const barSpacing = chartWidth / 6;
        const barWidth = barSpacing * 0.48;

        progressData.forEach((data, i) => {
            const percentage = data.total_words > 0 ? Math.min(1.0, data.total_words_studied / data.total_words) : 0;
            
            const x = margin.left + i * barSpacing + (barSpacing - barWidth) / 2;
            const bgHeight = chartHeight;
            const activeHeight = chartHeight * percentage;
            const yBg = margin.top;
            const yActive = margin.top + chartHeight - activeHeight;

            // 1. Barra de fondo (gris translúcido)
            ctx.fillStyle = 'rgba(148, 163, 184, 0.09)';
            this.drawCanvasRoundedRect(ctx, x, yBg, barWidth, bgHeight, barWidth * 0.35);
            ctx.fill();

            // 2. Barra activa con gradiente estético HSL
            if (activeHeight > 1) {
                const barGrad = ctx.createLinearGradient(x, yActive, x, margin.top + chartHeight);
                // Colores degradados según nivel HSK (espectro vibrante premium)
                const hue = 140 + i * 28; // Cambia armónicamente de verde (140) a turquesa, azul y púrpura (280)
                barGrad.addColorStop(0, `hsla(${hue}, 75%, 60%, 0.95)`);
                barGrad.addColorStop(1, `hsla(${hue + 15}, 80%, 42%, 0.85)`);
                
                ctx.fillStyle = barGrad;
                this.drawCanvasRoundedRect(ctx, x, yActive, barWidth, activeHeight, barWidth * 0.35);
                ctx.fill();

                // Efecto de brillo sheen 3D
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.beginPath();
                ctx.ellipse(x + barWidth / 2, yActive + barWidth * 0.35, barWidth * 0.35, barWidth * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Etiquetas de nivel HSK (Eje X)
            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`HSK ${data.hsk_level}`, x + barWidth / 2, margin.top + chartHeight + 8);

            // 4. Cantidad de palabras estudiadas (Encima de la barra)
            ctx.fillStyle = percentage > 0.05 ? '#e2e8f0' : '#64748b';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.textBaseline = 'bottom';
            ctx.fillText(data.total_words_studied, x + barWidth / 2, yActive - 4);
        });
    }

    renderAchievements(stats) {
        const grid = document.getElementById('stats-achievements-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const isEs = this.app.currentLanguage === 'es';

        const achievementsList = [
            {
                id: 'first-steps',
                title: isEs ? 'Primeros Pasos 👣' : 'First Steps 👣',
                desc: isEs ? 'Estudia tu primera tarjeta de vocabulario.' : 'Study your first vocabulary card.',
                iconBg: 'radial-gradient(circle, #34d399, #059669)',
                condition: (s) => (s.totalStudied || 0) >= 1
            },
            {
                id: 'streak-fire',
                title: isEs ? 'Racha de Fuego 🔥' : 'On Fire 🔥',
                desc: isEs ? 'Mantén una racha de estudio de al menos 3 días.' : 'Keep a study streak of at least 3 days.',
                iconBg: 'radial-gradient(circle, #f59e0b, #d97706)',
                condition: (s) => (s.currentStreak || 0) >= 3
            },
            {
                id: 'snake-amateur',
                title: isEs ? 'Viborita Amateur 🐍' : 'Snake Amateur 🐍',
                desc: isEs ? 'Logra 20 puntos en el juego de clasificadores.' : 'Score 20 points in the Quantifier Snake game.',
                iconBg: 'radial-gradient(circle, #60a5fa, #2563eb)',
                condition: (s) => (s.snakeHighScore || 0) >= 20
            },
            {
                id: 'snake-master',
                title: isEs ? 'Viborita Master 👑' : 'Snake Master 👑',
                desc: isEs ? 'Logra 60 puntos en el juego de clasificadores.' : 'Score 60 points in the Quantifier Snake game.',
                iconBg: 'radial-gradient(circle, #c084fc, #7c3aed)',
                condition: (s) => (s.snakeHighScore || 0) >= 60
            },
            {
                id: 'exam-done',
                title: isEs ? 'Estrella del Examen 📝' : 'Test Taker 📝',
                desc: isEs ? 'Completa 1 examen oficial HSK de práctica.' : 'Complete 1 official HSK practice exam.',
                iconBg: 'radial-gradient(circle, #f472b6, #db2777)',
                condition: (s) => (s.quizzesCompleted || 0) >= 1
            },
            {
                id: 'matrix-done',
                title: isEs ? 'Fusión de Caracteres 🌌' : 'Character Fusion 🌌',
                desc: isEs ? 'Completa una ronda de la Matriz de Fusión.' : 'Complete a round of the Fusion Matrix game.',
                iconBg: 'radial-gradient(circle, #fb7185, #e11d48)',
                condition: (s) => (s.matrixRounds || 0) >= 1
            },
            {
                id: 'bilingual',
                title: isEs ? 'Mente Bilingüe 🌎' : 'Bilingual Mind 🌎',
                desc: isEs ? 'Estudia con las traducciones en inglés y español.' : 'Study with both English and Spanish translations.',
                iconBg: 'radial-gradient(circle, #2dd4bf, #0d9488)',
                condition: () => true // Siempre activo ahora que el reverso de la tarjeta unificado es la norma
            },
            {
                id: 'accuracy-expert',
                title: isEs ? 'Precisión HSK 🎯' : 'HSK Accuracy Pro 🎯',
                desc: isEs ? 'Precisión >= 85% con al menos 15 tarjetas estudiadas.' : 'Accuracy >= 85% with at least 15 cards studied.',
                iconBg: 'radial-gradient(circle, #fb923c, #ea580c)',
                condition: (s) => {
                    const acc = s.totalStudied > 0 ? (s.correctAnswers / s.totalStudied) * 100 : 0;
                    return s.totalStudied >= 15 && acc >= 85;
                }
            }
        ];

        achievementsList.forEach(ach => {
            const isUnlocked = ach.condition(stats);
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${isUnlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'}`;
            
            badge.innerHTML = `
                <div class="achievement-icon" style="${isUnlocked ? `background: ${ach.iconBg};` : 'background: rgba(148, 163, 184, 0.12);'}">
                    ${isUnlocked ? '🏆' : '🔒'}
                </div>
                <div class="achievement-info">
                    <div class="achievement-title">${ach.title}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    <div class="achievement-status">${isUnlocked ? (isEs ? 'Desbloqueado' : 'Unlocked') : (isEs ? 'Bloqueado' : 'Locked')}</div>
                </div>
            `;
            grid.appendChild(badge);
        });
    }

    drawCanvasRoundedRect(ctx, x, y, w, h, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    drawHeatmap() {
        const canvas = document.getElementById('stats-heatmap-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Limpiar lienzo
        ctx.clearRect(0, 0, width, height);

        // Obtener días activos
        const activeDays = (this.app.dailyProgress && this.app.dailyProgress.activeDays) || new Set();
        
        const isLight = document.body.classList.contains('light-theme');
        
        // Fondo redondeado con gradiente oscuro suave y borde translúcido
        ctx.fillStyle = isLight ? 'rgba(255, 248, 240, 0.5)' : 'rgba(15, 23, 42, 0.42)';
        this.drawCanvasRoundedRect(ctx, 0, 0, width, height, 16);
        ctx.fill();
        ctx.strokeStyle = isLight ? 'rgba(139, 0, 0, 0.15)' : 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Parámetros de margen
        const leftOffset = 40;
        const topOffset = 25;
        
        // Dibujar etiquetas de días de la semana
        ctx.fillStyle = isLight ? 'var(--color-text-muted)' : '#94a3b8';
        ctx.font = '500 9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Domingo a Sábado
        const dayLabelsEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const labels = this.app.currentLanguage === 'es' ? dayLabels : dayLabelsEn;
        
        ctx.fillText(labels[1], 15, topOffset + 1 * 11 + 5);
        ctx.fillText(labels[3], 15, topOffset + 3 * 11 + 5);
        ctx.fillText(labels[5], 15, topOffset + 5 * 11 + 5);

        // Dibujar cuadrícula de 52 semanas
        const squareSize = 8;
        const gap = 3;
        
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 364);
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        let currentMonth = -1;

        for (let col = 0; col < 53; col++) {
            const weekStartDate = new Date(startDate);
            weekStartDate.setDate(startDate.getDate() + col * 7);

            const month = weekStartDate.getMonth();
            if (month !== currentMonth && col % 4 === 0) {
                currentMonth = month;
                const monthNamesEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const mName = this.app.currentLanguage === 'es' ? monthNamesEs[month] : monthNamesEn[month];
                ctx.fillStyle = isLight ? 'var(--color-text-dim)' : '#64748b';
                ctx.font = '500 9px Inter, sans-serif';
                ctx.fillText(mName, leftOffset + col * (squareSize + gap), 14);
            }

            for (let row = 0; row < 7; row++) {
                const cellDate = new Date(weekStartDate);
                cellDate.setDate(weekStartDate.getDate() + row);

                if (cellDate > today) {
                    continue;
                }

                const dateStr = cellDate.toDateString();
                const isActive = activeDays.has(dateStr);

                const x = leftOffset + col * (squareSize + gap);
                const y = topOffset + row * (squareSize + gap);

                if (isActive) {
                    ctx.fillStyle = isLight ? 'var(--color-primary)' : 'var(--accent)';
                } else {
                    ctx.fillStyle = isLight ? '#e5e3df' : 'rgba(255, 255, 255, 0.08)';
                }

                this.drawCanvasRoundedRect(ctx, x, y, squareSize, squareSize, 2);
                ctx.fill();
            }
        }
    }

    renderRadialRings(normalizedProgress) {
        const grid = document.getElementById('stats-rings-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const isEs = this.app.currentLanguage === 'es';

        const levelThemes = {
            1: { color: '#ef4444', name: 'HSK 1' },
            2: { color: '#f59e0b', name: 'HSK 2' },
            3: { color: '#10b981', name: 'HSK 3' },
            4: { color: '#3b82f6', name: 'HSK 4' },
            5: { color: '#8b5cf6', name: 'HSK 5' },
            6: { color: '#6b7280', name: 'HSK 6' }
        };

        normalizedProgress.forEach(data => {
            const theme = levelThemes[data.hsk_level];
            const pct = Math.round(data.progress);

            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (data.progress / 100) * circumference;

            const ringCard = document.createElement('div');
            ringCard.className = 'stats-ring-card';

            ringCard.innerHTML = `
                <div class="ring-svg-container">
                    <svg width="90" height="90" viewBox="0 0 90 90" class="ring-svg">
                        <circle cx="45" cy="45" r="${radius}" fill="none" stroke="rgba(148, 163, 184, 0.1)" stroke-width="6" />
                        <circle cx="45" cy="45" r="${radius}" fill="none" stroke="${theme.color}" stroke-width="6"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                            stroke-linecap="round" transform="rotate(-90 45 45)" class="ring-active-circle" />
                    </svg>
                    <div class="ring-percent">${pct}%</div>
                </div>
                <div class="ring-info">
                    <h5 class="ring-title">${theme.name}</h5>
                    <div class="ring-count">${data.total_words_studied}/${data.total_words}</div>
                    <div class="ring-accuracy">${isEs ? 'Precisión:' : 'Accuracy:'} ${data.accuracy > 0 ? `${data.accuracy}%` : '-'}</div>
                </div>
            `;
            grid.appendChild(ringCard);
        });
    }

    resetStats() {
        const resetConfirm = this.app.getTranslation('resetConfirm') || 'Are you sure you want to reset all statistics?';
        if (!window.confirm(resetConfirm)) {
            return;
        }

        try {
            this.app.stats = {
                totalStudied: 0,
                correctAnswers: 0,
                currentStreak: 0,
                bestStreak: 0,
                quizzesCompleted: 0,
                snakeHighScore: 0
            };
            this.app.saveStats();
            this.updateStats();
            this.app.updateHeaderStats();
            this.app.showToast(this.app.getTranslation('statsResetDone') || 'Statistics reset', 'success', 1800);
        } catch (error) {
            this.app.logError('[stats] Reset failed', error);
            this.app.showToast(this.app.getTranslation('statsResetFailed') || 'Could not reset statistics', 'error', 2400);
        }
    }
}

window.StatsController = StatsController;
