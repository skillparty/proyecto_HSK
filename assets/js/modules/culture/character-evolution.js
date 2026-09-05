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
            title: "Evolución de Materiales y Modos de Escritura",
            text: "Durante más de dos mil años de desarrollo histórico (desde las dinastías Xia, Shang y Zhou hasta las dinastías Qin y Han), la escritura china pasó por diversos soportes materiales: inscripciones en huesos oraculares, inscripciones en bronce, grabados en piedra, tiras de bambú y escritura en seda. De este proceso surgieron y se consolidaron cinco fuentes o modos de escritura principales: la escritura de Sello, la escritura Oficial, la Cursiva, la Corriente y la Regular, eliminando formas híbridas hasta llegar a la caligrafía actual."
          },
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
            title: "Evolution of Materials and Writing Modes",
            text: "During more than two thousand years of historical development (from the Xia, Shang and Zhou dynasties to the Qin and Han dynasties), Chinese writing went through various material mediums: oracle bone inscriptions, bronze inscriptions, stone engravings, bamboo slips, and silk writing. From this process, five main writing modes emerged and consolidated: Seal script, Clerical script, Cursive script, Running script, and Regular script, eliminating hybrid forms until reaching modern calligraphy."
          },
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

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-evolution-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-evolution-styles';
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
        .evolution-intro {
          padding: 1.8rem 2.2rem;
          background: var(--color-bg-card, #fbfbfb);
          border-left: 4px solid var(--color-primary, #e53935);
          border-radius: var(--radius-lg, 14px);
          margin-bottom: 2.2rem;
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          position: relative;
        }
        .evolution-intro p {
          margin: 0;
          color: var(--color-text-main, #27272a);
          line-height: 1.8;
          font-size: 1rem;
          font-weight: 450;
        }
        .evolution-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .character-evolution-card {
          background: var(--color-bg-panel, #ffffff);
          border-radius: var(--radius-lg, 16px);
          padding: 1.8rem 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--color-border, #e4e4e7);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .character-evolution-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(229, 57, 53, 0.3);
        }
        .char-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border, #f4f4f5);
          padding-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
        }
        .char-header h3 {
          margin: 0;
          font-size: 2rem;
          color: var(--color-primary, #e53935);
          font-family: 'Noto Serif SC', 'Noto Sans SC', serif;
          font-weight: 800;
          line-height: 1;
        }
        .char-header .pinyin-tag {
          font-size: 1.15rem;
          color: var(--color-text-main, #18181b);
          font-weight: 700;
          background: var(--color-bg-card, #f4f4f5);
          padding: 3px 10px;
          border-radius: 9999px;
          border: 1px solid var(--color-border, #e4e4e7);
        }
        .char-header .meaning-tag {
          font-size: 0.98rem;
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
        .evolution-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2rem;
          margin-bottom: 1.5rem;
          background: var(--color-bg-card, #f9fafb);
          padding: 1.4rem;
          border-radius: var(--radius-lg, 14px);
          border: 1px solid var(--color-border, #e5e7eb);
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.6rem;
        }
        .step-label {
          font-size: 0.78rem;
          color: var(--color-primary, #e53935);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.6px;
        }
        .step-graphic {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--color-border, #d4d4d8);
          border-radius: var(--radius-md, 10px);
          color: var(--color-text-main, #18181b);
          background: var(--color-bg-panel, #ffffff);
          padding: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .step:hover .step-graphic {
          transform: translateY(-2px);
          border-color: var(--color-primary, #e53935);
        }
        .svg-glyph {
          width: 100%;
          height: 100%;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .step-desc {
          font-size: 0.76rem;
          color: var(--color-text-muted, #71717a);
          line-height: 1.35;
          margin: 0;
          font-weight: 500;
        }
        .char-description-box {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-main, #27272a);
          background: var(--color-bg-card, #f9fafb);
          padding: 1.2rem 1.4rem;
          border-radius: var(--radius-md, 10px);
          border-left: 4px solid var(--color-primary, #e53935);
          border: 1px solid var(--color-border, #e5e7eb);
          border-left-width: 4px;
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
        .citations-section {
          margin-top: 3.5rem;
          padding: 1.6rem 2rem;
          background: var(--color-bg-panel, #ffffff);
          border: 1px dashed var(--color-border, #d4d4d8);
          border-radius: var(--radius-lg, 14px);
        }
        .citations-list {
          margin: 0;
          padding-left: 1.4rem;
          color: var(--color-text-muted, #71717a);
          font-size: 0.88rem;
          line-height: 1.7;
        }
        .citations-list li {
          margin-bottom: 0.5rem;
        }

        /* Responsive styling for steps */
        @media (max-width: 680px) {
          .evolution-steps {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .step {
            flex-direction: row;
            text-align: left;
            gap: 1rem;
          }
          .step-graphic {
            width: 54px;
            height: 54px;
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
      <div class="culture-hero-banner" id="culture-characters-hero">
        <video class="culture-hero-video" 
               id="culture-characters-video"
               src="assets/videos/characterEvolution.mp4" 
               poster="assets/images/culture/character_evolution.jpg" 
               controls 
               loop 
               muted 
               autoplay 
               playsinline 
               preload="metadata"
               aria-label="${lang === 'en' ? 'Character Evolution Video' : 'Vídeo de Evolución de Caracteres'}">
          <img src="assets/images/culture/character_evolution.jpg" alt="Evolución de Caracteres" class="culture-hero-img" loading="lazy" />
        </video>
        <img src="assets/images/culture/character_evolution.jpg" 
             alt="Evolución de Caracteres" 
             class="culture-hero-img" 
             id="culture-characters-img"
             style="display: none;" 
             loading="lazy" />
        <span class="culture-video-badge" id="culture-characters-badge" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>${lang === 'en' ? 'Featured Video' : 'Vídeo Ilustrativo'}</span>
        </span>
        <button type="button" class="culture-media-toggle-btn" id="culture-characters-toggle" title="${lang === 'en' ? 'Switch to Photo view' : 'Cambiar a vista Foto'}">
          <span class="toggle-icon">🖼️</span>
          <span class="toggle-text">${lang === 'en' ? 'View Photo' : 'Ver Foto'}</span>
        </button>
      </div>
      <div class="evolution-intro">
        <p>${activeContent.intro}</p>
      </div>
      <div class="evolution-grid">
    `;

    activeContent.characters.forEach(char => {
      const cleanHanzi = char.character.split(' ')[0] || char.character;
      html += `
        <div class="character-evolution-card">
          <div class="char-header">
            <h3>${char.character}</h3>
            ${this.getSpeakerBtn(cleanHanzi, `Escuchar ${cleanHanzi}`)}
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
                <span style="font-family: 'Noto Serif SC', 'Noto Sans SC', serif; font-size: 1.8rem; font-weight: 800; color: var(--color-primary, #e53935);">${char.character.split(' ')[0]}</span>
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
        <div class="extra-info-section" style="margin-top: 3.5rem;">
          <h4 class="section-header-academic">Filosofía e Historia Adicional</h4>
          <div class="roles-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
            ${activeContent.extraInfo.map(info => `
              <div class="role-card" style="background: var(--color-bg-panel, #ffffff); border: 1px solid var(--color-border, #e4e4e7); border-radius: var(--radius-lg, 14px); padding: 1.6rem; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                <h5 style="color: var(--color-primary, #e53935); margin-top: 0; font-size: 1.12rem; font-weight: 700; border-bottom: 2px solid rgba(229, 57, 53, 0.2); padding-bottom: 0.6rem; margin-bottom: 1rem;">${info.title}</h5>
                <p style="color: var(--color-text-main, #27272a); line-height: 1.7; font-size: 0.95rem; margin: 0;">${info.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.container.innerHTML = html;
    this.bindAudioButtons();
    if (typeof this.bindMediaToggle === 'function') {
      this.bindMediaToggle('characters', lang);
    }
  }
}

// Make sure to assign to window for dynamic loading
window.CharacterEvolutionModule = CharacterEvolutionModule;
