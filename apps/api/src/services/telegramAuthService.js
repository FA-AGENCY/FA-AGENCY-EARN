import crypto from 'crypto';
import { config } from '../config/index.js';
import { buildTelegramPayload } from '../utils/telegram.js';

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export class TelegramAuthService {
  verifyInitData(initData, botToken = config.telegramBotToken) {
    try {
      const profile = this.validateInitData(initData, botToken);
      return { isValid: true, user: profile };
    } catch {
      return { isValid: false, user: null };
    }
  }

  validateInitData(initData, botToken = config.telegramBotToken) {
    if (!initData || typeof initData !== 'string') {
      throw new Error('Telegram initData is required.');
    }
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required for signature validation.');
    }

    const payload = buildTelegramPayload(initData);
    if (!payload.hash) {
      throw new Error('Telegram signature is invalid.');
    }

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(payload.dataCheckString).digest('hex');

    if (!timingSafeEqualHex(calculatedHash, payload.hash)) {
      throw new Error('Telegram signature is invalid.');
    }

    const authDate = Number(payload.source.auth_date);
    if (!Number.isFinite(authDate)) {
      throw new Error('Telegram signature is invalid.');
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = Number(config.telegramAuthTtlSeconds || 600);
    if (authDate > now + 60) {
      throw new Error('Telegram auth_date is in the future.');
    }
    if (now - authDate > ttl) {
      throw new Error('Telegram initData has expired.');
    }

    let user = {};
    if (payload.source.user) {
      try {
        user = JSON.parse(payload.source.user);
      } catch {
        throw new Error('Telegram signature is invalid.');
      }
    }

    if (!user?.id) {
      throw new Error('Telegram signature is invalid.');
    }

    return {
      telegramId: String(user.id),
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      username: user.username || '',
      photoUrl: user.photo_url || '',
      languageCode: user.language_code || 'bn',
      startParam: payload.source.start_param || '',
      authDate
    };
  }
}

const defaultTelegramAuthService = new TelegramAuthService();
export default defaultTelegramAuthService;
