import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  reviewNote: { type: String, default: '', maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'task_submissions'
});

export default mongoose.model('TaskSubmission', taskSubmissionSchema);
