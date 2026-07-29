/**
 * HomeCulturalPortalScene - Decorative Three.js 3D scene rendered behind the
 * home dashboard (adaptive day/night lighting, bamboo, lantern, calligraphy).
 * Extracted from HomeController: self-contained, only needs the 2 lifecycle
 * flags (initialized/playing) it owns and the parent's logger.
 */
class HomeCulturalPortalScene {
    constructor(homeController) {
        this.homeController = homeController;
        this.initialized = false;
        this.playing = false;
    }

    init() {
        const canvas = document.getElementById('matrix-3d-canvas');
        if (!canvas) {
            this.homeController.logWarn('⚠️ 3D canvas not found, skipping 3D initialization');
            return;
        }

        // Respect reduced-motion preference — skip heavy 3D animation
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.homeController.logDebug('🎋 Skipping 3D scene: prefers-reduced-motion');
            return;
        }

        if (typeof THREE === 'undefined') {
            // Three.js not loaded yet — load it dynamically, then retry
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                this.homeController.logDebug('🎋 Three.js loaded on demand, initializing scene');
                this.init();
            };
            script.onerror = () => this.homeController.logWarn('⚠️ Three.js failed to load from CDN');
            document.head.appendChild(script);
            return;
        }

        this.homeController.logDebug('🎋 Initializing 3D Chinese Cultural Portal scene...');
        this.initialized = true;
        this.playing = true;

        // --- 1. Scene, Camera, Renderer ---
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 80);
        camera.position.set(0, 1.5, 5.5);
        camera.lookAt(0, 0.6, 0);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setClearColor(0x000000, 0); // fully transparent background

        // Root group for mouse rotation
        const sceneGroup = new THREE.Group();
        scene.add(sceneGroup);

        // --- 2. Adaptive Day/Night Lighting ---
        // Ambient: always present, tinted by time of day
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Main directional light (sun during day, moonlight at night)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
        mainLight.position.set(3, 6, 4);
        scene.add(mainLight);

        // Fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-3, 2, -2);
        scene.add(fillLight);

        // Lantern warm point light (night only)
        const lanternLight = new THREE.PointLight(0xff8c00, 0, 8);
        lanternLight.position.set(1.5, 2.0, 0.3);
        sceneGroup.add(lanternLight);

        // --- 3. Ground Plane ---
        const groundGeo = new THREE.CircleGeometry(4, 32);
        const groundMat = new THREE.MeshLambertMaterial({
            color: 0x1a3a2a,
            transparent: true,
            opacity: 0.25
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.5;
        sceneGroup.add(ground);

        // --- 4. Bamboo Tree (left side) ---
        const bamboo = new THREE.Group();
        bamboo.position.set(-1.5, -1.5, -0.3);

        const bambooJoints = [];
        const segH = 1.1;
        const segGeo = new THREE.CylinderGeometry(0.06, 0.08, segH, 8);
        const segMat = new THREE.MeshPhongMaterial({
            color: 0x1b6b45,
            emissive: 0x0a2e1a,
            emissiveIntensity: 0.1,
            shininess: 40
        });
        const nodeGeo = new THREE.TorusGeometry(0.09, 0.018, 6, 12);
        const nodeMat = new THREE.MeshPhongMaterial({ color: 0xc9a227, shininess: 60 });

        let prevJoint = bamboo;
        for (let i = 0; i < 5; i++) {
            const joint = new THREE.Group();
            if (i > 0) joint.position.set(0, segH - 0.04, 0);

            const seg = new THREE.Mesh(segGeo, segMat);
            seg.position.set(0, segH / 2, 0);
            joint.add(seg);

            const node = new THREE.Mesh(nodeGeo, nodeMat);
            node.rotation.x = Math.PI / 2;
            joint.add(node);

            // Leaves on upper segments
            if (i >= 2) {
                const leafGeo = new THREE.ConeGeometry(0.06, 0.5, 4);
                const leafMat = new THREE.MeshPhongMaterial({ color: 0x22a55b, shininess: 20 });

                const lL = new THREE.Mesh(leafGeo, leafMat);
                lL.rotation.z = Math.PI / 3.2;
                lL.position.set(-0.2, segH * 0.7, 0.03);
                lL.scale.set(1, 1.1, 0.3);
                joint.add(lL);

                const lR = new THREE.Mesh(leafGeo, leafMat);
                lR.rotation.z = -Math.PI / 3.2;
                lR.position.set(0.2, segH * 0.75, -0.03);
                lR.scale.set(1, 1.1, 0.3);
                joint.add(lR);
            }

            prevJoint.add(joint);
            bambooJoints.push(joint);
            prevJoint = joint;
        }
        sceneGroup.add(bamboo);

        // --- 5. Chinese Lantern (upper right) ---
        const lanternGroup = new THREE.Group();
        lanternGroup.position.set(1.5, 2.0, 0.3);

        // Cord
        const cordGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4);
        const cordMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const cord = new THREE.Mesh(cordGeo, cordMat);
        cord.position.y = 0.55;
        lanternGroup.add(cord);

        // Body
        const bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: 0xcc1133,
            emissive: 0x000000,
            emissiveIntensity: 0.8,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.0, 1.3, 1.0);
        lanternGroup.add(body);

        // Golden caps
        const capGeo = new THREE.CylinderGeometry(0.22, 0.27, 0.06, 12);
        const capMat = new THREE.MeshPhongMaterial({ color: 0xc9a227, shininess: 80 });
        const topCap = new THREE.Mesh(capGeo, capMat);
        topCap.position.y = 0.5;
        lanternGroup.add(topCap);
        const botCap = new THREE.Mesh(capGeo, capMat);
        botCap.position.y = -0.5;
        lanternGroup.add(botCap);

        // Tassel
        const tasselGeo = new THREE.CylinderGeometry(0.015, 0.03, 0.3, 6);
        const tasselMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
        const tassel = new THREE.Mesh(tasselGeo, tasselMat);
        tassel.position.y = -0.68;
        lanternGroup.add(tassel);

        sceneGroup.add(lanternGroup);

        // --- 6. Chinese Character Calligraphy (center) ---
        const charGroup = new THREE.Group();
        charGroup.position.set(0, 0.5, 0.8);
        sceneGroup.add(charGroup);

        const V = (x, y, z) => new THREE.Vector3(x, y, z || 0);
        // Trazos derivados de los datos canónicos de Make Me a Hanzi (vía
        // hanzi-writer), los mismos que usa la pestaña de Etimología.
        // NO editar a mano: regenerar con
        //   node scripts/build-data/generate-home-strokes.js
        const charsData = [
            {
                name: '中',
                strokes: [
                    [V(-0.662, 0.412), V(-0.575, 0.319), V(-0.452, -0.16)],
                    [V(-0.521, 0.398), V(0.477, 0.496), V(0.552, 0.408), V(0.458, 0.125), V(0.396, 0.096)],
                    [V(-0.408, -0.104), V(0.369, 0.019), V(0.533, -0.004)],
                    [V(-0.131, 0.881), V(0.002, 0.794), V(-0.027, -0.854)]
                ]
            },
            {
                name: '国',
                strokes: [
                    [V(-0.617, 0.719), V(-0.55, 0.64), V(-0.533, 0.465), V(-0.6, -0.781)],
                    [V(-0.46, 0.592), V(0.438, 0.748), V(0.596, 0.673), V(0.648, -0.831)],
                    [V(-0.298, 0.344), V(0.315, 0.415)],
                    [V(-0.319, -0.021), V(0.273, 0.019)],
                    [V(-0.071, 0.304), V(-0.013, 0.252), V(-0.006, 0.087), V(-0.048, -0.304)],
                    [V(-0.404, -0.4), V(0.25, -0.321), V(0.419, -0.352)],
                    [V(0.302, -0.052), V(0.485, -0.204)],
                    [V(-0.531, -0.729), V(0.542, -0.629)]
                ]
            },
            {
                name: '玻',
                strokes: [
                    [V(-0.752, 0.4), V(-0.25, 0.475)],
                    [V(-0.752, -0.081), V(-0.296, 0.006)],
                    [V(-0.573, 0.352), V(-0.504, 0.29), V(-0.5, 0.167), V(-0.512, -0.36), V(-0.554, -0.412)],
                    [V(-0.894, -0.579), V(-0.771, -0.598), V(-0.233, -0.313)],
                    [V(-0.017, 0.283), V(0.575, 0.467), V(0.629, 0.423), V(0.498, 0.231)],
                    [V(-0.169, 0.367), V(-0.085, 0.212), V(-0.146, -0.321), V(-0.302, -0.608), V(-0.481, -0.75)],
                    [V(0.14, 0.881), V(0.24, 0.787), V(0.192, -0.006)],
                    [V(0.01, -0.071), V(0.452, -0.031), V(0.279, -0.504), V(0.123, -0.658), V(-0.117, -0.748)],
                    [V(-0.004, -0.188), V(0.577, -0.713), V(1.012, -0.802)]
                ]
            },
            {
                name: '利',
                strokes: [
                    [V(0.017, 0.662), V(-0.138, 0.685), V(-0.644, 0.448)],
                    [V(-0.84, 0.119), V(0.046, 0.208)],
                    [V(-0.35, 0.498), V(-0.248, 0.41), V(-0.29, -0.771)],
                    [V(-0.325, 0.119), V(-0.502, -0.192), V(-0.852, -0.544)],
                    [V(-0.204, -0.025), V(-0.015, -0.235)],
                    [V(0.2, 0.423), V(0.265, 0.333), V(0.26, -0.25)],
                    [V(0.525, 0.81), V(0.629, 0.725), V(0.64, -0.608), V(0.59, -0.746), V(0.296, -0.613)]
                ]
            },
            {
                name: '维',
                strokes: [
                    [V(-0.481, 0.835), V(-0.421, 0.738), V(-0.708, 0.198), V(-0.429, 0.219)],
                    [V(-0.271, 0.519), V(-0.237, 0.431), V(-0.61, -0.154), V(-0.235, -0.04)],
                    [V(-0.823, -0.554), V(-0.704, -0.569), V(-0.183, -0.273)],
                    [V(0.11, 0.885), V(0.183, 0.804), V(0.142, 0.675), V(-0.19, 0.127)],
                    [V(0.008, 0.306), V(0.052, 0.035), V(0.025, -0.865)],
                    [V(0.319, 0.71), V(0.531, 0.544)],
                    [V(0.167, 0.31), V(0.742, 0.398)],
                    [V(0.225, 0.023), V(0.704, 0.094)],
                    [V(0.225, -0.223), V(0.692, -0.169)],
                    [V(0.394, 0.275), V(0.454, 0.177), V(0.419, -0.481)],
                    [V(0.113, -0.563), V(0.756, -0.492), V(0.921, -0.525)]
                ]
            },
            {
                name: '亚',
                strokes: [
                    [V(-0.506, 0.579), V(0.515, 0.64)],
                    [V(-0.296, 0.496), V(-0.225, 0.458), V(-0.206, 0.354), V(-0.246, -0.602)],
                    [V(0.094, 0.556), V(0.16, 0.517), V(0.173, 0.427), V(0.154, -0.533), V(0.113, -0.567)],
                    [V(-0.658, 0.048), V(-0.427, -0.208)],
                    [V(0.542, 0.256), V(0.585, 0.169), V(0.235, -0.167)],
                    [V(-0.794, -0.662), V(-0.642, -0.706), V(0.637, -0.604), V(0.825, -0.673)]
                ]
            }
        ];

        const coreLineMat = new THREE.LineBasicMaterial({ color: 0xfffbeb, transparent: true, opacity: 0.95 });
        const glowLineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55 });

        const tipGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
        const penTip = new THREE.Mesh(tipGeo, tipMat);
        penTip.visible = false;
        charGroup.add(penTip);

        let charIdx = 0, strokeIdx = 0, strokeT = 0;
        let phase = 'drawing'; // 'drawing' | 'showing' | 'fading'
        let showTimer = 0, fadeT = 1;
        let activeStrokes = [];

        const clearStrokes = () => {
            activeStrokes.forEach(s => {
                charGroup.remove(s.core); charGroup.remove(s.glow);
                s.core.geometry.dispose(); s.glow.geometry.dispose();
            });
            activeStrokes = [];
            penTip.visible = false;
        };

        const startChar = (idx) => {
            clearStrokes();
            charIdx = idx; strokeIdx = 0; strokeT = 0;
            phase = 'drawing'; fadeT = 1;
            coreLineMat.opacity = 0.95; glowLineMat.opacity = 0.55;
        };
        startChar(0);

        // --- 7. Mouse/Touch Rotation Controls ---
        let dragging = false, pX = 0, pY = 0;
        let rotY = 0, rotX = 0;
        const AUTO_SPEED = 0.003;

        canvas.addEventListener('pointerdown', (e) => {
            dragging = true; pX = e.clientX; pY = e.clientY;
            canvas.style.cursor = 'grabbing'; e.preventDefault();
        });
        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            rotY += (e.clientX - pX) * 0.005;
            rotX += (e.clientY - pY) * 0.005;
            rotX = Math.max(-0.45, Math.min(0.45, rotX));
            pX = e.clientX; pY = e.clientY;
        });
        window.addEventListener('pointerup', () => {
            dragging = false; canvas.style.cursor = 'grab';
        });

        // --- 8. Animation Loop ---
        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);

            // Only render when the Home tab is visible
            const homePanel = document.getElementById('home');
            if (!homePanel || !homePanel.classList.contains('active') || homePanel.style.display === 'none') return;
            if (!this.playing) return;

            const dt = clock.getDelta();
            const t = clock.getElapsedTime();

            // --- Day/night adaptive lighting ---
            const now = new Date();
            const mins = now.getHours() * 60 + now.getMinutes();
            const isNight = mins >= 1125 || mins < 360; // 6:45 PM to 6:00 AM

            if (isNight) {
                ambientLight.color.setHex(0x1e293b);
                ambientLight.intensity = 0.4;
                mainLight.color.setHex(0x38bdf8);
                mainLight.intensity = 0.5;
                fillLight.color.setHex(0x1e293b);
                fillLight.intensity = 0.2;

                // Lantern glows at night
                bodyMat.emissive.setHex(0xcc1133);
                const flicker = Math.sin(t * 7) * 0.15;
                lanternLight.intensity = 2.2 + flicker;

                // Ground darker
                groundMat.color.setHex(0x0f1a14);
                groundMat.opacity = 0.35;
            } else {
                ambientLight.color.setHex(0xfff8f0);
                ambientLight.intensity = 0.7;
                mainLight.color.setHex(0xffeedd);
                mainLight.intensity = 1.0;
                fillLight.color.setHex(0xdbeafe);
                fillLight.intensity = 0.35;

                bodyMat.emissive.setHex(0x220000);
                lanternLight.intensity = 0;

                groundMat.color.setHex(0x1a3a2a);
                groundMat.opacity = 0.2;
            }

            // --- Auto rotation (normalized) ---
            if (!dragging) rotY += AUTO_SPEED;
            // Normalize rotY to prevent float overflow
            if (rotY > Math.PI * 2) rotY -= Math.PI * 2;
            if (rotY < -Math.PI * 2) rotY += Math.PI * 2;

            sceneGroup.rotation.y += (rotY - sceneGroup.rotation.y) * 0.06;
            sceneGroup.rotation.x += (rotX - sceneGroup.rotation.x) * 0.06;

            // --- Bamboo sway ---
            bambooJoints.forEach((j, i) => {
                j.rotation.z = Math.sin(t * 0.8 + i * 0.5) * 0.02;
                j.rotation.x = Math.cos(t * 0.6 + i * 0.3) * 0.01;
            });

            // --- Lantern gentle swing ---
            lanternGroup.rotation.z = Math.sin(t * 0.7) * 0.03;

            // --- Calligraphy stroke-by-stroke ---
            const ch = charsData[charIdx];

            if (phase === 'drawing') {
                strokeT += dt * 1.3;
                if (strokeT > 1) strokeT = 1;

                if (activeStrokes.length <= strokeIdx) {
                    const pts = ch.strokes[strokeIdx];
                    const coreG = new THREE.BufferGeometry();
                    const glowG = new THREE.BufferGeometry();
                    const core = new THREE.Line(coreG, coreLineMat);
                    const glow = new THREE.Line(glowG, glowLineMat);
                    glow.scale.set(1.03, 1.03, 1.03);
                    charGroup.add(core); charGroup.add(glow);
                    activeStrokes.push({ core, glow, pts });
                }

                const so = activeStrokes[strokeIdx];
                const drawn = [];
                const segs = so.pts.length - 1;
                if (segs > 0) {
                    const sf = strokeT * segs;
                    const full = Math.floor(sf);
                    const partial = sf - full;
                    for (let s = 0; s <= full; s++) drawn.push(so.pts[s].clone());
                    if (full < segs) {
                        drawn.push(new THREE.Vector3().lerpVectors(so.pts[full], so.pts[full + 1], partial));
                    }
                } else {
                    drawn.push(so.pts[0].clone());
                }

                so.core.geometry.setFromPoints(drawn);
                so.glow.geometry.setFromPoints(drawn);
                penTip.position.copy(drawn[drawn.length - 1]);
                penTip.visible = true;

                if (strokeT >= 1) {
                    strokeIdx++; strokeT = 0;
                    if (strokeIdx >= ch.strokes.length) {
                        phase = 'showing'; showTimer = 0; penTip.visible = false;
                    }
                }
            } else if (phase === 'showing') {
                showTimer += dt;
                const pulse = 0.88 + Math.sin(t * 3) * 0.1;
                coreLineMat.opacity = 0.95 * pulse;
                glowLineMat.opacity = 0.55 * pulse;
                if (showTimer >= 3.5) { phase = 'fading'; fadeT = 1; }
            } else if (phase === 'fading') {
                fadeT -= dt * 1.2;
                if (fadeT <= 0) {
                    startChar((charIdx + 1) % charsData.length);
                } else {
                    coreLineMat.opacity = 0.95 * fadeT;
                    glowLineMat.opacity = 0.55 * fadeT;
                }
            }

            renderer.render(scene, camera);
        };

        // --- 9. Resize ---
        const onResize = () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            if (w === 0 || h === 0) return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        window.addEventListener('resize', onResize);
        setTimeout(onResize, 80);
        animate();
    }

}

window.HomeCulturalPortalScene = HomeCulturalPortalScene;
