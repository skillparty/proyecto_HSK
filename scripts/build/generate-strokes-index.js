#!/usr/bin/env node

/**
 * Generates assets/data/etymology/strokes-index.json from stroke files in
 * assets/data/etymology/strokes/ and maps available stroke characters to HSK levels.
 */

const { readdirSync, readFileSync, writeFileSync, statSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();
const STROKES_DIR = join(ROOT, "assets", "data", "etymology", "strokes");
const OUTPUT_FILE = join(ROOT, "assets", "data", "etymology", "strokes-index.json");
const VOCAB_DIR = join(ROOT, "assets", "data", "vocab");

function generate() {
  const strokeFiles = readdirSync(STROKES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));

  const strokeSet = new Set(strokeFiles);
  const allChars = Array.from(strokeSet).sort((a, b) => a.localeCompare(b, "zh-CN"));

  const levels = { hsk1: [], hsk2: [], hsk3: [], hsk4: [], hsk5: [], hsk6: [] };

  for (let lvl = 1; lvl <= 6; lvl++) {
    const vocabPath = join(VOCAB_DIR, `hsk${lvl}_es.json`);
    try {
      const words = JSON.parse(readFileSync(vocabPath, "utf-8"));
      const seen = new Set();
      for (const w of words) {
        for (const ch of (w.character || "")) {
          if (strokeSet.has(ch) && !seen.has(ch)) {
            seen.add(ch);
            levels[`hsk${lvl}`].push(ch);
          }
        }
      }
      levels[`hsk${lvl}`].sort((a, b) => a.localeCompare(b, "zh-CN"));
    } catch (err) {
      console.warn(`[strokes-index] Could not parse ${vocabPath}:`, err.message);
    }
  }

  const payload = {
    total: allChars.length,
    characters: allChars,
    levels,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(payload));
  const sizeKb = (statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(`[strokes-index] Generated ${OUTPUT_FILE} (${allChars.length} chars, ${sizeKb} KB)`);
}

generate();
