import { useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

function Settings() {
  const { wallets } = useWallets();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: true,
    currency: 'USD',
  });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const primaryWallet = wallets[0];
  const walletAddress = primaryWallet?.address || '';

  useEffect(() => {
    const loadMerchant = async () => {
      if (!walletAddress) return;

      try {
        const result = await api.getMerchant(walletAddress);
        if (result.error) {
          // Merchant not onboarded yet
          setMerchant(null);
        } else {
          setMerchant(result);
          setWebhookUrl(result.webhookUrl || '');
        }
      } catch (error) {
        console.error('Failed to load merchant:', error);
      }
    };

    loadMerchant();
  }, [walletAddress]);

  const handleOnboard = async () => {
    if (!walletAddress) {
      setMessage('Please connect your wallet');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await api.onboardMerchant(walletAddress, webhookUrl || null);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMerchant(result.merchant);
        setMessage('Merchant onboarded successfully!');
      }
    } catch (error) {
      setMessage('Failed to onboard merchant');
      console.error('Onboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async () => {
    if (!walletAddress) return;

    setLoading(true);
    setMessage('');

    try {
      const result = await api.updateWebhook(walletAddress, webhookUrl || null);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage('Webhook URL updated successfully!');
        if (merchant) {
          setMerchant({ ...merchant, webhookUrl: result.webhookUrl });
        }
      }
    } catch (error) {
      setMessage('Failed to update webhook URL');
      console.error('Update webhook error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-10">Settings</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          Merchant Onboarding
        </h3>
        <div className="bg-gradient-to-br from-[#1a1a1a]/80 via-[#1f1f1f]/80 to-[#252525]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
          <div className="relative z-10">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-b border-white/5">
              <label className="text-sm font-medium text-white">Wallet Address</label>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 text-sm text-white bg-[#0a0a0a]/50 border border-white/10 rounded-lg font-mono">
                  {walletAddress || 'Not connected'}
                </code>
                {walletAddress && (
                  <button 
                    className="px-4 py-2 text-xs font-medium text-white bg-purple-500/20 border border-purple-500/30 rounded-lg transition-all hover:bg-purple-500/30 hover:border-purple-500/50"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      alert('Address copied to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 py-4 border-b border-white/5">
              <label className="text-sm font-medium text-white">Webhook URL (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                  className="flex-1 px-4 py-2 text-sm text-white bg-[#0a0a0a]/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Receive payment notifications at this URL when transactions complete
              </p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-5 py-4 rounded-xl text-sm flex items-center gap-3 backdrop-blur-sm ${
                  message.includes('success') || message.includes('updated')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {message.includes('success') || message.includes('updated') ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{message}</span>
              </motion.div>
            )}

            {!merchant ? (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOnboard}
                disabled={loading || !walletAddress}
                className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/20 relative overflow-hidden"
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
                      Onboarding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Onboard as Merchant
                    </>
                  )}
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateWebhook}
                disabled={loading}
                className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl transition-all hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-400/20 relative overflow-hidden"
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update Webhook URL
                    </>
                  )}
                </span>
              </motion.button>
            )}

            {merchant && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-5 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                  <p className="text-sm text-green-400 font-semibold">
                    Merchant Status: <span className="text-green-300">Active</span>
                  </p>
                </div>
                {merchant.webhookUrl && (
                  <p className="text-xs text-gray-400 mt-3 font-mono">
                    Webhook: {merchant.webhookUrl}
                  </p>
                )}
              </motion.div>
            )}
          </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          Preferences
        </h3>
        <div className="bg-gradient-to-br from-[#1a1a1a]/80 via-[#1f1f1f]/80 to-[#252525]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 border-b border-white/10 last:border-b-0">
              <label className="text-sm font-semibold text-white">Notifications</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-500 shadow-lg"></div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 border-b border-white/10 last:border-b-0">
              <label className="text-sm font-semibold text-white">Email Updates</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailUpdates}
                  onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-500 shadow-lg"></div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 border-b border-white/10 last:border-b-0">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-white">Dark Mode</label>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-500/20 rounded-full">Always enabled</span>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg"></div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">
              <label className="text-sm font-semibold text-white">Currency</label>
              <select
                className="px-5 py-2.5 text-sm text-white bg-[#0a0a0a]/60 border border-white/10 rounded-xl cursor-pointer focus:outline-none focus:border-purple-500 focus:bg-[#0a0a0a]/80 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <option value="USD" className="bg-[#1a1a1a] text-white">USD ($)</option>
                <option value="EUR" className="bg-[#1a1a1a] text-white">EUR (€)</option>
                <option value="GBP" className="bg-[#1a1a1a] text-white">GBP (£)</option>
                <option value="ETH" className="bg-[#1a1a1a] text-white">ETH (Ξ)</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
          About
        </h3>
        <div className="bg-gradient-to-br from-[#1a1a1a]/80 via-[#1f1f1f]/80 to-[#252525]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 border-b border-white/10 last:border-b-0">
              <label className="text-sm font-semibold text-white">Version</label>
              <span className="text-sm text-gray-400 font-mono">1.0.0</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">
              <label className="text-sm font-semibold text-white">Powered by</label>
              <span className="text-sm text-gray-400">Privy & Ethereum</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;

