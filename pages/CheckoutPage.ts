import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../test-data/shop';
import { parseMoney } from '../utils/money';

/**
 * Page Object for the whole checkout flow:
 * step one (customer information), step two (overview) and the confirmation page.
 */
export class CheckoutPage {
  readonly page: Page;
  // Step one: customer information
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;
  // Step two: overview
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // Confirmation
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.errorMessage = page.getByTestId('error');
    this.items = page.getByTestId('inventory-item');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation({ firstName, lastName, postalCode }: Customer): Promise<void> {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
  }

  /** Reads the subtotal, tax and total amounts shown on the overview step. */
  async readSummary(): Promise<{ subtotal: number; tax: number; total: number }> {
    return {
      subtotal: parseMoney(await this.subtotal.innerText()),
      tax: parseMoney(await this.tax.innerText()),
      total: parseMoney(await this.total.innerText()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
