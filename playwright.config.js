import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3005',
  },
  webServer: {
    command: 'npm run serve -- --port 3005',
    url: 'http://localhost:3005',
    reuseExistingServer: !process.env.CI,
  },
});
