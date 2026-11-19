/**
 * Money helpers. Prices are compared in whole cents so that floating-point
 * rounding (0.1 + 0.2 !== 0.3) cannot make an assertion flaky.
 */

/** Extracts the amount from text such as "$29.99", "$1,299.99" or "Item total: $39.98". */
export function parseMoney(text: string): number {
  const match = /\$(\d[\d,]*(?:\.\d{1,2})?)/.exec(text);
  if (!match?.[1]) {
    throw new Error(`No dollar amount found in "${text}"`);
  }
  return Number(match[1].replaceAll(',', ''));
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Formats an amount the way the shop shows it, e.g. 9.5 -> "$9.50". */
export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
