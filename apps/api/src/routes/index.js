import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { authLimiter, generalLimiter, adSessionLimiter, adCompletionLimiter, bonusLimiter, taskLimiter, withdrawalLimiter, adminLimiter } from '../middleware/rateLimit.js';
import { requireAuth, requireAccountActivity, requireAdmin, requireEarningAccess, requireWithdrawalAccess } from '../middleware/auth.js';
import { TelegramAuthService } from '../services/telegramAuthService.js';
import { UserService } from '../services/userService.js';
import { RewardEngine } from '../services/rewardEngine.js';
import { WalletService } from '../services/walletService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { AdminService } from '../services/adminService.js';
import { FraudService } from '../services/fraudService.js';
import { AuditService } from '../services/auditService.js';
import { MonetagProvider } from '../services/monetagService.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import AdSession from '../models/AdSession.js';
import DailyBonus from '../models/DailyBonus.js';
import Task from '../models/Task.js';
import TaskSession from '../models/TaskSession.js';
import TaskSubmission from '../models/TaskSubmission.js';
import Referral from '../models/Referral.js';
import Withdrawal from '../models/Withdrawal.js';
import FraudEvent from '../models/FraudEvent.js';
import AdReward from '../models/AdReward.js';
import AuditLog from '../models/AuditLog.js';
import LedgerTransaction from '../models/LedgerTransaction.js';
import LoginEvent from '../models/LoginEvent.js';
import SupportTicket from '../models/SupportTicket.js';
import AdminUser from '../models/AdminUser.js';
import { config } from '../config/index.js';

const router = express.Router();
const telegramAuthService = new TelegramAuthService();
const userService = new UserService();
const analyticsService = new AnalyticsService();
const adminService = new AdminService();
const monetagProvider = new MonetagProvider({ zoneId: config.monetagZoneId, rewardEnabled: config.monetagRewardEnabled });

const hasForbiddenFields = (req, res, fields) => {
  const submitted = fields.filter((field) => Object.prototype.hasOwnProperty.call(req.body || {}, field));
  if (submitted.length) {
    res.status(400).json({ error: 'অনুমোদিত নয় এমন তথ্য পাঠানো হয়েছে।' });
    return true;
  }
  return false;
};

const bengaliError = (error, fallback) => {
  const message = error?.message || '';
  if (message.includes('Insufficient balance')) return 'অপর্যাপ্ত ব্যালেন্স।';
  if (message.includes('already exists')) return 'একটি অপেক্ষমান অনুরোধ ইতিমধ্যে আছে।';
  if (message.includes('expired')) return 'অনুরোধটির মেয়াদ শেষ হয়েছে।';
  if (message.includes('not found')) return 'অনুরোধের তথ্য পাওয়া যায়নি।';
  if (message.includes('lifecycle')) return 'অনুরোধটির ধাপ সঠিক নয়।';
  if (message.includes('Wallet not found')) return 'ওয়ালেট পাওয়া যায়নি।';
  return fallback;
};

const pagination = (query) => {
  const page = Math.max(1, Math.min(1000, Number.parseInt(query.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit, 10) || 50));
  return { page, limit, skip: (page - 1) * limit };
};

router.use(generalLimiter);

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    environment: config.env,
    database: config.mongoUri ? 'configured' : 'not-configured'
  });
});

router.post('/api/auth/telegram', authLimiter, async (req, res) => {
  try {
    const initData = req.body?.initData;
    const telegramProfile = telegramAuthService.validateInitData(initData);
    const user = await userService.findOrCreateFromTelegram(telegramProfile);
    await LoginEvent.create({
      userId: user._id,
      telegramId: user.telegramId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || ''
    });
    const token = userService.issueToken(user);
    const wallet = await Wallet.findOne({ userId: user._id }).lean();

    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: user._id,
        internalUid: user.internalUid,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl || '',
        status: user.status,
        referralCode: user.referralCode,
        balance: wallet?.availableBalance ?? 0
      },
      wallet: wallet || { availableBalance: 0, pendingBalance: 0, lifetimeEarned: 0 },
      dashboard: {
        brand: 'FA AGENCY™ EARN',
        tagline: 'আয় করুন • এগিয়ে যান • একসাথে',
        balance: wallet?.availableBalance ?? 0,
        stats: {
          todayEarnings: 0,
          lifetimeEarnings: wallet?.lifetimeEarned ?? 0,
          pendingRewards: wallet?.pendingBalance ?? 0,
          withdrawableBalance: wallet?.availableBalance ?? 0
        }
      }
    });
  } catch (error) {
    return res.status(401).json({ error: 'টেলিগ্রাম লগইন যাচাই করা যায়নি।' });
  }
});

router.get('/api/me', requireAuth, requireAccountActivity, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
  }

  const wallet = await Wallet.findOne({ userId: user._id }).lean();
  return res.json({
    id: user._id,
    internalUid: user.internalUid,
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl || '',
    status: user.status,
    referralCode: user.referralCode,
    wallet: wallet || { availableBalance: 0, pendingBalance: 0, lifetimeEarned: 0 }
  });
});

