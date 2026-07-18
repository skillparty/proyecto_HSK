import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";

import "../../assets/js/modules/srs-engine.js";

const D = window.SRSEngine.DEFAULTS;

const NOW = new Date("2026-07-18T12:00:00Z").getTime();

const stubApp = () => ({
  logDebug: () => {},
  logWarn: () => {},
});

const word = (character, level = 1) => ({ character, level });

function freshEngine() {
  return new window.SRSEngine(stubApp());
}

// window.localStorage explícito: Node 25 expone un localStorage global
// experimental que sombrea el de jsdom dentro de los archivos de test.
beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getWordKey", () => {
  test("combines level and character", () => {
    expect(freshEngine().getWordKey(word("你", 2))).toBe("2:你");
  });

  test("returns null for words without character", () => {
    const engine = freshEngine();
    expect(engine.getWordKey(null)).toBeNull();
    expect(engine.getWordKey({ level: 1 })).toBeNull();
  });

  test("treats missing level as 0", () => {
    expect(freshEngine().getWordKey({ character: "好" })).toBe("0:好");
  });
});

describe("rate", () => {
  test("returns null for invalid words", () => {
    expect(freshEngine().rate(null, "good")).toBeNull();
  });

  test("first 'good' schedules 1 day ahead", () => {
    const record = freshEngine().rate(word("你"), "good");
    expect(record.reps).toBe(1);
    expect(record.interval).toBe(1);
    expect(record.due).toBe(NOW + D.DAY_MS);
    expect(record.lapses).toBe(0);
  });

  test("first 'easy' schedules 3 days ahead and raises ease", () => {
    const record = freshEngine().rate(word("你"), "easy");
    expect(record.interval).toBe(3);
    expect(record.ease).toBe(D.START_EASE + 0.15);
    expect(record.due).toBe(NOW + 3 * D.DAY_MS);
  });

  test("first 'hard' schedules 1 day ahead and lowers ease", () => {
    const record = freshEngine().rate(word("你"), "hard");
    expect(record.interval).toBe(1);
    expect(record.ease).toBe(D.START_EASE - 0.15);
  });

  test("'again' on a learning word does not count a lapse", () => {
    const record = freshEngine().rate(word("你"), "again");
    expect(record.lapses).toBe(0);
    expect(record.reps).toBe(0);
    // learning step: due in minutes, not days
    expect(record.due).toBe(NOW + D.LEARNING_STEP_MS);
  });

  test("'again' after a success counts a lapse and resets progress", () => {
    const engine = freshEngine();
    engine.rate(word("你"), "good");
    const record = engine.rate(word("你"), "again");
    expect(record.lapses).toBe(1);
    expect(record.reps).toBe(0);
    expect(record.interval).toBe(0);
  });

  test("'good' growth compounds by ease", () => {
    const engine = freshEngine();
    engine.rate(word("你"), "good"); // interval 1
    const second = engine.rate(word("你"), "good");
    expect(second.interval).toBe(2.5); // 1 * START_EASE
    expect(second.due).toBe(NOW + Math.round(2.5 * D.DAY_MS));
  });

  test("ease never drops below MIN_EASE", () => {
    const engine = freshEngine();
    for (let i = 0; i < 10; i++) engine.rate(word("你"), "again");
    expect(engine.getRecord(word("你")).ease).toBe(D.MIN_EASE);
  });

  test("ease never exceeds MAX_EASE", () => {
    const engine = freshEngine();
    for (let i = 0; i < 10; i++) engine.rate(word("你"), "easy");
    expect(engine.getRecord(word("你")).ease).toBe(D.MAX_EASE);
  });

  test("interval caps at MAX_INTERVAL_DAYS", () => {
    const engine = freshEngine();
    for (let i = 0; i < 20; i++) engine.rate(word("你"), "easy");
    expect(engine.getRecord(word("你")).interval).toBe(D.MAX_INTERVAL_DAYS);
  });
});

describe("persistence", () => {
  test("rated words survive a reload through localStorage", () => {
    freshEngine().rate(word("你"), "good");
    const reloaded = freshEngine();
    expect(reloaded.getRecord(word("你"))).not.toBeNull();
    expect(reloaded.getRecord(word("你")).reps).toBe(1);
  });

  test("corrupt storage falls back to empty records", () => {
    window.localStorage.setItem(window.SRSEngine.STORAGE_KEY, "{not json");
    expect(freshEngine().records).toEqual({});
  });
});

describe("mergeRemoteRecords", () => {
  test("remote wins only when its last timestamp is newer", () => {
    const engine = freshEngine();
    engine.rate(word("你"), "good"); // local last = NOW

    const older = { reps: 5, interval: 30, ease: 2.5, due: 0, lapses: 0, last: NOW - 1000 };
    const newer = { reps: 7, interval: 60, ease: 2.5, due: 0, lapses: 0, last: NOW + 1000 };

    engine.mergeRemoteRecords({ "1:你": older, "1:好": newer });

    expect(engine.records["1:你"].reps).toBe(1); // local kept
    expect(engine.records["1:好"].reps).toBe(7); // remote added
  });

  test("ignores non-object payloads", () => {
    const engine = freshEngine();
    engine.mergeRemoteRecords(null);
    engine.mergeRemoteRecords("junk");
    expect(engine.records).toEqual({});
  });
});

describe("queue building", () => {
  test("buildQueue puts due words (oldest first) before capped new words", () => {
    const engine = freshEngine();
    const w1 = word("一");
    const w2 = word("二");
    engine.rate(w1, "good");
    engine.rate(w2, "easy");

    const later = NOW + 10 * D.DAY_MS; // both due, w1 (1d) before w2 (3d)
    const fresh = [word("三"), word("四"), word("五")];
    const queue = engine.buildQueue([w2, w1, ...fresh], { newLimit: 2, now: later });

    expect(queue.map((w) => w.character)).toEqual(["一", "二", "三", "四"]);
  });

  test("getUpcomingWords returns learned-but-not-due, soonest first", () => {
    const engine = freshEngine();
    engine.rate(word("一"), "easy"); // due in 3d
    engine.rate(word("二"), "good"); // due in 1d

    const upcoming = engine.getUpcomingWords([word("一"), word("二"), word("三")]);
    expect(upcoming.map((w) => w.character)).toEqual(["二", "一"]);
  });
});

describe("getWeightedGamePool", () => {
  test("due words appear twice and lapsed due words three times", () => {
    const engine = freshEngine();
    const dueWord = word("一");
    const lapsedWord = word("二");
    engine.rate(dueWord, "good");
    engine.rate(lapsedWord, "good");
    engine.rate(lapsedWord, "again"); // lapse, back to learning step

    const later = NOW + 10 * D.DAY_MS;
    const pool = engine.getWeightedGamePool([dueWord, lapsedWord, word("三")], later);

    const count = (ch) => pool.filter((w) => w.character === ch).length;
    expect(count("一")).toBe(2);
    expect(count("二")).toBe(3);
    expect(count("三")).toBe(1);
  });

  test("returns input untouched for empty pools", () => {
    const engine = freshEngine();
    expect(engine.getWeightedGamePool([])).toEqual([]);
  });
});

describe("getSummary", () => {
  test("splits words into due / fresh / learned", () => {
    const engine = freshEngine();
    engine.rate(word("一"), "good"); // learned (due tomorrow)
    engine.rate(word("二"), "again"); // due in 10 min

    const later = NOW + D.LEARNING_STEP_MS + 1;
    const summary = engine.getSummary([word("一"), word("二"), word("三")], later);
    expect(summary).toEqual({ due: 1, fresh: 1, learned: 1, total: 3 });
  });
});
