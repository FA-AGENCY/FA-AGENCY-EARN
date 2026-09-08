import mongoose from 'mongoose';

const taskSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  status: { type: String, enum: ['AVAILABLE', 'STARTED', 'COMPLETED', 'VERIFICATION', 'APPROVED', 'REJECTED'], default: 'AVAILABLE' },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  verificationData: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'task_sessions'
});

taskSessionSchema.index({ userId: 1, taskId: 1 });
taskSessionSchema.index({ userId: 1, taskId: 1, status: 1 });

taskSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('TaskSession', taskSessionSchema);
