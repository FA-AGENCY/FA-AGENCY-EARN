import Wallet from '../models/Wallet.js';
import Withdrawal from '../models/Withdrawal.js';
import LedgerTransaction from '../models/LedgerTransaction.js';
import { AuditService } from './auditService.js';

const ALLOWED_WITHDRAWAL_TRANSITIONS = {
  PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PROCESSING', 'REJECTED'],
  PROCESSING: ['PAID', 'REJECTED']
};

export class WalletService {
  static async getOrCreateWallet(userId, session) {
    const query = Wallet.findOne({ userId });
    const existing = session ? await query.session(session) : await query;
    if (existing) return existing;
    const created = await Wallet.create([{
      userId,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarned: 0,
      lifetimeWithdrawn: 0,
      currency: 'BDT'
    }], session ? { session } : undefined);
    return Array.isArray(created) ? created[0] : created;
  }

  static async applyBalanceChange({
    userId,
    amount,
    source,
    sourceId,
    type,
    direction,
    idempotencyKey,
    referenceId,
    session
  }) {
    if (!userId || !idempotencyKey || !referenceId || !type || !direction) {
      throw new Error('Invalid ledger parameters.');
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount.');
    }

    const existing = session
      ? await LedgerTransaction.findOne({ idempotencyKey }).session(session)
      : await LedgerTransaction.findOne({ idempotencyKey });
    if (existing) {
      return { duplicate: true, transaction: existing };
    }

    const wallet = await WalletService.getOrCreateWallet(userId, session);
    const balanceBefore = Number(wallet.availableBalance || 0);
    let availableBalance = balanceBefore;
    let pendingBalance = Number(wallet.pendingBalance || 0);
    let lifetimeEarned = Number(wallet.lifetimeEarned || 0);
    let lifetimeWithdrawn = Number(wallet.lifetimeWithdrawn || 0);

    if (direction === 'CREDIT') {
      availableBalance += numericAmount;
      lifetimeEarned += numericAmount;
    } else if (direction === 'DEBIT') {
      if (availableBalance < numericAmount) {
        throw new Error('Insufficient balance.');
      }
      availableBalance -= numericAmount;
    } else {
      throw new Error('Invalid ledger direction.');
    }

    wallet.availableBalance = availableBalance;
    wallet.pendingBalance = pendingBalance;
    wallet.lifetimeEarned = lifetimeEarned;
    wallet.lifetimeWithdrawn = lifetimeWithdrawn;
    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }

    const created = await LedgerTransaction.create([{
      userId,
      type,
      amount: numericAmount,
      direction,
      source: source || type,
      sourceId: sourceId ? String(sourceId) : '',
      referenceId,
      idempotencyKey,
      balanceBefore,
      balanceAfter: availableBalance,
      status: 'POSTED'
    }], session ? { session } : undefined);

