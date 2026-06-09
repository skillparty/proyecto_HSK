// Asegurarnos de que CultureModuleBase esté disponible
if (typeof CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found.");
}

class ChineseTechnologyModule extends CultureModuleBase {
  constructor(app) {
    super(app, 'culture-technology-content', 'Tecnología China');
    this.techData = null;
  }

  async loadData() {
    try {
      const response = await fetch('assets/data/culture/chinese-technology.json');
      if (!response.ok) throw new Error('Data file not found');
      const data = await response.json();
      if (!data || !Array.isArray(data.achievements) || !Array.isArray(data.innovations)) {
        throw new Error('Data format is invalid');
      }
      this.techData = data;
    } catch (error) {
      console.log('Using default chinese technology data');
      this.techData = {
        achievements: [
          { 
            title: "Red de Alta Velocidad (Gaotie)", 
            hanzi: "高铁",
            pinyin: "gāo tiě",
            icon: "🚄",
            desc: "China posee la red ferroviaria de alta velocidad más grande del mundo (más de 40,000 km), conectando miles de ciudades. Los modernos trenes Fuxing (复兴号) alcanzan velocidades de 350 km/h, revolucionando el transporte interurbano."
          },
          { 
            title: "Estación Espacial Tiangong", 
            hanzi: "天宫",
            pinyin: "tiān gōng",
            icon: "🛰️",
            desc: "Significa 'Palacio Celestial'. Completada en 2022, esta estación orbital modular de investigación es 100% de desarrollo chino, marcando un hito independiente en la presencia humana permanente en el espacio."
          },
          { 
            title: "Potencia Naval y Marítima", 
            hanzi: "航海",
            pinyin: "háng hǎi",
            icon: "🚢",
            desc: "China es el principal constructor naval del mundo. Destaca en la creación de megabuques portacontenedores, rompehielos polares (Xuelong) e innovadores portaaviones con tecnología de catapultas electromagnéticas."
          },
          {
            title: "Liderazgo en Energías Limpias",
            hanzi: "新能源",
            pinyin: "xīn néng yuán",
            icon: "⚡",
            desc: "Líder mundial indiscutible en la producción de vehículos eléctricos (EV), baterías de nueva generación y capacidad instalada de energía solar y eólica, impulsando la transición energética global."
          }
        ]
      };
    }
  }

  render() {
    if (!this.container) return;

    if (!document.getElementById('culture-tech-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-tech-styles';
      style.textContent = `
        .tech-intro {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.02));
          border-left: 4px solid #2196F3;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .tech-intro p { margin: 0; line-height: 1.6; }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .tech-card {
          background: var(--surface-color, #fff);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .tech-card:hover { transform: translateY(-10px); }
        .tech-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 20px rgba(33, 150, 243, 0.3);
        }
        .tech-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.4rem;
          color: var(--text-color);
        }
        .tech-card .hanzi {
          font-family: 'Noto Sans SC', sans-serif;
          color: #2196F3;
          font-weight: bold;
          margin-left: 8px;
        }
        .tech-card .pinyin {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .tech-card p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-color);
          opacity: 0.9;
        }
        /* Decoraciones de fondo estilo tecnológico */
        .tech-bg-deco {
          position: absolute;
          right: -20px;
          bottom: -20px;
          font-size: 10rem;
          opacity: 0.03;
          pointer-events: none;
        }
        
        body.dark-theme .tech-card { background: #2a2a2a; border-color: #333; }
        body.dark-theme .tech-intro { background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.05)); }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="tech-intro">
        <p>En las últimas décadas, China ha experimentado una transformación tecnológica sin precedentes. Desde mega-infraestructuras hasta la exploración del espacio profundo, la innovación china está modelando el futuro del planeta.</p>
      </div>
      
      <div class="tech-grid">
    `;

    this.techData.achievements.forEach(item => {
      html += `
        <div class="tech-card">
          <div class="tech-bg-deco">${item.icon}</div>
          <div class="tech-icon-wrapper">${item.icon}</div>
          <h3>${item.title} <span class="hanzi">${item.hanzi}</span></h3>
          <div class="pinyin">${item.pinyin}</div>
          <p>${item.desc}</p>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}

window.ChineseTechnologyModule = ChineseTechnologyModule;
