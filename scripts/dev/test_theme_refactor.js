// Verify theme refactor: pre-paint attribute, dark/light surfaces, toggle, no inline props
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

    // --- Dark (default) ---
    const dark = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await dark.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await dark.waitForTimeout(1500);

    const darkState = await dark.evaluate(() => ({
        attr: document.documentElement.getAttribute('data-theme'),
        bgApp: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-app').trim(),
        bodyBgImage: getComputedStyle(document.body).backgroundImage.slice(0, 80),
        inlineProps: document.documentElement.getAttribute('style') || '',
        bodyInlineBg: document.body.style.background || '',
        tone2: getComputedStyle(document.documentElement).getPropertyValue('--color-tone-2').trim(),
    }));
    check('dark: data-theme attr', darkState.attr === 'dark', darkState.attr);
    check('dark: --color-bg-app = #09090b', darkState.bgApp === '#09090b', darkState.bgApp);
    // Mural moved to body::before (home only) — body keeps subtle radial glow
    check('dark: body bg has subtle gradient', darkState.bodyBgImage.includes('radial-gradient'), darkState.bodyBgImage);
    check('dark: no inline CSS props on <html>', !darkState.inlineProps.includes('--color'), darkState.inlineProps);
    check('dark: no inline body background', darkState.bodyInlineBg === '', darkState.bodyInlineBg);
    check('dark: tone-2 brightened', darkState.tone2 === '#3b82f6', darkState.tone2);
    await dark.screenshot({ path: `${OUT}/verify-dark.png` });

    // --- Toggle to light ---
    await dark.evaluate(() => document.getElementById('theme-toggle').click());
    await dark.waitForTimeout(800);
    const lightState = await dark.evaluate(() => ({
        attr: document.documentElement.getAttribute('data-theme'),
        bgApp: getComputedStyle(document.documentElement).getPropertyValue('--color-bg-app').trim(),
        stored: localStorage.getItem('hsk-theme'),
        tone2: getComputedStyle(document.documentElement).getPropertyValue('--color-tone-2').trim(),
    }));
    check('toggle: data-theme = light', lightState.attr === 'light', lightState.attr);
    check('toggle: --color-bg-app = #ffffff', lightState.bgApp === '#ffffff', lightState.bgApp);
    check('toggle: persisted', lightState.stored === 'light', lightState.stored);
    check('toggle: tone-2 back to light value', lightState.tone2 === '#2563eb', lightState.tone2);
    await dark.screenshot({ path: `${OUT}/verify-light.png` });

    // --- Reload keeps light via pre-paint (check attr before app JS runs) ---
    const light2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await light2.addInitScript(() => localStorage.setItem('hsk-theme', 'light'));
    let prePaintAttr = null;
    light2.on('domcontentloaded', async () => {
        prePaintAttr = await light2.evaluate(() => document.documentElement.getAttribute('data-theme')).catch(() => null);
    });
    await light2.goto(BASE, { waitUntil: 'domcontentloaded' }).catch(() => {});
    const earlyAttr = await light2.evaluate(() => document.documentElement.getAttribute('data-theme'));
    check('pre-paint: light applied at domcontentloaded', earlyAttr === 'light', earlyAttr);

    await browser.close();
    console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
})();
