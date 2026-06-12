// Verify header refactor: settings dropdown, auth styling, streak-only stats
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
    await page.waitForTimeout(1800);

    // Old stats removed, streak kept
    check('header-studied removed', await page.evaluate(() => !document.getElementById('header-studied')));
    check('header-progress removed', await page.evaluate(() => !document.getElementById('header-progress')));
    check('streak stat present', await page.evaluate(() => !!document.getElementById('header-streak-stat')));

    // Auth stylesheet loaded and guest pill compact
    const authState = await page.evaluate(() => {
        const sheet = document.getElementById('auth-stylesheet');
        const guest = document.querySelector('.auth-guest-mode, .auth-guest, .user-profile');
        const rect = guest ? guest.getBoundingClientRect() : null;
        return { sheetLoaded: !!(sheet && sheet.sheet), hasAuthUI: !!guest, height: rect ? rect.height : 0 };
    });
    check('auth stylesheet loaded', authState.sheetLoaded);
    check('auth UI compact (≤56px alto)', authState.hasAuthUI && authState.height <= 56, `height=${authState.height}`);

    // Dropdown closed by default
    const panelHidden = await page.evaluate(() => {
        const panel = document.querySelector('.header-settings-group');
        return getComputedStyle(panel).display === 'none';
    });
    check('settings panel closed by default', panelHidden);

    // Open via gear
    await page.click('#mobile-settings-toggle');
    await page.waitForTimeout(400);
    const openState = await page.evaluate(() => {
        const panel = document.querySelector('.header-settings-group');
        const cs = getComputedStyle(panel);
        const rect = panel.getBoundingClientRect();
        return {
            visible: cs.display !== 'none',
            inViewport: rect.right <= window.innerWidth && rect.left >= 0,
            ariaExpanded: document.getElementById('mobile-settings-toggle').getAttribute('aria-expanded'),
            rows: panel.querySelectorAll('.settings-row').length,
        };
    });
    check('panel opens on gear click', openState.visible);
    check('panel inside viewport', openState.inViewport);
    check('aria-expanded=true', openState.ariaExpanded === 'true', openState.ariaExpanded);
    check('3 settings rows (idioma/voz/audio)', openState.rows === 3, String(openState.rows));
    await page.screenshot({ path: `${OUT}/header-settings-open-dark.png` });

    // Close on outside click
    await page.click('body', { position: { x: 700, y: 500 } });
    await page.waitForTimeout(300);
    const closedAfterOutside = await page.evaluate(() =>
        getComputedStyle(document.querySelector('.header-settings-group')).display === 'none');
    check('closes on outside click', closedAfterOutside);

    // Escape closes too
    await page.click('#mobile-settings-toggle');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedAfterEsc = await page.evaluate(() =>
        getComputedStyle(document.querySelector('.header-settings-group')).display === 'none');
    check('closes on Escape', closedAfterEsc);

    // Audio toggle still wired inside panel
    await page.click('#mobile-settings-toggle');
    await page.waitForTimeout(300);
    const audioWorks = await page.evaluate(() => {
        const btn = document.getElementById('audio-toggle');
        if (!btn) return false;
        btn.click();
        return true;
    });
    check('audio toggle present in panel', audioWorks);

    // Light theme screenshot
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.getElementById('theme-toggle').click());
    await page.waitForTimeout(600);
    await page.click('#mobile-settings-toggle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/header-settings-open-light.png` });

    // Mobile: gear still works
    const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mobile.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await mobile.waitForTimeout(1500);
    await mobile.click('#mobile-settings-toggle');
    await mobile.waitForTimeout(400);
    const mobileOpen = await mobile.evaluate(() => {
        const panel = document.querySelector('.header-settings-group');
        const rect = panel.getBoundingClientRect();
        return getComputedStyle(panel).display !== 'none'
            && rect.right <= window.innerWidth + 1 && rect.left >= -1;
    });
    check('mobile: panel opens inside viewport', mobileOpen);
    await mobile.screenshot({ path: `${OUT}/header-mobile-settings.png` });

    await browser.close();
    console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
})();
