/**
 * HomeController Module - Handles home dashboard, stats CTA, and matrix fallback actions
 */
class HomeController {
    constructor(app) {
        this.app = app;
        this.bound = false;
        this.portalScene = new window.HomeCulturalPortalScene(this);
        this.logDebug('🏠 HomeController module initialized');
    }

    getLogger() {
        return window.hskLogger || console;
    }

    logDebug(...args) {
        this.getLogger().debug(...args);
    }

    logWarn(...args) {
        this.getLogger().warn(...args);
    }

    getDailyCharacter() {
        if (!this.app.vocabulary || this.app.vocabulary.length === 0) {
            return { character: '中', pinyin: 'zhōng', translation: 'Medio, centro', english: 'middle, center', level: 1 };
        }
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const index = dayOfYear % this.app.vocabulary.length;
        return this.app.vocabulary[index];
    }

    renderDashboard() {
        const isEs = this.app.currentLanguage === 'es';
        const stats = this.app.stats;

        // 1. Welcome Greeting & Stats
        const user = (this.app.backendAuth && this.app.backendAuth.currentUser) || 
                     (window.firebaseClient && window.firebaseClient.initialized && window.firebaseClient.getCurrentUser());
        let name = "";
        if (user) {
            name = user.name || user.displayName || user.username || "";
        }
        
        const titleEl = document.getElementById('dashboard-welcome-title');
        if (titleEl) {
            titleEl.textContent = isEs 
              ? (name ? `¡Hola, ${name}! 🐉` : '¡Hola, Estudiante! 🐉')
              : (name ? `Hello, ${name}! 🐉` : 'Hello, Scholar! 🐉');
        }

        const subtitleEl = document.getElementById('dashboard-welcome-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = isEs
              ? 'El portal interactivo para dominar el idioma chino.'
              : 'Your interactive gateway to mastering the Chinese language.';
        }

        // Quick Stats
        const studiedEl = document.getElementById('dash-stat-studied');
        if (studiedEl) studiedEl.textContent = stats.totalStudied || 0;

        const streakEl = document.getElementById('dash-stat-streak');
        if (streakEl) streakEl.textContent = stats.currentStreak || 0;

        const accuracy = stats.totalStudied > 0
            ? Math.round((stats.correctAnswers / stats.totalStudied) * 100)
            : 0;
        const accuracyEl = document.getElementById('dash-stat-accuracy');
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';

        // 2. Continue Learning
        const lastTab = localStorage.getItem(this.app.lastTabStorageKey) || 'practice';
        const lastLevel = localStorage.getItem('hsk-last-level') || '1';
        
        const continueDescEl = document.getElementById('dash-continue-desc');
        if (continueDescEl) {
            const tabNameTranslation = this.app.getTranslation(`${lastTab}Tab`) || lastTab;
            continueDescEl.textContent = isEs
              ? `Continúa practicando donde te quedaste: HSK ${lastLevel} en la sección de ${tabNameTranslation}.`
              : `Resume your study journey: HSK ${lastLevel} in the ${tabNameTranslation} section.`;
        }

        const continueBtn = document.getElementById('dash-continue-btn');
        if (continueBtn) {
            continueBtn.onclick = () => {
                this.app.switchTab(lastTab);
                if (lastTab === 'practice') {
                    const levelSel = document.getElementById('level-select');
                    if (levelSel) {
                        levelSel.value = lastLevel;
                        levelSel.dispatchEvent(new Event('change'));
                    }
                }
            };
        }

        // 3. Daily Goal
        const target = stats.dailyGoal || 20;
        let todayCount = stats.todayCards || 0;
        
        const goalCurrentEl = document.getElementById('dash-goal-current');
        if (goalCurrentEl) goalCurrentEl.textContent = todayCount;

        const goalTargetEl = document.getElementById('dash-goal-target');
        if (goalTargetEl) goalTargetEl.textContent = target;

        const progressPercent = Math.min(100, Math.round((todayCount / target) * 100));
        const progressFill = document.getElementById('dash-goal-progress');
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }

