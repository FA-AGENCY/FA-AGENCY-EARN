import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
if (!botToken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is missing in environment variables.');
  process.exit(1);
}

const bot = new Telegraf(botToken);
const webAppUrl = process.env.MINI_APP_URL || 'https://fa-agency-earn.web.app';
const port = process.env.BOT_PORT || 5001;
const webhookDomain = process.env.BOT_WEBHOOK_DOMAIN; // e.g., https://yourdomain.com
const secretPath = `/telegraf/${bot.secretPathComponent()}`;

// Basic bot commands
bot.start((ctx) => {
  ctx.reply('FA AGENCY EARN-এ স্বাগতম! নিচের বাটনে ক্লিক করে অ্যাপ ওপেন করুন:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ওপেন করুন Mini App', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

bot.help((ctx) => {
  ctx.reply('যেকোনো সহায়তার জন্য আমাদের সাপোর্ট চ্যানেলে যোগাযোগ করুন অথবা Mini App ওপেন করুন।');
});

// Start bot based on environment mode
if (process.env.NODE_ENV === 'production' && webhookDomain) {
  const app = express();
  app.use(express.json());
  
  // Set telegram webhook
  app.use(bot.webhookCallback(secretPath));
  bot.telegram.setWebhook(`${webhookDomain}${secretPath}`)
    .then(() => {
      console.log(`Bot Webhook set successfully to ${webhookDomain}${secretPath}`);
    })
    .catch((err) => {
      console.error('Failed to set webhook:', err);
    });

  app.listen(port, () => {
    console.log(`Bot webhook server running on port ${port}`);
  });
} else {
  // Development fallback: Long-polling
  bot.launch()
    .then(() => console.log('Bot started in polling mode (Dev)'))
    .catch((err) => console.error('Bot polling launch failed:', err));
}

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
