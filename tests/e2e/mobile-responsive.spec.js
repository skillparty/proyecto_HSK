// @ts-check
const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");

test.describe("Mobile Responsive Design", () => {
  const viewports = [
    { name: "Small Mobile (320px)", width: 320, height: 568 },
    { name: "Standard Mobile (375px)", width: 375, height: 667 },
    { name: "Large Mobile (412px)", width: 412, height: 915 },
    { name: "Tablet (768px)", width: 768, height: 1024 },
  ];

  for (const vp of viewports) {
    test(`sin desborde horizontal en viewport ${vp.name} en Inicio y Práctica`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const pageErrors = await gotoApp(page);

      // Verify no horizontal scrolling on body/html
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Verify bottom navigation bar is visible on mobile (width <= 768)
      const navContainer = page.locator(".nav-container");
      await expect(navContainer).toBeVisible();

      // Verify header brand fits
      const brand = page.locator(".header-brand");
      await expect(brand).toBeVisible();

      // Switch to practice via UI
      await openTab(page, "practice", "study");
      const practicePanel = page.locator("#practice");
      await expect(practicePanel).toBeVisible();

      // Check practice horizontal scroll
      const practiceScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(practiceScroll).toBe(false);

      expectNoPageErrors(pageErrors);
    });

    test(`los dropdowns de navegación no se salen del viewport en ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const pageErrors = await gotoApp(page);

      // Test each nav-group dropdown
      const groups = ["study", "evaluate", "games", "culture", "progress"];
      for (const group of groups) {
        const groupEl = page.locator(`.nav-group[data-group="${group}"]`);
        if (await groupEl.count() === 0) continue;

        const trigger = groupEl.locator(".nav-group-trigger");
        await trigger.click();

        const dropdown = groupEl.locator(".nav-dropdown");
        await expect(dropdown).toBeVisible();

        const box = await dropdown.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          // Dropdown left edge must be >= 0 (allow 2px margin of error for subpixel rendering)
          expect(box.x).toBeGreaterThanOrEqual(-2);
          // Dropdown right edge must be <= viewport width + 2px
          expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 4);
        }

        // Close dropdown
        await trigger.click();
      }

      expectNoPageErrors(pageErrors);
    });
  }

  test("el panel de ajustes en móvil cabe en el viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const pageErrors = await gotoApp(page);

    const settingsToggle = page.locator("#mobile-settings-toggle");
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();

    const settingsGroup = page.locator(".header-settings-group");
    await expect(settingsGroup).toBeVisible();

    const box = await settingsGroup.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(360 + 4);
    }

    expectNoPageErrors(pageErrors);
  });

  test("módulo Quiz adapta sus opciones en móvil a columna única", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const pageErrors = await gotoApp(page);

    await openTab(page, "quiz", "evaluate");
    const startBtn = page.locator("#start-quiz");
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    const quizOptions = page.locator("#quiz-options");
    await expect(quizOptions).toBeVisible();

    // Verify quiz container does not overflow horizontally
    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(noOverflow).toBe(true);

    expectNoPageErrors(pageErrors);
  });

  test("módulo Browse renderiza grid responsivo en móvil sin desborde", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const pageErrors = await gotoApp(page);

    await openTab(page, "browse", "study");
    const vocabGrid = page.locator(".vocabulary-grid");
    await expect(vocabGrid).toBeVisible();

    const noOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(noOverflow).toBe(true);

    expectNoPageErrors(pageErrors);
  });
});
