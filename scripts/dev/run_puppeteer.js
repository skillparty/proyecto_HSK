const puppeteer = require('puppeteer');
const http = require('http');
const handler = require('serve-handler');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: '/Users/alejandrorollano/proyecto_HSK' });
});

server.listen(3000, async () => {
  console.log('Server running at http://localhost:3000');
  
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Capturar logs de consola para debug
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/index.html');
  console.log("Page loaded");
  
  await page.waitForTimeout(2000);
  
  // Buscar y hacer clic en el botón de Cultura -> Tecnología China
  // La estructura es <div class="nav-group"><button class="nav-group-trigger">...Cultura...</button> <div class="nav-dropdown">...
  // Let's just run JS to switch the tab directly!
  await page.evaluate(() => {
    window.app.uiController.switchTab('culture-technology');
  });
  console.log("Switched tab to culture-technology");
  
  await page.waitForTimeout(2000);
  
  const content = await page.evaluate(() => {
    const el = document.getElementById('culture-technology-content');
    return el ? { length: el.innerHTML.length, html: el.innerHTML.substring(0, 150), visible: el.offsetParent !== null } : null;
  });
  
  console.log("Content data:", content);
  
  await browser.close();
  server.close();
});
