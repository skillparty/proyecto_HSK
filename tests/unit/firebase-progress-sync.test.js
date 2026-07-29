import { beforeEach, describe, expect, test } from "vitest";

import "../../assets/js/firebase-progress-sync.js";

const sync = window.firebaseSync;

// El bug que motivó estos tests no fue de lógica sino de mapeo de argumentos:
// syncUserProgress le pasaba un snapshot agregado a updateProgress(), que es una
// API de evento. Como el agregado no tiene currentLevel, isCorrect ni timeSpent,
// cada llamada escribía (1, true, 0): todo el progreso caía en HSK 1, siempre
// como acierto y con tiempo cero.
function stubFirebaseClient() {
  const calls = [];
  window.firebaseClient = {
    updateProgress: (level, isCorrect, timeSpent) => {
      calls.push({ level, isCorrect, timeSpent });
      return Promise.resolve();
    },
  };
  return calls;
}

describe("recordStudyEvent", () => {
  let calls;

  beforeEach(() => {
    calls = stubFirebaseClient();
  });

  test("propaga el nivel de la palabra, no un valor por defecto", async () => {
    await sync.recordStudyEvent(5, true, 0.05);

    expect(calls).toHaveLength(1);
    expect(calls[0].level).toBe(5);
  });

  test("propaga una respuesta incorrecta como incorrecta", async () => {
    await sync.recordStudyEvent(3, false, 0);

    expect(calls[0].isCorrect).toBe(false);
  });

  test("solo un true estricto cuenta como acierto", async () => {
    await sync.recordStudyEvent(2, undefined, 0);
    await sync.recordStudyEvent(2, "sí", 0);

    expect(calls.map((c) => c.isCorrect)).toEqual([false, false]);
  });

  test("pasa el tiempo tal cual, en minutos", async () => {
    await sync.recordStudyEvent(1, true, 0.05);

    expect(calls[0].timeSpent).toBeCloseTo(0.05);
  });

  test("devuelve success:false y no escribe si no hay cliente", async () => {
    window.firebaseClient = null;

    const result = await sync.recordStudyEvent(1, true, 0);

    expect(result.success).toBe(false);
  });

  test("no propaga el error si la escritura falla", async () => {
    window.firebaseClient = {
      updateProgress: () => Promise.reject(new Error("permission-denied")),
    };

    const result = await sync.recordStudyEvent(1, true, 0);

    expect(result.success).toBe(false);
    expect(result.error).toBe("permission-denied");
  });
});

describe("syncUserProgress", () => {
  test("NO toca los contadores de la nube", async () => {
    const calls = stubFirebaseClient();

    // Los seis llamadores le pasan agregados: inicialización, merge y el sync
    // periódico cada 5 minutos. Si esto volviera a escribir, el sync periódico
    // por sí solo inflaría los contadores sin que el usuario estudie nada.
    await sync.syncUserProgress({ totalStudied: 120, hskLevels: {} });

    expect(calls).toEqual([]);
  });

  test("sigue devolviendo success para sus llamadores", async () => {
    stubFirebaseClient();

    const result = await sync.syncUserProgress({ totalStudied: 1 });

    expect(result.success).toBe(true);
  });
});

describe("syncHSKProgress", () => {
  test("ya no existe: era redundante con recordStudyEvent", () => {
    expect(sync.syncHSKProgress).toBeUndefined();
  });
});

describe("resto del puente de sync", () => {
  beforeEach(() => {
    stubFirebaseClient();
  });

  test("setCurrentUser acepta uid o id sin romper el log", () => {
    sync.setCurrentUser({ uid: "abc" });
    expect(sync.currentUser).toEqual({ uid: "abc" });

    sync.setCurrentUser({ id: "legacy" });
    expect(sync.currentUser).toEqual({ id: "legacy" });
  });

  test("syncUser guarda el usuario y lo devuelve", async () => {
    const user = { uid: "u1" };

    const result = await sync.syncUser(user);

    expect(result).toEqual({ success: true, data: user });
    expect(sync.currentUser).toBe(user);
  });

  test("getUserProgress mapea las stats a snake_case", async () => {
    window.firebaseClient.getUserStatistics = () =>
      Promise.resolve({
        totalStudied: 10,
        correctAnswers: 7,
        incorrectAnswers: 3,
        currentStreak: 2,
        bestStreak: 5,
        totalTimeSpent: 42,
        levelProgress: { 1: {} },
      });

    const result = await sync.getUserProgress();

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      total_studied: 10,
      correct_answers: 7,
      incorrect_answers: 3,
      current_streak: 2,
      best_streak: 5,
      total_time_spent: 42,
    });
  });

  test("getUserProgress devuelve data null si no hay stats", async () => {
    window.firebaseClient.getUserStatistics = () => Promise.resolve(null);

    const result = await sync.getUserProgress();

    expect(result).toEqual({ success: true, data: null });
  });

  test("getUserProgress no propaga el error de lectura", async () => {
    window.firebaseClient.getUserStatistics = () =>
      Promise.reject(new Error("unavailable"));

    const result = await sync.getUserProgress();

    expect(result).toEqual({ success: false, error: "unavailable" });
  });

  test("recordWordStudy delega en saveWordProgress", async () => {
    const saved = [];
    window.firebaseClient.saveWordProgress = (data) => {
      saved.push(data);
      return Promise.resolve();
    };

    const result = await sync.recordWordStudy({ character: "好" });

    expect(result.success).toBe(true);
    expect(saved).toEqual([{ character: "好" }]);
  });

  test("recordWordStudy no propaga el error de escritura", async () => {
    window.firebaseClient.saveWordProgress = () =>
      Promise.reject(new Error("permission-denied"));

    const result = await sync.recordWordStudy({ character: "好" });

    expect(result).toEqual({ success: false, error: "permission-denied" });
  });

  test("updateStudyHeatmap sigue siendo un no-op declarado", async () => {
    // Está comentado como "simulated" en el código: no escribe nada. El test lo
    // deja registrado para que no se confunda con algo que sí persiste.
    const calls = stubFirebaseClient();

    const result = await sync.updateStudyHeatmap("2026-07-29", { wordsStudied: 1 });

    expect(result).toEqual({ success: true });
    expect(calls).toEqual([]);
  });

  test("getSyncStatus refleja conexión y usuario", () => {
    sync.currentUser = null;
    sync.isOnline = false;
    expect(sync.getSyncStatus()).toEqual({ isOnline: false, hasUser: false });

    sync.currentUser = { uid: "u1" };
    sync.isOnline = true;
    expect(sync.getSyncStatus()).toEqual({ isOnline: true, hasUser: true });
  });

  test("todos los métodos cortan si no hay firebaseClient", async () => {
    window.firebaseClient = null;

    for (const call of [
      sync.syncUser({}),
      sync.getUserProgress(),
      sync.syncUserProgress({}),
      sync.recordStudyEvent(1, true, 0),
      sync.recordWordStudy({}),
    ]) {
      expect((await call).success).toBe(false);
    }
  });
});
