import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env');

// Load a local .env (when present) with Node's built-in loader, so no dotenv dependency is needed.
if (existsSync(ENV_FILE)) {
  process.loadEnvFile(ENV_FILE);
}

/** Runtime settings. Every value can be overridden through environment variables or `.env`. */
export const env = {
  /** UI / E2E target: the public Sauce Labs demo shop. */
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  /** API target: the public DummyJSON fake REST API. */
  apiUrl: process.env.API_URL || 'https://dummyjson.com',
  isCI: !!process.env.CI,
} as const;

/** Saved browser session written by the `setup` project and reused by the UI projects. */
export const STORAGE_STATE = path.join(ROOT_DIR, 'playwright', '.auth', 'standard-user.json');
