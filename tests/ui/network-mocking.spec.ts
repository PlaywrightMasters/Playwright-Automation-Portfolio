import { test, expect } from '../../fixtures/test';
import { env } from '../../config/env';

/**
 * Network interception with page.route():
 *  - fulfil a request with mocked data (deterministic UI, no backend needed)
 *  - simulate a server failure to test the error state
 *  - patch a real response on the fly
 *  - abort requests (block images) to speed up a run
 */

const PRODUCT_URL = `${env.apiUrl}/products/1`;

// The API sends CORS headers, so the mocks must send them too.
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

/**
 * A tiny product widget that loads its data from the API.
 * It stands in for an app screen whose backend call we want to control.
 */
const PRODUCT_WIDGET = `
  <main>
    <h1 data-test="product-title">Loading…</h1>
    <p data-test="product-price"></p>
    <p data-test="product-error" role="alert" hidden></p>
  </main>
  <script>
    const title = document.querySelector('[data-test="product-title"]');
    const price = document.querySelector('[data-test="product-price"]');
    const error = document.querySelector('[data-test="product-error"]');
    fetch(${JSON.stringify(PRODUCT_URL)})
      .then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then((product) => {
        title.textContent = product.title;
        price.textContent = '$' + product.price.toFixed(2);
      })
      .catch(() => {
        title.textContent = '';
        error.hidden = false;
        error.textContent = 'Could not load the product. Please try again.';
      });
  </script>`;

test.describe('Network interception', () => {
  test('renders mocked API data without calling the real backend', async ({ page }) => {
    const mockedProduct = { id: 1, title: 'Mocked Mechanical Keyboard', price: 49.5 };
    let mockHits = 0;

    // route.fulfill() answers the request inside the browser, so it never reaches the network.
    await page.route(PRODUCT_URL, (route) => {
      mockHits += 1;
      return route.fulfill({ status: 200, headers: CORS_HEADERS, json: mockedProduct });
    });
    await page.setContent(PRODUCT_WIDGET);

    await expect(page.getByTestId('product-title')).toHaveText(mockedProduct.title);
    await expect(page.getByTestId('product-price')).toHaveText('$49.50');
    expect(mockHits).toBe(1);
  });

  test('shows an error state when the API returns 500', async ({ page }) => {
    await page.route(PRODUCT_URL, (route) =>
      route.fulfill({ status: 500, headers: CORS_HEADERS, json: { message: 'Internal Server Error' } }),
    );
    await page.setContent(PRODUCT_WIDGET);

    await expect(page.getByRole('alert')).toHaveText('Could not load the product. Please try again.');
    await expect(page.getByTestId('product-title')).toBeEmpty();
  });

  test('patches a real API response before the page receives it', async ({ page }) => {
    await page.route(PRODUCT_URL, async (route) => {
      const response = await route.fetch();
      const product = await response.json();
      await route.fulfill({ response, json: { ...product, title: `[PATCHED] ${product.title}` } });
    });
    await page.setContent(PRODUCT_WIDGET);

    await expect(page.getByTestId('product-title')).toHaveText(/^\[PATCHED\] .+/);
    await expect(page.getByTestId('product-price')).toHaveText(/^\$\d+\.\d{2}$/);
  });

  test('blocks images and the shop still works', async ({ inventoryPage }) => {
    let blockedImages = 0;
    await inventoryPage.page.route(/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/, (route) => {
      blockedImages += 1;
      return route.abort();
    });

    await inventoryPage.goto();

    await expect(inventoryPage.items).toHaveCount(6);
    await expect.poll(() => blockedImages).toBeGreaterThan(0);
  });
});
