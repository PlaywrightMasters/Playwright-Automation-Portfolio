import { test as base } from '@playwright/test';
import { DummyJsonClient } from '../api/DummyJsonClient';
import { pageObjectFixtures, type PageObjects } from './page-objects';

type ApiFixtures = {
  /** Typed DummyJSON client built on the request fixture (no browser needed). */
  api: DummyJsonClient;
};

/**
 * The project's `test`: Playwright's test plus Page Object and API fixtures.
 * Specs import `test` and `expect` from here instead of from '@playwright/test'.
 */
export const test = base.extend<PageObjects & ApiFixtures>({
  ...pageObjectFixtures,
  api: async ({ request }, use) => {
    await use(new DummyJsonClient(request));
  },
});

export { expect } from '@playwright/test';
