#!/usr/bin/env node

const assert = require('assert');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const controllerPath = join(ROOT, 'assets/js/modules/past-exams-controller.js');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(controllerPath)) {
  fail('Missing controller file: assets/js/modules/past-exams-controller.js');
}

const source = readFileSync(controllerPath, 'utf-8');

const sandbox = {
  console,
  window: {},
  document: {
    getElementById: () => null,
    querySelectorAll: () => []
  },
  fetch: async () => ({
    ok: true,
    json: async () => []
  })
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: controllerPath });

const PastExamsController = sandbox.window.PastExamsController;
assert.ok(PastExamsController, 'PastExamsController class was not loaded');

function buildMockVocabulary() {
  const vocabulary = [];
  for (let level = 1; level <= 6; level += 1) {
    for (let index = 1; index <= 20; index += 1) {
      vocabulary.push({
        character: `C${level}_${index}`,
        pinyin: `p${level}_${index}`,
        english: `meaning_${level}_${index}`,
        spanish: `significado_${level}_${index}`,
        level
      });
    }
  }

  return vocabulary;
}

const appStub = {
  currentLanguage: 'es',
  vocabulary: buildMockVocabulary(),
  pastExamQuestionBank: [
    {
      id: 'static-reading-1',
      hskLevel: 1,
      examSetId: 'seed',
      sectionType: 'reading',
      audioRequired: false,
      prompt: { es: 'Pregunta base', en: 'Base question' },
      options: [
        { key: 'A', label: { es: 'ok', en: 'ok' } },
        { key: 'B', label: { es: 'no', en: 'no' } },
        { key: 'C', label: { es: 'x', en: 'x' } },
        { key: 'D', label: { es: 'y', en: 'y' } }
      ],
      answer: 'A'
    }
  ],
  getTranslation: (key, replacements = {}) => {
    const templateByKey = {
      pastExamsPoolExpanded: 'Exam expanded to {count} questions using adaptive pool.'
    };

    let text = templateByKey[key] || key;
    Object.entries(replacements).forEach(([name, value]) => {
      text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
    });

    return text;
  },
  loadVocabulary: async () => appStub.vocabulary,
  showToast: () => {},
  logDebug: () => {},
  logWarn: () => {},
  logError: () => {}
};

const controller = new PastExamsController(appStub);

assert.strictEqual(
  typeof controller.selectExamQuestions,
  'function',
  'selectExamQuestions helper must exist'
);

function assertQuestionShape(question) {
  assert.ok(question && typeof question === 'object', 'Question must be an object');
  assert.ok(question.audioRequired !== true, 'Question must be non-audio');
  assert.ok(Array.isArray(question.options), 'Question options must be an array');
  assert.strictEqual(question.options.length, 4, 'Each question must have exactly 4 options');

  const answer = String(question.answer || '');
  const optionKeys = question.options.map((option) => String(option.key || ''));
  assert.ok(optionKeys.includes(answer), 'Question answer key must exist in options');
}

const requestCases = [
  { level: '1', section: 'reading', count: 5 },
  { level: '1', section: 'reading', count: 10 },
  { level: '1', section: 'reading', count: 20 },
  { level: '2', section: 'writing', count: 10 },
  { level: '3', section: 'grammar', count: 10 },
  { level: 'all', section: 'all', count: 20 }
];

requestCases.forEach((testCase) => {
  const result = controller.selectExamQuestions(testCase.level, testCase.section, testCase.count);
  assert.ok(result && typeof result === 'object', 'Expected selection result object');
  assert.strictEqual(
    result.questions.length,
    testCase.count,
    `Expected ${testCase.count} questions for level=${testCase.level} section=${testCase.section}`
  );

  result.questions.forEach(assertQuestionShape);
});

const lowEntropyVocabulary = [];
for (let index = 1; index <= 15; index += 1) {
  lowEntropyVocabulary.push({
    character: `L1_${index}`,
    pinyin: `lp1_${index}`,
    english: 'same_meaning',
    spanish: 'mismo_significado',
    level: 1
  });
}

appStub.pastExamQuestionBank = [];
appStub.vocabulary = lowEntropyVocabulary;

const lowEntropyResult = controller.selectExamQuestions('1', 'all', 5);
assert.strictEqual(
  lowEntropyResult.questions.length,
  5,
  'Section=all should still produce requested count even if reading distractors collapse'
);

lowEntropyResult.questions.forEach(assertQuestionShape);
assert.ok(
  lowEntropyResult.questions.some((question) => question.sectionType === 'writing' || question.sectionType === 'grammar'),
  'Section=all should rotate to writing/grammar when reading generation fails'
);

appStub.pastExamQuestionBank = [];
appStub.vocabulary = [];

const emptyResult = controller.selectExamQuestions('1', 'reading', 5);
assert.strictEqual(emptyResult.questions.length, 0, 'Expected empty result when both static and generated pools are empty');

console.log('Past exams availability checks passed.');
