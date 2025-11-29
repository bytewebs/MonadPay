import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ProductForm from './components/ProductForm';
import Transactions from './components/Transactions';
import Settings from './components/Settings';

const tabs = [
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

function Dashboard() {
  const { ready, authenticated } = usePrivy();
  const [activeTab, setActiveTab] = useState('products');

  // Show loading state
  if (!ready) {
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
            Loading Dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      <Header />
      <div className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-gray-400 font-light">Manage your products, transactions, and settings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-wrap gap-2 mb-8 bg-[#1a1a1a]/40 border border-white/10 rounded-2xl p-2 backdrop-blur-sm"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-br from-[#1a1a1a]/90 via-[#1f1f1f]/90 to-[#252525]/90 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl min-h-[500px] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-50" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {activeTab === 'products' && <ProductForm />}
                {activeTab === 'transactions' && <Transactions />}
                {activeTab === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

