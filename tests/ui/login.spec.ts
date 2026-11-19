import { test, expect } from '../../fixtures/test';
import { INVALID_LOGINS, USERS } from '../../test-data/users';

// Login tests must start signed OUT, so this file replaces the saved session with an empty one.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('a valid user signs in and lands on the products page', { tag: '@smoke' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(USERS.standard);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('a locked-out user is rejected with an error', async ({ loginPage, page }) => {
    await loginPage.login(USERS.lockedOut);

    await loginPage.expectError('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  // Data-driven negative cases: one test per invalid combination.
  for (const invalid of INVALID_LOGINS) {
    test(`login is rejected: ${invalid.case}`, async ({ loginPage }) => {
      await loginPage.login(invalid);

      await loginPage.expectError(invalid.expectedError);
    });
  }

  test('the error message can be dismissed', async ({ loginPage }) => {
    await loginPage.login({ username: '', password: '' });
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.dismissErrorButton.click();

    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('a signed-out visitor cannot open the products page directly', async ({ loginPage, page }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.loginButton).toBeVisible();
    await loginPage.expectError('when you are logged in');
  });
});
