import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

// Estos tests corren contra el emulador de Firestore, que arranca el script
// tests/rules/run.mjs. Sin emulador levantado, initializeTestEnvironment falla.
let testEnv;

const ALICE = "alice_uid";
const BOB = "bob_uid";

const progressDoc = (uid, level) => ({
  user_id: uid,
  hsk_level: level,
  total_words_studied: 10,
  correct_answers: 7,
  incorrect_answers: 3,
  current_streak: 2,
  best_streak: 5,
  total_time_spent: 120,
});

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "hsk-rules-test",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

const db = (uid) => testEnv.authenticatedContext(uid).firestore();
const anonDb = () => testEnv.unauthenticatedContext().firestore();

describe("user_progress — propiedad del documento", () => {
  test("el dueño puede crear su documento de progreso", async () => {
    await assertSucceeds(
      setDoc(doc(db(ALICE), "user_progress", `${ALICE}_hsk1`), progressDoc(ALICE, 1)),
    );
  });

  test("el dueño puede actualizar su documento", async () => {
    const ref = doc(db(ALICE), "user_progress", `${ALICE}_hsk1`);
    await assertSucceeds(setDoc(ref, progressDoc(ALICE, 1)));
    await assertSucceeds(updateDoc(ref, { total_words_studied: 11 }));
  });

  test("nadie puede escribir un documento a nombre de otro usuario", async () => {
    await assertFails(
      setDoc(doc(db(BOB), "user_progress", `${BOB}_hsk1`), progressDoc(ALICE, 1)),
    );
  });

  // El docId es {uid}_hsk{nivel}. Si las reglas no lo atan al uid que escribe,
  // cualquiera puede ocupar el id de otro: como delete está prohibido y update
  // exige ser el dueño del documento existente, la víctima queda sin poder
  // guardar progreso de ese nivel para siempre.
  test("nadie puede ocupar el docId de otro usuario", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "user_progress", `${BOB}_hsk1`), progressDoc(ALICE, 1)),
    );
  });

  test("ocupar el docId ajeno no deja a la víctima sin escribir", async () => {
    // Alice intenta el squat; tiene que fallar.
    await assertFails(
      setDoc(doc(db(ALICE), "user_progress", `${BOB}_hsk3`), progressDoc(ALICE, 3)),
    );
    // Y Bob tiene que poder usar su propio id sin problemas.
    await assertSucceeds(
      setDoc(doc(db(BOB), "user_progress", `${BOB}_hsk3`), progressDoc(BOB, 3)),
    );
  });

  test("el usuario anónimo no puede escribir progreso", async () => {
    await assertFails(
      setDoc(doc(anonDb(), "user_progress", `${ALICE}_hsk1`), progressDoc(ALICE, 1)),
    );
  });
});

describe("user_progress — lectura para el leaderboard", () => {
  test("un autenticado puede leer el progreso de otro (lo necesita el ranking)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), "user_progress", `${ALICE}_hsk1`),
        progressDoc(ALICE, 1),
      );
    });

    await assertSucceeds(getDoc(doc(db(BOB), "user_progress", `${ALICE}_hsk1`)));
  });

  test("el usuario anónimo no puede leer progreso", async () => {
    await assertFails(getDoc(doc(anonDb(), "user_progress", `${ALICE}_hsk1`)));
  });
});

describe("user_progress — validación de campos", () => {
  test("rechaza un campo fuera de la lista permitida", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "user_progress", `${ALICE}_hsk1`), {
        ...progressDoc(ALICE, 1),
        is_admin: true,
      }),
    );
  });

  test("rechaza contadores negativos", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "user_progress", `${ALICE}_hsk1`), {
        ...progressDoc(ALICE, 1),
        total_words_studied: -5,
      }),
    );
  });

  test("rechaza un hsk_level fuera de rango", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "user_progress", `${ALICE}_hsk99`), progressDoc(ALICE, 99)),
    );
  });

  test("rechaza borrar progreso", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), "user_progress", `${ALICE}_hsk1`),
        progressDoc(ALICE, 1),
      );
    });
    const { deleteDoc } = await import("firebase/firestore");
    await assertFails(deleteDoc(doc(db(ALICE), "user_progress", `${ALICE}_hsk1`)));
  });
});

describe("otras colecciones", () => {
  test("word_progress: nadie puede ocupar el docId de otro", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "word_progress", `${BOB}_word1`), {
        user_id: ALICE,
        word_character: "好",
      }),
    );
  });

  test("achievements: nadie puede ocupar el docId de otro", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "achievements", `${BOB}_ach1`), {
        user_id: ALICE,
        id: "ach1",
      }),
    );
  });

  test("user_profiles: nadie lee el perfil ajeno (tiene email)", async () => {
    await assertFails(getDoc(doc(db(BOB), "user_profiles", ALICE)));
  });

  test("srs_data: nadie lee ni escribe el de otro", async () => {
    await assertFails(getDoc(doc(db(BOB), "srs_data", ALICE)));
    await assertFails(
      setDoc(doc(db(BOB), "srs_data", ALICE), { records: {}, updatedAt: 1 }),
    );
  });

  test("una colección no declarada está cerrada", async () => {
    await assertFails(setDoc(doc(db(ALICE), "cualquier_cosa", "x"), { a: 1 }));
  });
});

// Sanity: si esto falla, el emulador no está corriendo y el resto no significa nada.
test("el emulador está disponible", () => {
  expect(testEnv).toBeTruthy();
});
