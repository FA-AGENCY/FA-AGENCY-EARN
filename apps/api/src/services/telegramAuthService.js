import crypto from 'crypto';

export class TelegramAuthService {
  verifyInitData(initData, botToken) {
    if (!initData || !botToken) return { isValid: false, user: null };

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');

      const params = Array.from(urlParams.entries());
      params.sort(([a], [b]) => a.localeCompare(b));

      const dataCheckString = params
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const isValid = calculatedHash === hash;
      const userString = urlParams.get('user');
      const user = userString ? JSON.parse(userString) : null;

      return { isValid, user };
    } catch (error) {
      return { isValid: false, user: null };
    }
  }
}

const defaultTelegramAuthService = new TelegramAuthService();
export default defaultTelegramAuthService;
