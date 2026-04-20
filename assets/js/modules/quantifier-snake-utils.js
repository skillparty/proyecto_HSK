const QuantifierSnakeUtils = {
    normalizeData(payload) {
        if (!payload || typeof payload !== 'object') {
            return null;
        }

        const quantifiers = Array.isArray(payload.quantifiers) ? payload.quantifiers
            .map((entry) => QuantifierSnakeUtils.normalizeQuantifier(entry))
            .filter(Boolean) : [];

        const quantifierIds = new Set(quantifiers.map((entry) => entry.id));

        const words = Array.isArray(payload.words) ? payload.words
            .map((entry) => QuantifierSnakeUtils.normalizeWord(entry, quantifierIds))
            .filter(Boolean) : [];

        if (quantifiers.length < 4 || words.length < 16) {
            return null;
        }

        return {
            quantifiers,
            words
        };
    },

    normalizeQuantifier(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        const id = String(entry.id || '').trim();
        const hanzi = String(entry.hanzi || '').trim();
        const pinyin = String(entry.pinyin || '').trim();
        const es = String(entry.es || '').trim();
        const en = String(entry.en || '').trim();

        if (!id || !hanzi || !pinyin || !es || !en) {
            return null;
        }

        return { id, hanzi, pinyin, es, en };
    },

    normalizeWord(entry, quantifierIds) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        const id = String(entry.id || '').trim();
        const hanzi = String(entry.hanzi || '').trim();
        const pinyin = String(entry.pinyin || '').trim();
        const es = String(entry.es || '').trim();
        const en = String(entry.en || '').trim();

        const quantifiers = Array.isArray(entry.quantifiers)
            ? entry.quantifiers
                .map((value) => String(value || '').trim())
                .filter((value) => quantifierIds.has(value))
            : [];

        if (!id || !hanzi || !pinyin || !es || !en || quantifiers.length === 0) {
            return null;
        }

        return {
            id,
            hanzi,
            pinyin,
            es,
            en,
            quantifiers
        };
    },

    buildWordLookup(data) {
        const wordsByQuantifier = new Map();
        const quantifiers = Array.isArray(data?.quantifiers) ? data.quantifiers : [];
        const words = Array.isArray(data?.words) ? data.words : [];

        quantifiers.forEach((quantifier) => {
            wordsByQuantifier.set(quantifier.id, []);
        });

        words.forEach((word) => {
            word.quantifiers.forEach((quantifierId) => {
                const list = wordsByQuantifier.get(quantifierId);
                if (list) {
                    list.push(word);
                }
            });
        });

        return wordsByQuantifier;
    },

    sampleWords(pool, count) {
        if (!Array.isArray(pool) || pool.length === 0 || count <= 0) {
            return [];
        }

        const copied = [...pool];
        QuantifierSnakeUtils.shuffleArray(copied);

        if (copied.length >= count) {
            return copied.slice(0, count);
        }

        const sampled = [...copied];
        while (sampled.length < count) {
            sampled.push(pool[Math.floor(Math.random() * pool.length)]);
        }

        return sampled;
    },

    pickRandomFreeCell(boardSize, occupied) {
        const maxAttempts = boardSize * boardSize;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const x = Math.floor(Math.random() * boardSize);
            const y = Math.floor(Math.random() * boardSize);
            const key = QuantifierSnakeUtils.cellKey(x, y);

            if (!occupied.has(key)) {
                return { x, y };
            }
        }

        return null;
    },

    cellKey(x, y) {
        return String(x) + ':' + String(y);
    },

    shuffleArray(values) {
        for (let index = values.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const temp = values[index];
            values[index] = values[randomIndex];
            values[randomIndex] = temp;
        }
    }
};

window.QuantifierSnakeUtils = QuantifierSnakeUtils;
