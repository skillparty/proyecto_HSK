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
        intro: "El arte del maquillaje facial de la Ópera de Pekín (京剧脸谱 - Jīngjù Liǎnpǔ) es una forma de expresión teatral tradicional china y un proceso de maquillaje facial altamente codificado para los actores. La Ópera de Pekín, reconocida como Patrimonio Cultural Inmaterial, utiliza estas técnicas artísticas para transmitir la esencia psicológica y moral de los personajes en escena.",
        sourcesTitle: "Fuentes Bibliográficas",
        rolesTitle: "Roles y Maquillaje Facial",
        extraInfoTitle: "Filosofía del Maquillaje (脸谱)",
        masksTitle: "Simbolismo de los Colores",
        roles: [
          {
            name: "Sheng (生)",
            type: "Personaje Masculino",
            desc: "Representa a los personajes masculinos positivos. A diferencia de las 'caras pintadas', su maquillaje es relativamente sencillo, destacando el espíritu y la dignidad del personaje."
          },
          {
            name: "Dan (旦)",
            type: "Personaje Femenino",
            desc: "Roles femeninos de diversa índole, desde damas nobles hasta mujeres guerreras, históricamente interpretados por hombres."
          },
          {
            name: "Jing (净)",
            type: "Rol Puro (Cara Pintada)",
            desc: "Personajes masculinos de gran prominencia que requieren maquillaje facial (Lianpu) complejo. Generalmente representan figuras de autoridad, guerreros o dioses."
          },
          {
            name: "Chou (丑)",
            type: "Rol Feo (Cómico)",
            desc: "El personaje humorístico o astuto. Se caracteriza por una mancha de polvo blanco en el centro del rostro (alrededor de los ojos y la nariz)."
          }
        ],
        extraInfo: [
          {
            title: "Función Moral",
            text: "Tiene la función artística de 'contener elogios y culpas, distinguiendo entre el bien y el mal', permitiendo al público observar una representación visual de la mentalidad y personalidad del personaje."
          },
          {
            title: "La Imagen del Alma",
            text: "Debido a su capacidad para reflejar el carácter interno mediante patrones externos, el maquillaje facial se conoce en la tradición teatral china como la 'imagen del alma' del personaje. Su evolución es el resultado de siglos de práctica artística, observación y síntesis de los fenómenos de la vida por parte de los artistas operísticos."
          }
        ],
        masks: [
          { color: "Rojo (红)", meaning: "Representa lealtad, valor y rectitud. Usado para personajes heroicos y honorables como Guan Yu.", hex: "#E53935", enName: "Red" },
          { color: "Negro (黑)", meaning: "Simboliza imparcialidad, integridad y un carácter rudo pero justo. Un ejemplo clásico es Bao Zheng.", hex: "#212121", enName: "Black" },
          { color: "Blanco (白)", meaning: "Indica traición, engaño y astucia. Se usa para villanos y personajes siniestros como Cao Cao.", hex: "#F5F5F5", enName: "White" },
          { color: "Amarillo (黄)", meaning: "Refleja ferocidad, ambición y una mente calculadora. Común en guerreros crueles.", hex: "#FDD835", enName: "Yellow" },
          { color: "Azul / Verde (蓝/绿)", meaning: "El azul denota firmeza y valentía; el verde indica un temperamento impulsivo, violento o terco.", hex: "#1E88E5", enName: "Blue/Green" },
          { color: "Oro / Plata (金/银)", meaning: "Se reserva para dioses, espíritus, demonios y seres mitológicos, añadiendo un elemento de misterio y majestuosidad.", hex: "#FFD700", enName: "Gold/Silver" }
        ],
        citations: [
          "Documento de Exposición: (REVISADO) 2024 孔院中文日展览 物品解说-EXPOSITION : 22 abril-20 mayo 2024 (Ítem 12: 京剧脸谱).",
          "Mackerras, Colin. (1997). <i>Peking Opera</i>. Oxford: Oxford University Press."
        ]
      },
      en: {
        intro: "The art of Peking Opera facial makeup (京剧脸谱 - Jīngjù Liǎnpǔ) is a traditional Chinese theatrical expression and a highly codified facial makeup process for actors. Recognized as Intangible Cultural Heritage, it utilizes artistic techniques to convey the psychological and moral essence of characters.",
        sourcesTitle: "Bibliographical Sources",
        rolesTitle: "Roles and Facial Makeup",
        extraInfoTitle: "Makeup Philosophy (脸谱)",
        masksTitle: "Color Symbolism",
        roles: [
          {
            name: "Sheng (生)",
            type: "Male Character",
            desc: "Represents positive male characters. Unlike the 'painted faces', their makeup is relatively simple, emphasizing the character's spirit and dignity."
          },
          {
            name: "Dan (旦)",
            type: "Female Character",
            desc: "Female roles of various kinds, from noble ladies to female warriors, historically performed by men."
          },
          {
            name: "Jing (净)",
            type: "Pure Role (Painted Face)",
            desc: "Prominent male characters requiring complex facial makeup (Lianpu). They generally represent authority figures, warriors, or gods."
          },
          {
            name: "Chou (丑)",
            type: "Ugly Role (Comedian)",
            desc: "The humorous or cunning character. Characterized by a white powder patch in the center of the face (around the eyes and nose)."
          }
        ],
        extraInfo: [
          {
            title: "Moral Function",
            text: "It has the artistic function of 'containing praise and blame, distinguishing between good and evil', allowing the audience to observe a visual representation of the character's mentality and personality."
          },
          {
            title: "Image of the Soul",
            text: "Due to its ability to reflect internal character through external patterns, facial makeup is known in Chinese theatrical tradition as the 'image of the soul' of the character. Its evolution is the result of centuries of artistic practice, observation, and synthesis of life phenomena by opera artists."
          }
        ],
        masks: [
          { color: "Red (红)", meaning: "Represents loyalty, courage, and uprightness. Used for heroic and honorable characters like Guan Yu.", hex: "#E53935", enName: "Red" },
          { color: "Black (黑)", meaning: "Symbolizes impartiality, integrity, and a rough but fair character. A classic example is Bao Zheng.", hex: "#212121", enName: "Black" },
          { color: "White (白)", meaning: "Indicates treachery, deceit, and craftiness. Used for villains and sinister characters like Cao Cao.", hex: "#F5F5F5", enName: "White" },
          { color: "Yellow (黄)", meaning: "Reflects fierceness, ambition, and a calculating mind. Common in cruel warriors.", hex: "#FDD835", enName: "Yellow" },
          { color: "Blue / Green (蓝/绿)", meaning: "Blue denotes firmness and bravery; green indicates an impulsive, violent, or stubborn temperament.", hex: "#1E88E5", enName: "Blue/Green" },
          { color: "Gold / Silver (金/银)", meaning: "Reserved for gods, spirits, demons, and mythological beings, adding an element of mystery and majesty.", hex: "#FFD700", enName: "Gold/Silver" }
        ],
        citations: [
          "Exhibition Document: 2024 Confucius Institute Chinese Language Day Exhibition (Item 12: Peking Opera Facial Makeup).",
          "Mackerras, Colin. (1997). <i>Peking Opera</i>. Oxford: Oxford University Press."
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

      <div class="section-header-academic">${activeContent.extraInfoTitle}</div>
      <div class="roles-grid">
    `;

    activeContent.extraInfo.forEach(info => {
      html += `
        <div class="role-card" style="border-left: 4px solid var(--color-primary, #dc2626);">
          <div class="role-header">
            <h3 style="color: var(--color-text-main, #333); font-size: 1.15rem;">${info.title}</h3>
          </div>
          <p class="role-desc">${info.text}</p>
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
