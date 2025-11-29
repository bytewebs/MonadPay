import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy, useWallets, useLogin, useLogout } from '@privy-io/react-auth';
import { api } from '../utils/api';
import { CONTRACT_ABI, CONTRACT_ADDRESS, RPC_URL } from '../config/contract';

function PaymentPage() {
  const { shareableLink } = useParams();
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const { login } = useLogin();
  const { logout } = useLogout();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const result = await api.getProductByLink(shareableLink);
        if (result.error) {
          setError(result.error);
        } else {
          setProduct(result);
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Load product error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shareableLink) {
      loadProduct();
    }
  }, [shareableLink]);

  const handleConnectWallet = () => {
    if (ready && !authenticated) {
      login();
    } else if (authenticated && wallets.length > 1) {
      setShowWalletSelector(true);
    }
  };

  const handleSelectWallet = (index) => {
    setSelectedWalletIndex(index);
    setShowWalletSelector(false);
  };

  const handleDisconnect = () => {
    logout();
    setSelectedWalletIndex(0);
    setShowWalletSelector(false);
    setSuccess(false);
    setTxHash('');
  };

  const handlePayment = async () => {
    if (!authenticated || !wallets[0]) {
      setError('Please connect your wallet first');
      return;
    }

    if (!product) return;

    setPaying(true);
    setError('');
    setSuccess(false);

    try {
      // Get the selected wallet provider from Privy
      const wallet = wallets[selectedWalletIndex] || wallets[0];
      if (!wallet) {
        throw new Error('No wallet available');
      }

      // Get the Ethereum provider from Privy wallet
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Generate transaction reference
      const txRef = ethers.id(Date.now().toString() + Math.random().toString());

      let tx;
      if (product.tokenAddress === null || product.tokenAddress === ethers.ZeroAddress) {
        // Native payment
        const priceInWei = ethers.parseEther(product.price);
        tx = await contract.payNative(product.onChainProductId, txRef, {
          value: priceInWei
        });
      } else {
        // ERC20 payment
        tx = await contract.payERC20(product.onChainProductId, txRef);
      }

      // Wait for transaction
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setSuccess(true);

      // Record transaction in backend
      try {
        await api.createTransaction({
          txHash: receipt.hash,
          productId: product.productId,
          payerAddress: await signer.getAddress(),
          amount: product.price,
          tokenAddress: product.tokenAddress,
          blockNumber: receipt.blockNumber
        });
      } catch (err) {
        console.error('Failed to record transaction:', err);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.reason || err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-sm font-medium tracking-wide"
          >
            Loading product...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#1a1a1a]/90 to-[#252525]/90 border border-red-500/30 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-3">Product Not Found</h2>
          <p className="text-gray-400">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-br from-[#1a1a1a]/95 via-[#1f1f1f]/95 to-[#252525]/95 border border-white/10 rounded-3xl p-8 md:p-10 max-w-2xl w-full shadow-2xl backdrop-blur-xl relative z-10"
      >
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-8 border border-green-500/30"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-12 h-12 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Payment Successful!
              </h2>
              <p className="text-gray-400 mb-8 text-lg">Your transaction has been completed.</p>
              {txHash && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm"
                >
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Transaction Hash</p>
                  <a
                    href={`https://testnet.monvision.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-mono text-sm break-all transition-colors flex items-center gap-2 justify-center group"
                  >
                    {txHash}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">{product.name}</h1>
                <p className="text-lg text-gray-400 leading-relaxed">{product.description}</p>
              </motion.div>

              {product.imageLink && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full h-72 rounded-2xl overflow-hidden mb-8 bg-[#0a0a0a]/50 border border-white/10 relative group"
                >
                  <img
                    src={product.imageLink}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#0a0a0a]/80 to-[#1a1a1a]/80 border border-white/10 rounded-2xl p-8 mb-6 backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Total Amount</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>
                  {product.tokenAddress && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Token Address</p>
                      <p className="text-sm text-gray-400 font-mono">{product.tokenAddress.slice(0, 8)}...{product.tokenAddress.slice(-6)}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm backdrop-blur-sm flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {authenticated && wallets.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 p-5 bg-gradient-to-br from-[#0a0a0a]/80 to-[#1a1a1a]/80 border border-white/10 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Connected Wallet</p>
                          <p className="text-white font-mono text-sm font-semibold">
                            {wallets[selectedWalletIndex]?.address
                              ? `${wallets[selectedWalletIndex].address.slice(0, 8)}...${wallets[selectedWalletIndex].address.slice(-6)}`
                              : 'No wallet selected'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {wallets.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowWalletSelector(true)}
                            className="px-4 py-2 text-xs font-semibold text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-500/10 transition-all"
                          >
                            Switch
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDisconnect}
                          className="px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showWalletSelector && authenticated && wallets.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-5 bg-gradient-to-br from-[#0a0a0a]/90 to-[#1a1a1a]/90 border border-white/20 rounded-2xl backdrop-blur-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Select Wallet</h3>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowWalletSelector(false)}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    <div className="space-y-2">
                      {wallets.map((wallet, index) => (
                        <motion.button
                          key={wallet.address}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectWallet(index)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${
                            selectedWalletIndex === index
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-white/10 hover:border-white/20 bg-[#1a1a1a]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold text-sm mb-1">
                                {wallet.walletClientType === 'privy' ? 'Privy Wallet' : wallet.walletClientType || 'Wallet'}
                              </p>
                              <p className="text-gray-400 font-mono text-xs">
                                {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                              </p>
                            </div>
                            {selectedWalletIndex === index && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg"
                              >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={authenticated ? handlePayment : handleConnectWallet}
                disabled={paying || (authenticated && !wallets[selectedWalletIndex] && !wallets[0])}
                className="w-full px-8 py-5 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl transition-all duration-200 hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-500 hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border border-purple-400/20 relative overflow-hidden group"
              >
                {paying && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {!authenticated ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Connect Wallet to Pay
                    </>
                  ) : paying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pay ${parseFloat(product.price).toFixed(2)}
                    </>
                  )}
                </span>
              </motion.button>

              {!authenticated && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-sm text-gray-500 mt-4"
                >
                  Click the button above to select and connect your wallet
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default PaymentPage;

