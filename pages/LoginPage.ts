import { expect, type Locator, type Page } from '@playwright/test';
import type { Credentials } from '../test-data/users';

/** Page Object for the login screen. */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly dismissErrorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.dismissErrorButton = page.getByTestId('error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login({ username, password }: Credentials): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }
}