router.get('/api/me/login-history', requireAuth, requireAccountActivity, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { userId: req.user.id };
  const [events, total] = await Promise.all([
    LoginEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-ipAddress').lean(),
    LoginEvent.countDocuments(filter)
  ]);
  return res.json({ events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/wallet', requireAuth, requireAccountActivity, async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.id }).lean();
  return res.json({
    wallet: wallet || { availableBalance: 0, pendingBalance: 0, lifetimeEarned: 0, lifetimeWithdrawn: 0, currency: 'BDT' }
  });
});

router.get('/api/wallet/ledger', requireAuth, requireAccountActivity, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { userId: req.user.id };
  const [transactions, total] = await Promise.all([
    LedgerTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    LedgerTransaction.countDocuments(filter)
  ]);
  return res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/history', requireAuth, requireAccountActivity, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { userId: req.user.id };
  const [history, total] = await Promise.all([
    LedgerTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    LedgerTransaction.countDocuments(filter)
  ]);
  return res.json({ history, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/dashboard', requireAuth, requireAccountActivity, async (req, res) => {
  const user = await User.findById(req.user.id);
  const wallet = await Wallet.findOne({ userId: user._id });

  return res.json({
    brand: 'FA AGENCY™ EARN',
    tagline: 'আয় করুন • এগিয়ে যান • একসাথে',
    greeting: `স্বাগতম, ${user.firstName || user.username || 'ব্যবহারকারী'}!`,
    primaryAction: '🚀 আয় শুরু করুন',
    balance: wallet?.availableBalance ?? 0,
    stats: {
      todayEarnings: 0,
      lifetimeEarnings: wallet?.lifetimeEarned ?? 0,
      pendingRewards: wallet?.pendingBalance ?? 0,
      withdrawableBalance: wallet?.availableBalance ?? 0
    },
    sections: ['🏠 হোম', '🎬 বিজ্ঞাপন', '✅ কাজ', '🎁 দৈনিক বোনাস', '👥 রেফারেল', '💳 ওয়ালেট', '📊 ইতিহাস', '👤 প্রোফাইল', '🆘 সহায়তা']
  });
});

router.get('/api/ads', requireAuth, requireAccountActivity, async (_req, res) => {
  const provider = await monetagProvider.createSession({ adType: 'REWARDED_INTERSTITIAL' });
  return res.json({
    provider: 'Monetag',
    enabled: provider.status === 'READY',
    rewardEnabled: provider.rewardEnabled,
    supportedFormats: provider.status === 'READY' ? Object.keys(monetagProvider.formats) : [],
    items: []
  });
});

router.post('/api/ads/session', requireAuth, requireEarningAccess, adSessionLimiter, async (req, res) => {
  try {
    if (hasForbiddenFields(req, res, ['userId', 'telegramId', 'rewardAmount', 'amount', 'balance', 'lifetimeEarned', 'pendingBalance'])) return;
    const { adType = 'REWARDED_INTERSTITIAL' } = req.body || {};
    if (!['REWARDED_INTERSTITIAL', 'REWARDED_POPUP', 'IN_APP_INTERSTITIAL'].includes(adType)) {
      return res.status(400).json({ error: 'অবৈধ বিজ্ঞাপন ধরন।' });
    }
    const providerSession = await monetagProvider.createSession({ adType });
    if (providerSession.status !== 'READY') {
      return res.status(503).json({ error: 'Monetag বিজ্ঞাপন এখনো কনফিগার করা হয়নি।' });
    }
    const session = await RewardEngine.createAdSession({
      userId: req.user.id,
      provider: 'Monetag',
      adType,
      rewardAmount: config.monetagRewardAmount ?? 0,
      idempotencyKey: req.get('Idempotency-Key') || `ad_session_${req.user.id}_${Date.now()}`,
      providerMetadata: { format: providerSession.format, sdk: providerSession.sdk, zoneId: providerSession.zoneId }
    });

    return res.status(200).json({
      ok: true,
      sessionId: session._id,
      status: session.status,
      provider: providerSession,
      message: 'বিজ্ঞাপন সেশন তৈরি হয়েছে। পূর্ণতা যাচাই করা হবে।'
    });
  } catch (error) {
    return res.status(400).json({ error: bengaliError(error, 'বিজ্ঞাপন সেশন তৈরি করা যায়নি।') });
  }
});

router.post('/api/ads/complete', requireAuth, requireEarningAccess, adCompletionLimiter, async (req, res) => {
  try {
    if (hasForbiddenFields(req, res, ['userId', 'telegramId', 'rewardAmount', 'amount', 'balance', 'lifetimeEarned', 'pendingBalance'])) return;
    const { sessionId } = req.body || {};
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ error: 'অবৈধ বিজ্ঞাপন সেশন।' });
    }
    if (!config.monetagRewardEnabled) {
      return res.status(503).json({ error: 'Monetag reward verification এখনো সক্রিয় নয়।' });
    }
    await monetagProvider.verifyCompletion();
    const completion = await RewardEngine.completeAdSession({ sessionId, userId: req.user.id });
    const session = completion.session || completion;

    if (completion.duplicate) {
      return res.status(200).json({ ok: true, status: 'REWARDED', duplicate: true, message: 'এই সেশন ইতিমধ্যে পুরস্কার প্রাপ্ত হয়েছে।' });
    }

    const rewardAmount = Number(session.rewardAmount || 0);
    const rewardResult = await RewardEngine.creditReward({
      userId: req.user.id,
      amount: rewardAmount,
      source: 'AD_REWARD',
      sourceId: session._id.toString(),
      type: 'AD_REWARD',
      idempotencyKey: `reward_${session._id}`
    });

    if (rewardResult.duplicate) {
      session.status = 'REWARDED';
      session.completedAt = session.completedAt || new Date();
      await session.save();
      return res.status(200).json({ ok: true, status: 'REWARDED', duplicate: true, message: 'এই সেশন ইতিমধ্যে পুরস্কার প্রাপ্ত হয়েছে।' });
    }

    session.status = 'REWARDED';
    await session.save();

    return res.status(200).json({
      ok: true,
      status: 'REWARDED',
      reward: rewardAmount,
      duplicate: false,
      message: 'পুরস্কার জমা হয়েছে।'
    });
  } catch (error) {
    return res.status(error.message?.includes('অস্বাভাবিক') || error.message?.includes('অপেক্ষা') || error.message?.includes('সীমা') ? 429 : 400).json({ error: bengaliError(error, 'বিজ্ঞাপন সম্পন্ন করা যায়নি।') });
  }
});

