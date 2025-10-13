import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables for E2E testing
// 優先順位: .env.test > .env.local > .env
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : parseInt(process.env.TEST_PARALLEL_WORKERS || '4'),
  /* Global timeout for each test */
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://coupleplan.vercel.app',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Locale and timezone for consistent testing */
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - 認証セットアップを実行
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Chromium - 認証済み状態でテスト実行
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 認証済み状態を使用（オプション - 必要に応じて有効化）
        // storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // Vercel環境を使用するため、webServerは無効化
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  /* Global setup and teardown */
  globalSetup: path.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: path.resolve('./tests/e2e/global-teardown.ts'),

  /* Output directories */
  outputDir: 'test-results/',
});
