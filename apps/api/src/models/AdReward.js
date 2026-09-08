import mongoose from 'mongoose';

const adRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  adSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdSession', required: true, index: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'POSTED', 'REJECTED'], default: 'PENDING' },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  provider: { type: String, default: 'Monetag' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'ad_rewards'
});

export default mongoose.model('AdReward', adRewardSchema);
