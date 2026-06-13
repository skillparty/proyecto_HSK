// Capture Culture sections + Progress(stats) in both themes for theme-compat audit
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';
const TABS = ['stats', 'culture-characters', 'culture-medicine', 'culture-opera', 'culture-technology', 'culture-clothing', 'culture-arts'];

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1600);

    const setTheme = async (mode) => {
        await page.evaluate((m) => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if ((m === 'dark') !== isDark) document.getElementById('theme-toggle').click();
        }, mode);
        await page.waitForTimeout(400);
    };

    for (const theme of ['dark', 'light']) {
        await setTheme(theme);
        for (const t of TABS) {
            await page.evaluate((tab) => window.app.switchTab(tab), t);
            await page.waitForTimeout(1100);
            await page.screenshot({ path: `${OUT}/cp-${t}-${theme}.png` });
            console.log(`shot ${t} ${theme}`);
        }
    }
    await browser.close();
})();
