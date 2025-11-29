import express from 'express';
import Merchant from '../models/Merchant.js';

const router = express.Router();

// Onboard a new merchant
router.post('/onboard', async (req, res) => {
  try {
    const { walletAddress, webhookUrl } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Check if merchant already exists
    let merchant = await Merchant.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (merchant) {
      // Update webhook URL if provided
      if (webhookUrl) {
        merchant.webhookUrl = webhookUrl;
        merchant.updatedAt = new Date();
        await merchant.save();
      }
      return res.json({ 
        message: 'Merchant already exists',
        merchant: {
          walletAddress: merchant.walletAddress,
          webhookUrl: merchant.webhookUrl,
          isActive: merchant.isActive
        }
      });
    }

    // Create new merchant
    merchant = new Merchant({
      walletAddress: walletAddress.toLowerCase(),
      webhookUrl: webhookUrl || null,
      isActive: true
    });

    await merchant.save();

    res.status(201).json({
      message: 'Merchant onboarded successfully',
      merchant: {
        walletAddress: merchant.walletAddress,
        webhookUrl: merchant.webhookUrl,
        isActive: merchant.isActive
      }
    });
  } catch (error) {
    console.error('Merchant onboarding error:', error);
    res.status(500).json({ error: 'Failed to onboard merchant' });
  }
});

// Get merchant by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    console.log('Get merchant request for:', walletAddress);
    
    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    
    const merchant = await Merchant.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json({
      walletAddress: merchant.walletAddress,
      webhookUrl: merchant.webhookUrl,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt
    });
  } catch (error) {
    console.error('Get merchant error:', error);
    res.status(500).json({ error: 'Failed to get merchant' });
  }
});

// Update merchant webhook
router.put('/:walletAddress/webhook', async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    const merchant = await Merchant.findOne({ 
      walletAddress: req.params.walletAddress.toLowerCase() 
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    merchant.webhookUrl = webhookUrl || null;
    merchant.updatedAt = new Date();
    await merchant.save();

    res.json({
      message: 'Webhook URL updated successfully',
      webhookUrl: merchant.webhookUrl
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Failed to update webhook URL' });
  }
});

export default router;

