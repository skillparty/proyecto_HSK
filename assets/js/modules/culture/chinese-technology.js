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

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-technology-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-technology-styles';
      style.textContent = `
        .culture-hero-banner {
          margin-bottom: 2rem;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
          position: relative;
          background: #000;
        }
        .culture-hero-video {
          width: 100%;
          max-height: 400px;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
          background: #000;
        }
        .culture-hero-img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
          filter: brightness(0.92) contrast(1.05);
          transition: transform 0.4s ease;
        }
        .culture-hero-banner:hover .culture-hero-img {
          transform: scale(1.02);
        }
        .culture-video-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          border: 1px solid rgba(255, 255, 255, 0.25);
          pointer-events: none;
          z-index: 2;
        }
        .culture-media-toggle-btn {
          position: absolute;
          top: 14px;
          left: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          z-index: 3;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .culture-media-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .culture-hero-banner {
            margin-bottom: 1.4rem;
          }
          .culture-hero-video {
            max-height: 240px;
          }
          .culture-hero-img {
            height: 200px;
          }
          .culture-video-badge {
            top: 10px;
            right: 10px;
            font-size: 0.7rem;
            padding: 3px 8px;
          }
          .culture-media-toggle-btn {
            top: 10px;
            left: 10px;
            font-size: 0.7rem;
            padding: 4px 10px;
          }
        }
        .tech-intro {
          padding: 1.8rem 2.2rem;
          background: var(--color-bg-card, #fbfbfb);
          border-left: 4px solid var(--color-primary, #e53935);
          border-radius: var(--radius-lg, 14px);
          margin-bottom: 2.2rem;
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }
        .tech-intro p {
          margin: 0;
          color: var(--color-text-main, #27272a);
          line-height: 1.8;
          font-size: 1rem;
          font-weight: 450;
        }
        .section-header-academic {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 2.5rem 0 1.2rem 0;
          color: var(--color-text-main, #18181b);
          border-bottom: 2px solid var(--color-border, #e4e4e7);
          padding-bottom: 0.6rem;
        }
        .section-header-academic::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 20px;
          background: linear-gradient(to bottom, var(--color-primary, #e53935), var(--color-accent, #facc15));
          border-radius: 2px;
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.8rem;
        }
        .tech-card {
          background: var(--color-bg-panel, #ffffff);
          border: 1px solid var(--color-border, #e4e4e7);
          border-radius: var(--radius-lg, 16px);
          padding: 1.8rem 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .tech-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(229, 57, 53, 0.3);
        }
        .tech-header {
          margin-bottom: 1.2rem;
          border-bottom: 1px solid var(--color-border, #f4f4f5);
          padding-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          flex-wrap: wrap;
        }
        .tech-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-primary, #e53935);
          font-family: 'Noto Serif SC', 'Noto Sans SC', serif;
          font-weight: 800;
        }
        .tech-header .hanzi-tag {
          font-family: 'Noto Serif SC', 'Noto Sans SC', serif;
          color: var(--color-primary, #e53935);
          font-weight: 800;
          font-size: 1.25rem;
        }
        .tech-header .pinyin-tag {
          font-size: 1rem;
          color: var(--color-text-main, #18181b);
          font-weight: 700;
          background: var(--color-bg-card, #f4f4f5);
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid var(--color-border, #e4e4e7);
        }
        .culture-audio-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          background: rgba(229, 57, 53, 0.08);
          border: 1px solid rgba(229, 57, 53, 0.25);
          color: var(--color-primary, #e53935);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .culture-audio-btn:hover {
          background: var(--color-primary, #e53935);
          color: #ffffff;
          border-color: var(--color-primary, #e53935);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
        }
        .culture-audio-btn:active {
          transform: scale(0.95);
        }
        .culture-audio-btn.playing {
          animation: cultureAudioPulse 0.8s ease;
          background: var(--color-primary, #e53935);
          color: #ffffff;
        }
        @keyframes cultureAudioPulse {
          0% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); }
          100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); }
        }
        .tech-desc {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-main, #27272a);
          margin-bottom: 1.5rem;
          flex: 1;
        }
        .tech-metric-box {
          background: var(--color-bg-card, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 12px);
          padding: 1rem 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tech-metric-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--color-text-muted, #71717a);
          font-weight: 700;
        }
        .tech-metric-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-primary, #e53935);
          font-feature-settings: "tnum";
        }
        .tech-citations {
          margin-top: 3.5rem;
          padding: 1.6rem 2rem;
          background: var(--color-bg-panel, #ffffff);
          border: 1px dashed var(--color-border, #d4d4d8);
          border-radius: var(--radius-lg, 14px);
        }
        .tech-citations h4 {
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-primary, #e53935);
          font-weight: 700;
        }
        .tech-citations ul {
          margin: 0;
          padding-left: 1.4rem;
          color: var(--color-text-muted, #71717a);
          font-size: 0.88rem;
          line-height: 1.7;
        }
        .tech-citations li {
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="culture-hero-banner" id="culture-technology-hero">
        <video class="culture-hero-video" 
               id="culture-technology-video"
               src="assets/videos/technologyEvolution.mp4" 
               poster="assets/images/culture/chinese_technology.jpg" 
               controls 
               loop 
               muted 
               autoplay 
               playsinline 
               preload="metadata"
               aria-label="${lang === 'en' ? 'Chinese Technology Video' : 'Vídeo de Tecnología China'}">
          <img src="assets/images/culture/chinese_technology.jpg" alt="Tecnología China" class="culture-hero-img" loading="lazy" />
        </video>
        <img src="assets/images/culture/chinese_technology.jpg" 
             alt="Tecnología China" 
             class="culture-hero-img" 
             id="culture-technology-img"
             style="display: none;" 
             loading="lazy" />
        <span class="culture-video-badge" id="culture-technology-badge" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>${lang === 'en' ? 'Featured Video' : 'Vídeo Ilustrativo'}</span>
        </span>
        <button type="button" class="culture-media-toggle-btn" id="culture-technology-toggle" title="${lang === 'en' ? 'Switch to Photo view' : 'Cambiar a vista Foto'}">
          <span class="toggle-icon">🖼️</span>
          <span class="toggle-text">${lang === 'en' ? 'View Photo' : 'Ver Foto'}</span>
        </button>
      </div>
      <div class="tech-intro">
        <p>${activeContent.intro}</p>
      </div>

      <div class="section-header-academic">
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
            ${this.getSpeakerBtn(item.hanzi, `Escuchar ${item.hanzi}`)}
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
    this.bindAudioButtons();
    if (typeof this.bindMediaToggle === 'function') {
      this.bindMediaToggle('technology', lang);
    }
  }
}

// In case the class was lazily loaded
window.ChineseTechnologyModule = ChineseTechnologyModule;
