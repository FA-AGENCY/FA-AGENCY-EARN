import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  method: { type: String, enum: ['bKash', 'Nagad', 'Rocket', 'Bank'], required: true },
  number: { type: String, default: '' },
  accountName: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'payment_methods'
});

export default mongoose.model('PaymentMethod', paymentMethodSchema);
