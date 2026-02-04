import { loadConfig, Config } from './config';
import { DexScreenerService } from './services/dexscreener.service';
import { TelegramService } from './services/telegram.service';
import { TokenTracker } from './services/tracker.service';
import { sleep } from './utils/formatter';

/**
 * Enhanced logging with timestamp
 */
function log(message: string): void {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Main application entry point
 */
async function main() {
  log('🚀 God Scan Bot Starting...');

  // Load configuration
  let config;
  try {
    config = loadConfig();
    log('✅ Configuration loaded successfully');
  } catch (error) {
    if (error instanceof Error) {
      log(`❌ Configuration error: ${error.message}`);
    }
    log('💡 Please create a .env file based on .env.example');
    process.exit(1);
  }

  // Initialize services
  const dexScreenerService = new DexScreenerService(
    config.maxTokenAgeSeconds,
    config.minLiquidityUsd
  );
  const telegramService = new TelegramService(
    config.telegramBotToken,
    config.telegramChatId
  );
  const tokenTracker = new TokenTracker();

  log(`⚙️  Check interval: ${config.checkInterval}s`);
  log(`⏱️  Max token age: ${config.maxTokenAgeSeconds}s`);
  log(`💧 Min liquidity: $${config.minLiquidityUsd}`);
  log(`📦 Max tokens per batch: ${config.maxTokensPerBatch}`);
  log('');
  log('🔄 Starting monitoring loop...');
  log('');

  // Main monitoring loop
  while (true) {
    try {
      await runCheckCycle(
        dexScreenerService,
        telegramService,
        tokenTracker,
        config
      );
    } catch (error) {
      if (error instanceof Error) {
        log(`❌ Error in check cycle: ${error.message}`);
      } else {
        log(`❌ Unexpected error: ${error}`);
      }
    }

    // Wait for next interval
    log(`⏳ Next check in ${config.checkInterval}s...`);
    log('');
    await sleep(config.checkInterval * 1000);
  }
}

/**
 * Run a single check cycle
 */
async function runCheckCycle(
  dexScreenerService: DexScreenerService,
  telegramService: TelegramService,
  tokenTracker: TokenTracker,
  config: Config
): Promise<void> {
  log('🔍 Checking DexScreener API...');

  // Fetch all Solana pairs
  const allPairs = await dexScreenerService.fetchAllPairs();
  if (allPairs.length === 0) {
    log('⚠️  No pairs returned from API');
    return;
  }
  log(`📊 Found ${allPairs.length} total Solana pairs`);

  // Filter fresh tokens (0-60 seconds old with minimum liquidity)
  const freshTokens = dexScreenerService.filterFreshTokens(allPairs);
  log(`⏱️  Time filter: ${freshTokens.length} tokens (0-${config.maxTokenAgeSeconds}s old)`);
  
  if (freshTokens.length === 0) {
    log('ℹ️  No fresh tokens found in this cycle');
    tokenTracker.cleanup();
    return;
  }

  log(`💧 Liquidity filter: ${freshTokens.length} tokens ($${config.minLiquidityUsd}+ USD)`);

  // Sort by newest first
  const sortedTokens = dexScreenerService.sortByNewest(freshTokens);

  // Take top N tokens (max batch size)
  const tokensToProcess = sortedTokens.slice(0, config.maxTokensPerBatch);
  log(`📦 Processing top ${tokensToProcess.length} tokens`);

  // Filter out already sent tokens
  const newTokens = tokensToProcess.filter((pair) => {
    const tokenAddress = pair.baseToken.address;
    if (tokenTracker.hasSent(tokenAddress)) {
      return false;
    }
    return true;
  });

  const alreadySentCount = tokensToProcess.length - newTokens.length;
  if (alreadySentCount > 0) {
    log(`🚫 Already sent: ${alreadySentCount}, New tokens: ${newTokens.length}`);
  } else {
    log(`✨ All tokens are new: ${newTokens.length}`);
  }

  if (newTokens.length === 0) {
    log('ℹ️  No new tokens to send');
    tokenTracker.cleanup();
    return;
  }

  // Send tokens to Telegram
  log(`📤 Sending ${newTokens.length} token(s) to Telegram...`);

  for (let i = 0; i < newTokens.length; i++) {
    const pair = newTokens[i];
    const tokenAddress = pair.baseToken.address;
    const tokenName = pair.baseToken.name || 'Unknown';
    const ageInSeconds = dexScreenerService.calculateAge(pair);

    const success = await telegramService.sendTokenAlert(pair, ageInSeconds);

    if (success) {
      tokenTracker.markAsSent(tokenAddress);
      log(`  ✅ [${i + 1}/${newTokens.length}] ${tokenName} (${ageInSeconds}s old) - SENT`);
    } else {
      log(`  ❌ [${i + 1}/${newTokens.length}] ${tokenName} - FAILED`);
    }

    // Rate limiting delay between messages (except after last message)
    if (i < newTokens.length - 1) {
      await sleep(config.messageDelayMs);
    }
  }

  log(`✅ Batch complete. Tracked tokens: ${tokenTracker.getTrackedCount()}`);
  
  // Cleanup old tracker entries
  tokenTracker.cleanup();
}

// Start the application
main().catch((error) => {
  log(`❌ Fatal error: ${error}`);
  process.exit(1);
});
