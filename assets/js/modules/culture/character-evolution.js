// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before CharacterEvolutionModule.");
}

class CharacterEvolutionModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-characters-content', 'Evolución de Caracteres');
  }

  // Bilingual content
  get content() {
    return {
      es: {
        intro: "La escritura china es uno de los sistemas de escritura más antiguos del mundo. Su evolución refleja la transición desde pictogramas realistas grabados en caparazones de tortuga y huesos oraculares hasta caracteres altamente estructurados en la actualidad. Las etapas representadas son: Huesos Oraculares (Jiaguwen, c. 1200 a.C.), Bronce (Jinwen, c. 1000 a.C.), Sello (Xiaozhuan, c. 220 a.C.) y Escritura Regular (Kaishu, c. 200 d.C. al presente).",
        sourcesTitle: "Fuentes Bibliográficas",
        labels: {
          oracle: "Oracular",
          bronze: "Bronce",
          seal: "Sello",
          regular: "Regular"
        },
        characters: [
          {
            character: "日",
            pinyin: "rì",
            meaning: "Sol / Día",
            oracleDesc: "Disco con punto central.",
            bronzeDesc: "Forma adaptada a metal.",
            sealDesc: "Rectángulo simétrico.",
            modernDesc: "Forma estandarizada.",
            historicalExplanation: "El carácter '日' representa el disco solar. El punto en el centro distinguía la representación solar de otros símbolos circulares y servía para denotar el brillo o la luz concentrada que emana del sol. Con la transición al grabado sobre metal y piedra, las curvas naturales se angularizaron en la forma cuadrada actual.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><rect x="25" y="25" width="50" height="50" rx="10" stroke="currentColor" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><rect x="30" y="20" width="40" height="60" stroke="currentColor" stroke-width="6" fill="none"/><line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" stroke-width="6"/></svg>`
          },
          {
            character: "月",
            pinyin: "yuè",
            meaning: "Luna",
            oracleDesc: "Silueta creciente.",
            bronzeDesc: "Creciente con marca interior.",
            sealDesc: "Creciente verticalizada.",
            modernDesc: "Forma estandarizada.",
            historicalExplanation: "El carácter '月' comenzó como el pictograma de la luna en su fase creciente. Se incorporó una línea o punto en el interior para diferenciarla visualmente del carácter para 'noche' (夕 - xī) y para evocar el brillo tenue que emite, simplificándose gradualmente en el carácter moderno de cuatro trazos.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M65,18 C40,18 28,35 28,50 C28,65 40,82 65,82 C52,72 46,62 46,50 C46,38 52,28 65,18 Z" stroke="currentColor" stroke-width="6" fill="none"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M65,18 C40,18 28,35 28,50 C28,65 40,82 65,82 C52,72 46,62 46,50 C46,38 52,28 65,18 Z" stroke="currentColor" stroke-width="6" fill="none"/><line x1="33" y1="50" x2="49" y2="50" stroke="currentColor" stroke-width="6"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M60,12 C44,12 36,25 36,50 C36,75 44,88 60,88 C50,78 48,65 48,50 C48,35 50,22 60,12 Z" stroke="currentColor" stroke-width="6" fill="none"/><line x1="36" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="6"/><line x1="36" y1="60" x2="52" y2="60" stroke="currentColor" stroke-width="6"/></svg>`
          },
          {
            character: "山",
            pinyin: "shān",
            meaning: "Montaña",
            oracleDesc: "Tres picos apuntados.",
            bronzeDesc: "Base engrosada.",
            sealDesc: "Curvas simétricas.",
            modernDesc: "Forma estandarizada.",
            historicalExplanation: "El carácter '山' es un pictograma que representa tres picos de una cordillera. El pico central se diseñó más alto para dar un sentido de equilibrio natural. En las etapas del sello y regular, las líneas se unificaron sobre una línea horizontal base que representa la tierra sobre la cual se alzan.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M18,65 L18,78 L82,78 L82,65 M50,28 L50,78 M18,65 L50,78 L82,65" stroke="currentColor" stroke-width="6" fill="none" stroke-linejoin="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M22,60 L22,80 L78,80 L78,60 M50,20 L50,80" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M22,50 Q22,82 50,82 Q78,82 78,50 M50,18 L50,82" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          },
          {
            character: "人",
            pinyin: "rén",
            meaning: "Persona / Humano",
            oracleDesc: "Silueta inclinada de perfil.",
            bronzeDesc: "Silueta erguida.",
            sealDesc: "Trazos equilibrados.",
            modernDesc: "Dos trazos apoyados.",
            historicalExplanation: "El carácter '人' es un pictograma clásico que muestra el perfil de una persona de pie e inclinada hacia adelante en gesto de trabajo o respeto. En la escritura clerical y regular, el carácter se simplificó drásticamente a solo dos trazos que se apoyan mutuamente, simbolizando la bipedestación.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M62,18 L42,38 L45,82 M42,38 L65,65" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M58,15 L40,40 L40,82 M40,40 L65,75" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M50,15 Q50,45 32,82 M50,45 Q50,65 68,82" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          },
          {
            character: "马 / 馬",
            pinyin: "mǎ",
            meaning: "Caballo",
            oracleDesc: "Pictograma con crin y patas.",
            bronzeDesc: "Estilización del cuerpo.",
            sealDesc: "Abstracción vertical.",
            modernDesc: "Forma tradicional/simplificada.",
            historicalExplanation: "Originalmente '馬' era un pictograma detallado de un caballo que mostraba su cabeza con un gran ojo, su crin ondeando, patas y cola. En el proceso de transición hacia la escritura regular y simplificada, el ojo se convirtió en una línea horizontal, las patas en cuatro puntos y finalmente en una sola línea de barrido.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M48,12 L48,48 M48,22 Q65,22 65,12 M48,32 Q65,32 65,22 M32,28 L32,75 M32,45 L68,45 M32,62 L68,62" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M48,12 L48,52 M48,20 Q62,20 62,12 M48,32 Q62,32 62,22 M32,28 L32,80 M32,55 L58,55 M32,80 L58,80" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M50,12 Q58,12 58,28 L38,28 L38,82 M38,42 H65 M38,55 H65 M38,68 H65 M38,82 H65" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          }
        ],
        citations: [
          "Qiu, Xigui. (2000). <i>Chinese Writing</i>. Early China Special Monograph Series No. 4. Berkeley: The Society for the Study of Early China.",
          "Keightley, David N. (1978). <i>Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China</i>. University of California Press.",
          "Documento de Exposición: (REVISADO) 2024 孔院中文日展览 物品解说 (Ítems de Zodiaco y Sun Tzu)."
        ],
        extraInfo: [
          {
            title: "El Zodiaco Chino (生肖 - Shēngxiào)",
            text: "El zodiaco chino es un ciclo de 12 años, cada uno representado por un animal. Originalmente, estos doce signos del zodiaco representaban diferentes tótems de las tribus de la antigua China. El año 2024 corresponde al Año del Dragón. En la mitología china, el dragón es el gobernante supremo de todos los animales marinos y la deidad encargada de hacer llover, estrechamente asociado con la prosperidad agrícola y la buena fortuna."
          },
          {
            title: "Sun Tzu y El Arte de la Guerra (孙子兵法)",
            text: "Sun Tzu fue un célebre estratega y filósofo militar. En su obra 'El Arte de la Guerra', plantea la idea fundamental de que 'someter al ejército enemigo sin luchar es la cima de la excelencia'. El libro de bambú utilizado en la antigüedad servía para documentar estrategias avanzadas sobre el uso del fuego, espías, el estudio del terreno montañoso y acuático, siendo un pilar de la filosofía estratégica de China."
          },
          {
            title: "El Arte de la Caligrafía y los Cuatro Tesoros (文房四宝)",
            text: "Un arte tradicional exclusivo de China. Los caracteres chinos se originaron con la idea de utilizar imágenes para registrar eventos y evolucionaron durante miles de años. Con la invención de la escritura con pincel, surgió la caligrafía, convirtiéndose en un arte que utiliza los Cuatro Tesoros del Estudio (pincel, tinta, papel y tintero) como herramienta para expresar emociones. Los caracteres chinos son una combinación de forma, sonido y significado."
          },
          {
            title: "Los Seis Libros (六书 - Liù Shū)",
            text: "Los 'Seis Libros' se refieren a los seis métodos de creación y uso de caracteres chinos: pictogramas, referencias a cosas, comprensión, pictofonética, anotaciones y caracteres prestados. Tienen una gran importancia rectora para la estructura de los caracteres y son la base de la caligrafía. La ontología del arte caligráfico incluye la pincelada ('el uso de la pluma'), la estructura (anudado) y el método de composición (diseño general de líneas y formas)."
          },
          {
            title: "La Estética de los Caracteres",
            text: "La forma básica de los caracteres chinos es cuadrada. A través de la expansión y contracción de los punteados y la torsión del eje, se combinan diferentes formas en movimiento en hermosas obras. El uso del pincel y la tinta (espesa, ligera, seca y húmeda) otorga a la caligrafía una estructura de punteado y belleza únicas. Históricamente, las obras maestras como el 'Prefacio del Pabellón de las Orquídeas' de Wang Xizhi representan el pináculo de esta expresión."
          }
        ]
      },
      en: {
        intro: "Chinese writing is one of the oldest active writing systems in the world. Its evolution reflects the transition from realistic pictographs carved on tortoise shells and oracle bones to highly structured modern characters. The stages shown are: Oracle Bone Script (Jiaguwen, c. 1200 BCE), Bronze Script (Jinwen, c. 1000 BCE), Seal Script (Xiaozhuan, c. 220 BCE), and Regular Script (Kaishu, c. 200 CE to present).",
        sourcesTitle: "Bibliographical Sources",
        labels: {
          oracle: "Oracle Bone",
          bronze: "Bronze",
          seal: "Seal",
          regular: "Regular"
        },
        characters: [
          {
            character: "日",
            pinyin: "rì",
            meaning: "Sun / Day",
            oracleDesc: "Circle with central dot.",
            bronzeDesc: "Adapted to bronze casting.",
            sealDesc: "Symmetrical rectangle.",
            modernDesc: "Standardized modern form.",
            historicalExplanation: "The character '日' represents the solar disc. The central dot was used to distinguish it from other hollow circular symbols and to denote the concentrated light radiating from the sun. During the transition to metal casting and stone carving, natural curves became angular box shapes.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><rect x="25" y="25" width="50" height="50" rx="10" stroke="currentColor" stroke-width="6" fill="none"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><rect x="30" y="20" width="40" height="60" stroke="currentColor" stroke-width="6" fill="none"/><line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" stroke-width="6"/></svg>`
          },
          {
            character: "月",
            pinyin: "yuè",
            meaning: "Moon",
            oracleDesc: "Crescent silhouette.",
            bronzeDesc: "Crescent with inner mark.",
            sealDesc: "Verticalized crescent.",
            modernDesc: "Standardized modern form.",
            historicalExplanation: "The character '月' originated as a pictograph of a crescent moon. An internal dot or line was introduced to distinguish it from 'night' (夕 - xī) and to evoke its gentle light, gradually simplifying into the modern four-stroke character.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M65,18 C40,18 28,35 28,50 C28,65 40,82 65,82 C52,72 46,62 46,50 C46,38 52,28 65,18 Z" stroke="currentColor" stroke-width="6" fill="none"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M65,18 C40,18 28,35 28,50 C28,65 40,82 65,82 C52,72 46,62 46,50 C46,38 52,28 65,18 Z" stroke="currentColor" stroke-width="6" fill="none"/><line x1="33" y1="50" x2="49" y2="50" stroke="currentColor" stroke-width="6"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M60,12 C44,12 36,25 36,50 C36,75 44,88 60,88 C50,78 48,65 48,50 C48,35 50,22 60,12 Z" stroke="currentColor" stroke-width="6" fill="none"/><line x1="36" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="6"/><line x1="36" y1="60" x2="52" y2="60" stroke="currentColor" stroke-width="6"/></svg>`
          },
          {
            character: "山",
            pinyin: "shān",
            meaning: "Mountain",
            oracleDesc: "Three pointed peaks.",
            bronzeDesc: "Solidified base.",
            sealDesc: "Symmetrical curves.",
            modernDesc: "Standardized modern form.",
            historicalExplanation: "The character '山' is a pictograph representing three peaks of a mountain range. The central peak was designed higher to give a sense of symmetry. In the seal and regular script phases, these lines were unified upon a base horizontal line representing the earth.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M18,65 L18,78 L82,78 L82,65 M50,28 L50,78 M18,65 L50,78 L82,65" stroke="currentColor" stroke-width="6" fill="none" stroke-linejoin="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M22,60 L22,80 L78,80 L78,60 M50,20 L50,80" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M22,50 Q22,82 50,82 Q78,82 78,50 M50,18 L50,82" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          },
          {
            character: "人",
            pinyin: "rén",
            meaning: "Person / Human",
            oracleDesc: "Profile silhouette.",
            bronzeDesc: "Erect silhouette.",
            sealDesc: "Balanced stroke pair.",
            modernDesc: "Two supporting lines.",
            historicalExplanation: "The character '人' is a classic pictograph showing the profile of a standing human bending forward, indicating work or respect. In clerical and regular script, the character simplified into two strokes supporting each other, symbolizing upright bipedal posture.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M62,18 L42,38 L45,82 M42,38 L65,65" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M58,15 L40,40 L40,82 M40,40 L65,75" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M50,15 Q50,45 32,82 M50,45 Q50,65 68,82" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          },
          {
            character: "马 / 馬",
            pinyin: "mǎ",
            meaning: "Horse",
            oracleDesc: "Pictograph showing legs and mane.",
            bronzeDesc: "Stylized body posture.",
            sealDesc: "Vertical abstraction.",
            modernDesc: "Traditional/simplified form.",
            historicalExplanation: "Originally, '馬' was a detailed pictograph of a horse showing its head with a large eye, mane, legs, and tail. As it evolved toward regular and simplified scripts, the eye became a single stroke, the legs turned into four dots, and eventually merged into a single horizontal stroke.",
            oracleSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M48,12 L48,48 M48,22 Q65,22 65,12 M48,32 Q65,32 65,22 M32,28 L32,75 M32,45 L68,45 M32,62 L68,62" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
            bronzeSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M48,12 L48,52 M48,20 Q62,20 62,12 M48,32 Q62,32 62,22 M32,28 L32,80 M32,55 L58,55 M32,80 L58,80" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
            sealSvg: `<svg viewBox="0 0 100 100" class="svg-glyph"><path d="M50,12 Q58,12 58,28 L38,28 L38,82 M38,42 H65 M38,55 H65 M38,68 H65 M38,82 H65" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
          }
        ],
        citations: [
          "Qiu, Xigui. (2000). <i>Chinese Writing</i>. Early China Special Monograph Series No. 4. Berkeley: The Society for the Study of Early China.",
          "Keightley, David N. (1978). <i>Sources of Shang History</i>. University of California Press.",
          "Exhibition Document: 2024 Confucius Institute Chinese Language Day Exhibition."
        ],
        extraInfo: [
          {
            title: "The Chinese Zodiac (生肖 - Shēngxiào)",
            text: "The Chinese zodiac is a 12-year cycle, each represented by an animal. Originally, these twelve zodiac signs represented different totems of the tribes of ancient China. The year 2024 corresponds to the Year of the Dragon. In Chinese mythology, the dragon is the supreme ruler of all marine animals and the deity in charge of making it rain, closely associated with agricultural prosperity and good fortune."
          },
          {
            title: "Sun Tzu and The Art of War (孙子兵法)",
            text: "Sun Tzu was a famous military strategist and philosopher. In his work 'The Art of War', he proposes the fundamental idea that 'subduing the enemy's army without fighting is the acme of skill'. The bamboo slip books used in ancient times served to document advanced strategies on the use of fire, spies, and the study of mountainous and aquatic terrain, being a pillar of China's strategic philosophy."
          },
          {
            title: "The Art of Calligraphy and the Four Treasures (文房四宝)",
            text: "A traditional art unique to China. Chinese characters originated with the idea of using images to record events and evolved over thousands of years. With the invention of writing with a brush, calligraphy emerged, becoming an art that uses the Four Treasures of the Study (brush, ink, paper, and inkstone) as a tool to express emotions."
          },
          {
            title: "The Six Books (六书 - Liù Shū)",
            text: "The 'Six Books' refer to the six methods of creating and using Chinese characters: pictograms, referencing things, understanding, pictophonetics, annotations, and borrowed characters. They have a great guiding importance for the structure of characters and are the basis of calligraphy."
          },
          {
            title: "Aesthetics of Characters",
            text: "The basic shape of Chinese characters is square. Through the expansion and contraction of dots and the twisting of the axis, different shapes are combined in motion in beautiful works. The use of brush and ink (thick, light, dry, and wet) gives calligraphy a unique dotting structure and beauty. Historically, masterpieces such as Wang Xizhi's 'Preface to the Orchid Pavilion' represent the pinnacle of this expression."
          }
        ]
      }
    };
  }

  async loadData() {
    // Rely on local bilingual content instead of fetch to avoid network issues
    this.charactersData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-evolution-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-evolution-styles';
      style.textContent = `
        .evolution-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(229, 62, 62, 0.03));
          border-left: 4px solid var(--color-primary, #e53e3e);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .evolution-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .evolution-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .character-evolution-card {
          background: var(--color-bg-panel, #fff);
          border-radius: var(--radius-lg, 12px);
          padding: 1.8rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
        }
        .char-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.8rem;
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }
        .char-header h3 {
          margin: 0;
          font-size: 1.8rem;
          color: var(--color-primary, #e53e3e);
          font-family: 'Noto Sans SC', sans-serif;
        }
        .char-header .pinyin-tag {
          font-size: 1.1rem;
          color: var(--color-text-muted, #666);
          font-weight: 500;
        }
        .char-header .meaning-tag {
          font-size: 0.95rem;
          color: var(--color-text-dim, #999);
          margin-left: auto;
        }
        .evolution-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
          background: var(--color-bg-card, rgba(0,0,0,0.02));
          padding: 1.2rem;
          border-radius: var(--radius-md, 8px);
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }
        .step-label {
          font-size: 0.75rem;
          color: var(--color-text-muted, #666);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .step-graphic {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-md, 8px);
          color: var(--color-text-main, #333);
          background: var(--color-bg-panel, #fff);
          padding: 6px;
        }
        .svg-glyph {
          width: 100%;
          height: 100%;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .step-desc {
          font-size: 0.72rem;
          color: var(--color-text-dim, #777);
          line-height: 1.3;
          margin: 0;
        }
        .char-description-box {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--color-text-main, #444);
          background: var(--color-bg-card, rgba(0,0,0,0.01));
          padding: 1rem 1.2rem;
          border-radius: var(--radius-sm, 4px);
          border-left: 3px solid var(--color-border, #ddd);
        }
        .culture-bibliography {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .culture-bibliography h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .culture-bibliography ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .culture-bibliography li {
          margin-bottom: 0.5rem;
        }

        /* Responsive styling for steps */
        @media (max-width: 600px) {
          .evolution-steps {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .step {
            flex-direction: row;
            text-align: left;
            gap: 1rem;
          }
          .step-graphic {
            width: 50px;
            height: 50px;
            flex-shrink: 0;
          }
          .step-info-block {
            display: flex;
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="evolution-intro">
        <p>${activeContent.intro}</p>
      </div>
      <div class="evolution-grid">
    `;

    activeContent.characters.forEach(char => {
      html += `
        <div class="character-evolution-card">
          <div class="char-header">
            <h3>${char.character}</h3>
            <span class="pinyin-tag">${char.pinyin}</span>
            <span class="meaning-tag">${char.meaning}</span>
          </div>
          
          <div class="evolution-steps">
            <div class="step">
              <span class="step-label">${activeContent.labels.oracle}</span>
              <div class="step-graphic">${char.oracleSvg}</div>
              <div class="step-info-block">
                <p class="step-desc">${char.oracleDesc}</p>
              </div>
            </div>
            
            <div class="step">
              <span class="step-label">${activeContent.labels.bronze}</span>
              <div class="step-graphic">${char.bronzeSvg}</div>
              <div class="step-info-block">
                <p class="step-desc">${char.bronzeDesc}</p>
              </div>
            </div>
            
            <div class="step">
              <span class="step-label">${activeContent.labels.seal}</span>
              <div class="step-graphic">${char.sealSvg}</div>
              <div class="step-info-block">
                <p class="step-desc">${char.sealDesc}</p>
              </div>
            </div>
            
            <div class="step">
              <span class="step-label">${activeContent.labels.regular}</span>
              <div class="step-graphic">
                <span style="font-family: 'Noto Sans SC', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--color-primary, #e53e3e);">${char.character.split(' ')[0]}</span>
              </div>
              <div class="step-info-block">
                <p class="step-desc">${char.modernDesc}</p>
              </div>
            </div>
          </div>
          
          <div class="char-description-box">
            ${char.historicalExplanation}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Add Bibliography
    html += `
      <div class="citations-section">
        <h4 class="section-header-academic">${activeContent.sourcesTitle}</h4>
        <ul class="citations-list">
          ${activeContent.citations.map(cite => `<li>${cite}</li>`).join('')}
        </ul>
      </div>
    `;

    if (activeContent.extraInfo) {
      html += `
        <div class="extra-info-section" style="margin-top: 3rem;">
          <h4 class="section-header-academic">Filosofía e Historia Adicional</h4>
          <div class="roles-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
            ${activeContent.extraInfo.map(info => `
              <div class="role-card" style="background: var(--color-bg-panel, #fff); border: 1px solid var(--color-border, rgba(0,0,0,0.08)); border-radius: var(--radius-lg, 12px); padding: 1.5rem; box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));">
                <h5 style="color: var(--color-primary, #dc2626); margin-top: 0; font-size: 1.1rem; border-bottom: 2px solid rgba(220, 38, 38, 0.2); padding-bottom: 0.5rem; margin-bottom: 1rem;">${info.title}</h5>
                <p style="color: var(--color-text-main, #333); line-height: 1.6; font-size: 0.95rem; margin: 0;">${info.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.container.innerHTML = html;
  }
}

// Make sure to assign to window for dynamic loading
window.CharacterEvolutionModule = CharacterEvolutionModule;
