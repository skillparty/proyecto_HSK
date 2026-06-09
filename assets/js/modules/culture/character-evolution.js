// Asegurarnos de que CultureModuleBase esté disponible
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before CharacterEvolutionModule.");
}

class CharacterEvolutionModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-characters-content', 'Evolución de Caracteres');
    this.charactersData = [];
  }

  async loadData() {
    try {
      // Intentar cargar JSON real
      const response = await fetch('assets/data/culture/character-evolution.json');
      if (!response.ok) throw new Error('Data file not found');
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Data is not a valid array');
      }
      this.charactersData = data;
    } catch (error) {
      console.log('Using default character evolution data');
      // Datos por defecto si el JSON no existe aún
      this.charactersData = [
        {
          "character": "水",
          "pinyin": "shuǐ",
          "meaning": "Agua",
          "oracle": "🌊", 
          "bronze": "≈", 
          "seal": "水", 
          "description": "El carácter para agua comenzó como un pictograma de un río que fluye. La línea central representa la corriente principal y los trazos laterales son remolinos."
        },
        {
          "character": "木",
          "pinyin": "mù",
          "meaning": "Árbol / Madera",
          "oracle": "🌲", 
          "bronze": "𣎳", 
          "seal": "木", 
          "description": "Originalmente un pictograma de un árbol, con la línea horizontal representando las ramas, la vertical el tronco y las inferiores las raíces."
        },
        {
          "character": "人",
          "pinyin": "rén",
          "meaning": "Persona",
          "oracle": "🚶", 
          "bronze": "𠆢", 
          "seal": "人", 
          "description": "Muestra el perfil de una persona de pie, inclinada hacia adelante (como trabajando en el campo). Simboliza la humanidad."
        }
      ];
    }
  }

  render() {
    if (!this.container) return;

    // Inyectar estilos específicos del módulo si no existen
    if (!document.getElementById('culture-evolution-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-evolution-styles';
      style.textContent = `
        .evolution-intro {
          padding: 1rem 1.5rem;
          background: rgba(229, 62, 62, 0.05);
          border-left: 4px solid var(--primary-color, #e53e3e);
          border-radius: 4px;
          margin-bottom: 2rem;
        }
        .evolution-intro p {
          margin: 0;
          color: var(--text-color, #333);
          line-height: 1.6;
        }
        .evolution-timeline-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .character-evolution-card {
          background: var(--surface-color, #fff);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .character-evolution-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
        }
        .char-header {
          text-align: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 1rem;
        }
        .char-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: var(--primary-color, #e53e3e);
        }
        .char-header p {
          margin: 0;
          color: var(--text-muted, #666);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .evolution-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .step-label {
          font-size: 0.7rem;
          color: var(--text-muted, #666);
          text-transform: uppercase;
          font-weight: 600;
        }
        .step-image {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
          color: var(--text-color, #333);
        }
        .step-arrow {
          color: var(--text-muted, #ccc);
          font-size: 1.2rem;
        }
        .char-modern {
          font-family: 'Noto Sans SC', sans-serif;
          font-weight: 700;
          color: var(--primary-color, #e53e3e);
          background: rgba(229, 62, 62, 0.1);
        }
        .char-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-color, #444);
          margin: 0;
        }
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .character-evolution-card {
            background: #2a2a2a;
            border-color: #333;
          }
          .step-image {
            background: rgba(255,255,255,0.05);
            color: #ddd;
          }
          .char-description { color: #ccc; }
          .evolution-intro { background: rgba(229, 62, 62, 0.1); }
          .evolution-intro p { color: #eee; }
        }
        body.dark-theme .character-evolution-card {
          background: #2a2a2a;
          border-color: #333;
        }
        body.dark-theme .step-image {
          background: rgba(255,255,255,0.05);
          color: #ddd;
        }
        body.dark-theme .char-description { color: #ccc; }
        body.dark-theme .evolution-intro { background: rgba(229, 62, 62, 0.1); }
        body.dark-theme .evolution-intro p { color: #eee; }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="evolution-intro">
        <p>Descubre cómo los caracteres chinos han evolucionado a lo largo de miles de años, desde las inscripciones en huesos oraculares usados para la adivinación (Jiaguwen) hasta la escritura moderna estandarizada (Kaishu).</p>
      </div>
      <div class="evolution-timeline-container">
    `;

    this.charactersData.forEach(char => {
      // Usar emojis provistos o imágenes si existen (en este mock usamos caracteres Unicode como placeholders visuales)
      html += `
        <div class="character-evolution-card">
          <div class="char-header">
            <h3>${char.character} <span style="color: var(--text-color); font-weight: 400; font-size: 1.2rem;">${char.pinyin}</span></h3>
            <p>${char.meaning}</p>
          </div>
          <div class="evolution-steps">
            <div class="step" title="Huesos Oraculares (Jiaguwen) - ~1200 a.C.">
              <div class="step-label">Oracular</div>
              <div class="step-image">${char.oracle}</div>
            </div>
            <div class="step-arrow">→</div>
            <div class="step" title="Inscripciones en Bronce (Jinwen) - ~1000 a.C.">
              <div class="step-label">Bronce</div>
              <div class="step-image">${char.bronze}</div>
            </div>
            <div class="step-arrow">→</div>
            <div class="step" title="Escritura de Sello (Xiaozhuan) - ~220 a.C.">
              <div class="step-label">Sello</div>
              <div class="step-image" style="font-family: serif;">${char.seal}</div>
            </div>
            <div class="step-arrow">→</div>
            <div class="step" title="Escritura Regular (Kaishu) - ~200 d.C. al presente">
              <div class="step-label">Regular</div>
              <div class="step-image char-modern">${char.character}</div>
            </div>
          </div>
          <p class="char-description">${char.description}</p>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}

// In case the class was lazily loaded
window.CharacterEvolutionModule = CharacterEvolutionModule;
