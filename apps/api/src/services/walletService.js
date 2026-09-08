import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import LedgerTransaction from '../models/LedgerTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import { AuditService } from './auditService.js';

const toMoney = (value) => Number(Number(value).toFixed(2));

export class WalletService {
  static async applyBalanceChange({ userId, amount, type, direction, source, sourceId, idempotencyKey, referenceId = idempotencyKey, session, releasePending = false }) {
    const normalizedAmount = toMoney(amount);
    if (!userId || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0 || !idempotencyKey || !referenceId) {
      throw new Error('Invalid wallet transaction parameters.');
    }

    const existing = await LedgerTransaction.findOne({ idempotencyKey }).session(session || null).lean();
    if (existing) {
      return { duplicate: true, transaction: existing };
    }

    const ownSession = !session;
    const activeSession = session || await mongoose.startSession();

    try {
      let result;
      const execute = async () => {
        const wallet = await Wallet.findOne({ userId }).session(activeSession);
        if (!wallet) {
          throw new Error('Wallet not found.');
        }

        const before = toMoney(wallet.availableBalance);
        const after = direction === 'CREDIT'
          ? toMoney(before + normalizedAmount)
          : toMoney(before - normalizedAmount);

        if (after < 0) {
          throw new Error('Insufficient balance.');
        }

        wallet.availableBalance = after;
        if (direction === 'CREDIT' && !releasePending) {
          wallet.lifetimeEarned = toMoney(wallet.lifetimeEarned + normalizedAmount);
        }
        if (direction === 'CREDIT' && releasePending) {
          wallet.pendingBalance = toMoney(Math.max(0, wallet.pendingBalance - normalizedAmount));
        } else {
          if (direction === 'DEBIT') {
            wallet.pendingBalance = toMoney(wallet.pendingBalance + normalizedAmount);
          }
        }
        await wallet.save({ session: activeSession });

        const [transaction] = await LedgerTransaction.create([{
          userId,
          type,
          amount: normalizedAmount,
          direction,
          source,
          sourceId,
          referenceId,
          idempotencyKey,
          balanceBefore: before,
          balanceAfter: after,
          status: 'POSTED',
          metadata: { idempotencyKey }
        }], { session: activeSession });

        result = { duplicate: false, transaction };
      };

      if (ownSession) {
        await activeSession.withTransaction(execute);
      } else {
        await execute();
      }

      return result;
    } catch (error) {
      if (error?.code === 11000) {
        const duplicate = await LedgerTransaction.findOne({ idempotencyKey }).session(session || null).lean();
        if (duplicate) {
          return { duplicate: true, transaction: duplicate };
        }
      }
      throw error;
    } finally {
      if (ownSession) {
        await activeSession.endSession();
      }
    }
  }

