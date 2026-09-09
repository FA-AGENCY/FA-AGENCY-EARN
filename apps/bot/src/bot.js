import { Telegraf, Markup } from 'telegraf';

export const commandNames = [
  '/start',
  '/app',
  '/earn',
  '/tasks',
  '/wallet',
  '/withdraw',
  '/referral',
  '/bonus',
  '/history',
  '/support',
  '/help'
];

const OPEN_APP_TEXT = '🚀 আয় শুরু করুন';
const SAFE_ERROR_TEXT = 'সাময়িক সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।';

export function getBotConfig(env = process.env) {
  const token = String(env.TELEGRAM_BOT_TOKEN || env.BOT_TOKEN || '').trim();
  const appUrl = String(
    env.TELEGRAM_MINI_APP_URL ||
    env.APP_URL ||
    env.MINI_APP_URL ||
    ''
  ).trim();
  const supportUrl = String(env.SUPPORT_URL || 'https://t.me/FAAgencyEarnBot').trim();
  const botUsername = String(env.TELEGRAM_BOT_USERNAME || 'FAAgencyEarnBot').trim();

  return { token, appUrl, supportUrl, botUsername };
}

export function assertBotConfig(config) {
  if (!config?.token) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }
  if (!config?.appUrl) {
    throw new Error('TELEGRAM_MINI_APP_URL must be an HTTPS Mini App URL');
  }
  let parsed;
  try {
    parsed = new URL(config.appUrl);
  } catch {
    throw new Error('TELEGRAM_MINI_APP_URL must be a valid HTTPS URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Mini App URL must use HTTPS');
  }
  return config;
}

function welcomeMessage() {
  return [
    '👋 হ্যালো, FA AGENCY™ EARN প্ল্যাটফর্মে আপনাকে স্বাগতম!',
    '',
    'আপনার অবসর সময়কে কাজে লাগিয়ে প্রতিদিন অনলাইন থেকে আয় করুন। নিচে দেওয়া বাটনে ট্যাপ করে সরাসরি আমাদের Mini App-এ প্রবেশ করুন এবং কাজ শুরু করুন।',
    '',
    '🚀 Believe in Your Growth — একসাথে শিখি, একসাথে উপার্জন করি।'
  ].join('\n');
}

function featureMessage(title, body) {
  return `${title}\n\n${body}\n\nMini App খুলতে নিচের বাটনে চাপুন।`;
}

function miniAppUrl(appUrl, startPayload) {
  const url = new URL(appUrl);
  if (startPayload) {
    url.searchParams.set('startapp', startPayload);
    url.searchParams.set('ref', startPayload);
  }
  return url.toString();
}

function openAppMarkup(appUrl, startPayload) {
  return Markup.inlineKeyboard([
    [Markup.button.webApp(OPEN_APP_TEXT, miniAppUrl(appUrl, startPayload))]
  ]);
}

function commandCopy(name, startPayload, supportUrl, botUsername) {
  const referralLink = `https://t.me/${botUsername}?start=${startPayload || 'ref'}`;
  const messages = {
    start: welcomeMessage(),
    app: featureMessage('🚀 Mini App', 'এখান থেকে বিজ্ঞাপন, কাজ, ওয়ালেট এবং রেফারেল ব্যবহার করুন।'),
    earn: featureMessage('💰 আয়', 'বিজ্ঞাপন দেখে এবং অনুমোদিত কাজ সম্পন্ন করে আয় শুরু করুন।'),
    tasks: featureMessage('✅ কাজ', 'সামাজিক কাজ ও ভিডিও টাস্ক Mini App-এর টাস্ক সেকশনে পাবেন।'),
    wallet: featureMessage('💳 ওয়ালেট', 'ব্যালেন্স, ইতিহাস এবং ক্যাশআউট Mini App-এর ওয়ালেটে দেখা যাবে।'),
    withdraw: featureMessage('🏦 উত্তোলন', 'উত্তোলনের শর্ত ও পেমেন্ট পদ্ধতি Mini App-এর Cash Out স্ক্রিনে আছে।'),
    referral: featureMessage('👥 রেফারেল', `বন্ধুদের আমন্ত্রণ লিংক: ${referralLink}`),
    bonus: featureMessage('🎁 বোনাস', 'দৈনিক বোনাস ও স্পিন অফার Mini App-এর More সেকশনে পাবেন।'),
    history: featureMessage('📊 ইতিহাস', 'লেনদেনের হিস্ট্রি Mini App ওয়ালেটে সংরক্ষিত থাকে।'),
    support: featureMessage('🆘 সহায়তা', `সাপোর্ট: ${supportUrl}`),
    help: [
      'FA AGENCY™ EARN কমান্ড তালিকা:',
      commandNames.join(', '),
      '',
      'সব ফিচার ব্যবহার করতে Mini App খুলুন।'
    ].join('\n')
  };
  return messages[name] || messages.app;
}

export function createBot(config, options = {}) {
  assertBotConfig(config);
  const logger = options.logger || console;
  const botFactory = options.botFactory || ((token) => new Telegraf(token));
  const bot = botFactory(config.token);
  const seenUpdates = new Map();
  const seenLimit = 500;

  bot.use(async (ctx, next) => {
    const updateId = ctx?.update?.update_id;
    if (updateId != null) {
      if (seenUpdates.has(updateId)) {
        return;
      }
      seenUpdates.set(updateId, Date.now());
      if (seenUpdates.size > seenLimit) {
        const firstKey = seenUpdates.keys().next().value;
        seenUpdates.delete(firstKey);
      }
    }
    return next();
  });

  for (const command of commandNames) {
    const name = command.slice(1);
    bot.command(name, async (ctx) => {
      const startPayload = ctx.startPayload || '';
      await ctx.reply(
        commandCopy(name, startPayload, config.supportUrl, config.botUsername),
        openAppMarkup(config.appUrl, startPayload)
      );
    });
  }

  bot.catch(async (error, ctx) => {
    logger.error(error);
    try {
      await ctx?.reply?.(SAFE_ERROR_TEXT);
    } catch {
      // ignore secondary reply failures
    }
  });

  return bot;
}

export async function configureTelegramChrome(bot, config) {
  if (!bot?.telegram || !config?.appUrl) return;
  try {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: 'Open App',
        web_app: { url: config.appUrl }
      }
    });
  } catch (error) {
    console.error('Failed to set Telegram menu button:', error.message);
  }
}
