// Ensure CultureModuleBase is available
if (typeof CultureModuleBase === 'undefined' && typeof window.CultureModuleBase === 'undefined') {
  console.warn("CultureModuleBase not found. Please ensure it is loaded before EthnicClothingModule.");
}

class EthnicClothingModule extends (window.CultureModuleBase || CultureModuleBase) {
  constructor(app) {
    super(app, 'culture-clothing-content', 'Minorías y Vestimenta Étnica');
    this.activeGroup = 'all'; // 'all', 'han', 'zhuang', 'mongolian', 'miao', 'tibetan'
  }

  get content() {
    return {
      es: {
        intro: "La indumentaria tradicional en China refleja la vasta diversidad etnográfica y la adaptación ecológica de sus 56 grupos étnicos oficialmente reconocidos. La etnia Han, mayoritaria, coexiste con 55 minorías étnicas cuyas vestimentas constituyen patrimonios culturales inmateriales, caracterizados por complejas técnicas de tejido, bordado, teñido y el uso de ornamentos simbólicos de alto valor sociológico.",
        sourcesTitle: "Fuentes Bibliográficas",
        filterAll: "Todas las Culturas",
        groupSelectorLabel: "Seleccionar Grupo Étnico:",
        groups: {
          zhuang: {
            title: "Traje Tradicional Zhuang",
            hanzi: "壮族服装",
            pinyin: "Zhuàngzú fúzhuāng",
            origin: "Región Autónoma Zhuang de Guangxi, Yunnan, Guangdong y Guizhou",
            materials: "Algodón cultivado localmente, brocado Zhuang (壮锦) e hilos de seda",
            features: "Predominancia del color negro, tocados complejos y brocados geométricos",
            desc: "Los Zhuang son la minoría étnica más poblada de China. Su vestimenta tradicional refleja su maestría en la hilatura, tejido y teñido del algodón. El negro es el color sagrado y predominante. Las mujeres visten camisas de cuello oblicuo derecho (derechistas), con encajes bordados en puños, dobladillos y cuellos, complementados con delantales ajustados a la cintura y zapatos bordados durante festivales. Los ornamentos de plata, como collares y pulseras, marcan el estatus social. Su mayor aportación textil es el Brocado Zhuang (壮锦), famoso por sus diseños geométricos armoniosos (diamantes, espadas, ondas de agua y el carácter de diez mil / 万字纹) y motivos zoomorfos como dragones, fénix, peces y aves, utilizado tradicionalmente para fajas, faldas y colchas.",
            bibliography: "Guangxi Museum. (2018). <i>The Textile Arts of the Zhuang Minority</i>. Nanning: Guangxi People's Publishing House."
          },
          han: {
            title: "Hanfu (Vestimenta de la Etnia Han)",
            hanzi: "汉服",
            pinyin: "Hànfú",
            origin: "Llanura Central de China (dinastías imperiales de la antigüedad)",
            materials: "Seda de alta calidad, brocados imperiales, algodón y lino",
            features: "Cuello cruzado (交领), solapa derecha (右衽), mangas anchas (宽袖) y botones ocultos",
            desc: "El Hanfu representa el sistema de vestimenta histórica de la etnia Han (Huaxia) desarrollado durante casi cuatro milenios desde la época del Emperador Amarillo hasta el final de la dinastía Ming. Su estructura fundamental descarta el uso de botones visibles, basándose en el cuello cruzado, la solapa cruzada a la derecha y cinturones anchos de seda. Más allá de su valor estético, el Hanfu posee una profunda carga filosófica y ritual vinculada al confucianismo y detallada en clásicos como el Yijing (易经). Condensa técnicas tradicionales de tejeduría, batik, bordado e hilado de seda, y ha influido directamente en los trajes nacionales de Japón (Kimono), Corea (Hanbok) y Vietnam.",
            bibliography: "Hua, Mei. (2004). <i>Chinese Clothing</i>. Beijing: China Intercontinental Press."
          },
          mongolian: {
            title: "Túnica Tradicional Mongol",
            hanzi: "蒙古族长袍",
            pinyin: "Měnggǔzú chángpáo",
            origin: "Región Autónoma de Inner Mongolia y pastizales del norte",
            materials: "Lana de oveja, cuero curtido, seda y brocados gruesos",
            features: "Diseño holgado de mangas largas, cinturones de raso y tocados de cuentas rojas",
            desc: "La túnica o caftán mongol está diseñada específicamente para adaptarse a la vida nómada en los pastizales del norte de China y las bajas temperaturas estacionales. Es un patrimonio cultural inmaterial nacional que consta de una túnica de cuerpo肥大 (holgado) y mangas largas que protegen las manos del frío y las bridas del caballo, facilitando la equitación y el tiro con arco. Las túnicas carecen de aberturas laterales en el dobladillo inferior para mantener la retención térmica corporal. Se complementa con cinturones de raso de colores vivos (rojo o verde) que estabilizan la columna lumbar al cabalgar y tocados con cuentas rojas de coral u otras gemas.",
            bibliography: "Inner Mongolia Museum. (2015). <i>Nomadic Costumes of the Northern Steppe</i>. Hohhot: Inner Mongolia People's Publishing House."
          },
          miao: {
            title: "Indumentaria Étnica Miao",
            hanzi: "苗族服装",
            pinyin: "Miáozú fúzhuāng",
            origin: "Hunan, Guizhou, Yunnan y Sichuan",
            materials: "Bordado Miao (苗绣), telas teñidas con cera (batik) y aleación de plata",
            features: "Coronas de plata labrada de gran tamaño, faldas plisadas y bordados iconográficos",
            desc: "La vestimenta Miao, llamada 'Wuqian' en su lengua nativa, es célebre por su complejidad ornamental y diversidad, con más de 200 variaciones regionales registradas. Sus componentes centrales son el bordado Miao (苗绣), considerado un 'libro histórico portado en el cuerpo' por representar la migración de la etnia mediante hilos de colores, y el teñido de cera (batik). Las prendas de gala de las mujeres ('Wuqiantao' o ropa plateada) se combinan con coronas, collares y pecheras de plata tallada a mano con motivos de dragones, mariposas y flores. En regiones como Hunan y Guizhou oriental la plata es obligatoria, mientras que en la zona del dialecto occidental su uso es menor.",
            bibliography: "Tianshi, Liang. (2012). <i>Silver Ornaments and Embroidery of the Miao People</i>. Guiyang: Guizhou Nationalities Publishing House."
          },
          tibetan: {
            title: "Vestimenta Tradicional Tibetana (Zang)",
            hanzi: "藏族服装",
            pinyin: "Zàngzú fúzhuāng",
            origin: "Meseta Qinghai-Tíbet (Área del Himalaya)",
            materials: "Piel de oveja gruesa (pulú), lana tejida a mano y sedas",
            features: "Corte asimétrico, manga expuesta y un amplio bolsillo frontal multifuncional",
            desc: "La ropa tibetana es un ejemplo directo de adaptación al riguroso clima y geografía de la meseta del Tíbet. Las prendas son gruesas, pesadas y de cintura ancha para asegurar el aislamiento térmico. La túnica se ajusta con una faja de modo que se genera un gran espacio en el pecho (similar a una bolsa) donde los pastores guardan comida (tsampa, mantequilla, té) o utensilios diarios. Durante el día, debido a la fuerte radiación solar y el calor derivado del trabajo físico, se extrae el brazo derecho o ambos brazos de las mangas, atándolas a la cintura. Por la noche, al soltar la faja y retirar las mangas, el traje se transforma en un saco de dormir completo.",
            bibliography: "Tibetan Academy of Social Sciences. (2019). <i>Ethnographic Attire and Daily Life on the Roof of the World</i>. Lhasa: Tibet People's Publishing House."
          }
        }
      },
      en: {
        intro: "Traditional attire in China reflects the vast ethnographic diversity and ecological adaptation of its 56 officially recognized ethnic groups. The majority Han ethnic group coexists with 55 ethnic minorities whose garments represent national intangible cultural heritages, characterized by complex weaving, embroidery, dyeing, and the use of symbolic ornaments of high sociological value.",
        sourcesTitle: "Bibliographical Sources",
        filterAll: "All Cultures",
        groupSelectorLabel: "Select Ethnic Group:",
        groups: {
          zhuang: {
            title: "Traditional Zhuang Attire",
            hanzi: "壮族服装",
            pinyin: "Zhuàngzú fúzhuāng",
            origin: "Guangxi Zhuang Autonomous Region, Yunnan, Guangdong, and Guizhou",
            materials: "Locally grown cotton, Zhuang brocade (壮锦), and silk threads",
            features: "Predominance of black color, complex headscarves, and geometric brocades",
            desc: "The Zhuang are the most populous ethnic minority in China. Their traditional garments showcase outstanding skills in cotton spinning, weaving, and dyeing. Black is considered a sacred and dominant color. Women wear right-oblique collar blouses with embroidered lace on cuffs, hems, and collars, paired with tight waist aprons and embroidered shoes for festivals. Silver ornaments like necklaces and bracelets mark social status. Their greatest textile contribution is the Zhuang Brocade (壮锦), renowned for its harmonious geometric patterns (diamonds, swords, water waves, and the ten-thousand character / 万字纹) and zoomorphic motifs like dragons, phoenixes, fish, and birds, used for sashes, pleated skirts, and blankets.",
            bibliography: "Guangxi Museum. (2018). <i>The Textile Arts of the Zhuang Minority</i>. Nanning: Guangxi People's Publishing House."
          },
          han: {
            title: "Hanfu (Han Ethnic Attire)",
            hanzi: "汉服",
            pinyin: "Hànfú",
            origin: "Central Plains of China (ancient imperial dynasties)",
            materials: "High-grade silk, imperial brocades, cotton, and linen",
            features: "Crossed collar (交领), right lapel (右衽), wide sleeves (宽袖), and hidden buttons",
            desc: "Hanfu represents the historical clothing system of the Han (Huaxia) ethnicity, developed for nearly four millennia from the era of the Yellow Emperor to the end of the Ming Dynasty. Its fundamental structure eschews visible buttons, relying instead on a crossed collar, a right-overlapping lapel, and wide silk sashes. Beyond aesthetics, Hanfu carries deep philosophical and ritual significance rooted in Confucianism and detailed in classics like the Yijing (Book of Changes). It condenses traditional weaving, batik, embroidery, and silk-spinning techniques, and has directly influenced the national costumes of Japan (Kimono), Korea (Hanbok), and Vietnam.",
            bibliography: "Hua, Mei. (2004). <i>Chinese Clothing</i>. Beijing: China Intercontinental Press."
          },
          mongolian: {
            title: "Traditional Mongolian Robe",
            hanzi: "蒙古族长袍",
            pinyin: "Měnggǔzú chángpáo",
            origin: "Inner Mongolia Autonomous Region and northern grasslands",
            materials: "Sheep wool, tanned leather, silk, and heavy brocades",
            features: "Loose-fitting long-sleeved design, satin belts, and red beaded headdresses",
            desc: "The Mongolian robe or caftan is designed specifically to adapt to nomadic life on the northern steppes and low seasonal temperatures. It is a national intangible cultural heritage comprising a loose-fitting (肥大) robe and long sleeves that shield hands from the cold and protect against horse reins, facilitating horse riding and archery. The robes feature no side slits in the lower hem to maximize thermal retention. It is complemented by brightly colored satin sashes (red or green) that stabilize the lumbar spine during riding, and headdresses adorned with red coral beads or other gems.",
            bibliography: "Inner Mongolia Museum. (2015). <i>Nomadic Costumes of the Northern Steppe</i>. Hohhot: Inner Mongolia People's Publishing House."
          },
          miao: {
            title: "Miao Ethnic Attire",
            hanzi: "苗族服装",
            pinyin: "Miáozú fúzhuāng",
            origin: "Hunan, Guizhou, Yunnan, and Sichuan",
            materials: "Miao embroidery (苗绣), wax-dyed fabrics (batik), and silver alloy",
            features: "Large hand-carved silver crowns, pleated skirts, and iconographic embroidery",
            desc: "Miao attire, called 'Wuqian' in their native tongue, is famous for its ornamental complexity and diversity, with over 200 regional variations recorded. Its core elements are Miao embroidery (苗绣), considered a 'wearable history book' because it records the group's migrations through colored threads, and batik (wax dyeing). Women's festive garments ('Wuqiantao' or silver clothing) are paired with hand-carved silver crowns, necklaces, and chest plates depicting dragons, butterflies, and flowers. In areas like Hunan and eastern Guizhou, silver jewelry is mandatory, whereas the western dialect area uses far fewer silver ornaments.",
            bibliography: "Tianshi, Liang. (2012). <i>Silver Ornaments and Embroidery of the Miao People</i>. Guiyang: Guizhou Nationalities Publishing House."
          },
          tibetan: {
            title: "Traditional Tibetan Attire (Zang)",
            hanzi: "藏族服装",
            pinyin: "Zàngzú fúzhuāng",
            origin: "Qinghai-Tibet Plateau (Himalayan Region)",
            materials: "Thick sheepskin (pulu), hand-woven wool, and silks",
            features: "Asymmetrical cut, exposed sleeve, and a spacious multi-functional chest pocket",
            desc: "Tibetan clothing is a direct example of adaptation to the harsh climate and altitude of the Tibetan Plateau. Garments are thick, heavy, and wide-waisted to ensure thermal insulation. The robe is secured with a sash, generating a large pouch in the chest area where herders store food (tsampa, butter, tea) or daily utensils. During the day, due to strong solar radiation and physical labor, the right arm or both arms are pulled out of the sleeves and tied around the waist. At night, undoing the sash and sliding off the sleeves transforms the robe into a warm sleeping bag.",
            bibliography: "Tibetan Academy of Social Sciences. (2019). <i>Ethnographic Attire and Daily Life on the Roof of the World</i>. Lhasa: Tibet People's Publishing House."
          }
        }
      }
    };
  }

