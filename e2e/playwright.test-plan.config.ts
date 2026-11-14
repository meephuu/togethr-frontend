import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './helpers/env';

// The whole test plan (TC01–TC71): npm run test:plan. Results go to
// results/test-plan-results.md. The demo specs use playwright.config.ts instead.
export default defineConfig({
  testDir: './tests/test-plan',
  globalSetup: require.resolve('./helpers/plan/global-setup'),
  globalTeardown: require.resolve('./helpers/plan/global-teardown'),

  // The specs run in the plan's order (01-us1-1 ... 08-us6-4) and share state,
  // so one worker, each file serial, and no retries.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  timeout: 120_000,
  expect: { timeout: 10_000 },

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
