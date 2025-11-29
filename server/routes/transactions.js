import express from 'express';
import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import Merchant from '../models/Merchant.js';
import { sendWebhook } from '../utils/webhook.js';
import { nanoid } from 'nanoid';

const router = express.Router();

// Create a transaction record
router.post('/create', async (req, res) => {
  try {
    const { txHash, productId, payerAddress, amount, tokenAddress, blockNumber } = req.body;

    if (!txHash || !productId || !payerAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const txRef = nanoid();

    const transaction = new Transaction({
      txHash,
      txRef,
      productId: product.productId,
      merchantAddress: product.merchantAddress,
      payerAddress: payerAddress.toLowerCase(),
      amount: amount.toString(),
      tokenAddress: tokenAddress ? tokenAddress.toLowerCase() : null,
      status: 'completed',
      blockNumber: blockNumber || null
    });

    await transaction.save();

    // Send webhook to merchant if configured
    const merchant = await Merchant.findOne({ 
      walletAddress: product.merchantAddress 
    });

    if (merchant && merchant.webhookUrl) {
      const webhookData = {
        event: 'payment.success',
        transaction: {
          txHash: transaction.txHash,
          txRef: transaction.txRef,
          productId: transaction.productId,
          productName: product.name,
          payerAddress: transaction.payerAddress,
          amount: transaction.amount,
          tokenAddress: transaction.tokenAddress,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.createdAt
        }
      };

      const webhookResult = await sendWebhook(merchant.webhookUrl, webhookData);
      transaction.webhookSent = webhookResult.success;
      transaction.webhookResponse = webhookResult;
      await transaction.save();
    }

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: {
        txHash: transaction.txHash,
        txRef: transaction.txRef,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transactions for a merchant
router.get('/merchant/:walletAddress', async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      merchantAddress: req.params.walletAddress.toLowerCase() 
    })
    .sort({ createdAt: -1 })
    .limit(100);

    // Get product names for transactions
    const transactionsWithProducts = await Promise.all(
      transactions.map(async (tx) => {
        const product = await Product.findOne({ productId: tx.productId });
        return {
          ...tx.toObject(),
          productName: product?.name || 'Unknown Product'
        };
      })
    );

    res.json(transactionsWithProducts.map(tx => ({
      id: tx._id,
      txHash: tx.txHash,
      txRef: tx.txRef,
      productId: tx.productId,
      productName: tx.productName,
      payerAddress: tx.payerAddress,
      amount: tx.amount,
      tokenAddress: tx.tokenAddress,
      status: tx.status,
      blockNumber: tx.blockNumber,
      webhookSent: tx.webhookSent,
      createdAt: tx.createdAt
    })));
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get transaction by txHash
router.get('/:txHash', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      txHash: req.params.txHash 
    }).populate('productId', 'name description imageLink');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      id: transaction._id,
      txHash: transaction.txHash,
      txRef: transaction.txRef,
      productId: transaction.productId,
      productName: transaction.productId?.name || 'Unknown',
      merchantAddress: transaction.merchantAddress,
      payerAddress: transaction.payerAddress,
      amount: transaction.amount,
      tokenAddress: transaction.tokenAddress,
      status: transaction.status,
      blockNumber: transaction.blockNumber,
      webhookSent: transaction.webhookSent,
      createdAt: transaction.createdAt
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

export default router;

