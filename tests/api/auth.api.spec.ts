import { test, expect } from '../../fixtures/test';
import { readJson } from '../../api/DummyJsonClient';
import type { AuthSession, AuthUser, ErrorBody } from '../../api/types';
import { API_USER } from '../../test-data/users';

/**
 * Token-based authentication against DummyJSON:
 * log in, use the bearer token, and check the negative paths.
 */
test.describe('Auth API', () => {
  test('login returns access and refresh tokens', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.login(API_USER);

    expect(response.status()).toBe(200);
    const session = await readJson<AuthSession>(response);
    expect(session).toMatchObject({
      id: expect.any(Number),
      username: API_USER.username,
      email: expect.stringContaining('@'),
    });
    // A JWT has three dot-separated, base64url-encoded parts.
    expect(session.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(session.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  test('the access token identifies the signed-in user', async ({ api }) => {
    const session = await readJson<AuthSession>(await api.login(API_USER));

    const response = await api.currentUser(session.accessToken);

    expect(response.status()).toBe(200);
    const user = await readJson<AuthUser>(response);
    expect(user).toMatchObject({ id: session.id, username: API_USER.username, email: session.email });
  });

  test('login with a wrong password is rejected with 400', async ({ api }) => {
    const response = await api.login({ username: API_USER.username, password: 'wrong-password' });

    expect(response.status()).toBe(400);
    expect(await readJson<ErrorBody>(response)).toEqual({ message: 'Invalid credentials' });
  });

  test('the profile endpoint requires a token (401)', async ({ api }) => {
    const response = await api.currentUser();

    expect(response.status()).toBe(401);
    expect((await readJson<ErrorBody>(response)).message).toMatch(/token is required/i);
  });

  test('a malformed token is rejected (401)', async ({ api }) => {
    const response = await api.currentUser('not-a-real-token');

    expect(response.status()).toBe(401);
    expect((await readJson<ErrorBody>(response)).message).toMatch(/invalid|expired/i);
  });

  test(
    'a token with a tampered signature is rejected (401)',
    {
      annotation: {
        type: 'known defect',
        description: 'DummyJSON answers 500 "invalid signature" instead of 401 (observed 2026-11-19).',
      },
    },
    async ({ api }) => {
      // Expected to fail while the defect exists. Playwright reports it as "unexpectedly passed" once it is fixed.
      test.fail();
      const session = await readJson<AuthSession>(await api.login(API_USER));

      const response = await api.currentUser(tamperSignature(session.accessToken));

      expect(response.status()).toBe(401);
    },
  );
});

/** Changes one character of a JWT's signature, so the header and payload still decode. */
function tamperSignature(jwt: string): string {
  const [header, payload, signature = ''] = jwt.split('.');
  const flipped = signature.startsWith('A') ? `B${signature.slice(1)}` : `A${signature.slice(1)}`;
  return [header, payload, flipped].join('.');
}
