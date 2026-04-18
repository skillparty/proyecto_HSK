# HSK Past Exams (Without Audio) - Source Validation and Implementation Plan

## Objective
Create a new app section to practice HSK exams from Level 1 up to the highest level currently supported in this project, excluding all audio-based content.

## What Was Verified

### 1) Official HSK source hub
- URL: https://www.chinesetest.cn
- Evidence: Site exposes official HSK resources and mock/test ecosystem (including mock entry points).

### 2) Official HSK 3.0 materials package (large archive)
- URL: https://hsk.cn-bj.ufileos.com/3.0/HSK3.0-%E6%A0%B7%E9%A2%98-12.18.zip
- HEAD check: HTTP 200, content-type `application/x-zip-compressed`, size ~254 MB.
- Archive contains at least:
  - PDF exam/sample materials
  - WAV audio files (listening tracks)
- This is suitable for a "no-audio" pipeline by ingesting only non-audio assets (PDF/text metadata).

### 3) Official HSK 3.0 structure/syllabus documents
- Syllabus page: https://www.chinesetest.cn/syllabus
- Additional official document links found in source page HTML:
  - https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf
  - https://hsk.cn-bj.ufileos.com/3.0/HSK3.0%E8%80%83%E8%AF%95%E8%83%BD%E5%8A%9B%E6%8F%8F%E8%BF%B0.pdf

## Copyright / Legal Constraints
- We should not redistribute full copyrighted exam papers unless license/permission explicitly allows it.
- Safe approach:
  1. Store source metadata and links.
  2. Ingest only licensed/public sample content, or user-provided files.
  3. Build first-party question objects from authorized material and include provenance fields.

## Recommended Product Scope (Phase 1)
1. Levels: HSK1-HSK6 (matching current app level coverage).
2. Modes: reading + writing + grammar style tasks only.
3. Explicitly disable listening/audio sections.
4. Add exam session metadata:
   - `hskLevel`, `examSetId`, `sectionType`, `questionNumber`, `sourceUrl`, `licenseStatus`.

## Proposed Data Model

```json
{
  "id": "hsk4_sample_setA_q12",
  "hskLevel": 4,
  "examSetId": "sample_setA",
  "sectionType": "reading",
  "questionType": "multiple_choice",
  "prompt": "...",
  "options": ["...", "...", "...", "..."],
  "answer": "B",
  "explanation": "...",
  "audioRequired": false,
  "source": {
    "provider": "chinesetest.cn",
    "url": "https://...",
    "licenseStatus": "pending_review"
  }
}
```

## Implementation Plan
1. Create a source manifest file (URL, level coverage, license status).
2. Add a parser/normalizer pipeline for non-audio question sets.
3. Create `Past Exams` UI section with filters by level and section type.
4. Reuse existing quiz engine for rendering and scoring.
5. Add badges and blocking logic for audio-only items.
6. Add QA checks to prevent importing `audioRequired: true` items in Phase 1.

## Immediate Next Step
Implement a minimal viable section with one non-audio sample set per level (HSK1-HSK6), then scale progressively.
