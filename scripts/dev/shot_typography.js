// Visual check: serif display font + browse card hierarchy, both themes
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);

    await page.evaluate(() => window.app.switchTab('browse'));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/type-browse-dark.png` });

    await page.evaluate(() => window.app.switchTab('practice'));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/type-practice-dark.png` });

    await page.evaluate(() => document.getElementById('theme-toggle').click());
    await page.waitForTimeout(600);
    await page.evaluate(() => window.app.switchTab('browse'));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/type-browse-light.png` });

    // Confirm computed fonts
    const fonts = await page.evaluate(() => ({
        heading: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0, 40),
        vocabChar: getComputedStyle(document.querySelector('.vocab-character, .vocab-character-box')).fontFamily.slice(0, 40),
        badge: !!document.querySelector('.vocab-level'),
    }));
    console.log(JSON.stringify(fonts, null, 2));

    await browser.close();
})();
