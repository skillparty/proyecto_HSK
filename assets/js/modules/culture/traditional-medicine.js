// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before TraditionalMedicineModule.");
}

class TraditionalMedicineModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-medicine-content', 'Medicina Tradicional China');
    this.activeTab = 'theory'; // 'theory' or 'practices'
  }

  // Bilingual content
  get content() {
    return {
      es: {
        intro: "La Medicina Tradicional China (MTC) es un sistema médico holístico desarrollado durante más de dos milenios. Se fundamenta en la premisa de que el cuerpo humano es un microsistema en constante relación con las leyes de la naturaleza, buscando mantener la homeostasis a través del equilibrio de fuerzas energéticas y orgánicas contrarias.",
        sourcesTitle: "Fuentes Bibliográficas",
        tabs: {
          theory: "Teoría Fundamental",
          practices: "Aplicaciones Clínicas"
        },
        theory: [
          {
            name: "Qi (气 / 氣)",
            pinyin: "qì",
            meaning: "Energía Vital / Actividad Funcional",
            desc: "Definido históricamente como la sustancia primordial y la fuerza activa que constituye y mantiene la vida. En términos fisiológicos, el Qi representa el conjunto de funciones dinámicas y metabólicas de los órganos y meridianos del cuerpo."
          },
          {
            name: "Yin y Yang (阴阳 / 陰陽)",
            pinyin: "yīn yáng",
            meaning: "Dualidad y Homeostasis",
            desc: "Concepto filosófico y clínico que explica los fenómenos a través de fuerzas opuestas e interdependientes. El Yin (fresco, receptivo, estructural, asociado al agua) y el Yang (caliente, activo, funcional, asociado al fuego) deben coexistir en un dinámico equilibrio. La enfermedad se diagnostica como un exceso o deficiencia de estas fuerzas."
          },
          {
            name: "Cinco Fases (五行)",
            pinyin: "wǔ xíng",
            meaning: "Madera, Fuego, Tierra, Metal y Agua",
            desc: "Un marco conceptual que clasifica los órganos del cuerpo (Zang-Fu) y las funciones corporales según cinco patrones dinámicos en la naturaleza. Este sistema define las relaciones de generación (sheng) y control (ke) mutuo entre los diferentes órganos para mantener la autorregulación fisiológica."
          }
        ],
        practices: [
          {
            name: "Acupuntura y Moxibustión (针灸 / 針灸)",
            pinyin: "zhēn jiǔ",
            meaning: "Estimulación de Puntos y Meridianos (经络)",
            desc: "Consiste en la inserción de finas agujas metálicas estériles en puntos específicos (acupuntos) a lo largo de los canales o meridianos de energía para regular la circulación del Qi. Documentada e integrada formalmente desde la dinastía Tang (唐代), época en la que se expandió hacia Japón, Corea, India y Arabia, hoy en día se practica en más de 140 países y regiones. A menudo se combina con la moxibustión (combustión de hojas secas de Artemisa sobre el punto) para calentar y nutrir los canales corporales."
          },
          {
            name: "Terapia de Ventosas (拔罐)",
            pinyin: "bá guàn",
            meaning: "Terapia de Presión Negativa (Método del Ángulo / 角法)",
            desc: "Método terapéutico que utiliza la succión física y presión negativa sobre la piel para provocar la ruptura capilar controlada y congestión local, estimulando la circulación del Qi y de la sangre, activando la regeneración celular y regulando el sistema inmune. La clasificación técnica de estas herramientas distingue cuatro variantes fundamentales: ventosas de vidrio tradicional (玻璃拔罐器), ventosas de bambú natural (竹筒拔罐器), ventosas de vacío neumático (真空拔罐器) y dispositivos de infrarrojo lejano (远红外拔罐器)."
          },
          {
            name: "Fitoterapia China (中药 / 中藥)",
            pinyin: "zhōng yào",
            meaning: "Farmacología Natural y Fórmulas",
            desc: "El pilar terapéutico más importante de la MTC. Utiliza combinaciones complejas de plantas medicinales, minerales y sustancias naturales para crear fórmulas personalizadas. Cada ingrediente se selecciona según su sabor (amargo, dulce, picante, salado, ácido) y su naturaleza térmica (fría, tibia, neutra, caliente)."
          },
          {
            name: "Tuina y Terapias Manuales (推拿)",
            pinyin: "tuī ná",
            meaning: "Masaje Terapéutico y Movilización",
            desc: "Un sistema de terapia manual que emplea técnicas de tracción, presión y fricción sobre los meridianos y tejidos blandos. Se utiliza para eliminar bloqueos estructurales, estimular la circulación del Qi y de la sangre, y restaurar la movilidad articular en trastornos musculoesqueléticos."
          }
        ],
        citations: [
          "Unschuld, Paul U. (1985). <i>Medicine in China: A History of Ideas</i>. Berkeley: University of California Press.",
          "Kaptchuk, Ted J. (2000). <i>The Web That Has No Weaver: Understanding Chinese Medicine</i>. New York: Contemporary Books.",
          "Cheng, Xinnong. (1987). <i>Chinese Acupuncture and Moxibustion</i>. Beijing: Foreign Languages Press."
        ]
      },
      en: {
        intro: "Traditional Chinese Medicine (TCM) is a holistic medical system developed over more than two millennia. It is based on the premise that the human body is a microsystem in constant relationship with the laws of nature, seeking to maintain homeostasis through the balance of opposing energetic and organic forces.",
        sourcesTitle: "Bibliographical Sources",
        tabs: {
          theory: "Fundamental Theory",
          practices: "Clinical Applications"
        },
        theory: [
          {
            name: "Qi (气 / 气)",
            pinyin: "qì",
            meaning: "Vital Energy / Functional Activity",
            desc: "Historically defined as the primordial substance and active force that constitutes and maintains life. In physiological terms, Qi represents the collection of dynamic and metabolic functions of the body's organs and meridians."
          },
          {
            name: "Yin and Yang (阴阳 / 阴阳)",
            pinyin: "yīn yáng",
            meaning: "Duality and Homeostasis",
            desc: "A philosophical and clinical concept explaining phenomena through opposing yet interdependent forces. Yin (cool, receptive, structural, associated with water) and Yang (hot, active, functional, associated with fire) must coexist in dynamic equilibrium. Illness is diagnosed as an excess or deficiency of these forces."
          },
          {
            name: "Five Phases (五行)",
            pinyin: "wǔ xíng",
            meaning: "Wood, Fire, Earth, Metal, and Water",
            desc: "A conceptual framework classifying body organs (Zang-Fu) and bodily functions according to five dynamic patterns in nature. This system defines the relationships of generation (sheng) and mutual control (ke) among different organs to maintain physiological self-regulation."
          }
        ],
        practices: [
          {
            name: "Acupuncture and Moxibustion (针灸 / 针灸)",
            pinyin: "zhēn jiǔ",
            meaning: "Meridian and Point Stimulation (经络)",
            desc: "Involves inserting fine, sterile metal needles into specific points (acupoints) along energy channels or meridians to regulate Qi circulation. Formally documented since the Tang Dynasty (唐代), when its expansion to Japan, Korea, India, and Arabia began, and currently practiced in more than 140 countries and regions worldwide. It is often combined with moxibustion (burning dried Mugwort leaves over the points) to warm and nourish the body's channels."
          },
          {
            name: "Cupping Therapy (拔罐)",
            pinyin: "bá guàn",
            meaning: "Negative Pressure Therapy (Horn Method / 角法)",
            desc: "A therapeutic method using physical suction and negative pressure on the skin to induce controlled capillary rupture and local congestion, stimulating Qi and blood circulation, activating cellular regeneration, and regulating immune response. Device classifications highlight four key types: traditional glass cupping (玻璃拔罐器), natural bamboo cupping (竹筒拔罐器), pneumatic vacuum cupping (真空拔罐器), and technological far-infrared cupping (远红外拔罐器)."
          },
          {
            name: "Chinese Herbal Medicine (中药 / 中药)",
            pinyin: "zhōng yào",
            meaning: "Natural Pharmacology and Formulas",
            desc: "The primary therapeutic pillar of TCM. It uses complex combinations of medicinal plants, minerals, and natural substances to create custom formulations. Each ingredient is selected according to its taste (bitter, sweet, pungent, salty, sour) and thermal nature (cold, warm, neutral, hot)."
          },
          {
            name: "Tuina and Manual Therapies (推拿)",
            pinyin: "tuī ná",
            meaning: "Therapeutic Massage and Mobilization",
            desc: "A manual therapy system employing traction, pressure, and friction techniques on meridians and soft tissues. It is used to clear structural blockages, stimulate Qi and blood circulation, and restore joint mobility in musculoskeletal disorders."
          }
        ],
        citations: [
          "Unschuld, Paul U. (1985). <i>Medicine in China: A History of Ideas</i>. Berkeley: University of California Press.",
          "Kaptchuk, Ted J. (2000). <i>The Web That Has No Weaver: Understanding Chinese Medicine</i>. New York: Contemporary Books.",
          "Cheng, Xinnong. (1987). <i>Chinese Acupuncture and Moxibustion</i>. Beijing: Foreign Languages Press."
        ]
      }
    };
  }

  async loadData() {
    this.medicineData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-medicine-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-medicine-styles';
      style.textContent = `
        .medicine-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(99, 102, 241, 0.03));
          border-left: 4px solid var(--color-primary, #6366f1);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .medicine-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .medicine-tabs {
          display: flex;
          border-bottom: 2px solid var(--color-border, #eaeaea);
          margin-bottom: 1.5rem;
          gap: 1.5rem;
        }
        .medicine-tab-btn {
          background: none;
          border: none;
          padding: 0.8rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-muted, #666);
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .medicine-tab-btn:hover {
          color: var(--color-primary, #6366f1);
        }
        .medicine-tab-btn.active {
          color: var(--color-primary, #6366f1);
        }
        .medicine-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary, #6366f1);
        }
        .medicine-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .medicine-card {
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-lg, 12px);
          padding: 1.6rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
        }
        .med-header {
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.6rem;
          display: flex;
          align-items: baseline;
          gap: 0.8rem;
          flex-wrap: wrap;
        }
        .med-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-primary, #6366f1);
        }
        .med-header .pinyin-tag {
          font-size: 1rem;
          color: var(--color-text-muted, #666);
          font-weight: 500;
        }
        .med-header .sub-tag {
          font-size: 0.88rem;
          color: var(--color-text-dim, #888);
          margin-left: auto;
        }
        .med-description {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--color-text-main, #444);
          margin: 0;
        }
        .medicine-citations {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .medicine-citations h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .medicine-citations ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .medicine-citations li {
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="medicine-intro">
        <p>${activeContent.intro}</p>
      </div>
      
      <div class="section-header-academic" style="font-size:1.3rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin:2rem 0 1.2rem 0; color:var(--color-text-main, #333); border-bottom:1px solid var(--color-border, #ccc); padding-bottom:0.4rem;">
        ${activeContent.tabs.theory}
      </div>
      <div class="medicine-grid">
    `;

    activeContent.theory.forEach(item => {
      html += `
        <div class="medicine-card">
          <div class="med-header">
            <h3>${item.name}</h3>
            <span class="pinyin-tag">${item.pinyin}</span>
            <span class="sub-tag">${item.meaning}</span>
          </div>
          <p class="med-description">${item.desc}</p>
        </div>
      `;
    });

    html += `</div>
      <div class="section-header-academic" style="font-size:1.3rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin:3rem 0 1.2rem 0; color:var(--color-text-main, #333); border-bottom:1px solid var(--color-border, #ccc); padding-bottom:0.4rem;">
        ${activeContent.tabs.practices}
      </div>
      <div class="medicine-grid">
    `;

    activeContent.practices.forEach(item => {
      html += `
        <div class="medicine-card">
          <div class="med-header">
            <h3>${item.name}</h3>
            <span class="pinyin-tag">${item.pinyin}</span>
            <span class="sub-tag">${item.meaning}</span>
          </div>
          <p class="med-description">${item.desc}</p>
        </div>
      `;
    });

    html += `</div>`;

    // Add Bibliography
    html += `
      <div class="medicine-citations">
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
window.TraditionalMedicineModule = TraditionalMedicineModule;
