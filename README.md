# MonadPay 

A decentralized payment gateway built on Monad blockchain with smart contract integration.

## Features

- **Merchant Onboarding**: Merchants can onboard with webhook URLs for payment notifications
- **Product Creation**: Create products that are saved both in MongoDB and on-chain
- **Shareable Payment Links**: Generate unique links for each product that can be embedded anywhere
- **Payment Processing**: Support for both native (ETH) and ERC20 token payments
- **Transaction Tracking**: Real-time transaction history for merchants
- **Webhook Integration**: Automatic webhook notifications to merchants on payment completion

## Setup

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- Contract address (deploy your smart contract first)
- Private key for contract interactions
- RPC URL

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_CONTRACT_ADDRESS=your_contract_address_here
VITE_RPC_URL=https://rpc.monad.xyz
```

4. Start the development server:
```bash
npm run dev
```

## Smart Contract Deployment

1. Deploy the `MonadPay.sol` contract to Monad network
2. Update `CONTRACT_ADDRESS` in both backend and frontend `.env` files
3. Ensure the contract owner has set the fee recipient and platform fee

## Usage

1. **Merchant Onboarding**: 
   - Connect wallet on the dashboard
   - Go to Settings tab
   - Enter webhook URL (optional)
   - Click "Onboard as Merchant"

2. **Create Product**:
   - Go to Products tab
   - Click "Add Product"
   - Fill in product details
   - Product is created on-chain and in database
   - Copy the shareable link

3. **Payment Flow**:
   - Share the payment link with customers
   - Customers can pay using the link
   - Transaction is recorded on-chain
   - Webhook is sent to merchant (if configured)
   - Transaction appears in merchant dashboard

## API Endpoints

### Merchants
- `POST /api/merchants/onboard` - Onboard a merchant
- `GET /api/merchants/:walletAddress` - Get merchant info
- `PUT /api/merchants/:walletAddress/webhook` - Update webhook URL

### Products
- `POST /api/products/create` - Create a product
- `GET /api/products/merchant/:walletAddress` - Get merchant's products
- `GET /api/products/link/:shareableLink` - Get product by shareable link

### Transactions
- `POST /api/transactions/create` - Record a transaction
- `GET /api/transactions/merchant/:walletAddress` - Get merchant's transactions

## Webhook Format

When a payment is completed, the following payload is sent to the merchant's webhook URL:

```json
{
  "event": "payment.success",
  "transaction": {
    "txHash": "0x...",
    "txRef": "...",
    "productId": "...",
    "productName": "...",
    "payerAddress": "0x...",
    "amount": "100.00",
    "tokenAddress": null,
    "blockNumber": 12345,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## License

MIT

