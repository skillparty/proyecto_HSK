import { describe, expect, test } from "vitest";

import "../../assets/js/utils/html.js";

const escapeHtml = window.hskEscapeHtml;
const safeHttpsUrl = window.hskSafeHttpsUrl;

describe("escapeHtml", () => {
  test("escapa los cinco caracteres con significado en HTML", () => {
    expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  test("escapa comillas dobles para que no se pueda salir de un atributo", () => {
    // Regresión: las implementaciones basadas en createTextNode dejaban pasar
    // las comillas, y estos helpers se usan dentro de src="${...}".
    const payload = 'https://evil.test/a" onerror="alert(1)';

    const escaped = escapeHtml(payload);

    expect(escaped).not.toContain('"');
    expect(escaped).toContain("&quot;");
  });

  test("escapa el ampersand antes que el resto, sin doble escapado", () => {
    expect(escapeHtml("a&lt;b")).toBe("a&amp;lt;b");
  });

  test("devuelve cadena vacía para null y undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  test("conserva el 0 y el false en vez de tratarlos como vacío", () => {
    expect(escapeHtml(0)).toBe("0");
    expect(escapeHtml(false)).toBe("false");
  });

  test("deja intacto el texto sin caracteres especiales", () => {
    expect(escapeHtml("汉字 pinyin 123")).toBe("汉字 pinyin 123");
  });
});

describe("safeHttpsUrl", () => {
  test("acepta una URL https y la devuelve escapada", () => {
    expect(safeHttpsUrl("https://example.test/a.png")).toBe(
      "https://example.test/a.png",
    );
  });

  test("escapa una URL https que intenta romper el atributo", () => {
    const escaped = safeHttpsUrl('https://evil.test/a" onerror="alert(1)');

    expect(escaped).not.toContain('"');
  });

  test("rechaza esquemas que no son https", () => {
    expect(safeHttpsUrl("javascript:alert(1)")).toBe("/default-avatar.png");
    expect(safeHttpsUrl("http://example.test/a.png")).toBe(
      "/default-avatar.png",
    );
    expect(safeHttpsUrl("//example.test/a.png")).toBe("/default-avatar.png");
    expect(safeHttpsUrl("data:image/svg+xml,<svg onload=alert(1)>")).toBe(
      "/default-avatar.png",
    );
  });

  test("rechaza valores que no son cadena", () => {
    expect(safeHttpsUrl(null)).toBe("/default-avatar.png");
    expect(safeHttpsUrl(undefined)).toBe("/default-avatar.png");
    expect(safeHttpsUrl({ toString: () => "https://example.test" })).toBe(
      "/default-avatar.png",
    );
  });

  test("respeta el fallback propio", () => {
    expect(safeHttpsUrl("javascript:alert(1)", "https://github.com/github.png")).toBe(
      "https://github.com/github.png",
    );
  });
});
