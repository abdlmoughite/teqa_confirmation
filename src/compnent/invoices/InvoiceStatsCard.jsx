// InvoiceStatsCard.jsx - Composant pour afficher les stats dans le dashboard
import { useState, useEffect } from "react";
import { FileText, TrendingUp, Wallet, Clock, CheckCircle } from "lucide-react";
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
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} className="text-blue-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoices Summary</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Total Amount</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {stats?.total_amount} {stats?.currency}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle size={10} className="text-green-500" /> Paid
          </span>
          <span className="text-sm text-green-600">{stats?.paid_amount} {stats?.currency}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={10} className="text-yellow-500" /> Pending
          </span>
          <span className="text-sm text-yellow-600">{stats?.pending_amount} {stats?.currency}</span>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Total Invoices</span>
            <span className="text-sm font-medium">{stats?.total_invoices}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatsCard;