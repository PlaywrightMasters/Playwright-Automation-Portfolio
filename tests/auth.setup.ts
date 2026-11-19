import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../config/env';
import { LoginPage } from '../pages/LoginPage';
import { USERS } from '../test-data/users';

/**
 * Authentication setup: log in once and save the session (cookies + localStorage),
 * so the UI projects start already signed in instead of logging in for every test.
 * Docs: https://playwright.dev/docs/auth
 */
setup('authenticate as the standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard);

  // Save the session only after reaching the signed-in area.
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByTestId('title')).toHaveText('Products');

  await page.context().storageState({ path: STORAGE_STATE });
});
