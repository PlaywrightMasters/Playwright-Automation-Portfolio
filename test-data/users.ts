/**
 * Accounts for the Sauce Labs demo shop (https://www.saucedemo.com).
 * These are the shop's public demo credentials, so they are safe to keep in the repository.
 */

export interface Credentials {
  username: string;
  password: string;
}

const DEMO_PASSWORD = 'secret_sauce';

export const USERS = {
  standard: { username: 'standard_user', password: DEMO_PASSWORD },
  lockedOut: { username: 'locked_out_user', password: DEMO_PASSWORD },
} as const satisfies Record<string, Credentials>;

/**
 * Negative login cases, chosen by equivalence partitioning:
 * a missing username, a missing password, a wrong password and an unknown user.
 */
export const INVALID_LOGINS: ReadonlyArray<Credentials & { case: string; expectedError: string }> = [
  {
    case: 'empty username',
    username: '',
    password: DEMO_PASSWORD,
    expectedError: 'Username is required',
  },
  {
    case: 'empty password',
    username: USERS.standard.username,
    password: '',
    expectedError: 'Password is required',
  },
  {
    case: 'wrong password',
    username: USERS.standard.username,
    password: 'not_the_password',
    expectedError: 'Username and password do not match any user',
  },
  {
    case: 'unknown user',
    username: 'no_such_user',
    password: DEMO_PASSWORD,
    expectedError: 'Username and password do not match any user',
  },
];

/** Public demo account of the DummyJSON API (https://dummyjson.com/docs/auth). */
export const API_USER = {
  username: 'emilys',
  password: 'emilyspass',
} as const satisfies Credentials;
