/**
 * HomeController Module - Handles home dashboard, stats CTA, and matrix fallback actions
 */
class HomeController {
    constructor(app) {
        this.app = app;
        this.bound = false;
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

        // Initialize or resume the 3D Chinese Cultural Portal
        if (!this.threeInitialized) {
            this.init3DScene();
        } else {
            this.threePlaying = true;
        }
    }

    /**
     * Initializes the Three.js 3D Chinese Cultural Portal scene
     * Includes interactive rotation, swaying bamboo tree, a glowing Chinese lantern (active after 6:45 PM),
     * and Chinese characters written stroke-by-stroke in glowing 3D space.
     */
    init3DScene() {
        const canvas = document.getElementById('matrix-3d-canvas');
        if (!canvas) {
            this.logWarn('⚠️ 3D canvas not found, skipping 3D initialization');
            return;
        }

        if (typeof THREE === 'undefined') {
            this.logWarn('⚠️ Three.js library not loaded, skipping 3D initialization');
            return;
        }

        this.logDebug('🎋 Initializing 3D Chinese Cultural Portal scene...');
        this.threeInitialized = true;
        this.threePlaying = true;

        // 1. Scene, Camera, and WebGLRenderer
        const scene = new THREE.Scene();
        
        // Fog for smooth depth blending
        scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(0, 1.2, 7.2);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.shadowMap.enabled = true;

        // Base group to apply mouse/drag rotations
        const sceneGroup = new THREE.Group();
        scene.add(sceneGroup);

        // 2. Lighting
        // Ambient moonlight
        const ambientLight = new THREE.AmbientLight(0x1e293b, 0.65);
        scene.add(ambientLight);

        // Soft blueish spotlight representing the night sky / moon
        const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
        moonLight.position.set(4, 8, 4);
        scene.add(moonLight);

        // Warm light source inside the lantern (enabled at night)
        const lanternLight = new THREE.PointLight(0xff7a00, 0, 10);
        lanternLight.position.set(1.9, 1.3, 0.4);
        sceneGroup.add(lanternLight);

        // 3. Hierarchical Swaying Jade Bamboo Tree
        const bamboo = new THREE.Group();
        const segHeight = 1.35;
        const segGeo = new THREE.CylinderGeometry(0.07, 0.09, segHeight, 8);
        const segMat = new THREE.MeshLambertMaterial({ 
            color: 0x065f46, 
            emissive: 0x012b1d, 
            emissiveIntensity: 0.15 
        });
        const ringGeo = new THREE.TorusGeometry(0.10, 0.02, 6, 12);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Golden bamboo nodes

        let prevJoint = bamboo;
        const bambooJoints = [];
        const numSegments = 5;

        // Position bamboo base slightly to the left/back
        bamboo.position.set(-1.9, -2.6, -0.4);

        for (let i = 0; i < numSegments; i++) {
            const joint = new THREE.Group();
            if (i > 0) {
                joint.position.set(0, segHeight - 0.05, 0); // stack exactly at the end of the previous segment
            }

            const mesh = new THREE.Mesh(segGeo, segMat);
            mesh.position.set(0, segHeight / 2, 0); // shift pivot to base of segment
            joint.add(mesh);

            // Add Torus ring at segment node
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(0, 0, 0);
            joint.add(ring);

            // Branching green leaves on upper segments
            if (i >= 2) {
                const leafGeo = new THREE.ConeGeometry(0.07, 0.55, 4);
                const leafMat = new THREE.MeshLambertMaterial({ color: 0x059669 });

                // Left leaf branch
                const leafL = new THREE.Mesh(leafGeo, leafMat);
                leafL.rotation.z = Math.PI / 3;
                leafL.rotation.y = 0.45;
                leafL.position.set(-0.22, segHeight * 0.7, 0.04);
                leafL.scale.set(1, 1.1, 0.35);
                joint.add(leafL);

                // Right leaf branch
                const leafR = new THREE.Mesh(leafGeo, leafMat);
                leafR.rotation.z = -Math.PI / 3;
                leafR.rotation.y = -0.45;
                leafR.position.set(0.22, segHeight * 0.75, -0.04);
                leafR.scale.set(1, 1.1, 0.35);
                joint.add(leafR);
            }

            prevJoint.add(joint);
            bambooJoints.push(joint);
            prevJoint = joint;
        }
        sceneGroup.add(bamboo);

        // 4. Traditional Chinese Lantern
        const lanternGroup = new THREE.Group();
        lanternGroup.position.set(1.9, 1.3, 0.4);

        // Hanging hanger / bracket cord
        const hangerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 4);
        const hangerMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        const hanger = new THREE.Mesh(hangerGeo, hangerMat);
        hanger.position.set(0, 0.65, 0);
        lanternGroup.add(hanger);

