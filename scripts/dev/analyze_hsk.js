const fs = require('fs');

const hskVocab = JSON.parse(fs.readFileSync('assets/data/hsk_vocabulary.json', 'utf8'));
const hskSpanishData = JSON.parse(fs.readFileSync('assets/data/hsk_vocabulary_spanish.json', 'utf8'));

// Map Spanish meanings by character + pinyin + level to merge with original vocab
const spanishMap = new Map();
hskSpanishData.forEach(item => {
    const key = `${item.character}|${item.pinyin}|${item.level}`;
    spanishMap.set(key, item.spanish);
});

const strokeCharacters = new Set(['横', '竖', '撇', '捺', '点', '提', '钩', '折', '㇀', '㇏', '丶', '丿', '丨', '一']);
const strokeMeaningPatterns = [
    /left-curving stroke/i,
    /left-falling stroke/i,
    /right-falling stroke/i,
    /vertical stroke/i,
    /horizontal character stroke/i,
    /horizontal stroke/i,
    /dot stroke/i,
    /rising stroke/i,
    /hook stroke/i,
    /character stroke/i,
];

function parseRadicalNumber(...texts) {
    for (const text of texts) {
        const value = String(text || '');
        const match = value.match(/(?:kangxi\s*)?radical(?:\s+de\s+kangxi)?\s*(\d{1,3})/i);
        if (match) return parseInt(match[1], 10);
    }
    return null;
}

function hasStrokeMeaning(...texts) {
    const originalHaystack = texts.map((text) => String(text || '')).join(' | ');
    const haystack = texts.map((text) => String(text || '').toLowerCase()).join(' | ');

    if (haystack.includes('stroke of good luck') || haystack.includes('to stroke')) {
        return false;
    }

    if (Array.from(strokeCharacters).some((character) => originalHaystack.includes(character))) {
        return true;
    }

    return strokeMeaningPatterns.some((pattern) => pattern.test(haystack));
}

const stats = {
    'radical-only': [],
    'stroke-only': [],
    'both': [],
    'none': []
};

hskVocab.forEach(word => {
    const key = `${word.character}|${word.pinyin}|${word.level}`;
    const spanish = spanishMap.get(key) || '';
    const english = String(word.english || word.translation || '').trim();
    const translation = String(word.translation || '').trim();

    // Check all fields for the radical/stroke markers
    const radicalNumber = parseRadicalNumber(english, translation, spanish);
    const hasRadical = radicalNumber !== null && !isNaN(radicalNumber);
    const hasStroke = hasStrokeMeaning(english, translation, spanish);

    const termLabel = `${word.character} (${word.pinyin}) - ${english}`;

    if (hasRadical && hasStroke) {
        stats['both'].push(termLabel);
    } else if (hasRadical) {
        stats['radical-only'].push(termLabel);
    } else if (hasStroke) {
        stats['stroke-only'].push(termLabel);
    } else {
        stats['none'].push(termLabel);
    }
});

console.log('Counts:');
console.log('radical-only:', stats['radical-only'].length);
console.log('stroke-only:', stats['stroke-only'].length);
console.log('both:', stats['both'].length);
console.log('none:', stats['none'].length);

console.log('\nTop 5 Radical-only:');
stats['radical-only'].slice(0, 5).forEach(t => console.log(' - ' + t));

console.log('\nTop 5 Stroke-only:');
stats['stroke-only'].slice(0, 5).forEach(t => console.log(' - ' + t));

console.log('\nTop 5 Both:');
stats['both'].slice(0, 5).forEach(t => console.log(' - ' + t));