        const goalFeedback = document.getElementById('dash-goal-feedback');
        if (goalFeedback) {
            if (progressPercent >= 100) {
                goalFeedback.textContent = isEs
                  ? '🏆 ¡Excelente! Has completado tu meta diaria hoy. ¡Increíble trabajo!'
                  : '🏆 Outstanding! You have reached your daily goal today. Keep it up!';
            } else {
                goalFeedback.textContent = isEs
                  ? `Estás al ${progressPercent}% de completar tu meta de hoy. ¡Tú puedes!`
                  : `You are ${progressPercent}% on your way to completing today's goal. You got this!`;
            }
        }

        // 4. Character of the Day (每日汉字)
        const dailyWord = this.getDailyCharacter();
        const charContainer = document.querySelector('.char-mi-zi-ge-container');
        if (charContainer) {
            const chars = Array.from(dailyWord.character || '中');
            const tones = this.app.getTonesFromPinyin(dailyWord.pinyin || '');
            if (chars.length > 1) {
                const boxSize = chars.length > 3 ? '50px' : '60px';
                const fontSize = chars.length > 3 ? '1.8rem' : '2.2rem';
                charContainer.innerHTML = `
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; align-items: center;">
                        ${chars.map((c, i) => {
                            const tone = tones[i] !== undefined ? tones[i] : 0;
                            return `
                                <div class="char-mi-zi-ge" style="width: ${boxSize}; height: ${boxSize}; min-width: ${boxSize};">
                                    <div class="mi-zi-ge-lines"></div>
                                    <div class="char-display tone-${tone}" style="font-size: ${fontSize};">${c}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                const tone = tones[0] !== undefined ? tones[0] : 0;
                charContainer.innerHTML = `
                    <div class="char-mi-zi-ge">
                        <div class="mi-zi-ge-lines"></div>
                        <div class="char-display tone-${tone}" id="dash-char-character">${dailyWord.character || '中'}</div>
                    </div>
                `;
            }
        }

        const charPinyin = document.getElementById('dash-char-pinyin');
        if (charPinyin) charPinyin.textContent = dailyWord.pinyin || 'zhōng';

        const charMeaning = document.getElementById('dash-char-meaning');
        if (charMeaning) {
            charMeaning.textContent = isEs
              ? (dailyWord.translation || dailyWord.spanish || dailyWord.english || 'Medio, centro')
              : (dailyWord.english || 'middle, center');
        }

        const charLevel = document.getElementById('dash-char-level');
        if (charLevel) charLevel.textContent = `HSK ${dailyWord.level || 1}`;

        const charStudyBtn = document.getElementById('dash-char-study-btn');
        if (charStudyBtn) {
            charStudyBtn.onclick = () => {
                this.app.switchTab('practice');
                this.app.currentLevel = String(dailyWord.level || 1);
                
                const levelSel = document.getElementById('level-select');
                if (levelSel) {
                    levelSel.value = String(dailyWord.level || 1);
                    levelSel.dispatchEvent(new Event('change'));
                }
                
                if (this.app.flashcardManager) {
                    // Try to inject this word as the current word
                    this.app.flashcardManager.currentWord = dailyWord;
                    this.app.currentWord = dailyWord;
                    this.app.flashcardManager.updateCard();
                }
            };
        }

