import { ethers } from 'ethers';

let provider;
let contract;
let isInitialized = false;

export const initializeContract = async () => {
  const rpcUrl = process.env.RPC_URL || 'https://testnet-rpc.monad.xyz';
  const contractAddress = process.env.CONTRACT_ADDRESS;

  console.log('Initializing contract connection (read-only)...');
  console.log('RPC URL:', rpcUrl);
  console.log('Contract Address:', contractAddress);

  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS environment variable is required');
  }

  // Note: PRIVATE_KEY is no longer required since merchants sign their own transactions
  // We only need a provider for reading contract state

  try {
    // Initialize provider (read-only, no signer needed)
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test RPC connection
    const blockNumber = await provider.getBlockNumber();
    console.log('RPC connection successful. Latest block:', blockNumber);

    // Verify contract address format
    if (!ethers.isAddress(contractAddress)) {
      throw new Error(`Invalid contract address format: ${contractAddress}`);
    }
    console.log('Contract address is valid');

    const contractABI = [
      "function createProduct(bytes32 productId, uint256 price, address token) external",
      "function updateProduct(bytes32 productId, uint256 newPrice, bool active) external",
      "function payNative(bytes32 productId, bytes32 txRef) external payable",
      "function payERC20(bytes32 productId, bytes32 txRef) external",
      "function products(bytes32) external view returns (address merchant, uint256 price, address token, bool active)",
      "event ProductCreated(bytes32 indexed productId, address indexed merchant, uint256 price, address token)",
      "event PaymentSuccess(bytes32 indexed productId, address indexed payer, uint256 amount, address token, bytes32 indexed txRef)"
    ];

    // Create read-only contract (no signer needed)
    contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Try to read from contract to verify it's accessible
    try {
      // This will fail if contract doesn't exist, but that's okay - we'll catch it
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address ${contractAddress}. Make sure the contract is deployed.`);
      }
      console.log('Contract code found at address');
    } catch (error) {
      if (error.message.includes('No contract found')) {
        throw error;
      }
      console.warn('Could not verify contract code:', error.message);
    }

    isInitialized = true;
    console.log('✅ Smart contract connection initialized successfully (read-only)!');
    console.log('ℹ️  Note: Merchants sign their own transactions. No server private key needed.');
    return { provider, contract };
  } catch (error) {
    console.error('Contract initialization failed:', error.message);
    throw error;
  }
};

export const getContract = () => {
  if (!isInitialized || !contract) {
    return null;
  }
  return contract;
};

export const getProvider = () => {
  if (!isInitialized || !provider) {
    return null;
  }
  return provider;
};


export const isContractInitialized = () => isInitialized;

