import { motion } from 'framer-motion';
import LoginButton from './LoginButton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#07070a] via-[#0f0f13] to-[#0b0b0d] flex items-center justify-center px-6 py-12">
      {/* Decorative animated bg layers */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -left-40 -top-40 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-700/30 via-purple-500/20 to-transparent blur-3xl opacity-60 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -20, 30, 0],
            y: [0, 20, -20, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -right-36 -bottom-36 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-emerald-400/10 via-cyan-400/8 to-transparent blur-2xl opacity-50 mix-blend-screen"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
      >
        {/* Left: Hero */}
        <motion.div variants={itemVariants} className="text-left px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-[0_10px_30px_rgba(255,255,255,0.03)]"
          >
            MonadPay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed"
          >
            Secure, decentralized payments powered by blockchain — fast settlements, on-chain security,
            and a streamlined developer experience. Designed for merchants who prioritize trust.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div className="w-full sm:w-auto">
              <LoginButton />
            </div>
            <a
              href="#features"
              className="text-sm text-gray-300 hover:text-white underline-offset-2 hover:underline transition-colors"
            >
              Learn how it works →
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                <path d="M12 1v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-gray-200">End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-gray-200">Multi-chain support</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Card - dynamic payment preview / trust panel */}
        <motion.div
          variants={itemVariants}
          className="px-4"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-[#0f1115]/95 via-[#151518]/95 to-[#1a1a1d]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                      MP
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
                      <p className="text-sm text-gray-400">Start accepting payments in minutes</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Secure
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                {/* dynamic transaction preview */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Preview transaction</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">$1,499.00</div>
                      <div className="text-xs text-gray-500 mt-1">Pay with crypto or native tokens</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-400">Status</div>
                      <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm text-purple-300 font-medium">Pending</div>
                    </div>
                  </div>
                </div>

                {/* payment methods */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2 items-center">
                    <div className="w-10 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-300">ETH</div>
                    <div className="w-10 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-300">USDC</div>
                    <div className="w-10 h-6 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-300">Native</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors">
                      Docs
                    </button>
                    <LoginButton />
                  </div>
                </div>
              </div>

              {/* trust row */}
              <div className="mt-6 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-400">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                      <path d="M12 1l3 6 6 .5-4.5 4 1 6.5L12 16l-5.5 2 1-6.5L3 7.5 9 7 12 1z" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round"/>
                    </svg>
                    <span>Used by top merchants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                      <path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M6 22h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span>24/7 support</span>
                  </div>
                </div>
                <div className="text-gray-300 font-medium">99.99% uptime</div>
              </div>
            </div>
          </motion.div>

          {/* small features grid */}
          <div id="features" className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'PCI-lite', icon: '🔒' },
              { label: 'Fast Settlements', icon: '⚡' },
              { label: 'Developer Friendly', icon: '🛠️' }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm group cursor-pointer"
              >
                <div className="text-lg mb-1 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <div className="text-xs text-gray-200 font-medium">{feature.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HomePage;

