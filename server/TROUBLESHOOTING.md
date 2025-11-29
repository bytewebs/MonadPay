# Troubleshooting Guide

## Common Issues

### 404 Errors on API Endpoints

1. **Check if server is running:**
   ```bash
   # Check if server is listening on port 3000
   curl http://localhost:3000/health
   ```

2. **Verify routes are registered:**
   - Check server console for route registration messages
   - Ensure all route files are properly imported in `index.js`

3. **Check MongoDB connection:**
   - Ensure MongoDB is running
   - Verify `MONGODB_URI` in `.env` is correct

### 500 Error on Product Creation

1. **Check contract initialization:**
   - Verify `CONTRACT_ADDRESS` is set in `.env`
   - Verify `PRIVATE_KEY` is set in `.env`
   - Check server logs for contract initialization errors

2. **Check merchant exists:**
   - Merchant must be onboarded before creating products
   - Use `/api/merchants/onboard` endpoint first

3. **Check database connection:**
   - Ensure MongoDB is running and accessible
   - Check connection string in `.env`

### Server Won't Start

1. **Check environment variables:**
   ```bash
   # Create .env file if it doesn't exist
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Check dependencies:**
   ```bash
   npm install
   ```

3. **Check MongoDB:**
   - Ensure MongoDB is installed and running
   - Default connection: `mongodb://localhost:27017/paymentgateway`

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Onboard Merchant
```bash
curl -X POST http://localhost:3000/api/merchants/onboard \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xYourAddress","webhookUrl":"https://example.com/webhook"}'
```

### Get Merchant
```bash
curl http://localhost:3000/api/merchants/0xYourAddress
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products/create \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress":"0xYourAddress",
    "name":"Test Product",
    "description":"Test Description",
    "imageLink":"https://example.com/image.jpg",
    "price":"10.00"
  }'
```

## Environment Variables Checklist

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `PORT` - Server port (default: 3000)
- [ ] `FRONTEND_URL` - Frontend URL for shareable links
- [ ] `RPC_URL` - Blockchain RPC endpoint
- [ ] `CONTRACT_ADDRESS` - Deployed contract address
- [ ] `PRIVATE_KEY` - Private key for contract interactions

## Debug Mode

Enable verbose logging by checking server console output. All routes now log:
- Request method and path
- Error details
- Contract interaction results

