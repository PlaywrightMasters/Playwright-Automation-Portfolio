import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Credentials } from '../test-data/users';
import type { NewProduct } from './types';

export interface ListProductsOptions {
  limit?: number;
  skip?: number;
  /** Only return these fields (plus `id`). */
  select?: readonly string[];
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Thin, typed client for the DummyJSON API — the API-side counterpart of a Page Object.
 * Tests describe intent (`api.login(...)`) instead of repeating URLs and headers.
 *
 * Methods return the raw APIResponse so a test can still assert on status codes
 * and headers. Read the body with `readJson<T>()`.
 * The base URL comes from the `api` project's `baseURL`.
 */
export class DummyJsonClient {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // --- Auth ---------------------------------------------------------------

  login(credentials: Credentials, expiresInMins = 30): Promise<APIResponse> {
    return this.request.post('/auth/login', { data: { ...credentials, expiresInMins } });
  }

  /** The profile of the token's owner. Omit the token to test the unauthenticated path. */
  currentUser(accessToken?: string): Promise<APIResponse> {
    const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return this.request.get('/auth/me', { headers });
  }

  // --- Products -----------------------------------------------------------

  getProduct(id: number): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  listProducts(options: ListProductsOptions = {}): Promise<APIResponse> {
    const params: Record<string, string | number> = {};
    if (options.limit !== undefined) params.limit = options.limit;
    if (options.skip !== undefined) params.skip = options.skip;
    if (options.select) params.select = options.select.join(',');
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.order) params.order = options.order;
    return this.request.get('/products', { params });
  }

  searchProducts(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query } });
  }

  addProduct(product: NewProduct): Promise<APIResponse> {
    return this.request.post('/products/add', { data: product });
  }

  updateProduct(id: number, changes: Partial<NewProduct>): Promise<APIResponse> {
    return this.request.put(`/products/${id}`, { data: changes });
  }

  deleteProduct(id: number): Promise<APIResponse> {
    return this.request.delete(`/products/${id}`);
  }

  // --- Carts --------------------------------------------------------------

  getUserCarts(userId: number): Promise<APIResponse> {
    return this.request.get(`/carts/user/${userId}`);
  }
}

/** Parses a JSON body into the expected type. */
export async function readJson<T>(response: APIResponse): Promise<T> {
  return (await response.json()) as T;
}
