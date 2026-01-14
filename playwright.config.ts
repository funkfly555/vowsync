import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for VowSync E2E Tests
 * Configured for HEADED mode with slowMo for visibility
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run sequentially for better visibility
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries - we want to see failures immediately
  workers: 1, // Single worker for headed mode visibility
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    headless: false, // HEADED mode for visibility
    launchOptions: {
      slowMo: 500, // 500ms slowdown for visibility
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // Use existing dev server
    timeout: 120000,
  },
});
