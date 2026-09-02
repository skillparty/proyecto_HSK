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

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-medicine-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-medicine-styles';
      style.textContent = `
        .culture-hero-banner {
          margin-bottom: 2rem;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
          max-height: 280px;
          position: relative;
        }
        .culture-hero-img {
          width: 100%;
          height: 260px;
          object-fit: cover;
          display: block;
          filter: brightness(0.92) contrast(1.05);
          transition: transform 0.4s ease;
        }
        .culture-hero-banner:hover .culture-hero-img {
          transform: scale(1.02);
        }
        .medicine-intro {
          padding: 1.8rem 2.2rem;
          background: var(--color-bg-card, #fbfbfb);
          border-left: 4px solid var(--color-primary, #e53935);
          border-radius: var(--radius-lg, 14px);
          margin-bottom: 2.2rem;
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }
        .medicine-intro p {
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
        .medicine-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .medicine-card {
          background: var(--color-bg-panel, #ffffff);
          border: 1px solid var(--color-border, #e4e4e7);
          border-radius: var(--radius-lg, 16px);
          padding: 1.8rem 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .medicine-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(229, 57, 53, 0.3);
        }
        .med-header {
          margin-bottom: 1.2rem;
          border-bottom: 1px solid var(--color-border, #f4f4f5);
          padding-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
        }
        .med-header h3 {
          margin: 0;
          font-size: 1.55rem;
          color: var(--color-primary, #e53935);
          font-family: 'Noto Serif SC', 'Noto Sans SC', serif;
          font-weight: 800;
        }
        .med-header .pinyin-tag {
          font-size: 1.05rem;
          color: var(--color-text-main, #18181b);
          font-weight: 700;
          background: var(--color-bg-card, #f4f4f5);
          padding: 3px 10px;
          border-radius: 9999px;
          border: 1px solid var(--color-border, #e4e4e7);
        }
        .med-header .sub-tag {
          font-size: 0.92rem;
          color: var(--color-text-muted, #71717a);
          font-weight: 500;
          margin-left: auto;
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
        .med-description {
          font-size: 0.96rem;
          line-height: 1.75;
          color: var(--color-text-main, #27272a);
          margin: 0;
        }
        .medicine-citations {
          margin-top: 3.5rem;
          padding: 1.6rem 2rem;
          background: var(--color-bg-panel, #ffffff);
          border: 1px dashed var(--color-border, #d4d4d8);
          border-radius: var(--radius-lg, 14px);
        }
        .medicine-citations h4 {
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-primary, #e53935);
          font-weight: 700;
        }
        .medicine-citations ul {
          margin: 0;
          padding-left: 1.4rem;
          color: var(--color-text-muted, #71717a);
          font-size: 0.88rem;
          line-height: 1.7;
        }
        .medicine-citations li {
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="culture-hero-banner">
        <img src="assets/images/culture/traditional_medicine.jpg" alt="Medicina Tradicional China" class="culture-hero-img" loading="lazy" />
      </div>
      <div class="medicine-intro">
        <p>${activeContent.intro}</p>
      </div>
      
      <div class="section-header-academic">
        ${activeContent.tabs.theory}
      </div>
      <div class="medicine-grid">
    `;

    activeContent.theory.forEach(item => {
      const hanziMatch = item.name.match(/[\u4e00-\u9fa5]+/);
      const speakText = hanziMatch ? hanziMatch[0] : item.pinyin;
      html += `
        <div class="medicine-card">
          <div class="med-header">
            <h3>${item.name}</h3>
            ${this.getSpeakerBtn(speakText, `Escuchar ${speakText}`)}
            <span class="pinyin-tag">${item.pinyin}</span>
            <span class="sub-tag">${item.meaning}</span>
          </div>
          <p class="med-description">${item.desc}</p>
        </div>
      `;
    });

    html += `</div>
      <div class="section-header-academic">
        ${activeContent.tabs.practices}
      </div>
      <div class="medicine-grid">
    `;

    activeContent.practices.forEach(item => {
      const hanziMatch = item.name.match(/[\u4e00-\u9fa5]+/);
      const speakText = hanziMatch ? hanziMatch[0] : item.pinyin;
      html += `
        <div class="medicine-card">
          <div class="med-header">
            <h3>${item.name}</h3>
            ${this.getSpeakerBtn(speakText, `Escuchar ${speakText}`)}
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
    this.bindAudioButtons();
  }
}

// In case the class was lazily loaded
window.TraditionalMedicineModule = TraditionalMedicineModule;
