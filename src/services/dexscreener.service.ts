import axios from 'axios';
import { DexScreenerResponse, DexScreenerPair } from '../types/dexscreener.types';

const API_URL = 'https://api.dexscreener.com/latest/dex/pairs/solana';

/**
 * Fetch and filter fresh tokens from DexScreener
 */
export class DexScreenerService {
  private maxTokenAgeSeconds: number;
  private minLiquidityUsd: number;

  constructor(maxTokenAgeSeconds: number, minLiquidityUsd: number) {
    this.maxTokenAgeSeconds = maxTokenAgeSeconds;
    this.minLiquidityUsd = minLiquidityUsd;
  }

  /**
   * Fetch all Solana pairs from DexScreener API
   */
  async fetchAllPairs(): Promise<DexScreenerPair[]> {
    try {
      const response = await axios.get<DexScreenerResponse>(API_URL, {
        timeout: 10000,
      });

      if (!response.data || !response.data.pairs) {
        console.log('⚠️  Invalid API response structure');
        return [];
      }

      return response.data.pairs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(`❌ API request failed: ${error.message}`);
      } else {
        console.log(`❌ Unexpected error: ${error}`);
      }
      return [];
    }
  }

  /**
   * Filter pairs by age (0-60 seconds) and liquidity
   */
  filterFreshTokens(pairs: DexScreenerPair[]): DexScreenerPair[] {
    const now = Date.now();

    // Step 1: Remove pairs with missing or invalid timestamps
    const withValidTimestamps = pairs.filter((pair) => {
      if (!pair.pairCreatedAt || pair.pairCreatedAt <= 0) {
        return false;
      }
      return true;
    });

    // Step 2: Calculate age and filter by time (0-60 seconds)
    const freshTokens = withValidTimestamps.filter((pair) => {
      const tokenCreatedAtMs = pair.pairCreatedAt! * 1000; // Convert to milliseconds
      const tokenAge = now - tokenCreatedAtMs;
      const ageInSeconds = Math.floor(tokenAge / 1000);

      // Reject negative timestamps (future dates)
      if (ageInSeconds < 0) {
        return false;
      }

      // Only accept tokens 0-60 seconds old
      return ageInSeconds >= 0 && ageInSeconds <= this.maxTokenAgeSeconds;
    });

    // Step 3: Filter by minimum liquidity
    const withLiquidity = freshTokens.filter((pair) => {
      const liquidityUsd = pair.liquidity?.usd || 0;
      return liquidityUsd >= this.minLiquidityUsd;
    });

    return withLiquidity;
  }

  /**
   * Sort pairs by creation time (newest first)
   */
  sortByNewest(pairs: DexScreenerPair[]): DexScreenerPair[] {
    return pairs.sort((a, b) => {
      const timeA = a.pairCreatedAt || 0;
      const timeB = b.pairCreatedAt || 0;
      return timeB - timeA; // Newest first
    });
  }

  /**
   * Calculate token age in seconds
   */
  calculateAge(pair: DexScreenerPair): number {
    const now = Date.now();
    const tokenCreatedAtMs = (pair.pairCreatedAt || 0) * 1000;
    return Math.floor((now - tokenCreatedAtMs) / 1000);
  }
}