        // 5. Recent Achievements
        const achievementsList = [
            {
                id: 'first-steps',
                title: isEs ? 'Primeros Pasos 👣' : 'First Steps 👣',
                desc: isEs ? 'Estudia tu primera tarjeta de vocabulario.' : 'Study your first vocabulary card.',
                icon: '👣',
                unlocked: (stats.totalStudied || 0) >= 1
            },
            {
                id: 'streak-fire',
                title: isEs ? 'Racha de Fuego 🔥' : 'On Fire 🔥',
                desc: isEs ? 'Mantén una racha de estudio de al menos 3 días.' : 'Keep a study streak of at least 3 days.',
                icon: '🔥',
                unlocked: (stats.currentStreak || 0) >= 3
            },
            {
                id: 'snake-amateur',
                title: isEs ? 'Viborita Amateur 🐍' : 'Snake Amateur 🐍',
                desc: isEs ? 'Logra 20 puntos en el juego de clasificadores.' : 'Score 20 points in the Quantifier Snake game.',
                icon: '🐍',
                unlocked: (stats.snakeHighScore || 0) >= 20
            },
            {
                id: 'snake-master',
                title: isEs ? 'Viborita Master 👑' : 'Snake Master 👑',
                desc: isEs ? 'Logra 60 puntos en el juego de clasificadores.' : 'Score 60 points in the Quantifier Snake game.',
                icon: '👑',
                unlocked: (stats.snakeHighScore || 0) >= 60
            },
            {
                id: 'exam-done',
                title: isEs ? 'Estrella del Examen 📝' : 'Test Taker 📝',
                desc: isEs ? 'Completa 1 examen oficial HSK de práctica.' : 'Complete 1 official HSK practice exam.',
                icon: '📝',
                unlocked: (stats.quizzesCompleted || 0) >= 1
            },
            {
                id: 'matrix-done',
                title: isEs ? 'Fusión de Caracteres 🌌' : 'Character Fusion 🌌',
                desc: isEs ? 'Completa una ronda de la Matriz de Fusión.' : 'Complete a round of the Fusion Matrix game.',
                icon: '🌌',
                unlocked: (stats.matrixRounds || 0) >= 1
            },
            {
                id: 'accuracy-expert',
                title: isEs ? 'Precisión HSK 🎯' : 'HSK Accuracy Pro 🎯',
                desc: isEs ? 'Precisión >= 85% con al menos 15 tarjetas estudiadas.' : 'Accuracy >= 85% with at least 15 cards studied.',
                icon: '🎯',
                unlocked: (() => {
                    const acc = stats.totalStudied > 0 ? (stats.correctAnswers / stats.totalStudied) * 100 : 0;
                    return stats.totalStudied >= 15 && acc >= 85;
                })()
            },
            {
                id: 'hanzi-builder-star',
                title: isEs ? 'Constructor de Hanzi ✍️' : 'Hanzi Builder ✍️',
                desc: isEs ? 'Logra 100 puntos en el Constructor de Hanzi.' : 'Score 100 points in Hanzi Builder.',
                icon: '✍️',
                unlocked: (stats.hanziBuilderHighScore || 0) >= 100
            },
            {
                id: 'tone-defender',
                title: isEs ? 'Defensor de Tonos 🎵' : 'Tone Defender 🎵',
                desc: isEs ? 'Logra 50 puntos en Invasores de Tonos.' : 'Score 50 points in Tones Invaders.',
                icon: '🎵',
                unlocked: (stats.tonesInvadersHighScore || 0) >= 50
            },
            {
                id: 'word-connector',
                title: isEs ? 'Conector de Palabras 🔗' : 'Word Connector 🔗',
                desc: isEs ? 'Logra 100 puntos en el Enlazador de Palabras.' : 'Score 100 points in Word Linker.',
                icon: '🔗',
                unlocked: (stats.wordLinkerHighScore || 0) >= 100
            }
        ];

