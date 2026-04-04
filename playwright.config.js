import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://mydevpod.me',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    headless: false,
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { headless: true },
    },
    {
      name: 'e2e-public',
      testDir: './tests/e2e/public',
    },
    {
      name: 'e2e-auth',
      testDir: './tests/e2e/auth',
    },
  ],
});
