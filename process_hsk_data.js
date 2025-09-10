import fs from 'fs';

// Traducciones al español para palabras comunes HSK
const spanishTranslations = {
    // HSK 1
    "love": "amor, amar",
    "eight": "ocho",
    "father": "papá, padre",
    "dad": "papá",
    "cup": "taza, vaso",
    "glass": "vaso",
    "Beijing": "Pekín, Beijing",
    "book": "libro",
    "no": "no",
    "not": "no",
    "you're welcome": "de nada",
    "vegetable": "verdura",
    "dish": "plato",
    "food": "comida",
    "tea": "té",
    "good": "bueno",
    "well": "bien",
    "eat": "comer",
    "drink": "beber",
    "water": "agua",
    "rice": "arroz",
    "meat": "carne",
    "fish": "pescado",
    "chicken": "pollo",
    "beef": "carne de res",
    "pork": "cerdo",
    "fruit": "fruta",
    "apple": "manzana",
    "banana": "plátano",
    "orange": "naranja",
    "milk": "leche",
    "coffee": "café",
    "juice": "jugo",
    "bread": "pan",
    "egg": "huevo",
    "sugar": "azúcar",
    "salt": "sal",
    
    // HSK 2
    "class": "clase",
    "shift": "turno",
    "move": "mover, mudarse",
    "relocate": "mudarse",
    "method": "método",
    "way": "manera, forma",
    "solution": "solución",
    "help": "ayudar, ayuda",
    "assist": "ayudar",
    "bag": "bolsa",
    "package": "paquete",
    "wrap": "envolver",
    
    // HSK 3
    "arrange": "organizar, arreglar",
    "organize": "organizar",
    "safety": "seguridad",
    "safe": "seguro",
    "on time": "a tiempo",
    "punctual": "puntual",
    
    // HSK 4
    "care for": "cuidar",
    "protect": "proteger",
    "comfort": "consolar, consuelo",
    "console": "consolar",
    
    // HSK 5
    "hobby": "afición, hobby",
    "interest": "interés",
    
    // HSK 6
    "cherish": "valorar, apreciar",
    "treasure": "atesorar"
};

function translateToSpanish(englishMeaning) {
    // Buscar traducción directa
    if (spanishTranslations[englishMeaning.toLowerCase()]) {
        return spanishTranslations[englishMeaning.toLowerCase()];
    }
    
    // Buscar por palabras clave
    for (const [english, spanish] of Object.entries(spanishTranslations)) {
        if (englishMeaning.toLowerCase().includes(english)) {
            return spanish;
        }
    }
    
    // Si no encuentra traducción, devolver el inglés
    return englishMeaning;
}

function processHSKData() {
    try {
        // Leer el archivo fuente
        const rawData = fs.readFileSync('hsk_complete_source.json', 'utf8');
        const sourceData = JSON.parse(rawData);
        
        const processedVocabulary = {
            metadata: {
                version: "2.0",
                description: "Complete HSK vocabulary levels 1-6 with Spanish and English translations",
                totalWords: 0,
                levels: {}
            },
            vocabulary: {
                "1": [],
                "2": [],
                "3": [],
                "4": [],
                "5": [],
                "6": []
            }
        };
        
        let wordId = 1;
        
        sourceData.forEach(item => {
            if (!item.level || !item.forms || item.forms.length === 0) return;
            
            // Determinar el nivel HSK
            let hskLevel = null;
            for (const level of item.level) {
                if (level.includes('new-1')) hskLevel = 1;
                else if (level.includes('new-2')) hskLevel = 2;
                else if (level.includes('new-3')) hskLevel = 3;
                else if (level.includes('new-4')) hskLevel = 4;
                else if (level.includes('new-5')) hskLevel = 5;
                else if (level.includes('new-6')) hskLevel = 6;
                else if (level.includes('old-1')) hskLevel = hskLevel || 1;
                else if (level.includes('old-2')) hskLevel = hskLevel || 2;
                else if (level.includes('old-3')) hskLevel = hskLevel || 3;
                else if (level.includes('old-4')) hskLevel = hskLevel || 4;
                else if (level.includes('old-5')) hskLevel = hskLevel || 5;
                else if (level.includes('old-6')) hskLevel = hskLevel || 6;
            }
            
            if (!hskLevel || hskLevel > 6) return;
            
            const form = item.forms[0];
            if (!form.meanings || form.meanings.length === 0) return;
            
            const englishMeaning = form.meanings.join(', ');
            const spanishMeaning = translateToSpanish(englishMeaning);
            
            const word = {
                id: wordId++,
                character: item.simplified,
                pinyin: form.transcriptions?.pinyin || '',
                translations: {
                    spanish: spanishMeaning,
                    english: englishMeaning
                },
                type: item.pos ? item.pos.join(', ') : 'unknown',
                strokes: estimateStrokes(item.simplified),
                hskLevel: hskLevel,
                tones: extractTones(form.transcriptions?.pinyin || ''),
                examples: {
                    spanish: `${item.simplified} - ${spanishMeaning}`,
                    english: `${item.simplified} - ${englishMeaning}`
                }
            };
            
            processedVocabulary.vocabulary[hskLevel.toString()].push(word);
        });
        
        // Actualizar metadatos
        Object.keys(processedVocabulary.vocabulary).forEach(level => {
            processedVocabulary.metadata.levels[level] = processedVocabulary.vocabulary[level].length;
            processedVocabulary.metadata.totalWords += processedVocabulary.vocabulary[level].length;
        });
        
        // Guardar el archivo procesado
        fs.writeFileSync('hsk_vocabulary_complete.json', JSON.stringify(processedVocabulary, null, 2));
        
        console.log('✅ Vocabulario HSK procesado exitosamente');
        console.log(`📊 Total de palabras: ${processedVocabulary.metadata.totalWords}`);
        Object.keys(processedVocabulary.metadata.levels).forEach(level => {
            console.log(`   Nivel ${level}: ${processedVocabulary.metadata.levels[level]} palabras`);
        });
        
    } catch (error) {
        console.error('❌ Error procesando datos HSK:', error);
    }
}

function estimateStrokes(character) {
    // Estimación básica de trazos basada en la complejidad del carácter
    return Math.max(1, Math.min(30, character.length * 8));
}

function extractTones(pinyin) {
    if (!pinyin) return '';
    
    const toneMap = {
        'ā': '1', 'á': '2', 'ǎ': '3', 'à': '4',
        'ē': '1', 'é': '2', 'ě': '3', 'è': '4',
        'ī': '1', 'í': '2', 'ǐ': '3', 'ì': '4',
        'ō': '1', 'ó': '2', 'ǒ': '3', 'ò': '4',
        'ū': '1', 'ú': '2', 'ǔ': '3', 'ù': '4',
        'ǖ': '1', 'ǘ': '2', 'ǚ': '3', 'ǜ': '4'
    };
    
    let tones = '';
    for (const char of pinyin) {
        if (toneMap[char]) {
            tones += toneMap[char];
        }
    }
    
    return tones || '0';
}

// Ejecutar el procesamiento
processHSKData();
