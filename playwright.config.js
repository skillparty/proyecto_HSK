// E2E contra el build de producción (dist/), no contra el código fuente:
// valida también el pipeline de cache-busting y las exclusiones del dist.
// Correr con: npm run test:e2e (hace el build primero).

const { defineConfig, devices } = require("@playwright/test");

const PORT = 3373;

module.exports = defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx serve dist -p ${PORT} -n`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
