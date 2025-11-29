import { useLogout, usePrivy, useWallets } from '@privy-io/react-auth';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';

function Header() {
  const { authenticated } = usePrivy();
  const { logout } = useLogout();
  const { wallets } = useWallets();
  const navigate = useNavigate();

  if (!authenticated) {
    return null;
  }

  const primaryWallet = wallets[0];
  const walletAddress = primaryWallet?.address || '';
  const formattedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <nav className="flex gap-2 items-center">
          <Link 
            to="/dashboard" 
            className="relative text-white/90 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5 group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.2 }}
            />
          </Link>
        </nav>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-white/10 rounded-xl backdrop-blur-sm shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Wallet</span>
            <span className="text-sm text-white font-semibold font-mono tracking-wide">{formattedAddress}</span>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500/90 to-red-600/90 rounded-xl cursor-pointer transition-all duration-200 hover:from-red-400 hover:to-red-500 hover:shadow-xl hover:shadow-red-500/20 active:scale-95 w-full md:w-auto border border-red-500/20"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;

