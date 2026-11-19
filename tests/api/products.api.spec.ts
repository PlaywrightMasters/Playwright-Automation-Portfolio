import { test, expect } from '../../fixtures/test';
import { readJson } from '../../api/DummyJsonClient';
import type { DeletedProduct, ErrorBody, Product, ProductPage } from '../../api/types';

/**
 * CRUD, pagination, search and negative cases for the products resource.
 * Note: DummyJSON simulates writes, so POST/PUT/DELETE return realistic
 * responses without changing the server's data.
 */
test.describe('Products API', () => {
  test('GET /products/:id returns a product with the expected schema', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.getProduct(1);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const product = await readJson<Product>(response);
    expect(product).toMatchObject({
      id: 1,
      title: expect.any(String),
      description: expect.any(String),
      category: expect.any(String),
      price: expect.any(Number),
      stock: expect.any(Number),
      rating: expect.any(Number),
    });
    expect(product.price).toBeGreaterThan(0);
  });

  test('pagination honours limit, skip and select', async ({ api }) => {
    const response = await api.listProducts({ limit: 5, skip: 10, select: ['title', 'price'] });

    expect(response.ok()).toBeTruthy();
    const page = await readJson<ProductPage<Pick<Product, 'id' | 'title' | 'price'>>>(response);
    expect(page).toMatchObject({ limit: 5, skip: 10 });
    expect(page.products).toHaveLength(5);
    expect(page.products.map((product) => product.id)).toEqual([11, 12, 13, 14, 15]);
    for (const product of page.products) {
      expect(Object.keys(product).sort()).toEqual(['id', 'price', 'title']);
    }
  });

  test('sorting by price ascending returns non-decreasing prices', async ({ api }) => {
    const response = await api.listProducts({ sortBy: 'price', order: 'asc', limit: 30, select: ['price'] });

    expect(response.ok()).toBeTruthy();
    const prices = (await readJson<ProductPage>(response)).products.map((product) => product.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('search returns only matching products', async ({ api }) => {
    const query = 'iphone';

    const response = await api.searchProducts(query);

    expect(response.ok()).toBeTruthy();
    const result = await readJson<ProductPage>(response);
    expect(result.products.length).toBeGreaterThan(0);
    for (const product of result.products) {
      expect(`${product.title} ${product.description}`.toLowerCase()).toContain(query);
    }
  });

  test('POST /products/add creates a product (201)', async ({ api }) => {
    const newProduct = { title: 'Playwright Coffee Mug', price: 12.5, category: 'kitchen-accessories' };

    const response = await api.addProduct(newProduct);

    expect(response.status()).toBe(201);
    const created = await readJson<Product>(response);
    expect(created).toMatchObject(newProduct);
    expect(created.id).toEqual(expect.any(Number));
  });

  test('PUT /products/:id updates only the given fields', async ({ api }) => {
    const response = await api.updateProduct(1, { title: 'Updated by Playwright' });

    expect(response.status()).toBe(200);
    const updated = await readJson<Product>(response);
    expect(updated).toMatchObject({ id: 1, title: 'Updated by Playwright', price: expect.any(Number) });
  });

  test('DELETE /products/:id marks the product as deleted', async ({ api }) => {
    const response = await api.deleteProduct(1);

    expect(response.status()).toBe(200);
    const deleted = await readJson<DeletedProduct>(response);
    expect(deleted).toMatchObject({ id: 1, isDeleted: true });
    expect(Number.isNaN(Date.parse(deleted.deletedOn))).toBe(false);
  });

  test('an unknown product id returns 404 with a message', async ({ api }) => {
    const response = await api.getProduct(999_999);

    expect(response.status()).toBe(404);
    expect((await readJson<ErrorBody>(response)).message).toContain('999999');
  });
});
