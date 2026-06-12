// Quick UX audit screenshots: home, practice, browse, quiz, games, desktop + mobile
const { chromium } = require('playwright');

const BASE = 'http://localhost:8742/index.html';
const OUT = '/tmp/hsk_audit';

async function shoot(page, name) {
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(`saved ${name}`);
}

(async () => {
    const fs = require('fs');
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await chromium.launch();

    // Desktop
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await shoot(page, 'desktop-initial');

    for (const tab of ['home', 'browse', 'quiz', 'stats']) {
        await page.evaluate((t) => {
            const btn = document.querySelector(`[data-tab="${t}"]`);
            if (btn) btn.click();
            else if (window.app?.switchTab) window.app.switchTab(t);
        }, tab);
        await shoot(page, `desktop-${tab}`);
    }

    // Mobile
    const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mobile.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await shoot(mobile, 'mobile-initial');

    await browser.close();
})();
