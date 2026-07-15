const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { gotoApp, openTab } = require("./helpers");

// axe-core estaba instalado (devDependency) pero nunca conectado a ningún
// test — regla propia del proyecto pide "Run automated accessibility
// checks". Escanea las vistas ya cubiertas por el resto de la suite E2E,
// no las 20 pestañas: match de esfuerzo con la infraestructura de tests
// existente, no un rediseño de la suite.
//
// El waitForTimeout tras abrir cada tab no es cosmético: sin él, axe
// alcanza a escanear un instante donde el tema/estilos aún no asentaron
// del todo y reporta contraste insuficiente en colores que, medio
// segundo después, ya resuelven correctos (confirmado a mano contra el
// mismo build). Los otros specs evitan esto esperando un elemento
// concreto (ej. practice.spec.js espera el hanzi); acá no hay una señal
// de "layout ya asentado" tan clara, así que un timeout corto es la
// salida pragmática.
async function expectNoViolations(page) {
  await page.waitForTimeout(1000);
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map(
    (v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodos, ej: ${v.nodes[0].target.join(" ")})`,
  );
  expect(results.violations, summary.join("\n")).toHaveLength(0);
}

test.describe("accesibilidad (axe-core)", () => {
  test("home no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await expectNoViolations(page);
  });

  test("practice no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "practice", "study");
    await expectNoViolations(page);
  });

  test("quiz no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "quiz", "evaluate");
    await expectNoViolations(page);
  });

  test("strokes-radicals no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "strokes-radicals", "study");
    await expectNoViolations(page);
  });

  test("past-exams no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "past-exams", "evaluate");
    await expectNoViolations(page);
  });

  test("leaderboard no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "leaderboard", "progress");
    await expectNoViolations(page);
  });

  test("stats no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "stats", "progress");
    await expectNoViolations(page);
  });

  test("etymology no tiene violaciones", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "etymology");
    await expectNoViolations(page);
  });
});
