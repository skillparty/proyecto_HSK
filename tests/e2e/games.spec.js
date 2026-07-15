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
});
