import { test, expect } from '../../fixtures/test';
import { PRODUCTS, SORT_OPTIONS } from '../../test-data/shop';
import { formatMoney, parseMoney } from '../../utils/money';

/**
 * These tests reuse the saved session (storageState),
 * so they open the products page directly without logging in.
 */
test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('a signed-in user sees all six products', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  // Data-driven sorting: compute the expected order from the products on screen,
  // then let the web-first assertion wait until the list matches it.
  for (const option of SORT_OPTIONS) {
    test(`sorting by "${option.label}" orders the products correctly`, async ({ inventoryPage }) => {
      const sign = option.direction === 'asc' ? 1 : -1;
      // Start from the opposite order, so the assertion only passes if the sort really reorders the list
      // (the default order already equals "Name (A to Z)").
      await inventoryPage.sortBy(option.reverse);
      await expect(inventoryPage.sortDropdown).toHaveValue(option.reverse);

      if (option.by === 'name') {
        const names = await inventoryPage.itemNames.allInnerTexts();
        const expected = [...names].sort((a, b) => sign * a.localeCompare(b));

        await inventoryPage.sortBy(option.value);
        await expect(inventoryPage.itemNames).toHaveText(expected);
      } else {
        const prices = (await inventoryPage.itemPrices.allInnerTexts()).map(parseMoney);
        const expected = [...prices].sort((a, b) => sign * (a - b)).map(formatMoney);

        await inventoryPage.sortBy(option.value);
        await expect(inventoryPage.itemPrices).toHaveText(expected);
      }

      await expect(inventoryPage.sortDropdown).toHaveValue(option.value);
    });
  }

  test('adding and removing a product updates the cart badge', async ({ inventoryPage }) => {
    const { header } = inventoryPage;
    await expect(header.cartBadge).toBeHidden();

    await inventoryPage.addToCart(PRODUCTS.backpack.name);
    await inventoryPage.addToCart(PRODUCTS.bikeLight.name);
    await expect(header.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(PRODUCTS.backpack.name);
    await expect(header.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart(PRODUCTS.bikeLight.name);
    await expect(header.cartBadge).toBeHidden();
  });

  test('a product page shows the same name and price as the list', async ({ inventoryPage, productPage, page }) => {
    const product = PRODUCTS.fleeceJacket;

    await inventoryPage.openProduct(product.name);

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(productPage.name).toHaveText(product.name);
    await expect(productPage.price).toHaveText(formatMoney(product.price));
    await expect(productPage.description).not.toBeEmpty();

    await productPage.addToCart();
    await expect(productPage.header.cartBadge).toHaveText('1');
    await expect(productPage.removeButton).toBeVisible();

    await productPage.backToProducts();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('the user can log out from the menu', async ({ inventoryPage, loginPage, page }) => {
    await inventoryPage.header.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
