import crypto from 'crypto';

export class MonetagService {
  constructor() {
    this.secretKey = process.env.MONETAG_POSTBACK_SECRET || 'default_secret_key';
    this.cooldownSeconds = 30; 
  }

  verifyPostbackSignature(data, receivedSignature) {
    if (!receivedSignature || !this.secretKey) {
      return false;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(typeof data === 'string' ? data : JSON.stringify(data))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(receivedSignature)
      );
    } catch (err) {
      return false;
    }
  }

  isEligibleForNextAd(lastAdWatchedAt) {
    if (!lastAdWatchedAt) return true;

    const now = new Date();
    const elapsedSeconds = (now.getTime() - new Date(lastAdWatchedAt).getTime()) / 1000;
    return elapsedSeconds >= this.cooldownSeconds;
  }
}

export const MonetagProvider = MonetagService;
const defaultMonetagService = new MonetagService();
export default defaultMonetagService;
