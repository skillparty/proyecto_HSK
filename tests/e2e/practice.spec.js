const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

test.describe("flashcards (practice)", () => {
  test("carga vocabulario y muestra flashcard con caracteres chinos", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "practice", "study");

    // Vocabulario carga lazy: la card debe terminar mostrando hanzi
    await expect(page.locator("#question-text")).toHaveText(/[一-鿿]/, {
      timeout: 20000,
    });
    await expect(page.locator("#pinyin-input")).toBeVisible();

    const vocabCount = await page.evaluate(() => window.app.vocabulary.length);
    expect(vocabCount).toBeGreaterThan(4000);

    expectNoPageErrors(pageErrors);
  });

  test("responder pinyin muestra feedback y la respuesta", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await openTab(page, "practice", "study");
    await expect(page.locator("#question-text")).toHaveText(/[一-鿿]/, {
      timeout: 20000,
    });

    // Respuesta correcta tomada del estado real de la app
    const correctPinyin = await page.evaluate(() => window.app.currentWord.pinyin);
    await page.locator("#pinyin-input").fill(correctPinyin);
    await page.locator("#pinyin-input").press("Enter");

    // Flujo correcto: feedback verde → flip de la card (600ms) → botón next
    await expect(page.locator("#feedback-message")).toHaveClass(/correct-text/, {
      timeout: 5000,
    });
    await expect(page.locator("#flashcard")).toHaveClass(/flipped/, { timeout: 5000 });
    await expect(page.locator("#next-card-next-btn")).toBeVisible();

    expectNoPageErrors(pageErrors);
  });
});
