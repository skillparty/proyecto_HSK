/**
 * StrokesRadicalsCatalogData - static reference data for the strokes &
 * radicals module: stroke-name labels per language, extended stroke
 * metadata, the 44-stroke and 214-Kangxi-radical catalogs. Pure data,
 * no app/DOM dependency. Extracted from StrokesRadicalsController,
 * which builds this.strokeCatalog/radicalCatalog from a single shared
 * instance of this class.
 */
class StrokesRadicalsCatalogData {
    constructor() {
        this.strokeCodeComponentLabelsByLanguage = {
            es: {
                H: 'horizontal 一 (heng)',
                S: 'vertical 丨 (shu)',
                P: 'descendente izquierda 丿 (pie)',
                N: 'descendente derecha ㇏ (na)',
                D: 'punto 丶 (dian)',
                T: 'ascendente ㇀ (ti)',
                Z: 'giro/quiebre (zhe)',
                G: 'gancho 亅 (gou)',
                W: 'curva (wan)',
                B: 'trazo corto (duan)',
                X: 'oblicuo (xie)',
                Q: 'envolvente (quan)'
            },
            en: {
                H: 'horizontal 一 (heng)',
                S: 'vertical 丨 (shu)',
                P: 'left-falling 丿 (pie)',
                N: 'right-falling ㇏ (na)',
                D: 'dot 丶 (dian)',
                T: 'rising ㇀ (ti)',
                Z: 'turning (zhe)',
                G: 'hook 亅 (gou)',
                W: 'bend (wan)',
                B: 'short stroke (duan)',
                X: 'slanting (xie)',
                Q: 'enclosing (quan)'
            }
        };
    }

    getStrokeCodeComponentLabels(languageCode = 'en') {
        return this.strokeCodeComponentLabelsByLanguage[languageCode]
            || this.strokeCodeComponentLabelsByLanguage.en;
    }

    buildCompositeStrokeName(strokeCode, languageCode = 'en') {
        const normalizedCode = String(strokeCode || '').trim().toUpperCase();
        if (!normalizedCode) {
            return '';
        }

        const componentLabels = this.getStrokeCodeComponentLabels(languageCode);
        const components = normalizedCode
            .split('')
            .map((part) => componentLabels[part] || part);

        if (components.length === 1) {
            if (languageCode === 'es') {
                return `Variante ${normalizedCode}: ${components[0]}`;
            }

            return `Variant ${normalizedCode}: ${components[0]}`;
        }

        const joiner = ' + ';
        if (languageCode === 'es') {
            return `Compuesto ${normalizedCode}: ${components.join(joiner)}`;
        }

        return `Composite ${normalizedCode}: ${components.join(joiner)}`;
    }

    getExtendedStrokeMetadata() {
        return new Map([
            [0x31c0, { strokeCode: 'T' }],
            [0x31c1, { strokeCode: 'WG' }],
            [0x31c2, { strokeCode: 'XG' }],
            [0x31c3, { strokeCode: 'BXG' }],
            [0x31c4, { strokeCode: 'SW' }],
            [0x31c5, { strokeCode: 'HZZ' }],
            [0x31c6, { strokeCode: 'HZG' }],
            [0x31c7, { strokeCode: 'HP' }],
            [0x31c8, { strokeCode: 'HZWG' }],
            [0x31c9, { strokeCode: 'SZWG' }],
            [0x31ca, { strokeCode: 'HZT' }],
            [0x31cb, { strokeCode: 'HZZP' }],
            [0x31cc, { strokeCode: 'HPWG' }],
            [0x31cd, { strokeCode: 'HZW' }],
            [0x31ce, { strokeCode: 'HZZZ' }],
            [0x31cf, { strokeCode: 'N' }],
            [0x31d0, { strokeCode: 'H' }],
            [0x31d1, { strokeCode: 'S' }],
            [0x31d2, { strokeCode: 'P' }],
            [0x31d3, { strokeCode: 'SP' }],
            [0x31d4, { strokeCode: 'D' }],
            [0x31d5, { strokeCode: 'HZ' }],
            [0x31d6, { strokeCode: 'HG' }],
            [0x31d7, { strokeCode: 'SZ' }],
            [0x31d8, { strokeCode: 'SWZ' }],
            [0x31d9, { strokeCode: 'ST' }],
            [0x31da, { strokeCode: 'SG' }],
            [0x31db, { strokeCode: 'PD' }],
            [0x31dc, { strokeCode: 'PZ' }],
            [0x31dd, { strokeCode: 'TN' }],
            [0x31de, { strokeCode: 'SZZ' }],
            [0x31df, { strokeCode: 'SWG' }],
            [0x31e0, { strokeCode: 'HXWG' }],
            [0x31e1, { strokeCode: 'HZZZG' }],
            [0x31e2, { strokeCode: 'PG' }],
            [0x31e3, { strokeCode: 'Q' }]
        ]);
    }

