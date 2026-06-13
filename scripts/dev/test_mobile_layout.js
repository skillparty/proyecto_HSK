// Verify mobile fixes: no horizontal overflow, auth compact, flashcard ink, footer clearance
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

    // Emulación móvil real: touch + coarse pointer (como un teléfono)
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1800);

    // No auto-scroll en carga (el input pinyin no debe autoenfocar en táctil)
    const loadScroll = await page.evaluate(() => window.scrollY);
    check('no auto-scroll on load (header visible)', loadScroll === 0, `scrollY=${loadScroll}`);

    // No horizontal overflow anywhere
    const overflow = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const offenders = [];
        document.querySelectorAll('*').forEach((el) => {
            const cs = getComputedStyle(el);
            // Ignorar elementos ocultos (dropdowns cerrados, etc.)
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > docW + 1 || r.left < -1)) {
                offenders.push((el.className && el.className.toString().slice(0, 30)) || el.tagName);
            }
        });
        return { docW, scrollW: document.documentElement.scrollWidth, offenders: [...new Set(offenders)].slice(0, 10) };
    });
    check('no element overflows viewport width', overflow.offenders.length === 0, overflow.offenders.join(', '));
    check('document not horizontally scrollable', overflow.scrollW <= overflow.docW + 1, `scrollW=${overflow.scrollW} docW=${overflow.docW}`);

    // Header actions within viewport
    const headerFit = await page.evaluate(() => {
        const ha = document.querySelector('.header-actions');
        const r = ha.getBoundingClientRect();
        return { right: Math.round(r.right), within: r.right <= document.documentElement.clientWidth + 1 };
    });
    check('header-actions within viewport', headerFit.within, `right=${headerFit.right}`);

    // Auth login button compact (icon-only, no visible text width blow-up)
    const authState = await page.evaluate(() => {
        const btn = document.querySelector('.auth-login-btn');
        if (!btn) return { present: false };
        const r = btn.getBoundingClientRect();
        return { present: true, width: Math.round(r.width), fontSize: getComputedStyle(btn).fontSize };
    });
    check('auth login present', authState.present);
    if (authState.present) {
        check('auth login compact (≤48px)', authState.width <= 48, `width=${authState.width}`);
    }
    await page.screenshot({ path: `${OUT}/m6fix-header.png` });

    // Flashcard hanzi ink dark + serif (not white)
    await page.evaluate(() => window.app.switchTab('practice'));
    await page.waitForTimeout(1000);
    const charState = await page.evaluate(() => {
        const c = document.querySelector('.card-character, .card-character-container .card-character');
        if (!c) return { present: false };
        const cs = getComputedStyle(c);
        return { present: true, color: cs.color, font: cs.fontFamily.slice(0, 20) };
    });
    check('flashcard char present', charState.present);
    if (charState.present) {
        // #1c1917 → rgb(28, 25, 23)
        check('flashcard ink dark (not white)', charState.color === 'rgb(28, 25, 23)', charState.color);
        check('flashcard char serif', /Serif|Songti/i.test(charState.font), charState.font);
    }
    await page.screenshot({ path: `${OUT}/m6fix-practice.png` });

    // Footer text not hidden behind fixed bottom nav (scroll to bottom first)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footerClear = await page.evaluate(() => {
        const version = document.querySelector('.app-footer .version');
        const nav = document.querySelector('.nav-container');
        if (!version || !nav) return { ok: false, reason: 'missing' };
        const vr = version.getBoundingClientRect();
        const nr = nav.getBoundingClientRect();
        // The footer text (version line) should sit above the nav top
        return { ok: vr.bottom <= nr.top + 2, versionBottom: Math.round(vr.bottom), navTop: Math.round(nr.top) };
    });
    check('footer text clears bottom nav', footerClear.ok, `versionBottom=${footerClear.versionBottom} navTop=${footerClear.navTop}`);

    await browser.close();
    console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
})();
