#!/usr/bin/env node

const { createServer } = require('http');
const { readFileSync, existsSync, statSync } = require('fs');
const { join, extname } = require('path');
const { chromium } = require('@playwright/test');

const PORT = 3389;
const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const OUT_DIR = join(ROOT, 'assets', 'images', 'screenshots');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST, req.url.split('?')[0]);
      if (filePath.endsWith('/') || !extname(filePath)) {
        filePath = join(filePath, 'index.html');
      }
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const mime = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(readFileSync(filePath));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function capture() {
  const server = await startStaticServer();
  const browser = await chromium.launch();

  try {
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:' + PORT + '/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({
      path: join(OUT_DIR, 'screenshot-mobile.png'),
      fullPage: false,
    });
    console.log('✓ Capturado screenshot-mobile.png (390x844)');
    await mobileContext.close();

    const tabletContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto('http://localhost:' + PORT + '/', { waitUntil: 'networkidle' });
    await tabletPage.waitForTimeout(1000);
    await tabletPage.screenshot({
      path: join(OUT_DIR, 'screenshot-tablet.png'),
      fullPage: false,
    });
    console.log('✓ Capturado screenshot-tablet.png (1024x768)');
    await tabletContext.close();
  } finally {
    await browser.close();
    server.close();
  }
}

capture().catch((err) => {
  console.error('Error al generar screenshots:', err);
  process.exit(1);
});
