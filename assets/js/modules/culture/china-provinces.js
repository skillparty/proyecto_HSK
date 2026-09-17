// china-provinces.js — Módulo de Provincias y Geografía Física de China
// Integra mapa físico interactivo, dialectos, clima, vestimenta y gastronomía tradicional.

if (typeof CultureModuleBase === "undefined" && typeof window.CultureModuleBase === "undefined") {
    console.warn("CultureModuleBase not found.");
}

class ChinaProvincesModule extends (window.CultureModuleBase || CultureModuleBase) {
    constructor(app) {
        super(app, "culture-provinces-content", "Provincias y Geografía de China");
        this.data = null;
        this.activeRegion = "all";
        this.searchQuery = "";
        this.activeView = "map"; // 'map' | 'cards' | 'quiz'
        this.selectedProvince = null;
        this.quizIndex = 0;
        this.quizScore = 0;
        this.quizAnswered = false;
    }

    async loadData() {
        if (this.data) return this.data;
        try {
            const res = await fetch("assets/data/culture/china-provinces.json");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.data = await res.json();
            return this.data;
        } catch (err) {
            console.error("[ChinaProvinces] Error loading data:", err);
            throw err;
        }
    }

    render() {
        if (!this.container || !this.data) return;
        const isEs = (this.app?.currentLanguage || "es") === "es";
        const geo = this.data.physicalGeography;

        this.container.innerHTML = `
            <div class="culture-provinces-container">
                <!-- Hero & Physical Geography Overview -->
                <header class="provinces-hero">
                    <div class="provinces-hero-header">
                        <div class="provinces-hero-icon" aria-hidden="true">🗺️</div>
                        <div>
                            <h2 class="provinces-hero-title">${isEs ? "Geografía Física y Provincias de China" : "Physical Geography & Provinces of China"}</h2>
                            <p class="provinces-hero-subtitle">${isEs ? "Descubre el relieve, dialectos, clima, vestimentas y gastronomía de las 34 divisiones provinciales" : "Explore terrain, dialects, climate, attire, and cuisine across all 34 provincial divisions"}</p>
                        </div>
                    </div>
                    <p class="provinces-overview-text">${isEs ? geo.overview : geo.overviewEn}</p>

                    <!-- Topographical Steps -->
                    <div class="topography-steps-grid">
                        ${geo.steps.map((st) => `
                            <div class="topography-step-card">
                                <span class="topography-step-badge">Paso ${st.step}</span>
                                <h4 class="topography-step-title">${isEs ? st.name : st.nameEn}</h4>
                                <span class="topography-step-alt">${st.altitude}</span>
                                <p class="topography-step-desc">${st.description}</p>
                            </div>
                        `).join("")}
                    </div>
                </header>

                <!-- Navigation Controls & Filters -->
                <div class="provinces-controls-bar">
                    <div class="provinces-top-controls">
                        <div class="provinces-view-switcher">
                            <button type="button" class="provinces-view-btn ${this.activeView === "map" ? "is-active" : ""}" data-view="map">
                                <span>🗺️</span>
                                <span>${isEs ? "Mapa Físico" : "Physical Map"}</span>
                            </button>
                            <button type="button" class="provinces-view-btn ${this.activeView === "cards" ? "is-active" : ""}" data-view="cards">
                                <span>📋</span>
                                <span>${isEs ? "Fichas de Provincias" : "Province Cards"}</span>
                            </button>
                            <button type="button" class="provinces-view-btn ${this.activeView === "quiz" ? "is-active" : ""}" data-view="quiz">
                                <span>🎓</span>
                                <span>${isEs ? "Quiz Geográfico" : "Geography Quiz"}</span>
                            </button>
                        </div>

                        <div class="provinces-search-box">
                            <span class="provinces-search-icon">🔍</span>
                            <input type="text" id="provinces-search-input" class="provinces-search-input" 
                                placeholder="${isEs ? "Buscar provincia, capital, dialecto o comida..." : "Search province, capital, dialect or food..."}"
                                value="${this.escapeHtml(this.searchQuery)}">
                        </div>
                    </div>

                    <!-- Macro-Region Pills -->
                    <div class="provinces-region-filter">
                        <button type="button" class="region-pill-btn ${this.activeRegion === "all" ? "is-active" : ""}" data-region="all">
                            ${isEs ? "Todas (34)" : "All (34)"}
                        </button>
                        ${this.data.regions.map((reg) => `
                            <button type="button" class="region-pill-btn ${this.activeRegion === reg.id ? "is-active" : ""}" data-region="${reg.id}">
                                ${isEs ? reg.name : reg.nameEn}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <!-- Dynamic View Container -->
                <div id="provinces-view-stage">
                    ${this.renderActiveView(isEs)}
                </div>
            </div>

            <!-- Detail Modal Dialog -->
            <dialog id="province-detail-dialog" class="province-detail-dialog" aria-labelledby="modal-prov-title">
                <div id="province-detail-mount"></div>
            </dialog>
        `;

        this.bindEvents();
        this.bindAudioButtons(this.container);
    }

    renderActiveView(isEs) {
        if (this.activeView === "map") {
            return this.renderPhysicalMapView(isEs);
        } else if (this.activeView === "cards") {
            return this.renderCardGridView(isEs);
        } else if (this.activeView === "quiz") {
            return this.renderQuizView(isEs);
        }
        return "";
    }

    /* ---------- Physical Map View ---------- */
    renderPhysicalMapView(isEs) {
        const filtered = this.getFilteredProvinces();
        const selected = this.selectedProvince || (filtered.length > 0 ? filtered[0] : this.data.provinces[0]);

        return `
            <div class="provinces-map-container">
                <div class="provinces-map-header">
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">${isEs ? "Mapa Físico y Topográfico Interactivo de China" : "Interactive Physical Topographical Map of China"}</h3>
                        <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-muted, #71717a);">${isEs ? "Haz clic en cualquier provincia del mapa para explorar su relieve, lenguas, vestimenta y platos típicos." : "Click any province on the map to explore its relief, dialects, attire, and cuisine."}</p>
                    </div>
                    <div class="provinces-map-legend">
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #e53935;"></span><span>Norte (华北)</span></div>
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #1e88e5;"></span><span>Noreste (东北)</span></div>
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #43a047;"></span><span>Este (华东)</span></div>
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #fb8c00;"></span><span>Centro-Sur (中南)</span></div>
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #8e24aa;"></span><span>Suroeste (西南)</span></div>
                        <div class="map-legend-item"><span class="map-legend-color" style="background: #00acc1;"></span><span>Noroeste (西北)</span></div>
                    </div>
                </div>

                <div class="china-svg-wrapper">
                    ${this.generateChinaSvgMap(filtered, selected)}
                </div>

                <!-- Preview strip of selected province -->
                ${selected ? `
                    <div class="province-card" style="margin-top: 10px;" data-prov-id="${selected.id}">
                        <div class="province-card-accent" style="background: ${this.getRegionColor(selected.region)};"></div>
                        <div class="province-card-header">
                            <div class="province-card-names">
                                <span class="province-card-hanzi">
                                    ${selected.name}
                                    ${this.getSpeakerBtn(selected.name, "Pronunciar en chino")}
                                </span>
                                <span class="province-card-pinyin">${selected.pinyin} · ${isEs ? selected.nameEs : selected.nameEn}</span>
                            </div>
                            <span class="province-card-abbr" title="Abreviatura oficial china">${selected.abbr}</span>
                        </div>
                        <div class="province-card-meta">
                            <span class="province-meta-badge">🏛️ ${selected.capital}</span>
                            <span class="province-meta-badge">👥 ${selected.population}</span>
                            <span class="province-meta-badge">⛅ ${selected.climate.split(".")[0]}</span>
                        </div>
                        <div class="province-card-snippets">
                            <div class="province-snippet-row">🗣️ <strong>Lengua:</strong> ${selected.language}</div>
                            <div class="province-snippet-row">🍲 <strong>Comida típica:</strong> ${selected.food.split(":")[1]?.split("(")[0] || selected.food.split(".")[0]}</div>
                            <div class="province-snippet-row">👘 <strong>Traje:</strong> ${selected.attire.split(".")[0]}</div>
                        </div>
                        <div class="province-card-footer">
                            <span style="font-size: 0.8rem; color: var(--text-muted, #71717a);">🏔️ ${selected.geography.split(".")[0]}</span>
                            <button type="button" class="btn btn-outline province-open-btn" data-prov-id="${selected.id}" style="padding: 4px 12px; font-size: 0.8rem; font-weight: 700;">
                                ${isEs ? "Ver Ficha Completa →" : "View Full Profile →"}
                            </button>
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    generateChinaSvgMap(filteredList, selectedProv) {
        // High quality stylized geographic grid-and-vector representation of China's 34 provinces
        // Viewbox: 0 0 960 680
        const provPositions = {
            // Noroeste
            xinjiang: { x: 160, y: 190, w: 190, h: 140, label: "新疆 Xinjiang", short: "新" },
            tibet: { x: 190, y: 390, w: 190, h: 130, label: "西藏 Tíbet", short: "藏" },
            qinghai: { x: 370, y: 300, w: 120, h: 100, label: "青海 Qinghai", short: "青" },
            gansu: { x: 420, y: 220, w: 90, h: 80, label: "甘肃 Gansu", short: "甘" },
            ningxia: { x: 500, y: 260, w: 45, h: 50, label: "宁夏 Ningxia", short: "宁" },

            // Norte
            inner_mongolia: { x: 440, y: 120, w: 250, h: 70, label: "内蒙古 Mongolia Int.", short: "蒙" },
            shaanxi: { x: 525, y: 320, w: 55, h: 90, label: "陕西 Shaanxi", short: "陕" },
            shanxi: { x: 585, y: 255, w: 45, h: 75, label: "山西 Shanxi", short: "晋" },
            beijing: { x: 655, y: 225, w: 35, h: 30, label: "北京 Beijing", short: "京" },
            tianjin: { x: 675, y: 255, w: 32, h: 28, label: "天津 Tianjin", short: "津" },
            hebei: { x: 635, y: 220, w: 60, h: 90, label: "河北 Hebei", short: "冀" },

            // Noreste
            liaoning: { x: 740, y: 190, w: 65, h: 55, label: "辽宁 Liaoning", short: "辽" },
            jilin: { x: 790, y: 140, w: 75, h: 55, label: "吉林 Jilin", short: "吉" },
            heilongjiang: { x: 800, y: 55, w: 100, h: 85, label: "黑龙江 Heilongjiang", short: "黑" },

            // Llanuras Centrales y Este
            shandong: { x: 670, y: 290, w: 75, h: 55, label: "山东 Shandong", short: "鲁" },
            henan: { x: 590, y: 335, w: 65, h: 65, label: "河南 Henan", short: "豫" },
            anhui: { x: 675, y: 365, w: 55, h: 65, label: "安徽 Anhui", short: "皖" },
            jiangsu: { x: 725, y: 345, w: 55, h: 55, label: "江苏 Jiangsu", short: "苏" },
            shanghai: { x: 785, y: 385, w: 32, h: 30, label: "上海 Shanghái", short: "沪" },
            zhejiang: { x: 740, y: 415, w: 55, h: 55, label: "浙江 Zhejiang", short: "浙" },
            jiangxi: { x: 665, y: 440, w: 55, h: 70, label: "江西 Jiangxi", short: "赣" },
            fujian: { x: 720, y: 480, w: 55, h: 65, label: "福建 Fujian", short: "闽" },

            // Centro-Sur y Suroeste
            hubei: { x: 585, y: 405, w: 75, h: 55, label: "湖北 Hubei", short: "鄂" },
            hunan: { x: 590, y: 470, w: 65, h: 70, label: "湖南 Hunan", short: "湘" },
            chongqing: { x: 520, y: 415, w: 55, h: 55, label: "重庆 Chongqing", short: "渝" },
            sichuan: { x: 410, y: 390, w: 105, h: 100, label: "四川 Sichuan", short: "川" },
            guizhou: { x: 505, y: 480, w: 65, h: 60, label: "贵州 Guizhou", short: "贵" },
            yunnan: { x: 405, y: 500, w: 95, h: 100, label: "云南 Yunnan", short: "滇" },
            guangxi: { x: 555, y: 545, w: 85, h: 65, label: "广西 Guangxi", short: "桂" },
            guangdong: { x: 645, y: 535, w: 85, h: 65, label: "广东 Cantón", short: "粤" },
            hainan: { x: 620, y: 625, w: 45, h: 40, label: "海南 Hainan", short: "琼" },

            // RAEs y Taiwán
            hong_kong: { x: 685, y: 595, w: 32, h: 26, label: "香港 HK", short: "港" },
            macau: { x: 650, y: 598, w: 30, h: 24, label: "澳门 MO", short: "澳" },
            taiwan: { x: 800, y: 515, w: 42, h: 65, label: "台湾 Taiwán", short: "台" }
        };

        const activeIds = new Set(filteredList.map((p) => p.id));
        const selectedId = selectedProv ? selectedProv.id : null;

        const renderedBoxes = Object.entries(provPositions).map(([id, pos]) => {
            const prov = this.data.provinces.find((p) => p.id === id);
            if (!prov) return "";
            const isMatch = activeIds.has(id);
            const isSelected = id === selectedId;
            const regColor = this.getRegionColor(prov.region);

            const fillColor = isSelected
                ? "#d32f2f"
                : isMatch
                ? regColor
                : "#d4d4d8";
            const opacity = isMatch ? "0.92" : "0.35";
            const strokeColor = isSelected ? "#facc15" : "#ffffff";
            const strokeWidth = isSelected ? "3.5" : "1.5";

            return `
                <g class="map-province-interactive-group" data-prov-id="${id}" style="cursor: pointer;">
                    <rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" rx="10" ry="10"
                        fill="${fillColor}" fill-opacity="${opacity}" stroke="${strokeColor}" stroke-width="${strokeWidth}"
                        class="map-province-path">
                        <title>${prov.name} · ${prov.pinyin} (${prov.capital})</title>
                    </rect>
                    <text x="${pos.x + pos.w / 2}" y="${pos.y + pos.h / 2 - 4}" 
                        text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff" pointer-events="none">
                        ${pos.short}
                    </text>
                    <text x="${pos.x + pos.w / 2}" y="${pos.y + pos.h / 2 + 13}" 
                        text-anchor="middle" font-size="9" font-weight="600" fill="#ffffff" fill-opacity="0.95" pointer-events="none">
                        ${prov.pinyin.split(" ")[0]}
                    </text>
                </g>
            `;
        }).join("");

        return `
            <svg viewBox="100 20 780 660" class="china-svg-map" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa de Provincias de China">
                <defs>
                    <linearGradient id="yellowRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#d97706" stop-opacity="0.95"/>
                    </linearGradient>
                    <linearGradient id="yangtzeRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.95"/>
                    </linearGradient>
                </defs>

                <!-- Two Great Rivers -->
                <!-- Yellow River (黄河) Path approx -->
                <path d="M 380 340 Q 420 280 470 240 T 520 230 Q 560 210 590 280 T 630 310 Q 670 315 720 295" 
                    fill="none" stroke="url(#yellowRiverGrad)" stroke-width="4.5" class="map-river-path">
                    <title>Río Amarillo (黄河 · Huáng Hé) - 5.464 km</title>
                </path>
                <!-- Yangtze River (长江) Path approx -->
                <path d="M 320 430 Q 380 440 440 450 T 520 440 Q 580 420 630 430 T 720 380 Q 760 375 795 385" 
                    fill="none" stroke="url(#yangtzeRiverGrad)" stroke-width="5" class="map-river-path">
                    <title>Río Yangtsé (长江 · Cháng Jiāng) - 6.300 km</title>
                </path>

                <!-- Mountain Qinling Range line approx -->
                <path d="M 450 365 L 610 365" fill="none" stroke="#78350f" stroke-width="3" stroke-dasharray="6,4" opacity="0.6">
                    <title>Línea Qinling-Huaihe (秦岭-淮河线) - Divisoria Norte / Sur</title>
                </path>

                <!-- Province blocks -->
                ${renderedBoxes}
            </svg>
        `;
    }

    /* ---------- Card Grid View ---------- */
    renderCardGridView(isEs) {
        const filtered = this.getFilteredProvinces();

        if (filtered.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; background: var(--bg-card, #ffffff); border-radius: 16px;">
                    <p style="font-size: 1.1rem; color: var(--text-muted, #71717a);">
                        ${isEs ? "No se encontraron provincias con ese filtro de búsqueda." : "No provinces found matching your query."}
                    </p>
                </div>
            `;
        }

        return `
            <div class="provinces-grid">
                ${filtered.map((prov) => `
                    <div class="province-card" data-prov-id="${prov.id}">
                        <div class="province-card-accent" style="background: ${this.getRegionColor(prov.region)};"></div>
                        <div class="province-card-header">
                            <div class="province-card-names">
                                <span class="province-card-hanzi">
                                    ${prov.name}
                                    ${this.getSpeakerBtn(prov.name, "Pronunciar en chino")}
                                </span>
                                <span class="province-card-pinyin">${prov.pinyin} · ${isEs ? prov.nameEs : prov.nameEn}</span>
                            </div>
                            <span class="province-card-abbr" title="Abreviatura oficial china">${prov.abbr}</span>
                        </div>

                        <div class="province-card-meta">
                            <span class="province-meta-badge">🏛️ ${prov.capital}</span>
                            <span class="province-meta-badge">👥 ${prov.population}</span>
                            <span class="province-meta-badge">⛅ ${prov.climate.split(".")[0].slice(0, 30)}...</span>
                        </div>

                        <div class="province-card-snippets">
                            <div class="province-snippet-row">🗣️ <strong>Lengua:</strong> ${prov.language.slice(0, 36)}...</div>
                            <div class="province-snippet-row">🍲 <strong>Comida:</strong> ${prov.food.split(":")[1]?.slice(0, 38) || prov.food.slice(0, 38)}...</div>
                            <div class="province-snippet-row">👘 <strong>Traje:</strong> ${prov.attire.slice(0, 38)}...</div>
                        </div>

                        <div class="province-card-footer">
                            <span style="font-size: 0.75rem; color: var(--text-muted, #71717a);">${prov.type}</span>
                            <span class="province-detail-link">
                                ${isEs ? "Ver detalles →" : "View details →"}
                            </span>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    /* ---------- Quiz View ---------- */
    renderQuizView(isEs) {
        const quizList = this.data.quiz || [];
        if (quizList.length === 0) return "";
        const q = quizList[this.quizIndex];

        return `
            <div class="provinces-quiz-container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary, #e53935);">
                        ${isEs ? "Pregunta" : "Question"} ${this.quizIndex + 1} / ${quizList.length}
                    </span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: #10b981;">
                        ${isEs ? "Puntuación:" : "Score:"} ${this.quizScore}
                    </span>
                </div>

                <div class="quiz-question-card">
                    <h3 class="quiz-question-title">${isEs ? q.question : q.questionEn}</h3>
                    <div class="quiz-options-list">
                        ${q.options.map((opt, idx) => `
                            <button type="button" class="quiz-option-btn" data-opt-idx="${idx}">
                                ${opt}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <div id="quiz-feedback-box" style="display: none;" class="quiz-feedback-box"></div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                    <button type="button" id="quiz-next-btn" class="btn btn-primary" style="display: none;">
                        ${this.quizIndex === quizList.length - 1 ? (isEs ? "Finalizar Quiz" : "Finish Quiz") : (isEs ? "Siguiente Pregunta →" : "Next Question →")}
                    </button>
                    <button type="button" id="quiz-reset-btn" class="btn btn-outline">
                        ${isEs ? "Reiniciar Quiz" : "Reset Quiz"}
                    </button>
                </div>
            </div>
        `;
    }

    /* ---------- Detail Dialog Rendering ---------- */
    openProvinceModal(provId) {
        const prov = this.data.provinces.find((p) => p.id === provId);
        if (!prov) return;
        this.selectedProvince = prov;

        const dialog = document.getElementById("province-detail-dialog");
        const mount = document.getElementById("province-detail-mount");
        if (!dialog || !mount) return;

        const isEs = (this.app?.currentLanguage || "es") === "es";

        mount.innerHTML = `
            <div class="province-modal-content">
                <header class="province-modal-header">
                    <div class="province-modal-title-wrap">
                        <h3 id="modal-prov-title" class="province-modal-title">
                            ${prov.name} · ${prov.pinyin}
                            ${this.getSpeakerBtn(prov.name, "Escuchar pronunciación")}
                        </h3>
                        <span class="province-modal-sub">${isEs ? prov.nameEs : prov.nameEn} (${prov.type})</span>
                    </div>
                    <button type="button" class="modal-close-btn" id="modal-prov-close" aria-label="Cerrar">✕</button>
                </header>

                <div class="province-modal-body">
                    <!-- Quick Stats Strip -->
                    <div class="province-stats-strip">
                        <div class="stat-item">
                            <span class="stat-label">${isEs ? "Capital" : "Capital"}</span>
                            <span class="stat-value">
                                ${prov.capital}
                                ${this.getSpeakerBtn(prov.capitalZh || prov.capital.split("·")[1]?.trim() || prov.capital, "Escuchar capital")}
                            </span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${isEs ? "Abreviatura" : "Abbr"}</span>
                            <span class="stat-value">${prov.abbr}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${isEs ? "Población" : "Population"}</span>
                            <span class="stat-value">${prov.population}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${isEs ? "Superficie" : "Area"}</span>
                            <span class="stat-value">${prov.area || "--"}</span>
                        </div>
                    </div>

                    <!-- Languages -->
                    <div class="province-section-card">
                        <h4 class="province-section-title">🗣️ ${isEs ? "Lenguas y Dialectos Hablados" : "Languages & Dialects"}</h4>
                        <p class="province-section-body">${prov.language}</p>
                    </div>

                    <!-- Climate & Physical Geography -->
                    <div class="province-section-card">
                        <h4 class="province-section-title">⛅ ${isEs ? "Clima y Geografía Física" : "Climate & Physical Geography"}</h4>
                        <p class="province-section-body"><strong>Clima:</strong> ${prov.climate}</p>
                        <p class="province-section-body" style="margin-top: 6px;"><strong>Relieve:</strong> ${prov.geography}</p>
                    </div>

                    <!-- Traditional Attire -->
                    <div class="province-section-card">
                        <h4 class="province-section-title">👘 ${isEs ? "Vestimenta y Trajes Tradicionales" : "Traditional Attire & Costumes"}</h4>
                        <p class="province-section-body">${prov.attire}</p>
                    </div>

                    <!-- Cuisine & Food -->
                    <div class="province-section-card">
                        <h4 class="province-section-title">🍲 ${isEs ? "Gastronomía y Comidas Típicas" : "Cuisine & Signature Dishes"}</h4>
                        <p class="province-section-body">${prov.food}</p>
                    </div>

                    <!-- Cultural Highlights -->
                    <div class="province-section-card">
                        <h4 class="province-section-title">🏞️ ${isEs ? "Patrimonio y Lugares Icónicos" : "Heritage & Iconic Sites"}</h4>
                        <p class="province-section-body">${prov.highlights}</p>
                    </div>

                    <!-- Trivia -->
                    ${prov.trivia ? `
                        <div class="province-section-card" style="background: #fffbeb; border-color: #fde68a;">
                            <h4 class="province-section-title" style="color: #92400e;">💡 ${isEs ? "¿Sabías que...?" : "Did you know?"}</h4>
                            <p class="province-section-body" style="color: #78350f;">${prov.trivia}</p>
                        </div>
                    ` : ""}
                </div>

                <footer class="province-modal-footer">
                    <button type="button" class="btn btn-secondary" id="modal-prov-got-it">${isEs ? "Cerrar Ficha" : "Close"}</button>
                </footer>
            </div>
        `;

        this.bindAudioButtons(mount);

        const closeBtn = mount.querySelector("#modal-prov-close");
        const gotItBtn = mount.querySelector("#modal-prov-got-it");
        if (closeBtn) closeBtn.addEventListener("click", () => dialog.close());
        if (gotItBtn) gotItBtn.addEventListener("click", () => dialog.close());

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            dialog.style.display = "block";
        }
    }

    /* ---------- Helpers & Filtering ---------- */

    getFilteredProvinces() {
        if (!this.data || !this.data.provinces) return [];
        let list = this.data.provinces;

        if (this.activeRegion !== "all") {
            list = list.filter((p) => p.region === this.activeRegion);
        }

        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase().trim();
            list = list.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.pinyin.toLowerCase().includes(q) ||
                p.nameEs.toLowerCase().includes(q) ||
                p.capital.toLowerCase().includes(q) ||
                p.language.toLowerCase().includes(q) ||
                p.food.toLowerCase().includes(q) ||
                p.attire.toLowerCase().includes(q) ||
                p.climate.toLowerCase().includes(q) ||
                p.geography.toLowerCase().includes(q)
            );
        }

        return list;
    }

    getRegionColor(regionId) {
        const found = this.data?.regions?.find((r) => r.id === regionId);
        return found ? found.color : "#43a047";
    }

    bindEvents() {
        if (!this.container) return;

        // View Switcher buttons
        this.container.querySelectorAll(".provinces-view-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const view = btn.dataset.view;
                if (view && view !== this.activeView) {
                    this.activeView = view;
                    this.render();
                }
            });
        });

        // Region filter pills
        this.container.querySelectorAll(".region-pill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const reg = btn.dataset.region;
                if (reg) {
                    this.activeRegion = reg;
                    this.render();
                }
            });
        });

        // Search input
        const searchInput = this.container.querySelector("#provinces-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value;
                const stage = this.container.querySelector("#provinces-view-stage");
                if (stage) {
                    stage.innerHTML = this.renderActiveView((this.app?.currentLanguage || "es") === "es");
                    this.bindStageEvents(stage);
                    this.bindAudioButtons(stage);
                }
            });
        }

        const stage = this.container.querySelector("#provinces-view-stage");
        if (stage) {
            this.bindStageEvents(stage);
        }
    }

    bindStageEvents(stage) {
        // Map clicks
        stage.querySelectorAll(".map-province-interactive-group").forEach((grp) => {
            grp.addEventListener("click", () => {
                const id = grp.dataset.provId;
                if (id) {
                    this.openProvinceModal(id);
                }
            });
        });

        // Card clicks / view detail buttons
        stage.querySelectorAll(".province-card, .province-open-btn").forEach((el) => {
            el.addEventListener("click", (e) => {
                if (e.target.closest("[data-culture-speak]")) return;
                const id = el.dataset.provId || el.closest(".province-card")?.dataset.provId;
                if (id) {
                    this.openProvinceModal(id);
                }
            });
        });

        // Quiz interactions
        stage.querySelectorAll(".quiz-option-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (this.quizAnswered) return;
                this.quizAnswered = true;
                const optIdx = parseInt(btn.dataset.optIdx, 10);
                const q = this.data.quiz[this.quizIndex];
                const isCorrect = optIdx === q.correct;

                btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
                if (isCorrect) this.quizScore++;

                const feedback = stage.querySelector("#quiz-feedback-box");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.innerHTML = `
                        <p style="margin: 0; font-weight: 700; color: ${isCorrect ? "#065f46" : "#991b1b"};">
                            ${isCorrect ? "✅ ¡Correcto!" : "❌ Respuesta incorrecta"}
                        </p>
                        <p style="margin: 4px 0 0; font-size: 0.86rem;">${q.explanation}</p>
                    `;
                }

                const nextBtn = stage.querySelector("#quiz-next-btn");
                if (nextBtn) nextBtn.style.display = "inline-flex";
            });
        });

        const nextBtn = stage.querySelector("#quiz-next-btn");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const quizList = this.data.quiz || [];
                if (this.quizIndex < quizList.length - 1) {
                    this.quizIndex++;
                    this.quizAnswered = false;
                    this.render();
                } else {
                    alert(`🎉 ¡Quiz completado! Tu puntuación final es: ${this.quizScore} de ${quizList.length}`);
                    this.quizIndex = 0;
                    this.quizScore = 0;
                    this.quizAnswered = false;
                    this.render();
                }
            });
        }

        const resetBtn = stage.querySelector("#quiz-reset-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                this.quizIndex = 0;
                this.quizScore = 0;
                this.quizAnswered = false;
                this.render();
            });
        }
    }

    escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
}

window.ChinaProvincesModule = ChinaProvincesModule;
