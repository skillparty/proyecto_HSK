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
        intro: "El desarrollo científico y tecnológico de China abarca desde las históricas grandes invenciones hasta el liderazgo moderno en infraestructuras físicas y aeroespaciales. La investigación científica contemporánea está orientada a la autosuficiencia tecnológica, la conectividad global y la exploración científica en sectores de vanguardia.",
        sourcesTitle: "Fuentes Bibliográficas",
        gridTitle: "Sectores Clave de Liderazgo Tecnológico",
        metricsLabels: {
          keyMetric: "Métrica Clave",
          status: "Estado"
        },
        achievements: [
          { 
            title: "Red Ferroviaria de Alta Velocidad", 
            hanzi: "高铁",
            pinyin: "gāo tiě",
            metricLabel: "Hito de Ingeniería",
            metricVal: "Proyecto Maglev de 1,000 km/h (2024)",
            desc: "China posee la red de alta velocidad más extensa del mundo. Los trenes de la serie Fuxing (复兴号), introducidos en 2017, operan comercialmente a 350 km/h basándose en un 84% de estándares nacionales y transistores IGBT de alta potencia de desarrollo doméstico. En 2019 se implementó el control autónomo con señal 5G en la línea Beijing-Zhangjiakou. En febrero de 2024, la Academia de Ciencia e Industria Aeroespacial completó exitosamente la prueba a gran escala del automóvil volador de alta velocidad (高速飞车) utilizando suspensión eléctrica superconductora en vacío, apuntando a velocidades de hasta 1,000 km/h."
          },
          { 
            title: "Sistema de Navegación por Satélite Beidou", 
            hanzi: "北斗卫星导航系统",
            pinyin: "běidǒu wèixīng dǎoháng xìtǒng",
            metricLabel: "Precisión de Sincronización",
            metricVal: "10 nanosegundos",
            desc: "Conocido internacionalmente como BDS (o COMPASS) y certificado por la ONU, es un sistema global de navegación que consta de segmentos espacial, terrestre y de usuario. Ofrece posicionamiento de alta precisión a nivel de decímetros y centímetros, medición de velocidad a 0.2 m/s y capacidad exclusiva de comunicación de mensajes cortos (短报文通信). Con acuerdos firmados con 137 países, el sistema expandió su red global tras el lanzamiento del 56º satélite de navegación Beidou el 17 de mayo de 2023 a bordo de un cohete Gran Marcha 3B."
          },
          { 
            title: "Estación Espacial Tiangong (CSS)", 
            hanzi: "天宫空间站",
            pinyin: "tiāngōng kōngjiānzhàn",
            metricLabel: "Dimensiones y Capacidad",
            metricVal: "Hasta 180 toneladas (6 cabinas)",
            desc: "Es el laboratorio espacial nacional de órbita baja (400-450 km) de China, con una vida útil programada de 10 años. Cumple el objetivo de la estrategia de 'tres pasos' para el vuelo tripulado formulada en 1992. Tras el acoplamiento exitoso de la nave Shenzhou 17 en octubre de 2023 y la desorbitación controlada del Tianzhou-6 en enero de 2024, la tripulación culminó en marzo de 2024 la primera fase de experimentos de exposición extravehicular de materiales a condiciones extremas de microgravedad y radiación espacial."
          },
          { 
            title: "Ingeniería Naval: Portaaviones Militares", 
            hanzi: "航空母舰",
            pinyin: "hángkōng mǔjiàn",
            metricLabel: "Estructura de la Flota",
            metricVal: "3 buques operativos (Fujián Nº 18)",
            desc: "El programa naval chino se consolidó con la entrega del portaaviones Liaoning (辽宁舰, ex-Varyag) en septiembre de 2012. Le siguió en diciembre de 2019 el Shandong (山东舰, casco 17), el primer portaaviones de diseño y fabricación íntegramente nacional. El tercer buque, el Fujian (福建舰, casco 18), botado en junio de 2022, representa la vanguardia al incorporar sistemas de catapulta electromagnética. En marzo de 2024, la Armada china confirmó la ausencia de cuellos de botella técnicos en sus nuevos buques, anticipando la propulsión nuclear para futuras unidades."
          }
        ],
        citations: [
          "China Academy of Space Technology. (2024). <i>Tiangong Space Station: Structural Design and Space Science Programs</i>. Beijing: Aerospace Press.",
          "China State Railway Group. (2024). <i>High-Speed Railway Design Standards and Maglev Developments</i>. Beijing: China Railway Publishing.",
          "Needham, Joseph. (1954-present). <i>Science and Civilisation in China</i>. Cambridge: Cambridge University Press.",
          "Yuan, H. (2024). <i>Official Briefings on Naval Modernization and Carrier Propulsion Systems</i>. Ministry of National Defense (PRC)."
        ]
      },
      en: {
        intro: "China's scientific and technological development ranges from its historical Great Inventions to modern leadership in physical and aerospace infrastructure. Contemporary scientific research is oriented toward technological self-reliance, global connectivity, and frontier scientific exploration.",
        sourcesTitle: "Bibliographical Sources",
        gridTitle: "Key Sectors of Technological Leadership",
        metricsLabels: {
          keyMetric: "Key Metric",
          status: "Status"
        },
        achievements: [
          { 
            title: "High-Speed Rail Network", 
            hanzi: "高铁",
            pinyin: "gāo tiě",
            metricLabel: "Engineering Milestone",
            metricVal: "1,000 km/h Maglev Project (2024)",
            desc: "China possesses the most extensive high-speed rail network globally. The Fuxing series trains (复兴号), launched in 2017, operate commercially at 350 km/h, utilizing 84% Chinese national standards and self-developed high-power IGBTs. Autonomous train operation with 5G connectivity was deployed on the Beijing-Zhangjiakou line in 2019. In February 2024, the China Academy of Aerospace Science completed full-scale tests of a high-speed flying car (高速飞车) using superconducting electric levitation in vacuum, aiming for speeds up to 1,000 km/h."
          },
          { 
            title: "Beidou Satellite Navigation System", 
            hanzi: "北斗卫星导航系统",
            pinyin: "běidǒu wèixīng dǎoháng xìtǒng",
            metricLabel: "Timing Accuracy",
            metricVal: "10 nanoseconds",
            desc: "Known internationally as BDS (or COMPASS) and certified by the UN, this global navigation system comprises space, ground, and user segments. It delivers high-precision positioning (decimeter/centimeter level), velocity measurement (0.2 m/s), and unique short-message communication capabilities (短报文通信). With agreements signed with 137 nations, the global network was further expanded with the launch of the 56th Beidou satellite on May 17, 2023, via a Long March 3B rocket."
          },
          { 
            title: "Tiangong Space Station (CSS)", 
            hanzi: "天宫空间站",
            pinyin: "tiāngōng kōngjiānzhàn",
            metricLabel: "Dimensions and Capacity",
            metricVal: "Up to 180 tons (6 cabins)",
            desc: "China's low-Earth orbit (400-450 km) national space laboratory, designed with a 10-year operational life, completes the 'three-step' manned space strategy formulated in 1992. Following the docking of the Shenzhou 17 crew in October 2023 and the controlled re-entry of Tianzhou-6 in January 2024, astronauts completed the first phase of extravehicular material exposure experiments in March 2024 under extreme microgravity."
          },
          { 
            title: "Naval Engineering: Aircraft Carriers", 
            hanzi: "航空母舰",
            pinyin: "hángkōng mǔjiàn",
            metricLabel: "Fleet Composition",
            metricVal: "3 active vessels (Fujian No. 18)",
            desc: "The Chinese carrier program began with the commissioning of the Liaoning (辽宁舰, ex-Varyag) in September 2012. It was followed in December 2019 by the Shandong (山东舰, hull 17), the first fully domestically designed and manufactured carrier. The third vessel, the Fujian (福建舰, hull 18), launched in June 2022, incorporates advanced electromagnetic catapults. In March 2024, naval officials confirmed no technical bottlenecks exist, indicating nuclear propulsion is planned for future units."
          }
        ],
        citations: [
          "China Academy of Space Technology. (2024). <i>Tiangong Space Station: Structural Design and Space Science Programs</i>. Beijing: Aerospace Press.",
          "China State Railway Group. (2024). <i>High-Speed Railway Design Standards and Maglev Developments</i>. Beijing: China Railway Publishing.",
          "Needham, Joseph. (1954-present). <i>Science and Civilisation in China</i>. Cambridge: Cambridge University Press.",
          "Yuan, H. (2024). <i>Official Briefings on Naval Modernization and Carrier Propulsion Systems</i>. Ministry of National Defense (PRC)."
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