  static async reserveWithdrawal({ userId, amount, withdrawal, idempotencyKey }) {
    const session = await mongoose.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        const existing = await LedgerTransaction.findOne({ idempotencyKey }).session(session).lean();
        if (existing) {
          const existingWithdrawal = await Withdrawal.findOne({ idempotencyKey }).session(session).lean();
          result = { duplicate: true, transaction: existing, withdrawal: existingWithdrawal };
          return;
        }

        const existingPending = await Withdrawal.findOne({
          userId,
          status: { $in: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'] }
        }).session(session).lean();
        if (existingPending) {
          throw new Error('An active withdrawal already exists.');
        }

        const normalizedAmount = toMoney(amount);
        const wallet = await Wallet.findOne({ userId }).session(session);
        if (!wallet) {
          throw new Error('Wallet not found.');
        }

        const before = toMoney(wallet.availableBalance);
        const after = toMoney(before - normalizedAmount);
        if (after < 0) {
          throw new Error('Insufficient balance.');
        }

        wallet.availableBalance = after;
        wallet.pendingBalance = toMoney(wallet.pendingBalance + normalizedAmount);
        await wallet.save({ session });

        const [createdWithdrawal] = await Withdrawal.create([{
          ...withdrawal,
          userId,
          amount: normalizedAmount,
          referenceId: withdrawal.referenceId || idempotencyKey,
          idempotencyKey,
          status: withdrawal.status || 'PENDING'
        }], { session });

        const [transaction] = await LedgerTransaction.create([{
          userId,
          type: 'WITHDRAWAL',
          amount: normalizedAmount,
          direction: 'DEBIT',
          source: 'WITHDRAWAL',
          sourceId: createdWithdrawal._id.toString(),
          referenceId: idempotencyKey,
          idempotencyKey,
          balanceBefore: before,
          balanceAfter: after,
          status: 'POSTED',
          metadata: { withdrawalId: createdWithdrawal._id.toString() }
        }], { session });

        result = { duplicate: false, withdrawal: createdWithdrawal, transaction };
        await AuditService.record({
          actorUserId: userId,
          action: 'WITHDRAWAL_CREATED',
          entityType: 'Withdrawal',
          entityId: createdWithdrawal._id.toString(),
          details: { amount: normalizedAmount, status: createdWithdrawal.status },
          session
        });
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  static async reverseWithdrawal({ withdrawal, idempotencyKey }) {
    return this.applyBalanceChange({
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      type: 'WITHDRAWAL_REVERSAL',
      direction: 'CREDIT',
      source: 'WITHDRAWAL_REVERSAL',
      sourceId: withdrawal._id.toString(),
      idempotencyKey,
      referenceId: idempotencyKey,
      releasePending: true
    });
  }

  static async updateWithdrawalStatus({ withdrawalId, status, note, adminUserId }) {
    const session = await mongoose.startSession();
    let updatedWithdrawal;

    try {
      await session.withTransaction(async () => {
        const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
        if (!withdrawal) {
          throw new Error('Withdrawal not found.');
        }

        const allowedTransitions = {
          PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
          UNDER_REVIEW: ['APPROVED', 'REJECTED'],
          APPROVED: ['PROCESSING', 'REJECTED'],
          PROCESSING: ['PAID', 'REJECTED']
        };
        if (!allowedTransitions[withdrawal.status]?.includes(status)) {
          throw new Error(`Invalid withdrawal transition: ${withdrawal.status} to ${status}.`);
        }

        if (status === 'REJECTED') {
          await this.applyBalanceChange({
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: 'WITHDRAWAL_REVERSAL',
            direction: 'CREDIT',
            source: 'WITHDRAWAL_REVERSAL',
            sourceId: withdrawal._id.toString(),
            idempotencyKey: `withdrawal_reversal_${withdrawal._id}`,
            referenceId: `withdrawal_reversal_${withdrawal._id}`,
            session,
            releasePending: true
          });
        }

        const previousStatus = withdrawal.status;
        if (status === 'PAID') {
          const wallet = await Wallet.findOne({ userId: withdrawal.userId }).session(session);
          if (!wallet) {
            throw new Error('Wallet not found.');
          }
          wallet.pendingBalance = toMoney(Math.max(0, wallet.pendingBalance - withdrawal.amount));
          wallet.lifetimeWithdrawn = toMoney(wallet.lifetimeWithdrawn + withdrawal.amount);
          await wallet.save({ session });
        }

        withdrawal.status = status;
        withdrawal.note = note || withdrawal.note;
        withdrawal.reviewedBy = adminUserId;
        withdrawal.reviewedAt = new Date();
        withdrawal.updatedAt = new Date();
        updatedWithdrawal = await withdrawal.save({ session });
        await AuditService.record({
          actorUserId: adminUserId,
          action: `WITHDRAWAL_${status}`,
          entityType: 'Withdrawal',
          entityId: withdrawal._id.toString(),
          details: { previousStatus, status, note: note || '' },
          session
        });
      });

      return updatedWithdrawal;
    } finally {
      await session.endSession();
    }
  }
}