router.get('/api/bonus', requireAuth, requireAccountActivity, async (req, res) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const claimedToday = await DailyBonus.findOne({ userId: req.user.id, periodKey: todayKey, status: 'CLAIMED' });
  const count = await DailyBonus.countDocuments({ userId: req.user.id, status: 'CLAIMED' });
  const day = (count % 7) + 1;
  const nextBonus = { day, amount: 1 };

  return res.json({
    bonus: nextBonus,
    claimedToday: Boolean(claimedToday),
    message: claimedToday ? 'আজকের বোনাস ইতিমধ্যে নেওয়া হয়েছে।' : 'আজকের বোনাস নেওয়া যাবে।'
  });
});

router.post('/api/bonus/claim', requireAuth, requireEarningAccess, bonusLimiter, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'telegramId', 'amount', 'rewardAmount', 'balance', 'lifetimeEarned', 'pendingBalance'])) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  const bonusAmount = 1;
  const idempotencyKey = `bonus_${req.user.id}_${todayKey}`;
  const session = await mongoose.startSession();

  try {
    let bonus;
    await session.withTransaction(async () => {
      const existing = await DailyBonus.findOne({ userId: req.user.id, periodKey: todayKey }).session(session);
      if (existing) {
        throw new Error('আজকের বোনাস ইতিমধ্যে দাবি করা হয়েছে।');
      }

      const [createdBonus] = await DailyBonus.create([{
        userId: req.user.id,
        periodKey: todayKey,
        amount: bonusAmount,
        status: 'CLAIMED',
        claimedAt: new Date()
      }], { session });

      await WalletService.applyBalanceChange({
        userId: req.user.id,
        amount: bonusAmount,
        source: 'DAILY_BONUS',
        sourceId: createdBonus._id.toString(),
        type: 'DAILY_BONUS',
        direction: 'CREDIT',
        idempotencyKey,
        referenceId: idempotencyKey,
        session
      });
      bonus = createdBonus;
    });

    return res.status(200).json({ ok: true, bonus: bonusAmount, message: 'দৈনিক বোনাস সফলভাবে জমা হয়েছে।' });
  } catch (error) {
    const duplicate = error?.code === 11000 || error?.message?.includes('ইতিমধ্যে');
    return res.status(duplicate ? 409 : 400).json({ error: error.message || 'বোনাস দাবি করা যায়নি।' });
  } finally {
    await session.endSession();
  }
});

router.get('/api/referral', requireAuth, requireAccountActivity, async (req, res) => {
  const user = await User.findById(req.user.id);
  const refs = await Referral.find({ referrerId: req.user.id }).lean();

  return res.json({
    referralCode: user.referralCode,
    totalReferrals: refs.length,
    activeReferrals: refs.filter((r) => r.status === 'QUALIFIED').length,
    referralEarnings: refs.reduce((total, item) => total + Number(item.amount || 0), 0),
    startLink: `https://t.me/FAAgencyEarnBot?start=ref_${user.referralCode}`
  });
});

router.get('/api/referral/stats', requireAuth, requireAccountActivity, async (req, res) => {
  const refs = await Referral.find({ referrerId: req.user.id }).lean();
  return res.json({ totalReferrals: refs.length, activeReferrals: refs.filter((r) => r.status === 'QUALIFIED').length, referralEarnings: refs.reduce((total, item) => total + Number(item.amount || 0), 0) });
});

