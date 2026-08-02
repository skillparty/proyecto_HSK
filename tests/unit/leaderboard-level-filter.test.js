import { beforeEach, describe, expect, test } from "vitest";

import "../../assets/js/leaderboard.js";

// El script solo publica la clase; la instancia la crea la app. En jsdom no hay
// markup del leaderboard, así que todos los getElementById del constructor
// devuelven null y no se engancha ningún listener: alcanza para ejercitar
// applyHskLevelFilter, que es lógica pura sobre el array de filas.
const manager = new window.LeaderboardManager();

const row = (userId, hskLevel, rank) => ({
  rank,
  user_id: userId,
  hsk_level: hskLevel,
  total_studied: 100 - rank,
});

describe("applyHskLevelFilter", () => {
  beforeEach(() => {
    manager.currentHskLevel = "all";
  });

  test("sin filtro devuelve las filas tal cual, recortadas al límite visible", () => {
    const rows = Array.from({ length: 60 }, (_, i) => row(`u${i}`, (i % 6) + 1, i + 1));

    const result = manager.applyHskLevelFilter(rows);

    expect(result).toHaveLength(manager.DISPLAY_LIMIT);
    expect(result[0]).toEqual(rows[0]);
  });

  test("con un nivel elegido deja solo las filas de ese nivel", () => {
    manager.currentHskLevel = "3";
    const rows = [row("a", 1, 1), row("b", 3, 2), row("c", 5, 3), row("d", 3, 4)];

    const result = manager.applyHskLevelFilter(rows);

    expect(result.map((r) => r.user_id)).toEqual(["b", "d"]);
  });

  // El select entrega string y hsk_level viene numérico de Firestore.
  test("compara nivel numérico contra el string del select", () => {
    manager.currentHskLevel = "2";
    const rows = [row("a", 2, 1), row("b", "2", 2), row("c", 4, 3)];

    const result = manager.applyHskLevelFilter(rows);

    expect(result.map((r) => r.user_id)).toEqual(["a", "b"]);
  });

  test("renumera el rank para que la tabla filtrada arranque en 1", () => {
    manager.currentHskLevel = "4";
    const rows = [row("a", 1, 1), row("b", 4, 7), row("c", 4, 23)];

    const result = manager.applyHskLevelFilter(rows);

    expect(result.map((r) => r.rank)).toEqual([1, 2]);
  });

  test("no muta las filas recibidas al renumerar", () => {
    manager.currentHskLevel = "4";
    const original = row("b", 4, 7);

    manager.applyHskLevelFilter([original]);

    expect(original.rank).toBe(7);
  });

  test("un nivel sin nadie devuelve vacío en vez de caer a todos", () => {
    manager.currentHskLevel = "6";
    const rows = [row("a", 1, 1), row("b", 2, 2)];

    expect(manager.applyHskLevelFilter(rows)).toEqual([]);
  });
});
