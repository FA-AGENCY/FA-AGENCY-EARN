import AdReward from '../models/AdReward.js';
import AdSession from '../models/AdSession.js';
import mongoose from 'mongoose';
import { WalletService } from './walletService.js';
import FraudEvent from '../models/FraudEvent.js';
import { config } from '../config/index.js';

export class RewardEngine {
  static async creditReward({ userId, amount, source, sourceId, type, idempotencyKey }) {
    if (!userId || !amount || !type) {
      throw new Error('Invalid reward parameters.');
    }

    const existing = await AdReward.findOne({ idempotencyKey });
    if (existing) {
      return { duplicate: true, reward: existing };
    }

    const session = await mongoose.startSession();
    let rewardRecord;
    try {
      await session.withTransaction(async () => {
        const transactionResult = await WalletService.applyBalanceChange({
          userId,
          type,
          amount,
          direction: 'CREDIT',
          source,
          sourceId,
          idempotencyKey,
          referenceId: idempotencyKey,
          session
        });

        if (transactionResult.duplicate) {
          rewardRecord = existing || transactionResult.transaction;
          return;
        }

        [rewardRecord] = await AdReward.create([{
          userId,
          adSessionId: sourceId,
          amount: Number(amount),
          status: 'POSTED',
          idempotencyKey,
          provider: 'Monetag'
        }], { session });
      });
    } finally {
      await session.endSession();
    }

    return { duplicate: Boolean(existing), reward: rewardRecord };
  }

  static async createAdSession({ userId, provider, adType, rewardAmount, idempotencyKey, providerMetadata }) {
    const existing = await AdSession.findOne({ userId, idempotencyKey });
    if (existing) {
      return existing;
    }

    const session = await AdSession.create({
      userId,
      provider,
      adType,
      rewardAmount,
      status: 'STARTED',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      startedAt: new Date(),
      idempotencyKey,
      providerMetadata
    });

    return session;
  }

  static async completeAdSession({ sessionId, userId }) {
    const session = await AdSession.findOne({ _id: sessionId, userId });
    if (!session) {
      await FraudEvent.create({
        userId,
        eventType: 'IMPOSSIBLE_ACTIVITY',
        riskLevel: 'LOW',
        status: 'OPEN',
        description: 'অবৈধ বিজ্ঞাপন সেশন সম্পন্ন করার চেষ্টা হয়েছে।',
        evidence: { sessionId },
        metadata: {}
      });
      throw new Error('Ad session not found.');
    }

    if (session.status === 'REWARDED') {
      return { session, duplicate: true };
    }

    if (session.status !== 'STARTED') {
      throw new Error('Ad session lifecycle is invalid.');
    }

    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      session.status = 'EXPIRED';
      await session.save();
      throw new Error('Ad session has expired.');
    }

    const startedAt = session.startedAt || session.createdAt;
    const elapsedSeconds = (Date.now() - startedAt.getTime()) / 1000;
    if (elapsedSeconds < config.monetagMinCompletionSeconds) {
      await FraudEvent.create({
        userId,
        eventType: 'RAPID_AD_COMPLETION',
        riskLevel: 'MEDIUM',
        status: 'OPEN',
        description: 'বিজ্ঞাপন অস্বাভাবিক দ্রুত সম্পন্ন করার চেষ্টা হয়েছে।',
        evidence: { sessionId: session._id.toString(), elapsedSeconds },
        metadata: { minimumSeconds: config.monetagMinCompletionSeconds }
      });
      session.status = 'REJECTED';
      await session.save();
      throw new Error('বিজ্ঞাপনটি আরও কিছুক্ষণ দেখুন, তারপর সম্পন্ন করুন।');
    }

    const cooldownSince = new Date(Date.now() - config.monetagCooldownSeconds * 1000);
    const recentCompletion = await AdSession.exists({
      userId,
      _id: { $ne: session._id },
      status: 'REWARDED',
      completedAt: { $gte: cooldownSince }
    });
    if (recentCompletion) {
      await FraudEvent.create({
        userId,
        eventType: 'RAPID_AD_COMPLETION',
        riskLevel: 'MEDIUM',
        status: 'OPEN',
        description: 'বিজ্ঞাপন সম্পন্ন করার মধ্যে অস্বাভাবিক কম বিরতি শনাক্ত হয়েছে।',
        evidence: { sessionId: session._id.toString() },
        metadata: { cooldownSeconds: config.monetagCooldownSeconds }
      });
      throw new Error('পরপর বিজ্ঞাপনের মধ্যে কিছুক্ষণ অপেক্ষা করুন।');
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const dailyCount = await AdReward.countDocuments({ userId, createdAt: { $gte: todayStart }, status: 'POSTED' });
    if (dailyCount >= config.monetagDailyLimit) {
      await FraudEvent.create({
        userId,
        eventType: 'EXCESSIVE_REQUESTS',
        riskLevel: 'MEDIUM',
        status: 'OPEN',
        description: 'দৈনিক বিজ্ঞাপন সীমা অতিক্রমের চেষ্টা হয়েছে।',
        evidence: { sessionId: session._id.toString(), dailyCount },
        metadata: { dailyLimit: config.monetagDailyLimit }
      });
      throw new Error('আজকের বিজ্ঞাপন সীমা পূর্ণ হয়েছে।');
    }

    return session;
  }
}