    buildStrokeCatalog() {
        const coreStrokes = [
            {
                id: 'core-heng',
                symbol: '一',
                pinyin: 'heng',
                nameEs: 'Horizontal',
                nameEn: 'Horizontal',
                family: 'core'
            },
            {
                id: 'core-shu',
                symbol: '丨',
                pinyin: 'shu',
                nameEs: 'Vertical',
                nameEn: 'Vertical',
                family: 'core'
            },
            {
                id: 'core-pie',
                symbol: '丿',
                pinyin: 'pie',
                nameEs: 'Descendente izquierda',
                nameEn: 'Left-falling',
                family: 'core'
            },
            {
                id: 'core-dian',
                symbol: '丶',
                pinyin: 'dian',
                nameEs: 'Punto',
                nameEn: 'Dot',
                family: 'core'
            },
            {
                id: 'core-na',
                symbol: '㇏',
                pinyin: 'na',
                nameEs: 'Descendente derecha',
                nameEn: 'Right-falling',
                family: 'core'
            },
            {
                id: 'core-ti',
                symbol: '㇀',
                pinyin: 'ti',
                nameEs: 'Ascendente',
                nameEn: 'Rising',
                family: 'core'
            },
            {
                id: 'core-gou',
                symbol: '亅',
                pinyin: 'gou',
                nameEs: 'Gancho',
                nameEn: 'Hook',
                family: 'core'
            },
            {
                id: 'core-zhe',
                symbol: '乛',
                pinyin: 'zhe',
                nameEs: 'Giro',
                nameEn: 'Turning',
                family: 'core'
            }
        ];

        const extendedStrokeMetadata = this.getExtendedStrokeMetadata();
        const extensionStrokes = [];
        for (let codePoint = 0x31c0; codePoint <= 0x31e3; codePoint += 1) {
            const metadata = extendedStrokeMetadata.get(codePoint);
            const strokeCode = String(metadata?.strokeCode || '').trim().toUpperCase();
            const computedNameEs = this.buildCompositeStrokeName(strokeCode, 'es');
            const computedNameEn = this.buildCompositeStrokeName(strokeCode, 'en');
            const fallbackHex = codePoint.toString(16).toUpperCase();
            extensionStrokes.push({
                id: `extended-${codePoint.toString(16)}`,
                symbol: String.fromCodePoint(codePoint),
                pinyin: '',
                nameEs: computedNameEs || `Trazo extendido U+${fallbackHex}`,
                nameEn: computedNameEn || `Extended stroke U+${fallbackHex}`,
                strokeCode,
                family: 'extended'
            });
        }

        return [...coreStrokes, ...extensionStrokes].map((entry, index) => ({
            ...entry,
            order: index + 1,
            searchText: String([
                entry.symbol,
                entry.pinyin,
                entry.nameEs,
                entry.nameEn,
                entry.strokeCode,
                entry.family,
                index + 1
            ].join(' ').toLowerCase())
        }));
    }

    buildRadicalCatalog() {
        const radicals = [];

        for (let radicalNumber = 1; radicalNumber <= 214; radicalNumber += 1) {
            const kangxiSymbol = String.fromCodePoint(0x2f00 + (radicalNumber - 1));
            const normalizedSymbol = kangxiSymbol.normalize('NFKC');
            const symbol = normalizedSymbol || kangxiSymbol;

            radicals.push({
                number: radicalNumber,
                symbol,
                kangxiSymbol,
                searchText: String([
                    radicalNumber,
                    symbol,
                    kangxiSymbol,
                    `kangxi radical ${radicalNumber}`
                ].join(' ').toLowerCase())
            });
        }

        return radicals;
    }

}

window.StrokesRadicalsCatalogData = new StrokesRadicalsCatalogData();
