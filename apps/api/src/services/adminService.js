import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import FraudEvent from '../models/FraudEvent.js';
import LedgerTransaction from '../models/LedgerTransaction.js';
import AdReward from '../models/AdReward.js';

export class AdminService {
  async getAdminDashboard() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const rewardTypes = ['AD_REWARD', 'TASK_REWARD', 'REFERRAL_REWARD', 'DAILY_BONUS'];

    const [users, withdrawals, fraud, rewardTotals] = await Promise.all([
      User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Withdrawal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
      FraudEvent.aggregate([
        { $match: { status: { $in: ['OPEN', 'REVIEWING'] } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      Promise.all([
        LedgerTransaction.aggregate([{ $match: { type: { $in: rewardTypes }, direction: 'CREDIT' } }, { $group: { _id: null, amount: { $sum: '$amount' } } }]),
        AdReward.aggregate([{ $match: { status: 'POSTED' } }, { $group: { _id: null, amount: { $sum: '$amount' } } }]),
        User.countDocuments({ createdAt: { $gte: today } })
      ])
    ]);

    const countBy = (items, key) => items.find((item) => item._id === key)?.count || 0;
    const withdrawalBy = (key) => withdrawals.find((item) => item._id === key) || { count: 0, amount: 0 };
    const rewardAmount = rewardTotals[0][0]?.amount ?? null;
    return {
      totalUsers: users.reduce((total, item) => total + item.count, 0),
      activeUsers: countBy(users, 'ACTIVE'),
      restrictedUsers: countBy(users, 'RESTRICTED'),
      suspendedUsers: countBy(users, 'SUSPENDED'),
      closedUsers: countBy(users, 'CLOSED'),
      totalEarnings: rewardAmount,
      totalRewards: rewardAmount,
      newUsersToday: rewardTotals[2],
      grossRevenue: null,
      pendingWithdrawals: withdrawalBy('PENDING'),
      underReviewWithdrawals: withdrawalBy('UNDER_REVIEW'),
      processingWithdrawals: withdrawalBy('PROCESSING'),
      paidWithdrawals: withdrawalBy('PAID'),
      rejectedWithdrawals: withdrawalBy('REJECTED'),
      openFraudEvents: fraud.reduce((total, item) => total + item.count, 0),
      highRiskEvents: countBy(fraud, 'HIGH') + countBy(fraud, 'CRITICAL'),
      criticalRiskEvents: countBy(fraud, 'CRITICAL')
    };
  }
}
