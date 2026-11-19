import { expect } from '@playwright/test';
import { SORT_OPTIONS } from '../../test-data/shop';
import { USERS } from '../../test-data/users';
import { toCents } from '../../utils/money';
import { Given, Then, When } from './fixtures';

Given('I am signed in as {string}', async ({ loginPage, page }, username: string) => {
  const user = Object.values(USERS).find((candidate) => candidate.username === username);
  if (!user) {
    throw new Error(`No test account named "${username}" in test-data/users.ts`);
  }

  await loginPage.goto();
  await loginPage.login(user);
  await expect(page).toHaveURL(/inventory\.html/);
});

When('I sort the products by {string}', async ({ inventoryPage }, label: string) => {
  const option = SORT_OPTIONS.find((candidate) => candidate.label === label);
  if (!option) {
    throw new Error(`Unknown sort option "${label}"`);
  }

  await inventoryPage.sortBy(option.value);
});

Then('the first product is {string}', async ({ inventoryPage }, name: string) => {
  await expect(inventoryPage.itemNames.first()).toHaveText(name);
});

When('I add {string} to the cart', async ({ inventoryPage }, name: string) => {
  await inventoryPage.addToCart(name);
});

Then('the cart badge shows {string}', async ({ inventoryPage }, count: string) => {
  await expect(inventoryPage.header.cartBadge).toHaveText(count);
});

When(
  'I check out as {string} {string} with postal code {string}',
  async ({ inventoryPage, cartPage, checkoutPage }, firstName: string, lastName: string, postalCode: string) => {
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation({ firstName, lastName, postalCode });
  },
);

Then('the order total is the item total plus {int}% tax', async ({ checkoutPage }, taxPercent: number) => {
  await expect(checkoutPage.total).toBeVisible();
  const { subtotal, tax, total } = await checkoutPage.readSummary();

  expect(toCents(tax)).toBe(Math.round((toCents(subtotal) * taxPercent) / 100));
  expect(toCents(total)).toBe(toCents(subtotal) + toCents(tax));
});

When('I finish the order', async ({ checkoutPage }) => {
  await checkoutPage.finish();
});

Then('I see the confirmation {string}', async ({ checkoutPage }, message: string) => {
  await expect(checkoutPage.completeHeader).toHaveText(message);
});
