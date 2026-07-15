const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

test.describe("quiz", () => {
  test("inicia quiz, muestra pregunta con opciones y acepta respuesta", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "quiz", "evaluate");

    await page.locator("#start-quiz").click();

    await expect(page.locator("#quiz-question")).not.toBeEmpty({ timeout: 20000 });
    const options = page.locator("#quiz-options .quiz-option");
    await expect(options.first()).toBeVisible();
    expect(await options.count()).toBeGreaterThanOrEqual(2);

    // Click en opción solo selecciona; el feedback aparece tras Submit
    await options.first().click();
    await expect(page.locator("#quiz-submit")).toBeEnabled();
    await page.locator("#quiz-submit").click();
    await expect(page.locator("#quiz-feedback")).toBeVisible({ timeout: 5000 });

    expectNoPageErrors(pageErrors);
  });
});
