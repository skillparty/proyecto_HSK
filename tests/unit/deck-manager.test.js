import { beforeEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/deck-manager.js";

const stubApp = () => ({
  vocabulary: [
    { character: "你好", pinyin: "nǐ hǎo", spanish: "hola", english: "hello", level: 1 },
    { character: "谢谢", pinyin: "xièxie", spanish: "gracias", english: "thank you", level: 1 },
    { character: "苹果", pinyin: "píngguǒ", spanish: "manzana", english: "apple", level: 1 },
  ],
  logDebug: vi.fn(),
  logWarn: vi.fn(),
});

describe("DeckManager", () => {
  let app;
  let manager;

  beforeEach(() => {
    window.localStorage.clear();
    app = stubApp();
    manager = new window.DeckManager(app);
  });

  test("initializes with default favorites deck", () => {
    const favorites = manager.getDeck("favorites");
    expect(favorites).not.toBeNull();
    expect(favorites.words).toEqual([]);
  });

  test("creates and deletes custom decks", () => {
    const deck = manager.createDeck("Vocabulario Médico", "Términos de salud");
    expect(deck).not.toBeNull();
    expect(deck.name).toBe("Vocabulario Médico");
    expect(manager.getDeck(deck.id)).toBeDefined();

    const deleted = manager.deleteDeck(deck.id);
    expect(deleted).toBe(true);
    expect(manager.getDeck(deck.id)).toBeNull();
  });

  test("cannot delete default favorites deck", () => {
    const deleted = manager.deleteDeck("favorites");
    expect(deleted).toBe(false);
    expect(manager.getDeck("favorites")).not.toBeNull();
  });

  test("toggles favorite words", () => {
    const isNowFav = manager.toggleFavorite({ character: "你好", pinyin: "nǐ hǎo" });
    expect(isNowFav).toBe(true);
    expect(manager.isFavorite("你好")).toBe(true);

    const isRemoved = manager.toggleFavorite("你好");
    expect(isRemoved).toBe(false);
    expect(manager.isFavorite("你好")).toBe(false);
  });

  test("adds and removes words from decks", () => {
    const deck = manager.createDeck("Comida");
    manager.addWordToDeck(deck.id, { character: "苹果", pinyin: "píngguǒ", spanish: "manzana" });

    expect(manager.isWordInDeck(deck.id, "苹果")).toBe(true);

    manager.removeWordFromDeck(deck.id, "苹果");
    expect(manager.isWordInDeck(deck.id, "苹果")).toBe(false);
  });

  test("exports deck to Anki format TSV", () => {
    const deck = manager.createDeck("Anki Test");
    manager.addWordToDeck(deck.id, { character: "你好", pinyin: "nǐ hǎo", spanish: "hola", level: 1 });

    const ankiText = manager.exportToAnki(deck.id);
    expect(ankiText).toContain("#separator:tab");
    expect(ankiText).toContain("你好\tnǐ hǎo\thola");
  });

  test("exports deck to Pleco format", () => {
    const deck = manager.createDeck("Pleco Test");
    manager.addWordToDeck(deck.id, { character: "谢谢", pinyin: "xièxie", spanish: "gracias" });

    const plecoText = manager.exportToPleco(deck.id);
    expect(plecoText).toContain("谢谢\t[xièxie]\tgracias");
  });

  test("exports deck to CSV format with UTF-8 BOM", () => {
    const deck = manager.createDeck("CSV Test");
    manager.addWordToDeck(deck.id, { character: "苹果", pinyin: "píngguǒ", spanish: "manzana", english: "apple", level: 1 });

    const csvText = manager.exportToCSV(deck.id);
    expect(csvText.startsWith("\uFEFF")).toBe(true);
    expect(csvText).toContain('"苹果","píngguǒ","manzana","apple","1"');
  });

  test("imports words from raw Chinese text string", () => {
    const raw = "Hoy aprendí 你好 y 谢谢 en clase.";
    const importedDeck = manager.importFromTextList("Clase 1", raw);

    expect(importedDeck).not.toBeNull();
    expect(importedDeck.words.length).toBe(2);
    expect(importedDeck.words.some((w) => w.character === "你好")).toBe(true);
    expect(importedDeck.words.some((w) => w.character === "谢谢")).toBe(true);
  });

  test("imports words from CSV string", () => {
    const csv = `Hanzi,Pinyin,Spanish,English,Level
你好,nǐ hǎo,hola,hello,1
谢谢,xièxie,gracias,thanks,1`;

    const importedDeck = manager.importFromCSV("CSV Import", csv);
    expect(importedDeck).not.toBeNull();
    expect(importedDeck.words.length).toBe(2);
  });
});
