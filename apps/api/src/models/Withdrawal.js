import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  method: { type: String, enum: ['bKash', 'Nagad', 'Rocket', 'Bank'], default: 'bKash' },
  destination: { type: String, default: '' },
  referenceId: { type: String, required: true, unique: true, index: true, immutable: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true, immutable: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  note: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'withdrawals'
});

withdrawalSchema.index({ userId: 1, createdAt: -1 });

for (const operation of ['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete', 'findOneAndRemove']) {
  withdrawalSchema.pre(operation, function() {
    if (process.env.ALLOW_FINANCIAL_CLEANUP === 'true') return;
    throw new Error('Financial history cannot be deleted.');
  });
}

export default mongoose.model('Withdrawal', withdrawalSchema);
