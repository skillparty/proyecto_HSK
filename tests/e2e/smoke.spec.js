const { test, expect } = require("@playwright/test");
const { gotoApp, expectNoPageErrors } = require("./helpers");

test.describe("smoke", () => {
  test("la app carga con navegación visible y sin errores JS", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await expect(page).toHaveTitle(/HSK/);
    await expect(page.locator(".nav-tab").first()).toBeVisible();
    await expect(page.locator('.nav-group[data-group="study"]')).toBeVisible();

    // Deja respirar a los inits diferidos antes de auditar errores
    await page.waitForTimeout(2000);
    expectNoPageErrors(pageErrors);
  });

  test("el service worker se registra", async ({ page }) => {
    await gotoApp(page);

    // Poll tolerante al reload que dispara controllerchange en la primera visita
    await expect
      .poll(
        async () => {
          try {
            return await page.evaluate(async () => {
              const registration = await navigator.serviceWorker.getRegistration();
              return !!(
                registration &&
                (registration.active || registration.installing || registration.waiting)
              );
            });
          } catch (_navigationRace) {
            return false;
          }
        },
        { timeout: 20000 },
      )
      .toBe(true);
  });
});
