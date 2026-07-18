import { describe, expect, test } from "vitest";

import "../../assets/js/modules/quantifier-snake-utils.js";

const Utils = window.QuantifierSnakeUtils;

const quantifier = (id) => ({ id, hanzi: "个", pinyin: "gè", es: "clasificador", en: "classifier" });
const wordFor = (id, quantifiers) => ({
  id,
  hanzi: "人",
  pinyin: "rén",
  es: "persona",
  en: "person",
  quantifiers,
});

// Payload mínimo válido: 4 cuantificadores, 16 palabras
function validPayload() {
  const quantifiers = ["q1", "q2", "q3", "q4"].map(quantifier);
  const words = Array.from({ length: 16 }, (_, i) => wordFor(`w${i}`, ["q1"]));
  return { quantifiers, words };
}

describe("normalizeQuantifier", () => {
  test("trims fields and keeps complete entries", () => {
    const entry = Utils.normalizeQuantifier({
      id: " q1 ", hanzi: " 个 ", pinyin: " gè ", es: " uno ", en: " one ",
    });
    expect(entry).toEqual({ id: "q1", hanzi: "个", pinyin: "gè", es: "uno", en: "one" });
  });

  test.each([
    ["null entry", null],
    ["missing id", { hanzi: "个", pinyin: "gè", es: "x", en: "y" }],
    ["blank pinyin", { id: "q", hanzi: "个", pinyin: "  ", es: "x", en: "y" }],
  ])("rejects %s", (_label, entry) => {
    expect(Utils.normalizeQuantifier(entry)).toBeNull();
  });
});

describe("normalizeWord", () => {
  const knownIds = new Set(["q1", "q2"]);

  test("keeps only quantifier refs that exist", () => {
    const entry = Utils.normalizeWord(wordFor("w1", ["q1", "ghost", "q2"]), knownIds);
    expect(entry.quantifiers).toEqual(["q1", "q2"]);
  });

  test("rejects words whose quantifiers are all unknown", () => {
    expect(Utils.normalizeWord(wordFor("w1", ["ghost"]), knownIds)).toBeNull();
  });

  test("rejects words without quantifiers", () => {
    expect(Utils.normalizeWord(wordFor("w1", []), knownIds)).toBeNull();
  });
});

describe("normalizeData", () => {
  test("accepts the minimum viable payload", () => {
    const data = Utils.normalizeData(validPayload());
    expect(data).not.toBeNull();
    expect(data.quantifiers).toHaveLength(4);
    expect(data.words).toHaveLength(16);
  });

  test("rejects payloads below the quantifier minimum", () => {
    const payload = validPayload();
    payload.quantifiers = payload.quantifiers.slice(0, 3);
    expect(Utils.normalizeData(payload)).toBeNull();
  });

  test("rejects payloads below the word minimum after filtering invalid entries", () => {
    const payload = validPayload();
    payload.words[0] = { id: "broken" }; // se descarta → quedan 15
    expect(Utils.normalizeData(payload)).toBeNull();
  });

  test.each([
    ["null", null],
    ["string", "junk"],
    ["empty object", {}],
  ])("rejects %s payloads", (_label, payload) => {
    expect(Utils.normalizeData(payload)).toBeNull();
  });
});

describe("buildWordLookup", () => {
  test("groups words under every quantifier they reference", () => {
    const data = {
      quantifiers: [quantifier("q1"), quantifier("q2")],
      words: [wordFor("w1", ["q1", "q2"]), wordFor("w2", ["q2"])],
    };
    const lookup = Utils.buildWordLookup(data);
    expect(lookup.get("q1").map((w) => w.id)).toEqual(["w1"]);
    expect(lookup.get("q2").map((w) => w.id)).toEqual(["w1", "w2"]);
  });

  test("tolerates missing data", () => {
    expect(Utils.buildWordLookup(null).size).toBe(0);
  });
});

describe("sampleWords", () => {
  const pool = ["a", "b", "c"];

  test("returns exactly count items from a larger pool, without duplicates", () => {
    const sample = Utils.sampleWords(pool, 2);
    expect(sample).toHaveLength(2);
    expect(new Set(sample).size).toBe(2);
    sample.forEach((item) => expect(pool).toContain(item));
  });

  test("pads with repeats when the pool is smaller than count", () => {
    const sample = Utils.sampleWords(pool, 5);
    expect(sample).toHaveLength(5);
    sample.forEach((item) => expect(pool).toContain(item));
  });

  test.each([
    ["empty pool", [], 3],
    ["zero count", ["a"], 0],
    ["non-array pool", null, 3],
  ])("returns [] for %s", (_label, poolArg, count) => {
    expect(Utils.sampleWords(poolArg, count)).toEqual([]);
  });
});

describe("pickRandomFreeCell", () => {
  test("returns a free in-bounds cell", () => {
    const occupied = new Set([Utils.cellKey(0, 0)]);
    const cell = Utils.pickRandomFreeCell(2, occupied);
    expect(cell).not.toBeNull();
    expect(cell.x).toBeGreaterThanOrEqual(0);
    expect(cell.x).toBeLessThan(2);
    expect(occupied.has(Utils.cellKey(cell.x, cell.y))).toBe(false);
  });

  test("returns null when the board is full", () => {
    const occupied = new Set();
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) occupied.add(Utils.cellKey(x, y));
    expect(Utils.pickRandomFreeCell(2, occupied)).toBeNull();
  });
});

describe("shuffleArray", () => {
  test("keeps the same elements", () => {
    const values = [1, 2, 3, 4, 5];
    const copy = [...values];
    Utils.shuffleArray(copy);
    expect([...copy].sort()).toEqual([...values].sort());
  });
});
