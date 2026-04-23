// CreateWalletModal.jsx
import { useState } from "react";
import { Wallet, Loader2, AlertCircle, CheckCircle, X } from "lucide-react";
import { CreateWallet } from "../../api/auth";

const CreateWalletModal = ({ isOpen, onClose, onSuccess }) => {
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
      console.error("Error creating wallet:", err);
      setError(err.response?.data?.message || "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl animate-slide-down">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Create New Wallet
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {success ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-green-700 dark:text-green-300 font-medium">Wallet created successfully!</p>
              <p className="text-xs text-green-600 mt-1">Redirecting...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wallet Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Business Wallet"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MAD">MAD - Moroccan Dirham</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Create Wallet
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateWalletModal;