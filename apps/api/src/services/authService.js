import { TelegramAuthService } from './telegramAuthService.js';

export class AuthService {
  constructor() {
    this.telegramAuthService = new TelegramAuthService();
  }

  validateTelegramInitData(initData) {
    try {
      return { valid: true, user: this.telegramAuthService.validateInitData(initData) };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
}
