export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number; // Unix timestamp in SECONDS
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}
