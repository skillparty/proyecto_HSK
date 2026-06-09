// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before TraditionalArtsModule.");
}

class TraditionalArtsModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-arts-content', 'Artes Tradicionales y Caligrafía');
    this.activeSection = 'calligraphy'; // 'calligraphy', 'painting', 'performing'
  }

  get content() {
    return {
      es: {
        intro: "Las artes tradicionales de China conjugan la caligrafía, la pintura y las artes escénicas folclóricas en una cosmovisión holística. Estos elementos trascienden lo meramente decorativo para erigirse en vehículos de cultivo moral, expresión filosófica e identidad cultural, regidos por conceptos de ritmo vital (qiyun) y el uso de herramientas artesanales refinadas durante milenios.",
        sourcesTitle: "Fuentes Bibliográficas",
        sections: {
          calligraphy: "Caligrafía y Escritura",
          painting: "Pintura China (Guohua)",
          performing: "Artes Escénicas y Folclor"
        },
        calligraphy: {
          intro: "La caligrafía china (书法) es el arte de escribir caracteres chinos con pincel, donde la morfología y el dinamismo del trazo expresan las emociones y el cultivo moral del escritor. Se fundamenta en la estructura de los caracteres, la técnica del pincel y el uso de herramientas específicas.",
          sixWritingsTitle: "El Principio de las Seis Escrituras (六书)",
          sixWritingsDesc: "Los antiguos clasificaban la creación y uso de los caracteres bajo el concepto de 'Liushu' (六书), que guía su estructura geométrica:",
          sixWritingsList: [
            "<strong>Pictogramas (象形 - Xiàngxíng):</strong> Representación gráfica directa de objetos físicos (ej. el sol 日 o la montaña 山).",
            "<strong>Símbolos Indicativos (指事 - Zhǐshì):</strong> Representación de conceptos abstractos mediante marcas visuales (ej. arriba 上 o abajo 下).",
            "<strong>Ideogramas Compuestos (会意 - Huìyì):</strong> Combinación de dos o más pictogramas para sugerir un nuevo significado (ej. persona 人 apoyada en árbol 木 significa descansar 休).",
            "<strong>Compuestos Fonéticos (形声 - Xíngshēng):</strong> Combinación de un elemento semántico (radical) y un elemento fonético (ej. 妈 mā, con radical mujer 女 y fonético caballo 马). Representa más del 80% de los caracteres.",
            "<strong>Caracteres de Anotación Mutua (转注 - Zhuǎnzhù):</strong> Caracteres con raíces etimológicas idénticas que se explican entre sí.",
            "<strong>Préstamos Fonéticos (假借 - Jiǎjiè):</strong> Adopción de un carácter existente para representar una palabra homófona pero semánticamente distinta."
          ],
          fourTreasuresTitle: "Los Cuatro Tesoros del Estudio (文房四宝)",
          fourTreasuresDesc: "Son los instrumentos indispensables de la caligrafía y pintura:",
          fourTreasuresList: [
            "<strong>El Pincel (笔 - Bǐ):</strong> Inventado en China. Se divide según la rigidez del pelo en: 'yíngháo' (pelo rígido de lobo/comadreja 狼毫, ideal para líneas vigorosas), 'ruǎnháo' (pelo suave de cabra 羊毫, para trazos absorbentes y fluidos) y 'jiānháo' (pelo mixto que aporta flexibilidad y rigidez coordinada). Centros de excelencia: Hubi de Huzhou y Xuanbi de Xuanzhou.",
            "<strong>La Tinta (墨 - Mò):</strong> Clasificada en '油烟' (humo de aceite de tung, fina y brillante) y '松烟' (humo de pino quemado, negra profunda y opaca). Destaca la tinta de Huizhou (Hui墨), famosa por no decolorarse con los siglos.",
            "<strong>El Papel (纸 - Zhǐ):</strong> El papel Xuan (宣纸) es el soporte predilecto. Se clasifica en 'Shengxuan' (crudo, altamente absorbente, ideal para pintura a mano alzada por sus ricos matices y transiciones de agua) y 'Shuxuan' (cocido o procesado con alumbre, impermeable, ideal para la delineación minuciosa de trazo fino o Gongbi).",
            "<strong>La Piedra de Entintar (砚 - Yàn):</strong> Bloque de piedra pulida donde se muele la tinta sólida con agua. Debe ser fina, húmeda y libre de residuos. Las cuatro piedras célebres son: She (Anhui), Duan (Guangdong), Tao (Gansu) y Chengni (Shanxi)."
          ],
          philosophicalScrollsTitle: "Filosofía en los Pergaminos de Exhibición",
          philosophicalScrollsList: [
            "<strong>Gewu Zhizhi (格物致知):</strong> Proviene del clásico confuciano <i>El Gran Aprendizaje</i> (大学) y fue desarrollado por Cheng Yi y Zhu Xi. Expresa el método epistemológico chino: investigar las cosas externas ('gewu') para penetrar en sus principios (理) y así alcanzar el conocimiento supremo ('zhizhi'). Es la base de la rectitud moral, el cultivo personal y la armonía sociopolítica mundial.",
            "<strong>Shi Ya Lan Xiang (室雅兰香):</strong> 'Habitación elegante, fragancia de orquídeas'. Basado en <i>El lenguaje familiar de Confucio</i> (孔子家语). Establece la analogía moral: convivir con personas virtuosas es como entrar en una habitación llena de orquídeas; al cabo del tiempo no se percibe el perfume porque uno mismo se ha impregnado de su fragancia. Enfatiza la influencia del entorno en el carácter.",
            "<strong>Xue Gui You Heng (学贵有恒):</strong> 'Lo más valioso del aprendizaje es la perseverancia'. Enfatiza la constancia sistemática en el estudio frente al esfuerzo esporádico.",
            "<strong>Callejón Wuyi (乌衣巷):</strong> Poema de Liu Yuxi (dinastía Tang). Reflexión lírica y melancólica sobre el paso del tiempo y las vicisitudes históricas, ilustrada por las golondrinas que antes anidaban en los palacios de los nobles Wang y Xie y ahora entran en los hogares de los ciudadanos comunes."
          ]
        },
        painting: {
          intro: "La pintura tradicional china o Guohua (国画) comparte herramientas y fundamentos con la caligrafía (mismo origen de pincel y tinta, 'shū huà tóng yuán'). Se caracteriza por priorizar la captación del espíritu sobre la precisión fotográfica de la forma física.",
          corePrinciplesTitle: "Aestética y Principios Fundamentales",
          corePrinciplesList: [
            "<strong>Qiyun Shendong (气韵生动):</strong> El primer principio de Xie He (siglo VI): dotar a la obra de ritmo vital y energía resonante, expresando el soplo vital (Qi) del cosmos a través del movimiento del pincel.",
            "<strong>Yixing Xieshen (以形写神):</strong> 'Usar la forma para plasmar el espíritu'. El objetivo no es la imitación exacta del objeto (mimesis), sino capturar la esencia interior y la vivacidad, operando en 'el límite entre la semejanza y la no semejanza' (妙在似与不似之间).",
            "<strong>Perspectiva Dispersa (散点透视):</strong> A diferencia de la perspectiva focalizada occidental de punto de fuga único, la pintura china emplea múltiples focos visuales, permitiendo al espectador recorrer el paisaje de forma dinámica, emulando un viaje físico.",
            "<strong>Espacios en Blanco (留白 - Liúbái):</strong> El vacío no es la ausencia de materia, sino un elemento activo de la composición que representa nubes, agua o la infinidad del pensamiento, dando dinamismo (respiración) a la obra."
          ],
          genresTitle: "Géneros y Técnicas Principales",
          genresList: [
            "<strong>Géneros:</strong> Paisajes (山水画 - Shānshuǐhuà, donde las montañas representan el Yang y el agua el Yin, simbolizando el equilibrio cósmico), Figuras humanas (人物画), y Flores y Aves (花鸟画).",
            "<strong>Gongbi (工笔):</strong> Técnica meticulosa caracterizada por un trazo fino y preciso y múltiples capas de color. Requiere papel cocido (Shuxuan).",
            "<strong>Xieyi (写意):</strong> Pintura a mano alzada, caracterizada por pinceladas rápidas y expresivas que sugieren el objeto en lugar de detallarlo. Emplea papel crudo (Shengxuan)."
          ]
        },
        performing: {
          intro: "Las artes y folclor de exhibición demuestran la vitalidad social y ceremonial de la cultura china, estructurándose en representaciones rituales colectivas y artesanía decorativa de uso festivo.",
          lionDanceTitle: "Danza del León Chino (舞狮)",
          lionDanceDesc: "Originalmente denominada 'Taiping Le' (太平乐) durante la dinastía Tang, era ejecutada en la corte imperial como espectáculo para el soberano. La danza se divide en dos escuelas principales: el León del Sur (醒狮 - Xǐngshī, o león del despertar, enfocado en la agilidad y acrobacias sobre postes) y el León del Río del Norte (北狮, dividido en 'león literario' -enfocado en el juego- y 'león marcial' -enfocado en la acrobacia y combate-). Sirve como un puente cultural de cohesión para las comunidades de la diáspora china, simbolizando la unidad y el auspicio. Está regulada por la Federación Internacional de Deportes del Dragón y el León (fundada en 1995 en Beijing).",
          palaceLanternsTitle: "Faroles de Palacio (宫灯)",
          palaceLanternsDesc: "Artesanía tradicional de la dinastía Han del Este que alcanzó su madurez en las dinastías Sui y Tang. A diferencia de las linternas ordinarias, los faroles de palacio se elaboraban con esqueleto de madera fina tallada (hexagonal, octagonal o tetragonal), con incrustaciones de gasa de seda o vidrio pintado con motivos imperiales de dragones, fénix e ideogramas de fortuna. El farol de gasa roja (红纱灯) es el más icónico de este género.",
          strawFansTitle: "Cultura del Abanico (草编扇 / 扇子)",
          strawFansDesc: "Con una trayectoria histórica de más de 3,000 años, el abanico comenzó en la dinastía Zhou no como instrumento de enfriamiento, sino como un elemento ceremonial y protector contra el viento y polvo ('障扇'), indicando el rango del emperador o los nobles. Al ser China rica en bambú, este material se consagró como el óptimo para su confección. Se diversifican en abanicos de danza, abanicos utilitarios y abanicos artísticos pintados. Su difusión comercial conectó a China con las cortes reales de España y Francia en los siglos XVII y XVIII, donde los abanicos se convirtieron en símbolos de alto estatus."
        }
      },
      en: {
        intro: "China's traditional arts blend calligraphy, painting, and folk performing arts into a holistic worldview. These elements transcend simple decoration to serve as vehicles for moral cultivation, philosophical expression, and cultural identity, governed by concepts of rhythmic vitality (qiyun) and tools refined over millennia.",
        sourcesTitle: "Bibliographical Sources",
        sections: {
          calligraphy: "Calligraphy & Writing",
          painting: "Chinese Painting (Guohua)",
          performing: "Performing Arts & Folklore"
        },
        calligraphy: {
          intro: "Chinese calligraphy (书法) is the art of writing Chinese characters with a brush, where the morphology and dynamism of the brushstrokes express the writer's emotions and moral cultivation. It is built upon character structure, brush techniques, and specific instruments.",
          sixWritingsTitle: "The Principle of the Six Writings (六书)",
          sixWritingsDesc: "The ancients classified the creation and usage of characters under the concept of 'Liushu' (六书), which guides their geometric structure:",
          sixWritingsList: [
            "<strong>Pictograms (象形 - Xiàngxíng):</strong> Direct graphic representation of physical objects (e.g., the sun 日 or mountain 山).",
            "<strong>Indicative Symbols (指事 - Zhǐshì):</strong> Representation of abstract concepts through visual marks (e.g., above 上 or below 下).",
            "<strong>Associative Compounds (会意 - Huìyì):</strong> Combination of two or more pictograms to suggest a new meaning (e.g., a person 人 resting against a tree 木 means to rest 休).",
            "<strong>Phonetic Compounds (形声 - Xíngshēng):</strong> Combination of a semantic element (radical) and a phonetic element (e.g., mother 妈 mā, with semantic woman 女 and phonetic horse 马). Represents over 80% of all characters.",
            "<strong>Mutually Explanatory Characters (转注 - Zhuǎnzhù):</strong> Characters with identical etymological roots that explain each other.",
            "<strong>Phonetic Loan Characters (假借 - Jiǎjiè):</strong> Adoption of an existing character to represent a homophonous but semantically unrelated word."
          ],
          fourTreasuresTitle: "The Four Treasures of the Study (文房四宝)",
          fourTreasuresDesc: "These are the indispensable tools for calligraphy and painting:",
          fourTreasuresList: [
            "<strong>The Brush (笔 - Bǐ):</strong> Created in China, categorized by hair stiffness: 'yíngháo' (stiff yellow-weasel-tail hair 狼毫, ideal for vigorous lines), 'ruǎnháo' (soft goat hair 羊毫, for highly absorbent, flowing strokes), and 'jiānháo' (mixed hair providing coordinated flexibility and stiffness). Famous centers: Hubi of Huzhou and Xuanbi of Xuanzhou.",
            "<strong>The Ink (墨 - Mò):</strong> Divided into '油烟' (oil smoke from tung oil, fine and glossy) and '松烟' (pine smoke from burned pine branches, deep black and matte). Huizhou ink (Hui ink) is globally famous for not fading over centuries.",
            "<strong>The Paper (纸 - Zhǐ):</strong> Xuan paper (宣纸) is the preferred medium. Classified as 'Shengxuan' (raw, highly absorbent, ideal for freehand painting due to rich water transitions) and 'Shuxuan' (cooked or processed with alum, non-absorbent, ideal for meticulous fine-line Gongbi painting).",
            "<strong>The Inkstone (砚 - Yàn):</strong> A block of polished stone where solid ink is ground with water. It must be fine, moist, and grit-free. The four famous inkstones are: She (Anhui), Duan (Guangdong), Tao (Gansu), and Chengni (Shanxi)."
          ],
          philosophicalScrollsTitle: "Philosophy in the Exhibition Scrolls",
          philosophicalScrollsList: [
            "<strong>Gewu Zhizhi (格物致知):</strong> Sourced from the Confucian classic <i>The Great Learning</i> (大学) and developed by Cheng Yi and Zhu Xi. It expresses the Chinese epistemological method: investigating external things ('gewu') to penetrate their inner principles (理) and achieve supreme knowledge ('zhizhi'). It is the basis for personal cultivation, moral rectitude, and world peace.",
            "<strong>Shi Ya Lan Xiang (室雅兰香):</strong> 'Elegant room, fragrant orchids'. Sourced from <i>The Family Sayings of Confucius</i>. It establishes the moral analogy: spending time with virtuous people is like entering a room filled with orchids; after a while, you no longer notice the scent because you have absorbed the fragrance yourself. It highlights the impact of environment on character.",
            "<strong>Xue Gui You Heng (学贵有恒):</strong> 'The most valuable thing in learning is perseverance'. Emphasizes systematic constancy in study over sporadic effort.",
            "<strong>Wuyi Lane (乌衣巷):</strong> A poem by Liu Yuxi (Tang Dynasty). A lyrical, melancholic reflection on the passage of time and historical changes, illustrated by swallows that once nested in the mansions of nobles Wang and Xie, now flying into the homes of common citizens."
          ]
        },
        painting: {
          intro: "Traditional Chinese painting or Guohua (国画) shares tools and principles with calligraphy (same brush-and-ink origin, 'shū huà tóng yuán'). It prioritizes capturing the inner spirit over photographic precision of physical form.",
          corePrinciplesTitle: "Aesthetics and Fundamental Principles",
          corePrinciplesList: [
            "<strong>Qiyun Shendong (气韵生动):</strong> Xie He's first principle (6th century): endowing a painting with rhythmic vitality and resonant energy, expressing the life breath (Qi) of the cosmos through brush strokes.",
            "<strong>Yixing Xieshen (以形写神):</strong> 'Using form to capture the spirit'. The goal is not exact physical replication (mimesis), but capturing the inner essence and life, operating at 'the boundary between likeness and unlikeness' (妙在似与不似之间).",
            "<strong>Scatter Perspective (散点透视):</strong> Unlike Western focal perspective with a single vanishing point, Chinese painting employs multiple focal points, allowing the viewer's eyes to wander dynamically through the landscape, emulating a physical journey.",
            "<strong>Negative Space (留白 - Liúbái):</strong> Blank space is not empty void, but an active element of composition representing clouds, water, or the infinity of thought, giving breathing room to the work."
          ],
          genresTitle: "Main Genres and Techniques",
          genresList: [
            "<strong>Genres:</strong> Landscapes (山水画 - Shānshuǐhuà, where mountains represent Yang and water represents Yin, symbolizing cosmic balance), Figures (人物画), and Flowers & Birds (花鸟画).",
            "<strong>Gongbi (工笔):</strong> Meticulous technique characterized by fine, precise lines and multiple layers of color washes. Requires processed paper (Shuxuan).",
            "<strong>Xieyi (写意):</strong> Freehand brushwork characterized by swift, expressive strokes that suggest the object rather than detail it. Uses raw paper (Shengxuan)."
          ]
        },
        performing: {
          intro: "Exhibition folk arts demonstrate the ceremonial and social vitality of Chinese culture, structured as collective ritual performances and decorative crafts for festive events.",
          lionDanceTitle: "Chinese Lion Dance (舞狮)",
          lionDanceDesc: "Originally called 'Taiping Le' (太平乐) during the Tang Dynasty, it was performed in the imperial court as entertainment for the emperor. The dance is divided into two main schools: the Southern Lion (醒狮 - Xǐngshī, or waking lion, focused on agility and post-climbing acrobatics) and the Northern Lion (北狮, divided into the playful 'literary lion' and the acrobatic, combative 'martial lion'). It serves as a major cultural link for overseas Chinese communities, symbolizing unity and auspiciousness. It is overseen by the International Dragon and Lion Sports Federation (founded in 1995 in Beijing).",
          palaceLanternsTitle: "Palace Lanterns (宫灯)",
          palaceLanternsDesc: "A traditional craft from the Eastern Han Dynasty that matured in the Sui and Tang Dynasties. Unlike ordinary lanterns, palace lanterns were crafted with fine carved wooden skeletons (hexagonal, octagonal, or tetragonal), inlaid with silk gauze or painted glass displaying imperial dragon and phoenix motifs and longevity characters. The red gauze lantern (红纱灯) is the most iconic of this style.",
          strawFansTitle: "Fan Culture (草编扇 / 扇子)",
          strawFansDesc: "With a history of over 3,000 years, the fan began in the Zhou Dynasty not for cooling, but as a ceremonial shield against wind and dust ('障扇'), indicating the rank of the emperor or nobles. Since China is rich in bamboo, this became the optimal material for their frames. They are divided into dance, utility, and artistic painted fans. Their trade connected China to the royal courts of Spain and France in the 17th and 18th centuries, where fans became symbols of high status."
        }
      }
    };
  }

  async loadData() {
    this.artsData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-arts-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-arts-styles';
      style.textContent = `
        .arts-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(139, 92, 246, 0.03));
          border-left: 4px solid var(--color-primary, #8b5cf6);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .arts-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .arts-sections-nav {
          display: flex;
          border-bottom: 2px solid var(--color-border, #eaeaea);
          margin-bottom: 2rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .arts-section-btn {
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
        .arts-section-btn:hover {
          color: var(--color-primary, #8b5cf6);
        }
        .arts-section-btn.active {
          color: var(--color-primary, #8b5cf6);
        }
        .arts-section-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary, #8b5cf6);
        }
        .arts-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .arts-block-card {
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-lg, 12px);
          padding: 2rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
        }
        .arts-block-card h3 {
          margin: 0 0 1.2rem 0;
          font-size: 1.4rem;
          color: var(--color-primary, #8b5cf6);
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.5rem;
        }
        .arts-panel p {
          font-size: 0.96rem;
          line-height: 1.7;
          color: var(--color-text-main, #444);
          margin-bottom: 1.5rem;
        }
        .arts-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .arts-list li {
          padding-left: 1.5rem;
          position: relative;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--color-text-main, #333);
        }
        .arts-list li::before {
          content: '•';
          color: var(--color-primary, #8b5cf6);
          font-weight: 700;
          font-size: 1.2rem;
          position: absolute;
          left: 0;
          top: -0.1rem;
        }
        .arts-citations-block {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .arts-citations-block h4 {
          margin: 0 0 1rem 0;
          font-size: 1.05rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .arts-citations-block ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .arts-citations-block li {
          margin-bottom: 0.5rem;
        }
        .arts-sub-desc {
          margin-bottom: 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-muted, #555);
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="arts-intro">
        <p>${activeContent.intro}</p>
      </div>

      <div class="arts-sections-nav">
        <button class="arts-section-btn ${this.activeSection === 'calligraphy' ? 'active' : ''}" id="arts-btn-calligraphy">
          ${activeContent.sections.calligraphy}
        </button>
        <button class="arts-section-btn ${this.activeSection === 'painting' ? 'active' : ''}" id="arts-btn-painting">
          ${activeContent.sections.painting}
        </button>
        <button class="arts-section-btn ${this.activeSection === 'performing' ? 'active' : ''}" id="arts-btn-performing">
          ${activeContent.sections.performing}
        </button>
      </div>

      <div class="arts-panel">
    `;

    if (this.activeSection === 'calligraphy') {
      const data = activeContent.calligraphy;
      html += `
        <div class="arts-block-card">
          <h3>${lang === 'en' ? 'Introduction to Writing as Art' : 'Introducción a la Escritura como Arte'}</h3>
          <p>${data.intro}</p>
        </div>

        <div class="arts-block-card">
          <h3>${data.sixWritingsTitle}</h3>
          <div class="arts-sub-desc">${data.sixWritingsDesc}</div>
          <ul class="arts-list">
      `;
      data.sixWritingsList.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += `
          </ul>
        </div>

        <div class="arts-block-card">
          <h3>${data.fourTreasuresTitle}</h3>
          <div class="arts-sub-desc">${data.fourTreasuresDesc}</div>
          <ul class="arts-list">
      `;
      data.fourTreasuresList.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += `
          </ul>
        </div>

        <div class="arts-block-card">
          <h3>${data.philosophicalScrollsTitle}</h3>
          <ul class="arts-list">
      `;
      data.philosophicalScrollsList.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += `
          </ul>
        </div>
      `;
    } else if (this.activeSection === 'painting') {
      const data = activeContent.painting;
      html += `
        <div class="arts-block-card">
          <h3>${lang === 'en' ? 'Core Concepts' : 'Concepto del Guohua'}</h3>
          <p>${data.intro}</p>
        </div>

        <div class="arts-block-card">
          <h3>${data.corePrinciplesTitle}</h3>
          <ul class="arts-list">
      `;
      data.corePrinciplesList.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += `
          </ul>
        </div>

        <div class="arts-block-card">
          <h3>${data.genresTitle}</h3>
          <ul class="arts-list">
      `;
      data.genresList.forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += `
          </ul>
        </div>
      `;
    } else if (this.activeSection === 'performing') {
      const data = activeContent.performing;
      html += `
        <div class="arts-block-card">
          <h3>${data.lionDanceTitle}</h3>
          <p>${data.lionDanceDesc}</p>
        </div>

        <div class="arts-block-card">
          <h3>${data.palaceLanternsTitle}</h3>
          <p>${data.palaceLanternsDesc}</p>
        </div>

        <div class="arts-block-card">
          <h3>${data.strawFansTitle}</h3>
          <p>${data.strawFansDesc}</p>
        </div>
      `;
    }

    html += `</div>`;

    // Bibliography Block
    html += `
      <div class="arts-citations-block">
        <h4>${activeContent.sourcesTitle}</h4>
        <ul>
          <li>Clunas, Craig. (1997). <i>Art in China</i>. Oxford: Oxford University Press.</li>
          <li>Billeter, Jean François. (1990). <i>The Chinese Art of Writing</i>. New York: Skira/Rizzoli.</li>
          <li>Silbergeld, Jerome. (1982). <i>Chinese Painting Style: Media, Methods, and Principles of Form</i>. Seattle: University of Washington Press.</li>
          <li>Confucio. (春秋时期). <i>孔子家语 (Family Sayings of Confucius)</i>.</li>
          <li>Sun, W. (春秋末期). <i>孙子兵法 (The Art of War)</i>.</li>
          <li>International Dragon and Lion Sports Federation. (2020). <i>History and Official Rules of Chinese Dragon and Lion Dance</i>. Beijing.</li>
        </ul>
      </div>
    `;

    this.container.innerHTML = html;

    // Attach Event Listeners
    const btnCalligraphy = document.getElementById('arts-btn-calligraphy');
    const btnPainting = document.getElementById('arts-btn-painting');
    const btnPerforming = document.getElementById('arts-btn-performing');

    if (btnCalligraphy) {
      btnCalligraphy.addEventListener('click', () => {
        this.activeSection = 'calligraphy';
        this.render();
      });
    }
    if (btnPainting) {
      btnPainting.addEventListener('click', () => {
        this.activeSection = 'painting';
        this.render();
      });
    }
    if (btnPerforming) {
      btnPerforming.addEventListener('click', () => {
        this.activeSection = 'performing';
        this.render();
      });
    }
  }
}

// Register class globally
window.TraditionalArtsModule = TraditionalArtsModule;