router.post('/api/referral/claim', requireAuth, requireEarningAccess, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'referredUserId', 'amount', 'rewardAmount', 'status'])) return;
  const referralCode = typeof req.body?.referralCode === 'string' ? req.body.referralCode.trim() : '';
  if (!referralCode || referralCode.length > 40) return res.status(400).json({ error: 'রেফারেল কোড সঠিক নয়।' });
  const [referrer, existing] = await Promise.all([
    User.findOne({ referralCode }).select('_id referralCode').lean(),
    Referral.findOne({ referredUserId: req.user.id })
  ]);
  if (!referrer) return res.status(404).json({ error: 'রেফারেল কোড পাওয়া যায়নি।' });
  if (referrer._id.toString() === req.user.id.toString()) {
    await FraudService.record({ userId: req.user.id, type: 'REFERRAL_ABUSE', riskLevel: 'MEDIUM', description: 'নিজের referral code ব্যবহারের চেষ্টা হয়েছে।', evidence: { referralCode }, metadata: {} });
    return res.status(400).json({ error: 'নিজের referral code ব্যবহার করা যাবে না।' });
  }
  if (existing) return res.status(409).json({ error: 'এই অ্যাকাউন্টে referral ইতিমধ্যে যুক্ত আছে।' });
  const referral = await Referral.create({ referrerId: referrer._id, referredUserId: req.user.id, referralCode, status: 'PENDING', amount: 0 });
  await User.updateOne({ _id: req.user.id, referredBy: null }, { $set: { referredBy: referrer._id } });
  return res.status(201).json({ ok: true, referral: { id: referral._id, status: referral.status }, message: 'রেফারেল সম্পর্ক যাচাইয়ের জন্য জমা হয়েছে।' });
});

router.get('/api/tasks', requireAuth, requireAccountActivity, async (_req, res) => {
  const tasks = await Task.find({ status: 'AVAILABLE' }).lean();
  return res.json({ tasks });
});

router.post('/api/tasks/:id/start', requireAuth, requireEarningAccess, taskLimiter, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'টাস্ক পাওয়া যায়নি।' });
  }

  const session = await TaskSession.create({
    userId: req.user.id,
    taskId: task._id,
    status: 'STARTED',
    startedAt: new Date()
  });

  return res.status(200).json({ ok: true, taskId: task._id, status: session.status, message: 'টাস্ক শুরু হয়েছে।' });
});

router.post('/api/tasks/:id/complete', requireAuth, requireEarningAccess, taskLimiter, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'telegramId', 'rewardAmount', 'amount', 'balance', 'lifetimeEarned', 'pendingBalance'])) return;
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'টাস্ক পাওয়া যায়নি।' });
  }

  const session = await TaskSession.findOne({ userId: req.user.id, taskId: task._id }).sort({ createdAt: -1 });
  if (!session) {
    return res.status(400).json({ error: 'টাস্ক সেশন শুরু করা হয়নি।' });
  }

  if (session.status !== 'STARTED') {
    await FraudService.record({
      userId: req.user.id,
      type: 'TASK_ABUSE',
      riskLevel: 'MEDIUM',
      description: 'একটি টাস্ক একাধিকবার জমা দেওয়ার চেষ্টা হয়েছে।',
      evidence: { taskId: task._id.toString(), sessionId: session._id.toString(), status: session.status },
      metadata: {}
    });
    return res.status(409).json({ error: 'এই টাস্কের সেশন আর সক্রিয় নেই।' });
  }

  if (task.taskType === 'SURVEY' && !req.body?.proof) {
    return res.status(400).json({ error: 'সার্ভে প্রমাণ প্রয়োজন।' });
  }

  if (req.body?.proof !== undefined && (typeof req.body.proof !== 'string' || req.body.proof.length > 4000)) {
    return res.status(400).json({ error: 'টাস্কের প্রমাণ সঠিক নয়।' });
  }

  session.status = 'COMPLETED';
  session.completedAt = new Date();
  session.verificationData = { proof: req.body?.proof || '', source: 'user' };
  await session.save();

  await TaskSubmission.create({
    userId: req.user.id,
    taskId: task._id,
    status: 'PENDING',
    payload: { proof: req.body?.proof || '' },
    submittedAt: new Date()
  });

  return res.json({ ok: true, status: 'COMPLETED', message: 'টাস্ক জমা হয়েছে, যাচাই চলছে।' });
});

router.get('/api/tasks/submissions', requireAuth, requireAccountActivity, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { userId: req.user.id };
  const [submissions, total] = await Promise.all([
    TaskSubmission.find(filter)
      .populate('taskId', 'title reward category taskType')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TaskSubmission.countDocuments(filter)
  ]);
  return res.json({ submissions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/withdrawals', requireAuth, requireAccountActivity, async (req, res) => {
  const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  return res.json({ withdrawals });
});

router.post('/api/support/tickets', requireAuth, requireAccountActivity, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'status', 'handledBy'])) return;
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (subject.length < 3 || subject.length > 120 || message.length < 5 || message.length > 4000) {
    return res.status(400).json({ error: 'সাপোর্ট অনুরোধের তথ্য সঠিক নয়।' });
  }
  const ticket = await SupportTicket.create({ userId: req.user.id, subject, message });
  return res.status(201).json({ ok: true, ticket, message: 'সাপোর্ট অনুরোধ জমা হয়েছে।' });
});

router.get('/api/support/tickets', requireAuth, requireAccountActivity, async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
  return res.json({ tickets });
});

