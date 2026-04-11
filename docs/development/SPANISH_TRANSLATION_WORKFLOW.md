# Spanish Translation Workflow (HSK1–HSK6)

## Objective

Deliver full, high-quality Spanish coverage for the current HSK vocabulary (levels 1 to 6), using the English dataset as source text and a controlled editorial process.

## Source of truth

- Primary source vocabulary: `assets/data/hsk_vocabulary.json`
- Spanish target dataset: `assets/data/hsk_vocabulary_spanish.json`
- Current implementation uses current HSK books only (no new edition migration).

## Editorial states

Each vocabulary entry should move through these states:

1. `pending`: no Spanish translation yet.
2. `draft`: first Spanish proposal created.
3. `reviewed`: reviewed by a second person.
4. `approved`: final translation accepted for production.

## Quality criteria

A translation is valid only if all checks pass:

- Semantic accuracy against English source and Chinese term.
- Pedagogical clarity for Spanish-speaking learners.
- Consistent terminology across levels.
- No empty or placeholder Spanish text.
- Register and sense are appropriate for HSK context.
- No orphan Spanish entries (items in ES dataset that do not map to an EN source entry under normalized triple key).

Matching policy for QA and worklist generation:

- Use normalized triple key: `character + pinyin + english`.
- Pinyin normalization should ignore whitespace and tone marks for matching robustness.
- Avoid `character + pinyin` as a unique key when semantic senses differ.

## Operational commands

Generate current coverage report:

```bash
npm run translation:report
```

Strict report (fails with non-zero code if there are missing translations):

```bash
npm run translation:report:strict
```

Strict mode should fail when either condition is true:

- Missing translations > 0
- Orphan Spanish entries > 0

Generate translation worklist (JSON):

```bash
npm run translation:worklist
```

## Generated artifacts

- Coverage report: `docs/development/translation/coverage-report.json`
- Translation worklist: `docs/development/translation/hsk_es_worklist.json`

## Lesson/book order for practice module

Practice session order supports textbook sequencing by metadata fields:

- `book` (for example: `shang`, `xia`)
- `lesson` (numeric lesson index)
- `lessonOrder` (position of each word inside the lesson)

When these fields exist, practice ordering is:

1. Book order (`shang` before `xia`)
2. Lesson ascending
3. Word position inside lesson ascending

If metadata is missing, the app falls back to canonical source order.

Maintain lesson-order map in:

- `assets/data/hsk_lesson_order_map.json`

Validate map matches without writing:

```bash
npm run translation:lesson-order:dry
```

Apply lesson-order metadata to EN and ES datasets:

```bash
npm run translation:lesson-order:apply
```

## Suggested review cadence

- Work by level in this order: HSK2 → HSK3 → HSK4 → HSK5 → HSK6.
- Weekly QA gate: run strict report and review top terminology conflicts.
- Approve only fully reviewed blocks to avoid mixed-quality releases.

## Release rule

Do not ship a level as “complete in Spanish” until:

- 100% coverage for that level in report.
- Terminology review completed.
- Spot-check in app UI completed (practice, browse, quiz, matrix).
