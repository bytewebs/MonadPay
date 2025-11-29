import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { api } from '../utils/api';
import { CONTRACT_ABI, CONTRACT_ADDRESS, RPC_URL } from '../config/contract';

function AddProductModal({ isOpen, onClose, onAddProduct }) {
    const { wallets } = useWallets();
    const { authenticated } = usePrivy();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        imageLink: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.price || !formData.description || !formData.imageLink) {
            setError('Please fill in all fields');
            return;
        }

        const merchantAddress = wallets[0]?.address;
        if (!merchantAddress || !authenticated) {
            setError('Wallet not connected');
            return;
        }

        if (!CONTRACT_ADDRESS) {
            setError('Contract address not configured');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Generate product ID and on-chain product ID
            const productId = `product_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const onChainProductId = ethers.id(productId);
            const priceInWei = ethers.parseEther(formData.price.toString());
            const tokenAddress = null; // For native token, use null

            // Step 2: Sign and send transaction on-chain using merchant's wallet
            let provider, signer, contract, txHash, receipt;

            // Get the wallet provider - Privy handles both embedded and external wallets
            const wallet = wallets[0];
            if (!wallet) {
                throw new Error('No wallet available');
            }

            // Get the Ethereum provider from Privy wallet
            const ethereumProvider = await wallet.getEthereumProvider();
            provider = new ethers.BrowserProvider(ethereumProvider);
            signer = await provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Verify we're using the correct merchant address
            const signerAddress = await signer.getAddress();
            if (signerAddress.toLowerCase() !== merchantAddress.toLowerCase()) {
                throw new Error('Wallet address mismatch. Please use the correct wallet.');
            }

            // Create product on-chain
            const tx = await contract.createProduct(onChainProductId, priceInWei, ethers.ZeroAddress);
            receipt = await tx.wait();
            txHash = receipt.hash;

            console.log('Product created on-chain:', txHash);

            // Step 3: Save product to MongoDB via backend
            const result = await api.createProduct(merchantAddress, {
                ...formData,
                productId,
                onChainProductId,
                txHash,
                blockNumber: receipt.blockNumber
            });

            if (result.error) {
                setError(result.error);
            } else {
                onAddProduct(result.product);
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    imageLink: '',
                });
                onClose();
            }
        } catch (err) {
            console.error('Product creation error:', err);
            setError(err.reason || err.message || 'Failed to create product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-to-br from-[#1a1a1a]/95 via-[#1f1f1f]/95 to-[#252525]/95 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-white">Add New Product</h2>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-name" className="text-sm font-semibold text-white uppercase tracking-wider">Product Name</label>
                                <input
                                    type="text"
                                    id="modal-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="px-4 py-3.5 text-base text-white bg-[#0a0a0a]/60 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-[#0a0a0a]/80 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-price" className="text-sm font-semibold text-white uppercase tracking-wider">Price (USD)</label>
                                <input
                                    type="number"
                                    id="modal-price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="px-4 py-3.5 text-base text-white bg-[#0a0a0a]/60 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-[#0a0a0a]/80 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-description" className="text-sm font-semibold text-white uppercase tracking-wider">Description</label>
                                <textarea
                                    id="modal-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="px-4 py-3.5 text-base text-white bg-[#0a0a0a]/60 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-[#0a0a0a]/80 focus:ring-2 focus:ring-purple-500/20 transition-all resize-y min-h-[120px] placeholder:text-gray-600"
                                    placeholder="Enter product description"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="modal-imageLink" className="text-sm font-semibold text-white uppercase tracking-wider">Image URL</label>
                                <input
                                    type="url"
                                    id="modal-imageLink"
                                    name="imageLink"
                                    value={formData.imageLink}
                                    onChange={handleChange}
                                    className="px-4 py-3.5 text-base text-white bg-[#0a0a0a]/60 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-[#0a0a0a]/80 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4 pt-4">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3.5 text-base font-semibold text-white bg-[#1a1a1a]/60 border border-white/10 rounded-xl transition-all hover:bg-[#1a1a1a]/80 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-500 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/20 relative overflow-hidden"
                                >
                                    {loading && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Product
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function ProductForm() {
    const { wallets } = useWallets();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        const merchantAddress = wallets[0]?.address;
        if (!merchantAddress) {
            setLoading(false);
            return;
        }

        try {
            const result = await api.getMerchantProducts(merchantAddress);
            if (Array.isArray(result)) {
                setProducts(result);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [wallets]);

    const handleAddProduct = (product) => {
        setProducts(prev => [product, ...prev]);
        loadProducts(); // Refresh list
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-white">Products</h2>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-2 border border-purple-400/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </motion.button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
                    />
                </div>
            ) : products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1a]/60 to-[#0a0a0a]/60 border border-white/10 flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">No products yet</h3>
                    <p className="text-gray-400 mb-8 max-w-md">Get started by adding your first product to begin accepting payments</p>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all hover:shadow-xl hover:shadow-purple-500/30 border border-purple-400/20"
                    >
                        Add Your First Product
                    </motion.button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="w-full h-52 overflow-hidden bg-[#0a0a0a]/50 relative">
                                <img
                                    src={product.imageLink}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1.5 text-sm font-bold text-white bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3">${parseFloat(product.price).toFixed(2)}</p>
                                <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-5">{product.description}</p>
                                {product.shareableLink && (
                                    <div className="mt-5 pt-5 border-t border-white/10">
                                        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Shareable Link</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={product.shareableLink}
                                                readOnly
                                                className="flex-1 px-3 py-2 text-xs text-white bg-[#0a0a0a]/60 border border-white/10 rounded-lg font-mono"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(product.shareableLink);
                                                    alert('Link copied to clipboard!');
                                                }}
                                                className="px-4 py-2 text-xs font-semibold text-white bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                                            >
                                                Copy
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddProduct={handleAddProduct}
            />
        </div>
    );
}

export default ProductForm;

