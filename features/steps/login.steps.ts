import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I sign in as {string} with password {string}', async ({ loginPage }, username: string, password: string) => {
  await loginPage.login({ username, password });
});

Then('I see the products page', async ({ inventoryPage, page }) => {
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(inventoryPage.title).toHaveText('Products');
});

Then('I see the login error {string}', async ({ loginPage }, error: string) => {
  await loginPage.expectError(error);
});
