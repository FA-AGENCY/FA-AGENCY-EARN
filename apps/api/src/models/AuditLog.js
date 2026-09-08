import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  entityType: { type: String, default: '' },
  entityId: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'audit_logs'
});

export default mongoose.model('AuditLog', auditLogSchema);
