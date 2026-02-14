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

## Operational commands

Generate current coverage report:

```bash
npm run translation:report
```

Strict report (fails with non-zero code if there are missing translations):

```bash
npm run translation:report:strict
```

Generate translation worklist (JSON):

```bash
npm run translation:worklist
```

## Generated artifacts

- Coverage report: `docs/development/translation/coverage-report.json`
- Translation worklist: `docs/development/translation/hsk_es_worklist.json`

## Suggested review cadence

- Work by level in this order: HSK2 → HSK3 → HSK4 → HSK5 → HSK6.
- Weekly QA gate: run strict report and review top terminology conflicts.
- Approve only fully reviewed blocks to avoid mixed-quality releases.

## Release rule

Do not ship a level as “complete in Spanish” until:

- 100% coverage for that level in report.
- Terminology review completed.
- Spot-check in app UI completed (practice, browse, quiz, matrix).
