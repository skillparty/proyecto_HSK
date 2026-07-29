const { test, expect } = require("@playwright/test");
const { gotoApp } = require("./helpers");

// La CSP va por <meta> porque GitHub Pages no permite headers, y meta no
// soporta Report-Only: entra aplicando. Sin un modo observación, este spec es
// la única red de contención antes de publicar — recorre todos los tabs y
// falla si el navegador reporta cualquier violación.
//
// Hueco conocido: el login con GitHub abre un popup OAuth real y no se
// ejercita acá. Ese camino se verifica a mano.

async function collectViolations(page) {
  const violations = [];

  // addInitScript corre antes que cualquier script de la página, así que el
  // listener ya está puesto cuando se evalúan los scripts inline.
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push({
        directive: event.effectiveDirective,
        blockedURI: event.blockedURI,
      });
    });
  });

  page.on("console", (message) => {
    const text = message.text();
    if (text.includes("Content Security Policy")) violations.push(text);
  });

  return violations;
}

async function readViolations(page) {
  return page.evaluate(() => window.__cspViolations || []);
}

function formatViolations(reported) {
  return reported
    .map((v) => `${v.directive} bloqueó ${v.blockedURI}`)
    .join("\n");
}

test.describe("Content-Security-Policy", () => {
  test("la meta está presente y trae los hashes de los scripts inline", async ({
    page,
  }) => {
    await gotoApp(page);

    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute("content");

    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");

    // assemble-index.js inyecta un sha256 por script inline. Si el placeholder
    // quedara sin reemplazar, o los hashes se calcularan mal, la app entera
    // dejaría de arrancar en producción.
    const hashes = csp.match(/'sha256-[A-Za-z0-9+/=]+'/g) || [];
    expect(hashes.length).toBe(3);
    expect(csp).not.toContain("CSP_SCRIPT_HASHES");

    // 'unsafe-inline' en script-src anularía el sentido de los hashes.
    const scriptSrc = csp.split(";").find((d) => d.includes("script-src"));
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  test("navegar por todos los tabs no dispara ninguna violación", async ({
    page,
  }) => {
    const consoleViolations = await collectViolations(page);
    const pageErrors = await gotoApp(page);

    // Los tabs se descubren del DOM real en vez de hardcodear la lista, así un
    // tab nuevo queda cubierto sin tocar este spec.
    const groups = await page
      .locator(".nav-group[data-group]")
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.group));

    for (const group of groups) {
      await page
        .locator(`.nav-group[data-group="${group}"] .nav-group-trigger`)
        .click();

      const tabs = await page
        .locator(`.nav-group[data-group="${group}"] .nav-dropdown-item[data-tab]`)
        .evaluateAll((nodes) => nodes.map((n) => n.dataset.tab));

      for (const tab of tabs) {
        await page
          .locator(`.nav-group[data-group="${group}"] .nav-group-trigger`)
          .click();
        await page.locator(`.nav-dropdown-item[data-tab="${tab}"]`).click();
        await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
        // Los controllers lazy inyectan script y CSS al abrirse; darles margen
        // para que una carga bloqueada llegue a reportarse.
        await page.waitForTimeout(600);
      }
    }

    const topLevelTabs = await page
      .locator(".nav-tab[data-tab]")
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.tab));

    for (const tab of topLevelTabs) {
      await page.locator(`.nav-tab[data-tab="${tab}"]`).click();
      await expect(page.locator(`#${tab}`)).toHaveClass(/active/);
      await page.waitForTimeout(600);
    }

    const reported = await readViolations(page);
    expect(reported, formatViolations(reported)).toEqual([]);
    expect(consoleViolations, consoleViolations.join("\n")).toEqual([]);
    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
  });

  // Regresión: la primera versión de la CSP rompió el login en producción.
  // signInWithPopup carga https://apis.google.com/js/api.js para montar su
  // iframe auxiliar; sin ese origen en script-src falla con auth/internal-error
  // y el popup no llega a abrirse. Ninguno de los otros specs lo tocaba.
  //
  // No se completa la autenticación (haría falta una cuenta real de GitHub). La
  // aserción fuerte es la de violaciones CSP: se disparan apenas Firebase
  // intenta cargar gapi, o sea antes de cualquier ida y vuelta con GitHub.
  test("iniciar el login con GitHub no dispara violaciones", async ({
    page,
    context,
  }) => {
    await collectViolations(page);
    await gotoApp(page);

    const loginButton = page.locator('[data-auth-action="login"]');
    await expect(loginButton).toBeVisible({ timeout: 15000 });

    const popupPromise = context
      .waitForEvent("page", { timeout: 20000 })
      .catch(() => null);
    await loginButton.click();
    const popup = await popupPromise;

    // Margen para que la violación llegue a reportarse si gapi queda bloqueado.
    await page.waitForTimeout(2000);

    const reported = await readViolations(page);
    expect(reported, formatViolations(reported)).toEqual([]);

    // El popup depende de red externa, así que es una comprobación blanda: si
    // abrió, tiene que haber llegado al proveedor, no morir en un about:blank.
    if (popup) {
      await popup.waitForLoadState("domcontentloaded").catch(() => {});
      expect(popup.url()).not.toBe("about:blank");
    }
  });
});