  async loadData() {
    this.clothingData = this.content;
  }

  render() {
    if (!this.container) return;

    const lang = (this.app && this.app.currentLanguage) === 'en' ? 'en' : 'es';
    const activeContent = this.content[lang];

    // Inject styles only if they don't exist
    if (!document.getElementById('culture-clothing-styles')) {
      const style = document.createElement('style');
      style.id = 'culture-clothing-styles';
      style.textContent = `
        .clothing-intro {
          padding: 1.5rem;
          background: var(--color-bg-card, rgba(16, 185, 129, 0.03));
          border-left: 4px solid var(--color-primary, #10b981);
          border-radius: var(--radius-sm, 4px);
          margin-bottom: 2rem;
        }
        .clothing-intro p {
          margin: 0;
          color: var(--color-text-main, #333);
          line-height: 1.7;
          font-size: 0.98rem;
        }
        .clothing-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
        }
        .clothing-filter-btn {
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-text-muted, #555);
          cursor: pointer;
          transition: all 0.2s;
        }
        .clothing-filter-btn:hover {
          border-color: var(--color-primary, #10b981);
          color: var(--color-primary, #10b981);
        }
        .clothing-filter-btn.active {
          background: var(--color-primary, #10b981);
          color: #fff;
          border-color: var(--color-primary, #10b981);
        }
        .clothing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .clothing-card {
          background: var(--color-bg-panel, #fff);
          border: 1px solid var(--color-border, rgba(0,0,0,0.08));
          border-radius: var(--radius-lg, 12px);
          padding: 2rem;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.06));
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .clothing-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
        }
        .clothing-card-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          border-bottom: 1px solid var(--color-border, rgba(0,0,0,0.06));
          padding-bottom: 0.8rem;
          flex-wrap: wrap;
        }
        .clothing-card-header h3 {
          margin: 0;
          font-size: 1.6rem;
          color: var(--color-primary, #10b981);
        }
        .clothing-card-header .hanzi-tag {
          font-family: 'Noto Sans SC', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary, #10b981);
        }
        .clothing-card-header .pinyin-tag {
          font-size: 1rem;
          color: var(--color-text-muted, #666);
        }
        .clothing-meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.6rem;
          background: var(--color-bg-card, rgba(0,0,0,0.015));
          padding: 1rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--color-border, rgba(0,0,0,0.03));
          font-size: 0.9rem;
        }
        @media (min-width: 640px) {
          .clothing-meta-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }
        .clothing-meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .clothing-meta-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-muted, #777);
          font-weight: 700;
        }
        .clothing-meta-val {
          color: var(--color-text-main, #333);
          font-weight: 500;
        }
        .clothing-desc {
          font-size: 0.96rem;
          line-height: 1.7;
          color: var(--color-text-main, #444);
          text-align: justify;
          margin: 0;
        }
        .clothing-biblio {
          font-size: 0.8rem;
          color: var(--color-text-dim, #666);
          border-left: 3px solid var(--color-border, #ccc);
          padding-left: 0.75rem;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .clothing-citations-section {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px dashed var(--color-border, #ccc);
        }
        .clothing-citations-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.05rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted, #555);
        }
        .clothing-citations-section ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-dim, #666);
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .clothing-citations-section li {
          margin-bottom: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }

    let html = `
      <div class="clothing-intro">
        <p>${activeContent.intro}</p>
      </div>

      <div class="clothing-filters">
        <button class="clothing-filter-btn ${this.activeGroup === 'all' ? 'active' : ''}" data-group="all">
          ${activeContent.filterAll}
        </button>
    `;

    Object.keys(activeContent.groups).forEach(key => {
      const g = activeContent.groups[key];
      html += `
        <button class="clothing-filter-btn ${this.activeGroup === key ? 'active' : ''}" data-group="${key}">
          ${g.title.split(' (')[0]}
        </button>
      `;
    });

    html += `
      </div>
      <div class="clothing-grid">
    `;

    const groupsToRender = this.activeGroup === 'all' 
      ? Object.keys(activeContent.groups) 
      : [this.activeGroup];

    groupsToRender.forEach(key => {
      const item = activeContent.groups[key];
      html += `
        <div class="clothing-card" id="clothing-card-${key}">
          <div class="clothing-card-header">
            <h3>${item.title}</h3>
            <span class="hanzi-tag">${item.hanzi}</span>
            <span class="pinyin-tag">${item.pinyin}</span>
          </div>
          
          <div class="clothing-meta-grid">
            <div class="clothing-meta-item">
              <span class="clothing-meta-label">${lang === 'en' ? 'Region of Origin' : 'Origen y Región'}</span>
              <span class="clothing-meta-val">${item.origin}</span>
            </div>
            <div class="clothing-meta-item">
              <span class="clothing-meta-label">${lang === 'en' ? 'Primary Materials' : 'Materiales Principales'}</span>
              <span class="clothing-meta-val">${item.materials}</span>
            </div>
            <div class="clothing-meta-item">
              <span class="clothing-meta-label">${lang === 'en' ? 'Distinctive Features' : 'Rasgos Distintivos'}</span>
              <span class="clothing-meta-val">${item.features}</span>
            </div>
          </div>

          <p class="clothing-desc">${item.desc}</p>
          
          <div class="clothing-biblio">
            <strong>${lang === 'en' ? 'Source' : 'Fuente'}:</strong> ${item.bibliography}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Collective Bibliography at the bottom
    html += `
      <div class="clothing-citations-section">
        <h4>${activeContent.sourcesTitle}</h4>
        <ul>
    `;
    Object.keys(activeContent.groups).forEach(key => {
      html += `<li>${activeContent.groups[key].bibliography}</li>`;
    });
    html += `
          <li>National Cultural Heritage Administration (NCHA). (2020). <i>Atlas of Chinese Intangible Cultural Heritage: Traditional Costumes</i>. Beijing: Cultural Relics Publishing House.</li>
        </ul>
      </div>
    `;

    this.container.innerHTML = html;

    // Attach event listeners for filtering
    this.container.querySelectorAll('.clothing-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const group = e.target.getAttribute('data-group');
        this.activeGroup = group;
        this.render();
      });
    });
  }
}

// Register class globally
window.EthnicClothingModule = EthnicClothingModule;
