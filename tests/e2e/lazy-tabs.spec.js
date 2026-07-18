const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

// strokes-radicals, past-exams y snake-quantifiers dejaron de tener su
// script <script defer> siempre-cargado: ui-controller.js ahora los
// inyecta e instancia la primera vez que se abre el tab (ver
// handleTabInitialization). Estos tests cubren esa ruta — sin ellos,
// un typo en el nombre global o el argumento del constructor pasaría
// silencioso hasta que un usuario abriera el tab en producción.
test.describe("tabs con carga diferida", () => {
  test("trazos-radicales carga su script e inicializa resultados", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "strokes-radicals", "study");

    await expect(page.locator("#strokes-radicals-total-results")).not.toHaveText("0", {
      timeout: 20000,
    });

    const controllerReady = await page.evaluate(
      () => !!window.app.strokesRadicalsController && typeof window.StrokesRadicalsController !== "undefined",
    );
    expect(controllerReady).toBe(true);

    expectNoPageErrors(pageErrors);
  });

  test("exámenes pasados carga su script e inicia un examen", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "past-exams", "evaluate");

    // La carga del script + instanciación es async (ver ui-controller.js
    // handleTabInitialization); esperar a que termine antes de interactuar.
    await expect
      .poll(() => page.evaluate(() => !!window.app.pastExamsController), { timeout: 10000 })
      .toBe(true);

    await page.locator("#start-past-exam").click();
    await expect(page.locator("#past-exams-container")).toBeVisible({ timeout: 10000 });

    expectNoPageErrors(pageErrors);
  });

  test("browse carga su script y renderiza tarjetas", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "browse", "study");

    await expect
      .poll(() => page.evaluate(() => !!window.app.browseController), { timeout: 10000 })
      .toBe(true);
    await expect(page.locator(".vocab-card").first()).toBeVisible({ timeout: 15000 });

    expectNoPageErrors(pageErrors);
  });

  test("quiz carga engine y legacy controller al abrir el tab", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "quiz", "evaluate");

    await expect
      .poll(
        () => page.evaluate(() => !!window.app.quizEngine && !!window.app.quizLegacyController),
        { timeout: 10000 },
      )
      .toBe(true);
    await expect(page.locator("#quiz-setup")).toBeVisible({ timeout: 10000 });

    expectNoPageErrors(pageErrors);
  });

  test("stats carga su script y renderiza al abrir el tab", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "stats", "progress");

    await expect
      .poll(() => page.evaluate(() => !!window.app.statsController), { timeout: 10000 })
      .toBe(true);

    expectNoPageErrors(pageErrors);
  });

  test("cambiar idioma antes de abrir estos tabs no rompe la app", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    // Los controllers lazy no deben existir todavía en esta ruta
    const beforeSwitch = await page.evaluate(() => ({
      strokesRadicals: window.app.strokesRadicalsController,
      pastExams: window.app.pastExamsController,
      quantifierSnake: window.app.quantifierSnakeController,
      browse: window.app.browseController,
      quizEngine: window.app.quizEngine,
      stats: window.app.statsController,
    }));
    expect(beforeSwitch.strokesRadicals).toBeUndefined();
    expect(beforeSwitch.pastExams).toBeUndefined();
    expect(beforeSwitch.quantifierSnake).toBeUndefined();
    expect(beforeSwitch.browse).toBeUndefined();
    expect(beforeSwitch.quizEngine).toBeUndefined();
    expect(beforeSwitch.stats).toBeUndefined();

    await page.locator("#mobile-settings-toggle").click();
    await page.locator("#language-select").selectOption("en");
    await page.waitForTimeout(300);

    expectNoPageErrors(pageErrors);
  });
});
