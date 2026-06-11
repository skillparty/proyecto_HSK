/**
 * Visual check for quantifier snake: open tab, start game, screenshot board.
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (err) => console.log('[pageerror]', err.message.slice(0, 200)));

  await page.goto('http://localhost:3369/?nosw=1', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.app && window.app.vocabularyLoaded, null, { timeout: 30000 });

  await page.evaluate(() => window.app.switchTab('snake-quantifiers'));
  await page.waitForTimeout(1500);

  // Start the game (button id may vary; try common ones)
  const started = await page.evaluate(() => {
    const btn = document.getElementById('snakeq-start-btn') ||
      document.querySelector('[data-snakeq-action="start"]') ||
      Array.from(document.querySelectorAll('#snake-quantifiers button'))
        .find((b) => /empezar|start|jugar|comenzar/i.test(b.textContent));
    if (btn) { btn.click(); return btn.textContent.trim(); }
    return null;
  });
  console.log('start button:', started);
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const c = window.app.snakeQuantifiersController || window.snakeQuantifiersController;
    const canvas = document.getElementById('snakeq-canvas');
    return {
      boardSize: c && c.boardSize,
      cellSize: c && c.cellSize,
      viewSize: c && c.viewSize,
      canvasW: canvas && canvas.width,
      cssW: canvas && canvas.style.width,
      foods: c && c.state.foods.length,
      running: c && c.state.isRunning,
    };
  });
  console.log('STATE:', JSON.stringify(info));

  const board = page.locator('.snakeq-board-wrap');
  await board.screenshot({ path: '/tmp/snake_board.png' });
  console.log('screenshot saved: /tmp/snake_board.png');

  await browser.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
