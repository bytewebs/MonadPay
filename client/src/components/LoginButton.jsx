import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const navigate = useNavigate();

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (ready && authenticated) {
      navigate('/dashboard');
    }
  }, [ready, authenticated, navigate]);

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  const handleLogin = () => {
    login();
  };

  return (
    <motion.button
      whileHover={!disableLogin ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disableLogin ? { scale: 0.98 } : {}}
      className={`w-full px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all duration-200 relative overflow-hidden group ${
        disableLogin
          ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 cursor-not-allowed opacity-60 border border-gray-600/30'
          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:via-purple-400 hover:to-indigo-500 hover:shadow-2xl hover:shadow-purple-500/30 border border-purple-400/20'
      }`}
      disabled={disableLogin}
      onClick={handleLogin}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {!ready ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Loading...
          </>
        ) : authenticated ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Connected
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </>
        )}
      </span>
      {!disableLogin && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.button>
  );
}

export default LoginButton;

