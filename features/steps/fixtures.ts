import { test as base, createBdd } from 'playwright-bdd';
import { pageObjectFixtures, type PageObjects } from '../../fixtures/page-objects';

/**
 * BDD test instance: playwright-bdd's test plus the same Page Object fixtures
 * the plain specs use, so steps receive `loginPage`, `inventoryPage`, etc.
 * This file is matched by the `steps` glob in playwright.config.ts.
 */
export const test = base.extend<PageObjects>(pageObjectFixtures);

export const { Given, When, Then } = createBdd(test);
