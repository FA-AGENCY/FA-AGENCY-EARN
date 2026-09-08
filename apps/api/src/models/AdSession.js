import mongoose from 'mongoose';

const adSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['Monetag'], default: 'Monetag' },
  adType: { type: String, default: 'REWARDED_INTERSTITIAL' },
  rewardAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['CREATED', 'STARTED', 'COMPLETED', 'REWARDED', 'EXPIRED', 'REJECTED'], default: 'CREATED' },
  expiresAt: { type: Date, default: null },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  providerMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  idempotencyKey: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'ad_sessions'
});

adSessionSchema.index({ userId: 1, createdAt: -1 });
adSessionSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export default mongoose.model('AdSession', adSessionSchema);
