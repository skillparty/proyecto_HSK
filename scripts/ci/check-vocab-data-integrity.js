#!/usr/bin/env node

const assert = require("assert");
const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();

function fail(message) {
  console.error(`\n❌ Vocab Data Integrity Error:\n${message}\n`);
  process.exit(1);
}

function loadJson(relPath) {
  const fullPath = join(ROOT, relPath);
  if (!existsSync(fullPath)) {
    fail(`Missing required data file: ${relPath}`);
  }
  try {
    return JSON.parse(readFileSync(fullPath, "utf-8"));
  } catch (err) {
    fail(`Invalid JSON in ${relPath}: ${err.message}`);
  }
}

console.log("🔍 Checking vocabulary and cultural data integrity...");

// 1. Check split vocabularies (hsk1..hsk6 for en and es)
for (let lvl = 1; lvl <= 6; lvl++) {
  for (const lang of ["en", "es"]) {
    const fileName = `hsk${lvl}_${lang}.json`;
    const data = loadJson(`assets/data/vocab/${fileName}`);
    assert.ok(
      Array.isArray(data),
      `${fileName} must contain an array of words`,
    );
    assert.ok(
      data.length > 0,
      `${fileName} must not be empty`,
    );

    const seenChars = new Set();
    data.forEach((entry, idx) => {
      assert.ok(
        entry && typeof entry === "object",
        `${fileName}[${idx}] must be an object`,
      );
      assert.ok(
        typeof entry.character === "string" && entry.character.trim().length > 0,
        `${fileName}[${idx}] is missing character`,
      );
      assert.ok(
        typeof entry.pinyin === "string" && entry.pinyin.trim().length > 0,
        `${fileName}[${idx}] (${entry.character}) is missing pinyin`,
      );
      assert.strictEqual(
        Number(entry.level),
        lvl,
        `${fileName}[${idx}] (${entry.character}) level mismatch: expected ${lvl}, got ${entry.level}`,
      );

      const meaning = lang === "es" ? entry.spanish : entry.english;
      assert.ok(
        typeof meaning === "string" && meaning.trim().length > 0,
        `${fileName}[${idx}] (${entry.character}) is missing ${lang === "es" ? "spanish" : "english"} translation`,
      );
      seenChars.add(entry.character);
    });
  }
}
console.log("  ✓ assets/data/vocab/ (12 HSK split files validated)");

// 2. Check monolithic vocabulary datasets if present
for (const relPath of [
  "assets/data/hsk_vocabulary.json",
  "assets/data/hsk_vocabulary_spanish.json",
]) {
  if (existsSync(join(ROOT, relPath))) {
    const data = loadJson(relPath);
    assert.ok(Array.isArray(data), `${relPath} must be an array`);
    assert.ok(data.length >= 1000, `${relPath} expected >= 1000 items`);
    data.slice(0, 100).forEach((item, idx) => {
      assert.ok(item.character, `${relPath}[${idx}] missing character`);
      assert.ok(item.pinyin, `${relPath}[${idx}] missing pinyin`);
      assert.ok(item.level >= 1 && item.level <= 6, `${relPath}[${idx}] invalid level`);
    });
  }
}
console.log("  ✓ Monolithic HSK vocabularies validated");

// 3. Check culture data
const cultureFiles = [
  "character-evolution.json",
  "chinese-technology.json",
  "peking-opera.json",
  "traditional-medicine.json",
];
cultureFiles.forEach((file) => {
  const rel = `assets/data/culture/${file}`;
  const data = loadJson(rel);
  assert.ok(data, `${rel} failed to load`);
  if (Array.isArray(data)) {
    assert.ok(data.length > 0, `${rel} array should not be empty`);
  } else {
    assert.ok(typeof data === "object", `${rel} must be an object or array`);
  }
});
console.log("  ✓ Cultural modules data validated");

// 4. Check etymology sections
const etymologyFiles = ["seccion-a.json", "seccion-b.json", "seccion-c.json"];
etymologyFiles.forEach((file) => {
  const rel = `assets/data/etymology/${file}`;
  const data = loadJson(rel);
  assert.ok(data && typeof data === "object", `${rel} must be an object`);
  assert.ok(typeof data.section === "string", `${rel} missing section`);
  assert.ok(typeof data.title === "string", `${rel} missing title`);
  assert.ok(Array.isArray(data.lessons), `${rel} lessons must be an array`);
  assert.ok(data.lessons.length > 0, `${rel} must contain at least 1 lesson`);

  data.lessons.forEach((lesson, lIdx) => {
    assert.ok(lesson.id, `${rel} lesson ${lIdx} missing id`);
    assert.ok(Array.isArray(lesson.chars), `${rel} lesson ${lesson.id} missing chars array`);
    lesson.chars.forEach((char, cIdx) => {
      assert.ok(char.hanzi, `${rel} lesson ${lesson.id} char ${cIdx} missing hanzi`);
      assert.ok(char.pinyin, `${rel} lesson ${lesson.id} char ${char.hanzi} missing pinyin`);
      assert.ok(char.meaning, `${rel} lesson ${lesson.id} char ${char.hanzi} missing meaning`);
    });
  });
});
console.log("  ✓ Etymology data sections validated (A, B, C)");

console.log("\n✅ All vocabulary and cultural datasets passed integrity checks!\n");
