import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  lifetimeEarned: { type: Number, default: 0 },
  lifetimeWithdrawn: { type: Number, default: 0 },
  currency: { type: String, default: 'BDT' },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'wallets'
});

walletSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Wallet', walletSchema);
