/** Catalogue and checkout data for the Sauce Labs demo shop. */

export interface Product {
  name: string;
  price: number;
}

export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
} as const satisfies Record<string, Product>;

/**
 * The shop's sort dropdown values and how each one should order the product list.
 * `reverse` is the opposite order, used to put the list in a known different state first.
 */
export const SORT_OPTIONS = [
  { value: 'az', reverse: 'za', label: 'Name (A to Z)', by: 'name', direction: 'asc' },
  { value: 'za', reverse: 'az', label: 'Name (Z to A)', by: 'name', direction: 'desc' },
  { value: 'lohi', reverse: 'hilo', label: 'Price (low to high)', by: 'price', direction: 'asc' },
  { value: 'hilo', reverse: 'lohi', label: 'Price (high to low)', by: 'price', direction: 'desc' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
export type SortValue = SortOption['value'];

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CUSTOMER: Customer = {
  firstName: 'Asha',
  lastName: 'Rao',
  postalCode: '500081',
};

/** Checkout form validation: each case leaves one required field empty. */
export const CHECKOUT_VALIDATION: ReadonlyArray<{ missing: keyof Customer; customer: Customer; expectedError: string }> = [
  {
    missing: 'firstName',
    customer: { ...CUSTOMER, firstName: '' },
    expectedError: 'First Name is required',
  },
  {
    missing: 'lastName',
    customer: { ...CUSTOMER, lastName: '' },
    expectedError: 'Last Name is required',
  },
  {
    missing: 'postalCode',
    customer: { ...CUSTOMER, postalCode: '' },
    expectedError: 'Postal Code is required',
  },
];

/** Sales tax rate the demo shop applies at checkout. */
export const TAX_RATE = 0.08;
