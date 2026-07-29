# Attributions

## Example sentences — Tatoeba

A portion of the example sentences in `assets/data/hsk_example_sentences.json`
(those with `"source": "tatoeba"`) is derived from the **Tatoeba** corpus.

- Source: https://tatoeba.org
- License: Creative Commons Attribution 2.0 France (CC-BY 2.0 FR) —
  https://creativecommons.org/licenses/by/2.0/fr/deed.en
- Sentences were selected (Mandarin sentences with both Spanish and English
  translations), and pinyin was generated programmatically with `pinyin-pro`.
- Build script: `scripts/build/tatoeba-examples.js`

Hand-curated example sentences (entries without a `source` field) are original
to this project.

## Stroke order data — Make Me a Hanzi

The stroke data in `assets/data/etymology/strokes/*.json` comes from **Make Me a
Hanzi**, distributed with **Hanzi Writer**.

- Source: https://github.com/skishore/makemeahanzi ·
  https://github.com/chanind/hanzi-writer
- License: LGPL, with the graphics derived from the Arphic PL fonts
  (Arphic Public License).
- Used by two surfaces: the stroke animation in the Etymology tab (credited
  in-app) and the calligraphy animation on the home screen, whose coordinates
  are generated from the same data by
  `scripts/build-data/generate-home-strokes.js`.

## Vocabulary

HSK vocabulary lists (`assets/data/`) are compiled from public HSK 2.0 word
lists.
