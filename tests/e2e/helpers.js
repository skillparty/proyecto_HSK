const { expect } = require("@playwright/test");

// Carga la app y registra errores de página en el array devuelto.
// Los tests deben terminar con expectNoPageErrors().
async function gotoApp(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.app && window.app.uiController);

  return pageErrors;
}

// Navega vía UI real: abre el dropdown del grupo y clickea el item.
// Tabs de nivel superior (home, etymology) no tienen grupo.
async function openTab(page, tabName, groupName = null) {
  if (groupName) {
    await page.locator(`.nav-group[data-group="${groupName}"] .nav-group-trigger`).click();
    await page.locator(`.nav-dropdown-item[data-tab="${tabName}"]`).click();
  } else {
    await page.locator(`.nav-tab[data-tab="${tabName}"]`).click();
  }
  await expect(page.locator(`#${tabName}`)).toHaveClass(/active/);
}

function expectNoPageErrors(pageErrors) {
  expect(pageErrors, `Errores JS en página:\n${pageErrors.join("\n")}`).toHaveLength(0);
}

module.exports = { gotoApp, openTab, expectNoPageErrors };
