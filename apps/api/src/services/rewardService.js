export class RewardService {
  constructor(config = {}) {
    this.dailyAdLimit = config.dailyAdLimit ?? 20;
    this.cooldownSeconds = config.cooldownSeconds ?? 60;
    this.minimumReward = config.minimumReward ?? 0.5;
    this.maximumReward = config.maximumReward ?? 25;
  }

  validateAdSession(session) {
    if (!session || !session.sessionId) {
      throw new Error('Invalid ad session.');
    }

    if (session.status === 'EXPIRED') {
      throw new Error('Ad session expired.');
    }

    if (session.status === 'REJECTED') {
      throw new Error('Ad session rejected.');
    }

    return true;
  }

  calculateReward({ user, session }) {
    if (!user || !session) {
      throw new Error('Reward calculation requires user and session data.');
    }

    const base = Number(session.rewardAmount ?? 1.0);
    const safeReward = Math.min(Math.max(base, this.minimumReward), this.maximumReward);
    return Number(safeReward.toFixed(2));
  }

  checkDailyLimit({ user, limit = this.dailyAdLimit }) {
    if (!user || !Array.isArray(user.dailyAdHistory)) {
      return true;
    }

    return user.dailyAdHistory.length < limit;
  }

  checkCooldown({ user, cooldownSeconds = this.cooldownSeconds }) {
    if (!user || !user.lastAdAt) {
      return true;
    }

    const elapsed = (Date.now() - new Date(user.lastAdAt).getTime()) / 1000;
    return elapsed >= cooldownSeconds;
  }
}
