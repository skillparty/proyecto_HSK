const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

// El markup de estas pestañas no viaja en index.html: ui-controller lo baja de
// assets/partials/tabs/ la primera vez que se abren.
test.describe("paneles diferidos", () => {
  test("el panel llega vacío y se hidrata traducido al abrirlo", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    const before = await page.evaluate(() => {
      const panel = document.getElementById("stats");
      return { children: panel.children.length, hydrated: panel.dataset.hydrated };
    });
    expect(before.children).toBe(0);
    expect(before.hydrated).toBeUndefined();

    await openTab(page, "stats", "progress");

    await expect(page.locator("#stats [data-i18n='learningStatistics']")).toHaveText(
      "Estadísticas de Aprendizaje",
      { timeout: 10000 },
    );
    await expect
      .poll(() => page.evaluate(() => document.getElementById("stats").dataset.hydrated))
      .toBe("true");

    expectNoPageErrors(pageErrors);
  });

  // El markup inyectado no pasó por el updateInterface() del arranque, así que
  // hay que retraducirlo a mano al hidratar y que siga respondiendo al selector.
  test("cambiar idioma retraduce el markup inyectado", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "stats", "progress");
    await expect(page.locator("#stats [data-i18n='learningStatistics']")).toHaveText(
      "Estadísticas de Aprendizaje",
      { timeout: 10000 },
    );

    await page.evaluate(() => {
      const select = document.getElementById("language-select");
      select.value = "en";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await expect(page.locator("#stats [data-i18n='learningStatistics']")).toHaveText(
      "Learning Statistics",
      { timeout: 10000 },
    );
  });

  test("volver a la pestaña no duplica el markup", async ({ page }) => {
    await gotoApp(page);
    await openTab(page, "stats", "progress");
    await expect(page.locator("#stats .stats-overview")).toHaveCount(1);

    await openTab(page, "practice", "study");
    await openTab(page, "stats", "progress");
    await expect(page.locator("#stats .stats-overview")).toHaveCount(1);
  });

  // Los partials están en el precache opcional del SW: sin eso, una pestaña que
  // el usuario nunca abrió quedaría vacía sin conexión.
  test("offline: una pestaña nunca abierta se hidrata del precache", async ({
    page,
    context,
  }) => {
    await gotoApp(page);
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, {
      timeout: 20000,
    });

    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            for (const key of await caches.keys()) {
              const cache = await caches.open(key);
              if (await cache.match("./assets/partials/tabs/stats.html")) return true;
            }
            return false;
          }),
        { timeout: 30000 },
      )
      .toBe(true);

    await context.setOffline(true);
    await openTab(page, "stats", "progress");
    await expect(page.locator("#stats .stats-overview")).toHaveCount(1, { timeout: 15000 });
    await context.setOffline(false);
  });
});
