import TelegramBot from 'node-telegram-bot-api';
import { DexScreenerPair } from '../types/dexscreener.types';
import { formatNumber, formatPrice } from '../utils/formatter';

/**
 * Telegram messaging service
 */
export class TelegramService {
  private bot: TelegramBot;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.bot = new TelegramBot(botToken, { polling: false });
    this.chatId = chatId;
  }

  /**
   * Format and send token alert to Telegram
   */
  async sendTokenAlert(pair: DexScreenerPair, ageInSeconds: number): Promise<boolean> {
    try {
      const message = this.formatTokenMessage(pair, ageInSeconds);
      
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.log(`❌ Failed to send message: ${error.message}`);
      } else {
        console.log(`❌ Failed to send message: ${error}`);
      }
      return false;
    }
  }

  /**
   * Format token information into Telegram message
   */
  private formatTokenMessage(pair: DexScreenerPair, ageInSeconds: number): string {
    const tokenName = pair.baseToken.name || 'Unknown';
    const tokenSymbol = pair.baseToken.symbol || 'UNKNOWN';
    const contractAddress = pair.baseToken.address; // FULL ADDRESS - NO SHORTENING
    const price = formatPrice(pair.priceUsd);
    const liquidity = formatNumber(pair.liquidity?.usd);
    const marketCap = formatNumber(pair.marketCap);
    const dexName = pair.dexId || 'Unknown';
    const dexScreenerUrl = `https://dexscreener.com/solana/${pair.pairAddress}`;
    const solscanUrl = `https://solscan.io/token/${pair.baseToken.address}`;

    const message = `🚀 <b>NEW SOLANA TOKEN!</b>

<b>Token:</b> ${tokenName} (${tokenSymbol})
<b>Contract:</b> <code>${contractAddress}</code>

⚡ Launched ${ageInSeconds} seconds ago
💰 Price: ${price}
💧 Liquidity: ${liquidity}
📊 Market Cap: ${marketCap}
⛓️ Chain: Solana
🏦 DEX: ${dexName}

🔗 <a href="${dexScreenerUrl}">DexScreener</a>
🔗 <a href="${solscanUrl}">Solscan</a>`;

    return message;
  }
}
