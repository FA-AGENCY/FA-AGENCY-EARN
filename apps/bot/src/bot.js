/**
 * FA AGENCY™ EARN — Telegram Bot
 * 
 * All commands redirect to Mini App OR call Central API for real data.
 * Bot does NOT duplicate financial business logic.
 * Central API is source of truth.
 */

import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

export const commandNames = ['/start', '/app', '/earn', '/tasks', '/wallet', '/withdraw', '/referral', '/bonus', '/history', '/support', '/help'];

export function getBotConfig(env = process.env) {
  return {
    token: env.TELEGRAM_BOT_TOKEN || '',
    appUrl: env.TELEGRAM_MINI_APP_URL || env.APP_URL || '',
    apiUrl: env.API_BASE_URL || env.API_URL || '',
    supportUrl: env.SUPPORT_URL || ''
  };
}

export function assertBotConfig(config) {
  if (!config.token) {
    throw new Error('TELEGRAM_BOT_TOKEN is required.');
  }
  if (!config.appUrl || !/^https:\/\//i.test(config.appUrl)) {
    throw new Error('APP_URL must be an HTTPS URL.');
  }
}

export function createMiniAppKeyboard(appUrl) {
  return Markup.inlineKeyboard([
    [Markup.button.webApp('🚀 FA AGENCY™ EARN খুলুন', appUrl)]
  ]);
}

/**
 * Parse referral code from /start payload
 * Returns null if no valid referral code found
 */
export function parseReferralCode(startPayload) {
  if (!startPayload || typeof startPayload !== 'string') return null;
  const trimmed = startPayload.trim();
  if (trimmed.startsWith('ref_')) {
    const code = trimmed.slice(4).trim();
    return code.length > 0 && code.length <= 40 ? code : null;
  }
  return null;
}

/**
 * Call the Central API on behalf of the bot (bot-level request, no user token)
 * Uses a simple fetch call with the bot's internal API URL
 */
async function callApi(apiUrl, path, options = {}) {
  if (!apiUrl) return null;
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (_err) {
    return null;
  }
}

