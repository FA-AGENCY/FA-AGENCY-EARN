import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (env === 'production' ? '' : 'development-secret-change-me');
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);

export const config = {
  env,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'FAAgencyEarnBot',
  monetagZoneId: process.env.MONETAG_ZONE_ID || '',
  monetagApiKey: process.env.MONETAG_API_KEY || '',
  monetagRewardEnabled: process.env.MONETAG_REWARD_ENABLED === 'true',
  monetagRewardAmount: process.env.MONETAG_REWARD_AMOUNT ? Number(process.env.MONETAG_REWARD_AMOUNT) : null,
  monetagDailyLimit: Number(process.env.MONETAG_DAILY_LIMIT || process.env.DAILY_AD_LIMIT || 20),
  monetagMinCompletionSeconds: Number(process.env.MONETAG_MIN_COMPLETION_SECONDS || process.env.AD_COMPLETION_MINIMUM_SECONDS || 15),
  monetagCooldownSeconds: Number(process.env.MONETAG_COOLDOWN || process.env.AD_COMPLETION_COOLDOWN_SECONDS || 60),
  adRewardAmount: Number(process.env.AD_REWARD_AMOUNT || 1),
  minimumWithdrawal: Number(process.env.MINIMUM_WITHDRAWAL || 100),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  telegramAuthTtlSeconds: Number(process.env.TELEGRAM_AUTH_TTL_SECONDS || 600),
  adCompletionMinimumSeconds: Number(process.env.AD_COMPLETION_MINIMUM_SECONDS || 3),
  adCompletionCooldownSeconds: Number(process.env.AD_COMPLETION_COOLDOWN_SECONDS || 5),
  dailyAdLimit: Number(process.env.DAILY_AD_LIMIT || 20),
  frontendUrl: process.env.FRONTEND_URL || 'https://fa-agency.online',
  apiUrl: process.env.API_BASE_URL || process.env.API_URL || 'https://api.fa-agency.online',
  appUrl: process.env.TELEGRAM_MINI_APP_URL || process.env.APP_URL || 'https://app.fa-agency.online',
  adminUrl: process.env.ADMIN_URL || 'https://admin.fa-agency.online',
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL || 'admin@fa-agency.local',
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || 'FaAdmin@2024!',
  adminSeedName: process.env.ADMIN_SEED_NAME || 'FA Super Admin'
};

if (env === 'production' && (!config.jwtSecret || config.jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured in production.');
}

if (config.monetagRewardEnabled) {
  throw new Error('MONETAG_REWARD_ENABLED must remain false until official server verification is configured.');
}

if (env === 'production' && (corsOrigins.length === 0 || corsOrigins.includes('*'))) {
  throw new Error('CORS_ORIGINS must contain explicit trusted origins in production.');
}

const localOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5000'
];

config.corsOrigins = Array.from(new Set([
  ...corsOrigins,
  ...(env !== 'production' ? localOrigins : (corsOrigins.length ? [] : [
    config.frontendUrl,
    config.appUrl,
    config.adminUrl
  ]))
]));

