// Contract ABI - extract from your compiled contract
export const CONTRACT_ABI = [
  "function createProduct(bytes32 productId, uint256 price, address token) external",
  "function updateProduct(bytes32 productId, uint256 newPrice, bool active) external",
  "function payNative(bytes32 productId, bytes32 txRef) external payable",
  "function payERC20(bytes32 productId, bytes32 txRef) external",
  "function products(bytes32) external view returns (address merchant, uint256 price, address token, bool active)",
  "event ProductCreated(bytes32 indexed productId, address indexed merchant, uint256 price, address token)",
  "event PaymentSuccess(bytes32 indexed productId, address indexed payer, uint256 amount, address token, bytes32 indexed txRef)"
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.monad.xyz';

