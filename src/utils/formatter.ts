/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number | undefined): string {
  if (!num) return 'N/A';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format time in seconds to human-readable string
 */
export function formatTimeAgo(seconds: number): string {
  if (seconds < 10) return 'just now';
  if (seconds === 1) return '1 second ago';
  return `${seconds} seconds ago`;
}

/**
 * Format price with appropriate precision
 */
export function formatPrice(price: string | undefined): string {
  if (!price) return 'N/A';
  const num = parseFloat(price);
  if (isNaN(num)) return 'N/A';
  if (num < 0.00001) return `$${num.toExponential(2)}`;
  return `$${num.toFixed(6)}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
