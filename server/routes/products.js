import express from 'express';
import { nanoid } from 'nanoid';
import { ethers } from 'ethers';
import Product from '../models/Product.js';
import Merchant from '../models/Merchant.js';
import { getProvider } from '../config/contract.js';

const router = express.Router();

// Create a new product (after on-chain transaction is confirmed)
router.post('/create', async (req, res) => {
  try {
    const { merchantAddress, name, description, imageLink, price, tokenAddress, productId, onChainProductId, txHash, blockNumber } = req.body;

    console.log('Product creation request:', { merchantAddress, name, price, txHash });

    if (!merchantAddress || !name || !price || !productId || !onChainProductId || !txHash) {
      return res.status(400).json({ 
        error: 'Merchant address, name, price, productId, onChainProductId, and txHash are required' 
      });
    }

    // Verify merchant exists
    const merchant = await Merchant.findOne({ 
      walletAddress: merchantAddress.toLowerCase() 
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found. Please onboard first.' });
    }

    // Verify transaction exists on-chain (optional but recommended)
    try {
      const provider = getProvider();
      if (provider) {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
          return res.status(400).json({ error: 'Transaction not found on-chain' });
        }
        
        // Verify transaction was successful
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt || receipt.status !== 1) {
          return res.status(400).json({ error: 'Transaction failed on-chain' });
        }
        
        // Verify the transaction is from the correct merchant
        if (receipt.from.toLowerCase() !== merchantAddress.toLowerCase()) {
          return res.status(400).json({ error: 'Transaction sender does not match merchant address' });
        }
        
        console.log('Transaction verified on-chain:', txHash);
      }
    } catch (error) {
      console.warn('Could not verify transaction on-chain:', error.message);
      // Continue anyway - transaction might be valid but we can't verify right now
    }

    // Generate shareable link
    const shareableLink = nanoid(12); // Shorter ID for shareable link

    // Check if product already exists
    const existingProduct = await Product.findOne({ productId });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this ID already exists' });
    }

    // Save product to MongoDB
    const product = new Product({
      productId,
      merchantAddress: merchantAddress.toLowerCase(),
      name,
      description: description || '',
      imageLink: imageLink || '',
      price: price.toString(),
      tokenAddress: tokenAddress ? tokenAddress.toLowerCase() : null,
      onChainProductId,
      isActive: true,
      shareableLink,
      creationTxHash: txHash,
      creationBlockNumber: blockNumber || null
    });

    await product.save();
    console.log('Product saved to database:', product.productId);

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: product._id,
        productId: product.productId,
        name: product.name,
        price: product.price,
        shareableLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${product.shareableLink}`,
        isActive: product.isActive
      }
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message || 'Unknown error'
    });
  }
});

// Get all products for a merchant
router.get('/merchant/:walletAddress', async (req, res) => {
  try {
    const products = await Product.find({ 
      merchantAddress: req.params.walletAddress.toLowerCase() 
    }).sort({ createdAt: -1 });

    res.json(products.map(product => ({
      id: product._id,
      productId: product.productId,
      name: product.name,
      description: product.description,
      imageLink: product.imageLink,
      price: product.price,
      tokenAddress: product.tokenAddress,
      isActive: product.isActive,
      shareableLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${product.shareableLink}`,
      createdAt: product.createdAt
    })));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get product by shareable link
router.get('/link/:shareableLink', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      shareableLink: req.params.shareableLink 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ error: 'Product is not active' });
    }

    res.json({
      id: product._id,
      productId: product.productId,
      onChainProductId: product.onChainProductId,
      name: product.name,
      description: product.description,
      imageLink: product.imageLink,
      price: product.price,
      tokenAddress: product.tokenAddress,
      merchantAddress: product.merchantAddress
    });
  } catch (error) {
    console.error('Get product by link error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Update product
router.put('/:productId', async (req, res) => {
  try {
    const { price, isActive } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Note: Product updates should be done by the merchant on-chain
    // This endpoint only updates the MongoDB record
    // The merchant should call updateProduct on the contract first, then update here

    // Update MongoDB
    if (price !== undefined) product.price = price.toString();
    if (isActive !== undefined) product.isActive = isActive;
    product.updatedAt = new Date();
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        isActive: product.isActive
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;

