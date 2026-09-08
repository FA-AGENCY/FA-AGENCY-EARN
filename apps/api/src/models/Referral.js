import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  referralCode: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'QUALIFIED', 'REWARDED', 'REJECTED'], default: 'PENDING' },
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'referrals'
});

referralSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Referral', referralSchema);
