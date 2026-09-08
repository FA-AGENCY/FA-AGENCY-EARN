import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  reward: { type: Number, required: true },
  category: { type: String, enum: ['Telegram', 'Web', 'Video', 'Sponsored', 'Survey', 'App', 'Other'], default: 'Other' },
  taskType: { type: String, enum: ['TELEGRAM_JOIN', 'TELEGRAM_BOT_START', 'WEBSITE_VISIT', 'VIDEO_WATCH', 'SURVEY', 'APP_ACTIVITY', 'CUSTOM'], required: true },
  instructions: { type: String, default: '' },
  verificationType: { type: String, enum: ['MANUAL', 'AUTO', 'URL', 'BOT', 'CUSTOM'], default: 'AUTO' },
  status: { type: String, enum: ['AVAILABLE', 'HIDDEN', 'CLOSED'], default: 'AVAILABLE' },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  dailyLimit: { type: Number, default: 10 },
  globalLimit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'tasks'
});

taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Task', taskSchema);
