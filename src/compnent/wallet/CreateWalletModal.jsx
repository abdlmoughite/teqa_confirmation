import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Wallet, Loader2, AlertCircle, CheckCircle, X, Shield, AlertTriangle } from "lucide-react";
import { CreateWallet } from "../../api/auth";

const CreateWalletModal = ({ isOpen, onClose, onSuccess, hasExistingWallet }) => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Wallet name is required");
      return;
    }
    
    // Vérifier si l'utilisateur a déjà un wallet
    if (hasExistingWallet) {
      setError("Vous ne pouvez créer qu'un seul wallet par utilisateur.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await CreateWallet({
        name: name.trim(),
        currency: currency
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      console.warn("Error creating wallet:", err);
      if (err.response?.data?.message?.includes("already has a wallet")) {
        setError("Vous avez déjà un wallet. La création de plusieurs wallets n'est pas autorisée.");
      } else {
        setError(err.response?.data?.message || "Failed to create wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
              
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                    <Wallet size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create New Wallet
                    </h3>
                    <p className="text-xs text-gray-500">
                      {hasExistingWallet ? "Only one wallet allowed" : "Add a new wallet to your account"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-center border border-emerald-200 dark:border-emerald-500/20"
                  >
                    <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">Wallet created successfully!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Redirecting...</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Message si wallet déjà existant */}
                    {hasExistingWallet && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <Shield size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                              Wallet limit reached
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              Vous ne pouvez créer qu'un seul wallet par compte utilisateur.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Wallet Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., My Business Wallet"
                        disabled={hasExistingWallet}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        disabled={hasExistingWallet}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="MAD">MAD - Moroccan Dirham</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - US Dollar</option>
                      </select>
                    </div>
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center gap-2 border border-rose-200 dark:border-rose-500/20"
                      >
                        <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                      </motion.div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || hasExistingWallet}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? "Creating..." : "Create Wallet"}
                      </button>
                    </div>
                    
                    {/* Information note */}
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ⚠️ Un seul wallet est autorisé par utilisateur
                      </p>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateWalletModal;