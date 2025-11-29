import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  txRef: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  merchantAddress: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'Merchant'
  },
  payerAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  amount: {
    type: String, // Store as string to handle large numbers
    required: true
  },
  tokenAddress: {
    type: String,
    default: null, // null for native token
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number,
    default: null
  },
  webhookSent: {
    type: Boolean,
    default: false
  },
  webhookResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ merchantAddress: 1 });
transactionSchema.index({ payerAddress: 1 });
transactionSchema.index({ productId: 1 });
transactionSchema.index({ txHash: 1 });

export default mongoose.model('Transaction', transactionSchema);

