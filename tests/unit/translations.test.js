import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Translations (i18n) Parity & Completeness", () => {
    const translationsFilePath = path.resolve(__dirname, "../../assets/js/translations.js");
    const fileContent = fs.readFileSync(translationsFilePath, "utf8");

    // Execute within isolated context
    const fn = new Function("window", `${fileContent}; return translations;`);
    const translations = fn({});

    it("has both 'es' and 'en' language dictionaries", () => {
        expect(translations).toBeDefined();
        expect(translations.es).toBeTypeOf("object");
        expect(translations.en).toBeTypeOf("object");
    });

    it("maintains 100% key parity between ES and EN", () => {
        const esKeys = Object.keys(translations.es);
        const enKeys = Object.keys(translations.en);

        const missingInEn = esKeys.filter((k) => !(k in translations.en));
        const missingInEs = enKeys.filter((k) => !(k in translations.es));

        expect(missingInEn).toEqual([]);
        expect(missingInEs).toEqual([]);
        expect(esKeys.length).toBe(enKeys.length);
        expect(esKeys.length).toBeGreaterThan(800);
    });

    it("contains no empty string or null values in either language", () => {
        for (const v of Object.values(translations.es)) {
            expect(typeof v).toBe("string");
            expect(v.trim().length).toBeGreaterThan(0);
        }
        for (const v of Object.values(translations.en)) {
            expect(typeof v).toBe("string");
            expect(v.trim().length).toBeGreaterThan(0);
        }
    });

    it("correctly includes cultural games and modern module keys in English", () => {
        expect(translations.en.cityVocabTitle).toBe("Essential Travel Vocabulary");
        expect(translations.en.scrollPresetQuietNight).toContain("Li Bai");
        expect(translations.en.nameTraitWisdom).toContain("Wisdom");
        expect(translations.en.decompSiblingsDesc).toBe("Other common characters built with the same component:");
        expect(translations.en.wsCountLabel).toBe("Amount:");
        expect(translations.en.shadowSceneCounter).toBe("Scene 1 of 4");
        expect(translations.en.strokesCanvasTitle).toBe("Writing & Calligraphy Canvas");
        expect(translations.en.tone1NameInitial).toContain("High Level");
    });
});
