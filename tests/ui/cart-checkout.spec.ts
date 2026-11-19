import { test, expect } from '../../fixtures/test';
import { CHECKOUT_VALIDATION, CUSTOMER, PRODUCTS, TAX_RATE } from '../../test-data/shop';
import { toCents } from '../../utils/money';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack.name);
    await inventoryPage.addToCart(PRODUCTS.boltTShirt.name);
  });

  test('the cart lists the products that were added', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.header.openCart();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemNames).toHaveText([PRODUCTS.backpack.name, PRODUCTS.boltTShirt.name]);
  });

  test('removing a product from the cart updates the list and badge', async ({ cartPage }) => {
    await cartPage.goto();

    await cartPage.remove(PRODUCTS.backpack.name);

    await expect(cartPage.itemNames).toHaveText([PRODUCTS.boltTShirt.name]);
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test('the cart keeps its items after "Continue Shopping"', async ({ cartPage, inventoryPage }) => {
    await cartPage.goto();
    await cartPage.continueShopping();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.header.cartBadge).toHaveText('2');
  });
});

test.describe('Checkout', () => {
  test('completes an order with correct totals', { tag: '@smoke' }, async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    const products = [PRODUCTS.backpack, PRODUCTS.bikeLight];

    await test.step('add two products to the cart', async () => {
      await inventoryPage.goto();
      for (const product of products) {
        await inventoryPage.addToCart(product.name);
      }
      await expect(inventoryPage.header.cartBadge).toHaveText(String(products.length));
    });

    await test.step('review the cart and enter customer details', async () => {
      await inventoryPage.header.openCart();
      await expect(cartPage.items).toHaveCount(products.length);
      await cartPage.checkout();
      await checkoutPage.fillInformation(CUSTOMER);
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('the overview shows the correct subtotal, tax and total', async () => {
      await expect(checkoutPage.items).toHaveCount(products.length);
      const expectedSubtotalCents = products.reduce((sum, product) => sum + toCents(product.price), 0);

      const summary = await checkoutPage.readSummary();

      expect(toCents(summary.subtotal)).toBe(expectedSubtotalCents);
      expect(toCents(summary.tax)).toBe(Math.round(expectedSubtotalCents * TAX_RATE));
      expect(toCents(summary.total)).toBe(toCents(summary.subtotal) + toCents(summary.tax));
    });

    await test.step('finishing confirms the order and empties the cart', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(inventoryPage.header.cartBadge).toBeHidden();
    });
  });

  // Data-driven form validation: every required field is checked on its own.
  for (const { missing, customer, expectedError } of CHECKOUT_VALIDATION) {
    test(`checkout requires ${missing}`, async ({ inventoryPage, cartPage, checkoutPage, page }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(PRODUCTS.bikeLight.name);
      await cartPage.goto();
      await cartPage.checkout();

      await checkoutPage.fillInformation(customer);

      await expect(checkoutPage.errorMessage).toContainText(expectedError);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
