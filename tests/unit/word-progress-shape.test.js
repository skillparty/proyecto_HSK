import { describe, expect, test } from "vitest";

import "../../assets/js/firebase-client.js";

// La clase no se exporta; se llega por el constructor de la instancia global.
const FirebaseClient = window.firebaseClient.constructor;
const toDoc = (data) => FirebaseClient.toWordProgressDocument(data);

// firestore.rules → isValidWordProgress() usa hasOnlyAllowedFields(), o sea que
// CUALQUIER clave fuera de esta lista hace que Firestore rechace la escritura
// entera. Antes se hacía spread del wordData crudo y los llamadores en camelCase
// venían siendo rechazados en silencio.
const ALLOWED_FIELDS = [
  "user_id",
  "word_character",
  "word_pinyin",
  "word_translation",
  "hsk_level",
  "practice_mode",
  "is_correct",
  "response_time",
  "updated_at",
  "word_id",
  "id",
];

describe("toWordProgressDocument", () => {
  test("traduce la forma camelCase de progress-integrator", () => {
    const doc = toDoc({
      character: "好",
      pinyin: "hǎo",
      isCorrect: true,
      hskLevel: 3,
      responseTime: 4200,
    });

    expect(doc).toEqual({
      word_character: "好",
      word_pinyin: "hǎo",
      hsk_level: 3,
      is_correct: true,
      response_time: 4200,
    });
  });

  test("deja pasar la forma snake_case de user-progress-backend", () => {
    const doc = toDoc({
      word_character: "好",
      word_pinyin: "hǎo",
      word_translation: "bueno",
      hsk_level: 1,
      practice_mode: "char-to-english",
      is_correct: false,
      response_time: 3000,
    });

    expect(doc.word_character).toBe("好");
    expect(doc.hsk_level).toBe(1);
    expect(doc.is_correct).toBe(false);
    expect(doc.response_time).toBe(3000);
    expect(doc.practice_mode).toBe("char-to-english");
  });

  test("nunca emite una clave fuera de las permitidas por las rules", () => {
    const doc = toDoc({
      character: "好",
      isCorrect: true,
      hskLevel: 2,
      // Basura que un llamador podría arrastrar: con el spread anterior esto
      // solo bastaba para que Firestore rechazara el documento completo.
      srsInterval: 5,
      sessionId: "abc",
      nested: { a: 1 },
    });

    for (const key of Object.keys(doc)) {
      expect(ALLOWED_FIELDS).toContain(key);
    }
  });

  test("omite los ausentes en vez de mandar undefined o null", () => {
    const doc = toDoc({ character: "好" });

    expect(Object.keys(doc)).toEqual(["word_character"]);
    expect("hsk_level" in doc).toBe(false);
  });

  test("normaliza tipos: nivel numérico, corrección booleana", () => {
    const doc = toDoc({ character: "好", hskLevel: "4", isCorrect: "sí" });

    expect(doc.hsk_level).toBe(4);
    // Solo un true estricto cuenta como acierto; cualquier otra cosa es fallo.
    expect(doc.is_correct).toBe(false);
  });

  test("un response_time no numérico cae a 0 y no rompe la regla", () => {
    const doc = toDoc({ character: "好", responseTime: "lento" });

    expect(doc.response_time).toBe(0);
  });

  test("acepta translation o meaning como traducción", () => {
    expect(toDoc({ character: "好", translation: "bueno" }).word_translation).toBe("bueno");
    expect(toDoc({ character: "好", meaning: "good" }).word_translation).toBe("good");
  });

  test("conserva word_id y acepta id como alias", () => {
    expect(toDoc({ word_id: "w1", character: "好" }).word_id).toBe("w1");
    expect(toDoc({ id: "w2", character: "好" }).word_id).toBe("w2");
  });

  test("no propaga 'character' crudo, que no está permitido", () => {
    const doc = toDoc({ character: "好" });

    expect("character" in doc).toBe(false);
    expect(doc.word_character).toBe("好");
  });
});
