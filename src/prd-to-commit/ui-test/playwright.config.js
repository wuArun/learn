const { defineConfig } = require('@playwright/test');
const ConfigLoader = require('./utils/config-loader');

const config = ConfigLoader.load();
const envConfig = config.environments[config.defaultEnvironment];

module.exports = defineConfig({
  testDir: './tests/modules',
  testMatch: '**/*.spec.js',
  timeout: envConfig.timeout || 60000,
  expect: {
    timeout: config.timeouts.element || 10000
  },
  fullyParallel: false,
  retries: config.retry?.maxRetries || 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: envConfig.baseUrl,
    viewport: config.browser.viewport || { width: 1920, height: 1080 },
    headless: config.browser.headless !== false,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: config.timeouts.element || 15000,
    navigationTimeout: config.timeouts.navigation || 60000
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
});
