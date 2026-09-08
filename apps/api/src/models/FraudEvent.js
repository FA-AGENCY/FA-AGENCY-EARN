import mongoose from 'mongoose';

const fraudEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { type: String, enum: ['DUPLICATE_AD_COMPLETION', 'RAPID_AD_COMPLETION', 'EXCESSIVE_REQUESTS', 'TASK_ABUSE', 'REFERRAL_ABUSE', 'MULTIPLE_ACCOUNT_PATTERN', 'SUSPICIOUS_WITHDRAWAL', 'REPEATED_VERIFICATION_FAILURE', 'IMPOSSIBLE_ACTIVITY'], required: true, index: true },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  status: { type: String, enum: ['OPEN', 'REVIEWING', 'RESOLVED', 'FALSE_POSITIVE'], default: 'OPEN', index: true },
  description: { type: String, required: true },
  evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'fraud_events'
});

export default mongoose.model('FraudEvent', fraudEventSchema);
