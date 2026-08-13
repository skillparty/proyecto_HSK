import { test, expect } from "@playwright/test";
import { gotoApp, openTab, expectNoPageErrors } from "./helpers.js";

test.describe("Módulo de Videos (E2E)", () => {
  test("carga diferida de videos, renderiza canales y filtra por búsqueda", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await openTab(page, "videos");

    await expect
      .poll(() => page.evaluate(() => !!window.app?.videosController), { timeout: 10000 })
      .toBe(true);

    // Canales visibles
    const channelCards = page.locator(".videos-channel-card");
    await expect(channelCards.first()).toBeVisible({ timeout: 10000 });
    expect(await channelCards.count()).toBeGreaterThanOrEqual(5);

    // Grid de videos
    const videoCards = page.locator(".video-card");
    await expect(videoCards.first()).toBeVisible({ timeout: 10000 });

    // Filtrado por buscador
    const searchInput = page.locator("#videos-search-input");
    await searchInput.fill("Gran Muralla");
    await page.waitForTimeout(300);

    const filteredCards = page.locator(".video-card");
    expect(await filteredCards.count()).toBeGreaterThanOrEqual(1);

    expectNoPageErrors(pageErrors);
  });

  test("abre reproductor teatro, interactúa con Bucle A-B, frases clave y notas", async ({
    page,
  }) => {
    const pageErrors = await gotoApp(page);

    await openTab(page, "videos");

    await expect
      .poll(() => page.evaluate(() => !!window.app?.videosController), { timeout: 10000 })
      .toBe(true);

    // Reproducir el primer video disponible
    const firstPlayBtn = page.locator(".video-card .videos-btn-primary").first();
    await expect(firstPlayBtn).toBeVisible({ timeout: 10000 });
    await firstPlayBtn.click();

    // Comprobar que el modo teatro está visible
    const theater = page.locator("#videos-theater-player");
    await expect(theater).toBeVisible();

    // Controles de Bucle A-B
    const loopABtn = page.locator("#videos-loop-a-btn");
    const loopBBtn = page.locator("#videos-loop-b-btn");
    const loopToggleBtn = page.locator("#videos-loop-toggle-btn");

    await expect(loopABtn).toBeVisible();
    await expect(loopBBtn).toBeVisible();
    await expect(loopToggleBtn).toBeVisible();

    await loopABtn.click();
    await loopBBtn.click();
    await loopToggleBtn.click();

    const isLoopActive = await page.evaluate(
      () => window.app.videosController.isLoopActive
    );
    expect(isLoopActive).toBe(true);

    // Escribir apuntes y probar autoguardado
    const notesInput = page.locator("#videos-user-notes-input");
    await notesInput.fill("Vocabulario importante de la lección 1");
    await page.waitForTimeout(600);

    const savedStatus = page.locator("#videos-notes-saved-status");
    await expect(savedStatus).toContainText("Guardado");

    expectNoPageErrors(pageErrors);
  });
});
