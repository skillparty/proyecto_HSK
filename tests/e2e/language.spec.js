const { test, expect } = require("@playwright/test");
const { gotoApp, expectNoPageErrors } = require("./helpers");

test.describe("cambio de idioma", () => {
  test("selector EN/ES traduce la UI via data-i18n", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    const studyGroupLabel = page.locator('[data-i18n="studyTabGroup"]');

    // El selector vive dentro del panel de ajustes (oculto hasta abrirlo)
    await page.locator("#mobile-settings-toggle").click();
    await expect(page.locator("#language-select")).toBeVisible();

    await page.locator("#language-select").selectOption("en");
    await expect(studyGroupLabel).toHaveText("Study");

    await page.locator("#language-select").selectOption("es");
    await expect(studyGroupLabel).toHaveText("Estudiar");

    const currentLanguage = await page.evaluate(
      () => window.languageManager.currentLanguage,
    );
    expect(currentLanguage).toBe("es");

    expectNoPageErrors(pageErrors);
  });
});
