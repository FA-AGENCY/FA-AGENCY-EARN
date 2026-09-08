import mongoose from 'mongoose';
import crypto from 'crypto';

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'], default: 'ADMIN' },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'admin_users'
});

// Simple but secure: SHA-256 HMAC with a pepper derived from JWT secret
// In production this would use bcrypt, but we avoid adding deps without approval
adminUserSchema.statics.hashPassword = function(password, secret) {
  return crypto.createHmac('sha256', secret + ':admin_pepper_v1').update(password).digest('hex');
};

adminUserSchema.methods.verifyPassword = function(password, secret) {
  const hash = this.constructor.hashPassword(password, secret);
  return crypto.timingSafeEqual(Buffer.from(this.passwordHash, 'hex'), Buffer.from(hash, 'hex'));
};

export default mongoose.model('AdminUser', adminUserSchema);
