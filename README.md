# God Scan - Fresh Solana Token Bot

Telegram bot that monitors DexScreener for ultra-fresh Solana token listings (0-60 seconds old).

## Features
- ⚡ Real-time monitoring (20-second intervals)
- 🎯 Strict 60-second age filter
- 📋 Full contract address display
- 🚫 Duplicate prevention with automatic cleanup
- 📦 Batch processing (up to 10 tokens per cycle)
- 📊 Detailed logging with timestamps
- 💧 Configurable liquidity filters
- 🔒 Environment-based configuration

## Prerequisites

- **Node.js 18+** installed
- **Telegram Bot Token** - Get from [@BotFather](https://t.me/BotFather)
- **Telegram Chat ID** - Your user/group chat ID

### Getting Telegram Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token provided

### Getting Chat ID
1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}` in the response
4. Copy the ID number

## Installation

```bash
# Clone repository
git clone https://github.com/sureshshukla12996/godscan.git
cd godscan

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Configuration

Edit `.env` file with your settings:

```env
# Required - Get from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Required - Your Telegram chat ID
TELEGRAM_CHAT_ID=123456789

# Optional - Default values shown
CHECK_INTERVAL=20              # Check every 20 seconds
MAX_TOKEN_AGE_SECONDS=60       # Only tokens <= 60 seconds old
MAX_TOKENS_PER_BATCH=10        # Max tokens per check cycle
MIN_LIQUIDITY_USD=50           # Minimum liquidity filter ($50)
DEBUG_MODE=true                # Enable detailed console logs
MESSAGE_DELAY_MS=1500          # 1.5 second delay between messages
```

## Building & Running

```bash
# Build TypeScript to JavaScript
npm run build

# Start the bot
npm start

# Or run in development mode (with ts-node)
npm run dev
```

## Running in Background

### Using nohup
```bash
nohup npm start > bot.log 2>&1 &
```

### Using screen
```bash
screen -S godscan
npm start
# Press Ctrl+A then D to detach
# Reattach with: screen -r godscan
```

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start npm --name "godscan" -- start
pm2 save
pm2 startup
```

## Example Output

### Console Logs
```
[10:15:30] 🚀 God Scan Bot Starting...
[10:15:30] ✅ Configuration loaded successfully
[10:15:30] ⚙️  Check interval: 20s
[10:15:30] ⏱️  Max token age: 60s
[10:15:30] 💧 Min liquidity: $50
[10:15:30] 📦 Max tokens per batch: 10
[10:15:30] 
[10:15:30] 🔄 Starting monitoring loop...
[10:15:30] 
[10:15:30] 🔍 Checking DexScreener API...
[10:15:31] 📊 Found 1250 total Solana pairs
[10:15:31] ⏱️  Time filter: 3 tokens (0-60s old)
[10:15:31] 💧 Liquidity filter: 3 tokens ($50+ USD)
[10:15:31] 📦 Processing top 3 tokens
[10:15:31] ✨ All tokens are new: 3
[10:15:31] 📤 Sending 3 token(s) to Telegram...
[10:15:31]   ✅ [1/3] MoonCoin (35s old) - SENT
[10:15:33]   ✅ [2/3] RocketToken (42s old) - SENT
[10:15:34]   ✅ [3/3] StarDust (58s old) - SENT
[10:15:34] ✅ Batch complete. Tracked tokens: 3
[10:15:34] ⏳ Next check in 20s...
```

### Telegram Message Format
```
🚀 NEW SOLANA TOKEN!

Token: MoonCoin (MOON)
Contract: 7xKXtGx9vC8wPQk4zY3Lm2Hv6Dq1Fs9Rn8Wj5Tp3Ua4

⚡ Launched 35 seconds ago
💰 Price: $0.000123
💧 Liquidity: $2.5K
📊 Market Cap: $125K
⛓️ Chain: Solana
🏦 DEX: Raydium

🔗 DexScreener
🔗 Solscan
```

## How It Works

1. **Fetches** all Solana pairs from DexScreener API every 20 seconds
2. **Filters** tokens by:
   - Age: Only 0-60 seconds old
   - Liquidity: Minimum $50 USD
   - Validity: Must have valid timestamp
3. **Sorts** by creation time (newest first)
4. **Limits** to 10 tokens per batch
5. **Checks** against duplicate tracker
6. **Sends** individual Telegram message for each new token
7. **Waits** 1.5 seconds between messages (rate limit protection)
8. **Cleans** old tracker entries every cycle (>5 minutes)

## Time Filter Logic

```typescript
// Calculate token age
const now = Date.now();
const tokenCreatedAtMs = pair.pairCreatedAt * 1000; // Convert to milliseconds
const ageInSeconds = Math.floor((now - tokenCreatedAtMs) / 1000);

// Only tokens 0-60 seconds old
if (ageInSeconds >= 0 && ageInSeconds <= 60) {
  // Valid token - send to Telegram
}
```

## Troubleshooting

### Bot not sending messages
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Verify `TELEGRAM_CHAT_ID` is correct
- Check if bot has permission to send messages to the chat
- Check console logs for error messages

### No tokens found
- Tokens must be 0-60 seconds old (very strict)
- Tokens must have at least $50 liquidity
- DexScreener API may have rate limits
- Check console logs for API errors

### Build errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Project Structure

```
godscan/
├── src/
│   ├── index.ts                     # Main entry point with interval loop
│   ├── config.ts                    # Load and validate environment variables
│   ├── services/
│   │   ├── dexscreener.service.ts   # Fetch & filter tokens from API
│   │   ├── telegram.service.ts      # Send formatted messages
│   │   └── tracker.service.ts       # Duplicate tracking with cleanup
│   ├── types/
│   │   └── dexscreener.types.ts     # TypeScript interfaces
│   └── utils/
│       └── formatter.ts             # Number formatting helpers
├── dist/                            # Compiled JavaScript (after build)
├── .env                             # Your configuration (not in git)
├── .env.example                     # Configuration template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## API Reference

### DexScreener API
- **Endpoint**: `https://api.dexscreener.com/latest/dex/pairs/solana`
- **Documentation**: [DexScreener API Docs](https://docs.dexscreener.com/)
- **Rate Limits**: Respect API rate limits (currently generous)

## Security Notes

- ⚠️ **Never commit `.env` file** - Contains sensitive credentials
- 🔒 Keep your bot token secret
- 🛡️ Use environment variables for all secrets
- 📝 `.gitignore` already excludes `.env`

## License

MIT License - See LICENSE file for details

## Author

Created by [sureshshukla12996](https://github.com/sureshshukla12996)

## Contributing

Contributions welcome! Please open an issue or pull request.

## Support

For issues or questions, please open a GitHub issue.

---

**Disclaimer**: This bot is for informational purposes only. Always do your own research before investing in any cryptocurrency.