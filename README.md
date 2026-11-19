# Playwright Automation Portfolio

[![Playwright Tests](https://github.com/PlaywrightMasters/Playwright-Automation-Portfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/PlaywrightMasters/Playwright-Automation-Portfolio/actions/workflows/playwright.yml)

This is an end-to-end, API and BDD test suite built with **Playwright** and **TypeScript**.
It is a portfolio project that shows how a real-world automation framework is organized, beyond isolated test snippets.

The suite runs against two public demo targets, so it works with no setup:

- **UI / E2E**: [Sauce Labs demo shop](https://www.saucedemo.com)
- **API**: [DummyJSON](https://dummyjson.com), a fake REST API with real token authentication

## What this project demonstrates

| Area | Where to look |
|------|---------------|
| **Page Object Model** | [`pages/`](pages): `LoginPage`, `InventoryPage`, `ProductPage`, `CartPage`, `CheckoutPage` |
| **Component objects** (shared header and menu) | [`pages/components/HeaderComponent.ts`](pages/components/HeaderComponent.ts) |
| **Custom fixtures** (lazy Page Objects and API client) | [`fixtures/`](fixtures) |
| **One fixture set shared by specs and BDD** | [`fixtures/page-objects.ts`](fixtures/page-objects.ts), used by [`fixtures/test.ts`](fixtures/test.ts) and [`features/steps/fixtures.ts`](features/steps/fixtures.ts) |
| **BDD / Gherkin** (feature files, Scenario Outlines) | [`features/`](features), via [`playwright-bdd`](https://vitalets.github.io/playwright-bdd/) |
| **Reusable auth with `storageState`** | [`tests/auth.setup.ts`](tests/auth.setup.ts) and the `setup` project |
| **Data-driven and negative testing** | [`test-data/`](test-data): login cases, checkout validation, sort options |
| **Business-rule checks** (subtotal + 8% tax = total) | [`tests/ui/cart-checkout.spec.ts`](tests/ui/cart-checkout.spec.ts) |
| **User journeys with `test.step`** | [`tests/ui/cart-checkout.spec.ts`](tests/ui/cart-checkout.spec.ts) |
| **Network interception** (mock, simulate errors, patch, abort) | [`tests/ui/network-mocking.spec.ts`](tests/ui/network-mocking.spec.ts) |
| **Typed API client** (the API equivalent of a Page Object) | [`api/DummyJsonClient.ts`](api/DummyJsonClient.ts), [`api/types.ts`](api/types.ts) |
| **API auth with bearer tokens** | [`tests/api/auth.api.spec.ts`](tests/api/auth.api.spec.ts) |
| **API CRUD, pagination, sorting, search, 404** | [`tests/api/products.api.spec.ts`](tests/api/products.api.spec.ts) |
| **Data-consistency checks** (cart totals) | [`tests/api/carts.api.spec.ts`](tests/api/carts.api.spec.ts) |
| **Tracking a known defect** with `test.fail()` | `a token with a tampered signature is rejected` in the auth API spec |
| **Test tagging** (`@smoke`) | `npm run test:smoke` |
| **Cross-browser** (Chromium and Firefox) | `projects` in [`playwright.config.ts`](playwright.config.ts) |
| **Type safety** (strict TypeScript, `tsc` in CI) | [`tsconfig.json`](tsconfig.json), `npm run typecheck` |
| **CI/CD** | [GitHub Actions](.github/workflows/playwright.yml) and [Azure DevOps](azure-pipelines.yml) |

## Tech stack

- [Playwright Test](https://playwright.dev/) (`@playwright/test`)
- [playwright-bdd](https://vitalets.github.io/playwright-bdd/) for Gherkin feature files
- TypeScript in strict mode
- Node.js 24 (20.12 or newer works too). `.env` files are loaded with Node's built-in `process.loadEnvFile`, so there is no dotenv dependency.
- GitHub Actions and Azure Pipelines

## Project structure

```
.
├── api/                    # typed DummyJSON client and response types
├── config/env.ts           # base URLs, .env loading, storage-state path
├── pages/                  # Page Objects
│   └── components/         # shared UI components (header, menu)
├── fixtures/               # custom fixtures (Page Objects and API client)
├── test-data/              # users, products, checkout data, negative cases
├── utils/                  # helpers (money parsing in whole cents)
├── features/               # BDD: .feature files
│   └── steps/              # step definitions and BDD fixtures
├── tests/
│   ├── auth.setup.ts       # logs in once and saves the session
│   ├── ui/                 # UI / E2E specs (reuse the saved session)
│   └── api/                # API specs (request fixture, no browser)
├── playwright.config.ts    # projects, reporters, trace/screenshot/video
├── .github/workflows/      # GitHub Actions CI
└── azure-pipelines.yml     # Azure DevOps CI
```

## Getting started

```bash
# 1. Install dependencies
npm ci

# 2. Install the browsers Playwright drives
npx playwright install chromium firefox

# 3. (optional) override the target URLs
cp .env.example .env
```

## Running the tests

```bash
npm test                 # the whole suite: setup, Chromium, Firefox, API and BDD
npm run test:chromium    # UI tests in Chromium
npm run test:firefox     # UI tests in Firefox
npm run test:api         # API tests only (no browser)
npm run test:bdd         # BDD (Gherkin) scenarios only
npm run test:smoke       # only the @smoke-tagged tests
npm run test:ui          # interactive UI mode
npm run test:headed      # watch Chromium while the tests run
npm run typecheck        # strict TypeScript check
npm run report           # open the last HTML report
npm run codegen          # record selectors by clicking through the shop
```

The BDD project runs tests that are generated from the feature files into `.features-gen/` (git-ignored).
`npm test`, `test:bdd` and `test:smoke` generate them automatically. If you call `npx playwright test` directly, run `npx bddgen` first.

### Debugging a failure

- `trace: 'on-first-retry'` records a full trace when a test is retried (CI retries twice). To record one locally, run with `--trace on`, then open it:
  ```bash
  npx playwright show-trace test-results/<test-folder>/trace.zip
  ```
- Screenshots and videos are kept only for failed tests.

## Design notes

- **No hard waits.** Every check is a web-first assertion (`expect(locator)…`) that retries until its timeout. The suite never calls `waitForTimeout`.
- **Stable locators.** Locators use `getByTestId` (the config maps it to the shop's `data-test` attribute) and `getByRole`, not brittle CSS or XPath.
- **Isolated tests.** Each test gets a fresh browser context from the saved session, so tests are independent and run in parallel.
- **Log in once.** The `setup` project signs in a single time and saves `storageState`. Files that need a signed-out start override it with an empty state.
- **Expected values come from data.** Sorting tests compute the expected order from the products on screen. Checkout tests compute totals from the catalogue. Money is compared in whole cents, so floating-point rounding cannot cause flaky failures.
- **Defects are documented as tests.** DummyJSON answers a JWT with a tampered signature with `500 "invalid signature"` instead of `401`. That test is marked `test.fail()` with a `known defect` annotation, so the run stays green. If the API is fixed, Playwright reports the test as "unexpectedly passed".

## Notes and limitations

The suite targets public demo services, so its results depend on those services being available. On CI, tests retry twice to absorb occasional network hiccups. DummyJSON simulates write operations: `POST`, `PUT` and `DELETE` return realistic responses but do not change server data. In a real project the same patterns would point at the product under test and seed data through its own API.

---

*Built by Mouli Sai Chandu as a QA automation portfolio project.*
