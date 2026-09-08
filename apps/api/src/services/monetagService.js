export class MonetagProvider {
  constructor(config = {}) {
    this.zoneId = config.zoneId || '';
    this.rewardEnabled = Boolean(config.rewardEnabled);
    this.enabled = Boolean(this.zoneId);
    this.formats = {
      REWARDED_INTERSTITIAL: 'rewarded-interstitial',
      REWARDED_POPUP: 'rewarded-pop',
      IN_APP_INTERSTITIAL: 'in-app-interstitial'
    };
  }

  async createSession({ adType = 'REWARDED_INTERSTITIAL' } = {}) {
    if (!this.enabled) {
      return {
        provider: 'Monetag',
        status: 'DISABLED',
        message: 'Monetag zone is not configured.'
      };
    }

    if (!this.formats[adType]) {
      throw new Error('Unsupported Monetag ad format.');
    }

    return {
      provider: 'Monetag',
      status: 'READY',
      zoneId: this.zoneId,
      format: this.formats[adType],
      rewardEnabled: this.rewardEnabled,
      sdk: 'monetag-tg-sdk'
    };
  }

  async verifyCompletion() {
    throw new Error('Monetag does not document a server-verifiable completion callback for this SDK.');
  }
}