export function createBot(config, { botFactory = (token) => new Telegraf(token), logger = console } = {}) {
  assertBotConfig(config);
  const bot = botFactory(config.token);
  const seenUpdates = new Map();
  const duplicateWindowMs = 10 * 60 * 1000;

  // Duplicate update prevention middleware
  bot.use(async (ctx, next) => {
    const updateId = ctx.update?.update_id;
    if (Number.isInteger(updateId)) {
      const now = Date.now();
      for (const [id, timestamp] of seenUpdates) {
        if (now - timestamp > duplicateWindowMs) seenUpdates.delete(id);
      }
      if (seenUpdates.has(updateId)) return;
      seenUpdates.set(updateId, now);
    }
    return next();
  });

  // /start command — handles referral deep-link
  bot.command('start', async (ctx) => {
    const startPayload = ctx.message?.text?.split(' ')[1] || '';
    const referralCode = parseReferralCode(startPayload);
    const firstName = ctx.from?.first_name || 'বন্ধু';

    let welcomeMsg = `স্বাগতম ${firstName}! 🎉\n\nFA AGENCY™ EARN-এ আপনাকে স্বাগতম।\nটাস্ক সম্পন্ন করুন, বিজ্ঞাপন দেখুন এবং প্রতিদিন বোনাস নিন।`;

    if (referralCode) {
      welcomeMsg += `\n\n🔗 রেফারেল কোড পাওয়া গেছে: \`${referralCode}\`\nMini App-এ লগইন করলে স্বয়ংক্রিয়ভাবে রেফারেল যুক্ত হবে।`;
    }

    welcomeMsg += '\n\nনিচের বাটনে ক্লিক করে Mini App খুলুন:';

    return ctx.reply(welcomeMsg, {
      parse_mode: 'Markdown',
      ...createMiniAppKeyboard(config.appUrl)
    });
  });

  // /app command
  bot.command('app', async (ctx) => {
    return ctx.reply(
      'FA AGENCY™ EARN Mini App খুলুন:',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /wallet command — fetch real balance from API (public health check; real data needs auth)
  bot.command('wallet', async (ctx) => {
    const apiData = config.apiUrl ? await callApi(config.apiUrl, '/health') : null;
    const apiStatus = apiData?.status === 'ok' ? '✅ API সক্রিয়' : '⚠️ API তথ্য পাওয়া যাচ্ছে না';

    return ctx.reply(
      `💳 আপনার ওয়ালেট তথ্য দেখতে Mini App খুলুন।\n\n${apiStatus}\n\nসম্পূর্ণ ওয়ালেট ও লেনদেন ইতিহাস Mini App-এ দেখুন:`,
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /tasks command — fetch available task count from API
  bot.command('tasks', async (ctx) => {
    let taskInfo = 'উপলব্ধ টাস্ক দেখতে Mini App খুলুন।';

    if (config.apiUrl) {
      const data = await callApi(config.apiUrl, '/api/tasks');
      // Note: /api/tasks requires auth, so we just show a prompt
      if (data && Array.isArray(data.tasks)) {
        const count = data.tasks.length;
        taskInfo = count > 0
          ? `✅ এখন ${count}টি টাস্ক পাওয়া যাচ্ছে।\nটাস্ক সম্পন্ন করতে Mini App খুলুন:`
          : 'এখন কোনো টাস্ক নেই। পরে আবার চেক করুন।\nMini App খুলুন:';
      }
    }

    return ctx.reply(
      `📋 ${taskInfo}`,
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /bonus command
  bot.command('bonus', async (ctx) => {
    return ctx.reply(
      '🎁 প্রতিদিনের বোনাস ক্লেইম করতে Mini App খুলুন:\n\nসার্ভার যাচাইকৃত বোনাস সরাসরি আপনার ওয়ালেটে যাবে।',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /referral command
  bot.command('referral', async (ctx) => {
    return ctx.reply(
      '👥 আপনার রেফারেল লিংক ও পরিসংখ্যান দেখতে Mini App খুলুন:\n\nবন্ধুকে আমন্ত্রণ জানান এবং তাদের কার্যক্রম অনুযায়ী পুরস্কার পান।',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /history command
  bot.command('history', async (ctx) => {
    return ctx.reply(
      '📊 আপনার সম্পূর্ণ লেনদেন ইতিহাস Mini App-এ দেখুন:\n\nAD Reward • Task Reward • Daily Bonus • Referral • Withdrawal সব এখানে।',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /withdraw command
  bot.command('withdraw', async (ctx) => {
    return ctx.reply(
      '💸 উত্তোলনের অনুরোধ করতে Mini App খুলুন:\n\nbKash • Nagad • Rocket-এ নিরাপদ ও দ্রুত উত্তোলন করুন।\nন্যূনতম উত্তোলন: ১০০ BDT।',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /earn command
  bot.command('earn', async (ctx) => {
    return ctx.reply(
      '💰 আয়ের সুযোগ:\n\n📋 Daily Tasks\n🎬 Watch Ads\n🎁 Daily Bonus\n👥 Referral Program\n\nMini App খুলে শুরু করুন:',
      createMiniAppKeyboard(config.appUrl)
    );
  });

  // /support command
  bot.command('support', async (ctx) => {
    const supportMsg = config.supportUrl
      ? `🎧 সহায়তার জন্য যোগাযোগ করুন: ${config.supportUrl}`
      : '🎧 সহায়তার জন্য Mini App-এর Support সেকশনে যোগাযোগ করুন।';

    return ctx.reply(supportMsg, createMiniAppKeyboard(config.appUrl));
  });

  // /help command
  bot.command('help', async (ctx) => {
    const helpText = [
      '📖 FA AGENCY™ EARN — সব কমান্ড:',
      '',
      '/start — শুরু করুন',
      '/app — Mini App খুলুন',
      '/earn — আয়ের সুযোগ দেখুন',
      '/tasks — উপলব্ধ টাস্ক',
      '/wallet — ওয়ালেট তথ্য',
      '/bonus — দৈনিক বোনাস',
      '/referral — রেফারেল প্রোগ্রাম',
      '/history — লেনদেন ইতিহাস',
      '/withdraw — উত্তোলন করুন',
      '/support — সহায়তা',
      '/help — এই বার্তা',
      '',
      '⚠️ সমস্ত আর্থিক তথ্য ও পরিবর্তনের একমাত্র উৎস হলো সুরক্ষিত Central API।'
    ].join('\n');

    return ctx.reply(helpText);
  });

  // Error handler
  bot.catch(async (error, ctx) => {
    logger.error('Telegram bot update failed:', error?.message || 'unknown error');
    try {
      await ctx.reply('সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।');
    } catch (_replyError) {
      logger.error('Telegram bot error response failed.');
    }
  });

  return bot;
}

export async function startBot(config = getBotConfig()) {
  const bot = createBot(config);
  await bot.launch();
  return bot;
}
