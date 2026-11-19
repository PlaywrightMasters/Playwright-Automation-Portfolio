import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env, STORAGE_STATE } from './config/env';

/**
 * Central Playwright configuration.
 * Docs: https://playwright.dev/docs/test-configuration
 */

// BDD: turn Gherkin .feature files + step definitions into runnable Playwright tests.
// `npx bddgen` writes the generated specs into `.features-gen/` before a run.
// The steps glob also covers the BDD fixtures file, so steps receive the Page Object fixtures.
const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
});

export default defineConfig({
  // Run tests inside every file in parallel.
  fullyParallel: true,
  // Fail the CI build if test.only was left in the source by accident.
  forbidOnly: env.isCI,
  // Retry only on CI to absorb occasional network hiccups of the public demo services.
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: env.isCI
    ? [['list'], ['junit', { outputFile: 'results.xml' }], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseUrl,
    // The demo shop exposes stable `data-test` attributes, so getByTestId() reads them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1) Log in once and save the session for the browser projects.
    {
      name: 'setup',
      testDir: './tests',
      testMatch: 'auth.setup.ts',
    },

    // 2) UI tests reuse the saved session, so they skip the login form.
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // 3) API tests use the request fixture only: no browser and no UI session.
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiUrl },
    },

    // 4) BDD scenarios generated from the Gherkin features. They log in through their own steps.
    {
      name: 'bdd',
      testDir: bddTestDir,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
