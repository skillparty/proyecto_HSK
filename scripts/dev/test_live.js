const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://skillparty.github.io/proyecto_HSK/index.html?v=clear', { waitUntil: 'networkidle0' });
  
  // Click on "Culture" trigger
  const cultureTrigger = await page.$('div[data-group="culture"] .nav-group-trigger');
  if (cultureTrigger) {
    await cultureTrigger.click();
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Click on "Evolución de Caracteres"
  const charTab = await page.$('button[data-tab="culture-characters"]');
  if (charTab) {
    await charTab.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Check what is inside #culture-characters
  const content = await page.$eval('#culture-characters', el => el.outerHTML);
  console.log("CULTURE CHARACTERS HTML:\n", content);
  
  const display = await page.$eval('#culture-characters', el => window.getComputedStyle(el).display);
  console.log("DISPLAY:", display);
  
  const activeTabs = await page.$$eval('.tab-panel.active', els => els.map(e => e.id));
  console.log("ACTIVE TABS:", activeTabs);

  await browser.close();
})();