router.post('/api/withdrawals', requireAuth, requireWithdrawalAccess, withdrawalLimiter, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'telegramId', 'status', 'balance', 'availableBalance', 'pendingBalance', 'lifetimeEarned', 'lifetimeWithdrawn'])) return;
  const amount = Number(req.body?.amount);
  if (amount <= 0) {
    return res.status(400).json({ error: 'ভ্যালিড পরিমাণ লিখুন।' });
  }

  if (!Number.isFinite(amount) || amount < config.minimumWithdrawal) {
    return res.status(400).json({ error: `ন্যূনতম উত্তোলন ${config.minimumWithdrawal} BDT।` });
  }

  const idempotencyKey = req.get('Idempotency-Key') || req.body?.idempotencyKey;
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key হেডার প্রয়োজন।' });
  }

  const existingWithdrawal = await Withdrawal.findOne({ userId: req.user.id, idempotencyKey }).lean();
  if (existingWithdrawal) {
    return res.status(200).json({ ok: true, duplicate: true, withdrawal: existingWithdrawal, message: 'এই উত্তোলনের অনুরোধ ইতিমধ্যে জমা হয়েছে।' });
  }

  const method = req.body?.method || 'bKash';
  const destination = typeof req.body?.destination === 'string' ? req.body.destination.trim() : '';
  if (!['bKash', 'Nagad', 'Rocket', 'Bank'].includes(method) || destination.length < 4 || destination.length > 120) {
    return res.status(400).json({ error: 'উত্তোলনের পেমেন্ট তথ্য সঠিক নয়।' });
  }

  const recentAttempts = await Withdrawal.countDocuments({
    userId: req.user.id,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });
  const openHighRisk = await FraudService.hasOpenHighRisk(req.user.id);
  const recentRapidAds = await FraudService.countRecent(req.user.id, 'RAPID_AD_COMPLETION', new Date(Date.now() - 24 * 60 * 60 * 1000));
  const requiresReview = openHighRisk || recentAttempts >= 3 || recentRapidAds >= 2;

  if (requiresReview) {
    await FraudService.record({
      userId: req.user.id,
      type: 'SUSPICIOUS_WITHDRAWAL',
      riskLevel: openHighRisk ? 'HIGH' : 'MEDIUM',
      description: 'উত্তোলনের আগে অতিরিক্ত ঝুঁকির সংকেত শনাক্ত হয়েছে।',
      evidence: { recentAttempts, recentRapidAds, openHighRisk },
      metadata: { withdrawalIdempotencyKey: idempotencyKey }
    });
  }

  try {
    const result = await WalletService.reserveWithdrawal({
      userId: req.user.id,
      amount,
      idempotencyKey,
      withdrawal: {
        method,
        destination,
        note: requiresReview ? 'অতিরিক্ত পর্যালোচনা প্রয়োজন।' : 'উত্তোলন অনুরোধ জমা হয়েছে।',
        status: requiresReview ? 'UNDER_REVIEW' : 'PENDING'
      }
    });

    return res.status(result.duplicate ? 200 : 201).json({
      ok: true,
      duplicate: result.duplicate,
      withdrawal: result.withdrawal,
      message: 'উত্তোলনের অনুরোধ জমা হয়েছে।'
    });
  } catch (error) {
    const status = error.message === 'Insufficient balance.' ? 400 : 409;
    return res.status(status).json({ error: bengaliError(error, 'উত্তোলন অনুরোধ ব্যর্থ হয়েছে।') });
  }
});

router.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড দিন।' });
    }

    let adminUser = null;
    let passwordValid = false;

    if (mongoose.connection.readyState === 1) {
      adminUser = await AdminUser.findOne({ email, isActive: true });
      if (adminUser) {
        try {
          passwordValid = adminUser.verifyPassword(password, config.jwtSecret);
        } catch (_e) {
          passwordValid = false;
        }
      }
    } else {
      // Local development fallback when MongoDB connection is not configured
      const seedEmail = (config.adminSeedEmail || process.env.ADMIN_SEED_EMAIL || 'admin@fa-agency.local')?.trim().toLowerCase();
      const seedPassword = (config.adminSeedPassword || process.env.ADMIN_SEED_PASSWORD || 'FaAdmin@2024!')?.trim();
      if (seedEmail && email === seedEmail) {
        const expectedHash = AdminUser.hashPassword(seedPassword, config.jwtSecret);
        const givenHash = AdminUser.hashPassword(password, config.jwtSecret);
        passwordValid = crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(givenHash, 'hex'));
        if (passwordValid) {
          adminUser = {
            _id: 'dev_admin_super',
            email: seedEmail,
            name: config.adminSeedName || process.env.ADMIN_SEED_NAME || 'FA Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true
          };
        }
      }
    }

    if (!adminUser || !passwordValid) {
      return res.status(401).json({ error: 'ইমেইল/পাসওয়ার্ড সঠিক নয়।' });
    }

    if (mongoose.connection.readyState === 1 && typeof adminUser.save === 'function') {
      adminUser.lastLoginAt = new Date();
      await adminUser.save();
    }

    const token = jwt.sign({
      adminId: String(adminUser._id),
      id: String(adminUser._id),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isAdmin: true,
      adminRole: adminUser.role
    }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return res.json({
      ok: true,
      token,
      admin: {
        id: String(adminUser._id),
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'লগইন সম্পন্ন করা যায়নি।' });
  }
});

