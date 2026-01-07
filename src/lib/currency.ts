// EUR to BGN fixed exchange rate (official rate)
export const EUR_TO_BGN_RATE = 1.9558;

/**
 * Format price in both EUR and BGN
 * @param priceInBGN - Price in Bulgarian Lev
 * @returns Formatted string with EUR first, then BGN
 */
export function formatDualCurrency(priceInBGN: number): string {
  const priceInEUR = priceInBGN / EUR_TO_BGN_RATE;
  return `${priceInEUR.toFixed(2)} € / ${priceInBGN.toFixed(2)} лв.`;
}

/**
 * Format price in EUR only
 * @param priceInBGN - Price in Bulgarian Lev
 * @returns Formatted string in EUR
 */
export function formatEUR(priceInBGN: number): string {
  const priceInEUR = priceInBGN / EUR_TO_BGN_RATE;
  return `${priceInEUR.toFixed(2)} €`;
}

/**
 * Format price in BGN only
 * @param priceInBGN - Price in Bulgarian Lev
 * @returns Formatted string in BGN
 */
export function formatBGN(priceInBGN: number): string {
  return `${priceInBGN.toFixed(2)} лв.`;
}

/**
 * Convert EUR threshold to BGN for comparison
 * Free shipping threshold is 100 EUR
 */
export const FREE_SHIPPING_THRESHOLD_EUR = 100;
export const FREE_SHIPPING_THRESHOLD_BGN = FREE_SHIPPING_THRESHOLD_EUR * EUR_TO_BGN_RATE;
