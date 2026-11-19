import { test, expect } from '../../fixtures/test';
import { readJson } from '../../api/DummyJsonClient';
import type { CartPage } from '../../api/types';
import { toCents } from '../../utils/money';

/**
 * Data-consistency checks: the totals a cart reports must agree with its own lines.
 * Amounts are compared in whole cents to avoid floating-point noise.
 */
test.describe('Carts API', () => {
  test("a user's carts belong to that user and their totals add up", async ({ api }) => {
    const userId = 1;

    const response = await api.getUserCarts(userId);

    expect(response.ok()).toBeTruthy();
    const { carts } = await readJson<CartPage>(response);
    expect(carts.length).toBeGreaterThan(0);

    for (const cart of carts) {
      expect(cart.userId).toBe(userId);
      expect(cart.totalProducts).toBe(cart.products.length);
      expect(cart.totalQuantity).toBe(cart.products.reduce((sum, line) => sum + line.quantity, 0));

      for (const line of cart.products) {
        expect(toCents(line.total), `line total of "${line.title}"`).toBe(toCents(line.price * line.quantity));
      }
      const linesTotalCents = cart.products.reduce((sum, line) => sum + toCents(line.total), 0);
      expect(toCents(cart.total)).toBe(linesTotalCents);
    }
  });

  test('the API answers within the response-time budget', async ({ api }) => {
    const budgetMs = 3_000;
    const startedAt = performance.now();

    const response = await api.getUserCarts(1);

    expect(response.ok()).toBeTruthy();
    expect(performance.now() - startedAt).toBeLessThan(budgetMs);
  });
});
