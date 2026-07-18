const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

// Cubre el pipeline de lazy-load: ui-controller inyecta el script del juego
// con ?v=<hash> generado por el build. Roto el hash o el precache → falla aquí.
test.describe("juegos (lazy-load)", () => {
  test("viborita carga su script y canvas on-demand", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "snake-quantifiers", "games");

    // Setup visible primero; el canvas aparece al iniciar partida
    await expect(page.locator("#snakeq-setup")).toBeVisible({ timeout: 15000 });
    await page.locator("#snakeq-start").click();
    await expect(page.locator("#snakeq-canvas")).toBeVisible({ timeout: 15000 });

    expectNoPageErrors(pageErrors);
  });

  test("matrix carga lazy y completa el flujo start→pausa→respuesta→quit", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "matrix", "games");

    // Config visible tras el lazy-load de la cadena matrix-* completa
    await expect(page.locator("#matrix-start-btn")).toBeVisible({ timeout: 15000 });
    await page.locator("#matrix-start-btn").click();

    // Grid renderizado por MatrixGameView (36 celdas en dificultad normal)
    await expect(page.locator(".matrix-char")).toHaveCount(36, { timeout: 15000 });

    // Pausa: overlay cubre el botón, se reanuda con espacio
    await page.locator("#pause-btn").click();
    await expect(page.locator("#pause-overlay")).toBeVisible();
    await page.keyboard.press(" ");
    await expect(page.locator("#pause-overlay")).toHaveCount(0);

    // Responder una celda dispara el overlay de feedback
    await page.locator(".matrix-char").first().click();
    await expect(page.locator("#feedback-overlay")).toBeVisible();

    // Salir muestra la pantalla de resultados
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#quit-btn").click();
    await expect(page.locator("#matrix-results")).toBeVisible({ timeout: 10000 });

    expectNoPageErrors(pageErrors);
  });
});
