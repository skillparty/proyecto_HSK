// Capture each game tab in both dark and light themes for theme-compat audit
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';
const GAMES = ['snake-quantifiers', 'matrix', 'tones-invaders', 'hanzi-builder', 'word-linker'];

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1600);

    const setTheme = async (mode) => {
        await page.evaluate((m) => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if ((m === 'dark') !== isDark) document.getElementById('theme-toggle').click();
        }, mode);
        await page.waitForTimeout(500);
    };

    for (const theme of ['dark', 'light']) {
        await setTheme(theme);
        for (const g of GAMES) {
            await page.evaluate((t) => window.app.switchTab(t), g);
            await page.waitForTimeout(1100);
            await page.screenshot({ path: `${OUT}/game-${g}-${theme}.png` });
            console.log(`shot ${g} ${theme}`);
        }
    }
    await browser.close();
})();
