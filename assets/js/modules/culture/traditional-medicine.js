// Asegurarnos de que CultureModuleBase esté disponible
if (typeof CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before TraditionalMedicineModule.");
}

class TraditionalMedicineModule extends CultureModuleBase {
  constructor(app) {
    super(app, 'culture-medicine-content', 'Medicina Tradicional China');
    this.medicineData = null;
  }

  async loadData() {
    try {
      const response = await fetch('assets/data/culture/traditional-medicine.json');
      if (!response.ok) throw new Error('Data file not found');
      const data = await response.json();
      if (!data || !Array.isArray(data.concepts) || !Array.isArray(data.practices)) {
        throw new Error('Data format is invalid');
      }
      this.medicineData = data;
    } catch (error) {
      console.log('Using default traditional medicine data');
      this.medicineData = {
        concepts: [
          { 
            name: "Qi", 
            hanzi: "气", 
            pinyin: "qì", 
            desc: "La energía vital o fuerza de vida que fluye por todo el universo y el cuerpo humano a través de canales llamados meridianos." 
          },
          { 
            name: "Yin y Yang", 
            hanzi: "阴阳", 
            pinyin: "yīn yáng", 
            desc: "Dos fuerzas opuestas pero complementarias. El Yin es frío, pasivo y oscuro; el Yang es caliente, activo y luminoso. La salud depende del equilibrio perfecto entre ambas." 
          },
          { 
            name: "Cinco Elementos", 
            hanzi: "五行", 
            pinyin: "wǔ xíng", 
            desc: "Madera, Fuego, Tierra, Metal y Agua. Este sistema explica las interacciones fisiológicas y patológicas entre los órganos del cuerpo." 
          }
        ],
        practices: [
          { 
            name: "Acupuntura", 
            hanzi: "针灸", 
            pinyin: "zhēn jiǔ",
            icon: "📌", 
            desc: "Inserción de agujas extremadamente finas en puntos específicos (acupuntos) a lo largo de los meridianos para restaurar el flujo de Qi." 
          },
          { 
            name: "Fitoterapia", 
            hanzi: "中药", 
            pinyin: "zhōng yào",
            icon: "🌿", 
            desc: "Uso de miles de plantas medicinales, minerales y otros productos, cuidadosamente combinados en fórmulas personalizadas." 
          },
          { 
            name: "Ventosas", 
            hanzi: "拔罐", 
            pinyin: "bá guàn",
            icon: "🏺", 
            desc: "Aplicación de copas de vidrio o bambú sobre la piel creando un vacío para estimular el flujo sanguíneo y aliviar la tensión." 
          },
          { 
            name: "Tai Chi y Qigong", 
            hanzi: "气功", 
            pinyin: "qì gōng",
            icon: "🧘", 
            desc: "Prácticas de movimiento físico lento, respiración controlada y meditación diseñadas para cultivar, circular y equilibrar el Qi." 
          }
        ]
      };
    }
  }

  render() {
    if (!this.container) return;

    if (!document.getElementById('culture-medicine-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-medicine-styles';
      style.textContent = `
        .medicine-intro {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(46, 139, 87, 0.1), rgba(46, 139, 87, 0.02));
          border-left: 4px solid #2e8b57;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .medicine-intro p {
          margin: 0;
          color: var(--text-color, #333);
          line-height: 1.6;
        }
        .medicine-section-title {
          font-size: 1.5rem;
          color: #2e8b57;
          margin: 2rem 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .medicine-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .concept-card, .practice-card {
          background: var(--surface-color, #fff);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .concept-card:hover, .practice-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        }
        .concept-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #2e8b57, #3cb371);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .card-title-group h3 {
          margin: 0 0 0.2rem 0;
          font-size: 1.2rem;
          color: var(--text-color);
        }
        .card-title-group .hanzi {
          font-size: 1.8rem;
          font-family: 'Noto Sans SC', sans-serif;
          color: rgba(46, 139, 87, 0.2);
          position: absolute;
          top: 10px;
          right: 15px;
          font-weight: bold;
          z-index: 0;
        }
        .card-title-group .pinyin {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .card-desc {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-color);
          position: relative;
          z-index: 1;
        }
        .practice-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: inline-block;
          background: rgba(46, 139, 87, 0.1);
          width: 60px;
          height: 60px;
          line-height: 60px;
          text-align: center;
          border-radius: 50%;
        }
        /* Dark mode */
        body.dark-theme .concept-card, body.dark-theme .practice-card {
          background: #2a2a2a;
          border-color: #333;
        }
        body.dark-theme .medicine-intro {
          background: linear-gradient(135deg, rgba(46, 139, 87, 0.2), rgba(46, 139, 87, 0.05));
        }
        body.dark-theme .medicine-intro p { color: #eee; }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="medicine-intro">
        <p>La Medicina Tradicional China (MTC) es un sistema médico milenario fundamentado en la observación profunda de la naturaleza y el cuerpo humano. No solo busca curar enfermedades, sino prevenirlas manteniendo el equilibrio energético.</p>
      </div>
      
      <h3 class="medicine-section-title"><span>☯️</span> Conceptos Fundamentales</h3>
      <div class="medicine-grid" style="margin-bottom: 3rem;">
    `;

    this.medicineData.concepts.forEach(concept => {
      html += `
        <div class="concept-card">
          <div class="card-header">
            <div class="card-title-group">
              <h3>${concept.name}</h3>
              <div class="pinyin">${concept.pinyin}</div>
              <div class="hanzi">${concept.hanzi}</div>
            </div>
          </div>
          <p class="card-desc">${concept.desc}</p>
        </div>
      `;
    });

    html += `
      </div>
      <h3 class="medicine-section-title"><span>🌿</span> Prácticas Terapéuticas</h3>
      <div class="medicine-grid">
    `;

    this.medicineData.practices.forEach(practice => {
      html += `
        <div class="practice-card">
          <div class="practice-icon">${practice.icon}</div>
          <div class="card-header" style="margin-bottom: 0.5rem;">
            <div class="card-title-group">
              <h3>${practice.name} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted);">(${practice.hanzi})</span></h3>
            </div>
          </div>
          <p class="card-desc">${practice.desc}</p>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}

window.TraditionalMedicineModule = TraditionalMedicineModule;
