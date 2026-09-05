const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers.js");

test.describe("Módulos de Cultura con Video y Snake Video (E2E)", () => {
  const cultureTabs = [
    { tabId: "culture-medicine", prefix: "medicine", videoSrc: "traditionalMedicine.mp4" },
    { tabId: "culture-technology", prefix: "technology", videoSrc: "technologyEvolution.mp4" },
    { tabId: "culture-characters", prefix: "characters", videoSrc: "characterEvolution.mp4" },
    { tabId: "culture-opera", prefix: "opera", videoSrc: "operaPekin.mp4" },
  ];

  for (const { tabId, prefix, videoSrc } of cultureTabs) {
    test(`renderiza video ilustrativo y permite conmutar a foto en ${tabId}`, async ({ page }) => {
      const pageErrors = await gotoApp(page);

      await openTab(page, tabId, "culture");

      const video = page.locator(`#culture-${prefix}-video`);
      await expect(video).toBeVisible({ timeout: 10000 });

      const src = await video.getAttribute("src");
      expect(src).toContain(videoSrc);

      const badge = page.locator(`#culture-${prefix}-badge`);
      await expect(badge).toBeVisible();

      // Botón de conmutación a foto
      const toggleBtn = page.locator(`#culture-${prefix}-toggle`);
      await expect(toggleBtn).toBeVisible();

      // Conmutar a foto
      await toggleBtn.click();
      const img = page.locator(`#culture-${prefix}-img`);
      await expect(img).toBeVisible();
      await expect(video).toBeHidden();
      await expect(badge).toBeHidden();

      // Conmutar de vuelta a video
      await toggleBtn.click();
      await expect(video).toBeVisible();
      await expect(img).toBeHidden();
      await expect(badge).toBeVisible();

      expectNoPageErrors(pageErrors);
    });
  }

  test("el video del juego Snake está actualizado y visible en cuantificadores", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await openTab(page, "snake-quantifiers", "games");

    const snakeVideo = page.locator(".snakeq-video-container video");
    await expect(snakeVideo).toBeVisible({ timeout: 10000 });

    const src = await snakeVideo.getAttribute("src");
    expect(src).toContain("snakeGame.mp4");

    expectNoPageErrors(pageErrors);
  });
});
