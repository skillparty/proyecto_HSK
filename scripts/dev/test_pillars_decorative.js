// Verify pillars are decorative-only: no nav buttons, no progress widgets, no JS errors
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

    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1800);

    const state = await page.evaluate(() => ({
        navBtns: document.querySelectorAll('.hsk-nav-btn').length,
        progressPillar: !!document.querySelector('.hsk-progress-pillar'),
        fireBottom: !!document.querySelector('.fire-bottom'),
        lanterns: document.querySelectorAll('.lantern-top').length,
        coins: document.querySelectorAll('.coin-bottom').length,
        pillarsVisible: getComputedStyle(document.querySelector('.vertical-pillar-left')).display !== 'none',
        pillarsAriaHidden: document.querySelector('.vertical-pillar-left').getAttribute('aria-hidden') === 'true',
    }));

    check('nav H1-H6 removed', state.navBtns === 0, String(state.navBtns));
    check('progress pillar removed', !state.progressPillar);
    check('fire streak removed', !state.fireBottom);
    check('2 lanterns kept', state.lanterns === 2, String(state.lanterns));
    check('2 coins kept', state.coins === 2, String(state.coins));
    check('pillars visible at 1600px', state.pillarsVisible);
    check('pillars aria-hidden', state.pillarsAriaHidden);

    // Scroll animation still works without errors (browse is long enough to scroll)
    await page.evaluate(() => window.app.switchTab('browse'));
    await page.waitForTimeout(1200);
    // El scroll vive en .tab-panel, no en window
    await page.evaluate(() => { document.querySelector('.tab-panel.active').scrollTop = 400; });
    await page.waitForTimeout(500);
    const scrollState = await page.evaluate(() => ({
        scrolled: document.querySelector('.tab-panel.active').scrollTop > 0,
        transformed: document.querySelector('.lantern-top').style.transform.includes('rotate'),
    }));
    check('panel actually scrolled', scrollState.scrolled);
    check('lantern scroll animation alive', scrollState.transformed);
    check('no JS errors', errors.length === 0, errors.join(' | '));

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => window.app.switchTab('home'));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/pillars-home-1600.png` });

    await browser.close();
    console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
})();
