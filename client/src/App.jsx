import { usePrivy } from '@privy-io/react-auth';
import { Navigate } from 'react-router';
import { motion } from 'framer-motion';
import HomePage from './components/HomePage';

export default function App() {
  const { ready, authenticated } = usePrivy();

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
            Loading MonadPay...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Redirect to dashboard if authenticated
  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <HomePage />;
}