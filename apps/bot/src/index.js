import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { assertBotConfig, configureTelegramChrome, createBot, getBotConfig } from './bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = getBotConfig(process.env);
assertBotConfig(config);

const bot = createBot(config);

async function start() {
  const webhookDomain = String(process.env.BOT_WEBHOOK_DOMAIN || '').trim();
  const useWebhook = process.env.NODE_ENV === 'production' && Boolean(webhookDomain);

  if (useWebhook) {
    const express = (await import('express')).default;
    const app = express();
    const port = Number(process.env.BOT_PORT || 5001);
    const secretPath = `/telegraf/${bot.secretPathComponent()}`;
    app.use(express.json());
    app.use(bot.webhookCallback(secretPath));
    await bot.telegram.setWebhook(`${webhookDomain.replace(/\/$/, '')}${secretPath}`);
    await configureTelegramChrome(bot, config);
    app.listen(port, () => {
      console.log(`FA AGENCY EARN bot webhook listening on ${port}`);
    });
    return;
  }

  await bot.telegram.deleteWebhook({ drop_pending_updates: false }).catch(() => {});
  await bot.launch({ dropPendingUpdates: false });
  await configureTelegramChrome(bot, config);
  console.log(`FA AGENCY EARN bot online (polling) → ${config.appUrl}`);
}

start().catch((error) => {
  console.error('Bot launch failed:', error.message);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
