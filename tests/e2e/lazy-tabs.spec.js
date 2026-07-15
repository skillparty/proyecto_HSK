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

  test("cambiar idioma antes de abrir estos tabs no rompe la app", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    // Los 3 controllers lazy no deben existir todavía en esta ruta
    const beforeSwitch = await page.evaluate(() => ({
      strokesRadicals: window.app.strokesRadicalsController,
      pastExams: window.app.pastExamsController,
      quantifierSnake: window.app.quantifierSnakeController,
    }));
    expect(beforeSwitch.strokesRadicals).toBeUndefined();
    expect(beforeSwitch.pastExams).toBeUndefined();
    expect(beforeSwitch.quantifierSnake).toBeUndefined();

    await page.locator("#mobile-settings-toggle").click();
    await page.locator("#language-select").selectOption("en");
    await page.waitForTimeout(300);

    expectNoPageErrors(pageErrors);
  });
});
