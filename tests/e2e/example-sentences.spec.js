const { test, expect } = require("@playwright/test");
const { gotoApp, expectNoPageErrors } = require("./helpers");

test.describe("frases de ejemplo", () => {
  // El corpus pesa 238 KB gzip y solo se ve en el reverso de la tarjeta, así
  // que se baja en segundo plano. Este test fija que el vocabulario quede listo
  // sin esperarlo: si alguien vuelve a poner el await, la primera flashcard
  // pasa a depender de un cuarto de mega que todavía no se muestra.
  test("no bloquean la carga del vocabulario", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await page.waitForFunction(() => window.app?.vocabularyLoaded === true, {
      timeout: 20000,
    });

    // El vocabulario ya está y la promesa de las frases sigue siendo una promesa
    // (o ya resolvió, si la red fue muy rápida): lo que importa es que exista y
    // que exampleSentences nunca sea undefined para el render.
    const state = await page.evaluate(() => ({
      vocabularyLoaded: window.app.vocabularyLoaded,
      sentencesIsObject: typeof window.app.exampleSentences === "object",
      hasPromise: Boolean(window.app.exampleSentencesPromise),
    }));
    expect(state.vocabularyLoaded).toBe(true);
    expect(state.sentencesIsObject).toBe(true);
    expect(state.hasPromise).toBe(true);

    expectNoPageErrors(pageErrors);
  });

  test("el corpus carga y trae las cuatro partes de cada entrada", async ({ page }) => {
    await gotoApp(page);
    await page.waitForFunction(
      () => Object.keys(window.app?.exampleSentences || {}).length > 0,
      { timeout: 20000 },
    );

    const info = await page.evaluate(() => {
      const sentences = window.app.exampleSentences;
      const entry = sentences["爱"];
      return {
        count: Object.keys(sentences).length,
        entry,
        withoutSpanish: Object.values(sentences).filter((e) => !e.spanish).length,
        withoutEnglish: Object.values(sentences).filter((e) => !e.english).length,
      };
    });

    expect(info.count).toBeGreaterThan(3000);
    expect(info.entry.chinese).toContain("爱");
    expect(info.entry.pinyin).toBeTruthy();
    expect(info.entry.spanish).toBeTruthy();
    expect(info.entry.english).toBeTruthy();
    // Toda entrada es trilingüe: no se incorporaron frases sin español.
    expect(info.withoutSpanish).toBe(0);
    expect(info.withoutEnglish).toBe(0);
  });

  test("el reverso de la tarjeta muestra la frase con ES y EN", async ({ page }) => {
    const pageErrors = await gotoApp(page);
    await page.waitForFunction(
      () => Object.keys(window.app?.exampleSentences || {}).length > 0,
      { timeout: 20000 },
    );

    // Forzar una palabra con ejemplo conocido y re-renderizar la tarjeta.
    await page.evaluate(() => {
      const word = window.app.vocabulary.find((w) => w.character === "爱");
      window.app.currentWord = word;
      window.app.flashcardManager.currentWord = word;
      window.app.flashcardManager.updateCard();
    });

    const example = page.locator("#full-info .example-section");
    await expect(example).toBeVisible({ timeout: 10000 });
    await expect(example.locator(".example-chinese")).toContainText("爱");
    await expect(example.locator(".example-spanish")).toContainText("Puedo amar");
    await expect(example.locator(".example-english")).toContainText("I can love");
    // Sin nombres propios deletreados por pinyin-pro ("T o m").
    await expect(example.locator(".example-pinyin")).not.toContainText(/\b[A-Za-z] [A-Za-z]\b/);

    expectNoPageErrors(pageErrors);
  });
});