    return { duplicate: false, transaction: Array.isArray(created) ? created[0] : created, wallet };
  }

  static async reserveWithdrawal({ userId, amount, idempotencyKey, withdrawal = {} }) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount.');
    }
    if (!idempotencyKey) {
      throw new Error('idempotencyKey is required.');
    }

    const existing = await Withdrawal.findOne({ userId, idempotencyKey });
    if (existing) {
      return { duplicate: true, withdrawal: existing };
    }

    const session = await Wallet.startSession?.() || null;
    const mongoSession = session || (await import('mongoose')).default.startSession();
    let createdWithdrawal;
    try {
      await mongoSession.withTransaction(async () => {
        const wallet = await WalletService.getOrCreateWallet(userId, mongoSession);
        if (Number(wallet.availableBalance || 0) < numericAmount) {
          throw new Error('Insufficient balance.');
        }
        const balanceBefore = Number(wallet.availableBalance);
        wallet.availableBalance = balanceBefore - numericAmount;
        wallet.pendingBalance = Number(wallet.pendingBalance || 0) + numericAmount;
        await wallet.save({ session: mongoSession });

        const referenceId = `wd_${idempotencyKey}`;
        const docs = await Withdrawal.create([{
          userId,
          amount: numericAmount,
          method: withdrawal.method || 'bKash',
          destination: withdrawal.destination || '',
          referenceId,
          idempotencyKey,
          status: withdrawal.status || 'PENDING',
          note: withdrawal.note || ''
        }], { session: mongoSession });
        createdWithdrawal = docs[0];

        await LedgerTransaction.create([{
          userId,
          type: 'WITHDRAWAL',
          amount: numericAmount,
          direction: 'DEBIT',
          source: 'WITHDRAWAL',
          sourceId: String(createdWithdrawal._id),
          referenceId,
          idempotencyKey: `ledger_${idempotencyKey}`,
          balanceBefore,
          balanceAfter: wallet.availableBalance,
          status: 'PENDING'
        }], { session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    return { duplicate: false, withdrawal: createdWithdrawal };
  }

  static async updateWithdrawalStatus({ withdrawalId, status, note, adminUserId }) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found.');
    }
    const allowed = ALLOWED_WITHDRAWAL_TRANSITIONS[withdrawal.status] || [];
    if (!allowed.includes(status)) {
      throw new Error('Withdrawal lifecycle is invalid.');
    }

    const mongoSession = (await import('mongoose')).default.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        const wallet = await WalletService.getOrCreateWallet(withdrawal.userId, mongoSession);
        if (status === 'PAID') {
          if (Number(wallet.pendingBalance || 0) < Number(withdrawal.amount)) {
            throw new Error('Pending balance mismatch or already processed');
          }
          wallet.pendingBalance = Number(wallet.pendingBalance) - Number(withdrawal.amount);
          wallet.lifetimeWithdrawn = Number(wallet.lifetimeWithdrawn || 0) + Number(withdrawal.amount);
          await wallet.save({ session: mongoSession });
        }
        if (status === 'REJECTED') {
          if (Number(wallet.pendingBalance || 0) < Number(withdrawal.amount)) {
            throw new Error('Failed to refund: pending balance was not locked');
          }
          wallet.pendingBalance = Number(wallet.pendingBalance) - Number(withdrawal.amount);
          wallet.availableBalance = Number(wallet.availableBalance || 0) + Number(withdrawal.amount);
          await wallet.save({ session: mongoSession });
          await LedgerTransaction.create([{
            userId: withdrawal.userId,
            type: 'WITHDRAWAL_REVERSAL',
            amount: Number(withdrawal.amount),
            direction: 'CREDIT',
            source: 'WITHDRAWAL_REVERSAL',
            sourceId: String(withdrawal._id),
            referenceId: `wdrev_${withdrawal.idempotencyKey}`,
            idempotencyKey: `wdrev_${withdrawal.idempotencyKey}`,
            balanceBefore: Number(wallet.availableBalance) - Number(withdrawal.amount),
            balanceAfter: Number(wallet.availableBalance),
            status: 'POSTED'
          }], { session: mongoSession });
        }

        withdrawal.status = status;
        withdrawal.note = note || withdrawal.note;
        withdrawal.reviewedBy = adminUserId || withdrawal.reviewedBy;
        withdrawal.reviewedAt = new Date();
        withdrawal.updatedAt = new Date();
        await withdrawal.save({ session: mongoSession });
      });
    } finally {
      await mongoSession.endSession();
    }

    if (adminUserId) {
      await AuditService.record({
        actorUserId: adminUserId,
        action: `WITHDRAWAL_${status}`,
        entityType: 'Withdrawal',
        entityId: String(withdrawal._id),
        details: { note: note || '' }
      });
    }

    return withdrawal;
  }

  async getOrCreateWallet(userId) {
    return WalletService.getOrCreateWallet(userId);
  }

  async creditBalance(userId, amount, reason = 'reward') {
    return WalletService.applyBalanceChange({
      userId,
      amount,
      source: reason,
      sourceId: reason,
      type: 'ADMIN_ADJUSTMENT',
      direction: 'CREDIT',
      idempotencyKey: `credit_${userId}_${Date.now()}`,
      referenceId: `credit_${userId}_${Date.now()}`
    });
  }
}

const defaultWalletService = new WalletService();
export default defaultWalletService;
