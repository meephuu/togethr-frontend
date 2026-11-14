import { defineConfig, devices } from '@playwright/test';
import { BASE_URL } from './helpers/env';

export default defineConfig({
  testDir: './tests',
  // The full test plan has its own config (playwright.test-plan.config.ts, npm run test:plan)
  testIgnore: '**/test-plan/**',
  globalSetup: require.resolve('./global-setup'),

  // The specs share one account and run in a fixed order: login.spec.ts needs
  // somchai's original password, and password-reset.spec.ts (TC31) changes it.
  // One worker runs the files alphabetically and each file top to bottom.
  fullyParallel: false,
  workers: 1,
  // A retry would replay TC31 with an already-used reset link, so never retry.
  retries: 0,

  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [['list'], ['html', { open: 'never' }]],

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