router.use('/api/admin', adminLimiter);

router.get('/api/admin/dashboard', requireAuth, requireAdmin, async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      totalUsers: 0,
      activeUsers: 0,
      restrictedUsers: 0,
      suspendedUsers: 0,
      closedUsers: 0,
      totalEarnings: 0,
      totalRewards: 0,
      newUsersToday: 0,
      grossRevenue: null,
      pendingWithdrawals: { count: 0, amount: 0 },
      underReviewWithdrawals: { count: 0, amount: 0 },
      processingWithdrawals: { count: 0, amount: 0 },
      paidWithdrawals: { count: 0, amount: 0 },
      rejectedWithdrawals: { count: 0, amount: 0 },
      openFraudEvents: 0,
      highRiskEvents: 0,
      criticalRiskEvents: 0
    });
  }
  return res.json(await adminService.getAdminDashboard());
});

router.get('/api/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const { page, limit, skip } = pagination(_req.query);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ users: [], pagination: { page, limit, total: 0, pages: 0 } });
  }
  const query = typeof _req.query.q === 'string' ? _req.query.q.trim().slice(0, 80) : '';
  const filter = query ? {
    $or: [
      { uid: new RegExp(query, 'i') },
      { internalUid: new RegExp(query, 'i') },
      { username: new RegExp(query.replace(/^@/, ''), 'i') },
      { telegramId: new RegExp(query, 'i') }
    ]
  } : {};
  const [users, total] = await Promise.all([
    User.find(filter).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter)
  ]);
  return res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'অবৈধ ব্যবহারকারী আইডি।' });
  const user = await User.findById(req.params.id).select('-__v').lean();
  if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
  const [wallet, earnings, withdrawals, fraudEvents, auditEvents] = await Promise.all([
    Wallet.findOne({ userId: user._id }).lean(),
    LedgerTransaction.find({ userId: user._id, direction: 'CREDIT' }).sort({ createdAt: -1 }).limit(50).lean(),
    Withdrawal.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    FraudEvent.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    AuditLog.find({ entityType: 'User', entityId: user._id.toString() }).sort({ createdAt: -1 }).limit(50).lean()
  ]);
  return res.json({ user, wallet, earnings, withdrawals, fraudEvents, auditEvents });
});

router.get('/api/admin/task-submissions', requireAuth, requireAdmin, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ submissions: [], pagination: { page, limit, total: 0, pages: 0 } });
  }
  const filter = ['PENDING', 'APPROVED', 'REJECTED'].includes(req.query.status) ? { status: req.query.status } : {};
  const [submissions, total] = await Promise.all([
    TaskSubmission.find(filter).populate('userId', 'uid firstName lastName username').populate('taskId', 'title reward taskType').sort({ submittedAt: -1 }).skip(skip).limit(limit).lean(),
    TaskSubmission.countDocuments(filter)
  ]);
  return res.json({ submissions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.patch('/api/admin/task-submissions/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || hasForbiddenFields(req, res, ['userId', 'amount', 'rewardAmount', 'balance'])) return;
  const { status, note } = req.body || {};
  if (!['APPROVED', 'REJECTED'].includes(status) || (note !== undefined && (typeof note !== 'string' || note.length > 500))) {
    return res.status(400).json({ error: 'টাস্ক review তথ্য সঠিক নয়।' });
  }
  const submission = await TaskSubmission.findById(req.params.id).populate('taskId');
  if (!submission) return res.status(404).json({ error: 'টাস্ক submission পাওয়া যায়নি।' });
  if (submission.status !== 'PENDING') return res.status(409).json({ error: 'এই submission ইতিমধ্যে review করা হয়েছে।' });
  if (status === 'APPROVED') {
    await RewardEngine.creditReward({ userId: submission.userId, amount: submission.taskId.reward, source: 'TASK_REWARD', sourceId: submission._id.toString(), type: 'TASK_REWARD', idempotencyKey: `task_reward_${submission._id}` });
  }
  submission.status = status;
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date();
  submission.reviewNote = note || '';
  await submission.save();
  await AuditService.record({ actorUserId: req.user.id, action: `TASK_SUBMISSION_${status}`, entityType: 'TaskSubmission', entityId: submission._id.toString(), details: { note: note || '' } });
  return res.json({ ok: true, status: submission.status });
});

router.get('/api/admin/analytics', requireAuth, requireAdmin, async (_req, res) => {
  return res.json(await analyticsService.getDashboardSummary());
});

router.get('/api/admin/settings', requireAuth, requireAdmin, async (_req, res) => {
  return res.json({ adRewardAmount: config.adRewardAmount, dailyAdLimit: 20, minimumWithdrawal: config.minimumWithdrawal });
});

router.get('/api/admin/withdrawals', requireAuth, requireAdmin, async (_req, res) => {
  const { page, limit, skip } = pagination(_req.query);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ withdrawals: [], pagination: { page, limit, total: 0, pages: 0 } });
  }
  const [withdrawals, total] = await Promise.all([
    Withdrawal.find()
      .populate('userId', 'uid internalUid firstName lastName username status riskLevel')
      .populate('reviewedBy', 'uid firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Withdrawal.countDocuments()
  ]);
  return res.json({ withdrawals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/admin/withdrawals/:id', requireAuth, requireAdmin, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(404).json({ error: 'উত্তোলনের তথ্য পাওয়া যায়নি।' });
  }
  const withdrawal = await Withdrawal.findById(req.params.id)
    .populate('userId', 'uid internalUid firstName lastName username status riskLevel fraudScore')
    .populate('reviewedBy', 'uid firstName lastName username')
    .lean();
  if (!withdrawal) return res.status(404).json({ error: 'উত্তোলনের তথ্য পাওয়া যায়নি।' });

  const userId = withdrawal.userId._id;
  const [withdrawalHistory, recentRewards, recentAds, fraudSignals, referrals, auditEvents] = await Promise.all([
    Withdrawal.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    AdReward.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    AdSession.find({ userId }).sort({ createdAt: -1 }).limit(20).select('provider adType status createdAt completedAt').lean(),
    FraudEvent.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Referral.find({ $or: [{ referrerId: userId }, { referredUserId: userId }] }).sort({ createdAt: -1 }).limit(20).lean(),
    AuditLog.find({ entityType: 'Withdrawal', entityId: withdrawal._id.toString() }).sort({ createdAt: -1 }).limit(50).lean()
  ]);

  return res.json({ withdrawal, withdrawalHistory, recentRewards, recentAds, fraudSignals, referrals, auditEvents });
});

