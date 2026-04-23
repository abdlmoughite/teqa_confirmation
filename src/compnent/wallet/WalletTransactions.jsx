// WalletTransactions.jsx
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { GetTransfers } from "../../api/auth";

const TRANSFER_STATUS_CONFIG = {
  pending: { label: "Pending", color: "yellow", icon: Clock, bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  success: { label: "Success", color: "green", icon: CheckCircle, bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-700 dark:text-green-400" },
  failed: { label: "Failed", color: "red", icon: XCircle, bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-700 dark:text-red-400" }
};

const WalletTransactions = ({ walletId }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetTransfers();
      let data = [];
      if (response.data?.results) data = response.data.results;
      else if (Array.isArray(response.data)) data = response.data;
      
      // Filtrer par walletId si fourni
      if (walletId) {
        data = data.filter(t => 
          t.sender_wallet?.id === walletId || 
          t.receiver_wallet?.id === walletId
        );
      }
      
      setTransfers(data);
    } catch (err) {
      console.error("Error fetching transfers:", err);
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [walletId]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price, currency) => `${parseFloat(price).toLocaleString()} ${currency || 'MAD'}`;

  const renderStatus = (status) => {
    const config = TRANSFER_STATUS_CONFIG[status] || TRANSFER_STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} /> {config.label}
      </span>
    );
  };

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl text-center text-red-600">
        <AlertCircle size={24} className="mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={fetchTransfers} className="mt-2 text-sm text-red-500 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button onClick={fetchTransfers} className="p-1.5 border rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      {filteredTransfers.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden md:table-cell">From/To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">Reference</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransfers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        t.sender_wallet ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {t.sender_wallet ? (
                          <ArrowUpRight size={12} className="text-red-600" />
                        ) : (
                          <ArrowDownRight size={12} className="text-green-600" />
                        )}
                      </div>
                      <span className="text-sm">{t.sender_wallet ? 'Sent' : 'Received'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${t.sender_wallet ? 'text-red-600' : 'text-green-600'}`}>
                      {t.sender_wallet ? '-' : '+'}{formatPrice(t.amount, t.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.sender_wallet ? t.receiver_wallet?.name : t.sender_wallet?.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {t.sender_wallet ? t.receiver_wallet?.num_wallet?.slice(0, 12) : t.sender_wallet?.num_wallet?.slice(0, 12)}...
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-gray-500 font-mono">{t.reference || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{renderStatus(t.status)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WalletTransactions;