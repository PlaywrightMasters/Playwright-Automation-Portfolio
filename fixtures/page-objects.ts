import type { Fixtures, PlaywrightTestArgs } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';

export type PageObjects = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

/**
 * Page Object fixtures, defined once and shared by the plain specs (`fixtures/test.ts`)
 * and the BDD steps (`features/steps/fixtures.ts`).
 * Fixtures are lazy: a Page Object is only built when a test asks for it.
 */
export const pageObjectFixtures: Fixtures<PageObjects, {}, PlaywrightTestArgs> = {
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
};
