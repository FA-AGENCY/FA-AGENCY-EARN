import mongoose from 'mongoose';

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  telegramId: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'login_events',
  timestamps: true
});

loginEventSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('LoginEvent', loginEventSchema);
