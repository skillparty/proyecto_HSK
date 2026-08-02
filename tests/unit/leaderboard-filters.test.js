import { beforeEach, describe, expect, test } from "vitest";

import "../../assets/js/leaderboard.js";

// El script solo publica la clase; la instancia la crea la app. En jsdom no hay
// markup del leaderboard, así que todos los getElementById del constructor
// devuelven null y no se engancha ningún listener: alcanza para ejercitar
// applyFilters, que es lógica pura sobre el array de filas.
const manager = new window.LeaderboardManager();

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const row = (userId, hskLevel, rank, lastActivity = daysAgo(0)) => ({
  rank,
  user_id: userId,
  hsk_level: hskLevel,
  last_activity: lastActivity,
  total_studied: 100 - rank,
});

beforeEach(() => {
  manager.currentHskLevel = "all";
  manager.currentPeriod = "all_time";
});

describe("applyFilters — nivel HSK", () => {
  test("sin filtros devuelve las filas tal cual, recortadas al límite visible", () => {
    const rows = Array.from({ length: 60 }, (_, i) => row(`u${i}`, (i % 6) + 1, i + 1));

    const result = manager.applyFilters(rows);

    expect(result).toHaveLength(manager.DISPLAY_LIMIT);
    expect(result[0]).toEqual(rows[0]);
  });

  test("con un nivel elegido deja solo las filas de ese nivel", () => {
    manager.currentHskLevel = "3";
    const rows = [row("a", 1, 1), row("b", 3, 2), row("c", 5, 3), row("d", 3, 4)];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["b", "d"]);
  });

  // El select entrega string y hsk_level viene numérico de Firestore.
  test("compara nivel numérico contra el string del select", () => {
    manager.currentHskLevel = "2";
    const rows = [row("a", 2, 1), row("b", "2", 2), row("c", 4, 3)];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["a", "b"]);
  });

  test("renumera el rank para que la tabla filtrada arranque en 1", () => {
    manager.currentHskLevel = "4";
    const rows = [row("a", 1, 1), row("b", 4, 7), row("c", 4, 23)];

    expect(manager.applyFilters(rows).map((r) => r.rank)).toEqual([1, 2]);
  });

  test("no muta las filas recibidas al renumerar", () => {
    manager.currentHskLevel = "4";
    const original = row("b", 4, 7);

    manager.applyFilters([original]);

    expect(original.rank).toBe(7);
  });

  test("un nivel sin nadie devuelve vacío en vez de caer a todos", () => {
    manager.currentHskLevel = "6";

    expect(manager.applyFilters([row("a", 1, 1), row("b", 2, 2)])).toEqual([]);
  });
});

describe("applyFilters — período", () => {
  test("all_time no descarta a nadie, ni siquiera sin fecha de actividad", () => {
    const rows = [row("a", 1, 1, daysAgo(400)), row("b", 1, 2, null)];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["a", "b"]);
  });

  test("weekly deja solo la actividad de los últimos 7 días", () => {
    manager.currentPeriod = "weekly";
    const rows = [row("a", 1, 1, daysAgo(2)), row("b", 1, 2, daysAgo(20))];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["a"]);
  });

  test("monthly ensancha la ventana a 30 días", () => {
    manager.currentPeriod = "monthly";
    const rows = [row("a", 1, 1, daysAgo(20)), row("b", 1, 2, daysAgo(45))];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["a"]);
  });

  test("sin last_activity queda afuera de una ventana acotada", () => {
    manager.currentPeriod = "weekly";

    expect(manager.applyFilters([row("a", 1, 1, null)])).toEqual([]);
  });

  test("acepta Timestamp de Firestore además de Date", () => {
    manager.currentPeriod = "weekly";
    const asTimestamp = { toDate: () => daysAgo(1) };
    const rows = [row("a", 1, 1, asTimestamp), row("b", 1, 2, { toDate: () => daysAgo(30) })];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["a"]);
  });

  test("una fecha inválida no cuenta como actividad reciente", () => {
    manager.currentPeriod = "weekly";

    expect(manager.applyFilters([row("a", 1, 1, "no-es-fecha")])).toEqual([]);
  });

  test("nivel y período se aplican juntos", () => {
    manager.currentHskLevel = "3";
    manager.currentPeriod = "weekly";
    const rows = [
      row("nivel-ok-fecha-vieja", 3, 1, daysAgo(30)),
      row("nivel-mal-fecha-ok", 5, 2, daysAgo(1)),
      row("ambos-ok", 3, 3, daysAgo(1)),
    ];

    expect(manager.applyFilters(rows).map((r) => r.user_id)).toEqual(["ambos-ok"]);
  });
});

describe("emptyStateMessageKey", () => {
  test("sin filtros invita a practicar", () => {
    expect(manager.emptyStateMessageKey()).toBe("startWithPracticeToJoinRanking");
  });

  test("con nivel elegido explica que ese nivel está vacío", () => {
    manager.currentHskLevel = "5";
    expect(manager.emptyStateMessageKey()).toBe("noRankingForThisLevel");
  });

  test("con período acotado explica que no hubo actividad", () => {
    manager.currentPeriod = "weekly";
    expect(manager.emptyStateMessageKey()).toBe("noRankingForThisPeriod");
  });
});
