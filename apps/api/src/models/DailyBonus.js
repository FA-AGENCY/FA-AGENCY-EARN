import mongoose from 'mongoose';

const dailyBonusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  periodKey: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'CLAIMED', 'REJECTED'], default: 'AVAILABLE' },
  claimedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'daily_bonuses'
});

dailyBonusSchema.index({ userId: 1, periodKey: 1 }, { unique: true });

export default mongoose.model('DailyBonus', dailyBonusSchema);
