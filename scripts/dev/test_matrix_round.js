/**
 * Reproduce matrix game round bug: click the correct cell and observe
 * how many hsk:matrix-round events fire, what they report, and whether
 * extra nextRound calls happen.
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (err) => console.log('[pageerror]', err.message.slice(0, 200)));
  page.on('console', (msg) => {
    const t = msg.text();
    if (t.includes('matrix') || t.includes('Matrix') || t.includes('round')) {
      console.log('[console]', t.slice(0, 160));
    }
  });

  await page.goto('http://localhost:3369/?nosw=1', { waitUntil: 'networkidle' });

  // Wait for app + vocabulary
  await page.waitForFunction(() => window.app && window.app.vocabularyLoaded, null, { timeout: 30000 });

  // Open matrix tab
  await page.evaluate(() => window.app.switchTab('matrix'));
  await page.waitForFunction(() => window.matrixGame && document.getElementById('matrix-start-btn'), null, { timeout: 15000 });

  // Instrument BEFORE starting
  await page.evaluate(() => {
    window.__events = [];
    window.addEventListener('hsk:matrix-round', (e) => window.__events.push({ ...e.detail, t: Date.now() }));
    const origNext = window.matrixGame.nextRound.bind(window.matrixGame);
    window.__nextCalls = 0;
    window.matrixGame.nextRound = () => { window.__nextCalls++; return origNext(); };
  });

  // Start game
  await page.click('#matrix-start-btn');
  await page.waitForSelector('.matrix-char', { timeout: 10000 });

  const state1 = await page.evaluate(() => ({
    correctPosition: window.matrixGame.correctPosition,
    currentChar: window.matrixGame.currentWord.character,
    cells: Array.from(document.querySelectorAll('.matrix-char')).map((c) => c.textContent),
    round: window.matrixGame.currentRound,
    nextCalls: window.__nextCalls,
  }));
  console.log('ROUND 1:', JSON.stringify(state1));
  const dupTarget = state1.cells.filter((c) => c === state1.currentChar).length;
  console.log('target char appears in grid:', dupTarget, 'times');
  const dupAny = state1.cells.length - new Set(state1.cells).size;
  console.log('duplicate cells total:', dupAny);

  // Click the correct cell
  await page.click(`.matrix-char[data-index="${state1.correctPosition}"]`);
  await page.waitForTimeout(400);

  const afterClick = await page.evaluate(() => ({
    events: window.__events,
    nextCalls: window.__nextCalls,
    score: window.matrixGame.score,
    round: window.matrixGame.currentRound,
    highlighted: Array.from(document.querySelectorAll('.highlight-correct')).map((c) => c.textContent),
    wrongMarked: Array.from(document.querySelectorAll('.matrix-char.wrong')).map((c) => c.textContent),
  }));
  console.log('AFTER CLICK (0.4s):', JSON.stringify(afterClick, null, 1));

  // Wait past both potential timers (1s correct + 2s wrong)
  await page.waitForTimeout(2500);
  const later = await page.evaluate(() => ({
    nextCalls: window.__nextCalls,
    round: window.matrixGame.currentRound,
    events: window.__events.length,
  }));
  console.log('AFTER 2.9s:', JSON.stringify(later));

  await browser.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