        // Lantern Main Body (stretched Sphere)
        const lanternBodyGeo = new THREE.SphereGeometry(0.44, 16, 16);
        const lanternBodyMat = new THREE.MeshLambertMaterial({
            color: 0xbe123c, // deep rose/red
            emissive: 0x000000,
            emissiveIntensity: 1.0
        });
        const lanternBody = new THREE.Mesh(lanternBodyGeo, lanternBodyMat);
        lanternBody.scale.set(1.0, 1.25, 1.0);
        lanternGroup.add(lanternBody);

        // Top/Bottom Golden Caps
        const capGeo = new THREE.CylinderGeometry(0.26, 0.31, 0.08, 12);
        const capMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // gold
        
        const topCap = new THREE.Mesh(capGeo, capMat);
        topCap.position.set(0, 0.58, 0);
        lanternGroup.add(topCap);

        const bottomCap = new THREE.Mesh(capGeo, capMat);
        bottomCap.position.set(0, -0.58, 0);
        lanternGroup.add(bottomCap);

        // Hanging red tassel
        const tasselGeo = new THREE.CylinderGeometry(0.018, 0.035, 0.35, 6);
        const tasselMat = new THREE.MeshLambertMaterial({ color: 0xd92727 });
        const tassel = new THREE.Mesh(tasselGeo, tasselMat);
        tassel.position.set(0, -0.78, 0);
        lanternGroup.add(tassel);

        sceneGroup.add(lanternGroup);

        // 5. Chinese Character Floating Calligraphy
        const charGroup = new THREE.Group();
        charGroup.position.set(0, 0.2, 0.4);
        sceneGroup.add(charGroup);

        const charsData = [
            {
                name: "中",
                strokes: [
                    [new THREE.Vector3(-0.85, 1.0, 0), new THREE.Vector3(-0.85, -0.25, 0)],
                    [new THREE.Vector3(-0.85, 1.0, 0), new THREE.Vector3(0.85, 1.0, 0), new THREE.Vector3(0.85, -0.25, 0)],
                    [new THREE.Vector3(-0.85, -0.25, 0), new THREE.Vector3(0.85, -0.25, 0)],
                    [new THREE.Vector3(0.0, 1.65, 0.04), new THREE.Vector3(0.0, -0.9, 0.04)]
                ]
            },
            {
                name: "人",
                strokes: [
                    [new THREE.Vector3(0.0, 1.35, 0), new THREE.Vector3(-0.3, 0.75, 0), new THREE.Vector3(-1.0, -0.45, 0)],
                    [new THREE.Vector3(-0.12, 0.65, 0.04), new THREE.Vector3(0.35, 0.1, 0.04), new THREE.Vector3(1.0, -0.45, 0.04)]
                ]
            },
            {
                name: "文",
                strokes: [
                    [new THREE.Vector3(0.0, 1.6, 0), new THREE.Vector3(0.06, 1.25, 0)],
                    [new THREE.Vector3(-1.1, 0.95, 0), new THREE.Vector3(1.1, 0.95, 0)],
                    [new THREE.Vector3(0.18, 0.95, 0.04), new THREE.Vector3(-0.75, -0.55, 0.04)],
                    [new THREE.Vector3(-0.22, 0.45, 0.08), new THREE.Vector3(0.95, -0.55, 0.08)]
                ]
            }
        ];

