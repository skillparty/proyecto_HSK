// Mobile UX audit: capture 375px screenshots of every key surface
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1800);

    const shoot = async (name) => {
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${OUT}/m6-${name}.png`, fullPage: false });
        console.log(`shot ${name}`);
    };

    await shoot('practice-initial');

    for (const tab of ['home', 'browse', 'quiz', 'stats']) {
        await page.evaluate((t) => window.app.switchTab(t), tab);
        await shoot(tab);
    }

    // Practice again, scroll to see input + footer
    await page.evaluate(() => window.app.switchTab('practice'));
    await page.waitForTimeout(800);
    await page.evaluate(() => {
        const p = document.querySelector('.tab-panel.active');
        if (p) p.scrollTop = p.scrollHeight;
    });
    await shoot('practice-bottom');

    // Diagnostics: overflow detection
    const overflow = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const offenders = [];
        document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > docW + 1 || r.left < -1)) {
                offenders.push({
                    sel: (el.className && el.className.toString().slice(0, 40)) || el.tagName,
                    right: Math.round(r.right),
                    left: Math.round(r.left),
                });
            }
        });
        // dedupe by sel
        const seen = new Set();
        return { docW, offenders: offenders.filter(o => { if (seen.has(o.sel)) return false; seen.add(o.sel); return true; }).slice(0, 20) };
    });
    console.log(JSON.stringify(overflow, null, 2));

    await browser.close();
})();
