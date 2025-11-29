const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Merchant endpoints
  onboardMerchant: async (walletAddress, webhookUrl) => {
    const response = await fetch(`${API_BASE_URL}/merchants/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, webhookUrl })
    });
    return response.json();
  },

  getMerchant: async (walletAddress) => {
    const response = await fetch(`${API_BASE_URL}/merchants/${walletAddress}`);
    return response.json();
  },

  updateWebhook: async (walletAddress, webhookUrl) => {
    const response = await fetch(`${API_BASE_URL}/merchants/${walletAddress}/webhook`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl })
    });
    return response.json();
  },

  // Product endpoints
  createProduct: async (merchantAddress, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantAddress,
        name: productData.name,
        description: productData.description,
        imageLink: productData.imageLink,
        price: productData.price,
        tokenAddress: productData.tokenAddress || null,
        productId: productData.productId,
        onChainProductId: productData.onChainProductId,
        txHash: productData.txHash,
        blockNumber: productData.blockNumber
      })
    });
    return response.json();
  },

  getMerchantProducts: async (walletAddress) => {
    const response = await fetch(`${API_BASE_URL}/products/merchant/${walletAddress}`);
    return response.json();
  },

  getProductByLink: async (shareableLink) => {
    const response = await fetch(`${API_BASE_URL}/products/link/${shareableLink}`);
    return response.json();
  },

  // Transaction endpoints
  getMerchantTransactions: async (walletAddress) => {
    const response = await fetch(`${API_BASE_URL}/transactions/merchant/${walletAddress}`);
    return response.json();
  },

  createTransaction: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  }
};

