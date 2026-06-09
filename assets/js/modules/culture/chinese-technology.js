// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found.");
}

class ChineseTechnologyModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-technology-content', 'Tecnología China');
  }

  // Bilingual content
  get content() {
    return {
      es: {
        intro: "El desarrollo científico y tecnológico de China abarca desde las históricas grandes invenciones (papel, brújula, pólvora e imprenta) hasta el liderazgo moderno en infraestructuras físicas y digitales. Hoy en día, la investigación científica china está orientada a la autosuficiencia tecnológica y el desarrollo sostenible en sectores de vanguardia.",
        sourcesTitle: "Fuentes Bibliográficas",
        gridTitle: "Sectores Clave de Liderazgo Tecnológico",
        metricsLabels: {
          keyMetric: "Métrica Clave",
          status: "Estado"
        },
        achievements: [
          { 
            title: "Red Ferroviaria de Alta Velocidad (Gaotie)", 
            hanzi: "高铁",
            pinyin: "gāo tiě",
            metricLabel: "Extensión de la Red",
            metricVal: "45,000 km",
            desc: "China posee la red ferroviaria de alta velocidad más extensa y desarrollada del mundo, conectando el 93% de las ciudades metropolitanas del país. Los trenes de la serie Fuxing (复兴号) operan comercialmente a velocidades sostenidas de 350 km/h, utilizando sistemas avanzados de control de trenes basados en posicionamiento por satélite y tecnologías propietarias de mitigación de fatiga de materiales."
          },
          { 
            title: "Comunicaciones Cuánticas (Satélite Micius)", 
            hanzi: "量子通信",
            pinyin: "liàng zǐ tōng xìn",
            metricLabel: "Distancia de Enlace",
            metricVal: "1,200 km",
            desc: "El lanzamiento del satélite Micius (墨子号) en 2016 marcó el inicio de la criptografía cuántica espacial a nivel global. A través de la distribución de claves cuánticas (QKD) y la decoherencia minimizada, el sistema ha logrado establecer enlaces terrestres e intercontinentales cifrados e inviolables a distancias sin precedentes, sentando las bases para la futura red de Internet cuántico."
          },
          { 
            title: "Estación Espacial Tiangong", 
            hanzi: "天宫",
            pinyin: "tiān gōng",
            metricLabel: "Órbita Operativa",
            metricVal: "340-450 km",
            desc: "Significa 'Palacio Celestial'. Completada en 2022, es la tercera estación espacial orbital de larga duración de la historia y la única operada de forma independiente por un solo país. Compuesta por los módulos Tianhe, Wentian y Mengtian, está equipada con laboratorios de microgravedad avanzada para realizar experimentos en física de fluidos, ciencia de materiales y biotecnología espacial."
          },
          { 
            title: "Energía Solar y Movilidad Eléctrica (EV)", 
            hanzi: "新能源",
            pinyin: "xīn néng yuán",
            metricLabel: "Cuota de Mercado de Baterías",
            metricVal: "37% (CATL)",
            desc: "China lidera la cadena de suministro global de energías renovables y vehículos eléctricos. El país fabrica más del 75% de los módulos solares fotovoltaicos del mundo y alberga a los mayores productores mundiales de baterías de iones de litio. Además, ha implementado con éxito redes de transmisión eléctrica de ultra alta tensión (UHV) en corriente continua (DC) para transportar energía limpia a distancias superiores a 2,000 km."
          }
        ],
        citations: [
          "Needham, Joseph. (1954-present). <i>Science and Civilisation in China</i>. Cambridge: Cambridge University Press.",
          "Chinese Academy of Sciences. (2016). <i>Science and Technology in China: A Roadmap to 2050</i>. Beijing: Springer.",
          "Smil, Vaclav. (2004). <i>China's Past, China's Future: Energy, Food, Environment</i>. London: Routledge."
        ]
      },
      en: {
        intro: "China's scientific and technological development ranges from its historical Great Inventions (paper, compass, gunpowder, and printing) to modern leadership in physical and digital infrastructure. Today, Chinese scientific research is oriented toward technological self-reliance and sustainable development in vanguard sectors.",
        sourcesTitle: "Bibliographical Sources",
        gridTitle: "Key Sectors of Technological Leadership",
        metricsLabels: {
          keyMetric: "Key Metric",
          status: "Status"
        },
        achievements: [
          { 
            title: "High-Speed Rail Network (Gaotie)", 
            hanzi: "高铁",
            pinyin: "gāo tiě",
            metricLabel: "Network Extension",
            metricVal: "45,000 km",
            desc: "China possesses the most extensive high-speed rail network in the world, connecting 93% of the country's metropolitan cities. The Fuxing series trains (复兴号) operate commercially at sustained speeds of 350 km/h, utilizing advanced train control systems based on satellite positioning and proprietary material fatigue mitigation technologies."
          },
          { 
            title: "Quantum Communications (Micius Satellite)", 
            hanzi: "量子通信",
            pinyin: "liàng zǐ tōng xìn",
            metricLabel: "Link Distance",
            metricVal: "1,200 km",
            desc: "The launch of the Micius satellite (墨子号) in 2016 marked the beginning of quantum cryptography in space globally. Through quantum key distribution (QKD) and minimized decoherence, the system has successfully established encrypted, unhackable land and intercontinental links over unprecedented distances, laying the foundations for the future quantum internet."
          },
          { 
            title: "Tiangong Space Station", 
            hanzi: "天宫",
            pinyin: "tiān gōng",
            metricLabel: "Operational Orbit",
            metricVal: "340-450 km",
            desc: "Meaning 'Heavenly Palace', completed in 2022. It is the third long-duration orbital space station in history and the only one operated independently by a single nation. Comprising the Tianhe, Wentian, and Mengtian modules, it features advanced microgravity laboratories for experiments in fluid physics, materials science, and space biotechnology."
          },
          { 
            title: "Solar Energy and Electric Mobility (EV)", 
            hanzi: "新能源",
            pinyin: "xīn néng yuán",
            metricLabel: "Battery Market Share",
            metricVal: "37% (CATL)",
            desc: "China leads the global renewable energy and electric vehicle supply chains. The country manufactures over 75% of the world's solar photovoltaic modules and hosts the world's largest lithium-ion battery producers. Additionally, it has successfully deployed Ultra-High Voltage (UHV) DC power transmission lines to carry clean energy over distances exceeding 2,000 km."
          }
        ],
        citations: [
          "Needham, Joseph. (1954-present). <i>Science and Civilisation in China</i>. Cambridge: Cambridge University Press.",
          "Chinese Academy of Sciences. (2016). <i>Science and Technology in China: A Roadmap to 2050</i>. Beijing: Springer.",
          "Smil, Vaclav. (2004). <i>China's Past, China's Future: Energy, Food, Environment</i>. London: Routledge."
        ]
      }
    };
  }

  async loadData() {
    this.techData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-tech-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-tech-styles';
      style.textContent = `
        .tech-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(33, 150, 243, 0.03));
          border-left: 4px solid var(--color-primary, #2196F3);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .tech-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .tech-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .tech-card {
          background: var(--color-bg-panel, #fff);
          border-radius: var(--radius-lg, 12px);
          padding: 1.8rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
        }
        .tech-header {
          margin-bottom: 1.2rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.6rem;
          display: flex;
          align-items: baseline;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .tech-header h3 {
          margin: 0;
          font-size: 1.6rem;
          color: var(--color-primary, #2196F3);
        }
        .tech-header .hanzi-tag {
          font-family: 'Noto Sans SC', sans-serif;
          color: var(--color-primary, #2196F3);
          font-weight: 700;
          font-size: 1.2rem;
        }
        .tech-header .pinyin-tag {
          font-size: 1rem;
          color: var(--color-text-muted, #666);
        }
        .tech-desc {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--color-text-main, #444);
          margin-bottom: 1.5rem;
        }
        .tech-metric-box {
          background: var(--color-bg-card, rgba(0,0,0,0.02));
          border: 1px solid var(--color-border, rgba(0,0,0,0.05));
          border-radius: var(--radius-md, 8px);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tech-metric-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-muted, #777);
          font-weight: 600;
        }
        .tech-metric-val {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-primary, #2196F3);
        }
        .tech-citations {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .tech-citations h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .tech-citations ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .tech-citations li {
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="tech-intro">
        <p>${activeContent.intro}</p>
      </div>

      <div class="section-header-academic" style="font-size:1.3rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin:2rem 0 1.2rem 0; color:var(--color-text-main, #333); border-bottom:1px solid var(--color-border, #ccc); padding-bottom:0.4rem;">
        ${activeContent.gridTitle}
      </div>

      <div class="tech-grid">
    `;

    activeContent.achievements.forEach(item => {
      html += `
        <div class="tech-card">
          <div class="tech-header">
            <h3>${item.title}</h3>
            <span class="hanzi-tag">${item.hanzi}</span>
            <span class="pinyin-tag">${item.pinyin}</span>
          </div>
          <p class="tech-desc">${item.desc}</p>
          <div class="tech-metric-box">
            <span class="tech-metric-title">${item.metricLabel}</span>
            <span class="tech-metric-val">${item.metricVal}</span>
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Add Bibliography
    html += `
      <div class="tech-citations">
        <h4>${activeContent.sourcesTitle}</h4>
        <ul>
    `;
    activeContent.citations.forEach(cit => {
      html += `<li>${cit}</li>`;
    });
    html += `
        </ul>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

// In case the class was lazily loaded
window.ChineseTechnologyModule = ChineseTechnologyModule;
