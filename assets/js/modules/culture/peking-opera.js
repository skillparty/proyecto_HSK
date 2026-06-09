// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found.");
}

class PekingOperaModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-opera-content', 'Ópera de Pekín');
    this.selectedColorIndex = 0;
  }

  // Bilingual content
  get content() {
    return {
      es: {
        intro: "La Ópera de Pekín (京剧 - Jīngjù) es la forma más representativa del teatro tradicional chino, combinando música, canto, danza, acrobacias y artes marciales. Reconocida como Patrimonio Cultural Inmaterial por la UNESCO, se caracteriza por su alto nivel de simbolismo, donde cada movimiento, vestuario y color facial comunica información clave al espectador.",
        sourcesTitle: "Fuentes Bibliográficas",
        rolesTitle: "Los Cuatro Roles Principales (四大行当)",
        masksTitle: "Simbolismo del Color en el Maquillaje (脸谱 / 臉譜)",
        roles: [
          {
            name: "Sheng (生)",
            type: "Personaje Masculino",
            desc: "El papel principal masculino en la ópera. Se subdivide en Lao Sheng (ancianos de carácter digno, con barbas largas), Xiao Sheng (jóvenes refinados con voces agudas) y Wu Sheng (guerreros hábiles en acrobacias y combates)."
          },
          {
            name: "Dan (旦)",
            type: "Personaje Femenino",
            desc: "Representa a todos los personajes femeninos. Históricamente interpretado por hombres, abarca subroles como Qingyi (mujeres nobles y virtuosas), Huadan (chicas jóvenes vivaces u atrevidas) y Wudan (mujeres expertas en artes marciales)."
          },
          {
            name: "Jing (净 / 淨)",
            type: "Cara Pintada",
            desc: "Personajes masculinos de gran temperamento, fuerza o estatus. Sus rostros están pintados con diseños geométricos elaborados (Lianpu) que revelan instantáneamente su personalidad y destino moral."
          },
          {
            name: "Chou (丑 / 醜)",
            type: "El Payaso / Cómico",
            desc: "El personaje humorístico y astuto del elenco. Fácilmente reconocible por una mancha blanca pintada alrededor de los ojos y la nariz. Es el único papel autorizado a improvisar e interactuar directamente con la audiencia."
          }
        ],
        masks: [
          { color: "Rojo (红)", meaning: "Lealtad, rectitud, heroísmo y devoción patriótica. Común en héroes históricos virtuosos como Guan Yu.", hex: "#E53935", enName: "Red" },
          { color: "Negro (黑)", meaning: "Imparcialidad, integridad moral, honestidad incorruptible y fuerza bruta. Representado célebremente por el juez Bao Zheng.", hex: "#212121", enName: "Black" },
          { color: "Blanco (白)", meaning: "Traidoría, astucia, malicia, sospecha y duplicidad. Utilizado típicamente para villanos poderosos como Cao Cao.", hex: "#ECEFF1", enName: "White" },
          { color: "Amarillo (黄)", meaning: "Crueldad, temperamento calculador, ambición oculta y ferocidad implacable.", hex: "#FDD835", enName: "Yellow" },
          { color: "Azul (蓝)", meaning: "Valentía indomable, ferocidad física, rebeldía contra la autoridad y orgullo temerario.", hex: "#1E88E5", enName: "Blue" },
          { color: "Verde (绿)", meaning: "Inestabilidad emocional, carácter violento, impulsividad extrema e irascibilidad.", hex: "#4CAF50", enName: "Green" }
        ],
        citations: [
          "Mackerras, Colin. (1997). <i>Peking Opera</i>. Oxford: Oxford University Press.",
          "Wichmann, Elizabeth. (1991). <i>Listening to Theatre: The Aural Dimension of Beijing Opera</i>. Honolulu: University of Hawaii Press.",
          "Halson, Elizabeth. (1966). <i>Peking Opera: A Short Guide</i>. Oxford: Oxford University Press."
        ]
      },
      en: {
        intro: "Peking Opera (京剧 - Jīngjù) is the most dominant form of traditional Chinese theatre, combining music, vocal performance, mime, dance, acrobatics, and martial arts. Inscribed on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity, it is characterized by its deep symbolism, where every movement, costume, and facial color conveys key information to the audience.",
        sourcesTitle: "Bibliographical Sources",
        rolesTitle: "The Four Main Roles (四大行当)",
        masksTitle: "Color Symbolism in Facial Makeup (Lianpu / 脸谱)",
        roles: [
          {
            name: "Sheng (生)",
            type: "Male Character",
            desc: "The primary male role in the opera. It is subdivided into Lao Sheng (dignified elder men with long beards), Xiao Sheng (refined young men with high-pitched voices), and Wu Sheng (warriors skilled in acrobatics and martial arts)."
          },
          {
            name: "Dan (旦)",
            type: "Female Character",
            desc: "Represents all female characters. Historically performed by men, it covers subroles such as Qingyi (noble, virtuous women), Huadan (vivacious or daring young girls), and Wudan (women skilled in martial combat)."
          },
          {
            name: "Jing (净 / 淨)",
            type: "Painted Face",
            desc: "Male characters with prominent temperaments, strength, or high status. Their faces are painted with elaborate geometric designs (Lianpu) that instantly reveal their personality and moral alignment."
          },
          {
            name: "Chou (丑 / 醜)",
            type: "The Clown / Comedian",
            desc: "The humorous and clever character of the cast. Easily recognizable by a white patch painted around the eyes and nose. It is the only role authorized to improvise and speak directly to the audience."
          }
        ],
        masks: [
          { color: "Red (红)", meaning: "Loyalty, righteousness, heroism, and patriotic devotion. Common in virtuous historical figures like Guan Yu.", hex: "#E53935", enName: "Red" },
          { color: "Black (黑)", meaning: "Impartiality, moral integrity, incorruptible honesty, and raw strength. Famously represented by Judge Bao Zheng.", hex: "#212121", enName: "Black" },
          { color: "White (白)", meaning: "Treachery, cunning, suspicion, and double-dealing. Typically used for powerful villains like Cao Cao.", hex: "#ECEFF1", enName: "White" },
          { color: "Yellow (黄)", meaning: "Cruelty, calculating temperament, hidden ambition, and fierce ruthlessness.", hex: "#FDD835", enName: "Yellow" },
          { color: "Blue (蓝)", meaning: "Indomitable bravery, physical ferocity, stubborness, and wild rebelliousness.", hex: "#1E88E5", enName: "Blue" },
          { color: "Green (绿)", meaning: "Emotional instability, violent character, impulsivity, and extreme irascibility.", hex: "#4CAF50", enName: "Green" }
        ],
        citations: [
          "Mackerras, Colin. (1997). <i>Peking Opera</i>. Oxford: Oxford University Press.",
          "Wichmann, Elizabeth. (1991). <i>Listening to Theatre: The Aural Dimension of Beijing Opera</i>. Honolulu: University of Hawaii Press.",
          "Halson, Elizabeth. (1966). <i>Peking Opera: A Short Guide</i>. Oxford: Oxford University Press."
        ]
      }
    };
  }

  async loadData() {
    this.operaData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-opera-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-opera-styles';
      style.textContent = `
        .opera-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(220, 38, 38, 0.03));
          border-left: 4px solid var(--color-primary, #dc2626);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .opera-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .section-header-academic {
          font-size: 1.3rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 2rem 0 1rem 0;
          color: var(--color-text-main, #333);
          border-bottom: 1px solid var(--color-border, #ccc);
          padding-bottom: 0.4rem;
        }
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .role-card {
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-lg, 12px);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
        }
        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.8rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.4rem;
        }
        .role-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: var(--color-primary, #dc2626);
        }
        .role-header .role-type {
          font-size: 0.85rem;
          color: var(--color-text-muted, #777);
          text-transform: uppercase;
          font-weight: 600;
        }
        .role-desc {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--color-text-main, #444);
          margin: 0;
        }
        .lianpu-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          background: var(--color-bg-card, rgba(0,0,0,0.02));
          padding: 2rem;
          border-radius: var(--radius-lg, 12px);
          border: 1px solid var(--color-border, rgba(0,0,0,0.06));
          margin-bottom: 3rem;
        }
        .color-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .color-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          color: var(--color-text-main, #333);
        }
        .color-item:hover {
          border-color: var(--color-primary, #dc2626);
          transform: translateX(4px);
        }
        .color-item.active {
          border-color: var(--color-primary, #dc2626);
          background: var(--color-bg-card, rgba(220,38,38,0.03));
          box-shadow: var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
        }
        .color-swatch {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
          flex-shrink: 0;
        }
        .color-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem;
          background: var(--color-bg-panel, #fff);
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
        }
        .color-details h3 {
          margin: 0 0 1rem 0;
          font-size: 1.4rem;
          color: var(--color-primary, #dc2626);
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .color-details p {
          margin: 0;
          line-height: 1.65;
          font-size: 0.95rem;
          color: var(--color-text-main, #444);
        }
        .opera-citations {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .opera-citations h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .opera-citations ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .opera-citations li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .lianpu-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1rem;
          }
          .color-list {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
          }
          .color-item {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const selectedColor = activeContent.masks[this.selectedColorIndex];

    let html = `
      <div class="opera-intro">
        <p>${activeContent.intro}</p>
      </div>

      <div class="section-header-academic">${activeContent.rolesTitle}</div>
      <div class="roles-grid">
    `;

    activeContent.roles.forEach(role => {
      html += `
        <div class="role-card">
          <div class="role-header">
            <h3>${role.name}</h3>
            <span class="role-type">${role.type}</span>
          </div>
          <p class="role-desc">${role.desc}</p>
        </div>
      `;
    });

    html += `
      </div>

      <div class="section-header-academic">${activeContent.masksTitle}</div>
      <div class="lianpu-container">
        <div class="color-list">
    `;

    activeContent.masks.forEach((mask, index) => {
      const isActive = index === this.selectedColorIndex;
      html += `
        <div class="color-item ${isActive ? 'active' : ''}" data-color-index="${index}">
          <div class="color-swatch" style="background-color: ${mask.hex};"></div>
          <span>${mask.color}</span>
        </div>
      `;
    });

    html += `
        </div>
        <div class="color-details">
          <h3>
            <div class="color-swatch" style="background-color: ${selectedColor.hex}; width: 22px; height: 22px;"></div>
            ${selectedColor.color}
          </h3>
          <p>${selectedColor.meaning}</p>
        </div>
      </div>
    `;

    // Add Bibliography
    html += `
      <div class="opera-citations">
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

    // Attach click event listeners for lianpu colors
    const colorItems = this.container.querySelectorAll('.color-item');
    colorItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedColorIndex = parseInt(item.getAttribute('data-color-index'));
        this.render();
      });
    });
  }
}

// In case the class was lazily loaded
window.PekingOperaModule = PekingOperaModule;
