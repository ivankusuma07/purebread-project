import { defineConfig, devices } from '@playwright/test';

// Every run is recorded: video, trace and a screenshot per test, kept in
// e2e/results, with HTML and JSON reports in e2e/report. CI uploads both.
// E2E_BASE_URL points the suite at a preview or production deploy (the
// @smoke tests are meant for that); otherwise it builds and starts locally.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3200';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/results',
  fullyParallel: true,
  // The first wave starts every browser at once with video recording on, so a
  // cold page load can take 25 to 30s on a laptop. 60s keeps that from flaking.
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/report/html', open: 'never' }],
    ['json', { outputFile: 'e2e/report/results.json' }],
  ],
  use: {
    baseURL,
    video: 'on',
    trace: 'on',
    screenshot: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start --port 3200',
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
      },
});