        // Glow Line Materials (neon gold calligraphy)
        const lineCoreMat = new THREE.LineBasicMaterial({
            color: 0xfffbeb,
            transparent: true,
            opacity: 0.95
        });
        const lineGlowMat = new THREE.LineBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.6
        });

        // pen tip drawing point
        const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
        const penTip = new THREE.Mesh(tipGeo, tipMat);
        penTip.visible = false;
        charGroup.add(penTip);

        let currentCharIndex = 0;
        let currentStrokeIndex = 0;
        let strokeT = 0; // progress 0 to 1
        let phase = 'drawing'; // 'drawing' | 'showing' | 'fading'
        let showTimer = 0;
        let fadeT = 1.0;

        let activeStrokes = [];

        const clearActiveStrokes = () => {
            activeStrokes.forEach(s => {
                charGroup.remove(s.coreLine);
                charGroup.remove(s.glowLine);
                s.coreLine.geometry.dispose();
                s.glowLine.geometry.dispose();
            });
            activeStrokes = [];
            penTip.visible = false;
        };

        const initCharacter = (index) => {
            clearActiveStrokes();
            currentCharIndex = index;
            currentStrokeIndex = 0;
            strokeT = 0;
            phase = 'drawing';
            fadeT = 1.0;
            lineCoreMat.opacity = 0.95;
            lineGlowMat.opacity = 0.6;
        };

        initCharacter(0);

        // 6. Interactive Drag-to-Rotate Mouse/Touch Controls
        let isDragging = false;
        let prevX = 0, prevY = 0;
        let targetRotY = 0;
        let targetRotX = 0;
        const autoRotateSpeed = 0.0035;

        canvas.addEventListener('pointerdown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
            canvas.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevX;
            const deltaY = e.clientY - prevY;
            prevX = e.clientX;
            prevY = e.clientY;

            targetRotY += deltaX * 0.006;
            targetRotX += deltaY * 0.006;
            // Clamp X rotation to prevent flipping upside down
            targetRotX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, targetRotX));
        });

        window.addEventListener('pointerup', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });

        // 7. Time-based Timezone Lantern Glow check
        // Lanterns turn on at 6:45 PM and turn off at sunrise (6:00 AM) depending on local time
        const updateTimezoneIllumination = (time) => {
            const now = new Date();
            const mins = now.getHours() * 60 + now.getMinutes();
            // 6:45 PM is 18 * 60 + 45 = 1125. Sunrise is 6:00 AM -> 360.
            const isNight = (mins >= 1125 || mins < 360);

            if (isNight) {
                // Emissive warm glow in material
                lanternBodyMat.emissive.setHex(0xe11d48);
                // Warm pointlight with fire flicker
                const flicker = Math.sin(time * 7) * 0.2;
                lanternLight.intensity = 2.5 + flicker;
            } else {
                lanternBodyMat.emissive.setHex(0x000000);
                lanternLight.intensity = 0;
            }
        };

        // 8. Animation Loop
        const clock = new THREE.Clock();

        const animate = () => {
            // Check visibility of home panel to prevent unnecessary background rendering
            const homePanel = document.getElementById('home');
            const isHomeVisible = homePanel && homePanel.classList.contains('active') && homePanel.style.display !== 'none';

            if (!isHomeVisible || !this.threePlaying) {
                requestAnimationFrame(animate);
                return;
            }

            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Handle rotational inertia
            if (!isDragging) {
                targetRotY += autoRotateSpeed;
            }
            sceneGroup.rotation.y += (targetRotY - sceneGroup.rotation.y) * 0.08;
            sceneGroup.rotation.x += (targetRotX - sceneGroup.rotation.x) * 0.08;

            // Sway Jade Bamboo segments organically
            bambooJoints.forEach((joint, idx) => {
                joint.rotation.z = Math.sin(time + idx * 0.4) * 0.022;
                joint.rotation.x = Math.cos(time * 0.85 + idx * 0.25) * 0.011;
            });

            // Lantern illumination
            updateTimezoneIllumination(time);

            // Calligraphy Draw Logic
            const char = charsData[currentCharIndex];
            
            if (phase === 'drawing') {
                strokeT += delta * 1.4; // speed of drawing
                if (strokeT > 1.0) strokeT = 1.0;

                if (activeStrokes.length <= currentStrokeIndex) {
                    const strokePts = char.strokes[currentStrokeIndex];
                    
                    const coreGeom = new THREE.BufferGeometry();
                    const glowGeom = new THREE.BufferGeometry();
                    
                    const coreLine = new THREE.Line(coreGeom, lineCoreMat);
                    const glowLine = new THREE.Line(glowGeom, lineGlowMat);
                    glowLine.scale.set(1.03, 1.03, 1.03); // slightly larger glow

                    charGroup.add(coreLine);
                    charGroup.add(glowLine);

                    activeStrokes.push({
                        coreLine,
                        glowLine,
                        points: strokePts
                    });
                }

                const strokeObj = activeStrokes[currentStrokeIndex];
                const fullPoints = strokeObj.points;
                
                // Draw path dynamically
                const drawnPoints = [];
                const totalSegs = fullPoints.length - 1;
                
                if (totalSegs > 0) {
                    const segFloat = strokeT * totalSegs;
                    const fullSegCount = Math.floor(segFloat);
                    const partialT = segFloat - fullSegCount;

                    for (let s = 0; s <= fullSegCount; s++) {
                        drawnPoints.push(fullPoints[s].clone());
                    }

                    if (fullSegCount < totalSegs) {
                        const startPt = fullPoints[fullSegCount];
                        const endPt = fullPoints[fullSegCount + 1];
                        const interpPt = new THREE.Vector3().lerpVectors(startPt, endPt, partialT);
                        drawnPoints.push(interpPt);
                    }
                } else {
                    drawnPoints.push(fullPoints[0].clone());
                }

                strokeObj.coreLine.geometry.setFromPoints(drawnPoints);
                strokeObj.glowLine.geometry.setFromPoints(drawnPoints);

                // Position glowing pen tip
                const tipPos = drawnPoints[drawnPoints.length - 1];
                penTip.position.copy(tipPos);
                penTip.visible = true;

                if (strokeT >= 1.0) {
                    currentStrokeIndex++;
                    strokeT = 0;
                    if (currentStrokeIndex >= char.strokes.length) {
                        phase = 'showing';
                        showTimer = 0;
                        penTip.visible = false;
                    }
                }
            } else if (phase === 'showing') {
                showTimer += delta;
                
                // Breathing glow animation
                const pulse = 0.85 + Math.sin(time * 3.5) * 0.12;
                lineCoreMat.opacity = 0.95 * pulse;
                lineGlowMat.opacity = 0.6 * pulse;

                if (showTimer >= 4.0) {
                    phase = 'fading';
                    fadeT = 1.0;
                }
            } else if (phase === 'fading') {
                fadeT -= delta * 1.5;
                if (fadeT <= 0) {
                    fadeT = 0;
                    const nextIndex = (currentCharIndex + 1) % charsData.length;
                    initCharacter(nextIndex);
                } else {
                    lineCoreMat.opacity = 0.95 * fadeT;
                    lineGlowMat.opacity = 0.6 * fadeT;
                }
            }

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        // 9. Resize Handling
        const handleResize = () => {
            if (!canvas) return;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        window.addEventListener('resize', handleResize);

        // Run size fix and start loop
        setTimeout(handleResize, 100);
        animate();
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

        this.bound = true;
    }
}

window.HomeController = HomeController;
