import crypto from 'crypto';

export class MonetagProvider {
  constructor(options = {}) {
    this.zoneId = options.zoneId || process.env.MONETAG_ZONE_ID || '';
    this.rewardEnabled = options.rewardEnabled === true;
    this.secretKey = process.env.MONETAG_POSTBACK_SECRET || '';
    this.cooldownSeconds = Number(process.env.MONETAG_COOLDOWN || 30);
    this.formats = {
      REWARDED_INTERSTITIAL: 'Rewarded Interstitial',
      REWARDED_POPUP: 'Rewarded Pop',
      IN_APP_INTERSTITIAL: 'In-App Interstitial'
    };
    this.sdk = 'monetag-tg-sdk';
  }

  async createSession({ adType = 'REWARDED_INTERSTITIAL' } = {}) {
    const format = this.formats[adType] || this.formats.REWARDED_INTERSTITIAL;
    if (!this.zoneId) {
      return {
        status: 'NOT_CONFIGURED',
        rewardEnabled: false,
        format,
        sdk: this.sdk,
        zoneId: ''
      };
    }
    return {
      status: 'READY',
      rewardEnabled: this.rewardEnabled,
      format,
      sdk: this.sdk,
      zoneId: this.zoneId
    };
  }

  async verifyCompletion() {
    throw new Error('Monetag does not document a server-verifiable completion callback for this Mini App SDK.');
  }

  verifyPostbackSignature(data, receivedSignature) {
    if (!receivedSignature || !this.secretKey || this.secretKey === 'default_secret_key' || this.secretKey === 'your_monetag_s2s_secret_key') {
      return false;
    }
    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(typeof data === 'string' ? data : JSON.stringify(data))
        .digest('hex');
      const left = Buffer.from(generatedSignature);
      const right = Buffer.from(String(receivedSignature));
      if (left.length !== right.length) return false;
      return crypto.timingSafeEqual(left, right);
    } catch {
      return false;
    }
  }

  isEligibleForNextAd(lastAdWatchedAt) {
    if (!lastAdWatchedAt) return true;
    const elapsedSeconds = (Date.now() - new Date(lastAdWatchedAt).getTime()) / 1000;
    return elapsedSeconds >= this.cooldownSeconds;
  }
}

export class MonetagService extends MonetagProvider {}

const defaultMonetagService = new MonetagService();
export default defaultMonetagService;
