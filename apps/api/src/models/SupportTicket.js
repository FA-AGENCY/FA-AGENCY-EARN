import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
  adminReply: { type: String, default: '', maxlength: 4000 },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  handledAt: { type: Date, default: null }
}, {
  collection: 'support_tickets',
  timestamps: true
});

supportTicketSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
