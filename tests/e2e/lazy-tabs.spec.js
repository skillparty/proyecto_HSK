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

  test("browse carga su script y renderiza tarjetas y carga más al hacer scroll", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "browse", "study");

    await expect
      .poll(() => page.evaluate(() => !!window.app.browseController), { timeout: 10000 })
      .toBe(true);
    await expect(page.locator(".vocab-card").first()).toBeVisible({ timeout: 15000 });

    const initialCardCount = await page.locator(".vocab-card").count();
    expect(initialCardCount).toBeGreaterThanOrEqual(20);

    await page.evaluate(() => {
      const browseContainer = document.getElementById("browse");
      if (browseContainer) {
        browseContainer.scrollTop = browseContainer.scrollHeight;
        browseContainer.dispatchEvent(new Event("scroll"));
      }
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect
      .poll(async () => page.locator(".vocab-card").count(), { timeout: 10000 })
      .toBeGreaterThan(initialCardCount);

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

  // Regresión: startup-controller construía el LeaderboardManager detrás de un
  // `if (window.LeaderboardManager)` que nunca se cumplía, porque leaderboard.js
  // es lazy y al arrancar la clase todavía no existe. El tab abría sin instancia
  // y no cargaba nada. Ahora lo instancia ui-controller tras bajar el script.
  test("leaderboard se instancia al abrir el tab y el filtro de nivel guarda estado", async ({
    page,
  }) => {
    const pageErrors = await gotoApp(page);
    const warnings = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });

    await openTab(page, "leaderboard", "progress");

    await expect
      .poll(() => page.evaluate(() => !!window.app.leaderboardManager), { timeout: 10000 })
      .toBe(true);
    expect(warnings.filter((w) => w.includes("Leaderboard manager not available"))).toHaveLength(0);

    await expect
      .poll(() => page.evaluate(() => window.app.leaderboardManager.currentHskLevel))
      .toBe("all");

    await page.locator("#leaderboard-hsk-level").selectOption("4");
    await expect
      .poll(() => page.evaluate(() => window.app.leaderboardManager.currentHskLevel), {
        timeout: 10000,
      })
      .toBe("4");

    // Mismo caso que el nivel: el listener existía pero nadie leía el valor.
    await page.locator("#leaderboard-period").selectOption("weekly");
    await expect
      .poll(() => page.evaluate(() => window.app.leaderboardManager.currentPeriod), {
        timeout: 10000,
      })
      .toBe("weekly");

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

  test("browse abre modal de exportación a PDF y maneja selección múltiple", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "browse", "study");

    await expect
      .poll(() => page.evaluate(() => !!window.app.browseController), { timeout: 10000 })
      .toBe(true);
    await expect(page.locator(".vocab-card").first()).toBeVisible({ timeout: 15000 });

    // 1. Open PDF Modal
    await page.locator("#export-pdf-btn").click();
    await expect(page.locator("#pdf-export-modal")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#pdf-preview-sheet .flashcard-cutout").first()).toBeVisible({ timeout: 5000 });

    // Switch format to writing practice
    await page.locator("#pdf-format-card-practice").click();
    await expect(page.locator("#pdf-preview-sheet .practice-row").first()).toBeVisible({ timeout: 5000 });

    // Close modal
    await page.locator("#pdf-modal-close-btn").click();
    await expect(page.locator("#pdf-export-modal")).not.toBeVisible({ timeout: 5000 });

    // 2. Test Selection Mode
    await page.locator("#browse-select-mode-btn").click();
    await expect(page.locator("#browse-selection-bar")).toBeVisible({ timeout: 5000 });

    // Select first card checkbox
    const firstCheckbox = page.locator(".vocab-card-select-checkbox").first();
    await firstCheckbox.check();
    await expect(page.locator("#browse-selected-count-badge")).toHaveText("1");

    expectNoPageErrors(pageErrors);
  });

  test("etimología abre modal de exportación a PDF", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "etymology");

    await expect
      .poll(() => page.evaluate(() => !!window.app.etymologyController), { timeout: 10000 })
      .toBe(true);
    await expect(page.locator("#etym-export-pdf-btn")).toBeVisible({ timeout: 10000 });

    await page.locator("#etym-export-pdf-btn").click();
    await expect(page.locator("#pdf-export-modal")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#pdf-format-card-etymology")).toBeVisible();

    await page.locator("#pdf-modal-close-btn").click();
    await expect(page.locator("#pdf-export-modal")).not.toBeVisible({ timeout: 5000 });

    expectNoPageErrors(pageErrors);
  });

  test("plantillas de escritura carga su script, renderiza cuadrículas y permite interactuar con presets", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "writing-sheets", "study");

    await expect
      .poll(() => page.evaluate(() => !!window.app.writingSheetsController), { timeout: 10000 })
      .toBe(true);

    await expect(page.locator(".ws-sheet").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ws-grid-cell").first()).toBeVisible({ timeout: 10000 });

    // Cambiar a cuadrícula 米字格 (Mige)
    await page.locator('.ws-option-card[data-grid="mige"]').click();
    await expect(page.locator('.ws-option-card[data-grid="mige"]')).toHaveClass(/is-selected/);

    // Cambiar a modo Guía Sombreada
    await page.locator('.ws-mode-card[data-mode="tracing"]').click();
    await expect(page.locator('.ws-mode-card[data-mode="tracing"]')).toHaveClass(/is-selected/);

    // Cargar preset de 8 trazos de Yǒng
    await page.locator('.ws-preset-btn[data-preset="yong"]').click();
    await expect(page.locator("#ws-selected-chips")).toContainText("永");

    // Verificar botón de imprimir presente
    await expect(page.locator("#ws-print-btn")).toBeVisible();

    expectNoPageErrors(pageErrors);
  });
});
