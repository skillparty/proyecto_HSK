// Asegurarnos de que CultureModuleBase esté disponible
if (typeof CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found.");
}

class PekingOperaModule extends CultureModuleBase {
  constructor(app) {
    super(app, 'culture-opera-content', 'Ópera de Pekín');
    this.operaData = null;
  }

  async loadData() {
    try {
      const response = await fetch('assets/data/culture/peking-opera.json');
      if (!response.ok) throw new Error('Data file not found');
      this.operaData = await response.json();
    } catch (error) {
      console.log('Using default peking opera data');
      this.operaData = {
        roles: [
          { name: "Sheng (生)", type: "Personaje Masculino", desc: "El papel principal masculino. Se divide en ancianos (Lao Sheng), jóvenes (Xiaosheng) y guerreros (Wusheng)." },
          { name: "Dan (旦)", type: "Personaje Femenino", desc: "Originalmente interpretado solo por hombres. Incluye mujeres maduras (Zhengdan), jóvenes vivaces (Huadan) y guerreras (Wudan)." },
          { name: "Jing (净)", type: "Cara Pintada", desc: "Personajes masculinos de gran fuerza, carácter brusco o de alta posición social. Su maquillaje facial (Lianpu) es muy elaborado." },
          { name: "Chou (丑)", type: "El Payaso", desc: "Personaje cómico, reconocible por una mancha blanca alrededor de los ojos y la nariz. Aporta humor e improvisación." }
        ],
        masks: [
          { color: "Rojo", meaning: "Lealtad, valentía y rectitud.", hex: "#E53935" },
          { color: "Negro", meaning: "Imparcialidad, integridad y rudeza.", hex: "#212121" },
          { color: "Blanco", meaning: "Traición, engaño y astucia.", hex: "#F5F5F5" },
          { color: "Amarillo", meaning: "Crueldad y ambición oculta.", hex: "#FDD835" },
          { color: "Azul/Verde", meaning: "Valentía feroz, rebeldía y terquedad.", hex: "#1E88E5" }
        ]
      };
    }
  }

  render() {
    if (!this.container) return;

    if (!document.getElementById('culture-opera-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-opera-styles';
      style.textContent = `
        .opera-intro {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.02));
          border-left: 4px solid #d32f2f;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .opera-intro p { margin: 0; line-height: 1.6; }
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .role-card {
          background: var(--surface-color, #fff);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }
        .role-card:hover { transform: translateY(-5px); }
        .role-name { font-size: 1.4rem; color: #d32f2f; margin: 0 0 0.5rem 0; }
        .role-type { font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1rem; display: block; }
        .masks-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
        }
        .mask-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--surface-color, #fff);
          padding: 1rem;
          border-radius: 50px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          width: 250px;
        }
        .mask-color-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        .mask-info h4 { margin: 0; font-size: 1rem; }
        .mask-info p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }
        
        body.dark-theme .role-card, body.dark-theme .mask-item { background: #2a2a2a; border-color: #333; }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="opera-intro">
        <p>La Ópera de Pekín (京剧 - Jīngjù) es el arte escénico más representativo de China. Combina canto, recitación, actuación dramática y artes marciales. Su riqueza visual reside en los elaborados vestuarios y el característico maquillaje facial (Lianpu).</p>
      </div>
      
      <h3 style="color: #d32f2f; margin-bottom: 1.5rem;">🎭 Los 4 Roles Principales</h3>
      <div class="roles-grid">
    `;

    this.operaData.roles.forEach(role => {
      html += `
        <div class="role-card">
          <h3 class="role-name">${role.name}</h3>
          <span class="role-type">${role.type}</span>
          <p style="font-size: 0.95rem; margin: 0; line-height: 1.5;">${role.desc}</p>
        </div>
      `;
    });

    html += `
      </div>
      <h3 style="color: #d32f2f; margin-bottom: 1.5rem;">🎨 Significado de los Colores (Lianpu)</h3>
      <p style="margin-bottom: 1.5rem; font-size: 0.95rem;">En los personajes "Jing" (Cara Pintada), el color predominante del maquillaje revela inmediatamente la personalidad del personaje al público.</p>
      <div class="masks-container">
    `;

    this.operaData.masks.forEach(mask => {
      html += `
        <div class="mask-item">
          <div class="mask-color-dot" style="background-color: ${mask.hex};"></div>
          <div class="mask-info">
            <h4>${mask.color}</h4>
            <p>${mask.meaning}</p>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}

window.PekingOperaModule = PekingOperaModule;
