import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'settings'
});

export default mongoose.model('Setting', settingSchema);
