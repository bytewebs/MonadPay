import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  merchantAddress: {
    type: String,
    required: true,
    lowercase: true,
    ref: 'Merchant'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageLink: {
    type: String,
    default: ''
  },
  price: {
    type: String, // Store as string to handle large numbers
    required: true
  },
  tokenAddress: {
    type: String,
    default: null, // null for native token (ETH), address for ERC20
    lowercase: true
  },
  onChainProductId: {
    type: String,
    required: true // bytes32 from smart contract
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shareableLink: {
    type: String,
    required: true,
    unique: true
  },
  creationTxHash: {
    type: String,
    default: null
  },
  creationBlockNumber: {
    type: Number,
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

productSchema.index({ merchantAddress: 1 });
productSchema.index({ shareableLink: 1 });

export default mongoose.model('Product', productSchema);