        const achievementsListEl = document.getElementById('dash-achievements-list');
        if (achievementsListEl) {
            achievementsListEl.innerHTML = '';
            
            // Prioritize: show unlocked achievements first, up to 3 total
            const sortedAchievements = [...achievementsList].sort((a, b) => b.unlocked - a.unlocked).slice(0, 3);
            
            sortedAchievements.forEach(ach => {
                const achItem = document.createElement('div');
                achItem.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'lock'}`;
                
                achItem.innerHTML = `
                    <div class="achievement-icon" style="${ach.unlocked ? '' : 'background: rgba(148, 163, 184, 0.12); opacity: 0.5;'}">
                        ${ach.unlocked ? ach.icon : '🔒'}
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-name">${ach.title}</div>
                        <div class="achievement-desc">${ach.desc}</div>
                    </div>
                `;
                achievementsListEl.appendChild(achItem);
            });
        }

        // 6. SRS Daily Loop Card
        this.renderSrsCard();

        // Initialize or resume the 3D Chinese Cultural Portal
        if (!this.portalScene.initialized) {
            this.portalScene.init();
        } else {
            this.portalScene.playing = true;
        }
    }

    renderSrsCard() {
        const card = document.getElementById('dash-srs-card');
        if (!card) return;

        const isEs = this.app.currentLanguage === 'es';
        const engine = this.app.srsEngine;
        const vocab = this.app.vocabulary;

        if (!engine || !vocab || vocab.length === 0) {
            card.style.display = 'none';
            return;
        }

        card.style.display = '';
        const summary = engine.getSummary(vocab);
        const { due, fresh, learned } = summary;
        const dailyGoal = Number(this.app.stats?.dailyGoal) || 20;
        const newToday = Math.min(fresh, dailyGoal);
        const total = due + newToday;

        const countEl = card.querySelector('#srs-card-count');
        const labelEl = card.querySelector('#srs-card-label');
        const subEl   = card.querySelector('#srs-card-sub');
        const ringEl  = card.querySelector('#srs-ring-fill');
        const dueEl   = card.querySelector('#srs-due-count');
        const newEl   = card.querySelector('#srs-new-count');
        const learnedEl = card.querySelector('#srs-learned-count');
        const btn     = card.querySelector('#srs-start-btn');

        if (dueEl)     dueEl.textContent   = due;
        if (newEl)     newEl.textContent    = newToday;
        if (learnedEl) learnedEl.textContent = learned;

        if (total === 0) {
            if (countEl) countEl.textContent = '✓';
            if (labelEl) labelEl.textContent = isEs ? '¡Todo al día!' : 'All caught up!';
            if (subEl)   subEl.textContent   = isEs
                ? `${learned} palabras aprendidas · sin pendientes hoy`
                : `${learned} words learned · nothing due today`;
            if (btn) {
                btn.textContent = isEs ? 'Repasar antes' : 'Study early';
                btn.className = 'srs-start-btn srs-btn-secondary';
            }
        } else {
            if (countEl) countEl.textContent = total;
            if (labelEl) labelEl.textContent = isEs ? 'tarjetas hoy' : 'cards today';
            if (subEl) {
                const parts = [];
                if (due > 0)     parts.push(isEs ? `${due} vencidas` : `${due} due`);
                if (newToday > 0) parts.push(isEs ? `${newToday} nuevas` : `${newToday} new`);
                subEl.textContent = parts.join(' · ');
            }
            if (btn) {
                btn.textContent = isEs ? 'Iniciar repaso SRS' : 'Start SRS review';
                btn.className = 'srs-start-btn srs-btn-primary';
            }
        }

        // Donut ring: proportion of due out of (due + upcoming)
        if (ringEl) {
            const upcoming = engine.getUpcomingWords(vocab).length;
            const denom = due + upcoming || 1;
            const pct = Math.min(1, due / denom);
            const circumference = 2 * Math.PI * 20;
            ringEl.style.strokeDasharray = `${(pct * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
        }

        if (btn) {
            btn.onclick = () => {
                const orderSel = document.getElementById('practice-order-mode');
                if (orderSel) {
                    orderSel.value = 'srs';
                    orderSel.dispatchEvent(new Event('change'));
                } else {
                    this.app.practiceOrderMode = 'srs';
                    if (this.app.flashcardManager) {
                        this.app.flashcardManager.setupSession();
                    }
                }
                this.app.switchTab('practice');
            };
        }
    }

    setupEventListeners() {
        if (this.bound) return;

        document.addEventListener('click', (e) => {
            const homeCard = e.target.closest('.home-card[data-tab-target]');
            if (homeCard) {
                const targetTab = homeCard.getAttribute('data-tab-target');
                if (targetTab) {
                    this.app.switchTab(targetTab);
                }
                return;
            }

            const goToPracticeBtn = e.target.closest('#go-to-practice-btn');
            if (goToPracticeBtn) {
                this.app.switchTab('practice');
                return;
            }

            const actionBtn = e.target.closest('[data-matrix-action]');
            if (!actionBtn) return;

            const action = actionBtn.getAttribute('data-matrix-action');
            if (action === 'debug') {
                this.app.debugMatrixGame();
            } else if (action === 'retry') {
                this.app.initializeMatrixGame();
            } else if (action === 'reload') {
                window.location.reload();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            const homeCard = e.target.closest('.home-card[data-tab-target]');
            if (!homeCard) return;

            e.preventDefault();
            const targetTab = homeCard.getAttribute('data-tab-target');
            if (targetTab) {
                this.app.switchTab(targetTab);
            }
        });

        // Re-render SRS card once vocabulary is available (may fire before or after tab switch)
        window.addEventListener('hsk:vocabulary-ready', () => {
            this.renderSrsCard();
        }, { once: true });

        this.bound = true;
    }
}

window.HomeController = HomeController;
