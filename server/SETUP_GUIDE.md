# Setup Guide for Smart Contract Integration

## ✅ Important: No Private Key Needed!

**Merchants sign their own transactions!** The server only needs to read from the contract, not write to it. This is much more secure and follows best practices.

## Environment Variables Required

### 1. Contract Address ✅
You have this set:
```
CONTRACT_ADDRESS=0x41B2c7dA4AaED9C270E77388664a2C4F1445DeDC
```

### 2. RPC URL
For Monad Testnet, use:
```
RPC_URL=https://testnet-rpc.monad.xyz
```

Or if you have a different testnet RPC:
```
RPC_URL=your_testnet_rpc_url_here
```

**Note:** The server only needs the RPC URL to verify transactions. Merchants sign transactions using their own wallets in the frontend.

## Complete .env File Example

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/paymentgateway

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Blockchain - Monad Testnet
RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x41B2c7dA4AaED9C270E77388664a2C4F1445DeDC

# Optional
NODE_ENV=development
```

**Note:** No PRIVATE_KEY needed! Merchants sign their own transactions.

## Verification Steps

1. **Check your server logs** when starting:
   ```bash
   cd server
   npm run dev
   ```

2. **Look for these messages:**
   - ✅ `RPC connection successful. Latest block: [number]`
   - ✅ `Signer address: 0x...`
   - ✅ `Contract code found at address`
   - ✅ `Smart contract initialized successfully!`

3. **Test the health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "contractInitialized": true,
     "contractAddress": "0x41B2c7dA4AaED9C270E77388664a2C4F1445DeDC",
     "hasPrivateKey": true
   }
   ```

## How It Works

1. **Merchant creates product:**
   - Frontend generates product ID and on-chain product ID
   - Merchant's wallet signs the `createProduct` transaction
   - Transaction is sent to blockchain
   - After confirmation, frontend sends transaction hash to backend
   - Backend verifies transaction and saves product to MongoDB

2. **Security Benefits:**
   - No server private key needed
   - Merchants control their own transactions
   - Server only verifies transactions (read-only)
   - More secure and decentralized

## Common Issues

### Issue: "No contract found at address"
**Solution:** 
- Verify the contract address is correct
- Make sure you're using the correct RPC URL for the network where the contract is deployed
- Check that the contract was actually deployed successfully

### Issue: "RPC connection failed"
**Solution:**
- Check your RPC_URL is correct for Monad testnet
- Try: `https://testnet-rpc.monad.xyz`
- Verify your internet connection

### Issue: "Insufficient funds" (on merchant side)
**Solution:**
- The merchant's wallet needs testnet tokens to pay for gas
- Merchants should get testnet tokens from Monad testnet faucet
- This is the merchant's responsibility, not the server's

## Getting Testnet Tokens

Merchants need testnet tokens in their wallets to pay for gas when creating products. Check Monad documentation for testnet faucet information.

