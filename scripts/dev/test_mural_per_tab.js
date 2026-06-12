// Verify mural backdrop shows only on home tab, clean background elsewhere
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';

(async () => {
    const browser = await chromium.launch();
    let failures = 0;
    const check = (label, ok, extra = '') => {
        console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${extra ? ' — ' + extra : ''}`);
        if (!ok) failures++;
    };

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);

    const muralOpacity = () => page.evaluate(() =>
        parseFloat(getComputedStyle(document.body, '::before').opacity));
    const activeTabAttr = () => page.evaluate(() =>
        document.documentElement.getAttribute('data-active-tab'));

    // Initial tab = practice (no stored tab): mural hidden
    check('initial: data-active-tab', (await activeTabAttr()) === 'practice', await activeTabAttr());
    check('initial (practice): mural hidden', (await muralOpacity()) === 0, String(await muralOpacity()));

    // Switch to home: mural visible
    await page.evaluate(() => document.querySelector('[data-tab="home"]').click());
    await page.waitForTimeout(800);
    check('home: attr updated', (await activeTabAttr()) === 'home', await activeTabAttr());
    check('home: mural visible', (await muralOpacity()) === 1, String(await muralOpacity()));
    await page.screenshot({ path: `${OUT}/mural-home-dark.png` });

    // Switch to browse: mural fades out
    await page.evaluate(() => window.app.switchTab('browse'));
    await page.waitForTimeout(800);
    check('browse: mural hidden', (await muralOpacity()) === 0, String(await muralOpacity()));
    await page.screenshot({ path: `${OUT}/mural-browse-dark.png` });

    // Quiz tab clean too
    await page.evaluate(() => window.app.switchTab('quiz'));
    await page.waitForTimeout(800);
    check('quiz: mural hidden', (await muralOpacity()) === 0, String(await muralOpacity()));
    await page.screenshot({ path: `${OUT}/mural-quiz-dark.png` });

    // Light theme on home
    await page.evaluate(() => window.app.switchTab('home'));
    await page.waitForTimeout(400);
    await page.evaluate(() => document.getElementById('theme-toggle').click());
    await page.waitForTimeout(800);
    check('home light: mural visible', (await muralOpacity()) === 1, String(await muralOpacity()));
    await page.screenshot({ path: `${OUT}/mural-home-light.png` });

    await page.evaluate(() => window.app.switchTab('browse'));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/mural-browse-light.png` });

    // Pre-paint: reload with stored last tab = home → mural attr set at domcontentloaded
    const fresh = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await fresh.addInitScript(() => localStorage.setItem('hsk-last-tab', 'home'));
    await fresh.goto(BASE, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const earlyTab = await fresh.evaluate(() => document.documentElement.getAttribute('data-active-tab'));
    check('pre-paint: home attr at domcontentloaded', earlyTab === 'home', earlyTab);

    await browser.close();
    console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
})();
