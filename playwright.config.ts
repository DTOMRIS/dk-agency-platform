import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // TASK-0508: e2e/*.test.ts are plain tsx scripts that call process.exit() at import time;
  // collecting them killed the run with exit 0 before any spec ran. They run in dk:validate [8a].
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    // Sandbox/CI-da hazır Chromium-u işlətmək üçün (playwright install qadağandır); boşdursa təsirsiz.
    ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}),
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
