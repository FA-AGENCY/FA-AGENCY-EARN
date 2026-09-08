import mongoose from 'mongoose';

const ledgerTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['AD_REWARD', 'TASK_REWARD', 'REFERRAL_REWARD', 'DAILY_BONUS', 'WITHDRAWAL', 'WITHDRAWAL_REVERSAL', 'ADMIN_ADJUSTMENT'], required: true },
  amount: { type: Number, required: true },
  direction: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  source: { type: String, default: '' },
  sourceId: { type: String, default: '' },
  referenceId: { type: String, required: true, unique: true, index: true, immutable: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true, immutable: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['POSTED', 'PENDING', 'REVERSED', 'REJECTED'], default: 'POSTED' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'ledger_transactions'
});

ledgerTransactionSchema.index({ userId: 1, createdAt: -1 });

for (const operation of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne']) {
  ledgerTransactionSchema.pre(operation, function() {
    throw new Error('Ledger transactions are immutable.');
  });
}

for (const operation of ['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete', 'findOneAndRemove']) {
  ledgerTransactionSchema.pre(operation, function() {
    if (process.env.ALLOW_FINANCIAL_CLEANUP === 'true') return;
    throw new Error('Financial history cannot be deleted.');
  });
}

export default mongoose.model('LedgerTransaction', ledgerTransactionSchema);
