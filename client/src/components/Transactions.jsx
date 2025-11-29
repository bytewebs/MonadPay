import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallets } from '@privy-io/react-auth';
import { api } from '../utils/api';

function Transactions() {
  const { wallets } = useWallets();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      const merchantAddress = wallets[0]?.address;
      if (!merchantAddress) {
        setLoading(false);
        return;
      }

      try {
        const result = await api.getMerchantTransactions(merchantAddress);
        if (Array.isArray(result)) {
          setTransactions(result);
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [wallets]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-8">Transactions</h2>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
          />
        </div>
      ) : transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1a]/60 to-[#0a0a0a]/60 border border-white/10 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No transactions yet</h3>
          <p className="text-gray-400 max-w-md">Your transaction history will appear here once you start receiving payments</p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0a0a]/60 to-[#1a1a1a]/60 backdrop-blur-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#1a1a1a]/80 to-[#0f0f0f]/80 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition-colors hover:bg-white/5 border-b border-white/5"
                >
                  <td className="px-6 py-5 text-white font-medium">{transaction.productName || 'Unknown Product'}</td>
                  <td className="px-6 py-5">
                    <span className="text-white font-bold text-lg">${parseFloat(transaction.amount).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold capitalize border backdrop-blur-sm ${getStatusStyles(transaction.status)}`}>
                      {transaction.status === 'completed' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-300 text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-5">
                    <a 
                      href={`https://testnet.monvision.io/tx/${transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 hover:underline font-mono text-sm transition-colors flex items-center gap-2 group"
                    >
                      {`${transaction.txHash.slice(0, 8)}...${transaction.txHash.slice(-6)}`}
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Transactions;

