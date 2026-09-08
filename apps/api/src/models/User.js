import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  uid: { type: String, required: true, unique: true },
  internalUid: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  languageCode: { type: String, default: 'bn' },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED', 'BANNED'], default: 'ACTIVE' },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  fraudScore: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null },
  lastAdAt: { type: Date, default: null },
  dailyAdHistory: [{ type: Date }],
  isAdmin: { type: Boolean, default: false },
  adminRole: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', null], default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'users'
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', userSchema);
