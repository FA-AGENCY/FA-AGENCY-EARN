import crypto from 'crypto';
import { config } from '../config/index.js';

export class TelegramAuthService {
  validateInitData(initData) {
    if (!initData || typeof initData !== 'string') {
      throw new Error('Telegram initData is required.');
    }

    if (!config.telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const params = new URLSearchParams(initData);
    const payload = {};
    for (const [key, value] of params.entries()) {
      payload[key] = value;
    }

    const hash = payload.hash;
    if (!hash) {
      throw new Error('Telegram initData hash is missing.');
    }

    const authDate = Number(payload.auth_date || 0);
    if (!authDate || Number.isNaN(authDate)) {
      throw new Error('Telegram auth_date is missing or invalid.');
    }

    const now = Math.floor(Date.now() / 1000);
    const age = now - authDate;
    if (age < -60) {
      throw new Error('Telegram auth_date is in the future.');
    }
    if (age > config.telegramAuthTtlSeconds) {
      throw new Error('Telegram authentication data is expired.');
    }

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();

    const sortedKeys = Object.keys(payload)
      .filter((key) => key !== 'hash')
      .sort();

    const dataCheckString = sortedKeys
      .map((key) => `${key}=${payload[key]}`)
      .join('\n');

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hash !== expectedHash) {
      throw new Error('Telegram initData signature is invalid.');
    }

    let userData;
    try {
      userData = JSON.parse(payload.user || '{}');
    } catch (_error) {
      throw new Error('Telegram user payload is malformed.');
    }

    if (!userData || !userData.id) {
      throw new Error('Telegram user payload missing.');
    }

    return {
      telegramId: String(userData.id),
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      photoUrl: userData.photo_url || '',
      languageCode: userData.language_code || 'bn'
    };
  }
}
