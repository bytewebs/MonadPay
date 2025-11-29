import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { initializeContract, isContractInitialized } from './config/contract.js';
import merchantRoutes from './routes/merchants.js';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
connectDB();

// Initialize smart contract (make it optional to allow server to start without contract)
let contractInitialized = false;
(async () => {
  try {
    await initializeContract();
    contractInitialized = true;
  } catch (error) {
    console.error('❌ Smart contract initialization error:', error.message);
    console.error('Full error:', error);
    console.warn('⚠️  Server will continue without contract functionality');
    console.warn('⚠️  Product creation will fail until contract is properly configured');
    contractInitialized = false;
  }
})();

// Routes
app.use('/api/merchants', merchantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    contractInitialized: isContractInitialized(),
    contractAddress: process.env.CONTRACT_ADDRESS || 'not set',
    note: 'Merchants sign their own transactions - no server private key needed'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
