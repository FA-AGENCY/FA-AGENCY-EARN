import { startBot } from './bot.js';

startBot().then((bot) => {
  const shutdown = (signal) => bot.stop(signal);
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}).catch((error) => {
  console.error('Telegram bot startup failed:', error.message);
  process.exit(1);
});