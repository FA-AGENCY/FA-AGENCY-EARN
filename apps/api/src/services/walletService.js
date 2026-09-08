import Wallet from '../models/Wallet.js';
import mongoose from 'mongoose';

export class WalletService {
  async getOrCreateWallet(userId) {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      });
    }
    return wallet;
  }

  async creditBalance(userId, amount, reason = 'reward') {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          balance: amount,
          totalEarned: amount
        }
      },
      { new: true, upsert: true }
    );

    return wallet;
  }

  async holdBalanceForWithdrawal(userId, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const wallet = await Wallet.findOneAndUpdate(
      {
        user: userId,
        balance: { $gte: amount }
      },
      {
        $inc: {
          balance: -amount,
          pendingBalance: amount
        }
      },
      { new: true }
    );

    if (!wallet) {
      throw new Error('Insufficient balance or wallet locked');
    }

    return wallet;
  }

  async finalizeWithdrawal(userId, amount) {
    const wallet = await Wallet.findOneAndUpdate(
      {
        user: userId,
        pendingBalance: { $gte: amount }
      },
      {
        $inc: {
          pendingBalance: -amount,
          totalWithdrawn: amount
        }
      },
      { new: true }
    );

    if (!wallet) {
      throw new Error('Pending balance mismatch or already processed');
    }

    return wallet;
  }

  async refundWithdrawal(userId, amount) {
    const wallet = await Wallet.findOneAndUpdate(
      {
        user: userId,
        pendingBalance: { $gte: amount }
      },
      {
        $inc: {
          pendingBalance: -amount,
          balance: amount
        }
      },
      { new: true }
    );

    if (!wallet) {
      throw new Error('Failed to refund: pending balance was not locked');
    }

    return wallet;
  }
}

const defaultWalletService = new WalletService();
export default defaultWalletService;
