// InvoiceStatsCard.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Wallet, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { GetInvoiceStats } from "../../api/auth";

const InvoiceStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await GetInvoiceStats();
        setStats(response.data);
      } catch (err) {
        console.warn("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          <FileText size={16} className="text-blue-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Invoices Summary</h3>
        <Zap size={12} className="text-yellow-500 ml-auto" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Wallet size={10} /> Total Amount
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {stats?.total_amount} {stats?.currency}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle size={10} className="text-emerald-500" /> Paid
          </span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {stats?.paid_amount} {stats?.currency}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={10} className="text-amber-500" /> Pending
          </span>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {stats?.pending_amount} {stats?.currency}
          </span>
        </div>
        
        <div className="pt-2 mt-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <FileText size={10} /> Total Invoices
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{stats?.total_invoices}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceStatsCard;