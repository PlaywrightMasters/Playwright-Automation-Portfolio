import type { Locator, Page } from '@playwright/test';
import type { SortValue } from '../test-data/shop';
import { HeaderComponent } from './components/HeaderComponent';

/** Page Object for the product list (inventory) page. */
export class InventoryPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** The product card whose visible name matches `name`. */
  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(name: string): Promise<void> {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async sortBy(value: SortValue): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }
}
