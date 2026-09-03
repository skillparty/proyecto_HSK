const { test, expect } = require("@playwright/test");
const { gotoApp, openTab, expectNoPageErrors } = require("./helpers");
const manifest = require("../../config/manifest.json");

test.describe("PWA & Mobile First Experience", () => {
  test("el manifest.json es válido y cumple los criterios modernos de PWA y Rich Install", async () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("../index.html");
    expect(manifest.scope).toBe("../");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    // Rich Install criteria: screenshots con form_factor narrow y wide
    expect(manifest.screenshots).toBeDefined();
    expect(manifest.screenshots.length).toBeGreaterThanOrEqual(2);
    const narrow = manifest.screenshots.find((s) => s.form_factor === "narrow");
    const wide = manifest.screenshots.find((s) => s.form_factor === "wide");
    expect(narrow).toBeTruthy();
    expect(wide).toBeTruthy();
    expect(narrow.src).toContain("screenshot-mobile.png");
    expect(wide.src).toContain("screenshot-tablet.png");

    // Shortcuts con rutas relativas corregidas
    expect(manifest.shortcuts.length).toBeGreaterThan(0);
    manifest.shortcuts.forEach((sc) => {
      expect(sc.url.startsWith("../index.html")).toBe(true);
    });
  });

  test("el botón de instalación PWA está presente en el menú de ajustes", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await page.locator("#mobile-settings-toggle").click();
    const installRow = page.locator("#pwa-install-row");
    await expect(installRow).toBeVisible();

    const installBtn = page.locator("#pwa-install-btn");
    await expect(installBtn).toBeVisible();
    await expect(installBtn).toContainText(/Instalar|Install/);

    expectNoPageErrors(pageErrors);
  });

  test("el modal de instalación de iOS se abre y se cierra correctamente", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    // Abrir modal de iOS
    await page.evaluate(() => {
      window.PWAInstallManager.showIOSModal();
    });

    const dialog = page.locator("#ios-install-dialog");
    await expect(dialog).toHaveAttribute("open", "");
    await expect(page.locator("#ios-modal-title")).toBeVisible();
    await expect(page.locator(".ios-step-item")).toHaveCount(3);

    // Cerrar modal
    await page.locator("#ios-modal-got-it").click();
    await expect(dialog).not.toHaveAttribute("open", "");

    expectNoPageErrors(pageErrors);
  });

  test("el banner inteligente de PWA se muestra en móvil y se puede descartar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const pageErrors = await gotoApp(page);

    // Limpiar cooldown de localStorage para forzar visibilidad del banner
    await page.evaluate(() => {
      localStorage.removeItem("hsk_pwa_banner_dismissed");
      window.PWAInstallManager.checkAndShowBanner();
    });

    const banner = page.locator("#pwa-smart-banner");
    await expect(banner).toBeVisible();

    // Descartar banner
    await page.locator("#pwa-banner-dismiss-btn").click();
    await expect(banner).toBeHidden();

    // Verificar que guardó timestamp en localStorage
    const dismissed = await page.evaluate(() => localStorage.getItem("hsk_pwa_banner_dismissed"));
    expect(dismissed).toBeTruthy();

    expectNoPageErrors(pageErrors);
  });

  test("los inputs de formulario en móvil tienen font-size >= 16px para evitar auto-zoom en iOS", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const pageErrors = await gotoApp(page);

    const searchInput = page.locator("#search-input");
    const fontSize = await searchInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // En iOS Safari, font-size < 16px dispara zoom involuntario al enfocar
    expect(fontSize).toBeGreaterThanOrEqual(16);

    expectNoPageErrors(pageErrors);
  });

  test("el indicador de sincronización offline en la cabecera está presente", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    const syncIndicator = page.locator("#sync-status-indicator");
    await expect(syncIndicator).toBeVisible();
    await expect(syncIndicator).toHaveClass(/sync-status-indicator/);

    expectNoPageErrors(pageErrors);
  });

  test("el botón de recordatorio diario de racha está presente en ajustes", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    await page.locator("#mobile-settings-toggle").click();
    const reminderRow = page.locator("#study-reminder-row");
    await expect(reminderRow).toBeVisible();

    const reminderBtn = page.locator("#reminder-toggle-btn");
    await expect(reminderBtn).toBeVisible();

    expectNoPageErrors(pageErrors);
  });

  test("el modo manos libres se activa en práctica y despliega el mini reproductor flotante", async ({ page }) => {
    const pageErrors = await gotoApp(page);

    // Navegar a práctica vía openTab helper
    await openTab(page, "practice", "study");

    // Botón manos libres
    const handsFreeBtn = page.locator("#hands-free-toggle-btn");
    await expect(handsFreeBtn).toBeVisible();

    // Activar manos libres
    await handsFreeBtn.click();
    const player = page.locator("#hands-free-player");
    await expect(player).toBeVisible();

    // Controles del reproductor
    await expect(page.locator("#hf-play-btn")).toBeVisible();
    await expect(page.locator("#hf-next-btn")).toBeVisible();
    await expect(page.locator("#hf-prev-btn")).toBeVisible();
    await expect(page.locator("#hf-speed-select")).toBeVisible();

    // Cerrar manos libres
    await page.locator("#hf-close-btn").click();
    await expect(player).toBeHidden();

    expectNoPageErrors(pageErrors);
  });
});
