import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Config {
  telegramBotToken: string;
  telegramChatId: string;
  checkInterval: number;
  maxTokenAgeSeconds: number;
  maxTokensPerBatch: number;
  minLiquidityUsd: number;
  debugMode: boolean;
  messageDelayMs: number;
}

/**
 * Load and validate environment variables
 */
export function loadConfig(): Config {
  const config: Config = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    checkInterval: parseInt(process.env.CHECK_INTERVAL || '20', 10),
    maxTokenAgeSeconds: parseInt(process.env.MAX_TOKEN_AGE_SECONDS || '60', 10),
    maxTokensPerBatch: parseInt(process.env.MAX_TOKENS_PER_BATCH || '10', 10),
    minLiquidityUsd: parseFloat(process.env.MIN_LIQUIDITY_USD || '50'),
    debugMode: process.env.DEBUG_MODE === 'true',
    messageDelayMs: parseInt(process.env.MESSAGE_DELAY_MS || '1500', 10),
  };

  // Validate required fields
  if (!config.telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required in .env file');
  }
  if (!config.telegramChatId) {
    throw new Error('TELEGRAM_CHAT_ID is required in .env file');
  }

  return config;
}