router.patch('/api/admin/withdrawals/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'amount', 'balance', 'availableBalance', 'pendingBalance', 'lifetimeEarned'])) return;
  const { status, note } = req.body || {};
  if (status === 'REJECTED' && (!note || typeof note !== 'string' || note.trim().length === 0)) {
    return res.status(400).json({ error: 'প্রত্যাখ্যানের কারণ উল্লেখ করা বাধ্যতামূলক।' });
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 500)) {
    return res.status(400).json({ error: 'নোটের দৈর্ঘ্য সঠিক নয়।' });
  }
  if (!['UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'অবৈধ উত্তোলন স্ট্যাটাস।' });
  }

  try {
    const withdrawal = await WalletService.updateWithdrawalStatus({
      withdrawalId: req.params.id,
      status,
      note,
      adminUserId: req.user.id
    });
    return res.json({ ok: true, withdrawal });
  } catch (error) {
    return res.status(error.message === 'Withdrawal not found.' ? 404 : 409).json({ error: bengaliError(error, 'উত্তোলনের স্ট্যাটাস পরিবর্তন করা যায়নি।') });
  }
});

router.get('/api/admin/fund-center', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        treasury: {
          totalAvailableBalance: 0,
          totalPendingBalance: 0,
          totalLifetimeEarned: 0,
          totalLifetimeWithdrawn: 0,
          currency: 'BDT'
        },
        withdrawalsSummary: {
          pending: { count: 0, amount: 0 },
          underReview: { count: 0, amount: 0 },
          approved: { count: 0, amount: 0 },
          processing: { count: 0, amount: 0 },
          paid: { count: 0, amount: 0 },
          rejected: { count: 0, amount: 0 },
          totalLiability: 0
        },
        recentTransactions: [],
        pagination: { page: 1, limit: 30, total: 0, pages: 0 }
      });
    }

    const { page, limit, skip } = pagination(req.query);
    const txFilter = {};
    if (req.query.type) txFilter.type = req.query.type;
    if (req.query.direction && ['CREDIT', 'DEBIT'].includes(req.query.direction)) txFilter.direction = req.query.direction;

    const [walletTotals, withdrawalAggs, transactions, totalTx] = await Promise.all([
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalAvailableBalance: { $sum: '$availableBalance' },
            totalPendingBalance: { $sum: '$pendingBalance' },
            totalLifetimeEarned: { $sum: '$lifetimeEarned' },
            totalLifetimeWithdrawn: { $sum: '$lifetimeWithdrawn' }
          }
        }
      ]),
      Withdrawal.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        }
      ]),
      LedgerTransaction.find(txFilter)
        .populate('userId', 'uid internalUid firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LedgerTransaction.countDocuments(txFilter)
    ]);

    const findStatus = (status) => withdrawalAggs.find((w) => w._id === status) || { count: 0, amount: 0 };
    const pending = findStatus('PENDING');
    const underReview = findStatus('UNDER_REVIEW');
    const approved = findStatus('APPROVED');
    const processing = findStatus('PROCESSING');
    const paid = findStatus('PAID');
    const rejected = findStatus('REJECTED');

    const totalLiability = pending.amount + underReview.amount + approved.amount + processing.amount;

    return res.json({
      treasury: {
        totalAvailableBalance: walletTotals[0]?.totalAvailableBalance ?? 0,
        totalPendingBalance: walletTotals[0]?.totalPendingBalance ?? 0,
        totalLifetimeEarned: walletTotals[0]?.totalLifetimeEarned ?? 0,
        totalLifetimeWithdrawn: walletTotals[0]?.totalLifetimeWithdrawn ?? 0,
        currency: 'BDT'
      },
      withdrawalsSummary: {
        pending,
        underReview,
        approved,
        processing,
        paid,
        rejected,
        totalLiability
      },
      recentTransactions: transactions,
      pagination: { page, limit, total: totalTx, pages: Math.ceil(totalTx / limit) }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Fund Center তথ্য লোড করা যায়নি।' });
  }
});

