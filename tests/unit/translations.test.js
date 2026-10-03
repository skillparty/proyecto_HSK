import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Translations (i18n) Parity & Completeness", () => {
    const translationsFilePath = path.resolve(__dirname, "../../assets/js/translations.js");
    const fileContent = fs.readFileSync(translationsFilePath, "utf8");

    // Execute within isolated context
    const fn = new Function("window", `${fileContent}; return translations;`);
    const translations = fn({});

    const languages = ["es", "en", "ru", "th"];

    it("has all 4 language dictionaries (es, en, ru, th)", () => {
        expect(translations).toBeDefined();
        languages.forEach((lang) => {
            expect(translations[lang]).toBeTypeOf("object");
        });
    });

    it("maintains 100% key parity across all four languages", () => {
        const esKeys = Object.keys(translations.es);
        expect(esKeys.length).toBeGreaterThan(1000);

        languages.forEach((lang) => {
            const langKeys = Object.keys(translations[lang]);
            const missing = esKeys.filter((k) => !(k in translations[lang]));
            const extra = langKeys.filter((k) => !(k in translations.es));

            expect(missing, `Keys missing in ${lang}`).toEqual([]);
            expect(extra, `Extra keys in ${lang}`).toEqual([]);
            expect(langKeys.length).toBe(esKeys.length);
        });
    });

    it("contains no empty string or null values in any language", () => {
        languages.forEach((lang) => {
            for (const [k, v] of Object.entries(translations[lang])) {
                expect(typeof v, `Key ${k} in ${lang} must be string`).toBe("string");
                expect(v.trim().length, `Key ${k} in ${lang} cannot be empty`).toBeGreaterThan(0);
            }
        });
    });

    it("maintains identical interpolation placeholders across all languages", () => {
        const placeholderRegex = /\{([a-zA-Z0-9_]+)\}/g;
        const esKeys = Object.keys(translations.es);

        for (const key of esKeys) {
            const refMatches = (translations.en[key].match(placeholderRegex) || []).sort();

            for (const lang of ["es", "ru", "th"]) {
                const langMatches = (translations[lang][key].match(placeholderRegex) || []).sort();
                expect(langMatches, `Placeholder mismatch for key '${key}' in ${lang}`).toEqual(refMatches);
            }
        }
    });

    it("correctly includes cultural games and modern module keys in all languages", () => {
        // English
        expect(translations.en.cityVocabTitle).toBe("Essential Travel Vocabulary");
        expect(translations.en.scrollPresetQuietNight).toContain("Li Bai");
        expect(translations.en.nameTraitWisdom).toContain("Wisdom");
        expect(translations.en.decompSiblingsDesc).toBe("Other common characters built with the same component:");
        expect(translations.en.wsCountLabel).toBe("Amount:");
        expect(translations.en.shadowSceneCounter).toBe("Scene 1 of 4");
        expect(translations.en.strokesCanvasTitle).toBe("Writing & Calligraphy Canvas");
        expect(translations.en.tone1NameInitial).toContain("High Level");

        // Russian
        expect(translations.ru.cityVocabTitle).toBe("Необходимый словарь для поездки");
        expect(translations.ru.scrollPresetQuietNight).toContain("Ли Бо");
        expect(translations.ru.nameTraitWisdom).toContain("Мудрость");
        expect(translations.ru.appTitle).toBe("Confuc10++");
        expect(translations.ru.russian).toBe("Русский");
        expect(translations.ru.thai).toBe("Тайский");

        // Thai
        expect(translations.th.cityVocabTitle).toBe("คำศัพท์จำเป็นสำหรับการท่องเที่ยว");
        expect(translations.th.scrollPresetQuietNight).toContain("หลี่ไป๋");
        expect(translations.th.nameTraitWisdom).toContain("ปัญญา");
        expect(translations.th.appTitle).toBe("Confuc10++");
        expect(translations.th.russian).toBe("ภาษารัสเซีย");
        expect(translations.th.thai).toBe("ภาษาไทย");
    });
});
