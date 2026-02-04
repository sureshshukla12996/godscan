/**
 * Token tracker service for duplicate prevention
 */
export class TokenTracker {
  private sentTokens: Map<string, number> = new Map();
  private readonly CLEANUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if token has already been sent
   */
  hasSent(tokenAddress: string): boolean {
    return this.sentTokens.has(tokenAddress);
  }

  /**
   * Mark token as sent
   */
  markAsSent(tokenAddress: string): void {
    this.sentTokens.set(tokenAddress, Date.now());
  }

  /**
   * Clean up old entries (older than 5 minutes)
   */
  cleanup(): void {
    const threshold = Date.now() - this.CLEANUP_THRESHOLD_MS;
    let removedCount = 0;

    for (const [address, timestamp] of this.sentTokens.entries()) {
      if (timestamp < threshold) {
        this.sentTokens.delete(address);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old tracker entries`);
    }
  }

  /**
   * Get the number of tracked tokens
   */
  getTrackedCount(): number {
    return this.sentTokens.size;
  }
}
