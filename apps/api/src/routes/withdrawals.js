import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import walletService from '../services/walletService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { amount, method, accountNumber } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক টাকার পরিমাণ উল্লেখ করুন।'
      });
    }

    if (!method || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'পেমেন্ট মেথড এবং অ্যাকাউন্ট নম্বর প্রদান করুন।'
      });
    }

    const hasPendingWithdrawal = await Withdrawal.findOne({
      user: userId,
      status: 'pending'
    });

    if (hasPendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'আপনার একটি উইথড্রল রিকোয়েস্ট ইতিমধ্যে প্রক্রিয়াধীন রয়েছে।'
      });
    }

    try {
      await walletService.holdBalanceForWithdrawal(userId, numericAmount);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'পর্যাপ্ত ব্যালেন্স নেই অথবা ওয়ালেট লক রয়েছে।'
      });
    }

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount: numericAmount,
      method,
      accountNumber,
      status: 'pending',
      requestedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'উইথড্রল রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে।',
      data: withdrawal
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'সার্ভার সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'
    });
  }
});

router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'উইথড্রল পাওয়া যায়নি অথবা এটি ইতিমধ্যে সম্পন্ন হয়েছে।'
      });
    }

    await walletService.finalizeWithdrawal(withdrawal.user, withdrawal.amount);

    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return res.json({
      success: true,
      message: 'উইথড্রল সফলভাবে অনুমোদন করা হয়েছে।',
      data: withdrawal
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'উইথড্রল অনুমোদন ব্যর্থ হয়েছে।'
    });
  }
});

router.post('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'উইথড্রল পাওয়া যায়নি অথবা এটি ইতিমধ্যে সম্পন্ন হয়েছে।'
      });
    }

    await walletService.refundWithdrawal(withdrawal.user, withdrawal.amount);

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason || 'অ্যাডমিন কর্তৃক বাতিল করা হয়েছে';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return res.json({
      success: true,
      message: 'উইথড্রল বাতিল করা হয়েছে এবং টাকা ওয়ালেটে ফেরত পাঠানো হয়েছে।',
      data: withdrawal
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'উইথড্রল বাতিল ব্যর্থ হয়েছে।'
    });
  }
});

export default router;
