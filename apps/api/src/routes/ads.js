import express from 'express';
import AdReward from '../models/AdReward.js';
import walletService from '../services/walletService.js';
import monetagService from '../services/monetagService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const AD_REWARD_AMOUNT = 0.50;
const DAILY_AD_LIMIT = 30;

router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayAdsCount = await AdReward.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay }
    });

    if (todayAdsCount >= DAILY_AD_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'আজকের বিজ্ঞাপনের সীমা শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন।'
      });
    }

    const lastAd = await AdReward.findOne({ user: userId }).sort({ createdAt: -1 });
    if (lastAd && !monetagService.isEligibleForNextAd(lastAd.createdAt)) {
      return res.status(429).json({
        success: false,
        message: 'অতিরিক্ত দ্রুত ক্লেইম করা যাবে না। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'
      });
    }

    await walletService.creditBalance(userId, AD_REWARD_AMOUNT, 'ad_reward');

    const rewardRecord = await AdReward.create({
      user: userId,
      rewardAmount: AD_REWARD_AMOUNT,
      createdAt: new Date()
    });

    return res.json({
      success: true,
      message: 'বিজ্ঞাপনের রিওয়ার্ড সফলভাবে যুক্ত হয়েছে!',
      reward: AD_REWARD_AMOUNT,
      remainingToday: DAILY_AD_LIMIT - (todayAdsCount + 1),
      data: rewardRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'রিওয়ার্ড প্রসেস করতে সমস্যা হয়েছে।'
    });
  }
});

router.post('/postback', async (req, res) => {
  try {
    const signature = req.headers['x-monetag-signature'];
    const { userId, zoneId } = req.body;

    if (!monetagService.verifyPostbackSignature(req.body, signature)) {
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    if (userId) {
      await walletService.creditBalance(userId, AD_REWARD_AMOUNT, 's2s_ad_reward');
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

export default router;