router.get('/api/admin/fraud-events', requireAuth, requireAdmin, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ events: [], pagination: { page, limit, total: 0, pages: 0 } });
  }
  const filter = {};
  if (req.query.status && ['OPEN', 'REVIEWING', 'RESOLVED', 'FALSE_POSITIVE'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.riskLevel && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(req.query.riskLevel)) filter.riskLevel = req.query.riskLevel;
  if (req.query.eventType) filter.eventType = req.query.eventType;
  const [events, total] = await Promise.all([FraudEvent.find(filter)
    .populate('userId', 'uid internalUid firstName lastName username status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(), FraudEvent.countDocuments(filter)]);
  return res.json({ events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/admin/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ logs: [], pagination: { page, limit, total: 0, pages: 0 } });
  }
  const filter = {};
  if (req.query.entityType) filter.entityType = req.query.entityType;
  if (req.query.action) filter.action = req.query.action;
  const [logs, total] = await Promise.all([AuditLog.find(filter)
    .populate('actorUserId', 'uid firstName lastName username adminRole')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(), AuditLog.countDocuments(filter)]);
  return res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/api/admin/support/tickets', requireAuth, requireAdmin, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ tickets: [] });
  }
  const filter = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(req.query.status) ? { status: req.query.status } : {};
  const tickets = await SupportTicket.find(filter).populate('userId', 'uid firstName lastName username').sort({ createdAt: -1 }).limit(100).lean();
  return res.json({ tickets });
});

router.patch('/api/admin/support/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
  const { status, adminReply } = req.body || {};
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status) || typeof adminReply !== 'string' || adminReply.length > 4000) {
    return res.status(400).json({ error: 'সাপোর্ট ticket তথ্য সঠিক নয়।' });
  }
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'সাপোর্ট ticket পাওয়া যায়নি।' });
  ticket.status = status;
  ticket.adminReply = adminReply.trim();
  ticket.handledBy = req.user.id;
  ticket.handledAt = new Date();
  await ticket.save();
  await AuditService.record({ actorUserId: req.user.id, action: `SUPPORT_TICKET_${status}`, entityType: 'SupportTicket', entityId: ticket._id.toString(), details: {} });
  return res.json({ ok: true, ticket });
});

router.patch('/api/admin/fraud-events/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (hasForbiddenFields(req, res, ['userId', 'riskLevel', 'balance', 'amount'])) return;
  const { status, resolutionNote } = req.body || {};
  if (!['REVIEWING', 'RESOLVED', 'FALSE_POSITIVE'].includes(status)) {
    return res.status(400).json({ error: 'অবৈধ জালিয়াতি ইভেন্ট স্ট্যাটাস।' });
  }
  if (['RESOLVED', 'FALSE_POSITIVE'].includes(status) && (!resolutionNote || resolutionNote.trim().length < 3 || resolutionNote.length > 500)) {
    return res.status(400).json({ error: 'সমাধানের কারণ লিখুন।' });
  }
  const event = await FraudEvent.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'জালিয়াতি ইভেন্ট পাওয়া যায়নি।' });
  const previousStatus = event.status;
  event.status = status;
  event.resolvedAt = ['RESOLVED', 'FALSE_POSITIVE'].includes(status) ? new Date() : null;
  event.resolvedBy = ['RESOLVED', 'FALSE_POSITIVE'].includes(status) ? req.user.id : null;
  event.resolutionNote = ['RESOLVED', 'FALSE_POSITIVE'].includes(status) ? resolutionNote.trim() : '';
  await event.save();
  await AuditService.record({ actorUserId: req.user.id, action: `FRAUD_EVENT_${status}`, entityType: 'FraudEvent', entityId: event._id.toString(), details: { previousStatus, status, resolutionNote: event.resolutionNote } });
  return res.json({ ok: true, event });
});

router.patch('/api/admin/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (hasForbiddenFields(req, res, ['balance', 'availableBalance', 'pendingBalance', 'lifetimeEarned', 'role', 'isAdmin'])) return;
  const { status, reason } = req.body || {};
  if (!['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED'].includes(status)) {
    return res.status(400).json({ error: 'অবৈধ অ্যাকাউন্ট স্ট্যাটাস।' });
  }
  if (['RESTRICTED', 'SUSPENDED', 'CLOSED'].includes(status) && (typeof reason !== 'string' || reason.trim().length < 3 || reason.length > 500)) {
    return res.status(400).json({ error: 'অ্যাকাউন্ট status পরিবর্তনের কারণ প্রয়োজন।' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
  const previousStatus = user.status;
  user.status = status;
  await user.save();
  await AuditService.record({ actorUserId: req.user.id, action: `ACCOUNT_${status}`, entityType: 'User', entityId: user._id.toString(), details: { previousStatus, status, reason: reason?.trim() || '' } });
  return res.json({ ok: true, status: user.status });
});

export default router;
